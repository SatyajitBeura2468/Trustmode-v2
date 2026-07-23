import {
  createReceipt,
  createSession,
  reduceSession,
  remainingSessionSeconds,
  scenarios,
  SessionCommandError,
  type AssistanceMode,
  type ProposalStatus,
  type Receipt,
  type ScenarioId,
  type SessionCommand,
  type TrustSession,
} from "@trustmode/core";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createOwnerSecret,
  createRemoteSession,
  loadHelperSession,
  loadOwnerSession,
  saveRemoteSession,
  type RemoteCredentials,
  verifyHelperSession,
} from "./remoteSession";

export type Language = "en" | "hi" | "or";
export type DemoStage = "contract" | "invite" | "workspace" | "review" | "privacy" | "blocked" | "receipt";
type ConnectionStatus = "local" | "sharing" | "shared" | "error";

interface UiState { stage: DemoStage; calm: boolean; large: boolean; contrast: boolean; language: Language; }
interface PersistedState { version: 3; ui: UiState; session: TrustSession; remote?: RemoteCredentials; }

interface DemoContextValue extends UiState {
  session: TrustSession;
  scenario: typeof scenarios[ScenarioId];
  scenarioId: ScenarioId;
  mode: AssistanceMode;
  statuses: Record<string, ProposalStatus>;
  paused: boolean;
  stopped: boolean;
  startedAt: string;
  remainingSeconds: number;
  autoPauseSeconds: number;
  lastError: string | null;
  helperUrl: string;
  receipt: Receipt;
  connectionStatus: ConnectionStatus;
  configureSession: (scenarioId: ScenarioId, mode: AssistanceMode, task: string) => void;
  setScenario: (id: ScenarioId) => void;
  setMode: (mode: AssistanceMode) => void;
  setTask: (task: string) => void;
  setStage: (stage: DemoStage) => void;
  publishSession: () => Promise<boolean>;
  openHelperSession: (sessionId: string, token: string) => Promise<boolean>;
  verifyHelperCapability: (token: string, code: string) => Promise<boolean>;
  joinHelper: (token: string, code: string) => boolean;
  sendProposals: (ids: string[]) => boolean;
  decide: (id: string, status: "approved" | "rejected", note?: string) => boolean;
  requestChanges: (id: string, note: string) => boolean;
  sendMessage: (actor: "owner" | "helper", body: string, proposalId?: string) => boolean;
  complete: () => boolean;
  togglePause: () => void;
  stop: () => void;
  restart: () => void;
  setLanguage: (language: Language) => void;
  toggleCalm: () => void;
  toggleLarge: () => void;
  toggleContrast: () => void;
  clearError: () => void;
}

const STORAGE_KEY = "trustmode-product-v3";
const LEGACY_STORAGE_KEY = "trustmode-product-v2";
const CHANNEL_NAME = "trustmode-product-v3";
const AUTO_PAUSE_MS = 5 * 60 * 1_000;
const scenarioIds = new Set<ScenarioId>(["scholarship", "hospital", "admission"]);
const initialUi: UiState = { stage: "contract", calm: false, large: false, contrast: false, language: "en" };

function makeEntropy(): string {
  const bytes = new Uint32Array(4);
  crypto.getRandomValues(bytes);
  return [...bytes].map((value) => value.toString(16)).join("-");
}

function freshSession(scenarioId: ScenarioId, mode: AssistanceMode = "together", task?: string): TrustSession {
  return createSession({ scenarioId, mode, task, entropy: makeEntropy() });
}

function isTrustSession(value: unknown): value is TrustSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TrustSession>;
  return candidate.schemaVersion === 2 && typeof candidate.id === "string" && typeof candidate.revision === "number" &&
    typeof candidate.scenarioId === "string" && scenarioIds.has(candidate.scenarioId as ScenarioId) &&
    Boolean(candidate.contract && candidate.invite && candidate.proposalRecords && candidate.portalValues);
}

function loadInitial(): PersistedState {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY) ?? "null") as Partial<PersistedState> | null;
    if (parsed?.ui && isTrustSession(parsed.session)) return { version: 3, ui: { ...initialUi, ...parsed.ui }, session: parsed.session, remote: parsed.remote };
  } catch { /* invalid snapshots are discarded */ }
  return { version: 3, ui: initialUi, session: freshSession("scholarship") };
}

function newerThan(incoming: TrustSession, current: TrustSession): boolean {
  if (incoming.id !== current.id) return incoming.updatedAt > current.updatedAt;
  if (incoming.revision !== current.revision) return incoming.revision > current.revision;
  return incoming.updatedAt > current.updatedAt;
}

function restoreLocalCapability(session: TrustSession, remote: RemoteCredentials | undefined, previous: TrustSession): TrustSession {
  const token = remote?.helperToken ?? previous.invite.token;
  const verificationCode = remote?.verificationCode ?? previous.invite.verificationCode;
  return { ...session, invite: { ...session.invite, token, verificationCode } };
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [{ ui, session, remote }, setStore] = useState<PersistedState>(loadInitial);
  const [clock, setClock] = useState(() => Date.now());
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() => remote ? "shared" : "local");
  const sourceId = useRef(makeEntropy());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const currentSessionRef = useRef(session);
  const remoteRef = useRef(remote);
  currentSessionRef.current = session;
  remoteRef.current = remote;

  const acceptRemote = useCallback((incoming: TrustSession, credentials: RemoteCredentials | undefined) => {
    setStore((current) => {
      if (!newerThan(incoming, current.session)) return current;
      return { ...current, session: restoreLocalCapability(incoming, credentials ?? current.remote, current.session) };
    });
  }, []);

  const commitRemote = useCallback(async (next: TrustSession, expectedRevision: number) => {
    const credentials = remoteRef.current;
    if (!credentials || (credentials.role === "helper" && !credentials.verificationCode)) return;
    try {
      const stored = await saveRemoteSession(next, expectedRevision, credentials);
      setConnectionStatus("shared");
      acceptRemote(stored, credentials);
    } catch (error) {
      setConnectionStatus("error");
      setLastError(error instanceof Error ? error.message : "The shared session could not be updated.");
    }
  }, [acceptRemote]);

  useEffect(() => {
    document.documentElement.dataset.large = String(ui.large);
    document.documentElement.dataset.contrast = String(ui.contrast);
    document.documentElement.dataset.calm = String(ui.calm);
  }, [ui.calm, ui.contrast, ui.large]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!remote) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const incoming = remote.role === "owner"
          ? await loadOwnerSession(currentSessionRef.current.id, remote.ownerSecret ?? "")
          : await loadHelperSession(currentSessionRef.current.id, remote.helperToken ?? "");
        if (!cancelled) {
          setConnectionStatus("shared");
          acceptRemote(incoming, remote);
        }
      } catch (error) {
        if (!cancelled) {
          setConnectionStatus("error");
          setLastError(error instanceof Error ? error.message : "The shared session is temporarily unavailable.");
        }
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 1_500);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [acceptRemote, remote]);

  useEffect(() => {
    if (session.status === "active" && clock - new Date(session.lastActiveAt).getTime() >= AUTO_PAUSE_MS) {
      try {
        const paused = reduceSession(session, { type: "PAUSE", actor: "owner" });
        setStore((current) => ({ ...current, session: paused }));
        void commitRemote(paused, session.revision);
      } catch { /* concurrent closure wins */ }
    }
    if (remainingSessionSeconds(session, clock) === 0 && !["expired", "stopped", "completed"].includes(session.status)) {
      const expired = reduceSession(session, { type: "EXPIRE", actor: "system" });
      setStore((current) => ({ ...current, session: expired }));
      void commitRemote(expired, session.revision);
    }
  }, [clock, commitRemote, session]);

  useEffect(() => {
    const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
    channelRef.current = channel;
    const receive = (incoming: unknown) => { if (isTrustSession(incoming)) acceptRemote(incoming, remoteRef.current); };
    if (channel) channel.onmessage = (event: MessageEvent<{ source?: string; session?: unknown }>) => {
      if (event.data?.source !== sourceId.current) receive(event.data?.session);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { receive((JSON.parse(event.newValue) as Partial<PersistedState>).session); } catch { /* ignore malformed state */ }
    };
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener("storage", onStorage); channel?.close(); channelRef.current = null; };
  }, [acceptRemote]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, ui, session, remote } satisfies PersistedState));
    channelRef.current?.postMessage({ source: sourceId.current, session });
  }, [remote, session, ui]);

  const setUi = useCallback((patch: Partial<UiState>) => setStore((current) => ({ ...current, ui: { ...current.ui, ...patch } })), []);
  const replaceSession = useCallback((next: TrustSession, stage: DemoStage = "contract") => {
    setLastError(null); setConnectionStatus("local");
    setStore((current) => ({ ...current, ui: { ...current.ui, stage }, session: next, remote: undefined }));
  }, []);

  const command = useCallback((next: SessionCommand): boolean => {
    try {
      const current = currentSessionRef.current;
      const updated = reduceSession(current, next);
      setLastError(null);
      setStore((state) => ({ ...state, session: updated }));
      void commitRemote(updated, current.revision);
      return true;
    } catch (error) {
      setLastError(error instanceof SessionCommandError ? error.message : "TrustMode could not complete that action.");
      return false;
    }
  }, [commitRemote]);

  const publishSession = useCallback(async (): Promise<boolean> => {
    const ownerSecret = createOwnerSecret();
    const current = currentSessionRef.current;
    setConnectionStatus("sharing");
    try {
      await createRemoteSession(current, ownerSecret);
      const credentials: RemoteCredentials = { role: "owner", ownerSecret, helperToken: current.invite.token, verificationCode: current.invite.verificationCode };
      setStore((state) => ({ ...state, remote: credentials }));
      setConnectionStatus("shared");
      return true;
    } catch (error) {
      setConnectionStatus("error");
      setLastError(error instanceof Error ? error.message : "TrustMode could not create the shared session.");
      return false;
    }
  }, []);

  const openHelperSession = useCallback(async (sessionId: string, token: string): Promise<boolean> => {
    if (!sessionId || !token) return false;
    setConnectionStatus("sharing");
    try {
      const remoteSession = await loadHelperSession(sessionId, token);
      const credentials: RemoteCredentials = { role: "helper", helperToken: token };
      const restored = restoreLocalCapability(remoteSession, credentials, remoteSession);
      setStore((state) => ({ ...state, session: restored, remote: credentials, ui: { ...state.ui, stage: "workspace" } }));
      setLastError(null); setConnectionStatus("shared");
      return true;
    } catch {
      setConnectionStatus("error");
      return false;
    }
  }, []);

  const verifyHelperCapability = useCallback(async (token: string, code: string): Promise<boolean> => {
    const credentials = remoteRef.current;
    if (!credentials || credentials.role !== "helper" || !token || !code) return command({ type: "JOIN_HELPER", actor: "helper", token, code });
    try {
      const remoteSession = await verifyHelperSession(currentSessionRef.current.id, token, code);
      const nextCredentials: RemoteCredentials = { ...credentials, verificationCode: code };
      const restored = restoreLocalCapability(remoteSession, nextCredentials, currentSessionRef.current);
      setStore((state) => ({ ...state, session: restored, remote: nextCredentials }));
      setLastError(null); setConnectionStatus("shared");
      return true;
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "The verification code is invalid.");
      return false;
    }
  }, [command]);

  const scenario = scenarios[session.scenarioId];
  const statuses = useMemo(() => Object.fromEntries(Object.entries(session.proposalRecords).map(([id, record]) => [id, record.status])), [session.proposalRecords]);
  const receipt = useMemo(() => createReceipt(session), [session]);
  const remainingSeconds = remainingSessionSeconds(session, clock);
  const autoPauseSeconds = session.status === "active" ? Math.max(0, Math.ceil((AUTO_PAUSE_MS - (clock - new Date(session.lastActiveAt).getTime())) / 1_000)) : 0;
  const helperUrl = typeof location === "undefined" ? `/helper?session=${session.id}&token=${encodeURIComponent(session.invite.token)}` : `${location.origin}/helper?session=${session.id}&token=${encodeURIComponent(session.invite.token)}`;

  const value: DemoContextValue = {
    ...ui, session, scenario, scenarioId: session.scenarioId, mode: session.contract.mode, statuses,
    paused: session.status === "paused", stopped: ["stopped", "expired"].includes(session.status), startedAt: session.createdAt,
    remainingSeconds, autoPauseSeconds, lastError, helperUrl, receipt, connectionStatus,
    configureSession: (scenarioId, mode, task) => replaceSession(freshSession(scenarioId, mode, task)),
    setScenario: (scenarioId) => replaceSession(freshSession(scenarioId, session.contract.mode)),
    setMode: (mode) => replaceSession(freshSession(session.scenarioId, mode, session.contract.task)),
    setTask: (task) => replaceSession(freshSession(session.scenarioId, session.contract.mode, task)),
    setStage: (stage) => setUi({ stage }), publishSession, openHelperSession, verifyHelperCapability,
    joinHelper: (token, code) => command({ type: "JOIN_HELPER", actor: "helper", token, code }),
    sendProposals: (proposalIds) => command({ type: "SEND_PROPOSALS", actor: "helper", proposalIds }),
    decide: (proposalId, status, note) => command({ type: "DECIDE", actor: "owner", proposalId, decision: status === "approved" ? "approve" : "reject", note }),
    requestChanges: (proposalId, note) => command({ type: "DECIDE", actor: "owner", proposalId, decision: "request-changes", note }),
    sendMessage: (actor, body, proposalId) => command({ type: "MESSAGE", actor, body, proposalId }),
    complete: () => command({ type: "COMPLETE", actor: "owner" }),
    togglePause: () => command({ type: session.status === "paused" ? "RESUME" : "PAUSE", actor: "owner" }),
    stop: () => command({ type: "STOP", actor: "owner" }), restart: () => replaceSession(freshSession(session.scenarioId, session.contract.mode), "contract"),
    setLanguage: (language) => setUi({ language }), toggleCalm: () => setUi({ calm: !ui.calm }), toggleLarge: () => setUi({ large: !ui.large }),
    toggleContrast: () => setUi({ contrast: !ui.contrast }), clearError: () => setLastError(null),
  };
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() { const value = useContext(DemoContext); if (!value) throw new Error("useDemo must be used inside DemoProvider"); return value; }

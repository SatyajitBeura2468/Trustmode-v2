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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "hi" | "or";
export type DemoStage =
  | "contract"
  | "invite"
  | "workspace"
  | "review"
  | "privacy"
  | "blocked"
  | "receipt";

interface UiState {
  stage: DemoStage;
  calm: boolean;
  large: boolean;
  contrast: boolean;
  language: Language;
}

interface PersistedState {
  version: 2;
  ui: UiState;
  session: TrustSession;
}

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
  configureSession: (scenarioId: ScenarioId, mode: AssistanceMode, task: string) => void;
  setScenario: (id: ScenarioId) => void;
  setMode: (mode: AssistanceMode) => void;
  setTask: (task: string) => void;
  setStage: (stage: DemoStage) => void;
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

const STORAGE_KEY = "trustmode-product-v2";
const CHANNEL_NAME = "trustmode-product-v2";
const AUTO_PAUSE_MS = 5 * 60 * 1000;
const scenarioIds = new Set<ScenarioId>(["scholarship", "hospital", "admission"]);

const initialUi: UiState = {
  stage: "contract",
  calm: false,
  large: false,
  contrast: false,
  language: "en",
};

function makeEntropy(): string {
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint32Array(4);
    globalThis.crypto.getRandomValues(bytes);
    return [...bytes].map((value) => value.toString(16)).join("-");
  }
  return `${Date.now()}:${Math.random()}`;
}

function freshSession(
  scenarioId: ScenarioId,
  mode: AssistanceMode = "together",
  task?: string,
): TrustSession {
  return createSession({ scenarioId, mode, task, entropy: makeEntropy() });
}

function isTrustSession(value: unknown): value is TrustSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TrustSession>;
  return candidate.schemaVersion === 2 &&
    typeof candidate.id === "string" &&
    typeof candidate.revision === "number" &&
    typeof candidate.scenarioId === "string" &&
    scenarioIds.has(candidate.scenarioId as ScenarioId) &&
    Boolean(candidate.contract && candidate.invite && candidate.proposalRecords && candidate.portalValues);
}

function loadInitial(): PersistedState {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<PersistedState> | null;
    if (parsed?.version === 2 && parsed.ui && isTrustSession(parsed.session)) {
      return { version: 2, ui: { ...initialUi, ...parsed.ui }, session: parsed.session };
    }
  } catch {
    // Invalid or old snapshots are intentionally discarded.
  }
  return { version: 2, ui: initialUi, session: freshSession("scholarship") };
}

function newerThan(incoming: TrustSession, current: TrustSession): boolean {
  if (incoming.id !== current.id) return incoming.updatedAt > current.updatedAt;
  if (incoming.revision !== current.revision) return incoming.revision > current.revision;
  return incoming.updatedAt > current.updatedAt;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [{ ui, session }, setStore] = useState<PersistedState>(loadInitial);
  const [clock, setClock] = useState(() => Date.now());
  const [lastError, setLastError] = useState<string | null>(null);
  const sourceId = useRef(makeEntropy());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const currentSessionRef = useRef(session);

  currentSessionRef.current = session;

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
    if (session.status === "active" && clock - new Date(session.lastActiveAt).getTime() >= AUTO_PAUSE_MS) {
      try {
        const paused = reduceSession(session, { type: "PAUSE", actor: "owner" });
        setStore((current) => ({ ...current, session: paused }));
      } catch {
        // A concurrent stop/expiry wins over auto-pause.
      }
    }
    if (remainingSessionSeconds(session, clock) === 0 && !["expired", "stopped", "completed"].includes(session.status)) {
      const expired = reduceSession(session, { type: "EXPIRE", actor: "system" });
      setStore((current) => ({ ...current, session: expired }));
    }
  }, [clock, session]);

  useEffect(() => {
    const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
    channelRef.current = channel;
    const accept = (incoming: unknown) => {
      if (!isTrustSession(incoming)) return;
      setStore((current) => newerThan(incoming, current.session) ? { ...current, session: incoming } : current);
    };
    if (channel) {
      channel.onmessage = (event: MessageEvent<{ source?: string; session?: unknown }>) => {
        if (event.data?.source === sourceId.current) return;
        accept(event.data?.session);
      };
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue) as Partial<PersistedState>;
        accept(incoming.session);
      } catch {
        // Ignore malformed external storage events.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const payload: PersistedState = { version: 2, ui, session };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    channelRef.current?.postMessage({ source: sourceId.current, session });
  }, [session, ui]);

  const setUi = useCallback((patch: Partial<UiState>) => {
    setStore((current) => ({ ...current, ui: { ...current.ui, ...patch } }));
  }, []);

  const replaceSession = useCallback((next: TrustSession, stage: DemoStage = "contract") => {
    setLastError(null);
    setStore((current) => ({ ...current, ui: { ...current.ui, stage }, session: next }));
  }, []);

  const command = useCallback((next: SessionCommand): boolean => {
    try {
      const updated = reduceSession(currentSessionRef.current, next);
      setLastError(null);
      setStore((current) => ({ ...current, session: updated }));
      return true;
    } catch (error) {
      setLastError(error instanceof SessionCommandError ? error.message : "TrustMode could not complete that action.");
      return false;
    }
  }, []);

  const scenario = scenarios[session.scenarioId];
  const statuses = useMemo(
    () => Object.fromEntries(Object.entries(session.proposalRecords).map(([id, record]) => [id, record.status])),
    [session.proposalRecords],
  );
  const receipt = useMemo(() => createReceipt(session), [session]);
  const remainingSeconds = remainingSessionSeconds(session, clock);
  const autoPauseSeconds = session.status === "active"
    ? Math.max(0, Math.ceil((AUTO_PAUSE_MS - (clock - new Date(session.lastActiveAt).getTime())) / 1_000))
    : 0;
  const helperUrl = typeof location === "undefined"
    ? `/helper?session=${session.id}&token=${encodeURIComponent(session.invite.token)}`
    : `${location.origin}/helper?session=${session.id}&token=${encodeURIComponent(session.invite.token)}`;

  const value: DemoContextValue = {
    ...ui,
    session,
    scenario,
    scenarioId: session.scenarioId,
    mode: session.contract.mode,
    statuses,
    paused: session.status === "paused",
    stopped: ["stopped", "expired"].includes(session.status),
    startedAt: session.createdAt,
    remainingSeconds,
    autoPauseSeconds,
    lastError,
    helperUrl,
    receipt,
    configureSession: (scenarioId, mode, task) => replaceSession(freshSession(scenarioId, mode, task)),
    setScenario: (scenarioId) => replaceSession(freshSession(scenarioId, session.contract.mode)),
    setMode: (mode) => replaceSession(freshSession(session.scenarioId, mode, session.contract.task)),
    setTask: (task) => replaceSession(freshSession(session.scenarioId, session.contract.mode, task)),
    setStage: (stage) => setUi({ stage }),
    joinHelper: (token, code) => command({ type: "JOIN_HELPER", actor: "helper", token, code }),
    sendProposals: (proposalIds) => command({ type: "SEND_PROPOSALS", actor: "helper", proposalIds }),
    decide: (proposalId, status, note) => command({
      type: "DECIDE",
      actor: "owner",
      proposalId,
      decision: status === "approved" ? "approve" : "reject",
      note,
    }),
    requestChanges: (proposalId, note) => command({
      type: "DECIDE",
      actor: "owner",
      proposalId,
      decision: "request-changes",
      note,
    }),
    sendMessage: (actor, body, proposalId) => command({ type: "MESSAGE", actor, body, proposalId }),
    complete: () => command({ type: "COMPLETE", actor: "owner" }),
    togglePause: () => command({ type: session.status === "paused" ? "RESUME" : "PAUSE", actor: "owner" }),
    stop: () => command({ type: "STOP", actor: "owner" }),
    restart: () => replaceSession(freshSession(session.scenarioId, session.contract.mode), "contract"),
    setLanguage: (language) => setUi({ language }),
    toggleCalm: () => setUi({ calm: !ui.calm }),
    toggleLarge: () => setUi({ large: !ui.large }),
    toggleContrast: () => setUi({ contrast: !ui.contrast }),
    clearError: () => setLastError(null),
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside DemoProvider");
  return value;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { scenarios, type AssistanceMode, type ProposalStatus, type Receipt, type ScenarioId } from "@trustmode/core";

export type Language = "en" | "hi" | "or";
export type DemoStage = "contract" | "invite" | "workspace" | "review" | "privacy" | "blocked" | "receipt";

interface DemoState {
  scenarioId: ScenarioId;
  mode: AssistanceMode;
  stage: DemoStage;
  statuses: Record<string, ProposalStatus>;
  paused: boolean;
  stopped: boolean;
  calm: boolean;
  large: boolean;
  contrast: boolean;
  language: Language;
  startedAt: string;
}

interface DemoContextValue extends DemoState {
  scenario: typeof scenarios[ScenarioId];
  setScenario: (id: ScenarioId) => void;
  setMode: (mode: AssistanceMode) => void;
  setStage: (stage: DemoStage) => void;
  decide: (id: string, status: "approved" | "rejected") => void;
  togglePause: () => void;
  stop: () => void;
  restart: () => void;
  setLanguage: (language: Language) => void;
  toggleCalm: () => void;
  toggleLarge: () => void;
  toggleContrast: () => void;
  receipt: Receipt;
}

const STORAGE_KEY = "trustmode-demo-v1";
const initial: DemoState = {
  scenarioId: "scholarship",
  mode: "together",
  stage: "contract",
  statuses: {},
  paused: false,
  stopped: false,
  calm: false,
  large: false,
  contrast: false,
  language: "en",
  startedAt: new Date().toISOString(),
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initial, ...JSON.parse(saved) as Partial<DemoState> } : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.dataset.large = String(state.large);
    document.documentElement.dataset.contrast = String(state.contrast);
  }, [state]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("trustmode-demo");
    channel.postMessage({ type: "state", state });
    return () => channel.close();
  }, [state]);

  const patch = useCallback((value: Partial<DemoState>) => setState((current) => ({ ...current, ...value })), []);
  const scenario = scenarios[state.scenarioId];
  const decide = useCallback((id: string, status: "approved" | "rejected") => {
    setState((current) => ({ ...current, statuses: { ...current.statuses, [id]: status } }));
  }, []);
  const stop = useCallback(() => setState((current) => ({
    ...current,
    paused: false,
    stopped: true,
    statuses: Object.fromEntries(scenarios[current.scenarioId].proposals.map((item) => [item.id, "revoked" as const])),
  })), []);
  const restart = useCallback(() => setState((current) => ({
    ...initial,
    scenarioId: current.scenarioId,
    language: current.language,
    calm: current.calm,
    large: current.large,
    contrast: current.contrast,
    startedAt: new Date().toISOString(),
  })), []);

  const receipt = useMemo<Receipt>(() => ({
    id: `TM-${state.scenarioId.toUpperCase()}-DEMO`,
    scenario: state.scenarioId,
    startedAt: state.startedAt,
    finishedAt: new Date().toISOString(),
    approved: scenario.proposals.filter((item) => state.statuses[item.id] === "approved").map((item) => item.statement),
    rejected: scenario.proposals.filter((item) => state.statuses[item.id] === "rejected").map((item) => item.statement),
    blocked: ["Submit application · owner-only"],
    disclosed: scenario.proposals.filter((item) => state.statuses[item.id] === "approved").map((item) => `${item.label}: ${item.proposed}`),
    retained: "No raw identity values or documents were stored in helper state.",
  }), [scenario, state]);

  const value: DemoContextValue = {
    ...state,
    scenario,
    setScenario: (scenarioId) => patch({ scenarioId, statuses: {}, stopped: false, paused: false }),
    setMode: (mode) => patch({ mode }),
    setStage: (stage) => patch({ stage }),
    decide,
    togglePause: () => patch({ paused: !state.paused }),
    stop,
    restart,
    setLanguage: (language) => patch({ language }),
    toggleCalm: () => patch({ calm: !state.calm }),
    toggleLarge: () => patch({ large: !state.large }),
    toggleContrast: () => patch({ contrast: !state.contrast }),
    receipt,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside DemoProvider");
  return value;
}

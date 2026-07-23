export type ScenarioId = "scholarship" | "hospital" | "admission";
export type AssistanceMode = "guide" | "together" | "prepare";
export type Risk = "low" | "medium" | "high" | "blocked";
export type ProposalStatus = "draft" | "pending" | "approved" | "rejected" | "revoked";

export interface SemanticField {
  id: string;
  label: string;
  current: string;
  proposed: string;
  evidence: string;
  privacy: string;
  consequence: string;
  confidence: number;
}

export interface Proposal extends SemanticField {
  scenario: ScenarioId;
  action: "set-field" | "attach-document" | "submit" | "navigate" | "account-change";
  statement: string;
  reversible: boolean;
  risk: Risk;
  ownerOnly: boolean;
  status: ProposalStatus;
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  shortTitle: string;
  description: string;
  accent: string;
  task: string;
  helperName: string;
  ownerName: string;
  derivedFacts: string[];
  proposals: Proposal[];
}

export interface Receipt {
  id: string;
  scenario: ScenarioId;
  startedAt: string;
  finishedAt: string;
  approved: string[];
  rejected: string[];
  blocked: string[];
  disclosed: string[];
  retained: string;
}

export type ScenarioId = "scholarship" | "hospital" | "admission";
export type AssistanceMode = "guide" | "together" | "prepare";
export type Risk = "low" | "medium" | "high" | "blocked";
export type SessionStatus = "active" | "paused" | "stopped" | "expired" | "completed";
export type SessionRole = "owner" | "helper" | "system";
export type ProposalStatus =
  | "draft"
  | "prepared"
  | "checking"
  | "pending"
  | "approved"
  | "rejected"
  | "changes-requested"
  | "applied"
  | "blocked"
  | "revoked";

export type ProposalAction =
  | "set-field"
  | "attach-document"
  | "submit"
  | "navigate"
  | "account-change";

export interface SemanticTarget {
  adapter: "controlled-portal";
  field: string;
  expectedCurrent: string;
}

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
  action: ProposalAction;
  statement: string;
  purpose: string;
  reversible: boolean;
  risk: Risk;
  ownerOnly: boolean;
  status: ProposalStatus;
  target: SemanticTarget;
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
  allowedTargets: string[];
  proposals: Proposal[];
}

export interface PolicyCheck {
  id: "payload" | "contract" | "target" | "freshness" | "sensitivity" | "authority";
  label: string;
  passed: boolean;
  detail: string;
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  code: string;
  risk: Risk;
  checks: PolicyCheck[];
}

export interface ProposalRecord {
  status: ProposalStatus;
  policy?: PolicyDecision;
  preparedAt?: string;
  sentAt?: string;
  decidedAt?: string;
  note?: string;
}

export interface IntentContract {
  id: string;
  task: string;
  scenarioId: ScenarioId;
  mode: AssistanceMode;
  allowedActions: ProposalAction[];
  deniedIntents: string[];
  createdAt: string;
}

export interface CapabilityInvite {
  sessionId: string;
  token: string;
  verificationCode: string;
  expiresAt: string;
  joinedAt?: string;
  revokedAt?: string;
}

export interface SessionMessage {
  id: string;
  from: Exclude<SessionRole, "system">;
  body: string;
  createdAt: string;
  proposalId?: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: SessionRole;
  type: string;
  summary: string;
  proposalId?: string;
  previousIntegrity: string;
  integrity: string;
}

export interface TrustSession {
  schemaVersion: 2;
  revision: number;
  id: string;
  status: SessionStatus;
  scenarioId: ScenarioId;
  contract: IntentContract;
  invite: CapabilityInvite;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  proposalRecords: Record<string, ProposalRecord>;
  portalValues: Record<string, string>;
  messages: SessionMessage[];
  events: ActivityEvent[];
}

export interface Receipt {
  id: string;
  sessionId: string;
  scenario: ScenarioId;
  startedAt: string;
  finishedAt: string;
  approved: string[];
  rejected: string[];
  blocked: string[];
  disclosed: string[];
  retained: string;
  eventCount: number;
  integrity: string;
}

export type SessionCommand =
  | { type: "JOIN_HELPER"; actor: "helper"; token: string; code: string }
  | { type: "PAUSE"; actor: "owner" }
  | { type: "RESUME"; actor: "owner" }
  | { type: "STOP"; actor: "owner" }
  | { type: "EXPIRE"; actor: "system" }
  | { type: "SEND_PROPOSALS"; actor: "helper"; proposalIds: string[] }
  | {
      type: "DECIDE";
      actor: "owner";
      proposalId: string;
      decision: "approve" | "reject" | "request-changes";
      note?: string;
    }
  | { type: "MESSAGE"; actor: "owner" | "helper"; body: string; proposalId?: string }
  | { type: "COMPLETE"; actor: "owner" };

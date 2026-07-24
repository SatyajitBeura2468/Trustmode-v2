import { evaluateProposal } from "./policy";
import { scenarios } from "./scenarios";
import type {
  ActivityEvent,
  AssistanceMode,
  HelperSuggestion,
  ProposalRecord,
  Receipt,
  ScenarioId,
  SessionCommand,
  SessionRole,
  TrustSession,
} from "./types";

const SESSION_DURATION_MS = 30 * 60 * 1000;
const FINAL_STATUSES = new Set(["applied", "rejected", "blocked", "revoked"]);

export class SessionCommandError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "SessionCommandError";
  }
}

export function stableHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function makeEvent(
  previous: ActivityEvent | undefined,
  at: string,
  actor: SessionRole,
  type: string,
  summary: string,
  proposalId?: string,
): ActivityEvent {
  const previousIntegrity = previous?.integrity ?? "00000000";
  const id = `EV-${stableHash(`${at}:${actor}:${type}:${summary}:${proposalId ?? ""}`)}`;
  const integrity = stableHash(`${previousIntegrity}|${id}|${at}|${actor}|${type}|${summary}|${proposalId ?? ""}`);
  return { id, at, actor, type, summary, proposalId, previousIntegrity, integrity };
}

function appendEvent(
  session: TrustSession,
  at: string,
  actor: SessionRole,
  type: string,
  summary: string,
  proposalId?: string,
): TrustSession {
  const event = makeEvent(session.events.at(-1), at, actor, type, summary, proposalId);
  return {
    ...session,
    revision: session.revision + 1,
    updatedAt: at,
    lastActiveAt: at,
    events: [...session.events, event],
  };
}

function cleanDisplayName(value: string | undefined): string {
  const name = value?.trim().replace(/\s+/g, " ") ?? "";
  if (name.length < 2 || name.length > 60) {
    throw new SessionCommandError("HELPER_NAME_INVALID", "Enter your real name using 2 to 60 characters.");
  }
  if (!/[\p{L}\p{N}]/u.test(name)) {
    throw new SessionCommandError("HELPER_NAME_INVALID", "Enter a name that contains letters or numbers.");
  }
  return name;
}

function cleanSuggestion(value: string): string {
  const suggestion = value.trim().replace(/\s+/g, " ");
  if (!suggestion) throw new SessionCommandError("SUGGESTION_EMPTY", "Enter a suggested answer before sending it.");
  if (suggestion.length > 240) throw new SessionCommandError("SUGGESTION_TOO_LONG", "Keep the suggested answer under 240 characters.");
  return suggestion;
}

export interface CreateSessionInput {
  scenarioId: ScenarioId;
  mode: AssistanceMode;
  task?: string;
  now?: string;
  entropy?: string;
}

export function createSession(input: CreateSessionInput): TrustSession {
  const scenario = scenarios[input.scenarioId];
  const now = input.now ?? new Date().toISOString();
  const entropy = input.entropy ?? `${now}:${Math.random()}`;
  const short = stableHash(entropy).toUpperCase();
  const id = `TM-${input.scenarioId.slice(0, 3).toUpperCase()}-${short}`;
  const token = `${short}.${stableHash(`${entropy}:capability`)}.${stableHash(`${entropy}:helper`)}`;
  const verificationCode = String(Number.parseInt(stableHash(`${entropy}:code`).slice(0, 6), 16) % 1_000_000).padStart(6, "0");
  const expiresAt = new Date(new Date(now).getTime() + SESSION_DURATION_MS).toISOString();
  const proposalRecords = Object.fromEntries(
    scenario.proposals.map((proposal) => [
      proposal.id,
      { status: "prepared", preparedAt: now, suggestedValue: proposal.proposed } satisfies ProposalRecord,
    ]),
  );
  const portalValues = Object.fromEntries(
    scenario.proposals.map((proposal) => [proposal.target.field, proposal.current]),
  );
  const contractId = `IC-${stableHash(`${id}:${input.mode}`)}`;
  const base: TrustSession = {
    schemaVersion: 2,
    revision: 0,
    id,
    status: "active",
    scenarioId: input.scenarioId,
    contract: {
      id: contractId,
      task: input.task?.trim() || scenario.task,
      scenarioId: input.scenarioId,
      mode: input.mode,
      allowedActions: ["set-field", "attach-document"],
      deniedIntents: ["credentials", "OTP", "payment", "account recovery", "final submission"],
      createdAt: now,
    },
    invite: {
      sessionId: id,
      token,
      verificationCode,
      expiresAt,
    },
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
    proposalRecords,
    portalValues,
    messages: [],
    events: [],
  };
  return appendEvent(base, now, "owner", "SESSION_CREATED", "The owner created a help session.");
}

function requireOwner(actor: SessionRole): asserts actor is "owner" {
  if (actor !== "owner") throw new SessionCommandError("ROLE_DENIED", "Only the owner can perform this action.");
}

function assertOperational(session: TrustSession, at: string): TrustSession {
  if (new Date(at).getTime() >= new Date(session.invite.expiresAt).getTime() && !["stopped", "completed"].includes(session.status)) {
    const expired = {
      ...session,
      status: "expired" as const,
      invite: { ...session.invite, revokedAt: at },
      proposalRecords: Object.fromEntries(
        Object.entries(session.proposalRecords).map(([id, record]) => [
          id,
          FINAL_STATUSES.has(record.status) ? record : { ...record, status: "revoked" as const },
        ]),
      ),
    };
    return appendEvent(expired, at, "system", "SESSION_EXPIRED", "The invitation expired.");
  }
  if (["stopped", "expired", "completed"].includes(session.status)) {
    throw new SessionCommandError("SESSION_CLOSED", `The session is ${session.status}.`);
  }
  return session;
}

function proposalWithSuggestion(session: TrustSession, suggestion: HelperSuggestion) {
  const scenario = scenarios[session.scenarioId];
  const proposal = scenario.proposals.find((item) => item.id === suggestion.proposalId);
  if (!proposal) throw new SessionCommandError("PROPOSAL_UNKNOWN", `Unknown field ${suggestion.proposalId}.`);
  const value = cleanSuggestion(suggestion.value);
  return {
    proposal: {
      ...proposal,
      proposed: value,
      statement: `Suggest ${value} for ${proposal.label}`,
    },
    value,
  };
}

export function reduceSession(
  current: TrustSession,
  command: SessionCommand,
  at = new Date().toISOString(),
): TrustSession {
  if (command.type === "EXPIRE") {
    if (["stopped", "expired", "completed"].includes(current.status)) return current;
    const expired = {
      ...current,
      status: "expired" as const,
      invite: { ...current.invite, revokedAt: at },
      proposalRecords: Object.fromEntries(
        Object.entries(current.proposalRecords).map(([id, record]) => [
          id,
          FINAL_STATUSES.has(record.status) ? record : { ...record, status: "revoked" as const },
        ]),
      ),
    };
    return appendEvent(expired, at, "system", "SESSION_EXPIRED", "The invitation expired.");
  }

  let session = assertOperational(current, at);
  if (command.type === "JOIN_HELPER") {
    if (command.token !== session.invite.token || command.code !== session.invite.verificationCode) {
      throw new SessionCommandError("CAPABILITY_INVALID", "The invitation link or verification code is invalid.");
    }
    if (session.invite.revokedAt) throw new SessionCommandError("CAPABILITY_REVOKED", "This invitation has ended.");
    const displayName = cleanDisplayName(command.displayName);
    if (session.invite.joinedAt || session.helper) {
      if (session.helper?.displayName === displayName) return session;
      throw new SessionCommandError("HELPER_ALREADY_JOINED", "Someone has already joined using this invitation.");
    }
    session = {
      ...session,
      helper: { displayName, joinedAt: at },
      invite: { ...session.invite, joinedAt: at },
    };
    return appendEvent(session, at, "helper", "HELPER_JOINED", `${displayName} joined the help session.`);
  }

  if (command.type === "PAUSE") {
    requireOwner(command.actor);
    if (session.status === "paused") return session;
    return appendEvent({ ...session, status: "paused" }, at, "owner", "SESSION_PAUSED", "The owner paused help.");
  }
  if (command.type === "RESUME") {
    requireOwner(command.actor);
    if (session.status !== "paused") return session;
    return appendEvent({ ...session, status: "active" }, at, "owner", "SESSION_RESUMED", "The owner resumed help.");
  }
  if (command.type === "STOP") {
    requireOwner(command.actor);
    const stopped = {
      ...session,
      status: "stopped" as const,
      invite: { ...session.invite, revokedAt: at },
      proposalRecords: Object.fromEntries(
        Object.entries(session.proposalRecords).map(([id, record]) => [
          id,
          FINAL_STATUSES.has(record.status) ? record : { ...record, status: "revoked" as const },
        ]),
      ),
    };
    return appendEvent(stopped, at, "owner", "SESSION_STOPPED", "The owner ended the helper’s access.");
  }

  if (session.status === "paused") {
    throw new SessionCommandError("SESSION_PAUSED", "Resume help before making another change.");
  }

  if (command.type === "SEND_PROPOSALS") {
    if (command.actor !== "helper") throw new SessionCommandError("ROLE_DENIED", "Only the invited helper can send suggestions.");
    if (!session.invite.joinedAt || !session.helper) throw new SessionCommandError("HELPER_NOT_JOINED", "Join the session before sending suggestions.");
    const scenario = scenarios[session.scenarioId];
    const helperName = session.helper.displayName;
    const records = { ...session.proposalRecords };
    for (const rawSuggestion of command.suggestions) {
      const { proposal, value } = proposalWithSuggestion(session, rawSuggestion);
      const existing = records[proposal.id];
      if (!existing || !["prepared", "changes-requested"].includes(existing.status)) continue;
      const policy = evaluateProposal(proposal, {
        scenarioId: session.scenarioId,
        allowedTargets: scenario.allowedTargets,
        allowedActions: session.contract.allowedActions,
        currentValues: session.portalValues,
      });
      records[proposal.id] = {
        ...existing,
        policy,
        suggestedValue: value,
        source: "helper",
        status: policy.allowed ? "pending" : "blocked",
        sentAt: at,
      };
      session = appendEvent(
        { ...session, proposalRecords: records },
        at,
        "helper",
        policy.allowed ? "PROPOSAL_SENT" : "PROPOSAL_BLOCKED",
        policy.allowed ? `${helperName} sent a suggestion for ${proposal.label}.` : `A suggestion for ${proposal.label} was blocked.`,
        proposal.id,
      );
    }
    return session;
  }

  if (command.type === "DECIDE") {
    requireOwner(command.actor);
    const scenario = scenarios[session.scenarioId];
    const proposal = scenario.proposals.find((item) => item.id === command.proposalId);
    const record = session.proposalRecords[command.proposalId];
    if (!proposal || !record) throw new SessionCommandError("PROPOSAL_UNKNOWN", "The suggestion does not exist.");
    if (record.status !== "pending") throw new SessionCommandError("PROPOSAL_NOT_REVIEWABLE", "Only waiting suggestions can be reviewed.");
    if (command.decision === "approve") {
      const suggestedValue = record.suggestedValue ?? proposal.proposed;
      const decision = evaluateProposal({ ...proposal, proposed: suggestedValue }, {
        scenarioId: session.scenarioId,
        allowedTargets: scenario.allowedTargets,
        allowedActions: session.contract.allowedActions,
        currentValues: session.portalValues,
      });
      if (!decision.allowed) throw new SessionCommandError("POLICY_CHANGED", decision.reason);
      const next = {
        ...session,
        proposalRecords: {
          ...session.proposalRecords,
          [proposal.id]: { ...record, policy: decision, status: "applied" as const, source: "helper" as const, decidedAt: at },
        },
        portalValues: { ...session.portalValues, [proposal.target.field]: suggestedValue },
      };
      return appendEvent(next, at, "owner", "PROPOSAL_APPLIED", `The owner added the suggested answer for ${proposal.label}.`, proposal.id);
    }
    const status = command.decision === "reject" ? "rejected" as const : "changes-requested" as const;
    const next = {
      ...session,
      proposalRecords: {
        ...session.proposalRecords,
        [proposal.id]: { ...record, status, decidedAt: at, note: command.note?.trim() || undefined },
      },
    };
    return appendEvent(
      next,
      at,
      "owner",
      command.decision === "reject" ? "PROPOSAL_REJECTED" : "CHANGES_REQUESTED",
      command.decision === "reject" ? `The owner rejected the suggestion for ${proposal.label}.` : `The owner requested a different answer for ${proposal.label}.`,
      proposal.id,
    );
  }

  if (command.type === "SET_FIELD") {
    requireOwner(command.actor);
    const scenario = scenarios[session.scenarioId];
    const proposal = scenario.proposals.find((item) => item.id === command.proposalId);
    const record = session.proposalRecords[command.proposalId];
    if (!proposal || !record) throw new SessionCommandError("PROPOSAL_UNKNOWN", "The field does not exist.");
    const value = cleanSuggestion(command.value);
    const next = {
      ...session,
      portalValues: { ...session.portalValues, [proposal.target.field]: value },
      proposalRecords: {
        ...session.proposalRecords,
        [proposal.id]: {
          ...record,
          status: "applied" as const,
          source: "owner" as const,
          suggestedValue: value,
          decidedAt: at,
        },
      },
    };
    return appendEvent(next, at, "owner", "OWNER_FIELD_EDITED", `The owner entered an answer for ${proposal.label}.`, proposal.id);
  }

  if (command.type === "MESSAGE") {
    const body = command.body.trim();
    if (!body) throw new SessionCommandError("MESSAGE_EMPTY", "A message cannot be empty.");
    if (body.length > 500) throw new SessionCommandError("MESSAGE_TOO_LONG", "Keep the message under 500 characters.");
    if (command.actor === "helper" && (!session.invite.joinedAt || !session.helper)) {
      throw new SessionCommandError("HELPER_NOT_JOINED", "Join the session before sending a message.");
    }
    const message = {
      id: `MSG-${stableHash(`${session.id}:${at}:${command.actor}:${body}`)}`,
      from: command.actor,
      body,
      createdAt: at,
      proposalId: command.proposalId,
    };
    const next = { ...session, messages: [...session.messages, message] };
    return appendEvent(next, at, command.actor, "MESSAGE_SENT", "A task-related message was sent.", command.proposalId);
  }

  if (command.type === "COMPLETE") {
    requireOwner(command.actor);
    const records = Object.values(session.proposalRecords);
    if (records.some((record) => ["checking", "pending"].includes(record.status))) {
      throw new SessionCommandError("REVIEW_REMAINS", "Review the waiting suggestions before finishing.");
    }
    const completedRecords = Object.fromEntries(
      Object.entries(session.proposalRecords).map(([id, record]) => [
        id,
        FINAL_STATUSES.has(record.status) ? record : { ...record, status: "revoked" as const },
      ]),
    );
    const completed = {
      ...session,
      status: "completed" as const,
      proposalRecords: completedRecords,
      invite: { ...session.invite, revokedAt: at },
    };
    return appendEvent(completed, at, "owner", "SESSION_COMPLETED", "The owner finished the practice session. No real form was submitted.");
  }

  return session;
}

export function createReceipt(session: TrustSession, at = new Date().toISOString()): Receipt {
  const scenario = scenarios[session.scenarioId];
  const applied = scenario.proposals.filter((proposal) => session.proposalRecords[proposal.id]?.status === "applied");
  const rejected = scenario.proposals.filter((proposal) => session.proposalRecords[proposal.id]?.status === "rejected");
  const blocked = scenario.proposals.filter((proposal) => session.proposalRecords[proposal.id]?.status === "blocked");
  return {
    id: `RCP-${stableHash(`${session.id}:${session.events.at(-1)?.integrity ?? "none"}`).toUpperCase()}`,
    sessionId: session.id,
    scenario: session.scenarioId,
    startedAt: session.createdAt,
    finishedAt: at,
    approved: applied.map((proposal) => `${proposal.label}: ${session.portalValues[proposal.target.field]}`),
    rejected: rejected.map((proposal) => proposal.label),
    blocked: [...blocked.map((proposal) => proposal.label), "Final submission · owner-only"],
    disclosed: applied.map((proposal) => `${proposal.label}: ${session.portalValues[proposal.target.field]}`),
    retained: "No credentials, OTPs, payments, raw identity values, or source documents entered helper state.",
    eventCount: session.events.length,
    integrity: session.events.at(-1)?.integrity ?? "00000000",
  };
}

export function remainingSessionSeconds(session: TrustSession, now = Date.now()): number {
  return Math.max(0, Math.floor((new Date(session.invite.expiresAt).getTime() - now) / 1000));
}

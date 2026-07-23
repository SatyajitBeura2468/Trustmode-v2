import type { Proposal } from "./types";

const blockedWords = /\b(password|otp|payment|recovery|submit|bank|aadhaar|biometric)\b/i;
const allowedActions = new Set<Proposal["action"]>(["set-field", "attach-document"]);

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  code: string;
}

export function evaluateProposal(proposal: Proposal): PolicyDecision {
  if (proposal.ownerOnly) return { allowed: false, code: "OWNER_ONLY", reason: "Only the owner can perform this action." };
  if (!allowedActions.has(proposal.action)) return { allowed: false, code: "ACTION_BLOCKED", reason: "This action is outside the Intent Contract." };
  if (blockedWords.test(`${proposal.statement} ${proposal.proposed}`)) return { allowed: false, code: "SENSITIVE_INTENT", reason: "TrustMode detected a sensitive or consequential intent." };
  if (!proposal.id || !proposal.statement || proposal.scenario.length === 0) return { allowed: false, code: "INVALID_PAYLOAD", reason: "The proposal is incomplete." };
  return { allowed: true, code: "SAFE_TO_REVIEW", reason: "The proposal may be shown to the owner for a decision." };
}

export function detectDangerousSequence(statements: string[]): PolicyDecision {
  const joined = statements.join(" ").toLowerCase();
  const signals = ["password", "recovery", "phone number", "email address"].filter((signal) => joined.includes(signal));
  if (signals.length >= 2) return { allowed: false, code: "DANGEROUS_SEQUENCE", reason: "These actions together could transfer control of the account." };
  return { allowed: true, code: "NO_SEQUENCE_RISK", reason: "No dangerous action sequence was detected." };
}

export function redact(input: string): string {
  return input
    .replace(/\b\d{12}\b/g, "•••• •••• ••••")
    .replace(/\b\d{10,16}\b/g, "••••••••")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "•••@•••");
}

import type {
  PolicyCheck,
  PolicyDecision,
  Proposal,
  ProposalAction,
  Risk,
  ScenarioId,
} from "./types";

const blockedWords =
  /\b(password|passcode|otp|one[- ]time password|payment|recovery|submit|bank|aadhaar|biometric|signature|pin)\b/i;
const safeActions = new Set<ProposalAction>(["set-field", "attach-document"]);

export interface PolicyContext {
  scenarioId: ScenarioId;
  allowedTargets: readonly string[];
  allowedActions: readonly ProposalAction[];
  currentValues: Readonly<Record<string, string>>;
}

function check(
  id: PolicyCheck["id"],
  label: string,
  passed: boolean,
  detail: string,
): PolicyCheck {
  return { id, label, passed, detail };
}

function riskFor(checks: PolicyCheck[], proposal: Proposal): Risk {
  if (proposal.ownerOnly || !checks.find((item) => item.id === "authority")?.passed) return "blocked";
  if (checks.some((item) => !item.passed)) return proposal.risk === "low" ? "medium" : proposal.risk;
  return proposal.risk;
}

export function evaluateProposal(proposal: Proposal, context?: PolicyContext): PolicyDecision {
  const payloadValid =
    Boolean(proposal.id && proposal.statement && proposal.purpose && proposal.target?.field) &&
    Number.isFinite(proposal.confidence) &&
    proposal.confidence >= 0 &&
    proposal.confidence <= 1;
  const contractAllows =
    safeActions.has(proposal.action) &&
    (context ? context.allowedActions.includes(proposal.action) : true) &&
    (context ? context.scenarioId === proposal.scenario : true);
  const targetAllowed =
    proposal.target?.adapter === "controlled-portal" &&
    (context ? context.allowedTargets.includes(proposal.target.field) : true);
  const currentValue =
    context?.currentValues[proposal.target?.field] ?? proposal.current;
  const fresh = currentValue === proposal.target?.expectedCurrent;
  const sensitive = blockedWords.test(`${proposal.statement} ${proposal.proposed}`);
  const authoritySafe = !proposal.ownerOnly && !["submit", "account-change", "navigate"].includes(proposal.action);

  const checks: PolicyCheck[] = [
    check("payload", "Protocol payload", payloadValid, payloadValid ? "Required semantic fields are present." : "The proposal payload is incomplete or malformed."),
    check("contract", "Intent Contract", contractAllows, contractAllows ? "The action is inside the active contract." : "The action is outside the active contract."),
    check("target", "Controlled target", targetAllowed, targetAllowed ? "The field is allowlisted by the controlled adapter." : "The semantic target is unknown or unsupported."),
    check("freshness", "Current-value freshness", fresh, fresh ? "The owner-side value still matches the reviewed baseline." : "The owner-side value changed after preparation."),
    check("sensitivity", "Sensitive intent", !sensitive, sensitive ? "Sensitive or consequential intent was detected." : "No credential, payment, identity, or submission intent was detected."),
    check("authority", "Owner authority", authoritySafe, authoritySafe ? "The proposal is reversible preparation." : "This action remains owner-only."),
  ];
  const failed = checks.find((item) => !item.passed);
  const code = !payloadValid
    ? "TM-POL-001"
    : !contractAllows
      ? "TM-POL-102"
      : !targetAllowed
        ? "TM-POL-203"
        : !fresh
          ? "TM-POL-304"
          : sensitive
            ? "TM-POL-405"
            : !authoritySafe
              ? "TM-POL-506"
              : "TM-POL-101";
  return {
    allowed: checks.every((item) => item.passed),
    code,
    reason: failed?.detail ?? "All policy checks passed. The owner may review this proposal.",
    risk: riskFor(checks, proposal),
    checks,
  };
}

export function detectDangerousSequence(statements: string[]): PolicyDecision {
  const joined = statements.join(" ").toLowerCase();
  const signals = ["password", "recovery", "phone number", "email address", "otp", "payment"].filter(
    (signal) => joined.includes(signal),
  );
  const allowed = signals.length < 2;
  const checks = [
    check(
      "sensitivity",
      "Sequence risk",
      allowed,
      allowed
        ? "No dangerous combination of actions was detected."
        : "These actions together could transfer control or create irreversible harm.",
    ),
  ];
  return {
    allowed,
    code: allowed ? "TM-SEQ-100" : "TM-SEQ-900",
    reason: checks[0].detail,
    risk: allowed ? "low" : "blocked",
    checks,
  };
}

export function redact(input: string): string {
  return input
    .replace(/\b\d{12}\b/g, "•••• •••• ••••")
    .replace(/\b\d{10,16}\b/g, "••••••••")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "•••@•••")
    .replace(/\b(otp|pin|password)\s*[:=-]?\s*\S+/gi, "$1: [REDACTED]");
}

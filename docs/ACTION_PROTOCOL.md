# Semantic action protocol

Every proposal contains a stable ID, scenario, intent, semantic target, expected current value, proposed value, evidence reference, freshness timestamp, confidence, risk, reversibility, consequence, privacy statement, and owner-only flag.

Before owner review, the policy engine checks protocol shape, active Intent Contract, allowlisted target, freshness and expected-current value, sensitive-data boundaries, and actor authority. The checks produce inspectable evidence under a stable code such as `TM-POL-101`.

Validation rejects unknown targets, malformed payloads, stale current values, cross-scenario proposals, and prohibited intents. Password, OTP, payment, recovery, submission, raw-document download, and arbitrary navigation actions are always blocked. Approval changes only controlled synthetic portal state.

Proposal lifecycle:

`prepared -> checking -> pending -> applied | rejected | changes-requested | blocked | revoked`

Pause blocks new helper work and owner approval. Stop or expiry revokes the capability and every unfinished proposal. Every accepted command increments the session revision and appends an integrity-linked event.

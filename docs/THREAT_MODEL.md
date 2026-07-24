# Threat model

TrustMode is a synthetic, controlled-form demonstration. The owner holds a random owner secret in their browser; the invitation link carries a separate random helper token and the helper must also provide a six-digit code. The database stores only one-way hashes of these capabilities. Direct table access is revoked, RLS is enabled and forced, and narrowly granted RPC functions check capabilities, expiry, revision, pause and ended-session state. Helpers cannot update protected form values, session permissions, payment, OTP, recovery or final-submission state. After five invalid code entries, joining is locked for ten minutes. This reduces guessing risk but is not a substitute for authenticated identity, edge rate limiting, abuse monitoring or independent assessment.

| Threat | Asset / path | Likelihood | Impact | Mitigation | Residual risk / test |
| --- | --- | --- | --- | --- | --- |
| Malicious helper | Owner authority via proposal | Medium | High | Allowlist targets; owner review; owner-only execution | Misleading prose; blocked-action tests |
| Stolen/replayed invite | Session access | Medium | Medium | 30-minute expiry, separate code, hashed capabilities, revocation and five-attempt lockout | No named identity or owner recovery |
| Proposal tampering | Action payload | Medium | High | Typed schema, controlled targets, owner-only application, revision checks and helper write restrictions | Synthetic forms only; privileged database operators remain trusted |
| DOM mutation / stale mapping | Wrong field | Medium | High | Current-value and target checks before apply | Controlled portals only; stale-state test |
| Dangerous sequence | Account takeover | Low | Critical | Sequence rules block recovery/password/phone combinations | New patterns require review; sequence test |
| Sensitive log/clipboard leakage | Private values | Medium | High | Redaction, no raw values in helper state, no auto-copy | Browser clipboard remains external |
| Extension abuse | Tabs/session | Low | Critical | Minimal permissions, local host allowlist, strict CSP, no remote code | Prototype not independently audited |
| XSS / protocol injection | UI and actions | Medium | High | React escaping, no HTML injection/eval, action allowlist | Dependency risk; injection test |
| Cross-session access | Shared database state | Low | High | Capability-checked RPCs, forced RLS and revoked direct table access | Public invitation creation needs edge rate limits before high-volume use |
| CSRF / insecure transport | Collaboration | Low | High | HTTPS deployment, opaque capabilities and per-write revision checks | Real deployments need authenticated identity and additional abuse controls |
| Adapter poisoning | Semantic mappings | Low | High | Signed/reviewed adapters are future requirement | Arbitrary-site adapters unsupported |
| Translation ambiguity | Owner decision | Medium | Medium | English fallback, consequence summary, owner-only gates | Community review still needed |
| Misleading consequence | Informed approval | Medium | High | Structured consequence data and simple/detailed views | Human factors research required |

This document is repository-only and is not exposed as a public application route.

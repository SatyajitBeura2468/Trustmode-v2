# Threat model

| Threat | Asset / path | Likelihood | Impact | Mitigation | Residual risk / test |
| --- | --- | --- | --- | --- | --- |
| Malicious helper | Owner authority via proposal | Medium | High | Allowlist targets; owner review; owner-only execution | Misleading prose; blocked-action tests |
| Stolen/replayed invite | Session access | Medium | Medium | Expiry, single-use code, revocation | Demo links are local; expiry tests |
| Proposal tampering | Action payload | Medium | High | Typed schema, scenario/target checks, immutable IDs | Client-only demo trust boundary; tamper test |
| DOM mutation / stale mapping | Wrong field | Medium | High | Current-value and target checks before apply | Controlled portals only; stale-state test |
| Dangerous sequence | Account takeover | Low | Critical | Sequence rules block recovery/password/phone combinations | New patterns require review; sequence test |
| Sensitive log/clipboard leakage | Private values | Medium | High | Redaction, no raw values in helper state, no auto-copy | Browser clipboard remains external |
| Extension abuse | Tabs/session | Low | Critical | Minimal permissions, local host allowlist, strict CSP, no remote code | Prototype not independently audited |
| XSS / protocol injection | UI and actions | Medium | High | React escaping, no HTML injection/eval, action allowlist | Dependency risk; injection test |
| CSRF / insecure transport | Collaboration | Low in local demo | High | No mutation backend; HTTPS on deployment | Production backend needs anti-CSRF/auth |
| Adapter poisoning | Semantic mappings | Low | High | Signed/reviewed adapters are future requirement | Arbitrary-site adapters unsupported |
| Translation ambiguity | Owner decision | Medium | Medium | English fallback, consequence summary, owner-only gates | Community review still needed |
| Misleading consequence | Informed approval | Medium | High | Structured consequence data and simple/detailed views | Human factors research required |

This document is repository-only and is not exposed as a public application route.

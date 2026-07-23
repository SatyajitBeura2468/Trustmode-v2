# Architecture

TrustMode v2.1 is a controlled shared-session product with a React owner experience, a dedicated helper capability route, controlled fictional portals, a Manifest V3 portal adapter, a Supabase Postgres capability service, and a shared TypeScript domain engine.

`@trustmode/core` is framework-independent. Its pure reducer accepts typed session commands and owns session creation, the Intent Contract, capability verification, pause/resume/stop/expiry transitions, proposal lifecycle, six policy checks, owner decisions, controlled portal values, messages, integrity-linked activity, redaction, and receipt generation. Invalid state transitions throw a typed error and fail closed.

The browser shell persists one versioned recovery snapshot. A private Supabase table holds the sanitised session state; direct table access is revoked and Row Level Security is forced. Security-definer RPC functions accept only the owner secret or helper token/code, verify expiry and revision, and return a scrubbed session. Browsers poll their permitted projection every 1.5 seconds and reject stale revisions. A five-minute inactivity timer pauses active sessions and every capability expires after thirty minutes.

The helper link contains a random purpose-bound capability token; entry also requires the separately displayed six-digit owner code. Helper commands can prepare and send proposal IDs only. Owner-side commands alone can decide and apply approved values. Controlled portal adapters accept allowlisted semantic targets and expected-current values, never arbitrary selectors or navigation.

No credentials, raw documents, payment data, medical records, or private source values enter helper state. The shared transport remains synthetic and capability-based; authenticated real-world collaboration is outside this release boundary.

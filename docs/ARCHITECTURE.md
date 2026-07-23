# Architecture

The monorepo contains a Vite public demo, a helper-focused entry point, fictional portals, a local Manifest V3 owner extension, and shared typed protocol/policy packages.

The public demo is deterministic and secret-free. A versioned local-storage snapshot provides persistence; `BroadcastChannel` synchronises same-browser tabs when supported. Messages carry scenario IDs and proposal semantics only. No authentication tokens or private values enter helper state.

`@trustmode/core` owns scenario data, semantic action types, validation, policy evaluation, redaction, consequence descriptions, and sequence-risk detection. UI surfaces consume those rules rather than inventing safety status.

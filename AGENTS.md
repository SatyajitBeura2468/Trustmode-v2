# TrustMode contribution guide

TrustMode is a safety-oriented demonstration. Preserve its central boundary: a helper may prepare semantic proposals, but only the owner reviews and applies them.

## Non-negotiable constraints

- Use synthetic data only.
- Never collect credentials, OTPs, payment details, or raw identity documents.
- Final submission, account recovery, payments, and irreversible actions remain owner-only.
- Keep the Chrome extension on Manifest V3 with minimal, explicit permissions and no remote code.
- Do not market the prototype as ready for real sensitive accounts or arbitrary websites.
- Maintain keyboard access, visible focus, reduced-motion support, and English/Hindi/Odia core copy.

## Quality gates

Run `pnpm check` and `pnpm test:e2e`. Inspect the web demo at desktop and 390px mobile widths. Check console errors, direct-route refreshes, emergency stop, proposal review, blocked actions, and receipt generation.

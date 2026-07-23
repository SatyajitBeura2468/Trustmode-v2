# Deployment

The public target is `apps/web-demo`. From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm --filter @trustmode/web-demo build
npx vercel --prod
```

The root `vercel.json` installs from the monorepo root, builds only the public demo, emits `apps/web-demo/dist`, and rewrites SPA routes to `index.html`. No secrets or database are required.

# AGENTS.md

## Cursor Cloud specific instructions

### Overview
New PR is a mobile-first React 19 + TypeScript SPA for tracking personal records (PRs) in physical exercises. It uses Firebase (Auth + Firestore) as its backend (no self-hosted server) and Vite as the dev server.

### Running the app
- `npm run dev` starts Vite on `http://localhost:5173`.
- Firebase config has hardcoded fallback credentials for the `new-pr-app` project, so no `.env.local` is strictly required for basic dev work.
- Auth is Google OAuth only (popup-based via `signInWithPopup`). There is no email/password sign-in flow.

### Lint / Build / Test
- `npm run lint` — ESLint 9. There are pre-existing errors (unused vars, react-hooks warnings). These are in the repo already.
- `npm run build` — `tsc -b && vite build`. Has pre-existing TS errors (e.g. missing export `createPeriodization` referenced in `CreatePeriodizationModal.tsx`). The Vite dev server still works fine since it doesn't type-check.
- No automated test suite exists (no test runner configured).

### Gotchas
- The app requires a valid Firebase subscription status to access most features. If the paywall blocks you, the subscription check happens in `SubscriptionContext.tsx`.
- Stripe integration (payments) is optional for core exercise/PR tracking; it only needs Firebase Cloud Functions + Stripe keys if testing the subscription flow.
- The `functions/` directory contains Firebase Cloud Functions (Node.js 20, CommonJS) and has its own `package.json`. Install separately with `npm install` inside `functions/` if needed.

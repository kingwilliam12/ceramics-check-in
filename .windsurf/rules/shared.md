---
trigger: model_decision
description: Use when editing /shared/ or tasks involving env vars, release/versioning, shared TS types, lint/format configs, CI/CD, logging, test coverage, or dependency management.
---

# Shared Rules (Types, Config, CI)

## Pathing
* **MUST** place shared TS types in `shared/types.ts`.
* **SHOULD** export ESLint & Prettier configs from `shared/config/`.
* **SHOULD** regenerate Supabase DB types into `shared/supabase.generated.ts` via  
  `supabase gen types typescript --project-id <id> > shared/supabase.generated.ts`.

## Patterns
* **MUST** avoid circular deps – enforced by `madge --circular`.
* **SHOULD** keep helper fns pure; side-effect helpers go in `shared/utils/sideEffects.ts`.

## Testing
* **MUST** reach 100 % coverage on pure helpers (cheap).

## Tooling
* **MUST** enforce Conventional Commits via `commitlint`.
* **MUST** run `pnpm turbo lint test type-check` in CI.
* **MUST** run `turbo run lint test type-check` **at workspace root**; all packages must pass.

---

# shared/env

## Pathing
* **MUST** keep one canonical `.env.example` at repo root.
* **MUST** document every variable (key, description, default).

## Patterns
* **MUST** load env via
  - Edge scripts (Node) → `dotenv` in `supabase/functions/*`
  - TS apps → `import.meta.env`.

## Secrets
* **MUST** never commit `.env` or `supabase/config.toml`.
* **MUST** include these keys in `.env.example` with descriptions:  
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SENTRY_DSN`.
* **SHOULD** rotate service keys every 90 days (calendar reminder).

---

# shared/release

## Tagging
* **MUST** tag production releases `vMAJOR.MINOR.PATCH` (SemVer).

## CHANGELOG
* **MUST** update `CHANGELOG.md` in same PR as version bump.
* **SHOULD** auto-generate with `git cliff -t conventional`.


---

# shared/logging

* **MUST** log errors with Sentry in all three apps.
* **MUST** mask PII (email) before logging.
* **SHOULD** send a weekly uptime digest to owners@studio.se.

---

# shared/testing

* **MUST** keep **Edge function** line coverage ≥ 90 %.
* **MUST** keep mobile statement coverage ≥ 80 %.
* **SHOULD** fail CI if coverage delta < −2 %.
* Coverage is measured with **`vitest --coverage` (TS)** and **`jest --coverage` where applicable**.

---

# shared/deps

* **MUST** pin versions:
  - Edge functions → `package-lock.json`
  - JS root workspace → `pnpm-lock.yaml`.
* **MUST** run `renovate` or `dependabot` weekly.
* **SHOULD** forbid `latest` in `package.json` semver ranges (use caret or exact).

---


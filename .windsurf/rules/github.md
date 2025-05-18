---
trigger: model_decision
description: Use for any changes in .github/workflows/*.yml or CI setup: lint, test, type-check, deploy steps, cache tuning, status checks, or branch-protection rules.
---

## Pathing
* **MUST** keep workflow files in `.github/workflows/*.yml`.
* **MUST** name jobs: `lint`, `test`, `type-check`, `build`, `deploy`.

## Patterns
* **MUST** fail on any ESLint / Ruff / Black error.
* **SHOULD** cache pnpm & pip to keep runs < 3 min.
* **MUST** require status checks in branch-protection:
  - `ci/lint`
  - `ci/test`
  - `ci/type-check`.

## Deploy
* **MUST** deploy `backend` to Fly.io `staging` on every push to `main`.
* **MUST** deploy `production` only from tagged commits `v*.*.*`.
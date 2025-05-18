---
trigger: always_on
---

# Cascade Rule Conventions

This file explains how every other `.windsurf/rules/[file].md` is parsed.

## Syntax

* **MUST** – mandatory; Cascade blocks the change if violated.  
* **SHOULD** – strongly recommended; flagged with a warning.  
* **MAY** – optional guidance.

Rules are evaluated in this precedence order:

1. Directory-local `RULES.md`
2. `/shared/RULES.md`
3. This conventions file (global defaults)

---

## Rule sections

| Section | Intent |
|---------|--------|
| **Pathing** | Folder / filename conventions, colocated tests, barrel exports |
| **Modelling** | Data-shape contracts, type reuse, DTO ↔︎ DB mapping |
| **Patterns** | Preferred libraries, hooks, error handling, accessibility notes |
| **Testing** | Required coverage %, naming, mocking approach |
| **Tooling** | Lint/format configs, commit message policy |

*Pathing* examples used across the repo:  
`supabase/functions/*.ts`, `mobile/src/screens/*.tsx`, `admin/app/**/page.tsx`, `.windsurf/workflows/*.md`, `.github/workflows/*.yml`. **(camelCase; e.g. `autoCheckout.ts`)**

*Testing* defaults (may be overridden directory-locally):  
• Back-end line coverage **≥ 90 %**  
• Mobile statement coverage **≥ 80 %**  
• Sentry crash-free sessions **≥ 99 %** over 7 days
• Coverage is measured with **`vitest --coverage` (TS)** and **`pytest --cov` (Edge helpers)**.

*Tooling* baseline (CI MUST fail if violated):  
• ESLint (error-free) & Prettier-formatted  
• `pnpm audit` and `pip-audit` report **0 critical** vulnerabilities  
• Commit message passes `commitlint` Conventional-Commit rules
• Prettier check runs via `pnpm exec prettier --check .`

---

## Conventional Commits (all dirs)

Format: `type(scope): subject`

Allowed **type**: `feat` `fix` `chore` `refactor` `test` `docs` `ci`.  
Scope = directory or high-level module (`backend`, `mobile/session`, etc.).

Examples:

```text
feat(mobile): add swipe check-in gesture
fix(backend): prevent double check-in when offline queue syncs

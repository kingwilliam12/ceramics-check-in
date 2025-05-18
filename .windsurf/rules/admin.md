---
trigger: model_decision
description: Use when editing /admin/ or admin-dashboard work: Next.js pages, server actions, member CRUD, role guards, realtime occupancy widget, CSV/XLSX export, TanStack tables, Playwright tests.
---

# Admin Dashboard Rules (Next.js · TS)

## Pathing
* **MUST** use app-router (`app/`) with colocation: `page.tsx`, `page.test.tsx`.
* **SHOULD** keep server actions in `actions.ts`.

## Modelling
* **SHOULD** memoise row data for TanStack Table.
* **MUST** fetch data via `shared/api.ts` — no fetch in UI.
* **MUST** expose member **CRUD** functions (`listMembers`, `createMember`, `updateMember`, `deleteMember`) and re-use shared `Member` type.
* **MUST** implement column + date filters in TanStack Table.

## Patterns
* **MUST** guard pages by role in layout (`if (!session.admin) redirect('/')`).
* **MUST** show real-time occupancy badge using Supabase Realtime `channels.subscribe('rooms')`.

## Testing
* **MUST** cover table rendering, CSV export.
* **SHOULD** run Playwright e2e nightly.


## Tooling
* Same ESLint/Prettier rules as `mobile`.
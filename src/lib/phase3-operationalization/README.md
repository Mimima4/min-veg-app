# Phase 3 operationalization (isolated boundary scaffold)

This folder holds an **isolated Phase 3 operationalization boundary scaffold** only. It documents planning boundaries and typed placeholders for future work.

## Not wired

- **Not** imported by `src/app/**`, `src/server/**`, API routes, or UI.
- **Not** a runtime activation path.
- **Not** product consumption of Route Engine or PSA.

## Does not approve or implement

- runtime/write **activation** (write-path or product runtime)
- DB writes
- SQL / Supabase
- PSA materialization or publication
- Route Engine consumption
- production truth / materialization
- Phase 4 / LOSA
- clearing `NOT_READY_FOR_APPLY`

## Gate order (documentation only)

`P3-IMPL` → `P3-RW` → `P3-PSA` → `P3-ROUTE`

## Charters (owner-held)

| Slice | Charter ID | Approval gate |
|-------|------------|---------------|
| Implementation scaffold | `P3-IMPL-EXEC-2026-05-29-01` | **P3-IMPL-APPROVAL** (`5941f66`) |
| Runtime/write planning | `P3-RW-EXEC-2026-05-29-01` | **P3-RW-APPROVAL** (`b24acc8`) |

Changes require a separate bounded execution prompt per slice and must stay within this directory unless the charter is amended.

## Modules

| File | Role |
|------|------|
| `boundary.ts` | Gate order, forbidden actions, charter refs |
| `types.ts` | Planning state types |
| `guards.ts` | Pure invariant checks (no IO) |
| `runtime-write-planning.ts` | P3-RW planning labels only (non-wired) |

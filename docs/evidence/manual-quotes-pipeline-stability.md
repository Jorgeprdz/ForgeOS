# Manual Quotes and Pipeline Stability Repair

## Source

- Base commit: `5f02082a93e4537a085118fae3d84474dab1576c`
- Branch: `fix/manual-quotes-pipeline-stability`

## Scope

- Restore the complete commercial quote field matrix without rendering the raw accepted quote packet.
- Synchronize Pipeline card stage label and border color immediately with the selected state.
- Preserve card viewport position when Pipeline performs a full DOM reconciliation.
- Compensate scrollbar removal while productive workspaces are open.
- Disable geometric hover movement on coarse/touch pointers.

## Protected boundaries

No changes to quote parser, accepted quote bridge, quote calculation, Product Intelligence, Supabase, RLS, NASH engines, NBA engines, ADRs or ROBOCOP.

## Acceptance gates

- Complete quote packet fixture exposes identity, premiums, AVE values, coverage, recovery, scenarios, benefits, advisor and quote date.
- Raw `nativeResult`, `premiumTable` and packet identifiers do not render as primary UI.
- Selected Pipeline stage updates `data-productive-stage`, badge text and computed border color immediately.
- Failed persistence can restore the prior stage presentation.
- Card viewport position remains stable after a DOM reconciliation.
- Opening and closing a productive workspace produces no measurable layout-width or scroll shift.

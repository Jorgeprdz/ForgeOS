# FORGE AURA ACTIVITY & REPORTS UX RECONCILIATION REPORT 001

**Execution ID:** `FORGE_AURA_ACTIVITY_REPORTS_UX_DIRECTIVE_RECONCILIATION_001`  
**Human owner:** Jorge Ignacio Palacios Rodríguez  
**Date:** 2026-08-06  
**Delivery status:** `IMPLEMENTED_AWAITING_CI_AND_BROWSER_ACCEPTANCE`

## 1. Locked base

| Field | Value |
|---|---|
| Pipeline PASS PR | `#278` |
| Pipeline PASS branch | `codex/forge-aura-pipeline-ux-reconciliation-001` |
| Pipeline PASS SHA | `d986de0f660cab8ed4da6b6e32873a17af378fa8` |
| Source branch | `codex/forge-aura-pipeline-ux-reconciliation-001` |
| Source SHA | `d986de0f660cab8ed4da6b6e32873a17af378fa8` |
| Delivery branch | `codex/forge-aura-activity-reports-ux-reconciliation-001` |

The delivery branch was created directly from the exact Pipeline PASS SHA. Pipeline files are not replaced, reconstructed or copied from an older branch. Shared runtime files are changed only to mount Activity through the same authenticated Aura v4 lifecycle. The login document and login UI files remain byte-for-byte untouched; Activity assets are loaded lazily only after an authenticated Activity route is selected.

## 2. Authorities reconciled

The implementation reuses the existing authorities recovered in draft PRs `#275` and `#276`:

- FES canonical Activity event contract and the existing browser ledger writer;
- Productive Activity Reporting and its chart-ready projection;
- Operational Calendar contract, evaluator, repository and additive RLS migration;
- Productive points authority adapter, without copying the baremo;
- Productive conversion read model, preserving null for unknown and zero-base states;
- versioned Activity coaching policy and intelligence;
- authenticated Supabase session, advisor identity and Pipeline prospect authority.

No visual Material 3 component, token, layout or CSS is imported. The productive reporting bridge remains in its historical `forge-alive-material3` path, but it is a nonvisual data adapter and supplies no Material visual primitive.

## 3. Initial gaps

| Requirement | Previous state | Resolution |
|---|---|---|
| Primary action | Activity was not mounted on Pipeline PASS | One visible `Registrar actividad` action |
| Human capture | Prior draft requested `subjectId` and technical references | Person and activity concepts; references resolved internally |
| Sliders | Numeric sliders resembled productive capture | Removed completely |
| Official periods | Report surface was not productively mounted | Governed options with exact dates |
| Report summary | Empty placeholder | Confirmed totals, evidence states and accessible distribution |
| Unknown vs zero | Risk of placeholder zero | Explicit confirmed-zero, no-evidence and partial states |
| Conversion base | Not visible in mounted Aura surface | Numerator, denominator, percentage and limitation state |
| Coaching | Policy existed but was not reconciled into the new flow | Versioned policy resolution and evidence-backed observations |
| Accessibility | Incomplete tabs/dialog/chart behavior | ARIA tabs, keyboard arrows, focus trap/return, Escape, live region, table fallback |
| Pipeline regression | Parallel branch could overwrite shared files | Exact PASS base plus explicit scope guard and Pipeline regression suite |

## 4. UX architecture

### Activity

1. Operational header with one primary action.
2. Honest source/period state and exact official period selector.
3. Compact summary prioritizing activity, points, eligible days and held appointments.
4. Productive daily/type distribution with accessible table and source row keys.
5. Human capture dialog with progressive disclosure.
6. Post-capture confirmation, sync state and recommended next human action.
7. Conversion cards and policy-backed explainable observations.

### Reports

1. Official period and exact dates.
2. Three-indicator executive summary.
3. Partial-period warning that blocks incompatible comparisons.
4. Productive chart-ready distribution.
5. Accessible table/drilldown evidence.
6. Explicit limitations and last-query context.

## 5. Capture boundary

The UI never asks the advisor to type UUIDs, canonical event names, ledger discriminators or appointment references. A selected Pipeline person is converted internally into the opaque canonical references required by FES. Exactly one canonical event is passed to `runtime.appendOne`.

The current FES schemas do not authorize persisting free-form note, channel or next-action fields on every primary Activity fact. Those values remain visible in the local confirmation only and do not create a second event, task, message, calendar item or pipeline mutation. This is a bounded authority gap, not hidden persistence. A future canonical contract extension is required before those fields can be declared productively persisted.

`ADVISOR_REFERRAL_RECEIVED` remains readable in reports but is not offered in manual capture because the current mounted runtime has no governed advisor-directory selector. A prospect ID is not fabricated as an advisor reference.

## 6. State model

Implemented Activity states:

- `ACTIVITY_LOADING`
- `ACTIVITY_READY`
- `ACTIVITY_EMPTY`
- `ACTIVITY_PARTIAL`
- `ACTIVITY_CONFIGURATION_REQUIRED`
- `ACTIVITY_SOURCE_UNAVAILABLE`
- `ACTIVITY_SESSION_REQUIRED`
- `ACTIVITY_ERROR`

Reporting preserves `EMPTY`, partial-period, disconnected source and unavailable-calendar semantics. Unknown is not converted to zero. A confirmed empty report is the only path that renders confirmed zero.

## 7. Security and data boundaries

- authenticated session required;
- advisor identity bound to `user.id`;
- existing canonical ledger and writer only;
- RLS remains the database authority;
- append-only and idempotency preserved;
- late async results rejected through revision checks and runtime close;
- no automatic task, calendar item, message, pipeline stage or business decision;
- no fake events, reports, goals, references or periods.

## 8. Files

### Reused authorities

- `platform/event-evidence/canonical-activity-event-contract.js`
- `platform/operational-calendar/**`
- `platform/productivity/activity-conversion-read-model.js`
- `platform/productivity/activity-points-authority-adapter.mjs`
- `platform/productivity/activity-coaching-*.js`
- `platform/productivity/policies/FORGE_ACTIVITY_COACHING_POLICY_V1.json`
- `supabase/migrations/20260805000100_activity_operational_calendar_authority.sql`
- `docs/static-preview/forge-aura/activity/activity-runtime-adapter.js`
- `docs/static-preview/forge-aura/activity/activity-tip-presenter.js`

### Rewritten or added

- `docs/static-preview/forge-aura/activity/activity-module.js`
- `docs/static-preview/forge-aura/activity/activity-view.js`
- `docs/static-preview/forge-aura/activity/activity-capture-adapter.js`
- `docs/static-preview/forge-aura/activity/activity-periods.js`
- `docs/static-preview/forge-aura/activity/activity.css`
- `docs/static-preview/forge-aura/app-v4.js`, `aura-bootstrap-v4.js`, `aura-router-v4.js` and `aura-shell.js` for the authenticated route mount;
- login HTML and `aura-auth*` files: **not modified**;
- scoped tests, CI and evidence documents.

## 9. Acceptance status

Static contract execution before push: `7/7 PASS`.

The final status must remain `IMPLEMENTED_AWAITING_CI_AND_BROWSER_ACCEPTANCE` until GitHub Actions and authenticated browser acceptance complete. No PASS is claimed for productive note/next-action persistence or advisor-referral manual capture.

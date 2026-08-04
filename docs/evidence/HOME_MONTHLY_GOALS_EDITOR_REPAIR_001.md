# HOME MONTHLY GOALS EDITOR — REPAIR 001

## User-visible repair

- Clicking or focusing the monthly-goal fields must not submit, navigate, or reload the Dashboard.
- The editor asks both:
  - `¿Cuánto quieres ganar este mes?`
  - `¿Cuántas pólizas quieres vender?`
- The monthly widget is renamed to `Metas del mes`.

## Implementation boundary

- The monthly-goal action is intercepted in capture phase before the legacy widget action handler.
- The dialog is mounted under `document.body`, outside the Dashboard widget tree and outside any parent form.
- Both values are written atomically through the existing append-only `forge_set_monthly_policy_goal` authority.
- The economic goal is encoded as versioned metadata in `reason` using `HOME_MONTHLY_GOALS_V2:`; no database migration is required for this repair.
- No commission truth, payout truth, policy truth, CRM record, or automatic action is created.

## Acceptance markers

```text
HOME_MONTHLY_GOAL_INPUT_REFRESH=BLOCKED
HOME_MONTHLY_ECONOMIC_GOAL=CONNECTED
HOME_MONTHLY_POLICY_GOAL=CONNECTED
DATABASE_MIGRATION=NO
OTHER_MODULE_MUTATION=NO
MERGE=NOT_REQUESTED
DEPLOY=NOT_REQUESTED
```

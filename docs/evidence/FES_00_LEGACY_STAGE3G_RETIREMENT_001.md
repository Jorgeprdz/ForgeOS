# FES 00 Legacy Stage 3G Retirement Evidence 001

## Status

- `STATUS=HISTORICAL_EVIDENCE_PRESERVED`
- `PHASE=FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP`
- `RECORDED=2026-07-25`
- `SOURCE_COMMIT=5e7974152aee9bbe7256a6396ece42cabe934df9`
- `LEGACY_HARNESS_COMMIT=bfec223546c42b56fa75f08427ab49aadee0cb46`
- `PRE_HARNESS_COMMIT=2adc0f6217bd9358192b1ec2607de6838036822f`
- `FAILED_WORKFLOW_RUN=30180606799`
- `NFAST_09_STAGE_3G_ACCEPTED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Disposition

Commit `bfec223546c42b56fa75f08427ab49aadee0cb46` introduced a browser-acceptance harness against
the legacy root shell before productive Forge Alive binding existed. Workflow run
`30180606799` failed before valid finalization.

The failed attempt remains historical evidence. It is not deleted from Git history,
rewritten as success, or accepted as product evidence.

## Retired tracked files

| Path | SHA-256 before retirement | Disposition |
|---|---|---|
| `.github/workflows/nfast09-stage3g-browser-acceptance.yml` | `344193e1a9aa50b2f1a0028d48b2eaae0ed1284a65866162b88ae5aae4c957a7` | retired from active CI |
| `scripts/ci/nfast09-stage3g-finalize.sh` | `e9a9d59a8c5287fc69538d26867ab1d2443d30490b9973ec46e778fc54641720` | retired from active finalization |
| `tests/nfast-09-stage3g-end-to-end-browser-acceptance-test.mjs` | `2437f6fd78c5bd87eb5802ecc015d4b91dd58c09615a062ebf128cef599d4cc3` | retired as acceptance authority |

## Preserved reusable truth

Stages 3A through 3F remain reusable candidate assets under the new Event & Evidence
Operating System. Their existence does not authorize direct runtime reuse. Each asset
must be mapped to canonical event, ledger, projection, productive UI and human-authority
contracts before implementation.

## Locks

```text
LEGACY_BROWSER_HARNESS_AS_ACCEPTANCE=FORBIDDEN
LEGACY_ROOT_SHELL_AS_PRODUCTIVE_AUTHORITY=FORBIDDEN
PRODUCTIVE_UI_AUTHORITY=docs/static-preview/forge-alive/
SUPABASE_REMOTE_MUTATION=NO
MAIN_MUTATION=NO
```

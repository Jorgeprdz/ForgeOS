# FES 08A — Canonical FES Activity Lineage Acceptance

```text
SOURCE_COMMIT=99b945bc104949e8babff65cce49926464fd900a
DEDICATED_TESTS=16
DEDICATED_PASS=16
FES_REGRESSION_TESTS=657
FES_REGRESSION_PASS=657
REMOTE_CI_RUN_ID=30399170717
REMOTE_CI_URL=https://github.com/Jorgeprdz/ForgeOS/actions/runs/30399170717
REMOTE_CI_CONCLUSION=success
PROSPECT_LINEAGE=PASS
ACTIVITY_RECORD_PARITY=PASS
ACTIVITY_RPC_APPEND=PASS
ACTIVITY_IDEMPOTENCY=PASS
PERFORMANCE_READ=PASS
DATABASE_MIGRATION=NO
DIRECT_TABLE_ACCESS=NO
PERFORMANCE_WRITE=NO
PIPELINE_TRANSITION_FABRICATION=NO
```

## Accepted evidence

- Prospect lineage survives observation to canonical event while the call or
  appointment remains the primary subject.
- Missing, mismatched or cross-tenant lineage fails closed at projection.
- The four authorized confirmed semantics map exactly to accepted
  ActivityRecord v1 types.
- Unconfirmed handoffs create no Activity and unsupported semantics are
  explicitly ignored.
- Node and Web Crypto deterministic identifiers are byte-equivalent.
- Exact replay returns the existing truth; divergent replay conflicts.
- Browser persistence calls the authorized Activity RPC only.
- Accepted Performance read composition consumes scheduled and completed
  appointment records without any FES-owned scoring value.
- The native Linux GitHub Actions run passed Event Evidence regression,
  Productive UI browser acceptance, FES 07C browser acceptance and artifact
  upload.

The browser-only FES 02C local test requires an explicit browser binary and is
therefore not part of the Node regression set. Native Linux browser coverage
passed in the exact-SHA remote workflow.

# Forge Writable Synthetic Acceptance 005C — Remote Evidence

```text
PHASE=FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C
BASE_SHA=9289197780efd23d70be7528a1191e0509cdae40
ACCEPTANCE_SHA=8dd479edb31dffcca618dba03f217534c8653b39
WORKFLOW_RUN_ID=31337249510
WORKFLOW_RUN_URL=https://github.com/Jorgeprdz/ForgeOS/actions/runs/31337249510
ARTIFACT_ID=9044710497
ARTIFACT_NAME=writable-synthetic-acceptance-005c-8dd479edb31dffcca618dba03f217534c8653b39-20260809_212800
TIMESTAMP=2026-08-09T21:36:42.827Z

AA01=PASS
AA02=PASS
AA03=PASS
AA04=PASS
AA05=PASS
AA06=PASS
AA07=PASS
AA08=PASS
AA09=PASS
AA10=PASS

AUTHENTICATED_DOMAIN_WRITES=PASS
RLS_OWNER_ISOLATION=PASS
REAL_DATA_TOUCHED=NO
PUBLIC_DEMO_MUTATED=NO
SERVICE_ROLE_DOMAIN_WRITE=NO
RLS_BYPASS=NO

ACCEPTANCE_A_SEALED=YES
ACCEPTANCE_B_SEALED=YES
PUBLIC_A_SEALED=YES
CONTROL_B_SEALED=YES
CREDENTIAL_REUSE_AFTER_SEAL=DENIED
POST_RUN_SEALED=YES
```

## Traceability

The remote workflow ran from the exact acceptance revision `8dd479edb31dffcca618dba03f217534c8653b39` on `feature/governed-writable-synthetic-acceptance-005c` and completed successfully as GitHub Actions run `31337249510`.

The sanitized workflow artifact reports the complete AA matrix as PASS. The authenticated data-plane report confirms productive Prospect writes were executed with the acceptance session and existing RLS, cross-advisor owner isolation passed, the fixture was deterministic, cleanup was owner-scoped, no privileged business write occurred, and no real data was touched.

The post-run seal report confirms both `ACCEPTANCE_A` and `ACCEPTANCE_B` returned to `read_only=true` with an expiry and `sealed_at` timestamp of `2026-08-09T21:36:40.499+00:00`. The sealed-auth report confirms both one-run credentials were rejected after credential rotation.

`PUBLIC_A` and `CONTROL_B` remained `read_only=true` and retained their pre-existing seal timestamps before, during, and after the acceptance run. They were not reused as writable acceptance identities.

The migration ledger records version `20260809010000` as present and passing. The successful run did not reapply the migration because it had already been applied by the earlier governed attempt.

## Security and data boundary

This evidence intentionally contains no passwords, tokens, JWTs, anon/service-role secret values, PII, or real customer payloads. The service role was restricted to the acceptance control plane; domain writes were not executed with service-role authority and RLS was not bypassed.

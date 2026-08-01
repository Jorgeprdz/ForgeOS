# FORGE CARTERA 001D Vertical Acceptance and Closure 001

## Status

```text
PHASE=CARTERA_001D_VERTICAL_ACCEPTANCE_AND_CLOSURE
STATUS=CLOSED_VERTICAL_ACCEPTED
SOURCE_BRANCH=feature/cartera-001c-prospect-detail-timeline-projection
SOURCE_COMMIT=96e24bf403e5d59805249de260581b763a3c7bc6
IMPLEMENTATION_BRANCH=feature/cartera-001d-vertical-acceptance-closure
ACCEPTED_IMPLEMENTATION_COMMIT=7a20b08f887f41ef390dadd55606782c2a6cbfd4
PULL_REQUEST=21
GITHUB_ACTIONS_RUN=30604145610
CONTRACT_JOB=91072865783
BROWSER_JOB=91072894337
REMOTE_JOB=91072976071
BROWSER_EVIDENCE_ARTIFACT_ID=8782990127
BROWSER_EVIDENCE_SHA256=ea719e03560f68abaf2a34e1841b1caf06adb5c20a96721714ec4762cf2f963e
REMOTE_EVIDENCE_ARTIFACT_ID=8782994487
REMOTE_EVIDENCE_SHA256=ac299e8570ea82b8627f244f8050a76182e3ff50a7e30cacaf5a667bb30270ed
```

## Vertical chain accepted

```text
reviewed Quote snapshot
→ CARTERA 001B browser bridge
→ authenticated Quote confirmation RPC
→ durable Quote and Quote Version identity
→ Quote lifecycle events
→ QUOTE_AUTHORITY Prospect Timeline projections
→ quote_lifecycle_history
→ CARTERA 001C minimized projection
→ Productive Prospect Detail UI
```

CARTERA 001D adds no competing product runtime. It closes the vertical slice by
proving that the accepted 001B and 001C authorities remain continuous across
browser behavior, deployed Supabase persistence, RLS, read models and visible UI.

## Acceptance assets

- `platform/event-evidence/cartera-vertical-continuity-contract.js`
- `tests/cartera-001d-vertical-continuity-contract-test.mjs`
- `tests/cartera-001d-acceptance-harness-test.mjs`
- `tests/e2e/cartera-001d-vertical-continuity.spec.mjs`
- `playwright.cartera001d.config.mjs`
- `tests/fixtures/index.html`
- `scripts/ci/cartera-001d-remote-vertical-acceptance.sql`
- `scripts/ci/cartera-001d-github-actions-vertical-acceptance.mjs`
- `.github/workflows/cartera-001d-vertical-acceptance.yml`

## Contract acceptance

```text
SOURCE_ANCESTRY=PASS
SCHEMA_DIFF=NONE
DIFF_INTEGRITY=PASS
JAVASCRIPT_SYNTAX=PASS
TARGETED_TESTS=10
TARGETED_PASS=10
TARGETED_FAIL=0
```

The cross-layer contract proved:

- one Prospect identity throughout the vertical chain;
- one durable Quote and Quote Version identity;
- required created, reviewed, presented and accepted events;
- final lifecycle state `PROSPECT_ACCEPTED`;
- `QUOTE_AUTHORITY` preservation;
- Timeline linkage to the durable lifecycle events;
- no financial Quote Truth in Timeline, projection or rendered UI;
- no raw evidence references in rendered Prospect Detail;
- mismatches and unlinked events are rejected rather than reconciled silently;
- automatic external effects and Application creation remain forbidden.

## Chromium vertical acceptance

```text
CHROMIUM_TESTS=2
CHROMIUM_PASS=2
CHROMIUM_FAIL=0
MOBILE_VIEWPORT=390x844
SECURE_ORIGIN=LOCALHOST
SHA256_DIGEST_PATH=REAL_WEB_CRYPTO
BROWSER_SCREENSHOT=PASS
```

Chromium used the production CARTERA 001B browser bridge, Quote Supabase service,
CARTERA 001C projector and Productive Prospect Detail decorator.

It proved:

1. a reviewed Quote is confirmed through the authenticated service authority;
2. presentation and Prospect acceptance retain the same Quote identities;
3. Quote history projects the accepted state into visible Prospect Detail;
4. the activity timeline remains attributable to `QUOTE_AUTHORITY`;
5. financial values and raw evidence are not rendered;
6. a reviewed Quote without Prospect identity is non-durable and invokes no RPC.

The secure-origin fixture uses deterministic event ordering:

```text
REVIEWED=20:00
PRESENTED=20:01
PROSPECT_ACCEPTED=20:02
```

This prevents the acceptance harness from asserting an invalid chronology while
preserving the real browser SHA-256 path.

## Remote Supabase acceptance

```text
REMOTE_PROJECT_REF=rmlxigxysujsuwzgoimv
MIGRATIONS_PRESENT=20260730000100,20260730000110,20260730000120,20260730000130
QUOTE_CONFIRMATION_RPC=PASS
QUOTE_LIFECYCLE_EVENTS=PASS
QUOTE_HISTORY_PROJECTION=PASS
QUOTE_AUTHORITY_TIMELINE=PASS
CROSS_TENANT_RLS=PASS
FINAL_LIFECYCLE_STATE=PROSPECT_ACCEPTED
TEST_FIXTURES_ROLLED_BACK=YES
RESIDUAL_AUTH_FIXTURES=0
RESIDUAL_PROSPECT_FIXTURES=0
```

The remote harness executed inside one explicit transaction. It created ephemeral
users and a Prospect, invoked the deployed RPCs, verified four Quote history rows
and two linked Prospect Timeline projections, switched tenant identity to prove
RLS isolation, and executed `ROLLBACK`.

A separate post-transaction query confirmed that no acceptance users or Prospects
remained.

## Defects and false assumptions closed during acceptance

### Insecure browser origin

The first browser run used `about:blank`, where Web Crypto digest authority was
unavailable. The production bridge correctly blocked persistence with
`BLOCKED_DIGEST_UNAVAILABLE`. Acceptance now runs on localhost and exercises the
real SHA-256 implementation without polyfills.

### Invalid event chronology

The first deterministic fixture placed presented and accepted events before the
review confirmation timestamp. The projector correctly kept `REVIEWED` as the
latest state. The fixture clock was corrected instead of weakening lifecycle
ordering.

### Ambiguous visual assertion

The accepted-event label appears in both the Quote summary and the activity
Timeline. Playwright strict mode correctly rejected an ambiguous locator. The
assertion now scopes explicitly to the Timeline.

## Mutation boundary

```text
PRODUCT_RUNTIME_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_DEPLOYMENT=NO
DIRECT_QUOTE_TABLE_MUTATION=NO
DIRECT_PROSPECT_TIMELINE_MUTATION=NO
AUTOMATIC_PROSPECT_DECISION=NO
AUTOMATIC_APPLICATION_CREATION=NO
PERSISTENT_REMOTE_FIXTURES=NO
MERGE_PERFORMED=NO
```

## Closure

```text
CARTERA_001D_IMPLEMENTATION=COMPLETE
CARTERA_001D_CONTRACT_ACCEPTANCE=PASS
CARTERA_001D_BROWSER_ACCEPTANCE=PASS
CARTERA_001D_REMOTE_ACCEPTANCE=PASS
CARTERA_001_VERTICAL_SLICE=CLOSED
MERGE_PERFORMED=NO
```

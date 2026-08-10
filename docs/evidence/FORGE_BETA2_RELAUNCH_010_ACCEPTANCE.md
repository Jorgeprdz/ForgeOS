# FORGE BETA 2 RELAUNCH 010 — ACCEPTANCE

```text
PHASE=FORGE_BETA2_PRODUCTIVE_COMMERCIAL_LOOP_RELAUNCH
PHASE_NUMBER=010
ACCEPTANCE_MODE=EXACT_HEAD_GOVERNING_WORKFLOW
ACCEPTANCE_DECLARATION=PROVISIONAL_UNTIL_FINAL_EXACT_HEAD_CI_SUCCESS
```

Phase 010 composes existing accepted tests and authorities. It does not create a second commercial-loop fixture as a truth owner. The governing workflow is the executable proof for the exact candidate SHA.

## A — Authentication

| Check | Executable evidence |
|---|---|
| A01 login | `tests/forge-067g17b1-auth-entry-browser-test.mjs`, authenticated session controls |
| A02 session persistence | `tests/authenticated-session-controls-test.mjs` |
| A03 logout | authenticated session controls / canonical auth tests |
| A04 reload | Phase009 browser refresh acceptance + auth return tests |
| A05 direct route authenticated | direct-route + Phase009 browser acceptance |
| A06 direct route unauthenticated | `tests/forge-aura-direct-route.test.mjs` |
| A07 redirect correctness | root entrypoint + auth relogin canonical return tests |

## B — Shell / Navigation

Home, Pipeline, Activity, Quotes, Cartera and Income remain the canonical core workspaces. Phase008/009 shell/browser regressions plus direct-route and Pages artifact checks are reused for desktop/mobile navigation and white-screen prevention.

## C — Commercial Loop

Phase009 exact-head acceptance is the predecessor executable contract for:

```text
C01_CREATE_PROSPECT=REGRESSION_REQUIRED
C02_PERSIST_PROSPECT=REGRESSION_REQUIRED
C03_RECORD_FOLLOW_ACTIVITY=REGRESSION_REQUIRED
C04_COMMERCIAL_STATE_PROGRESSION=REGRESSION_REQUIRED
C05_QUOTE_REVIEW=REGRESSION_REQUIRED
C06_ACCEPTED_QUOTE_SEMANTICS=REGRESSION_REQUIRED
C07_HUMAN_CONFIRMED_IDENTITY_CONVERGENCE=REGRESSION_REQUIRED
C08_POLICY_ATTACH_CREATE_PATH=REGRESSION_REQUIRED
C09_CARTERA_CONTINUITY=REGRESSION_REQUIRED
C10_PAYMENT_SEMANTICS=REGRESSION_REQUIRED
C11_COMPENSATION_INTERPRETATION=REGRESSION_REQUIRED
C12_INCOME_VISIBILITY=REGRESSION_REQUIRED
C13_HOME_ACTIONABLE_INTELLIGENCE=REGRESSION_REQUIRED
C14_LOGOUT_LOGIN_PERSISTENCE=REGRESSION_REQUIRED
```

The Phase010 workflow re-runs the existing commercial-loop, Cartera, Compensation, Income, Home and auth contracts rather than reimplementing them.

## D — Identity

```text
PROSPECT_NOT_COMMERCIAL_PERSON=PASS
UNRESOLVED_VALID=PASS
NO_AUTOMATIC_IDENTITY_MERGE=PASS
HUMAN_CONFIRMATION_REQUIRED=PASS
CROSS_MODULE_RELATIONSHIP_TRACEABILITY=REGRESSION_REQUIRED
NO_HIDDEN_DUPLICATE_IDENTITY=REGRESSION_REQUIRED
AUTO_IDENTITY_MERGE=0
```

Authority: CRS-03/04/05/11 + Cartera 010B/020C existing contracts.

## E — Economic honesty

```text
UNKNOWN_NOT_ZERO=PASS
SCENARIO_EXPECTED_GENERATED_EARNED_PAID_DISTINCT=PASS
QUOTE_NOT_POLICY=PASS
POLICY_NOT_PAYMENT=PASS
PREMIUM_PAID_NOT_COMMISSION_PAID=PASS
INITIAL_NOT_RENEWAL=PASS
PAYOUT_REQUIRES_AUTHORIZED_EVIDENCE=PASS
NO_INVENTED_FINANCIAL_CLAIM=PASS
```

Authority: ADR-007/008/017/018, Cartera payment authority, Advisor Compensation and Income/Forecast.

## F — Security

The workflow reuses the accepted CRS 03–08 security tests, CRS11 cross-advisor boundary, authenticated session controls and REP-17 regression. Phase010 additionally rejects any diff touching Supabase/RLS/auth privileged surfaces or adding service-role / policy-definition primitives.

```text
TWO_USER_ISOLATION_MODEL=EXISTING_GOVERNED_CROSS_ADVISOR_TESTS
SERVICE_ROLE_LEAKAGE_ALLOWED=NO
PRIVILEGED_BROWSER_SECRET_ALLOWED=NO
CROSS_ADVISOR_READ_ALLOWED=NO
CROSS_ADVISOR_WRITE_ALLOWED=NO
```

No new live Beta credentials are embedded in repository CI.

## G — Release boundary

The workflow reproduces the PR-only canonical Pages build strategy by extracting the builder/validator from `.github/workflows/pages.yml`, generating productive Pages runtimes in DEMO_MODE, constructing `_site`, validating required public assets and running the existing Pages import/direct-route tests.

```text
G01_ARTIFACT_BUILD=REQUIRED
G02_RUNTIME_FILES=REQUIRED
G03_IMPORT_GRAPH=REQUIRED
G04_ASSET_DEPENDENCIES=REQUIRED
G05_ROOT_ROUTE=REQUIRED
G06_DIRECT_MODULE_ROUTES=REQUIRED
G07_REFRESH=REQUIRED
G08_DEEP_LINK=REQUIRED
G09_MOBILE=REQUIRED
G10_DESKTOP=REQUIRED
G11_BASE_PATH=REQUIRED
G12_404_FALLBACK=REQUIRED
```

## H — Responsive / usability

Phase009 browser acceptance is re-run at desktop and 390 px mobile. Critical loop screens must have no horizontal overflow and must keep the primary action/business qualification visible.

## I — Reliability

Clean boot/reload/session persistence and honest empty/unknown behavior are covered by existing auth, direct-route, Phase009 browser and domain tests. The Phase010 browser/runtime jobs fail on uncaught page errors or inherited browser acceptance failure.

## Constitutional mutation seal

```text
NEW_ENGINE_CREATED=0
NEW_GLOBAL_SCORE_CREATED=0
NEW_GLOBAL_PRIORITY_FORMULA_CREATED=0
DUPLICATE_TRUTH_OWNER_CREATED=0
DUPLICATE_IDENTITY_OWNER_CREATED=0
DUPLICATE_POLICY_OWNER_CREATED=0
DUPLICATE_PAYMENT_OWNER_CREATED=0
DUPLICATE_COMPENSATION_OWNER_CREATED=0
DATABASE_MUTATION=0
SCHEMA_MUTATION=0
RLS_MUTATION=0
SUPABASE_DOMAIN_MUTATION=0
AUTO_IDENTITY_MERGE=0
AUTONOMOUS_COMMERCIAL_EXECUTION=0
```

Final `PASS` values are valid only when `.github/workflows/forge-beta2-productive-commercial-loop-relaunch-010.yml` completes successfully on the exact final candidate SHA.
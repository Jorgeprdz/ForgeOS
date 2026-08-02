# FORGE CRS 09ABCD — Preparation Evidence

**Evidence ID:** `FORGE_CRS_09_ABCD_PREPARATION_001`
**Requested next:** `CRS_09ABCD_PRODUCTIVE_PERSON_WORKSPACE`
**Branch:** `feat/crs-09-productive-person-workspace`
**Base at intake:** `0fb32fd397878dec6c2e1dbe3b10a88b47202204`
**Status:** `IMPLEMENTED_PENDING_PR_CI`
**Automatic merge:** `FORBIDDEN`

## Constitutional gate

- Constitution: repository `AGENTS.md` and Commercial Relationship Spine source truth.
- Build Tree area: Shared Commercial Model → authenticated Person Workspace.
- Discovery: CRS 08 closure, CRS roadmap, existing Material 3 shell, Pipeline, Activity, Quotes, Cartera, Pages runtime closure.
- Miranda alignment: one productive person surface; no parallel CRM truth, no hidden fallback, no automatic identity or business mutation.
- Board signal: owner authorization received as `NEXT=CRS_09ABCD_PRODUCTIVE_PERSON_WORKSPACE`.
- Scope: CRS 09A, 09B, CRS 09C, and CRS 09D in one controlled pass.

## Implemented scope

### CRS 09A — Information architecture

- Contextual authenticated route `?nav=persona`.
- No new primary navigation item.
- Eight authority-owned sections.
- Internal deep-link model with explicit return origin.
- Responsive and safe-area layout contract.

### CRS 09B — Productive read model

- Strict `FORGE_PRODUCTIVE_PERSON_WORKSPACE` contract.
- Canonical `CommercialPerson` root and derived `AdvisorCommercialRelationship`.
- Composition of Identity, Opportunities, Commitments, Interactions, Quotes, Applications, Policies, and CRS 08 Timeline.
- Honest `AVAILABLE`, `EMPTY`, `DEGRADED`, and `UNAVAILABLE` states.
- Deterministic workspace reference/digest.
- Sensitive-copy and cross-person rejection.

### CRS 09C — Authenticated UI mount

- Material 3 person workspace module.
- Source identity resolution through active authoritative links.
- Pipeline entry by `PROSPECT` identity.
- Cartera entry by canonical `COMMERCIAL_PERSON`.
- Context-preserving reentry from Activity, Quotes, and Cartera when `person` is present.
- Domain-owned deep links instead of duplicate controls.

### CRS 09D — Acceptance hardening

- Logout and auth-error scrub.
- Route-unmount scrub.
- Generation-based late-result rejection.
- No browser persistence of workspace snapshots.
- Desktop, tablet, mobile, safe-area, focus-visible, touch-target, and reduced-motion rules.
- Pages runtime closure extended to publish CRS 09 dependencies.

## Changed surface

### New runtime and contract

- `platform/shared-commercial-model/crs-09-person-workspace-contract.js`
- `advisor-os/person-workspace/crs-09-person-workspace-service.js`
- `docs/static-preview/forge-alive-material3/person-workspace-module.js`
- `docs/static-preview/forge-alive-material3/person-workspace-module.css`
- `docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.js`
- `docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.css`

### Shell and publication integration

- `docs/static-preview/forge-alive-material3/app.js`
- `docs/static-preview/forge-alive-material3/forge-navigation-contract.js`
- `scripts/prepare-forge-alive-pages-runtime-closure.mjs`
- `tests/pages-public-demo-runtime-closure-test.mjs`

### Tests and governance

- `tests/crs-09-person-workspace-contract-test.mjs`
- `tests/crs-09-person-workspace-service-test.mjs`
- `tests/crs-09-person-workspace-ui-test.mjs`
- `tests/crs-09-person-workspace-entry-bridge-test.mjs`
- `docs/architecture/source-truth/FORGE_CRS_09_PRODUCTIVE_PERSON_WORKSPACE_001.md`
- `.github/workflows/crs-09-productive-person-workspace.yml`

## Local targeted verification

The initial contract, service, and UI suites were executed together before PR creation:

```text
CRS_09_TARGETED_TESTS=17/17_PASS
CRS_09_NEW_JS_SYNTAX=PASS
```

The bridge, Pages artifact, inherited CRS 03–08, and complete bounded-path suite remain subject to the pull request workflow.

## Locked boundaries

```text
COMMERCIAL_PERSON_CANONICAL_ROOT=YES
ADVISOR_COMMERCIAL_RELATIONSHIP_REQUIRED=YES
CRS_08_TIMELINE_REUSED=YES
SECOND_TRUTH_STORE=NO
SECOND_TIMELINE=NO
WORKSPACE_PERSISTENCE=NO
DATABASE_MIGRATION=NO
AUTOMATIC_IDENTITY_RESOLUTION=NO
AUTOMATIC_OPPORTUNITY_CREATION=NO
AUTOMATIC_BUSINESS_ACTION=NO
LOCAL_MUTATION_CONTROLS=NO
SENSITIVE_PAYLOAD_COPY=FORBIDDEN
CROSS_PERSON_COMPOSITION=FORBIDDEN
LOGOUT_SCRUB=ENFORCED
LATE_RESULT_REJECTION=ENFORCED
AUTOMATIC_MERGE=FORBIDDEN
```

## Remaining acceptance gates

1. Open pull request against `main`.
2. Run CRS 09 targeted workflow and inherited authority regressions.
3. Run Pages runtime closure verification.
4. Resolve any review or CI findings.
5. Merge only after explicit owner authorization.

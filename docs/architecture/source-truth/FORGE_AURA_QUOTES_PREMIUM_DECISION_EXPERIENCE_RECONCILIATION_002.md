# Forge Aura Quotes Premium Decision Experience Reconciliation 002

```text
PHASE=FORGE_AURA_QUOTES_PREMIUM_DECISION_EXPERIENCE_RECONCILIATION_002
PRODUCT_SURFACE=ADVISOR_OS_QUOTES
VISIBLE_PRODUCT_NAME=Cotizaciones
TECHNICAL_ROUTE=cotizaciones
BASE_MAIN_SHA=4985d4a47989c7adae8c884b48b1dd71310c04ee
BRANCH=feature/aura-quotes-premium-decision-experience-002
IMPLEMENTATION_MODE=PRESENTATION_BOUNDARY_REWRITE
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Gate 0 — current state recovered

`main` was recovered from GitHub immediately before implementation and the branch was created directly from `4985d4a47989c7adae8c884b48b1dd71310c04ee`.

The current Aura Quotes surface was inspected at:

- `docs/static-preview/forge-aura/quotes/quotes-module.js`
- `docs/static-preview/forge-aura/quotes/quotes-adapter.js`
- `docs/static-preview/forge-aura/quotes/quotes.css`
- shared Aura tokens and shell routing
- current Pages build boundary and existing Quotes tests
- open pull requests that mention Quotes

```text
GATE_0_CURRENT_STATE_RECOVERED=PASS
MAIN_SHA=4985d4a47989c7adae8c884b48b1dd71310c04ee
BRANCH_BASE=4985d4a47989c7adae8c884b48b1dd71310c04ee
SHARED_ROUTE_CHANGES_REQUIRED=NO
```

## Constitutional gate

Authorities applied:

- `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`
- `docs/architecture/source-truth/ARTICLE_0_RATIFICATION_001.md`
- ADR-003 Recommendation vs Decision Authority Boundary
- ADR-004 No Invented Recommendations
- ADR-005 Product Truth Boundary
- ADR-007 Forecast Truth Boundary
- ADR-008 Economic Evidence Boundary
- ADR-024 Forge Aura Light 2026 Canonical Redesign Design Authority
- `TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md`
- `TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md`
- `EVIDENCE_STATE_CONTRACT_001.md`
- `RULE_SNAPSHOT_GOVERNANCE_001.md`
- `MARKET_DATA_SOURCE_REGISTRY_001.md`
- `SOURCE_OWNERSHIP_REGISTRY_001.md`

The implementation preserves the Article 0 sequence: evidence first, reasoning/explanation second, uncertainty visible, explicit human checkpoint before confirmation.

```text
EVIDENCE_OVER_ASSERTION=REQUIRED
UNCERTAINTY_VISIBLE=REQUIRED
HUMAN_JUDGMENT_PRESERVED=REQUIRED
UNKNOWN_IS_NOT_ZERO=REQUIRED
PROJECTED_IS_NOT_CONTRACTUAL=REQUIRED
NO_FAKE_DATA=REQUIRED
NO_INVENTED_RECOMMENDATIONS=REQUIRED
QUOTES_CONSTITUTIONAL_GATE=PASS
```

## Forge Aura Light 2026 gate

```text
FORGE AURA LIGHT 2026 GATE
AURA_LIGHT_AUTHORITY=docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md
AURA_LIGHT_CANONICAL_AUTHORITY=docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_AUTHORITY.md
AURA_LIGHT_SOURCE_PDF_SHA256=0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e
AURA_LIGHT_VERSION=1.0
AURA_LIGHT_COMPLIANCE=REQUIRED
APPLICABLE_SURFACE=docs/static-preview/forge-aura/quotes/**
LEGACY_VISUAL_IMPORTS=FORBIDDEN
LOCAL_UNGOVERNED_TOKENS=FORBIDDEN
TOKEN_STRATEGY=CANONICAL_FORGE_AURA_LIGHT_TOKENS_ONLY
RESPONSIVE_EVIDENCE=MOBILE|TABLET|DESKTOP|ZOOM_200
ACCESSIBILITY_EVIDENCE=KEYBOARD|FOCUS|CONTRAST|ZOOM|REDUCED_MOTION|TARGET_SIZE
DATA_HONESTY_EVIDENCE=NORMAL|EMPTY|LOADING|PARTIAL|ERROR|UNAVAILABLE
VISUAL_ACCEPTANCE_AGAINST_CANONICAL_AUTHORITY=REQUIRED
BLOCKED_BY_ROBOCOP_LOCK_001=NO
AURA_LIGHT_GATE=PASS
```

The locked UX behavior directive was read from its authority branch `governance/forge-aura-light-2026-authority` at document SHA `0b7afdda7bdf5e3f01a735cb8a389b81ff101279`.

## Productive authorities preserved

`quotes-adapter.js` remains unchanged. The presentation layer continues to reuse:

```text
parsePdfFileToAcceptedQuotePacket
calculateAcceptedQuote
validatePacket
createAcceptedQuoteReviewSnapshotBoundary
captureReviewedQuoteLifecycle
buildQuoteBenefitSummary
createQuotePrintableRouteController
Presentation Maker existing chain
```

Additional ownership contracts inspected:

- `R16J2B_ACCEPTED_QUOTE_STAGE_ALIGNMENT_ACCEPTANCE.md`
- `QPD01_CANONICAL_QUOTE_PRINTABLE_READ_MODEL.md`
- `FORGE_QUOTE_PRINTABLE_DOCUMENT_OWNERSHIP_QPD01.md`
- `FORGE_QUOTE_PRINTABLE_PDF_RUNTIME_QPD03.md`
- `FORGE_QUOTE_PRINTABLE_PRODUCT_PROFILES_QPD04.md`
- `FORGE_QUOTE_TO_SALES_PRESENTATION_ROADMAP_R16J.md`

```text
NEW_CALCULATION=NO
NEW_TRUTH=NO
NEW_ENGINE=NO
NEW_PERSISTENCE=NO
NEW_PRODUCT_INFERENCE=NO
```

## Presentation reconciliation

The old engine-inspection composition was replaced by an advisor decision experience:

1. Floating Top Bar with permanent `Nueva cotización` primary module action.
2. Actionable empty state with PDF drop zone and manual product selection behind progressive disclosure.
3. Honest loading state with only observable milestones and no invented percentage.
4. Single Quote Hero for product, supported primary value, source context and review state.
5. `Requiere atención` limited to three evidence-backed signals.
6. Accessible tab navigation: `Resumen`, `Beneficios`, `Proyección`, `Evidencia`.
7. Settled fact rows rather than one card per datum.
8. Product Intelligence is consumed, not rewritten or converted into frontend marketing claims.
9. Projection is explicitly labeled and includes the non-guarantee disclosure.
10. Technical provenance, economic evidence, missing fields and truth classification remain available under Evidencia.
11. READY/PARTIAL use one primary human action: `Revisar y confirmar`.
12. ACCEPTED uses `Crear presentación` as primary, with `Ver PDF` and `Descargar PDF` secondary.
13. PDF modal preserves Escape, focus trap, modal semantics and focus-return intent.

```text
READY_COPY=Cotización calculada
ACCEPT_ACTION=Revisar y confirmar
ACCEPTED_COPY=Cotización confirmada
PRIMARY_MODULE_ACTION=Nueva cotización
MAX_ATTENTION_SIGNALS=3
```

## Files changed by this phase

Runtime presentation:

- `docs/static-preview/forge-aura/quotes/quotes-module.js`
- `docs/static-preview/forge-aura/quotes/quotes.css`

Tests and evidence:

- `tests/forge-aura-quotes-reconciliation-test.mjs`
- `tests/aura-quotes-premium-decision-experience-002.test.mjs`
- `tests/aura-quotes-premium-decision-experience-002-scope-guard.test.mjs`
- `tests/aura-quotes-premium-decision-experience-002-pages-import-graph.test.mjs`
- `tests/quotes-premium-playwright.config.mjs`
- `tests/e2e/aura-quotes-premium-decision-experience-002.spec.mjs`
- `tests/fixtures/aura-quotes-premium-decision-experience-002.html`
- `.github/workflows/aura-quotes-premium-decision-experience-002.yml`
- this document
- acceptance evidence document

Explicitly unchanged:

```text
QUOTES_ADAPTER_CHANGED=NO
DATABASE_MUTATION=0
RLS_MUTATION=0
PRODUCT_ENGINE_MUTATION=0
QUOTE_ENGINE_MUTATION=0
FORECAST_ENGINE_MUTATION=0
ECONOMIC_ENGINE_MUTATION=0
PAGES_PRODUCTION_WORKFLOW_MUTATION=0
SHARED_AURA_ROUTE_MUTATION=0
```

## Validation design

The phase workflow performs:

- JS syntax checks;
- constitutional and static UX contracts;
- current-merge-base scope guard;
- existing Aura Quotes regression;
- Accepted Quote review regression;
- Product Intelligence regressions;
- QPD/PDF regressions;
- Presentation Maker assembly/review regressions;
- canonical Pages artifact build and complete Aura import-graph validation;
- Playwright acceptance at 390x844, 834x1194 and 1440x900;
- explicit PARTIAL/economic-unavailable state;
- keyboard tab navigation and PDF modal Escape behavior;
- 200% zoom reflow;
- reduced-motion behavior;
- required real-module screenshot artifact set.

The visual fixture renders the actual `quotes-module.js` with an explicitly synthetic, test-only adapter. It is evidence for presentation behavior only and cannot become Product Truth, quote truth or release data.

## Scope guard

The guard computes `git merge-base origin/main HEAD` at execution time. It does not pin a historical PR creation SHA. It fails on out-of-scope changes, Supabase/schema changes, Product/Forecast/Compensation engine changes, unrelated Aura module mutation, Pages production workflow mutation and legacy Material visual imports.

## Status before CI closure

Implementation is committed on the dedicated branch. Final PASS claims that depend on Actions/browser/artifact execution are recorded only after the branch workflow and PR checks complete.

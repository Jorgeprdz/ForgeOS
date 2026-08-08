# FORGE CARTERA POLICY COVERAGE MODEL AUTHORITY 001

## Execution identity

```text
EXECUTION_ID=FORGE_CARTERA_POLICY_COVERAGE_MODEL_AUTHORITY_001
SOURCE_SHA=946c9f8781107514f4e09037034f6270c7d47939
BRANCH=feature/cartera-policy-coverage-model-authority-001
OWNER_AUTHORIZATION=OK_GO_CARTERA_COVERAGE_MODEL
REMOTE_SUPABASE_MUTATION=NO
AURA_MUTATION=NO
MAIN_MUTATION=NO
MERGE=NO
DEPLOY=NO
```

## Robocop gate

```text
CONSTITUTION=PASS
ARTICLE_0=PASS
REPOSITORY_GOVERNANCE=PASS
MIRANDA_APPROVAL=APPROVED_INHERITED_ADR_023
BOARD_APPROVAL=APPROVED_INHERITED_ADR_023
OWNER_APPROVAL=GRANTED_CURRENT_PHASE
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
PRODUCT_TRUTH_OWNER=PRODUCT_INTELLIGENCE
UNKNOWN_NOT_ZERO=LOCKED
NO_PARALLEL_POLICY_AUTHORITY=PASS
NO_PARALLEL_PRODUCT_AUTHORITY=PASS
NO_PARALLEL_WRITER=PASS
```

ADR-023 is the governing execution authorization for the bounded recovery/persistence surface: it ratifies Owner, Miranda and Board approval, permits Policy persistence integration and permits an additive, versioned, non-destructive, tenant-aware schema migration when an evidenced gap cannot be satisfied by existing authority. This phase remains narrower than ADR-023 because it performs no UI, Pages or remote Supabase mutation.

## Authorities read

- `FORGE_CONSTITUTION_V3.md`
- `docs/architecture/source-truth/ARTICLE_0_RATIFICATION_001.md`
- `AGENTS.md`
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`
- `docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md`
- ADR-001 Evidence Ownership
- ADR-003 Recommendation / Decision / Human Authority
- ADR-004 Unknown / no invented recommendations
- ADR-005 Product Truth Boundary
- ADR-006 Policy Truth Boundary
- ADR-008 Economic Evidence Boundary
- ADR-023 Productive recovery execution authority
- ADR-024 Aura Light 2026 authority, used here only to confirm `AURA_MUTATION=NO`
- `FORGE_CARTERA_010A_IDENTITY_POLICY_PERSISTENCE_SCOPE_001.md`
- `FORGE_CARTERA_010B_PERSISTENCE_FOUNDATION_PROGRESS_001.md`
- `FORGE_CRS_01_EXISTING_CARTERA_AUTHORITY_PROMOTION_001.md`
- current Policy v2 schema, persistence migration, command helpers, governed confirmed Policy RPC and atomic entry wrapper
- current Coverage Intelligence/Product Intelligence coverage and benefit candidates

## Discovery results

Repository-wide semantic and structural searches covered `coverage`, `policy coverage`, `policy_coverages`, `benefit`, `contracted benefit`, `rider`, `annex`, `policy_versions`, schemas, migrations, Policy Intelligence, Product/Coverage Intelligence and CRS material.

### Existing implementation classification

| Candidate | Classification | Finding |
|---|---|---|
| `schemas/policy-v2.schema.json` | Policy Truth foundation | Canonical Policy v2 exists but only carries Policy-level `sumInsured`, `premiumAmount`, currency and payment frequency. No multi-coverage child contract. |
| `canonical_policies` | Policy Truth current projection | Canonical owner-scoped Policy exists. No per-coverage rows. |
| `policy_versions` | Policy Truth version authority | Exact immutable Policy versions exist and are reusable as the version binding for child coverage. |
| `policy_evidence_versions` | Evidence authority | Evidence hash, provenance, verification and correction lineage exist and are reusable. |
| `forge_cartera010b_confirm_policy_with_parties` | Governed Policy writer | Strict human-reviewed Policy writer exists; it does not accept coverage rows. It must not be duplicated. |
| `forge_cartera010b_confirm_identity_and_policy` | Atomic orchestration | Existing transactional and read-after-write pattern is reusable. |
| Product/quote benefit engines | Product/Quote Truth or presentation | Describe benefits/illustrations or calculate quote/product results; they do not prove a benefit is contracted in a specific Policy. |
| `product-intelligence/coverage/**` | Interpretation | Coverage Intelligence consumes `policyFacts` to interpret possible coverage; it is not Policy Truth or persistence. |
| GMM Coverage Intelligence docs | Discovery / blueprint | Explicitly not an approved canonical schema or Policy writer. |
| Cartera 010C read models | Read projection | Consumers of canonical Policy state, not coverage persistence authority. |

Search did not find an existing `policy_coverages` canonical table, a per-coverage version table, a per-coverage governed writer, or per-coverage RLS authority.

## Coverage model status

```text
COVERAGE_MODEL_STATUS=EXISTING_FOUNDATION_REQUIRES_EXTENSION
WHY_NOT_TRUE_CANONICAL_GAP=POLICY_INTELLIGENCE_ALREADY_OWNS_POLICY_COVERAGE_TRUTH_AND_ALREADY_PROVIDES_POLICY_VERSION_EVIDENCE_RLS_CONFLICT_IDEMPOTENCY_AND_GOVERNED_COMMAND_PATTERNS
MISSING_CAPABILITY=NORMALIZED_MULTI_COVERAGE_CHILD_PERSISTENCE_AND_READ_PROJECTION
CANONICAL_OWNER=POLICY_INTELLIGENCE
```

This is not a new truth domain. ADR-006 and Cartera 010A already assign contracted coverage facts to Policy Intelligence. The implementation therefore extends that governing authority with a Policy child model instead of introducing another Policy owner.

## Product Truth boundary

```text
PRODUCT_COVERAGE != CONTRACTED_POLICY_COVERAGE
PRODUCT_TRUTH_MUST_NOT_CREATE_POLICY_COVERAGE=LOCKED
PRODUCT_COVERAGE_REFERENCE=TAXONOMY_CONTEXT_ONLY
```

A `productCoverageReference` may help identify the product definition corresponding to a contracted benefit. It is nullable and never constitutes Policy Evidence.

## Policy Truth boundary

Contracted Policy Coverage exists only under an owned canonical Policy, is bound to an exact `policy_versions` row and to reviewed/confirmed `policy_evidence_versions`, and is persisted only by an authenticated human-governed command.

OCR, PDF parsing, CSV, manual entry, Quote and Product Truth remain candidate/evidence producers. None writes `policy_coverages` directly.

## Coverage Intelligence boundary

Coverage Intelligence remains interpretation. Existing engines can interpret a future safe coverage projection but cannot create or mutate contracted Policy Coverage Truth.

## Canonical contract

New child contract: `schemas/policy-v2-coverage.schema.json`.

It supports independently per contracted coverage: stable Policy Coverage reference; exact Policy and PolicyVersion references; optional Product Coverage taxonomy reference; code, label, kind and evidence-backed state; sum insured and currency; premium and premium currency; annex/rider references; effective period; coverage/payment periods; source evidence; truth state; and correction/supersession lineage.

Unknown values remain `null`; no field defaults an unknown amount to zero, unknown currency to MXN, an unknown period to Policy duration, or an unknown coverage state to ACTIVE.

## Policy-level vs coverage-level semantics

Existing `canonical_policies.sum_insured` and `canonical_policies.premium_amount` are preserved unchanged.

```text
POLICY_LEVEL_FIELD_CLASSIFICATION=LEGACY_AMBIGUOUS_POLICY_SUMMARY
SILENT_REINTERPRETATION=FORBIDDEN
AUTO_BACKFILL_CHILD_COVERAGES=FORBIDDEN
AUTO_AGGREGATE_CHILDREN_INTO_POLICY=FORBIDDEN
```

A Policy-level value may remain useful as historical summary evidence, but this phase does not assert whether it is total, base coverage, document total or another carrier-specific meaning. Future normalization requires explicit evidence.

## Versioning and evidence

The extension follows the existing Policy pattern:

```text
policy_coverages=current projection
policy_coverage_versions=append-only history
policy_coverage_versions.policy_version_id=exact PolicyVersion binding
policy_coverage_versions.evidence_version_id=exact Policy Evidence binding
previous_coverage_version_id=supersession lineage
correction_of=explicit correction lineage
```

No evidence authority is duplicated. Canonical mutation requires the referenced `policy_evidence_versions` row to belong to the same owner and Policy and to be `REVIEWED` or `CONFIRMED`.

## Writer and atomicity

`forge_policy_intelligence_confirm_policy_coverages(jsonb)` is a bounded child command. It does not create Policy, PolicyRole, Policy Evidence or Product Truth. It reuses existing CARTERA 010B digest, idempotency, changed-input conflict, command receipt and Policy conflict helpers.

`forge_cartera010b_confirm_identity_policy_and_coverages(...)` is orchestration only: it calls the accepted atomic identity+Policy command and then the coverage command in the same database transaction. A coverage failure prevents a successful combined operation from being reported.

## RLS model

Both new tables are `advisor_id` scoped, have composite owner foreign keys, RLS enabled and owner-only authenticated SELECT. Direct authenticated INSERT/UPDATE/DELETE is revoked. Current-row mutation additionally requires the governed command session flag; history rows use the existing append-only guard.

## Read model

`forge_policy_intelligence_read_policy_coverages(policyReference)` returns only a safe projection and no database ids, raw documents, beneficiary data, bank data, provider prompts or LLM traffic.

Honest detail states:

- `LEGACY_POLICY_SUMMARY_ONLY`
- `COVERAGE_DETAIL_NOT_CAPTURED`
- `COVERAGE_DETAIL_PARTIAL`
- `COVERAGE_DETAIL_AVAILABLE`

An empty child array never claims confirmed absence of coverage by itself.

## Beneficiary boundary

Beneficiary remains restricted `PolicyRole` authority. The coverage contract and projection contain no beneficiary fields.

## Legacy compatibility

Existing Policies require no destructive migration. No synthetic child is generated from Policy-level `sum_insured` or `premium_amount`. New detailed coverage can be added only from governed evidence and human confirmation.

## Files in bounded implementation

- `schemas/policy-v2-coverage.schema.json`
- `platform/policy-intelligence/policy-coverage-contract.js`
- `supabase/migrations/20260808000100_policy_coverage_canonical_extension.sql`
- `tests/fixtures/policy-coverage-multi-benefit.synthetic.json`
- `tests/policy-coverage-model-authority.test.mjs`
- `.github/workflows/policy-coverage-model-authority-001.yml`
- `docs/evidence/FORGE_CARTERA_POLICY_COVERAGE_MODEL_ACCEPTANCE_001.md`
- this source-truth report

No Aura, Material 3, Pipeline, Activity, Dashboard, Commissions, Quotes or NASH file is in scope.

## CI and final Robocop

Implementation acceptance:

```text
IMPLEMENTATION_ACCEPTANCE_SHA=2412440f5733ccb929bd2ce816a95cf92ede9261
WORKFLOW_RUN=31237345250
WORKFLOW_JOB=93052203619
TARGETED_POLICY_COVERAGE_TESTS=22/22_PASS
INHERITED_CARTERA_010B_020C_TESTS=34/34_PASS
```

Final constitutional recheck:

```text
CONSTITUTION=PASS
ARTICLE_0=PASS
APPLICABLE_ADRS=PASS
POLICY_TRUTH_OWNER=PASS
PRODUCT_TRUTH_SEPARATION=PASS
COVERAGE_INTELLIGENCE_BOUNDARY=PASS
EVIDENCE_OWNERSHIP=PASS
ONE_POLICY_MULTIPLE_COVERAGES=PASS
PER_COVERAGE_SUM_INSURED=PASS
PER_COVERAGE_PREMIUM=PASS
PER_COVERAGE_EFFECTIVE_DATE=PASS
PER_COVERAGE_PERIOD=PASS
PER_COVERAGE_PAYMENT_PERIOD=PASS
PER_COVERAGE_ANNEX=PASS
UNKNOWN_NOT_ZERO=PASS
VERSIONING=PASS
EVIDENCE_LINEAGE=PASS
CORRECTION_HISTORY=PASS
IDEMPOTENCY=PASS
READ_AFTER_WRITE=PASS
ATOMICITY=PASS
RLS=PASS_REPOSITORY_CONTRACT
TENANT_ISOLATION=PASS_REPOSITORY_CONTRACT
DIRECT_WRITE_BLOCKED=PASS_REPOSITORY_CONTRACT
BENEFICIARY_BOUNDARY=PASS
NO_DUPLICATE_POLICY_AUTHORITY=PASS
NO_DUPLICATE_PRODUCT_AUTHORITY=PASS
NO_DUPLICATE_EVIDENCE_AUTHORITY=PASS
NO_PARALLEL_WRITER=PASS
LEGACY_COMPATIBILITY=PASS
COVERAGE_READ_MODEL=PASS
INHERITED_REGRESSIONS=PASS
AURA_FILES_MUTATED=NO
MAIN_MUTATED=NO
REMOTE_SUPABASE_MUTATED=NO
MERGE_EXECUTED=NO
AUTO_MERGE=NO
DEPLOY_EXECUTED=NO
COVERAGE_MODEL_READY_FOR_AURA=YES
FINAL_STATUS=PASS_REPOSITORY_IMPLEMENTATION
NEXT_AUTHORIZED_CANDIDATE=RERUN_FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_001
```

`RLS`, tenant isolation and direct-write denial are accepted here at repository-contract level because this authorization explicitly forbids remote migration execution. Remote database acceptance remains a deployment-stage responsibility and is not falsely claimed in this phase.

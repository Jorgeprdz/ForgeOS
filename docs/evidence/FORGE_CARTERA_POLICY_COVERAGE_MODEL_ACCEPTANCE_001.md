# FORGE CARTERA POLICY COVERAGE MODEL ACCEPTANCE 001

```text
PHASE=FORGE_CARTERA_POLICY_COVERAGE_MODEL_AUTHORITY_001
SOURCE_SHA=946c9f8781107514f4e09037034f6270c7d47939
BRANCH=feature/cartera-policy-coverage-model-authority-001
FIXTURE_POSTURE=SYNTHETIC_ONLY
REAL_PII_COMMITTED=NO
REMOTE_SUPABASE_MUTATION=NO
AURA_MUTATION=NO
MAIN_MUTATION=NO
```

## Discovery acceptance

```text
COVERAGE_DISCOVERY_COMPLETE=PASS
PRODUCT_COVERAGE_NOT_POLICY_TRUTH=PASS
POLICY_COVERAGE_REQUIRES_EVIDENCE=PASS
COVERAGE_MODEL_STATUS=EXISTING_FOUNDATION_REQUIRES_EXTENSION
CANONICAL_OWNER=POLICY_INTELLIGENCE
```

Observed repository state before implementation:

- Canonical Policy, PolicyVersion, PolicyEvidenceVersion, PolicyRole, conflicts, idempotent receipts, RLS and governed confirmed-Policy mutation already exist.
- No canonical `policy_coverages` table or equivalent per-coverage persistence was found.
- No per-coverage version table, per-coverage command boundary or per-coverage RLS surface was found.
- Product/quote benefit engines are not Policy Truth.
- Coverage Intelligence is an interpretation consumer of Policy facts, not contracted-coverage persistence.

## Synthetic structural fixture

`tests/fixtures/policy-coverage-multi-benefit.synthetic.json` contains no real customer data. It represents one synthetic Policy with three independently shaped benefits, including different sums insured, premiums, annex/rider references, effective dates and periods, plus one intentionally partial benefit whose unknown amount/currency/period remain null.

## Acceptance matrix

The targeted Node suite must prove:

```text
ONE_POLICY_MULTIPLE_COVERAGES
PER_COVERAGE_SUM_INSURED
PER_COVERAGE_PREMIUM
PER_COVERAGE_EFFECTIVE_DATE
PER_COVERAGE_PERIOD
PER_COVERAGE_PAYMENT_PERIOD
PER_COVERAGE_ANNEX
UNKNOWN_SUM_INSURED_NOT_ZERO
UNKNOWN_PREMIUM_NOT_ZERO
UNKNOWN_CURRENCY_NOT_DEFAULT
UNKNOWN_PERIOD_NOT_GUESSED
POLICY_LEVEL_FIELDS_NOT_SILENTLY_REDEFINED
POLICY_VERSION_BINDING
COVERAGE_HISTORY_PRESERVED
EVIDENCE_LINEAGE
CORRECTION_OR_SUPERSESSION
IDEMPOTENT_REPLAY
CHANGED_INPUT_CONFLICT
READ_AFTER_WRITE
RLS_OWNER_READ
RLS_CROSS_ADVISOR_DENIED
DIRECT_WRITE_DENIED
BENEFICIARY_NOT_COVERAGE
BENEFICIARY_PRIVACY
NO_AUTOMATIC_POLICY_CONFIRMATION
NO_AUTOMATIC_COVERAGE_CONFIRMATION
NO_PARALLEL_POLICY_WRITER
NO_PARALLEL_PRODUCT_TRUTH
NO_DUPLICATE_EVIDENCE_AUTHORITY
LEGACY_POLICY_WITHOUT_COVERAGE_DETAIL_HANDLED_HONESTLY
COVERAGE_READ_MODEL
NO_INTERNAL_DB_IDS_IN_PUBLIC_PROJECTION
NO_RAW_DOCUMENT_LEAK
ATOMICITY
AURA_FILES_MUTATED=NO
```

## Implementation safeguards

- Coverage is an owned child of canonical Policy, not a new Policy authority.
- Every version binds to exact `policy_versions` and `policy_evidence_versions` rows inside the same advisor scope.
- Direct authenticated table writes are revoked.
- History is append-only.
- Current-row changes require the governed command session marker.
- Product coverage links are optional taxonomy context and do not constitute Policy Evidence.
- Beneficiary data remains under restricted PolicyRole.
- Existing Policy-level amount fields are untouched.
- No legacy Policy receives fabricated child coverages.
- The safe read model distinguishes missing detail from confirmed absence.

## CI state

```text
TARGETED_CI=PENDING_PR_CHECKS
INHERITED_POLICY_CARTERA_REGRESSIONS=PENDING_PR_CHECKS
FINAL_ROBOCOP=PENDING_GREEN_CI
COVERAGE_MODEL_READY_FOR_AURA=PENDING_GREEN_CI
```

# FORGE CARTERA POLICY COVERAGE MODEL ACCEPTANCE 001

```text
PHASE=FORGE_CARTERA_POLICY_COVERAGE_MODEL_AUTHORITY_001
SOURCE_SHA=946c9f8781107514f4e09037034f6270c7d47939
BRANCH=feature/cartera-policy-coverage-model-authority-001
IMPLEMENTATION_ACCEPTANCE_SHA=2412440f5733ccb929bd2ce816a95cf92ede9261
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

## CI acceptance

GitHub Actions run `31237345250`, job `93052203619`:

```text
TARGETED_POLICY_COVERAGE_TESTS=22
TARGETED_PASS=22
TARGETED_FAIL=0
INHERITED_POLICY_CARTERA_TESTS=34
INHERITED_PASS=34
INHERITED_FAIL=0
```

The targeted suite proved:

```text
ONE_POLICY_MULTIPLE_COVERAGES=PASS
PER_COVERAGE_SUM_INSURED=PASS
PER_COVERAGE_PREMIUM=PASS
PER_COVERAGE_EFFECTIVE_DATE=PASS
PER_COVERAGE_PERIOD=PASS
PER_COVERAGE_PAYMENT_PERIOD=PASS
PER_COVERAGE_ANNEX=PASS
UNKNOWN_SUM_INSURED_NOT_ZERO=PASS
UNKNOWN_PREMIUM_NOT_ZERO=PASS
UNKNOWN_CURRENCY_NOT_DEFAULT=PASS
UNKNOWN_PERIOD_NOT_GUESSED=PASS
POLICY_LEVEL_FIELDS_NOT_SILENTLY_REDEFINED=PASS
POLICY_VERSION_BINDING=PASS
COVERAGE_HISTORY_PRESERVED=PASS
EVIDENCE_LINEAGE=PASS
CORRECTION_OR_SUPERSESSION=PASS
IDEMPOTENT_REPLAY=PASS
CHANGED_INPUT_CONFLICT=PASS
READ_AFTER_WRITE=PASS
RLS_OWNER_READ=PASS_REPOSITORY_CONTRACT
RLS_CROSS_ADVISOR_DENIED=PASS_REPOSITORY_CONTRACT
DIRECT_WRITE_DENIED=PASS_REPOSITORY_CONTRACT
BENEFICIARY_NOT_COVERAGE=PASS
BENEFICIARY_PRIVACY=PASS
NO_AUTOMATIC_POLICY_CONFIRMATION=PASS
NO_AUTOMATIC_COVERAGE_CONFIRMATION=PASS
NO_PARALLEL_POLICY_WRITER=PASS
NO_PARALLEL_PRODUCT_TRUTH=PASS
NO_DUPLICATE_EVIDENCE_AUTHORITY=PASS
LEGACY_POLICY_WITHOUT_COVERAGE_DETAIL_HANDLED_HONESTLY=PASS
COVERAGE_READ_MODEL=PASS
NO_INTERNAL_DB_IDS_IN_PUBLIC_PROJECTION=PASS
NO_RAW_DOCUMENT_LEAK=PASS
ATOMICITY=PASS
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

## Final repository acceptance

```text
FINAL_ROBOCOP=PASS
COVERAGE_MODEL_READY_FOR_AURA=YES
NEXT_AUTHORIZED_CANDIDATE=RERUN_FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_001
REMOTE_SUPABASE_MUTATION=NO
AURA_MUTATION=NO
MAIN_MUTATION=NO
MERGE=NO
DEPLOY=NO
```

Remote Supabase execution was intentionally not performed. RLS and tenant isolation are accepted in this phase at repository-contract level only; remote database acceptance belongs to a separately authorized deployment/migration stage.

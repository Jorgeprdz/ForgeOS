# ADVISOR COMPENSATION RULE PACK 001

Status: STAGE 020 CANDIDATE RULE GOVERNANCE COMPLETE

## Purpose

This document defines the Stage 020 Advisor Compensation Rule Pack boundary for direct advisor compensation.

It transforms the Stage 010 legacy inventory into a versioned, validated and snapshot-capable candidate rule pack without claiming that legacy runtime values are official carrier source truth.

## Scope

Included:

- Vida commission rules.
- GMM initial and renewal commission rules.
- Stable product identity mapping.
- Payment-frequency factors.
- Policy-point thresholds.
- Premium-weight factors.
- Candidate development factor.
- Training Allowance reconciliation reference.
- Nuevo Profesional candidate groups.
- GMM quarterly candidate groups.
- Rule-pack validation.
- Deterministic snapshot digest.
- Candidate rule resolution for simulation and later engine integration.

Excluded:

- Partner compensation.
- Manager compensation.
- Connection bonus.
- Development bonus for other advisors.
- Paid commission truth.
- Commission statement reconciliation.
- Cartera Payment Event consumption.
- Compensation event persistence.
- Productive Commissions UI connection.

## Stage 020 Governance Position

```text
RULE_PACK_ID=smnyl-advisor-compensation-2026-candidate
RULE_PACK_VERSION=0.1.0-candidate
GOVERNANCE_STATUS=candidate
RULE_PACK_HASH=candidate:not-sealed
SOURCE_STATE=LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH
CURRENCY=MXN
CANONICAL_READY=NO
SIMULATION_READY=YES
EARNED_TRUTH=NO
PAYOUT_TRUTH=NO
```

The candidate pack is usable for deterministic simulation, comparison and Stage 030/040 integration work.

It cannot be promoted to official compensation truth until:

1. official carrier commission evidence is attached;
2. effective dates are verified;
3. product identities and variants are reconciled;
4. every rate and bonus threshold is verified;
5. a sealed SHA-256 rule-pack hash is recorded;
6. governance status becomes `official`;
7. source state becomes `OFFICIAL_CARRIER_SOURCE_TRUTH`.

## 020A — Rule Pack Contract

Created:

```text
compensation/advisor/rules/advisor-compensation-rule-pack-contract.js
```

The contract locks:

- schema version;
- governance statuses;
- source states;
- supported lines of business;
- rule-resolution statuses;
- mandatory global safety rules;
- six canonical Vida policy-year bands;
- four canonical GMM age bands.

### Mandatory safety rules

```text
payoutTruth=false
calculatedCandidateIsPayoutTruth=false
earnedTruthRequiresConfirmedPaymentEvent=true
paidTruthRequiresCompensationStatement=true
unknownProductBehavior=BLOCKED
unknownVariantBehavior=BLOCKED
missingMaterialInputBehavior=BLOCKED
defaultCommissionRateAllowed=false
automaticPayoutConfirmationAllowed=false
productRecommendationByCommissionAllowed=false
```

## 020B — Product Identity Mapping

Created:

```text
compensation/advisor/rules/advisor-compensation-product-identity-registry.js
```

The registry contains 19 stable products:

```text
VIDA_INDIVIDUAL=16
GMM=3
TOTAL_PRODUCTS=19
```

Stable IDs:

```text
SMNYL_SEGUBECA
SMNYL_IMAGINA_SER
SMNYL_ORVI
SMNYL_ORVI_99
SMNYL_REALIZA
SMNYL_STAR_TEMPORAL
SMNYL_MIO
SMNYL_OBJETIVO_VIDA
SMNYL_NUEVO_PLENITUD
SMNYL_PLENITUD
SMNYL_VIDA_MUJER
SMNYL_NUEVO_VIDA_MUJER
SMNYL_STAR_DOTAL
SMNYL_LEGADO
SMNYL_RESPALDO_EDUCATIVO
SMNYL_RESPALDO_NEGOCIO
SMNYL_ALFA_MEDICAL
SMNYL_ALFA_MEDICAL_FLEX
SMNYL_ALFA_MEDICAL_INTERNACIONAL
```

Identity resolution:

- normalizes accents;
- normalizes punctuation and whitespace;
- resolves canonical IDs, display names and declared aliases;
- rejects ambiguous aliases;
- returns `UNKNOWN` for unrecognized products;
- never guesses a product;
- never assigns a default commission rate.

## 020C — Vida Commission Rules

The candidate pack contains:

```text
VIDA_PRODUCTS=16
VIDA_VARIANTS=27
POLICY_YEAR_BANDS=6
```

Canonical bands:

```text
YEAR_1
YEAR_2
YEAR_3
YEARS_4_5
YEARS_6_10
YEARS_11_PLUS
```

Every Vida product contains an explicit `DEFAULT` variant.

Important distinction:

- missing variant may select the explicitly declared `DEFAULT`;
- an explicitly supplied unknown variant is blocked;
- unknown product is blocked;
- no `10%` fallback survives in the governed resolver.

## 020D — GMM Commission Rules

The candidate pack contains:

```text
GMM_PRODUCTS=3
INITIAL_AGE_BANDS_PER_PRODUCT=4
RENEWAL_AGE_BANDS_PER_PRODUCT=4
```

Canonical bands:

```text
AGE_0_4
AGE_5_54
AGE_55_59
AGE_60_PLUS
```

The governed resolver requires contract age.

Missing age is blocked and does not default to 30.

Unknown GMM product is blocked and does not receive the legacy 15% fallback.

## 020E — Advisor Bonus Rules

### Training Allowance

Training Allowance is not duplicated as a new authority.

The Stage 020 pack references:

```text
compensation/advisor-development/rule-data/
smnyl-advisor-development-2026.rule-pack.json
```

with:

```text
RULE_MODE=REFERENCE_EXISTING_RULE_PACK
CONCEPT_REF=training-allowance
RECONCILIATION_STATUS=REQUIRED
LEGACY_TARGET_ROWS=12
PAYOUT_TRUTH=false
```

Stage 040 must reconcile the legacy candidate targets against the existing Advisor Development rule-pack authority.

### Nuevo Profesional

```text
GROUPS=16
MISSING_ELIGIBILITY_BEHAVIOR=BLOCKED
REQUIRED_INPUTS=LIMRA,IGC,WEIGHTED_PREMIUM_SEMESTER
PAYOUT_TRUTH=false
```

The previous silent LIMRA and IGC defaults are not authorized by the Stage 020 contract.

### GMM quarterly bonus

```text
GROUPS=7
POLICY_UNIT_PER_INITIAL_GMM_POLICY=0.5
PAYOUT_TRUTH=false
```

The half-policy unit behavior is preserved as a candidate rule, not endorsed as official truth.

### Explicit exclusions

```text
CONNECTION_BONUS=EXCLUDED
DEVELOPMENT_BONUS=EXCLUDED
PARTNER_COMPENSATION=EXCLUDED
MANAGER_COMPENSATION=EXCLUDED
```

## 020F — Rule Pack Validation

Created:

```text
compensation/advisor/rules/advisor-compensation-rule-pack-validator.js
```

The validator checks:

- schema version;
- required metadata;
- effective windows;
- governance status;
- source evidence references;
- candidate-versus-official source state;
- sealed hash requirement for official packs;
- mandatory safety rules;
- product identity uniqueness;
- alias conflicts;
- product/rule lineage;
- line-of-business consistency;
- duplicate or overlapping product rules;
- Vida variants and six rate bands;
- GMM initial/renewal age bands;
- rates between 0 and 1;
- payment-frequency factors;
- premium-weight count and values;
- development factor;
- Training Allowance authority reference;
- 16 Nuevo Profesional groups;
- 7 GMM groups;
- excluded bonus scopes.

Validation result for the Stage 020 pack:

```text
VALIDATION_ERRORS=0
VALIDATION_WARNINGS=2
IS_VALID=YES
CANDIDATE_USABLE_FOR_SIMULATION=YES
CANONICAL_READY=NO
```

Warnings are intentional:

```text
candidate_rule_pack_not_official
training_allowance_reconciliation_required
```

## 020G — Rule Snapshot

Created:

```text
compensation/advisor/rules/advisor-compensation-rule-snapshot.js
```

The snapshot:

- deep-clones the rule pack;
- canonicalizes object-key order;
- calculates a deterministic SHA-256 digest;
- preserves declared rule-pack identity and evidence;
- freezes the snapshot and nested rule pack;
- exposes candidate/official status;
- keeps payout truth false;
- authorizes no mutation.

Snapshot fields:

```text
snapshotVersion
rulePackId
rulePackVersion
governanceStatus
sourceState
effectiveFrom
effectiveTo
sourceEvidenceRefs
calculatedDigest
declaredRulePackHash
capturedAt
officialSourceTruth
candidateOnly
payoutTruth
mutationAuthorized
rulePack
```

## Migration Builder, Loader and Rule Resolver

Created:

```text
compensation/advisor/rules/advisor-compensation-candidate-rule-pack-builder.js
compensation/advisor/rules/advisor-compensation-rule-pack-loader.js
compensation/advisor/rules/advisor-compensation-rule-resolver.js
```

The builder consumes the frozen Stage 010 legacy candidate tables and produces the full governed in-memory Rule Pack. This prevents a second silent copy of the rates and preserves a direct migration trace.

The loader provides typed errors for:

```text
ADVISOR_COMPENSATION_RULE_PACK_NOT_FOUND
ADVISOR_COMPENSATION_RULE_PACK_INVALID_JSON
```

The resolver returns:

```text
READY_CANDIDATE
READY_OFFICIAL
BLOCKED
UNKNOWN
CONFLICTING
OUT_OF_EFFECTIVE_PERIOD
```

Candidate resolution never creates earned or paid truth.

## Candidate Rule Data

Created:

```text
compensation/advisor/rules/rule-data/
smnyl-advisor-compensation-2026.candidate.rule-pack.json
```

Inventory:

```text
PRODUCT_IDENTITIES=19
COMMISSION_RULES=19
VIDA_PRODUCTS=16
VIDA_VARIANTS=27
GMM_PRODUCTS=3
TRAINING_TARGETS=12
NEW_PROFESSIONAL_GROUPS=16
GMM_BONUS_GROUPS=7
```

## Validation

Command:

```bash
node compensation/advisor/tests/advisor-compensation-stage-020-master-test.js
```

Result:

```text
MASTER_TEST_TOTAL=54
MASTER_TEST_PASS=54
MASTER_TEST_FAIL=0
```

## Stage 020 Gate

```text
RULE_PACK_CONTRACT=PASS
PRODUCT_IDENTITY_MAPPING=PASS
LIFE_RULES_MIGRATED=PASS
GMM_RULES_MIGRATED=PASS
ADVISOR_BONUS_RULES_MIGRATED=PASS
RULE_PACK_VALIDATION=PASS
RULE_SNAPSHOT=PASS
NO_DEFAULT_RATE=PASS
UNKNOWN_PRODUCT_BLOCKING=PASS
MISSING_MATERIAL_INPUT_BLOCKING=PASS
TRAINING_ALLOWANCE_RECONCILIATION_REQUIRED=YES
OFFICIAL_SOURCE_TRUTH=NO
CANONICAL_READY=NO
STAGE_020_COMPLETE=YES
```

## Next

```text
NEXT=ADVISOR_COMPENSATION_030_CONFIRMED_PAYMENT_EVENT_CONNECTION
```

# FORGE ADVISOR COMPENSATION STAGE 040 CLOSURE 001

Status: COMPLETE ON CONTROLLED STACKED BRANCH

## Phase

```text
PHASE=ADVISOR_COMPENSATION_040_ADVISOR_COMMISSION_ENGINE
MODE=ONE_PASS
DEPENDENCY=ADVISOR_COMPENSATION_030_CONFIRMED_PAYMENT_EVENT_CONNECTION
```

## Scope Delivered

- Added deterministic calculation digest utility.
- Added Advisor Commission calculation contract and validator.
- Added confirmed-payment basis resolver.
- Added Life initial commission calculation.
- Added Life renewal commission calculation.
- Added GMM initial commission calculation.
- Added GMM renewal commission calculation.
- Added partial, matched and excess payment classification.
- Added accumulated confirmed-payment calculation.
- Added development-factor application with explicit advisor month.
- Added policy points and weighted-premium output.
- Reconciled Training Allowance to one existing authority.
- Added Nuevo Profesional candidate calculation.
- Added GMM quarterly candidate calculation.
- Added explanation payload and stable SHA-256 calculation digest.
- Added 63-scenario master test.

## Changed Files

```text
compensation/advisor/engine/advisor-compensation-calculation-digest.js
compensation/advisor/engine/advisor-commission-calculation-contract.js
compensation/advisor/engine/advisor-commission-basis-resolver.js
compensation/advisor/engine/advisor-commission-engine.js
compensation/advisor/engine/advisor-direct-bonus-engine.js
compensation/advisor/tests/advisor-compensation-stage-040-master-test.js
docs/05-truth/ADVISOR_COMPENSATION_COMMISSION_ENGINE_001.md
docs/evidence/FORGE_ADVISOR_COMPENSATION_STAGE_040_CLOSURE_001.md
```

## Calculation Formula

```text
currentCommission = currentConfirmedPaidPremium × baseRate × developmentFactor
accumulatedCommission = accumulatedConfirmedPaidPremium × baseRate × developmentFactor
```

The cash basis is always the Stage 030 confirmed payment event.

```text
BASIS_AUTHORITY=CONFIRMED_PAYMENT_EVENT
ISSUED_PREMIUM_USED_AS_PAID_PREMIUM=NO
ANNUAL_PREMIUM_USED_AS_CASH_TRUTH=NO
```

Annual premium and frequency are used only to calculate the expected scheduled receipt and classify:

```text
MATCHED_SCHEDULED_RECEIPT
PARTIAL_PAYMENT
EXCESS_PAYMENT
```

## Commission Types

```text
LIFE_INITIAL
LIFE_RENEWAL
GMM_INITIAL
GMM_RENEWAL
```

Policy year determines initial-versus-renewal state. Conflicting external renewal flags are blocked.

## Training Allowance Authority

```text
SELECTED_AUTHORITY=ADVISOR_DEVELOPMENT_RULE_PACK
DUPLICATE_LEGACY_INTERPRETATION_RETIRED=YES
ADVISOR_COMPENSATION_LEGACY_TARGETS_USED_FOR_CALCULATION=NO
```

## Direct Advisor Bonus Candidates

```text
TRAINING_ALLOWANCE=IMPLEMENTED
NEW_PROFESSIONAL_BONUS=IMPLEMENTED
GMM_QUARTERLY_BONUS=IMPLEMENTED
```

All bonus outputs remain `ESTIMATED`. Missing inputs remain blocked and are not converted to zero.

## Validation

Commands:

```bash
node --check compensation/advisor/engine/advisor-compensation-calculation-digest.js
node --check compensation/advisor/engine/advisor-commission-calculation-contract.js
node --check compensation/advisor/engine/advisor-commission-basis-resolver.js
node --check compensation/advisor/engine/advisor-commission-engine.js
node --check compensation/advisor/engine/advisor-direct-bonus-engine.js
node --check compensation/advisor/tests/advisor-compensation-stage-040-master-test.js
node compensation/advisor/tests/advisor-compensation-stage-040-master-test.js
```

Authoring-environment result:

```text
SYNTAX_CHECK=PASS
MASTER_TEST_TOTAL=63
MASTER_TEST_PASS=63
MASTER_TEST_FAIL=0
STAGE_040_COMPLETE=YES
```

Coverage includes:

- stable digest ordering;
- digest sensitivity;
- payment-frequency normalization;
- scheduled receipt basis;
- partial payment;
- excess payment;
- invalid payment and annual premium;
- unsupported frequency;
- accumulated payment validation;
- Life initial and renewal;
- GMM initial and renewal;
- development factor;
- personal-policy production exclusion;
- policy points;
- weighted premium;
- payment-event readiness;
- advisor attribution;
- policy year;
- renewal conflicts;
- rule-resolution blocking;
- candidate and official rule eligibility;
- deterministic result digest;
- deep immutability;
- explanation output;
- Training Allowance authority selection;
- Training Allowance qualification and prior advances;
- Nuevo Profesional input and tier rules;
- GMM quarterly qualification;
- no payout truth;
- no input mutation.

## Defect Found and Corrected During Validation

JavaScript converts `null` to numeric zero through `Number(null)`.

The first bonus-input guard used numeric conversion alone, which could make missing LIMRA, IGC or GMM production appear as valid zero.

The guard was corrected to reject:

```text
null
undefined
empty string
non-finite numeric conversion
```

Final result:

```text
MISSING_BONUS_INPUT_IS_ZERO=NO
MISSING_BONUS_INPUT_IS_BLOCKED=YES
```

## Truth Boundaries

The current Stage 020 Rule Pack is candidate-only.

```text
COMMISSION_TRUTH_STATE=ESTIMATED
DIRECT_BONUS_TRUTH_STATE=ESTIMATED
CANDIDATE_RULE_ELIGIBLE_FOR_EARNED_PROMOTION=NO
OFFICIAL_RULE_MAY_BE_ELIGIBLE_FOR_STAGE_050=YES
```

Stage 040 does not create earned truth even when the applicable rule is official. It only marks the calculation as eligible for the Stage 050 promotion gate.

## Mutation Boundaries

```text
PAYMENT_EVENT_MUTATION=NO
RULE_PACK_MUTATION=NO
POLICY_TRUTH_MUTATION=NO
CARTERA_MUTATION=NO
SUPABASE_MUTATION=NO
INDEXEDDB_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
UI_MUTATION=NO
COMPENSATION_EVENT_WRITE=NO
EARNED_PROMOTION=NO
PAYOUT_TRUTH=NO
AUTOMATIC_PAYOUT_CONFIRMATION=NO
PRODUCT_RECOMMENDATION_BY_COMMISSION=NO
```

## Stage Result

```text
INITIAL_COMMISSION_ENGINE=PASS
RENEWAL_COMMISSION_ENGINE=PASS
GMM_ENGINE=PASS
TRAINING_ALLOWANCE_RECONCILIATION=PASS
DIRECT_ADVISOR_BONUSES=PASS
EXPLANATION_ENGINE=PASS
CALCULATION_DIGEST=PASS
STAGE_040_COMPLETE=YES
MERGE=NOT_AUTHORIZED
NEXT=ADVISOR_COMPENSATION_050_COMPENSATION_EVENT_AUTHORITY
```

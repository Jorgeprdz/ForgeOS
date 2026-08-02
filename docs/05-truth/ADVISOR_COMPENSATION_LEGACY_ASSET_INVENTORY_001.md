# ADVISOR COMPENSATION LEGACY ASSET INVENTORY 001

Status: STAGE 010 INVENTORY / EXTRACTION COMPLETE

## Purpose

This document records the reusable, rewritable and retiring assets found in the legacy Advisor Compensation runtime before any productive payment-event connection or official commission rule-pack implementation.

Source inspected:

```text
comisiones.js — FULL SAFE RECOVERY BUILD v16 (RLS Safe)
```

This inventory is descriptive. It does not promote legacy tables, defaults or calculations into official compensation truth.

## Constitutional Boundaries

- Only direct `ADVISOR_COMPENSATION` is in scope.
- Partner, Manager and Advisor Development compensation remain excluded.
- Legacy output is `ESTIMATED` candidate context only.
- Candidate calculation is not earned truth.
- Candidate calculation is not payout truth.
- Paid premium is not paid commission.
- Issued premium is not paid premium.
- Unknown is not zero.
- No default rate may become canonical.
- No product recommendation may be driven by commission.
- Stage 010 creates no remote mutation, ledger entry, payment event, commission event or UI connection.

## Inventory Result

```text
INVENTORY_VERSION=ADVISOR_COMPENSATION_LEGACY_ASSET_INVENTORY_001
TOTAL_ASSETS=25
REUSE_AS_IS=1
REUSE_AFTER_VALIDATION=12
REWRITE=4
RETIRE=8
INVENTORY_ERRORS=0
OFFICIAL_RULE_AUTHORITY_CREATED=NO
RUNTIME_CONNECTION_CHANGED=NO
```

## 010A — Legacy Calculator Inventory

### Candidate rate and target data

- Vida product/variant/policy-year rate arrays.
- GMM initial and renewal age-band rate arrays.
- Training Allowance targets by contest month.
- Nuevo Profesional weighted-premium groups.
- Nuevo Profesional LIMRA percentage bands.
- GMM quarterly policy/premium groups.
- Product premium-weight factors.
- Payment-frequency factors.
- Policy point thresholds.

### Candidate calculation behavior

- Policy year inferred from emission date and wall-clock date.
- Development factor of `0.90` during the first 12 contest months.
- Monthly initial and renewal estimates.
- Semester initial commission, points and weighted premium.
- Quarterly GMM premium and half-policy units.
- Previous-month summary.
- Year-to-date summary.
- Six-month chart buckets.
- Training Allowance candidate.
- Nuevo Profesional bonus candidate.
- GMM bonus candidate.
- Manually nested `renovacionesPagadas` processing.

### Runtime and presentation assets

- Existing Commissions screen shell.
- Six-month chart presentation shape.
- Quick simulator UI.
- Profile form stored in generic `crm_data`.
- Portfolio read from quarantined IndexedDB.
- DOM, persistence, navigation and calculation mixed in one module.

## 010B — Reuse Classification

### REUSE_AS_IS

| Asset | Reason |
|---|---|
| Six-month chart shape | Presentation structure can remain when fed by canonical monthly snapshots. |

### REUSE_AFTER_VALIDATION

| Asset | Required validation |
|---|---|
| Vida rate tables | Official source, product identity, effective dates and policy-year semantics. |
| GMM rate tables | Official source, product identity, age bands, initial/renewal semantics and effective dates. |
| Training targets | Reconciliation with the modern Training Allowance authority. |
| NP groups and percentages | Eligibility, period and official source evidence. |
| GMM bonus groups | Policy-unit meaning, period, premium basis and official source evidence. |
| Payment-frequency factor | Commission basis and receipt semantics. |
| Points formula | Product identity, thresholds and effective period. |
| Weighted-premium formula | Product identity, factors and effective period. |
| Commissions screen shell | Canonical source replacement and explicit truth-state labels. |
| Quick simulator | Hard simulation boundary and governed rule snapshot. |
| Development factor | Official career-stage rule and period semantics. |

### REWRITE

| Asset | Replacement direction |
|---|---|
| Policy year from wall clock | Derive the covered policy period from policy and payment evidence. |
| Generic advisor profile storage | Typed, protected, period-aware career and eligibility snapshot. |
| Mixed DOM/data/calculation module | Pure calculation modules with UI as consumer. |
| YTD/semester aggregation | Append-only compensation events and canonical period snapshots. |

### RETIRE

| Asset | Reason |
|---|---|
| Emission month as economic period | Issuance timing is not paid-premium or earned-commission truth. |
| Manual `renovacionesPagadas` authority | Replace with confirmed canonical Payment Events. |
| IndexedDB portfolio authority | Quarantined local data cannot own compensation truth. |
| Unknown Vida default rate `0.10` | Unknown product must be blocked/unknown. |
| Unknown GMM default rate `0.15` | Unknown product must be blocked/unknown. |
| Missing GMM age default `30` | Material rule evidence cannot be silently invented. |
| Missing LIMRA default `75.5` | Missing eligibility evidence is not a default performance value. |
| Missing IGC default `91` | Missing eligibility evidence is not a default conservation value. |

## Material Reconciliation Findings

These findings are characterized, not corrected in Stage 010:

1. Monthly commission uses receipt premium after the payment-frequency factor, while YTD uses annual premium multiplied by rate.
2. Emission date determines monthly, semester, quarter and history placement for the main portfolio pass.
3. Manual renewal arrays are processed independently from the main portfolio pass.
4. Each qualifying initial GMM policy contributes `0.5` policy units to the quarterly bonus calculation.
5. Unknown Vida products silently receive `10%` in the legacy runtime.
6. Unknown GMM products silently receive `15%` in the legacy helper.
7. Missing GMM contract age silently becomes `30`.
8. Missing LIMRA and IGC silently become `75.5` and `91` outside the first 12 contest months.
9. Training Allowance, NP and GMM bonus values are calculation candidates, not evidence of payout.

None of these behaviors may become canonical without Stage 020 rule governance.

## 010C — Pure Candidate Extraction

Created:

```text
compensation/advisor/legacy/
├── advisor-compensation-legacy-asset-inventory.js
├── advisor-compensation-legacy-candidate-rules.js
└── advisor-compensation-legacy-candidate-engine.js
```

The extracted candidate engine:

- accepts `portfolio`, `profile` and injected `asOf`;
- has no DOM dependency;
- has no Supabase dependency;
- has no IndexedDB dependency;
- has no navigation dependency;
- has no toast or confirmation dependency;
- does not mutate inputs;
- exposes assumptions and warnings;
- labels its rule authority `CANDIDATE_LEGACY_RUNTIME`;
- labels its result `ESTIMATED`;
- keeps `earnedTruth=false`;
- keeps `payoutTruth=false`;
- keeps `mutationAuthorized=false`.

The existing `comisiones.js` runtime is intentionally unchanged in Stage 010. Productive runtime connection belongs to later stages after governed rules and payment-event inputs exist.

## 010D — Characterization Tests

Command:

```bash
node compensation/advisor/tests/advisor-compensation-stage-010-master-test.js
```

Result:

```text
MASTER_TEST_TOTAL=32
MASTER_TEST_PASS=32
MASTER_TEST_FAIL=0
```

Coverage includes inventory completeness, pure-module boundaries, rates, variants, age bands, payment factors, policy-year determinism, points, weighted premium, monthly and historical summaries, Training Allowance, NP/GMM candidate bonuses, unsafe legacy defaults, deterministic fixed-date execution, input immutability and explicit non-earned/non-paid truth metadata.

## Stage 010 Gate

```text
LEGACY_INVENTORY=PASS
REUSE_CLASSIFICATION=PASS
PURE_CANDIDATE_ENGINE_EXTRACTED=PASS
CHARACTERIZATION_TESTS=PASS
INDEXEDDB_REMOVAL_READY=YES
LEGACY_RUNTIME_MUTATION=NO
OFFICIAL_RULE_PACK_CREATED=NO
PAYMENT_EVENT_CONNECTION=NO
STAGE_010_COMPLETE=YES
```

## Next Stage

```text
NEXT=ADVISOR_COMPENSATION_020_ADVISOR_COMPENSATION_RULE_PACK
```
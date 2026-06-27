# Partner Compensation Bonus Coverage 001

Status: PARTNER-COMP-BONUS-COVERAGE-001B/C LOCK

Date: 2026-06-27

Scope:

- Documentation/test-only PCV 2026 Partner bonus coverage lock.
- No calculators, orchestrators, rule-data, fixtures, runtime, UI, schemas, payout truth semantics or ownership source truth gates changed.
- This document records repo-real implementation status from `PARTNER-COMP-BONUS-COVERAGE-001A`.

## Critical Boundaries

- `candidateAmount` is not `payoutTruth`.
- `payoutTruth=true` requires official confirmed evidence and statement/account line match.
- Unknown is not zero.
- Semantic amount is not full `candidateAmount`.
- Raw activity logs are insufficient without paid-applied evidence.
- Ownership source truth gate remains protected.

## PCV 2026 Official Concepts

1. Bono de Transicion
2. Bono de Productividad Base
3. Multiplicador de Productividad
4. Bono Adicional Anual de Productividad
5. Bono de Produccion
6. Bono de Actividad
7. Bono de Alta Partner
8. Bono de Conexion
9. Bono de Desarrollo
10. Apoyos

## Repo-Real Coverage Matrix

| PCV Concept | Rule-data concept | Repo-real status | Candidate amount now | Payout truth now | Gap |
| --- | --- | --- | --- | --- | --- |
| Bono de Transicion | `transition-bonus` | IMPLEMENTED_CANDIDATE | Yes | BLOCKED_BY_OFFICIAL_EVIDENCE | Official statement/account ingestion and production payout operations. |
| Bono de Productividad Base | `productivity-base` | IMPLEMENTED_CANDIDATE | Yes | BLOCKED_BY_OFFICIAL_EVIDENCE | Official statement ingestion and statement line match. |
| Multiplicador de Productividad | `productivity-multiplier` | IMPLEMENTED_CANDIDATE | Yes, when evidence is not blocked | BLOCKED_BY_OFFICIAL_EVIDENCE | Official statement ingestion and longitudinal qualified-advisor/training evidence hardening. |
| Bono Adicional Anual de Productividad | `productivity-annual-additional-bonus` | PARTIAL | No repo-real calculator today | BLOCKED_BY_OFFICIAL_EVIDENCE | Annual additional productivity bonus calculator/orchestrator/test coverage. |
| Bono de Produccion | `production-bonus` | IMPLEMENTED_CANDIDATE | Yes | BLOCKED_BY_OFFICIAL_EVIDENCE | Official economic output source adapter and statement line match. |
| Bono de Actividad | `activity-bonus` | IMPLEMENTED_CANDIDATE | Yes | BLOCKED_BY_OFFICIAL_EVIDENCE | Paid-applied policy/economic source adapter and statement line match. |
| Bono de Alta Partner | `partner-promotion-bonus` | PARTIAL | No full candidate; semantic schedule only | BLOCKED_BY_OFFICIAL_EVIDENCE | Alta Partner promotion monthly schedule/support-gate calculator/orchestrator/test coverage. |
| Bono de Conexion | `connection-bonus` | IMPLEMENTED_CANDIDATE | Yes, when monthly evidence and ownership pass | BLOCKED_BY_OFFICIAL_EVIDENCE | Official statement ingestion and registry/full-calc caution reconciliation. |
| Bono de Desarrollo | `development-bonus` | IMPLEMENTED_CANDIDATE | Yes, when monthly evidence and ownership pass | BLOCKED_BY_OFFICIAL_EVIDENCE | Official statement ingestion and month-12/additional evidence hardening. |
| Apoyos | `fixed-support` | PARTIAL | Yes with structured support evidence, but still caution/partial | BLOCKED_BY_OFFICIAL_EVIDENCE | Support table / proportional payment / recovery reconciliation. |

## Implemented Candidate Concepts

- Bono de Transicion
- Bono de Productividad Base
- Multiplicador de Productividad
- Bono de Produccion
- Bono de Actividad
- Bono de Conexion
- Bono de Desarrollo

These concepts can calculate candidate amounts with structured evidence and `payoutTruth=false`.

## Partial Concepts

- Bono Adicional Anual de Productividad
- Bono de Alta Partner
- Apoyos

These concepts are represented in rule-data, but repo-real implementation remains partial because at least one calculator, orchestrator, regression test, support table reconciliation, longitudinal evidence path or full candidate boundary is missing.

## Missing Concepts

No PCV 2026 Partner concept is completely absent from official rule-data.

## Candidate Completeness Gaps

1. Transition candidate calculator/orchestrator/test coverage.
2. Annual additional productivity bonus calculator/orchestrator/test coverage.
3. Alta Partner promotion monthly schedule/support-gate calculator/orchestrator/test coverage.
4. Apoyos support table / proportional payment / recovery reconciliation.
5. Official statement/account ingestion after candidate completeness.

## Payout Truth Lock

All PCV Partner bonuses remain blocked for `payoutTruth=true` until Forge has official statement/account ingestion, official confirmed evidence and statement/account line match.

Candidate calculations, semantic amounts, OCR/PDF/AI extraction, high confidence matching, raw activity logs and manually entered projections do not establish payout truth.

## Partner Compensation Closure Correction — Status Truth

Partner Compensation overall is **PARTIAL / ACTIVE WORKSTREAM**.

The **Partner Compensation Candidate Foundation Subset** is **IMPLEMENTED_CANDIDATE / SUBSET STABILIZED**.

Full candidate completeness is **NOT CLOSED**.

Implemented candidate concepts:
- Productividad Base
- Multiplicador de Productividad
- Bono de Produccion
- Bono de Actividad
- Bono de Conexion
- Bono de Desarrollo

Partial candidate concepts / active gaps:
- Bono de Transicion
- Bono Adicional Anual de Productividad
- Bono de Alta Partner
- Apoyos

Boundary:
- `candidateAmount` is not `payoutTruth`.
- `payoutTruth=true` remains `BLOCKED_BY_OFFICIAL_EVIDENCE` for all PCV concepts until official statement/account ingestion and statement line match exist.
- Unknown is not zero.
- Ownership source truth remains protected.

## Transition Coverage Update — 002B/C-5C

Bono de Transicion is now **IMPLEMENTED_CANDIDATE** for candidateAmount coverage.

Coverage count update:

- implemented_candidate: 7
- partial: 3
- missing: 0
- blocked_for_payoutTruth: 10

Transition candidate coverage is based on:

- advisor-to-promoted/new-partner lineage
- formerAdvisorCompensationKey / directKey / assignedPortfolio matching
- initial commission ledger lines
- renewal commission ledger lines
- paid premium / paid-applied commission evidence
- no-administration evidence
- no-client-intervention evidence
- months 1-6 transition window
- standalone monthly transition orchestrator
- `payoutTruth=false`

Still not implemented:

- `payoutTruth=true`
- official statement/account ingestion
- production payout operations

# Alfa Medical Shared Rule Library Candidates

Status: ARCHITECTURE DISCOVERY

No shared library is approved. This document only identifies which concepts may
eventually belong to generic GMM and which must remain Alfa Medical specific.

## Purpose

Prepare future GMM shared-rule thinking without flattening Alfa Medical into a
generic product.

## Alfa Medical Specific Rules

These should remain Alfa Medical product-specific unless later source review
proves broader applicability.

- Alfa Medical hospital levels: Practico, Integro, Pleno.
- Alfa Medical deductible vocabulary and variants.
- Alfa Medical coinsurance and cap behavior.
- Alfa Medical hospital-level adjustment table.
- Alfa Medical medication coinsurance path.
- Alfa Medical maternity year 1-3 and year 4+ behavior.
- Alfa Medical reproduction-assisted maternity conditions.
- Alfa Medical fetal surgery conditions.
- Alfa Medical gene therapy/orphan drug financial rule.
- Alfa Medical basic and optional benefit list.
- Alfa Medical assistance services.
- Alfa Medical optional foreign coverage structure.
- Alfa Medical Dental Basic table.
- Alfa Medical named waiting-period list.
- Alfa Medical declared-preexistence excluded categories.

## Generic GMM Candidate Concepts

These may be candidates for a future shared GMM rule library if validated across
products.

### Product Identity

Candidate:

- Exact product must be known before evaluation.

Why shared:

All product families need routing before rules.

Boundary:

Routing is shared; product-specific interpretation is not.

### Policy Active Status

Candidate:

- Coverage requires an active contract.

Why shared:

General insurance principle.

Boundary:

Grace periods, reinstatement and period al descubierto may be product/version
specific.

### Caratula Dependency

Candidate:

- Case-specific evaluation depends on caratula values.

Why shared:

Policy-specific facts live in the caratula.

Boundary:

The fields and meanings differ by product.

### Medical Necessity

Candidate:

- Covered expenses must be medically necessary and tied to covered event.

Why shared:

Common GMM concept.

Boundary:

Specific documentation and benefit rules vary.

### Exclusion Screen

Candidate:

- Coverage evaluation requires general and particular exclusion review.

Why shared:

Exclusions always shape product truth.

Boundary:

Actual exclusions remain product/version specific.

### Waiting Period Screen

Candidate:

- Waiting periods must be evaluated against event dates and coverage
  continuity.

Why shared:

Common health-insurance concept.

Boundary:

Durations and condition lists are product-specific.

### Preexistence Screen

Candidate:

- Prior diagnosis, symptoms, records or expenses can affect coverage.

Why shared:

Common GMM risk.

Boundary:

Declared-preexistence treatment and excluded categories are product-specific.

### Territory Screen

Candidate:

- Territory and foreign benefits must be checked before foreign-care
  assessment.

Why shared:

GMM products commonly distinguish national and foreign care.

Boundary:

Specific optional benefits and financial terms are product-specific.

### Authorization Screen

Candidate:

- Certain treatments require authorization, programming, second valuation or
  provider certification.

Why shared:

High-cost/specialty treatments often need controls.

Boundary:

Which treatments and exact requirements are product-specific.

### Documentation Requirement

Candidate:

- Coverage assessment requires evidence, not client statement alone.

Why shared:

Forge constitutional direction favors evidence before judgment.

Boundary:

Document types and thresholds vary.

### Human Review Gates

Candidate:

- Ambiguous preexistence, conflicting dates, source conflicts, foreign care and
  high-specialty treatment require human review.

Why shared:

Protects against false coverage certainty.

Boundary:

Gate triggers may be product-specific.

### Financial Participation Boundary

Candidate:

- Coverage eligibility and client financial responsibility are separate
  questions.

Why shared:

Many products have cost-sharing mechanics.

Boundary:

Alfa Medical uses deductible/coinsurance/cap; Flex uses different mechanics.

## Not Shared Yet

Do not promote these to shared GMM without further product review:

- Specific Alfa Medical waiting-period disease list.
- Specific maternity age ranges and continuity rules.
- Specific foreign coverage financial percentages or caps.
- Specific hospital-level adjustment table.
- Specific high-specialty treatment benefit limits.
- Specific exclusions for declared preexistence.
- Specific assistance benefits.
- Specific dental benefit event counts.

## Shared Library Risk

The main risk is abstraction too early.

If Forge creates shared GMM rules before comparing Alfa Medical, Alfa Medical
Flex and other products, it may accidentally:

- Apply deductible logic to Flex.
- Apply hospital levels globally.
- Treat optional benefits as universal.
- Flatten product-specific waiting periods.
- Produce unsafe coverage explanations.

## Architecture Recommendation

Future shared GMM library should contain:

- Evaluation stages.
- Evidence categories.
- Source hierarchy.
- Human review gates.
- Output language boundaries.

It should not contain:

- Product-specific amounts.
- Product-specific percentages.
- Product-specific benefit lists.
- Product-specific hospital levels.
- Product-specific waiting-period diseases.

## Verdict

Shared rule library is a candidate only for evaluation structure, not for Alfa
Medical product truth.

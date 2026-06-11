# Forge GMM Source Authority Hierarchy

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

## Purpose

Define source precedence when multiple GMM sources mention the same rule.

## Default Authority Hierarchy

For a specific policy and insured:

```text
1. Policy Caratula
2. Endorsement / Additional Clause / Special Condition
3. Optional Coverage Document listed in the policy
4. Active Condiciones Generales for that product/version
5. Official operational catalogs/directories active for the relevant date
6. Regulatory or compliance bulletin that modifies interpretation
7. Official product manual
8. Internal training material
9. Sales guide / commercial material
10. Advisor/client statement
11. Unconfirmed extraction
```

## Why Caratula Ranks Highest

The caratula identifies the policy-specific facts:

- Product.
- Insureds.
- Territory.
- Sum insured.
- Deductible.
- Coinsurance.
- Cap.
- Hospital level.
- Optional coverages.
- Recognized antiquity, when present.

It does not rewrite the entire product, but it determines which product rules
and optional rules apply to that policy.

## Why Endorsement Ranks Above Conditions

An endorsement or special clause can modify the general policy terms for a
specific policy.

If it is valid and applicable, it may narrow, expand or alter the general
conditions.

## Why Conditions Rank Above Manuals

Condiciones Generales are the legal/product rule base. Manuals can explain or
operationalize, but should not override conditions unless backed by an
authoritative modification.

## Why Operational Catalogs Have Date-Specific Authority

Hospital directories, pharmacy lists and catalogs may change over time.

They are authoritative for operational facts at the relevant date, but they do
not define the product's full legal coverage.

## Conflict Resolution Rules

### Rule 1: Policy-Specific Beats Generic

If caratula or endorsement specifies a policy value, that value controls the
case-specific evaluation.

### Rule 2: Product Legal Beats Educational

If Condiciones Generales conflict with sales material, conditions control.

### Rule 3: Active Version Beats Historical Version

If two sources are same authority level, the active version for the event date
controls.

### Rule 4: Specific Benefit Beats General Statement

A particular exclusion or specific benefit clause controls over a broad general
description.

### Rule 5: Operational Catalog Controls Operational Lookup

For provider, hospital, pharmacy or tabulator classification, use the active
official catalog/directory for the relevant date.

### Rule 6: Conflict Without Source Hierarchy Requires Human Review

If hierarchy cannot be established or the documents appear contradictory,
Forge must not produce certainty.

## Source Confidence Outcomes

- High: policy-specific source and active conditions align.
- Medium: conditions support rule but caratula or operational source missing.
- Low: only manual/training/sales source exists.
- Human Review Required: sources conflict or hierarchy cannot be determined.

## Prohibited Authority Uses

Forge must not:

- Use sales material to create coverage.
- Use old manual to override current conditions.
- Use a generic GMM explanation to override product-specific wording.
- Use client memory to override caratula.
- Use OCR extraction as final truth without confirmation.

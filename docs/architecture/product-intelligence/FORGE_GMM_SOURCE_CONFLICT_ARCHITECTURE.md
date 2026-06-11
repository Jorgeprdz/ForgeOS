# Forge GMM Source Conflict Architecture

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

## Purpose

Define how Forge handles conflicting GMM sources.

## Conflict Types

### Vertical Authority Conflict

Different authority levels conflict.

Example:

- Sales guide says X.
- Condiciones Generales say Y.

Resolution:

- Higher authority source controls.
- Lower source marked educational/reference only.

### Policy-Specific Conflict

Policy-specific document conflicts with generic product source.

Example:

- Caratula says optional coverage is included.
- Manual implies it is not included by default.

Resolution:

- Caratula/endorsement controls policy-specific applicability.
- Conditions still control benefit mechanics.

### Version Conflict

Same source type, different versions.

Example:

- Manual 2025 says X.
- Conditions 2026 say Y.

Resolution:

- Active version for policy/event date controls.
- If source types differ, apply authority hierarchy.

### Operational Catalog Conflict

Operational lookup differs by catalog/date.

Example:

- Hospital directory January classifies hospital as Integro.
- Hospital directory June classifies hospital as Pleno.

Resolution:

- Use catalog active on relevant service date, unless policy-specific protection
  or legal clause modifies.

### Product Contamination Conflict

Rule from one product appears applied to another.

Example:

- Alfa Medical Flex copay rule applied to Alfa Medical.

Resolution:

- Block evaluation.
- Correct product route.
- Human review if product evidence conflicts.

### Ambiguous Wording Conflict

Two clauses appear to overlap or contradict.

Resolution:

- Human Review Required.
- Forge may explain uncertainty but must not choose certainty.

## Conflict Severity

### Low

Non-authoritative educational source conflicts with authoritative source.

Action:

- Use authoritative source.
- Mark educational source as lower priority.

### Medium

Operational catalog mismatch or missing current catalog.

Action:

- Conditional assessment only.
- Block financial certainty.

### High

Caratula, endorsement and conditions appear inconsistent.

Action:

- Human Review Required.
- No likely covered/not covered.

### Critical

Wrong product source used or source belongs to another product.

Action:

- Hard stop.
- Product routing correction required.

## Human Review Required When

- Authority hierarchy cannot resolve conflict.
- Policy-specific and product-general sources conflict materially.
- Effective date is unclear.
- Operational source is missing or stale.
- Medical/legal interpretation is needed.
- OCR/extraction result conflicts with visible document.

## Refusal of Certainty

Forge must say:

"The sources conflict, so Forge cannot give a coverage assessment yet. The
conflict is between [source A] and [source B]. Human review is required."

Forge must not say:

- "I choose the more favorable rule."
- "The newest document always wins."
- "The manual probably overrides the policy."

## Example Reasoning Path

Scenario:

- Alfa Medical Manual 2025 says X.
- Alfa Medical Conditions 2026 say Y.
- Client Caratula says Z.

Forge path:

1. Confirm product: Alfa Medical.
2. Identify caratula as policy-specific authority.
3. Identify conditions 2026 as active product legal source if applicable to the
   policy/event date.
4. Identify manual 2025 as lower authority and likely historical/reference
   unless still active for that policy period.
5. Determine what each source is talking about:
   - Caratula Z may define selected coverage/value.
   - Conditions Y may define mechanics and limits.
   - Manual X may explain product operation.
6. If Z selects a benefit and Y defines how that benefit works, both can apply.
7. If X contradicts Y, Y controls unless human review finds an effective
   modification.
8. If Z contradicts Y materially, human review required because policy-specific
   and legal source conflict.
9. Confidence:
   - High if Z and Y align and X is merely outdated.
   - Medium if X creates educational inconsistency but no legal conflict.
   - Human Review Required if Z and Y conflict or effective dates are unclear.

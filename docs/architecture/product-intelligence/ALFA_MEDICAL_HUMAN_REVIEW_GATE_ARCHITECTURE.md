# Alfa Medical Human Review Gate Architecture

Status: ARCHITECTURE DISCOVERY

## Purpose

Classify when Forge must stop, when it can continue with caution and when it
can provide educational explanation only.

## Gate Types

### Hard Stop

Forge must not produce likely covered or likely not covered.

Allowed output:

- "Human review required."
- "Insufficient information."
- "I can explain the rule, but not evaluate this situation yet."

### Soft Stop

Forge can continue only with a conditional assessment and explicit missing
evidence.

Allowed output:

- "This appears directionally consistent with coverage, but the answer depends
  on..."

### Educational Explanation Only

Forge may explain how Alfa Medical generally works but cannot assess the case.

Allowed output:

- "In Alfa Medical, maternity generally depends on age, continuity and..."

### Human Review Required

Human review is the required next step because evidence interpretation,
source conflict or medical/legal judgment is material.

## Gate Classification

| Rule | Gate | Reason |
| --- | --- | --- |
| AM-HR-001 Product uncertain | Hard Stop | Wrong product route can invert rules. |
| AM-HR-002 Missing caratula values | Soft Stop / Educational Only | Blocks financial and case-specific certainty. |
| AM-HR-003 Preexistence ambiguity | Hard Stop | Preexistence can override apparent coverage. |
| AM-HR-004 Date conflict | Hard Stop | Waiting period and accident status depend on date sequence. |
| AM-HR-005 Foreign coverage without optional proof | Hard Stop | Foreign coverage is optional/context-specific. |
| AM-HR-006 Programmed vs non-programmed foreign care unclear | Hard Stop for financial; Soft Stop for education | Financial terms diverge materially. |
| AM-HR-007 High-specialty treatment | Human Review Required | Requires medical appropriateness, authorization and certification. |
| AM-HR-008 Alcohol/drug/intentional conduct | Human Review Required | Exclusion-sensitive facts. |
| AM-HR-009 Professional sport/racing/dangerous activity | Human Review Required | Exclusion-sensitive facts. |
| AM-HR-010 Hospital/provider classification unknown | Soft Stop | Coverage may still be plausible, but financial result is unknown. |
| AM-HR-011 Current catalogs unavailable | Soft Stop | Payment amount cannot be assessed. |
| AM-HR-012 Maternity dates/assisted reproduction unclear | Hard Stop for maternity assessment | Eligibility depends on precise facts. |
| AM-HR-013 Required documents missing | Soft Stop / Human Review | Missing proof can block claim procedence. |
| AM-HR-014 Source conflict | Hard Stop | Source hierarchy must be resolved by human review. |

## Stop Points in Evaluation Flow

### Stage 1: Product Gate

Stop if:

- Product cannot be confirmed as Alfa Medical.
- Product might be Flex.

### Stage 2: Evidence Gate

Stop or downgrade if:

- No policy/caratula.
- No event family.
- No diagnosis/event description.

### Stage 3: Timing Gate

Stop if:

- Symptom, diagnosis, accident, first expense or first attention dates conflict
  in a way that affects waiting periods.

### Stage 4: Eligibility Gate

Stop if:

- Age/sex/insured status/residence/continuity missing for a benefit that needs
  it.

### Stage 5: Preexistence Gate

Stop if:

- Prior diagnosis, symptoms, expenses or medical records may exist.

### Stage 6: Optional Coverage Gate

Stop if:

- Foreign, HIV/AIDS, deductible elimination or other optional benefit is needed
  but caratula does not confirm it.

### Stage 7: Authorization Gate

Stop if:

- Required prior authorization, second valuation, provider certification or
  assistance-channel use is unknown.

### Stage 8: Financial Gate

Stop financial estimate if:

- Deductible, coinsurance, cap, hospital level, plan, zone, tabulator or
  catalogs are missing.

## Human Review Output Pattern

Forge should say:

"This needs human review before a coverage assessment because [specific gate].
The next evidence needed is [specific evidence]."

Forge should not say:

- "Denied."
- "Approved."
- "Definitely covered."
- "Definitely not covered."
- "Your insurer will pay."

## Final Boundary

Human review gates are not friction. They are protection against false
certainty.

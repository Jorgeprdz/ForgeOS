# Forge GMM Human Review Architecture

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Define where GMM Coverage Intelligence must stop or downgrade output.

## Human Review Gate Types

### Hard Stop

Forge must not say likely covered or likely not covered.

Examples:

- Product uncertainty.
- Preexistence ambiguity.
- Conflicting date sequence.
- Foreign coverage without optional proof.
- Source conflict.

### Soft Stop

Forge may give conditional assessment but must disclose missing evidence.

Examples:

- Missing current catalog.
- Hospital/provider classification unknown.
- Missing financial values.

### Educational Explanation Only

Forge may explain product rules but not evaluate case.

Examples:

- No caratula.
- No event family.
- User asks generally.

### Human Review Required

Forge identifies specific review reason and evidence needed.

Examples:

- High-specialty treatment.
- Alcohol/drug facts.
- Professional sport/racing ambiguity.
- Assisted reproduction notice issue.

## Gate Order

1. Product gate.
2. Source conflict gate.
3. Event-family gate.
4. Date gate.
5. Preexistence gate.
6. Optional coverage gate.
7. Authorization gate.
8. Financial evidence gate.

## Human Review Response Pattern

Forge should state:

- What triggered review.
- Why it matters.
- What evidence is needed next.
- What Forge can explain meanwhile.

Forge should not:

- Hide uncertainty.
- Use review gates as sales pressure.
- Decide the claim.

## Blueprint Boundary

Human review is not a weakness in Coverage Intelligence. It is a safety layer
that prevents Forge from becoming a false authority.

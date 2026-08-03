# Advisor OS Sprint 07 — Pipeline to Quotes

```text
PERSON
→ APPOINTMENT
→ NEED
→ QUOTE_PREVIEW
→ QUOTE_AUTHORITY
→ PRINTABLE_AUTHORITY
→ PRESENTATION
→ OUTCOME
→ NEXT_ACTION
```

## Locks

```text
CANONICAL_PERSON_REFERENCE=PRESERVED
PROSPECT_PERSON_MISMATCH=REJECTED
QUOTE_WRITE=AUTHORITY_ONLY
QUOTE_PREVIEW=REQUIRED
PDF_RENDERING=PRINTABLE_AUTHORITY_ONLY
OUTCOME_CAPTURE=AUTHORITY_ONLY
FOLLOW_UP_OUTCOME=NEXT_ACTION_REQUIRED
DIRECT_DATABASE_WRITE=0
DUPLICATE_PERSON_CAPTURE=0
```

## Deployment dependencies

The composition fails closed unless the productive Persona, Pipeline, Quote Lifecycle, Printable, Outcome and Next Action adapters are registered. It does not claim success from opening a route or printable view alone.

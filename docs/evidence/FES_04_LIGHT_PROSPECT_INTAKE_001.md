# FES 04 Light Prospect Intake Evidence 001

## Acceptance

```text
FES_04_LIGHT_PROSPECT_INTAKE=PASS
CONTRACT_VERSION=FES-04.1
INTAKE_SCHEMA=forge.light_prospect_intake.v1
EVENT_ZERO_SCHEMA=forge.prospect_event_zero.v1
FES_04_TESTS=36
FES_04_PASS=36
FES_04_FAIL=0
REGRESSION_FILES=11
REGRESSION_TESTS=244
REGRESSION_PASS=244
REGRESSION_FAIL=0
```

## Accepted behavior

The intake requires only identity, one contact channel, source and short
voice/text context. Referral details are conditional. Email, date of birth and
occupation remain optional.

Extracted candidates never become profile truth from confidence alone.
Accepted candidates are allowlisted and conflicts fail closed.

The event-zero bundle is deterministic, atomic-ready and accepted by the FES
03 projection runtime. It contains references but no raw private intake data.

## Boundaries

The contract does not persist, bind productive UI, invoke speech recognition,
run an LLM, mutate Supabase, schedule due actions or change main.

# FES 05A Passive Capture Bridge Contract Evidence 001

## Acceptance

```text
FES_05A_PASSIVE_CAPTURE_BRIDGE_CONTRACT=PASS
CONTRACT_VERSION=FES-05A.1
OBSERVATION_SCHEMA=forge.passive_capture_observation.v1
SEQUENCE_SCHEMA=forge.passive_capture_sequence.v1
BRIDGE_DOMAINS=6
BRIDGE_ACTIONS=31
FES_05A_TESTS=43
FES_05A_PASS=43
FES_05A_FAIL=0
REGRESSION_FILES=12
REGRESSION_TESTS=280
REGRESSION_PASS=280
REGRESSION_FAIL=0
```

## Accepted behavior

The bridge preserves intent, generation, edit, approval, handoff, external
confirmation, result, context and state transitions as distinct claims.

WhatsApp and Nash require approval after the latest edit before handoff.
Nash Combat requires approval after the latest response edit before use.
Call and Calendar handoffs remain unresolved until a result or provider
confirmation arrives. Quote preparation is separate from review and
presentation. Pipeline stage request is separate from confirmed movement.

Observations contain only references and governed metadata. Raw messages,
transcripts, objections, notes, scripts and quote content are forbidden.

## Boundaries

FES 05A does not extend canonical event types, persist observations, bind
productive UI, execute external actions, mutate Supabase or change main.

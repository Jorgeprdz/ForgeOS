# FORGE BETA 2 — BEHAVIORAL VALIDATION PROTOCOL 010

```text
PHASE=FORGE_BETA2_PRODUCTIVE_COMMERCIAL_LOOP_RELAUNCH
PHASE_NUMBER=010
OBSERVABILITY_MODE=MANUAL_GOVERNED_FEEDBACK
OBSERVABILITY_IMPLEMENTATION=DEFERRED
```

## Purpose

Beta 2 validates whether Forge materially helps an advisor operate the commercial loop. This is not an aesthetic survey and is not a surveillance program.

The protocol records the minimum behavioral context necessary to identify friction, unclear decisions, broken continuity, ignored recommendations and repeated work that Forge could eventually absorb.

## Session record

```text
SESSION_ID=
ADVISOR_ID_OR_GOVERNED_ALIAS=
DATE=
DEVICE=
WORKSPACE=
INTENT=
WHAT_USER_EXPECTED=
WHAT_HAPPENED=
WHERE_USER_HESITATED=
DECISION_UNCLEAR=
EXPLANATION_UNCLEAR=
ACTION_IGNORED=
LEFT_FORGE_TO_USE=
TRUSTED_INTELLIGENCE=
DISTRUSTED_INTELLIGENCE=
MANUAL_WORKAROUND=
SEVERITY=
BUG_OR_PRODUCT_LEARNING=
FOLLOW_UP=
```

## Allowed severity

- `P0`: security/privacy/truth violation or unusable critical commercial loop;
- `P1`: critical task blocked, broken route, lost persistence, materially misleading economic/identity state;
- `P2`: important friction with a safe workaround;
- `P3`: non-blocking product-learning observation.

## Capture rules

Prefer governed aliases and product/workspace identifiers over customer identity. Record what the advisor attempted and what the system did; do not copy customer documents or sensitive business content into this protocol.

Do not capture by default:

- full customer names;
- policy sensitive details;
- quote financial contents;
- message bodies;
- conversation transcripts;
- documents;
- health data;
- unnecessary PII.

When an error can be represented categorically, record the category rather than raw payload.

## Beta interview prompts

The reviewer may ask:

1. What were you trying to accomplish in Forge?
2. At what point did you stop knowing what to do next?
3. Which recommendation did you follow or ignore, and why?
4. Which explanation increased or reduced your trust?
5. Did you leave Forge to use WhatsApp, notes, Excel, calendar or another tool? For what task?
6. Did a transition between Pipeline, Activity, Quotes, Cartera or Income feel disconnected?
7. What did you have to retype or re-decide manually?

Do not ask whether the advisor simply “liked the design” unless the visual issue obstructed understanding or action.

## Privacy boundary

```text
FULL_CUSTOMER_NAMES_REQUIRED=NO
DOCUMENT_UPLOAD_TO_FEEDBACK=NO
MESSAGE_BODY_CAPTURE=NO
HEALTH_DATA_CAPTURE=NO
CROSS_TENANT_OBSERVATION=NO
SESSION_REPLAY=NO
KEYSTROKE_CAPTURE=NO
INVASIVE_TELEMETRY=NO
```

## Product-learning rule

A repeated observation becomes a candidate product gap only after it is classified against existing authority. Beta feedback cannot create a new score, engine, truth owner, schema or business rule by itself.

```text
BETA_FEEDBACK_PROTOCOL=READY
PRIVACY_BOUNDARY=PASS
BEHAVIORAL_VALIDATION_NOT_AESTHETIC_SURVEY=YES
```
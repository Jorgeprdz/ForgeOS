# Alfred Command OS Reconciliation 002

## Decision

The Material 3 Alfred sheet is reconciled with Forge's canonical Command OS, universal index, contextual action registry and review-action-packet boundaries.

The direct generic path from every Alfred input to Gemini is removed.

```text
DIRECT_GEMINI_PRIMARY_PATH=REMOVED
COMMAND_OS_PARSER=CONNECTED
COMMAND_OS_SEARCH=CONNECTED
COMMAND_OS_NAVIGATION=CONNECTED
ACTION_REGISTRY=CONNECTED
QUICK_ACTIONS=CONTEXT_DERIVED
ENTITY_INDEX=CONNECTED
REVIEW_ACTION_PACKETS=CONNECTED
CHATBOT_ENTRY=EXPLICIT_ONLY
DOMAIN_EXECUTION_BYPASSED=NO
HUMAN_FINAL_AUTHORITY=YES
```

## Runtime flow

```text
INPUT
→ PARSE_HINT
→ ACTION_REGISTRY / COMMAND_REGISTRY / ENTITY_INDEX
→ RESOLVE_CONTEXT
→ READ OR REVIEW_PACKET
→ HUMAN REVIEW
→ FUTURE CONFIRMED DOMAIN AUTHORITY ONLY WHEN SEPARATELY AUTHORIZED
```

The explicit conversational branch is:

```text
/Chatbot
→ CHATBOT_CONTEXT_REVIEW_PACKET
→ HUMAN CHOOSES TO ENTER CHATBOT
→ AUTHENTICATED EDGE FUNCTION
→ GEMINI OR DETERMINISTIC CHAT FALLBACK
```

The Edge Function rejects non-chatbot requests with `COMMAND_OS_REQUIRED`.

## Quick actions

Quick actions are generated from:

- current Forge route;
- canonical Alfred action identifiers;
- action availability;
- capability overrides;
- preview/review boundaries.

They are not generated from DOM text and are not selected by Gemini.

Initial contextual contracts include:

- `command.quick_actions`
- `report.prepare_preview`
- `opportunity.review`
- `client.follow_preview`
- `quote.prepare_preview`
- `record.open_preview`
- `memory.prepare_review`
- `referral.prepare_review`
- `calendar.prepare_review`
- `message.prepare_review`
- `product.presentation_review`
- `compensation.preview`
- `chatbot.open`

## Review packets

Browser review packets preserve the 054L/054M shape and carry:

- detected intent and route family;
- person/entity candidates;
- product interests;
- calendar, referral, message and follow-up candidates;
- extracted facts;
- uncertainty;
- human review questions;
- proposed review-only action;
- explicit forbidden actions;
- human final authority.

## Safety lock

```text
PREVIEW_ONLY=YES
REVIEW_ONLY=YES
NOT_APPROVED=YES
NOT_SENDABLE=YES
CREATES_TRUTH=NO
EXECUTES_RUNTIME=NO
WRITES_CRM=NO
CREATES_CALENDAR_EVENT=NO
CREATES_TASK=NO
SENDS_MESSAGE=NO
CALLS_PROVIDER_RUNTIME=CHATBOT_ONLY
```

## Pages publication

The canonical Pages artifact publishes the Command OS dependencies and rewrites the Material 3 source-layout imports from:

```text
../../../platform/
```

to:

```text
../../platform/
```

The artifact fails if the rewrite or any required Command OS module is missing.

## Merge boundary

```text
MERGE_AUTHORIZED=NO
DEPLOY_AUTHORIZED=NO
```

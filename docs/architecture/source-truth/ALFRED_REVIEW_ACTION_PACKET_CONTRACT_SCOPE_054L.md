# Alfred Review Action Packet Contract Scope 054L

`054L_ALFRED_REVIEW_ACTION_PACKET_CONTRACT_SCOPE`

## Purpose

054L scopes the review action packet contract for Alfred.

Alfred already resolves commands and returns preview/review-only read-model output. 054L defines the next bridge: a normalized packet that turns Alfred output into a human-reviewable action packet without executing anything.

The packet is not a database schema, not a provider adapter, not UI, not Google Calendar runtime, not Gmail runtime, not CRM runtime, and not approval authority.

The packet exists so future surfaces can show the user:

- what Alfred understood
- what facts Alfred extracted
- what Alfred is unsure about
- what action Alfred proposes
- what confirmation is required
- what Alfred is forbidden from doing

## Core rule

Alfred may prepare review packets.

Alfred must not approve, send, write CRM, create calendar events, create tasks, create revenue, create commissions, create payout truth, create source-of-truth records, execute audio runtime, or call live-search/provider runtime.

Boundary remains:

- `previewOnly: true`
- `reviewOnly: true`
- `notApproved: true`
- `notSendable: true`
- `createsTruth: false`
- `executesRuntime: false`
- `sendsMessage: false`
- `writesCrm: false`
- `createsCalendarEvent: false`
- `createsTask: false`
- `audioRuntimeEnabled: false`
- `speechEngineEnabled: false`
- `liveSearchEnabled: false`
- no approval/send/runtime/truth mutation

## Contract name

`ALFRED_REVIEW_ACTION_PACKET`

## Contract intent

A review action packet is the normalized handoff unit between Alfred's read-model and future human review surfaces.

The packet answers:

1. What did the user ask Alfred to do?
2. Which intent family did Alfred detect?
3. Which person, product, date, referral, message, or follow-up did Alfred extract?
4. What review artifact should be prepared?
5. What human confirmation is required before anything external happens?
6. Which actions are explicitly forbidden at this stage?

## Packet families

The contract covers these packet families:

- `MEMORY_REVIEW_PACKET`
- `REFERRAL_CAPTURE_REVIEW_PACKET`
- `CALENDAR_EVENT_DRAFT_REVIEW_PACKET`
- `PRODUCT_INTELLIGENCE_REVIEW_PACKET`
- `MESSAGE_DRAFT_REVIEW_PACKET`
- `FOLLOW_UP_REVIEW_PACKET`
- `UNIVERSAL_INDEX_REVIEW_PACKET`
- `CHATBOT_CONTEXT_REVIEW_PACKET`
- `VOICE_TRANSCRIPTION_REVIEW_PACKET`

## Command coverage

054L scopes packet output for these Alfred command families:

- `/Memoria`
- `/Referido`
- `/Agenda`
- `/Crear evento`
- `/Cotizar`
- `/Proyectar`
- `/Presentación`
- `/Mejora este mensaje`
- `/Follow`
- `/Chatbot`
- plain text universal index queries such as `/Juan`

## Packet fields

Future implementation must produce a deterministic object shaped around these fields:

```js
{
  packetId,
  packetType,
  source: "ALFRED_UNIVERSAL_COMMAND_MEMORY_READ_MODEL",
  sourcePhase: "054J_ALFRED_UNIVERSAL_COMMAND_MEMORY_READ_MODEL_IMPLEMENTATION",
  rawInput,
  sourceCommand,
  normalizedCommand,
  intentFamily,
  routeFamily,
  primaryEntity,
  relatedEntities,
  productInterests,
  calendarCandidate,
  referralCandidate,
  messageDraftCandidate,
  followUpCandidate,
  extractedFacts,
  uncertainty,
  reviewSummary,
  proposedActions,
  forbiddenActions,
  humanReviewQuestions,
  confirmationRequired,
  safety,
  finalAuthority
}
```

## Field expectations

### `packetId`

Deterministic packet identifier derived from command family, route family, and normalized input hash.

No UUID runtime dependency is required.

### `packetType`

One of the scoped packet families.

### `sourceCommand`

Original Alfred command label such as `/Memoria`, `/Referido`, `/Agenda`, `/Crear evento`, `/Cotizar`, `/Proyectar`, `/Presentación`, `/Mejora este mensaje`, `/Follow`, or `/Chatbot`.

### `primaryEntity`

The most important human or business object detected.

Examples:

- Juan
- María
- Lariza
- Luis Pérez
- Giovanni Islas

If Alfred is unsure, it must mark uncertainty instead of pretending certainty.

### `relatedEntities`

People or entities related to the primary entity.

Examples:

- spouse
- boyfriend
- referral source
- coworker
- prospect partner

### `extractedFacts`

Normalized factual observations from the user's input.

Examples:

- Juan is interested in retirement.
- Juan wants to review with his spouse.
- María has a candidate appointment on Friday at 11.
- Luis Pérez is a referral from Giovanni Islas.
- Lariza and her partner are interested in retirement and Vida Mujer.

Facts remain reviewable notes, not source-truth writes.

### `uncertainty`

Anything Alfred inferred weakly or could not confirm.

Examples:

- missing calendar date year
- unknown phone/email
- ambiguous Juan
- unclear whether Friday means this week or next week
- unclear whether partner means boyfriend, spouse, or business partner

### `reviewSummary`

Human-readable summary designed for the review panel.

It should be concise, commercial, and actionable.

### `proposedActions`

Review-only proposed actions.

Allowed proposed action types:

- `PREPARE_MEMORY_REVIEW`
- `PREPARE_REFERRAL_REVIEW`
- `PREPARE_CALENDAR_EVENT_DRAFT`
- `PREPARE_PRODUCT_REVIEW_ARTIFACT`
- `PREPARE_MESSAGE_DRAFT`
- `PREPARE_FOLLOW_UP_REVIEW`
- `OPEN_ENTITY_PREVIEW`
- `OPEN_CHAT_CONTEXT_PREVIEW`

Each proposed action must include:

```js
{
  actionId,
  actionType,
  label,
  reviewOnly: true,
  confirmationRequired: true,
  requiresHumanApproval: true,
  executesRuntime: false,
  createsTruth: false,
  writesCrm: false,
  createsCalendarEvent: false,
  sendsMessage: false
}
```

### `forbiddenActions`

Explicit list of actions Alfred must not perform from this packet.

Forbidden actions include:

- `SEND_MESSAGE`
- `CREATE_CALENDAR_EVENT`
- `WRITE_CRM`
- `CREATE_TASK`
- `APPROVE_QUOTE`
- `APPROVE_PROPOSAL`
- `CREATE_REVENUE_TRUTH`
- `CREATE_COMMISSION_TRUTH`
- `CREATE_PAYOUT_TRUTH`
- `CREATE_ADVISOR_LIFECYCLE_TRUTH`
- `EXECUTE_AUDIO_RUNTIME`
- `CALL_LIVE_SEARCH`
- `CALL_PROVIDER_RUNTIME`

### `humanReviewQuestions`

Questions Alfred should surface before execution could ever be considered by future phases.

Examples:

- Which Juan is this?
- Should this be a follow-up or a calendar appointment?
- Is Friday this week or next week?
- Should the event include Google Meet?
- Should Luis Pérez be captured as a referral only or also as a prospect?
- Should the message be sent by WhatsApp, email, or copied manually?

### `confirmationRequired`

Always true in 054L.

### `finalAuthority`

Always `HUMAN`.

## Safety block

Every packet must carry a safety block equivalent to:

```js
{
  previewOnly: true,
  reviewOnly: true,
  notApproved: true,
  notSendable: true,
  finalAuthority: "HUMAN",
  createsTruth: false,
  executesRuntime: false,
  sendsMessage: false,
  writesCrm: false,
  createsCalendarEvent: false,
  createsTask: false,
  createsRevenue: false,
  createsCompensation: false,
  createsPayoutTruth: false,
  audioRuntimeEnabled: false,
  speechEngineEnabled: false,
  liveSearchEnabled: false,
  providerRuntimeEnabled: false
}
```

## Example mappings

### `/Memoria`

Input:

`/Memoria Hoy vi a Juan. Me dijo que sí le interesa retiro, pero quiere revisarlo con su esposa. Me pidió que le hable la próxima semana.`

Packet:

- packetType: `MEMORY_REVIEW_PACKET`
- primaryEntity: Juan
- productInterests: retiro
- relatedEntities: spouse
- proposedActions: prepare memory review, prepare follow-up review
- forbiddenActions: write CRM, create task, send message

### `/Referido`

Input:

`/Referido Luis Pérez es referido de Giovanni Islas, compañero del trabajo.`

Packet:

- packetType: `REFERRAL_CAPTURE_REVIEW_PACKET`
- primaryEntity: Luis Pérez
- relatedEntities: Giovanni Islas
- referralCandidate.source: Giovanni Islas
- referralCandidate.relationship: compañero del trabajo
- proposedActions: prepare referral review
- forbiddenActions: write CRM, create prospect truth

### `/Agenda`

Input:

`/Agenda Tengo cita con María el viernes a las 11.`

Packet:

- packetType: `CALENDAR_EVENT_DRAFT_REVIEW_PACKET`
- primaryEntity: María
- calendarCandidate.day: viernes
- calendarCandidate.time: 11
- proposedActions: prepare calendar event draft
- forbiddenActions: create calendar event, invite attendees, create Google Meet

### `/Crear evento`

Input:

`/Crear evento con María el viernes a las 11 para revisar su plan de protección.`

Packet:

- packetType: `CALENDAR_EVENT_DRAFT_REVIEW_PACKET`
- primaryEntity: María
- proposedActions: prepare calendar event draft only
- confirmationRequired: true
- forbiddenActions: create calendar event without human confirmation

### `/Cotizar`

Input:

`/Cotizar Lariza y su novio retiro y Vida Mujer.`

Packet:

- packetType: `PRODUCT_INTELLIGENCE_REVIEW_PACKET`
- primaryEntity: Lariza
- relatedEntities: boyfriend / partner
- productInterests: retiro, Vida Mujer
- proposedActions: prepare product review artifact
- forbiddenActions: approve quote, create proposal truth, create sale

### `/Mejora este mensaje`

Input:

`/Mejora este mensaje Hola Juan te busco para hablar de retiro y ver cuándo podemos agendar.`

Packet:

- packetType: `MESSAGE_DRAFT_REVIEW_PACKET`
- primaryEntity: Juan
- proposedActions: prepare message draft
- forbiddenActions: send message, schedule follow-up without confirmation

## Voice capture boundary

`ALFRED_VOICE_CAPTURE` may later produce transcribed text that enters this packet contract.

054L does not implement microphone capture, audio runtime, browser speech APIs, speech engine, or provider transcription.

Voice-related packet fields must remain preview/review-only:

- `transcriptionPreviewOnly: true`
- `audioRuntimeEnabled: false`
- `speechEngineEnabled: false`
- `recordingRuntimeEnabled: false`

## Human confirmation ladder

Future phases must preserve this ladder:

1. Alfred read-model output
2. Alfred review action packet
3. Human review panel
4. Human approval gate
5. Delivery preparation
6. Send/calendar/CRM execution gate only in future explicitly scoped phases

054L only scopes step 2.

## Non-goals

054L does not:

- implement packet code
- add UI
- add microphone button
- call Google Calendar
- call Gmail
- call CRM
- create tasks
- create events
- send messages
- approve proposals
- create compensation truth
- create payout truth
- mutate Article 0 / Skynet / Constitution

## Implementation target

Next phase:

`054M_ALFRED_REVIEW_ACTION_PACKET_READ_MODEL_IMPLEMENTATION`

054M should implement a pure read-model builder that consumes Alfred read-model output and returns deterministic review action packets with master tests.

## Closure decision

`PASS_054L_ALFRED_REVIEW_ACTION_PACKET_CONTRACT_SCOPE_COMPLETE`

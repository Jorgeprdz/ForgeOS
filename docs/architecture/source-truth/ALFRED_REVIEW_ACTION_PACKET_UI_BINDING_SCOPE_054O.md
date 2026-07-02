# Alfred Review Action Packet UI Binding Scope 054O

`054O_ALFRED_REVIEW_ACTION_PACKET_UI_BINDING_SCOPE`

## Status

GREEN / SCOPED.

054O scopes how future UI surfaces may bind to `ALFRED_REVIEW_ACTION_PACKET` output.

This phase is docs-only. It does not implement UI, does not change static preview code, does not add schemas, does not add audio runtime, and does not call any provider.

## Boundary

The binding remains review-only:

- `previewOnly: true`
- `reviewOnly: true`
- `notApproved: true`
- `notSendable: true`
- `createsTruth: false`
- `executesRuntime: false`
- `sendsMessage: false`
- `writesCrm: false`
- `createsCalendarEvent: false`
- `audioRuntimeEnabled: false`
- `speechEngineEnabled: false`
- `providerRuntimeEnabled: false`
- `liveSearchEnabled: false`
- no approval/send/runtime/truth mutation

## Purpose

Alfred is now a command, memory, and review-packet system.

The next UI layer must not treat Alfred output as an executable instruction. The UI must treat Alfred output as a human-reviewable packet that helps the user understand:

1. what Alfred heard or read;
2. what Alfred extracted;
3. what Alfred is uncertain about;
4. what Alfred suggests preparing;
5. what Alfred is forbidden from doing;
6. what requires explicit human confirmation later.

The UI binding is therefore a display-and-review binding, not an execution binding.

## Input Source

The UI binding must consume review packets produced by:

`manager-os/alfred-review-action-packet-read-model.js`

The canonical packet family is:

- `ALFRED_REVIEW_ACTION_PACKET`
- `MEMORY_REVIEW_PACKET`
- `REFERRAL_CAPTURE_REVIEW_PACKET`
- `CALENDAR_EVENT_DRAFT_REVIEW_PACKET`
- `PRODUCT_INTELLIGENCE_REVIEW_PACKET`
- `MESSAGE_DRAFT_REVIEW_PACKET`
- `FOLLOW_UP_REVIEW_PACKET`
- `UNIVERSAL_INDEX_REVIEW_PACKET`
- `CHATBOT_CONTEXT_REVIEW_PACKET`
- `VOICE_TRANSCRIPTION_REVIEW_PACKET`

## Commands Covered

Future UI binding must support review output for:

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
- `/Bonos`
- `/Comisiones`
- unknown slash commands
- plain natural language fallback
- future voice transcription preview

## UI Output Contract

The UI must be able to render these packet sections:

### 1. Command Recap

Shows the raw command and normalized command.

Required fields:

- `rawInput`
- `sourceCommand`
- `normalizedCommand`
- `packetType`
- `packetId`

### 2. Review Summary

Shows a human-readable summary of what Alfred prepared.

Required field:

- `reviewSummary`

The summary must not claim that Alfred created a calendar event, wrote CRM, sent a message, approved a quote, created revenue truth, created commission truth, or ran a provider.

### 3. Extracted Entities

Shows candidates such as:

- person
- referred person
- referral source
- relationship
- products
- date candidate
- time candidate
- message draft candidate
- follow-up candidate
- product-intelligence candidate

These are candidates, not source-truth records.

### 4. Uncertainty Panel

Shows incomplete or ambiguous extraction.

Examples:

- missing date
- missing time
- missing contact identity
- uncertain product family
- unclear relationship
- unknown slash command
- voice transcription requires human review

The UI must surface uncertainty instead of hiding it like a tiny gremlin under the rug, because humans apparently need reminders that software is not magic.

### 5. Suggested Review Actions

Shows actions Alfred can prepare for later review.

Examples:

- prepare memory review
- prepare referral capture review
- prepare calendar draft review
- prepare product intelligence review
- prepare message draft review
- prepare follow-up review
- prepare chatbot context review
- prepare voice transcription review

Every suggested action must preserve:

- `previewOnly: true`
- `reviewOnly: true`
- `notApproved: true`
- `notSendable: true`
- `createsTruth: false`
- `executesRuntime: false`
- `sendsMessage: false`
- `writesCrm: false`
- `createsCalendarEvent: false`

### 6. Forbidden Actions

The UI must explicitly know that these are unavailable in this phase:

- Send WhatsApp
- Send Gmail
- Create Google Calendar event
- Write CRM
- Create task
- Approve quote
- Approve message
- Create revenue truth
- Create commission truth
- Create payout truth
- Execute provider runtime
- Run audio recording
- Run speech engine
- Run live search

The UI may display blocked states or locked buttons only if they are clearly non-executable in 054O.

### 7. Confirmation Requirements

The UI may render future confirmation requirements:

- `calendarCreateRequiresConfirmation: true`
- `crmWriteRequiresConfirmation: true`
- `sendMessageRequiresConfirmation: true`
- `transcriptionPreviewOnly: true`

These confirmation requirements do not grant execution permission.

## UI States

Future UI binding must support these states:

### `ALFRED_IDLE`

Alfred command surface is waiting for input.

### `ALFRED_PACKET_PREVIEW_READY`

A review packet exists and can be rendered.

### `ALFRED_PACKET_NEEDS_CLARIFICATION`

A packet exists but has uncertainty that should be visible before the user proceeds.

### `ALFRED_PACKET_BLOCKED_ACTION`

The user or UI attempted to access a forbidden action.

The UI must show that the action is blocked, not silently downgrade it into a write.

### `ALFRED_PACKET_REVIEW_ONLY`

The packet is visible but cannot write, send, approve, create truth, or execute runtime.

### `ALFRED_VOICE_PREVIEW_ONLY`

A future microphone button may expose a voice capture affordance, but in this scope it only represents a preview state.

No microphone capture, no audio runtime, and no speech engine are implemented in 054O.

## Mobile Binding Direction

Mobile may later render the packet as a bottom sheet connected to Alfred's command orb/pill.

The mobile sheet should prioritize:

1. packet type badge;
2. person or target entity;
3. review summary;
4. extracted candidates;
5. uncertainty;
6. suggested review actions;
7. forbidden actions.

The UI must not bury uncertainty below decorative chrome. That would be very on-brand for humanity, but not for Forge.

## Desktop / Landscape Binding Direction

Desktop and landscape may later render the packet as a side review panel inside the command cockpit.

The binding must preserve the restored 054F context drawer base and must not reintroduce the rejected 054G lower-fill tuning.

The desktop review panel should remain secondary to Alfred's command surface and should not create competing navigation.

## Voice Button Boundary

A future Alfred microphone button is allowed as a UI concept only.

054O does not implement:

- microphone permissions;
- recording;
- audio blobs;
- speech-to-text;
- audio provider adapters;
- transcription provider adapters;
- voice-triggered CRM writes;
- voice-triggered calendar creates;
- voice-triggered message sends.

Any voice UI must render `VOICE_TRANSCRIPTION_REVIEW_PACKET` as preview-only until a later explicit phase implements voice runtime behind human review and provider boundaries.

## Rendering Rules

The UI binding must render truthfully:

- Calendar packets are drafts only.
- Message packets are drafts only.
- Referral packets are capture review only.
- Memory packets are memory review only.
- Product-intelligence packets are review artifacts only.
- Follow-up packets are review only.
- Chatbot context packets do not execute chatbot runtime.
- Voice packets do not execute audio runtime.

## Non-Goals

054O does not:

- implement a UI component;
- edit `docs/static-preview/forge-alive/index.html`;
- edit `docs/static-preview/forge-alive/styles.css`;
- edit command bar JavaScript;
- add microphone support;
- add provider adapters;
- add Google Calendar writes;
- add Gmail or WhatsApp sends;
- add CRM writes;
- add schemas;
- approve anything;
- create truth.

## Required Future Implementation Shape

A future implementation may add a view model such as:

`ALFRED_REVIEW_ACTION_PACKET_UI_VIEW_MODEL`

That future view model should be a read-only mapper from packet output to renderable UI sections.

It should not execute runtime.

## Acceptance Criteria For The Future UI View Model

A future UI view model must prove that:

- every packet type maps to a stable UI display family;
- every action is preview/review only;
- blocked actions are explicit;
- uncertainty is visible;
- no runtime/provider call is possible;
- no UI label implies that calendar events, CRM records, messages, approvals, or truth were created;
- voice remains preview-only until explicitly unlocked by a later provider-runtime phase.

## Current Decision

`PASS_054O_ALFRED_REVIEW_ACTION_PACKET_UI_BINDING_SCOPE_COMPLETE`

## Next

`054P_ALFRED_REVIEW_ACTION_PACKET_UI_VIEW_MODEL_IMPLEMENTATION`

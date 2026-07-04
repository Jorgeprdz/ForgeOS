# Forge UI Action Contract Scope 059A

Status: SCOPED

Decision token:
DECISION=PASS_059A_UI_ACTION_CONTRACT_SCOPE

Next:
NEXT=059B_STATIC_ACTION_PACKET_BRIDGE

## Purpose

059A defines the contract between Forge UI surfaces and future engines.

This stage does not connect engines. It defines the safe action packet shape that
mobile widgets, desktop command workspace, tables, rails, and module controls may
emit later.

## Boundary

059A is documentation and source-truth only.

Allowed:

- define UI action ids;
- define packet shape;
- define source surfaces;
- define required and optional fields;
- define preview payload expectations;
- define human approval requirements;
- define forbidden side effects;
- map UI actions to future engine adapter candidates.

Forbidden:

- connecting real engines;
- sending messages;
- writing CRM;
- creating calendar events;
- creating compensation truth;
- fetching live external data;
- mutating browser storage;
- changing static preview HTML, CSS or JS.

## Source Surfaces

| Surface | Platform | Role |
| --- | --- | --- |
| Desktop command workspace | Desktop | Primary command entry and preview surface. |
| Desktop row action | Desktop | Contextual action from tables. |
| Desktop Alfred decision strip | Desktop | Recommended action from Alfred context. |
| Desktop right rail | Desktop | Explanation, limits, and recommended command. |
| Mobile command / Alfred card | Mobile | Short safe preview action. |
| Mobile widget grid | Mobile | Widget-specific action entry. |
| Mobile bottom navigation | Mobile | Navigation only unless explicitly upgraded later. |

## Canonical Action Ids

| Action id | User label | Primary module | Future adapter candidate |
| --- | --- | --- | --- |
| `quote.create.preview` | Cotizar | Cotizaciones | Quote preview adapter |
| `policy.upload.preview` | Subir poliza | Polizas | Document intake adapter |
| `client.follow.preview` | Follow | Clientes | Follow-up draft adapter |
| `client.call.preview` | Llamar | Clientes | Call prep adapter |
| `client.message.preview` | Mandar mensaje | Clientes | Message draft adapter |
| `client.search.preview` | Buscar cliente | Clientes | Client search/read adapter |
| `policy.open.preview` | Abrir poliza | Polizas | Policy read adapter |
| `report.open.preview` | Abrir reporte | Reportes | Report read adapter |
| `pipeline.review.preview` | Revisar pipeline | Pipeline | Pipeline review adapter |
| `day.review.preview` | Revisar dia | Inicio | Daily review adapter |

## Packet Requirements

Every UI action packet must include:

- `actionId`;
- `sourceSurface`;
- `sourcePlatform`;
- `sourceModule`;
- `humanLabel`;
- `previewMode`;
- `requiresHumanApproval`;
- `createdAtLocal`;
- `safeIntent`.

Every packet should include when available:

- `clientId`;
- `clientName`;
- `documentId`;
- `policyId`;
- `opportunityId`;
- `riskLevel`;
- `reason`;
- `recommendedNextStep`;
- `displayContext`.

## Preview Payload Contract

Preview payloads are display-only until a later approved adapter stage.

A preview payload may contain:

- title;
- explanation;
- next action copy;
- supporting evidence;
- warnings;
- disabled execution affordance;
- explicit safety copy.

A preview payload must not contain:

- provider credentials;
- hidden send/write flags;
- live network results;
- persisted runtime state;
- irreversible action tokens.

## Human Approval Rule

All action packets in this phase require human approval.

`requiresHumanApproval` must be true for every canonical action id until a later
source-truth document explicitly changes the rule.

## Final Decision

DECISION=PASS_059A_UI_ACTION_CONTRACT_SCOPE

NEXT=059B_STATIC_ACTION_PACKET_BRIDGE

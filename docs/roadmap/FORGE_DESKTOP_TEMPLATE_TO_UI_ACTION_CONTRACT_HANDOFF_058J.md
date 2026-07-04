# Forge Desktop Template To UI Action Contract Handoff 058J

Status: READY

Decision token:
DECISION=FORGE_DESKTOP_TEMPLATE_TO_UI_ACTION_CONTRACT_HANDOFF_058J

Next:
NEXT=059A_UI_ACTION_CONTRACT_SCOPE

## Why This Handoff Exists

Mobile and desktop design baselines are now stable enough to stop broad UI polishing
and start defining how UI surfaces emit safe action packets.

## What 059A Must Define

059A must define UI action contracts for:

- `/cotizar`
- `/subir poliza`
- `/follow`
- `/llamar`
- `/mandar mensaje`
- `/buscar cliente`
- `/abrir poliza`
- `/reporte`

## Contract Requirements

Each UI action must define:

- command id;
- source surface;
- module;
- required fields;
- optional fields;
- preview payload;
- human approval requirement;
- forbidden side effects;
- target engine candidate;
- safe fallback state.

## Surfaces That Emit Actions

- Desktop command workspace.
- Desktop row actions.
- Desktop Alfred decision strip.
- Desktop right rail recommendation.
- Mobile command bar.
- Mobile widgets.
- Mobile bottom navigation where relevant.

## Forbidden Until Later

059A must not connect real engines.

It must not:

- send messages;
- write CRM;
- create calendar events;
- create compensation truth;
- fetch live external data;
- store browser state.

## Final Decision

DECISION=FORGE_DESKTOP_TEMPLATE_TO_UI_ACTION_CONTRACT_HANDOFF_058J

NEXT=059A_UI_ACTION_CONTRACT_SCOPE

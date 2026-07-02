# Forge Alive Command Bar Spotlight Index Scope 053N

`053N_FORGE_ALIVE_COMMAND_BAR_SPOTLIGHT_INDEX_SCOPE`

## Decision

Forge Alive's persistent command layer is a Spotlight / Alfred-style command bar.

It is a textbox-first universal command surface. It is not a normal navigation menu, not a button rail, not a widget selector, and not a decorative card.

The command bar exists to reduce clicks and route the human directly to the right object, review, workflow, or command.

## Product Philosophy

Minimum clicks is a core Forge Alive interaction principle.

The human should not have to remember which route, tab, submenu, or screen leads to a point. The command bar indexes the system and lets the human express intent directly.

Examples:

- `/Follow`
- `/Comisiones`
- `/bonos`
- `/Juan`
- `/Mejora este mensaje`
- `/Agenda`
- `/Crear evento`
- `/Chatbot`

The system may return ranked results such as:

- Juan Orozco - poliza ABC
- Juan Martinez - prospecto
- Juan Perez - ultimo contacto hace 76 dias

## Command Bar Role

The command bar is:

- persistent
- textbox-first
- searchable
- slash-command aware
- universal index entry point
- stable while widgets move
- the human command point

The command bar is not:

- a carousel item
- a smart widget
- a bottom-nav replacement
- an approval mechanism
- a send mechanism
- a runtime execution surface in static preview

## Indexed Surface Scope

The command bar is scoped to eventually index:

- people
- clients
- prospects
- policies
- follow-ups
- commissions
- bonuses
- messages
- agenda items
- events
- workflows
- review packets
- smart widgets
- knowledge/docs surfaced by Forge
- available commands

Indexing must be read-model first. Search results may route, preview, or prepare review context. They must not silently approve, send, write CRM, create tasks, create calendar events, or create truth.

## Command Result Types

Allowed result categories:

- person result
- policy result
- prospect result
- follow-up result
- commission result
- bonus result
- message-improvement command
- agenda result
- event-draft command
- chatbot / assistant mode entry
- review packet result
- smart widget context result

Every result must be explicit about what it does:

- open
- preview
- review
- draft
- prepare
- route

Forbidden ambiguous verbs:

- approve
- send
- execute
- confirm payout
- create truth
- decide for human

## Visual Rule

The command bar should visually feel like a premium Forge Alive command input:

- dark glass textbox
- Forge gold/cyan/blue glow
- animated Siri/Gemini-like living halo adapted to Forge colors
- no purple-first generic AI gradient
- subtle breathing idle state
- clearer focus/listening state
- reduced-motion fallback

The glow is visual-only. It must not imply autonomous execution.

## Static Preview Boundary

Static preview may show a disabled/read-only command bar, mock command examples, and mock indexed search results.

Static preview must not:

- process live input against real data
- approve
- send
- create tasks
- create calendar events
- write CRM
- call provider runtime
- call LLM runtime
- create truth

## Article 0 Requirements

The command bar supports Article 0 because it keeps the human command point visible and reduces navigation dependency without making Forge the final authority.

The UI must communicate:

- human final authority
- review only
- not approved
- not sendable
- delivery locked where relevant
- Forge strengthens human judgment, not replaces it

## Implementation Gate

Next implementation may update static preview only if it:

- renders a persistent command textbox layer
- uses slash-command examples
- shows mock indexed results
- keeps Smart Widget Stack movement bounded behind/below the command layer
- preserves animated Forge glow with reduced-motion fallback
- preserves read-only/no-action boundaries
- preserves phone readability
- does not add runtime search or live data mutation

## Next Phase

`053O_FORGE_ALIVE_COMMAND_BAR_SPOTLIGHT_STATIC_PREVIEW_IMPLEMENTATION`

## Final Decision

PASS_053N_COMMAND_BAR_SPOTLIGHT_INDEX_SCOPE_READY

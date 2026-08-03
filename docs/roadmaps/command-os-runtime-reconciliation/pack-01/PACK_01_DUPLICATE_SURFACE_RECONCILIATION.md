# Command OS Runtime Reconciliation — Pack 01

## Stage 01B — Duplicate Surface Reconciliation

```text
PHASE=COMMAND_OS_RUNTIME_RECONCILIATION
PACK=01_DISCOVERY_AND_CANONICAL_SELECTION
STAGE=01B_DUPLICATE_SURFACE_RECONCILIATION
STATUS=COMPLETE
RUNTIME_MUTATION=NO
```

## Duplicate UI surfaces

### Surface A — persistent UI

`platform/commands/command-palette-ui.js`

- owns `#command-palette`;
- owns `#universal-command-input`;
- exposes explicit open and close functions;
- is already consumed by `command-shortcuts-engine.js`.

### Surface B — dynamic modal

`platform/commands/command-palette.js`

- creates `.command-palette-modal` dynamically;
- owns a different input, `#command-input`;
- imports a carrier-specific catalog directly;
- renders results without selection, execution or cleanup.

## Decision

```text
CANONICAL_UI=platform/commands/command-palette-ui.js
DYNAMIC_MODAL_UI=QUARANTINED
SECOND_COMMAND_MODAL=FORBIDDEN
```

The canonical controller may reuse logic from the dynamic modal, but it must not preserve a second DOM contract.

## Duplicate parsing contracts

- `command-parser-engine.js` returns `COMMAND`, `ENTITY`, or `TEXT`.
- `command-palette-engine.js` returns `ACTION`, `ENTITY`, or `SEARCH`.

## Decision

The canonical intent classes are:

```text
NAVIGATION
READ
WRITE
ENTITY_SEARCH
FREE_TEXT
UNKNOWN
```

Prefix parsing remains a first-stage hint only:

```text
/ = EXPLICIT_COMMAND_HINT
@ = ENTITY_HINT
plain text = NATURAL_LANGUAGE_OR_SEARCH
```

`command-parser-engine.js` survives as the parser entry point. `command-palette-engine.js` does not remain a parallel parser authority.

## Duplicate command catalogs

### Global registry

`platform/commands/command-registry.js`

Contains generic commands such as policy, follow-up, WhatsApp, call and dashboard.

### SMNYL catalog

`rule-packs/smnyl/smnyl-command-palette-engine.js`

Contains carrier-context commands such as new client, pipeline, dashboard and contests.

## Decision

```text
GLOBAL_REGISTRY_AUTHORITY=platform/commands/command-registry.js
RULE_PACKS=COMMAND_CONTRIBUTORS_ONLY
RULE_PACK_DIRECT_UI_IMPORT=FORBIDDEN
```

Rule packs may contribute commands through an adapter. They do not own the global palette, parser, router or executor.

## Duplicate execution language

The registry defines `/policy`, `/followup`, `/whatsapp`, `/call`, and `/dashboard`. The current executor recognizes only `renovaciones` and `riesgo`.

## Decision

Commands execute by stable `id`, never by display label or route string.

```text
COMMAND_ID=CANONICAL
LABEL=PRESENTATION_ONLY
SLASH_COMMAND=ALIAS
ROUTE=HANDLER_OUTPUT
```

## Stage verdict

```text
DUPLICATE_UI_AUTHORITY=REMOVED_BY_DECISION
DUPLICATE_PARSER_AUTHORITY=REMOVED_BY_DECISION
DUPLICATE_REGISTRY_AUTHORITY=REMOVED_BY_DECISION
STAGE_01B=PASS
```
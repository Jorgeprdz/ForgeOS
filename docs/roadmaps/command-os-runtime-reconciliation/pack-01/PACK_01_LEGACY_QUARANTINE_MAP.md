# Command OS Runtime Reconciliation — Pack 01

## Stage 01D — Legacy Quarantine Map

```text
PHASE=COMMAND_OS_RUNTIME_RECONCILIATION
PACK=01_DISCOVERY_AND_CANONICAL_SELECTION
STAGE=01D_LEGACY_QUARANTINE_MAP
STATUS=COMPLETE
RUNTIME_MUTATION=NO
DELETE_AUTHORIZATION=NO
```

## Quarantined assets

| Asset | Quarantine reason | Allowed use | Forbidden use |
|---|---|---|---|
| `platform/commands/command-palette.js` | Creates duplicate modal and bypasses global registry | Reference implementation only | Runtime mount or second palette |
| `platform/commands/command-palette-engine.js` | Overlapping parser vocabulary | Extract useful parsing ideas | Parallel parser authority |
| `rule-packs/smnyl/smnyl-command-palette-engine.js` | Carrier catalog imported directly by UI | Rule-pack command contribution | Global registry or UI owner |
| `legacy/crmaddlife/chat-shell.js` | Placeholder chat, not Command OS | Remain untouched until separate migration | Rename or present as Alfred |
| Current body of `command-execution-engine.js` | Two stale route mappings inconsistent with registry | Preserve exported interface until replacement | Treat current mappings as productive coverage |

## Quarantine policy

```text
DELETE_NOW=NO
MOVE_NOW=NO
RUNTIME_IMPORT_FROM_QUARANTINE=FORBIDDEN
NEW_DEPENDENCIES_ON_QUARANTINE=FORBIDDEN
REFERENCE_FOR_MIGRATION=ALLOWED
```

No asset is deleted in Pack 01. Physical cleanup can occur only after the canonical runtime passes acceptance and dependency search proves the asset unused.

## Protected canonical assets

```text
platform/commands/command-palette-ui.js
platform/commands/command-shortcuts-engine.js
platform/commands/command-search-engine.js
platform/commands/command-parser-engine.js
platform/commands/command-registry.js
platform/commands/command-execution-engine.js
```

Protection means Pack 02 must extend or adapt these pieces rather than introduce parallel replacements.

## Change control

A quarantined component may be restored only with evidence that:

1. the selected canonical component cannot satisfy the required contract;
2. restoration does not create a second authority;
3. the change is recorded in the Pack PR;
4. runtime and acceptance evidence cover the restored path.

## Pack 01 final gate

```text
STAGE_01A_EXISTING_RUNTIME_INVENTORY=PASS
STAGE_01B_DUPLICATE_SURFACE_RECONCILIATION=PASS
STAGE_01C_CANONICAL_COMPONENT_SELECTION=PASS
STAGE_01D_LEGACY_QUARANTINE_MAP=PASS

COMMAND_OS_FOUNDATION=CONFIRMED
CANONICAL_COMPONENTS=LOCKED
LEGACY_DUPLICATES=QUARANTINED
RUNTIME_MUTATION=0
DATABASE_MUTATION=0

PACK_01=PASS
NEXT=PACK_02_UI_AND_GLOBAL_MOUNT
```
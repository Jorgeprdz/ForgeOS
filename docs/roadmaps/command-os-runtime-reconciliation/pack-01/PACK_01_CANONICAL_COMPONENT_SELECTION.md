# Command OS Runtime Reconciliation — Pack 01

## Stage 01C — Canonical Component Selection

```text
PHASE=COMMAND_OS_RUNTIME_RECONCILIATION
PACK=01_DISCOVERY_AND_CANONICAL_SELECTION
STAGE=01C_CANONICAL_COMPONENT_SELECTION
STATUS=COMPLETE
RUNTIME_MUTATION=NO
```

## Canonical stack

```text
UI=platform/commands/command-palette-ui.js
SHORTCUTS=platform/commands/command-shortcuts-engine.js
SEARCH=platform/commands/command-search-engine.js
PARSER=platform/commands/command-parser-engine.js
REGISTRY=platform/commands/command-registry.js
EXECUTOR_INTERFACE=platform/commands/command-execution-engine.js
RULE_PACK_PROVIDER=rule-packs/*/*command*-engine.js
RUNTIME_MOUNT=app.js via authenticated shell
ROUTER=EnterpriseRouter / Navigation
```

## Canonical responsibility map

| Responsibility | Authority |
|---|---|
| DOM and open/close lifecycle | Command Palette UI |
| Desktop shortcut behavior | Command Shortcuts Engine |
| Query filtering | Command Search Engine |
| Input classification | Command Parser Engine |
| Stable command definitions | Global Command Registry |
| Rule-pack additions | Rule-pack provider adapter |
| Read and navigation dispatch | Command Executor handlers |
| Write draft construction | Domain command composers |
| Mutation authorization | Canonical domain authority after confirmation |
| Route navigation | Existing productive router |
| Analytics/receipts | Existing event and timeline authorities |

## Canonical command schema

Every command must eventually conform to:

```js
{
  id: 'stable-command-id',
  label: 'Advisor-facing label',
  aliases: ['/alias'],
  keywords: ['search', 'terms'],
  intent: 'NAVIGATION | READ | WRITE | ENTITY_SEARCH',
  domain: 'platform | pipeline | cartera | quotes | activity',
  handlerId: 'stable-handler-id',
  requiresContext: [],
  requiresConfirmation: false,
  availability: 'enabled | hidden | unavailable',
  source: 'core | rule-pack'
}
```

This stage approves the shape conceptually. It does not mutate the existing registry yet.

## Productive execution contract

```text
INPUT
→ PARSE_HINT
→ SEARCH_OR_RESOLVE
→ SELECT_COMMAND
→ RESOLVE_CONTEXT
→ CLASSIFY_READ_OR_WRITE
→ READ_EXECUTES_OR_WRITE_DRAFTS
→ USER_CONFIRMATION_IF_REQUIRED
→ CANONICAL_HANDLER
→ RECEIPT
```

## Non-authority rules

```text
COMMAND_BAR_IS_SOURCE_OF_TRUTH=NO
COMMAND_BAR_DIRECT_DATABASE_WRITE=FORBIDDEN
COMMAND_BAR_BYPASS_ROUTER=FORBIDDEN
COMMAND_BAR_BYPASS_DOMAIN_COMMANDS=FORBIDDEN
NATURAL_LANGUAGE_EQUALS_CONFIRMED_FACT=NO
```

## Minimum Pack 02 handoff

Pack 02 receives one UI, one shortcut engine and one authenticated mount target. It must not reopen canonical selection unless repository evidence proves the selected component cannot operate.

```text
CANONICAL_STACK_SELECTED=YES
REOPEN_WITHOUT_EVIDENCE=FORBIDDEN
STAGE_01C=PASS
```
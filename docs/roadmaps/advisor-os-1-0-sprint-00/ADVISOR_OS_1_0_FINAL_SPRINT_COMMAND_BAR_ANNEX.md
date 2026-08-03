# Advisor OS 1.0 — Final Sprint Command Bar Annex

```text
DOCUMENT=ADVISOR_OS_1_0_FINAL_SPRINT_COMMAND_BAR_ANNEX
STATUS=ACTIVE_CANDIDATE
DATE=2026-08-02
PARENT=ADVISOR_OS_1_0_FINAL_SPRINT
SPRINT=SPRINT_02
SCOPE=RECONCILIATION_AND_PRODUCTIVE_CONNECTION
REBUILD_FROM_ZERO=FORBIDDEN
```

## 1. Purpose

This annex corrects the Sprint 02 interpretation.

Forge already contains a Command Bar / Command Palette implementation family. Sprint 02 must not replace it with a new system unless an existing component is proven unusable. The work is to reconcile the existing assets, select one canonical runtime path and connect it productively to the authenticated Advisor OS shell.

```text
EXISTING_IMPLEMENTATION=YES
PRODUCTIVE_CONNECTION=NO
RECONCILIATION_REQUIRED=YES
FULL_REBUILD=NO
```

## 2. Existing assets

The current repository contains at least:

```text
platform/commands/
├── command-palette.js
├── command-palette-ui.js
├── command-palette-engine.js
├── command-parser-engine.js
├── command-execution-engine.js
└── command-registry.js

rule-packs/smnyl/
└── smnyl-command-palette-engine.js
```

Observed capabilities:

- `Ctrl/Cmd + K` listener exists.
- Modal/palette rendering exists.
- Basic command filtering exists.
- Slash command, entity and free-text parsing concepts exist.
- A preliminary command registry exists.
- A preliminary execution engine exists.
- SMNYL-specific command entries exist.

## 3. Current limitations

The implementation is not yet productive because:

- the authenticated app shell does not initialize the palette;
- two different UI implementations coexist;
- multiple command catalogs use incompatible identifiers and routes;
- results render without complete selection and execution behavior;
- no canonical Router/Navigation adapter is connected;
- no productive person/entity resolver is connected;
- no governed write preview exists;
- no confirmation receipt exists;
- natural-language parsing does not yet resolve productive commands;
- mobile access is not defined;
- the legacy AI chat shell is separate and must not be mistaken for Command Bar.

```text
CODE_EXISTS=YES
APP_MOUNT=FAIL
SEARCH=BASIC_PARTIAL
SELECTION=FAIL
EXECUTION=FAIL
ROUTER_BINDING=FAIL
ENTITY_RESOLUTION=FAIL
WRITE_CONFIRMATION=FAIL
MOBILE_ENTRYPOINT=FAIL
```

## 4. Canonical Sprint 02 name

Replace the ambiguous interpretation:

```text
SPRINT_02=COMMAND_BAR_PRODUCTIVE_CONNECTION
```

with:

```text
SPRINT_02=COMMAND_BAR_RECONCILIATION_AND_PRODUCTIVE_CONNECTION
```

## 5. Reuse-first rule

Sprint 02 must follow this order:

```text
INVENTORY
→ RUNTIME_PROOF
→ SELECT_CANONICAL_UI
→ SELECT_CANONICAL_REGISTRY
→ NORMALIZE_COMMAND_CONTRACT
→ CONNECT_AUTHENTICATED_SHELL
→ CONNECT_NAVIGATION_AND_READS
→ ADD_WRITE_PREVIEW
→ ACCEPTANCE
```

No parallel replacement implementation may be introduced before the current assets are tested.

## 6. Canonical responsibility boundaries

Command Bar owns:

- global text entry;
- command discovery;
- command search;
- entity-query initiation;
- intent routing;
- preview presentation;
- navigation to productive contexts;
- presentation of execution receipts.

Command Bar does not own:

- Pipeline truth;
- person identity truth;
- policy truth;
- payment truth;
- activity truth;
- Calendar truth;
- business recommendation logic;
- direct autonomous mutation.

```text
COMMAND_BAR_IS_ROUTER_AND_INPUT_SURFACE=YES
COMMAND_BAR_IS_SOURCE_OF_TRUTH=NO
COMMAND_BAR_IS_BUSINESS_AUTHORITY=NO
```

## 7. Canonical command contract

Every command must resolve to a normalized envelope:

```text
command_id
intent_type
input_mode
subject_reference
parameters
source_context
requires_confirmation
handler_authority
preview_model
execution_status
receipt_reference
```

Intent types:

```text
NAVIGATE
SEARCH
READ
DRAFT
WRITE
EXTERNAL_HANDOFF
```

Rules:

```text
NAVIGATE=IMMEDIATE
SEARCH=IMMEDIATE
READ=IMMEDIATE_WHEN_AUTHORIZED
DRAFT=REVIEWABLE
WRITE=CONFIRMATION_REQUIRED
EXTERNAL_HANDOFF=NOT_SUCCESS_UNTIL_CONFIRMED_BY_AUTHORITY
AMBIGUOUS_INTENT=NO_EXECUTION
```

## 8. Required reconciliation decisions

Sprint 02 must produce explicit decisions for:

1. Canonical UI implementation.
2. Canonical command registry.
3. Canonical parser entrypoint.
4. Canonical execution adapter.
5. Canonical route vocabulary.
6. SMNYL rule-pack extension mechanism.
7. Entity resolution boundary.
8. Write-preview contract.
9. Command receipt contract.
10. Mobile invocation pattern.

Duplicate or superseded assets may be deprecated only after the productive path passes acceptance.

## 9. Initial productive command set

### Navigation and search

```text
Abrir Home
Abrir Pipeline
Abrir Actividad
Abrir Cotizaciones
Abrir Cartera
Abrir Reportes
Abrir Forecast
Abrir Comisiones
Buscar persona
Buscar póliza
```

### Read commands

```text
¿A quién debo llamar hoy?
Muéstrame seguimientos vencidos.
¿Cómo voy contra mi meta?
¿Qué citas tengo hoy?
Busca la póliza de Mariana López.
```

### Governed write commands

```text
Registra que hablé con Juan y lo llamo el jueves.
Agenda a Mariana mañana a las seis.
Crea una cotización para Laura.
Registra que Pedro no asistió y prepara reagendamiento.
```

Write commands must produce a preview before persistence.

## 10. Benvenù, Clippy and low-friction input integration

Benvenù may introduce Command Bar through one useful action, not a tutorial.

Clippy may suggest Command Bar only when it reduces the current workflow and must stop suggesting it after demonstrated mastery.

Low-friction input may use Command Bar as the global text/voice entry surface, but natural-language extraction remains a draft until confirmed.

```text
BENVENU_INTRODUCES_VALUE=YES
CLIPPY_TEACHES_IN_CONTEXT=YES
COMMAND_BAR_CAPTURES=YES
NATURAL_LANGUAGE_IS_DRAFT=YES
USER_CONFIRMATION_CREATES_TRUTH=YES
```

## 11. Sprint 02 deliverables

- Existing implementation runtime audit.
- Canonical asset decision record.
- One mounted authenticated Command Bar.
- Keyboard invocation.
- Mobile invocation.
- Search and result selection by keyboard and touch.
- Escape/close/focus lifecycle.
- Canonical route navigation.
- Entity search adapter.
- Read command adapters.
- Write preview and confirmation.
- Execution receipt.
- Logout scrub and late-result rejection.
- Deprecated-path register.

## 12. Exit criteria

```text
EXISTING_ASSET_AUDIT=PASS
CANONICAL_UI_SELECTED=PASS
CANONICAL_REGISTRY_SELECTED=PASS
DUPLICATE_CONTRACTS_RECONCILED=PASS
AUTHENTICATED_APP_MOUNT=PASS
CTRL_CMD_K=PASS
MOBILE_ENTRYPOINT=PASS
KEYBOARD_SELECTION=PASS
TOUCH_SELECTION=PASS
ESCAPE_AND_FOCUS_LIFECYCLE=PASS
CANONICAL_NAVIGATION=PASS
ENTITY_SEARCH=PASS
READ_COMMANDS=PASS
WRITE_PREVIEW=PASS
WRITE_CONFIRMATION=PASS
EXECUTION_RECEIPT=PASS
LOGOUT_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
AUTOMATIC_UNAPPROVED_MUTATIONS=0
REBUILD_FROM_ZERO=NO
```

## 13. Acceptance examples

### A. Navigation

```text
CTRL_OR_CMD_K
→ “pipeline”
→ SELECT_RESULT
→ CANONICAL_PIPELINE_ROUTE
```

### B. Entity search

```text
OPEN_COMMAND_BAR
→ “Mariana López”
→ PERSON_CANDIDATES
→ SELECT_PERSON
→ OPEN_CANONICAL_PERSON_CONTEXT
```

### C. Read command

```text
OPEN_COMMAND_BAR
→ “¿A quién debo llamar hoy?”
→ AUTHORITATIVE_NEXT_ACTION_QUERY
→ RESULTS_WITH_SOURCE_AND_FRESHNESS
```

### D. Governed write

```text
OPEN_COMMAND_BAR
→ “Registra que hablé con Juan y lo llamo el jueves”
→ PERSON_RESOLUTION
→ STRUCTURED_DRAFT
→ USER_REVIEW
→ USER_CONFIRMATION
→ CANONICAL_TIMELINE_AND_NEXT_ACTION_COMMAND
→ RECEIPT
```

## 14. Final ruling

```text
COMMAND_BAR_FOUNDATION=EXISTS
COMMAND_BAR_PRODUCTIVE_RUNTIME=NOT_CONNECTED
SPRINT_02_GOAL=RECONCILE_AND_CONNECT
NEW_PARALLEL_COMMAND_BAR=FORBIDDEN
```

The shortest path is not to build Alfred again. It is to turn the existing Command Bar assets into one governed, mounted and productive Advisor OS interaction surface.

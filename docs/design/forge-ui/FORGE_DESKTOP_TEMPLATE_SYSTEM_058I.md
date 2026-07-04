# Forge Desktop Template System 058I

Status: DRAFT LOCKED FOR REVIEW

Decision token:
DECISION=FORGE_DESKTOP_TEMPLATE_SYSTEM_058I

## Design Principle

Forge desktop is a command-first professional workspace.

Mobile is for fast actions. Desktop is for dense work: quotes, policies, clients,
pipeline, reporting, document review and operational decisions.

Desktop should feel closer to Salesforce, Excel and a premium command center than
to an enlarged mobile dashboard.

## Desktop Skeleton

The canonical desktop skeleton is:

1. Sidebar.
2. Header.
3. Command workspace.
4. Alfred decision strip.
5. KPI / graph strip when useful.
6. Main workspace.
7. Secondary panel or right rail when useful.

## Command Workspace Rules

- Always visible above the fold.
- Supports natural commands and slash commands.
- Shows grouped suggestions.
- Shows preview state before action.
- Never executes in static preview.
- Must reduce clicks to module destinations.

Example command groups:

| Intent | Examples |
| --- | --- |
| Quote | `/cotizar GMM Lariza`, `/cotizar Vida Octavio` |
| Documents | `/subir poliza`, `/revisar documentos` |
| Follow-up | `/follow Juan`, `/llamar Lariza` |
| Search | `/buscar cliente Maria`, `/abrir poliza` |
| Reports | `/reporte comisiones`, `/actividad 25 puntos` |

## Alfred Decision Strip Rules

Alfred lives above operational work, not as decoration.

The strip answers:

- what matters now;
- who is affected;
- why now;
- what preview should be prepared.

Recommended format:

| Slot | Example |
| --- | --- |
| Kicker | Seguimiento en riesgo |
| Primary | Lariza requiere accion hoy |
| Reason | 3 clientes pueden enfriarse si no hay seguimiento. |
| CTA | Preparar preview |

## Main Workspace Rules

Use tables when the user needs to compare rows.

Use split view when a row selection needs detail.

Use charts when the user needs trends, distribution or progress against goal.

Use cards only when each object is a summary module, not when a table would be more
efficient.

## Template: Command Table

Use for high-density operational lists.

Required:

- command workspace;
- decision strip;
- filter/KPI strip when useful;
- table with stable columns;
- row actions that never split;
- optional secondary panel.

Avoid:

- oversized cards;
- decorative graphs that do not aid decisions;
- right rail overlay.

## Template: Document Workflow

Use for quotes, policies and document-heavy tasks.

Required:

- document queue;
- selected document / quote preview;
- status and missing requirement labels;
- approval state;
- Alfred limits and next step.

## Template: Analytics

Use for reports, commissions, activity and 25-point systems.

Required:

- compact KPI row;
- chart canvas;
- drilldown table;
- Alfred interpretation;
- export/download affordance later, not in static preview.

## Template: Record Detail

Use for clients, policies, quotes and follow-up detail.

Required:

- record identity header;
- scoped command bar;
- summary strip;
- timeline or activity table;
- related documents/actions.

## Template: Review And Approval

Use for any action before future execution.

Required:

- preview summary;
- payload-like plain-language explanation;
- limitations;
- approval controls;
- visible no-send/no-CRM/no-calendar boundary in static preview.

## Charts And Graphs

Desktop charts must be useful, compact and connected to a decision.

Allowed chart roles:

- production expected;
- commissions;
- 25-point activity;
- follow-up risk trend;
- conversion probability;
- gap recovery.

Do not use charts as decorative filler.

## Alfred Mark Rules

- Use one canonical bow tie.
- Profile avatar is not Alfred.
- Alfred mark may have halo when active.
- Do not use letters A/F for Alfred.
- Do not use infinity as Alfred.
- Do not use shield-like marks.

## Density Rules

- Desktop prefers dense, readable tables.
- Keep row rhythm consistent.
- Avoid huge vertical gaps before the main workspace.
- Do not depend on zoom-out to use the app.
- 1366x768 must remain useful.

## Desktop Module Defaults

| Screen | Template | First Useful Thing |
| --- | --- | --- |
| Inicio | Command Table | Priorities and follow-up risk. |
| Pipeline | Command Table | Deals by stage and probability. |
| Clientes | Command Table | Clients needing attention. |
| Cotizaciones | Document Workflow | Active quote queue and selected quote. |
| Polizas | Document Workflow | Missing docs and policy status. |
| Reportes | Analytics | Production, commissions, 25 points. |
| Alfred | Review And Approval | Command history and pending previews. |

## Final Decision

DECISION=FORGE_DESKTOP_TEMPLATE_SYSTEM_058I

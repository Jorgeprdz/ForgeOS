# Forge Desktop Template System Scope 058I

Status: SCOPED

Decision token:
DECISION=PASS_058I_DESKTOP_TEMPLATE_SYSTEM_SCOPE

Next:
NEXT=058J_DESKTOP_TEMPLATE_SYSTEM_DOCS_LOCK

## Purpose

058I defines the desktop template system that future Forge screens and modules must
use after the desktop visual baseline was stabilized.

This is intentionally before engine reconnection. The UI needs a stable desktop
template language before action contracts and module engines are wired.

## Locked Context

Desktop is no longer a stretched mobile surface.

The current desktop baseline is built from:

- 058A desktop/mobile layer separation;
- 058C desktop workspace composition contract;
- 058D desktop shell grid repair;
- 058E desktop command workspace upgrade;
- 058F table, KPI and graph density;
- 058G visual polish and canonical Alfred mark lock;
- 058H desktop visual QA evidence / local validation.

Mobile remains protected. Desktop modules must not import mobile layout patterns
unless explicitly documented as shared Forge UI tokens.

## Non-Negotiables

1. Fewer clicks remains non-negotiable.
2. Command bar remains the primary action surface.
3. Alfred provides decision context before operational work.
4. Tables are the default for dense desktop workflows.
5. Cards are for summaries, not for replacing professional data grids.
6. Right rail is contextual and never overlays the main workspace.
7. Bow tie identity stays canonical across desktop and mobile.
8. Desktop must feel like a professional system, not a tablet app.
9. No runtime execution from static preview UI.
10. Human approval remains explicit before any future action.

## Desktop Template Lanes

Every desktop screen must declare which lanes it uses.

| Lane | Required | Purpose |
| --- | --- | --- |
| Sidebar | Yes | Primary module navigation and user anchor. |
| Header | Yes | Screen title, status and profile controls. |
| Command Workspace | Yes | Universal command input and quick destinations. |
| Alfred Decision Strip | Usually | Explains why the next workspace matters. |
| KPI / Graph Strip | Optional | Compact decision metrics, not oversized widgets. |
| Main Workspace | Yes | Table, workflow, split view or editor. |
| Secondary Panel | Optional | Motor, detail, preview or comparison panel. |
| Right Rail | Optional | Persistent Alfred context on wide desktop only. |

## Template Families

### Command Table Template

Use for:

- Pipeline
- Clientes
- Oportunidades
- Cotizaciones list
- Polizas list
- Follow-up queue

Structure:

1. Header.
2. Command workspace.
3. Alfred decision strip.
4. KPI / filter strip.
5. Main table.
6. Optional detail or right rail.

### Document Workflow Template

Use for:

- Subir poliza
- Cotizar GMM
- Cotizar Vida
- Documents pending review
- Attachments and evidence

Structure:

1. Header.
2. Command workspace.
3. Workflow status strip.
4. Split workspace: document queue + selected document preview.
5. Right rail: requirements, missing fields, approval state.

### Analytics Template

Use for:

- Reportes
- Comisiones
- Actividad / 25 puntos
- Production trends
- Gap and goal tracking

Structure:

1. Header.
2. Command workspace.
3. KPI summary strip.
4. Chart canvas area.
5. Supporting tables below.
6. Right rail with Alfred interpretation.

### Record Detail Template

Use for:

- Client profile
- Policy detail
- Quote detail
- Follow-up detail

Structure:

1. Header with record identity.
2. Command workspace scoped to record.
3. Alfred decision strip for current record.
4. Record summary strip.
5. Tabs or split detail panels.
6. Timeline / activity table.

### Review / Approval Template

Use for:

- Preview before send.
- Preview before calendar.
- Preview before CRM write.
- Preview before quote generation.

Structure:

1. Header.
2. Command workspace.
3. Preview summary.
4. Risk / limitation panel.
5. Human approval controls.
6. Execution remains disabled in static preview.

## Module Mapping

| Module | Primary Template | Main Workspace |
| --- | --- | --- |
| Inicio | Command Table + KPI | Today priorities and follow-up table. |
| Pipeline | Command Table | Opportunity pipeline table. |
| Clientes | Command Table / Record Detail | Client list, detail, timeline. |
| Cotizaciones | Document Workflow | Quote queue, quote builder, comparison. |
| Polizas | Document Workflow | Policy upload, missing docs, review status. |
| Reportes | Analytics | Graphs, commissions, activity, 25 points. |
| Alfred | Review / Approval | Commands, previews, limitations, history. |

## Breakpoint Contract

| Width | Name | Behavior |
| --- | --- | --- |
| 901-1199 | Compact desktop | Sidebar + single main column; rail below. |
| 1200-1399 | Laptop desktop | Sidebar + main; secondary panel can sit below or narrow. |
| 1400-1599 | Standard desktop | Main table + secondary panel possible. |
| 1600-1919 | Wide desktop | Right rail can become persistent lane. |
| 1920+ | Workstation | Full command, data and rail lanes. |

Desktop must remain usable at 1366x768 without depending on browser zoom-out.

## What Must Not Happen

- Do not show mobile bottom nav on desktop.
- Do not show mobile widget grid on desktop.
- Do not let the right rail overlay the table.
- Do not make desktop widgets oversized like mobile cards.
- Do not hide the command bar below the fold.
- Do not introduce raw profile/debug text at the canvas bottom.
- Do not split action labels such as Revisar, Follow, Cotizar or Abrir.
- Do not create a new Alfred mark per module.

## Source Of Truth

This scope establishes the next source-truth task:

058J_DESKTOP_TEMPLATE_SYSTEM_DOCS_LOCK

058J must turn this scope into locked reusable documentation and a checklist that
future desktop module work must pass before implementation.

## Final Decision

DECISION=PASS_058I_DESKTOP_TEMPLATE_SYSTEM_SCOPE

NEXT=058J_DESKTOP_TEMPLATE_SYSTEM_DOCS_LOCK

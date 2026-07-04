# Forge Desktop Template System Lock 058J

Status: LOCKED

Decision token:
DECISION=PASS_058J_DESKTOP_TEMPLATE_SYSTEM_DOCS_LOCK

Next:
NEXT=059A_UI_ACTION_CONTRACT_SCOPE

## Purpose

058J locks the desktop template system for future Forge modules and screens.

This document is the desktop implementation contract after the desktop visual baseline
was stabilized through 058H.

## Desktop Product Philosophy

Forge desktop is a professional operating workspace.

It is not:

- a stretched mobile screen;
- a decorative dashboard;
- a tablet-style card canvas;
- a place to hide actions behind many clicks.

It is:

- command-first;
- dense but readable;
- table-friendly;
- graph-aware;
- approval-safe;
- guided by Alfred decision context.

## Canonical Desktop Skeleton

Every desktop module must map to this skeleton:

1. Sidebar.
2. Header.
3. Command workspace.
4. Alfred decision strip.
5. KPI / graph strip when useful.
6. Main workspace.
7. Secondary panel when useful.
8. Right rail when useful and width permits.

## Required Lanes

| Lane | Required | Rule |
| --- | --- | --- |
| Sidebar | Yes | Stable navigation, never module-specific chaos. |
| Header | Yes | Screen identity and status. |
| Command workspace | Yes | Primary action surface, visible above fold. |
| Alfred decision strip | Usually | Explains why the workspace matters now. |
| Main workspace | Yes | Table, workflow, editor, analytics or record detail. |
| Right rail | Optional | Context only; never overlays main workspace. |

## Template Families

### Command Table

Use when comparing many operational rows.

Examples:

- Pipeline
- Clientes
- Oportunidades
- Follow queue
- Search results

### Document Workflow

Use when the task is document, quote or policy heavy.

Examples:

- Cotizaciones
- Polizas
- Upload review
- Missing documents

### Analytics

Use when the task is trend, target, commission or activity analysis.

Examples:

- Reportes
- Comisiones
- 25 points
- Production history

### Record Detail

Use when one object owns the screen.

Examples:

- Client detail
- Policy detail
- Quote detail
- Opportunity detail

### Review And Approval

Use before any future action.

Examples:

- Message preview
- Call prep
- CRM update preview
- Calendar preview
- Quote generation preview

## Module Template Mapping

The module mapping is locked in:

- Inicio: Command Table + KPI / graph strip.
- Pipeline: Command Table.
- Clientes: Command Table and Record Detail.
- Cotizaciones: Document Workflow.
- Polizas: Document Workflow.
- Reportes: Analytics.
- Alfred: Review And Approval plus command history.

## Breakpoint Rules

Desktop starts at 901px.

| Width | Behavior |
| --- | --- |
| 901-1199 | Compact desktop. Single main column; rail below. |
| 1200-1399 | Laptop desktop. Main table owns width; rail remains below or contextual. |
| 1400-1599 | Standard desktop. Main plus secondary panel possible. |
| 1600-1919 | Wide desktop. Right rail may become persistent. |
| 1920+ | Workstation. Full lanes allowed. |

## Alfred Rules

- Alfred mark is canonical bow tie.
- Alfred mark is not the user profile avatar.
- Alfred mark is not a letter.
- Alfred mark is not an infinity symbol.
- Alfred explains decisions before action.
- Alfred never silently executes.

## Command Rules

Every desktop screen must support command-first navigation or action preview.

The command workspace may include:

- free text;
- slash command;
- grouped suggestions;
- preview state;
- safe action labels.

It must not:

- execute directly;
- write CRM;
- create calendar events;
- send messages;
- hide required approval.

## Graph Rules

Graphs are allowed when they improve decisions.

Use graphs for:

- production;
- commissions;
- 25-point activity;
- risk trend;
- conversion probability;
- gap recovery.

Do not use graphs as decorative filler.

## Desktop Acceptance Standard

A new desktop screen is not accepted unless:

- it maps to a template family;
- command workspace is above fold;
- main workspace is clear;
- right rail does not overlay;
- mobile layers are not visible;
- table/action labels do not split awkwardly;
- Alfred mark is consistent;
- safety boundary is visible where actions are previewed.

## Locked Outcome

058J closes desktop template documentation and authorizes the next step:

059A_UI_ACTION_CONTRACT_SCOPE

## Final Decision

DECISION=PASS_058J_DESKTOP_TEMPLATE_SYSTEM_DOCS_LOCK

NEXT=059A_UI_ACTION_CONTRACT_SCOPE

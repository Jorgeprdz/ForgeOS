# Forge Interaction Rules 001

Status: DRAFT / INTERACTION RULES

## Primary Rule

Forge must reduce clicks without removing human authority.

## Action Hierarchy

1. Recommended next best action.
2. Preview.
3. Human approval.
4. Execution only in authorized runtime.

Static preview stops at preview.

## Click Rules

Good clicks:

- open preview;
- focus command bar;
- reveal context;
- switch Smart Widget;
- navigate to module;
- open profile menu.

Bad clicks:

- hidden action behind unlabeled icon;
- duplicate action in multiple places with different behavior;
- action that looks executable but is preview-only without saying so;
- menu nesting for frequent tasks.

## Safety States

Required static-preview language:

- Solo lectura.
- Preview.
- Requiere aprobacion humana.
- Sin envio.
- Sin CRM.
- Sin calendario.

But do not repeat all safety text in every component.
Use local safety only where it affects the action.

## Profile Menu

The greeting avatar starts as placeholder.
Future Google Auth replaces it with profile photo.

Profile menu candidates:

- Ver perfil.
- Tema claro / oscuro.
- Cuenta Google.
- Cerrar sesion.

## Command Examples

- `/Llamar Lariza ahora`
- `/Mandar mensaje Octavio`
- `/Follow Juan`
- `/Cotizar GMM Lariza`
- `/Subir poliza`
- `/Resumen pipeline`

## Decision

DECISION=FORGE_INTERACTION_RULES_001_DRAFT_LOCKED

# Forge Local Read Model Source Adapter Contract 060H

Status: CONTRACT_SCOPED

Decision:
DECISION=FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_CONTRACT_060H

Next:
NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

## Selected Source

`docs/evidence/forge-selected-engine-dry-run-audit-060e.json`

## Contract

`local_read_model_source_adapter` turns the selected audit JSON into a UI-safe report read model.

## Output Shape

| Field | Required Value |
| --- | --- |
| `sourceType` | `repo_local_read_model_source` |
| `sourcePath` | selected source path |
| `readModelStatus` | `LOCAL_READ_MODEL_READY` or `LOCAL_READ_MODEL_REFUSED` |
| `previewMode` | true |
| `requiresHumanApproval` | true |
| `executionAllowed` | false |
| `writesAllowed` | false |
| `sendAllowed` | false |
| `calendarAllowed` | false |
| `crmAllowed` | false |

## UI Language

Allowed:

- Preview local
- Lectura auditada
- Fuente local
- Revisar reporte

Forbidden:

- Fuente viva
- Sincronizado
- Enviado
- Ejecutado

## Final Decision

DECISION=FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_CONTRACT_060H

NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

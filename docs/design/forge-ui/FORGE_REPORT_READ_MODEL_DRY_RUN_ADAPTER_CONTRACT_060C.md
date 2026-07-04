# Forge Report Read Model Dry Run Adapter Contract 060C

Status: CONTRACT_SCOPED

Decision:
DECISION=FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C

Next:
NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

## Contract

The first selected engine adapter is a report/read-model preview adapter.

It is a bridge from:

`report.open.preview`

to:

`selected.report_read_model_preview`

## Input Shape

| Field | Required Value |
| --- | --- |
| `packetVersion` | `059B.static.preview` or successor |
| `actionId` | `report.open.preview` |
| `previewMode` | true |
| `requiresHumanApproval` | true |
| `selectedCandidate` | `selected.report_read_model_preview` |

## Output Shape

| Field | Required Value |
| --- | --- |
| `dryRunStatus` | `DRY_RUN_ACCEPTED` or `DRY_RUN_REFUSED` |
| `adapterCandidate` | `report_read_model_dry_run` |
| `selectedCandidate` | `selected.report_read_model_preview` |
| `previewMode` | true |
| `requiresHumanApproval` | true |
| `executionAllowed` | false |
| `writesAllowed` | false |
| `sendAllowed` | false |
| `calendarAllowed` | false |
| `crmAllowed` | false |

## UI Language

Allowed labels:

- Preparar reporte
- Ver preview
- Revisar lectura
- Preview seguro

Forbidden labels:

- Enviar
- Guardar en CRM
- Crear evento
- Ejecutar motor
- Aprobar automaticamente

## Final Decision

DECISION=FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C

NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

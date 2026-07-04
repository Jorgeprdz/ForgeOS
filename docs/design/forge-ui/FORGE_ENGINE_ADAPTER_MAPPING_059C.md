# Forge Engine Adapter Mapping 059C

Status: MAPPING SCOPED

Decision token:
DECISION=FORGE_ENGINE_ADAPTER_MAPPING_059C

Next:
NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

## Canonical Mapping

| UI action id | Source module | Candidate adapter | Execution status |
| --- | --- | --- | --- |
| `quote.create.preview` | Cotizaciones | Static quote adapter | Not executable |
| `policy.upload.preview` | Polizas | Static document intake adapter | Not executable |
| `client.follow.preview` | Clientes | Static follow-up draft adapter | Not executable |
| `client.call.preview` | Clientes | Static call-prep adapter | Not executable |
| `client.message.preview` | Clientes | Static message draft adapter | Not executable |
| `client.search.preview` | Clientes | Static client read adapter | Not executable |
| `policy.open.preview` | Polizas | Static policy read adapter | Not executable |
| `report.open.preview` | Reportes | Static report read adapter | Not executable |
| `pipeline.review.preview` | Pipeline | Static pipeline review adapter | Not executable |
| `day.review.preview` | Inicio | Static daily review adapter | Not executable |

## Required Adapter Defaults

| Field | Required value before reconnect |
| --- | --- |
| `previewMode` | `true` |
| `requiresHumanApproval` | `true` |
| `executionAllowed` | `false` |
| `writesAllowed` | `false` |
| `sendAllowed` | `false` |
| `calendarAllowed` | `false` |
| `crmAllowed` | `false` |

## Final Decision

DECISION=FORGE_ENGINE_ADAPTER_MAPPING_059C

NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

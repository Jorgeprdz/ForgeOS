# Forge Selected Engine Dry Run Adapter Scope 060C

Status: SCOPED

Decision token:
DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

Next:
NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

## Human Summary

Forge now knows which real-engine path should be tested first: report/read-model preview.

060C defines the adapter contract for that selected path. It still does not connect a real provider or execute a real engine.

## Selected Adapter

| Field | Value |
| --- | --- |
| UI action id | `report.open.preview` |
| Selected candidate | `selected.report_read_model_preview` |
| Adapter kind | `report_read_model_dry_run` |
| Output type | preview report read model |
| Execution status | dry-run only |

## Accepted Input

The adapter may accept a static action packet when:

- `actionId` is `report.open.preview`;
- `previewMode` is true;
- `requiresHumanApproval` is true;
- source surface is desktop command workspace or a future approved report surface;
- selected candidate is `selected.report_read_model_preview`.

## Required Output

The dry-run adapter output must include:

- `dryRunStatus`;
- `adapterCandidate`;
- `selectedCandidate`;
- `previewMode`;
- `requiresHumanApproval`;
- `executionAllowed: false`;
- `writesAllowed: false`;
- `sendAllowed: false`;
- `calendarAllowed: false`;
- `crmAllowed: false`;
- an evidence summary suitable for UI preview.

## Refusal Rules

The adapter must refuse:

| Reason | Meaning |
| --- | --- |
| `UNKNOWN_ACTION_ID` | Action id is not `report.open.preview`. |
| `MISSING_HUMAN_APPROVAL_GATE` | Packet does not preserve approval requirement. |
| `NOT_PREVIEW_MODE` | Packet is not preview-only. |
| `WRONG_SELECTED_CANDIDATE` | Candidate is not the selected report read model path. |

## Implementation Boundary For 060D

060D may implement a static dry-run adapter for `report.open.preview`.

060D must not:

- call live providers;
- fetch remote data;
- write browser storage;
- create source-truth records;
- send messages;
- write CRM;
- create calendar events;
- execute a real engine.

## Final Decision

DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

# Forge Selected Local Read Model Source Adapter Scope 060H

Status: SCOPED

Decision token:
DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE

Next:
NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

## Human Summary

060G selected the local JSON source. 060H defines the adapter contract for reading it safely.

This phase does not implement the adapter. It only defines what 060I may build.

## Selected Source

`docs/evidence/forge-selected-engine-dry-run-audit-060e.json`

## Adapter Name

`local_read_model_source_adapter`

## Adapter Responsibility

The adapter may read the selected committed JSON source and transform its accepted report preview into a local read-model preview.

## Required Inputs

| Field | Requirement |
| --- | --- |
| source path | `docs/evidence/forge-selected-engine-dry-run-audit-060e.json` |
| accepted status | `DRY_RUN_ACCEPTED` |
| action id | `report.open.preview` |
| selected candidate | `selected.report_read_model_preview` |
| preview mode | true |
| human approval | required |

## Required Output

The adapter output must include:

- `sourceType: repo_local_read_model_source`;
- `sourcePath`;
- `readModelStatus`;
- `reportPreview`;
- `previewMode`;
- `requiresHumanApproval`;
- all action permissions false.

## Refusal Rules

| Reason | Meaning |
| --- | --- |
| `SOURCE_NOT_FOUND` | Selected local source is missing. |
| `SOURCE_NOT_JSON` | Selected source is not parseable JSON. |
| `SOURCE_NOT_ACCEPTED` | Source does not contain an accepted dry-run path. |
| `WRONG_ACTION_ID` | Source is not for `report.open.preview`. |
| `MISSING_REPORT_PREVIEW` | Source lacks preview content. |

## 060I Boundary

060I may implement a static local-source adapter that reads the selected committed JSON file at build/runtime preview level.

060I must not:

- connect a live provider;
- mutate the selected JSON;
- write browser storage;
- write CRM;
- create calendar events;
- send messages;
- create source-truth records;
- execute a real engine.

## Final Decision

DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE

NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

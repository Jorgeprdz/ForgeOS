# Forge Selected Engine Candidate Boundary 060B

Status: SELECTED

Decision token:
DECISION=FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B

Next:
NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

## UI Candidate

The selected UI action is:

`report.open.preview`

The UI should continue to label this as:

- Abrir preview
- Ver reporte
- Preparar reporte
- Revisar

The UI must not label this as:

- Ejecutar reporte oficial
- Guardar verdad
- Actualizar CRM
- Enviar

## Selected Adapter Candidate

`selected.report_read_model_preview`

## Output Expectation

The next adapter scope should output a preview payload with:

- report title;
- visible assumptions;
- static evidence reference;
- no live provider claim;
- no business truth creation;
- human review reminder.

## Final Decision

DECISION=FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B

NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

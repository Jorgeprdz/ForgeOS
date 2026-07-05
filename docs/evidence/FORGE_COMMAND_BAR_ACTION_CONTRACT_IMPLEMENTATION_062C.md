# Forge Command Bar Action Contract Implementation 062C

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK

062C binds the command bar to a local preview-safe read model and action registry.

Validation targets:

- `/quick actions` lists contract-backed commands.
- `/cotizar`, `follow`, `revisar`, `abrir`, and `preview` resolve through known command tokens.
- selecting a command prepares a preview-only status.
- no external effect is executed.

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK

# Forge Command Bar Restore Input Repair 060V

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK

060V addresses the public QA finding that 060U removed the entire command bar. It restores the shell/input path and limits hiding to fixed secondary content below the input row.

Validation:
- runner syntax check;
- static preview JS syntax check;
- cache bust updated to `060v`;
- safety scan clean.

Expected visual behavior:
- command bar visible;
- command bar editable;
- no fixed `/cotizar` result under the bar when closed;
- results appear only through the search overlay after input text.

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK

# Forge Command Bar Search Overlay Polish Implementation 060S

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK

060S addresses the visual QA finding that the open command search felt like an internal expanded card instead of a premium overlay.

Repair behavior:

- keeps the command bar clickable and editable;
- keeps empty click from showing a results panel;
- collapses static suggestions only when a real query is active;
- positions the results panel as a floating overlay relative to the command surface;
- removes the dead vertical gap under the command bar during active search;
- preserves the safe preview behavior and no-action boundaries.

Validation:

- runner shell syntax checked;
- command interaction JavaScript syntax checked;
- index cache-bust checked;
- overlay polish markers checked;
- whitespace check passed;
- safety scan passed.

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK

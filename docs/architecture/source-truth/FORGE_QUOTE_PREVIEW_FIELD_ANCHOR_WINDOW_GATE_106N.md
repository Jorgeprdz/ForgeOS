# Forge Quote Preview Field Anchor Window Gate 106N

PHASE=106N_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_GATE
STATUS=PASS
DECISION=PASS_106N_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_GATE
LOCKED_DECISION=FIELD_ANCHOR_WINDOW_GATE_LOCKED_WITH_NO_VALUE_EXTRACTION_NO_PARSER_NO_QUOTE_TRUTH
NEXT=106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN

## En humano

106N defines the safe window around each mapped label.

It does not read the raw PDF.

It does not read raw text.

It does not extract values.

It only prepares rules like:

- look one redacted line before the anchor label;
- look up to four redacted lines after the anchor label;
- keep the result redacted;
- treat the window as context, not truth.

## Result

CRITICAL_TARGET_COUNT=6

ANCHOR_COVERED_CRITICAL_TARGET_COUNT=6

## Still Forbidden

- raw PDF access;
- raw text access;
- value extraction;
- field candidate extraction;
- OCR execution;
- parser execution;
- calculator execution;
- quote truth;
- official quote;
- UI population;
- backend connection;
- CRM write;
- prompt generation;
- presentation generation;
- real effects.

## Next

NEXT=106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN

# 107Z7R — ADR targeted revision evidence

Status: **PASS**

- Failed check: `ADR_0027_RULE_ALIGNED`
- Label: Draft aligns with no hidden latest-rule defaults
- Prior evidence: ADR-0027 and draft both require explicit selection
- Revision scope: `TARGETED_SINGLE_CHECK_ONLY`
- ADR status: `DRAFT_REVISED`
- ADR approved: `false`
- Implementation authorized: `false`

## Applied revision

## Explicit alignment with ADR-0027

This draft explicitly adopts ADR-0027, **No hidden latest-rule defaults**, as
a binding rule for the preview-result persistence contract.

The reader must receive an explicit, versioned preview-result identity. It
must never select a record through an implicit `latest`, global-most-recent,
last-written, newest-timestamp, or other hidden default.

The writer must return the exact identity that was persisted. The event
`forge:quote-preview:extraction-ready` may carry that identity, but it must
not carry authority to select another record.

Any implementation that falls back to a hidden latest record automatically
fails this ADR and must remain blocked.

## ADR-0027 candidates discovered

- `docs/02-adr-candidates/ADR-0027_COMPENSATION_RULE_PACK_BOUNDARY.md`

## Safety receipt

```text
NEW_ENGINE_CREATED=false
NEW_CACHE_CREATED=false
DUPLICATE_BRIDGE_CREATED=false
PDF_READ_EXECUTED=false
PARSER_EXECUTED=false
OCR_EXECUTED=false
SOURCE_UI_CHANGED=false
QUOTE_TRUTH_ALLOWED=false
```

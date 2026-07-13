# R15M2C ORVI Responsive Navigation And Direct PDF Status Copy Evidence

## Gate

- Baseline: `5f33ff6bec600ee57e1d01b75cedaee677b2696a`.
- Branch and upstream at start: `main`, exact baseline, divergence `0/0`.
- Worktree at start: clean.
- Browser: Chromium 138.
- Public test files: 34 unique PASS.
- Private direct-PDF browser and visual regression: PASS.
- Screenshots opened and inspected: 9 of 9.
- Client PDF, temporary JSON, screenshots and PII committed: NO.

## Browser evidence

At 390 px, Chromium measured `Recuperación` and `garantizada` as the only two visual lines. No single-letter line or internal word break was present. Both controls exceeded 44 px in height, retained complete accessible labels, and changed `aria-pressed` with the active view.

At 360 px and 390 px, document scroll width did not exceed client width. Shared disclosures remained visible when switching views.

At 1024 px, the third future-protection card and third guaranteed-recovery card were centered. Each matched the corresponding first card's width. At 1440 px both views retained three cards in one row.

The real ORVI PDF completed the existing selector and local parser route. The visible ready state said `PDF procesado localmente. Listo para revisar.` The temporary accepted-quote JSON filename was not visible. The help copy confirmed local processing and did not claim that the PDF was unread or unprocessed.

## Financial truth regression

- Real ORVI selector and content detection: PASS.
- Canonical parser/mapper mirrors: unchanged and byte-identical.
- Guaranteed-recovery rows: `6, 6, 6`.
- `Valor en efectivo`: absent.
- Surrender MXN: absent.
- Projected recovery, difference and percentage tests: PASS and unchanged.
- Recommendation: `null`.
- Human decision required: `true`.

## Product regression

- Reusable product-dashboard template: PASS.
- Vida Mujer: PASS.
- Imagina Ser: PASS.
- SeguBeca: PASS, including real Chromium integrations.
- ORVI accepted quote, modal, runtime, dashboard, parser contract, parser, mapper, mirrors, direct PDF route and responsive contracts: PASS.
- `MODULE_TYPELESS_PACKAGE_JSON` warnings were observed and treated as permitted warnings.

## External evidence

- Visual directory: `/storage/emulated/0/ForgeGemini/R15M2C_ORVI_VISUAL_20260713_004933/`.
- Visual report: `/storage/emulated/0/ForgeGemini/R15M2C_ORVI_VISUAL_20260713_004933/visual-inspection-report.md`.
- Screenshots are external and untracked.

## Required markers

```text
STATUS=PASS_RESPONSIVE_NAVIGATION_AND_DIRECT_PDF_STATUS_COPY_POLISH
MOBILE_RECOVERY_LABEL_MAX_LINES=2
MOBILE_ORPHAN_SINGLE_LETTER_LINE=NO
MOBILE_INTERNAL_WORD_BREAK=NO
MOBILE_HORIZONTAL_OVERFLOW=NO
MOBILE_TOUCH_TARGET_MIN_PX=44
MOBILE_ARIA_PRESSED=PASS
TABLET_PROTECTION_THIRD_CARD=CENTERED
TABLET_RECOVERY_THIRD_CARD=CENTERED
DESKTOP_THREE_COLUMN_REGRESSION=PASS
DIRECT_PDF_STATUS_COPY=PDF_PROCESSED_LOCALLY
INTERNAL_ACCEPTED_QUOTE_JSON_FILENAME_VISIBLE=NO
STALE_PDF_NOT_PROCESSED_COPY_VISIBLE=NO
REAL_ORVI_PDF_SELECTOR=PASS
RECOVERY_VISIBLE_ROW_COUNT=6
FINANCIAL_CALCULATIONS_CHANGED=NO
PRODUCT_INTELLIGENCE_CHANGED=NO
RATE_CACHE_CHANGED=NO
PDF_COMMITTED=NO
SCREENSHOTS_COMMITTED=NO
RECOMMENDATION=null
HUMAN_DECISION_REQUIRED=true
MANUAL_VISUAL_ACCEPTANCE=PENDING_USER_REVIEW
NEXT=R15M3_ORVI_MANUAL_VISUAL_ACCEPTANCE_SIGNOFF_AND_RELEASE_CLOSE
```

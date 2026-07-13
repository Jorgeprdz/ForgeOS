# ORVI Mobile Switcher And Tablet Grid Visual Polish — R15M2C

## Status

`PASS_RESPONSIVE_NAVIGATION_AND_DIRECT_PDF_STATUS_COPY_POLISH`

R15M2C is a presentation-only repair between the completed R15M2B engineering gate and the still-pending R15M3 owner signoff. It does not authorize or claim manual visual acceptance.

## Scope and authority

- The reusable product-dashboard template remains authoritative.
- Changes are ORVI-scoped except for truthful copy on the existing direct-PDF upload surface.
- Product Intelligence, the canonical parser, mapper, browser PDF parser, rate cache, modal, extracted fields and R15M2B financial calculations remain unchanged.
- No selector, dashboard, projection or financial label was added or replaced.

## Responsive navigation decision

The mobile switcher uses unequal columns so the longer recovery label receives sufficient width. Button text explicitly uses normal wrapping, normal word breaking and no hyphenation. The accessible name and visible text both remain `Recuperación garantizada`; the label is not abbreviated.

At 390 px the visual lines are exactly:

1. `Recuperación`
2. `garantizada`

Both controls retain a minimum 44 px touch target, visible active state, `aria-pressed`, keyboard semantics and the existing sticky behavior.

## Tablet balance decision

At the tablet breakpoint, exactly three future-protection cards retain two columns and the third card spans the row only as a positioning area while keeping one-card width and centering itself. Guaranteed-recovery sections receive a presentation ordinal at render time; the third section occupies the centered four-column area of the existing eight-column grid. The ordinal changes neither model content nor calculations.

Desktop retains three cards in one row for both views.

## Direct PDF status decision

The canonical browser PDF parser still creates the same temporary in-memory accepted-quote JSON file and dispatches the same change event. The bridge identifies that synthetic handoff from all of the following existing evidence:

- the event is synthetic rather than a user file-selection event;
- the temporary filename follows the accepted-quote suffix;
- the adjacent browser-parser status confirms successful PDF conversion.

Only that handoff receives `PDF procesado localmente. Listo para revisar.` A genuinely user-selected JSON retains its existing JSON-specific filename message. The visible help now states that the PDF is processed locally and is neither uploaded nor published.

## Validation result

- 390 px: two complete recovery-label lines; no orphan letter, internal break or horizontal overflow.
- 360 px: no horizontal overflow and both touch targets remain above 44 px.
- 1024 px: third protection and recovery cards centered at the same width as their first-row peers.
- 1440 px: both three-column arrangements preserved.
- Real direct ORVI PDF: accepted through the existing selector; visible status mentions PDF and exposes no internal JSON filename.
- Guaranteed recovery: exactly six rows per checkpoint; calculations and truth semantics remain those of R15M2B.
- Nine Chromium screenshots were stored and visually opened outside the repository.

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

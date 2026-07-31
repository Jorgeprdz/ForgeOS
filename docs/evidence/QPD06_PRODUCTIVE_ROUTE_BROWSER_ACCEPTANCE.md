# QPD-06 Productive Route and Browser Acceptance

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Branch: `feature/quote-printable-document-closure`

Accepted implementation commit: `e89877552df601d4484f58795602321a45b7f1a9`

GitHub Actions run: `30597926358`

Browser evidence artifact: `qpd06-browser-acceptance`

Artifact ID: `8780843260`

Artifact SHA-256: `dc01b01d4736fa3896e87182a91379cabf5eb6bcd141dca240b08a3962f357b0`

## Productive entrypoint

- `docs/static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.js`
- `docs/static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.css`
- `docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller.js`
- lazy loaded from `forge-accepted-quote-review-snapshot.js`

## Visible human actions

- `Ver versión imprimible`
- `Descargar PDF`
- `Historial`
- `Reabrir`
- A4 and Carta selector

No preview, download, history mutation or external effect executes automatically when a Quote is confirmed.

## Identity and persistence boundary

```text
ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT
→ product-aware printable read model
→ printable HTML preview
→ real PDF binary
→ explicit human download
```

Durable history requires the canonical Cartera 001B receipt:

```text
quoteReference
quoteVersionReference
prospectReference
productReference
snapshotDigest
```

Without that receipt:

- preview remains available;
- explicit PDF download remains available;
- durable history fails closed with `BLOCKED_DURABLE_QUOTE_IDENTITY_REQUIRED`;
- no synthetic Quote identity is created.

## Browser acceptance

Playwright Chromium completed the productive flow across:

| Profile | Viewport | Overflow | Mobile safe area | Preview | Download | History | Reopen |
|---|---:|---:|---:|---|---|---|---|
| mobile | 390 × 844 | 0 px | 104 px | PASS | PASS | PASS | PASS |
| tablet | 800 × 1280 | 0 px | N/A | PASS | PASS | PASS | PASS |
| desktop | 1440 × 900 | 0 px | N/A | PASS | PASS | PASS | PASS |

Each profile produced:

- a real `.pdf` download;
- exactly one append-only printable version;
- idempotent preview-to-download persistence;
- exact historical reopen;
- `automaticDownloadAllowed=false`;
- `automaticSendAllowed=false`;
- `quoteMutationAllowed=false`;
- `recalculationAllowed=false`.

Generated download name:

```text
cotizacion-cliente-qpd-browser-orvi-10-pay-usd-quote-qpd06-browser.pdf
```

## Visual inspection

The accepted screenshots confirm:

- no horizontal viewport overflow;
- responsive modal on mobile, tablet and desktop;
- mobile content reserves space above the deliberately floating navigation pill;
- printable content remains readable without clipping;
- Material-style explicit download CTA;
- preview iframe is sandboxed without script or same-origin privileges;
- modal supports Escape dismissal and live status announcements.

## Acceptance totals

```text
QPD01_CONTRACT=PASS_12_OF_12
QPD02_CONTRACT=PASS_12_OF_12
QPD03_CONTRACT=PASS_14_OF_14
QPD04_CONTRACT=PASS_15_OF_15
QPD05_REPOSITORY=PASS_15_OF_15
QPD05_MIGRATION_SECURITY=PASS_10_OF_10
QPD06_ROUTE_CONTROLLER=PASS_12_OF_12
QPD06_BROWSER_BINDING=PASS_12_OF_12
QPD06_PLAYWRIGHT_CHROMIUM=PASS_1_OF_1
QPD06_RESPONSIVE_PROFILES=PASS_3_OF_3
NODE_SYNTAX=PASS
DIFF_INTEGRITY=PASS
WORKFLOW_RUN=30597926358
WORKFLOW_CONCLUSION=SUCCESS
```

## Honest boundary

```text
PRODUCTIVE_ROUTE_BINDING=IMPLEMENTED
LOCAL_BROWSER_HISTORY=IMPLEMENTED
REAL_PDF_DOWNLOAD=IMPLEMENTED
RESPONSIVE_BROWSER_ACCEPTANCE=IMPLEMENTED
SUPABASE_GATEWAY=IMPLEMENTED_NOT_DEPLOYED
QPD05_REMOTE_MIGRATION=NOT_DEPLOYED
CROSS_DEVICE_REMOTE_ACCEPTANCE=NOT_RUN
CARTERA001B_REMOTE_DEPENDENCY=REQUIRED
MAIN_MUTATION=NONE
```

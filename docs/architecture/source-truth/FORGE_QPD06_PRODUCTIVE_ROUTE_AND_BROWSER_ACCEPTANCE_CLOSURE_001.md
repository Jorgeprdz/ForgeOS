# Forge QPD-06 Productive Route and Browser Acceptance Closure 001

## Decision

`QPD06_PRODUCTIVE_ROUTE_AND_BROWSER_ACCEPTANCE` is implemented and accepted on branch `feature/quote-printable-document-closure`.

The Quote Printable Document runtime is now reachable from the productive Accepted Quote boundary as a separate technical-commercial document experience.

## Canonical chain

```text
Accepted Quote human confirmation
→ ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT
→ QPD product-aware read model
→ A4 or Carta document composition
→ real PDF generation
→ explicit human preview/download
→ optional append-only version history
→ exact historical reopen
```

## Product separation

```text
QUOTE_PRINTABLE_DOCUMENT != SALES_PRESENTATION
```

The printable Quote remains a technical-commercial record. It does not become a 16:9 narrative deck and does not replace the Sales Presentation runtime.

## Productive UI authority

The Accepted Quote boundary lazy-loads QPD-06 in browser contexts only.

The visible actions are:

- Ver versión imprimible
- Descargar PDF
- Historial
- Reabrir
- A4/Carta selection

The UI does not auto-open, auto-download, auto-send or auto-persist merely because a Quote was confirmed.

## Durable identity authority

QPD-06 does not create Quote or Quote Version identity.

```text
QUOTE_IDENTITY_OWNER=CARTERA_001B
QUOTE_VERSION_IDENTITY_OWNER=CARTERA_001B
PRINTABLE_VERSION_OWNER=QPD05
PRODUCTIVE_ROUTE_OWNER=QPD06
```

Preview and explicit download may operate from the accepted review snapshot. Durable history requires the Cartera 001B persistence receipt. Missing identity fails closed and remains visible to the advisor.

## Browser acceptance

GitHub Actions run `30597926358` accepted:

- QPD-01 through QPD-06 contract chain;
- Node syntax and diff integrity;
- Playwright Chromium productive flow;
- mobile 390×844;
- tablet 800×1280;
- desktop 1440×900;
- real PDF download;
- append-only history;
- exact reopen;
- no horizontal overflow;
- mobile bottom safe area above the floating navigation pill.

Evidence artifact:

```text
NAME=qpd06-browser-acceptance
ID=8780843260
SHA256=dc01b01d4736fa3896e87182a91379cabf5eb6bcd141dca240b08a3962f357b0
```

## Safety lock

```text
AUTOMATIC_DOWNLOAD_ALLOWED=false
AUTOMATIC_SEND_ALLOWED=false
QUOTE_MUTATION_ALLOWED=false
PRODUCT_MUTATION_ALLOWED=false
RECALCULATION_ALLOWED=false
CRM_MUTATION_ALLOWED=false
TASK_CREATION_ALLOWED=false
CALENDAR_CREATION_ALLOWED=false
POLICY_MUTATION_ALLOWED=false
RAW_PDF_PERSISTED=false
HTML_PERSISTED=false
BINARY_PERSISTED=false
```

## Honest unresolved dependency

The QPD-05 Supabase migration and cross-device remote acceptance remain blocked until the Cartera 001B Quote and Quote Version schema is deployed and remotely accepted.

This closure does not claim:

- Supabase remote mutation;
- QPD migration deployment;
- cross-device remote history acceptance;
- merge to `main`;
- Sales Presentation closure.

## Next governed action

The Quote Printable Document implementation is product-complete in repository and browser scope. The next integration gate is dependency deployment/reconciliation with Cartera 001B, followed by PR merge authorization. Presentations may resume independently after this boundary is preserved.

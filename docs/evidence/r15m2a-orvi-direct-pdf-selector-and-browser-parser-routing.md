# R15M2A ORVI Direct PDF Selector And Browser Parser Routing Evidence

## Repository gates and protection

- Required branch `main`: PASS.
- Required baseline `74d7081a4799aeb084f53cc54be6e60058f3ad3e`: PASS for `HEAD` and `origin/main` before implementation.
- Initial worktree clean: PASS.
- All 4,318 tracked files inventoried and SHA-256 manifested before writing.
- Canonical ORVI Product Intelligence, parser/mapper, rate cache, R15M2 UI, other products and `package.json` protected by baseline hashes.
- Exact 12-path allowlist and backups for every existing authorized file created outside Git.

## Functional evidence

- `ORVI 99`, `Ordinario de Vida` and the authorized synthetic ORVI fixture are detected from content.
- Vida Mujer, Imagina Ser, SeguBeca, generic text and a lone ORVI note are rejected by the ORVI detector.
- A collision fixture proves ORVI route precedence before all existing products.
- The canonical parser produces a contract-valid envelope.
- The canonical mapper produces `forge.product_intelligence.orvi` with owner `product-intelligence`.
- A generic `documento.pdf` File enters the same PDF extraction function and produces an ORVI accepted packet.
- The packet carries canonical product, currency, sum assured and payment term when available.
- Product Intelligence is attached under both accepted conventions.
- The existing selector retains `.json,application/json,.pdf,application/pdf`; automatic in-memory JSON reuse is not a manual user requirement.
- Cache-busting uses `r15m2a_orvi_direct_pdf_20260712_1`.
- Nine canonical/browser mirror pairs pass SHA-256 byte identity, including all four new dependency mirrors.

## Private real-PDF regression

The private PDF was selected locally, renamed only in memory to `documento.pdf`, text-extracted outside Git, routed by content, parsed and mapped canonically, prepared for the existing confirmation modal, calculated through the accepted ORVI runtime with the existing verified cache, and converted into the reusable dashboard model. No source path, hash, text, identity or amount was written to committed evidence.

Sanitized result:

```text
directPdfSelected=true
genericFilenameStillDetected=true
detectedFamily=ORVI
canonicalParserUsed=true
canonicalMapperUsed=true
productIntelligenceAttached=true
currencyDetected=true
paymentTermDetected=true
checkpointCount=3
recoveryRowsExactlySeven=true
udiProjectedLast=true
surrenderValueMxnVisible=false
modalPrepared=true
dashboardPrepared=true
falseMxnPendingWithValidRate=false
jsonManualSelectionRequired=false
piiRetained=false
realValuesWrittenToSummary=false
pdfCommitted=false
premiumInvented=false
recommendation=null
humanDecisionRequired=true
```

## Automated regression matrix

Thirty-three executable tests passed across:

- canonical ORVI contract, parser, mapper and Product Intelligence;
- R15F checkpoint analytics through R15M2 dashboard, rate, modal and responsive contracts;
- direct PDF detector, route precedence, generic filename and accepted packet;
- nine SHA-256 canonical/browser mirror pairs;
- PDF browser parser, accepted quote end-to-end and benefit summary engine;
- Vida Mujer, Imagina Ser and SeguBeca non-browser upload/render contracts;
- quote-preview canonical bridge and confirmation popup;
- tracked-workbook privacy sanitization.

The two inherited real-browser SeguBeca tests could not launch the installed Chromium for the same environment reason recorded below. They did not reach application code and are reported as unavailable, not as product regression failures. Their non-browser parser, packet, renderer handoff, dashboard adapter and projected-MXN counterparts all passed.

## Browser automation result

Headless Chromium is installed, so automation was attempted. Navigation could not start because the Termux Chromium network subprocess repeatedly failed ICU initialization (`Invalid file descriptor to ICU data received`). A Python static server, a Node static server and an isolated subprocess launch produced the same runtime failure. The incomplete external capture directory was removed and the browser installation was restored to its original permission state.

This matches the required no-automation contingency:

```text
VISUAL_INSPECTION_EXECUTED=NO_AUTOMATION_AVAILABLE
BROWSER_AUTOMATION_AVAILABLE=NO
VISUAL_SCREENSHOTS_DIR=null
SCREENSHOTS_COMMITTED=NO
MANUAL_VISUAL_ACCEPTANCE=PENDING_USER_REVIEW
```

No screenshot, video, trace, HAR, PDF, private JSON or extracted real text is present in Git. No visual acceptance is claimed.

## Governance result

```text
STATUS=PASS_DIRECT_PDF_SELECTOR_AND_BROWSER_PARSER_ROUTING
DIRECT_PDF_SELECTOR_ORVI=IMPLEMENTED
ORVI_USES_EXISTING_PDF_SELECTOR=YES
NEW_SELECTOR_CREATED=NO
JSON_REQUIRED_FOR_USER_FLOW=NO
ORVI_DETECTION_BY_CONTENT=YES
ORVI_DETECTION_BY_FILENAME_ONLY=NO
ORVI_BROWSER_ROUTE_PRECEDENCE=BEFORE_SEGUBECA_IMAGINA_SER_VIDA_MUJER
CANONICAL_ORVI_PARSER_USED=YES
CANONICAL_ORVI_MAPPER_USED=YES
BROWSER_DEPLOYMENT_MIRRORS_BYTE_IDENTICAL=YES
PRIVATE_REAL_PDF_SELECTOR_REGRESSION=PASS
EXISTING_PRODUCT_UPLOADS_REGRESSION=PASS
RATE_CACHE_CHANGED=NO
PRODUCT_INTELLIGENCE_OWNER=UNCHANGED
PDF_COMMITTED=NO
CLIENT_CONTENT_COMMITTED=NO
RECOMMENDATION=null
HUMAN_DECISION_REQUIRED=true
MANUAL_VISUAL_ACCEPTANCE=PENDING_USER_REVIEW
NEXT=R15M3_ORVI_MANUAL_VISUAL_ACCEPTANCE_SIGNOFF_AND_RELEASE_CLOSE
```

R15M2 remains PASS. This corrective module records the later browser-router gap without rewriting history and does not execute R15M3.

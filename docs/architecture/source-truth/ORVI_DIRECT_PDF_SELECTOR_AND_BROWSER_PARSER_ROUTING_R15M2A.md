# ORVI Direct PDF Selector And Browser Parser Routing R15M2A

## Module

`R15M2A_ORVI_DIRECT_PDF_SELECTOR_AND_BROWSER_PARSER_ROUTING`

## Constitutional authority

- `AGENTS.md`: Ley Zero, Product Intelligence ownership, Forecast Truth Boundary, Privacy First and explicit human decision authority.
- `FORGE_CONSTITUTION_V3.md` and the architectural constitution.
- ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-007 and ADR-008.
- Repository-owner approval is limited to closing the direct ORVI PDF routing gap after R15M2 and before R15M3.

## Corrective-module record

R15M2 correctly closed the guaranteed-recovery presentation, rate-summary and confirmation-modal changes. After commit R15M2, the browser PDF router was audited and found to have no ORVI branch: unmatched PDFs still fell through to Vida Mujer. R15M2A closes that separate ingestion gap without rewriting R15M2 history or changing its PASS status.

R15M2A does not execute or close R15M3. Human visual acceptance remains pending.

## Routing decision

The existing input and capture-phase PDF interceptor remain authoritative. The user selects one local PDF; extraction occurs locally and the existing bridge may create an in-memory JSON `File` solely to reuse the accepted-quote event path. No JSON is requested from the user and no new selector or ORVI-only screen exists.

The router order is:

1. ORVI
2. SeguBeca
3. Imagina Ser
4. Existing Vida Mujer fallback

ORVI detection is independent of filename. It requires both:

- a specific identity marker: a structured ORVI plan marker or `Ordinario de Vida`; and
- guaranteed-value table evidence with at least two protection/recovery column markers.

A lone reference to the word ORVI is insufficient.

## Canonical authority and browser deployment

The browser route imports byte-identical deployment mirrors of:

- `product-intelligence/quotes/orvi-pdf-parser-contract.js`;
- `product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js`;
- `product-intelligence/quotes/orvi-pdf-to-product-intelligence.js`;
- `product-intelligence/knowledge/orvi-product-intelligence.js`.

The dependency graph closes with those four files. There are no stubs, shortened copies, second parser or second mapper. SHA-256 regression requires every mirror to equal its canonical source byte for byte.

The specialized route parses and validates the canonical envelope, maps and validates canonical Product Intelligence, then constructs the existing accepted-quote packet. It attaches the model as `productIntelligence` and `product_intelligence`. Product, currency, sum assured, payment term and premium fields are emitted only when canonical evidence exists. Filename is retained as metadata only.

No rate, date, premium, identity, coverage duration or payment mode is inferred. Recommendation remains `null` and human decision remains required.

## Protected boundaries

- Canonical ORVI parser, mapper, contract and model: unchanged.
- R15F through R15M2 calculations and presentation: unchanged.
- Verified rate cache: unchanged.
- Vida Mujer, Imagina Ser and SeguBeca parsers and routes: unchanged except for ORVI precedence before their existing paths.
- `package.json`, `app.js`, workbook and private sources: unchanged.
- No PDF, extracted real text, private JSON, screenshot, trace or client content is committed.

## Browser inspection boundary

Automated Chromium inspection was attempted against the live static page. The installed Termux Chromium binary cannot initialize the network subprocess because its child process receives an invalid ICU data descriptor. Alternate local servers and isolated subprocess launch were also attempted. Therefore browser automation is unavailable in this environment, no screenshots were produced, and no visual PASS is claimed. This is the explicit no-automation contingency authorized by the module.

The page, packet, modal preparation, accepted calculation and reusable dashboard model were still exercised with the private real PDF through sanitized structural regression. Final human review remains mandatory.

## Closure record

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
VISUAL_INSPECTION_EXECUTED=NO_AUTOMATION_AVAILABLE
BROWSER_AUTOMATION_AVAILABLE=NO
VISUAL_SCREENSHOTS_DIR=null
SCREENSHOTS_COMMITTED=NO
MANUAL_VISUAL_ACCEPTANCE=PENDING_USER_REVIEW
NEXT=R15M3_ORVI_MANUAL_VISUAL_ACCEPTANCE_SIGNOFF_AND_RELEASE_CLOSE
```

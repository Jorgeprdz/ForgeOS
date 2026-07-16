# R16J2 Distributed Runtime Discovery and Defect Report

Date: 2026-07-16

Status: `AUDIT_COMPLETE_IMPLEMENTATION_AUTHORIZED`

## Runtime authority proof

Chromium loaded the following active browser modules from
`docs/static-preview/quote-preview-live/`:

1. accepted-quote bridge
2. presentation browser context adapter
3. dedicated presentation prompt builder
4. slide-plan generator
5. review-packet builder
6. review-state store
7. editable preview
8. Human Approval gate
9. print/PDF export adapter

The browser exposed the corresponding `ForgeSalesPresentation*` globals.
No Manager OS presentation file was loaded by the browser.

The active flow is:

```text
accepted quote candidate
-> approved existing calculation
-> accepted quote review snapshot
-> browser presentation context
-> dedicated prompt packet
-> deterministic slide plan
-> review packet
-> revisioned editor state
-> identified Human Approval
-> separate export authorization
-> browser Print/PDF
```

The editor is a dynamic in-page workspace. It is not a separate URL route.
Presentation review state is memory-only. No presentation keys were found in
`localStorage` or `sessionStorage`.

## Manager OS classification

| File | Runtime evidence | Classification |
| --- | --- | --- |
| `manager-os/presentation/quote-to-sales-presentation-context-adapter.js` | Imported by tests only; not browser mounted | `INCORRECTLY_LOCATED_ADVISOR_EXECUTION_AUTHORITY` |
| `manager-os/presentation/sales-presentation-engine-ownership-registry.js` | Imported by tests only; documents presentation execution/write ownership | `INCORRECTLY_LOCATED_ADVISOR_EXECUTION_AUTHORITY` |

Manager OS has no demonstrated presentation production consumer. The two files
must become Advisor OS authority with compatibility re-exports only where
required.

## Browser presentation classification

| Component | Classification before correction |
| --- | --- |
| context adapter | `ACTIVE_CANONICAL_AUTHORITY_PHYSICALLY_NEUTRAL` |
| prompt builder | `ACTIVE_CANONICAL_AUTHORITY_PHYSICALLY_NEUTRAL` |
| slide-plan generator | `ACTIVE_CANONICAL_AUTHORITY_PHYSICALLY_NEUTRAL` |
| review packet | `ACTIVE_CANONICAL_AUTHORITY_PHYSICALLY_NEUTRAL` |
| review state/editor | `ACTIVE_CANONICAL_AUTHORITY_PHYSICALLY_NEUTRAL` |
| approval/export | `ACTIVE_CANONICAL_AUTHORITY_PHYSICALLY_NEUTRAL` |
| accepted-quote bridge | `ACTIVE_QUOTE_RUNTIME_ORCHESTRATOR` |
| old Manager OS context adapter | `STATIC_SERVER_CONTRACT_NOT_BROWSER_MOUNTED` |

## Context capture result

A synthetic SeguBeca accepted quote reached the snapshot with:

- accepted quote facts
- approved calculation output
- UDI calculation metadata
- cached Banxico authority
- prospect context supplied explicitly by the harness
- client objective supplied explicitly by the harness
- internal advisor notes retained outside the prompt payload

The runtime then produced:

```text
PRODUCT_INTELLIGENCE=null
CONTEXT_STATUS=HOLD_MISSING_PRODUCT_INTELLIGENCE
PROMPT_GENERATED=false
SLIDE_PLAN_GENERATED=false
REVIEW_STATE=null
EDITOR_OPEN=false
```

This is a correct no-invention hold, but it proves that the synthetic SeguBeca
path does not have a canonical Product Intelligence packet available to the
presentation runtime. R16J2 must not invent one.

## Product Intelligence

- ORVI has a repository and browser Product Intelligence authority.
- The tested SeguBeca packet has quote/product facts and benefit-summary output,
  but no canonical Product Intelligence packet.
- The presentation context correctly refuses to treat a benefit summary as a
  replacement Product Intelligence authority.

Classification:

```text
ORVI=LIVE_RUNTIME_AVAILABLE_REQUIRES_PRESENTATION_ACCEPTANCE
SEGUBECA=MISSING_CANONICAL_PRODUCT_INTELLIGENCE_PACKET
OTHER_PRODUCTS=UNKNOWN_OR_MISSING_REQUIRES_PRODUCT_SPECIFIC_EVIDENCE
PRODUCT_TRUTH_MUTATION_ALLOWED=NO
```

## Reason Why and privacy

Static tests and runtime guards prove:

```text
PRESENTATION_REASON_WHY_REQUIRED=NO
PRESENTATION_REASON_WHY_CONSUMED=NO
NBA_REASON_WHY_CONSUMPTION=FORBIDDEN
PRIVATE_ADVISOR_MOTIVATION_ALLOWED=NO
ADVISOR_NOTES_IN_PROMPT_PAYLOAD=NO
ADVISOR_NOTES_AS_SLIDE_FACTS=NO
```

Client recommendation rationale is a separate, validated client-solution-fit
packet. It is not Advisor Reason Why.

## External evidence

| Integration | Runtime classification |
| --- | --- |
| Banxico / current UDI cache | `CACHED_AND_USED_IN_CALCULATION` |
| UDI projection engine | `LIVE_AND_USED_IN_CALCULATION` |
| INEGI | `MISSING_FROM_PRESENTATION_RUNTIME` |
| CONSAR / Afore | `MISSING_FROM_PRESENTATION_RUNTIME` |
| PPR context | `MISSING_FROM_PRESENTATION_RUNTIME` |
| university-cost evidence | `MISSING_FROM_PRESENTATION_RUNTIME` |
| women-health evidence | `MISSING_FROM_PRESENTATION_RUNTIME` |
| medical/hospital-cost evidence | `MISSING_FROM_PRESENTATION_RUNTIME` |

No missing external integration will be implemented inside R16J2.

## Demonstrated defects

### D1 — Advisor OS ownership

Classification: `ADVISOR_OS_OWNERSHIP_DEFECT`

Actual: presentation execution contracts and ownership registry are physically
owned by Manager OS, while active browser execution is under a neutral preview
path.

Expected: Advisor OS owns prospect-specific context, prompt, slide plan,
editor, approval and export execution.

Minimal correction: move Advisor execution authority to
`advisor-os/presentation/`; retain only thin compatibility re-exports where
existing tests or consumers require them.

### D2 — Dedicated Nueva Cotización CTA

Classification: `NAVIGATION_DEFECT`, `CTA_DESIGN_DEFECT`

Actual: `docs/static-preview/forge-alive/nueva-cotizacion/index.html` contains
an old disabled placeholder without the R16J0 data contract and does not mount
the presentation CTA/workspace assets.

Expected: accepted quote can open the Advisor OS editor through the same
contract as the routed SaaS module.

Minimal correction: bind the existing dedicated-route button to the active
presentation entrypoint and mount the same Advisor OS presentation assets.

### D3 — Product-specific readiness

Classification: `PRODUCT_INTELLIGENCE_DEFECT`

Actual: SeguBeca has no canonical Product Intelligence packet, so presentation
generation holds.

Expected: where Product Intelligence exists, it is preserved and consumed.
Where it does not exist, Forge must hold without invention.

Minimal correction in R16J2: preserve the hold and expose a controlled,
product-specific readiness error. Do not create Product Intelligence.

### D4 — Test drift

Classification: `TEST_CONTRACT_DEFECT`

- editable-preview test requires a retired selector inside the editor module
- unified product dashboard browser test clicks a retired modal selector

Minimal correction: update tests to the current public contracts and add
R16J2 browser acceptance.

### D5 — Responsive acceptance unavailable on blocked state

Classification: `DESKTOP_LAYOUT_DEFECT`, `TABLET_LAYOUT_DEFECT`,
`MOBILE_LAYOUT_DEFECT` pending rendered verification.

Static CSS uses a desktop-first fixed overlay with nested scroll regions. The
mobile composition retains four grid rows, a horizontally scrolling rail,
workspace scrolling and footer actions inside a single viewport. Browser
acceptance must be rerun after a valid Product Intelligence flow can open the
editor.

## Non-issues

- Human Approval is identified and revision-bound.
- Export authorization is separate from approval.
- Editing revokes approval and export authorization.
- Automatic send is absent.
- CRM mutation is absent.
- Direct editor access does not fabricate state.
- Missing Product Intelligence remains missing.
- Reason Why and private-purpose inputs are rejected.

## Authorized correction boundary

Files may be changed only for:

- Advisor OS presentation ownership and compatibility
- accepted-quote-to-presentation consumer wiring
- dedicated presentation CTA
- presentation-module CSS/DOM
- presentation tests and R16J2 evidence
- authorized R16J tracking updates

No quote truth, Product Intelligence truth, Pipeline authority, global
navigation, mobile navigation, orb, schema, rule pack, CRM or send authority
may change.

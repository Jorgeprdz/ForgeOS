# QPD-04 Product-Specific Quote Sections

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Branch: `feature/quote-printable-document-closure`

Accepted commit before certification: `88262cc3d15d8e473b9e11c6e038547d3c1183bc`

GitHub Actions run: `30594868099`

## Runtime

`advisor-os/quotes/printable/quote-printable-product-profile.js`

## Contract test

`advisor-os/quotes/tests/quote-printable-product-profile-master-test.js`

## Confirmed behavior

- ORVI profile detected and composed with life, contribution and recovery sections.
- Imagina Ser profile exposes confirmed AVE, contributions and recovery values.
- Vida Mujer uses specialized protection labels without inventing benefits.
- SeguBeca separates educational goal, contractor protection, delivery and UDI evidence.
- SeguBeca consumes contractor protection from the productive `nativeResult.recommendedCoverages` source when present.
- GMM exposes plan configuration, deductible, coinsurance, cap, hospital configuration, medical benefits and premium.
- GMM suppresses savings, contributions, recovery and retirement sections.
- Unknown products preserve the generic composition with an explicit warning.
- Missing recommended product mechanics remain unavailable and produce warnings.
- Profile enrichment rejects a snapshot belonging to another source revision.
- Product-profiled HTML remains compatible with the real QPD-03 PDF generator.

## Acceptance

```text
NODE_SYNTAX=PASS
QPD01_CONTRACT=PASS_12_OF_12
QPD02_CONTRACT=PASS_12_OF_12
QPD03_CONTRACT=PASS_14_OF_14
QPD04_CONTRACT=PASS_15_OF_15
DIFF_INTEGRITY=PASS
WORKFLOW_RUN=30594868099
WORKFLOW_CONCLUSION=SUCCESS
```

## Boundary

```text
CALCULATION_ENGINE_CHANGED=false
PRODUCT_INTELLIGENCE_MUTATED=false
ACCEPTED_QUOTE_MUTATED=false
PERSISTENCE_WRITTEN=false
SUPABASE_MUTATION=false
AUTOMATIC_SEND=false
PRESENTATION_RUNTIME_CHANGED=false
PRODUCTIVE_ROUTE_BOUND=false
```

## Next

`QPD05_PERSISTENCE_VERSIONING_AND_REOPEN`

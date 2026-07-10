# 107Z15R3 — Existing owner static contract review

Status: **PASS**

## Why 107Z15R2 held

Classification:

`ENGINE_OUTPUT_IS_NATIVE_AND_REQUIRES_EXPLICIT_CANONICAL_MAPPING`

The resolved engine callable executed, but the generic synthetic input did not
reproduce the exact native document or output contract expected by the owner.

## Engine owner contract

- Callable: `extractSolucionlineLifeQuoteFields`
- Parameters: `['text']`
- Input shape: `OPAQUE_SINGLE_ARGUMENT_WITH_HELPER_DEPENDENCIES`
- Input properties read: `[]`
- Helper calls: `['String', 'additionalCoverages.push', 'advisorLine.replace', 'birthLine.match', 'cleanValue', 'filter', 'findLine', 'formatUdi', 'genderLine.match', 'guaranteeLine.match', 'i.test', 'insuredLine.replace', 'line.match', 'line.replace', 'lines.find', 'lines.findIndex', 'liquidationLine.match', 'map', 'match', 'parseNumberList', 'pattern.test', 'productLine.match', 'scenario', 'split', 'studyDateLine.match', 'test', 'trim']`
- Native output key count: `42`
- Native output key preview: `['advisor', 'age', 'annual', 'annualPremium', 'baseAnnualPremium', 'birthDate', 'coverage', 'currency', 'detectedQuoteDomain', 'extractionSource', 'gender', 'guaranteePeriod', 'liquidationOption', 'monthly', 'monthlyIncomeUdi', 'optionalCoverages', 'paymentMode', 'paymentTerm', 'plan', 'plannedAnnual']`

## Canonical mapping

- Mapping class: `PARTIAL_CANONICAL_PLUS_NATIVE_MAPPING_REQUIRED`
- Direct canonical mappings: `{'product': 'product', 'annualPremium': 'annualPremium'}`
- Missing canonical fields: `['name', 'family', 'insured', 'sumAssured', 'plannedOrAvePremium', 'coveragePeriod']`
- Alias evidence: `{'name': [], 'family': [], 'insured': ['sumInsured'], 'sumAssured': ['sumInsured'], 'plannedOrAvePremium': ['annualPremium', 'baseAnnualPremium', 'plannedAnnual', 'plannedMonthly', 'plannedQuarterly', 'plannedSemiannual', 'premium', 'premiumTable', 'totalAnnualPremium'], 'coveragePeriod': ['coverage', 'guaranteePeriod']}`

This gate does not invent mappings. It records direct matches and alias
candidates separately so the next execution can validate them.

## Adapter success path

Negative-path callables were excluded.

- Candidate: `validateQuotePreviewPdfProductIntelligenceIntegrationShape`
- Score: `140`
- Evidence: `['name_token:integrat', 'name_token:preview', 'name_token:quote', 'name_token:product', 'body_token:fields', 'non_negative_name']`

This is a static success-path candidate, not yet accepted as runtime truth.
The next gate must execute it and prove the exact eight-field mapping.

## Boundaries

- Engine/parser execution: `false`
- Browser execution: `false`
- Source changes: `false`
- PDF/OCR/provider/backend: `false`
- Quote truth: `false`

## Next gate

`107Z15R4_EXISTING_ENGINE_NATIVE_FIELD_MAPPING_AND_TARGETED_INVOCATION_GATE`

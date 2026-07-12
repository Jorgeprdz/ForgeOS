# R14B SeguBeca Excel And PDF Intake Discovery Evidence

## Decision

`PASS_R14B_SEGUBECA_EXCEL_AND_PDF_INTAKE_DISCOVERY`

R14B records intake discovery for SeguBeca using sanitized local inspection of Solucionline PDF candidates and universal Excel workbook candidates with the SB sheet/structure.

This is discovery only. It does not implement a parser, does not change UI behavior, and does not commit real PDFs or Excel files.

## Scope

R14B exists to understand the source surfaces that a future parser or intake module may need:

- Solucionline SeguBeca PDF structure;
- universal Excel workbook structure, especially the SB worksheet;
- participant roles and education-goal semantics;
- administration-of-savings delivery table;
- field boundaries for a future Product Intelligence contract.

## Sanitized local inventory

```text
PDF_SEGUBECA_CANDIDATES=9
XLSX_SB_CANDIDATES=1
SANITIZED=YES
NO_FILENAMES_OR_CLIENT_DATA_RECORDED=YES
PDF_FLAG_PRODUCT_SEGUBECA_18=YES
PDF_FLAG_CURRENCY_UDI=YES
PDF_FLAG_PARTICIPANT_TITULAR=YES
PDF_FLAG_PARTICIPANT_CONTRATANTE=YES
PDF_FLAG_COVERAGES_TABLE=YES
PDF_FLAG_RECOMMENDED_BENEFITS=YES
PDF_FLAG_GUARANTEED_VALUES=YES
PDF_FLAG_SAVING_ADMINISTRATION=YES
PDF_FLAG_MONTHLY_DELIVERY_TABLE=YES
PDF_FLAG_FOUR_YEAR_ADMINISTRATION=YES
PDF_FLAG_REAL_INTEREST_1_PERCENT=YES
PDF_FLAG_SURVIVORSHIP_AGE_18=YES
PDF_FLAG_SOLUCIONLINE_VERSION_PRESENT=YES
PDF_SAMPLE_BASIC_SUM_ASSURED_UDI_DETECTED=YES
PDF_SAMPLE_ANNUAL_PREMIUM_TOTAL_DETECTED=YES
PDF_SAMPLE_RECOMMENDED_TOTAL_DETECTED=NO
PDF_SAMPLE_MONTHLY_DELIVERY_UDI_DETECTED=YES
PDF_SAMPLE_DELIVERY_ACCUMULATED_UDI_DETECTED=YES
XLSX_FLAG_SHEET_SB=YES
XLSX_FLAG_ANNUALITY_COLUMNS=YES
XLSX_FLAG_AVAILABLE_COLUMNS=YES
XLSX_FLAG_PROTECTION_COLUMNS=YES
XLSX_FLAG_UDIS_PROJECTION_COLUMN=YES
XLSX_FLAG_MONTHLY_DELIVERY_COLUMNS=YES
XLSX_FLAG_ANNUAL_DELIVERY_COLUMNS=YES
XLSX_FLAG_PREMIUM_WAIVER_PHRASE=YES
XLSX_FLAG_UDI_4_5_FORMULA=YES
```

The inventory intentionally records counts, section flags, and semantic field presence only. It does not record filenames, local paths, client names, e-mails, phone numbers, screenshots, raw PDF content, or workbook sample names.

## Solucionline PDF surface discovered

The PDF surface can include:

- product header: SeguBeca / SeguBeca 18;
- currency marker: UDI;
- data generales table with role rows such as Titular and Contratante;
- coverage table with plan, coverage period, sum assured, and annualized premium;
- base plan line for SeguBeca;
- protection by death and disability of the contracting party;
- CPA, BAM, BAIT, AV, and other coverage rows when present;
- total annual premium;
- recommended-benefits table;
- guaranteed-values table by real age;
- administration-of-savings section;
- monthly delivery table with policy year, insured age, amount to administer, monthly delivery, accumulated delivery, death benefit, and cash value;
- glossary and notes;
- note that the monthly-delivery interest rate is estimated, not guaranteed, when present;
- note that amounts are expressed in UDI when present;
- note that survival to age 18 pays the stated UDI amount when present.

## Universal Excel SB surface discovered

The SB worksheet / structure can include:

- participant age columns for parent/parent/minor examples;
- annuality columns in UDI and pesos;
- available amount columns in UDI and pesos;
- protection columns in UDI and pesos;
- UDI projection column;
- monthly delivery columns in UDI and pesos;
- annual delivery columns in UDI and pesos;
- formula pattern consistent with UDI annual growth at 4.5%, when present;
- exención de pagos de primas por invalidez phrase, when present.

The workbook is treated as a calculation/structure reference, not as a final customer quote and not as Product Truth by itself.

## Product Intelligence implications

A future SeguBeca intake contract should preserve, when evidenced:

- product type and plan variant;
- currency;
- insured/participant role rows;
- primary insured;
- joint insured if present;
- minor associated with the education goal;
- participant modality: individual, mancomunado, or unknown;
- contribution and premium fields;
- base education goal;
- protection by death and disability of the contracting party;
- optional/recommended benefits;
- guaranteed values;
- administration-of-savings delivery schedule;
- delivery mode and estimated monthly delivery;
- missing information for unclear roles or absent delivery/contribution/protection facts.

## Parser boundary for future R14C

R14B does not authorize parser implementation. A future R14C must be separately gated and should:

- parse sanitized fields only;
- produce Product Intelligence output, not UI-only values;
- avoid names and personal contact data;
- keep participant roles explicit;
- treat Excel as reference/calculation structure;
- treat PDF as Solucionline quote source;
- never hardcode sample values as universal product truth;
- preserve existing Vida Mujer and Imagina Ser behavior.

## Prohibited changes respected

- no parser changes;
- no PDF intake changes;
- no UI/runtime changes;
- no mobile changes;
- no schemas;
- no routes;
- no `app.js`;
- no rule packs;
- no real PDF or Excel files committed;
- no client data committed;
- no secrets committed.

## Validation

- baseline clean: PASS;
- sanitized PDF/XLSX inventory: PASS;
- evidence written: PASS;
- build tree registered: PASS;
- `git diff --check`: PASS;
- privacy check on added lines: PASS;
- changed-surface allowlist: PASS;
- no prohibited runtime/parser/mobile/schema/route/rule-pack surfaces: PASS.

## Closure

R14B discovery is complete. The next separately governed module may be:

`R14C_SEGUBECA_SOLUCIONLINE_PDF_INTAKE_IMPLEMENTATION`

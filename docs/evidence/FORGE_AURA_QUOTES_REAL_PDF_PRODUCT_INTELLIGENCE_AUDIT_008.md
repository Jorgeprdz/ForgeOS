# FORGE AURA QUOTES — REAL PDF PRODUCT INTELLIGENCE AUDIT 008

Status: AUDIT COMPLETE — NO PRODUCTION MUTATION
Branch: `audit/quotes-real-pdf-product-intelligence-008`
Production base audited: `0fa376221154744751bc1b18e35736ffed398a6a`

## Purpose

Compare three user-supplied Solucionline PDFs against the productive parser, Accepted Quote calculation, existing Product Intelligence/product-specific dashboard semantics, Material 3 presentation behavior, and the current generic Aura Quotes read model. The audit does not create a new product engine, formula, truth source, persistence layer, DB/RLS mutation, or production deployment.

The uploaded binary PDFs were inspected as source truth. Each Action records the SHA-256 of the original binary and replays the PDF's semantic text through the productive parser path. ORVI additionally uses the repo's governed verified market-rate cache because its calculation contract correctly refuses to project without one.

## Dedicated Actions

- ORVI: workflow `Audit real PDF - ORVI`, successful run `31289805782`, original PDF SHA-256 `bc875a36f20f3416a9b790842ab6d5aea6343b25a456bbf7e798d66a9064e01f`.
- SeguBeca: workflow `Audit real PDF - SeguBeca`, successful run `31289642360`, original PDF SHA-256 `403b65bda57f73e8f15b15820d28fca58fb0228faadb3ee26afaa4580551e8e5`.
- Vida Mujer: workflow `Audit real PDF - Vida Mujer`, successful run `31289649740`, original PDF SHA-256 `16be81ab3d912c919bb60b504d711fa09f5534b3cf7db2874843a4c12ca66a2a`.

## Cross-product diagnosis

Material 3 did not treat every product as a generic quote. `quote-product-intelligence-presenter.js` chooses product-specific dashboard models (ORVI, SeguBeca, Vida Mujer, Imagina Ser). Current Aura instead builds a generic list of contractual/current/projected facts and generic benefit blocks.

The current Aura hero rule always prefers `annual_premium` before `sum_assured`. The current Aura contractual adapter also prefers `calculation.annualPremium` before native/packet annual-premium truth. This is materially wrong for product-specific decision presentation and is catastrophic for ORVI because the ORVI calculation currently exposes a generic `annualPremium` alias of `0` while Product Intelligence preserves the correct source totals.

The repair boundary should therefore reuse the existing product-specific presentation authorities instead of inventing another product display model in Aura.

# ORVI

## Source PDF truth

- Product: ORVI 99-20 PAGOS UDIS.
- Insured: VICTOR MENDEZ REYES, age 37.
- Basic protection: 135,000 UDI.
- Basic ORVI annualized premium: 3,042.20 UDI.
- Source `Prima Total Anual`: 4,295.04 UDI.
- Payment term: 20 years; base coverage term: 64 years.
- AVE in guaranteed-value table: 500 UDI while contributions are active.
- Guaranteed-value timeline continues through policy year 64 / age 100.
- At policy year 20: total recovery 75,126 UDI; guaranteed surrender value 13,801 UDI.
- At policy year 64: total recovery 185,806 UDI.

## Product Intelligence / Material 3 result

Product Intelligence correctly preserves:
- `basic_sum_assured = 135000 UDI`.
- `basic_annual_premium = 3042.20 UDI`.
- `total_annual_premium = 4295.04 UDI`.
- payment term 20 years.
- full guaranteed-value timeline.

Material 3 selects the ORVI dashboard and displays:
- Hero: `Protección contratada` = 135,000 UDI.
- Current MXN equivalence from governed verified UDI rate.
- `Aportación anual` from `premium_structure.total_annual_premium`, not from the generic calculation alias.
- Future protection as explicitly non-guaranteed scenario.
- Guaranteed recovery checkpoint cards at policy years 20, 25 and 30.
- Each recovery card separates `Total aportado`, `Valor de rescate`, `Recuperación total`, projected difference and projected recovery percentage.
- Disclosures explicitly say projected values are scenarios and recovery percentage is a comparison, not investment return.

## Current Aura degradation

Audit result:
- Product Intelligence present: YES.
- Current generic Aura hero candidate: `Prima anual = 0` because `calculation.annualPremium` wins the generic first-value selection.
- Generic Aura benefit summary for this real ORVI path reduces to `missing_information`, despite the specialized ORVI dashboard being fully available.

### ORVI should show

Primary decision view:
1. Protection hero: 135,000 UDI + current verified MXN equivalence.
2. Product/term: ORVI 99-20 PAGOS UDIS · 20 years of payments.
3. Source annual premium: 4,295.04 UDI, clearly distinguished from base ORVI premium 3,042.20 UDI and AVE/outflow concepts where relevant.
4. Guaranteed recovery checkpoints sourced from the PDF timeline.
5. Optional future MXN scenarios kept visually and semantically separate from guaranteed contractual UDI values.
6. Existing coverages (ADAPTA, BITAE, BAM, AV, BMA) as supporting protection detail, not the hero.

# SeguBeca 18

## Source PDF truth

- Product: SeguBeca 18.
- Child/insured: hijoo hijoo, age 4.
- Contractor: Juan Perez.
- Education amount/base sum assured: 30,000 UDI.
- Payment term: 14 years.
- Base SeguBeca premium: 2,284.33 UDI.
- Source `Prima Total Anual`: 2,524.19 UDI.
- With recommended benefits: 3,080.09 UDI.
- Survival benefit at age 18: 30,000 UDI.
- Savings administration: estimated 637 UDI monthly for 48 months; accumulated delivery 30,588 UDI.
- Administration rate 1.0% is explicitly hypothetical/not guaranteed.

## Existing specialized Material 3 result

The specialized SeguBeca dashboard correctly exposes the product's commercial structure:
- Resumen del plan.
- Quiénes quedan protegidos: contractor and associated child.
- Lo que aportas: annual contribution, contribution with recommended benefits, total contributed.
- Meta educativa: 30,000 UDI at target age 18.
- Cómo se entrega: estimated 637 UDI monthly, 48 months, accumulated 30,588 UDI.
- Lo que proteges: PIM, CPA, BAIT, BAM, AV and death benefit during administration.
- Additional/recommended coverages kept secondary.

The audit also exposed a presentation-selection weakness inside the old Material hero rule for this exact PDF: it selected a 60,000 UDI BAIT protection amount as generic `Suma asegurada` even though the product-specific section correctly contains `Meta educativa = 30,000 UDI`. For Aura, the product objective should win: SeguBeca's decision hero must be the education goal, not BAIT and not annual premium.

## Current Aura degradation

Audit result:
- Family recognized as `segubeca`.
- Formal `productIntelligence` object on the generic Accepted Quote calculation: absent.
- Generic Aura benefit blocks collapse to `missing_information`.
- Current Aura hero candidate: `Prima anual = 2,524.19 UDI`.

### SeguBeca should show

Primary decision view:
1. Hero: `Meta educativa` = 30,000 UDI · objetivo edad 18.
2. Participants: child hijoo hijoo + contractor Juan Perez.
3. Contribution: 2,524.19 UDI annual; 14-year contribution term; recommended-package total 3,080.09 UDI shown separately.
4. Delivery: 637 UDI/month estimated for 48 months; accumulated 30,588 UDI; explicit 1.0% hypothetical-rate disclosure.
5. Protection section: PIM/CPA/BAIT/BAM/AV, clearly secondary to education goal.
6. Additional benefits/recommendations in a separate area.

# Vida Mujer

## Source PDF truth

- Insured: Alejandra Moleres, age 33.
- Basic protection: 50,000 UDI.
- Term: 20 years.
- Base Vida Mujer premium: 2,926.93 UDI.
- Source `Prima Total Anual`: 3,061.82 UDI (guaranteed-value table displays rounded 3,062 UDI).
- With recommended benefits: 3,890.21 UDI.
- Core protection includes BAIT, BIT, PCF, BAM and AV.
- Recommended options include ADAPTA, BMA, PEP and CLP.
- Scheduled survival benefits implied by the existing Vida Mujer authority: 2,500 UDI at years 5, 7, 9, 11, 13, 15 and 17 plus 40,000 UDI at year 20.
- Total survival benefits: 57,500 UDI, exactly matching the source PDF note.
- Final guaranteed-value row at age 52 shows AVE surrender value 107,486 UDI, cash value 40,000 UDI and table recovery total 147,486 UDI.

## Product Intelligence / Material 3 result

The raw current packet identifies product `Vida Mujer` but leaves generic family `life` and does not attach Product Intelligence. Material 3 already contains the required handoff (`enrichVidaMujerCalculation`) that upgrades the calculation to family `vida_mujer` and attaches schema `forge.product_intelligence.vida_mujer`.

After that existing enrichment, Material 3 correctly produces:
- Hero: `Fallecimiento / suma asegurada básica` = 50,000 UDI.
- Aportación y estructura de prima.
- Protección de vida.
- Dotes programadas.
- Ahorro y recuperación.
- Protección para la mujer.
- Beneficios recomendados.

For this PDF the existing authority derives the 57,500 UDI survival schedule correctly and explains the PCF female-cancer benefit breakdown.

## Current Aura degradation

Audit result:
- Raw family remains `life`.
- Product Intelligence present in current generic Aura input: NO.
- Current Aura hero candidate: annual premium (rounded 3,062 UDI), not protection.
- The generic benefit-summary engine can still infer some Vida Mujer blocks, but Aura is bypassing the canonical Material handoff that establishes the correct family/schema and product-specific presentation contract.

### Vida Mujer should show

Primary decision view:
1. Hero: protection / basic sum assured = 50,000 UDI.
2. Client: Alejandra Moleres · 33 · female · nonsmoker.
3. Contribution structure: base premium 2,926.93 UDI; source total annual premium 3,061.82 UDI; preserve the PDF table's rounded 3,062 only as table display evidence; recommended-package total 3,890.21 UDI separately.
4. Scheduled endowments as a timeline: years 5/7/9/11/13/15/17 = 2,500 UDI each; year 20 = 40,000 UDI; total survival benefit = 57,500 UDI.
5. Protection for women: PCF and other core protections, using existing Product Intelligence percentages/amounts.
6. Savings/recovery information separated from survival benefits so lifetime benefits are not confused with a single surrender/recovery figure.
7. Recommended PEP/CLP/ADAPTA/BMA kept separate from contracted/core benefits.

# Recommended repair boundary

Do not redesign product math in Aura and do not create another generic product-intelligence layer.

Aura Quotes should adopt the already-existing product-specific presentation authority used by Material 3:
- ORVI -> existing ORVI Product Intelligence + ORVI dashboard model.
- SeguBeca -> existing SeguBeca product dashboard model, with education goal promoted as product hero for this product objective.
- Vida Mujer -> existing Vida Mujer handoff/enrichment + Vida Mujer product dashboard model.
- The generic Aura view model remains a fallback only for genuinely unsupported/unknown products.

The Aura visual language can remain Forge Aura Light 2026; the semantic hierarchy, product-specific field selection and truth classification should come from the existing productive authorities rather than be reinterpreted by frontend heuristics.

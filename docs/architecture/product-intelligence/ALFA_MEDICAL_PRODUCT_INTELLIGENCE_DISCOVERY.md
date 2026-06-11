# Alfa Medical Product Intelligence Discovery

Status: DISCOVERY ONLY

Scope: Product-specific discovery for Alfa Medical. No implementation. No code.
No engines. No schemas. No UI. No Build Tree changes. No architecture
modifications.

## Executive Summary

Alfa Medical is a Gastos Medicos Mayores product designed to protect a person
or family from the financial shock of a covered accident, illness, childbirth
or cesarean event that requires medically necessary care.

In human terms, Alfa Medical exists so a serious medical event does not become
an unmanaged family liquidity crisis.

The product is not "everything medical is covered." Coverage depends on the
exact insured, policy version, territory, hospital level, sum insured,
deductible, coinsurance, coinsurance cap, waiting periods, exclusions,
documentation, medical necessity, provider context and whether the benefit is
basic or optional.

Forge should understand Alfa Medical as a product with three practical layers:

1. Health event layer: accident, illness, maternity or covered complication.
2. Eligibility layer: waiting period, exclusions, territory, documentation,
   policy status, medical necessity and product-specific benefit conditions.
3. Client responsibility layer: deductible, coinsurance, cap, hospital-level
   adjustment, tabulator limits, uncovered expenses and non-procedent charges.

This discovery does not approve any calculation model. It preserves documentary
learning so future Product Intelligence can explain Alfa Medical responsibly.

## Source Inventory

Reviewed sources:

- `/storage/emulated/0/Download/Alfa Medical Nuevos.pdf`
  - Title: Alfa Medical Nuevos
  - Type: Condiciones Generales
  - Pages: 66
  - PDF metadata creation date: June 1, 2026
  - Primary source for this discovery.
- `FORGE_GMM_PRODUCT_FAMILY_ARCHITECTURE.md`
  - Existing Forge architectural note.
  - Used only to preserve the distinction between Alfa Medical and Alfa Medical
    Flex.
- `FORGE_ALFA_MEDICAL_VS_FLEX_PRODUCT_INTELLIGENCE_NOTES.txt`
  - Existing Forge product-family notes.
  - Used only to confirm product-specific financial vocabulary.
- `FORGE_GMM_CURRENT_STORY_ANALYSIS.md` and
  `FORGE_GMM_STORY_STRUCTURE_DISCOVERY.md`
  - Existing Forge sales narrative notes.
  - Used only for advisor-understanding context, not for coverage truth.

Available but not used as product truth:

- `smnyl-productos-gmm.js`
- `smnyl-comisiones-gmm.js`
- `comisiones-rules-gmm.js`
- `gmm-out-of-pocket-engine.js`
- GMM tests and quote parser files

These code files were inventoried only. They were not modified and should not
be treated as documentary product authority.

Missing or not yet reviewed sources:

- Product manual for advisors.
- Official sales material specific to Alfa Medical.
- Product guide or training deck specific to Alfa Medical.
- Real Alfa Medical policy jacket/carátula examples across plan levels.
- Real Alfa Medical quotes with plan, deductible, coinsurance and cap.
- Current hospital directory and hospital-level classification.
- Current medical honorarium catalog and Gasto Usual, Razonable y
  Acostumbrado catalog.
- Endorsements or optional coverage forms for real policies.
- Human compliance review of ambiguous clauses.

## Product Purpose

Alfa Medical is designed to help the client absorb the cost of serious medical
care when a covered event occurs.

The human problem is not "medical expense reimbursement." The human problem is:

- A sudden illness or accident can create a bill too large to manage from
  ordinary savings.
- A family may need hospital, surgeon, ICU, medication, studies or specialized
  treatment before it has time to financially reorganize.
- Health decisions become harder when the client does not know how much of the
  economic burden will remain with them.

Alfa Medical tries to convert an unpredictable medical shock into a more
structured financial exposure, subject to policy conditions.

## Product-Specific Vocabulary

Alfa Medical uses the classic GMM financial structure:

- Deducible.
- Deducible Unico.
- Deducible Anual.
- Deducible Reinstalable.
- Deducible Basico.
- Deducible en Exceso.
- Coaseguro.
- Coaseguro Unico.
- Coaseguro Reinstalable.
- Tope de Coaseguro.
- Nivel Hospitalario: Practico, Integro, Pleno.
- Suma Asegurada.
- Tabulador.
- Catalogo de Honorarios Medicos y Quirurgicos.
- Gasto Usual, Razonable y Acostumbrado.

Forge must not route Alfa Medical through the Flex vocabulary of franquicia,
copago and participacion.

## Practical Product Model

For advisor understanding, Alfa Medical can be explained as:

1. The product first asks whether the event is an insured event.
2. It then asks whether that event is covered now, under this policy, for this
   insured, in this territory and under this benefit.
3. It then determines which expenses are procedent.
4. It then applies the client's financial participation.

Coverage analysis should not start with "how much will the insurer pay."
It should start with:

- Is this an accident, illness, maternity event or covered complication?
- Is it expressly excluded?
- Is there a waiting period?
- Is medical necessity documented?
- Is the treatment in territory?
- Is the benefit basic or optional?
- Is the policy active and correctly documented?

## Discovery Verdict

Alfa Medical is a product-specific GMM coverage model with its own coverage
map, exclusion map, waiting-period map and client-responsibility model.

Future Forge Product Intelligence should treat Alfa Medical as a distinct
product model, not as generic GMM and not as Alfa Medical Flex.

Implementation status: NOT APPROVED.

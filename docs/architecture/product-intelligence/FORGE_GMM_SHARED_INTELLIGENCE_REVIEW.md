# Forge GMM Shared Intelligence Review

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Separate Shared GMM Layer candidates from Alfa Medical-specific intelligence.

## Shared GMM Layer Candidates

These may belong to shared GMM Coverage Intelligence:

- Intake framing.
- Product routing.
- Event-family routing.
- Evidence sufficiency evaluation.
- Source provenance recording.
- Human review gate pattern.
- Assessment language selection.
- Question strategy.
- Coverage vs financial responsibility separation.
- Caratula dependency.
- Territory screen.
- Waiting period screen as a concept.
- Preexistence screen as a concept.
- Authorization screen as a concept.
- Documentation sufficiency screen.

## Alfa Medical Layer

These must stay product-specific:

- Alfa Medical coverage map.
- Alfa Medical exclusion map.
- Alfa Medical waiting-period condition list.
- Alfa Medical maternity rules.
- Alfa Medical assisted reproduction rules.
- Alfa Medical accident deductible reduction.
- Alfa Medical optional foreign coverage terms.
- Alfa Medical deductible/coinsurance/cap model.
- Practico / Integro / Pleno hospital levels.
- Alfa Medical hospital-level adjustment behavior.
- Medication pharmacy-path financial rule.
- Alfa Medical high-specialty benefit conditions.

## Alfa Medical Flex Boundary

Flex must not inherit:

- Deductible/coinsurance/cap as core financial model.
- Practico/Integro/Pleno levels.
- Alfa Medical maternity/foreign/high-specialty details without Flex source
  review.

Flex requires:

- Franquicia.
- Copago.
- Participacion.
- A / AA / AAA / Preferente hospital levels.
- Flex-specific coverage map.

## Premature Abstraction Risks

- One generic out-of-pocket model.
- One global hospital-level enum.
- One universal maternity rule.
- One universal foreign coverage rule.
- One generic exclusion library treated as complete.
- One GMM coverage confidence threshold without product context.

## Shared Layer Verdict

Shared GMM Intelligence should own thinking structure.

Product layers should own product truth.

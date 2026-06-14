/*
|--------------------------------------------------------------------------
| MODULE: accident-intelligence-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Analiza accidentes y posible relevancia de CEDA sin decidir cobertura.
|
|--------------------------------------------------------------------------
*/

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function hasCeda(policyFacts = {}) {
  return (policyFacts.optionalCoverages || [])
    .some((coverage) =>
      coverage.code === 'CEDA'
      || String(coverage.name || '').toLowerCase().includes('deducible por accidente')
    );
}

export function analyzeAccidentScenario({ event = '', policyFacts = {} } = {}) {
  const requiredEvidence = ['product', 'policyStatus', 'eventDate', 'accidentDescription', 'firstExpenseDate', 'territoriality'];
  const missingEvidence =
    requiredEvidence.filter((field) => !hasValue(policyFacts[field]));

  return {
    status:
      missingEvidence.length > 0
        ? 'INSUFFICIENT_EVIDENCE'
        : 'ACCIDENT_CONTEXT_READY',
    accidentContext: event || policyFacts.accidentDescription || null,
    cedaRelevant: hasCeda(policyFacts),
    requiredEvidence,
    missingEvidence,
    advisorConsiderations: [
      'Confirm timing of accident and first medical expense.',
      'If CEDA is active, explain it as potentially relevant, not as automatic.',
      'Do not decide claim eligibility.'
    ]
  };
}

export default analyzeAccidentScenario;

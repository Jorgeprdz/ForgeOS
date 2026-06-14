/*
|--------------------------------------------------------------------------
| MODULE: hospitalization-intelligence-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Analiza situaciones de hospitalizacion sin resolver cobertura.
|
|--------------------------------------------------------------------------
*/

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

export function analyzeHospitalizationScenario({ event = '', policyFacts = {} } = {}) {
  const requiredEvidence = ['product', 'policyStatus', 'diagnosis', 'hospital', 'admissionDate'];
  const missingEvidence =
    requiredEvidence.filter((field) => !hasValue(policyFacts[field]));

  return {
    status:
      missingEvidence.length > 0
        ? 'INSUFFICIENT_EVIDENCE'
        : 'HOSPITALIZATION_CONTEXT_READY',
    hospitalizationType:
      String(event).toLowerCase().includes('emergency')
        ? 'EMERGENCY'
        : 'GENERAL',
    requiredEvidence,
    missingEvidence,
    advisorConsiderations: [
      'Confirm hospital, admission date and diagnosis.',
      'Emergency room and overnight stay should be explained separately.',
      'Do not present this as claim resolution.'
    ]
  };
}

export default analyzeHospitalizationScenario;

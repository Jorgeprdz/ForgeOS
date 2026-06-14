/*
|--------------------------------------------------------------------------
| MODULE: surgery-intelligence-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Analiza eventos quirurgicos sin decidir cobertura.
|
|--------------------------------------------------------------------------
*/

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

export function analyzeSurgeryScenario({ event = '', policyFacts = {} } = {}) {
  const requiredEvidence = ['product', 'policyStatus', 'diagnosis', 'surgeryType', 'surgeryDate', 'hospital'];
  const missingEvidence =
    requiredEvidence.filter((field) => !hasValue(policyFacts[field]));

  const isEmergency =
    String(event).toLowerCase().includes('emergency')
    || policyFacts.emergency === true;

  return {
    status:
      missingEvidence.length > 0
        ? 'INSUFFICIENT_EVIDENCE'
        : policyFacts.highSpecialtyTreatment
          ? 'HUMAN_REVIEW_REQUIRED'
          : 'SURGERY_CONTEXT_READY',
    surgeryContext: isEmergency ? 'EMERGENCY_SURGERY' : 'SCHEDULED_SURGERY',
    requiredEvidence,
    missingEvidence,
    advisorConsiderations: [
      'Confirm surgery type, hospital and diagnosis.',
      'High-specialty procedures should route to document review.',
      'Do not approve or reject the surgical event.'
    ]
  };
}

export default analyzeSurgeryScenario;

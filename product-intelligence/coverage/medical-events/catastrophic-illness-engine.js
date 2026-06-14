/*
|--------------------------------------------------------------------------
| MODULE: catastrophic-illness-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Analiza enfermedades severas sin emitir decision final.
|
|--------------------------------------------------------------------------
*/

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

export function analyzeCatastrophicIllness({ event = '', policyFacts = {} } = {}) {
  const requiredEvidence = ['product', 'policyStatus', 'diagnosis', 'diagnosisDate', 'medicalReport'];
  const missingEvidence =
    requiredEvidence.filter((field) => !hasValue(policyFacts[field]));

  return {
    status:
      missingEvidence.length > 0
        ? 'INSUFFICIENT_EVIDENCE'
        : 'HUMAN_REVIEW_REQUIRED',
    illnessContext: event || policyFacts.diagnosis || null,
    requiredEvidence,
    missingEvidence,
    advisorConsiderations: [
      'Severe disease scenarios require diagnosis source and medical report.',
      'Cancer, organ failure and neurological disease should not be simplified into automatic answers.',
      'Prepare the client for evidence review, not a verbal promise.'
    ]
  };
}

export default analyzeCatastrophicIllness;

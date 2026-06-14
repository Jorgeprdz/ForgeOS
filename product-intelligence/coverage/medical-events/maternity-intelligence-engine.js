/*
|--------------------------------------------------------------------------
| MODULE: maternity-intelligence-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Analiza situaciones de maternidad sin emitir decision de cobertura.
|
|--------------------------------------------------------------------------
*/

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function requiredFor(eventType = '') {
  const normalized = String(eventType).toLowerCase();
  const required = ['product', 'policyStatus', 'policyStartDate', 'insuredAge'];

  if (normalized.includes('assisted')) {
    return [...required, 'assistedReproductionStatus', 'pregnancyWeeks'];
  }

  if (normalized.includes('childbirth') || normalized.includes('cesarean')) {
    return [...required, 'deliveryDate', 'pregnancyWeeks'];
  }

  return [...required, 'pregnancyWeeks'];
}

export function analyzeMaternitySituation({ eventType = 'pregnancy', policyFacts = {} } = {}) {
  const requiredEvidence = requiredFor(eventType);
  const missingEvidence =
    requiredEvidence.filter((field) => !hasValue(policyFacts[field]));

  return {
    status:
      missingEvidence.length > 0
        ? 'INSUFFICIENT_EVIDENCE'
        : 'HUMAN_REVIEW_REQUIRED',
    requiredEvidence,
    missingEvidence,
    advisorConsiderations: [
      'Maternity situations require continuity, age and date context before explaining expectations.',
      'Assisted reproduction and cesarean scenarios should be reviewed with source documents.',
      'Do not present this as a coverage conclusion.'
    ]
  };
}

export default analyzeMaternitySituation;

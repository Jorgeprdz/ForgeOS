/*
|--------------------------------------------------------------------------
| MODULE: human-review-routing-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Determina cuando Forge debe detenerse y pedir revision humana.
|
|--------------------------------------------------------------------------
*/

export function routeHumanReview({ eventAnalysis = {}, policyFacts = {}, evidence = {} } = {}) {
  const reasons = [];
  const requiredDocuments = [];

  if (eventAnalysis.status === 'HUMAN_REVIEW_REQUIRED') {
    reasons.push('Event module requested human review.');
  }

  if (policyFacts.preexistingConcern === true) {
    reasons.push('Possible preexisting condition requires document review.');
    requiredDocuments.push('medical history', 'policy application');
  }

  if (policyFacts.highSpecialtyTreatment === true) {
    reasons.push('High-specialty treatment requires source document review.');
    requiredDocuments.push('medical report', 'authorization evidence');
  }

  if (policyFacts.foreignEvent === true) {
    reasons.push('Foreign event requires territoriality and optional coverage review.');
    requiredDocuments.push('policy caratula', 'foreign coverage endorsement');
  }

  if ((eventAnalysis.missingEvidence || []).length > 0) {
    reasons.push('Required evidence is missing.');
    requiredDocuments.push(...eventAnalysis.missingEvidence);
  }

  if (evidence.sourceConflict === true) {
    reasons.push('Source documents conflict.');
    requiredDocuments.push('quote', 'policy caratula', 'conditions');
  }

  return {
    reviewRequired: reasons.length > 0,
    reasons: [...new Set(reasons)],
    requiredDocuments: [...new Set(requiredDocuments)]
  };
}

export default routeHumanReview;

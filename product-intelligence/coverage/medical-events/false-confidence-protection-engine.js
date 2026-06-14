/*
|--------------------------------------------------------------------------
| MODULE: false-confidence-protection-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Reduce confianza prematura en rutas de cobertura preliminar.
|
|--------------------------------------------------------------------------
*/

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function missing(required = [], facts = {}) {
  return required.filter((field) => !hasValue(facts[field]));
}

export function applyFalseConfidenceProtection({
  evaluationStatus = '',
  eventLabels = [],
  policyFacts = {},
  confidence = 'MEDIUM'
} = {}) {
  const labels = new Set(eventLabels);
  const warnings = [];
  let protectedStatus = evaluationStatus;
  let protectedConfidence = confidence;

  const accidentMissing =
    (labels.has('ACCIDENT') || labels.has('SPORTS_INJURY'))
      ? missing(['accidentDescription', 'medicalAttention', 'eventDate'], policyFacts)
      : [];

  const foreignMissing =
    labels.has('FOREIGN_EVENT')
      ? missing(['country', 'emergencyVsPlanned'], policyFacts)
      : [];

  const pregnancyMissing =
    (labels.has('PREGNANCY') || labels.has('CHILDBIRTH') || labels.has('CESAREAN'))
      ? missing(['policyStartDate', 'maternityContext'], policyFacts)
      : [];

  const seriousMissing =
    (
      labels.has('CANCER')
      || labels.has('TUMOR')
      || labels.has('HEART_ATTACK')
      || labels.has('KIDNEY_FAILURE')
    )
      ? missing(['diagnosis', 'medicalReport'], policyFacts)
      : [];

  const surgeryMissing =
    labels.has('POSSIBLE_SURGERY')
      ? missing(['diagnosis', 'hospital', 'surgeryDate'], policyFacts)
      : [];

  const dentalMissing =
    labels.has('DENTAL')
      ? missing(['dentalDiagnosis', 'accidentRelated'], policyFacts)
      : [];

  const medicationMissing =
    labels.has('MEDICATION')
      ? missing(['medicationName', 'prescription'], policyFacts)
      : [];

  const hospitalizationMissing =
    labels.has('HOSPITALIZATION')
      ? missing(['diagnosis', 'hospital', 'admissionDate'], policyFacts)
      : [];

  if (labels.has('UNKNOWN_CONTEXT') || confidence === 'LOW') {
    protectedConfidence = 'LOW';
    warnings.push('User uncertainty or low classification confidence requires caution.');
  }

  const blockers = [
    ...accidentMissing,
    ...foreignMissing,
    ...pregnancyMissing,
    ...seriousMissing,
    ...surgeryMissing,
    ...dentalMissing,
    ...medicationMissing,
    ...hospitalizationMissing
  ];

  if (
    evaluationStatus === 'LIKELY_COVERED'
    && (blockers.length > 0 || labels.has('UNKNOWN_CONTEXT'))
  ) {
    protectedStatus = 'INSUFFICIENT_EVIDENCE';
    protectedConfidence = 'LOW';
    warnings.push('Likely covered was blocked because required confidence evidence is missing.');
  }

  return {
    originalStatus: evaluationStatus,
    evaluationStatus: protectedStatus,
    confidence: protectedConfidence,
    blockedLikelyCovered: evaluationStatus === 'LIKELY_COVERED' && protectedStatus !== 'LIKELY_COVERED',
    missingConfidenceEvidence: [...new Set(blockers)],
    warnings
  };
}

export default applyFalseConfidenceProtection;

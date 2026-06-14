/*
|--------------------------------------------------------------------------
| MODULE: coverage-evaluation-foundation-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Rutea evaluacion de eventos con evidencia minima. No aprueba reclamos.
|
|--------------------------------------------------------------------------
*/

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const EVENT_REQUIREMENTS = {
  accident: ['product', 'policyStatus', 'eventDate', 'accidentDescription', 'territoriality'],
  illness: ['product', 'policyStatus', 'diagnosis', 'symptomDate', 'territoriality'],
  maternity: ['product', 'policyStatus', 'pregnancyWeeks', 'policyStartDate', 'insuredAge'],
  foreignCare: ['product', 'policyStatus', 'eventDate', 'territoriality', 'foreignOptionalCoverage'],
  hospitalization: ['product', 'policyStatus', 'diagnosis', 'hospital', 'eventDate'],
  medication: ['product', 'policyStatus', 'diagnosis', 'prescription']
};

function eventKey(eventType = '') {
  const normalized = normalize(eventType);

  if (normalized.includes('accident')) {
    return 'accident';
  }

  if (normalized.includes('illness') || normalized.includes('disease')) {
    return 'illness';
  }

  if (normalized.includes('maternity') || normalized.includes('pregnancy')) {
    return 'maternity';
  }

  if (normalized.includes('foreign') || normalized.includes('abroad')) {
    return 'foreignCare';
  }

  if (normalized.includes('hospital')) {
    return 'hospitalization';
  }

  if (normalized.includes('medication') || normalized.includes('medicine')) {
    return 'medication';
  }

  return null;
}

function missingFields(requiredEvidence = [], policyFacts = {}) {
  return requiredEvidence.filter((field) =>
    policyFacts[field] === null
    || policyFacts[field] === undefined
    || policyFacts[field] === ''
  );
}

function nextQuestionFor(field) {
  const questions = {
    product: 'Which exact product is active?',
    policyStatus: 'Is the policy currently active?',
    eventDate: 'When did the event happen?',
    accidentDescription: 'What happened in the accident?',
    territoriality: 'Where did the event or treatment happen?',
    diagnosis: 'What diagnosis or medical event is being reviewed?',
    symptomDate: 'When did symptoms first appear?',
    pregnancyWeeks: 'How many weeks of pregnancy are documented?',
    policyStartDate: 'When did the policy start?',
    insuredAge: 'What is the insured person age?',
    foreignOptionalCoverage: 'Does the policy show an active foreign-care optional benefit?',
    hospital: 'Which hospital is involved?',
    prescription: 'Is there a prescription or medical order?'
  };

  return questions[field] || 'What evidence is missing?';
}

export function evaluateCoverageFoundation({ eventType = '', policyFacts = {} } = {}) {
  const key = eventKey(eventType);

  if (!key) {
    return {
      evaluationStatus: 'INSUFFICIENT_EVIDENCE',
      requiredEvidence: ['eventType'],
      missingEvidence: ['eventType'],
      nextBestQuestion: 'What type of medical event should be reviewed?'
    };
  }

  const requiredEvidence = EVENT_REQUIREMENTS[key];
  const missingEvidence = missingFields(requiredEvidence, policyFacts);

  if (missingEvidence.length > 0) {
    return {
      evaluationStatus: 'INSUFFICIENT_EVIDENCE',
      requiredEvidence,
      missingEvidence,
      nextBestQuestion: nextQuestionFor(missingEvidence[0])
    };
  }

  if (policyFacts.explicitExclusion === true || policyFacts.policyStatus === 'INACTIVE') {
    return {
      evaluationStatus: 'LIKELY_NOT_COVERED',
      requiredEvidence,
      missingEvidence: [],
      nextBestQuestion: 'Which document shows the exclusion or inactive status?'
    };
  }

  if (
    policyFacts.preexistingConcern === true
    || policyFacts.highSpecialtyTreatment === true
    || key === 'foreignCare'
    || key === 'maternity'
  ) {
    return {
      evaluationStatus: 'HUMAN_REVIEW_REQUIRED',
      requiredEvidence,
      missingEvidence: [],
      nextBestQuestion: 'Which policy document and medical evidence should be reviewed by a qualified person?'
    };
  }

  return {
    evaluationStatus: 'LIKELY_COVERED',
    requiredEvidence,
    missingEvidence: [],
    nextBestQuestion: 'Confirm source documents before explaining any coverage expectation.'
  };
}

export default evaluateCoverageFoundation;

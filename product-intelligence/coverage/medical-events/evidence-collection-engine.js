/*
|--------------------------------------------------------------------------
| MODULE: evidence-collection-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Detecta evidencia faltante y la siguiente pregunta mas valiosa.
|
|--------------------------------------------------------------------------
*/

import { classifyMedicalEvent } from './event-classification-engine.js';

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function questionFor(field) {
  const questions = {
    policyStatus: 'Is the policy currently active?',
    policyStartDate: 'When did the policy start?',
    insuredAge: 'What is the insured person age?',
    pregnancyWeeks: 'How many weeks of pregnancy are documented?',
    deliveryDate: 'What is the expected or actual delivery date?',
    medicalIndication: 'What medical indication supports the procedure?',
    eventDate: 'When did the event happen?',
    accidentDescription: 'What happened in the accident?',
    firstExpenseDate: 'When was the first related medical expense?',
    territoriality: 'Where did the event or treatment happen?',
    diagnosis: 'What diagnosis is being reviewed?',
    surgeryType: 'What surgery is being considered?',
    surgeryDate: 'When is the surgery scheduled or when did it happen?',
    hospital: 'Which hospital is involved?',
    admissionDate: 'When was the hospital admission?',
    diagnosisDate: 'When was the diagnosis made?',
    medicalReport: 'Is there a medical report?',
    country: 'In which country did the event or treatment happen?',
    foreignCoverage: 'Does the policy show an active foreign-care benefit?',
    prescription: 'Is there a prescription?',
    medicationName: 'Which medication is being reviewed?',
    dentalDiagnosis: 'What dental diagnosis is being reviewed?',
    accidentRelated: 'Was the dental event related to an accident?'
  };

  return questions[field] || 'What evidence is missing?';
}

export function collectEventEvidence({ eventType = '', event = '', policyFacts = {} } = {}) {
  const classification =
    classifyMedicalEvent({
      event,
      eventType
    });

  const collectedEvidence = {};
  const requiredEvidence = classification.requiredEvidence || [];

  requiredEvidence.forEach((field) => {
    if (hasValue(policyFacts[field])) {
      collectedEvidence[field] = policyFacts[field];
    }
  });

  const missingEvidence =
    requiredEvidence.filter((field) => !hasValue(policyFacts[field]));

  return {
    collectedEvidence,
    missingEvidence,
    nextBestQuestion:
      missingEvidence.length > 0
        ? questionFor(missingEvidence[0])
        : 'No required evidence is missing for initial routing.'
  };
}

export default collectEventEvidence;

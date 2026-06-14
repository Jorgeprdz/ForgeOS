/*
|--------------------------------------------------------------------------
| MODULE: event-classification-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Clasifica eventos medicos reales para ruteo inicial de GMM.
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

const FAMILIES = [
  {
    eventFamily: 'PREGNANCY',
    terms: ['pregnancy', 'embarazo', 'pregnant'],
    requiredEvidence: ['policyStatus', 'policyStartDate', 'insuredAge', 'pregnancyWeeks']
  },
  {
    eventFamily: 'CHILDBIRTH',
    terms: ['childbirth', 'parto', 'birth', 'delivery'],
    requiredEvidence: ['policyStatus', 'policyStartDate', 'insuredAge', 'deliveryDate']
  },
  {
    eventFamily: 'CESAREAN',
    terms: ['cesarean', 'cesarea', 'c section'],
    requiredEvidence: ['policyStatus', 'policyStartDate', 'insuredAge', 'deliveryDate', 'medicalIndication']
  },
  {
    eventFamily: 'ACCIDENT',
    terms: ['accident', 'accidente', 'crash', 'fall', 'broken arm', 'fractura'],
    requiredEvidence: ['policyStatus', 'eventDate', 'accidentDescription', 'firstExpenseDate', 'territoriality']
  },
  {
    eventFamily: 'SURGERY',
    terms: ['surgery', 'cirugia', 'operation', 'operacion'],
    requiredEvidence: ['policyStatus', 'diagnosis', 'surgeryType', 'surgeryDate', 'hospital']
  },
  {
    eventFamily: 'HOSPITALIZATION',
    terms: ['hospitalization', 'hospitalizacion', 'hospital', 'emergency room', 'urgencias'],
    requiredEvidence: ['policyStatus', 'diagnosis', 'hospital', 'admissionDate']
  },
  {
    eventFamily: 'CANCER',
    terms: ['cancer', 'tumor', 'oncology', 'oncologia', 'chemotherapy'],
    requiredEvidence: ['policyStatus', 'diagnosis', 'diagnosisDate', 'medicalReport']
  },
  {
    eventFamily: 'FOREIGN_TREATMENT',
    terms: ['foreign', 'abroad', 'extranjero', 'outside mexico', 'emergency abroad'],
    requiredEvidence: ['policyStatus', 'eventDate', 'country', 'territoriality', 'foreignCoverage']
  },
  {
    eventFamily: 'MEDICATION',
    terms: ['medication', 'medicine', 'medicamento', 'drug', 'prescription'],
    requiredEvidence: ['policyStatus', 'diagnosis', 'prescription', 'medicationName']
  },
  {
    eventFamily: 'DENTAL',
    terms: ['dental', 'tooth', 'teeth', 'dentist', 'diente'],
    requiredEvidence: ['policyStatus', 'eventDate', 'dentalDiagnosis', 'accidentRelated']
  }
];

export function classifyMedicalEvent({ event = '', eventType = '' } = {}) {
  const input = normalize(`${eventType} ${event}`);

  if (!input) {
    return {
      eventFamily: 'UNKNOWN',
      confidence: 'UNKNOWN',
      requiredEvidence: ['eventDescription']
    };
  }

  const match =
    FAMILIES.find((family) =>
      family.terms.some((term) => input.includes(term))
    );

  if (!match) {
    return {
      eventFamily: 'UNKNOWN',
      confidence: 'LOW',
      requiredEvidence: ['eventDescription', 'diagnosis', 'eventDate']
    };
  }

  return {
    eventFamily: match.eventFamily,
    confidence: 'HIGH',
    requiredEvidence: match.requiredEvidence
  };
}

export default classifyMedicalEvent;

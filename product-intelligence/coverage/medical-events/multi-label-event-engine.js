/*
|--------------------------------------------------------------------------
| MODULE: multi-label-event-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Clasificacion multi-etiqueta para eventos GMM.
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

const LABELS = [
  { label: 'PREGNANCY', terms: ['pregnant', 'pregnancy', 'embarazo', 'pregnant through'] },
  { label: 'ASSISTED_REPRODUCTION', terms: ['ivf', 'assisted reproduction', 'fertility', 'in vitro'] },
  { label: 'CHILDBIRTH', terms: ['childbirth', 'birth', 'delivery', 'labor started', 'labor', 'parto'] },
  { label: 'CESAREAN', terms: ['cesarean', 'cesarea', 'c section'] },
  { label: 'ACCIDENT', terms: ['accident', 'crash', 'fell', 'fall', 'fracture', 'broken', 'crashed'] },
  { label: 'SPORTS_INJURY', terms: ['padel', 'soccer', 'football', 'acl', 'sports', 'playing'] },
  { label: 'POSSIBLE_SURGERY', terms: ['surgery', 'operation', 'surgical', 'doctor recommends surgery', 'may be required'] },
  { label: 'HOSPITALIZATION', terms: ['hospitalized', 'hospitalization', 'hospital admitted', 'admitted', 'observation'] },
  { label: 'EMERGENCY', terms: ['emergency', 'tonight', 'emergency room', 'urgency', 'urgent'] },
  { label: 'CANCER', terms: ['cancer', 'oncology', 'chemotherapy'] },
  { label: 'TUMOR', terms: ['tumor', 'brain tumor'] },
  { label: 'HEART_ATTACK', terms: ['heart attack', 'cardiac infarction', 'infarction'] },
  { label: 'KIDNEY_FAILURE', terms: ['kidney failure', 'dialysis', 'renal failure'] },
  { label: 'FOREIGN_EVENT', terms: ['texas', 'houston', 'united states', 'usa', 'abroad', 'foreign', 'spain'] },
  { label: 'DENTAL', terms: ['dental', 'tooth', 'teeth', 'implants', 'dentist'] },
  { label: 'MEDICATION', terms: ['medication', 'medicine', 'drug', 'prescription'] },
  { label: 'UNKNOWN_CONTEXT', terms: ['dont know', 'don t know', 'do not know', 'i dont know', 'i don t know', 'unknown'] }
];

function scoreLabels(input) {
  return LABELS
    .map((entry) => ({
      label: entry.label,
      score: entry.terms.filter((term) => input.includes(term)).length
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
}

function choosePrimary(labels = []) {
  const priority = [
    'CHILDBIRTH',
    'CESAREAN',
    'PREGNANCY',
    'HEART_ATTACK',
    'KIDNEY_FAILURE',
    'CANCER',
    'TUMOR',
    'ACCIDENT',
    'POSSIBLE_SURGERY',
    'HOSPITALIZATION',
    'FOREIGN_EVENT',
    'DENTAL',
    'MEDICATION'
  ];

  return priority.find((label) => labels.includes(label)) || labels[0] || 'UNKNOWN';
}

function confidenceFor(labels = [], input = '') {
  if (labels.includes('UNKNOWN_CONTEXT')) {
    return 'LOW';
  }

  if (labels.length >= 2) {
    return 'HIGH';
  }

  if (labels.length === 1 && input.length > 0) {
    return 'MEDIUM';
  }

  return 'LOW';
}

export function classifyEventMultiLabel({ event = '' } = {}) {
  const input = normalize(event);
  const labels = scoreLabels(input).map((entry) => entry.label);
  const primaryEvent = choosePrimary(labels);

  return {
    primaryEvent,
    secondaryEvents: labels.filter((label) => label !== primaryEvent),
    confidence: confidenceFor(labels, input)
  };
}

export default classifyEventMultiLabel;

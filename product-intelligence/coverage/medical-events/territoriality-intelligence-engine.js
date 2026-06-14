/*
|--------------------------------------------------------------------------
| MODULE: territoriality-intelligence-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Analiza ubicacion y territorialidad sin decidir cobertura.
|
|--------------------------------------------------------------------------
*/

function normalize(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function analyzeTerritoriality({ eventLocation = '', treatmentLocation = '', policyFacts = {} } = {}) {
  const location = normalize(`${eventLocation} ${treatmentLocation}`);
  const territory = normalize(policyFacts.territoriality || '');
  const abroad =
    location.includes('abroad')
    || location.includes('extranjero')
    || (!location.includes('mexico') && location.length > 0 && location.includes('spain'));

  const missingEvidence = [];

  if (!eventLocation && !treatmentLocation) missingEvidence.push('eventLocation');
  if (!policyFacts.territoriality) missingEvidence.push('territoriality');

  return {
    status:
      missingEvidence.length > 0
        ? 'INSUFFICIENT_EVIDENCE'
        : abroad
          ? 'HUMAN_REVIEW_REQUIRED'
          : 'TERRITORIALITY_CONTEXT_READY',
    territory,
    locationContext: abroad ? 'FOREIGN' : 'DOMESTIC',
    requiredEvidence: ['eventLocation', 'treatmentLocation', 'territoriality'],
    missingEvidence,
    advisorConsiderations: [
      'Clarify where the event happened and where treatment will occur.',
      'Foreign events require source document review before setting expectations.',
      'Do not infer international protection from general product names.'
    ]
  };
}

export default analyzeTerritoriality;

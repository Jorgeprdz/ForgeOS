/*
|--------------------------------------------------------------------------
| MODULE: optional-coverage-intelligence-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Explica coberturas opcionales sin evaluar elegibilidad.
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

const COVERAGES = [
  {
    keys: ['ceda', 'eliminacion de deducible por accidente'],
    coverageName: 'CEDA',
    simpleExplanation: 'Helps reduce the deductible burden when the optional accident deductible benefit is active.',
    whyPeopleBuyIt: 'People buy it to reduce financial stress after an accident.',
    advisorNotes: 'Confirm the optional coverage is active in the issued policy before explaining it as part of the client package.',
    limitations: 'This explanation does not confirm whether a specific accident qualifies.'
  },
  {
    keys: ['proteccion patrimonial', 'patrimonial'],
    coverageName: 'Proteccion Patrimonial',
    simpleExplanation: 'Adds an extra protection concept intended to help protect client assets in specific policy contexts.',
    whyPeopleBuyIt: 'People buy it because they want more peace of mind around major medical financial impact.',
    advisorNotes: 'Confirm whether it appears as active or not active in the policy summary.',
    limitations: 'This does not interpret conditions, exclusions or event eligibility.'
  },
  {
    keys: ['dental'],
    coverageName: 'Dental',
    simpleExplanation: 'Adds dental-related protection when the optional benefit is active.',
    whyPeopleBuyIt: 'People buy it when they want medical coverage to include some dental situations.',
    advisorNotes: 'Separate routine dental expectations from accident or policy-specific dental rules.',
    limitations: 'This explanation does not define covered procedures.'
  },
  {
    keys: ['maternidad', 'maternity'],
    coverageName: 'Maternidad',
    simpleExplanation: 'Adds or modifies maternity-related protection when available and active.',
    whyPeopleBuyIt: 'People buy it to plan for pregnancy-related expenses with more clarity.',
    advisorNotes: 'Maternity conversations require dates, continuity and document review before any specific answer.',
    limitations: 'This does not confirm childbirth, complications or waiting period eligibility.'
  },
  {
    keys: ['cash por diagnostico', 'cash', 'diagnostico'],
    coverageName: 'Cash por Diagnostico',
    simpleExplanation: 'Provides a cash-style benefit tied to a diagnosis when the optional coverage is active.',
    whyPeopleBuyIt: 'People buy it for extra liquidity during a serious health event.',
    advisorNotes: 'Clarify that cash benefits are different from hospital bill reimbursement.',
    limitations: 'This does not confirm diagnosis eligibility or payment conditions.'
  },
  {
    keys: ['internacional', 'international', 'extranjero'],
    coverageName: 'Internacional',
    simpleExplanation: 'Adds international or foreign-care related protection when selected and active.',
    whyPeopleBuyIt: 'People buy it when travel, foreign care or international medical access matters to them.',
    advisorNotes: 'Confirm whether the policy has the specific international benefit the client expects.',
    limitations: 'This does not confirm foreign treatment eligibility, territory or authorization requirements.'
  }
];

export function explainOptionalCoverage({ coverageCode = '', coverageName = '' } = {}) {
  const input = normalize(`${coverageCode} ${coverageName}`);
  const coverage =
    COVERAGES.find((candidate) =>
      candidate.keys.some((key) => input.includes(key))
    );

  if (!coverage) {
    return {
      coverageName: coverageName || coverageCode || 'Unknown optional coverage',
      simpleExplanation: 'Forge does not have a simple explanation for this optional coverage yet.',
      whyPeopleBuyIt: 'Unknown.',
      advisorNotes: 'Confirm the benefit name and source document before explaining it.',
      limitations: 'No eligibility or coverage decision is provided.'
    };
  }

  return {
    coverageName: coverage.coverageName,
    simpleExplanation: coverage.simpleExplanation,
    whyPeopleBuyIt: coverage.whyPeopleBuyIt,
    advisorNotes: coverage.advisorNotes,
    limitations: coverage.limitations
  };
}

export default explainOptionalCoverage;

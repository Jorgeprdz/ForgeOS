/*
|--------------------------------------------------------------------------
| MODULE: coverage-intelligence-orchestrator.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Coordina modulos de Coverage Intelligence sin sustituir a la aseguradora.
|
|--------------------------------------------------------------------------
*/

import { classifyMedicalEvent } from './medical-events/event-classification-engine.js';
import { collectEventEvidence } from './medical-events/evidence-collection-engine.js';
import { analyzeMaternitySituation } from './medical-events/maternity-intelligence-engine.js';
import { analyzeAccidentScenario } from './medical-events/accident-intelligence-engine.js';
import { analyzeHospitalizationScenario } from './medical-events/hospitalization-intelligence-engine.js';
import { analyzeSurgeryScenario } from './medical-events/surgery-intelligence-engine.js';
import { analyzeCatastrophicIllness } from './medical-events/catastrophic-illness-engine.js';
import { analyzeTerritoriality } from './medical-events/territoriality-intelligence-engine.js';
import { routeHumanReview } from './medical-events/human-review-routing-engine.js';
import { evaluateCoverageFoundation } from './medical-events/coverage-evaluation-foundation-engine.js';

function analysisFor({ family, event, policyFacts }) {
  if (family === 'PREGNANCY' || family === 'CHILDBIRTH' || family === 'CESAREAN') {
    return analyzeMaternitySituation({ eventType: family, policyFacts });
  }

  if (family === 'ACCIDENT' || family === 'DENTAL') {
    return analyzeAccidentScenario({ event, policyFacts });
  }

  if (family === 'HOSPITALIZATION') {
    return analyzeHospitalizationScenario({ event, policyFacts });
  }

  if (family === 'SURGERY') {
    return analyzeSurgeryScenario({ event, policyFacts });
  }

  if (family === 'CANCER') {
    return analyzeCatastrophicIllness({ event, policyFacts });
  }

  if (family === 'FOREIGN_TREATMENT') {
    return analyzeTerritoriality({
      eventLocation: policyFacts.eventLocation,
      treatmentLocation: policyFacts.treatmentLocation,
      policyFacts
    });
  }

  return {
    status: 'INSUFFICIENT_EVIDENCE',
    requiredEvidence: ['eventDescription'],
    missingEvidence: ['eventDescription'],
    advisorConsiderations: ['Clarify the event before evaluating.']
  };
}

function foundationEventType(family) {
  const map = {
    PREGNANCY: 'maternity',
    CHILDBIRTH: 'maternity',
    CESAREAN: 'maternity',
    ACCIDENT: 'accident',
    DENTAL: 'accident',
    HOSPITALIZATION: 'hospitalization',
    SURGERY: 'hospitalization',
    CANCER: 'illness',
    FOREIGN_TREATMENT: 'foreignCare',
    MEDICATION: 'medication'
  };

  return map[family] || '';
}

export function runCoverageIntelligence({ event = '', policyFacts = {}, evidence = {} } = {}) {
  const classification = classifyMedicalEvent({ event });
  const collected =
    collectEventEvidence({
      event,
      policyFacts
    });

  const eventAnalysis =
    analysisFor({
      family: classification.eventFamily,
      event,
      policyFacts
    });

  const review =
    routeHumanReview({
      eventAnalysis,
      policyFacts,
      evidence
    });

  const foundation =
    evaluateCoverageFoundation({
      eventType: foundationEventType(classification.eventFamily),
      policyFacts
    });

  const evaluationStatus =
    review.reviewRequired
      ? 'HUMAN_REVIEW_REQUIRED'
      : collected.missingEvidence.length > 0
        ? 'INSUFFICIENT_EVIDENCE'
        : foundation.evaluationStatus;

  return {
    evaluationStatus,
    advisorSummary:
      review.reviewRequired
        ? 'Forge should stop and request review before giving a stronger answer.'
        : 'Forge has enough initial evidence to explain the evaluation route, but not to replace insurer review.',
    requiredEvidence: eventAnalysis.requiredEvidence || classification.requiredEvidence,
    missingEvidence: collected.missingEvidence,
    nextBestQuestion:
      review.reviewRequired
        ? 'Which source documents should be reviewed before answering?'
        : collected.nextBestQuestion,
    reviewRequired: review.reviewRequired
  };
}

export default runCoverageIntelligence;

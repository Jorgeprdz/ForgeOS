const REQUIRED_STAGE_IDS = Object.freeze([
  '001',
  '010',
  '020',
  '030',
  '040',
  '050',
  '060',
  '070',
  '080',
  '090',
  '100',
]);

const ACCEPTED_STATES = new Set(['REMOTE_ACCEPTED', 'ACCEPTED']);

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeClosure(raw = {}) {
  const stageId = asText(raw.stageId);
  const status = asText(raw.status).toUpperCase();
  const evidenceReference = asText(raw.evidenceReference);
  const acceptedHead = asText(raw.acceptedHead);
  const sourceHead = asText(raw.sourceHead);

  if (!stageId) throw new Error('CARTERA110_STAGE_ID_REQUIRED');
  if (!REQUIRED_STAGE_IDS.includes(stageId)) {
    throw new Error(`CARTERA110_UNSUPPORTED_STAGE:${stageId}`);
  }
  if (!status) throw new Error(`CARTERA110_STAGE_STATUS_REQUIRED:${stageId}`);
  if (!evidenceReference) {
    throw new Error(`CARTERA110_EVIDENCE_REFERENCE_REQUIRED:${stageId}`);
  }

  return Object.freeze({
    stageId,
    status,
    evidenceReference,
    acceptedHead: acceptedHead || null,
    sourceHead: sourceHead || null,
    accepted: ACCEPTED_STATES.has(status),
  });
}

function classifyStage(stageId, closures) {
  const matches = closures.filter(item => item.stageId === stageId);
  if (matches.length === 0) {
    return Object.freeze({
      stageId,
      state: 'MISSING',
      evidenceReferences: Object.freeze([]),
      acceptedHead: null,
      sourceHead: null,
    });
  }

  const uniqueEvidence = [...new Set(matches.map(item => item.evidenceReference))];
  const uniqueHeads = [...new Set(matches.map(item => item.acceptedHead).filter(Boolean))];
  const acceptedCount = matches.filter(item => item.accepted).length;

  if (matches.length > 1 || uniqueEvidence.length > 1 || uniqueHeads.length > 1) {
    return Object.freeze({
      stageId,
      state: 'CONFLICTING',
      evidenceReferences: Object.freeze(uniqueEvidence),
      acceptedHead: uniqueHeads.length === 1 ? uniqueHeads[0] : null,
      sourceHead: null,
    });
  }

  const closure = matches[0];
  return Object.freeze({
    stageId,
    state: acceptedCount === 1 ? 'ACCEPTED' : 'INCOMPLETE',
    evidenceReferences: Object.freeze(uniqueEvidence),
    acceptedHead: closure.acceptedHead,
    sourceHead: closure.sourceHead,
  });
}

export function createCartera110ProgramCompletionManifest(raw = {}) {
  const closures = Array.isArray(raw.closures)
    ? raw.closures.map(normalizeClosure)
    : [];

  const stages = REQUIRED_STAGE_IDS.map(stageId => classifyStage(stageId, closures));
  const acceptedStages = stages.filter(item => item.state === 'ACCEPTED').length;
  const blockers = stages
    .filter(item => item.state !== 'ACCEPTED')
    .map(item => Object.freeze({
      code: `STAGE_${item.stageId}_${item.state}`,
      stageId: item.stageId,
      state: item.state,
    }));

  const canonicalRoadmapComplete = raw.canonicalRoadmapComplete === true;
  const completionState = acceptedStages === REQUIRED_STAGE_IDS.length && canonicalRoadmapComplete
    ? 'COMPLETE'
    : blockers.some(item => item.state === 'CONFLICTING')
      ? 'CONFLICTING'
      : 'INCOMPLETE';

  return Object.freeze({
    contract: 'CARTERA_110A_PROGRAM_COMPLETION_MANIFEST_V1',
    sourceAuthority: 'PERSISTED_CARTERA_ACCEPTANCE_CLOSURES',
    requiredStageIds: REQUIRED_STAGE_IDS,
    stages: Object.freeze(stages),
    acceptedStages,
    requiredStages: REQUIRED_STAGE_IDS.length,
    canonicalRoadmapComplete,
    completionState,
    blockers: Object.freeze(blockers),
    boundaries: Object.freeze({
      branchNameIsEvidence: false,
      pullRequestTitleIsEvidence: false,
      missingIsComplete: false,
      conflictingIsResolved: false,
      automaticPromotion: false,
      automaticMerge: false,
      mainMutation: false,
    }),
  });
}

export { REQUIRED_STAGE_IDS as CARTERA_110_REQUIRED_STAGE_IDS };

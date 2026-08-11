const EDGE_TYPES = Object.freeze([
  'REFERRED_BY',
  'REFERRED_PERSON',
  'FAMILY',
  'HOUSEHOLD',
  'COMPANY',
  'PARTNER',
  'TEAM',
  'PROFESSIONAL_COMMUNITY',
  'CENTER_OF_INFLUENCE_HYPOTHESIS',
  'PRIOR_INTRODUCTION',
]);

const CAPITAL_CLASSES = Object.freeze([
  'RELATIONSHIP_CONTINUITY',
  'INTRODUCTION_CONTEXT',
  'CENTER_OF_INFLUENCE_CONTEXT',
  'PROFESSIONAL_NETWORK_CONTEXT',
]);

const CLASS_ORDER = new Map(CAPITAL_CLASSES.map((value, index) => [value, index]));
const FORBIDDEN_KEYS = new Set([
  'influenceScore',
  'relationshipScore',
  'relationshipValueScore',
  'networkScore',
  'priorityScore',
  'finalPriority',
  'predictedRevenue',
  'expectedRevenue',
  'commissionAmount',
  'payoutAmount',
  'referralProbability',
  'purchaseProbability',
  'humanWorth',
  'finalMessage',
]);

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  throw error;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function assertNoOpaqueScoring(value, path = 'payload') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoOpaqueScoring(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      fail('CARTERA090_OPAQUE_SCORE_OR_VALUE_EXPOSED', { path: `${path}.${key}` });
    }
    assertNoOpaqueScoring(nested, `${path}.${key}`);
  }
}

function requiredText(value, code, maxLength = 500) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) fail(code);
  return normalized.slice(0, maxLength);
}

function optionalText(value, maxLength = 500) {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim().slice(0, maxLength) || null;
}

function requiredDate(value, code) {
  const normalized = requiredText(value, code, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) fail(code);
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    fail(code);
  }
  return normalized;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function evidenceItem(reference, authority, truthClass) {
  return Object.freeze({
    reference: requiredText(reference, 'CARTERA090_EVIDENCE_REFERENCE_REQUIRED', 240),
    authority: requiredText(authority, 'CARTERA090_EVIDENCE_AUTHORITY_REQUIRED', 120),
    truthClass: requiredText(truthClass, 'CARTERA090_EVIDENCE_TRUTH_CLASS_REQUIRED', 120),
  });
}

function normalizeGrowthEvidence(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 20) {
    fail('CARTERA090_EVIDENCE_REQUIRED');
  }
  return Object.freeze(input.map(item => evidenceItem(
    item?.reference,
    item?.authority,
    item?.truthClass
  )));
}

function mapAccountEdgeType(account = {}) {
  const accountType = String(account.accountType || '').trim().toUpperCase();
  const role = String(account.relationshipRole || '').trim().toUpperCase();

  if (role.includes('FAMILY')) return 'FAMILY';
  if (accountType === 'HOUSEHOLD' || role.includes('HOUSEHOLD')) return 'HOUSEHOLD';
  if (role.includes('PARTNER')) return 'PARTNER';
  if (accountType === 'TEAM' || role.includes('TEAM')) return 'TEAM';
  if (
    ['COMPANY', 'ORGANIZATION', 'BUSINESS'].includes(accountType)
    || ['OWNER', 'EMPLOYEE', 'DIRECTOR', 'MEMBER'].some(token => role.includes(token))
  ) return 'COMPANY';
  if (
    ['COMMUNITY', 'PROFESSIONAL_COMMUNITY', 'ASSOCIATION', 'NETWORK'].includes(accountType)
    || role.includes('COMMUNITY')
  ) return 'PROFESSIONAL_COMMUNITY';
  return null;
}

function normalizeBrief(brief) {
  if (!brief || typeof brief !== 'object') fail('CARTERA090_RELATIONSHIP_BRIEF_INVALID');
  if (
    brief.projectionAuthority !== 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL'
    || brief.readOnly !== true
  ) {
    fail('CARTERA090_RELATIONSHIP_BRIEF_AUTHORITY_INVALID');
  }
  const person = brief.person || {};
  return Object.freeze({
    personReference: requiredText(
      person.personReference,
      'CARTERA090_PERSON_REFERENCE_REQUIRED',
      240
    ),
    displayName: requiredText(person.displayName, 'CARTERA090_DISPLAY_NAME_REQUIRED', 240),
    preferredName: optionalText(person.preferredName, 160),
    lifecycleState: optionalText(person.lifecycleState, 80) || 'UNKNOWN',
    privacyClassification: optionalText(person.privacyClassification, 80) || 'PRIVATE',
    lastInteractionAt: brief.summary?.lastInteractionAt || null,
    accounts: Object.freeze(list(brief.network?.accounts).map(account => Object.freeze({
      accountReference: requiredText(
        account.accountReference,
        'CARTERA090_ACCOUNT_REFERENCE_REQUIRED',
        240
      ),
      displayLabel: requiredText(account.displayLabel, 'CARTERA090_ACCOUNT_LABEL_REQUIRED', 240),
      accountType: optionalText(account.accountType, 80) || 'UNKNOWN',
      relationshipRole: optionalText(account.relationshipRole, 120) || 'RELATIONSHIP',
      confirmationState: optionalText(account.confirmationState, 80) || 'UNKNOWN',
    }))),
  });
}

function normalizeGrowthProjection(growth) {
  if (!growth || typeof growth !== 'object') fail('CARTERA090_GROWTH_PROJECTION_REQUIRED');
  if (
    growth.projectionAuthority !== 'CARTERA060_RELATIONSHIP_GROWTH_REVIEW_READ_MODEL'
    || growth.readOnly !== true
  ) {
    fail('CARTERA090_GROWTH_AUTHORITY_INVALID');
  }
  return growth;
}

function capitalReference(personReference, capitalClass, evidence) {
  const evidencePart = evidence.map(item => item.reference).sort().join('|');
  let hash = 2166136261;
  const source = `${personReference}|${capitalClass}|${evidencePart}`;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `CARTERA090:${personReference}:${capitalClass}:${(hash >>> 0).toString(16)}`;
}

function relationshipContinuityItem(brief, accountEvidence) {
  const professional = accountEvidence.some(item => item.edgeType === 'COMPANY'
    || item.edgeType === 'TEAM'
    || item.edgeType === 'PROFESSIONAL_COMMUNITY');
  const capitalClass = professional
    ? 'PROFESSIONAL_NETWORK_CONTEXT'
    : 'RELATIONSHIP_CONTINUITY';
  const evidence = Object.freeze(accountEvidence.map(item => evidenceItem(
    item.accountReference,
    'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
    'CONFIRMED_RELATIONSHIP_CONTEXT'
  )));

  return Object.freeze({
    capitalReference: capitalReference(brief.personReference, capitalClass, evidence),
    capitalClass,
    personReference: brief.personReference,
    displayName: brief.preferredName || brief.displayName,
    whyThisRelationship: professional
      ? 'Existe contexto profesional o comunitario confirmado alrededor de esta relación.'
      : 'Existe una relación familiar o de hogar confirmada que forma parte del contexto comercial legítimo.',
    whyNow: 'Conviene mantener inteligible la red aun cuando no exista una venta o renovación inmediata.',
    uncertainty: 'La relación confirmada no prueba influencia, disposición a introducir, prioridad comercial ni intención de compra.',
    smallestUsefulAction: 'Revisar el contexto de la relación y confirmar si los roles siguen vigentes.',
    advisorMustConfirm: 'Confirmar vigencia, propósito y cualquier consentimiento requerido antes de actuar.',
    evidence,
    clientWillingnessConfirmed: false,
    candidateState: 'REVIEW_REQUIRED',
    immediateSaleDue: false,
    renewalDue: false,
    influenceClaimed: false,
    referralRequestPrepared: false,
    finalPriorityTruth: false,
  });
}

function growthCapitalItem(item) {
  const growthClass = String(item.growthClass || '').toUpperCase();
  if (!['REFERRAL_RELATIONSHIP', 'CENTER_OF_INFLUENCE'].includes(growthClass)) return null;
  if (item.clientWillingnessConfirmed !== true) {
    fail('CARTERA090_CLIENT_WILLINGNESS_REQUIRED');
  }
  if (item.candidateState !== 'REVIEW_REQUIRED') {
    fail('CARTERA090_REVIEW_STATE_REQUIRED');
  }
  const evidence = normalizeGrowthEvidence(item.evidence);
  const capitalClass = growthClass === 'CENTER_OF_INFLUENCE'
    ? 'CENTER_OF_INFLUENCE_CONTEXT'
    : 'INTRODUCTION_CONTEXT';

  return Object.freeze({
    capitalReference: capitalReference(item.personReference, capitalClass, evidence),
    capitalClass,
    personReference: requiredText(item.personReference, 'CARTERA090_PERSON_REFERENCE_REQUIRED', 240),
    displayName: requiredText(item.displayName, 'CARTERA090_DISPLAY_NAME_REQUIRED', 240),
    whyThisRelationship: requiredText(item.whyThisPerson, 'CARTERA090_WHY_RELATIONSHIP_REQUIRED'),
    whyNow: requiredText(item.whyNow, 'CARTERA090_WHY_NOW_REQUIRED'),
    uncertainty: requiredText(item.uncertainty, 'CARTERA090_UNCERTAINTY_REQUIRED'),
    smallestUsefulAction: growthClass === 'CENTER_OF_INFLUENCE'
      ? 'Preparar una revisión de relación y servicio sin solicitar referidos automáticamente.'
      : 'Revisar el contexto antes de decidir si corresponde conversar sobre una introducción específica.',
    advisorMustConfirm: requiredText(item.advisorMustConfirm, 'CARTERA090_CONFIRMATION_REQUIRED'),
    evidence,
    clientWillingnessConfirmed: true,
    candidateState: 'REVIEW_REQUIRED',
    immediateSaleDue: false,
    renewalDue: false,
    influenceClaimed: false,
    referralRequestPrepared: false,
    finalPriorityTruth: false,
  });
}

export function createCartera090RelationshipCapitalProjection({
  asOfDate,
  growthProjection,
  relationshipBriefs = [],
} = {}) {
  assertNoOpaqueScoring({ growthProjection, relationshipBriefs });
  const normalizedGrowth = normalizeGrowthProjection(growthProjection);
  const briefs = Object.freeze(list(relationshipBriefs).map(normalizeBrief));
  const nodes = [];
  const edges = [];
  const items = [];
  const hypotheses = [];
  const nodeKeys = new Set();
  const itemKeys = new Set();

  const addNode = node => {
    if (nodeKeys.has(node.nodeReference)) return;
    nodeKeys.add(node.nodeReference);
    nodes.push(Object.freeze(node));
  };
  const addItem = item => {
    if (!item || itemKeys.has(item.capitalReference)) return;
    itemKeys.add(item.capitalReference);
    items.push(item);
  };

  briefs.forEach(brief => {
    addNode({
      nodeReference: brief.personReference,
      nodeType: 'PERSON',
      displayLabel: brief.preferredName || brief.displayName,
      lifecycleState: brief.lifecycleState,
      privacyClassification: brief.privacyClassification,
      sourceAuthority: 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
    });

    const accountEvidence = [];
    brief.accounts.forEach(account => {
      if (account.confirmationState !== 'CONFIRMED') return;
      const edgeType = mapAccountEdgeType(account);
      if (!edgeType) return;
      addNode({
        nodeReference: account.accountReference,
        nodeType: 'ACCOUNT',
        displayLabel: account.displayLabel,
        accountType: account.accountType,
        sourceAuthority: 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
      });
      const edge = Object.freeze({
        edgeReference: `CARTERA090:${brief.personReference}:${account.accountReference}:${edgeType}`,
        fromReference: brief.personReference,
        toReference: account.accountReference,
        edgeType,
        relationshipRole: account.relationshipRole,
        confirmationState: 'CONFIRMED',
        consentState: 'NOT_APPLICABLE',
        evidenceReferences: Object.freeze([account.accountReference]),
        sourceAuthority: 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
        truthClass: 'CONFIRMED_RELATIONSHIP_CONTEXT',
        readOnly: true,
      });
      edges.push(edge);
      accountEvidence.push(Object.freeze({
        accountReference: account.accountReference,
        edgeType,
      }));
    });
    if (accountEvidence.length) addItem(relationshipContinuityItem(brief, accountEvidence));
  });

  list(normalizedGrowth.items).forEach(rawItem => {
    const item = growthCapitalItem(rawItem);
    if (!item) return;
    addItem(item);
    addNode({
      nodeReference: item.personReference,
      nodeType: 'PERSON',
      displayLabel: item.displayName,
      lifecycleState: 'UNKNOWN',
      privacyClassification: 'PRIVATE',
      sourceAuthority: 'CARTERA060_RELATIONSHIP_GROWTH_REVIEW_READ_MODEL',
    });
    hypotheses.push(Object.freeze({
      hypothesisReference: `${item.capitalReference}:HYPOTHESIS`,
      hypothesisType: item.capitalClass === 'CENTER_OF_INFLUENCE_CONTEXT'
        ? 'CENTER_OF_INFLUENCE_HYPOTHESIS'
        : 'PRIOR_INTRODUCTION',
      personReference: item.personReference,
      evidence: item.evidence,
      clientWillingnessConfirmed: item.clientWillingnessConfirmed,
      truthClass: 'REVIEW_REQUIRED_HYPOTHESIS',
      opaqueInfluenceScoreAllowed: false,
      readOnly: true,
    }));
  });

  items.sort((left, right) => (
    (CLASS_ORDER.get(left.capitalClass) - CLASS_ORDER.get(right.capitalClass))
    || left.displayName.localeCompare(right.displayName, 'es')
    || left.capitalReference.localeCompare(right.capitalReference)
  ));
  edges.sort((left, right) => left.edgeReference.localeCompare(right.edgeReference));
  nodes.sort((left, right) => left.displayLabel.localeCompare(right.displayLabel, 'es'));

  return deepFreeze({
    asOfDate: requiredDate(asOfDate || normalizedGrowth.asOfDate, 'CARTERA090_AS_OF_DATE_REQUIRED'),
    scope: 'PORTFOLIO',
    summary: {
      nodeCount: nodes.length,
      confirmedEdgeCount: edges.length,
      hypothesisCount: hypotheses.length,
      reviewItemCount: items.length,
      introductionContextCount: items.filter(item => item.capitalClass === 'INTRODUCTION_CONTEXT').length,
      centerOfInfluenceContextCount: items.filter(item => item.capitalClass === 'CENTER_OF_INFLUENCE_CONTEXT').length,
      networkContextCount: items.filter(item => [
        'RELATIONSHIP_CONTINUITY',
        'PROFESSIONAL_NETWORK_CONTEXT',
      ].includes(item.capitalClass)).length,
    },
    nodes,
    edges,
    hypotheses,
    items,
    orderingBasis: 'CLASS_THEN_NAME_NOT_PRIORITY',
    boundaries: {
      sharedGraphTruthMutated: false,
      opaqueInfluenceScoreAllowed: false,
      automaticContactExecution: false,
      finalMessageGeneration: false,
      automaticTaskCreation: false,
      automaticCalendarCreation: false,
      automaticOpportunityCreation: false,
      referralRequestExecution: false,
      clientIntentInferred: false,
      finalNbaPriorityTruth: false,
      advisorConfirmationRequired: true,
    },
    projectionAuthority: 'CARTERA090_RELATIONSHIP_CAPITAL_READ_MODEL',
    readOnly: true,
  });
}

export const CARTERA_090_EDGE_TYPES = EDGE_TYPES;
export const CARTERA_090_CAPITAL_CLASSES = CAPITAL_CLASSES;

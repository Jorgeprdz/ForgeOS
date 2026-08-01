const GROWTH_CLASSES = Object.freeze([
    'SECOND_POLICY_REVIEW',
    'PROTECTION_REVIEW',
    'REFERRAL_RELATIONSHIP',
    'CENTER_OF_INFLUENCE',
]);

const CLASS_ORDER = new Map(GROWTH_CLASSES.map((value, index) => [value, index]));
const FORBIDDEN_KEYS = new Set([
    'priorityScore',
    'finalPriority',
    'lapseProbability',
    'commissionAmount',
    'payoutAmount',
    'bankAccount',
    'paymentInstrument',
    'finalMessage',
    'providerRequest',
    'providerResponse',
]);

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

function assertSafe(value, path = 'response') {
    if (Array.isArray(value)) {
        value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
        if (FORBIDDEN_KEYS.has(key)) {
            throw fail('CARTERA060_RESTRICTED_FIELD_EXPOSED', { path: `${path}.${key}` });
        }
        assertSafe(nested, `${path}.${key}`);
    }
}

function requiredText(value, code) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized) throw fail(code);
    return normalized;
}

function normalizeEvidence(input) {
    if (!Array.isArray(input) || input.length < 1 || input.length > 12) {
        throw fail('CARTERA060_EVIDENCE_REQUIRED');
    }
    return Object.freeze(input.map((item) => Object.freeze({
        reference: requiredText(item?.reference, 'CARTERA060_EVIDENCE_REFERENCE_INVALID'),
        authority: requiredText(item?.authority, 'CARTERA060_EVIDENCE_AUTHORITY_INVALID'),
        truthClass: requiredText(item?.truthClass, 'CARTERA060_EVIDENCE_TRUTH_CLASS_INVALID'),
    })));
}

function normalizeCandidate(item) {
    const growthClass = requiredText(item?.growthClass, 'CARTERA060_GROWTH_CLASS_INVALID').toUpperCase();
    if (!CLASS_ORDER.has(growthClass)) throw fail('CARTERA060_GROWTH_CLASS_INVALID');
    const candidate = {
        candidateReference: requiredText(item?.candidateReference, 'CARTERA060_CANDIDATE_REFERENCE_INVALID'),
        growthClass,
        personReference: requiredText(item?.personReference, 'CARTERA060_PERSON_REFERENCE_INVALID'),
        displayName: requiredText(item?.displayName, 'CARTERA060_DISPLAY_NAME_INVALID'),
        whyThisPerson: requiredText(item?.whyThisPerson, 'CARTERA060_WHY_PERSON_REQUIRED'),
        whyNow: requiredText(item?.whyNow, 'CARTERA060_WHY_NOW_REQUIRED'),
        uncertainty: requiredText(item?.uncertainty, 'CARTERA060_UNCERTAINTY_REQUIRED'),
        smallestUsefulAction: requiredText(item?.smallestUsefulAction, 'CARTERA060_MINIMUM_ACTION_REQUIRED'),
        advisorMustConfirm: requiredText(item?.advisorMustConfirm, 'CARTERA060_CONFIRMATION_REQUIRED'),
        evidence: normalizeEvidence(item?.evidence),
        clientWillingnessConfirmed: item?.clientWillingnessConfirmed === true,
        candidateState: requiredText(item?.candidateState, 'CARTERA060_CANDIDATE_STATE_INVALID'),
        opportunityCreated: item?.opportunityCreated === true,
        contactExecuted: item?.contactExecuted === true,
        referralRequested: item?.referralRequested === true,
        lifeContextUsed: item?.lifeContextUsed === true,
        finalNbaPriority: item?.finalNbaPriority === true,
    };
    if (candidate.candidateState !== 'REVIEW_REQUIRED') {
        throw fail('CARTERA060_REVIEW_STATE_REQUIRED');
    }
    if (
        candidate.opportunityCreated
        || candidate.contactExecuted
        || candidate.referralRequested
        || candidate.lifeContextUsed
        || candidate.finalNbaPriority
    ) {
        throw fail('CARTERA060_AUTOMATION_OR_MANIPULATION_BLOCKED');
    }
    if (
        ['REFERRAL_RELATIONSHIP', 'CENTER_OF_INFLUENCE'].includes(growthClass)
        && !candidate.clientWillingnessConfirmed
    ) {
        throw fail('CARTERA060_REFERRAL_WILLINGNESS_REQUIRED');
    }
    return Object.freeze(candidate);
}

export function createCartera060GrowthReviewProjection(payload = {}) {
    assertSafe(payload);
    if (!payload || typeof payload !== 'object') throw fail('CARTERA060_RESPONSE_INVALID');
    const boundaries = payload.boundaries || {};
    if (
        boundaries.automaticOpportunityCreation !== false
        || boundaries.automaticContactExecution !== false
        || boundaries.finalMessageGeneration !== false
        || boundaries.lifeContextAsSalesTrigger !== false
        || boundaries.referralRequestExecution !== false
        || boundaries.finalNbaPriorityTruth !== false
        || boundaries.advisorConfirmationRequired !== true
    ) {
        throw fail('CARTERA060_BOUNDARY_INVALID');
    }
    const items = (Array.isArray(payload.items) ? payload.items : []).map(normalizeCandidate);
    items.sort((a, b) => (
        (CLASS_ORDER.get(a.growthClass) - CLASS_ORDER.get(b.growthClass))
        || a.displayName.localeCompare(b.displayName, 'es')
        || a.candidateReference.localeCompare(b.candidateReference)
    ));
    return Object.freeze({
        asOfDate: requiredText(payload.asOfDate, 'CARTERA060_AS_OF_DATE_REQUIRED'),
        scope: requiredText(payload.scope, 'CARTERA060_SCOPE_REQUIRED'),
        personReference: payload.personReference || null,
        summary: Object.freeze({
            total: items.length,
            secondPolicyReview: items.filter(item => item.growthClass === 'SECOND_POLICY_REVIEW').length,
            protectionReview: items.filter(item => item.growthClass === 'PROTECTION_REVIEW').length,
            referralRelationship: items.filter(item => item.growthClass === 'REFERRAL_RELATIONSHIP').length,
            centerOfInfluence: items.filter(item => item.growthClass === 'CENTER_OF_INFLUENCE').length,
        }),
        items: Object.freeze(items),
        boundaries: Object.freeze({ ...boundaries }),
        projectionAuthority: requiredText(payload.projectionAuthority, 'CARTERA060_PROJECTION_AUTHORITY_REQUIRED'),
        readOnly: payload.readOnly === true,
    });
}

export { GROWTH_CLASSES as CARTERA_060_GROWTH_CLASSES };

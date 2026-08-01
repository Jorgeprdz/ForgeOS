const ACTION_CLASSES = Object.freeze([
    'CONFIRM_PAYMENT',
    'PREPARE_RENEWAL',
    'SCHEDULE_REVIEW',
    'RESOLVE_MISSING_CONTEXT',
    'REQUEST_DOCUMENTATION',
    'RECOVER_RELATIONSHIP',
    'REVIEW_SECOND_POLICY',
    'STRENGTHEN_CENTER_OF_INFLUENCE',
    'THANK_REFERRER',
    'COMPLETE_SERVICE_COMMITMENT',
]);

const ACTION_CLASS_SET = new Set(ACTION_CLASSES);
const HORIZON_ORDER = new Map([
    ['OVERDUE', 0],
    ['CONFIRMATION_REQUIRED', 1],
    ['TODAY', 2],
    ['NEXT_7_DAYS', 3],
    ['NEXT_30_DAYS', 4],
    ['NEXT_90_DAYS', 5],
    ['NO_DATE', 6],
]);
const FORBIDDEN_KEYS = new Set([
    'priorityScore',
    'finalPriority',
    'highestPriority',
    'engagementScore',
    'variableReward',
    'streak',
    'points',
    'badge',
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
            throw fail('CARTERA070_RESTRICTED_FIELD_EXPOSED', { path: `${path}.${key}` });
        }
        assertSafe(nested, `${path}.${key}`);
    }
}

function requiredText(value, code) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized) throw fail(code);
    return normalized;
}

function optionalText(value) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    return normalized || null;
}

function normalizeEvidence(input) {
    if (!Array.isArray(input) || input.length < 1 || input.length > 12) {
        throw fail('CARTERA070_EVIDENCE_REQUIRED');
    }
    return Object.freeze(input.map(item => Object.freeze({
        reference: requiredText(item?.reference, 'CARTERA070_EVIDENCE_REFERENCE_INVALID'),
        authority: requiredText(item?.authority, 'CARTERA070_EVIDENCE_AUTHORITY_INVALID'),
        truthClass: requiredText(item?.truthClass, 'CARTERA070_EVIDENCE_TRUTH_CLASS_INVALID'),
    })));
}

function normalizeCard(item) {
    const actionClass = requiredText(item?.actionClass, 'CARTERA070_ACTION_CLASS_INVALID').toUpperCase();
    if (!ACTION_CLASS_SET.has(actionClass)) throw fail('CARTERA070_ACTION_CLASS_INVALID');
    const horizon = requiredText(item?.horizon, 'CARTERA070_HORIZON_INVALID').toUpperCase();
    if (!HORIZON_ORDER.has(horizon)) throw fail('CARTERA070_HORIZON_INVALID');
    const estimatedMinutes = Number(item?.estimatedMinutes);
    if (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 5 || estimatedMinutes > 60) {
        throw fail('CARTERA070_ESTIMATED_MINUTES_INVALID');
    }
    const card = {
        actionReference: requiredText(item?.actionReference, 'CARTERA070_ACTION_REFERENCE_INVALID'),
        actionClass,
        actionLabel: requiredText(item?.actionLabel, 'CARTERA070_ACTION_LABEL_REQUIRED'),
        personReference: requiredText(item?.personReference, 'CARTERA070_PERSON_REFERENCE_INVALID'),
        displayName: requiredText(item?.displayName, 'CARTERA070_DISPLAY_NAME_INVALID'),
        policyReference: optionalText(item?.policyReference),
        sourceSignalReference: requiredText(item?.sourceSignalReference, 'CARTERA070_SOURCE_SIGNAL_REQUIRED'),
        sourceAuthority: requiredText(item?.sourceAuthority, 'CARTERA070_SOURCE_AUTHORITY_REQUIRED'),
        truthClass: requiredText(item?.truthClass, 'CARTERA070_TRUTH_CLASS_REQUIRED'),
        horizon,
        eventDate: optionalText(item?.eventDate),
        whyThisPerson: requiredText(item?.whyThisPerson, 'CARTERA070_WHY_PERSON_REQUIRED'),
        whyNow: requiredText(item?.whyNow, 'CARTERA070_WHY_NOW_REQUIRED'),
        uncertainty: requiredText(item?.uncertainty, 'CARTERA070_UNCERTAINTY_REQUIRED'),
        smallestUsefulAction: requiredText(item?.smallestUsefulAction, 'CARTERA070_MINIMUM_ACTION_REQUIRED'),
        advisorMustConfirm: requiredText(item?.advisorMustConfirm, 'CARTERA070_CONFIRMATION_REQUIRED'),
        estimatedMinutes,
        evidence: normalizeEvidence(item?.evidence),
        actionState: requiredText(item?.actionState, 'CARTERA070_ACTION_STATE_INVALID'),
        nbaAuthorizationState: requiredText(item?.nbaAuthorizationState, 'CARTERA070_NBA_STATE_REQUIRED'),
        contactExecuted: item?.contactExecuted === true,
        messageSent: item?.messageSent === true,
        taskCreated: item?.taskCreated === true,
        calendarEventCreated: item?.calendarEventCreated === true,
        opportunityCreated: item?.opportunityCreated === true,
        referralRequested: item?.referralRequested === true,
        finalNbaPriority: item?.finalNbaPriority === true,
        variableRewardUsed: item?.variableRewardUsed === true,
        artificialActivityCreated: item?.artificialActivityCreated === true,
    };
    if (card.actionState !== 'ADVISOR_REVIEW_REQUIRED') {
        throw fail('CARTERA070_ADVISOR_REVIEW_REQUIRED');
    }
    if (
        card.contactExecuted
        || card.messageSent
        || card.taskCreated
        || card.calendarEventCreated
        || card.opportunityCreated
        || card.referralRequested
        || card.finalNbaPriority
        || card.variableRewardUsed
        || card.artificialActivityCreated
    ) {
        throw fail('CARTERA070_AUTOMATION_OR_MANIPULATION_BLOCKED');
    }
    return Object.freeze(card);
}

export function createCartera070RelationalActivationProjection(payload = {}) {
    assertSafe(payload);
    if (!payload || typeof payload !== 'object') throw fail('CARTERA070_RESPONSE_INVALID');
    const boundaries = payload.boundaries || {};
    if (
        boundaries.automaticContactExecution !== false
        || boundaries.automaticMessageSend !== false
        || boundaries.automaticTaskCreation !== false
        || boundaries.automaticCalendarCreation !== false
        || boundaries.automaticOpportunityCreation !== false
        || boundaries.referralRequestExecution !== false
        || boundaries.finalNbaPriorityTruth !== false
        || boundaries.variableRewardOptimization !== false
        || boundaries.artificialActivityInflation !== false
        || boundaries.advisorConfirmationRequired !== true
    ) {
        throw fail('CARTERA070_BOUNDARY_INVALID');
    }
    const items = (Array.isArray(payload.items) ? payload.items : []).map(normalizeCard);
    items.sort((a, b) => (
        (HORIZON_ORDER.get(a.horizon) - HORIZON_ORDER.get(b.horizon))
        || String(a.eventDate || '').localeCompare(String(b.eventDate || ''))
        || (a.estimatedMinutes - b.estimatedMinutes)
        || a.actionReference.localeCompare(b.actionReference)
    ));
    return Object.freeze({
        asOfDate: requiredText(payload.asOfDate, 'CARTERA070_AS_OF_DATE_REQUIRED'),
        availableMinutes: Number(payload.availableMinutes),
        maxCards: Number(payload.maxCards),
        selectionMode: requiredText(payload.selectionMode, 'CARTERA070_SELECTION_MODE_REQUIRED'),
        nbaAuthorityState: requiredText(payload.nbaAuthorityState, 'CARTERA070_NBA_AUTHORITY_STATE_REQUIRED'),
        summary: Object.freeze({
            totalCandidates: Number(payload.summary?.totalCandidates ?? items.length),
            selectedCards: items.length,
            selectedMinutes: items.reduce((sum, item) => sum + item.estimatedMinutes, 0),
            capacityRemaining: Math.max(0, Number(payload.availableMinutes) - items.reduce((sum, item) => sum + item.estimatedMinutes, 0)),
        }),
        items: Object.freeze(items),
        boundaries: Object.freeze({ ...boundaries }),
        projectionAuthority: requiredText(payload.projectionAuthority, 'CARTERA070_PROJECTION_AUTHORITY_REQUIRED'),
        readOnly: payload.readOnly === true,
    });
}

export { ACTION_CLASSES as CARTERA_070_ACTION_CLASSES };

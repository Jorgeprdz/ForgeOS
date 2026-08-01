function fail(code) {
    const error = new Error(code);
    error.code = code;
    return error;
}

export function prepareCartera070ActionReview(card) {
    if (!card?.actionReference || card.actionState !== 'ADVISOR_REVIEW_REQUIRED') {
        throw fail('CARTERA070_CARD_REVIEW_INVALID');
    }
    if (!card.evidence?.length) throw fail('CARTERA070_EVIDENCE_REQUIRED');
    return Object.freeze({
        actionReference: card.actionReference,
        actionClass: card.actionClass,
        personReference: card.personReference,
        displayName: card.displayName,
        policyReference: card.policyReference || null,
        smallestUsefulAction: card.smallestUsefulAction,
        advisorMustConfirm: card.advisorMustConfirm,
        estimatedMinutes: card.estimatedMinutes,
        evidenceReferences: Object.freeze(card.evidence.map(item => item.reference)),
        reviewState: 'PREPARED_FOR_ADVISOR_CONFIRMATION',
        executionAuthorized: false,
        contactExecuted: false,
        messageSent: false,
        taskCreated: false,
        calendarEventCreated: false,
        opportunityCreated: false,
        referralRequested: false,
        finalMessageGenerated: false,
        finalNbaPriority: false,
    });
}

const REFERRAL_CLASSES = new Set(['REFERRAL_RELATIONSHIP', 'CENTER_OF_INFLUENCE']);

function result(eligible, reason, candidate) {
    return Object.freeze({
        eligible,
        reason,
        candidateReference: candidate?.candidateReference || null,
        reviewState: eligible ? 'ADVISOR_REVIEW_REQUIRED' : 'BLOCKED',
        opportunityCreated: false,
        contactExecuted: false,
        referralRequested: false,
        finalMessageGenerated: false,
        finalNbaPriority: false,
    });
}

export function evaluateCartera060GrowthCandidate(candidate = {}) {
    if (!candidate?.candidateReference || !candidate?.growthClass) {
        return result(false, 'CARTERA060_CANDIDATE_INVALID', candidate);
    }
    if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0) {
        return result(false, 'CARTERA060_EVIDENCE_REQUIRED', candidate);
    }
    if (candidate.lifeContextUsed === true) {
        return result(false, 'CARTERA060_LIFE_CONTEXT_SALES_TRIGGER_BLOCKED', candidate);
    }
    if (
        candidate.opportunityCreated === true
        || candidate.contactExecuted === true
        || candidate.referralRequested === true
        || candidate.finalNbaPriority === true
    ) {
        return result(false, 'CARTERA060_AUTOMATIC_EFFECT_BLOCKED', candidate);
    }
    if (REFERRAL_CLASSES.has(candidate.growthClass) && candidate.clientWillingnessConfirmed !== true) {
        return result(false, 'CARTERA060_REFERRAL_WILLINGNESS_REQUIRED', candidate);
    }
    if (!candidate.advisorMustConfirm || !candidate.smallestUsefulAction || !candidate.uncertainty) {
        return result(false, 'CARTERA060_EXPLAINABILITY_INCOMPLETE', candidate);
    }
    return result(true, 'CARTERA060_HUMAN_REVIEW_READY', candidate);
}

export function prepareCartera060PipelineReview(candidate = {}) {
    const eligibility = evaluateCartera060GrowthCandidate(candidate);
    if (!eligibility.eligible) return eligibility;
    return Object.freeze({
        ...eligibility,
        reviewEnvelope: Object.freeze({
            candidateReference: candidate.candidateReference,
            personReference: candidate.personReference,
            growthClass: candidate.growthClass,
            evidenceReferences: Object.freeze(candidate.evidence.map(item => item.reference)),
            proposedAction: candidate.smallestUsefulAction,
            uncertainty: candidate.uncertainty,
            advisorMustConfirm: candidate.advisorMustConfirm,
            pipelineMutationAuthorized: false,
            opportunityCreated: false,
        }),
    });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    evaluateCartera060GrowthCandidate,
    prepareCartera060PipelineReview,
} from '../platform/relationship-intelligence/cartera-060b-growth-boundary.js';

const base = {
    candidateReference: 'CARTERA060:1',
    personReference: 'PERSON:1',
    growthClass: 'SECOND_POLICY_REVIEW',
    evidence: [{ reference: 'E:1' }],
    smallestUsefulAction: 'Review needs.',
    uncertainty: 'Interest unknown.',
    advisorMustConfirm: 'Confirm interest.',
    opportunityCreated: false,
    contactExecuted: false,
    referralRequested: false,
    lifeContextUsed: false,
    finalNbaPriority: false,
};

test('060B prepares a review envelope but never creates a Pipeline opportunity', () => {
    const result = prepareCartera060PipelineReview(base);
    assert.equal(result.eligible, true);
    assert.equal(result.reviewEnvelope.pipelineMutationAuthorized, false);
    assert.equal(result.reviewEnvelope.opportunityCreated, false);
});

test('060B requires client willingness for referral and blocks life context', () => {
    assert.equal(evaluateCartera060GrowthCandidate({
        ...base, growthClass: 'REFERRAL_RELATIONSHIP', clientWillingnessConfirmed: false,
    }).reason, 'CARTERA060_REFERRAL_WILLINGNESS_REQUIRED');
    assert.equal(evaluateCartera060GrowthCandidate({
        ...base, lifeContextUsed: true,
    }).reason, 'CARTERA060_LIFE_CONTEXT_SALES_TRIGGER_BLOCKED');
});

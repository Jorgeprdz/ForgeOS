import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartera060GrowthReviewProjection } from '../platform/relationship-intelligence/cartera-060a-growth-review-projection.js';

const boundaries = {
    automaticOpportunityCreation: false,
    automaticContactExecution: false,
    finalMessageGeneration: false,
    lifeContextAsSalesTrigger: false,
    referralRequestExecution: false,
    finalNbaPriorityTruth: false,
    advisorConfirmationRequired: true,
};

function item(growthClass, extra = {}) {
    return {
        candidateReference: `CARTERA060:${growthClass}`,
        growthClass,
        personReference: 'PERSON:1',
        displayName: 'Ana',
        whyThisPerson: 'Evidence-backed relationship.',
        whyNow: 'A confirmed review window exists.',
        uncertainty: 'Interest is not known.',
        smallestUsefulAction: 'Prepare a review.',
        advisorMustConfirm: 'Confirm interest.',
        evidence: [{ reference: 'EVIDENCE:1', authority: 'RELATIONSHIP_MEMORY', truthClass: 'CONFIRMED_MEMORY' }],
        clientWillingnessConfirmed: ['REFERRAL_RELATIONSHIP', 'CENTER_OF_INFLUENCE'].includes(growthClass),
        candidateState: 'REVIEW_REQUIRED',
        opportunityCreated: false,
        contactExecuted: false,
        referralRequested: false,
        lifeContextUsed: false,
        finalNbaPriority: false,
        ...extra,
    };
}

test('060A projects four deterministic growth classes without final priority', () => {
    const output = createCartera060GrowthReviewProjection({
        scope: 'PORTFOLIO',
        asOfDate: '2026-08-01',
        items: [
            item('CENTER_OF_INFLUENCE'),
            item('PROTECTION_REVIEW'),
            item('SECOND_POLICY_REVIEW'),
            item('REFERRAL_RELATIONSHIP'),
        ],
        boundaries,
        projectionAuthority: 'CARTERA060_RELATIONSHIP_GROWTH_REVIEW_READ_MODEL',
        readOnly: true,
    });
    assert.deepEqual(output.items.map(value => value.growthClass), [
        'SECOND_POLICY_REVIEW',
        'PROTECTION_REVIEW',
        'REFERRAL_RELATIONSHIP',
        'CENTER_OF_INFLUENCE',
    ]);
    assert.equal(output.summary.total, 4);
    assert.equal(output.items.every(value => value.finalNbaPriority === false), true);
});

test('060A blocks life context, automation and referral candidates without willingness', () => {
    assert.throws(() => createCartera060GrowthReviewProjection({
        scope: 'PORTFOLIO', asOfDate: '2026-08-01',
        items: [item('SECOND_POLICY_REVIEW', { lifeContextUsed: true })],
        boundaries, projectionAuthority: 'X', readOnly: true,
    }), /CARTERA060_AUTOMATION_OR_MANIPULATION_BLOCKED/);
    assert.throws(() => createCartera060GrowthReviewProjection({
        scope: 'PORTFOLIO', asOfDate: '2026-08-01',
        items: [item('REFERRAL_RELATIONSHIP', { clientWillingnessConfirmed: false })],
        boundaries, projectionAuthority: 'X', readOnly: true,
    }), /CARTERA060_REFERRAL_WILLINGNESS_REQUIRED/);
});

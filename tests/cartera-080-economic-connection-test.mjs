import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEconomicEvidenceCandidate,
  proposeEconomicMatch,
  recordEconomicDecision,
  composeConfirmedPaymentCommand,
  projectEconomicConnectionInbox,
} from '../platform/economic-connection/cartera-080-economic-connection.js';

function evidence(overrides = {}) {
  return createEconomicEvidenceCandidate({
    evidenceId: 'ev-080-1',
    sourceType: 'payment_proof',
    receivedAt: '2026-08-01T16:40:00.000Z',
    evidenceHash: 'hash-080-1',
    ingestionMethod: 'manual_upload',
    claimedAmount: 3890.21,
    claimedCurrency: 'MXN',
    claimedPaymentDate: '2026-08-01',
    attachmentReferences: ['attachment-1'],
    ...overrides,
  });
}

test('correo o archivo sólo produce una afirmación, no un hecho económico', () => {
  const candidate = evidence();
  assert.equal(candidate.truthClass, 'claim');
  assert.equal(candidate.status, 'received');
  assert.equal(candidate.claimedAmount, 3890.21);
});

test('ambigüedad o contradicción obliga revisión humana', () => {
  const candidate = evidence();
  const proposal = proposeEconomicMatch({
    evidence: candidate,
    personCandidates: ['person-1', 'person-2'],
    policyCandidates: ['policy-1'],
    obligationCandidates: ['obligation-1'],
    contradictions: ['amount_mismatch'],
  });
  assert.equal(proposal.status, 'review_required');
  assert.equal(proposal.requiresHumanDecision, true);
});

test('no se compone pago confirmado sin decisión humana explícita', () => {
  const candidate = evidence();
  assert.throws(
    () => composeConfirmedPaymentCommand({ evidence: candidate, decision: null }),
    /CARTERA080_HUMAN_CONFIRMATION_REQUIRED/
  );
});

test('confirmación gobernada conserva actor, razón, idempotencia y correlación', () => {
  const candidate = evidence();
  const proposal = proposeEconomicMatch({
    evidence: candidate,
    personCandidates: ['person-1'],
    policyCandidates: ['policy-1'],
    obligationCandidates: ['obligation-1'],
  });
  const decision = recordEconomicDecision({
    evidence: candidate,
    proposal,
    actorId: 'advisor-1',
    decision: 'confirm',
    reason: 'Recibo revisado y póliza verificada',
    selectedMatch: {
      personReference: 'person-1',
      policyReference: 'policy-1',
      obligationReference: 'obligation-1',
    },
    decidedAt: '2026-08-01T16:45:00.000Z',
    idempotencyKey: '080-confirm-1',
    correlationId: '080-correlation-1',
  });
  const command = composeConfirmedPaymentCommand({ evidence: candidate, decision });

  assert.equal(command.humanDecision.actorId, 'advisor-1');
  assert.equal(command.policyReference, 'policy-1');
  assert.equal(command.obligationReference, 'obligation-1');
  assert.equal(command.idempotencyKey, '080-confirm-1');
});

test('la bandeja es proyección y prohíbe cálculo de comisión', () => {
  const candidate = evidence();
  const inbox = projectEconomicConnectionInbox({ evidence: candidate });
  assert.equal(inbox.projectionOnly, true);
  assert.equal(inbox.commissionCalculationAllowed, false);
  assert.equal(inbox.truthOwner, 'none');
});

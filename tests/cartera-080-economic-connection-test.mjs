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
    sourceProvider: 'manual',
    receivedAt: '2026-08-01T16:40:00.000Z',
    evidenceHash: 'hash-080-1',
    ingestionMethod: 'manual_upload',
    claimedAmount: 3890.21,
    claimedCurrency: 'MXN',
    claimedPaymentDate: '2026-08-01',
    claimedPolicyReference: 'policy-1',
    attachmentReferences: ['attachment-1'],
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    limits: ['evidence is not ledger truth'],
    ...overrides,
  });
}

function proposal(candidate = evidence(), overrides = {}) {
  return proposeEconomicMatch({
    evidence: candidate,
    personCandidates: [{ reference: 'person-1', reasons: ['name and policy relationship'] }],
    policyCandidates: [{ reference: 'policy-1', reasons: ['policy reference'] }],
    obligationCandidates: [{ reference: 'obligation-1', reasons: ['amount and period'] }],
    signals: ['policy_reference_match', 'amount_match'],
    confidence: 0.93,
    ...overrides,
  });
}

function decision(candidate = evidence(), match = proposal(candidate), overrides = {}) {
  return recordEconomicDecision({
    evidence: candidate,
    proposal: match,
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
    ...overrides,
  });
}

test('correo o archivo sólo produce una afirmación, no un hecho económico', () => {
  const candidate = evidence();
  assert.equal(candidate.truthClass, 'claim');
  assert.equal(candidate.economicState, 'provisional');
  assert.equal(candidate.status, 'received');
  assert.equal(candidate.claimedAmount, 3890.21);
});

test('la admisión preserva fuente, moneda, periodo, incertidumbre y límites', () => {
  const candidate = evidence({ uncertainty: 'sender not independently verified' });
  assert.equal(candidate.sourceProvider, 'manual');
  assert.equal(candidate.claimedCurrency, 'MXN');
  assert.equal(candidate.periodStart, '2026-08-01');
  assert.equal(candidate.periodEnd, '2026-08-31');
  assert.equal(candidate.uncertainty, 'sender not independently verified');
  assert.deepEqual(candidate.limits, ['evidence is not ledger truth']);
});

test('monto sin moneda, confianza inválida y fechas imposibles se rechazan', () => {
  assert.throws(
    () => evidence({ claimedCurrency: null }),
    /CARTERA080_CURRENCY_REQUIRED_FOR_AMOUNT/
  );
  assert.throws(
    () => evidence({ confidence: 1.2 }),
    /CARTERA080_CONFIDENCE_INVALID/
  );
  assert.throws(
    () => evidence({ claimedPaymentDate: '2026-02-31' }),
    /CARTERA080_PAYMENT_DATE_INVALID/
  );
});

test('ambigüedad, contradicción o dato faltante obliga revisión humana', () => {
  const candidate = evidence({ claimedPaymentDate: null });
  const match = proposal(candidate, {
    personCandidates: ['person-1', 'person-2'],
    contradictions: ['amount_mismatch'],
  });
  assert.equal(match.status, 'review_required');
  assert.equal(match.requiresHumanDecision, true);
  assert.equal(match.automaticConfirmationAllowed, false);
  assert.deepEqual(match.contradictions, ['amount_mismatch']);
  assert.ok(match.missingFields.includes('claimed_payment_date'));
});

test('incluso un match único sigue requiriendo decisión humana', () => {
  const candidate = evidence();
  const match = proposal(candidate);
  assert.equal(match.status, 'matched');
  assert.equal(match.requiresHumanDecision, true);
  assert.equal(match.automaticConfirmationAllowed, false);
});

test('no se puede confirmar una relación que el matcher no propuso', () => {
  const candidate = evidence();
  const match = proposal(candidate);
  assert.throws(
    () => decision(candidate, match, {
      selectedMatch: {
        personReference: 'person-1',
        policyReference: 'policy-other',
        obligationReference: 'obligation-1',
      },
    }),
    /CARTERA080_SELECTED_POLICY_NOT_PROPOSED/
  );
});

test('solicitar información no se registra como rechazo', () => {
  const candidate = evidence();
  const match = proposal(candidate);
  const review = decision(candidate, match, {
    decision: 'request_information',
    selectedMatch: null,
    reason: 'Falta verificar el periodo cubierto',
  });
  assert.equal(review.resultingStatus, 'information_requested');
});

test('confirmación gobernada conserva evidencia, actor, razón e idempotencia', () => {
  const candidate = evidence();
  const match = proposal(candidate);
  const receipt = decision(candidate, match);
  assert.equal(receipt.receiptType, 'economic_human_decision');
  assert.equal(receipt.receiptState, 'recorded');
  assert.equal(receipt.evidenceHash, candidate.evidenceHash);
  assert.equal(receipt.actorId, 'advisor-1');
  assert.equal(receipt.authorizationBasis, 'human_decision_receipt');
  assert.equal(receipt.idempotencyKey, '080-confirm-1');
});

test('el comando canónico sólo se compone con decisión humana y datos económicos completos', () => {
  const candidate = evidence();
  const receipt = decision(candidate, proposal(candidate));
  const command = composeConfirmedPaymentCommand({ evidence: candidate, decision: receipt });

  assert.equal(command.humanDecisionReceipt.actorId, 'advisor-1');
  assert.equal(command.policyReference, 'policy-1');
  assert.equal(command.obligationReference, 'obligation-1');
  assert.equal(command.paymentAmount, 3890.21);
  assert.equal(command.canonicalAuthority, 'policy_payment_reconciliation_030c');
  assert.equal(command.commissionCalculationRequested, false);
  assert.equal('authorization' in command, false);

  const incomplete = evidence({ claimedPaymentDate: null });
  const incompleteReceipt = decision(incomplete, proposal(incomplete));
  assert.throws(
    () => composeConfirmedPaymentCommand({ evidence: incomplete, decision: incompleteReceipt }),
    /CARTERA080_PAYMENT_DATE_REQUIRED/
  );
});

test('una decisión de otra evidencia no puede autorizar el handoff', () => {
  const candidate = evidence();
  const other = evidence({ evidenceId: 'ev-080-2', evidenceHash: 'hash-080-2' });
  const receipt = decision(other, proposal(other));
  assert.throws(
    () => composeConfirmedPaymentCommand({ evidence: candidate, decision: receipt }),
    /CARTERA080_DECISION_EVIDENCE_MISMATCH/
  );
});

test('la bandeja es proyección, explica owner y bloquea ledger, comisión y contacto', () => {
  const candidate = evidence();
  const match = proposal(candidate);
  const inbox = projectEconomicConnectionInbox({ evidence: candidate, proposal: match });
  assert.equal(inbox.projectionOnly, true);
  assert.equal(inbox.ledgerMutationAllowed, false);
  assert.equal(inbox.commissionCalculationAllowed, false);
  assert.equal(inbox.automaticContactAllowed, false);
  assert.equal(inbox.truthOwner, 'none');
  assert.ok(inbox.allowedActions.includes('confirm'));
});

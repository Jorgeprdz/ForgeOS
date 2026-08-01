import {
  generateExpectedPaymentObligationCandidates,
} from '../../policy-operations/calendar/cartera-030b-recurrence-engine.js';
import {
  reconcileConfirmedPaymentEvent,
} from '../../policy-operations/payments/cartera-030b-payment-obligation-reconciliation.js';
import {
  createPolicyCalendarProjection,
} from '../../platform/policy-intelligence/calendar/cartera-030b-policy-calendar-read-model.js';

function requireRepository(repository) {
  const required = [
    'getCurrentPolicyTerms',
    'persistObligationBatch',
    'listExpectedPaymentObligations',
    'persistPaymentReconciliation',
  ];
  for (const method of required) {
    if (!repository || typeof repository[method] !== 'function') {
      throw new TypeError(`CARTERA_030B_REPOSITORY_METHOD_REQUIRED:${method}`);
    }
  }
  return repository;
}

function requireAdvisor(value) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) {
    throw new TypeError('ADVISOR_ID_REQUIRED');
  }
  return normalized;
}

function assertOwnedPolicy(policy, advisorId) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new TypeError('CURRENT_POLICY_TERMS_REQUIRED');
  }
  if (policy.advisorId !== advisorId) {
    throw new TypeError('CROSS_ADVISOR_POLICY_FORBIDDEN');
  }
  if (!policy.policyReference || !policy.policyVersionReference || !policy.policyTermsDigest) {
    throw new TypeError('CURRENT_POLICY_VERSION_BINDING_REQUIRED');
  }
  return policy;
}

export function createCartera030bPaymentObligationService({ repository } = {}) {
  const store = requireRepository(repository);

  return Object.freeze({
    async generateForCurrentPolicy({
      advisorId,
      policyReference,
      generationHorizonDate,
      timezone,
      amountSemantics = 'UNKNOWN',
      scheduleRuleReference = null,
      sourceEvidenceReferences = [],
      idempotencyKey,
    } = {}) {
      const owner = requireAdvisor(advisorId);
      const policy = assertOwnedPolicy(
        await store.getCurrentPolicyTerms({ advisorId: owner, policyReference }),
        owner
      );

      const generation = await generateExpectedPaymentObligationCandidates({
        advisorId: owner,
        policyReference: policy.policyReference,
        policyVersionReference: policy.policyVersionReference,
        policyTermsDigest: policy.policyTermsDigest,
        anchorDate: policy.anchorDate,
        coverageEndDate: policy.coverageEndDate || null,
        generationHorizonDate,
        paymentFrequency: policy.paymentFrequency || 'UNKNOWN',
        premiumAmount: policy.premiumAmount ?? null,
        currency: policy.currency ?? null,
        amountSemantics,
        scheduleRuleReference,
        sourceEvidenceReferences,
        timezone,
      });

      if (generation.generationState === 'BLOCKED') {
        return generation;
      }

      return store.persistObligationBatch({
        advisorId: owner,
        policyReference: policy.policyReference,
        policyVersionReference: policy.policyVersionReference,
        policyTermsDigest: policy.policyTermsDigest,
        idempotencyKey,
        obligations: generation.obligations,
        warnings: generation.warnings,
      });
    },

    async reconcilePaymentEvent({
      advisorId,
      policyReference,
      paymentEvent,
      allocationAuthorization = null,
    } = {}) {
      const owner = requireAdvisor(advisorId);
      const obligations = await store.listExpectedPaymentObligations({
        advisorId: owner,
        policyReference,
      });
      const reconciliation = reconcileConfirmedPaymentEvent({
        obligations,
        paymentEvent,
        allocationAuthorization,
      });
      if (!reconciliation.transition) {
        return reconciliation;
      }
      return store.persistPaymentReconciliation({
        advisorId: owner,
        policyReference,
        reconciliation,
      });
    },

    async loadCalendar({ advisorId, policyReference = null, asOfDate, timezone } = {}) {
      const owner = requireAdvisor(advisorId);
      const obligations = await store.listExpectedPaymentObligations({
        advisorId: owner,
        policyReference,
      });
      return createPolicyCalendarProjection({
        advisorId: owner,
        obligations,
        asOfDate,
        timezone,
      });
    },
  });
}

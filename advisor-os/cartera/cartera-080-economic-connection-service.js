import { composeConfirmedPaymentCommand } from '../../platform/economic-connection/cartera-080-economic-connection.js';

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  throw error;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stable(value[key]);
    return output;
  }, {});
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(stable(value)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function createInMemoryEconomicConnectionReceiptStore() {
  const receipts = new Map();
  return Object.freeze({
    async get(idempotencyKey) {
      return receipts.get(idempotencyKey) || null;
    },
    async put(idempotencyKey, receipt) {
      receipts.set(idempotencyKey, Object.freeze({ ...receipt }));
      return receipts.get(idempotencyKey);
    },
    size() {
      return receipts.size;
    },
  });
}

export function createCartera080EconomicConnectionService({
  paymentReconciliationService,
  receiptStore = createInMemoryEconomicConnectionReceiptStore(),
} = {}) {
  if (!paymentReconciliationService?.reconcileConfirmedPayment) {
    fail('CARTERA080_PAYMENT_RECONCILIATION_SERVICE_REQUIRED');
  }
  if (!receiptStore?.get || !receiptStore?.put) {
    fail('CARTERA080_RECEIPT_STORE_REQUIRED');
  }

  return Object.freeze({
    async handoffConfirmedPayment({ evidence, decision } = {}) {
      const command = composeConfirmedPaymentCommand({ evidence, decision });
      const commandDigest = await sha256(command);
      const existing = await receiptStore.get(command.idempotencyKey);

      if (existing) {
        if (existing.commandDigest !== commandDigest) {
          fail('CARTERA080_IDEMPOTENCY_CONFLICT');
        }
        return Object.freeze({ ...existing, replayed: true });
      }

      let result;
      try {
        result = await paymentReconciliationService.reconcileConfirmedPayment(command);
      } catch (error) {
        fail('CARTERA080_PAYMENT_HANDOFF_FAILED', error);
      }
      if (!result || typeof result !== 'object') fail('CARTERA080_PAYMENT_HANDOFF_RESPONSE_INVALID');

      const receipt = Object.freeze({
        handoffId: `${command.correlationId}:${command.idempotencyKey}`,
        paymentEvidenceReference: command.paymentEvidenceReference,
        policyReference: command.policyReference,
        obligationReference: command.obligationReference,
        humanDecisionId: command.humanDecisionReceipt.decisionId,
        commandDigest,
        idempotencyKey: command.idempotencyKey,
        correlationId: command.correlationId,
        status: 'confirmed_handoff_recorded',
        truthOwner: 'Policy Truth / Cartera 030C',
        compensationState: 'not_interpreted',
        commissionCalculationPerformed: false,
        downstreamResult: Object.freeze({ ...result }),
        replayed: false,
      });

      await receiptStore.put(command.idempotencyKey, receipt);
      return receipt;
    },
  });
}

export const CARTERA_080_STABLE = stable;
export const CARTERA_080_SHA256 = sha256;

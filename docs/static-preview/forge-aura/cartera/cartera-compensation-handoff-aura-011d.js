import { createAuraAuth } from '../aura-auth-v4.js';

const INSTALL_KEY = Symbol.for('forge.aura.cartera.compensation.handoff.011d');
const FUNCTION_NAME = 'advisor-compensation-handoff';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function initialGate() {
  return freeze({
    contract: 'FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_GATE',
    AUTH_STATE: 'NOT_RUN',
    PAYMENT_AUTHORITY_STATE: 'NOT_RUN',
    HANDOFF_STATE: 'NOT_RUN',
    STAGE_030_STATE: 'NOT_RUN',
    STAGE_040_STATE: 'NOT_RUN',
    STAGE_050_STATE: 'NOT_RUN',
    LEDGER_STATE: 'NOT_RUN',
    MATERIALIZATION_STATE: 'NOT_RUN',
    INCOME_READ_STATE: 'NOT_RUN',
    IDEMPOTENCY_STATE: 'NOT_RUN',
    DEMO_FALLBACK_USED: false,
    SYNTHETIC_WRITER_USED: false,
    UNKNOWN_COERCION_USED: false,
  });
}

async function responseFromFunctionError(error) {
  const context = error?.context;
  if (!context || typeof context.clone !== 'function') return null;
  try {
    return await context.clone().json();
  } catch {
    return null;
  }
}

function statusNode(documentRef) {
  return documentRef.querySelector('[data-aura-payment-status]');
}

function paint(documentRef, state, message) {
  documentRef.documentElement.dataset.auraCompensationHandoffState = state;
  const node = statusNode(documentRef);
  if (node) node.innerHTML = message;
}

export function installCarteraCompensationHandoffAura011d({ documentRef = document, getClient } = {}) {
  if (!documentRef || typeof getClient !== 'function') throw new Error('AURA_COMPENSATION_HANDOFF_CLIENT_FACTORY_REQUIRED');
  if (documentRef[INSTALL_KEY]) return documentRef[INSTALL_KEY];

  let lastResult = null;
  let lastGate = initialGate();
  let destroyed = false;
  const inflight = new Map();

  async function invoke(paymentEventReference) {
    const reference = String(paymentEventReference || '').trim();
    if (!reference) {
      lastResult = freeze({ state: 'BLOCKED', reason: 'PAYMENT_EVENT_REFERENCE_MISSING' });
      paint(documentRef, 'BLOCKED', '<strong>Pago confirmado.</strong><br>La compensación requiere información adicional.');
      return lastResult;
    }
    if (inflight.has(reference)) return inflight.get(reference);

    const task = (async () => {
      paint(documentRef, 'IN_PROGRESS', '<strong>Pago confirmado.</strong><br>Actualizando compensación…');
      try {
        const client = await getClient();
        const auth = await client.auth.getUser();
        if (auth?.error || !auth?.data?.user?.id) throw Object.assign(new Error('AUTH_REQUIRED'), { code: 'AUTH_REQUIRED' });

        const invocation = await client.functions.invoke(FUNCTION_NAME, {
          body: { paymentEventReference: reference },
        });
        let data = invocation?.data || null;
        if (invocation?.error) data = await responseFromFunctionError(invocation.error) || data;
        if (!data || typeof data !== 'object') {
          throw Object.assign(new Error('COMPENSATION_HANDOFF_RESPONSE_INVALID'), { code: 'COMPENSATION_HANDOFF_RESPONSE_INVALID' });
        }

        lastResult = freeze({ ...data, amount: null });
        lastGate = freeze({ ...initialGate(), ...(data.gate || {}) });
        if (['COMPLETED', 'REPLAYED'].includes(String(data.state || '').toUpperCase())) {
          paint(documentRef, String(data.state).toUpperCase(), '<strong>Pago confirmado.</strong><br>Compensación actualizada.');
        } else if (String(data.state || '').toUpperCase() === 'BLOCKED') {
          paint(documentRef, 'BLOCKED', '<strong>Pago confirmado.</strong><br>La compensación requiere información adicional.');
        } else {
          paint(documentRef, 'FAILED', '<strong>Pago confirmado.</strong><br>No fue posible actualizar la compensación en este momento.');
        }
        globalThis.dispatchEvent(new CustomEvent('forge:aura-compensation-handoff', {
          detail: freeze({
            paymentEventReference: reference,
            state: data.state || 'FAILED',
            reason: data.reason || null,
            gate: lastGate,
            amount: null,
          }),
        }));
        return lastResult;
      } catch (error) {
        lastResult = freeze({ state: 'FAILED', reason: error?.code || error?.message || 'COMPENSATION_HANDOFF_FAILED', amount: null });
        lastGate = freeze({ ...initialGate(), AUTH_STATE: error?.code === 'AUTH_REQUIRED' ? 'FAIL' : 'OK', HANDOFF_STATE: 'FAILED' });
        paint(documentRef, 'FAILED', '<strong>Pago confirmado.</strong><br>No fue posible actualizar la compensación en este momento.');
        return lastResult;
      } finally {
        inflight.delete(reference);
      }
    })();
    inflight.set(reference, task);
    return task;
  }

  function onPaymentConfirmed(event) {
    if (destroyed) return;
    const detail = event?.detail || {};
    if (!detail.readAfterWriteVerified) return;
    void invoke(detail.paymentEventReference);
  }

  globalThis.addEventListener('forge:aura-payment-confirmed', onPaymentConfirmed);
  documentRef.documentElement.dataset.auraCompensationHandoff = '011d';

  const runtime = freeze({
    invoke,
    diagnostics() {
      return freeze({
        ...lastGate,
        runtimeId: 'FORGE_AURA_CARTERA_COMPENSATION_HANDOFF_011D',
        handoffUiState: documentRef.documentElement.dataset.auraCompensationHandoffState || null,
        lastState: lastResult?.state || null,
        lastReason: lastResult?.reason || null,
        directCommissionAmountRendered: false,
        browserLedgerWrite: false,
        serviceRoleInBrowser: false,
        demoFallbackUsed: false,
        syntheticWriterUsed: false,
        unknownCoercionUsed: false,
      });
    },
    destroy() {
      destroyed = true;
      globalThis.removeEventListener('forge:aura-payment-confirmed', onPaymentConfirmed);
      delete documentRef.documentElement.dataset.auraCompensationHandoff;
      delete documentRef.documentElement.dataset.auraCompensationHandoffState;
      delete globalThis.ForgeAdvisorCompensationProductiveGate011D;
      delete documentRef[INSTALL_KEY];
    },
  });
  documentRef[INSTALL_KEY] = runtime;
  globalThis.ForgeAdvisorCompensationProductiveGate011D = runtime;
  return runtime;
}

if (!globalThis.ForgeAdvisorCompensationProductiveGate011D) {
  const auth = createAuraAuth();
  installCarteraCompensationHandoffAura011d({ getClient: () => auth.getClient() });
}

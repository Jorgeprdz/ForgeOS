const INSTALL_KEY = Symbol.for('forge.aura.cartera.payment.011c');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SOURCES = new Set(['policy_receipt', 'payment_proof', 'bank_proof', 'carrier_statement', 'manual_capture', 'integration']);

function text(value) {
  return String(value ?? '').trim();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
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
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function currentDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function money(value, currency = 'MXN') {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'No disponible';
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency || 'MXN' }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || ''}`.trim();
  }
}

export function createAuraCarteraPaymentConsumer({ client } = {}) {
  if (!client?.auth?.getUser || !client?.rpc) throw new Error('AURA_CARTERA_PAYMENT_CLIENT_REQUIRED');

  async function authenticatedUser() {
    const result = await client.auth.getUser();
    if (result?.error || !result?.data?.user?.id) throw Object.assign(new Error('CARTERA_PAYMENT_AUTH_REQUIRED'), { code: 'CARTERA_PAYMENT_AUTH_REQUIRED' });
    return result.data.user;
  }

  async function loadCalendar(policyReference) {
    await authenticatedUser();
    const result = await client.rpc('forge_cartera030d_list_policy_payment_calendar', {
      p_payload: {
        policyReference: text(policyReference),
        asOfDate: currentDate(),
        timezone: 'America/Mexico_City',
      },
    });
    if (result?.error) throw Object.assign(new Error('CARTERA030D_CALENDAR_READ_FAILED'), { code: result.error.code || 'CARTERA030D_CALENDAR_READ_FAILED', cause: result.error });
    const data = result?.data;
    if (!data || !Array.isArray(data.items)) throw Object.assign(new Error('CARTERA030D_RESPONSE_INVALID'), { code: 'CARTERA030D_RESPONSE_INVALID' });
    return Object.freeze({ ...data, items: Object.freeze(data.items.map(item => Object.freeze({ ...item }))) });
  }

  async function confirmPayment(input = {}) {
    await authenticatedUser();
    const policyReference = text(input.policyReference);
    const paymentEvidenceReference = text(input.paymentEvidenceReference);
    const paymentAmount = Number(input.paymentAmount);
    const currency = text(input.currency).toUpperCase() || null;
    const paymentDate = text(input.paymentDate);
    const paymentSource = text(input.paymentSource);
    const obligationReference = text(input.obligationReference);
    if (!policyReference || !paymentEvidenceReference || !obligationReference) throw Object.assign(new Error('CARTERA030C_REQUIRED_REFERENCE_MISSING'), { code: 'CARTERA030C_REQUIRED_REFERENCE_MISSING' });
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) throw Object.assign(new Error('CARTERA030C_PAYMENT_AMOUNT_INVALID'), { code: 'CARTERA030C_PAYMENT_AMOUNT_INVALID' });
    if (!DATE_PATTERN.test(paymentDate)) throw Object.assign(new Error('CARTERA030C_PAYMENT_DATE_INVALID'), { code: 'CARTERA030C_PAYMENT_DATE_INVALID' });
    if (currency && !/^[A-Z]{3}$/.test(currency)) throw Object.assign(new Error('CARTERA030C_CURRENCY_INVALID'), { code: 'CARTERA030C_CURRENCY_INVALID' });
    if (!SOURCES.has(paymentSource)) throw Object.assign(new Error('CARTERA030C_PAYMENT_SOURCE_INVALID'), { code: 'CARTERA030C_PAYMENT_SOURCE_INVALID' });
    if (input.humanConfirmation !== true) throw Object.assign(new Error('CARTERA030C_HUMAN_CONFIRMATION_REQUIRED'), { code: 'CARTERA030C_HUMAN_CONFIRMATION_REQUIRED' });

    const command = Object.freeze({
      policyReference,
      paymentEvidenceReference,
      paymentAmount,
      currency,
      paymentDate,
      periodCoveredStart: null,
      periodCoveredEnd: null,
      paymentSource,
      evidenceReferences: Object.freeze([paymentEvidenceReference, `OBLIGATION:${obligationReference}`]),
      confirmationState: 'CONFIRMED',
      idempotencyKey: text(input.idempotencyKey) || `AURA011C:${obligationReference}:${paymentEvidenceReference}`,
    });
    const payloadDigest = await sha256(command);
    const result = await client.rpc('forge_cartera030c_record_and_reconcile_confirmed_payment', {
      p_payload: {
        ...command,
        authorization: { authorized: true, payloadDigest },
      },
    });
    if (result?.error) throw Object.assign(new Error('CARTERA030C_RECONCILIATION_FAILED'), { code: result.error.code || 'CARTERA030C_RECONCILIATION_FAILED', cause: result.error });
    if (!result?.data || typeof result.data !== 'object') throw Object.assign(new Error('CARTERA030C_RECONCILIATION_RESPONSE_INVALID'), { code: 'CARTERA030C_RECONCILIATION_RESPONSE_INVALID' });

    const calendar = await loadCalendar(policyReference);
    const confirmedObligation = calendar.items.find(item => item.obligationReference === (result.data.obligationReference || obligationReference));
    const complete = result.data.reconciliationState === 'COMPLETE';
    const readAfterWriteVerified = complete
      ? Boolean(confirmedObligation && ['CONFIRMED', 'PARTIAL'].includes(String(confirmedObligation.ledgerStatus || confirmedObligation.status).toUpperCase()))
      : true;
    if (!readAfterWriteVerified) throw Object.assign(new Error('CARTERA030C_READ_AFTER_WRITE_FAILED'), { code: 'CARTERA030C_READ_AFTER_WRITE_FAILED' });

    return Object.freeze({
      response: Object.freeze({ ...result.data }),
      calendar,
      readAfterWriteVerified,
      compensationHandoffState: 'NOT_CONNECTED_TO_PRODUCTIVE_SERVER_AUTHORITY',
    });
  }

  return Object.freeze({ loadCalendar, confirmPayment, adapterRole: 'CONSUMER_ONLY', createsPaymentTruth: false });
}

function pendingItems(calendar) {
  return (calendar?.items || []).filter(item => !['CONFIRMED', 'CORRECTED', 'CANCELLED'].includes(String(item.ledgerStatus || item.status || '').toUpperCase()));
}

export function installCarteraPaymentAura({ documentRef = document, getClient } = {}) {
  if (!documentRef || typeof getClient !== 'function') throw new Error('AURA_CARTERA_PAYMENT_CLIENT_FACTORY_REQUIRED');
  if (documentRef[INSTALL_KEY]) return documentRef[INSTALL_KEY];

  let currentPolicyReference = null;
  let activeLayer = null;
  let destroyed = false;

  function close() {
    activeLayer?.remove();
    activeLayer = null;
    delete documentRef.documentElement.dataset.auraPaymentOpen;
  }

  function synchronize() {
    if (destroyed || !currentPolicyReference) return;
    const workspace = documentRef.querySelector('[data-aura-app] .cartera-workspace');
    if (!workspace || workspace.querySelector('[data-aura-payment-entry="011c"]')) return;
    const section = documentRef.createElement('section');
    section.className = 'cartera-section aura-payment-entry';
    section.dataset.auraPaymentEntry = '011c';
    section.innerHTML = `
      <div><p class="cartera-eyebrow">EVIDENCIA ECONÓMICA</p><h2>Pagos de prima</h2><p>Consulta obligaciones y confirma un pago únicamente con decisión humana. Prima emitida ≠ prima pagada.</p></div>
      <button type="button" class="aura-secondary-action" data-aura-payment-open="${escapeHtml(currentPolicyReference)}">Revisar / confirmar pago de prima</button>`;
    workspace.append(section);
  }

  async function open(trigger, policyReference) {
    close();
    const client = await getClient();
    const consumer = createAuraCarteraPaymentConsumer({ client });
    const layer = documentRef.createElement('div');
    layer.className = 'aura-dialog-layer aura-payment-layer';
    layer.dataset.auraPaymentLayer = 'true';
    layer.innerHTML = `
      <button class="aura-scrim" type="button" data-aura-payment-close aria-label="Cerrar pagos"></button>
      <section class="aura-dialog aura-payment-dialog" role="dialog" aria-modal="true" aria-labelledby="aura-payment-title" tabindex="-1">
        <header><div><p class="aura-eyebrow">CARTERA · POLICY TRUTH</p><h2 id="aura-payment-title">Confirmar pago de prima</h2></div><button type="button" data-aura-payment-close aria-label="Cerrar">×</button></header>
        <div class="aura-dialog__body" data-aura-payment-body aria-busy="true"><p>Consultando calendario de pagos…</p></div>
      </section>`;
    documentRef.body.append(layer);
    activeLayer = layer;
    documentRef.documentElement.dataset.auraPaymentOpen = 'true';
    layer.querySelectorAll('[data-aura-payment-close]').forEach(node => node.addEventListener('click', () => { close(); trigger?.focus?.({ preventScroll: true }); }));
    layer.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); trigger?.focus?.({ preventScroll: true }); } });
    layer.querySelector('.aura-dialog')?.focus();

    const body = layer.querySelector('[data-aura-payment-body]');
    try {
      const calendar = await consumer.loadCalendar(policyReference);
      if (activeLayer !== layer) return;
      const pending = pendingItems(calendar);
      body.setAttribute('aria-busy', 'false');
      if (!pending.length) {
        body.innerHTML = `
          <section class="aura-payment-summary"><strong>No hay una obligación pendiente compatible para confirmar.</strong><p>Forge no creará un PaymentEvent sin una obligación que puedas revisar.</p></section>
          <div class="aura-payment-calendar">${(calendar.items || []).slice(0, 8).map(item => `<div><span>${escapeHtml(item.expectedDate || 'Sin fecha')}</span><strong>${escapeHtml(item.status || item.ledgerStatus || 'UNKNOWN')}</strong><span>${escapeHtml(money(item.expectedAmount, item.currency))}</span></div>`).join('') || '<p>Sin obligaciones visibles.</p>'}</div>`;
        documentRef.documentElement.dataset.auraPaymentState = 'NO_PENDING_OBLIGATION';
        return;
      }
      const first = pending[0];
      body.innerHTML = `
        <section class="aura-payment-summary"><strong>Pago de prima, no pago de comisión</strong><p>Esta confirmación alimenta Policy/Economic Evidence. No afirma que el asesor ya recibió una comisión o depósito.</p></section>
        <form data-aura-payment-form>
          <label>Obligación
            <select name="obligationReference" required>${pending.map((item, index) => `<option value="${escapeHtml(item.obligationReference)}" ${index === 0 ? 'selected' : ''}>${escapeHtml(item.expectedDate || 'Sin fecha')} · ${escapeHtml(money(item.expectedAmount, item.currency))} · ${escapeHtml(item.status || item.ledgerStatus || 'PENDIENTE')}</option>`).join('')}</select>
          </label>
          <div class="aura-payment-grid">
            <label>Importe pagado<input name="paymentAmount" type="number" min="0.01" step="0.01" required value="${escapeHtml(first.expectedAmount ?? '')}"></label>
            <label>Moneda<input name="currency" maxlength="3" value="${escapeHtml(first.currency || 'MXN')}"></label>
            <label>Fecha de pago<input name="paymentDate" type="date" required value="${escapeHtml(first.expectedDate || currentDate())}"></label>
            <label>Fuente<select name="paymentSource"><option value="manual_capture">Confirmación manual</option><option value="policy_receipt">Recibo de póliza</option><option value="payment_proof">Comprobante de pago</option><option value="bank_proof">Comprobante bancario</option><option value="carrier_statement">Estado de aseguradora</option></select></label>
          </div>
          <label>Referencia de evidencia / captura<input name="paymentEvidenceReference" required maxlength="200" placeholder="Ej. recibo-123 o confirmación-2026-08"></label>
          <label class="aura-payment-confirm"><input name="humanConfirmation" type="checkbox" required> Confirmo que revisé la evidencia/contexto y que esta prima fue pagada por el importe y fecha indicados.</label>
          <p class="aura-journal-error" data-aura-payment-error role="alert" hidden></p>
          <p data-aura-payment-status role="status" aria-live="polite"></p>
          <button type="submit" class="aura-primary-action">Confirmar pago de prima</button>
        </form>`;

      const form = body.querySelector('[data-aura-payment-form]');
      const obligationSelect = form.elements.namedItem('obligationReference');
      function applyObligation(reference) {
        const item = pending.find(candidate => candidate.obligationReference === reference);
        if (!item) return;
        form.elements.namedItem('paymentAmount').value = item.expectedAmount ?? '';
        form.elements.namedItem('currency').value = item.currency || 'MXN';
        form.elements.namedItem('paymentDate').value = item.expectedDate || currentDate();
      }
      obligationSelect.addEventListener('change', () => applyObligation(obligationSelect.value));

      form.addEventListener('submit', async event => {
        event.preventDefault();
        const submit = event.submitter;
        const errorNode = form.querySelector('[data-aura-payment-error]');
        const status = form.querySelector('[data-aura-payment-status]');
        const data = new FormData(form);
        if (!form.elements.namedItem('humanConfirmation').checked) return;
        submit.disabled = true;
        errorNode.hidden = true;
        status.textContent = 'Registrando y verificando…';
        try {
          const result = await consumer.confirmPayment({
            policyReference,
            obligationReference: data.get('obligationReference'),
            paymentAmount: data.get('paymentAmount'),
            currency: data.get('currency'),
            paymentDate: data.get('paymentDate'),
            paymentSource: data.get('paymentSource'),
            paymentEvidenceReference: data.get('paymentEvidenceReference'),
            humanConfirmation: true,
          });
          const response = result.response;
          const complete = response.reconciliationState === 'COMPLETE';
          documentRef.documentElement.dataset.auraPaymentState = complete ? 'CONFIRMED' : 'REVIEW_REQUIRED';
          status.innerHTML = complete
            ? `<strong>Pago registrado y releído correctamente.</strong><br>${escapeHtml(response.outcome || 'COMPLETE')}. Advisor Compensation todavía no tiene un handoff productivo server-side conectado; Forge no inventó comisión.`
            : `<strong>El PaymentEvent quedó registrado, pero requiere revisión.</strong><br>${escapeHtml(response.reason || response.outcome || 'REVIEW_REQUIRED')}. No se promovió a comisión.`;
          globalThis.dispatchEvent(new CustomEvent('forge:aura-payment-confirmed', { detail: {
            policyReference,
            obligationReference: response.obligationReference || data.get('obligationReference'),
            paymentEventReference: response.paymentEventReference || null,
            reconciliationState: response.reconciliationState,
            readAfterWriteVerified: result.readAfterWriteVerified,
            compensationHandoffState: result.compensationHandoffState,
          } }));
        } catch (error) {
          errorNode.hidden = false;
          errorNode.textContent = text(error?.code || error?.message || 'CARTERA_PAYMENT_CONFIRMATION_FAILED');
          status.textContent = '';
          documentRef.documentElement.dataset.auraPaymentState = 'ERROR';
        } finally {
          submit.disabled = false;
        }
      });
      documentRef.documentElement.dataset.auraPaymentState = 'READY';
    } catch (error) {
      if (activeLayer !== layer) return;
      body.setAttribute('aria-busy', 'false');
      body.innerHTML = `<section class="aura-inline-empty"><h3>No pudimos leer los pagos de esta póliza</h3><p>${escapeHtml(error?.code || error?.message || 'CARTERA_PAYMENT_SOURCE_UNAVAILABLE')}</p><p>Forge no convirtió la fuente desconocida en “pagada”.</p></section>`;
      documentRef.documentElement.dataset.auraPaymentState = 'ERROR';
    }
  }

  const onCapture = event => {
    const back = event.target.closest?.('[data-back]');
    if (back) { currentPolicyReference = null; return; }
    const policy = event.target.closest?.('[data-directory-reference][data-directory-kind="POLICY"]');
    if (policy) {
      currentPolicyReference = text(policy.dataset.directoryReference);
      queueMicrotask(synchronize);
      return;
    }
    const legacy = event.target.closest?.('[data-open-policy]');
    const reference = text(legacy?.dataset.openPolicy);
    if (reference && !reference.startsWith('POLICY_PACKET:AURA:')) {
      currentPolicyReference = reference;
      queueMicrotask(synchronize);
    }
  };

  const onClick = event => {
    const trigger = event.target.closest?.('[data-aura-payment-open]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void open(trigger, text(trigger.dataset.auraPaymentOpen));
  };

  documentRef.addEventListener('click', onCapture, true);
  documentRef.addEventListener('click', onClick, true);
  const Observer = documentRef.defaultView?.MutationObserver || globalThis.MutationObserver;
  const observer = Observer ? new Observer(synchronize) : null;
  observer?.observe(documentRef.documentElement, { childList: true, subtree: true });

  const api = Object.freeze({
    synchronize,
    destroy() {
      destroyed = true;
      close();
      observer?.disconnect();
      documentRef.removeEventListener('click', onCapture, true);
      documentRef.removeEventListener('click', onClick, true);
      delete documentRef[INSTALL_KEY];
    },
  });
  documentRef[INSTALL_KEY] = api;
  return api;
}

export const AURA_CARTERA_PAYMENT_011C = Object.freeze({ stable, sha256, sources: Object.freeze([...SOURCES]) });

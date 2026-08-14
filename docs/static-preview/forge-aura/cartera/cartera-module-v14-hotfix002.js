import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v13-017e.js?v=post017e-hotfix001';
import { createCarteraReviewConfirmation002 } from './cartera-review-confirmation-002.js?v=post017e-hotfix002';

const STYLE_ID = 'cartera-review-hotfix002-style';

function e(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  })[char]);
}
function text(value) { return String(value ?? '').trim(); }
function printable(value) {
  if (value === true) return 'Sí';
  if (value === false) return 'No';
  if (value === null || value === undefined || value === '') return 'No identificado';
  if (typeof value === 'object') return 'Dato estructurado';
  return String(value);
}
function fieldLabel(name) {
  return ({
    holderName:'Titular', contractorName:'Contratante', insuredName:'Asegurado', policyNumber:'Número de póliza',
    productName:'Producto', product:'Producto', policyType:'Tipo', status:'Estado', issueDate:'Fecha de emisión',
    effectiveFrom:'Inicio de vigencia', effectiveDate:'Inicio de vigencia', effectiveTo:'Fin de vigencia', expirationDate:'Fin de vigencia',
    currency:'Moneda', paymentFrequency:'Forma de pago', premiumAmount:'Prima', basicPremiumTotal:'Prima básica total',
    plannedPremium:'Prima planeada', annualTotal:'Total anual', sumInsured:'Suma asegurada',
  })[name] || name;
}
function valueForInput(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function installStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    [data-review-confirmation-002] .cartera-dialog{width:min(920px,calc(100vw - 32px));max-height:min(860px,calc(100vh - 28px));display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;border:1px solid var(--forge-border-subtle,#e1e4ec);border-radius:var(--forge-radius-card,18px);background:var(--forge-surface,#fff);box-shadow:var(--forge-shadow-modal,0 24px 70px rgba(24,32,51,.18));}
    [data-review-confirmation-002] .cartera-dialog__body{overflow:auto;padding:18px 20px 22px;}
    [data-review-confirmation-002] .review002-footer{display:flex;justify-content:flex-end;gap:10px;align-items:center;padding:14px 20px;border-top:1px solid var(--forge-border-subtle,#e1e4ec);background:var(--forge-surface,#fff);position:relative;z-index:2;}
    [data-review-confirmation-002] button{font:inherit;min-height:42px;border-radius:var(--forge-radius-input,12px);padding:9px 14px;cursor:pointer;}
    [data-review-confirmation-002] .review002-primary{border:1px solid var(--forge-brand,#6657c8);background:var(--forge-brand,#6657c8);color:#fff;font-weight:850;}
    [data-review-confirmation-002] .review002-secondary{border:1px solid var(--forge-border-default,#d6dae5);background:var(--forge-surface,#fff);color:var(--forge-text-primary,#172033);font-weight:750;}
    [data-review-confirmation-002] .review002-quiet{border:0;background:transparent;color:var(--forge-text-secondary,#667085);}
    [data-review-confirmation-002] button:disabled{opacity:.55;cursor:default;}
    [data-review-confirmation-002] .review002-stack{display:grid;gap:14px;}
    [data-review-confirmation-002] .review002-hero{display:grid;gap:5px;padding:15px;border:1px solid var(--forge-border-subtle,#e1e4ec);border-radius:var(--forge-radius-card,18px);background:var(--forge-surface-subtle,#f7f8fb);}
    [data-review-confirmation-002] .review002-eyebrow{font-size:11px;font-weight:850;letter-spacing:.06em;color:var(--forge-text-secondary,#667085);text-transform:uppercase;margin:0;}
    [data-review-confirmation-002] .review002-hero h3{margin:0;font-size:19px;color:var(--forge-text-primary,#172033);}
    [data-review-confirmation-002] .review002-section{display:grid;gap:10px;padding:14px 0;border-bottom:1px solid var(--forge-border-subtle,#e1e4ec);}
    [data-review-confirmation-002] .review002-section h4{margin:0;font-size:14px;color:var(--forge-text-primary,#172033);}
    [data-review-confirmation-002] .review002-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 14px;margin:0;}
    [data-review-confirmation-002] .review002-fact{min-width:0;padding:9px 0;}
    [data-review-confirmation-002] .review002-fact dt{font-size:10px;color:var(--forge-text-secondary,#667085);font-weight:800;text-transform:uppercase;}
    [data-review-confirmation-002] .review002-fact dd{margin:3px 0 0;color:var(--forge-text-primary,#172033);font-size:13px;font-weight:700;overflow-wrap:anywhere;}
    [data-review-confirmation-002] .review002-control{display:grid;gap:6px;}
    [data-review-confirmation-002] .review002-control label{font-size:11px;font-weight:800;color:var(--forge-text-secondary,#667085);}
    [data-review-confirmation-002] select,[data-review-confirmation-002] input{width:100%;min-height:42px;border:1px solid var(--forge-border-default,#d6dae5);border-radius:var(--forge-radius-input,12px);background:var(--forge-surface,#fff);color:var(--forge-text-primary,#172033);padding:8px 10px;font:inherit;box-sizing:border-box;}
    [data-review-confirmation-002] .review002-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
    [data-review-confirmation-002] .review002-note{padding:11px 12px;border-radius:var(--forge-radius-input,12px);background:var(--forge-brand-soft,#eef0ff);color:var(--forge-text-primary,#172033);font-size:12px;line-height:1.45;}
    [data-review-confirmation-002] .review002-error{padding:12px;border:1px solid var(--forge-danger,#c2414b);border-radius:var(--forge-radius-input,12px);color:var(--forge-danger,#a72f3a);background:var(--forge-surface,#fff);}
    [data-review-confirmation-002] .review002-success{padding:18px;border-radius:var(--forge-radius-card,18px);background:var(--forge-success-soft,#edf8f1);display:grid;gap:7px;}
    @media(max-width:640px){
      [data-review-confirmation-002] .cartera-dialog{width:100vw;max-height:100dvh;height:100dvh;border-radius:0;}
      [data-review-confirmation-002] .cartera-dialog__body{padding:14px 14px 20px;}
      [data-review-confirmation-002] .review002-facts,[data-review-confirmation-002] .review002-grid{grid-template-columns:1fr;}
      [data-review-confirmation-002] .review002-footer{display:grid;grid-template-columns:1fr;padding:12px 14px calc(12px + env(safe-area-inset-bottom));}
      [data-review-confirmation-002] .review002-primary{grid-row:1;}
      [data-review-confirmation-002] .review002-secondary{grid-row:2;}
      [data-review-confirmation-002] .review002-quiet{grid-row:3;}
    }
  `;
  doc.head.append(style);
}

function identityControls(model) {
  if (!(model.identityCandidates || []).length) return '';
  return `<section class="review002-section" data-review-identity><h4>Identidad</h4><p>Confirma a qué persona corresponde el documento. Forge no crea ni fusiona identidades automáticamente.</p><div class="review002-grid">
    ${(model.identityCandidates || []).map((candidate, index) => {
      const matches = candidate.existingPersonMatches || [];
      const selected = matches.length === 1 ? `existing:${matches[0].personReference}` : '';
      return `<div class="review002-control" data-identity-candidate="${e(candidate.candidateReference)}">
        <label>Persona ${index + 1}</label>
        <select data-identity-selection>
          <option value="" ${selected ? '' : 'selected'}>Selecciona una resolución…</option>
          ${matches.map(match => `<option value="existing:${e(match.personReference)}" ${selected === `existing:${match.personReference}` ? 'selected' : ''}>Usar ${e(match.displayLabel || match.personReference)}</option>`).join('')}
          <option value="create">Crear nueva persona explícitamente</option>
        </select>
        <input data-new-person-name value="${e(candidate.proposedLabel || '')}" placeholder="Nombre revisado" hidden>
      </div>`;
    }).join('')}
  </div></section>`;
}

function accountControls(model) {
  if (!(model.accountCandidates || []).length) return '';
  return `<section class="review002-section"><h4>Cuenta / hogar</h4><div class="review002-grid">
    ${(model.accountCandidates || []).map(candidate => `<div class="review002-control" data-account-candidate="${e(candidate.candidateReference)}">
      <label>${e(candidate.proposedLabel || 'Cuenta')}</label>
      <select data-account-selection>
        <option value="">${candidate.required ? 'Selecciona una cuenta…' : 'No aplica'}</option>
        ${(candidate.existingAccountMatches || []).map(match => `<option value="${e(match.accountReference)}">${e(match.displayLabel || match.accountReference)}</option>`).join('')}
      </select>
    </div>`).join('')}
  </div></section>`;
}

function policyControl(model) {
  const matches = new Map();
  for (const candidate of model.duplicatePolicyCandidates || []) {
    for (const match of candidate.existingPolicyMatches || []) if (match.policyReference) matches.set(match.policyReference, match);
  }
  const options = [...matches.values()];
  if (!options.length) return '<div class="review002-note">No hay una póliza canónica reconciliada con este número. La confirmación explícita puede crear la versión canónica inicial.</div>';
  return `<div class="review002-control"><label>Póliza reconciliada</label><select data-policy-selection>
    ${options.length > 1 ? '<option value="">Selecciona la póliza exacta…</option>' : ''}
    ${options.map((match, index) => `<option value="${e(match.policyReference)}" ${options.length === 1 && index === 0 ? 'selected' : ''}>Actualizar ${e(match.policyReference)}</option>`).join('')}
  </select><small>Actualizar usa la versión siguiente y conserva lineage/supersession; no sobrescribe historia.</small></div>`;
}

function facts(model, correcting) {
  const fields = (model.fields || []).filter(field => field.restricted !== true);
  if (!correcting) {
    return `<dl class="review002-facts">${fields.map(field => `<div class="review002-fact"><dt>${e(fieldLabel(field.fieldName))}</dt><dd>${e(printable(field.value))}</dd></div>`).join('')}</dl>`;
  }
  return `<div class="review002-grid">${fields.map(field => {
    const unknown = String(field.candidateState || '').toUpperCase() === 'UNKNOWN';
    return `<div class="review002-control" data-field-decision="${e(field.fieldName)}">
      <label>${e(fieldLabel(field.fieldName))}</label>
      <select data-field-mode>
        <option value="ACCEPT" ${unknown ? '' : 'selected'}>Confirmar valor extraído</option>
        <option value="EDIT">Corregir</option>
        <option value="UNKNOWN" ${unknown ? 'selected' : ''}>No identificado</option>
      </select>
      <input data-field-value value="${e(valueForInput(field.value))}" ${unknown ? 'hidden' : 'hidden'} aria-label="Valor corregido de ${e(fieldLabel(field.fieldName))}">
    </div>`;
  }).join('')}</div>`;
}

function reviewBody(model, { correcting = false, state = 'READY', errorCode = null } = {}) {
  if (state === 'LOADING') return '<div class="review002-stack"><p role="status">Preparando revisión gobernada…</p></div>';
  if (state === 'SUCCESS') return '';
  const blocked = model.state === 'BLOCKED' || (model.blockers || []).length > 0;
  return `<div class="review002-stack" data-review-ready>
    <section class="review002-hero">
      <p class="review002-eyebrow">DOCUMENTO PENDIENTE · REVISIÓN HUMANA</p>
      <h3>${e(model.source?.originalFilename || 'Documento de póliza')}</h3>
      <p>La extracción es evidencia. Nada se confirma hasta que ejecutes una acción explícita y exista receipt real.</p>
    </section>
    ${blocked ? `<div class="review002-error" role="alert"><strong>Esta revisión está bloqueada.</strong><br>${e((model.blockers || []).join(' · ') || 'CARTERA020C_REVIEW_BLOCKED')}</div>` : ''}
    ${errorCode ? `<div class="review002-error" role="alert"><strong>No se confirmó información.</strong><br>${e(errorCode)}</div>` : ''}
    <section class="review002-section"><h4>${correcting ? 'Corrige únicamente lo respaldado por el documento' : 'Información extraída'}</h4>${facts(model, correcting)}</section>
    ${identityControls(model)}
    ${accountControls(model)}
    <section class="review002-section"><h4>Destino canónico</h4>${policyControl(model)}</section>
    <div class="review002-note"><strong>Autoridad:</strong> Cartera 020C prepara y verifica la decisión; Cartera 010B es el único writer canónico. UNKNOWN permanece UNKNOWN y confidence no confirma nada.</div>
  </div>`;
}

function successBody(result) {
  return `<div class="review002-success" role="status" data-review-success>
    <strong>Información confirmada</strong>
    <span>La confirmación recibió un resultado canónico verificado.</span>
    <small>Póliza: ${e(result.policyReference)} · Versión: ${e(result.policyVersionReference || 'confirmada')}${result.replayed ? ' · replay idempotente' : ''}</small>
  </div>`;
}

export function createCarteraModule(options = {}) {
  const root = options.root;
  const doc = root?.ownerDocument || document;
  const base = createBaseCarteraModule(options);
  const reviewApi = createCarteraReviewConfirmation002({ client: options.client });
  let layer = null;
  let model = null;
  let packetReference = null;
  let correcting = false;
  let state = 'IDLE';
  let errorCode = null;
  let saving = false;
  let reviewedAt = null;

  function close() {
    layer?.remove();
    layer = null; model = null; packetReference = null; correcting = false; state = 'IDLE'; errorCode = null; saving = false; reviewedAt = null;
  }

  function footerHtml() {
    if (state === 'SUCCESS') return '<button type="button" class="review002-primary" data-review-close>Listo</button>';
    const blocked = !model || model.state === 'BLOCKED' || (model.blockers || []).length > 0;
    return `<button type="button" class="review002-quiet" data-review-close>Cancelar</button>
      <button type="button" class="review002-secondary" data-review-correct ${saving || blocked ? 'disabled' : ''}>${correcting ? 'Ver resumen' : 'Corregir'}</button>
      <button type="button" class="review002-primary" data-review-confirm ${saving || blocked ? 'disabled' : ''}>${saving ? 'Guardando…' : 'Confirmar información'}</button>`;
  }

  function render(result = null) {
    if (!layer) return;
    const body = layer.querySelector('.cartera-dialog__body');
    const footer = layer.querySelector('.review002-footer');
    if (body) body.innerHTML = state === 'SUCCESS' ? successBody(result) : reviewBody(model, { correcting, state, errorCode });
    if (footer) footer.innerHTML = footerHtml();
    bindDynamicControls();
  }

  function bindDynamicControls() {
    if (!layer) return;
    layer.querySelectorAll('[data-identity-selection]').forEach(select => {
      const input = select.closest('[data-identity-candidate]')?.querySelector('[data-new-person-name]');
      if (input) input.hidden = select.value !== 'create';
      select.onchange = () => { if (input) input.hidden = select.value !== 'create'; };
    });
    layer.querySelectorAll('[data-field-mode]').forEach(select => {
      const input = select.closest('[data-field-decision]')?.querySelector('[data-field-value]');
      if (input) input.hidden = select.value !== 'EDIT';
      select.onchange = () => { if (input) input.hidden = select.value !== 'EDIT'; };
    });
  }

  function draftFromLayer() {
    const identitySelections = {};
    layer.querySelectorAll('[data-identity-candidate]').forEach(node => {
      const reference = node.dataset.identityCandidate;
      const value = node.querySelector('[data-identity-selection]')?.value || '';
      if (value.startsWith('existing:')) identitySelections[reference] = { mode:'existing', personReference:value.slice('existing:'.length) };
      else if (value === 'create') identitySelections[reference] = { mode:'create', displayName:node.querySelector('[data-new-person-name]')?.value || '' };
    });
    const accountSelections = {};
    layer.querySelectorAll('[data-account-candidate]').forEach(node => {
      accountSelections[node.dataset.accountCandidate] = { accountReference:node.querySelector('[data-account-selection]')?.value || null };
    });
    const fieldDecisions = {};
    layer.querySelectorAll('[data-field-decision]').forEach(node => {
      const decision = node.querySelector('[data-field-mode]')?.value || 'ACCEPT';
      const item = { decision };
      if (decision === 'EDIT') item.value = node.querySelector('[data-field-value]')?.value ?? '';
      fieldDecisions[node.dataset.fieldDecision] = item;
    });
    return {
      reviewedAt,
      identitySelections,
      accountSelections,
      fieldDecisions,
      selectedPolicyReference: layer.querySelector('[data-policy-selection]')?.value || null,
    };
  }

  async function confirm() {
    if (saving || !model) return;
    saving = true; state = 'SAVING'; errorCode = null; render();
    try {
      const result = await reviewApi.confirmReview(model, draftFromLayer());
      saving = false; state = 'SUCCESS';
      render(result);
      options.globalState?.('Información confirmada.', 'status');
      await base.reload?.();
    } catch (error) {
      saving = false;
      errorCode = String(error?.code || error?.message || 'CARTERA020C_CONFIRMATION_FAILED');
      state = /CONFLICT|STALE|AMBIGU|BLOCKED|MISMATCH/.test(errorCode) ? 'CONFLICT' : 'ERROR';
      render();
    }
  }

  async function open(reference) {
    close(); installStyles(doc);
    packetReference = reference;
    reviewedAt = new Date().toISOString();
    state = 'LOADING';
    layer = doc.createElement('div');
    layer.className = 'cartera-dialog-layer';
    layer.dataset.reviewConfirmation002 = 'true';
    layer.dataset.packetReference = reference;
    layer.innerHTML = `<button class="cartera-scrim" data-review-close aria-label="Cerrar revisión"></button>
      <section class="cartera-dialog" role="dialog" aria-modal="true" aria-labelledby="review002-title">
        <header><div><p class="review002-eyebrow">CARTERA</p><h2 id="review002-title">Revisar documento</h2></div><button type="button" class="cartera-dialog-close" data-review-close aria-label="Cerrar">×</button></header>
        <div class="cartera-dialog__body"><p role="status">Preparando revisión gobernada…</p></div>
        <footer class="review002-footer"></footer>
      </section>`;
    layer.addEventListener('click', event => {
      if (event.target.closest('[data-review-close]')) { close(); return; }
      if (event.target.closest('[data-review-correct]')) { correcting = !correcting; errorCode = null; state = 'READY'; render(); return; }
      if (event.target.closest('[data-review-confirm]')) { void confirm(); }
    });
    doc.body.append(layer);
    render();
    try {
      model = await reviewApi.loadReview(reference);
      if (!layer || packetReference !== reference) return;
      state = 'READY'; render();
      layer.querySelector('[data-review-confirm], [data-review-correct], [data-review-close]')?.focus();
    } catch (error) {
      if (!layer || packetReference !== reference) return;
      errorCode = String(error?.code || error?.message || 'CARTERA020C_REVIEW_LOAD_FAILED');
      state = /CONFLICT|STALE|BLOCKED|NOT_READY|CONFIRMED/.test(errorCode) ? 'CONFLICT' : 'ERROR';
      render();
    }
  }

  function capturePendingPacket(event) {
    const trigger = event.target?.closest?.('[data-open-policy]');
    const reference = text(trigger?.dataset?.openPolicy);
    if (!reference.startsWith('POLICY_PACKET:AURA:')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void open(reference);
  }

  return Object.freeze({
    ...base,
    async mount() {
      installStyles(doc);
      root.addEventListener('click', capturePendingPacket, true);
      await base.mount?.();
    },
    async reload() { return base.reload?.(); },
    async scrub() { root.removeEventListener('click', capturePendingPacket, true); close(); return base.scrub?.(); },
    async unmount() { root.removeEventListener('click', capturePendingPacket, true); close(); return base.unmount?.(); },
    async destroy() { root.removeEventListener('click', capturePendingPacket, true); close(); return base.destroy?.(); },
    diagnostics() {
      return Object.freeze({
        ...(base.diagnostics?.() || {}),
        documentReviewHotfix: 'POST_017E_HOTFIX_002',
        confirmationAuthority: 'CARTERA-020C',
        canonicalWriter: 'CARTERA-010B',
        automaticConfirmation: false,
      });
    },
  });
}

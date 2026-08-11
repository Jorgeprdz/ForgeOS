import { createPipelineModule as createGovernedPipelineBridge } from './pipeline-consumer-bridge-008.js?v=forge-commercial-compass-015-base';
import { createPipelineAdapter as createConversationPipelineAdapter } from '../pipeline/pipeline-adapter-pages-v6-013.js?v=forge-commercial-compass-015';
import { createConversationWorkspaceController } from '../pipeline/pipeline-conversation-workspace.js?v=forge-commercial-compass-015-owner';

const STYLE_ID = 'forge-commercial-compass-015-conversation-style';
const FLOW_ID = 'FORGE_AURA_MESSAGE_FLOW_015';
const GOAL_LABELS = Object.freeze({
  first_contact: 'Primer contacto',
  follow_up: 'Seguimiento',
  reactivation: 'Retomar conversación',
  collection: 'Cobranza',
  application_signature: 'Firma de solicitud',
  appointment_confirmation: 'Confirmar cita',
  reschedule: 'Reprogramar',
  after_call: 'Después de llamada',
  custom: 'Otro / Personalizado',
});
const RECONCILE_DELAYS = Object.freeze([0, 40, 180, 650, 1600, 3400, 5600]);

function text(value) {
  return String(value ?? '').trim();
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setText(node, value) {
  if (node && text(node.textContent) !== value) node.textContent = value;
}

function installStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .aura-conversation-layer{padding:clamp(12px,2.2vw,28px)}
    .aura-conversation-layer .aura-conversation{width:min(1040px,calc(100vw - clamp(24px,4.4vw,56px)));max-width:1040px;max-height:min(92dvh,960px);grid-template-rows:auto auto auto auto minmax(0,1fr) auto}
    .aura-conversation-layer .aura-conversation__body{overflow-x:hidden;overflow-y:auto;min-height:0}
    .aura-conversation-layer .aura-conversation__body>*{min-width:0;max-width:100%}
    .aura-conversation__intent-fieldset{border:0;padding:0;margin:0;min-width:0}
    .aura-conversation__intent-fieldset legend{font:inherit;font-weight:800;margin:0 0 .45rem}
    .aura-conversation__intent-fieldset select[data-message-goal]{display:block!important;width:100%;min-height:44px;border:1px solid #d8dce4;border-radius:13px;background:#fff;color:#172033;padding:10px 12px}
    .aura-conversation__intent-options{display:none!important}
    .aura-conversation__technical,[data-conversation-technical],[data-context-technical],[data-relationship-technical]{display:none!important}
    .aura-conversation__flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0;padding:0 18px 14px;list-style:none}
    .aura-conversation__flow li{min-width:0;border-top:3px solid #dfe3ea;padding:8px 4px 0;color:#6b7280;font-size:.78rem;line-height:1.25}
    .aura-conversation__flow li[data-state="done"]{border-top-color:currentColor;color:#25324a;font-weight:700}
    .aura-conversation__flow li[data-state="current"]{border-top-color:currentColor;color:#172033;font-weight:800}
    .aura-conversation__adjustments{margin-top:12px;border:1px solid #e3e6ed;border-radius:14px;padding:0 12px;background:#fff}
    .aura-conversation__adjustments>summary{cursor:pointer;padding:11px 0;font-weight:700;color:#39445a}
    .aura-conversation__adjustments-body{display:grid;gap:10px;padding:0 0 12px}
    .aura-conversation__adjustments .aura-conversation__components{margin:0}
    .aura-combat__human-015{display:grid;gap:10px;margin-top:12px}
    .aura-combat__human-015 article{border:1px solid #e3e6ed;border-radius:14px;padding:12px;background:#fff}
    .aura-combat__human-015 strong{display:block;margin-bottom:5px}
    .aura-combat__human-015 p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
    @media(min-width:761px){.aura-conversation-layer .aura-conversation__grid{grid-template-columns:minmax(0,1fr)}}
    @media(max-width:760px){
      .aura-conversation-layer{padding:0;place-items:end center}
      .aura-conversation-layer .aura-conversation{width:100%;max-width:none;max-height:94dvh;border-radius:24px 24px 0 0}
      .aura-conversation__flow{display:none}
      .aura-conversation__header{padding:14px 16px 10px}
      .aura-conversation__header h2{font-size:clamp(1.25rem,7vw,1.65rem)}
      .aura-conversation__context{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;overflow:visible;padding:8px 12px}
      .aura-conversation__context .aura-conversation__fact{min-width:0;padding:7px 8px}
      .aura-conversation__context .aura-conversation__fact span{font-size:8px;letter-spacing:.04em}
      .aura-conversation__context .aura-conversation__fact strong{font-size:10px;line-height:1.25}
      .aura-conversation__tabs button{flex:1 1 0;min-width:0;min-height:52px;height:auto;padding:8px;white-space:normal;line-height:1.2}
    }
  `;
  doc.head.append(style);
}

function diagnostics(windowRef) {
  const current = windowRef.__FORGE_015_WA_DIAGNOSTICS__ || {};
  const next = {
    phase: 'FORGE_COMMERCIAL_COMPASS_015',
    bodyMutationObserver: false,
    conversationMutationObserver: false,
    boundedReconciliation: true,
    reconcileRuns: Number(current.reconcileRuns || 0),
    lastReason: current.lastReason || null,
    lastAt: current.lastAt || null,
  };
  windowRef.__FORGE_015_WA_DIAGNOSTICS__ = next;
  return next;
}

function ensureGoals(layer, adapter) {
  const select = layer.querySelector('select[data-message-goal]');
  if (!select) return;
  select.hidden = false;
  select.removeAttribute('aria-hidden');
  select.setAttribute('aria-label', 'Objetivo del mensaje');
  const registry = { ...GOAL_LABELS, ...(adapter?.messageOptions?.()?.goals || {}) };
  const present = new Set([...select.options].map(option => option.value));
  for (const [value, label] of Object.entries(registry)) {
    if (!value || present.has(value)) continue;
    const option = layer.ownerDocument.createElement('option');
    option.value = value;
    option.textContent = text(label) || value;
    select.append(option);
  }
  let fieldset = select.closest('.aura-conversation__intent-fieldset');
  if (!fieldset) {
    const label = select.closest('label');
    if (label) {
      fieldset = layer.ownerDocument.createElement('fieldset');
      fieldset.className = 'aura-conversation__intent-fieldset';
      const legend = layer.ownerDocument.createElement('legend');
      legend.textContent = '¿Qué necesitas lograr con este mensaje?';
      label.replaceWith(fieldset);
      fieldset.append(legend, select);
    }
  }
  setText(fieldset?.querySelector('legend'), '¿Qué necesitas lograr con este mensaje?');
}

function ensureFlow(layer) {
  const existing = [...layer.querySelectorAll('[data-conversation-flow-015]')];
  existing.slice(1).forEach(node => node.remove());
  if (existing[0]) return;
  const header = layer.querySelector('.aura-conversation__header');
  if (!header) return;
  const flow = layer.ownerDocument.createElement('ol');
  flow.className = 'aura-conversation__flow';
  flow.setAttribute('data-conversation-flow-015', FLOW_ID);
  flow.setAttribute('aria-label', 'Flujo para preparar el mensaje');
  for (const [step, label] of [
    ['context', 'Contexto Forge'],
    ['objective', 'Objetivo'],
    ['message', 'Mensaje preparado'],
    ['human', 'Ajuste humano'],
    ['whatsapp', 'WhatsApp'],
  ]) {
    const item = layer.ownerDocument.createElement('li');
    item.dataset.flowStep = step;
    item.textContent = label;
    flow.append(item);
  }
  header.insertAdjacentElement('afterend', flow);
}

function ensureOptionalAdjustments(layer) {
  const existing = [...layer.querySelectorAll('[data-message-adjustments-015]')];
  existing.slice(1).forEach(node => node.remove());
  let details = existing[0] || null;
  if (!details) {
    details = layer.ownerDocument.createElement('details');
    details.className = 'aura-conversation__adjustments';
    details.setAttribute('data-message-adjustments-015', 'true');
    const summary = layer.ownerDocument.createElement('summary');
    summary.textContent = 'Ajustes opcionales';
    const body = layer.ownerDocument.createElement('div');
    body.className = 'aura-conversation__adjustments-body';
    body.setAttribute('data-message-adjustments-body-015', 'true');
    details.append(summary, body);
    const fieldset = layer.querySelector('.aura-conversation__intent-fieldset');
    fieldset?.insertAdjacentElement('afterend', details);
  }
  const body = details.querySelector('[data-message-adjustments-body-015]');
  const tone = layer.querySelector('select[data-message-style]')?.closest('label');
  const components = layer.querySelector('.aura-conversation__components');
  if (tone && tone.parentElement !== body) body?.append(tone);
  if (components && components.parentElement !== body) body?.append(components);
}

function humanizePriority(root) {
  root.querySelectorAll('.aura-attention-card[data-priority-kind="no_commitment"]').forEach(card => {
    const name = text(card.querySelector('h3')?.textContent) || 'este prospecto';
    const paragraphs = card.querySelectorAll('p');
    setText(paragraphs[0], `${name} no tiene un siguiente paso agendado.`);
    setText(card.querySelector('small'), 'Agenda una fecha para retomarlo y evitar que el seguimiento pierda continuidad.');
  });
  root.querySelectorAll('.aura-attention-card details summary').forEach(summary => {
    if (/Ver evidencia/i.test(text(summary.textContent)) && summary.childNodes[0]) summary.childNodes[0].textContent = 'Ver por qué ';
  });
  root.querySelectorAll('.aura-attention-card dt').forEach(dt => {
    if (text(dt.textContent) === 'Fuente') setText(dt, 'Información registrada');
  });
  root.querySelectorAll('.aura-attention-card dd').forEach(dd => {
    const current = text(dd.textContent);
    if (current === 'Prospecto productivo') setText(dd, 'Prospecto');
    if (current === 'Timeline productivo') setText(dd, 'Historial');
    if (current === 'Compromiso productivo') setText(dd, 'Seguimiento agendado');
  });
}

function humanizeRelationship(root) {
  root.querySelectorAll('p,small,strong,h2,h3,span').forEach(node => {
    const current = text(node.textContent);
    if (!current || node.children.length) return;
    let next = current
      .replace(/memoria relacional/gi, 'historial de seguimiento')
      .replace(/brief relacional/gi, 'resumen de la relación')
      .replace(/revisión de relación/gi, 'seguimiento con cliente')
      .replace(/fuente conectada/gi, 'información disponible')
      .replace(/contexto confirmado/gi, 'información revisada')
      .replace(/contextos de Cartera convergen/gi, 'temas de Cartera requieren revisión');
    if (/CommercialPerson|CRS-\d+|Relationship Intelligence|source-owner|source owner/i.test(next)) {
      next = 'Información vinculada con esta persona.';
    }
    if (next !== current) node.textContent = next;
  });
  root.querySelectorAll('.aura-technical-disclosure,[data-context-technical],[data-relationship-technical]').forEach(node => {
    node.hidden = true;
  });
}

function cleanNextMove(value) {
  return text(value)
    .replace(/\b(action|recommendedAction|recommended_action|reason|confidence|type|intent)\s*:\s*/gi, '')
    .replace(/\s*·\s*·\s*/g, ' · ')
    .replace(/^[-·\s]+|[-·\s]+$/g, '');
}

function humanizeCombat(layer) {
  const result = layer.querySelector('[data-combat-result]');
  if (!result || result.hidden || result.querySelector('[data-combat-human-015]')) return;
  const objection = text(layer.querySelector('[data-combat-objection]')?.value) || 'Objeción registrada para esta revisión.';
  const guidance = [...result.querySelectorAll('.aura-combat__guidance article p')].map(node => text(node.textContent)).filter(Boolean);
  const details = [...result.querySelectorAll('dd')].map(node => text(node.textContent)).filter(Boolean);
  const whatMayBeHappening = guidance[0] || details[0] || 'Forge encontró una posible explicación que requiere tu criterio.';
  const howToAddress = guidance[1] || details[1] || 'Haz una pregunta breve, reconoce la inquietud y evita presionar.';
  const nextMove = cleanNextMove(details.at(-1) || guidance[2] || 'Continúa con una pregunta que ayude a aclarar la decisión.');
  result.innerHTML = `<div class="aura-combat__human-015" data-combat-human-015="true">
    <article><strong>Objeción</strong><p>${esc(objection)}</p></article>
    <article><strong>Qué podría estar pasando</strong><p>${esc(whatMayBeHappening)}</p></article>
    <article><strong>Cómo abordarla</strong><p>${esc(howToAddress)}</p></article>
    <article><strong>Siguiente movimiento</strong><p>${esc(nextMove)}</p></article>
  </div>`;
  const review = layer.querySelector('[data-review-combat]');
  setText(review, 'Preparar mensaje');
  const register = layer.querySelector('[data-register-combat]');
  if (register && !register.hidden) setText(register, 'Guardar en historial');
}

function humanizeConversation(layer, adapter) {
  ensureGoals(layer, adapter);
  ensureFlow(layer);
  ensureOptionalAdjustments(layer);
  layer.querySelectorAll('[data-conversation-technical],.aura-conversation__technical').forEach(node => { node.hidden = true; });
  layer.querySelector('.aura-conversation__context')?.setAttribute('aria-label', 'Contexto del prospecto');
  setText(layer.querySelector('.aura-conversation__header p'), 'PREPARAR MENSAJE');
  setText(layer.querySelector('.aura-conversation__draft-header strong'), 'Mensaje preparado');
  setText(layer.querySelector('[data-conversation-tab="combat"]'), 'Ayuda con objeciones');

  layer.querySelectorAll('button').forEach(button => {
    const current = text(button.textContent);
    if (current === 'Generar con IA' || current === 'Generar sugerencia') setText(button, 'Preparar mensaje');
    if (current === 'Generando…') setText(button, 'Preparando…');
    if (current === 'Regenerar con IA') setText(button, 'Preparar otra versión');
    if (current === 'Revisar y aprobar texto exacto') setText(button, 'Aprobar este texto');
    if (current === 'Abrir en WhatsApp') setText(button, 'Abrir WhatsApp');
    if (/Usar estrategia en mensaje/i.test(current)) setText(button, 'Preparar mensaje');
  });

  layer.querySelectorAll('p,small,strong,label,legend,span').forEach(node => {
    const current = text(node.textContent);
    if (!current || node.children.length) return;
    let next = current
      .replace(/Conversation Brief/gi, 'información de la conversación')
      .replace(/Generado por IA/gi, 'Sugerencia preparada')
      .replace(/Fallback seguro de Forge/gi, 'Sugerencia de respaldo')
      .replace(/NASH Combat/gi, 'Forge')
      .replace(/Estrategia NASH/gi, 'Cómo abordarla')
      .replace(/modelo de IA/gi, 'redacción')
      .replace(/LLM/gi, 'redacción')
      .replace(/provider/gi, 'servicio de redacción')
      .replace(/prompt builder/gi, 'preparación de mensaje')
      .replace(/prompt/gi, 'instrucción');
    if (/clasificación candidata|intención candidata|confianza candidata/i.test(next)) next = '';
    if (next !== current) node.textContent = next;
  });

  const notice = layer.querySelector('[data-conversation-notice]');
  if (notice && !notice.hidden) {
    const current = text(notice.textContent);
    if (/Conversation Brief|NASH Combat|clasificación candidata/i.test(current)) {
      notice.textContent = 'Forge organizó la información disponible. Revísala antes de usarla.';
    }
  }

  humanizeCombat(layer);
  updateFlow(layer);
}

function updateFlow(layer) {
  const draft = layer.querySelector('[data-draft]');
  const draftBlock = layer.querySelector('[data-draft-block]');
  const approve = layer.querySelector('[data-approve-draft]');
  const whatsapp = layer.querySelector('[data-open-whatsapp]');
  const hasDraft = Boolean(text(draft?.value)) && draftBlock?.hidden !== true;
  const whatsappReady = Boolean(whatsapp && whatsapp.disabled === false);
  const approvalReady = hasDraft && !whatsappReady && Boolean(approve && approve.disabled === false);
  const current = whatsappReady ? 'whatsapp' : approvalReady || hasDraft ? 'human' : 'objective';
  const order = ['context', 'objective', 'message', 'human', 'whatsapp'];
  const currentIndex = order.indexOf(current);
  layer.querySelectorAll('[data-flow-step]').forEach(item => {
    const index = order.indexOf(item.dataset.flowStep);
    item.dataset.state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending';
  });
}

export function createPipelineModule(options = {}) {
  const { root, client, windowRef = window, globalState } = options;
  if (!root || !client) throw new Error('AURA_PIPELINE_ROOT_AND_CLIENT_REQUIRED');
  const doc = root.ownerDocument;
  installStyles(doc);

  let adapter = null;
  const timers = new Set();
  const events = new AbortController();
  const perf = diagnostics(windowRef);
  const workspace = createConversationWorkspaceController({ root, windowRef, globalState });
  const base = createGovernedPipelineBridge({
    ...options,
    windowRef,
    adapterFactory: async args => {
      adapter = await createConversationPipelineAdapter(args);
      return adapter;
    },
  });

  function reconcile(reason = 'scheduled') {
    humanizePriority(root);
    humanizeRelationship(root);
    const layer = doc.querySelector('[data-aura-conversation-workspace]');
    if (layer) humanizeConversation(layer, adapter);
    perf.reconcileRuns += 1;
    perf.lastReason = reason;
    perf.lastAt = new Date().toISOString();
  }

  function scheduleBurst(reason = 'interaction') {
    for (const timer of timers) windowRef.clearTimeout(timer);
    timers.clear();
    for (const delay of RECONCILE_DELAYS) {
      const timer = windowRef.setTimeout(() => {
        timers.delete(timer);
        reconcile(`${reason}:${delay}`);
      }, delay);
      timers.add(timer);
    }
  }

  const onWhatsappTrigger = event => {
    const trigger = event.target?.closest?.('[data-action="whatsapp"], [data-recommendation-action="whatsapp"], [data-priority-action="whatsapp"]');
    if (!trigger || !root.contains(trigger) || trigger.disabled) return;
    const id = String(trigger.dataset.id || '');
    const card = adapter?.getCards?.().find(item => String(item.id) === id);
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    workspace.open({ card, adapter, trigger });
    scheduleBurst('workspace-open');
  };

  root.addEventListener('click', onWhatsappTrigger, { capture: true, signal: events.signal });
  doc.addEventListener('click', event => {
    if (!event.target?.closest?.('[data-aura-conversation-workspace]')) return;
    scheduleBurst('workspace-click');
  }, { signal: events.signal });
  doc.addEventListener('change', event => {
    if (!event.target?.closest?.('[data-aura-conversation-workspace]')) return;
    scheduleBurst('workspace-change');
  }, { signal: events.signal });
  doc.addEventListener('input', event => {
    if (!event.target?.closest?.('[data-aura-conversation-workspace]')) return;
    windowRef.setTimeout(() => reconcile('workspace-input'), 0);
  }, { signal: events.signal });

  function stop() {
    for (const timer of timers) windowRef.clearTimeout(timer);
    timers.clear();
    workspace.close?.();
  }

  return Object.freeze({
    ...base,
    async mount() {
      const result = await base.mount?.();
      reconcile('mount');
      return result;
    },
    async reload() {
      const result = await base.reload?.();
      reconcile('reload');
      return result;
    },
    async scrub() {
      stop();
      return base.scrub?.();
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      stop();
      events.abort();
      workspace.destroy();
      adapter = null;
      return base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        phase: 'FORGE_COMMERCIAL_COMPASS_015',
        mutationObservers: 0,
        bodyObserver: false,
        boundedReconciliation: true,
        reconcileRuns: perf.reconcileRuns,
        base: base.diagnostics?.() || null,
      });
    },
  });
}

export { FLOW_ID, GOAL_LABELS };

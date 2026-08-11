import { createPipelineModule as createBasePipelineModule } from './pipeline-consumer-bridge-011b.js?v=forge-aura-real-user-repair-014-base';

const STYLE_ID = 'forge-aura-pipeline-real-user-014-style';
const FLOW_ID = 'FORGE_AURA_MESSAGE_FLOW_014B';

function text(value) {
  return String(value ?? '').trim();
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
    .aura-conversation-layer .aura-conversation{width:min(1040px,calc(100vw - clamp(24px,4.4vw,56px)));max-width:1040px;max-height:min(92dvh,960px);grid-template-rows:auto auto auto minmax(0,1fr) auto}
    .aura-conversation-layer .aura-conversation__body{overflow-x:hidden;overflow-y:auto}
    .aura-conversation-layer .aura-conversation__body>*{min-width:0;max-width:100%}
    .aura-conversation__intent-fieldset select[data-message-goal]{display:block!important;width:100%;min-height:44px;border:1px solid #d8dce4;border-radius:13px;background:#fff;color:#172033;padding:10px 12px}
    .aura-conversation__intent-options[data-real-user-hidden-014="true"]{display:none!important}
    .aura-conversation__technical{display:none!important}
    .aura-conversation__flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0;padding:0 18px 14px;list-style:none}
    .aura-conversation__flow li{min-width:0;border-top:3px solid #dfe3ea;padding:8px 4px 0;color:#6b7280;font-size:.78rem;line-height:1.25}
    .aura-conversation__flow li[data-state="done"]{border-top-color:currentColor;color:#25324a;font-weight:700}
    .aura-conversation__flow li[data-state="current"]{border-top-color:currentColor;color:#172033;font-weight:800}
    .aura-conversation__adjustments{margin-top:12px;border:1px solid #e3e6ed;border-radius:14px;padding:0 12px;background:#fff}
    .aura-conversation__adjustments>summary{cursor:pointer;padding:11px 0;font-weight:700;color:#39445a}
    .aura-conversation__adjustments-body{display:grid;gap:10px;padding:0 0 12px}
    .aura-conversation__adjustments .aura-conversation__components{margin:0}
    .aura-conversation__draft-header strong{font-size:1rem}
    @media(min-width:761px){.aura-conversation-layer .aura-conversation__grid{grid-template-columns:minmax(0,1fr)}}
    @media(max-width:760px){
      .aura-conversation-layer{padding:0;place-items:end center}
      .aura-conversation-layer .aura-conversation{width:100%;max-width:none;max-height:94dvh;border-radius:24px 24px 0 0}
      .aura-conversation__flow{grid-template-columns:repeat(5,minmax(56px,1fr));overflow-x:auto;padding-inline:14px}
    }
  `;
  doc.head.append(style);
}

function humanizePriority(root) {
  root.querySelectorAll('.aura-attention-card[data-priority-kind="no_commitment"]').forEach(card => {
    const name = text(card.querySelector('h3')?.textContent) || 'este prospecto';
    const paragraphs = card.querySelectorAll('p');
    const consequence = card.querySelector('small');
    setText(paragraphs[0], `${name} no tiene un siguiente paso agendado.`);
    setText(consequence, 'Agenda una fecha para retomarlo y evitar que el seguimiento pierda continuidad.');
  });

  root.querySelectorAll('.aura-attention-card details summary').forEach(summary => {
    if (/Ver evidencia/i.test(text(summary.textContent)) && summary.childNodes[0]) {
      const next = 'Ver por qué ';
      if (summary.childNodes[0].textContent !== next) summary.childNodes[0].textContent = next;
    }
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

function humanizeRelationshipContext(root) {
  root.querySelectorAll('p,small,strong,h2,h3,span').forEach(node => {
    const current = text(node.textContent);
    if (!current || node.children.length) return;
    let next = current;
    next = next.replace(/memoria relacional/gi, 'historial de seguimiento');
    next = next.replace(/brief relacional/gi, 'resumen de la relación');
    next = next.replace(/revisión de relación/gi, 'seguimiento con cliente');
    next = next.replace(/fuente conectada/gi, 'información disponible');
    next = next.replace(/contexto confirmado/gi, 'información revisada');
    if (/CommercialPerson|CRS-10|Relationship Intelligence|source-owner|source owner/i.test(next)) {
      next = 'Información vinculada con esta persona.';
    }
    if (next !== current) node.textContent = next;
  });

  root.querySelectorAll('.aura-technical-disclosure,[data-context-technical],[data-relationship-technical]').forEach(node => {
    if (!node.hidden) node.hidden = true;
    if (node.dataset.internalOnly014 !== 'true') node.dataset.internalOnly014 = 'true';
  });
}

function simplifyIntentSelector(layer) {
  const fieldset = layer.querySelector('.aura-conversation__intent-fieldset');
  if (!fieldset) return;
  const select = fieldset.querySelector('select[data-message-goal]');
  if (select) {
    if (select.hidden) select.hidden = false;
    if (select.hasAttribute('aria-hidden')) select.removeAttribute('aria-hidden');
    if (select.getAttribute('aria-label') !== 'Objetivo del mensaje') select.setAttribute('aria-label', 'Objetivo del mensaje');
  }
  const legend = fieldset.querySelector('legend');
  setText(legend, '¿Qué necesitas lograr con este mensaje?');
  const chips = fieldset.querySelector('.aura-conversation__intent-options');
  if (chips && chips.dataset.realUserHidden014 !== 'true') chips.dataset.realUserHidden014 = 'true';
}

function ensureFlow(layer) {
  const workspace = layer.matches?.('[data-aura-conversation-workspace]')
    ? layer
    : layer.closest?.('[data-aura-conversation-workspace]') || layer;
  const conversation = workspace.querySelector('.aura-conversation');
  const header = workspace.querySelector('.aura-conversation__header');
  if (!conversation || !header) return workspace;

  if (!workspace.querySelector('[data-conversation-flow-014]')) {
    const flow = workspace.ownerDocument.createElement('ol');
    flow.className = 'aura-conversation__flow';
    flow.dataset.conversationFlow014 = FLOW_ID;
    flow.setAttribute('aria-label', 'Flujo para preparar el mensaje');
    for (const [step, label] of [
      ['context', 'Contexto Forge'],
      ['objective', 'Objetivo'],
      ['message', 'Mensaje preparado'],
      ['human', 'Ajuste humano'],
      ['whatsapp', 'WhatsApp'],
    ]) {
      const item = workspace.ownerDocument.createElement('li');
      item.dataset.flowStep = step;
      item.textContent = label;
      flow.append(item);
    }
    header.insertAdjacentElement('afterend', flow);
  }
  return workspace;
}

function ensureOptionalAdjustments(workspace) {
  if (!workspace?.querySelector) return;
  let details = workspace.querySelector('[data-message-adjustments-014]');
  if (!details) {
    details = workspace.ownerDocument.createElement('details');
    details.className = 'aura-conversation__adjustments';
    details.dataset.messageAdjustments014 = 'true';
    const summary = workspace.ownerDocument.createElement('summary');
    summary.textContent = 'Ajustes opcionales';
    const body = workspace.ownerDocument.createElement('div');
    body.className = 'aura-conversation__adjustments-body';
    body.dataset.messageAdjustmentsBody014 = 'true';
    details.append(summary, body);
    const fieldset = workspace.querySelector('.aura-conversation__intent-fieldset');
    fieldset?.insertAdjacentElement('afterend', details);
  }
  const body = details.querySelector('[data-message-adjustments-body-014]');
  const tone = workspace.querySelector('select[data-message-style]')?.closest('label');
  const components = workspace.querySelector('.aura-conversation__components');
  if (tone && tone.parentElement !== body) body?.append(tone);
  if (components && components.parentElement !== body) body?.append(components);
}

function updateFlowState(workspace) {
  if (!workspace?.querySelector) return;
  const draft = workspace.querySelector('[data-draft]');
  const draftBlock = workspace.querySelector('[data-draft-block]');
  const approve = workspace.querySelector('[data-approve-draft]');
  const whatsapp = workspace.querySelector('[data-open-whatsapp]');
  const hasDraft = Boolean(text(draft?.value)) && draftBlock?.hidden !== true;
  const whatsappReady = Boolean(whatsapp && whatsapp.disabled === false);
  const approvalReady = hasDraft && !whatsappReady && Boolean(approve && approve.disabled === false);
  const current = whatsappReady ? 'whatsapp' : approvalReady ? 'human' : hasDraft ? 'human' : 'objective';
  if (workspace.dataset.conversationFlowState014 !== current) workspace.dataset.conversationFlowState014 = current;

  const order = ['context', 'objective', 'message', 'human', 'whatsapp'];
  const currentIndex = order.indexOf(current);
  workspace.querySelectorAll('[data-flow-step]').forEach(item => {
    const index = order.indexOf(item.dataset.flowStep);
    const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending';
    if (item.dataset.state !== state) item.dataset.state = state;
  });
}

function humanizeConversationLayer(doc) {
  const workspaces = new Set();
  doc.querySelectorAll('[data-aura-conversation-workspace],.aura-conversation').forEach(layer => {
    const workspace = ensureFlow(layer);
    workspaces.add(workspace);
    workspace.querySelectorAll('[data-conversation-technical],.aura-conversation__technical').forEach(details => {
      if (!details.hidden) details.hidden = true;
      if (details.dataset.internalOnly014 !== 'true') details.dataset.internalOnly014 = 'true';
    });
    simplifyIntentSelector(workspace);
    ensureOptionalAdjustments(workspace);

    const eyebrow = workspace.querySelector('.aura-conversation__header p');
    setText(eyebrow, 'PREPARAR MENSAJE');

    workspace.querySelectorAll('button').forEach(button => {
      const current = text(button.textContent);
      if (current === 'Generar con IA' || current === 'Generar sugerencia') setText(button, 'Preparar mensaje');
      if (current === 'Generando…') setText(button, 'Preparando…');
      if (current === 'Regenerar con IA') setText(button, 'Preparar otra versión');
      if (current === 'Revisar y aprobar texto exacto') setText(button, 'Aprobar este texto');
      if (current === 'Abrir en WhatsApp') setText(button, 'Abrir WhatsApp');
    });

    const draftHeading = workspace.querySelector('.aura-conversation__draft-header strong');
    setText(draftHeading, 'Mensaje preparado');

    workspace.querySelectorAll('p,small,strong,label,legend').forEach(node => {
      const current = text(node.textContent);
      if (!current || node.children.length) return;
      let next = current
        .replace(/Generar con IA/gi, 'Preparar mensaje')
        .replace(/Regenerar con IA/gi, 'Preparar otra versión')
        .replace(/modelo de IA/gi, 'redacción')
        .replace(/LLM/gi, 'redacción')
        .replace(/prompt builder/gi, 'preparación de mensaje')
        .replace(/prompt/gi, 'instrucción');
      if (/Conversation Brief/i.test(next)) {
        next = 'Forge está organizando la información disponible para preparar una sugerencia.';
      }
      if (next !== current) node.textContent = next;
    });
  });
  workspaces.forEach(updateFlowState);
}

function reconcile(root, doc) {
  humanizePriority(root);
  humanizeRelationshipContext(root);
  humanizeConversationLayer(doc);
}

export function createPipelineModule(options = {}) {
  const root = options.root;
  const doc = root?.ownerDocument || document;
  const base = createBasePipelineModule(options);
  let rootObserver = null;
  let bodyObserver = null;
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      reconcile(root, doc);
    });
  };

  function start() {
    installStyles(doc);
    const Observer = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    rootObserver = new Observer(schedule);
    rootObserver.observe(root, { childList: true, subtree: true, characterData: true });
    bodyObserver = new Observer(schedule);
    bodyObserver.observe(doc.body, { childList: true, subtree: true, characterData: true });
    schedule();
  }

  function stop() {
    rootObserver?.disconnect();
    bodyObserver?.disconnect();
    rootObserver = null;
    bodyObserver = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      start();
      const result = await base.mount?.();
      schedule();
      return result;
    },
    async reload() {
      const result = await base.reload?.();
      schedule();
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
      return base.destroy?.();
    },
  });
}

export { FLOW_ID };

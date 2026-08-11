import { createPipelineModule as createBasePipelineModule } from './pipeline-consumer-bridge-011b.js?v=forge-aura-real-user-repair-014-base';

const STYLE_ID = 'forge-aura-pipeline-real-user-014-style';

function text(value) {
  return String(value ?? '').trim();
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
    @media(min-width:761px){.aura-conversation-layer .aura-conversation__grid{grid-template-columns:minmax(0,1fr) minmax(0,.72fr)}}
    @media(max-width:760px){
      .aura-conversation-layer{padding:0;place-items:end center}
      .aura-conversation-layer .aura-conversation{width:100%;max-width:none;max-height:94dvh;border-radius:24px 24px 0 0}
    }
  `;
  doc.head.append(style);
}

function humanizePriority(root) {
  root.querySelectorAll('.aura-attention-card[data-priority-kind="no_commitment"]').forEach(card => {
    const name = text(card.querySelector('h3')?.textContent) || 'este prospecto';
    const paragraphs = card.querySelectorAll('p');
    const consequence = card.querySelector('small');
    if (paragraphs[0]) paragraphs[0].textContent = `${name} no tiene un siguiente paso agendado.`;
    if (consequence) consequence.textContent = 'Agenda una fecha para retomarlo y evitar que el seguimiento pierda continuidad.';
  });

  root.querySelectorAll('.aura-attention-card details summary').forEach(summary => {
    if (/Ver evidencia/i.test(text(summary.textContent))) summary.childNodes[0].textContent = 'Ver por qué ';
  });

  root.querySelectorAll('.aura-attention-card dt').forEach(dt => {
    if (text(dt.textContent) === 'Fuente') dt.textContent = 'Información registrada';
  });

  root.querySelectorAll('.aura-attention-card dd').forEach(dd => {
    const current = text(dd.textContent);
    if (current === 'Prospecto productivo') dd.textContent = 'Prospecto';
    if (current === 'Timeline productivo') dd.textContent = 'Historial';
    if (current === 'Compromiso productivo') dd.textContent = 'Seguimiento agendado';
  });
}

function humanizeRelationshipContext(root) {
  root.querySelectorAll('p,small,strong,h2,h3,span').forEach(node => {
    const current = text(node.textContent);
    if (!current || node.children.length) return;
    if (/memoria relacional/i.test(current)) node.textContent = current.replace(/memoria relacional/gi, 'historial de seguimiento');
    if (/brief relacional/i.test(current)) node.textContent = current.replace(/brief relacional/gi, 'resumen de la relación');
    if (/revisión de relación/i.test(current)) node.textContent = current.replace(/revisión de relación/gi, 'seguimiento con cliente');
    if (/fuente conectada/i.test(current)) node.textContent = current.replace(/fuente conectada/gi, 'información disponible');
    if (/contexto confirmado/i.test(current)) node.textContent = current.replace(/contexto confirmado/gi, 'información revisada');
    if (/CommercialPerson|CRS-10|Relationship Intelligence|source-owner|source owner/i.test(current)) {
      node.textContent = 'Información vinculada con esta persona.';
    }
  });

  root.querySelectorAll('.aura-technical-disclosure,[data-context-technical],[data-relationship-technical]').forEach(node => {
    node.hidden = true;
    node.dataset.internalOnly014 = 'true';
  });
}

function simplifyIntentSelector(layer) {
  const fieldset = layer.querySelector('.aura-conversation__intent-fieldset');
  if (!fieldset) return;
  const select = fieldset.querySelector('select[data-message-goal]');
  if (select) {
    select.hidden = false;
    select.removeAttribute('aria-hidden');
    select.setAttribute('aria-label', 'Objetivo del mensaje');
  }
  const legend = fieldset.querySelector('legend');
  if (legend) legend.textContent = 'Objetivo del mensaje';
  const chips = fieldset.querySelector('.aura-conversation__intent-options');
  if (chips) chips.dataset.realUserHidden014 = 'true';
}

function humanizeConversationLayer(doc) {
  doc.querySelectorAll('[data-aura-conversation-workspace],.aura-conversation').forEach(layer => {
    layer.querySelectorAll('[data-conversation-technical],.aura-conversation__technical').forEach(details => {
      details.hidden = true;
      details.dataset.internalOnly014 = 'true';
    });
    simplifyIntentSelector(layer);

    const eyebrow = layer.querySelector('.aura-conversation__header p');
    if (eyebrow) eyebrow.textContent = 'PREPARAR MENSAJE';

    layer.querySelectorAll('button').forEach(button => {
      const current = text(button.textContent);
      if (current === 'Generar con IA') button.textContent = 'Preparar mensaje';
      if (current === 'Regenerar con IA') button.textContent = 'Preparar otra versión';
    });

    layer.querySelectorAll('p,small,strong,label,legend').forEach(node => {
      const current = text(node.textContent);
      if (!current || node.children.length) return;
      if (/prompt builder|prompt|LLM|modelo de IA|generar con IA/i.test(current)) {
        node.textContent = current
          .replace(/Generar con IA/gi, 'Preparar mensaje')
          .replace(/Regenerar con IA/gi, 'Preparar otra versión')
          .replace(/modelo de IA/gi, 'redacción')
          .replace(/LLM/gi, 'redacción')
          .replace(/prompt/gi, 'instrucción');
      }
      if (/Conversation Brief/i.test(text(node.textContent))) {
        node.textContent = 'Forge está organizando la información disponible para preparar una sugerencia.';
      }
    });
  });
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

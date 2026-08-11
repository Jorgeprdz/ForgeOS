import { createConversationWorkspaceController as createBaseConversationWorkspaceController } from './pipeline-conversation-workspace.js?v=forge-beta2-013-base';

const STYLE_ID = 'forge-conversation-intent-013-style';

function text(value) {
  return String(value ?? '').trim();
}

function installStyle(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .aura-conversation__intent-fieldset{border:0;padding:0;margin:0;min-width:0}
    .aura-conversation__intent-fieldset legend{font:inherit;font-weight:700;margin:0 0 .45rem}
    .aura-conversation__intent-options{display:flex;flex-wrap:wrap;gap:.45rem}
    .aura-conversation__intent-option{border:1px solid currentColor;border-radius:999px;background:transparent;padding:.48rem .72rem;cursor:pointer;font:inherit}
    .aura-conversation__intent-option[aria-pressed="true"]{font-weight:800;box-shadow:0 0 0 2px currentColor inset}
    .aura-conversation__intent-option:focus-visible{outline:3px solid currentColor;outline-offset:2px}
    .aura-conversation__technical{margin-top:.7rem}
    .aura-conversation__technical summary{cursor:pointer;font-weight:700}
    .aura-conversation__technical pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.78rem;line-height:1.45}
  `;
  doc.head.append(style);
}

function clearStaleDraft(layer) {
  const draft = layer.querySelector('[data-draft]');
  const block = layer.querySelector('[data-draft-block]');
  const approve = layer.querySelector('[data-approve-draft]');
  const openWhatsapp = layer.querySelector('[data-open-whatsapp]');
  const approvalState = layer.querySelector('[data-approval-state]');
  if (draft) draft.value = '';
  if (block) block.hidden = true;
  if (approve) approve.disabled = true;
  if (openWhatsapp) openWhatsapp.disabled = true;
  if (approvalState) approvalState.textContent = 'El objetivo cambió. Genera una nueva sugerencia antes de aprobar.';
}

function ensureRegisteredGoals(select, adapter) {
  const registry = adapter?.messageOptions?.()?.goals || {};
  const present = new Set([...select.options].map(option => option.value));
  for (const [value, label] of Object.entries(registry)) {
    if (!value || present.has(value)) continue;
    const option = select.ownerDocument.createElement('option');
    option.value = value;
    option.textContent = text(label) || value;
    select.append(option);
    present.add(value);
  }
}

function upgradeGoalSelector(layer, adapter) {
  const select = layer.querySelector('select[data-message-goal]');
  if (!select || select.dataset.intent013Upgraded === 'true') return;
  select.dataset.intent013Upgraded = 'true';
  ensureRegisteredGoals(select, adapter);

  const label = select.closest('label');
  if (!label) return;
  const doc = layer.ownerDocument;
  const fieldset = doc.createElement('fieldset');
  fieldset.className = 'aura-conversation__intent-fieldset';
  const legend = doc.createElement('legend');
  legend.textContent = 'Objetivo';
  const options = doc.createElement('div');
  options.className = 'aura-conversation__intent-options';
  options.setAttribute('role', 'group');
  options.setAttribute('aria-label', 'Tipo de mensaje');

  layer.dataset.selectedMessageIntent = select.value;
  [...select.options].forEach(option => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'aura-conversation__intent-option';
    button.dataset.messageGoalOption = option.value;
    button.textContent = option.textContent;
    button.setAttribute('aria-pressed', String(select.value === option.value));
    button.addEventListener('click', () => {
      const generate = layer.querySelector('[data-generate-draft]');
      if (generate?.disabled) return;
      select.value = option.value;
      layer.dataset.selectedMessageIntent = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      options.querySelectorAll('[data-message-goal-option]').forEach(peer => {
        peer.setAttribute('aria-pressed', String(peer === button));
      });
      clearStaleDraft(layer);
      const notice = layer.querySelector('[data-conversation-notice]');
      if (notice) {
        notice.hidden = false;
        notice.dataset.tone = 'info';
        notice.textContent = `Objetivo seleccionado: ${text(option.textContent)}.`;
      }
    });
    options.append(button);
  });

  select.hidden = true;
  select.setAttribute('aria-hidden', 'true');
  fieldset.append(legend, options, select);
  label.replaceWith(fieldset);
  queueMicrotask(() => options.querySelector('[aria-pressed="true"]')?.focus());
}

function ensureTechnicalDisclosure(layer) {
  let details = layer.querySelector('[data-conversation-technical]');
  if (details) return details;
  details = layer.ownerDocument.createElement('details');
  details.className = 'aura-conversation__technical';
  details.dataset.conversationTechnical = '013';
  const summary = layer.ownerDocument.createElement('summary');
  summary.textContent = 'Información técnica';
  const pre = layer.ownerDocument.createElement('pre');
  pre.dataset.conversationTechnicalBody = '013';
  details.append(summary, pre);
  const notice = layer.querySelector('[data-conversation-notice]');
  notice?.insertAdjacentElement('afterend', details);
  return details;
}

function technicalLines(prepared) {
  if (!prepared) return [];
  return [
    `selectedIntent=${text(prepared.selectedIntent) || 'unknown'}`,
    `intentConsumedByNash=${text(prepared.intentConsumedByNash) || 'not-confirmed'}`,
    `sourceMode=${text(prepared.sourceMode) || 'unknown'}`,
    `fallbackReason=${text(prepared.diagnostics?.fallbackReason) || 'none'}`,
    `humanApprovalRequired=${prepared.humanApprovalRequired === true}`,
    `approved=${prepared.approved === true}`,
    `sent=${prepared.sent === true}`,
  ];
}

function reconcileTechnicalDisclosure(layer, prepared) {
  const details = ensureTechnicalDisclosure(layer);
  const body = details.querySelector('[data-conversation-technical-body]');
  const lines = technicalLines(prepared);
  details.hidden = !lines.length;
  details.removeAttribute('open');
  if (body) body.textContent = lines.join('\n');
}

function humanizeStaticSurface(layer) {
  const context = layer.querySelector('.aura-conversation__context');
  context?.setAttribute('aria-label', 'Contexto del prospecto');
  const eyebrow = layer.querySelector('.aura-conversation__header p');
  if (eyebrow) eyebrow.textContent = 'CONVERSACIÓN';
  const combatTab = layer.querySelector('[data-conversation-tab="combat"]');
  if (combatTab) combatTab.textContent = 'Ayuda con objeciones';
  const registerCombat = layer.querySelector('[data-register-combat]');
  if (registerCombat && !/registrada/i.test(registerCombat.textContent || '')) {
    registerCombat.textContent = 'Guardar clasificación revisada';
  }
  layer.querySelectorAll('.aura-combat__guidance article strong').forEach(node => {
    if (text(node.textContent) === 'Estrategia NASH') node.textContent = 'Estrategia sugerida';
  });
}

function humanizeNotice(layer, prepared) {
  const notice = layer.querySelector('[data-conversation-notice]');
  if (!notice || notice.hidden) return;
  const current = text(notice.textContent);
  let next = current;

  if (/Conversation Brief/i.test(current)) {
    next = 'Forge está organizando la información disponible y preparando una sugerencia.';
  }
  if (prepared?.status === 'BLOCKED') {
    next = text(prepared?.diagnostics?.userExplanation)
      || 'Forge no encontró suficiente información confiable para preparar esta sugerencia. Revisa el contexto disponible y vuelve a intentarlo.';
  } else if (/NASH Combat produjo una clasificación candidata/i.test(current)) {
    next = 'Forge preparó una interpretación posible de la objeción. Revísala antes de usarla o guardarla.';
  } else if (/Clasificación revisada.*NASH Combat/i.test(current)) {
    next = 'Clasificación revisada. La próxima sugerencia tomará en cuenta esta estrategia sin compartir el texto original de la objeción.';
  } else if (/Timeline/i.test(current)) {
    next = 'Se guardó la clasificación revisada en el historial del prospecto. El texto original de la objeción no fue guardado.';
  }

  if (next !== current) notice.textContent = next;
}

function reconcilePresentation(layer, prepared) {
  humanizeStaticSurface(layer);
  humanizeNotice(layer, prepared);
  reconcileTechnicalDisclosure(layer, prepared);
}

function presentationAdapter(adapter, onPrepared) {
  if (!adapter?.prepareMessage) return adapter;
  return Object.freeze({
    ...adapter,
    async prepareMessage(...args) {
      const prepared = await adapter.prepareMessage(...args);
      onPrepared(prepared);
      return prepared;
    },
  });
}

export function createConversationWorkspaceController(options = {}) {
  const base = createBaseConversationWorkspaceController(options);
  let observer = null;
  let latestPrepared = null;

  function disconnectObserver() {
    observer?.disconnect?.();
    observer = null;
  }

  function observePresentation(layer) {
    disconnectObserver();
    const Observer = layer.ownerDocument.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    let reconciling = false;
    observer = new Observer(() => {
      if (reconciling || !layer.isConnected) return;
      reconciling = true;
      reconcilePresentation(layer, latestPrepared);
      queueMicrotask(() => { reconciling = false; });
    });
    observer.observe(layer, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'data-tone'] });
  }

  return Object.freeze({
    ...base,
    open(args) {
      latestPrepared = null;
      const wrappedAdapter = presentationAdapter(args?.adapter, prepared => {
        latestPrepared = prepared;
      });
      base.open({ ...args, adapter: wrappedAdapter });
      const doc = options.root?.ownerDocument;
      const layer = doc?.querySelector('[data-aura-conversation-workspace]');
      if (!layer) return;
      installStyle(doc);
      humanizeStaticSurface(layer);
      upgradeGoalSelector(layer, wrappedAdapter);
      reconcilePresentation(layer, latestPrepared);
      observePresentation(layer);
    },
    close(args) {
      disconnectObserver();
      latestPrepared = null;
      return base.close(args);
    },
    destroy() {
      disconnectObserver();
      latestPrepared = null;
      return base.destroy();
    },
  });
}

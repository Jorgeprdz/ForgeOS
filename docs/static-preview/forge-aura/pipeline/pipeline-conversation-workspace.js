function e(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function text(value) {
  return String(value ?? '').trim();
}

function displayDate(value, fallback = 'Sin fecha confirmada') {
  const time = Date.parse(value || '');
  if (!Number.isFinite(time)) return fallback;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(time));
}

function allowedGoals(card, options) {
  const available = options?.goals || {};
  const allowed = ['first_contact', 'follow_up', 'reactivation', 'collection', 'application_signature', 'custom'];
  return allowed.filter(key => available[key]).map(key => [key, available[key]]);
}

function defaultGoal(card) {
  if (card?.status === 'referred_new') return 'first_contact';
  if (!card?.latestActivity) return 'reactivation';
  return 'follow_up';
}

function optionHtml(entries, selected) {
  return entries.map(([value, label]) => `<option value="${e(value)}" ${value === selected ? 'selected' : ''}>${e(label)}</option>`).join('');
}

function advisorComponents(value) {
  return String(value || '')
    .split(/\r?\n|\s+\+\s+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function safeConversationError(error, fallback) {
  const code = text(error?.code || error?.message || '');
  if (/AUTH|JWT|SESSION/i.test(code)) return 'Tu sesión cambió o expiró. Inicia sesión nuevamente.';
  if (/FETCH|NETWORK|TIMEOUT|UNAVAILABLE/i.test(code)) return 'La fuente de inteligencia no respondió en este momento. Puedes reintentar.';
  return fallback;
}

function displayValue(value) {
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(' · ');
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, item]) => `${key}: ${displayValue(item)}`).join(' · ');
  }
  return text(value) || 'No disponible';
}

export function createConversationWorkspaceController({
  root,
  windowRef = window,
  globalState,
} = {}) {
  let active = null;

  function close({ restoreFocus = true } = {}) {
    if (!active) return;
    const current = active;
    active = null;
    current.layer.remove();
    current.doc.removeEventListener('keydown', current.keyHandler, true);
    current.doc.documentElement.removeAttribute('data-aura-conversation-open');
    current.doc.body.style.overflow = current.previousOverflow;
    if (restoreFocus && current.trigger?.isConnected) current.trigger.focus();
  }

  function announce(state, message, tone = 'info') {
    const node = state.layer.querySelector('[data-conversation-notice]');
    if (node) {
      node.hidden = !message;
      node.dataset.tone = tone;
      node.textContent = message || '';
    }
    if (!node && message) globalState?.(message, tone === 'error' ? 'error' : 'status');
  }

  function setTab(state, name) {
    state.layer.querySelectorAll('[data-conversation-tab]').forEach(button => {
      const selected = button.dataset.conversationTab === name;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    state.layer.querySelectorAll('[data-conversation-panel]').forEach(panel => {
      panel.hidden = panel.dataset.conversationPanel !== name;
    });
    state.layer.querySelector(`[data-conversation-tab="${CSS.escape(name)}"]`)?.focus();
  }

  function invalidateApproval(state, message = '') {
    state.approval = null;
    const openButton = state.layer.querySelector('[data-open-whatsapp]');
    if (openButton) openButton.disabled = true;
    const approvalLabel = state.layer.querySelector('[data-approval-state]');
    if (approvalLabel) approvalLabel.textContent = message || 'Revisión y aprobación humana requeridas.';
    if (message) announce(state, message, 'warning');
  }

  function approvalFingerprint(state, draft = text(state.layer.querySelector('[data-draft]')?.value)) {
    return JSON.stringify({
      prospectId: text(state.card?.id),
      goal: text(state.layer.querySelector('[data-message-goal]')?.value),
      style: text(state.layer.querySelector('[data-message-style]')?.value),
      components: advisorComponents(state.layer.querySelector('[data-message-components]')?.value),
      draft,
    });
  }

  function clearDraftForCombat(state) {
    state.prepared = null;
    const draft = state.layer.querySelector('[data-draft]');
    const block = state.layer.querySelector('[data-draft-block]');
    if (draft) draft.value = '';
    if (block) block.hidden = true;
    invalidateApproval(state, 'La estrategia cambió. Genera una nueva sugerencia antes de aprobar.');
  }

  function renderCombatResult(state) {
    const combat = state.combat;
    const result = state.layer.querySelector('[data-combat-result]');
    if (!result || !combat) return;
    result.hidden = false;
    result.innerHTML = `
      <dl>
        <div><dt>Clasificación candidata</dt><dd>${e(combat.classification?.type || 'No disponible')}</dd></div>
        <div><dt>Intención candidata</dt><dd>${e(combat.classification?.intent || 'No disponible')}</dd></div>
        <div><dt>Confianza</dt><dd>${e(combat.classification?.confidence ?? 'No disponible')}</dd></div>
        <div><dt>Siguiente movimiento</dt><dd>${e(displayValue(combat.nextBestAction))}</dd></div>
      </dl>
      <div class="aura-combat__guidance">
        <article><strong>Interpretación posible</strong><p>${e(combat.psychology?.psychology || 'No disponible')}</p></article>
        <article><strong>Estrategia NASH</strong><p>${e(combat.psychology?.recommendedStrategy || 'No disponible')}</p></article>
        <article><strong>Riesgo</strong><p>${e(combat.psychology?.risk || 'No disponible')}</p></article>
      </div>
      <p class="aura-conversation__notice">NASH Combat orienta estrategia. No se usa ninguna respuesta final hardcodeada y la objeción escrita aquí no se envía cruda al proveedor de IA.</p>
    `;
    state.layer.querySelector('[data-review-combat]').disabled = false;
    state.layer.querySelector('[data-register-combat]').disabled = true;
  }

  async function generateDraft(state) {
    const button = state.layer.querySelector('[data-generate-draft]');
    const goal = state.layer.querySelector('[data-message-goal]')?.value || 'follow_up';
    const style = state.layer.querySelector('[data-message-style]')?.value || 'professional';
    const components = advisorComponents(state.layer.querySelector('[data-message-components]')?.value);
    if (goal === 'custom' && !components.length) {
      announce(state, 'Describe qué necesitas que incluya el mensaje antes de generar la sugerencia.', 'warning');
      return;
    }
    button.disabled = true;
    button.textContent = 'Generando…';
    invalidateApproval(state);
    announce(state, 'Forge está construyendo el Conversation Brief y preparando una sugerencia.', 'info');
    try {
      const prepared = await state.adapter.prepareMessage(state.card, {
        goal,
        style,
        combat: state.reviewedCombat,
        advisorComponents: components,
      });
      state.prepared = prepared;
      const draft = state.layer.querySelector('[data-draft]');
      const block = state.layer.querySelector('[data-draft-block]');
      const source = state.layer.querySelector('[data-draft-source]');
      const draftText = text(prepared?.candidate?.rawText || prepared?.candidate?.text);
      if (block) block.hidden = false;
      if (block) block.dataset.messageState = draftText
        ? ['SAFETY_REVIEW_REQUIRED', 'BLOCKED'].includes(prepared.status) ? 'HUMAN_EDIT_REQUIRED' : 'MESSAGE_READY'
        : 'CANNOT_GENERATE_RELIABLY';
      if (draft) draft.value = draftText;
      if (draft) draft.placeholder = draftText ? '' : 'Puedes escribir el mensaje manualmente.';
      if (source) source.textContent = prepared.sourceMode === 'AI_RENDERED' ? 'Borrador preparado' : draftText ? 'Borrador de Forge' : 'No se pudo generar';
      const approve = state.layer.querySelector('[data-approve-draft]');
      if (approve) approve.disabled = !draftText;
      if (approve) approve.textContent = ['SAFETY_REVIEW_REQUIRED', 'BLOCKED'].includes(prepared.status) ? 'Volver a validar' : 'Aprobar este texto';
      const combatNote = prepared.combatIncorporated ? ' La estrategia revisada de NASH Combat quedó incorporada al brief gobernado.' : '';
      announce(state, !draftText
        ? text(prepared?.diagnostics?.userExplanation) || 'No se pudo preparar un mensaje utilizable. Completa la información o escribe el mensaje manualmente.'
        : ['SAFETY_REVIEW_REQUIRED', 'BLOCKED'].includes(prepared.status)
          ? 'Este borrador necesita cambios antes de aprobarse.'
          : `Mensaje listo para aprobar.${combatNote}`,
      !draftText ? 'error' : ['SAFETY_REVIEW_REQUIRED', 'BLOCKED'].includes(prepared.status) ? 'warning' : 'success');
    } catch (error) {
      state.prepared = null;
      const code = text(error?.code || error?.message || 'UNKNOWN');
      const notice = state.layer.querySelector('[data-conversation-notice]');
      if (notice) notice.dataset.errorCode = code;
      console.error('AURA_CONVERSATION_DRAFT_FAILED', code);
      announce(state, safeConversationError(error, 'No pudimos preparar la sugerencia. Reintenta sin cerrar este espacio.'), 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Generar sugerencia';
    }
  }

  async function approveDraft(state) {
    const draft = state.layer.querySelector('[data-draft]');
    const button = state.layer.querySelector('[data-approve-draft]');
    const value = text(draft?.value);
    if (!state.prepared || !value) return;
    button.disabled = true;
    try {
      const approval = await state.adapter.approveExactDraft(state.card, state.prepared, value);
      state.approval = approval.approved ? { ...approval, exactFingerprint: approvalFingerprint(state, value) } : null;
      const openButton = state.layer.querySelector('[data-open-whatsapp]');
      openButton.disabled = !approval.approved;
      const label = state.layer.querySelector('[data-approval-state]');
      label.textContent = approval.approved
        ? 'Texto exacto aprobado. WhatsApp está habilitado para apertura manual.'
        : 'El texto no pasó la validación exacta. Revísalo antes de continuar.';
      announce(state, approval.approved ? 'Texto exacto aprobado.' : 'El borrador no pasó la aprobación exacta.', approval.approved ? 'success' : 'error');
    } catch (error) {
      state.approval = null;
      announce(state, `No pudimos aprobar el borrador: ${text(error?.code || error?.message || 'error desconocido')}.`, 'error');
    } finally {
      button.disabled = false;
    }
  }

  async function analyzeCombat(state) {
    const objection = text(state.layer.querySelector('[data-combat-objection]')?.value);
    const button = state.layer.querySelector('[data-analyze-combat]');
    if (!objection) {
      announce(state, 'Escribe la objeción tal como la escuchaste antes de analizar.', 'warning');
      return;
    }
    button.disabled = true;
    button.textContent = 'Analizando…';
    state.combat = null;
    state.reviewedCombat = null;
    try {
      state.combat = await state.adapter.analyzeCombat(state.card, objection);
      renderCombatResult(state);
      announce(state, 'NASH Combat produjo una clasificación candidata. Revísala antes de usarla o registrarla.', 'info');
    } catch (error) {
      announce(state, `No pudimos analizar la objeción: ${text(error?.code || error?.message || 'error desconocido')}.`, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Analizar objeción';
    }
  }

  function reviewCombat(state) {
    if (!state.combat) return;
    try {
      state.reviewedCombat = state.adapter.reviewCombat(state.combat);
      state.layer.querySelector('[data-register-combat]').disabled = false;
      clearDraftForCombat(state);
      announce(state, 'Clasificación revisada. La próxima sugerencia usará esta estrategia sin enviar la objeción cruda a la IA.', 'success');
      setTab(state, 'message');
    } catch (error) {
      announce(state, `No pudimos revisar la clasificación: ${text(error?.code || error?.message)}.`, 'error');
    }
  }

  async function registerCombat(state) {
    if (!state.reviewedCombat) return;
    const button = state.layer.querySelector('[data-register-combat]');
    button.disabled = true;
    try {
      await state.adapter.registerObjection(state.card, state.reviewedCombat);
      button.textContent = 'Objeción registrada';
      announce(state, 'Se registró únicamente la clasificación revisada en Timeline. El texto crudo de la objeción no fue persistido.', 'success');
    } catch (error) {
      button.disabled = false;
      announce(state, `No pudimos registrar la clasificación: ${text(error?.code || error?.message || 'error desconocido')}.`, 'error');
    }
  }

  function openWhatsapp(state) {
    if (!state.approval?.approved || !state.approval.whatsappUrl
      || state.approval.exactFingerprint !== approvalFingerprint(state)) {
      invalidateApproval(state, 'El texto o su objetivo cambió. Requiere una nueva aprobación exacta.');
      return;
    }
    windowRef.open(state.approval.whatsappUrl, '_blank', 'noopener,noreferrer');
    announce(state, 'WhatsApp se abrió manualmente con el texto exacto aprobado. Forge no marcó el mensaje como enviado.', 'info');
  }

  function bind(state) {
    state.layer.querySelectorAll('[data-close-conversation]').forEach(button => button.addEventListener('click', () => close()));
    state.layer.querySelectorAll('[data-conversation-tab]').forEach(button => button.addEventListener('click', () => setTab(state, button.dataset.conversationTab)));
    state.layer.querySelector('[data-generate-draft]').addEventListener('click', () => void generateDraft(state));
    state.layer.querySelector('[data-approve-draft]').addEventListener('click', () => void approveDraft(state));
    state.layer.querySelector('[data-open-whatsapp]').addEventListener('click', () => openWhatsapp(state));
    state.layer.querySelector('[data-analyze-combat]').addEventListener('click', () => void analyzeCombat(state));
    state.layer.querySelector('[data-review-combat]').addEventListener('click', () => reviewCombat(state));
    state.layer.querySelector('[data-register-combat]').addEventListener('click', () => void registerCombat(state));
    state.layer.querySelector('[data-draft]').addEventListener('input', () => {
      const value = text(state.layer.querySelector('[data-draft]')?.value);
      if (!state.prepared && value) state.prepared = { candidate: { rawText: value, text: value, sendsMessage: false }, status: 'HUMAN_EDIT_REQUIRED', sourceMode: 'MANUAL' };
      const approve = state.layer.querySelector('[data-approve-draft]');
      if (approve) approve.disabled = !value;
      const block = state.layer.querySelector('[data-draft-block]');
      if (block) block.dataset.messageState = value ? 'HUMAN_EDIT_REQUIRED' : 'CANNOT_GENERATE_RELIABLY';
      invalidateApproval(state, 'El texto cambió. Requiere una nueva aprobación exacta.');
    });
    ['[data-message-goal]', '[data-message-style]', '[data-message-components]'].forEach(selector => {
      state.layer.querySelector(selector)?.addEventListener('input', () => {
        state.prepared = null;
        const approve = state.layer.querySelector('[data-approve-draft]');
        if (approve) approve.disabled = true;
        invalidateApproval(state, 'El objetivo o los ajustes cambiaron. Prepara y aprueba un nuevo texto.');
      });
      state.layer.querySelector(selector)?.addEventListener('change', () => {
        state.prepared = null;
        const approve = state.layer.querySelector('[data-approve-draft]');
        if (approve) approve.disabled = true;
        invalidateApproval(state, 'El objetivo o los ajustes cambiaron. Prepara y aprueba un nuevo texto.');
      });
    });

    state.keyHandler = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...state.layer.querySelectorAll('button:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && state.doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && state.doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    state.doc.addEventListener('keydown', state.keyHandler, true);
  }

  function open({ card, adapter, trigger }) {
    if (!card || !adapter || !trigger) return;
    close({ restoreFocus: false });
    const doc = root.ownerDocument;
    const options = adapter.messageOptions?.() || { goals: {}, styles: {} };
    const goals = allowedGoals(card, options);
    const initialGoal = goals.some(([key]) => key === defaultGoal(card)) ? defaultGoal(card) : goals[0]?.[0] || 'follow_up';
    const styles = Object.entries(options.styles || {});
    const layer = doc.createElement('div');
    layer.className = 'aura-conversation-layer';
    layer.dataset.auraConversationWorkspace = '011A';
    layer.innerHTML = `
      <button class="aura-conversation-scrim" type="button" data-close-conversation aria-label="Cerrar preparación de mensaje"></button>
      <section class="aura-conversation" role="dialog" aria-modal="true" aria-labelledby="aura-conversation-title">
        <header class="aura-conversation__header">
          <div><p>CONVERSACIÓN</p><h2 id="aura-conversation-title">Preparar mensaje para ${e(card.fullName || 'Prospecto')}</h2></div>
          <button class="aura-conversation__close" type="button" data-close-conversation aria-label="Cerrar">×</button>
        </header>
        <div class="aura-conversation__context" aria-label="Contexto gobernado del prospecto">
          <div class="aura-conversation__fact"><span>Etapa</span><strong>${e(card.stageLabel || card.status || 'No disponible')}</strong></div>
          <div class="aura-conversation__fact"><span>Última actividad</span><strong>${e(card.latestActivity?.label || 'Sin actividad verificada')}</strong></div>
          <div class="aura-conversation__fact"><span>Próximo compromiso</span><strong>${e(card.nextCommitment ? `${card.nextCommitment.type} · ${displayDate(card.nextCommitment.dueAt)}` : 'Sin compromiso confirmado')}</strong></div>
        </div>
        <div class="aura-conversation__tabs" role="tablist" aria-label="Herramientas de conversación">
          <button type="button" role="tab" data-conversation-tab="message" aria-selected="true">Mensaje</button>
          <button type="button" role="tab" data-conversation-tab="combat" aria-selected="false" tabindex="-1">Ayuda con objeciones</button>
        </div>
        <div class="aura-conversation__body">
          <section class="aura-conversation__panel" data-conversation-panel="message" role="tabpanel">
            <div class="aura-conversation__grid">
              <label>Objetivo<select data-message-goal>${optionHtml(goals, initialGoal)}</select></label>
              <label>Tono<select data-message-style>${optionHtml(styles, 'professional')}</select></label>
            </div>
            <label class="aura-conversation__components"><span data-message-components-label>Componentes adicionales (opcional)</span><textarea data-message-components rows="3" maxlength="900" placeholder="Ej. pedir comprobante de pago&#10;recordar fecha límite"></textarea></label>
            <div class="aura-conversation__action-row"><button class="aura-conversation__primary" type="button" data-generate-draft>Generar sugerencia</button></div>
            <div class="aura-conversation__draft" data-draft-block data-message-state="CANNOT_GENERATE_RELIABLY">
              <div class="aura-conversation__draft-header"><strong>Mensaje</strong><span class="aura-conversation__source" data-draft-source></span></div>
              <label>Mensaje editable<textarea data-draft rows="6" aria-label="Borrador editable" placeholder="Prepara un borrador con Forge o escribe el mensaje manualmente."></textarea></label>
              <div class="aura-conversation__action-row"><button class="aura-conversation__secondary" type="button" data-approve-draft disabled>Revisar y aprobar texto exacto</button></div>
              <p class="aura-conversation__notice" data-approval-state>Prepara un borrador o escribe el mensaje. WhatsApp seguirá bloqueado hasta que apruebes el texto exacto.</p>
            </div>
          </section>
          <section class="aura-conversation__panel aura-combat" data-conversation-panel="combat" role="tabpanel" hidden>
            <label>¿Te puso una objeción?<textarea data-combat-objection rows="4" placeholder="Escribe lo que te dijo. Se usa localmente para análisis y no se persiste automáticamente."></textarea></label>
            <div class="aura-conversation__action-row"><button class="aura-conversation__primary" type="button" data-analyze-combat>Analizar objeción</button></div>
            <div class="aura-combat__result" data-combat-result hidden></div>
            <div class="aura-conversation__action-row">
              <button class="aura-conversation__secondary" type="button" data-review-combat disabled>Usar estrategia en mensaje</button>
              <button class="aura-conversation__quiet" type="button" data-register-combat disabled>Registrar clasificación en Timeline</button>
            </div>
          </section>
          <p class="aura-conversation__notice" data-conversation-notice hidden aria-live="polite"></p>
        </div>
        <footer class="aura-conversation__footer">
          <button class="aura-conversation__quiet" type="button" data-close-conversation>Cancelar</button>
          <button class="aura-conversation__primary" type="button" data-open-whatsapp disabled>Abrir en WhatsApp</button>
        </footer>
      </section>
    `;

    const state = {
      layer,
      doc,
      card,
      adapter,
      trigger,
      prepared: null,
      combat: null,
      reviewedCombat: null,
      approval: null,
      previousOverflow: doc.body.style.overflow,
      keyHandler: null,
    };
    active = state;
    doc.body.append(layer);
    doc.body.style.overflow = 'hidden';
    doc.documentElement.setAttribute('data-aura-conversation-open', 'true');
    bind(state);
    const goalSelect = layer.querySelector('[data-message-goal]');
    const componentLabel = layer.querySelector('[data-message-components-label]');
    const syncComponentLabel = () => { if (componentLabel) componentLabel.textContent = goalSelect?.value === 'custom' ? '¿Qué necesitas que incluya el mensaje?' : 'Componentes adicionales (opcional)'; };
    goalSelect?.addEventListener('change', syncComponentLabel);
    syncComponentLabel();
    queueMicrotask(() => layer.querySelector('[data-message-goal]')?.focus());
  }

  function destroy() {
    close({ restoreFocus: false });
  }

  return Object.freeze({ open, close, destroy });
}

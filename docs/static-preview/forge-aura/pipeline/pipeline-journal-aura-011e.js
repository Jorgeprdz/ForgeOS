const INSTALL_KEY = Symbol.for('forge.aura.pipeline.journal.011e');

const EVENT_LABELS = Object.freeze({
  PROSPECT_CREATED: 'Prospecto creado',
  CONTACT_ATTEMPTED: 'Contacto intentado',
  CONVERSATION_RECORDED: 'Conversación registrada',
  APPOINTMENT_SCHEDULED: 'Cita agendada',
  APPOINTMENT_RESCHEDULED: 'Cita reprogramada',
  APPOINTMENT_COMPLETED: 'Cita completada',
  OBJECTION_RECORDED: 'Objeción registrada',
  FOLLOW_UP_PLANNED: 'Seguimiento planeado',
  PROPOSAL_PRESENTED: 'Propuesta presentada',
  DECISION_RECORDED: 'Decisión registrada',
  STAGE_CHANGED: 'Estado actualizado',
  PROSPECT_ARCHIVED: 'Prospecto archivado',
});

function repositoryRootUrl() {
  const sourceLayout = import.meta.url.includes('/docs/static-preview/');
  return new URL(sourceLayout ? '../../../../' : '../../../', import.meta.url);
}

function text(value) {
  return String(value ?? '').trim();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function timeValue(value) {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateLabel(value) {
  if (!timeValue(value)) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function timelineContent(event) {
  return text(event?.payload?.outcome || event?.payload?.decisionCode || event?.payload?.objectionCode || 'Evento productivo confirmado');
}

function mergeHistory(entries, timeline) {
  const notes = (entries || []).map(entry => ({
    kind: 'note',
    id: entry.id,
    occurredAt: entry.createdAt,
    title: entry.captureMethod === 'voice' ? 'Nota dictada' : 'Nota escrita',
    content: entry.content,
  }));
  const events = (timeline || [])
    .filter(event => !text(event.sourceRecordReference).startsWith('JOURNAL:'))
    .map(event => ({
      kind: 'event',
      id: event.id,
      occurredAt: event.occurredAt || event.recordedAt,
      title: EVENT_LABELS[event.eventType] || 'Actividad registrada',
      content: timelineContent(event),
    }));
  return [...notes, ...events].sort((left, right) => timeValue(right.occurredAt) - timeValue(left.occurredAt));
}

function historyHtml(history) {
  if (!history.length) return '<p class="aura-journal-empty">Aún no hay actividad adicional.</p>';
  return `<ol class="aura-journal-history">${history.map(item => `
    <li data-journal-history-kind="${escapeHtml(item.kind)}">
      <header><strong>${escapeHtml(item.title)}</strong><time datetime="${escapeHtml(item.occurredAt || '')}">${escapeHtml(dateLabel(item.occurredAt))}</time></header>
      <p>${escapeHtml(item.content)}</p>
    </li>`).join('')}</ol>`;
}

function userError(error, fallback = 'No pudimos completar la operación.') {
  const code = text(error?.code || error?.message || '');
  if (/AUTH|JWT|SESSION/i.test(code)) return 'Tu sesión cambió o expiró. Inicia sesión nuevamente.';
  if (/NETWORK|FETCH|TIMEOUT/i.test(code)) return 'No pudimos consultar la fuente en este momento. Puedes reintentar sin recargar Forge.';
  if (/JOURNAL.*NOT_DEPLOYED/i.test(code)) return 'La Bitácora todavía no está disponible en este entorno.';
  if (/PERSISTENCE|TIMELINE_LINK/i.test(code)) return 'La nota no quedó confirmada de punta a punta. Conservamos el texto para que puedas reintentar.';
  return fallback;
}

async function loadAuthorities(client) {
  const rootUrl = repositoryRootUrl();
  if (!globalThis.ForgeProspectJournalServiceP7) {
    await import(`${new URL('advisor-os/sales-pipeline/prospect-journal/prospect-journal-service.js', rootUrl).href}?v=forge-aura-live-acceptance-011e`);
  }
  if (!globalThis.ForgeProspectTimelineServiceNFAST08) {
    await import(`${new URL('advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-contract.js', rootUrl).href}?v=forge-aura-live-acceptance-011e`);
    await import(`${new URL('advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js', rootUrl).href}?v=forge-aura-live-acceptance-011e`);
  }
  if (!globalThis.ForgeProspectJournalServiceP7?.create || !globalThis.ForgeProspectTimelineServiceNFAST08?.create) {
    throw Object.assign(new Error('PIPELINE_JOURNAL_AUTHORITIES_UNAVAILABLE'), { code: 'PIPELINE_JOURNAL_AUTHORITIES_UNAVAILABLE' });
  }
  return Object.freeze({
    journal: globalThis.ForgeProspectJournalServiceP7.create(client),
    timeline: globalThis.ForgeProspectTimelineServiceNFAST08.create(client),
  });
}

async function loadInitialContext(client, prospectId) {
  try {
    const result = await client.from('prospects').select('id,full_name,initial_context').eq('id', prospectId).single();
    if (result?.error) return Object.freeze({ fullName: null, initialContext: null });
    return Object.freeze({
      fullName: text(result?.data?.full_name) || null,
      initialContext: text(result?.data?.initial_context) || null,
    });
  } catch {
    return Object.freeze({ fullName: null, initialContext: null });
  }
}

export function installPipelineJournalAura({ documentRef = document, getClient } = {}) {
  if (!documentRef || typeof getClient !== 'function') throw new Error('AURA_JOURNAL_CLIENT_FACTORY_REQUIRED');
  if (documentRef[INSTALL_KEY]) return documentRef[INSTALL_KEY];

  let activeLayer = null;
  let recognition = null;
  let destroyed = false;

  function close({ restore = true } = {}) {
    const trigger = activeLayer?._restoreFocus;
    recognition?.abort?.();
    recognition = null;
    activeLayer?.remove();
    activeLayer = null;
    delete documentRef.documentElement.dataset.auraJournalOpen;
    if (restore) trigger?.focus?.({ preventScroll: true });
  }

  function synchronize() {
    if (destroyed) return;
    documentRef.querySelectorAll('[data-aura-app] [data-record-id] .aura-actions').forEach(actions => {
      if (actions.querySelector('[data-aura-journal-open]')) return;
      const record = actions.closest('[data-record-id]');
      const id = text(record?.dataset.recordId);
      if (!id) return;
      const button = documentRef.createElement('button');
      button.type = 'button';
      button.className = 'aura-journal-action';
      button.dataset.auraJournalOpen = id;
      button.textContent = '▤';
      button.title = 'Bitácora';
      button.setAttribute('aria-label', `Abrir Bitácora de ${text(record.querySelector('h3, [data-label="Prospecto"] strong')?.textContent) || 'prospecto'}`);
      actions.append(button);
    });
  }

  async function open(trigger, prospectId) {
    close({ restore: false });
    const client = await getClient();
    const layer = documentRef.createElement('div');
    layer.className = 'aura-dialog-layer aura-journal-layer';
    layer.dataset.auraJournalLayer = 'true';
    layer._restoreFocus = trigger;
    layer.innerHTML = `
      <button class="aura-scrim" type="button" data-aura-journal-close aria-label="Cerrar Bitácora"></button>
      <section class="aura-dialog aura-journal-dialog" role="dialog" aria-modal="true" aria-labelledby="aura-journal-title" tabindex="-1">
        <header><div><p class="aura-eyebrow">PIPELINE · MEMORIA OPERATIVA</p><h2 id="aura-journal-title">Bitácora</h2></div><button type="button" data-aura-journal-close aria-label="Cerrar">×</button></header>
        <div class="aura-dialog__body" data-aura-journal-body aria-busy="true"><p>Consultando Bitácora y Timeline…</p></div>
      </section>`;
    documentRef.body.append(layer);
    activeLayer = layer;
    documentRef.documentElement.dataset.auraJournalOpen = 'true';
    layer.querySelector('.aura-dialog')?.focus();

    const body = layer.querySelector('[data-aura-journal-body]');
    try {
      const authorities = await loadAuthorities(client);
      const [entriesResult, timelineResult, initial] = await Promise.all([
        authorities.journal.listEntries(prospectId).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
        authorities.timeline.listProspectTimeline(prospectId).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
        loadInitialContext(client, prospectId),
      ]);
      if (activeLayer !== layer) return;
      const entries = entriesResult.ok ? (entriesResult.value || []) : [];
      let currentEntries = entries;
      let currentTimeline = timelineResult.ok ? (timelineResult.value || []) : [];
      const timeline = currentTimeline;
      const record = trigger.closest('[data-record-id]');
      const displayName = initial.fullName || text(record?.querySelector('h3, [data-label="Prospecto"] strong')?.textContent) || 'prospecto';
      const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
      const journalWarning = entriesResult.ok ? '' : '<p class="aura-journal-warning" data-aura-journal-read-warning>No pudimos consultar el historial de Bitácora. Puedes escribir y guardar una nota; el fallo de lectura no bloquea la captura. <button type="button" data-aura-journal-history-retry>Reintentar historial</button></p>';
      const timelineWarning = timelineResult.ok ? '' : '<p class="aura-journal-warning">El Timeline no respondió. Puedes consultar y capturar notas; Forge no lo sustituirá por datos locales.</p>';
      body.setAttribute('aria-busy', 'false');
      body.innerHTML = `
        <section class="aura-journal-context"><h3>Contexto inicial</h3><p>${escapeHtml(initial.initialContext || 'Sin contexto inicial registrado.')}</p></section>
        ${journalWarning}
        ${timelineWarning}
        <form data-aura-journal-form>
          <label><span>Nueva nota</span><textarea name="content" maxlength="4000" required placeholder="Qué ocurrió, qué preocupa al prospecto y cuál es el siguiente paso."></textarea></label>
          <div class="aura-journal-form-actions">
            <button type="button" data-aura-journal-dictate ${SpeechRecognition ? '' : 'disabled'}>${SpeechRecognition ? '🎙 Dictar' : 'Dictado no disponible'}</button>
            <button type="submit" class="aura-primary-action">Guardar nota</button>
          </div>
          <p class="aura-journal-status" data-aura-journal-status role="status" aria-live="polite"></p>
          <p class="aura-journal-error" data-aura-journal-error role="alert" hidden></p>
        </form>
        <section><h3>Historial</h3><div data-aura-journal-history>${historyHtml(mergeHistory(entries, timeline))}</div></section>`;
      layer.querySelector('#aura-journal-title').textContent = `Bitácora de ${displayName}`;
      documentRef.documentElement.dataset.auraJournalState = timelineResult.ok ? 'READY' : 'READY_TIMELINE_DEGRADED';

      const form = body.querySelector('[data-aura-journal-form]');
      const textarea = form.elements.namedItem('content');
      const status = form.querySelector('[data-aura-journal-status]');
      const errorNode = form.querySelector('[data-aura-journal-error]');
      let captureMethod = 'text';

      body.querySelector('[data-aura-journal-history-retry]')?.addEventListener('click', async event => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
          const [entriesRetry, timelineRetry] = await Promise.all([
            authorities.journal.listEntries(prospectId).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
            authorities.timeline.listProspectTimeline(prospectId).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
          ]);
          if (!entriesRetry.ok) {
            status.textContent = 'El historial sigue sin responder. Tu formulario y cualquier texto escrito permanecen disponibles.';
            return;
          }
          currentEntries = entriesRetry.value || [];
          if (timelineRetry.ok) currentTimeline = timelineRetry.value || [];
          body.querySelector('[data-aura-journal-history]').innerHTML = historyHtml(mergeHistory(currentEntries, currentTimeline));
          body.querySelector('[data-aura-journal-read-warning]')?.remove();
          status.textContent = 'Historial actualizado.';
          documentRef.documentElement.dataset.auraJournalState = timelineRetry.ok ? 'READY' : 'READY_TIMELINE_DEGRADED';
        } finally {
          if (button.isConnected) button.disabled = false;
        }
      });

      body.querySelector('[data-aura-journal-dictate]')?.addEventListener('click', event => {
        if (!SpeechRecognition) return;
        recognition?.abort?.();
        recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        event.currentTarget.setAttribute('aria-pressed', 'true');
        status.textContent = 'Escuchando…';
        recognition.onresult = result => {
          const transcript = text(result.results?.[0]?.[0]?.transcript);
          if (transcript) {
            textarea.value = [text(textarea.value), transcript].filter(Boolean).join(' ');
            captureMethod = 'voice';
          }
        };
        recognition.onerror = () => { status.textContent = 'No pudimos usar el dictado. Puedes escribir la nota.'; };
        recognition.onend = () => {
          event.currentTarget.setAttribute('aria-pressed', 'false');
          if (status.textContent === 'Escuchando…') status.textContent = '';
          recognition = null;
        };
        recognition.start();
      });

      form.addEventListener('submit', async event => {
        event.preventDefault();
        const content = text(textarea.value);
        if (!content) return;
        const submit = event.submitter || form.querySelector('[type="submit"]');
        submit.disabled = true;
        errorNode.hidden = true;
        status.textContent = 'Guardando nota…';
        try {
          const entry = await authorities.journal.appendEntry(prospectId, { content, captureMethod });
          const [nextEntriesResult, nextTimelineResult] = await Promise.all([
            authorities.journal.listEntries(prospectId).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
            authorities.timeline.listProspectTimeline(prospectId).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
          ]);

          const nextEntries = nextEntriesResult.ok ? (nextEntriesResult.value || []) : [...currentEntries, entry];
          const nextTimeline = nextTimelineResult.ok ? (nextTimelineResult.value || []) : currentTimeline;
          currentEntries = nextEntries;
          currentTimeline = nextTimeline;
          if (nextTimelineResult.ok) {
            const linked = nextTimeline.some(item => item.eventType === 'CONVERSATION_RECORDED' && item.sourceRecordReference === `JOURNAL:${entry.id}`);
            if (!linked) throw Object.assign(new Error('PROSPECT_JOURNAL_TIMELINE_LINK_MISSING'), { code: 'PROSPECT_JOURNAL_TIMELINE_LINK_MISSING' });
          }

          body.querySelector('[data-aura-journal-history]').innerHTML = historyHtml(mergeHistory(nextEntries, nextTimeline));
          textarea.value = '';
          captureMethod = 'text';
          if (!nextEntriesResult.ok) {
            status.textContent = 'Nota guardada. No pudimos refrescar el historial; la captura confirmada no se convierte en un fallo de escritura.';
            documentRef.documentElement.dataset.auraJournalState = 'WRITE_CONFIRMED_READ_DEGRADED';
          } else if (nextTimelineResult.ok) {
            status.textContent = 'Nota guardada · Timeline confirmado.';
            documentRef.documentElement.dataset.auraJournalState = 'WRITE_CONFIRMED';
            globalThis.dispatchEvent(new CustomEvent('forge:aura-journal-confirmed', { detail: { prospectId, journalEntryId: entry.id, timelineLinked: true } }));
          } else {
            status.textContent = 'Nota guardada en Bitácora. Timeline pendiente de confirmación; puedes reintentar al volver a abrir.';
            documentRef.documentElement.dataset.auraJournalState = 'WRITE_CONFIRMED_TIMELINE_UNVERIFIED';
          }
        } catch (error) {
          errorNode.hidden = false;
          errorNode.textContent = userError(error, 'No pudimos guardar la nota. Tu texto sigue aquí para que puedas reintentar.');
          status.textContent = '';
          documentRef.documentElement.dataset.auraJournalState = 'WRITE_ERROR';
          console.error('AURA_JOURNAL_WRITE_011E_FAILED', text(error?.code || error?.message || 'UNKNOWN'));
        } finally {
          submit.disabled = false;
        }
      });
    } catch (error) {
      if (activeLayer !== layer) return;
      body.setAttribute('aria-busy', 'false');
      const code = text(error?.code || error?.message || 'PIPELINE_JOURNAL_UNAVAILABLE');
      body.innerHTML = `<section class="aura-journal-recovery">
        <h3>No pudimos consultar la Bitácora</h3>
        <p>${escapeHtml(userError(error, 'La fuente de Bitácora no respondió.'))}</p>
        <p>Forge no sustituyó la fuente por notas locales.</p>
        <details><summary>Detalle técnico</summary><code>${escapeHtml(code)}</code></details>
        <div class="aura-journal-recovery__actions">
          <button type="button" data-aura-journal-retry>Reintentar</button>
          <button type="button" data-aura-journal-close>Cerrar</button>
        </div>
      </section>`;
      documentRef.documentElement.dataset.auraJournalState = 'LOAD_ERROR';
    }
  }

  const onDocumentClick = event => {
    const closeTrigger = event.target.closest?.('[data-aura-journal-close]');
    if (closeTrigger && activeLayer?.contains(closeTrigger)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
      return;
    }

    const retry = event.target.closest?.('[data-aura-journal-retry]');
    if (retry && activeLayer?.contains(retry)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const trigger = activeLayer?._restoreFocus;
      const prospectId = text(trigger?.dataset?.auraJournalOpen);
      if (trigger && prospectId) void open(trigger, prospectId);
      return;
    }

    const trigger = event.target.closest?.('[data-aura-journal-open]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void open(trigger, text(trigger.dataset.auraJournalOpen));
  };

  const onDocumentKeydown = event => {
    if (event.key !== 'Escape' || !activeLayer) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close();
  };

  documentRef.addEventListener('click', onDocumentClick, true);
  documentRef.addEventListener('keydown', onDocumentKeydown, true);
  const Observer = documentRef.defaultView?.MutationObserver || globalThis.MutationObserver;
  const observer = Observer ? new Observer(synchronize) : null;
  observer?.observe(documentRef.documentElement, { childList: true, subtree: true });
  synchronize();

  const api = Object.freeze({
    synchronize,
    close,
    destroy() {
      destroyed = true;
      close({ restore: false });
      observer?.disconnect();
      documentRef.removeEventListener('click', onDocumentClick, true);
      documentRef.removeEventListener('keydown', onDocumentKeydown, true);
      delete documentRef[INSTALL_KEY];
    },
  });
  documentRef[INSTALL_KEY] = api;
  return api;
}

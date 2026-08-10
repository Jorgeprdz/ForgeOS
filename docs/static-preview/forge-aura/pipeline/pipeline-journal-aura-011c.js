const INSTALL_KEY = Symbol.for('forge.aura.pipeline.journal.011c');

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

function journalErrorCode(error, fallback = 'PIPELINE_JOURNAL_UNAVAILABLE') {
  return text(error?.code || error?.message || fallback);
}

function journalErrorMessage(error, { write = false } = {}) {
  const code = journalErrorCode(error, write ? 'PROSPECT_JOURNAL_WRITE_FAILED' : 'PIPELINE_JOURNAL_UNAVAILABLE');
  if (/AUTH|JWT|SESSION/i.test(code)) return 'Tu sesión ya no es válida. Vuelve a iniciar sesión y reintenta.';
  if (/AUTHORIT|IMPORT|MODULE|FETCH|NETWORK|PGRST|TIMEOUT/i.test(code)) {
    return write
      ? 'No pudimos confirmar el guardado con la fuente productiva. La nota permanece en el formulario y no se mostrará como guardada.'
      : 'No pudimos conectar con la fuente productiva de Bitácora. Puedes cerrar y seguir usando Pipeline o reintentar.';
  }
  if (/TIMELINE_LINK_MISSING/i.test(code)) {
    return 'La nota no pudo confirmarse contra Timeline. Forge no la marcará como guardada hasta verificar el vínculo.';
  }
  return write
    ? 'No pudimos confirmar el guardado. La nota permanece en el formulario para que puedas reintentar.'
    : 'Bitácora está temporalmente no disponible. Puedes cerrar y seguir usando Pipeline o reintentar.';
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

async function loadAuthorities(client) {
  const rootUrl = repositoryRootUrl();
  if (!globalThis.ForgeProspectJournalServiceP7) {
    await import(`${new URL('advisor-os/sales-pipeline/prospect-journal/prospect-journal-service.js', rootUrl).href}?v=forge-aura-commercial-loop-011c`);
  }
  if (!globalThis.ForgeProspectTimelineServiceNFAST08) {
    await import(`${new URL('advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-contract.js', rootUrl).href}?v=forge-aura-commercial-loop-011c`);
    await import(`${new URL('advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js', rootUrl).href}?v=forge-aura-commercial-loop-011c`);
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

  function close() {
    recognition?.abort?.();
    recognition = null;
    activeLayer?.remove();
    activeLayer = null;
    delete documentRef.documentElement.dataset.auraJournalOpen;
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
      button.textContent = 'Bitácora';
      button.setAttribute('aria-label', `Abrir Bitácora de ${text(record.querySelector('h3, [data-label="Prospecto"] strong')?.textContent) || 'prospecto'}`);
      actions.append(button);
    });
  }

  async function open(trigger, prospectId) {
    close();
    const client = await getClient();
    const layer = documentRef.createElement('div');
    layer.className = 'aura-dialog-layer aura-journal-layer';
    layer.dataset.auraJournalLayer = 'true';
    layer.innerHTML = `
      <button class="aura-scrim" type="button" data-aura-journal-close aria-label="Cerrar Bitácora"></button>
      <section class="aura-dialog aura-journal-dialog" role="dialog" aria-modal="true" aria-labelledby="aura-journal-title" tabindex="-1">
        <header><div><p class="aura-eyebrow">PIPELINE · MEMORIA OPERATIVA</p><h2 id="aura-journal-title">Bitácora</h2></div><button type="button" data-aura-journal-close aria-label="Cerrar">×</button></header>
        <div class="aura-dialog__body" data-aura-journal-body aria-busy="true"><p>Consultando Bitácora y Timeline…</p></div>
      </section>`;
    documentRef.body.append(layer);
    activeLayer = layer;
    documentRef.documentElement.dataset.auraJournalOpen = 'true';

    const closeAndRestore = () => {
      close();
      trigger?.focus?.({ preventScroll: true });
    };

    layer.addEventListener('click', event => {
      if (event.target.closest?.('[data-aura-journal-close]')) {
        event.preventDefault();
        closeAndRestore();
        return;
      }
      if (event.target.closest?.('[data-aura-journal-retry]')) {
        event.preventDefault();
        void open(trigger, prospectId);
      }
    });
    layer.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndRestore();
      }
    });
    layer.querySelector('.aura-dialog')?.focus();

    const body = layer.querySelector('[data-aura-journal-body]');
    try {
      const authorities = await loadAuthorities(client);
      const [entries, timeline, initial] = await Promise.all([
        authorities.journal.listEntries(prospectId),
        authorities.timeline.listProspectTimeline(prospectId),
        loadInitialContext(client, prospectId),
      ]);
      if (activeLayer !== layer) return;
      const record = trigger.closest('[data-record-id]');
      const displayName = initial.fullName || text(record?.querySelector('h3, [data-label="Prospecto"] strong')?.textContent) || 'prospecto';
      const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
      body.setAttribute('aria-busy', 'false');
      body.innerHTML = `
        <section class="aura-journal-context"><h3>Contexto inicial</h3><p>${escapeHtml(initial.initialContext || 'Sin contexto inicial registrado.')}</p></section>
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
      documentRef.documentElement.dataset.auraJournalState = 'READY';

      const form = body.querySelector('[data-aura-journal-form]');
      const textarea = form.elements.namedItem('content');
      const status = form.querySelector('[data-aura-journal-status]');
      const errorNode = form.querySelector('[data-aura-journal-error]');
      let captureMethod = 'text';

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
        recognition.onend = () => { event.currentTarget.setAttribute('aria-pressed', 'false'); if (status.textContent === 'Escuchando…') status.textContent = ''; recognition = null; };
        recognition.start();
      });

      form.addEventListener('submit', async event => {
        event.preventDefault();
        const content = text(textarea.value);
        if (!content) return;
        const submit = event.submitter;
        submit.disabled = true;
        errorNode.hidden = true;
        errorNode.textContent = '';
        status.textContent = 'Guardando y confirmando Timeline…';
        try {
          const entry = await authorities.journal.appendEntry(prospectId, { content, captureMethod });
          const [nextEntries, nextTimeline] = await Promise.all([
            authorities.journal.listEntries(prospectId),
            authorities.timeline.listProspectTimeline(prospectId),
          ]);
          const linked = nextTimeline.some(item => item.eventType === 'CONVERSATION_RECORDED' && item.sourceRecordReference === `JOURNAL:${entry.id}`);
          if (!linked) throw Object.assign(new Error('PROSPECT_JOURNAL_TIMELINE_LINK_MISSING'), { code: 'PROSPECT_JOURNAL_TIMELINE_LINK_MISSING' });
          body.querySelector('[data-aura-journal-history]').innerHTML = historyHtml(mergeHistory(nextEntries, nextTimeline));
          textarea.value = '';
          captureMethod = 'text';
          status.textContent = 'Nota guardada · Timeline confirmado.';
          documentRef.documentElement.dataset.auraJournalState = 'WRITE_CONFIRMED';
          globalThis.dispatchEvent(new CustomEvent('forge:aura-journal-confirmed', { detail: { prospectId, journalEntryId: entry.id, timelineLinked: true } }));
        } catch (error) {
          const code = journalErrorCode(error, 'PROSPECT_JOURNAL_WRITE_FAILED');
          errorNode.hidden = false;
          errorNode.innerHTML = `${escapeHtml(journalErrorMessage(error, { write: true }))}<br><small>${escapeHtml(code)}</small>`;
          status.textContent = '';
          documentRef.documentElement.dataset.auraJournalState = 'ERROR';
        } finally {
          submit.disabled = false;
        }
      });
    } catch (error) {
      if (activeLayer !== layer) return;
      const code = journalErrorCode(error);
      body.setAttribute('aria-busy', 'false');
      body.innerHTML = `
        <section class="aura-journal-recovery" role="alert">
          <div>
            <h3>Bitácora no disponible por ahora</h3>
            <p>${escapeHtml(journalErrorMessage(error))}</p>
          </div>
          <small data-aura-journal-error-code>${escapeHtml(code)}</small>
          <p>Forge no sustituyó la fuente por notas locales ni marcó nada como guardado.</p>
          <div class="aura-journal-recovery__actions">
            <button type="button" data-aura-journal-retry>Reintentar</button>
            <button type="button" data-aura-journal-close>Cerrar</button>
          </div>
        </section>`;
      documentRef.documentElement.dataset.auraJournalState = 'ERROR';
      body.querySelector('[data-aura-journal-retry]')?.focus();
    }
  }

  const onClick = event => {
    const trigger = event.target.closest?.('[data-aura-journal-open]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void open(trigger, text(trigger.dataset.auraJournalOpen));
  };

  documentRef.addEventListener('click', onClick, true);
  const Observer = documentRef.defaultView?.MutationObserver || globalThis.MutationObserver;
  const observer = Observer ? new Observer(synchronize) : null;
  observer?.observe(documentRef.documentElement, { childList: true, subtree: true });
  synchronize();

  const api = Object.freeze({
    synchronize,
    destroy() {
      destroyed = true;
      close();
      observer?.disconnect();
      documentRef.removeEventListener('click', onClick, true);
      delete documentRef[INSTALL_KEY];
    },
  });
  documentRef[INSTALL_KEY] = api;
  return api;
}

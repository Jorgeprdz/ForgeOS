function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function money(item) {
  const amount = item.evidenceClaim?.amount;
  const currency = item.evidenceClaim?.currency;
  if (amount === null || amount === undefined) return 'Monto no confirmado';
  return `${currency || 'MONEDA DESCONOCIDA'} ${Number(amount).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusLabel(status) {
  const labels = {
    received: 'Evidencia recibida',
    matched: 'Coincidencia propuesta',
    review_required: 'Revisión requerida',
    information_requested: 'Información solicitada',
    rejected: 'Evidencia rechazada',
    confirmed: 'Confirmación humana registrada',
    superseded: 'Duplicado / sustituido',
    confirmed_handoff_recorded: 'Hecho entregado a autoridad canónica',
  };
  return labels[status] || String(status || 'Estado desconocido');
}

function actionButton(item, action, label) {
  if (!item.allowedActions?.includes(action)) return '';
  return `<button type="button" class="glass-button" data-economic-action="${escapeHTML(action)}" data-economic-evidence="${escapeHTML(item.evidenceId)}">${escapeHTML(label)}</button>`;
}

function card(item) {
  const contradictions = item.systemKnowledge?.contradictions || [];
  const missingFields = item.systemKnowledge?.missingFields || [];
  const decision = item.humanDecision;
  const handoff = item.canonicalHandoff;

  return `
    <article class="glass-widget" data-economic-connection-card="${escapeHTML(item.evidenceId)}" style="padding:14px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <div style="font-size:10px;font-weight:900;color:var(--text-secondary);text-transform:uppercase;">${escapeHTML(statusLabel(item.status))}</div>
          <div style="font-size:17px;font-weight:850;margin-top:4px;">${escapeHTML(money(item))}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:3px;">${escapeHTML(item.evidenceClaim?.paymentDate || 'Fecha no confirmada')} · ${escapeHTML(item.evidenceClaim?.sourceType || 'fuente desconocida')}</div>
        </div>
        <span style="font-size:9px;font-weight:900;padding:5px 8px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">SOLO PROYECCIÓN</span>
      </div>

      <div style="margin-top:12px;font-size:12px;line-height:1.45;">
        <strong>La evidencia afirma:</strong> póliza ${escapeHTML(item.evidenceClaim?.policyReference || 'sin referencia')}.
        Todavía no es verdad financiera por sí sola.
      </div>

      <div style="margin-top:8px;font-size:12px;line-height:1.45;">
        <strong>El sistema sabe:</strong> ${escapeHTML(item.systemKnowledge?.status || 'sin match todavía')}.
      </div>

      ${contradictions.length ? `<div style="margin-top:7px;font-size:11px;color:var(--text-secondary);"><strong>Contradicciones:</strong> ${escapeHTML(contradictions.join(', '))}</div>` : ''}
      ${missingFields.length ? `<div style="margin-top:7px;font-size:11px;color:var(--text-secondary);"><strong>Falta:</strong> ${escapeHTML(missingFields.join(', '))}</div>` : ''}
      ${decision ? `<div style="margin-top:8px;font-size:11px;"><strong>Decisión humana:</strong> ${escapeHTML(decision.decision)} · ${escapeHTML(decision.reason)}</div>` : ''}
      ${handoff ? `<div style="margin-top:8px;font-size:11px;"><strong>Handoff:</strong> ${escapeHTML(handoff.status)} · owner ${escapeHTML(handoff.truthOwner)}</div>` : ''}

      <div style="margin-top:10px;font-size:10px;color:var(--text-secondary);">
        Verdad actual: ${escapeHTML(item.truthOwner)}. Cartera no edita el ledger ni calcula comisiones.
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;">
        ${actionButton(item, 'review', 'Revisar')}
        ${actionButton(item, 'confirm', 'Confirmar')}
        ${actionButton(item, 'request_information', 'Pedir información')}
        ${actionButton(item, 'correct_match', 'Corregir match')}
        ${actionButton(item, 'reject', 'Rechazar')}
      </div>
      <div data-economic-action-state="${escapeHTML(item.evidenceId)}" aria-live="polite" style="margin-top:8px;font-size:10px;color:var(--text-secondary);"></div>
    </article>
  `;
}

export function renderCartera080EconomicConnection({
  status = 'IDLE',
  items = [],
  errorCode = null,
} = {}) {
  if (status === 'LOADING') {
    return '<div class="glass-widget" data-cartera-economic-connection-loading style="padding:16px;">Cargando conexión económica…</div>';
  }
  if (status === 'ERROR') {
    return `<div class="glass-widget" data-cartera-economic-connection-error style="padding:16px;">No se pudo cargar Conexión Económica: ${escapeHTML(errorCode || 'UNKNOWN')}</div>`;
  }
  if (status !== 'READY') return '';

  return `
    <section class="glass-widget" data-cartera-economic-connection style="padding:16px;margin-bottom:18px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <div style="font-size:10px;font-weight:900;color:var(--text-secondary);">CONEXIÓN ECONÓMICA</div>
          <h3 style="margin:4px 0 0;font-size:18px;">Evidencia, revisión y verdad</h3>
          <p style="margin:6px 0 0;font-size:11px;color:var(--text-secondary);">
            Correo, recibos y archivos aportan evidencia. La decisión humana habilita el handoff; Cartera no se vuelve ledger.
          </p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:14px;">
        ${items.length ? items.map(card).join('') : '<div style="font-size:12px;color:var(--text-secondary);">No hay evidencia económica pendiente.</div>'}
      </div>
      <div style="margin-top:12px;font-size:10px;color:var(--text-secondary);">
        Sin lectura automática de Gmail · sin confirmación automática · sin cálculo de comisión · sin mutación de ledger.
      </div>
    </section>
  `;
}

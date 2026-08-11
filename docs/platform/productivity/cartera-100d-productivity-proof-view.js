const CATEGORY_LABELS = Object.freeze({
  WORK_REDUCTION: 'Trabajo administrativo',
  INCOME_PROTECTION: 'Protección de ingreso',
  GROWTH: 'Crecimiento responsable',
  PRODUCTIVITY: 'Productividad observable',
});

const IMPORTANT_METRICS = Object.freeze({
  WORK_REDUCTION: [
    'POLICIES_IMPORTED_AUTOMATICALLY',
    'WORK_MINUTES_AVOIDED',
    'IDENTITY_DUPLICATES_PREVENTED',
    'PAYMENT_EMAILS_DETECTED',
  ],
  INCOME_PROTECTION: [
    'PAYMENTS_CONFIRMED_BEFORE_RISK',
    'RENEWALS_ATTENDED',
    'POSSIBLE_LAPSES_SURFACED',
    'COMMISSION_DISCREPANCIES_DETECTED',
  ],
  GROWTH: [
    'SECOND_POLICY_REVIEWS',
    'RELATIONSHIP_REVIEWS_COMPLETED',
    'CONSENTED_REFERRALS_OBTAINED',
    'OPPORTUNITIES_RETURNED_TO_PIPELINE',
  ],
  PRODUCTIVITY: [
    'ACCEPTED_RECOMMENDATIONS',
    'COMPLETED_MINIMUM_USEFUL_ACTIONS',
    'CONFIRMED_PRODUCTION_COUNT',
    'ADVISOR_WORK_MINUTES',
  ],
});

const STATE_LABELS = Object.freeze({
  KNOWN: 'Con evidencia',
  ZERO: 'Cero confirmado',
  UNKNOWN: 'Desconocido',
  MISSING: 'Sin fuente',
  STALE: 'Desactualizado',
  INCOMPLETE: 'Periodo incompleto',
  CONFLICTING: 'En conflicto',
});

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatNumber(value) {
  return Number(value).toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

function metricValue(metric) {
  if (!['KNOWN', 'ZERO', 'STALE', 'INCOMPLETE', 'CONFLICTING'].includes(metric.state)) return '—';
  if (metric.unit === 'MINUTES') {
    if (metric.metricKey === 'ADVISOR_WORK_MINUTES') return `${formatNumber(metric.value / 60)} h`;
    return `${formatNumber(metric.value)} min`;
  }
  if (metric.unit === 'SECONDS') return `${formatNumber(metric.value)} s`;
  if (metric.unit === 'CURRENCY') {
    return metric.currency
      ? `${formatNumber(metric.value)} ${escapeHTML(metric.currency)}`
      : 'Monedas incompatibles';
  }
  return formatNumber(metric.value);
}

function metricRow(metric) {
  return `
    <div data-productivity-metric="${escapeHTML(metric.metricKey)}" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:9px 0;border-bottom:1px solid var(--outline-variant,rgba(255,255,255,.08));">
      <div>
        <div style="font-size:11px;font-weight:750;line-height:1.3;">${escapeHTML(metric.label)}</div>
        <div style="font-size:9px;color:var(--text-secondary);margin-top:3px;">${escapeHTML(STATE_LABELS[metric.state] || metric.state)} · ${escapeHTML(metric.sourceAuthority)}</div>
        ${metric.limitation ? `<div style="font-size:9px;color:var(--text-secondary);margin-top:3px;line-height:1.35;">${escapeHTML(metric.limitation)}</div>` : ''}
      </div>
      <div style="font-size:15px;font-weight:900;white-space:nowrap;">${metricValue(metric)}</div>
    </div>
  `;
}

function categoryCard(proof, category) {
  const metrics = IMPORTANT_METRICS[category].map(key => proof.metrics[key]);
  const connected = metrics.filter(metric => !['MISSING', 'UNKNOWN'].includes(metric.state)).length;
  return `
    <article class="glass-widget" data-productivity-category="${category}" style="padding:14px;">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
        <div style="font-size:12px;font-weight:900;">${escapeHTML(CATEGORY_LABELS[category])}</div>
        <span style="font-size:9px;color:var(--text-secondary);">${connected}/${metrics.length} con fuente</span>
      </div>
      <div style="margin-top:7px;">${metrics.map(metricRow).join('')}</div>
    </article>
  `;
}

function derivedCard(proof) {
  const entries = [
    proof.derived.averagePolicyReviewMinutes,
    proof.derived.productionPerAdvisorHour,
    proof.derived.responseRate,
    proof.derived.conversionRate,
    proof.derived.averageSignalToActionSeconds,
  ];
  const format = entry => {
    if (!['KNOWN', 'ZERO'].includes(entry.state)) return '—';
    if (entry.unit === 'RATIO') return `${formatNumber(entry.value * 100)}%`;
    if (entry.unit === 'COUNT_PER_HOUR') return `${formatNumber(entry.value)}/h`;
    if (entry.unit === 'MINUTES_PER_POLICY') return `${formatNumber(entry.value)} min`;
    if (entry.unit === 'SECONDS_PER_ACTION') return `${formatNumber(entry.value)} s`;
    return formatNumber(entry.value);
  };
  return `
    <article class="glass-widget" data-productivity-derived style="padding:14px;">
      <div style="font-size:12px;font-weight:900;">Ratios sólo cuando los denominadores existen</div>
      <div style="margin-top:8px;">
        ${entries.map(entry => `
          <div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;font-size:10px;border-bottom:1px solid var(--outline-variant,rgba(255,255,255,.08));">
            <span>${escapeHTML(entry.label)}</span>
            <strong>${format(entry)}</strong>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

function feedbackButtons(item) {
  const selected = item.feedback || 'UNSET';
  return `
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:9px;">
      <button type="button" class="glass-button" data-productivity-feedback="USEFUL" data-productivity-recommendation="${escapeHTML(item.recommendationReference)}" ${selected === 'USEFUL' ? 'aria-pressed="true"' : ''}>Me ayudó</button>
      <button type="button" class="glass-button" data-productivity-feedback="NOT_USEFUL" data-productivity-recommendation="${escapeHTML(item.recommendationReference)}" ${selected === 'NOT_USEFUL' ? 'aria-pressed="true"' : ''}>No me ayudó</button>
      <button type="button" class="glass-button" data-productivity-feedback="INDEPENDENT" data-productivity-recommendation="${escapeHTML(item.recommendationReference)}" ${selected === 'INDEPENDENT' ? 'aria-pressed="true"' : ''}>Pasó por otra razón</button>
    </div>
  `;
}

function learningCard(proof) {
  return `
    <article class="glass-widget" data-productivity-learning style="padding:14px;">
      <div style="font-size:12px;font-weight:900;">Aprendizaje con tu control</div>
      <p style="font-size:10px;color:var(--text-secondary);line-height:1.4;margin:5px 0 10px;">
        Forge aprende utilidad sólo con retroalimentación explícita. El silencio no es permiso y una acción cercana no prueba causalidad.
      </p>
      ${proof.recommendations.length ? proof.recommendations.map(item => `
        <div data-productivity-recommendation-card="${escapeHTML(item.recommendationReference)}" style="padding:10px 0;border-top:1px solid var(--outline-variant,rgba(255,255,255,.08));">
          <div style="font-size:11px;font-weight:800;">${escapeHTML(item.recommendationClass.replaceAll('_', ' '))}</div>
          <div style="font-size:9px;color:var(--text-secondary);margin-top:3px;overflow-wrap:anywhere;">${escapeHTML(item.sourceAuthority)} · ${escapeHTML(item.recommendationReference)}</div>
          ${feedbackButtons(item)}
          <div data-productivity-feedback-state="${escapeHTML(item.recommendationReference)}" aria-live="polite" style="font-size:9px;color:var(--text-secondary);margin-top:5px;">${item.feedback === 'UNSET' ? '' : `Retroalimentación actual: ${escapeHTML(item.feedback)}`}</div>
        </div>
      `).join('') : '<div style="font-size:10px;color:var(--text-secondary);">Todavía no hay recomendaciones aceptadas instrumentadas en este periodo.</div>'}
    </article>
  `;
}

function sourceNotice(proof) {
  const disconnected = Object.entries(proof.sourceState || {})
    .filter(([, state]) => ['NOT_CONNECTED', 'PARTIAL', 'UNAVAILABLE'].includes(state));
  if (!disconnected.length) return '';
  return `
    <div class="glass-widget" data-productivity-source-notice style="padding:10px;margin-top:12px;font-size:10px;color:var(--text-secondary);line-height:1.4;">
      Fuentes todavía incompletas: ${disconnected.map(([name, state]) => `${escapeHTML(name)} (${escapeHTML(state)})`).join(', ')}. No se convirtieron en cero.
    </div>
  `;
}

export function renderCartera100ProductivityProof({
  status = 'IDLE',
  proof = null,
  errorCode = null,
  feedbackStatus = null,
} = {}) {
  if (status === 'LOADING') {
    return '<div class="glass-widget" data-cartera-productivity-loading style="padding:16px;">Reconstruyendo evidencia de productividad…</div>';
  }
  if (status === 'ERROR') {
    return `<div class="glass-widget" data-cartera-productivity-error style="padding:16px;">No se pudo construir la prueba de productividad: ${escapeHTML(errorCode || 'UNKNOWN')}</div>`;
  }
  if (status !== 'READY' || !proof) return '';

  return `
    <section class="glass-widget" data-cartera-productivity-proof style="padding:16px;margin-bottom:18px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <div style="font-size:10px;font-weight:900;color:var(--text-secondary);">PRODUCTIVITY PROOF</div>
          <h3 style="margin:4px 0 0;font-size:18px;">Más valor con el mismo tiempo — cuando la evidencia lo demuestra</h3>
          <p style="margin:7px 0 0;font-size:11px;line-height:1.45;">${escapeHTML(proof.statement.text)}</p>
          <p style="margin:5px 0 0;font-size:9px;color:var(--text-secondary);">${escapeHTML(proof.period.startDate)} → ${escapeHTML(proof.period.endDate)} · ${escapeHTML(proof.period.timeZone)}</p>
        </div>
        <button type="button" class="glass-button" data-productivity-refresh>Actualizar</button>
      </div>
      ${sourceNotice(proof)}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:14px;">
        ${categoryCard(proof, 'WORK_REDUCTION')}
        ${categoryCard(proof, 'INCOME_PROTECTION')}
        ${categoryCard(proof, 'GROWTH')}
        ${categoryCard(proof, 'PRODUCTIVITY')}
        ${derivedCard(proof)}
        ${learningCard(proof)}
      </div>
      <div data-productivity-global-feedback-state aria-live="polite" style="font-size:9px;color:var(--text-secondary);margin-top:10px;">${escapeHTML(feedbackStatus || '')}</div>
      <div style="font-size:10px;color:var(--text-secondary);line-height:1.45;margin-top:10px;">
        Esto no es un score, ranking, evaluación humana ni mecanismo de presión. Actividad no equivale automáticamente a progreso, calidad, valor o causalidad.
      </div>
    </section>
  `;
}

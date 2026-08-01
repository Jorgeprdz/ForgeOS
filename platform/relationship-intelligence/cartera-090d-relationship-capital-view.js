const LABELS = Object.freeze({
  RELATIONSHIP_CONTINUITY: 'Continuidad relacional',
  INTRODUCTION_CONTEXT: 'Contexto de introducción',
  CENTER_OF_INFLUENCE_CONTEXT: 'Centro de influencia — revisión',
  PROFESSIONAL_NETWORK_CONTEXT: 'Red profesional',
});

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function evidenceList(item) {
  return item.evidence.map(entry => `
    <li>${escapeHTML(entry.authority)} · ${escapeHTML(entry.reference)}</li>
  `).join('');
}

function card(item) {
  return `
    <article class="glass-widget" data-relationship-capital-card="${escapeHTML(item.capitalReference)}" style="padding:14px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <div style="font-size:10px;font-weight:900;color:var(--text-secondary);text-transform:uppercase;">
            ${escapeHTML(LABELS[item.capitalClass] || item.capitalClass)}
          </div>
          <div style="font-size:17px;font-weight:850;margin-top:4px;">${escapeHTML(item.displayName)}</div>
        </div>
        <span style="font-size:9px;font-weight:900;padding:5px 8px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">
          SIN SCORE
        </span>
      </div>
      <div style="margin-top:10px;font-size:12px;line-height:1.45;"><strong>Por qué esta relación:</strong> ${escapeHTML(item.whyThisRelationship)}</div>
      <div style="margin-top:7px;font-size:12px;line-height:1.45;"><strong>Por qué ahora:</strong> ${escapeHTML(item.whyNow)}</div>
      <div style="margin-top:7px;font-size:11px;line-height:1.45;color:var(--text-secondary);"><strong>Incertidumbre:</strong> ${escapeHTML(item.uncertainty)}</div>
      <div style="margin-top:7px;font-size:11px;line-height:1.45;"><strong>Acción mínima:</strong> ${escapeHTML(item.smallestUsefulAction)}</div>
      <details style="margin-top:10px;">
        <summary style="font-size:11px;font-weight:800;cursor:pointer;">Ver evidencia y confirmación requerida</summary>
        <div style="font-size:10px;margin-top:8px;">${escapeHTML(item.advisorMustConfirm)}</div>
        <ul style="font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">${evidenceList(item)}</ul>
      </details>
      <button type="button" class="glass-button" data-relationship-capital-review="${escapeHTML(item.capitalReference)}" style="width:100%;min-height:42px;margin-top:12px;">
        Preparar revisión
      </button>
      <div data-relationship-capital-review-state="${escapeHTML(item.capitalReference)}" aria-live="polite" style="margin-top:7px;font-size:10px;color:var(--text-secondary);"></div>
    </article>
  `;
}

function sourceNotice(capital) {
  const memoryState = capital.sourceState?.relationshipMemory;
  if (!['PARTIAL', 'UNAVAILABLE'].includes(memoryState)) return '';
  return `
    <div class="glass-widget" data-relationship-capital-source-warning style="padding:11px;margin-top:12px;font-size:11px;color:var(--text-secondary);">
      Parte del contexto de memoria relacional no está disponible. No se sustituyó con ceros, inferencias ni relaciones inventadas.
    </div>
  `;
}

export function renderCartera090RelationshipCapital({
  status = 'IDLE',
  capital = null,
  errorCode = null,
} = {}) {
  if (status === 'LOADING') {
    return '<div class="glass-widget" data-cartera-relationship-capital-loading style="padding:16px;">Reconstruyendo capital relacional con evidencia…</div>';
  }
  if (status === 'ERROR') {
    return `<div class="glass-widget" data-cartera-relationship-capital-error style="padding:16px;">No se pudo reconstruir Capital Relacional: ${escapeHTML(errorCode || 'UNKNOWN')}</div>`;
  }
  if (status !== 'READY' || !capital) return '';

  return `
    <section class="glass-widget" data-cartera-relationship-capital style="padding:16px;margin-bottom:18px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <div style="font-size:10px;font-weight:900;color:var(--text-secondary);">CAPITAL RELACIONAL</div>
          <h3 style="margin:4px 0 0;font-size:18px;">Tu red, sin convertir confianza en palanca</h3>
          <p style="margin:6px 0 0;font-size:11px;color:var(--text-secondary);">
            Contexto confirmado, hipótesis visibles y pequeñas revisiones útiles. No hay score de influencia ni prioridad comercial oculta.
          </p>
        </div>
        <button type="button" class="glass-button" data-relationship-capital-refresh>Actualizar</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:13px;font-size:10px;color:var(--text-secondary);">
        <span>${capital.summary.confirmedEdgeCount} relaciones confirmadas</span>
        <span>·</span>
        <span>${capital.summary.hypothesisCount} hipótesis a revisar</span>
        <span>·</span>
        <span>${capital.summary.reviewItemCount} revisiones posibles</span>
      </div>
      ${sourceNotice(capital)}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:14px;">
        ${capital.items.length ? capital.items.map(card).join('') : '<div style="font-size:12px;color:var(--text-secondary);">No hay relaciones con evidencia suficiente para una revisión de capital relacional.</div>'}
      </div>
      <div style="margin-top:12px;font-size:10px;color:var(--text-secondary);">
        No modifica el grafo, no pide referidos, no contacta personas, no crea tareas, calendarios u oportunidades y no decide prioridad NBA.
      </div>
    </section>
  `;
}

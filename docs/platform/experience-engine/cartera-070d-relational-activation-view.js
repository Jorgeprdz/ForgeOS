const LABELS = Object.freeze({
    CONFIRM_PAYMENT: 'Confirmar pago',
    PREPARE_RENEWAL: 'Preparar renovación',
    SCHEDULE_REVIEW: 'Programar revisión',
    RESOLVE_MISSING_CONTEXT: 'Completar contexto',
    REQUEST_DOCUMENTATION: 'Solicitar documentación',
    RECOVER_RELATIONSHIP: 'Recuperar relación',
    REVIEW_SECOND_POLICY: 'Revisar segunda protección',
    STRENGTHEN_CENTER_OF_INFLUENCE: 'Fortalecer centro de influencia',
    THANK_REFERRER: 'Agradecer referencia',
    COMPLETE_SERVICE_COMMITMENT: 'Cumplir compromiso de servicio',
});

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function cardView(item) {
    const evidence = item.evidence.map(entry => `
        <li>${escapeHTML(entry.authority)} · ${escapeHTML(entry.reference)}</li>
    `).join('');
    return `
        <article class="glass-widget" data-activation-card="${escapeHTML(item.actionReference)}" style="padding:14px;">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                <div>
                    <div style="font-size:10px;font-weight:900;color:var(--text-secondary);text-transform:uppercase;">
                        ${escapeHTML(LABELS[item.actionClass] || item.actionLabel)}
                    </div>
                    <div style="font-size:16px;font-weight:850;margin-top:4px;">${escapeHTML(item.displayName)}</div>
                </div>
                <span style="font-size:9px;font-weight:900;padding:5px 8px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">
                    ${item.estimatedMinutes} MIN
                </span>
            </div>
            <div style="margin-top:10px;font-size:12px;line-height:1.45;"><strong>Por qué ahora:</strong> ${escapeHTML(item.whyNow)}</div>
            <div style="margin-top:7px;font-size:12px;line-height:1.45;"><strong>Acción mínima:</strong> ${escapeHTML(item.smallestUsefulAction)}</div>
            <div style="margin-top:7px;font-size:11px;line-height:1.45;color:var(--text-secondary);"><strong>Incertidumbre:</strong> ${escapeHTML(item.uncertainty)}</div>
            <details style="margin-top:10px;">
                <summary style="font-size:11px;font-weight:800;cursor:pointer;">Ver evidencia y confirmación requerida</summary>
                <div style="font-size:10px;margin-top:8px;">${escapeHTML(item.advisorMustConfirm)}</div>
                <ul style="font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">${evidence}</ul>
            </details>
            <button type="button" class="glass-button" data-activation-prepare="${escapeHTML(item.actionReference)}" style="width:100%;min-height:42px;margin-top:12px;">
                Preparar acción
            </button>
            <div data-activation-review-state="${escapeHTML(item.actionReference)}" aria-live="polite" style="margin-top:7px;font-size:10px;color:var(--text-secondary);"></div>
        </article>
    `;
}

export function renderCartera070RelationalActivation({
    status = 'IDLE',
    deck = null,
    availableMinutes = 60,
    errorCode = null,
} = {}) {
    if (status === 'LOADING') return '<div class="glass-widget" style="padding:16px;">Preparando un bloque pequeño de acciones útiles…</div>';
    if (status === 'ERROR') return `<div class="glass-widget" style="padding:16px;">No se pudo preparar la activación relacional: ${escapeHTML(errorCode || 'UNKNOWN')}</div>`;
    if (status !== 'READY' || !deck) return '';

    const capacityButtons = [30, 60, 90].map(minutes => `
        <button type="button" class="glass-button" data-activation-capacity="${minutes}" aria-pressed="${availableMinutes === minutes}">
            ${minutes} min
        </button>
    `).join('');

    return `
        <section class="glass-widget" data-cartera-relational-activation style="padding:16px;margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
                <div>
                    <div style="font-size:10px;font-weight:900;color:var(--text-secondary);">ACTIVACIÓN RELACIONAL</div>
                    <h3 style="margin:4px 0 0;font-size:18px;">Tu siguiente bloque útil</h3>
                    <p style="margin:6px 0 0;font-size:11px;color:var(--text-secondary);">
                        Pocas acciones con evidencia. La secuencia ajusta capacidad; no decide la prioridad final de NBA.
                    </p>
                </div>
                <button type="button" class="glass-button" data-activation-refresh>Actualizar</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:13px;">${capacityButtons}</div>
            <div style="margin-top:10px;font-size:10px;color:var(--text-secondary);">
                ${deck.summary.selectedCards} acciones · ${deck.summary.selectedMinutes} min · ${deck.summary.capacityRemaining} min libres
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px;margin-top:14px;">
                ${deck.items.length ? deck.items.map(cardView).join('') : '<div style="font-size:12px;color:var(--text-secondary);">No hay acciones con evidencia suficiente para este bloque.</div>'}
            </div>
            <div style="margin-top:12px;font-size:10px;color:var(--text-secondary);">
                No envía mensajes, no llama, no crea tareas, calendarios u oportunidades, no pide referidos y no usa puntos, rachas, premios variables ni actividad artificial.
            </div>
        </section>
    `;
}

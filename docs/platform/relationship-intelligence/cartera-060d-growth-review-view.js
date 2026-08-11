const LABELS = Object.freeze({
    SECOND_POLICY_REVIEW: 'Segunda protección',
    PROTECTION_REVIEW: 'Revisión de protección',
    REFERRAL_RELATIONSHIP: 'Relación de referidos',
    CENTER_OF_INFLUENCE: 'Centro de influencia',
});

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function itemCard(item) {
    const evidence = item.evidence.map(e => `
        <li>${escapeHTML(e.authority)} · ${escapeHTML(e.reference)}</li>
    `).join('');
    return `
        <article class="glass-widget" data-growth-candidate="${escapeHTML(item.candidateReference)}" style="padding:14px;">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                <div>
                    <div style="font-size:10px;font-weight:900;color:var(--text-secondary);text-transform:uppercase;">
                        ${escapeHTML(LABELS[item.growthClass] || item.growthClass)}
                    </div>
                    <div style="font-size:16px;font-weight:850;margin-top:4px;">${escapeHTML(item.displayName)}</div>
                </div>
                <span style="font-size:9px;font-weight:900;padding:5px 8px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">
                    REVISIÓN HUMANA
                </span>
            </div>
            <div style="margin-top:11px;font-size:12px;line-height:1.45;">
                <strong>Por qué esta persona:</strong> ${escapeHTML(item.whyThisPerson)}
            </div>
            <div style="margin-top:7px;font-size:12px;line-height:1.45;">
                <strong>Por qué ahora:</strong> ${escapeHTML(item.whyNow)}
            </div>
            <div style="margin-top:7px;font-size:12px;line-height:1.45;">
                <strong>Incertidumbre:</strong> ${escapeHTML(item.uncertainty)}
            </div>
            <div style="margin-top:7px;font-size:12px;line-height:1.45;">
                <strong>Acción mínima:</strong> ${escapeHTML(item.smallestUsefulAction)}
            </div>
            <details style="margin-top:10px;">
                <summary style="font-size:11px;font-weight:800;cursor:pointer;">Ver evidencia</summary>
                <ul style="font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">${evidence}</ul>
            </details>
            <button
                type="button"
                class="glass-button"
                data-growth-review="${escapeHTML(item.candidateReference)}"
                style="width:100%;min-height:42px;margin-top:12px;"
            >Revisar posibilidad</button>
            <div data-growth-review-state="${escapeHTML(item.candidateReference)}" aria-live="polite" style="margin-top:7px;font-size:10px;color:var(--text-secondary);"></div>
        </article>
    `;
}

export function renderCartera060GrowthReview({ status = 'IDLE', growth = null, filter = 'ALL', errorCode = null } = {}) {
    if (status === 'LOADING') return '<div class="glass-widget" style="padding:16px;">Analizando relaciones con evidencia confirmada…</div>';
    if (status === 'ERROR') return `<div class="glass-widget" style="padding:16px;">No se pudo cargar Growth Intelligence: ${escapeHTML(errorCode || 'UNKNOWN')}</div>`;
    if (status !== 'READY' || !growth) return '';

    const items = growth.items.filter(item => filter === 'ALL' || item.growthClass === filter);
    const filters = ['ALL', ...Object.keys(LABELS)].map(value => `
        <button type="button" class="glass-button" data-growth-filter="${value}" aria-pressed="${filter === value}">
            ${escapeHTML(value === 'ALL' ? 'Todas' : LABELS[value])}
        </button>
    `).join('');

    return `
        <section class="glass-widget" data-cartera-growth-review style="padding:16px;margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
                <div>
                    <div style="font-size:10px;font-weight:900;color:var(--text-secondary);">GROWTH INTELLIGENCE</div>
                    <h3 style="margin:4px 0 0;font-size:18px;">Posibilidades naturales de relación</h3>
                    <p style="margin:6px 0 0;font-size:11px;color:var(--text-secondary);">
                        Son revisiones explicables, no oportunidades creadas ni instrucciones de venta.
                    </p>
                </div>
                <button type="button" class="glass-button" data-growth-refresh>Actualizar</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:13px;">${filters}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:14px;">
                ${items.length ? items.map(itemCard).join('') : '<div style="font-size:12px;color:var(--text-secondary);">No hay posibilidades con evidencia suficiente en este filtro.</div>'}
            </div>
            <div style="margin-top:12px;font-size:10px;color:var(--text-secondary);">
                No contacta, no pide referidos, no crea oportunidades, no genera mensajes finales y no usa eventos de vida como disparador comercial.
            </div>
        </section>
    `;
}

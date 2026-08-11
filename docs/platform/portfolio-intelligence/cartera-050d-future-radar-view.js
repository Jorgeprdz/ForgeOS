const HORIZON_LABELS = Object.freeze({
    CONFIRMATION_REQUIRED: 'Confirmación',
    OVERDUE: 'Atrasado',
    TODAY: 'Hoy',
    NEXT_7_DAYS: '7 días',
    NEXT_30_DAYS: '30 días',
    NEXT_90_DAYS: '90 días',
});

const TRUTH_LABELS = Object.freeze({
    CONFIRMED_FACT: 'Hecho confirmado',
    SCHEDULED_EVENT: 'Evento programado',
    DETECTED_EVIDENCE: 'Evidencia detectada',
    INFERENCE: 'Inferencia',
    RECOMMENDATION: 'Recomendación',
});

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return 'Fecha desconocida';
    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function sourceStatus(label, value) {
    const status = value === 'AVAILABLE'
        ? 'Disponible'
        : value === 'NOT_CONNECTED'
            ? 'No conectado'
            : value === 'ADAPTER_REQUIRED'
                ? 'Adapter pendiente'
                : 'No disponible';
    return `<span style="font-size:10px;color:var(--text-secondary);">${escapeHTML(label)}: ${escapeHTML(status)}</span>`;
}

function filterItems(radar, horizon) {
    if (!radar) return [];
    if (!horizon || horizon === 'ALL') return radar.focusItems || radar.items || [];
    return (radar.items || []).filter(item => item.horizon === horizon).slice(0, 12);
}

function itemCard(item) {
    const person = item.personDisplayName || item.personReference || 'Relación no identificada';
    return `
        <article class="glass-widget" style="padding:14px;display:grid;gap:9px;">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                <div style="min-width:0;">
                    <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">
                        ${escapeHTML(HORIZON_LABELS[item.horizon] || item.horizon)} · ${escapeHTML(TRUTH_LABELS[item.truthClass] || item.truthClass)}
                    </div>
                    <div style="margin-top:4px;font-size:15px;font-weight:800;overflow-wrap:anywhere;">
                        ${escapeHTML(person)}
                    </div>
                    <div style="margin-top:2px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">
                        ${escapeHTML(item.signalType)} · ${escapeHTML(formatDate(item.eventDate))}
                    </div>
                </div>
                <span style="font-size:9px;font-weight:800;padding:5px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));white-space:nowrap;">
                    CONFIRMAR
                </span>
            </div>

            <div style="display:grid;gap:7px;font-size:12px;line-height:1.45;">
                <div><strong>Por qué esta persona:</strong> ${escapeHTML(item.whyThisPerson)}</div>
                <div><strong>Por qué ahora:</strong> ${escapeHTML(item.whyNow)}</div>
                <div><strong>Evidencia:</strong> ${item.evidenceSummary.map(escapeHTML).join(' · ')}</div>
                <div><strong>Incertidumbre:</strong> ${escapeHTML(item.uncertainty)}</div>
                <div><strong>Acción mínima:</strong> ${escapeHTML(item.smallestUsefulAction)}</div>
            </div>

            <div style="font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">
                Fuente: ${escapeHTML(item.sourceAuthority)} · ${escapeHTML(item.sourceRecordReference)}
            </div>
        </article>
    `;
}

export function renderCartera050FutureRadar({
    status = 'IDLE',
    radar = null,
    horizon = 'ALL',
    errorCode = null,
} = {}) {
    if (status === 'LOADING') {
        return `
            <section class="glass-widget" style="padding:18px;margin-bottom:18px;" aria-busy="true">
                <div style="font-size:13px;font-weight:800;">Radar futuro</div>
                <div style="margin-top:8px;color:var(--text-secondary);font-size:12px;">Conectando fechas, evidencia y contexto…</div>
            </section>
        `;
    }
    if (status === 'ERROR') {
        return `
            <section class="glass-widget" style="padding:18px;margin-bottom:18px;">
                <div style="font-size:13px;font-weight:800;">Radar futuro no disponible</div>
                <div style="margin-top:8px;color:var(--text-secondary);font-size:11px;">${escapeHTML(errorCode || 'CARTERA050_RADAR_FAILED')}</div>
                <button type="button" class="glass-button" data-radar-refresh style="margin-top:12px;min-height:40px;">Reintentar</button>
            </section>
        `;
    }
    if (status !== 'READY' || !radar) return '';

    const items = filterItems(radar, horizon);
    const summary = radar.summary?.byHorizon || {};
    const buttons = [
        ['ALL', 'Foco', radar.focusItems?.length || 0],
        ['TODAY', 'Hoy', summary.TODAY || 0],
        ['NEXT_7_DAYS', '7 días', summary.NEXT_7_DAYS || 0],
        ['NEXT_30_DAYS', '30 días', summary.NEXT_30_DAYS || 0],
        ['NEXT_90_DAYS', '90 días', summary.NEXT_90_DAYS || 0],
        ['CONFIRMATION_REQUIRED', 'Confirmar', summary.CONFIRMATION_REQUIRED || 0],
        ['OVERDUE', 'Atrasado', summary.OVERDUE || 0],
    ].map(([value, label, count]) => `
        <button
            type="button"
            class="glass-button"
            data-radar-horizon="${escapeHTML(value)}"
            aria-pressed="${value === horizon ? 'true' : 'false'}"
            style="min-height:38px;padding:8px 11px;white-space:nowrap;${value === horizon ? 'font-weight:900;' : ''}"
        >${escapeHTML(label)} · ${escapeHTML(count)}</button>
    `).join('');

    return `
        <section class="glass-widget" style="padding:18px;margin-bottom:18px;" aria-labelledby="cartera-radar-title">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div>
                    <h3 id="cartera-radar-title" style="margin:0;font-size:18px;font-weight:900;">Radar futuro</h3>
                    <p style="margin:5px 0 0;color:var(--text-secondary);font-size:11px;">
                        Lo que viene, por qué importa y la acción más pequeña que puede ayudar.
                    </p>
                </div>
                <button type="button" class="glass-button" data-radar-refresh style="min-height:38px;">Actualizar</button>
            </div>

            <div style="display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px;scrollbar-width:thin;">
                ${buttons}
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:10px;">
                ${sourceStatus('Pólizas/pagos', radar.sourceAvailability.policyPayment)}
                ${sourceStatus('Memoria', radar.sourceAvailability.relationshipMemory)}
                ${sourceStatus('Documentos', radar.sourceAvailability.documentIntake)}
                ${sourceStatus('Conservación', radar.sourceAvailability.conservationIntelligence)}
                ${sourceStatus('Compensación', radar.sourceAvailability.compensationIntelligence)}
            </div>

            <div style="margin-top:14px;display:grid;gap:10px;">
                ${items.length ? items.map(itemCard).join('') : `
                    <div class="glass-widget" style="padding:14px;color:var(--text-secondary);font-size:12px;">
                        No hay señales visibles en este horizonte.
                    </div>
                `}
            </div>

            <div style="margin-top:12px;font-size:10px;color:var(--text-secondary);line-height:1.45;">
                Orden por horizonte y fecha; no es prioridad final de NBA. No confirma lapse, no calcula comisión y no ejecuta contacto.
            </div>
        </section>
    `;
}

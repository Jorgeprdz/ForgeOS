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

export function groupRadarSignalsByPerson(items = []) {
    const groups = [];
    const byKey = new Map();
    for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
        const personReference = String(item?.personReference || '').trim();
        const signalReference = String(item?.signalReference || '').trim();
        const key = personReference
            ? `PERSON:${personReference}`
            : `SIGNAL:${signalReference || index}`;
        let group = byKey.get(key);
        if (!group) {
            group = {
                groupingKey: key,
                personReference: personReference || null,
                personDisplayName: item?.personDisplayName || personReference || 'Relación no identificada',
                signals: [],
            };
            byKey.set(key, group);
            groups.push(group);
        }
        group.signals.push(item);
    }
    return Object.freeze(groups.map(group => Object.freeze({
        ...group,
        signals: Object.freeze([...group.signals]),
    })));
}

function decisionControls(item, { actionableSignalReference = null, decisionState = null, presentationState = null, operationState = null } = {}) {
    if (!actionableSignalReference || item.signalReference !== actionableSignalReference) return '';
    const busy = operationState === 'SAVING';
    const status = decisionState
        ? `Decisión guardada: ${decisionState}`
        : presentationState === 'UNAVAILABLE'
            ? 'Recomendación visible; evidencia de presentación pendiente.'
            : 'Decide qué hacer. Aceptar todavía no registra el pago.';
    const continueButton = decisionState === 'ACCEPTED' && item.policyReference
        ? `<button type="button" class="glass-button" data-open-policy="${escapeHTML(item.policyReference)}" style="min-height:38px;font-weight:900;">Continuar a la póliza</button>`
        : '';
    return `
        <div data-radar-actionable-recommendation="017e" style="display:grid;gap:8px;border-top:1px solid var(--outline-variant,rgba(255,255,255,.12));padding-top:10px;">
            <div style="font-size:10px;color:var(--text-secondary);">${escapeHTML(status)}</div>
            <div style="display:flex;flex-wrap:wrap;gap:7px;">
                <button type="button" class="glass-button" data-radar-decision="ACCEPT" data-radar-signal="${escapeHTML(item.signalReference)}" ${busy ? 'disabled' : ''}>Aceptar</button>
                <button type="button" class="glass-button" data-radar-decision="MODIFY" data-radar-signal="${escapeHTML(item.signalReference)}" ${busy ? 'disabled' : ''}>Modificar</button>
                <button type="button" class="glass-button" data-radar-decision="DEFER" data-radar-signal="${escapeHTML(item.signalReference)}" ${busy ? 'disabled' : ''}>Posponer</button>
                <button type="button" class="glass-button" data-radar-decision="DISMISS" data-radar-signal="${escapeHTML(item.signalReference)}" ${busy ? 'disabled' : ''}>Descartar</button>
                ${continueButton}
            </div>
        </div>`;
}

function signalCard(item, decisionState) {
    const evidence = Array.isArray(item.evidenceSummary) ? item.evidenceSummary : [];
    return `
        <section
            data-radar-signal-reference="${escapeHTML(item.signalReference)}"
            style="padding:13px;border:1px solid var(--outline-variant,rgba(255,255,255,.12));border-radius:16px;background:var(--surface-container-low,rgba(255,255,255,.035));display:grid;gap:9px;min-width:0;"
            aria-label="${escapeHTML(item.signalType || 'Señal de Radar')}"
        >
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;">
                <div style="min-width:0;flex:1 1 220px;">
                    <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">
                        ${escapeHTML(HORIZON_LABELS[item.horizon] || item.horizon)} · ${escapeHTML(TRUTH_LABELS[item.truthClass] || item.truthClass)}
                    </div>
                    <div style="margin-top:4px;font-size:13px;font-weight:850;overflow-wrap:anywhere;">
                        ${escapeHTML(item.signalType)}
                    </div>
                    <div style="margin-top:2px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">
                        ${escapeHTML(formatDate(item.eventDate))}
                    </div>
                </div>
                <span style="font-size:9px;font-weight:800;padding:5px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));white-space:nowrap;">
                    CONFIRMAR
                </span>
            </div>

            <div style="display:grid;gap:7px;font-size:12px;line-height:1.45;overflow-wrap:anywhere;">
                <div><strong>Por qué esta persona:</strong> ${escapeHTML(item.whyThisPerson)}</div>
                <div><strong>Por qué ahora:</strong> ${escapeHTML(item.whyNow)}</div>
                <div><strong>Evidencia:</strong> ${evidence.length ? evidence.map(escapeHTML).join(' · ') : 'Sin resumen adicional'}</div>
                <div><strong>Incertidumbre:</strong> ${escapeHTML(item.uncertainty)}</div>
                <div><strong>Acción mínima:</strong> ${escapeHTML(item.smallestUsefulAction)}</div>
            </div>

            <div style="font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">
                Fuente: ${escapeHTML(item.sourceAuthority)} · ${escapeHTML(item.sourceRecordReference)}
            </div>
            ${decisionControls(item, decisionState)}
        </section>
    `;
}

function personCard(group, decisionState) {
    const signalCount = group.signals.length;
    const countLabel = signalCount === 1 ? '1 cosa para revisar' : `${signalCount} cosas para revisar`;
    const reference = group.personReference || group.groupingKey;
    return `
        <article
            class="glass-widget cartera-radar-person"
            data-radar-person-reference="${escapeHTML(reference)}"
            style="padding:15px;display:grid;gap:12px;min-width:0;"
        >
            <header style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;">
                <div style="min-width:0;flex:1 1 220px;">
                    <div style="font-size:15px;font-weight:900;overflow-wrap:anywhere;">${escapeHTML(group.personDisplayName)}</div>
                    <div style="margin-top:3px;font-size:11px;color:var(--text-secondary);">${escapeHTML(countLabel)}</div>
                </div>
            </header>
            <div class="cartera-radar-person__signals" style="display:grid;gap:10px;min-width:0;">
                ${group.signals.map(item => signalCard(item, decisionState)).join('')}
            </div>
        </article>
    `;
}

export function renderCartera050FutureRadar({
    status = 'IDLE',
    radar = null,
    horizon = 'ALL',
    errorCode = null,
    actionableSignalReference = null,
    decisionState = null,
    presentationState = null,
    operationState = null,
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
    const personGroups = groupRadarSignalsByPerson(items);
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

    const actionState = { actionableSignalReference, decisionState, presentationState, operationState };
    return `
        <section class="glass-widget" style="padding:18px;margin-bottom:18px;min-width:0;" aria-labelledby="cartera-radar-title">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
                <div style="min-width:0;flex:1 1 230px;">
                    <h3 id="cartera-radar-title" style="margin:0;font-size:18px;font-weight:900;">Radar futuro</h3>
                    <p style="margin:5px 0 0;color:var(--text-secondary);font-size:11px;">
                        Lo que viene, por qué importa y la acción más pequeña que puede ayudar.
                    </p>
                </div>
                <button type="button" class="glass-button" data-radar-refresh style="min-height:38px;">Actualizar</button>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:8px;padding:12px 0 4px;min-width:0;">
                ${buttons}
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:10px;">
                ${sourceStatus('Pólizas/pagos', radar.sourceAvailability.policyPayment)}
                ${sourceStatus('Memoria', radar.sourceAvailability.relationshipMemory)}
                ${sourceStatus('Documentos', radar.sourceAvailability.documentIntake)}
                ${sourceStatus('Conservación', radar.sourceAvailability.conservationIntelligence)}
                ${sourceStatus('Compensación', radar.sourceAvailability.compensationIntelligence)}
            </div>

            <div style="margin-top:14px;display:grid;gap:10px;min-width:0;">
                ${personGroups.length ? personGroups.map(group => personCard(group, actionState)).join('') : `
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

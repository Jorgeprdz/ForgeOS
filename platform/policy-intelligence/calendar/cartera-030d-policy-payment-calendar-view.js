const STATUS_LABELS = Object.freeze({
    SCHEDULED: 'Programado',
    UPCOMING: 'Próximo',
    CONFIRMED: 'Pagado',
    PARTIAL: 'Pago parcial',
    OVERDUE: 'Vencido',
    CONFIRMATION_REQUIRED: 'Requiere revisión',
    DETECTED: 'Evidencia detectada',
    NOT_FOUND: 'No encontrado',
    CORRECTED: 'Corregido',
    CANCELLED: 'Cancelado',
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
    if (!value) return 'Fecha desconocida';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return 'Fecha desconocida';
    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatAmount(amount, currency) {
    if (amount === null || amount === undefined) return 'Monto desconocido';
    if (!currency) return `${Number(amount).toLocaleString('es-MX')} · moneda desconocida`;
    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency,
        }).format(Number(amount));
    } catch {
        return `${Number(amount).toLocaleString('es-MX')} ${currency}`;
    }
}

function countCard(label, value, key) {
    return `
        <div class="glass-widget" data-calendar-summary="${escapeHTML(key)}" style="padding:11px;min-width:0;">
            <div style="font-size:9px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">${escapeHTML(label)}</div>
            <div style="font-size:19px;font-weight:800;margin-top:5px;">${escapeHTML(value ?? 0)}</div>
        </div>
    `;
}

function renderItem(item, { showPolicy = true } = {}) {
    const status = STATUS_LABELS[item.status] || item.status || 'Estado desconocido';
    const actual = item.status === 'CONFIRMED' || item.status === 'PARTIAL'
        ? `<div style="margin-top:5px;font-size:11px;color:var(--text-secondary);">Confirmado: ${escapeHTML(formatAmount(item.actualAmount, item.currency))}${item.actualDate ? ` · ${escapeHTML(formatDate(item.actualDate))}` : ''}</div>`
        : '';
    return `
        <article class="glass-widget" data-calendar-obligation="${escapeHTML(item.obligationReference)}" style="padding:13px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                <div style="min-width:0;">
                    <div style="font-size:12px;font-weight:800;">${escapeHTML(status)}</div>
                    <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">${escapeHTML(formatDate(item.expectedDate))} · ${escapeHTML(formatAmount(item.expectedAmount, item.currency))}</div>
                    ${showPolicy ? `<div style="font-size:10px;color:var(--text-secondary);margin-top:4px;overflow-wrap:anywhere;">${escapeHTML(item.policyReference)}</div>` : ''}
                </div>
                <span style="font-size:9px;font-weight:800;padding:5px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));text-align:right;">${escapeHTML(item.horizon)}</span>
            </div>
            ${actual}
            <div style="margin-top:7px;font-size:11px;color:var(--text-secondary);">${escapeHTML(item.explanation)}</div>
            ${showPolicy ? `
                <button type="button" class="glass-button" data-calendar-policy-open="${escapeHTML(item.policyReference)}" style="width:100%;margin-top:10px;min-height:38px;">
                    Abrir póliza
                </button>
            ` : ''}
        </article>
    `;
}

export function renderCartera030dPolicyPaymentCalendar({
    status = 'IDLE',
    calendar = null,
    errorCode = null,
    scope = 'PORTFOLIO',
} = {}) {
    const isPolicy = scope === 'POLICY';
    const title = isPolicy ? 'Calendario de pagos' : 'Próximos movimientos de cartera';
    const subtitle = isPolicy
        ? 'Obligaciones esperadas y pagos confirmados de esta póliza.'
        : 'Lo que requiere atención hoy y en los próximos 7, 30 y 90 días.';

    if (status === 'LOADING' || status === 'IDLE') {
        return `<section class="glass-widget" data-cartera-payment-calendar="${escapeHTML(scope)}" style="padding:16px;"><strong>${escapeHTML(title)}</strong><div style="margin-top:6px;font-size:12px;color:var(--text-secondary);">Cargando calendario canónico…</div></section>`;
    }
    if (status === 'ERROR') {
        return `<section class="glass-widget" data-cartera-payment-calendar="${escapeHTML(scope)}" role="alert" style="padding:16px;"><strong>No se pudo cargar ${escapeHTML(title.toLowerCase())}.</strong><div style="margin-top:6px;font-size:12px;color:var(--text-secondary);">La lectura falló cerrada y no cambió ninguna obligación.</div><code style="display:block;margin-top:7px;font-size:10px;overflow-wrap:anywhere;">${escapeHTML(errorCode)}</code></section>`;
    }

    const summary = calendar?.summary || {};
    const items = calendar?.items || [];
    return `
        <section class="glass-widget" data-cartera-payment-calendar="${escapeHTML(scope)}" style="padding:16px;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
                <div>
                    <h3 style="margin:0;font-size:15px;font-weight:800;">${escapeHTML(title)}</h3>
                    <div style="margin-top:5px;font-size:11px;color:var(--text-secondary);">${escapeHTML(subtitle)}</div>
                </div>
                <span style="font-size:9px;font-weight:800;padding:5px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">SOLO LECTURA</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(82px,1fr));gap:8px;margin-top:13px;">
                ${countCard('Hoy', summary.today, 'today')}
                ${countCard('7 días', summary.next7Days, 'next7Days')}
                ${countCard('30 días', summary.next30Days, 'next30Days')}
                ${countCard('90 días', summary.next90Days, 'next90Days')}
                ${countCard('Vencidos', summary.overdue, 'overdue')}
                ${countCard('Revisión', summary.confirmationRequired, 'confirmationRequired')}
            </div>
            <div style="margin-top:13px;font-size:10px;color:var(--text-secondary);">
                Un vencimiento no prueba cancelación ni pérdida de cobertura. Sólo un PaymentEvent confirmado cambia el estado de pago.
            </div>
            <div style="display:flex;flex-direction:column;gap:9px;margin-top:12px;">
                ${items.length ? items.map(item => renderItem(item, { showPolicy: !isPolicy })).join('') : '<div style="font-size:12px;color:var(--text-secondary);padding:8px 0;">Sin obligaciones visibles en este horizonte.</div>'}
            </div>
        </section>
    `;
}

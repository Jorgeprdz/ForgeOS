const KIND_LABELS = Object.freeze({
    ORIGIN_REFERRAL: 'Origen o referido',
    APPOINTMENT_CONTEXT: 'Contexto de cita',
    NEED: 'Necesidad confirmada',
    OBJECTION: 'Objeción',
    DECISION: 'Decisión',
    SERVICE_INTERACTION: 'Interacción de servicio',
    ANNUAL_REVIEW: 'Revisión anual',
    CONTACT_PREFERENCE: 'Canal preferido',
    CONTACT_TIME_PREFERENCE: 'Horario preferido',
    DECISION_PARTICIPANT: 'Participante de decisión',
    EXPLANATION_PREFERENCE: 'Estilo de explicación',
    UNRESOLVED_COMMITMENT: 'Compromiso pendiente',
    SERVICE_EXPECTATION: 'Expectativa de servicio',
    LIFE_CONTEXT: 'Contexto de vida confirmado',
});

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDateTime(value) {
    if (!value) return 'Fecha no disponible';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function renderBadge(label) {
    return `<span style="font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">${escapeHTML(label)}</span>`;
}

function renderMemory(item, sensitive = false) {
    return `
        <article class="glass-widget" style="padding:12px;">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                <strong style="font-size:12px;">${escapeHTML(KIND_LABELS[item.kind] || item.kind)}</strong>
                ${renderBadge(sensitive ? 'CONSENTIDO' : item.truthClass)}
            </div>
            <div style="margin-top:6px;font-size:12px;line-height:1.45;">${escapeHTML(item.summary)}</div>
            <div style="margin-top:7px;font-size:10px;color:var(--text-secondary);">
                ${escapeHTML(formatDateTime(item.occurredAt))} · ${escapeHTML(item.sourceAuthority)}
            </div>
        </article>
    `;
}

function renderHistoryItem(item) {
    return `
        <article class="glass-widget" style="padding:12px;">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                <div style="min-width:0;">
                    <strong style="font-size:12px;overflow-wrap:anywhere;">${escapeHTML(item.title)}</strong>
                    <div style="margin-top:5px;font-size:12px;line-height:1.4;overflow-wrap:anywhere;">${escapeHTML(item.summary)}</div>
                </div>
                ${renderBadge(item.truthClass)}
            </div>
            <div style="margin-top:7px;font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">
                ${escapeHTML(formatDateTime(item.occurredAt))} · ${escapeHTML(item.sourceAuthority)}
            </div>
        </article>
    `;
}

function renderNetwork(brief) {
    const accounts = brief.network.accounts.length
        ? brief.network.accounts.map(item => `
            <div class="glass-widget" style="padding:11px;">
                <strong style="font-size:12px;">${escapeHTML(item.displayLabel)}</strong>
                <div style="margin-top:4px;font-size:10px;color:var(--text-secondary);">
                    ${escapeHTML(item.accountType)} · ${escapeHTML(item.relationshipRole)}
                </div>
            </div>
        `).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin cuentas o grupos confirmados.</div>';

    const policies = brief.network.policies.length
        ? brief.network.policies.map(item => `
            <div class="glass-widget" style="padding:11px;">
                <strong style="font-size:12px;">${escapeHTML(item.productReference)}</strong>
                <div style="margin-top:4px;font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">
                    ${escapeHTML(item.carrierReference)} · ${escapeHTML(item.status)} · ${escapeHTML(item.roleType)}
                </div>
            </div>
        `).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin pólizas generales confirmadas.</div>';

    return `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
            <div>
                <h3 style="margin:0 0 9px;font-size:14px;">Red y cuentas</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">${accounts}</div>
            </div>
            <div>
                <h3 style="margin:0 0 9px;font-size:14px;">Pólizas y roles generales</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">${policies}</div>
            </div>
        </div>
    `;
}

function renderCaptureForm(personReference) {
    return `
        <form data-relationship-memory-form class="glass-widget" style="padding:14px;margin-top:18px;">
            <input type="hidden" name="personReference" value="${escapeHTML(personReference)}">
            <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Registrar memoria confirmada</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;">
                <label style="font-size:11px;">
                    Tipo
                    <select name="memoryKind" class="glass-input" required style="width:100%;margin-top:5px;">
                        <option value="SERVICE_INTERACTION">Interacción de servicio</option>
                        <option value="CONTACT_PREFERENCE">Canal preferido</option>
                        <option value="CONTACT_TIME_PREFERENCE">Horario preferido</option>
                        <option value="DECISION_PARTICIPANT">Participante de decisión</option>
                        <option value="EXPLANATION_PREFERENCE">Estilo de explicación</option>
                        <option value="UNRESOLVED_COMMITMENT">Compromiso pendiente</option>
                        <option value="SERVICE_EXPECTATION">Expectativa de servicio</option>
                        <option value="ANNUAL_REVIEW">Revisión anual</option>
                        <option value="LIFE_CONTEXT">Contexto de vida confirmado</option>
                    </select>
                </label>
                <label style="font-size:11px;">
                    Evidencia o referencia
                    <input name="evidenceReference" class="glass-input" required maxlength="240" placeholder="CITA:2026-08-01" style="width:100%;margin-top:5px;">
                </label>
            </div>
            <label style="display:block;font-size:11px;margin-top:10px;">
                Contexto breve
                <textarea name="summary" class="glass-input" required maxlength="500" rows="3" placeholder="Sólo información confirmada y útil para dar servicio." style="width:100%;box-sizing:border-box;margin-top:5px;resize:vertical;"></textarea>
            </label>
            <label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:11px;">
                <input type="checkbox" name="consentConfirmed">
                <span>La persona otorgó consentimiento confirmado para usar este contexto sensible en servicio o preparación de conversación. Obligatorio para “Contexto de vida”.</span>
            </label>
            <div data-relationship-memory-form-state aria-live="polite" style="margin-top:8px;font-size:11px;color:var(--text-secondary);"></div>
            <button type="submit" class="glass-button" style="width:100%;min-height:42px;margin-top:10px;">Guardar memoria confirmada</button>
        </form>
    `;
}

export function renderCartera040RelationshipBrief({
    status = 'IDLE',
    brief = null,
    errorCode = null,
    recordStatus = 'IDLE',
} = {}) {
    if (status === 'IDLE') return '';

    if (status === 'LOADING') {
        return `
            <section class="glass-widget" style="padding:18px;">
                <strong>Cargando memoria de relación…</strong>
                <div style="margin-top:6px;font-size:12px;color:var(--text-secondary);">Se están componiendo eventos confirmados; no se generan mensajes ni oportunidades.</div>
            </section>
        `;
    }

    if (status === 'ERROR') {
        return `
            <section class="glass-widget" role="alert" style="padding:18px;">
                <div style="display:flex;justify-content:space-between;gap:12px;">
                    <div>
                        <strong>No se pudo cargar la memoria de relación.</strong>
                        <code style="display:block;margin-top:8px;font-size:11px;overflow-wrap:anywhere;">${escapeHTML(errorCode || 'CARTERA040_BRIEF_FAILED')}</code>
                    </div>
                    <button type="button" data-relationship-close class="glass-button">Cerrar</button>
                </div>
            </section>
        `;
    }

    if (!brief?.person) return '';

    const preferences = brief.preferences.length
        ? brief.preferences.map(item => renderMemory(item)).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin preferencias confirmadas.</div>';
    const commitments = brief.commitments.length
        ? brief.commitments.map(item => renderMemory(item)).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin compromisos pendientes registrados.</div>';
    const lifeContext = brief.lifeContext.length
        ? brief.lifeContext.map(item => renderMemory(item, true)).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin contexto sensible consentido visible.</div>';
    const history = brief.history.length
        ? brief.history.map(renderHistoryItem).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin historia relacional confirmada.</div>';

    return `
        <section class="glass-widget" data-cartera-relationship-brief style="padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="min-width:0;">
                    <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Memoria de relación</div>
                    <h2 style="margin:6px 0 0;font-size:20px;overflow-wrap:anywhere;">${escapeHTML(brief.person.preferredName || brief.person.displayName)}</h2>
                    <div style="margin-top:5px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">${escapeHTML(brief.person.personReference)}</div>
                </div>
                <button type="button" data-relationship-close class="glass-button">Cerrar</button>
            </div>

            <div class="glass-widget" style="padding:12px;margin-top:14px;">
                <strong style="font-size:12px;">Brief previo al contacto</strong>
                <div style="margin-top:5px;font-size:11px;color:var(--text-secondary);line-height:1.45;">
                    Resume contexto confirmado. No redacta el mensaje final, no ejecuta contacto, no crea oportunidades y ningún evento de vida funciona como disparador comercial.
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-top:14px;">
                ${renderBadge(`${brief.summary.activePolicyCount} póliza(s)`)}
                ${renderBadge(`${brief.summary.preferenceCount} preferencia(s)`)}
                ${renderBadge(`${brief.summary.openCommitmentCount} pendiente(s)`)}
                ${renderBadge(`${brief.summary.historyCount} evento(s)`)}
            </div>

            <div style="margin-top:18px;">${renderNetwork(brief)}</div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:18px;">
                <div>
                    <h3 style="margin:0 0 9px;font-size:14px;">Preferencias y expectativas</h3>
                    <div style="display:flex;flex-direction:column;gap:8px;">${preferences}</div>
                </div>
                <div>
                    <h3 style="margin:0 0 9px;font-size:14px;">Compromisos pendientes</h3>
                    <div style="display:flex;flex-direction:column;gap:8px;">${commitments}</div>
                </div>
            </div>

            <div style="margin-top:18px;">
                <h3 style="margin:0 0 9px;font-size:14px;">Contexto sensible consentido</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">${lifeContext}</div>
            </div>

            <div style="margin-top:18px;">
                <h3 style="margin:0 0 9px;font-size:14px;">Historia unificada</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">${history}</div>
            </div>

            ${renderCaptureForm(brief.person.personReference)}
            ${recordStatus === 'SAVING' ? '<div style="margin-top:8px;font-size:11px;color:var(--text-secondary);">Guardando memoria…</div>' : ''}
        </section>
    `;
}

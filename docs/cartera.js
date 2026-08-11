// cartera.js
// CARTERA 010D read-only unified directory route adapter.

import { AppState } from './state-manager.js';
import { EventBus } from './event-system.js';
import { Logger } from './logger.js';
import { Memory } from './memory-manager.js';
import { createCanonicalPortfolioService } from './advisor-os/cartera/canonical-portfolio-service.js';
import { createCanonicalDirectoryService } from './advisor-os/cartera/canonical-directory-service.js';

const CarteraState = {
    directory: null,
    entries: [],
    results: [],
    search: '',
    status: 'IDLE',
    errorCode: null,
    selectedPolicyReference: null,
    detail: null,
    detailStatus: 'IDLE',
    detailErrorCode: null,
};

const ENTRY_KIND_LABEL = Object.freeze({
    COMMERCIAL_PERSON: 'PERSONA',
    COMMERCIAL_ACCOUNT: 'CUENTA',
    POLICY: 'PÓLIZA',
});

const MATCH_REASON_LABEL = Object.freeze({
    DISPLAY_NAME: 'Nombre',
    PREFERRED_NAME: 'Nombre preferido',
    PERSON_REFERENCE: 'Referencia de persona',
    VERIFIED_PHONE: 'Teléfono verificado',
    VERIFIED_EMAIL: 'Email verificado',
    ACCOUNT_LABEL: 'Nombre de cuenta',
    ACCOUNT_REFERENCE: 'Referencia de cuenta',
    ACCOUNT_TYPE: 'Tipo de cuenta',
    POLICY_NUMBER: 'Número de póliza',
    POLICY_REFERENCE: 'Referencia de póliza',
    CARRIER_REFERENCE: 'Compañía',
    PRODUCT_REFERENCE: 'Producto',
    POLICY_STATUS: 'Estado',
    RELATIONSHIP_ROLE: 'Relación',
    RELATIONSHIP_LABEL: 'Entidad relacionada',
    RELATIONSHIP_REFERENCE: 'Referencia relacionada',
    POLICY_ROLE: 'Rol en póliza',
    PARTICIPANT_LABEL: 'Participante',
    PARTICIPANT_REFERENCE: 'Referencia de participante',
});

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function debounce(fn, delay = 220) {
    let timer = null;
    const wrapped = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    wrapped.cancel = () => clearTimeout(timer);
    return wrapped;
}

function formatDate(value) {
    if (!value) {
        return 'Fecha desconocida';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Fecha desconocida';
    }
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date);
}

function formatDateTime(value) {
    if (!value) {
        return 'Fecha desconocida';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Fecha desconocida';
    }
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatMoneyFact(item) {
    const amount = item.premiumAmount;
    const currency = item.currency;

    if (amount.state !== 'KNOWN') {
        return 'Prima desconocida';
    }
    if (currency.state !== 'KNOWN') {
        return `${Number(amount.value).toLocaleString('es-MX')} · moneda desconocida`;
    }

    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency.value,
        }).format(Number(amount.value));
    } catch {
        return `${Number(amount.value).toLocaleString('es-MX')} ${currency.value}`;
    }
}

function formatSumInsured(item) {
    if (item.sumInsured.state !== 'KNOWN') {
        return 'Suma asegurada desconocida';
    }
    if (item.currency.state !== 'KNOWN') {
        return `${Number(item.sumInsured.value).toLocaleString('es-MX')} · moneda desconocida`;
    }
    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: item.currency.value,
            maximumFractionDigits: 0,
        }).format(Number(item.sumInsured.value));
    } catch {
        return `${Number(item.sumInsured.value).toLocaleString('es-MX')} ${item.currency.value}`;
    }
}

function visibleValue(fact, unknownLabel = 'Desconocido') {
    return fact?.state === 'KNOWN' ? fact.value : unknownLabel;
}

function statusLabel(item) {
    return item.status.state === 'KNOWN'
        ? item.status.value
        : 'ESTADO DESCONOCIDO';
}

function entryKindLabel(kind) {
    return ENTRY_KIND_LABEL[kind] || 'ENTIDAD';
}

function resultMatchLabels(result) {
    return [...new Set(
        (result.matchReasons || []).map(reason => MATCH_REASON_LABEL[reason] || reason)
    )];
}

function relationshipSummary(entry) {
    const visible = entry.relationships.slice(0, 4);
    if (visible.length === 0) {
        return '<div style="font-size:12px;color:var(--text-secondary);">Sin relaciones generales visibles.</div>';
    }

    const items = visible.map(relationship => `
        <div class="glass-widget" style="padding:9px;min-width:0;">
            <div style="font-size:10px;color:var(--text-secondary);font-weight:800;overflow-wrap:anywhere;">
                ${escapeHTML(relationship.relationshipType)}
            </div>
            <div style="margin-top:3px;font-size:12px;font-weight:700;overflow-wrap:anywhere;">
                ${escapeHTML(relationship.targetLabel)}
            </div>
        </div>
    `).join('');

    const remaining = entry.relationships.length - visible.length;
    return `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:7px;">
            ${items}
        </div>
        ${remaining > 0 ? `
            <div style="margin-top:6px;font-size:10px;color:var(--text-secondary);">
                +${escapeHTML(remaining)} relación(es) adicional(es)
            </div>
        ` : ''}
    `;
}

export function renderCartera() {
    return `
        <section
            id="cartera-root"
            aria-labelledby="cartera-title"
            style="padding-bottom:calc(112px + env(safe-area-inset-bottom));"
        >
            <div class="glass-widget" style="padding:18px;margin-bottom:18px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                    <div>
                        <h2 id="cartera-title" style="margin:0;font-size:22px;font-weight:800;">Cartera</h2>
                        <p style="margin:5px 0 0;color:var(--text-secondary);font-size:12px;">
                            Directorio canónico de personas, cuentas y pólizas
                        </p>
                    </div>
                    <span class="cartera-truth-badge">DIRECTORIO VERIFICADO</span>
                </div>

                <div class="cartera-summary-strip" aria-label="Resumen de Cartera">
                    <div>
                        <span style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Personas</span>
                        <div id="kpi-total-personas" style="font-size:22px;font-weight:800;margin-top:7px;">—</div>
                    </div>
                    <div>
                        <span style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Cuentas</span>
                        <div id="kpi-total-cuentas" style="font-size:22px;font-weight:800;margin-top:7px;">—</div>
                    </div>
                    <div>
                        <span style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Pólizas</span>
                        <div id="kpi-total-polizas" style="font-size:22px;font-weight:800;margin-top:7px;">—</div>
                    </div>
                    <div>
                        <span style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Directorio</span>
                        <div id="kpi-total-directorio" style="font-size:22px;font-weight:800;margin-top:7px;">—</div>
                    </div>
                </div>
            </div>

            <div id="cartera-detail-panel" aria-live="polite" style="margin-bottom:18px;"></div>

            <div class="glass-widget" style="padding:18px;">
                <label for="cartera-search" style="display:block;font-size:11px;color:var(--text-secondary);font-weight:800;margin-bottom:7px;">
                    BUSCAR PERSONA, CUENTA O PÓLIZA
                </label>
                <input
                    id="cartera-search"
                    class="glass-input"
                    placeholder="Nombre, teléfono, email, póliza, compañía, producto o relación..."
                    autocomplete="off"
                    spellcheck="false"
                    style="width:100%;box-sizing:border-box;"
                >
                <div style="margin-top:7px;font-size:10px;color:var(--text-secondary);">
                    Teléfono y email solo ayudan a encontrar coincidencias; sus valores no se muestran en este directorio.
                </div>
                <div id="cartera-route-state" aria-live="polite" style="margin-top:14px;"></div>
                <div id="cartera-list" style="display:flex;flex-direction:column;gap:12px;margin-top:12px;"></div>
            </div>
        </section>
    `;
}

export async function bindCarteraEvents() {
    const root = document.getElementById('cartera-root');
    const searchInput = document.getElementById('cartera-search');
    if (!root || !searchInput) {
        return;
    }

    const policyService = createCanonicalPortfolioService();
    const directoryService = createCanonicalDirectoryService();
    resetCarteraState();

    const onSearch = debounce(event => {
        CarteraState.search = event.target.value;
        applyDirectorySearch();
    });
    const onRootClick = event => {
        const openButton = event.target.closest('[data-policy-open]');
        if (openButton) {
            openPolicyDetail(policyService, openButton.dataset.policyOpen);
            return;
        }
        if (event.target.closest('[data-policy-close]')) {
            closePolicyDetail();
        }
    };

    searchInput.addEventListener('input', onSearch);
    root.addEventListener('click', onRootClick);
    Memory.add(() => {
        searchInput.removeEventListener('input', onSearch);
        root.removeEventListener('click', onRootClick);
        onSearch.cancel();
    });

    renderRouteState();
    renderKPIs();
    renderPolicyDetail();
    EventBus.emit('cartera:loading', { authority: 'CANONICAL_DIRECTORY' });

    try {
        const directory = await directoryService.loadDirectory();

        CarteraState.directory = directory;
        CarteraState.entries = [...directory.entries];
        CarteraState.status = 'READY';
        AppState.set('cartera', CarteraState.entries);
        AppState.set('cartera:directory', {
            counts: directory.counts,
            entries: CarteraState.entries,
        });
        applyDirectorySearch();

        EventBus.emit('cartera:mounted', {
            authority: 'CANONICAL_DIRECTORY',
            count: CarteraState.entries.length,
            counts: directory.counts,
            readOnly: true,
        });
    } catch (error) {
        CarteraState.status = 'ERROR';
        CarteraState.errorCode = error?.code || error?.message || 'CARTERA010D_DIRECTORY_READ_FAILED';
        Logger.error('[CARTERA 010D DIRECTORY READ ERROR]', error);
        renderRouteState();
        renderList();
        renderKPIs();
        EventBus.emit('cartera:error', { code: CarteraState.errorCode });
    }
}

function resetCarteraState() {
    CarteraState.directory = null;
    CarteraState.entries = [];
    CarteraState.results = [];
    CarteraState.search = '';
    CarteraState.status = 'LOADING';
    CarteraState.errorCode = null;
    CarteraState.selectedPolicyReference = null;
    CarteraState.detail = null;
    CarteraState.detailStatus = 'IDLE';
    CarteraState.detailErrorCode = null;
}

async function openPolicyDetail(service, policyReference) {
    CarteraState.selectedPolicyReference = policyReference;
    CarteraState.detail = null;
    CarteraState.detailStatus = 'LOADING';
    CarteraState.detailErrorCode = null;
    renderPolicyDetail();
    EventBus.emit('cartera:policy-detail-loading', { policyReference });

    try {
        const detail = await service.loadPolicyDetail(policyReference);
        if (CarteraState.selectedPolicyReference !== policyReference) {
            return;
        }
        CarteraState.detail = detail;
        CarteraState.detailStatus = 'READY';
        AppState.set('cartera:selectedPolicy', detail);
        renderPolicyDetail();
        document.getElementById('cartera-detail-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
        EventBus.emit('cartera:policy-detail-mounted', {
            policyReference,
            timelineCount: detail.timeline.length,
            readOnly: true,
        });
    } catch (error) {
        if (CarteraState.selectedPolicyReference !== policyReference) {
            return;
        }
        CarteraState.detailStatus = 'ERROR';
        CarteraState.detailErrorCode = error?.code || error?.message || 'CARTERA010C_POLICY_DETAIL_FAILED';
        Logger.error('[CARTERA 010C POLICY DETAIL ERROR]', error);
        renderPolicyDetail();
        EventBus.emit('cartera:policy-detail-error', {
            policyReference,
            code: CarteraState.detailErrorCode,
        });
    }
}

function closePolicyDetail() {
    CarteraState.selectedPolicyReference = null;
    CarteraState.detail = null;
    CarteraState.detailStatus = 'IDLE';
    CarteraState.detailErrorCode = null;
    AppState.set('cartera:selectedPolicy', null);
    renderPolicyDetail();
}

function applyDirectorySearch() {
    if (!CarteraState.directory) {
        CarteraState.results = [];
    } else {
        CarteraState.results = [...CarteraState.directory.search(
            CarteraState.search,
            { limit: 200 }
        )];
    }

    renderRouteState();
    renderList();
    renderKPIs();
}

function renderRouteState() {
    const container = document.getElementById('cartera-route-state');
    if (!container) {
        return;
    }

    if (CarteraState.status === 'LOADING') {
        container.innerHTML = `
            <div class="glass-widget" style="padding:16px;color:var(--text-secondary);">
                Cargando la cartera canónica y su directorio…
            </div>
        `;
        return;
    }

    if (CarteraState.status === 'ERROR') {
        container.innerHTML = `
            <div class="glass-widget" role="alert" style="padding:16px;">
                <strong>No se pudo cargar la cartera.</strong>
                <div style="margin-top:5px;font-size:12px;color:var(--text-secondary);">
                    La ruta falló cerrada y no recurrió a IndexedDB.
                </div>
                <code style="display:block;margin-top:8px;font-size:11px;overflow-wrap:anywhere;">${escapeHTML(CarteraState.errorCode)}</code>
            </div>
        `;
        return;
    }

    if (CarteraState.status === 'READY' && CarteraState.entries.length === 0) {
        container.innerHTML = `
            <div class="glass-widget" style="padding:18px;text-align:center;">
                <strong>Aún no hay pólizas canónicas confirmadas ni personas o cuentas vinculadas.</strong>
                <div style="margin-top:6px;font-size:12px;color:var(--text-secondary);">
                    No se mostrarán registros legacy ni identidades creadas sin autoridad canónica.
                </div>
            </div>
        `;
        return;
    }

    if (CarteraState.status === 'READY' && CarteraState.results.length === 0) {
        container.innerHTML = `
            <div style="font-size:12px;color:var(--text-secondary);padding:4px 2px;">
                Sin coincidencias en el directorio canónico.
            </div>
        `;
        return;
    }

    container.innerHTML = '';
}

function renderKPIs() {
    const people = document.getElementById('kpi-total-personas');
    const accounts = document.getElementById('kpi-total-cuentas');
    const policies = document.getElementById('kpi-total-polizas');
    const total = document.getElementById('kpi-total-directorio');
    if (!people || !accounts || !policies || !total) {
        return;
    }

    if (CarteraState.status !== 'READY' || !CarteraState.directory) {
        people.textContent = '—';
        accounts.textContent = '—';
        policies.textContent = '—';
        total.textContent = '—';
        return;
    }

    people.textContent = String(CarteraState.directory.counts.people);
    accounts.textContent = String(CarteraState.directory.counts.accounts);
    policies.textContent = String(CarteraState.directory.counts.policies);
    total.textContent = String(CarteraState.directory.counts.total);
}

function renderList() {
    const container = document.getElementById('cartera-list');
    if (!container) {
        return;
    }

    if (CarteraState.status !== 'READY' || CarteraState.results.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = CarteraState.results.map(renderDirectoryCard).join('');
}

function renderDirectoryCard(result) {
    const entry = result.entry;
    const matchLabels = resultMatchLabels(result);
    const kind = entryKindLabel(entry.kind);
    const policyData = entry.kind === 'POLICY'
        ? ` data-policy-reference="${escapeHTML(entry.reference)}"`
        : '';
    const openPolicy = entry.kind === 'POLICY'
        ? `
            <button
                type="button"
                data-policy-open="${escapeHTML(entry.reference)}"
                class="glass-button"
                style="width:100%;margin-top:14px;min-height:42px;"
            >
                Ver detalle canónico
            </button>
        `
        : '';

    return `
        <article
            class="glass-widget"
            data-directory-reference="${escapeHTML(entry.reference)}"
            data-directory-kind="${escapeHTML(entry.kind)}"
            ${policyData}
            style="padding:16px;"
        >
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="min-width:0;">
                    <div style="font-size:10px;color:var(--text-secondary);font-weight:800;">${escapeHTML(kind)}</div>
                    <h3 style="margin:5px 0 0;font-size:15px;font-weight:800;overflow-wrap:anywhere;">
                        ${escapeHTML(entry.displayLabel)}
                    </h3>
                    <div style="margin-top:4px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">
                        ${escapeHTML(entry.reference)}
                    </div>
                </div>
                <span style="font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));text-align:right;">
                    ${escapeHTML(entry.secondaryLabel)}
                </span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:13px;">
                ${renderDirectoryCount('Personas', entry.personCount)}
                ${renderDirectoryCount('Cuentas', entry.accountCount)}
                ${renderDirectoryCount('Pólizas', entry.policyCount)}
            </div>

            <div style="margin-top:13px;">
                <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;margin-bottom:7px;">
                    Relación básica
                </div>
                ${relationshipSummary(entry)}
            </div>

            ${matchLabels.length > 0 ? `
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;" data-directory-match-reasons>
                    ${matchLabels.map(label => `
                        <span style="font-size:10px;padding:4px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">
                            Coincidencia: ${escapeHTML(label)}
                        </span>
                    `).join('')}
                </div>
            ` : ''}

            ${openPolicy}
        </article>
    `;
}

function renderDirectoryCount(label, value) {
    return `
        <div class="glass-widget" style="padding:9px;text-align:center;">
            <div style="font-size:10px;color:var(--text-secondary);font-weight:800;">${escapeHTML(label)}</div>
            <div style="margin-top:4px;font-size:16px;font-weight:800;">${escapeHTML(value)}</div>
        </div>
    `;
}

// Retained as an accepted 010C compatibility renderer for policy-only projections.
// The productive list is now renderDirectoryCard; this function remains read-only.
function renderPolicyCard(item) {
    const conflict = item.conflictState !== 'CLEAR';
    return `
        <article class="glass-widget" data-policy-reference="${escapeHTML(item.policyReference)}" style="padding:16px;">
            <h3>${escapeHTML(item.productReference)}</h3>
            ${conflict ? '<span>REQUIERE REVISIÓN</span>' : ''}
            <button type="button" data-policy-open="${escapeHTML(item.policyReference)}">Ver detalle canónico</button>
        </article>
    `;
}

function renderPolicyDetail() {
    const container = document.getElementById('cartera-detail-panel');
    if (!container) {
        return;
    }

    if (CarteraState.detailStatus === 'IDLE') {
        container.innerHTML = '';
        return;
    }

    if (CarteraState.detailStatus === 'LOADING') {
        container.innerHTML = `
            <section class="glass-widget" style="padding:18px;">
                <strong>Cargando detalle canónico…</strong>
                <div style="margin-top:5px;font-size:12px;color:var(--text-secondary);">
                    ${escapeHTML(CarteraState.selectedPolicyReference)}
                </div>
            </section>
        `;
        return;
    }

    if (CarteraState.detailStatus === 'ERROR') {
        container.innerHTML = `
            <section class="glass-widget" role="alert" style="padding:18px;">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
                    <div>
                        <strong>No se pudo cargar el detalle.</strong>
                        <div style="margin-top:5px;font-size:12px;color:var(--text-secondary);">
                            La lectura falló cerrada; no se consultaron datos legacy.
                        </div>
                        <code style="display:block;margin-top:8px;font-size:11px;overflow-wrap:anywhere;">${escapeHTML(CarteraState.detailErrorCode)}</code>
                    </div>
                    <button type="button" data-policy-close class="glass-button">Cerrar</button>
                </div>
            </section>
        `;
        return;
    }

    const detail = CarteraState.detail;
    if (!detail?.policy) {
        container.innerHTML = '';
        return;
    }

    const policy = detail.policy;
    const participants = policy.generalParticipantSummary.length > 0
        ? policy.generalParticipantSummary.map(renderParticipant).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Participantes generales no disponibles.</div>';
    const versions = detail.versions.length > 0
        ? detail.versions.map(renderVersion).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin versiones visibles.</div>';
    const evidence = detail.evidence.length > 0
        ? detail.evidence.map(renderEvidence).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin evidencia visible.</div>';
    const conflicts = detail.conflicts.length > 0
        ? detail.conflicts.map(renderConflict).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin conflictos registrados.</div>';
    const timeline = detail.timeline.length > 0
        ? detail.timeline.map(renderTimelineEntry).join('')
        : '<div style="font-size:12px;color:var(--text-secondary);">Sin eventos canónicos disponibles.</div>';

    container.innerHTML = `
        <section class="glass-widget" aria-labelledby="cartera-policy-detail-title" style="padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="min-width:0;">
                    <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Detalle canónico de póliza</div>
                    <h2 id="cartera-policy-detail-title" style="margin:6px 0 0;font-size:20px;overflow-wrap:anywhere;">
                        ${escapeHTML(policy.productReference)}
                    </h2>
                    <div style="margin-top:5px;font-size:12px;color:var(--text-secondary);overflow-wrap:anywhere;">
                        ${escapeHTML(policy.policyReference)} · ${escapeHTML(policy.carrierReference)}
                    </div>
                </div>
                <button type="button" data-policy-close class="glass-button">Cerrar</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px;">
                ${renderFact('Número de póliza', visibleValue(policy.policyNumber, 'Desconocido'))}
                ${renderFact('Estado', statusLabel(policy))}
                ${renderFact('Prima', formatMoneyFact(policy))}
                ${renderFact('Suma asegurada', formatSumInsured(policy))}
                ${renderFact('Frecuencia', visibleValue(policy.paymentFrequency, 'Desconocida'))}
                ${renderFact('Vigencia', formatDate(policy.policyEffectiveFrom))}
                ${renderFact('Completitud', policy.completenessState)}
                ${renderFact('Actualidad', policy.freshnessState)}
            </div>

            <div style="margin-top:20px;">
                ${renderSectionTitle('Participantes generales')}
                <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">${participants}</div>
                <div style="margin-top:8px;font-size:11px;color:var(--text-secondary);">
                    Los beneficiarios y roles restringidos no forman parte de esta vista general.
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:20px;">
                <div>
                    ${renderSectionTitle('Versiones')}
                    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">${versions}</div>
                </div>
                <div>
                    ${renderSectionTitle('Evidencia mínima')}
                    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">${evidence}</div>
                </div>
            </div>

            <div style="margin-top:20px;">
                ${renderSectionTitle('Conflictos')}
                <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">${conflicts}</div>
            </div>

            <div style="margin-top:20px;">
                ${renderSectionTitle('Timeline canónico minimizado')}
                <div style="margin-top:6px;font-size:11px;color:var(--text-secondary);">
                    El Timeline conserva referencias y cambios; no copia prima, suma asegurada, número de póliza, beneficiarios ni documentos crudos.
                </div>
                <div data-policy-timeline style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">${timeline}</div>
            </div>
        </section>
    `;
}

function renderFact(label, value) {
    return `
        <div class="glass-widget" style="padding:12px;min-width:0;">
            <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">${escapeHTML(label)}</div>
            <div style="margin-top:5px;font-size:13px;font-weight:800;overflow-wrap:anywhere;">${escapeHTML(value)}</div>
        </div>
    `;
}

function renderSectionTitle(title) {
    return `<h3 style="margin:0;font-size:14px;font-weight:800;">${escapeHTML(title)}</h3>`;
}

function renderParticipant(role) {
    return `
        <div class="glass-widget" style="padding:11px;display:flex;justify-content:space-between;gap:10px;">
            <span style="font-size:12px;font-weight:800;overflow-wrap:anywhere;">${escapeHTML(role.displayLabel)}</span>
            <span style="font-size:10px;color:var(--text-secondary);text-align:right;">${escapeHTML(role.roleType)}</span>
        </div>
    `;
}

function renderVersion(version) {
    return `
        <div class="glass-widget" style="padding:11px;">
            <div style="font-size:12px;font-weight:800;overflow-wrap:anywhere;">Versión ${escapeHTML(version.versionNumber)}</div>
            <div style="margin-top:4px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">${escapeHTML(version.policyVersionReference)}</div>
            <div style="margin-top:4px;font-size:11px;color:var(--text-secondary);">${escapeHTML(formatDateTime(version.confirmedAt))}</div>
        </div>
    `;
}

function renderEvidence(item) {
    return `
        <div class="glass-widget" style="padding:11px;">
            <div style="font-size:12px;font-weight:800;overflow-wrap:anywhere;">${escapeHTML(item.verificationState)}</div>
            <div style="margin-top:4px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">${escapeHTML(item.evidenceVersionReference)}</div>
            <div style="margin-top:4px;font-size:11px;color:var(--text-secondary);">${escapeHTML(item.sourceType)} · ${escapeHTML(formatDate(item.observedAt))}</div>
        </div>
    `;
}

function renderConflict(item) {
    return `
        <div class="glass-widget" style="padding:11px;">
            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="font-size:12px;font-weight:800;overflow-wrap:anywhere;">${escapeHTML(item.conflictType)}</span>
                <span style="font-size:10px;color:var(--text-secondary);">${escapeHTML(item.conflictState)}</span>
            </div>
            <div style="margin-top:4px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">${escapeHTML(item.conflictReference)}</div>
        </div>
    `;
}

function renderTimelineEntry(entry) {
    return `
        <article class="glass-widget" data-policy-event-type="${escapeHTML(entry.eventType)}" style="padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                <div style="min-width:0;">
                    <div style="font-size:12px;font-weight:800;">${escapeHTML(entry.title)}</div>
                    <div style="margin-top:4px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere;">${escapeHTML(entry.summary)}</div>
                </div>
                <time style="font-size:10px;color:var(--text-secondary);text-align:right;">${escapeHTML(formatDateTime(entry.occurredAt))}</time>
            </div>
            <div style="margin-top:7px;font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere;">
                ${escapeHTML(entry.subjectReference)} · ${escapeHTML(entry.evidenceCount)} evidencia(s)
            </div>
        </article>
    `;
}

// cartera.js
// CARTERA 010C read-only canonical route adapter.

import { AppState } from './state-manager.js';
import { EventBus } from './event-system.js';
import { Logger } from './logger.js';
import { Memory } from './memory-manager.js';
import { createCanonicalPortfolioService } from './advisor-os/cartera/canonical-portfolio-service.js';

const CarteraState = {
    items: [],
    filtered: [],
    search: '',
    status: 'IDLE',
    errorCode: null,
    selectedPolicyReference: null,
    detail: null,
    detailStatus: 'IDLE',
    detailErrorCode: null,
};

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normalizeText(value = '') {
    return String(value)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
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

function summarizePremium(items) {
    const known = items.filter(item => (
        item.premiumAmount.state === 'KNOWN'
        && item.currency.state === 'KNOWN'
    ));

    if (known.length === 0) {
        return '—';
    }

    const currencies = new Set(known.map(item => item.currency.value));
    if (currencies.size !== 1) {
        return `${known.length} importes conocidos`;
    }

    const currency = known[0].currency.value;
    const total = known.reduce(
        (sum, item) => sum + Number(item.premiumAmount.value || 0),
        0
    );

    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(total);
    } catch {
        return `${total.toLocaleString('es-MX')} ${currency}`;
    }
}

function statusLabel(item) {
    return item.status.state === 'KNOWN'
        ? item.status.value
        : 'ESTADO DESCONOCIDO';
}

function participantLabels(item) {
    const labels = item.generalParticipantSummary
        .filter(role => ['POLICY_OWNER', 'INSURED', 'PAYOR'].includes(role.roleType))
        .map(role => role.displayLabel);

    return [...new Set(labels)];
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
                            Pólizas y participantes desde autoridad canónica
                        </p>
                    </div>
                    <span
                        style="font-size:11px;font-weight:800;padding:6px 9px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));"
                    >
                        SOLO LECTURA
                    </span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:16px;">
                    <div class="glass-widget" style="padding:13px;">
                        <span style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Pólizas</span>
                        <div id="kpi-total-polizas" style="font-size:22px;font-weight:800;margin-top:7px;">—</div>
                    </div>
                    <div class="glass-widget" style="padding:13px;">
                        <span style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Prima conocida</span>
                        <div id="kpi-total-prima" style="font-size:17px;font-weight:800;margin-top:7px;overflow-wrap:anywhere;">—</div>
                    </div>
                    <div class="glass-widget" style="padding:13px;">
                        <span style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Conflictos</span>
                        <div id="kpi-conflictos" style="font-size:22px;font-weight:800;margin-top:7px;">—</div>
                    </div>
                </div>
            </div>

            <div id="cartera-detail-panel" aria-live="polite" style="margin-bottom:18px;"></div>

            <div class="glass-widget" style="padding:18px;">
                <label for="cartera-search" style="display:block;font-size:11px;color:var(--text-secondary);font-weight:800;margin-bottom:7px;">
                    BUSCAR EN PROYECCIÓN CANÓNICA
                </label>
                <input
                    id="cartera-search"
                    class="glass-input"
                    placeholder="Persona, cuenta, producto o referencia..."
                    autocomplete="off"
                    spellcheck="false"
                    style="width:100%;box-sizing:border-box;"
                >
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

    const service = createCanonicalPortfolioService();
    resetCarteraState();

    const onSearch = debounce(event => {
        CarteraState.search = event.target.value;
        applyFilter();
    });
    const onRootClick = event => {
        const openButton = event.target.closest('[data-policy-open]');
        if (openButton) {
            openPolicyDetail(service, openButton.dataset.policyOpen);
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
    EventBus.emit('cartera:loading', { authority: 'CANONICAL_POLICY' });

    try {
        const items = await service.loadPortfolio();

        CarteraState.items = [...items];
        CarteraState.status = 'READY';
        AppState.set('cartera', CarteraState.items);
        applyFilter();

        EventBus.emit('cartera:mounted', {
            authority: 'CANONICAL_POLICY',
            count: CarteraState.items.length,
            readOnly: true,
        });
    } catch (error) {
        CarteraState.status = 'ERROR';
        CarteraState.errorCode = error?.code || error?.message || 'CARTERA010C_READ_FAILED';
        Logger.error('[CARTERA 010C CANONICAL READ ERROR]', error);
        renderRouteState();
        renderList();
        renderKPIs();
        EventBus.emit('cartera:error', { code: CarteraState.errorCode });
    }
}

function resetCarteraState() {
    CarteraState.items = [];
    CarteraState.filtered = [];
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

function applyFilter() {
    const query = normalizeText(CarteraState.search);

    if (!query) {
        CarteraState.filtered = [...CarteraState.items];
    } else {
        CarteraState.filtered = CarteraState.items.filter(item => {
            const participants = participantLabels(item).join(' ');
            const haystack = normalizeText([
                item.policyReference,
                item.carrierReference,
                item.productReference,
                item.status.value,
                participants,
                item.personReferences.join(' '),
                item.accountReferences.join(' '),
            ].join(' '));
            return haystack.includes(query);
        });
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
                Cargando la cartera canónica…
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

    if (CarteraState.status === 'READY' && CarteraState.items.length === 0) {
        container.innerHTML = `
            <div class="glass-widget" style="padding:18px;text-align:center;">
                <strong>Aún no hay pólizas canónicas confirmadas.</strong>
                <div style="margin-top:6px;font-size:12px;color:var(--text-secondary);">
                    No se mostrarán registros legacy ni pólizas creadas sin evidencia.
                </div>
            </div>
        `;
        return;
    }

    if (CarteraState.status === 'READY' && CarteraState.filtered.length === 0) {
        container.innerHTML = `
            <div style="font-size:12px;color:var(--text-secondary);padding:4px 2px;">
                Sin coincidencias en la proyección actual.
            </div>
        `;
        return;
    }

    container.innerHTML = '';
}

function renderKPIs() {
    const total = document.getElementById('kpi-total-polizas');
    const premium = document.getElementById('kpi-total-prima');
    const conflicts = document.getElementById('kpi-conflictos');
    if (!total || !premium || !conflicts) {
        return;
    }

    if (CarteraState.status !== 'READY') {
        total.textContent = '—';
        premium.textContent = '—';
        conflicts.textContent = '—';
        return;
    }

    total.textContent = String(CarteraState.items.length);
    premium.textContent = summarizePremium(CarteraState.items);
    conflicts.textContent = String(
        CarteraState.items.filter(item => item.conflictState !== 'CLEAR').length
    );
}

function renderList() {
    const container = document.getElementById('cartera-list');
    if (!container) {
        return;
    }

    if (CarteraState.status !== 'READY' || CarteraState.filtered.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = CarteraState.filtered.map(renderPolicyCard).join('');
}

function renderPolicyCard(item) {
    const participants = participantLabels(item);
    const participantText = participants.length > 0
        ? participants.join(' · ')
        : 'Participantes generales no disponibles';
    const conflict = item.conflictState !== 'CLEAR';

    return `
        <article class="glass-widget" data-policy-reference="${escapeHTML(item.policyReference)}" style="padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="min-width:0;">
                    <h3 style="margin:0;font-size:15px;font-weight:800;overflow-wrap:anywhere;">
                        ${escapeHTML(item.productReference)}
                    </h3>
                    <div style="margin-top:4px;font-size:12px;color:var(--text-secondary);overflow-wrap:anywhere;">
                        ${escapeHTML(item.policyReference)} · ${escapeHTML(item.carrierReference)}
                    </div>
                </div>
                <span style="font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));text-align:right;">
                    ${escapeHTML(statusLabel(item))}
                </span>
            </div>

            <div style="margin-top:12px;font-size:13px;font-weight:700;overflow-wrap:anywhere;">
                ${escapeHTML(participantText)}
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:13px;">
                <div>
                    <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Prima</div>
                    <div style="margin-top:4px;font-size:13px;font-weight:800;overflow-wrap:anywhere;">${escapeHTML(formatMoneyFact(item))}</div>
                </div>
                <div>
                    <div style="font-size:10px;color:var(--text-secondary);font-weight:800;text-transform:uppercase;">Vigencia / fuente</div>
                    <div style="margin-top:4px;font-size:12px;font-weight:700;">${escapeHTML(formatDate(item.policyEffectiveFrom || item.statusAsOf))}</div>
                </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:13px;">
                <span style="font-size:10px;padding:4px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">
                    ${escapeHTML(item.completenessState)}
                </span>
                <span style="font-size:10px;padding:4px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));">
                    ${escapeHTML(item.freshnessState)}
                </span>
                ${conflict ? `
                    <span style="font-size:10px;padding:4px 7px;border-radius:999px;background:var(--surface-variant,rgba(255,255,255,.08));font-weight:800;">
                        REQUIERE REVISIÓN
                    </span>
                ` : ''}
            </div>

            <button
                type="button"
                data-policy-open="${escapeHTML(item.policyReference)}"
                class="glass-button"
                style="width:100%;margin-top:14px;min-height:42px;"
            >
                Ver detalle canónico
            </button>
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

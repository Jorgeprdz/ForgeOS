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

    CarteraState.items = [];
    CarteraState.filtered = [];
    CarteraState.search = '';
    CarteraState.status = 'LOADING';
    CarteraState.errorCode = null;

    const onSearch = debounce(event => {
        CarteraState.search = event.target.value;
        applyFilter();
    });

    searchInput.addEventListener('input', onSearch);
    Memory.add(() => {
        searchInput.removeEventListener('input', onSearch);
        onSearch.cancel();
    });

    renderRouteState();
    renderKPIs();
    EventBus.emit('cartera:loading', { authority: 'CANONICAL_POLICY' });

    try {
        const service = createCanonicalPortfolioService();
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
        </article>
    `;
}

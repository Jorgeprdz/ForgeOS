import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { createCartera030dPolicyPaymentCalendarService } from './cartera-030d-policy-payment-calendar-service.js';
import { renderCartera030dPolicyPaymentCalendar } from '../../platform/policy-intelligence/calendar/cartera-030d-policy-payment-calendar-view.js';

const state = {
    portfolioStatus: 'IDLE',
    portfolioCalendar: null,
    portfolioErrorCode: null,
    policyReference: null,
    policyStatus: 'IDLE',
    policyCalendar: null,
    policyErrorCode: null,
};

function ensurePortfolioHost() {
    const root = document.getElementById('cartera-root');
    if (!root) return null;
    let host = document.getElementById('cartera-payment-calendar-panel');
    if (!host) {
        host = document.createElement('div');
        host.id = 'cartera-payment-calendar-panel';
        host.style.marginBottom = '18px';
        const detail = document.getElementById('cartera-detail-panel');
        root.insertBefore(host, detail || root.children[1] || null);
    }
    return host;
}

function ensurePolicyHost() {
    const detailPanel = document.getElementById('cartera-detail-panel');
    const detailSection = detailPanel?.querySelector(':scope > section');
    if (!detailSection) return null;
    let host = detailSection.querySelector('[data-cartera-policy-payment-calendar-host]');
    if (!host) {
        host = document.createElement('div');
        host.dataset.carteraPolicyPaymentCalendarHost = 'true';
        host.style.marginTop = '20px';
        const timeline = detailSection.querySelector('[data-policy-timeline]')?.parentElement;
        detailSection.insertBefore(host, timeline || null);
    }
    return host;
}

function renderPortfolio() {
    const host = ensurePortfolioHost();
    if (!host) return;
    host.innerHTML = renderCartera030dPolicyPaymentCalendar({
        status: state.portfolioStatus,
        calendar: state.portfolioCalendar,
        errorCode: state.portfolioErrorCode,
        scope: 'PORTFOLIO',
    });
}

function renderPolicy() {
    const host = ensurePolicyHost();
    if (!host) return;
    host.innerHTML = renderCartera030dPolicyPaymentCalendar({
        status: state.policyStatus,
        calendar: state.policyCalendar,
        errorCode: state.policyErrorCode,
        scope: 'POLICY',
    });
}

async function loadPortfolio(service) {
    state.portfolioStatus = 'LOADING';
    state.portfolioErrorCode = null;
    renderPortfolio();
    try {
        state.portfolioCalendar = await service.loadCalendar();
        state.portfolioStatus = 'READY';
        AppState.set('cartera:paymentCalendar', state.portfolioCalendar);
        renderPortfolio();
        EventBus.emit('cartera:payment-calendar-mounted', {
            scope: 'PORTFOLIO',
            count: state.portfolioCalendar.items.length,
            readOnly: true,
        });
    } catch (error) {
        state.portfolioStatus = 'ERROR';
        state.portfolioErrorCode = error?.code || error?.message || 'CARTERA030D_PORTFOLIO_CALENDAR_FAILED';
        Logger.error('[CARTERA 030D PORTFOLIO CALENDAR ERROR]', error);
        renderPortfolio();
    }
}

async function loadPolicy(service, policyReference) {
    state.policyReference = policyReference;
    state.policyStatus = 'LOADING';
    state.policyErrorCode = null;
    state.policyCalendar = null;
    renderPolicy();
    try {
        const calendar = await service.loadCalendar({ policyReference });
        if (state.policyReference !== policyReference) return;
        state.policyCalendar = calendar;
        state.policyStatus = 'READY';
        AppState.set('cartera:selectedPolicyPaymentCalendar', calendar);
        renderPolicy();
        EventBus.emit('cartera:payment-calendar-mounted', {
            scope: 'POLICY',
            policyReference,
            count: calendar.items.length,
            readOnly: true,
        });
    } catch (error) {
        if (state.policyReference !== policyReference) return;
        state.policyStatus = 'ERROR';
        state.policyErrorCode = error?.code || error?.message || 'CARTERA030D_POLICY_CALENDAR_FAILED';
        Logger.error('[CARTERA 030D POLICY CALENDAR ERROR]', error);
        renderPolicy();
    }
}

export function bindCartera030dPolicyPaymentCalendar({ service } = {}) {
    const resolvedService = service || createCartera030dPolicyPaymentCalendarService();
    const root = document.getElementById('cartera-root');
    if (!root) return;

    state.portfolioStatus = 'IDLE';
    state.portfolioCalendar = null;
    state.portfolioErrorCode = null;
    state.policyReference = null;
    state.policyStatus = 'IDLE';
    state.policyCalendar = null;
    state.policyErrorCode = null;

    const unsubscribers = [
        EventBus.on('cartera:mounted', () => loadPortfolio(resolvedService)),
        EventBus.on('cartera:policy-detail-loading', ({ policyReference }) => {
            state.policyReference = policyReference;
            state.policyStatus = 'LOADING';
            state.policyCalendar = null;
            state.policyErrorCode = null;
        }),
        EventBus.on('cartera:policy-detail-mounted', ({ policyReference }) => {
            loadPolicy(resolvedService, policyReference);
        }),
        EventBus.on('cartera:policy-detail-error', () => {
            state.policyStatus = 'IDLE';
            state.policyCalendar = null;
        }),
    ];

    const onClick = event => {
        const button = event.target.closest('[data-calendar-policy-open]');
        if (!button) return;
        const reference = button.dataset.calendarPolicyOpen;
        const target = [...root.querySelectorAll('[data-policy-open]')]
            .find(candidate => candidate.dataset.policyOpen === reference);
        target?.click();
    };
    root.addEventListener('click', onClick);
    ensurePortfolioHost();
    renderPortfolio();

    Memory.add(() => {
        root.removeEventListener('click', onClick);
        unsubscribers.forEach(unsubscribe => unsubscribe());
        state.policyReference = null;
    });
}

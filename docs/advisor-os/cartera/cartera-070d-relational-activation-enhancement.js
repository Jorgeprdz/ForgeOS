import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { createCartera070RelationalActivationService } from './cartera-070c-relational-activation-service.js';
import { renderCartera070RelationalActivation } from '../../platform/experience-engine/cartera-070d-relational-activation-view.js';

const state = { status: 'IDLE', deck: null, availableMinutes: 60, errorCode: null };

function ensureHost() {
    const root = document.getElementById('cartera-root');
    if (!root) return null;
    let host = document.getElementById('cartera-relational-activation-panel');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'cartera-relational-activation-panel';
    host.setAttribute('aria-live', 'polite');
    const detail = document.getElementById('cartera-detail-panel');
    root.insertBefore(host, detail || root.firstChild);
    return host;
}

function render() {
    const host = ensureHost();
    if (host) host.innerHTML = renderCartera070RelationalActivation(state);
}

async function load(service) {
    state.status = 'LOADING';
    state.errorCode = null;
    render();
    try {
        state.deck = await service.loadActivationDeck({ availableMinutes: state.availableMinutes, maxCards: 4 });
        state.status = 'READY';
        AppState.set('cartera:relationalActivation', state.deck);
        render();
        EventBus.emit('cartera:relational-activation-mounted', {
            cardCount: state.deck.items.length,
            availableMinutes: state.availableMinutes,
            readOnly: true,
            finalPriorityTruth: false,
            automaticContact: false,
            automaticMessage: false,
            automaticTask: false,
            automaticCalendar: false,
            automaticOpportunity: false,
            variableReward: false,
        });
    } catch (error) {
        state.status = 'ERROR';
        state.errorCode = error?.code || error?.message || 'CARTERA070_ACTIVATION_FAILED';
        Logger.error('[CARTERA 070 ACTIVATION ERROR]', error);
        render();
    }
}

export function bindCartera070RelationalActivation({ service } = {}) {
    const root = document.getElementById('cartera-root');
    if (!root) return;
    const resolvedService = service || createCartera070RelationalActivationService();
    ensureHost();

    const onClick = event => {
        const capacity = event.target.closest('[data-activation-capacity]');
        if (capacity) {
            state.availableMinutes = Number(capacity.dataset.activationCapacity) || 60;
            load(resolvedService);
            return;
        }
        if (event.target.closest('[data-activation-refresh]')) {
            load(resolvedService);
            return;
        }
        const prepare = event.target.closest('[data-activation-prepare]');
        if (prepare && state.deck) {
            const card = state.deck.items.find(item => item.actionReference === prepare.dataset.activationPrepare);
            const envelope = resolvedService.prepareActionReview(card);
            const target = root.querySelector(`[data-activation-review-state="${CSS.escape(prepare.dataset.activationPrepare)}"]`);
            if (target) target.textContent = 'Preparada para tu confirmación. Todavía no se ejecutó ninguna acción.';
            EventBus.emit('cartera:relational-activation-reviewed', {
                actionReference: envelope.actionReference,
                actionClass: envelope.actionClass,
                executionAuthorized: false,
                contactExecuted: false,
                messageSent: false,
                taskCreated: false,
                calendarEventCreated: false,
                opportunityCreated: false,
            });
        }
    };

    root.addEventListener('click', onClick);
    const unsubscribers = [
        EventBus.on('cartera:mounted', () => load(resolvedService)),
        EventBus.on('cartera:future-radar-mounted', () => load(resolvedService)),
        EventBus.on('cartera:relationship-growth-mounted', () => load(resolvedService)),
        EventBus.on('cartera:relationship-memory-recorded', () => load(resolvedService)),
    ];
    load(resolvedService);

    Memory.add(() => {
        root.removeEventListener('click', onClick);
        unsubscribers.forEach(unsubscribe => unsubscribe());
        state.status = 'IDLE';
        state.deck = null;
        state.availableMinutes = 60;
        state.errorCode = null;
        AppState.set('cartera:relationalActivation', null);
        document.getElementById('cartera-relational-activation-panel')?.remove();
    });
}

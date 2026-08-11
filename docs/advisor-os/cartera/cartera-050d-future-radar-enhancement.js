import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { createCartera050FutureRadarService } from './cartera-050a-future-radar-service.js';
import { renderCartera050FutureRadar } from '../../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';

const state = {
    status: 'IDLE',
    radar: null,
    horizon: 'ALL',
    errorCode: null,
};

function root() {
    return document.getElementById('cartera-root');
}

function ensureHost() {
    const carteraRoot = root();
    if (!carteraRoot) return null;
    let host = document.getElementById('cartera-future-radar-panel');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'cartera-future-radar-panel';
    host.setAttribute('aria-live', 'polite');
    const detail = document.getElementById('cartera-detail-panel');
    carteraRoot.insertBefore(host, detail || carteraRoot.firstChild);
    return host;
}

function render() {
    const host = ensureHost();
    if (!host) return;
    host.innerHTML = renderCartera050FutureRadar({ ...state });
}

async function loadRadar(service) {
    state.status = 'LOADING';
    state.errorCode = null;
    render();
    try {
        const radar = await service.loadFutureRadar({
            asOfDate: new Date().toISOString().slice(0, 10),
            timezone: 'America/Mexico_City',
        });
        state.radar = radar;
        state.status = 'READY';
        AppState.set('cartera:futureRadar', radar);
        render();
        EventBus.emit('cartera:future-radar-mounted', {
            itemCount: radar.items.length,
            focusCount: radar.focusItems.length,
            readOnly: true,
            automaticContact: false,
            automaticOpportunity: false,
            finalMessageGenerated: false,
            finalPriorityTruth: false,
        });
    } catch (error) {
        state.status = 'ERROR';
        state.errorCode = error?.code || error?.message || 'CARTERA050_RADAR_FAILED';
        Logger.error('[CARTERA 050 FUTURE RADAR ERROR]', error);
        render();
        EventBus.emit('cartera:future-radar-error', { code: state.errorCode });
    }
}

export function bindCartera050FutureRadar({ service } = {}) {
    const carteraRoot = root();
    if (!carteraRoot) return;
    const resolvedService = service || createCartera050FutureRadarService();
    ensureHost();

    const onClick = event => {
        const horizon = event.target.closest('[data-radar-horizon]');
        if (horizon) {
            state.horizon = horizon.dataset.radarHorizon || 'ALL';
            render();
            EventBus.emit('cartera:future-radar-horizon-changed', {
                horizon: state.horizon,
                execution: false,
            });
            return;
        }
        if (event.target.closest('[data-radar-refresh]')) {
            loadRadar(resolvedService);
        }
    };

    carteraRoot.addEventListener('click', onClick);
    const unsubscribers = [
        EventBus.on('cartera:mounted', () => loadRadar(resolvedService)),
        EventBus.on('cartera:relationship-memory-recorded', () => loadRadar(resolvedService)),
    ];

    loadRadar(resolvedService);

    Memory.add(() => {
        carteraRoot.removeEventListener('click', onClick);
        unsubscribers.forEach(unsubscribe => unsubscribe());
        state.status = 'IDLE';
        state.radar = null;
        state.horizon = 'ALL';
        state.errorCode = null;
        AppState.set('cartera:futureRadar', null);
        document.getElementById('cartera-future-radar-panel')?.remove();
    });
}

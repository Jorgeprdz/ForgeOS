import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { createCartera060RelationshipGrowthService } from './cartera-060c-relationship-growth-service.js';
import { renderCartera060GrowthReview } from '../../platform/relationship-intelligence/cartera-060d-growth-review-view.js';

const state = { status: 'IDLE', growth: null, filter: 'ALL', errorCode: null };

function ensureHost() {
    const root = document.getElementById('cartera-root');
    if (!root) return null;
    let host = document.getElementById('cartera-growth-review-panel');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'cartera-growth-review-panel';
    host.setAttribute('aria-live', 'polite');
    const detail = document.getElementById('cartera-detail-panel');
    root.insertBefore(host, detail || root.firstChild);
    return host;
}

function render() {
    const host = ensureHost();
    if (host) host.innerHTML = renderCartera060GrowthReview(state);
}

async function load(service) {
    state.status = 'LOADING';
    state.errorCode = null;
    render();
    try {
        state.growth = await service.loadGrowthReviews();
        state.status = 'READY';
        AppState.set('cartera:relationshipGrowth', state.growth);
        render();
        EventBus.emit('cartera:relationship-growth-mounted', {
            candidateCount: state.growth.items.length,
            readOnly: true,
            automaticOpportunity: false,
            automaticContact: false,
            referralRequestExecuted: false,
            finalMessageGenerated: false,
            finalPriorityTruth: false,
        });
    } catch (error) {
        state.status = 'ERROR';
        state.errorCode = error?.code || error?.message || 'CARTERA060_GROWTH_FAILED';
        Logger.error('[CARTERA 060 GROWTH ERROR]', error);
        render();
    }
}

export function bindCartera060RelationshipGrowth({ service } = {}) {
    const root = document.getElementById('cartera-root');
    if (!root) return;
    const resolvedService = service || createCartera060RelationshipGrowthService();
    ensureHost();

    const onClick = event => {
        const filter = event.target.closest('[data-growth-filter]');
        if (filter) {
            state.filter = filter.dataset.growthFilter || 'ALL';
            render();
            return;
        }
        if (event.target.closest('[data-growth-refresh]')) {
            load(resolvedService);
            return;
        }
        const review = event.target.closest('[data-growth-review]');
        if (review && state.growth) {
            const candidate = state.growth.items.find(item => item.candidateReference === review.dataset.growthReview);
            const envelope = resolvedService.preparePipelineReview(candidate);
            const target = root.querySelector(`[data-growth-review-state="${CSS.escape(review.dataset.growthReview)}"]`);
            if (target) {
                target.textContent = envelope.eligible
                    ? 'Lista para revisión del asesor. Aún no se creó ninguna oportunidad.'
                    : envelope.reason;
            }
            EventBus.emit('cartera:relationship-growth-reviewed', {
                candidateReference: review.dataset.growthReview,
                eligible: envelope.eligible,
                opportunityCreated: false,
                automaticContact: false,
                referralRequested: false,
            });
        }
    };

    root.addEventListener('click', onClick);
    const unsubscribers = [
        EventBus.on('cartera:mounted', () => load(resolvedService)),
        EventBus.on('cartera:relationship-memory-recorded', () => load(resolvedService)),
        EventBus.on('cartera:future-radar-mounted', () => load(resolvedService)),
    ];
    load(resolvedService);

    Memory.add(() => {
        root.removeEventListener('click', onClick);
        unsubscribers.forEach(unsubscribe => unsubscribe());
        state.status = 'IDLE';
        state.growth = null;
        state.filter = 'ALL';
        state.errorCode = null;
        AppState.set('cartera:relationshipGrowth', null);
        document.getElementById('cartera-growth-review-panel')?.remove();
    });
}

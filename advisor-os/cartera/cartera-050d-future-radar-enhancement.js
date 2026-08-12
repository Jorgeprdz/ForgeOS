import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { SupabaseRuntime } from '../../supabase-runtime.js';
import { createCartera050FutureRadarService } from './cartera-050a-future-radar-service.js';
import { renderCartera050FutureRadar } from '../../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';
import { createAuraDecisionControl } from '../../platform/event-evidence/recommendation-decision-control-017c.js';
import { createAuraPresentationEvidenceControl } from '../../platform/event-evidence/recommendation-presentation-control-017e.js';
import {
    setRecommendationDecisionLineage,
    clearRecommendationDecisionLineage,
} from '../../platform/event-evidence/recommendation-lineage-session-017e.js';

const state = {
    status: 'IDLE',
    radar: null,
    horizon: 'ALL',
    errorCode: null,
    actionableSignalReference: null,
    decisionState: null,
    presentationState: null,
    operationState: null,
};

let controls = null;
let controlsUser = null;

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

function eligiblePaymentRecommendation(item) {
    return Boolean(
        item
        && item.signalType === 'UNCONFIRMED_PAYMENT_EVIDENCE'
        && item.sourceAuthority === 'PAYMENT_OBLIGATION'
        && item.policyReference
        && item.sourceRecordReference
        && item.signalReference
        && item.smallestUsefulAction === 'Revisar la evidencia y confirmar o rechazar el pago.'
    );
}

function selectedItem() {
    return (state.radar?.items || []).find(eligiblePaymentRecommendation) || null;
}

function recommendationModel(item) {
    if (!eligiblePaymentRecommendation(item)) throw new Error('CARTERA_017E_RECOMMENDATION_NOT_ACTION_ADDRESSABLE');
    return Object.freeze({
        ...item,
        decisionReference: item.signalReference,
        recommendationVersion: item.signalReference,
        sourceDomain: 'CARTERA',
        subject: Object.freeze({ type: 'POLICY', reference: item.policyReference }),
        commercialPersonReference: item.personReference || null,
        policyReference: item.policyReference,
        signalReference: item.signalReference,
        paymentObligationReference: item.sourceRecordReference,
        actionAddressable: true,
        actionOwner: 'CARTERA_030C',
        actionTarget: Object.freeze({ type: 'PAYMENT_OBLIGATION', reference: item.sourceRecordReference }),
        expectedAction: 'CONFIRM_PAYMENT',
    });
}

async function ensureControls() {
    const client = SupabaseRuntime.getClient();
    const auth = await client.auth.getUser();
    if (auth?.error || !auth?.data?.user?.id) throw new Error('CARTERA_017E_AUTH_REQUIRED');
    const user = auth.data.user;
    if (controls && controlsUser === user.id) return controls;
    await controls?.decision?.close?.();
    await controls?.presentation?.close?.();
    controlsUser = user.id;
    controls = Object.freeze({
        client,
        user,
        decision: createAuraDecisionControl({ client, user }),
        presentation: createAuraPresentationEvidenceControl({ client, user }),
    });
    return controls;
}

function applyLineage(event, item, userId) {
    if (event?.payload?.decision !== 'ACCEPTED') {
        clearRecommendationDecisionLineage(userId);
        return;
    }
    setRecommendationDecisionLineage({
        advisorId: userId,
        recommendationReference: event.payload.recommendation_reference,
        recommendationVersion: event.payload.recommendation_version,
        decisionEventId: event.event_id,
        decisionOccurredAt: event.occurred_at,
        decision: 'ACCEPTED',
        subjectType: 'POLICY',
        subjectReference: item.policyReference,
        actionOwner: 'CARTERA_030C',
        actionTarget: item.sourceRecordReference,
    });
}

async function hydrateActionableRecommendation() {
    const item = selectedItem();
    state.actionableSignalReference = item?.signalReference || null;
    state.decisionState = null;
    state.presentationState = null;
    state.operationState = null;
    render();
    if (!item) return;

    const host = ensureHost();
    const rendered = [...(host?.querySelectorAll?.('[data-radar-signal-reference]') || [])]
        .some(node => node.dataset.radarSignalReference === item.signalReference);
    if (!rendered) return;

    try {
        const api = await ensureControls();
        const model = recommendationModel(item);
        try {
            await api.presentation.present(model, { presentationSurface: 'AURA_CARTERA' });
            state.presentationState = 'PERSISTED';
        } catch (error) {
            state.presentationState = 'UNAVAILABLE';
            Logger.error('[CARTERA 017E PRESENTATION EVIDENCE ERROR]', error);
        }
        try {
            await api.decision.read();
            const existing = api.decision.latest(model.decisionReference);
            state.decisionState = existing?.payload?.decision || null;
            if (existing) applyLineage(existing, item, api.user.id);
        } catch (error) {
            Logger.error('[CARTERA 017E DECISION READ ERROR]', error);
        }
        render();
    } catch (error) {
        Logger.error('[CARTERA 017E ACTIONABLE RECOMMENDATION ERROR]', error);
        state.presentationState = 'UNAVAILABLE';
        render();
    }
}

async function loadRadar(service) {
    state.status = 'LOADING';
    state.errorCode = null;
    state.actionableSignalReference = null;
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
        await hydrateActionableRecommendation();
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
        const decisionButton = event.target.closest('[data-radar-decision]');
        if (decisionButton) {
            const item = selectedItem();
            if (!item || decisionButton.dataset.radarSignal !== item.signalReference) return;
            event.preventDefault();
            const intent = decisionButton.dataset.radarDecision;
            state.operationState = 'SAVING';
            render();
            void (async () => {
                try {
                    const api = await ensureControls();
                    const result = await api.decision.decide(recommendationModel(item), intent);
                    state.decisionState = result.event?.payload?.decision || null;
                    applyLineage(result.event, item, api.user.id);
                } catch (error) {
                    Logger.error('[CARTERA 017E DECISION ERROR]', error);
                } finally {
                    state.operationState = null;
                    render();
                }
            })();
            return;
        }
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
        state.actionableSignalReference = null;
        state.decisionState = null;
        state.presentationState = null;
        state.operationState = null;
        AppState.set('cartera:futureRadar', null);
        document.getElementById('cartera-future-radar-panel')?.remove();
    });
}

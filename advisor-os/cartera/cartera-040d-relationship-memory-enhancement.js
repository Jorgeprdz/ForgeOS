import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { createCartera040RelationshipMemoryService } from './cartera-040a-relationship-memory-service.js';
import { renderCartera040RelationshipBrief } from '../../platform/relationship-intelligence/cartera-040d-relationship-brief-view.js';

const state = {
    personReference: null,
    status: 'IDLE',
    brief: null,
    errorCode: null,
    recordStatus: 'IDLE',
};

function panel() {
    return document.getElementById('cartera-detail-panel');
}

function render() {
    const host = panel();
    if (!host) return;
    host.innerHTML = renderCartera040RelationshipBrief({
        status: state.status,
        brief: state.brief,
        errorCode: state.errorCode,
        recordStatus: state.recordStatus,
    });
}

function decoratePersonCards() {
    const root = document.getElementById('cartera-root');
    if (!root) return;
    root.querySelectorAll(
        '[data-directory-kind="COMMERCIAL_PERSON"][data-directory-reference]'
    ).forEach(card => {
        if (card.querySelector('[data-relationship-open]')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'glass-button';
        button.dataset.relationshipOpen = card.dataset.directoryReference;
        button.style.width = '100%';
        button.style.marginTop = '14px';
        button.style.minHeight = '42px';
        button.textContent = 'Ver memoria de relación';
        card.appendChild(button);
    });
}

async function loadBrief(service, personReference) {
    state.personReference = personReference;
    state.status = 'LOADING';
    state.brief = null;
    state.errorCode = null;
    state.recordStatus = 'IDLE';
    render();

    try {
        const brief = await service.loadRelationshipBrief(personReference);
        if (state.personReference !== personReference) return;
        state.brief = brief;
        state.status = 'READY';
        AppState.set('cartera:selectedRelationship', brief);
        render();
        panel()?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        EventBus.emit('cartera:relationship-brief-mounted', {
            personReference,
            historyCount: brief.history.length,
            preferenceCount: brief.preferences.length,
            commitmentCount: brief.commitments.length,
            readOnlyProjection: true,
            automaticContact: false,
            automaticOpportunity: false,
        });
    } catch (error) {
        if (state.personReference !== personReference) return;
        state.status = 'ERROR';
        state.errorCode = error?.code || error?.message || 'CARTERA040_BRIEF_FAILED';
        Logger.error('[CARTERA 040 RELATIONSHIP BRIEF ERROR]', error);
        render();
        EventBus.emit('cartera:relationship-brief-error', {
            personReference,
            code: state.errorCode,
        });
    }
}

function closeBrief() {
    state.personReference = null;
    state.status = 'IDLE';
    state.brief = null;
    state.errorCode = null;
    state.recordStatus = 'IDLE';
    AppState.set('cartera:selectedRelationship', null);
    render();
}

function commandReference(prefix) {
    const id = globalThis.crypto?.randomUUID?.()
        || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}:${id}`.slice(0, 159);
}

async function recordMemory(service, form) {
    if (!state.personReference || state.status !== 'READY') return;
    const data = new FormData(form);
    const memoryKind = String(data.get('memoryKind') || '').trim().toUpperCase();
    const summary = String(data.get('summary') || '').trim();
    const evidenceReference = String(data.get('evidenceReference') || '').trim();
    const consentConfirmed = data.get('consentConfirmed') === 'on';
    const formState = form.querySelector('[data-relationship-memory-form-state]');

    if (memoryKind === 'LIFE_CONTEXT' && !consentConfirmed) {
        if (formState) {
            formState.textContent = 'El contexto de vida requiere consentimiento confirmado.';
        }
        return;
    }

    state.recordStatus = 'SAVING';
    if (formState) formState.textContent = 'Guardando memoria confirmada…';
    const sourceRecordReference = commandReference('CARTERA040:UI');
    const idempotencyKey = commandReference('CARTERA040:MEMORY');

    try {
        const result = await service.recordRelationshipMemory({
            personReference: state.personReference,
            memoryKind,
            summary,
            valueCode: null,
            occurredAt: new Date().toISOString(),
            sourceAuthority: 'ADVISOR_CONFIRMED',
            sourceRecordReference,
            evidenceReferences: [evidenceReference],
            sensitivity: memoryKind === 'LIFE_CONTEXT' ? 'SENSITIVE' : 'PERSONAL',
            consentState: memoryKind === 'LIFE_CONTEXT' ? 'CONFIRMED' : 'NOT_REQUIRED',
            contextUse: memoryKind === 'LIFE_CONTEXT'
                ? 'CONVERSATION_PREPARATION'
                : 'GENERAL_RELATIONSHIP',
            idempotencyKey,
            supersedesMemoryReference: null,
        });

        if (result.recordingState !== 'COMPLETE') {
            throw Object.assign(new Error(result.reason || 'CARTERA040_RECORD_CONFLICT'), {
                code: result.reason || 'CARTERA040_RECORD_CONFLICT',
            });
        }

        EventBus.emit('cartera:relationship-memory-recorded', {
            personReference: state.personReference,
            memoryReference: result.memoryReference,
            memoryKind,
            automaticContact: false,
            automaticOpportunity: false,
            finalMessageGenerated: false,
        });
        await loadBrief(service, state.personReference);
    } catch (error) {
        state.recordStatus = 'ERROR';
        Logger.error('[CARTERA 040 MEMORY RECORD ERROR]', error);
        if (formState) {
            formState.textContent = error?.code || error?.message || 'No se pudo guardar.';
        }
    }
}

export function bindCartera040RelationshipMemory({ service } = {}) {
    const root = document.getElementById('cartera-root');
    const list = document.getElementById('cartera-list');
    if (!root || !list) return;

    const resolvedService = service || createCartera040RelationshipMemoryService();
    closeBrief();

    const observer = new MutationObserver(() => decoratePersonCards());
    observer.observe(list, { childList: true, subtree: true });

    const onClick = event => {
        const open = event.target.closest('[data-relationship-open]');
        if (open) {
            loadBrief(resolvedService, open.dataset.relationshipOpen);
            return;
        }
        if (event.target.closest('[data-relationship-close]')) {
            closeBrief();
        }
    };

    const onSubmit = event => {
        const form = event.target.closest('[data-relationship-memory-form]');
        if (!form) return;
        event.preventDefault();
        recordMemory(resolvedService, form);
    };

    const unsubscribers = [
        EventBus.on('cartera:mounted', () => decoratePersonCards()),
        EventBus.on('cartera:policy-detail-loading', () => {
            state.personReference = null;
            state.brief = null;
            state.status = 'IDLE';
        }),
    ];

    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
    decoratePersonCards();

    Memory.add(() => {
        observer.disconnect();
        root.removeEventListener('click', onClick);
        root.removeEventListener('submit', onSubmit);
        unsubscribers.forEach(unsubscribe => unsubscribe());
        closeBrief();
    });
}

import { Memory } from '../../memory-manager.js';

await import('./sales-stage-registry.js');
await import('./pipeline-stage-read-model.js');
await import('./pipeline-ui.js');

const ROUTE_ID = 'advisor-sales-pipeline';
let activeMount = null;
let mountSequence = 0;

const pipelineUI = globalThis.ForgePipelineUI;
const pipelineReadModel = globalThis.ForgePipelineStageReadModel;

function normalizeContext(params = {}) {
    const contextType = ['prospect', 'opportunity'].includes(params.contextType)
        ? params.contextType
        : null;
    const contextId = typeof params.contextId === 'string' && params.contextId.trim()
        ? params.contextId.trim()
        : null;

    return { contextType, contextId };
}

function honestEmptyModel(context) {
    pipelineReadModel.buildPipelineStageReadModel({
        opportunities: [],
        prospects: [],
        writerAvailable: false,
        now: new Date().toISOString(),
    });

    if (context.contextType && context.contextId) {
        return {
            state: 'partial',
            message: `Pipeline está disponible, pero ${context.contextType === 'prospect' ? 'el prospecto' : 'la oportunidad'} ${context.contextId} no puede resolverse sin una fuente de persistencia canónica.`,
        };
    }

    return {
        state: 'empty',
        message: 'No hay oportunidades verificadas disponibles. La persistencia productiva continúa bloqueada hasta que exista una autoridad canónica.',
    };
}

export function renderAdvisorSalesPipeline() {
    return pipelineUI.renderPipelineUI({
        state: 'loading',
        message: 'Preparando el read model gobernado…',
    });
}

export async function bindAdvisorSalesPipeline(params = {}) {
    await new Promise(resolve => requestAnimationFrame(resolve));

    const root = document.querySelector('.forge-pipeline');
    if (!root) throw new Error('PIPELINE_LIVE_MOUNT_ROOT_MISSING');

    if (activeMount?.root === root) return;

    const context = normalizeContext(params);
    const mountId = ++mountSequence;
    root.outerHTML = pipelineUI.renderPipelineUI(honestEmptyModel(context));

    const mountedRoot = document.querySelector('.forge-pipeline');
    mountedRoot.dataset.routeId = ROUTE_ID;
    mountedRoot.dataset.pipelineMountId = String(mountId);
    mountedRoot.dataset.pipelineMountState = 'mounted';
    activeMount = { root: mountedRoot, mountId };

    const clickHandler = event => {
        const prospectButton = event.target.closest('[data-open-prospect]');
        if (!prospectButton) return;
        mountedRoot.querySelector('.forge-pipeline-state p').textContent =
            `El prospecto ${prospectButton.dataset.openProspect} no puede resolverse sin una fuente de persistencia canónica.`;
    };

    mountedRoot.addEventListener('click', clickHandler);
    Memory.add(() => {
        mountedRoot.removeEventListener('click', clickHandler);
        if (activeMount?.mountId === mountId) activeMount = null;
    });
}

export const PIPELINE_ROUTE_METADATA = Object.freeze({
    routeId: ROUTE_ID,
    domain: 'ADVISOR_OS',
    moduleId: 'advisor-os.sales-pipeline.live-route.067g16',
    title: 'Pipeline',
    navigation: { mobile: true, desktop: true },
    deepLink: { supported: true, contexts: ['prospect', 'opportunity'] },
});

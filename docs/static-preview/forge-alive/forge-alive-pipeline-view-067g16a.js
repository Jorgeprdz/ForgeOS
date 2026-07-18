import '../../advisor-os/sales-pipeline/sales-stage-registry.js';
import '../../advisor-os/sales-pipeline/pipeline-stage-read-model.js';
import '../../advisor-os/sales-pipeline/pipeline-ui.js';
import '../../advisor-os/sales-pipeline/productive-prospect-service.js';
import '../../advisor-os/sales-pipeline/productive-prospect-ui.js';
import '../../advisor-os/sales-pipeline/productive-prospect-bootstrap.js';

const VERSION = '067G16D_FORGE_ALIVE_PUBLIC_VIEW_V1';
const SUPPORTED_VIEWS = new Set(['inicio', 'pipeline', 'clientes', 'mas', 'alfred', 'reportes']);
const requestedView = () => {
  const requested = new URL(location.href).searchParams.get('nav') || 'inicio';
  if (requested === 'cotizaciones') return null;
  return SUPPORTED_VIEWS.has(requested) ? requested : 'inicio';
};
document.documentElement.setAttribute('data-forge-alive-static-view-067g16a', requestedView() || 'cotizaciones');
const MOBILE_HOME_SELECTORS = [
  ':scope > .safety-ribbon',
  ':scope > .hero',
  ':scope > .assistant-card',
  ':scope > .primary-card',
  '.command-orb-layer',
  ':scope > .forge-smart-widget-static-056u',
  ':scope > .grid',
  ':scope > .panel',
  ':scope > .desktop-menu-toggle',
  ':scope > .desktop-nav-drawer',
  ':scope > .desktop-context-toggle',
  ':scope > .desktop-context-rail',
  ':scope > .forge-mobile-context-nav-057d',
  ':scope > .forge-mobile-widget-grid-057j',
];

let host = null;
let currentView = 'inicio';
let pipelineMounted = false;
let navListenerCount = 0;
let productivePipeline = null;
let authListenerBound = false;

const shell = () => document.querySelector('.phone-shell');
const desktopWorkspace = () => document.querySelector('.forge-desktop-workspace-056y');
const desktopMain = () => document.querySelector('.dw-main-056y');
const desktopRail = () => document.querySelector('.dw-rail-056y');
const alternateDesktop = () => document.querySelector('.alfred-dashboard-056g7');
const visualNav = () => document.querySelector('[data-forge-mobile-nav-r16c5j]');

function markHomeNodes() {
  const root = shell();
  MOBILE_HOME_SELECTORS.forEach(selector => {
    root?.querySelectorAll(selector).forEach(node => {
      node.setAttribute('data-forge-static-home-node-067g16a', 'true');
      node.setAttribute('data-forge-static-home-node-067g16b', 'true');
    });
  });
  [desktopMain(), desktopRail(), alternateDesktop()].forEach(node => {
    if (node) node.setAttribute('data-forge-static-home-node-067g16a', 'true');
  });
}

function ensureHost() {
  if (host?.isConnected) return host;
  host = document.createElement('section');
  host.className = 'forge-alive-primary-view-067g16a';
  host.setAttribute('data-forge-alive-primary-outlet-067g16a', 'true');
  host.setAttribute('data-forge-alive-pipeline-view-067g16a', 'true');
  host.setAttribute('aria-live', 'polite');
  host.hidden = true;
  placeHost();
  return host;
}

function placeHost() {
  if (!host) return;
  if (matchMedia('(min-width: 901px)').matches && desktopWorkspace()) {
    desktopWorkspace().append(host);
    return;
  }
  const quoteHost = document.querySelector('[data-forge-saas-module-host-r16c5l]');
  shell()?.insertBefore(host, quoteHost || visualNav());
}

function setHomeActive(active) {
  document.querySelectorAll('[data-forge-static-home-node-067g16a], [data-forge-static-home-node-067g16b]').forEach(node => {
    node.hidden = !active;
    node.setAttribute('aria-hidden', active ? 'false' : 'true');
    if (active) node.removeAttribute('inert');
    else node.setAttribute('inert', '');
  });
}

function syncNav(view) {
  globalThis.ForgeMobileNavInstantAuthorityR16J1C1?.sync(view);
  document.querySelectorAll('[data-forge-static-view], [data-forge-primary-nav-key]').forEach(node => {
    const key = node.dataset.forgeStaticView || node.dataset.forgePrimaryNavKey;
    const active = key === view;
    node.classList.toggle('active', active);
    node.classList.toggle('is-active', active);
    if (active) node.setAttribute('aria-current', 'page');
    else node.removeAttribute('aria-current');
  });
}

function updateUrl(view, historyMode = 'push') {
  const url = new URL(location.href);
  const current = url.searchParams.get('nav') || 'inicio';
  url.searchParams.delete('module');
  url.searchParams.set('nav', view);
  url.searchParams.set('v', '067g16d-1');
  if (current === view) history.replaceState({ forgeAliveView: view }, '', url);
  else history[historyMode === 'replace' ? 'replaceState' : 'pushState']({ forgeAliveView: view }, '', url);
}

function pipelineModel(context = {}) {
  globalThis.ForgePipelineStageReadModel.buildPipelineStageReadModel({
    opportunities: [],
    prospects: [],
    writerAvailable: false,
    now: new Date().toISOString(),
  });
  if (context.contextType && context.contextId) {
    return {
      state: 'partial',
      message: `Pipeline abrió, pero ${context.contextType === 'prospect' ? 'el prospecto' : 'la oportunidad'} ${context.contextId} no puede resolverse sin persistencia canónica.`,
    };
  }
  return {
    state: 'empty',
    message: 'No hay oportunidades verificadas disponibles. La persistencia productiva continúa bloqueada.',
  };
}

async function renderPipeline(context) {
  const outlet = ensureHost();
  if (!pipelineMounted) {
    outlet.innerHTML = globalThis.ForgePipelineUI.renderPipelineUI({
      state: 'loading',
      message: 'Preparando el read model gobernado…',
    });
    pipelineMounted = true;
    outlet.dataset.pipelineMountCount = '1';
  }
  const config = globalThis.ForgeAlivePublicConfig067G17A1?.current?.();
  if (config?.state === 'READY' && globalThis.ForgeAlivePublicConfig067G17A1?.allowsProductiveProspectCrud?.()) {
    try {
      if (!productivePipeline) {
        const client = await globalThis.ForgeProductiveProspectBootstrap067G17B.getClient();
        productivePipeline = globalThis.ForgeProductiveProspectUI067G17B.create({ client, root: outlet });
      }
      await productivePipeline.load();
    } catch (error) {
      console.error('[067G17B PRODUCTIVE PIPELINE]', error?.code || 'BOOTSTRAP_FAILED');
      outlet.innerHTML = globalThis.ForgePipelineUI.renderPipelineUI({
        state:'error',
        message:'No pudimos iniciar la fuente productiva del Pipeline. Intenta nuevamente.'
      });
    }
  } else {
    const model = config?.state === 'DEMO_EXPLICIT'
      ? pipelineModel(context)
      : { state:'error', message:'No pudimos iniciar la fuente productiva del Pipeline. Revisa la configuración pública.' };
    outlet.innerHTML = globalThis.ForgePipelineUI.renderPipelineUI(model);
  }
  outlet.querySelector('.forge-pipeline').dataset.routeId = 'advisor-sales-pipeline';
  outlet.dataset.activeStaticView = 'pipeline';
}

function renderPlaceholder(view) {
  const labels = { clientes:'Clientes', mas:'Más', alfred:'Alfred', reportes:'Reportes' };
  const outlet = ensureHost();
  outlet.innerHTML = `<section class="forge-pipeline-state forge-pipeline-state--partial" role="status"><h1>${labels[view]}</h1><p>Esta vista conserva su estado seguro de muestra. Su módulo operativo no forma parte de 067G16A.</p></section>`;
  outlet.dataset.activeStaticView = view;
}

async function open(view, options = {}) {
  const requested = SUPPORTED_VIEWS.has(view) ? view : null;
  if (!requested) return false;
  try {
    if (
      document.body.dataset.forgeSaasActiveModuleR16c5l === 'cotizaciones'
    ) {
      globalThis.ForgeSaasRouterR16C5L?.closeNewQuote({
        history:false,
        targetKey:requested,
      });
    }
    markHomeNodes();
    ensureHost();
    if (requested === 'inicio') {
      host.hidden = true;
      host.setAttribute('aria-hidden', 'true');
      host.setAttribute('inert', '');
      setHomeActive(true);
    } else {
      if (requested === 'pipeline') await renderPipeline(options);
      else renderPlaceholder(requested);
      setHomeActive(false);
      host.hidden = false;
      host.setAttribute('aria-hidden', 'false');
      host.removeAttribute('inert');
      scrollTo({ top:0, behavior:'instant' });
    }
    if (requested === 'pipeline') {
      const heading = host.querySelector('#forge-pipeline-title');
      if (!heading || heading.textContent.trim() !== 'Pipeline de ventas' || !heading.getClientRects().length) {
        throw new Error('PIPELINE_CANONICAL_HEADING_NOT_VISIBLE');
      }
    }
    currentView = requested;
    document.documentElement.setAttribute('data-forge-alive-static-view-067g16a', requested);
    syncNav(requested);
    if (options.updateUrl !== false) updateUrl(requested, options.historyMode);
    return true;
  } catch (error) {
    console.error('[067G16A STATIC VIEW]', error);
    setHomeActive(true);
    if (host) {
      host.hidden = true;
      host.setAttribute('aria-hidden', 'true');
      host.setAttribute('inert', '');
    }
    currentView = 'inicio';
    syncNav('inicio');
    return false;
  }
}

function bind() {
  if (document.documentElement.getAttribute('data-forge-alive-static-view-bound-067g16a') === 'true') return;
  document.documentElement.setAttribute('data-forge-alive-static-view-bound-067g16a', 'true');
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-forge-static-open-pipeline]');
    const desktop = event.target.closest('[data-forge-static-view]');
    if (!action && !desktop) return;
    const view = action ? 'pipeline' : desktop.dataset.forgeStaticView;
    if (!SUPPORTED_VIEWS.has(view)) return;
    event.preventDefault();
    void open(view, {
      updateUrl:true,
      historyMode:'push',
      contextType:action?.dataset.forgeContextType || null,
      contextId:action?.dataset.forgeContextId || null,
    });
  });
  navListenerCount = 1;
  addEventListener('resize', placeHost, { passive:true });
  addEventListener('popstate', () => void open(requestedView(), { updateUrl:false }));
  addEventListener('pageshow', () => void open(requestedView(), { updateUrl:false }), { passive:true });
  addEventListener('load', () => void open(requestedView(), { updateUrl:false }), { once:true });
  if (!authListenerBound) {
    authListenerBound = true;
    addEventListener('forge:auth-state-changed', event => {
      if (currentView !== 'pipeline') return;
      if (!['authenticated', 'anonymous'].includes(event.detail?.status)) return;
      productivePipeline = null;
      void renderPipeline({});
    });
  }
}

function init() {
  markHomeNodes();
  ensureHost();
  bind();
  void open(requestedView(), { updateUrl:false });
}

globalThis.ForgeAliveStaticView067G16A = Object.freeze({
  version:VERSION,
  open,
  current:() => currentView,
  diagnostics:() => ({ currentView, pipelineMounted, pipelineMountCount:Number(host?.dataset.pipelineMountCount || 0), navListenerCount }),
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
else init();

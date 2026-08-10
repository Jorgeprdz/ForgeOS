import { createAuraAuth } from './aura-auth-v4.js';
import { installPipelineJournalAura } from './pipeline/pipeline-journal-aura-011e.js?v=forge-aura-live-acceptance-journal-cartera-011e';
import { installCarteraPaymentAura } from './cartera/cartera-payment-aura-011c.js?v=forge-aura-commercial-loop-011c';

const RUNTIME_ID = 'FORGE_AURA_PRODUCTIVE_COMMERCIAL_LOOP_011C';
const INSTALL_KEY = Symbol.for('forge.aura.commercial.loop.011c');

if (!globalThis[INSTALL_KEY]) {
  const auth = createAuraAuth();
  const getClient = () => auth.getClient();
  const documentRef = globalThis.document;
  let desktopQuoteLink = null;
  let diagnosticsObserver = null;
  let shellObserver = null;
  let diagnosticsScheduled = false;

  function nativeNavigate(route) {
    globalThis.dispatchEvent(new CustomEvent('forge:alfred-navigation', { detail: { route } }));
  }

  function ensureDesktopQuotes() {
    const nav = documentRef.querySelector('[data-aura-app] .aura-nav');
    if (!nav) return;
    const existing = nav.querySelector('[data-aura-route-link="cotizaciones"], [data-aura-desktop-quotes="011c"]');
    if (existing) {
      desktopQuoteLink = existing;
      return;
    }

    const link = documentRef.createElement('a');
    link.href = '?route=cotizaciones';
    link.dataset.auraDesktopQuotes = '011c';
    link.dataset.auraRouteLink = 'cotizaciones';
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm2 3v2h10V6H7Zm0 5v2h10v-2H7Zm0 5v2h6v-2H7Z"/></svg><span>Cotizaciones</span>';
    link.addEventListener('click', event => {
      event.preventDefault();
      nativeNavigate('cotizaciones');
    });

    const income = nav.querySelector('[data-aura-route-link="comisiones"]');
    nav.insertBefore(link, income || null);
    desktopQuoteLink = link;
  }

  function activeRoute() {
    const shell = documentRef.querySelector('[data-aura-shell]');
    return shell?.dataset?.auraActiveRoute || shell?.dataset?.forgeRoute || '';
  }

  function reconcileDesktopQuotesState() {
    ensureDesktopQuotes();
    if (!desktopQuoteLink) return;
    if (activeRoute() === 'cotizaciones') desktopQuoteLink.setAttribute('aria-current', 'page');
    else desktopQuoteLink.removeAttribute('aria-current');
  }

  function buildSha() {
    return documentRef.querySelector('meta[name="forge-build-sha"]')?.content
      || globalThis.__FORGE_BUILD_SHA__
      || 'runtime';
  }

  async function authState() {
    try {
      const client = await getClient();
      const result = await client.auth.getUser();
      return result?.data?.user?.id && !result?.error ? 'OK' : 'FAIL';
    } catch {
      return 'FAIL';
    }
  }

  function addDiagnostic(host, lines) {
    if (!host || host.querySelector('[data-aura-runtime-diagnostic="011c"]')) return;
    const details = documentRef.createElement('details');
    details.className = 'aura-runtime-diagnostic';
    details.dataset.auraRuntimeDiagnostic = '011c';
    const summary = documentRef.createElement('summary');
    summary.textContent = 'Detalles técnicos';
    const pre = documentRef.createElement('pre');
    pre.textContent = lines.join('\n');
    details.append(summary, pre);
    host.append(details);
  }

  async function reconcileDiagnostics() {
    const currentAuthState = await authState();
    const pipelineError = documentRef.querySelector('[data-aura-app] .aura-error-state[data-state^="PIPELINE_"]');
    if (pipelineError) {
      addDiagnostic(pipelineError, [
        'FORGE AURA RUNTIME',
        'MODULE       pipeline',
        `STATE        ${pipelineError.dataset.state || 'PIPELINE_ERROR'}`,
        `AUTH         ${currentAuthState}`,
        'IDENTITY     SAME CLIENT SESSION',
        'SOURCE       prospects / Timeline',
        'STAGE        MODULE_RUNTIME',
        `BUILD        ${buildSha()}`,
      ]);
    }

    const incomePanel = documentRef.querySelector('[data-aura-app] [data-income-state-panel]');
    if (incomePanel && incomePanel.dataset.incomeStatePanel !== 'LOADING') {
      const code = incomePanel.querySelector('code')?.textContent?.trim() || 'NO_ERROR_CODE';
      addDiagnostic(incomePanel, [
        'FORGE AURA RUNTIME',
        'MODULE       income',
        `STATE        ${incomePanel.dataset.incomeStatePanel || 'UNKNOWN'}`,
        `AUTH         ${currentAuthState}`,
        'RPC          forge_advisor_compensation_read_product',
        `CODE         ${code}`,
        `BUILD        ${buildSha()}`,
      ]);
    }
  }

  function scheduleDiagnostics() {
    if (diagnosticsScheduled) return;
    diagnosticsScheduled = true;
    queueMicrotask(() => {
      diagnosticsScheduled = false;
      void reconcileDiagnostics();
    });
  }

  function loopDiagnostics() {
    const pipelineRoot = documentRef.querySelector('[data-aura-app] [data-pipeline-state]');
    const incomePanel = documentRef.querySelector('[data-aura-app] [data-income-state-panel]');
    return Object.freeze({
      runtimeId: RUNTIME_ID,
      buildSha: buildSha(),
      accountMode: 'PRODUCTIVE_ONLY',
      route: activeRoute() || null,
      pipelineState: pipelineRoot?.dataset?.pipelineState || null,
      journalState: documentRef.documentElement.dataset.auraJournalState || null,
      timelineState: documentRef.documentElement.dataset.auraJournalState === 'WRITE_CONFIRMED' ? 'CONFIRMED' : null,
      carteraState: documentRef.querySelector('[data-aura-app] .cartera-workspace') ? 'WORKSPACE_VISIBLE' : null,
      paymentConfirmationState: documentRef.documentElement.dataset.auraPaymentState || null,
      paymentHandoffState: 'PRODUCTIVE_SERVER_HANDOFF_MISSING',
      compensationState: 'PRODUCTIVE_SERVER_HANDOFF_MISSING',
      incomeState: incomePanel?.dataset?.incomeStatePanel || null,
      quotesDesktopVisible: Boolean(documentRef.querySelector('.aura-nav [data-aura-desktop-quotes="011c"]')),
      journalInstalled: Boolean(journal),
      paymentConfirmationInstalled: Boolean(payments),
      demoFallbackUsed: false,
      unknownCoercionUsed: false,
      watchTowerGate: 'FAIL',
      watchTowerReason: 'PRODUCTIVE_COMPENSATION_SERVER_HANDOFF_MISSING',
    });
  }

  const journal = installPipelineJournalAura({ documentRef, getClient });
  const payments = installCarteraPaymentAura({ documentRef, getClient });

  const Observer = globalThis.MutationObserver;
  if (Observer) {
    shellObserver = new Observer(() => reconcileDesktopQuotesState());
    shellObserver.observe(documentRef.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-aura-active-route', 'data-forge-route'] });
    diagnosticsObserver = new Observer(scheduleDiagnostics);
    diagnosticsObserver.observe(documentRef.documentElement, { childList: true, subtree: true });
  }

  reconcileDesktopQuotesState();
  scheduleDiagnostics();
  documentRef.documentElement.dataset.auraCommercialLoop = '011c';

  const runtime = Object.freeze({
    runtimeId: RUNTIME_ID,
    journal,
    payments,
    diagnostics: loopDiagnostics,
    destroy() {
      shellObserver?.disconnect();
      diagnosticsObserver?.disconnect();
      journal?.destroy?.();
      payments?.destroy?.();
      desktopQuoteLink?.remove?.();
      auth.destroy?.();
      delete documentRef.documentElement.dataset.auraCommercialLoop;
      delete globalThis.ForgeAuraCommercialLoop011C;
      delete globalThis[INSTALL_KEY];
    },
  });
  globalThis[INSTALL_KEY] = runtime;
  globalThis.ForgeAuraCommercialLoop011C = runtime;
}

export const FORGE_AURA_COMMERCIAL_LOOP_011C = globalThis[INSTALL_KEY];

import { createAuraAuth } from './aura-auth-v4.js';
import { installPipelineJournalAura } from './pipeline/pipeline-journal-aura-011c.js?v=forge-aura-commercial-loop-011c';
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
    const auth = await authState();
    const pipelineError = documentRef.querySelector('[data-aura-app] .aura-error-state[data-state^="PIPELINE_"]');
    if (pipelineError) {
      addDiagnostic(pipelineError, [
        'FORGE AURA RUNTIME',
        'MODULE       pipeline',
        `STATE        ${pipelineError.dataset.state || 'PIPELINE_ERROR'}`,
        `AUTH         ${auth}`,
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
        `AUTH         ${auth}`,
        'RPC          forge_advisor_compensation_read_product',
        `CODE         ${code}`,
        `BUILD        ${buildSha()}`,
      ]);
    }
  }

  const journal = installPipelineJournalAura({ documentRef, getClient });
  const payments = installCarteraPaymentAura({ documentRef, getClient });

  const Observer = globalThis.MutationObserver;
  if (Observer) {
    shellObserver = new Observer(() => reconcileDesktopQuotesState());
    shellObserver.observe(documentRef.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-aura-active-route', 'data-forge-route'] });
    diagnosticsObserver = new Observer(() => { void reconcileDiagnostics(); });
    diagnosticsObserver.observe(documentRef.documentElement, { childList: true, subtree: true });
  }

  reconcileDesktopQuotesState();
  void reconcileDiagnostics();
  documentRef.documentElement.dataset.auraCommercialLoop = '011c';

  globalThis[INSTALL_KEY] = Object.freeze({
    runtimeId: RUNTIME_ID,
    journal,
    payments,
    diagnostics: () => Object.freeze({
      runtimeId: RUNTIME_ID,
      accountMode: 'PRODUCTIVE_ONLY',
      journalInstalled: Boolean(journal),
      paymentConfirmationInstalled: Boolean(payments),
      quotesDesktopVisible: Boolean(documentRef.querySelector('.aura-nav [data-aura-desktop-quotes="011c"]')),
      demoFallbackUsed: false,
      unknownCoercionUsed: false,
    }),
    destroy() {
      shellObserver?.disconnect();
      diagnosticsObserver?.disconnect();
      journal?.destroy?.();
      payments?.destroy?.();
      desktopQuoteLink?.remove?.();
      auth.destroy?.();
      delete documentRef.documentElement.dataset.auraCommercialLoop;
      delete globalThis[INSTALL_KEY];
    },
  });
}

export const FORGE_AURA_COMMERCIAL_LOOP_011C = globalThis[INSTALL_KEY];

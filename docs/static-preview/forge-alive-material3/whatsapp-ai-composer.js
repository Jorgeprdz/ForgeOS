const CONTRACT_ID = "FORGE_WHATSAPP_LEGACY_COMPOSER_RETIREMENT_014B";
const PRODUCTIVE_AUTHORITY = "MATERIAL3_PIPELINE_GOVERNED_NASH_WORKSPACE";

/*
 * Compatibility module only.
 *
 * This file remains importable because the canonical Pipeline stage/filter
 * authority still references it. It intentionally installs NO click handler.
 * The productive Pipeline module already owns [data-prepare-productive-message]
 * and opens its governed NASH workspace, where Forge builds the conversation
 * brief, provider input is bounded, deterministic fallback remains available,
 * the exact draft requires human approval, and WhatsApp navigation is manual.
 *
 * Law Zero / AI authority repair 014B:
 * - no raw card context is forwarded to a provider here;
 * - no direct Edge Function call is made here;
 * - no draft is approved here;
 * - no WhatsApp window is opened here;
 * - no Pipeline, Timeline, identity, policy or relationship state is mutated.
 */

function diagnostics() {
  return Object.freeze({
    contractId: CONTRACT_ID,
    retired: true,
    productiveAuthority: PRODUCTIVE_AUTHORITY,
    installsClickInterceptor: false,
    directProviderCall: false,
    rawPipelineForwardedToProvider: false,
    createsMessageAuthority: false,
    approvesDraft: false,
    opensWhatsapp: false,
    sendsMessage: false,
    mutatesDomain: false,
  });
}

function announceRetirement(documentRef = globalThis.document) {
  const html = documentRef?.documentElement;
  if (html) {
    html.dataset.whatsappComposerAuthority = PRODUCTIVE_AUTHORITY;
    html.dataset.whatsappLegacyComposer014b = "retired";
  }
  const view = documentRef?.defaultView || globalThis;
  const EventCtor = view?.CustomEvent || globalThis.CustomEvent;
  if (EventCtor && view?.dispatchEvent) {
    view.dispatchEvent(new EventCtor("forge:whatsapp-composer-authority", {
      detail: diagnostics(),
    }));
  }
  return diagnostics();
}

const api = Object.freeze({
  contractId: CONTRACT_ID,
  productiveAuthority: PRODUCTIVE_AUTHORITY,
  diagnostics,
  announceRetirement,
});

globalThis.ForgeWhatsappComposerRetirement014B = api;

if (globalThis.document) announceRetirement(document);

export {
  CONTRACT_ID,
  PRODUCTIVE_AUTHORITY,
  announceRetirement,
  diagnostics,
};

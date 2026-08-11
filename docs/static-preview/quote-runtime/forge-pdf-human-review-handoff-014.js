const CONTRACT_ID = 'FORGE_PDF_HUMAN_REVIEW_HANDOFF_014';
const PACKET_EVENT = 'forge:accepted-quote-packet-ready';
let lastPacket = null;

function quoteRuntime() {
  return globalThis.ForgeNuevaCotizacionAcceptedQuoteRuntime || null;
}

function quoteBridge() {
  return globalThis.ForgeAcceptedQuoteBridge || null;
}

function popupOpen() {
  return Boolean(document.querySelector('[data-quote-preview-confirmation-popup="true"]'));
}

function openExistingHumanReview(packet) {
  if (!packet || packet === lastPacket || popupOpen()) return false;

  const runtime = quoteRuntime();
  const bridge = quoteBridge();
  const submit = runtime?.submit;
  const state = bridge?.getCurrentQuotePreviewCalculationState?.();

  if (!submit || state?.candidateReady !== true) return false;

  lastPacket = packet;
  const calculationPending = state.state === 'CALCULATING_PREVIEW';

  submit.disabled = false;
  submit.setAttribute('aria-disabled', 'false');
  submit.click();

  if (calculationPending) {
    submit.disabled = true;
    submit.setAttribute('aria-disabled', 'true');
  }

  if (popupOpen() && runtime.status) {
    runtime.status.textContent = 'Datos encontrados. Revisa la información antes de confirmarla.';
    runtime.status.setAttribute('data-forge-state', 'pending-review');
  }

  return popupOpen();
}

function scheduleHumanReview(event) {
  const packet = event?.detail?.packet || null;
  globalThis.setTimeout(() => {
    if (openExistingHumanReview(packet)) return;
    globalThis.setTimeout(() => openExistingHumanReview(packet), 50);
  }, 0);
}

globalThis.addEventListener(PACKET_EVENT, scheduleHumanReview);

globalThis.ForgePdfHumanReviewHandoff014 = Object.freeze({
  contractId: CONTRACT_ID,
  packetEvent: PACKET_EVENT,
  usesExistingBridge: true,
  createsQuoteAuthority: false,
  calculatesQuote: false,
  confirmsAutomatically: false,
  persistsAutomatically: false,
  openExistingHumanReview,
});

export { CONTRACT_ID, openExistingHumanReview };

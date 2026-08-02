import {
  AUTHORITY,
  AUTHORITY_VERSION,
  calculateFromAcceptedPacket,
} from "../../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js?v=segubeca-authority-001";
import {
  buildAcceptedNativeResult107z15p2R9C,
  calculateSegubecaAcceptedR14E,
} from "../quote-preview-live/forge-accepted-quote-adapter.js?v=segubeca-productive-ui-001";
import {
  createAcceptedQuoteReviewSnapshotBoundary,
} from "../quote-preview-live/forge-accepted-quote-review-snapshot.js?v=segubeca-productive-ui-001";

const BINDING_VERSION = "SEGUBECA-PRODUCTIVE-UI-BINDING-001.3";
const bindingStateKey = Symbol.for("forge.segubeca.productive.ui.binding");
const reviewBoundary = createAcceptedQuoteReviewSnapshotBoundary();

let originalBridge = null;
let wrappedBridge = null;
let currentCandidate = null;
let currentCalculation = null;
let currentAuthorityResult = null;
let currentPromise = null;
let currentError = null;
let currentState = "IDLE";

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isSegubecaCandidate(candidate = {}) {
  const native = candidate?.nativeResult || {};
  const context = candidate?.context || {};
  return [
    candidate?.productFamily,
    candidate?.product_family,
    candidate?.productType,
    candidate?.product_type,
    candidate?.product,
    candidate?.productName,
    native.productFamily,
    native.product_family,
    native.productType,
    native.product_type,
    native.product,
    native.productName,
    context.productFamily,
    context.product_family,
    context.productType,
    context.product_type,
    context.product,
  ].some((value) => normalize(value).replace(/\s+/g, "").includes("segubeca"));
}

function alignCandidateForAuthority(candidate) {
  const normalized = buildAcceptedNativeResult107z15p2R9C(candidate);
  const accepted = calculateSegubecaAcceptedR14E(candidate, normalized);
  const sourceNativeResult = candidate?.nativeResult || {};

  return {
    ...candidate,
    paymentYears: accepted.paymentYears ?? candidate?.paymentYears ?? null,
    coveragePeriod:
      accepted.coveragePeriod ?? candidate?.coveragePeriod ?? null,
    totalContributed:
      accepted.totalContributed ?? candidate?.totalContributed ?? null,
    totalRecovery:
      accepted.totalRecovery ?? candidate?.totalRecovery ?? null,
    nativeResult: {
      ...sourceNativeResult,
      paymentYears:
        accepted.paymentYears ?? sourceNativeResult.paymentYears ?? null,
      coveragePeriod:
        accepted.coveragePeriod ?? sourceNativeResult.coveragePeriod ?? null,
      totalContributed:
        accepted.totalContributed ?? sourceNativeResult.totalContributed ?? null,
      totalRecovery:
        accepted.totalRecovery ?? sourceNativeResult.totalRecovery ?? null,
    },
  };
}

function clearAuthorityState() {
  currentCandidate = null;
  currentCalculation = null;
  currentAuthorityResult = null;
  currentPromise = null;
  currentError = null;
  currentState = "IDLE";
  reviewBoundary.clear();
  document.documentElement.dataset.segubecaCalculationAuthority = "idle";
}

function productiveCalculation(authorityResult) {
  const calculation = authorityResult?.acceptedCalculation || {};
  const acceptedPacket = authorityResult?.acceptedPacket || {};
  const nativeResult = calculation.nativeResult || acceptedPacket.nativeResult || {};
  const projection = authorityResult?.projection || {};

  return Object.freeze({
    ...calculation,
    nativeResult,
    benefitSummary:
      calculation.benefitSummary ||
      nativeResult.benefitSummary ||
      acceptedPacket.benefitSummary ||
      null,
    udiRateMetadata:
      calculation.udiRateMetadata ||
      projection.currentUdiMetadata ||
      acceptedPacket.udiRateMetadata ||
      null,
    currencyMetadata:
      calculation.currencyMetadata ||
      projection.currentUdiMetadata ||
      acceptedPacket.currencyMetadata ||
      null,
    udiProjection:
      calculation.udiProjection ||
      projection.timeline ||
      acceptedPacket.udiProjection ||
      null,
    calculationAuthority: AUTHORITY,
    calculationAuthorityVersion: AUTHORITY_VERSION,
    productiveBindingVersion: BINDING_VERSION,
    segubecaAuthority: Object.freeze({
      authority: AUTHORITY,
      authorityVersion: AUTHORITY_VERSION,
      contractualValueAuthority: authorityResult.contractualValueAuthority,
      currencyProjectionAuthority: authorityResult.currencyProjectionAuthority,
      sourceFacts: authorityResult.sourceFacts,
      projection,
      boundaries: authorityResult.boundaries,
    }),
  });
}

function authorityState() {
  return Object.freeze({
    state: currentState,
    candidateReady: Boolean(currentCandidate),
    calculation: currentCalculation,
    error: currentError,
    automaticCalculation: true,
    accepted: Boolean(reviewBoundary.getSnapshot()),
    humanConfirmationRequired: true,
    calculationAuthority: AUTHORITY,
    calculationAuthorityVersion: AUTHORITY_VERSION,
  });
}

function decorateProjection() {
  const projection = document.querySelector("[data-material3-quotes-projection]");
  if (!projection || !currentCalculation) return;
  projection.dataset.segubecaCalculationAuthority = AUTHORITY;
  projection.dataset.segubecaCalculationAuthorityVersion = AUTHORITY_VERSION;

  let note = projection.querySelector("[data-segubeca-authority-note]");
  if (!note) {
    note = document.createElement("aside");
    note.className = "segubeca-authority-note";
    note.dataset.segubecaAuthorityNote = "true";
    note.setAttribute("role", "note");
    projection.prepend(note);
  }

  const projectionStatus = currentAuthorityResult?.projection?.status;
  note.innerHTML = `
    <strong>SeguBeca · lectura comercial gobernada</strong>
    <span>Valores contractuales tomados del PDF de Solución Online.</span>
    <span>Equivalencias futuras en MXN con escenario UDI de 4.5% anual; no son garantía.</span>
    ${projectionStatus === "BLOCKED_NO_VERIFIED_UDI_RATE"
      ? "<span>No hay una UDI verificada disponible; las equivalencias MXN permanecen bloqueadas.</span>"
      : ""}
  `;
}

function installStyles() {
  if (document.querySelector("[data-segubeca-authority-styles]")) return;
  const style = document.createElement("style");
  style.dataset.segubecaAuthorityStyles = "true";
  style.textContent = `
    .segubeca-authority-note {
      display: grid;
      gap: 5px;
      border: 1px solid var(--outline);
      border-radius: 20px;
      padding: 14px 16px;
      background: rgba(155, 232, 255, .07);
      color: var(--muted);
      line-height: 1.45;
    }
    .segubeca-authority-note strong { color: var(--gold); }
  `;
  document.head.append(style);
}

async function calculateSegubecaPreview(options = {}) {
  const candidate = originalBridge?.getCurrentQuoteCandidate?.() || null;
  const force = options.force === true;
  if (!candidate || !isSegubecaCandidate(candidate)) {
    return originalBridge?.calculateCurrentQuoteCandidatePreview?.(options) ?? null;
  }

  if (!force && currentCandidate === candidate && currentCalculation) {
    return currentCalculation;
  }
  if (!force && currentCandidate === candidate && currentPromise) {
    return currentPromise;
  }

  currentCandidate = candidate;
  currentCalculation = null;
  currentAuthorityResult = null;
  currentError = null;
  currentState = "CALCULATING_PREVIEW";
  document.documentElement.dataset.segubecaCalculationAuthority = "calculating";

  const operation = calculateFromAcceptedPacket(
    alignCandidateForAuthority(candidate),
  )
    .then((authorityResult) => {
      if (originalBridge?.getCurrentQuoteCandidate?.() !== candidate) return null;
      currentAuthorityResult = authorityResult;
      currentCalculation = productiveCalculation(authorityResult);
      currentError = null;
      currentState = "READY";
      document.documentElement.dataset.segubecaCalculationAuthority = "ready";
      document.documentElement.dataset.segubecaCalculationAuthorityVersion = AUTHORITY_VERSION;
      queueMicrotask(decorateProjection);
      globalThis.dispatchEvent(new CustomEvent(
        "forge:segubeca-productive-calculation-ready",
        {
          detail: Object.freeze({
            version: BINDING_VERSION,
            authority: AUTHORITY,
            authorityVersion: AUTHORITY_VERSION,
            accepted: false,
            humanConfirmationRequired: true,
          }),
        },
      ));
      return currentCalculation;
    })
    .catch((error) => {
      if (originalBridge?.getCurrentQuoteCandidate?.() === candidate) {
        currentCalculation = null;
        currentAuthorityResult = null;
        currentError = error instanceof Error ? error : new Error(String(error));
        currentState = "ERROR";
        document.documentElement.dataset.segubecaCalculationAuthority = "error";
      }
      throw error;
    })
    .finally(() => {
      if (currentPromise === operation) currentPromise = null;
    });

  currentPromise = operation;
  return operation;
}

async function confirmSegubecaCandidate() {
  const candidate = originalBridge?.getCurrentQuoteCandidate?.() || null;
  if (!candidate || !isSegubecaCandidate(candidate)) {
    return originalBridge?.confirmCurrentQuoteCandidate?.() ?? null;
  }

  const calculation = await calculateSegubecaPreview();
  if (!calculation) {
    throw new Error("SEGUBECA_PRODUCTIVE_CALCULATION_REQUIRED");
  }

  await originalBridge?.confirmCurrentQuoteCandidate?.();
  const snapshot = reviewBoundary.setSnapshot({
    acceptedQuote: candidate,
    calculation,
  });
  currentState = "ACCEPTED";
  decorateProjection();

  globalThis.dispatchEvent(new CustomEvent(
    "forge:segubeca-productive-quote-confirmed",
    {
      detail: Object.freeze({
        version: BINDING_VERSION,
        authority: AUTHORITY,
        authorityVersion: AUTHORITY_VERSION,
        accepted: true,
        automatic: false,
        humanConfirmationRequired: true,
      }),
    },
  ));

  return snapshot;
}

function createWrappedBridge(bridge) {
  return Object.freeze({
    ...bridge,
    [bindingStateKey]: true,
    getCurrentQuotePreviewCalculation() {
      const candidate = bridge.getCurrentQuoteCandidate?.();
      return isSegubecaCandidate(candidate)
        ? (currentCandidate === candidate ? currentCalculation : null)
        : bridge.getCurrentQuotePreviewCalculation?.();
    },
    getCurrentQuotePreviewCalculationState() {
      const candidate = bridge.getCurrentQuoteCandidate?.();
      return isSegubecaCandidate(candidate)
        ? authorityState()
        : bridge.getCurrentQuotePreviewCalculationState?.();
    },
    calculateCurrentQuoteCandidatePreview: calculateSegubecaPreview,
    confirmCurrentQuoteCandidate: confirmSegubecaCandidate,
    getAcceptedQuoteReviewSnapshot() {
      const candidate = bridge.getCurrentQuoteCandidate?.();
      return isSegubecaCandidate(candidate)
        ? reviewBoundary.getSnapshot()
        : bridge.getAcceptedQuoteReviewSnapshot?.();
    },
    segubecaProductiveBindingVersion: BINDING_VERSION,
  });
}

function patchAcceptanceEntrypoint() {
  const entrypoint = globalThis.ForgeQuoteAcceptanceEntrypointR16J0A;
  if (!entrypoint || entrypoint[bindingStateKey]) return;
  globalThis.ForgeQuoteAcceptanceEntrypointR16J0A = Object.freeze({
    ...entrypoint,
    [bindingStateKey]: true,
    confirm: confirmSegubecaCandidate,
    getSnapshot() {
      const candidate = originalBridge?.getCurrentQuoteCandidate?.();
      return isSegubecaCandidate(candidate)
        ? reviewBoundary.getSnapshot()
        : entrypoint.getSnapshot?.();
    },
  });
}

function install() {
  const bridge = globalThis.ForgeAcceptedQuoteBridge;
  if (!bridge) return false;
  if (bridge[bindingStateKey]) {
    wrappedBridge = bridge;
    return true;
  }

  originalBridge = bridge;
  wrappedBridge = createWrappedBridge(bridge);
  globalThis.ForgeAcceptedQuoteBridge = wrappedBridge;
  globalThis.ForgeSegubecaProductiveUiBinding = api;
  document.documentElement.dataset.segubecaProductiveUiBinding = "ready";
  installStyles();
  patchAcceptanceEntrypoint();
  return true;
}

const api = Object.freeze({
  version: BINDING_VERSION,
  authority: AUTHORITY,
  authorityVersion: AUTHORITY_VERSION,
  install,
  isSegubecaCandidate,
  alignCandidateForAuthority,
  calculateCurrentQuoteCandidatePreview: calculateSegubecaPreview,
  confirmCurrentQuoteCandidate: confirmSegubecaCandidate,
  getAuthorityResult: () => currentAuthorityResult,
  getCalculation: () => currentCalculation,
  getState: authorityState,
});

globalThis.addEventListener("forge:quote-candidate-ready", () => {
  install();
  const candidate = originalBridge?.getCurrentQuoteCandidate?.();
  if (isSegubecaCandidate(candidate)) {
    void calculateSegubecaPreview().catch(() => {});
  }
});

globalThis.addEventListener("forge:quote-candidate-cleared", clearAuthorityState);
globalThis.addEventListener("forge:quotes-module-ready", () => {
  install();
  patchAcceptanceEntrypoint();
});
globalThis.addEventListener("forge:quote-preview-calculated", () => {
  if (currentCalculation) queueMicrotask(decorateProjection);
});

install();
queueMicrotask(patchAcceptanceEntrypoint);

export {
  AUTHORITY,
  AUTHORITY_VERSION,
  BINDING_VERSION,
  alignCandidateForAuthority,
  calculateSegubecaPreview,
  confirmSegubecaCandidate,
  install,
  isSegubecaCandidate,
};
import {
  createQuoteResultSnapshot,
  renderQuoteResultSnapshot,
} from "./quote-product-intelligence-presenter.js?v=quote-calculator-parity-001";

const UNKNOWN = "No disponible en la propuesta";

function safeCall(callback, fallback = null) {
  try {
    return typeof callback === "function" ? callback() : fallback;
  } catch {
    return fallback;
  }
}

function viewState(bridge) {
  if (!bridge) {
    return {
      state: "blocked",
      candidate: null,
      calculation: null,
      error: "La autoridad de cotización no está disponible.",
    };
  }
  const candidate = safeCall(() => bridge.getCurrentQuoteCandidate?.(), null);
  const calculationState = safeCall(
    () => bridge.getCurrentQuotePreviewCalculationState?.(),
    {},
  ) || {};
  const calculation = safeCall(
    () => bridge.getCurrentQuotePreviewCalculation?.(),
    null,
  ) || calculationState.calculation || null;
  const rawState = String(calculationState.state || "").toUpperCase();

  if (calculationState.error) {
    return {
      state: "error",
      candidate,
      calculation,
      error: calculationState.error,
    };
  }
  if (!candidate && /EXTRACT|LOAD|CALCULAT/.test(rawState)) {
    return {
      state: "loading",
      candidate,
      calculation,
      error: null,
    };
  }
  if (!candidate) {
    return {
      state: "empty",
      candidate: null,
      calculation: null,
      error: null,
    };
  }
  return {
    state: calculation ? "ready" : "partial",
    candidate,
    calculation,
    error: null,
    humanConfirmationRequired:
      calculationState.humanConfirmationRequired !== false,
  };
}

export function buildQuoteResultViewModel(bridge) {
  return Object.freeze(viewState(bridge));
}

export function renderQuoteResult(viewModel) {
  if (viewModel.state === "empty") {
    return `<section class="quote-result__state" data-quote-empty-state><h2>Sin información suficiente</h2><p>Selecciona una propuesta para preparar su lectura comercial.</p></section>`;
  }
  if (viewModel.state === "loading") {
    return `<section class="quote-result__state" data-quote-progress><h2>Preparando lectura comercial</h2><p>Estamos extrayendo y calculando la propuesta.</p><progress></progress></section>`;
  }
  if (["blocked", "error"].includes(viewModel.state)) {
    return `<section class="quote-result__state quote-result__state--error" data-quote-error-state><h2>No pudimos preparar el resultado</h2><p>${String(viewModel.error?.message || viewModel.error || "Intenta cargar nuevamente la propuesta.")}</p><button type="button" data-quote-retry>Volver a intentar</button></section>`;
  }
  return `<div data-quote-product-intelligence-host></div>`;
}

function appendReview(snapshot, projection, documentRef) {
  const review = documentRef.createElement("section");
  review.className = "quote-commercial__review";
  review.dataset.quoteEvidenceWarnings = "true";
  review.tabIndex = -1;

  const title = documentRef.createElement("h3");
  title.textContent = "Alertas y datos pendientes";
  const list = documentRef.createElement("ul");
  const values = snapshot.missingInformation.length
    ? snapshot.missingInformation
    : ["Sin pendientes detectados. Requiere validación humana final."];

  values.forEach((value) => {
    const item = documentRef.createElement("li");
    item.textContent = value;
    list.append(item);
  });
  review.append(title, list);
  projection.append(review);
  return review;
}

function appendActions({ snapshot, bridge, projection, root, documentRef }) {
  const footer = documentRef.createElement("footer");
  footer.className = "quote-commercial__actions";
  footer.dataset.quoteLastActions = "true";
  footer.innerHTML = `
    <button type="button" data-quote-next-action="review_pending"
      ${snapshot.missingInformation.length ? "" : "disabled"}>
      Revisar datos pendientes
    </button>
    <button type="button" data-quote-next-action="confirm_quote">
      Confirmar cotización
    </button>
  `;
  projection.append(footer);

  footer.querySelector('[data-quote-next-action="review_pending"]')
    ?.addEventListener("click", () => {
      const target = projection.querySelector(
        "[data-quote-evidence-warnings]",
      );
      target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      target?.focus?.({ preventScroll: true });
    });

  footer.querySelector('[data-quote-next-action="confirm_quote"]')
    ?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "Confirmando cotización…";
      try {
        const accepted =
          globalThis.ForgeQuoteAcceptanceEntrypointR16J0A?.confirm
            ? await globalThis.ForgeQuoteAcceptanceEntrypointR16J0A.confirm()
            : await bridge?.confirmCurrentQuoteCandidate?.();
        if (!accepted) {
          throw new Error(
            "El motor no devolvió una cotización confirmada.",
          );
        }
        button.textContent = "Cotización confirmada";
        globalThis.ForgeQuotePrintableEntrypointQPD06?.refresh?.();
        globalThis.dispatchEvent?.(
          new CustomEvent("forge:material3-quote-confirmed", {
            detail: {
              accepted: true,
              product: snapshot.identity.name || null,
            },
          }),
        );
        root.dataset.quoteAccepted = "true";
      } catch (error) {
        button.disabled = false;
        button.textContent = "Reintentar confirmación";
        const message = documentRef.createElement("p");
        message.className = "quote-result__unknown";
        message.textContent = error?.message || String(error);
        footer.append(message);
      }
    });
}

export async function reconcileQuoteResult({ bridge, projection, root }) {
  let viewModel = buildQuoteResultViewModel(bridge);

  if (
    viewModel.state === "partial" &&
    typeof bridge?.calculateCurrentQuoteCandidatePreview === "function"
  ) {
    try {
      await bridge.calculateCurrentQuoteCandidatePreview();
    } catch {
      // Preserve the extracted candidate and surface missing evidence.
    }
    viewModel = buildQuoteResultViewModel(bridge);
  }

  projection.innerHTML = renderQuoteResult(viewModel);
  projection.hidden = false;
  root.dataset.intakeState = viewModel.state;
  root.dataset.quoteProjectionReady = String(
    ["ready", "partial"].includes(viewModel.state),
  );
  projection.dataset.material3QuoteProjectionReady = String(
    ["ready", "partial"].includes(viewModel.state),
  );

  if (
    ["ready", "partial"].includes(viewModel.state) &&
    viewModel.candidate
  ) {
    const snapshot = createQuoteResultSnapshot({
      packet: viewModel.candidate,
      calculation: viewModel.calculation,
      buildBenefitSummary:
        globalThis.ForgeQuoteBenefitSummaryEngine
          ?.buildQuoteBenefitSummary,
    });
    const host = projection.querySelector(
      "[data-quote-product-intelligence-host]",
    );
    renderQuoteResultSnapshot(snapshot, {
      host,
      documentRef: projection.ownerDocument,
    });
    appendReview(snapshot, projection, projection.ownerDocument);
    appendActions({
      snapshot,
      bridge,
      projection,
      root,
      documentRef: projection.ownerDocument,
    });
    projection.dataset.productDashboard = snapshot.dashboard.type;
  }

  projection.querySelector("[data-quote-retry]")
    ?.addEventListener("click", () => {
      void bridge?.calculateCurrentQuoteCandidatePreview?.();
    });

  return viewModel;
}

export { UNKNOWN as QUOTE_UNKNOWN_LABEL };

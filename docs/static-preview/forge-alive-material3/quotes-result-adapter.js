import {
  createQuoteResultSnapshot,
  renderQuoteResultSnapshot,
} from "./quote-product-intelligence-presenter.js?v=quote-calculator-parity-002";

const UNKNOWN = "No disponible en la propuesta";

function safeCall(callback, fallback = null) {
  try {
    return typeof callback === "function" ? callback() : fallback;
  } catch {
    return fallback;
  }
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMxn(value) {
  const numeric = finiteNumber(value);
  if (numeric === null) return null;
  return `≈ $${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(numeric)} MXN actual`;
}

function verifiedUdiRate(snapshot) {
  const metadata = snapshot?.rateMetadata || {};
  const value = finiteNumber(metadata.value);
  if (
    value === null ||
    value <= 0 ||
    metadata.stale === true
  ) {
    return null;
  }
  const key = String(metadata.key || "").toUpperCase();
  const status = String(metadata.status || "").toUpperCase();
  return key.includes("UDI") || status.includes("UDI")
    ? value
    : null;
}

function sourceUdiValue(item) {
  const value = item?.value;
  if (value && typeof value === "object") {
    const currency = String(value.currency || "").toUpperCase();
    if (currency === "UDI") return finiteNumber(value.value);
    return finiteNumber(value.udi ?? value.amountUdi ?? value.valueUdi);
  }
  const text = String(value ?? "");
  return /\bUDI(?:S)?\b/i.test(text) ? finiteNumber(text) : null;
}

function appendSecondaryLine(target, text) {
  if (!target || !hasValue(text)) return;
  const normalized = String(text);
  if (target.textContent?.includes(normalized)) return;
  const line = target.ownerDocument.createElement("span");
  line.className = "quotes-value-line quotes-value-line--conversion";
  line.textContent = normalized;
  target.append(line);
}

function enrichMetricNode(node, item) {
  if (!node || !item) return;
  const value = node.querySelector("strong");
  if (!value) return;

  const primary = item.value ?? item.primary;
  if (!hasValue(item.value) && hasValue(primary)) {
    value.textContent = String(primary);
  }

  appendSecondaryLine(
    value,
    item.secondaryValue ?? item.secondary ?? null,
  );
}

function enrichRenderedSnapshot(snapshot, host) {
  if (!snapshot || !host) return;

  host.dataset.quoteCalculatorRuntime = "M05E-002";

  const rate = verifiedUdiRate(snapshot);
  const mandatoryCards = new Map(
    [...host.querySelectorAll("[data-quote-mandatory-metric]")]
      .map((card) => [card.dataset.quoteMandatoryMetric, card]),
  );

  for (const [key, item] of [
    ["sum-assured", snapshot.mandatory?.sumAssured],
    ["annual-contribution", snapshot.mandatory?.annualContribution],
  ]) {
    const card = mandatoryCards.get(key);
    const value = card?.querySelector("strong");
    if (!value || !item) continue;

    appendSecondaryLine(
      value,
      item.secondaryValue ?? item.secondary ?? null,
    );

    if (!/\bMXN\b/i.test(value.textContent || "") && rate) {
      const udi = sourceUdiValue(item);
      const mxn = udi === null ? null : formatMxn(udi * rate);
      appendSecondaryLine(value, mxn);
    }
  }

  const heroItem = snapshot.dashboard?.model?.hero;
  const hero = host.querySelector(".quotes-intelligence-hero strong");
  appendSecondaryLine(
    hero,
    heroItem?.secondaryValue ?? heroItem?.secondary ?? null,
  );

  const productGrid = host.querySelector(":scope > .quotes-intelligence-grid");
  const sectionNodes = productGrid
    ? [...productGrid.querySelectorAll(":scope > .quotes-intelligence-section")]
    : [];
  const sections = snapshot.dashboard?.model?.sections || [];

  sections.forEach((section, sectionIndex) => {
    const rows = sectionNodes[sectionIndex]
      ? [...sectionNodes[sectionIndex].querySelectorAll(".quotes-intelligence-metric")]
      : [];
    (section.items || []).forEach((item, itemIndex) => {
      enrichMetricNode(rows[itemIndex], item);
    });
  });
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
    enrichRenderedSnapshot(snapshot, host);
    appendReview(snapshot, projection, projection.ownerDocument);
    appendActions({
      snapshot,
      bridge,
      projection,
      root,
      documentRef: projection.ownerDocument,
    });
    projection.dataset.productDashboard = snapshot.dashboard.type;
    projection.dataset.quoteCalculatorRuntime = "M05E-002";
  }

  projection.querySelector("[data-quote-retry]")
    ?.addEventListener("click", () => {
      void bridge?.calculateCurrentQuoteCandidatePreview?.();
    });

  return viewModel;
}

export { UNKNOWN as QUOTE_UNKNOWN_LABEL };

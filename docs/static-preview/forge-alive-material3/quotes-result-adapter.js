const UNKNOWN = "No disponible en el documento";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function label(key) {
  return String(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

function valueMarkup(value) {
  if (value === null || value === undefined || value === "") return `<span class="quote-result__unknown">${UNKNOWN}</span>`;
  if (Array.isArray(value)) {
    if (!value.length) return `<span class="quote-result__unknown">${UNKNOWN}</span>`;
    return `<ul>${value.map(item => `<li>${typeof item === "object" ? objectMarkup(item) : esc(item)}</li>`).join("")}</ul>`;
  }
  if (typeof value === "object") return objectMarkup(value);
  return `<span>${esc(value)}</span>`;
}

function objectMarkup(object) {
  const entries = Object.entries(object || {}).filter(([key]) => !/raw|html|dom|element/i.test(key));
  if (!entries.length) return `<span class="quote-result__unknown">${UNKNOWN}</span>`;
  return `<dl>${entries.map(([key, value]) => `<div><dt>${esc(label(key))}</dt><dd>${valueMarkup(value)}</dd></div>`).join("")}</dl>`;
}

export function buildQuoteResultViewModel(bridge) {
  if (!bridge) return Object.freeze({ state: "blocked", candidate: null, calculation: null, error: "ForgeAcceptedQuoteBridge no disponible", humanConfirmationRequired: true });
  const candidate = bridge.getCurrentQuoteCandidate?.() || null;
  const calculation = bridge.getCurrentQuotePreviewCalculation?.() || null;
  const calculationState = bridge.getCurrentQuotePreviewCalculationState?.() || {};
  const rawState = String(calculationState.state || "").toUpperCase();
  const state = calculationState.error ? "error"
    : calculation ? "ready"
      : candidate && /CALCULAT/.test(rawState) ? "calculating"
        : candidate ? "candidate_ready"
          : "empty";
  return Object.freeze({
    state, candidate, calculation,
    error: calculationState.error || null,
    humanConfirmationRequired: calculationState.humanConfirmationRequired !== false,
    sourceAuthority: "ForgeAcceptedQuoteBridge",
  });
}

export function renderQuoteResult(viewModel) {
  const { state, candidate, calculation } = viewModel;
  if (state === "empty") return `<section class="quote-result__state"><h2>Resultado</h2><p>${UNKNOWN}</p></section>`;
  if (state === "calculating" || state === "candidate_ready") return `<section class="quote-result__state" data-quote-progress><h2>Procesando cotización</h2><p>La candidata fue detectada; el cálculo preliminar continúa.</p><progress></progress></section>`;
  if (state === "blocked" || state === "error") return `<section class="quote-result__state quote-result__state--error"><h2>Resultado bloqueado</h2><p>${esc(viewModel.error?.message || viewModel.error || UNKNOWN)}</p></section>`;
  return `
    <div class="quote-result" data-material3-quote-result-ready>
      <section data-quote-result-section data-quote-product-identity>
        <p class="quotes-module__kicker">IDENTIDAD DE COTIZACIÓN</p>
        <h2>Documento y producto detectado</h2>
        ${objectMarkup(candidate)}
      </section>
      <section data-quote-result-section data-quote-calculation-values>
        <p class="quotes-module__kicker">CÁLCULO PRELIMINAR</p>
        <h2>Valores disponibles</h2>
        ${objectMarkup(calculation)}
      </section>
      <section data-quote-result-section data-quote-evidence-warnings>
        <p class="quotes-module__kicker">EVIDENCIA Y REVISIÓN</p>
        <h2>Fuente y advertencias</h2>
        <dl>
          <div><dt>Autoridad</dt><dd>ForgeAcceptedQuoteBridge</dd></div>
          <div><dt>Estado</dt><dd>Vista preliminar no vinculante</dd></div>
          <div><dt>Confirmación humana</dt><dd>${viewModel.humanConfirmationRequired ? "Requerida" : UNKNOWN}</dd></div>
          <div><dt>Campos ausentes</dt><dd>${UNKNOWN}</dd></div>
        </dl>
      </section>
    </div>`;
}

export async function reconcileQuoteResult({ bridge, projection, root }) {
  let viewModel = buildQuoteResultViewModel(bridge);
  if (viewModel.state === "candidate_ready" && typeof bridge?.calculateCurrentQuoteCandidatePreview === "function") {
    try { await bridge.calculateCurrentQuoteCandidatePreview(); } catch {}
    viewModel = buildQuoteResultViewModel(bridge);
  }
  projection.innerHTML = renderQuoteResult(viewModel);
  projection.hidden = viewModel.state === "empty";
  root.dataset.intakeState = viewModel.state;
  root.dataset.quoteProjectionReady = String(viewModel.state === "ready");
  projection.dataset.material3QuoteProjectionReady = String(viewModel.state === "ready");
  return viewModel;
}

export { UNKNOWN as QUOTE_UNKNOWN_LABEL };

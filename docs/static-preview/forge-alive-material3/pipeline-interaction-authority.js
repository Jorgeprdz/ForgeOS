const STAGE_LABELS = Object.freeze({
  referred_new: "Nuevo",
  contacted: "Contactado",
  appointment_scheduled: "Cita agendada",
  proposal: "Propuesta",
  decision: "En decisión",
  client: "Cliente",
});

const pendingStages = new Map();

function escapeValue(value) {
  return globalThis.CSS?.escape?.(String(value)) || String(value).replace(/["\\]/g, "\\$&");
}

function cardFor(id, root = document) {
  return root.querySelector(`[data-productive-prospect-card="${escapeValue(id)}"]`);
}

function applyStage(card, status, persistence) {
  if (!card || !status) return;
  card.dataset.productiveStage = status;
  card.dataset.stagePersistence = persistence;
  const label = card.querySelector("[data-productive-stage-label]");
  if (label) label.textContent = STAGE_LABELS[status] || status;
  const select = card.querySelector("[data-productive-stage-control]");
  if (select) {
    select.value = status;
    select.setAttribute("aria-busy", persistence === "saving" ? "true" : "false");
  }
}

function installGeometryAuthority() {
  if (document.querySelector("[data-pipeline-interaction-authority-styles]")) return;
  const style = document.createElement("style");
  style.dataset.pipelineInteractionAuthorityStyles = "true";
  style.textContent = `
    .pipeline-module .pipeline-module__card-actions {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 7px !important;
      padding-top: 2px !important;
    }
    .pipeline-module .pipeline-module__card-actions > button,
    .pipeline-module .pipeline-module__card-actions > a {
      box-sizing: border-box !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 0 !important;
      min-height: 35px !important;
      margin: 0 !important;
      padding: 7px 9px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      white-space: normal !important;
    }
    @media (hover: none), (pointer: coarse) {
      .pipeline-module .pipeline-module__card-actions > button:hover,
      .pipeline-module .pipeline-module__card-actions > a:hover,
      .pipeline-module .pipeline-module__card-actions > button:active,
      .pipeline-module .pipeline-module__card-actions > a:active {
        transform: none !important;
      }
    }
  `;
  document.head.append(style);
}

function installStageAuthority() {
  document.addEventListener("change", event => {
    const select = event.target?.closest?.("[data-productive-stage-control]");
    if (!select) return;
    const id = select.dataset.productiveStageControl;
    const card = select.closest("[data-productive-prospect-card]");
    const requested = select.value;
    const previous = card?.dataset.productiveStage;
    if (!id || !card || !requested || requested === previous) return;
    pendingStages.set(id, { requested, previous });
    applyStage(card, requested, "saving");
  }, true);

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target.matches?.("[data-productive-stage-control]")) {
        const select = mutation.target;
        if (select.getAttribute("aria-invalid") !== "true") continue;
        const id = select.dataset.productiveStageControl;
        const pending = pendingStages.get(id);
        if (!pending) continue;
        applyStage(select.closest("[data-productive-prospect-card]"), pending.previous, "error");
        select.removeAttribute("aria-busy");
        pendingStages.delete(id);
      }
    }

    for (const [id, pending] of pendingStages) {
      const card = cardFor(id);
      if (!card) continue;
      if (card.dataset.productiveStage !== pending.requested) {
        applyStage(card, pending.requested, "saving");
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-invalid"],
  });
}

installGeometryAuthority();
installStageAuthority();
document.documentElement.dataset.pipelineInteractionAuthority = "ready";

export { applyStage };

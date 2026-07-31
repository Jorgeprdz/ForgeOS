const STAGE_LABELS = Object.freeze({
  referred_new: "Nuevo",
  contacted: "Contactado",
  appointment_scheduled: "Cita agendada",
  proposal: "Propuesta",
  decision: "En decisión",
  client: "Cliente",
});

const PIPELINE_ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CREATE_REFERRAL_SELECTOR = "[data-pipeline-create-referral]";
const CREATE_ERROR_SELECTOR = "[data-pipeline-create-error]";
const NAME_SEARCH_SELECTOR = "[data-productive-filter-name]";
const NAME_SEARCH_CLEAR_SELECTOR = "[data-clear-productive-name-search]";
const NAME_SEARCH_EMPTY_SELECTOR = "[data-productive-name-filter-empty]";
const NAME_SEARCH_MIN_LENGTH = 3;
const pendingStages = new Map();
const nativePipelineQueries = new WeakMap();
let productiveNameQuery = "";
let nameSearchRenderScheduled = false;

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

function nativePipelineQuery(root, selector) {
  const query = nativePipelineQueries.get(root);
  return query
    ? query(selector)
    : globalThis.Element?.prototype?.querySelector?.call(root, selector) || null;
}

function normalizeCreateReferralAction(action) {
  action.classList.add("pipeline-module__create", "pipeline-module__create--header");
  action.type = "button";
  action.dataset.pipelineCreateReferral = "";
  action.dataset.openReferral = "";
  action.setAttribute("aria-label", "Nuevo referido");
  action.innerHTML = '<span aria-hidden="true">＋</span><span>Nuevo referido</span>';
  return action;
}

function ensurePersistentReferralAction(root) {
  if (!root || nativePipelineQuery(root, "[data-pipeline-auth-state]")) return null;
  const header = nativePipelineQuery(root, ".pipeline-module__header");
  if (!header) return null;

  let action = nativePipelineQuery(root, CREATE_REFERRAL_SELECTOR);
  if (!action) action = document.createElement("button");
  normalizeCreateReferralAction(action);
  header.classList.add("pipeline-module__header--with-action");
  if (action.parentElement !== header) header.append(action);
  return action;
}

function ensurePersistentReferralError(root) {
  if (!root || nativePipelineQuery(root, "[data-pipeline-auth-state]")) return null;
  const header = nativePipelineQuery(root, ".pipeline-module__header");
  if (!header) return null;

  let errorNode = nativePipelineQuery(root, CREATE_ERROR_SELECTOR);
  if (!errorNode) {
    errorNode = document.createElement("p");
    errorNode.className = "pipeline-module__create-error";
    errorNode.dataset.pipelineCreateError = "";
    errorNode.setAttribute("role", "alert");
    errorNode.hidden = true;
  }
  if (errorNode.parentElement !== root) header.insertAdjacentElement("afterend", errorNode);
  return errorNode;
}

function installPersistentReferralAuthority() {
  const root = document.querySelector(PIPELINE_ROOT_SELECTOR);
  if (!root || root.dataset.pipelinePersistentReferralAuthority === "ready") return;

  const nativeQuerySelector = root.querySelector.bind(root);
  nativePipelineQueries.set(root, nativeQuerySelector);
  Object.defineProperty(root, "querySelector", {
    configurable: true,
    value(selector) {
      if (selector === CREATE_REFERRAL_SELECTOR) {
        return ensurePersistentReferralAction(root);
      }
      if (selector === CREATE_ERROR_SELECTOR) {
        return ensurePersistentReferralError(root);
      }
      return nativeQuerySelector(selector);
    },
  });
  root.dataset.pipelinePersistentReferralAuthority = "ready";
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-MX")
    .trim();
}

function productiveCardName(card) {
  return card.querySelector("[data-productive-card-identity] strong, .pipeline-module__productive-identity strong")
    ?.textContent
    ?.trim() || "";
}

function createNameSearchControl() {
  const field = document.createElement("label");
  field.className = "pipeline-module__name-search";
  field.dataset.productiveNameSearchField = "";
  field.innerHTML = `
    <span>Buscar por nombre</span>
    <div class="pipeline-module__name-search-control">
      <span class="pipeline-module__name-search-icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        inputmode="search"
        autocomplete="off"
        spellcheck="false"
        data-productive-filter-name
        aria-describedby="pipeline-name-search-hint"
        placeholder="Escribe al menos 3 caracteres"
      >
      <button
        type="button"
        data-clear-productive-name-search
        aria-label="Limpiar búsqueda por nombre"
        hidden
      >×</button>
    </div>
    <small id="pipeline-name-search-hint">Los resultados aparecen desde el tercer carácter.</small>
  `;
  return field;
}

function updateNameSearchClearAction(root) {
  const input = nativePipelineQuery(root, NAME_SEARCH_SELECTOR);
  const clear = nativePipelineQuery(root, NAME_SEARCH_CLEAR_SELECTOR);
  if (!input || !clear) return;
  clear.hidden = input.value.length === 0;
}

function removeNameSearchEmptyState(root) {
  nativePipelineQuery(root, NAME_SEARCH_EMPTY_SELECTOR)?.remove();
}

function ensureNameSearchEmptyState(root, visibleCount, renderedCardCount) {
  if (renderedCardCount === 0 || visibleCount > 0) {
    removeNameSearchEmptyState(root);
    return;
  }

  let empty = nativePipelineQuery(root, NAME_SEARCH_EMPTY_SELECTOR);
  if (!empty) {
    empty = document.createElement("section");
    empty.className = "pipeline-module__filter-empty";
    empty.dataset.productiveNameFilterEmpty = "";
    empty.innerHTML = "<p>No hay prospectos que coincidan con este nombre.</p>";
    const cards = nativePipelineQuery(root, "[data-productive-pipeline-cards]");
    cards?.insertAdjacentElement("afterend", empty);
  }
}

function applyNameSearch(root) {
  if (!root || nativePipelineQuery(root, "[data-pipeline-auth-state]")) return;
  const input = nativePipelineQuery(root, NAME_SEARCH_SELECTOR);
  const cards = [
    ...root.querySelectorAll("[data-productive-prospect-card]"),
  ];
  const count = nativePipelineQuery(root, "[data-productive-filter-count]");
  if (!input) return;

  const query = input.value.trim();
  productiveNameQuery = query;
  const normalizedQuery = normalizeSearchText(query);
  const active = query.length >= NAME_SEARCH_MIN_LENGTH;
  let visibleCount = 0;

  for (const card of cards) {
    const matches = !active
      || normalizeSearchText(productiveCardName(card)).includes(normalizedQuery);
    card.hidden = !matches;
    card.dataset.nameSearchMatch = matches ? "true" : "false";
    if (matches) visibleCount += 1;
  }

  if (count) {
    if (!count.dataset.productiveNameSearchBaseText) {
      count.dataset.productiveNameSearchBaseText = count.textContent.trim();
    }
    if (active) {
      const totalMatch = count.dataset.productiveNameSearchBaseText.match(/de\s+(\d+)/i);
      const total = totalMatch?.[1] || cards.length;
      count.textContent = `${visibleCount} de ${total} prospectos`;
    } else {
      count.textContent = count.dataset.productiveNameSearchBaseText;
    }
  }

  root.dataset.productiveNameSearchState = active ? "active" : "idle";
  root.dataset.productiveNameSearchLength = String(query.length);
  ensureNameSearchEmptyState(root, active ? visibleCount : cards.length, cards.length);
  updateNameSearchClearAction(root);

  const clearFilters = nativePipelineQuery(root, "[data-clear-productive-filters]");
  if (clearFilters && query.length > 0) clearFilters.disabled = false;
}

function ensureNameSearch(root) {
  if (!root || nativePipelineQuery(root, "[data-pipeline-auth-state]")) return null;
  const filters = nativePipelineQuery(root, "[data-productive-filter-bar]");
  if (!filters) return null;

  let input = nativePipelineQuery(root, NAME_SEARCH_SELECTOR);
  if (!input) {
    filters.prepend(createNameSearchControl());
    input = nativePipelineQuery(root, NAME_SEARCH_SELECTOR);
  }

  if (input.value !== productiveNameQuery) input.value = productiveNameQuery;
  applyNameSearch(root);
  return input;
}

function scheduleNameSearchReconciliation(root) {
  if (nameSearchRenderScheduled) return;
  nameSearchRenderScheduled = true;
  queueMicrotask(() => {
    nameSearchRenderScheduled = false;
    ensureNameSearch(root);
  });
}

function installNameSearchAuthority() {
  const root = document.querySelector(PIPELINE_ROOT_SELECTOR);
  if (!root || root.dataset.pipelineNameSearchAuthority === "ready") return;

  root.addEventListener("input", event => {
    const input = event.target?.closest?.(NAME_SEARCH_SELECTOR);
    if (!input) return;
    productiveNameQuery = input.value;
    applyNameSearch(root);
  });

  root.addEventListener("click", event => {
    const clearName = event.target?.closest?.(NAME_SEARCH_CLEAR_SELECTOR);
    if (clearName) {
      const input = nativePipelineQuery(root, NAME_SEARCH_SELECTOR);
      if (!input) return;
      input.value = "";
      productiveNameQuery = "";
      applyNameSearch(root);
      input.focus();
      return;
    }

    if (event.target?.closest?.("[data-clear-productive-filters]")) {
      const input = nativePipelineQuery(root, NAME_SEARCH_SELECTOR);
      if (input) input.value = "";
      productiveNameQuery = "";
      applyNameSearch(root);
    }
  }, true);

  const observer = new MutationObserver(mutations => {
    if (!mutations.some(mutation => mutation.type === "childList")) return;
    scheduleNameSearchReconciliation(root);
  });
  observer.observe(root, { childList: true, subtree: false });
  root.dataset.pipelineNameSearchAuthority = "ready";
  scheduleNameSearchReconciliation(root);
}

function installGeometryAuthority() {
  if (document.querySelector("[data-pipeline-interaction-authority-styles]")) return;
  const style = document.createElement("style");
  style.dataset.pipelineInteractionAuthorityStyles = "true";
  style.textContent = `
    .pipeline-module .pipeline-module__header--with-action {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      gap: 6px 18px;
    }
    .pipeline-module .pipeline-module__header--with-action > p,
    .pipeline-module .pipeline-module__header--with-action > h1,
    .pipeline-module .pipeline-module__header--with-action > span {
      grid-column: 1;
      min-width: 0;
    }
    .pipeline-module .pipeline-module__header--with-action > p {
      grid-row: 1;
      margin-bottom: 2px;
    }
    .pipeline-module .pipeline-module__header--with-action > h1 {
      grid-row: 2;
    }
    .pipeline-module .pipeline-module__header--with-action > span {
      grid-row: 3;
    }
    .pipeline-module .pipeline-module__create--header {
      grid-column: 2;
      grid-row: 1 / 4;
      align-self: end;
      width: auto;
      min-height: 48px;
      white-space: nowrap;
    }
    .pipeline-module .pipeline-module__name-search {
      display: grid;
      gap: 5px;
      min-width: 0;
    }
    .pipeline-module .pipeline-module__name-search > span {
      color: var(--muted);
      font-size: 10px;
      font-weight: 760;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .pipeline-module .pipeline-module__name-search-control {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 0;
    }
    .pipeline-module .pipeline-module__name-search-icon {
      position: absolute;
      left: 12px;
      z-index: 1;
      color: var(--muted);
      font-size: 18px;
      pointer-events: none;
    }
    .pipeline-module .pipeline-module__name-search input {
      width: 100%;
      min-width: 0;
      min-height: 48px;
      border: 1px solid rgba(184, 211, 255, .2);
      border-radius: 14px;
      padding: 8px 42px 8px 38px;
      color: var(--ink);
      background: rgba(5, 18, 35, .86);
      font: inherit;
      font-size: 13px;
      font-weight: 650;
      color-scheme: dark;
    }
    .pipeline-module .pipeline-module__name-search input:focus-visible {
      border-color: var(--aqua);
      outline: 2px solid var(--aqua);
      outline-offset: 2px;
    }
    .pipeline-module .pipeline-module__name-search input::-webkit-search-cancel-button {
      appearance: none;
    }
    .pipeline-module .pipeline-module__name-search-control button {
      position: absolute;
      right: 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      min-width: 40px;
      min-height: 40px;
      border: 0;
      border-radius: 50%;
      padding: 0;
      color: var(--muted);
      background: transparent;
      font-size: 22px;
      cursor: pointer;
    }
    .pipeline-module .pipeline-module__name-search-control button:hover {
      color: var(--ink);
      background: rgba(255, 255, 255, .08);
    }
    .pipeline-module .pipeline-module__name-search small {
      color: var(--muted);
      font-size: 10px;
      line-height: 1.3;
    }
    .pipeline-module .pipeline-module__productive-card[hidden] {
      display: none !important;
    }
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
    @media (min-width: 768px) and (max-width: 1199px) {
      .pipeline-module .pipeline-module__name-search {
        grid-column: 1 / -1;
      }
    }
    @media (min-width: 1200px) {
      .pipeline-module .pipeline-module__filters {
        grid-template-columns:
          minmax(240px, 1.35fr)
          minmax(160px, .8fr)
          minmax(160px, .8fr)
          auto
          auto;
      }
    }
    @media (max-width: 759px) {
      .pipeline-module .pipeline-module__header--with-action {
        grid-template-columns: minmax(0, 1fr);
      }
      .pipeline-module .pipeline-module__header--with-action > p,
      .pipeline-module .pipeline-module__header--with-action > h1,
      .pipeline-module .pipeline-module__header--with-action > span,
      .pipeline-module .pipeline-module__create--header {
        grid-column: 1;
        grid-row: auto;
      }
      .pipeline-module .pipeline-module__create--header {
        width: 100%;
        margin-top: 10px;
      }
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

installPersistentReferralAuthority();
installNameSearchAuthority();
installGeometryAuthority();
installStageAuthority();
document.documentElement.dataset.pipelineInteractionAuthority = "ready";

export {
  NAME_SEARCH_MIN_LENGTH,
  applyNameSearch,
  applyStage,
  ensureNameSearch,
  ensurePersistentReferralAction,
  ensurePersistentReferralError,
  normalizeCreateReferralAction,
  normalizeSearchText,
};

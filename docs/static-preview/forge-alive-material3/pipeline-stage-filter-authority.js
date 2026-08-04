import "./pipeline-bulk-import-mount.js?v=beta1-repair-001";
import "./whatsapp-ai-composer.js?v=beta1-repair-001";
import "./cartera-document-intake.js?v=beta1-022-001";

const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const GRID_SELECTOR = "[data-productive-pipeline-cards]";
const EMPTY_SELECTOR = "[data-productive-filter-empty]";
const SOURCE_SELECTOR = "[data-productive-filter-source]";
const STATUS_SELECTOR = "[data-productive-filter-status]";
const CLEAR_SELECTOR = "[data-clear-productive-filters]";
const NAME_SELECTOR = "[data-productive-filter-name]";
const COUNT_SELECTOR = "[data-productive-filter-count]";
const INSTALL_KEY = Symbol.for(
  "forge.material3.pipeline.stage-filter-state-authority",
);

function cardId(card) {
  return card?.dataset?.productiveProspectCard || "";
}

function createState() {
  return {
    cards: new Map(),
    order: [],
    source: "",
    status: "",
  };
}

function registerCard(state, card) {
  const id = cardId(card);
  if (!id) return;
  if (!state.cards.has(id)) state.order.push(id);
  state.cards.set(id, card);
}

function refreshRegistryFromDom(root, state) {
  const cards = [...root.querySelectorAll(CARD_SELECTOR)];
  if (!cards.length) return;
  state.cards.clear();
  state.order = [];
  cards.forEach(card => registerCard(state, card));
}

function ensureFilterSurfaces(root) {
  const documentRef = root.ownerDocument;
  let grid = root.querySelector(GRID_SELECTOR);
  let empty = root.querySelector(EMPTY_SELECTOR);

  if (!grid) {
    grid = documentRef.createElement("div");
    grid.className = "pipeline-module__stages";
    grid.dataset.productivePipelineCards = "";
    if (empty) empty.insertAdjacentElement("beforebegin", grid);
    else {
      const filters = root.querySelector("[data-productive-filter-bar]");
      if (filters) filters.insertAdjacentElement("afterend", grid);
      else root.append(grid);
    }
  }

  if (!empty) {
    empty = documentRef.createElement("section");
    empty.className = "pipeline-module__filter-empty";
    empty.dataset.productiveFilterEmpty = "";
    empty.innerHTML = "<p>No hay prospectos que coincidan con estos filtros.</p>";
    grid.insertAdjacentElement("afterend", empty);
  }

  return { grid, empty };
}

function matchesFilters(card, state) {
  return (
    (!state.source || card.dataset.productiveSource === state.source)
    && (!state.status || card.dataset.productiveStage === state.status)
  );
}

function totalFromHeader(root, fallback) {
  const text = root.querySelector(".pipeline-module__header > span")
    ?.textContent?.trim() || "";
  const match = text.match(/(\d+)\s+prospect/i);
  return match ? Number(match[1]) : fallback;
}

function updateControls(root, state, visibleCount) {
  const source = root.querySelector(SOURCE_SELECTOR);
  const status = root.querySelector(STATUS_SELECTOR);
  if (source && source.value !== state.source) source.value = state.source;
  if (status && status.value !== state.status) status.value = state.status;

  const total = totalFromHeader(root, state.cards.size);
  const count = root.querySelector(COUNT_SELECTOR);
  if (count) {
    count.textContent = `${visibleCount} de ${total} prospectos`;
    count.dataset.productiveFilterTotal = String(total);
    count.dataset.productiveFilterNumeratorAuthority = "PIPELINE_FILTERS";
  }

  const nameQuery = root.querySelector(NAME_SELECTOR)?.value?.trim() || "";
  const clear = root.querySelector(CLEAR_SELECTOR);
  if (clear) clear.disabled = !(state.source || state.status || nameQuery);
}

function applyFiltersInPlace(root, state) {
  const cards = state.order
    .map(id => state.cards.get(id))
    .filter(Boolean);
  const matching = cards.filter(card => matchesFilters(card, state));
  const { grid, empty } = ensureFilterSurfaces(root);

  grid.replaceChildren(...matching);
  grid.hidden = matching.length === 0;
  empty.hidden = matching.length !== 0;
  updateControls(root, state, matching.length);
  root.ownerDocument.documentElement.dataset.pipelineStageFilterAuthority =
    "ready";

  const nameInput = root.querySelector(NAME_SELECTOR);
  if (nameInput?.value) {
    nameInput.dispatchEvent(new root.ownerDocument.defaultView.Event(
      "input",
      { bubbles: true },
    ));
  }
  return matching;
}

function clearAllFilters(root, state) {
  state.source = "";
  state.status = "";
  const source = root.querySelector(SOURCE_SELECTOR);
  const status = root.querySelector(STATUS_SELECTOR);
  const name = root.querySelector(NAME_SELECTOR);
  if (source) source.value = "";
  if (status) status.value = "";
  if (name) name.value = "";
  return applyFiltersInPlace(root, state);
}

export function installPipelineStageFilterAuthority({
  documentRef = document,
} = {}) {
  const root = documentRef.querySelector(ROOT_SELECTOR);
  if (!root) return null;
  if (root[INSTALL_KEY]) return root[INSTALL_KEY];

  const state = createState();

  const onChange = event => {
    const source = event.target?.closest?.(SOURCE_SELECTOR);
    const status = event.target?.closest?.(STATUS_SELECTOR);
    if (!source && !status) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!state.source && !state.status) refreshRegistryFromDom(root, state);
    state.source = root.querySelector(SOURCE_SELECTOR)?.value || "";
    state.status = root.querySelector(STATUS_SELECTOR)?.value || "";
    applyFiltersInPlace(root, state);
  };

  const onClick = event => {
    if (!event.target?.closest?.(CLEAR_SELECTOR)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!state.cards.size) refreshRegistryFromDom(root, state);
    clearAllFilters(root, state);
  };

  root.addEventListener("change", onChange, true);
  root.addEventListener("click", onClick, true);
  queueMicrotask(() => refreshRegistryFromDom(root, state));

  const api = Object.freeze({
    installed: true,
    apply: () => applyFiltersInPlace(root, state),
    refresh: () => refreshRegistryFromDom(root, state),
    getState: () => Object.freeze({
      source: state.source,
      status: state.status,
      cardCount: state.cards.size,
    }),
    disconnect() {
      root.removeEventListener("change", onChange, true);
      root.removeEventListener("click", onClick, true);
      delete root[INSTALL_KEY];
      delete documentRef.documentElement.dataset.pipelineStageFilterAuthority;
    },
  });
  root[INSTALL_KEY] = api;
  return api;
}

if (
  typeof document !== "undefined"
  && !globalThis.__FORGE_DISABLE_PIPELINE_STAGE_FILTER_AUTHORITY_AUTO_INSTALL__
) {
  installPipelineStageFilterAuthority();
}

export {
  applyFiltersInPlace,
  matchesFilters,
  refreshRegistryFromDom,
  registerCard,
};

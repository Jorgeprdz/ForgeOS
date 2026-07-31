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
    observer: null,
    scheduled: false,
  };
}

function registerCard(state, card) {
  const id = cardId(card);
  if (!id) return;
  if (!state.cards.has(id)) state.order.push(id);
  state.cards.set(id, card);
}

function replaceRegistryFromDom(root, state) {
  const cards = [...root.querySelectorAll(CARD_SELECTOR)];
  if (!cards.length) return false;
  state.cards.clear();
  state.order = [];
  cards.forEach(card => registerCard(state, card));
  return true;
}

function mergeRegistryFromDom(root, state) {
  root.querySelectorAll(CARD_SELECTOR).forEach(card => registerCard(state, card));
}

function observe(root, state) {
  state.observer?.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-productive-stage", "data-productive-source"],
  });
}

function pauseObservation(state) {
  state.observer?.disconnect();
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
  const sourceMatches = !state.source
    || card.dataset.productiveSource === state.source;
  const statusMatches = !state.status
    || card.dataset.productiveStage === state.status;
  return sourceMatches && statusMatches;
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

function reapplyNameSearch(root) {
  const input = root.querySelector(NAME_SELECTOR);
  if (!input) return;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyFiltersInPlace(root, state) {
  mergeRegistryFromDom(root, state);
  const cards = state.order
    .map(id => state.cards.get(id))
    .filter(Boolean);
  const matching = cards.filter(card => matchesFilters(card, state));
  const { grid, empty } = ensureFilterSurfaces(root);

  pauseObservation(state);
  try {
    grid.replaceChildren(...matching);
    grid.hidden = matching.length === 0;
    empty.hidden = matching.length !== 0;
    updateControls(root, state, matching.length);
    root.ownerDocument.documentElement.dataset.pipelineStageFilterAuthority =
      "ready";
  } finally {
    observe(root, state);
  }

  queueMicrotask(() => reapplyNameSearch(root));
  return matching;
}

function synchronizeFromDom(root, state) {
  const source = root.querySelector(SOURCE_SELECTOR)?.value || "";
  const status = root.querySelector(STATUS_SELECTOR)?.value || "";
  const controlsChanged = source !== state.source || status !== state.status;

  if (controlsChanged) {
    state.source = source;
    state.status = status;
  }

  if (!state.source && !state.status) replaceRegistryFromDom(root, state);
  else mergeRegistryFromDom(root, state);
}

function scheduleSynchronize(root, state) {
  if (state.scheduled) return;
  state.scheduled = true;
  queueMicrotask(() => {
    state.scheduled = false;
    synchronizeFromDom(root, state);
    if (state.source || state.status) applyFiltersInPlace(root, state);
  });
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
  applyFiltersInPlace(root, state);
}

export function installPipelineStageFilterAuthority({
  documentRef = document,
  windowRef = window,
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
    mergeRegistryFromDom(root, state);
    state.source = root.querySelector(SOURCE_SELECTOR)?.value || "";
    state.status = root.querySelector(STATUS_SELECTOR)?.value || "";
    applyFiltersInPlace(root, state);
  };

  const onClick = event => {
    if (!event.target?.closest?.(CLEAR_SELECTOR)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    mergeRegistryFromDom(root, state);
    clearAllFilters(root, state);
  };

  state.observer = new windowRef.MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes"
        && mutation.target?.matches?.(CARD_SELECTOR)
      ) {
        registerCard(state, mutation.target);
      }
      for (const node of mutation.addedNodes || []) {
        if (!(node instanceof windowRef.Element)) continue;
        if (node.matches(CARD_SELECTOR)) registerCard(state, node);
        node.querySelectorAll?.(CARD_SELECTOR).forEach(card =>
          registerCard(state, card)
        );
      }
    }
    scheduleSynchronize(root, state);
  });

  root.addEventListener("change", onChange, true);
  root.addEventListener("click", onClick, true);
  observe(root, state);
  scheduleSynchronize(root, state);

  const api = Object.freeze({
    installed: true,
    apply: () => applyFiltersInPlace(root, state),
    getState: () => Object.freeze({
      source: state.source,
      status: state.status,
      cardCount: state.cards.size,
    }),
    disconnect() {
      state.observer.disconnect();
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
  && typeof window !== "undefined"
  && !globalThis.__FORGE_DISABLE_PIPELINE_STAGE_FILTER_AUTHORITY_AUTO_INSTALL__
) {
  installPipelineStageFilterAuthority();
}

export {
  applyFiltersInPlace,
  matchesFilters,
  registerCard,
  replaceRegistryFromDom,
};

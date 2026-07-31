const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const NAME_INPUT_SELECTOR = "[data-productive-filter-name]";
const COUNT_SELECTOR = "[data-productive-filter-count]";
const HOTFIX_KEY = Symbol.for("forge.material3.pipeline.public-acceptance-hotfix");
const AUTHORITY_KEY = Symbol.for("forge.material3.pipeline.filter-count-authority");
const SEARCH_MIN_LENGTH = 3;

function numericTotal(root) {
  const headerText = root.querySelector(".pipeline-module__header > span")
    ?.textContent?.trim() || "";
  const headerMatch = headerText.match(/(\d+)\s+prospect/i);
  if (headerMatch) return Number(headerMatch[1]);

  const countText = root.querySelector(COUNT_SELECTOR)?.textContent?.trim() || "";
  const countMatch = countText.match(/de\s+(\d+)/i);
  if (countMatch) return Number(countMatch[1]);

  return root.querySelectorAll(CARD_SELECTOR).length;
}

function visibleCardCount(root) {
  return [...root.querySelectorAll(CARD_SELECTOR)].filter(card => (
    !card.hidden && card.style.display !== "none"
  )).length;
}

function reconcileFilterCount(root) {
  const count = root.querySelector(COUNT_SELECTOR);
  if (!count) return;

  const cards = [...root.querySelectorAll(CARD_SELECTOR)];
  const query = root.querySelector(NAME_INPUT_SELECTOR)?.value?.trim() || "";
  const searchActive = query.length >= SEARCH_MIN_LENGTH;
  const numerator = searchActive ? visibleCardCount(root) : cards.length;
  const total = numericTotal(root);
  const nextText = `${numerator} de ${total} prospectos`;

  if (count.textContent.trim() !== nextText) count.textContent = nextText;
  count.dataset.productiveFilterTotal = String(total);
  count.dataset.productiveFilterNumeratorAuthority = searchActive
    ? "NAME_SEARCH"
    : "PIPELINE_FILTERS";
}

export function installPipelineFilterCountAuthority({
  documentRef = document,
  windowRef = window,
} = {}) {
  const root = documentRef.querySelector(ROOT_SELECTOR);
  if (!root) return null;
  if (root[AUTHORITY_KEY]) return root[AUTHORITY_KEY];

  const hotfix = root[HOTFIX_KEY];
  if (!hotfix?.synchronize || !hotfix?.disconnect) return null;

  hotfix.disconnect();
  let scheduled = false;
  let observer;

  const observe = () => observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  const synchronize = () => {
    observer.disconnect();
    try {
      hotfix.synchronize();
      reconcileFilterCount(root);
      documentRef.documentElement.dataset.pipelineFilterCountAuthority = "ready";
    } finally {
      observe();
    }
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      synchronize();
    });
  };

  observer = new windowRef.MutationObserver(mutations => {
    if (mutations.some(mutation => (
      mutation.type === "childList" || mutation.type === "characterData"
    ))) schedule();
  });

  for (const eventName of ["input", "keyup", "change", "search", "click"]) {
    root.addEventListener(eventName, event => {
      if (
        event.target?.closest?.(NAME_INPUT_SELECTOR)
        || event.target?.closest?.("[data-clear-productive-name-search]")
        || event.target?.closest?.("[data-clear-productive-filters]")
      ) {
        queueMicrotask(() => reconcileFilterCount(root));
      }
    }, true);
  }

  observe();
  schedule();

  const api = Object.freeze({
    installed: true,
    reconcile: () => reconcileFilterCount(root),
    synchronize,
    disconnect() {
      observer.disconnect();
      delete root[AUTHORITY_KEY];
      delete documentRef.documentElement.dataset.pipelineFilterCountAuthority;
    },
  });
  root[AUTHORITY_KEY] = api;
  return api;
}

if (
  typeof document !== "undefined"
  && typeof window !== "undefined"
  && !globalThis.__FORGE_DISABLE_PIPELINE_FILTER_COUNT_AUTHORITY_AUTO_INSTALL__
) {
  installPipelineFilterCountAuthority();
}

export {
  numericTotal,
  reconcileFilterCount,
  visibleCardCount,
};

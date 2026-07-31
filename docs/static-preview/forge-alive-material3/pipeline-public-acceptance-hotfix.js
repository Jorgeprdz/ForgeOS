import {
  createProductiveIntelligenceAdapter,
} from "./pipeline-productive-intelligence-adapter.js?v=pipeline-public-acceptance-001";

const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const NAME_INPUT_SELECTOR = "[data-productive-filter-name]";
const NAME_CLEAR_SELECTOR = "[data-clear-productive-name-search]";
const NAME_EMPTY_SELECTOR = "[data-productive-name-filter-empty]";
const STAGE_SELECTOR = "[data-productive-stage-control]";
const SEARCH_MIN_LENGTH = 3;
const INSTALL_KEY = Symbol.for("forge.material3.pipeline.public-acceptance-hotfix");
const STAGE_LABELS = Object.freeze({
  referred_new: "Nuevo",
  contacted: "Contactado",
  appointment_scheduled: "Cita agendada",
  proposal: "Propuesta",
  decision: "En decisión",
  client: "Cliente",
});

let servicePromise;
let nameQuery = "";
let scheduled = false;
let pendingStage = null;
let statusTimer;

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-MX")
    .trim();
}

function createNameSearch(documentRef) {
  const field = documentRef.createElement("label");
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

function ensureNameSearch(root) {
  const filters = root.querySelector("[data-productive-filter-bar]");
  if (!filters) return null;
  let input = filters.querySelector(NAME_INPUT_SELECTOR);
  if (!input) {
    filters.prepend(createNameSearch(root.ownerDocument));
    input = filters.querySelector(NAME_INPUT_SELECTOR);
  }
  if (input && input.value !== nameQuery) input.value = nameQuery;
  return input;
}

function cardName(card) {
  return card.querySelector(
    "[data-productive-card-identity] strong, .pipeline-module__productive-name > strong",
  )?.textContent?.trim() || "";
}

function syncNameEmptyState(root, { active, visible, total }) {
  const current = root.querySelector(NAME_EMPTY_SELECTOR);
  if (!active || total === 0 || visible > 0) {
    current?.remove();
    return;
  }
  if (current) return;
  const empty = root.ownerDocument.createElement("section");
  empty.className = "pipeline-module__filter-empty";
  empty.dataset.productiveNameFilterEmpty = "";
  empty.innerHTML = "<p>No hay prospectos que coincidan con este nombre.</p>";
  root.querySelector("[data-productive-pipeline-cards]")?.insertAdjacentElement("afterend", empty);
}

function applyNameSearch(root) {
  const input = root.querySelector(NAME_INPUT_SELECTOR);
  if (!input) return;

  nameQuery = input.value;
  const query = input.value.trim();
  const normalized = normalizeSearchText(query);
  const active = query.length >= SEARCH_MIN_LENGTH;
  const cards = [...root.querySelectorAll(CARD_SELECTOR)];
  let visible = 0;

  for (const card of cards) {
    const matches = !active || normalizeSearchText(cardName(card)).includes(normalized);
    if (card.hidden === matches) card.hidden = !matches;
    const nextDisplay = matches ? "" : "none";
    if (card.style.display !== nextDisplay) card.style.display = nextDisplay;
    const nextMatch = matches ? "true" : "false";
    if (card.dataset.nameSearchMatch !== nextMatch) card.dataset.nameSearchMatch = nextMatch;
    if (matches) visible += 1;
  }

  const count = root.querySelector("[data-productive-filter-count]");
  const countText = active
    ? `${visible} de ${cards.length} prospectos`
    : `${cards.length} de ${cards.length} prospectos`;
  if (count && count.textContent.trim() !== countText) count.textContent = countText;

  const clearName = root.querySelector(NAME_CLEAR_SELECTOR);
  if (clearName && clearName.hidden !== (query.length === 0)) {
    clearName.hidden = query.length === 0;
  }

  const source = root.querySelector("[data-productive-filter-source]")?.value || "";
  const status = root.querySelector("[data-productive-filter-status]")?.value || "";
  const clearFilters = root.querySelector("[data-clear-productive-filters]");
  const disabled = !(query || source || status);
  if (clearFilters && clearFilters.disabled !== disabled) clearFilters.disabled = disabled;

  root.dataset.productiveNameSearchState = active ? "active" : "idle";
  root.dataset.productiveNameSearchLength = String(query.length);
  syncNameEmptyState(root, { active, visible, total: cards.length });
}

function ensureStatusNode(root) {
  let node = root.querySelector("[data-pipeline-public-acceptance-status]");
  if (node) return node;
  node = root.ownerDocument.createElement("p");
  node.className = "pipeline-module__referral-status pipeline-module__public-acceptance-status";
  node.dataset.pipelinePublicAcceptanceStatus = "";
  node.hidden = true;
  root.querySelector(".pipeline-module__header")?.insertAdjacentElement("afterend", node);
  if (!node.isConnected) root.prepend(node);
  return node;
}

function showStatus(root, message, { error = false, persist = false } = {}) {
  const node = ensureStatusNode(root);
  clearTimeout(statusTimer);
  node.hidden = false;
  if (node.textContent !== message) node.textContent = message;
  node.dataset.state = error ? "error" : "success";
  node.setAttribute("role", error ? "alert" : "status");
  if (persist) return;
  statusTimer = setTimeout(() => {
    if (!node.isConnected) return;
    node.hidden = true;
    node.textContent = "";
    delete node.dataset.state;
  }, 4200);
}

function stageErrorMessage(error) {
  if (error?.code === "AUTH_REQUIRED") {
    return "Tu sesión expiró. Inicia sesión nuevamente para cambiar el estado.";
  }
  if (
    error?.code === "PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH"
    || error?.code === "PRODUCTIVE_STAGE_LIST_CONFIRMATION_MISMATCH"
  ) {
    return "Supabase no confirmó el nuevo estado. No se aplicó el cambio.";
  }
  return "No pudimos cambiar el estado. Revisa tu conexión e intenta nuevamente.";
}

function assertStageConfirmed({ prospect, prospectId, status, phase }) {
  if (prospect?.id === prospectId && prospect.status === status) return prospect;
  const error = new Error("PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH");
  error.code = phase === "list"
    ? "PRODUCTIVE_STAGE_LIST_CONFIRMATION_MISMATCH"
    : "PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH";
  error.details = Object.freeze({
    phase,
    prospectId,
    requestedStatus: status,
    returnedId: prospect?.id || null,
    returnedStatus: prospect?.status || null,
  });
  throw error;
}

async function getService() {
  const injected = globalThis.__FORGE_PIPELINE_ACCEPTANCE_SERVICE_FACTORY__;
  if (typeof injected === "function") return injected();
  if (!servicePromise) {
    servicePromise = createProductiveIntelligenceAdapter()
      .then(adapter => adapter.service)
      .catch(error => {
        servicePromise = undefined;
        throw error;
      });
  }
  return servicePromise;
}

function applyConfirmedStage(card, select, status) {
  card.dataset.productiveStage = status;
  select.value = status;
  select.dataset.confirmedStage = status;
  const duplicateLabel = card.querySelector("[data-productive-stage-label]");
  if (duplicateLabel && duplicateLabel.textContent !== (STAGE_LABELS[status] || status)) {
    duplicateLabel.textContent = STAGE_LABELS[status] || status;
  }
}

async function persistStage(root, select) {
  const card = select.closest(CARD_SELECTOR);
  const prospectId = select.dataset.productiveStageControl;
  if (!card || !prospectId) return;

  const previous = select.dataset.confirmedStage || card.dataset.productiveStage || "";
  const requested = select.value;
  if (!requested || requested === previous) return;

  select.disabled = true;
  select.setAttribute("aria-busy", "true");
  select.removeAttribute("aria-invalid");
  card.dataset.stagePersistence = "saving";
  showStatus(root, "Guardando estado…", { persist: true });

  try {
    const service = await getService();
    assertStageConfirmed({
      prospect: await service.updateProspect(prospectId, { status: requested }),
      prospectId,
      status: requested,
      phase: "update",
    });
    const confirmed = assertStageConfirmed({
      prospect: await service.getProspect(prospectId),
      prospectId,
      status: requested,
      phase: "read-after-write",
    });
    const listed = (await service.listProspects()).find(item => item.id === prospectId);
    assertStageConfirmed({
      prospect: listed,
      prospectId,
      status: requested,
      phase: "list",
    });

    applyConfirmedStage(card, select, confirmed.status);
    card.dataset.stagePersistence = "saved";
    pendingStage = Object.freeze({
      prospectId,
      status: confirmed.status,
      expiresAt: Date.now() + 12000,
    });
    showStatus(root, `Estado actualizado a ${STAGE_LABELS[confirmed.status] || confirmed.status}.`);
    globalThis.dispatchEvent(new CustomEvent("forge:auth-state-changed", {
      detail: Object.freeze({
        status: "authenticated",
        source: "pipeline-public-acceptance-hotfix",
      }),
    }));
  } catch (error) {
    select.value = previous;
    select.dataset.confirmedStage = previous;
    select.setAttribute("aria-invalid", "true");
    card.dataset.stagePersistence = "error";
    showStatus(root, stageErrorMessage(error), { error: true, persist: true });
  } finally {
    if (select.isConnected) {
      select.disabled = false;
      select.removeAttribute("aria-busy");
    }
  }
}

function compactStageControl(card) {
  const identity = card.querySelector("[data-productive-card-identity]");
  const control = card.querySelector(".pipeline-module__stage-control");
  const select = control?.querySelector(STAGE_SELECTOR);
  if (!identity || !control || !select) return;

  control.classList.add("pipeline-module__stage-control--compact");
  if (control.parentElement !== identity) identity.append(control);
  identity.querySelector("[data-productive-stage-label]")?.setAttribute("aria-hidden", "true");
  if (!select.dataset.confirmedStage) {
    select.dataset.confirmedStage = card.dataset.productiveStage || select.value;
  }
}

function installStyles(documentRef) {
  if (documentRef.querySelector("[data-pipeline-public-acceptance-styles]")) return;
  const style = documentRef.createElement("style");
  style.dataset.pipelinePublicAcceptanceStyles = "true";
  style.textContent = `
    .pipeline-module .pipeline-module__filters {
      align-items: end !important;
    }

    .pipeline-module .pipeline-module__name-search {
      position: relative;
      align-self: end;
      gap: 5px !important;
    }

    .pipeline-module .pipeline-module__name-search small,
    .pipeline-module .pipeline-module__stage-control--compact > span {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0 0 0 0) !important;
      white-space: nowrap !important;
    }

    .pipeline-module .pipeline-module__name-search-control,
    .pipeline-module .pipeline-module__name-search input,
    .pipeline-module .pipeline-module__filters > label > select {
      box-sizing: border-box !important;
      min-height: 40px !important;
      height: 40px !important;
    }

    .pipeline-module .pipeline-module__filters > p,
    .pipeline-module .pipeline-module__filters > button {
      align-self: end !important;
    }

    .pipeline-module .pipeline-module__productive-card[hidden] {
      display: none !important;
    }

    .pipeline-module .pipeline-module__productive-identity {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      grid-auto-flow: row !important;
      align-items: start !important;
      gap: 8px 10px !important;
    }

    .pipeline-module .pipeline-module__productive-name {
      grid-column: 1 !important;
      grid-row: 1 / span 2 !important;
      min-width: 0 !important;
    }

    .pipeline-module .pipeline-module__productive-stage {
      display: none !important;
    }

    .pipeline-module .pipeline-module__stage-control--compact {
      grid-column: 2 !important;
      grid-row: 1 !important;
      align-self: start !important;
      justify-self: end !important;
      width: auto !important;
      min-width: 0 !important;
      margin: 0 !important;
    }

    .pipeline-module .pipeline-module__stage-control--compact select {
      box-sizing: border-box !important;
      width: auto !important;
      min-width: 124px !important;
      max-width: 156px !important;
      min-height: 32px !important;
      height: 32px !important;
      margin: 0 !important;
      padding: 4px 30px 4px 10px !important;
      border-radius: 999px !important;
      font-size: 10px !important;
      font-weight: 760 !important;
      line-height: 1 !important;
    }

    .pipeline-module .pipeline-module__public-acceptance-status[data-state="error"] {
      color: #ffb4ab !important;
    }

    @media (min-width: 680px) {
      .pipeline-module .pipeline-module__card-actions {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 679px) {
      .pipeline-module .pipeline-module__card-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 560px) {
      .pipeline-module .pipeline-module__productive-identity {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      .pipeline-module .pipeline-module__productive-name,
      .pipeline-module .pipeline-module__stage-control--compact {
        grid-column: 1 !important;
        grid-row: auto !important;
      }

      .pipeline-module .pipeline-module__stage-control--compact {
        justify-self: start !important;
      }
    }
  `;
  documentRef.head.append(style);
}

function synchronize(root) {
  const input = ensureNameSearch(root);
  root.querySelectorAll(CARD_SELECTOR).forEach(compactStageControl);
  if (input) applyNameSearch(root);

  if (pendingStage) {
    const confirmation = pendingStage;
    const card = root.querySelector(
      `${CARD_SELECTOR}[data-productive-prospect-card="${CSS.escape(confirmation.prospectId)}"]`,
    );
    if (card?.dataset.productiveStage === confirmation.status) {
      pendingStage = null;
      showStatus(root, `Estado actualizado a ${STAGE_LABELS[confirmation.status] || confirmation.status}.`);
    } else if (Date.now() > confirmation.expiresAt) {
      pendingStage = null;
      showStatus(root, "El estado se guardó, pero la tarjeta no pudo reconciliarse. Recarga la página.", {
        error: true,
        persist: true,
      });
    }
  }

  document.documentElement.dataset.pipelinePublicAcceptanceHotfix = "ready";
  document.documentElement.dataset.pipelineStageAuthority = "pipeline-public-acceptance-hotfix";
}

function schedule(root) {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    synchronize(root);
  });
}

export function installPipelinePublicAcceptanceHotfix({
  documentRef = document,
  windowRef = window,
} = {}) {
  const root = documentRef.querySelector(ROOT_SELECTOR);
  if (!root) return null;
  if (root[INSTALL_KEY]) return root[INSTALL_KEY];

  installStyles(documentRef);

  root.addEventListener("input", event => {
    const input = event.target?.closest?.(NAME_INPUT_SELECTOR);
    if (!input) return;
    nameQuery = input.value;
    applyNameSearch(root);
  }, true);

  for (const eventName of ["keyup", "change", "search"]) {
    root.addEventListener(eventName, event => {
      const input = event.target?.closest?.(NAME_INPUT_SELECTOR);
      if (!input) return;
      nameQuery = input.value;
      applyNameSearch(root);
    }, true);
  }

  root.addEventListener("click", event => {
    if (event.target?.closest?.(NAME_CLEAR_SELECTOR)) {
      nameQuery = "";
      queueMicrotask(() => {
        const input = root.querySelector(NAME_INPUT_SELECTOR);
        if (input) input.value = "";
        applyNameSearch(root);
      });
    } else if (event.target?.closest?.("[data-clear-productive-filters]")) {
      nameQuery = "";
    }
  }, true);

  root.addEventListener("change", event => {
    const select = event.target?.closest?.(STAGE_SELECTOR);
    if (!select) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void persistStage(root, select);
  }, true);

  const observer = new windowRef.MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.type === "childList")) schedule(root);
  });
  observer.observe(root, { childList: true, subtree: true });
  schedule(root);

  const api = Object.freeze({
    installed: true,
    synchronize: () => synchronize(root),
    applyNameSearch: () => applyNameSearch(root),
    disconnect() {
      observer.disconnect();
      delete root[INSTALL_KEY];
      delete documentRef.documentElement.dataset.pipelinePublicAcceptanceHotfix;
    },
  });
  root[INSTALL_KEY] = api;
  return api;
}

if (
  typeof document !== "undefined"
  && typeof window !== "undefined"
  && !globalThis.__FORGE_DISABLE_PIPELINE_PUBLIC_ACCEPTANCE_HOTFIX_AUTO_INSTALL__
) {
  installPipelinePublicAcceptanceHotfix();
}

export {
  SEARCH_MIN_LENGTH,
  applyNameSearch,
  assertStageConfirmed,
  normalizeSearchText,
};

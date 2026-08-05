const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const COLLECTION_SELECTOR = "[data-productive-pipeline-cards]";
const FILTERS_SELECTOR = "[data-productive-filter-bar]";
const STORAGE_KEY = "forge.pipeline.view.v1";
const INSTALL_KEY = Symbol.for("forge.aura.pipeline.productive-view.v1");
const DESIGN_AUTHORITY = "FORGE_AURA_LIGHT_2026_V1";

const ICONS = Object.freeze({
  cards: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h3v3H4V5Zm5 0h11v3H9V5ZM4 10.5h3v3H4v-3Zm5 0h11v3H9v-3ZM4 16h3v3H4v-3Zm5 0h11v3H9v-3Z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a9.75 9.75 0 0 0-8.44 14.64L2.25 21.5l4.97-1.3A9.75 9.75 0 1 0 12 2Zm0 17.5a7.7 7.7 0 0 1-3.93-1.07l-.38-.22-2.95.77.79-2.87-.25-.4A7.75 7.75 0 1 1 12 19.5Zm4.25-5.8c-.23-.12-1.37-.68-1.58-.75-.21-.08-.37-.12-.52.12-.16.23-.6.75-.74.9-.14.16-.27.18-.5.06-.24-.12-1-.36-1.9-1.15a7.1 7.1 0 0 1-1.32-1.64c-.14-.23-.02-.36.1-.48.1-.1.23-.27.35-.4.12-.14.15-.24.23-.4.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.72-1.73-.19-.45-.38-.39-.52-.4h-.44c-.16 0-.41.06-.62.3-.21.23-.81.79-.81 1.93s.83 2.24.95 2.4c.12.15 1.63 2.48 3.94 3.48.55.24.98.38 1.32.49.55.17 1.05.15 1.45.09.44-.07 1.37-.56 1.56-1.1.2-.54.2-1 .14-1.1-.06-.1-.21-.16-.45-.28Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/></svg>',
  timeline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 8.49 6H18.4A7 7 0 1 1 12 5c1.94 0 3.7.79 4.97 2.06L14 10h7V3l-2.62 2.62A8.96 8.96 0 0 0 12 3Zm-1 4v6l5 3 .98-1.64L13 12V7h-2Z"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V2Zm11 8H6v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9ZM7 6a1 1 0 0 0-1 1v1h12V7a1 1 0 0 0-1-1H7Z"/></svg>',
  combat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.35 4.76L19.6 7.5l-3.8 3.7.9 5.23L12 14l-4.7 2.43.9-5.23-3.8-3.7 5.25-.74L12 2Zm-7 16h14v2H5v-2Z"/></svg>',
  nba: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H7l-3 3V4Zm2 2v8.17L6.17 14H18V6H6Zm2 2h8v2H8V8Zm0 4h5v2H8v-2Z"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.5V20h3.5L18.35 9.15l-3.5-3.5L4 16.5Zm16.7-9.7a1 1 0 0 0 0-1.4l-2.1-2.1a1 1 0 0 0-1.4 0l-1.65 1.65 3.5 3.5L20.7 6.8Z"/></svg>',
  archive: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18v5H3V4Zm2 7h14v10H5V11Zm4 2v2h6v-2H9Z"/></svg>',
});

const MENU_CONTRACTS = Object.freeze([
  Object.freeze({ key: "calendar", selector: ".pipeline-module__action--calendar", label: "Agendar en Calendar", icon: "calendar" }),
  Object.freeze({ key: "combat", selector: "[data-open-combat]", label: "Abrir NASH Combat", icon: "combat" }),
  Object.freeze({ key: "nba", selector: "[data-open-nba]", label: "Revisar siguiente mejor acción", icon: "nba" }),
  Object.freeze({ key: "edit", selector: "[data-edit-productive-prospect]", label: "Editar prospecto", icon: "edit" }),
  Object.freeze({ key: "archive", selector: "[data-delete-productive-prospect]", label: "Eliminar del Pipeline", icon: "archive", destructive: true }),
]);

function setAttributeIfChanged(node, name, value) {
  if (!node || node.getAttribute(name) === value) return;
  node.setAttribute(name, value);
}

function ensureStyles(documentRef) {
  if (documentRef.querySelector("[data-pipeline-aura-light-styles]")) return;
  const link = documentRef.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("./pipeline-aura-light-2026.css?v=aura-pipeline-001", import.meta.url).href;
  link.dataset.pipelineAuraLightStyles = "true";
  documentRef.head.append(link);
}

function normalizedView(value) {
  return value === "list" ? "list" : "cards";
}

function readView(windowRef) {
  try {
    return normalizedView(windowRef.localStorage?.getItem(STORAGE_KEY));
  } catch {
    return "cards";
  }
}

function persistView(windowRef, value) {
  try {
    windowRef.localStorage?.setItem(STORAGE_KEY, normalizedView(value));
  } catch {
    // The view remains usable when storage is unavailable.
  }
}

function prospectName(card) {
  return card.querySelector("[data-productive-card-identity] strong")?.textContent?.trim()
    || "este prospecto";
}

function iconControlMarkup(icon, label) {
  return `<span class="aura-pipeline__action-icon" aria-hidden="true">${ICONS[icon]}</span><span class="aura-pipeline__sr-only">${label}</span>`;
}

function ensureViewSwitch(root, state) {
  const filters = root.querySelector(FILTERS_SELECTOR);
  if (!filters) return;
  let control = filters.querySelector("[data-aura-pipeline-view-switch]");
  if (!control) {
    control = root.ownerDocument.createElement("div");
    control.className = "aura-pipeline__view-switch";
    control.dataset.auraPipelineViewSwitch = "true";
    control.setAttribute("role", "group");
    control.setAttribute("aria-label", "Vista de prospectos");
    control.innerHTML = `
      <button type="button" data-aura-pipeline-view="cards" aria-label="Vista de tarjetas">${ICONS.cards}<span>Tarjetas</span></button>
      <button type="button" data-aura-pipeline-view="list" aria-label="Vista de lista">${ICONS.list}<span>Lista</span></button>`;
    filters.append(control);
  }
  control.querySelectorAll("[data-aura-pipeline-view]").forEach(button => {
    const selected = button.dataset.auraPipelineView === state.view;
    setAttributeIfChanged(button, "aria-pressed", selected ? "true" : "false");
    button.dataset.selected = selected ? "true" : "false";
  });
}

function ensureListHeader(collection) {
  let header = collection.querySelector(":scope > [data-aura-pipeline-list-header]");
  if (header) return header;
  header = collection.ownerDocument.createElement("div");
  header.className = "aura-pipeline__list-header";
  header.dataset.auraPipelineListHeader = "true";
  header.setAttribute("aria-hidden", "true");
  header.innerHTML = "<span>Prospecto</span><span>Etapa</span><span>Fuente</span><span>Última actividad</span><span>Próximo paso</span><span>Acciones</span>";
  collection.prepend(header);
  return header;
}

function ensureQuickAction(action, { kind, label, icon }) {
  if (!action) return null;
  action.classList.add("aura-pipeline__quick-action");
  action.dataset.auraQuickAction = kind;
  setAttributeIfChanged(action, "aria-label", label);
  setAttributeIfChanged(action, "title", label);
  const hasCanonicalIcon = action.querySelector(":scope > .aura-pipeline__action-icon")
    && action.querySelector(":scope > .aura-pipeline__sr-only");
  if (!hasCanonicalIcon) action.innerHTML = iconControlMarkup(icon, label);
  return action;
}

function ensureUnavailableCall(card, actions) {
  let unavailable = actions.querySelector("[data-aura-call-unavailable]");
  if (!unavailable) {
    unavailable = actions.ownerDocument.createElement("button");
    unavailable.type = "button";
    unavailable.disabled = true;
    unavailable.dataset.auraCallUnavailable = "true";
    actions.append(unavailable);
  }
  return ensureQuickAction(unavailable, {
    kind: "call",
    label: `Llamar a ${prospectName(card)}; teléfono no disponible`,
    icon: "phone",
  });
}

function proxyDisabled(source) {
  return Boolean(source?.disabled) || source?.getAttribute("aria-disabled") === "true";
}

function ensureMenuProxy(menu, card, contract) {
  const source = card.querySelector(contract.selector);
  let proxy = menu.querySelector(`[data-aura-menu-proxy="${contract.key}"]`);
  if (!source) {
    proxy?.remove();
    return;
  }

  source.classList.add("aura-pipeline__proxy-source");
  source.dataset.auraProxySource = contract.key;

  if (!proxy) {
    proxy = menu.ownerDocument.createElement("button");
    proxy.type = "button";
    proxy.dataset.auraMenuProxy = contract.key;
    proxy.setAttribute("role", "menuitem");
    menu.append(proxy);
  }

  proxy.className = `aura-pipeline__menu-item${contract.destructive ? " aura-pipeline__menu-item--danger" : ""}`;
  proxy.disabled = proxyDisabled(source);
  proxy.dataset.auraSourceSelector = contract.selector;
  const label = source.disabled && source.title
    ? `${contract.label} · ${source.title}`
    : contract.label;
  setAttributeIfChanged(proxy, "aria-label", label);
  if (proxy.dataset.auraMenuLabel !== label) {
    proxy.dataset.auraMenuLabel = label;
    proxy.innerHTML = `<span aria-hidden="true">${ICONS[contract.icon]}</span><span>${label}</span>`;
  }
}

function ensureMoreMenu(card, actions, state) {
  const documentRef = card.ownerDocument;
  let more = actions.querySelector(":scope > [data-aura-pipeline-more]");
  if (!more) {
    more = documentRef.createElement("button");
    more.type = "button";
    more.className = "aura-pipeline__quick-action aura-pipeline__more";
    more.dataset.auraPipelineMore = card.dataset.productiveProspectCard || "prospect";
    more.setAttribute("aria-haspopup", "menu");
    actions.append(more);
  }
  const menuId = `aura-pipeline-menu-${card.dataset.productiveProspectCard || Math.random().toString(36).slice(2)}`;
  more.id ||= `${menuId}-trigger`;
  setAttributeIfChanged(more, "aria-label", `Más acciones para ${prospectName(card)}`);
  setAttributeIfChanged(more, "title", "Más acciones");
  setAttributeIfChanged(more, "aria-controls", menuId);
  if (!more.querySelector(":scope > .aura-pipeline__action-icon")) {
    more.innerHTML = iconControlMarkup("more", "Más acciones");
  }

  let menu = actions.querySelector(":scope > [data-aura-pipeline-menu]");
  if (!menu) {
    menu = documentRef.createElement("div");
    menu.className = "aura-pipeline__menu";
    menu.dataset.auraPipelineMenu = "true";
    menu.id = menuId;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-labelledby", more.id);
    menu.hidden = true;
    actions.append(menu);
  }

  MENU_CONTRACTS.forEach(contract => ensureMenuProxy(menu, card, contract));
  const hasItems = Boolean(menu.querySelector("[data-aura-menu-proxy]"));
  more.disabled = !hasItems;
  const open = state.openCardId === card.dataset.productiveProspectCard && hasItems;
  menu.hidden = !open;
  setAttributeIfChanged(more, "aria-expanded", open ? "true" : "false");
  card.dataset.auraMenuOpen = open ? "true" : "false";
  return { more, menu };
}

function placeQuickActions(actions, ordered) {
  let index = 0;
  for (const node of ordered.filter(Boolean)) {
    const current = actions.children[index];
    if (current !== node) actions.insertBefore(node, current || null);
    index += 1;
  }
}

function enhanceCard(card, state) {
  card.classList.add("aura-pipeline__prospect");
  card.dataset.auraPipelineProspect = "true";

  const identity = card.querySelector("[data-productive-card-identity]");
  identity?.classList.add("aura-pipeline__identity");
  const stageControl = card.querySelector("[data-productive-stage-control]")?.closest("label");
  stageControl?.classList.add("aura-pipeline__stage-control");
  const source = card.querySelector("[data-productive-card-metadata]");
  source?.classList.add("aura-pipeline__source");
  const status = card.querySelector("[data-productive-card-status]");
  status?.classList.add("aura-pipeline__status");
  status?.querySelector("[data-timeline-activity]")?.classList.add("aura-pipeline__activity-cell");
  status?.querySelector("p:not([data-timeline-activity])")?.classList.add("aura-pipeline__next-cell");

  card.querySelector(".pipeline-module__identity-actions")?.classList.add("aura-pipeline__admin-sources");

  const actions = card.querySelector("[data-productive-card-actions]");
  if (!actions) return;
  actions.classList.add("aura-pipeline__actions");

  const name = prospectName(card);
  const whatsapp = ensureQuickAction(actions.querySelector("[data-prepare-productive-message]"), {
    kind: "whatsapp",
    label: `Preparar WhatsApp para ${name}`,
    icon: "whatsapp",
  });
  const callSource = actions.querySelector(".pipeline-module__action--call");
  const call = callSource
    ? ensureQuickAction(callSource, { kind: "call", label: `Llamar a ${name}`, icon: "phone" })
    : ensureUnavailableCall(card, actions);
  const timeline = ensureQuickAction(actions.querySelector("[data-view-productive-context]"), {
    kind: "timeline",
    label: `Abrir Timeline de ${name}`,
    icon: "timeline",
  });
  const { more, menu } = ensureMoreMenu(card, actions, state);
  placeQuickActions(actions, [whatsapp, call, timeline, more]);
  if (actions.lastElementChild !== menu) actions.append(menu);
}

function applyView(root, state) {
  root.dataset.pipelineAuraView = state.view;
  root.querySelector(COLLECTION_SELECTOR)?.setAttribute("data-aura-view", state.view);
  ensureViewSwitch(root, state);
}

export function installPipelineAuraLight(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  const windowRef = options.windowRef || documentRef?.defaultView || globalThis.window;
  if (!documentRef || !windowRef) return Object.freeze({ installed: false });
  if (documentRef[INSTALL_KEY]) return documentRef[INSTALL_KEY];

  ensureStyles(documentRef);
  const state = {
    view: readView(windowRef),
    openCardId: null,
    scheduled: false,
    reconciling: false,
    root: null,
    rootObserver: null,
    documentObserver: null,
    restoreFocus: null,
  };

  const closeMenu = ({ restore = false } = {}) => {
    if (!state.openCardId) return;
    const trigger = state.root?.querySelector(`[data-productive-prospect-card="${CSS.escape(state.openCardId)}"] [data-aura-pipeline-more]`);
    state.openCardId = null;
    state.restoreFocus = restore ? trigger : null;
    schedule();
  };

  const reconcile = () => {
    state.scheduled = false;
    if (state.reconciling) return;
    const root = state.root || documentRef.querySelector(ROOT_SELECTOR);
    if (!root) return;
    state.root = root;
    state.reconciling = true;
    try {
      root.classList.add("aura-pipeline");
      root.dataset.pipelineAuraLight = "ready";
      root.dataset.pipelineDesignAuthority = DESIGN_AUTHORITY;
      documentRef.documentElement.dataset.pipelineAuraLight = "ready";
      documentRef.documentElement.dataset.pipelineMaterial3DesignUsed = "false";

      root.querySelector(".pipeline-module__header")?.classList.add("aura-pipeline__header");
      root.querySelector(FILTERS_SELECTOR)?.classList.add("aura-pipeline__filters");
      root.querySelectorAll(".pipeline-module__empty, .pipeline-module__filter-empty").forEach(node => node.classList.add("aura-pipeline__empty"));

      const collection = root.querySelector(COLLECTION_SELECTOR);
      if (collection) {
        collection.classList.add("aura-pipeline__collection");
        ensureListHeader(collection);
        collection.querySelectorAll(CARD_SELECTOR).forEach(card => enhanceCard(card, state));
      }
      applyView(root, state);
    } finally {
      state.reconciling = false;
      if (state.restoreFocus) {
        const target = state.restoreFocus;
        state.restoreFocus = null;
        queueMicrotask(() => target?.focus?.());
      }
    }
  };

  function schedule() {
    if (state.scheduled) return;
    state.scheduled = true;
    queueMicrotask(reconcile);
  }

  const connectRoot = root => {
    if (!root || state.root === root && state.rootObserver) return;
    state.rootObserver?.disconnect();
    state.root = root;
    state.rootObserver = new MutationObserver(() => schedule());
    state.rootObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "href", "title", "hidden", "data-productive-stage"],
    });
    schedule();
  };

  documentRef.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const view = target.closest("[data-aura-pipeline-view]");
    if (view && state.root?.contains(view)) {
      const next = normalizedView(view.dataset.auraPipelineView);
      if (next !== state.view) {
        state.view = next;
        persistView(windowRef, next);
        schedule();
      }
      return;
    }

    const more = target.closest("[data-aura-pipeline-more]");
    if (more && state.root?.contains(more)) {
      const card = more.closest(CARD_SELECTOR);
      const cardId = card?.dataset.productiveProspectCard || null;
      state.openCardId = state.openCardId === cardId ? null : cardId;
      schedule();
      if (state.openCardId) {
        queueMicrotask(() => card?.querySelector("[data-aura-pipeline-menu] [role=menuitem]:not([disabled])")?.focus());
      }
      return;
    }

    const proxy = target.closest("[data-aura-menu-proxy]");
    if (proxy && state.root?.contains(proxy)) {
      const card = proxy.closest(CARD_SELECTOR);
      const source = card?.querySelector(proxy.dataset.auraSourceSelector || "");
      closeMenu();
      if (source && !proxy.disabled) queueMicrotask(() => source.click());
      return;
    }

    if (state.openCardId && !target.closest("[data-aura-pipeline-menu]")) closeMenu();
  }, true);

  documentRef.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !state.openCardId) return;
    event.preventDefault();
    closeMenu({ restore: true });
  });

  connectRoot(documentRef.querySelector(ROOT_SELECTOR));
  if (!state.root) {
    state.documentObserver = new MutationObserver(() => {
      const root = documentRef.querySelector(ROOT_SELECTOR);
      if (!root) return;
      connectRoot(root);
      state.documentObserver.disconnect();
    });
    state.documentObserver.observe(documentRef.documentElement, { childList: true, subtree: true });
  }

  const authority = Object.freeze({
    installed: true,
    designAuthority: DESIGN_AUTHORITY,
    setView(value) {
      state.view = normalizedView(value);
      persistView(windowRef, state.view);
      schedule();
      return state.view;
    },
    reconcile: schedule,
    diagnostics: () => Object.freeze({
      installed: true,
      designAuthority: DESIGN_AUTHORITY,
      view: state.view,
      openCardId: state.openCardId,
      prospectCount: state.root?.querySelectorAll(CARD_SELECTOR).length || 0,
      material3DesignUsed: false,
      storedPrivateData: false,
    }),
    destroy() {
      state.rootObserver?.disconnect();
      state.documentObserver?.disconnect();
      documentRef.removeEventListener("keydown", closeMenu);
      state.root?.removeAttribute("data-pipeline-aura-light");
      documentRef.documentElement.removeAttribute("data-pipeline-aura-light");
    },
  });

  documentRef[INSTALL_KEY] = authority;
  globalThis.ForgeAuraLightPipeline2026 = authority;
  return authority;
}

installPipelineAuraLight();

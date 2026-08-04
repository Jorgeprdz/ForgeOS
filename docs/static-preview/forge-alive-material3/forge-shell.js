import {
  navigationItems,
  resolveForgeRoute,
} from "./forge-navigation-contract.js";
import { createCarteraModule } from "./cartera-module.js?v=cartera-material3-productive-001";

const shellStateKey = Symbol.for("forge.ui-m04.shell.state");

function renderNavigation(nav, routeId) {
  const markup = navigationItems().map((item) => {
    const active = item.routeId === routeId;
    return `
      <button
        class="nav-item${active ? " active" : ""}"
        type="button"
        data-route-id="${item.routeId}"
        data-route-target="${item.target}"
        data-route-availability="${item.availability}"
        aria-label="${item.accessibilityLabel}"
        ${active ? 'aria-current="page"' : ""}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${item.iconPath}"/></svg>
        <span>${item.label}</span>
      </button>
    `;
  }).join("");

  if (nav.dataset.navigationMarkup !== markup) {
    nav.innerHTML = markup;
    nav.dataset.navigationMarkup = markup;
    nav.querySelector('[aria-current="page"]')?.scrollIntoView?.({
      block: "nearest",
      inline: "center",
      behavior: "instant",
    });
  }
}

export function createForgeShell({ root, moduleViewport }) {
  if (root[shellStateKey]) return root[shellStateKey].api;

  const nav = root.querySelector("[data-forge-nav-pill]");
  const sheet = root.querySelector("[data-forge-alfred-sheet]");
  const input = root.querySelector(".alfred-input input");
  const suggestions = root.querySelector(".suggestions");
  const toast = root.querySelector(".toast");
  const globalAlfred = root.querySelector(
    '[data-alfred-scope="global"]',
  );
  const contextualAlfred = root.querySelector(
    '[data-alfred-scope="contextual"]',
  );
  const abortController = new AbortController();
  const { signal } = abortController;
  let currentModule = null;
  let builtInCarteraModule = null;
  const routeModules = new Map();
  let initialized = false;

  function setAlfredState(globalState, contextualState = globalState) {
    if (globalAlfred) globalAlfred.dataset.alfredState = globalState;
    if (contextualAlfred) {
      contextualAlfred.dataset.alfredState = contextualState;
    }
  }

  function syncVisualViewport() {
    const viewport = window.visualViewport;
    const viewportHeight = viewport ? viewport.height : window.innerHeight;
    const viewportTop = viewport ? viewport.offsetTop : 0;
    const keyboardInset = Math.max(
      0,
      window.innerHeight - viewportHeight - viewportTop,
    );
    document.documentElement.style.setProperty(
      "--forge-visual-viewport-height",
      `${viewportHeight}px`,
    );
    document.documentElement.style.setProperty(
      "--forge-keyboard-inset",
      `${keyboardInset}px`,
    );
    document.body.classList.toggle(
      "keyboard-open",
      keyboardInset > 120,
    );
  }

  function setAlfred(open) {
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("sheet-open", open);
    setAlfredState(
      open ? "action" : "idle",
      open ? "action" : "thinking",
    );
    if (open) {
      suggestions?.scrollTo({ left: 0, behavior: "instant" });
      syncVisualViewport();
    } else {
      input?.blur();
      document.body.classList.remove("keyboard-open");
    }
  }

  function ensureBuiltInCarteraRoute() {
    if (builtInCarteraModule) return builtInCarteraModule;
    let carteraRoot = moduleViewport.querySelector("[data-forge-cartera-module]");
    if (!carteraRoot) {
      carteraRoot = document.createElement("section");
      carteraRoot.className = "cartera-module";
      carteraRoot.dataset.forgeCarteraModule = "true";
      carteraRoot.dataset.routeModule = "cartera";
      carteraRoot.hidden = true;
      carteraRoot.setAttribute("aria-label", "Cartera");
      moduleViewport.append(carteraRoot);
    }
    builtInCarteraModule = createCarteraModule({
      root: carteraRoot,
      shell: api,
    });
    routeModules.set("cartera", builtInCarteraModule);
    return builtInCarteraModule;
  }

  function reconcile() {
    const routeId = resolveForgeRoute();
    const routeModule = routeModules.get(routeId);
    routeModules.forEach((module, registeredRoute) => {
      if (registeredRoute !== routeId) module.unmount?.();
    });
    if (routeModule && currentModule !== routeModule) {
      currentModule?.unmount?.();
      currentModule = routeModule;
      currentModule.mount?.();
    }
    root.dataset.forgeRoute = routeId;
    moduleViewport.dataset.activeRoute = routeId;
    renderNavigation(nav, routeId);
    currentModule?.reconcile?.();
    syncVisualViewport();
  }

  function activateRoute(button) {
    const routeId = button.dataset.routeId;
    const availability = button.dataset.routeAvailability;
    if (availability !== "available") {
      toast.textContent = `${button.textContent.trim()}: disponible próximamente`;
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 1800);
      return;
    }
    const target = button.dataset.routeTarget;
    window.history.pushState({ forgeRoute: routeId }, "", target);
    reconcile();
  }

  function initialize() {
    if (initialized) {
      reconcile();
      return api;
    }
    initialized = true;
    ensureBuiltInCarteraRoute();
    setAlfredState("idle", "thinking");
    reconcile();

    root.addEventListener("click", (event) => {
      const openButton = event.target.closest("[data-open-alfred]");
      const closeButton = event.target.closest("[data-close-alfred]");
      const navButton = event.target.closest("[data-route-id]");
      if (openButton) setAlfred(true);
      if (closeButton) setAlfred(false);
      if (navButton) activateRoute(navButton);
    }, { signal });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setAlfred(false);
    }, { signal });

    window.addEventListener("pageshow", reconcile, { signal });
    window.addEventListener("popstate", reconcile, { signal });
    window.addEventListener("resize", reconcile, {
      passive: true,
      signal,
    });
    window.addEventListener("orientationchange", reconcile, {
      passive: true,
      signal,
    });
    window.visualViewport?.addEventListener(
      "resize",
      syncVisualViewport,
      { passive: true, signal },
    );
    window.visualViewport?.addEventListener(
      "scroll",
      syncVisualViewport,
      { passive: true, signal },
    );
    return api;
  }

  function mountModule(module) {
    if (currentModule === module) return;
    currentModule?.unmount?.();
    currentModule = module;
    currentModule.mount?.();
    reconcile();
  }

  const api = Object.freeze({
    initialize,
    reconcile,
    mountModule,
    registerRouteModule(routeId, module) {
      routeModules.set(routeId, module);
      return api;
    },
    setAlfred,
    setAlfredState,
    syncVisualViewport,
    destroy() {
      abortController.abort();
      currentModule?.unmount?.();
      builtInCarteraModule?.destroy?.();
      delete root[shellStateKey];
    },
  });
  root[shellStateKey] = { api };
  return api;
}

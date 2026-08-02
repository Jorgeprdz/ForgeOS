import { createAuthenticatedProductiveHome } from "./home-productive-orchestrator.js";

const homeStateKey = Symbol.for("forge.ui-m04.home.state");

function prepareProductiveRoot(root) {
  const summary = root.querySelector(".summary-section") || document.createElement("section");
  if (!summary.isConnected) root.appendChild(summary);
  summary.className = "summary-section productive-home-section";
  summary.removeAttribute("aria-labelledby");
  summary.replaceChildren();

  const productiveRoot = document.createElement("section");
  productiveRoot.dataset.forgeProductiveSmartWidgetRoot = "true";
  productiveRoot.dataset.forgePrivateSurface = "home-smart-widgets";
  productiveRoot.hidden = true;
  productiveRoot.setAttribute("aria-label", "Resumen productivo del día");
  summary.appendChild(productiveRoot);
  return productiveRoot;
}

export function createHomeModule({ root, shell }) {
  if (root[homeStateKey]) return root[homeStateKey];

  const abortController = new AbortController();
  const { signal } = abortController;
  const input = document.querySelector(".alfred-input input");
  const toast = document.querySelector(".toast");
  const productiveRoot = prepareProductiveRoot(root);
  const productiveHome = createAuthenticatedProductiveHome({
    root: productiveRoot,
    shell,
  });
  let mounted = false;
  let toastTimer = null;

  function announce(message) {
    if (!toast) return;
    if (toastTimer !== null) window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
      toastTimer = null;
    }, 2400);
  }

  function navigate(routeId) {
    const url = new URL(window.location.href);
    url.searchParams.set("nav", routeId);
    for (const key of ["person", "sourceType", "sourceRef", "from"]) {
      url.searchParams.delete(key);
    }
    window.history.pushState(
      { forgeRoute: routeId, source: "home" },
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    shell.reconcile();
  }

  function bindClick(target, handler) {
    if (!target || target.dataset.forgeHomeActionBound === "true") return;
    target.dataset.forgeHomeActionBound = "true";
    target.addEventListener("click", handler, { signal });
  }

  function bindStaticHomeActions() {
    bindClick(root.querySelector(".plan-card .mini-action"), () => {
      navigate("actividad");
    });

    bindClick(root.querySelector(".next-card .primary-action"), () => {
      navigate("pipeline");
    });

    bindClick(root.querySelector(".next-card .save-action"), () => {
      announce("Guardar para después se habilitará cuando esta acción esté vinculada a una persona real.");
    });

    bindClick(root.querySelector(".opportunities .section-heading button"), () => {
      navigate("pipeline");
    });

    root.querySelectorAll(".opportunity-list .opportunity").forEach((button) => {
      bindClick(button, () => navigate("pipeline"));
    });

    const alfredSend = document.querySelector(
      '.alfred-input button[aria-label="Enviar a Alfred"]',
    );
    bindClick(alfredSend, () => {
      if (!input?.value.trim()) {
        input?.focus({ preventScroll: true });
        announce("Escribe una instrucción para Alfred.");
        return;
      }
      shell.setAlfredState("action", "action");
      announce("Alfred aún no tiene ejecución productiva conectada; tu instrucción permanece sin enviar.");
    });
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    document.querySelectorAll(".suggestions button").forEach((button) => {
      button.addEventListener("click", () => {
        if (!input) return;
        input.value = button.textContent;
        input.focus({ preventScroll: true });
        shell.setAlfredState("action", "action");
        shell.syncVisualViewport();
      }, { signal });
    });
    input?.addEventListener("focus", shell.syncVisualViewport, { signal });
    input?.addEventListener("blur", () => {
      window.setTimeout(shell.syncVisualViewport, 120);
    }, { signal });
    bindStaticHomeActions();
    productiveHome.mount();
  }

  const api = Object.freeze({
    id: "inicio",
    root,
    mount,
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      productiveHome.reconcile();
    },
    unmount() {
      root.hidden = true;
      root.dataset.moduleActive = "false";
      productiveHome.scrub("home-route-unmounted");
    },
    diagnostics: productiveHome.diagnostics,
  });
  root[homeStateKey] = api;
  return api;
}

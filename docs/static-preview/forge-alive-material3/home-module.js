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
  const productiveRoot = prepareProductiveRoot(root);
  const productiveHome = createAuthenticatedProductiveHome({
    root: productiveRoot,
    shell,
  });
  let mounted = false;

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

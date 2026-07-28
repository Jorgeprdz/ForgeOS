const homeStateKey = Symbol.for("forge.ui-m04.home.state");

export function createHomeModule({ root, shell }) {
  if (root[homeStateKey]) return root[homeStateKey];

  const abortController = new AbortController();
  const { signal } = abortController;
  const input = document.querySelector(".alfred-input input");
  let mounted = false;

  function mount() {
    if (mounted) return;
    mounted = true;
    document.querySelectorAll(".suggestions button").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.textContent;
        input.focus({ preventScroll: true });
        shell.setAlfredState("action", "action");
        shell.syncVisualViewport();
      }, { signal });
    });
    input.addEventListener("focus", shell.syncVisualViewport, { signal });
    input.addEventListener("blur", () => {
      window.setTimeout(shell.syncVisualViewport, 120);
    }, { signal });
  }

  const api = Object.freeze({
    id: "inicio",
    root,
    mount,
    reconcile() {
      root.dataset.moduleActive = "true";
    },
    unmount() {
      abortController.abort();
      mounted = false;
      root.dataset.moduleActive = "false";
    },
  });
  root[homeStateKey] = api;
  return api;
}

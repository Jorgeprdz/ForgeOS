(() => {
  "use strict";

  const MARK = "r16c3";

  function stripIds(root) {
    if (!root) return;
    if (root.removeAttribute) root.removeAttribute("id");
    root.querySelectorAll?.("[id]").forEach((node) => node.removeAttribute("id"));
  }

  function findVisualSource(orb) {
    if (!orb) return null;

    return (
      orb.querySelector(
        "[data-bow-tie], .bow-tie, .bowtie, .orb-mark, .command-orb-mark, svg, img"
      ) ||
      orb.firstElementChild ||
      null
    );
  }

  function syncBowTie() {
    const layer = document.querySelector(
      '[data-command-orb-layer][data-forge-home-command-orb-r16c="canonical"]'
    );
    if (!layer) return;

    const orb = layer.querySelector(".command-orb");
    const target = layer.querySelector(".command-pill-slash");
    const source = findVisualSource(orb);

    if (!orb || !target || !source) return;
    if (target.dataset.forgeBowTieVersion === MARK) return;

    const clone = source.cloneNode(true);
    stripIds(clone);
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("focusable", "false");

    target.replaceChildren(clone);
    target.dataset.forgeBowTieSynced = "true";
    target.dataset.forgeBowTieVersion = MARK;
  }

  function init() {
    syncBowTie();

    const layer = document.querySelector(
      '[data-command-orb-layer][data-forge-home-command-orb-r16c="canonical"]'
    );

    if (!layer || layer.dataset.forgeR16c3Observer === "true") return;

    layer.dataset.forgeR16c3Observer = "true";

    const observer = new MutationObserver(syncBowTie);
    observer.observe(layer, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("pageshow", init);
})();

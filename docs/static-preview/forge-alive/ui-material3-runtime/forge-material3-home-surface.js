(() => {
  "use strict";

  const flag = window.ForgeUiRuntimeFlag;

  if (!flag || flag.enabled !== true) {
    return;
  }

  const shellSelector = "[data-forge-m3-shell]";
  const contentSelector = "[data-forge-m3-content]";
  const productSelector = "[data-forge-m3-product-surface]";
  const stageSelector = "[data-forge-m3-home-stage]";

  const touchSelectors = Object.freeze([
    ".assistant-card",
    ".primary-card",
    ".forge-smart-widget-static-056u",
    ".grid",
    ".panel",
    '.bottom-nav[data-forge-home-navigation-r16c="canonical"]',
  ]);

  const workspaceSelector =
    ".forge-desktop-workspace-056y";

  const records = new Map();
  let stage = null;
  let currentMode = null;
  let resizeFrame = null;
  let shellObserver = null;
  let productObserver = null;

  const modeForViewport = () =>
    window.innerWidth >= 900
      ? "workspace"
      : "touch";

  const dispatch = (type, detail) => {
    if (
      typeof window.dispatchEvent !== "function"
      || typeof window.CustomEvent !== "function"
    ) {
      return;
    }

    window.dispatchEvent(
      new window.CustomEvent(type, { detail }),
    );
  };

  const remember = (node) => {
    if (!node || records.has(node) || !node.parentNode) {
      return;
    }

    const anchor = document.createComment(
      `forge-ui-m03-anchor:${node.className || node.nodeName}`,
    );

    node.parentNode.insertBefore(anchor, node);

    records.set(
      node,
      Object.freeze({
        anchor,
        hidden: node.hidden,
        inert: node.hasAttribute("inert"),
        ariaHidden: node.getAttribute("aria-hidden"),
      }),
    );
  };

  const restoreNode = (node) => {
    const record = records.get(node);

    if (!record || !record.anchor.parentNode) {
      return;
    }

    record.anchor.parentNode.insertBefore(
      node,
      record.anchor.nextSibling,
    );

    node.hidden = record.hidden;
    node.toggleAttribute("inert", record.inert);

    if (record.ariaHidden === null) {
      node.removeAttribute("aria-hidden");
    } else {
      node.setAttribute(
        "aria-hidden",
        record.ariaHidden,
      );
    }

    node.removeAttribute(
      "data-forge-m3-projected-node",
    );
  };

  const restoreAll = () => {
    [...records.keys()].forEach(restoreNode);
  };

  const projectNode = (node) => {
    if (!node || !stage) {
      return false;
    }

    remember(node);

    node.hidden = false;
    node.removeAttribute("inert");
    node.setAttribute("aria-hidden", "false");
    node.setAttribute(
      "data-forge-m3-projected-node",
      "true",
    );

    stage.appendChild(node);

    return true;
  };

  const ensureStage = (content, product) => {
    const existing = content.querySelector(stageSelector);

    if (existing) {
      stage = existing;
      return stage;
    }

    stage = document.createElement("main");
    stage.className = "forge-m3-home-stage";
    stage.setAttribute(
      "data-forge-m3-home-stage",
      "true",
    );
    stage.setAttribute(
      "aria-label",
      "Inicio · inteligencia comercial",
    );

    content.insertBefore(stage, product);

    return stage;
  };

  const setProductHidden = (product, hidden) => {
    product.hidden = hidden;
    product.toggleAttribute("inert", hidden);
    product.setAttribute(
      "aria-hidden",
      String(hidden),
    );
    product.toggleAttribute(
      "data-forge-m3-legacy-tree-hidden",
      hidden,
    );
  };

  const isHomeRoute = (shell) =>
    shell.getAttribute(
      "data-forge-m3-active-route",
    ) === "inicio";

  const unique = (nodes) =>
    [...new Set(nodes.filter(Boolean))];

  const collectTouchNodes = (product) => {
    const nodes = [];

    for (const selector of touchSelectors) {
      product
        .querySelectorAll(selector)
        .forEach((node) => nodes.push(node));
    }

    return unique(nodes).filter(
      (node) =>
        !node.closest(workspaceSelector)
        && !node.closest(".alfred-desktop-app-056g7")
        && !node.closest(
          '[data-forge-saas-module-host-r16c5l="cotizaciones"]',
        ),
    );
  };

  const collectWorkspaceNodes = (product) => {
    const workspace = product.querySelector(
      workspaceSelector,
    );

    return workspace
      ? [workspace]
      : [];
  };

  const deactivateProjection = (
    product,
    reason,
  ) => {
    restoreAll();

    if (stage) {
      stage.replaceChildren();
      stage.hidden = true;
      stage.removeAttribute(
        "data-forge-m3-home-mode",
      );
    }

    setProductHidden(product, false);
    currentMode = null;

    dispatch(
      "forge:material3-home-projection-restored",
      Object.freeze({
        source: "ui-m03-structural-projection-r2",
        reason,
        productiveMarkupReplaced: false,
      }),
    );
  };

  const activateProjection = (
    shell,
    content,
    product,
  ) => {
    if (!isHomeRoute(shell)) {
      deactivateProjection(
        product,
        "route-not-home",
      );
      return false;
    }

    const mode = modeForViewport();

    if (currentMode !== mode) {
      restoreAll();
      stage?.replaceChildren();
    }

    ensureStage(content, product);

    const nodes = mode === "workspace"
      ? collectWorkspaceNodes(product)
      : collectTouchNodes(product);

    if (nodes.length === 0) {
      deactivateProjection(
        product,
        "authority-not-found",
      );

      dispatch(
        "forge:material3-home-projection-error",
        Object.freeze({
          code: "PRODUCTIVE_AUTHORITY_NOT_FOUND",
          mode,
        }),
      );

      return false;
    }

    stage.hidden = false;
    stage.setAttribute(
      "data-forge-m3-home-mode",
      mode,
    );

    nodes.forEach(projectNode);
    setProductHidden(product, true);

    currentMode = mode;

    dispatch(
      "forge:material3-home-projected",
      Object.freeze({
        source: "ui-m03-structural-projection-r2",
        mode,
        projectedNodeCount: nodes.length,
        legacyTreeHidden: true,
        productiveNodesMoved: true,
        productiveNodesCloned: false,
        productiveMarkupReplaced: false,
      }),
    );

    return true;
  };

  const reconcile = () => {
    const shell = document.querySelector(shellSelector);
    const content = document.querySelector(contentSelector);
    const product = document.querySelector(productSelector);

    if (!shell || !content || !product) {
      return false;
    }

    activateProjection(shell, content, product);

    if (!shellObserver) {
      shellObserver = new MutationObserver(() => {
        activateProjection(
          shell,
          content,
          product,
        );
      });

      shellObserver.observe(shell, {
        attributes: true,
        attributeFilter: [
          "data-forge-m3-active-route",
        ],
      });
    }

    if (!productObserver) {
      productObserver = new MutationObserver(() => {
        if (
          isHomeRoute(shell)
          && currentMode === "touch"
        ) {
          activateProjection(
            shell,
            content,
            product,
          );
        }
      });

      productObserver.observe(product, {
        childList: true,
        subtree: false,
      });
    }

    return true;
  };

  const schedule = () => {
    if (resizeFrame !== null) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = null;
      reconcile();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      reconcile,
      { once: true },
    );
  } else {
    reconcile();
  }

  window.addEventListener(
    "forge:material3-shell-ready",
    reconcile,
  );

  window.addEventListener(
    "forge:material3-navigation",
    schedule,
  );

  window.addEventListener(
    "pageshow",
    reconcile,
    { passive: true },
  );

  window.addEventListener(
    "resize",
    schedule,
    { passive: true },
  );
})();

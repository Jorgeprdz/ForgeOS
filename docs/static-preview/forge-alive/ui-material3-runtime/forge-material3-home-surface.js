(() => {
  "use strict";

  const flag = window.ForgeUiRuntimeFlag;

  if (!flag || flag.enabled !== true) {
    return;
  }

  const shellSelector = "[data-forge-m3-shell]";
  const productSelector = "[data-forge-m3-product-surface]";
  const readyMarker = "data-forge-m3-home-ready-r1";

  const layoutMode = () =>
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

  const setInactive = (element, inactive) => {
    if (!element) {
      return;
    }

    element.toggleAttribute("inert", inactive);
    element.setAttribute(
      "aria-hidden",
      String(inactive),
    );
  };

  const classify = (product) => {
    const roles = [
      [".assistant-card", "mobile-alfred-brief"],
      [".primary-card", "mobile-priority"],
      [".forge-smart-widget-static-056u", "mobile-context"],
      [".dw-command-shell-056y", "workspace-command"],
      [".dw-decision-strip-058e", "workspace-decision"],
      [".dw-kpi-056y", "workspace-kpi"],
      [".dw-table-shell-056y", "workspace-table"],
    ];

    for (const [selector, role] of roles) {
      product.querySelectorAll(selector).forEach((element) => {
        element.setAttribute(
          "data-forge-m3-home-role",
          role,
        );
      });
    }
  };

  const reconcile = () => {
    const shell = document.querySelector(shellSelector);
    const product = document.querySelector(productSelector);

    if (!shell || !product) {
      return false;
    }

    const mode = layoutMode();
    const workspace = product.querySelector(
      ".forge-desktop-workspace-056y",
    );
    const alternateDesktop = product.querySelector(
      ".alfred-desktop-app-056g7",
    );
    const legacyOrb = product.querySelector(
      "[data-command-orb-layer], .command-orb-layer",
    );

    product.setAttribute(
      "data-forge-m3-home-surface",
      "true",
    );
    product.setAttribute(
      "data-forge-m3-home-preserved",
      "true",
    );
    product.setAttribute(
      "data-forge-m3-home-layout",
      mode,
    );
    product.setAttribute(readyMarker, "true");

    setInactive(workspace, mode !== "workspace");
    setInactive(alternateDesktop, true);
    setInactive(legacyOrb, true);

    classify(product);

    dispatch(
      "forge:material3-home-reconciled",
      Object.freeze({
        source: "ui-m03-full-product-reconciliation-r1",
        mode,
        existingProductSurfacePreserved: true,
        productiveMarkupReplaced: false,
        duplicateNavigationVisible: false,
        duplicateHeaderVisible: false,
      }),
    );

    return true;
  };

  let resizeFrame = null;

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

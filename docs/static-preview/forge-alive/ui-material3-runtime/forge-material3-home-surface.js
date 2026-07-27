(() => {
  "use strict";

  const flag = window.ForgeUiRuntimeFlag;

  if (!flag || flag.enabled !== true) {
    return;
  }

  const shellSelector = "[data-forge-m3-shell]";
  const productSelector = "[data-forge-m3-product-surface]";
  const readyMarker = "data-forge-m3-home-ready";

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

  const classify = (product) => {
    const roles = [
      [".assistant-card", "alfred-brief"],
      [".primary-card", "priority"],
      [".glass", "card"],
      [".quick-action", "quick-action"],
      [".fake-cta", "action"],
    ];

    let marked = 0;

    for (const [selector, role] of roles) {
      product.querySelectorAll(selector).forEach((element) => {
        if (!element.hasAttribute("data-forge-m3-home-role")) {
          element.setAttribute(
            "data-forge-m3-home-role",
            role,
          );
          marked += 1;
        }
      });
    }

    return marked;
  };

  const mount = () => {
    const shell = document.querySelector(shellSelector);
    const product = document.querySelector(productSelector);

    if (!shell || !product) {
      return false;
    }

    if (product.hasAttribute(readyMarker)) {
      classify(product);
      return true;
    }

    product.setAttribute(
      "data-forge-m3-home-surface",
      "true",
    );
    product.setAttribute(
      "data-forge-m3-home-preserved",
      "true",
    );
    product.setAttribute(readyMarker, "true");

    const initiallyMarked = classify(product);

    const observer = new MutationObserver(() => {
      classify(product);
    });

    observer.observe(product, {
      childList: true,
      subtree: true,
    });

    dispatch(
      "forge:material3-home-ready",
      Object.freeze({
        source: "ui-m03-productive-home-surface",
        existingProductSurfacePreserved: true,
        productiveMarkupReplaced: false,
        initiallyMarked,
      }),
    );

    return true;
  };

  const reconcile = () => {
    if (mount()) {
      return;
    }

    window.setTimeout(mount, 0);
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
})();

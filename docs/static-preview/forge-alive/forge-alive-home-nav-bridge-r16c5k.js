(() => {
  "use strict";

  const VISUAL_NAV =
    ".forge-mobile-nav-r16c5k-home-visual" +
    "[data-forge-mobile-nav-r16c5j]";
  const CONTROLLER =
    '.forge-home-nav-controller-r16c5k' +
    '[data-forge-home-navigation-r16c="canonical"]';
  const ITEM = ".forge-mobile-nav-r16c5j__item";

  function visualNav() {
    return document.querySelector(VISUAL_NAV);
  }

  function controller() {
    return document.querySelector(CONTROLLER);
  }

  function visualItem(key) {
    const nav = visualNav();

    return nav
      ? nav.querySelector(
          `${ITEM}[data-forge-nav-key="${key}"]`,
        )
      : null;
  }

  function controllerButton(key) {
    const legacy = controller();

    return legacy
      ? legacy.querySelector(
          `button[data-forge-home-section="${key}"]`,
        )
      : null;
  }

  function setVisualActive(key) {
    /*
     * The legacy Home controller remains active underneath the quote
     * module. Its MutationObserver may continue reporting Inicio.
     * Preserve the original active-module guard before delegating to
     * the single visual authority.
     */
    if (
      document.body.dataset
        .forgeSaasActiveModuleR16c5l ===
        "cotizaciones" &&
      key !== "cotizaciones"
    ) {
      return false;
    }

    const authority =
      globalThis
        .ForgeMobileNavInstantAuthorityR16J1C1;

    if (authority) {
      return authority.sync(key);
    }

    const nav = visualNav();
    const selected = visualItem(key);

    if (!nav || !selected) return false;

    nav.querySelectorAll(ITEM).forEach((item) => {
      const active = item === selected;
      item.classList.toggle("active", active);

      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    nav.dataset.forgeActiveKey = key;
    return true;
  }

  async function activateHomeSection(
    key,
    updateUrl = true,
  ) {
    const viewAuthority =
      globalThis.ForgeAliveStaticView067G16A;

    if (viewAuthority) {
      return viewAuthority.open(key, { updateUrl });
    }

    const legacyButton = controllerButton(key);
    if (!legacyButton) return false;

    const alreadyActive =
      legacyButton.classList.contains("active") ||
      legacyButton.getAttribute("aria-current") ===
        "page" ||
      legacyButton.dataset.active === "true";

    /*
     * Returning from Cotizaciones to Inicio must only reveal the
     * already-rendered Home DOM. Re-clicking the active legacy controller
     * reruns its entire render pipeline and caused the measured 4s delay.
     */
    if (!alreadyActive) {
      legacyButton.click();
    }

    setVisualActive(key);

    if (updateUrl) {
      const url = new URL(window.location.href);
      const currentNav = url.searchParams.get("nav");

      url.searchParams.delete("module");
      url.searchParams.set("nav", key);
      url.searchParams.set("v", "r16j1c1-fast");

      if (
        currentNav !== key ||
        window.location.search !== url.search
      ) {
        history.replaceState(null, "", url);
      }
    }

    return true;
  }

  function bindVisualNav() {
    const nav = visualNav();

    if (!nav || nav.dataset.forgeBridgeBoundR16c5k === "true") {
      return;
    }

    nav.dataset.forgeBridgeBoundR16c5k = "true";

    nav.addEventListener(
      "click",
      (event) => {
        const item = event.target.closest(ITEM);

        if (!item || !nav.contains(item)) return;

        const key = item.dataset.forgeNavKey;

        if (!key || key === "cotizaciones") return;

        event.preventDefault();
        event.stopImmediatePropagation();

        void activateHomeSection(key, true);
      },
      true,
    );
  }

  function applyRequestedSection() {
    const requested = new URLSearchParams(
      window.location.search,
    ).get("nav");

    if (
      requested &&
      requested !== "cotizaciones" &&
      controllerButton(requested)
    ) {
      void activateHomeSection(requested, false);
      return;
    }

    setVisualActive("inicio");
  }

  function observeController() {
    const legacy = controller();

    if (!legacy) return;

    const observer = new MutationObserver(() => {
      const active = legacy.querySelector(
        'button.active, button[aria-current="page"], ' +
          'button[data-active="true"]',
      );

      if (active?.dataset.forgeHomeSection) {
        setVisualActive(active.dataset.forgeHomeSection);
      }
    });

    observer.observe(legacy, {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "aria-current",
        "data-active",
      ],
    });
  }

  function init() {
    bindVisualNav();
    applyRequestedSection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }
})();

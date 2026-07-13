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

    /* FORGEOS:R16C5M1_ACTIVE_MODULE_GUARD:START */
    if (
      document.body.dataset.forgeSaasActiveModuleR16c5l ===
        "cotizaciones" &&
      key !== "cotizaciones"
    ) {
      return;
    }
    /* FORGEOS:R16C5M1_ACTIVE_MODULE_GUARD:END */
    const nav = visualNav();
    const selected = visualItem(key);

    if (!nav || !selected) return;

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
  }

  function activateHomeSection(key, updateUrl = true) {
    const legacyButton = controllerButton(key);

    if (!legacyButton) return false;

    legacyButton.click();
    setVisualActive(key);

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("nav", key);
      url.searchParams.set("v", "r16c5k");
      history.replaceState(null, "", url);
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

        activateHomeSection(key, true);
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
      activateHomeSection(requested, false);
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
    observeController();
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

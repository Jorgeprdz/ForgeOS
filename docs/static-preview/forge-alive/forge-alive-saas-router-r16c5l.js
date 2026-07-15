(() => {
  "use strict";

  const MODULE_KEY = "cotizaciones";
  const HOST_SELECTOR =
    '[data-forge-saas-module-host-r16c5l="cotizaciones"]';
  const VISUAL_NAV_SELECTOR =
    ".forge-mobile-nav-r16c5k-home-visual" +
    "[data-forge-mobile-nav-r16c5j]";
  const NAV_ITEM_SELECTOR =
    ".forge-mobile-nav-r16c5j__item";
  const OPEN_SELECTOR =
    '[data-forge-open-saas-module-r16c5l="cotizaciones"]';
  const CLOSE_SELECTOR =
    "[data-forge-saas-module-close-r16c5l]";


  /* FORGEOS:R16J1C1_03A5_CONSTANT_TIME_ROUTER:START */
  const SHELL_SELECTOR = ".phone-shell";
  const FAST_CLASS =
    "forge-saas-module-active-r16j1c1";
  const FAST_STYLE_ID =
    "forge-saas-module-fastpath-style-r16j1c1";

  function ensureFastPathStyle() {
    if (document.getElementById(FAST_STYLE_ID)) {
      return true;
    }

    const style = document.createElement("style");
    style.id = FAST_STYLE_ID;
    style.textContent = `
      .phone-shell.${FAST_CLASS}
        > :not(
          [data-forge-saas-module-host-r16c5l="cotizaciones"]
        ):not(
          [data-command-mobile-slot]
        ):not(
          .forge-home-nav-controller-r16c5k
        ):not(
          .forge-mobile-nav-r16c5k-home-visual
        ) {
        display: none !important;
      }

      .phone-shell.${FAST_CLASS}
        > [data-forge-saas-module-host-r16c5l="cotizaciones"] {
        display: block !important;
      }
    `;

    document.head.appendChild(style);
    return true;
  }

  function isolateShellForModule(moduleHost) {
    const shell = moduleHost.closest(SHELL_SELECTOR);

    if (!shell) return false;

    ensureFastPathStyle();
    shell.classList.add(FAST_CLASS);
    return true;
  }

  function restoreShellAfterModule() {
    const shell = host()?.closest(SHELL_SELECTOR);

    if (!shell) return false;

    shell.classList.remove(FAST_CLASS);
    return true;
  }
  /* FORGEOS:R16J1C1_03A5_CONSTANT_TIME_ROUTER:END */

  function host() {
    return document.querySelector(HOST_SELECTOR);
  }

  function visualNav() {
    return document.querySelector(VISUAL_NAV_SELECTOR);
  }

  function visualItem(key) {
    const nav = visualNav();

    return nav
      ? nav.querySelector(
          `${NAV_ITEM_SELECTOR}[data-forge-nav-key="${key}"]`,
        )
      : null;
  }

  function setVisualActive(key) {
    const nav = visualNav();
    const selected = visualItem(key);

    if (!nav || !selected) return;

    nav.querySelectorAll(NAV_ITEM_SELECTOR).forEach((item) => {
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

  function moduleIsOpen() {
    return (
      document.body.dataset.forgeSaasActiveModuleR16c5l ===
      MODULE_KEY
    );
  }

  function cleanModuleParams(url) {
    url.searchParams.delete("module");
    return url;
  }

  function openModule(options = {}) {
    const moduleHost = host();
    if (!moduleHost) return false;

    document.body.dataset.forgeSaasActiveModuleR16c5l =
      MODULE_KEY;
    document.body.dataset.forgeSaasModuleTransitionR16c5l =
      "enter";
    document.body.dataset.forgeDesiredNavKeyR16j1c1 =
      MODULE_KEY;

    isolateShellForModule(moduleHost);
    moduleHost.hidden = false;

    /*
     * The router owns route state, but never measures or styles the
     * selector. It delegates the target key to the single visual
     * authority. This also covers HTMLElement.click(), keyboard
     * activation and tests where pointerdown is intentionally absent.
     */
    globalThis
      .ForgeMobileNavInstantAuthorityR16J1C1
      ?.sync(MODULE_KEY);

    const url = new URL(window.location.href);
    url.searchParams.set("module", MODULE_KEY);
    url.searchParams.set("v", "r16j1c1-fast");

    if (options.history !== false) {
      history.pushState(
        { forgeModule: MODULE_KEY },
        "",
        url,
      );
    }

    document.title = "Nueva cotización · Forge Alive";

    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }

    window.dispatchEvent(
      new CustomEvent("forge:saas-module-opened", {
        detail: { module: MODULE_KEY },
      }),
    );

    return true;
  }

  function closeModule(options = {}) {
    const moduleHost = host();
    if (!moduleHost) return false;

    moduleHost.hidden = true;
    restoreShellAfterModule();

    delete document.body.dataset
      .forgeSaasActiveModuleR16c5l;
    delete document.body.dataset
      .forgeSaasModuleTransitionR16c5l;

    const targetKey = options.targetKey || "inicio";

    document.body.dataset.forgeDesiredNavKeyR16j1c1 =
      targetKey;

    globalThis
      .ForgeMobileNavInstantAuthorityR16J1C1
      ?.sync(targetKey);

    if (options.history !== false) {
      const url = cleanModuleParams(
        new URL(window.location.href),
      );
      url.searchParams.set("nav", targetKey);
      url.searchParams.set("v", "r16j1c1-fast");

      history.pushState(
        {
          forgeModule: null,
          forgeSection: targetKey,
        },
        "",
        url,
      );
    }

    document.title = "Forge Alive Vista Estática";

    window.dispatchEvent(
      new CustomEvent("forge:saas-module-closed", {
        detail: {
          module: MODULE_KEY,
          targetKey,
        },
      }),
    );

    return true;
  }

  function requestedModule() {
    return new URLSearchParams(
      window.location.search,
    ).get("module");
  }

  function bindNavigationCapture() {
    window.addEventListener(
      "click",
      (event) => {
        const openTarget = event.target.closest(OPEN_SELECTOR);

        if (openTarget) {
          event.preventDefault();
          event.stopImmediatePropagation();
          openModule();
          return;
        }

        const navItem = event.target.closest(NAV_ITEM_SELECTOR);

        if (
          navItem &&
          visualNav()?.contains(navItem)
        ) {
          const key = navItem.dataset.forgeNavKey;

          if (key === MODULE_KEY) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openModule();
            return;
          }

          if (moduleIsOpen()) {
            closeModule({
              history: false,
              targetKey: key || "inicio",
            });
          }

          return;
        }

        const closeTarget = event.target.closest(CLOSE_SELECTOR);

        if (closeTarget) {
          event.preventDefault();
          closeModule();
          return;
        }

        if (moduleIsOpen()) {
          const anchor = event.target.closest(
            `${HOST_SELECTOR} a`,
          );

          if (
            anchor &&
            (
              anchor.textContent.trim().startsWith("←") ||
              anchor.getAttribute("href")?.startsWith("../")
            )
          ) {
            event.preventDefault();
            closeModule();
          }
        }
      },
      true,
    );
  }

  function bindHistory() {
    window.addEventListener("popstate", () => {
      if (requestedModule() === MODULE_KEY) {
        openModule({ history: false });
        return;
      }

      if (moduleIsOpen()) {
        closeModule({ history: false });
      }
    });
  }

  function init() {
    ensureFastPathStyle();
    bindNavigationCapture();
    bindHistory();

    if (requestedModule() === MODULE_KEY) {
      openModule({ history: false });
    }
  }

  window.ForgeSaasRouterR16C5L = Object.freeze({
    openNewQuote: () => openModule(),
    closeNewQuote: () => closeModule(),
    isNewQuoteOpen: () => moduleIsOpen(),
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }
})();

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


  /* FORGEOS:R16C5N_QUOTE_MODULE_ROUTER_DOM_ISOLATION:START */

  const SHELL_SELECTOR = ".phone-shell";
  const PERSISTENT_SHELL_CHILD_SELECTOR = [
    HOST_SELECTOR,
    "[data-command-mobile-slot]",
    ".forge-home-nav-controller-r16c5k",
    ".forge-mobile-nav-r16c5k-home-visual",
  ].join(", ");

  const suppressedShellChildren = new Map();
  let shellIsolationObserver = null;

  function isPersistentShellChild(child, moduleHost) {
    return (
      child === moduleHost ||
      child.matches(PERSISTENT_SHELL_CHILD_SELECTOR)
    );
  }

  function suppressShellChild(child, moduleHost) {
    if (
      !(child instanceof HTMLElement) ||
      isPersistentShellChild(child, moduleHost) ||
      suppressedShellChildren.has(child)
    ) {
      return;
    }

    suppressedShellChildren.set(child, {
      display: child.style.getPropertyValue("display"),
      displayPriority:
        child.style.getPropertyPriority("display"),
      ariaHidden: child.getAttribute("aria-hidden"),
      inert:
        "inert" in child
          ? child.inert
          : null,
    });

    child.dataset.forgeSaasSuppressedR16c5n = "true";
    child.style.setProperty("display", "none", "important");
    child.setAttribute("aria-hidden", "true");

    if ("inert" in child) {
      child.inert = true;
    }
  }

  function isolateShellForModule(moduleHost) {
    const shell = moduleHost.closest(SHELL_SELECTOR);

    if (!shell) return false;

    Array.from(shell.children).forEach((child) => {
      suppressShellChild(child, moduleHost);
    });

    shellIsolationObserver?.disconnect();

    shellIsolationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            node.parentElement === shell
          ) {
            suppressShellChild(node, moduleHost);
          }
        });
      });
    });

    shellIsolationObserver.observe(shell, {
      childList: true,
    });

    return true;
  }

  function restoreShellAfterModule() {
    shellIsolationObserver?.disconnect();
    shellIsolationObserver = null;

    suppressedShellChildren.forEach((state, child) => {
      if (state.display) {
        child.style.setProperty(
          "display",
          state.display,
          state.displayPriority,
        );
      } else {
        child.style.removeProperty("display");
      }

      if (state.ariaHidden === null) {
        child.removeAttribute("aria-hidden");
      } else {
        child.setAttribute("aria-hidden", state.ariaHidden);
      }

      if (state.inert !== null && "inert" in child) {
        child.inert = state.inert;
      }

      delete child.dataset.forgeSaasSuppressedR16c5n;
    });

    suppressedShellChildren.clear();
  }

  /* FORGEOS:R16C5N_QUOTE_MODULE_ROUTER_DOM_ISOLATION:END */

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

    moduleHost.hidden = false;
    document.body.dataset.forgeSaasActiveModuleR16c5l =
      MODULE_KEY;
    document.body.dataset.forgeSaasModuleTransitionR16c5l =
      "enter";

    isolateShellForModule(moduleHost);
    setVisualActive(MODULE_KEY);

    const url = new URL(window.location.href);
    url.searchParams.set("module", MODULE_KEY);
    url.searchParams.set("v", "r16c5l");

    if (options.history !== false) {
      history.pushState(
        { forgeModule: MODULE_KEY },
        "",
        url,
      );
    }

    document.title = "Nueva cotización · Forge Alive";

    window.scrollTo({
      top: 0,
      behavior:
        window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches
          ? "auto"
          : "smooth",
    });

    window.dispatchEvent(
      new CustomEvent("forge:saas-module-opened", {
        detail: { module: MODULE_KEY },
      }),
    );

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });

    return true;
  }

  function closeModule(options = {}) {
    const moduleHost = host();

    if (!moduleHost) return false;

    moduleHost.hidden = true;

    delete document.body.dataset.forgeSaasActiveModuleR16c5l;
    delete document.body.dataset.forgeSaasModuleTransitionR16c5l;

    restoreShellAfterModule();

    const targetKey = options.targetKey || "inicio";
    setVisualActive(targetKey);

    if (options.history !== false) {
      const url = cleanModuleParams(
        new URL(window.location.href),
      );

      url.searchParams.set("nav", targetKey);
      url.searchParams.set("v", "r16c5l");

      history.pushState(
        { forgeModule: null, forgeSection: targetKey },
        "",
        url,
      );
    }

    document.title = "Forge Alive Vista Estática";

    window.dispatchEvent(
      new CustomEvent("forge:saas-module-closed", {
        detail: { module: MODULE_KEY, targetKey },
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

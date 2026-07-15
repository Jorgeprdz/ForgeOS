(() => {
  "use strict";

  const VERSION =
    "R16J1C1_MOBILE_NAV_INSTANT_AUTHORITY_03A4";
  const NAV_SELECTOR =
    ".forge-mobile-nav-r16c5k-home-visual" +
    "[data-forge-mobile-nav-r16c5j]";
  const ITEM_SELECTOR =
    ".forge-mobile-nav-r16c5j__item";
  const ITEMS_SELECTOR =
    ":scope > .forge-mobile-nav-r16c5j__items > " +
    ITEM_SELECTOR;
  const SELECTOR_SELECTOR =
    ":scope > .forge-mobile-nav-r16c5j__selector";

  let observer = null;
  let reconciling = false;
  let queued = false;
  let desiredKey = null;

  function navNode() {
    return document.querySelector(NAV_SELECTOR);
  }

  function navItems(nav) {
    return Array.from(
      nav?.querySelectorAll(ITEMS_SELECTOR) || [],
    );
  }

  function itemByKey(nav, key) {
    if (!nav || !key) return null;

    return nav.querySelector(
      `${ITEMS_SELECTOR}` +
      `[data-forge-nav-key="${key}"]`,
    );
  }

  function itemFromEvent(event) {
    const item = event.target?.closest?.(ITEM_SELECTOR);
    const nav = navNode();

    if (!item || !nav || !nav.contains(item)) {
      return null;
    }

    return item;
  }

  function requestedKey() {
    const url = new URL(location.href);
    const moduleKey =
      url.searchParams.get("module");
    const bodyModule =
      document.body.dataset
        .forgeSaasActiveModuleR16c5l;
    const urlNav =
      url.searchParams.get("nav");
    const durableKey =
      document.body.dataset
        .forgeDesiredNavKeyR16j1c1;

    if (
      moduleKey === "cotizaciones" ||
      bodyModule === "cotizaciones"
    ) {
      return "cotizaciones";
    }

    return urlNav || durableKey || "inicio";
  }

  function activeKey(nav) {
    const active =
      nav?.querySelector(
        `${ITEMS_SELECTOR}[aria-current="page"]`,
      ) ||
      nav?.querySelector(
        `${ITEMS_SELECTOR}.active`,
      );

    return (
      active?.dataset.forgeNavKey ||
      nav?.dataset.forgeActiveKey ||
      requestedKey()
    );
  }

  function setStyle(
    node,
    property,
    value,
    priority = "important",
  ) {
    if (
      node.style.getPropertyValue(property) === value &&
      node.style.getPropertyPriority(property) === priority
    ) {
      return false;
    }

    node.style.setProperty(
      property,
      value,
      priority,
    );
    return true;
  }

  function setVariable(nav, property, value) {
    if (nav.style.getPropertyValue(property) === value) {
      return false;
    }

    nav.style.setProperty(property, value);
    return true;
  }

  function sync(key = null) {
    const moduleOpen =
      document.body.dataset
        .forgeSaasActiveModuleR16c5l ===
      "cotizaciones";

    /*
     * Route state outranks legacy visual requests. While the quote
     * module is open, no observer or bridge may move the nav back to
     * Inicio.
     */
    const resolvedKey = moduleOpen
      ? "cotizaciones"
      : key || desiredKey || requestedKey();

    desiredKey = resolvedKey;
    document.body.dataset.forgeDesiredNavKeyR16j1c1 =
      resolvedKey;

    const nav = navNode();
    const selected =
      itemByKey(nav, resolvedKey) ||
      itemByKey(nav, "inicio");
    const selector =
      nav?.querySelector(SELECTOR_SELECTOR);

    if (!nav || !selected || !selector) {
      return false;
    }

    const navRect = nav.getBoundingClientRect();
    const itemRect = selected.getBoundingClientRect();

    if (
      itemRect.width < 1 ||
      itemRect.height < 1
    ) {
      return false;
    }

    const x = itemRect.left - navRect.left;
    const y = itemRect.top - navRect.top;
    const width = itemRect.width;
    const height = itemRect.height;

    const xValue = `${x}px`;
    const yValue = `${y}px`;
    const widthValue = `${width}px`;
    const heightValue = `${height}px`;
    const transformValue =
      `translate3d(${x}px, ${y}px, 0) scale(1)`;

    reconciling = true;

    try {
      navItems(nav).forEach((item) => {
        const isActive = item === selected;

        if (
          item.classList.contains("active") !==
          isActive
        ) {
          item.classList.toggle(
            "active",
            isActive,
          );
        }

        if (isActive) {
          if (
            item.getAttribute("aria-current") !==
            "page"
          ) {
            item.setAttribute(
              "aria-current",
              "page",
            );
          }
        } else if (
          item.hasAttribute("aria-current")
        ) {
          item.removeAttribute("aria-current");
        }
      });

      if (
        nav.dataset.forgeActiveKey !==
        selected.dataset.forgeNavKey
      ) {
        nav.dataset.forgeActiveKey =
          selected.dataset.forgeNavKey;
      }

      setVariable(
        nav,
        "--forge-mobile-nav-selector-x-r16c5j",
        xValue,
      );
      setVariable(
        nav,
        "--forge-mobile-nav-selector-y-r16c5j",
        yValue,
      );
      setVariable(
        nav,
        "--forge-mobile-nav-selector-w-r16c5j",
        widthValue,
      );
      setVariable(
        nav,
        "--forge-mobile-nav-selector-h-r16c5j",
        heightValue,
      );

      setStyle(
        selector,
        "display",
        "block",
      );
      setStyle(
        selector,
        "visibility",
        "visible",
      );
      setStyle(
        selector,
        "width",
        widthValue,
      );
      setStyle(
        selector,
        "height",
        heightValue,
      );
      setStyle(
        selector,
        "opacity",
        "1",
      );
      setStyle(
        selector,
        "transform",
        transformValue,
      );
      setStyle(
        selector,
        "transition",
        "none",
      );

      if (
        nav.dataset
          .forgeMobileNavReadyR16c5j !==
        "true"
      ) {
        nav.dataset
          .forgeMobileNavReadyR16c5j =
          "true";
      }
    } finally {
      reconciling = false;
    }

    return true;
  }

  function scheduleReconcile() {
    if (reconciling || queued) return;

    queued = true;

    queueMicrotask(() => {
      queued = false;
      sync(desiredKey || requestedKey());
    });
  }

  function onPointerDown(event) {
    const item = itemFromEvent(event);
    const key = item?.dataset.forgeNavKey;

    if (!key) return;
    sync(key);
  }

  function onClick(event) {
    if (event.detail !== 0) return;

    const item = itemFromEvent(event);
    const key = item?.dataset.forgeNavKey;

    if (!key) return;
    sync(key);
  }

  function bind() {
    const nav = navNode();

    if (!nav) return false;

    if (
      nav.dataset
        .forgeInstantAuthorityBoundR16j1c1 ===
      "true"
    ) {
      sync(desiredKey || requestedKey());
      return true;
    }

    nav.dataset
      .forgeInstantAuthorityBoundR16j1c1 =
      "true";

    document.addEventListener(
      "pointerdown",
      onPointerDown,
      {
        capture: true,
        passive: true,
      },
    );

    document.addEventListener(
      "click",
      onClick,
      true,
    );

    globalThis.addEventListener(
      "forge:saas-module-opened",
      (event) => {
        if (
          event.detail?.module ===
          "cotizaciones"
        ) {
          sync("cotizaciones");
        }
      },
    );

    globalThis.addEventListener(
      "forge:saas-module-closed",
      (event) => {
        sync(
          event.detail?.targetKey ||
          "inicio",
        );
      },
    );

    globalThis.addEventListener(
      "popstate",
      () => sync(requestedKey()),
    );

    globalThis.addEventListener(
      "pageshow",
      () => sync(requestedKey()),
      { passive: true },
    );

    globalThis.addEventListener(
      "resize",
      () => sync(
        desiredKey || requestedKey(),
      ),
      { passive: true },
    );

    globalThis.addEventListener(
      "orientationchange",
      () => sync(
        desiredKey || requestedKey(),
      ),
      { passive: true },
    );

    observer = new MutationObserver(
      scheduleReconcile,
    );

    observer.observe(nav, {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "aria-current",
        "data-forge-active-key",
        "style",
      ],
    });

    sync(requestedKey());
    return true;
  }

  function boot() {
    if (bind()) return;

    requestAnimationFrame(() => {
      bind();
    });
  }

  globalThis
    .ForgeMobileNavInstantAuthorityR16J1C1 =
    Object.freeze({
      version: VERSION,
      sync,
      getState() {
        const nav = navNode();
        const selector =
          nav?.querySelector(
            SELECTOR_SELECTOR,
          );

        return Object.freeze({
          activeKey: activeKey(nav),
          ready:
            nav?.dataset
              .forgeMobileNavReadyR16c5j ===
            "true",
          bound:
            nav?.dataset
              .forgeInstantAuthorityBoundR16j1c1 ===
            "true",
          selectorDisplay:
            selector
              ? getComputedStyle(selector).display
              : "",
          selectorVisibility:
            selector
              ? getComputedStyle(selector).visibility
              : "",
          selectorOpacity:
            selector
              ? getComputedStyle(selector).opacity
              : "",
        });
      },
    });

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true },
    );
  } else {
    boot();
  }
})();

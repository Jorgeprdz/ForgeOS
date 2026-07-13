(() => {
  "use strict";

  const NAV_SELECTOR =
    '.bottom-nav[data-forge-shared-nav-r16c5h="true"]';
  const SELECTOR_CLASS = "forge-nav-active-squircle-r16c5h";
  const STORAGE_KEY = "forge.nav.previous.key.r16c5h";

  function keyFor(item) {
    if (!item) return null;

    return (
      item.dataset.forgeNavKey ||
      item.dataset.forgeHomeSection ||
      (
        item.classList.contains("forge-home-quote-nav-r16c5")
          ? "cotizaciones"
          : null
      )
    );
  }

  function itemForKey(nav, key) {
    if (!nav || !key) return null;

    return (
      nav.querySelector(`:scope > [data-forge-nav-key="${key}"]`) ||
      nav.querySelector(`:scope > [data-forge-home-section="${key}"]`) ||
      (
        key === "cotizaciones"
          ? nav.querySelector(
              ":scope > .forge-home-quote-nav-r16c5"
            )
          : null
      )
    );
  }

  function activeItem(nav) {
    if (!nav) return null;

    return (
      nav.querySelector(":scope > .active") ||
      nav.querySelector(':scope > [aria-current="page"]') ||
      nav.querySelector(':scope > [data-active="true"]') ||
      itemForKey(nav, nav.dataset.forgeActiveKey)
    );
  }

  function setGeometry(nav, item, immediate = false) {
    if (!nav || !item) return;

    const selector = nav.querySelector(`:scope > .${SELECTOR_CLASS}`);
    if (!selector) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const x = itemRect.left - navRect.left;
    const y = itemRect.top - navRect.top;

    if (immediate) {
      selector.style.transition = "none";
    }

    nav.style.setProperty(
      "--forge-nav-selector-x-r16c5h",
      `${x}px`,
    );
    nav.style.setProperty(
      "--forge-nav-selector-y-r16c5h",
      `${y}px`,
    );
    nav.style.setProperty(
      "--forge-nav-selector-w-r16c5h",
      `${itemRect.width}px`,
    );
    nav.style.setProperty(
      "--forge-nav-selector-h-r16c5h",
      `${itemRect.height}px`,
    );

    if (immediate) {
      selector.getBoundingClientRect();
      selector.style.removeProperty("transition");
    }
  }

  function animateToCurrent(nav) {
    const current = activeItem(nav);
    if (!current) return;

    setGeometry(nav, current);
    nav.dataset.forgeActiveKey = keyFor(current) || "";
    nav.dataset.forgeNavReadyR16c5h = "true";
  }

  function initializeNav(nav) {
    if (!nav || nav.dataset.forgeNavInitializedR16c5h === "true") {
      if (nav) animateToCurrent(nav);
      return;
    }

    nav.dataset.forgeNavInitializedR16c5h = "true";

    let selector = nav.querySelector(`:scope > .${SELECTOR_CLASS}`);

    if (!selector) {
      selector = document.createElement("span");
      selector.className = SELECTOR_CLASS;
      selector.setAttribute("aria-hidden", "true");
      nav.prepend(selector);
    }

    const current = activeItem(nav);
    const previousKey = sessionStorage.getItem(STORAGE_KEY);
    const previous = itemForKey(nav, previousKey);

    if (previous && current && previous !== current) {
      setGeometry(nav, previous, true);
      nav.dataset.forgeNavReadyR16c5h = "true";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setGeometry(nav, current);
        });
      });
    } else if (current) {
      setGeometry(nav, current, true);
      requestAnimationFrame(() => {
        nav.dataset.forgeNavReadyR16c5h = "true";
      });
    }

    sessionStorage.removeItem(STORAGE_KEY);

    nav.addEventListener("click", (event) => {
      const target = event.target.closest("button, a");

      if (!target || target.parentElement !== nav) return;

      const from = activeItem(nav);
      const fromKey = keyFor(from);
      const targetKey = keyFor(target);

      if (fromKey) {
        sessionStorage.setItem(STORAGE_KEY, fromKey);
      }

      if (targetKey) {
        nav.dataset.forgeActiveKey = targetKey;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => animateToCurrent(nav));
      });
    });

    const observer = new MutationObserver(() => {
      animateToCurrent(nav);
    });

    observer.observe(nav, {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "aria-current",
        "data-active",
      ],
    });

    const update = () => animateToCurrent(nav);

    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("pageshow", update);

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        update,
        { passive: true },
      );
    }
  }

  function applyHomeRouteRequest() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("nav");

    if (!requested || requested === "cotizaciones") return;

    const nav = document.querySelector(NAV_SELECTOR);
    if (!nav) return;

    const button = itemForKey(nav, requested);

    if (button && button.tagName === "BUTTON") {
      setTimeout(() => button.click(), 0);
    }
  }

  function init() {
    document.querySelectorAll(NAV_SELECTOR).forEach(initializeNav);
    applyHomeRouteRequest();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

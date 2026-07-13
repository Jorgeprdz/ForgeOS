(() => {
  "use strict";

  const NAV_SELECTOR = "[data-forge-mobile-nav-r16c5j]";
  const ITEM_SELECTOR = ".forge-mobile-nav-r16c5j__item";
  const SELECTOR_CLASS = "forge-mobile-nav-r16c5j__selector";
  const STORAGE_KEY = "forge.mobile.nav.previous.r16c5j";

  function navItems(nav) {
    return Array.from(
      nav.querySelectorAll(
        ":scope > .forge-mobile-nav-r16c5j__items > " +
          ITEM_SELECTOR,
      ),
    );
  }

  function keyOf(item) {
    return item ? item.dataset.forgeNavKey || "" : "";
  }

  function itemByKey(nav, key) {
    if (!nav || !key) return null;

    return nav.querySelector(
      `:scope > .forge-mobile-nav-r16c5j__items > ` +
        `${ITEM_SELECTOR}[data-forge-nav-key="${key}"]`,
    );
  }

  function activeItem(nav) {
    return (
      nav.querySelector(
        `:scope > .forge-mobile-nav-r16c5j__items > ` +
          `${ITEM_SELECTOR}[aria-current="page"]`,
      ) ||
      nav.querySelector(
        `:scope > .forge-mobile-nav-r16c5j__items > ` +
          `${ITEM_SELECTOR}.active`,
      ) ||
      itemByKey(nav, nav.dataset.forgeActiveKey)
    );
  }

  function setActive(nav, selected) {
    if (!nav || !selected) return;

    navItems(nav).forEach((item) => {
      const active = item === selected;

      item.classList.toggle("active", active);

      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    nav.dataset.forgeActiveKey = keyOf(selected);
  }

  function selectorNode(nav) {
    return nav.querySelector(`:scope > .${SELECTOR_CLASS}`);
  }

  function setSelectorGeometry(nav, item, immediate = false) {
    const selector = selectorNode(nav);

    if (!selector || !item) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const x = itemRect.left - navRect.left;
    const y = itemRect.top - navRect.top;

    if (immediate) {
      selector.style.transition = "none";
    }

    nav.style.setProperty(
      "--forge-mobile-nav-selector-x-r16c5j",
      `${x}px`,
    );
    nav.style.setProperty(
      "--forge-mobile-nav-selector-y-r16c5j",
      `${y}px`,
    );
    nav.style.setProperty(
      "--forge-mobile-nav-selector-w-r16c5j",
      `${itemRect.width}px`,
    );
    nav.style.setProperty(
      "--forge-mobile-nav-selector-h-r16c5j",
      `${itemRect.height}px`,
    );

    if (immediate) {
      selector.getBoundingClientRect();
      selector.style.removeProperty("transition");
    }
  }

  function sync(nav, immediate = false) {
    const active = activeItem(nav);

    if (!active) return;

    setSelectorGeometry(nav, active, immediate);
    nav.dataset.forgeMobileNavReadyR16c5j = "true";
  }

  function animateFromPrevious(nav) {
    const current = activeItem(nav);
    const previousKey = sessionStorage.getItem(STORAGE_KEY);
    const previous = itemByKey(nav, previousKey);

    sessionStorage.removeItem(STORAGE_KEY);

    if (previous && current && previous !== current) {
      setSelectorGeometry(nav, previous, true);
      nav.dataset.forgeMobileNavReadyR16c5j = "true";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSelectorGeometry(nav, current);
        });
      });

      return;
    }

    sync(nav, true);

    requestAnimationFrame(() => {
      nav.dataset.forgeMobileNavReadyR16c5j = "true";
    });
  }

  function bind(nav) {
    if (!nav || nav.dataset.forgeMobileNavBoundR16c5j === "true") {
      if (nav) sync(nav);
      return;
    }

    nav.dataset.forgeMobileNavBoundR16c5j = "true";

    nav.addEventListener("click", (event) => {
      const item = event.target.closest(ITEM_SELECTOR);

      if (
        !item ||
        !nav.contains(item) ||
        !item.closest(".forge-mobile-nav-r16c5j__items")
      ) {
        return;
      }

      const current = activeItem(nav);
      const currentKey = keyOf(current);

      if (currentKey) {
        sessionStorage.setItem(STORAGE_KEY, currentKey);
      }

      if (item.tagName === "BUTTON") {
        setActive(nav, item);

        requestAnimationFrame(() => {
          sync(nav);
        });
      }
    });

    const observer = new MutationObserver(() => {
      sync(nav);
    });

    observer.observe(nav, {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "aria-current",
        "data-forge-active-key",
      ],
    });

    const update = () => sync(nav);

    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, {
      passive: true,
    });
    window.addEventListener("pageshow", update);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", update, {
        passive: true,
      });
    }

    animateFromPrevious(nav);
  }

  function applyRequestedHomeSection() {
    const page = document.body.dataset.forgeMobileNavPageR16c5j;

    if (page !== "home") return;

    const requested = new URLSearchParams(
      window.location.search,
    ).get("nav");

    if (!requested) return;

    const nav = document.querySelector(NAV_SELECTOR);
    const item = itemByKey(nav, requested);

    if (item && item.tagName === "BUTTON") {
      setTimeout(() => item.click(), 0);
    }
  }

  function init() {
    document.querySelectorAll(NAV_SELECTOR).forEach(bind);
    applyRequestedHomeSection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }
})();

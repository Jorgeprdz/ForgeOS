(() => {
  "use strict";

  const flag = window.ForgeUiRuntimeFlag;

  if (!flag || flag.enabled !== true) {
    return;
  }

  const shellSelector = "[data-forge-m3-shell]";
  const productSelector = ".phone-shell";

  const icons = Object.freeze({
    inicio:
      '<path d="m12 3 9 8h-2v9h-5v-6h-4v6H5v-9H3l9-8Z"/>',
    pipeline:
      '<path d="M4 19h3V9H4v10Zm6 0h4V4h-4v15Zm7 0h3v-7h-3v7Z"/>',
    cotizaciones:
      '<path d="M7 2h7l5 5v15H5V2h2Zm7 2H7v16h10V8h-3V4Zm-5 8h6v2H9v-2Zm0 4h6v2H9v-2Z"/>',
  });

  const routes = Object.freeze([
    Object.freeze({
      key: "inicio",
      label: "Inicio",
      selectors: [
        '[data-forge-static-view="inicio"]',
        '.forge-mobile-nav-r16c5j__item[data-forge-nav-key="home"]',
        '.forge-mobile-nav-r16c5j__item[data-forge-nav-key="inicio"]',
      ],
    }),
    Object.freeze({
      key: "pipeline",
      label: "Pipeline",
      selectors: [
        '[data-forge-static-view="pipeline"]',
        '.forge-mobile-nav-r16c5j__item[data-forge-nav-key="pipeline"]',
      ],
    }),
    Object.freeze({
      key: "cotizaciones",
      label: "Cotizaciones",
      selectors: [
        '[data-forge-open-saas-module-r16c5l="cotizaciones"]',
        '.forge-mobile-nav-r16c5j__item[data-forge-nav-key="cotizaciones"]',
      ],
    }),
  ]);

  const bowtie = `
    <svg
      class="forge-m3-shell__bowtie"
      viewBox="0 0 64 40"
      aria-hidden="true"
    >
      <path
        d="M27 14 9 5C5 3 2 6 2 10v20c0 4 3 7 7 5l18-9V14Zm10 0 18-9c4-2 7 1 7 5v20c0 4-3 7-7 5l-18-9V14Z"
      ></path>
      <rect x="26" y="12" width="12" height="16" rx="4"></rect>
    </svg>
  `;

  const normalizeRoute = (value) => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();

    if (
      normalized === "home"
      || normalized === "inicio"
      || normalized === ""
    ) {
      return "inicio";
    }

    if (normalized === "quotes") {
      return "cotizaciones";
    }

    return routes.some((route) => route.key === normalized)
      ? normalized
      : "inicio";
  };

  const readInitialRoute = () => {
    const params = new URLSearchParams(window.location.search);
    return normalizeRoute(params.get("nav"));
  };

  const findLegacyTarget = (route) => {
    for (const selector of route.selectors) {
      const candidates = [
        ...document.querySelectorAll(selector),
      ];

      const target = candidates.find(
        (candidate) =>
          !candidate.closest(shellSelector),
      );

      if (target) {
        return target;
      }
    }

    return null;
  };

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

  const createShell = () => {
    const product = document.querySelector(productSelector);

    if (!product) {
      dispatch(
        "forge:ui-shell-error",
        Object.freeze({
          code: "PRODUCT_SURFACE_NOT_FOUND",
          selector: productSelector,
        }),
      );
      return null;
    }

    const shell = document.createElement("div");
    shell.className = "forge-m3-app-shell";
    shell.setAttribute("data-forge-m3-shell", "true");
    shell.setAttribute(
      "data-forge-m3-shell-ready",
      "false",
    );

    shell.innerHTML = `
      <header
        class="forge-m3-shell__header"
        data-forge-m3-header
      >
        <div class="forge-m3-shell__brand">
          <span class="forge-m3-shell__brand-mark">
            ${bowtie}
          </span>
          <div class="forge-m3-shell__brand-copy">
            <p class="forge-m3-shell__eyebrow">
              FORGE ALIVE
            </p>
            <h1 class="forge-m3-shell__title">
              Inicio · inteligencia comercial
            </h1>
          </div>
        </div>

        <div class="forge-m3-shell__header-actions">
          <span class="forge-m3-shell__mode">
            <i
              class="forge-m3-shell__mode-dot"
              aria-hidden="true"
            ></i>
            Material 3
          </span>

          <button
            class="forge-m3-shell__legacy"
            type="button"
            data-forge-m3-legacy
          >
            Interfaz actual
          </button>

          <button
            class="forge-m3-shell__profile"
            type="button"
            data-forge-m3-profile
            aria-label="Abrir perfil"
          >
            JP
          </button>
        </div>
      </header>

      <div
        class="forge-m3-shell__content"
        data-forge-m3-content
      ></div>

      <div
        class="forge-m3-shell__nav-region"
        data-forge-m3-nav-region
        aria-label="Navegación principal"
      >
        <nav class="forge-m3-shell__nav-pill">
          ${routes.map((route) => `
            <button
              class="forge-m3-shell__nav-item"
              type="button"
              data-forge-m3-nav="${route.key}"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                ${icons[route.key]}
              </svg>
              <span>${route.label}</span>
            </button>
          `).join("")}
        </nav>

        <button
          class="forge-m3-shell__alfred-launcher"
          type="button"
          data-forge-m3-open-alfred
          aria-label="Abrir Alfred"
        >
          <span
            class="forge-m3-shell__halo"
            aria-hidden="true"
          ></span>
          <span
            class="forge-m3-shell__halo--soft"
            aria-hidden="true"
          ></span>
          <span class="forge-m3-shell__alfred-core">
            ${bowtie}
          </span>
          <span class="forge-m3-shell__alfred-label">
            Alfred
          </span>
        </button>
      </div>

      <section
        class="forge-m3-shell__alfred-sheet"
        data-forge-m3-alfred-sheet
        aria-hidden="true"
        aria-label="Alfred"
      >
        <button
          class="forge-m3-shell__scrim"
          type="button"
          data-forge-m3-close-alfred
          aria-label="Cerrar Alfred"
        ></button>

        <div
          class="forge-m3-shell__alfred-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forge-m3-alfred-title"
        >
          <div
            class="forge-m3-shell__handle"
            aria-hidden="true"
          ></div>

          <div class="forge-m3-shell__alfred-header">
            <span class="forge-m3-shell__alfred-mini">
              ${bowtie}
            </span>

            <div>
              <p>ALFRED</p>
              <h2 id="forge-m3-alfred-title">
                ¿Qué necesitas resolver?
              </h2>
            </div>

            <button
              class="forge-m3-shell__close"
              type="button"
              data-forge-m3-close-alfred
              aria-label="Cerrar Alfred"
            >
              ×
            </button>
          </div>

          <div class="forge-m3-shell__suggestions">
            <button
              class="forge-m3-shell__suggestion"
              type="button"
            >
              Prioriza mis seguimientos
            </button>
            <button
              class="forge-m3-shell__suggestion"
              type="button"
            >
              Prepara el mensaje para Juan
            </button>
            <button
              class="forge-m3-shell__suggestion"
              type="button"
            >
              Explícame el riesgo de hoy
            </button>
          </div>

          <label class="forge-m3-shell__composer">
            <span class="forge-m3-visually-hidden">
              Escribe una instrucción para Alfred
            </span>
            <input
              type="text"
              data-forge-m3-alfred-input
              placeholder="Pregúntale o pídele que prepare algo…"
            >
            <button
              class="forge-m3-shell__send"
              type="button"
              data-forge-m3-alfred-preview-send
              aria-label="Preparar con Alfred"
            >
              ↑
            </button>
          </label>

          <p class="forge-m3-shell__note">
            Vista segura de UI-M02. Alfred todavía no envía,
            persiste ni modifica información.
          </p>
        </div>
      </section>

      <div
        class="forge-m3-shell__toast"
        data-forge-m3-toast
        role="status"
        aria-live="polite"
      ></div>
    `;

    const content = shell.querySelector(
      "[data-forge-m3-content]",
    );

    product.setAttribute(
      "data-forge-m3-product-surface",
      "true",
    );

    content.appendChild(product);
    document.body.prepend(shell);
    document.body.classList.add("forge-m3-shell-mounted");

    return shell;
  };

  const mount = () => {
    if (document.querySelector(shellSelector)) {
      return;
    }

    const shell = createShell();

    if (!shell) {
      return;
    }

    const sheet = shell.querySelector(
      "[data-forge-m3-alfred-sheet]",
    );

    const input = shell.querySelector(
      "[data-forge-m3-alfred-input]",
    );

    const toast = shell.querySelector(
      "[data-forge-m3-toast]",
    );

    let activeRoute = readInitialRoute();
    let toastTimer = null;
    let previousFocus = null;

    const layoutMode = () => {
      const width = window.innerWidth;

      if (width < 760) {
        return "mobile";
      }

      if (width < 900) {
        return "tablet-portrait";
      }

      if (width < 1200) {
        return "tablet-landscape";
      }

      return "desktop";
    };

    const syncLayout = () => {
      shell.setAttribute(
        "data-forge-m3-layout",
        layoutMode(),
      );
    };

    const syncVisualViewport = () => {
      const viewport = window.visualViewport;
      const viewportHeight = viewport
        ? viewport.height
        : window.innerHeight;

      const viewportTop = viewport
        ? viewport.offsetTop
        : 0;

      const keyboardInset = Math.max(
        0,
        window.innerHeight
          - viewportHeight
          - viewportTop,
      );

      document.documentElement.style.setProperty(
        "--forge-visual-viewport-height",
        `${viewportHeight}px`,
      );

      document.documentElement.style.setProperty(
        "--forge-keyboard-inset",
        `${keyboardInset}px`,
      );

      document.body.classList.toggle(
        "forge-m3-keyboard-open",
        keyboardInset > 120,
      );
    };

    const showToast = (message) => {
      if (!toast) {
        return;
      }

      toast.textContent = message;
      toast.classList.add("is-visible");

      if (toastTimer !== null) {
        window.clearTimeout(toastTimer);
      }

      toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
      }, 1800);
    };

    const updateNavigation = (key) => {
      activeRoute = normalizeRoute(key);

      shell
        .querySelectorAll("[data-forge-m3-nav]")
        .forEach((button) => {
          const selected =
            button.dataset.forgeM3Nav === activeRoute;

          button.toggleAttribute(
            "aria-current",
            selected,
          );

          if (selected) {
            button.setAttribute(
              "aria-current",
              "page",
            );
          }
        });

      shell.setAttribute(
        "data-forge-m3-active-route",
        activeRoute,
      );
    };

    const requestNavigation = (key) => {
      const route = routes.find(
        (candidate) =>
          candidate.key === normalizeRoute(key),
      );

      if (!route) {
        return;
      }

      updateNavigation(route.key);

      const url = new URL(window.location.href);
      url.searchParams.set("nav", route.key);
      url.searchParams.set("forgeUi", "material3");

      window.history.replaceState(
        window.history.state,
        "",
        url,
      );

      const target = findLegacyTarget(route);

      dispatch(
        "forge:material3-navigation",
        Object.freeze({
          key: route.key,
          label: route.label,
          legacyTargetFound: Boolean(target),
          source: "ui-m02-shell",
        }),
      );

      if (
        target
        && target.tagName === "BUTTON"
        && typeof target.click === "function"
      ) {
        target.click();
      }

      showToast(`${route.label} · navegación preparada`);
    };

    const setAlfred = (open) => {
      if (!sheet) {
        return;
      }

      if (open) {
        previousFocus = document.activeElement;
      }

      sheet.classList.toggle("is-open", open);
      sheet.setAttribute("aria-hidden", String(!open));

      document.body.classList.toggle(
        "forge-m3-alfred-open",
        open,
      );

      if (open) {
        syncVisualViewport();
        window.setTimeout(() => {
          input?.focus({ preventScroll: true });
        }, 80);
      } else {
        input?.blur();
        document.body.classList.remove(
          "forge-m3-keyboard-open",
        );

        if (
          previousFocus
          && typeof previousFocus.focus === "function"
        ) {
          previousFocus.focus({ preventScroll: true });
        }
      }

      dispatch(
        "forge:material3-alfred",
        Object.freeze({
          open,
          productive: false,
          source: "ui-m02-shell",
        }),
      );
    };

    shell
      .querySelectorAll("[data-forge-m3-nav]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          requestNavigation(button.dataset.forgeM3Nav);
        });
      });

    shell
      .querySelector("[data-forge-m3-open-alfred]")
      ?.addEventListener("click", () => {
        setAlfred(true);
      });

    shell
      .querySelectorAll(
        "[data-forge-m3-close-alfred]",
      )
      .forEach((button) => {
        button.addEventListener("click", () => {
          setAlfred(false);
        });
      });

    shell
      .querySelectorAll(
        ".forge-m3-shell__suggestion",
      )
      .forEach((button) => {
        button.addEventListener("click", () => {
          if (input) {
            input.value = button.textContent.trim();
            input.focus({ preventScroll: true });
          }

          syncVisualViewport();
        });
      });

    shell
      .querySelector(
        "[data-forge-m3-alfred-preview-send]",
      )
      ?.addEventListener("click", () => {
        showToast(
          "Alfred productivo se conecta en una fase posterior",
        );

        dispatch(
          "forge:material3-alfred-preview",
          Object.freeze({
            prompt: input?.value || "",
            sent: false,
            persisted: false,
          }),
        );
      });

    shell
      .querySelector("[data-forge-m3-profile]")
      ?.addEventListener("click", () => {
        showToast("Perfil · integración pendiente");

        dispatch(
          "forge:material3-profile-requested",
          Object.freeze({
            productive: false,
          }),
        );
      });

    shell
      .querySelector("[data-forge-m3-legacy]")
      ?.addEventListener("click", () => {
        const url = new URL(window.location.href);
        url.searchParams.delete("forgeUi");
        window.location.assign(url);
      });

    input?.addEventListener(
      "focus",
      syncVisualViewport,
    );

    input?.addEventListener("blur", () => {
      window.setTimeout(syncVisualViewport, 120);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setAlfred(false);
      }
    });

    window.addEventListener("resize", () => {
      syncLayout();
      syncVisualViewport();
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        syncVisualViewport,
      );

      window.visualViewport.addEventListener(
        "scroll",
        syncVisualViewport,
      );
    }

    updateNavigation(activeRoute);
    syncLayout();
    syncVisualViewport();

    shell.setAttribute(
      "data-forge-m3-shell-ready",
      "true",
    );

    const api = Object.freeze({
      activeRoute: () => activeRoute,
      openAlfred: () => setAlfred(true),
      closeAlfred: () => setAlfred(false),
      navigate: requestNavigation,
      shell,
    });

    Object.defineProperty(
      window,
      "ForgeMaterial3Shell",
      {
        configurable: false,
        enumerable: true,
        value: api,
        writable: false,
      },
    );

    dispatch(
      "forge:material3-shell-ready",
      Object.freeze({
        layout: layoutMode(),
        productiveHomeReplaced: false,
        source: "ui-m02-shell",
      }),
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      mount,
      { once: true },
    );
  } else {
    mount();
  }
})();

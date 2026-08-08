const icon = name => ({
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3.5 10v10.5h6v-6h5v6h6V10L12 3Zm0 2.6 6.5 5.4v7.5h-2v-6h-9v6h-2V11L12 5.6Z"/></svg>',
  pipeline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v5H4V4Zm0 7h16v9H4v-9Zm3 3v3h4v-3H7Zm6 0v3h4v-3h-4Z"/></svg>',
  activity: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5h10V6H7v2Zm0 5h10v-2H7v2Zm0 5h7v-2H7v2Z"/></svg>',
  cartera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H4V5Zm3 1v3h10V6H7Zm0 6v2h10v-2H7Zm0 5h6v-2H7v2Z"/></svg>',
  income: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h1a1 1 0 0 1 1 1v8a3 3 0 0 1-3 3H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1v2H5a1 1 0 0 0 0 2h15V6H6v10a2 2 0 0 0 2 2h11a1 1 0 0 0 1-1v-2h-4a3 3 0 1 1 0-6h4v2h-4a1 1 0 1 0 0 2h6V9h-2V8H5A3 3 0 0 1 4 6Z"/></svg>',
  alfred: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Zm6 12 1 2.9 3 1.1-3 1-1 3-1-3-3-1 3-1.1 1-2.9ZM5 13l1.2 3.3L9.5 17.5 6.2 18.7 5 22l-1.2-3.3L.5 17.5l3.3-1.2L5 13Z"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>',
  quote: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm2 3v2h10V6H7Zm0 5v2h10v-2H7Zm0 5v2h6v-2H7Z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5v-2H7V6h3V4Zm4.6 3.6L13.2 9l2 2H9v2h6.2l-2 2 1.4 1.4L19 12l-4.4-4.4Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"/></svg>',
})[name] || "";

function initials(user) {
  const value = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Forge";
  return value.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "F";
}

function userLabel(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.given_name || user?.email || "Usuario Forge";
}

function focusable(container) {
  return [...container.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(node => !node.hidden && node.getAttribute("aria-hidden") !== "true");
}

export function createAuraShell({ root, onLogout, onNavigate } = {}) {
  if (!root) throw new Error("AURA_SHELL_ROOT_REQUIRED");
  root.innerHTML = `
    <div class="aura-shell" data-aura-shell data-forge-application data-aura-active-route="inicio">
      <header class="aura-shell__bar">
        <a class="aura-brand" href="?route=inicio" data-aura-route-link="inicio" aria-label="Forge Inicio">
          <span class="aura-brand__mark" aria-hidden="true">F</span>
          <span><strong>Forge</strong><small>Aura</small></span>
        </a>
        <nav class="aura-nav" aria-label="Navegación principal">
          <a href="?route=inicio" data-aura-route-link="inicio">${icon("home")}<span>Inicio</span></a>
          <a href="?route=pipeline" data-aura-route-link="pipeline">${icon("pipeline")}<span>Pipeline</span></a>
          <a href="?route=cartera" data-aura-route-link="cartera">${icon("cartera")}<span>Cartera</span></a>
          <a href="?route=actividad" data-aura-route-link="actividad">${icon("activity")}<span>Actividad</span></a>
          <a href="?route=comisiones" data-aura-route-link="comisiones">${icon("income")}<span>Ingresos</span></a>
        </nav>
        <div class="aura-session" data-aura-session>
          <span class="aura-session__avatar" data-aura-avatar aria-hidden="true">F</span>
          <div><strong data-aura-user-name>Sesión protegida</strong><small data-aura-user-email>Comprobando identidad</small></div>
          <button type="button" data-aura-logout aria-label="Cerrar sesión" title="Cerrar sesión">${icon("logout")}</button>
        </div>
      </header>
      <main id="aura-main" class="aura-shell__main" tabindex="-1" data-aura-main></main>
      <button class="aura-alfred-command-pill" type="button" data-aura-alfred-open data-aura-alfred-command-pill aria-label="Abrir Alfred Command OS"><span aria-hidden="true">${icon("alfred")}</span><span>Pregúntale a Alfred…</span><b aria-hidden="true">↗</b></button>
      <nav class="aura-mobile-nav" data-aura-mobile-nav aria-label="Navegación principal móvil">
        <a href="?route=inicio" data-aura-route-link="inicio">${icon("home")}<span>Inicio</span></a>
        <a href="?route=pipeline" data-aura-route-link="pipeline">${icon("pipeline")}<span>Pipeline</span></a>
        <button class="aura-mobile-nav__alfred" type="button" data-aura-alfred-open aria-label="Abrir Alfred">${icon("alfred")}<span>Alfred</span></button>
        <a href="?route=cartera" data-aura-route-link="cartera">${icon("cartera")}<span>Cartera</span></a>
        <button type="button" data-aura-more-open aria-label="Más herramientas">${icon("more")}<span>Más</span></button>
      </nav>
      <section class="aura-sheet" data-aura-more-sheet aria-hidden="true" hidden>
        <button class="aura-sheet__scrim" type="button" data-aura-sheet-close="more" aria-label="Cerrar Más"></button>
        <div class="aura-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="aura-more-title" tabindex="-1">
          <div class="aura-sheet__header"><div><p>HERRAMIENTAS</p><h2 id="aura-more-title">Más</h2></div><button type="button" data-aura-sheet-close="more" aria-label="Cerrar">${icon("close")}</button></div>
          <div class="aura-more-list">
            <button type="button" data-aura-more-route="actividad">${icon("activity")}<span><strong>Actividad</strong><small>Puntos, captura y reportes</small></span></button>
            <a href="../forge-alive/?nav=cotizaciones" data-aura-productive-link="cotizaciones">${icon("quote")}<span><strong>Cotizaciones</strong><small>Abrir motor productivo existente</small></span></a>
            <button type="button" data-aura-more-route="comisiones">${icon("income")}<span><strong>Ingresos</strong><small>Comisiones, renovaciones y bonos</small></span></button>
          </div>
        </div>
      </section>
      <section class="aura-sheet aura-alfred-sheet" data-forge-alfred-sheet aria-hidden="true" hidden aria-label="Alfred">
        <button class="aura-sheet__scrim" type="button" data-close-alfred aria-label="Cerrar Alfred"></button>
        <div class="aura-sheet__panel sheet-panel" role="dialog" aria-modal="true" aria-labelledby="alfred-title" tabindex="-1">
          <div class="aura-sheet__header alfred-sheet-header"><div><p>ALFRED · COMMAND OS</p><h2 id="alfred-title">¿Qué necesitas resolver?</h2></div><button type="button" data-close-alfred aria-label="Cerrar Alfred">${icon("close")}</button></div>
          <div class="suggestions" aria-label="Acciones sugeridas"></div>
          <label class="alfred-input"><span class="aura-visually-hidden">Escribe una instrucción para Alfred</span><input type="text" placeholder="Busca, prepara o escribe un comando…" autocomplete="off"><button type="button" aria-label="Enviar a Alfred">↑</button></label>
          <p class="aura-sheet__note">Alfred interpreta y prepara acciones dentro de contratos existentes. Tú conservas la aprobación final.</p>
        </div>
      </section>
      <div class="aura-global-state" data-aura-global-state role="status" aria-live="polite" hidden></div>
    </div>`;

  const application = root.querySelector("[data-aura-shell]");
  const main = root.querySelector("[data-aura-main]");
  const moreSheet = root.querySelector("[data-aura-more-sheet]");
  const alfredSheet = root.querySelector("[data-forge-alfred-sheet]");
  const commandPill = root.querySelector("[data-aura-alfred-command-pill]");
  const events = new AbortController();
  const { signal } = events;
  let lastFocus = null;
  let alfredAvailable = true;

  const setUser = user => {
    root.querySelector("[data-aura-avatar]").textContent = initials(user);
    root.querySelector("[data-aura-user-name]").textContent = userLabel(user);
    root.querySelector("[data-aura-user-email]").textContent = user?.email || "Identidad productiva";
    root.querySelector("[data-aura-session]").hidden = !user?.id;
  };
  const setGlobalState = (message, state = "status") => {
    const node = root.querySelector("[data-aura-global-state]");
    node.hidden = !message;
    node.textContent = message || "";
    node.dataset.state = state;
    node.setAttribute("role", state === "error" ? "alert" : "status");
  };
  const setActiveRoute = route => {
    application.dataset.auraActiveRoute = route;
    application.dataset.forgeRoute = route;
    root.querySelectorAll("[data-aura-route-link]").forEach(link => {
      const active = link.dataset.auraRouteLink === route;
      if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
    commandPill.hidden = route !== "inicio";
  };

  function setSheet(sheet, open, trigger = null) {
    if (!sheet) return;
    if (open) {
      lastFocus = trigger || document.activeElement;
      sheet.hidden = false;
      sheet.setAttribute("aria-hidden", "false");
      document.documentElement.dataset.auraSheetOpen = "true";
      queueMicrotask(() => focusable(sheet.querySelector(".aura-sheet__panel"))[0]?.focus?.() || sheet.querySelector(".aura-sheet__panel")?.focus());
    } else {
      sheet.setAttribute("aria-hidden", "true");
      sheet.hidden = true;
      if (![moreSheet, alfredSheet].some(item => item && !item.hidden)) delete document.documentElement.dataset.auraSheetOpen;
      lastFocus?.focus?.({ preventScroll: true });
      lastFocus = null;
    }
  }
  function setAlfred(open, trigger = null) {
    if (open && !alfredAvailable) { setGlobalState("Alfred no está disponible en este momento.", "error"); return; }
    setSheet(alfredSheet, open, trigger);
    if (open && !moreSheet.hidden) setSheet(moreSheet, false);
  }
  function setMore(open, trigger = null) {
    setSheet(moreSheet, open, trigger);
    if (open && !alfredSheet.hidden) setSheet(alfredSheet, false);
  }
  function setAlfredAvailability(available, message = "") {
    alfredAvailable = available !== false;
    application.dataset.auraAlfredAvailability = alfredAvailable ? "READY" : "SOURCE_UNAVAILABLE";
    root.querySelectorAll("[data-aura-alfred-open]").forEach(button => { button.toggleAttribute("aria-disabled", !alfredAvailable); button.dataset.alfredAvailable = String(alfredAvailable); });
    if (!alfredAvailable && message) setGlobalState(message, "error");
  }
  function updateViewport() {
    const viewport = globalThis.visualViewport;
    const height = viewport?.height || globalThis.innerHeight || 0;
    const offsetTop = viewport?.offsetTop || 0;
    const keyboardInset = Math.max(0, (globalThis.innerHeight || height) - height - offsetTop);
    document.documentElement.style.setProperty("--aura-visual-viewport-height", `${Math.round(height)}px`);
    document.documentElement.style.setProperty("--aura-keyboard-inset", `${Math.round(keyboardInset)}px`);
    application.dataset.auraKeyboardOpen = keyboardInset > 96 ? "true" : "false";
  }

  root.querySelector("[data-aura-logout]").addEventListener("click", () => onLogout?.(), { signal });
  root.querySelectorAll("[data-aura-route-link]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); setMore(false); setAlfred(false); onNavigate?.(link.dataset.auraRouteLink); }, { signal }));
  root.querySelectorAll("[data-aura-alfred-open]").forEach(button => button.addEventListener("click", () => setAlfred(true, button), { signal }));
  root.querySelector("[data-aura-more-open]")?.addEventListener("click", event => setMore(true, event.currentTarget), { signal });
  root.querySelectorAll('[data-aura-sheet-close="more"]').forEach(button => button.addEventListener("click", () => setMore(false), { signal }));
  root.querySelectorAll("[data-close-alfred]").forEach(button => button.addEventListener("click", () => setAlfred(false), { signal }));
  root.querySelectorAll("[data-aura-more-route]").forEach(button => button.addEventListener("click", () => { setMore(false); onNavigate?.(button.dataset.auraMoreRoute); }, { signal }));
  globalThis.addEventListener("keydown", event => {
    if (event.key === "Escape") { if (!alfredSheet.hidden) setAlfred(false); else if (!moreSheet.hidden) setMore(false); return; }
    if (event.key !== "Tab") return;
    const sheet = !alfredSheet.hidden ? alfredSheet : !moreSheet.hidden ? moreSheet : null;
    if (!sheet) return;
    const nodes = focusable(sheet.querySelector(".aura-sheet__panel"));
    if (!nodes.length) return;
    const first = nodes[0]; const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }, { signal });
  globalThis.addEventListener("forge:alfred-navigation", event => {
    const route = String(event.detail?.route || "");
    setAlfred(false);
    if (["inicio", "pipeline", "actividad", "cartera", "comisiones"].includes(route)) onNavigate?.(route);
    else if (route === "quotes" || route === "cotizaciones") globalThis.location.assign(new URL("../forge-alive/?nav=cotizaciones", globalThis.location.href).href);
    else setGlobalState("Esa ruta todavía no existe en Aura; no se abrió una pantalla falsa.", "error");
  }, { signal });
  globalThis.visualViewport?.addEventListener("resize", updateViewport, { signal });
  globalThis.visualViewport?.addEventListener("scroll", updateViewport, { signal });
  globalThis.addEventListener("resize", updateViewport, { signal });
  updateViewport();

  return Object.freeze({
    root: application,
    main,
    setUser,
    setGlobalState,
    setActiveRoute,
    setAlfred,
    setMore,
    setAlfredAvailability,
    reconcile() {},
    destroy() {
      events.abort();
      delete document.documentElement.dataset.auraSheetOpen;
      document.documentElement.style.removeProperty("--aura-visual-viewport-height");
      document.documentElement.style.removeProperty("--aura-keyboard-inset");
    },
  });
}

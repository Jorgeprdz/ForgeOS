const icon = (name) => ({
  pipeline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v5H4V4Zm0 7h16v9H4v-9Zm3 3v3h4v-3H7Zm6 0v3h4v-3h-4Z"/></svg>',
  activity: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5h10V6H7v2Zm0 5h10v-2H7v2Zm0 5h7v-2H7v2Z"/></svg>',
  cartera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H4V5Zm3 1v3h10V6H7Zm0 6v2h10v-2H7Zm0 5h6v-2H7v2Z"/></svg>',
  income: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h1a1 1 0 0 1 1 1v8a3 3 0 0 1-3 3H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1v2H5a1 1 0 0 0 0 2h15V6H6v10a2 2 0 0 0 2 2h11a1 1 0 0 0 1-1v-2h-4a3 3 0 1 1 0-6h4v2h-4a1 1 0 1 0 0 2h6V9h-2V8H5A3 3 0 0 1 4 6Z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5v-2H7V6h3V4Zm4.6 3.6L13.2 9l2 2H9v2h6.2l-2 2 1.4 1.4L19 12l-4.4-4.4Z"/></svg>'
})[name] || "";

function initials(user) {
  const value = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Forge";
  return value.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "F";
}

export function createAuraShell({ root, onLogout, onNavigate } = {}) {
  if (!root) throw new Error("AURA_SHELL_ROOT_REQUIRED");
  root.innerHTML = `
    <div class="aura-shell" data-aura-shell>
      <header class="aura-shell__bar">
        <a class="aura-brand" href="?route=pipeline" data-aura-route-link="pipeline" aria-label="Forge Pipeline">
          <span class="aura-brand__mark" aria-hidden="true">F</span>
          <span><strong>Forge</strong><small>Aura</small></span>
        </a>
        <nav class="aura-nav" aria-label="Navegación principal">
          <a href="?route=pipeline" data-aura-route-link="pipeline">${icon("pipeline")}<span>Pipeline</span></a>
          <a href="?route=actividad" data-aura-route-link="actividad">${icon("activity")}<span>Actividad</span></a>
          <a href="?route=cartera" data-aura-route-link="cartera">${icon("cartera")}<span>Cartera</span></a>
          <a href="?route=comisiones" data-aura-route-link="comisiones">${icon("income")}<span>Ingresos</span></a>
        </nav>
        <div class="aura-session" data-aura-session>
          <span class="aura-session__avatar" data-aura-avatar aria-hidden="true">F</span>
          <div><strong data-aura-user-name>Sesión protegida</strong><small data-aura-user-email>Comprobando identidad</small></div>
          <button type="button" data-aura-logout aria-label="Cerrar sesión" title="Cerrar sesión">${icon("logout")}</button>
        </div>
      </header>
      <main id="aura-main" class="aura-shell__main" tabindex="-1" data-aura-main></main>
      <div class="aura-global-state" data-aura-global-state role="status" aria-live="polite" hidden></div>
    </div>`;

  const main = root.querySelector("[data-aura-main]");
  const setUser = user => {
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Usuario Forge";
    root.querySelector("[data-aura-avatar]").textContent = initials(user);
    root.querySelector("[data-aura-user-name]").textContent = name;
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
  const setActiveRoute = route => root.querySelectorAll("[data-aura-route-link]").forEach(link => {
    const active = link.dataset.auraRouteLink === route;
    link.toggleAttribute("aria-current", active);
    if (active) link.setAttribute("aria-current", "page");
  });
  root.querySelector("[data-aura-logout]").addEventListener("click", () => onLogout?.());
  root.querySelectorAll("[data-aura-route-link]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    onNavigate?.(link.dataset.auraRouteLink);
  }));
  return Object.freeze({ root, main, setUser, setGlobalState, setActiveRoute });
}

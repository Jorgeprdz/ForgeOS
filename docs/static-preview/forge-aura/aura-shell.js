const icon = (name) => ({
  pipeline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v5H4V4Zm0 7h16v9H4v-9Zm3 3v3h4v-3H7Zm6 0v3h4v-3h-4Z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5v-2H7V6h3V4Zm4.6 3.6L13.2 9l2 2H9v2h6.2l-2 2 1.4 1.4L19 12l-4.4-4.4Z"/></svg>',
})[name] || "";

function initials(user) {
  const value = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Forge";
  return value.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "F";
}

export function createAuraShell({ root, onLogout } = {}) {
  if (!root) throw new Error("AURA_SHELL_ROOT_REQUIRED");
  root.innerHTML = `
    <div class="aura-shell" data-aura-shell>
      <header class="aura-shell__bar">
        <a class="aura-brand" href="?route=pipeline" aria-label="Forge Pipeline">
          <span class="aura-brand__mark" aria-hidden="true">F</span>
          <span><strong>Forge</strong><small>Aura</small></span>
        </a>
        <nav class="aura-nav" aria-label="Navegación principal">
          <a href="?route=pipeline" data-aura-route-link="pipeline" aria-current="page">${icon("pipeline")}<span>Pipeline</span></a>
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
  root.querySelector("[data-aura-logout]").addEventListener("click", () => onLogout?.());
  return Object.freeze({ root, main, setUser, setGlobalState });
}

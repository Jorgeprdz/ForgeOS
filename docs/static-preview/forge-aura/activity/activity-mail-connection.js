const STATE = Symbol.for("forge.aura.activity.mail-connection.001");
const PROVIDERS = Object.freeze([
  ["GMAIL", "Gmail"],
  ["MICROSOFT_GRAPH", "Outlook / Hotmail"],
]);

function ensureStyles() {
  if (document.getElementById("activity-mail-connection-styles")) return;
  const style = document.createElement("style");
  style.id = "activity-mail-connection-styles";
  style.textContent = `
    .activity-mail-connect{margin:0 0 20px;padding:18px 20px;border:1px solid var(--aura-border,#e1e6ef);border-radius:18px;background:var(--aura-surface,#fff);display:flex;justify-content:space-between;gap:18px;align-items:center}.activity-mail-connect h2{font-size:1rem;margin:0 0 4px}.activity-mail-connect p{margin:0;color:var(--aura-text-muted,#667085);font-size:.84rem;line-height:1.45}.activity-mail-connect__actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.activity-mail-connect button{min-height:44px;padding:0 13px;border:1px solid var(--aura-border,#dfe4ee);border-radius:12px;background:var(--aura-surface,#fff);color:var(--aura-text,#172033);font:inherit;font-size:.82rem;font-weight:800;cursor:pointer}.activity-mail-connect button[data-mail-scan]{background:var(--aura-accent,#7757ff);color:#fff;border-color:transparent}.activity-mail-connect button:disabled{opacity:.55;cursor:default}.activity-mail-connect button:focus-visible{outline:3px solid color-mix(in srgb,var(--aura-accent,#7757ff) 35%,transparent);outline-offset:2px}@media(max-width:720px){.activity-mail-connect{align-items:stretch;flex-direction:column}.activity-mail-connect__actions{display:grid;grid-template-columns:1fr 1fr}.activity-mail-connect button[data-mail-scan]{grid-column:1/-1}}
  `;
  document.head.append(style);
}

function render(root) {
  root.innerHTML = `
    <section class="activity-mail-connect" data-mail-connect>
      <div>
        <h2>Correo para detectar pagos</h2>
        <p data-mail-status role="status" aria-live="polite">Opcional. Forge sólo sugiere; tú confirmas la póliza pagada.</p>
      </div>
      <div class="activity-mail-connect__actions">
        ${PROVIDERS.map(([provider, label]) => `<button type="button" data-mail-provider="${provider}">Conectar ${label}</button>`).join("")}
        <button type="button" data-mail-scan disabled>Buscar pagos</button>
      </div>
    </section>`;
}

export function createActivityMailConnection({
  root,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  onSuggestionsChanged = null,
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("ACTIVITY_MAIL_CONNECTION_ROOT_REQUIRED");
  if (root[STATE]) return root[STATE];
  ensureStyles();
  render(root);
  const statusNode = root.querySelector("[data-mail-status]");
  const scanButton = root.querySelector("[data-mail-scan]");
  let client = null;
  let connected = new Set();
  let mounted = false;

  async function getClient() {
    if (client) return client;
    client = await bootstrap?.getClient?.() || null;
    return client;
  }

  async function invoke(action, provider = null) {
    const db = await getClient();
    if (!db?.functions?.invoke) throw new Error("La conexión de correo requiere una sesión productiva.");
    const body = provider ? { action, provider } : { action };
    const { data, error } = await db.functions.invoke("mail-evidence-connect", { body });
    if (error) throw error;
    if (data?.ok === false) throw new Error(data.code || "No pudimos conectar el correo.");
    return data;
  }

  function paint() {
    for (const [provider, label] of PROVIDERS) {
      const button = root.querySelector(`[data-mail-provider="${provider}"]`);
      const active = connected.has(provider);
      button.textContent = active ? `${label} conectado ✓` : `Conectar ${label}`;
      button.disabled = active;
    }
    scanButton.disabled = connected.size === 0;
  }

  async function refreshStatus() {
    try {
      const data = await invoke("STATUS");
      connected = new Set((data.connections || []).map(item => item.provider));
      paint();
      if (connected.size) {
        statusNode.textContent = `${connected.size} correo${connected.size === 1 ? "" : "s"} conectado${connected.size === 1 ? "" : "s"}. La lectura es sólo para sugerir evidencia de pago.`;
      } else {
        statusNode.textContent = "Conecta Gmail u Outlook/Hotmail para precargar sugerencias de pólizas pagadas.";
      }
    } catch {
      connected = new Set();
      paint();
      statusNode.textContent = "Puedes confirmar toda la actividad manualmente. Conectar correo es opcional.";
    }
  }

  async function start(provider) {
    statusNode.textContent = "Preparando conexión segura…";
    try {
      const data = await invoke("START", provider);
      if (!/^https:\/\//.test(String(data?.authorizeUrl || ""))) throw new Error("URL de autorización inválida.");
      window.location.assign(data.authorizeUrl);
    } catch (error) {
      statusNode.textContent = error?.message || "No pudimos iniciar la conexión.";
    }
  }

  async function scan() {
    scanButton.disabled = true;
    statusNode.textContent = "Buscando confirmaciones de pago recientes…";
    try {
      let scanned = 0;
      let suggestions = 0;
      for (const provider of connected) {
        const data = await invoke("SCAN", provider);
        scanned += Number(data?.scanned) || 0;
        suggestions += Number(data?.suggestionsRecorded) || 0;
      }
      statusNode.textContent = suggestions
        ? `Forge encontró ${suggestions} sugerencia${suggestions === 1 ? "" : "s"} de pago en ${scanned} correos revisados. Confírmalas abajo.`
        : `Revisamos ${scanned} correos y no encontramos nuevas confirmaciones de pago verificables.`;
      await onSuggestionsChanged?.();
    } catch (error) {
      statusNode.textContent = error?.message || "No pudimos revisar el correo.";
    } finally {
      scanButton.disabled = connected.size === 0;
    }
  }

  root.addEventListener("click", event => {
    const providerButton = event.target.closest("[data-mail-provider]");
    if (providerButton && !providerButton.disabled) void start(providerButton.dataset.mailProvider);
    if (event.target.closest("[data-mail-scan]")) void scan();
  });

  const api = Object.freeze({
    async mount() { mounted = true; await refreshStatus(); },
    async refresh() { if (mounted) await refreshStatus(); },
    async scrub() { connected = new Set(); client = null; paint(); },
    async destroy() { mounted = false; await api.scrub(); root.replaceChildren(); delete root[STATE]; },
  });
  root[STATE] = api;
  return api;
}

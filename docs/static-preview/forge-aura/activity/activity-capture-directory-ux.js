const STYLE_ID = "aura-activity-capture-directory-ux";
const INSTALL_KEY = Symbol.for("forge.aura.activity.capture-directory-ux.001");

function ensureStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .activity-directory-tools{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end;padding:12px;background:var(--forge-surface-subtle,#fcfcfe);border-radius:var(--forge-radius-card,16px)}
    .activity-directory-search{display:grid;gap:8px;font-weight:600}.activity-directory-search input{min-height:44px;border:1px solid var(--forge-border-default,#e1e4ec);border-radius:var(--forge-radius-input,12px);padding:0 12px;background:var(--forge-surface,#fff);color:var(--forge-text-primary,#11152b);font:inherit}
    .activity-directory-tools button{min-height:44px;white-space:nowrap}
    @media(max-width:720px){.activity-directory-tools{grid-template-columns:1fr}.activity-directory-tools button{width:100%}}
  `;
  document.head.append(style);
}

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("es-MX");
}

function filterOptions(select, query) {
  const needle = normalize(query);
  for (const option of [...select.options]) {
    if (!option.value) {
      option.hidden = false;
      continue;
    }
    option.hidden = Boolean(needle) && !normalize(option.textContent).includes(needle);
  }
  if (select.selectedOptions[0]?.hidden) select.value = "";
}

function enhanceForm(form) {
  if (!(form instanceof HTMLFormElement) || form.dataset.auraDirectoryUx === "true") return;
  const select = form.querySelector("[data-related-reference]");
  if (!(select instanceof HTMLSelectElement)) return;
  const relatedLabel = select.closest("label");
  if (!relatedLabel) return;

  const tools = document.createElement("div");
  tools.className = "activity-directory-tools";
  tools.dataset.relatedDirectoryTools = "true";
  tools.innerHTML = `
    <label class="activity-directory-search">
      Buscar persona o prospecto
      <input type="search" autocomplete="off" placeholder="Escribe un nombre" data-related-search>
    </label>
    <button type="button" class="aura-secondary" data-related-retry>Recargar lista</button>`;
  relatedLabel.after(tools);
  form.dataset.auraDirectoryUx = "true";

  const search = tools.querySelector("[data-related-search]");
  search.addEventListener("input", () => filterOptions(select, search.value));

  tools.querySelector("[data-related-retry]").addEventListener("click", () => {
    const activity = form.closest("[data-activity-aura]");
    const dialog = form.closest("dialog");
    const launcher = activity?.querySelector("[data-capture-host] [data-open-manual-activity]");
    if (!dialog || !launcher) return;

    search.value = "";
    select.removeAttribute("data-loaded");
    select.replaceChildren(new Option("Selecciona una persona o prospecto", ""));
    const status = form.querySelector("[data-manual-activity-status]");
    if (status) status.textContent = "Volviendo a cargar personas y prospectos…";
    dialog.close();
    launcher.click();
  });
}

function scan(root = document) {
  root.querySelectorAll?.("[data-activity-aura] [data-manual-activity-form]").forEach(enhanceForm);
}

export function installActivityCaptureDirectoryUx() {
  if (typeof document === "undefined" || document[INSTALL_KEY]) return document?.[INSTALL_KEY] || null;
  ensureStyles();
  scan(document);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.("[data-manual-activity-form]")) enhanceForm(node);
        scan(node);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  const api = Object.freeze({
    scan: () => scan(document),
    disconnect: () => observer.disconnect(),
  });
  document[INSTALL_KEY] = api;
  return api;
}

if (typeof document !== "undefined") installActivityCaptureDirectoryUx();

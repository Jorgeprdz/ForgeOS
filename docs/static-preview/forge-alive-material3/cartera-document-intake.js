const ROOT_SELECTOR = "[data-forge-cartera-module]";
const PANEL_SELECTOR = "[data-cartera-document-intake]";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/cartera-pdf-intake`;
const MAX_BYTES = 8 * 1024 * 1024;
let generation = 0;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function ensureStyles() {
  if (document.querySelector("[data-cartera-document-intake-styles]")) return;
  const style = document.createElement("style");
  style.dataset.carteraDocumentIntakeStyles = "true";
  style.textContent = `
    .cartera-document-intake{margin:0 0 18px;padding:18px;border:1px solid rgba(170,199,255,.18);border-radius:20px;background:rgba(12,28,50,.72);color:#f5f2ff}.cartera-document-intake h2,.cartera-document-intake p{margin:0}.cartera-document-dropzone{display:grid;place-items:center;gap:8px;min-height:150px;margin-top:14px;padding:22px;border:1px dashed rgba(82,230,223,.45);border-radius:16px;background:rgba(82,230,223,.05);text-align:center}.cartera-document-dropzone[data-drag-active=true]{background:rgba(82,230,223,.14)}.cartera-document-dropzone button{min-height:42px;padding:9px 14px;border:1px solid rgba(82,230,223,.35);border-radius:12px;background:rgba(82,230,223,.14);color:#9ef2ed;font:inherit;font-weight:800;cursor:pointer}.cartera-document-intake input[type=file]{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.cartera-document-state{margin-top:12px!important}.cartera-document-error{margin-top:10px!important;color:#ffb4ab}.cartera-document-review{margin-top:16px;overflow-x:auto}.cartera-document-review table{width:100%;border-collapse:collapse}.cartera-document-review th,.cartera-document-review td{padding:10px;border-bottom:1px solid rgba(170,199,255,.12);text-align:left}.cartera-document-review footer{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}.cartera-document-review button{min-height:42px;padding:9px 14px;border:1px solid rgba(170,199,255,.2);border-radius:12px;background:rgba(255,255,255,.06);color:inherit;font:inherit}.cartera-document-review [data-confirm-cartera-staging]{opacity:.55;cursor:not-allowed}@media(max-width:640px){.cartera-document-intake{margin-bottom:calc(18px + env(safe-area-inset-bottom))}.cartera-document-dropzone{min-height:110px}.cartera-document-dropzone [data-desktop-drop-copy]{display:none}.cartera-document-review footer{display:grid;grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunk, bytes.length)));
  }
  return btoa(binary);
}

async function sessionHeaders() {
  const session = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getSession?.();
  const accessToken = session?.data?.session?.access_token;
  if (!accessToken) throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  const anonKey = globalThis.__ENV__?.SUPABASE_ANON_KEY || globalThis.ForgeAlivePublicConfig067G17A1?.supabaseAnonKey;
  return { Authorization: `Bearer ${accessToken}`, apikey: anonKey || accessToken, "Content-Type": "application/json" };
}

function renderReview(panel, payload) {
  const review = panel.querySelector("[data-cartera-document-review]");
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  review.innerHTML = `
    <h3>Revisión requerida</h3>
    <p>${candidates.length} registro${candidates.length === 1 ? "" : "s"} extraído${candidates.length === 1 ? "" : "s"}. Nada se guardó automáticamente.</p>
    <table><thead><tr><th>Persona</th><th>Póliza</th><th>Producto</th><th>Vigencia</th></tr></thead><tbody>${candidates.slice(0, 100).map(item => `<tr><td>${escapeHtml(item.person || "—")}</td><td>${escapeHtml(item.policyNumber || "—")}</td><td>${escapeHtml(item.product || "—")}</td><td>${escapeHtml(item.expirationDate || item.effectiveDate || "—")}</td></tr>`).join("") || '<tr><td colspan="4">No se encontraron datos estructurados. Conserva el PDF para revisión manual.</td></tr>'}</tbody></table>
    <footer><button type="button" data-discard-cartera-staging>Descartar</button><button type="button" data-confirm-cartera-staging disabled title="La persistencia gobernada se habilita cuando exista conciliación confirmada">Confirmar incorporación</button></footer>`;
  review.hidden = false;
  panel.dataset.intakeState = "review";
  panel.dataset.intakeId = payload?.intakeId || "";
  review.querySelector("[data-discard-cartera-staging]")?.addEventListener("click", () => {
    review.replaceChildren();
    review.hidden = true;
    panel.querySelector("[data-cartera-document-state]").textContent = "Carga descartada. La cartera no fue modificada.";
    panel.dataset.intakeState = "idle";
  });
}

async function processFile(panel, file) {
  const currentGeneration = ++generation;
  const state = panel.querySelector("[data-cartera-document-state]");
  const errorNode = panel.querySelector("[data-cartera-document-error]");
  const review = panel.querySelector("[data-cartera-document-review]");
  errorNode.hidden = true;
  review.hidden = true;
  review.replaceChildren();

  if (!file || file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    errorNode.textContent = "Selecciona un archivo PDF válido.";
    errorNode.hidden = false;
    return;
  }
  if (file.size > MAX_BYTES) {
    errorNode.textContent = "El PDF supera el límite de 8 MB.";
    errorNode.hidden = false;
    return;
  }

  panel.dataset.intakeState = "processing";
  state.textContent = "Cargando y extrayendo el PDF…";
  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: await sessionHeaders(),
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        base64: arrayBufferToBase64(await file.arrayBuffer()),
      }),
    });
    const payload = await response.json();
    if (currentGeneration !== generation || !panel.isConnected) return;
    if (!response.ok || payload?.ok !== true) throw new Error(payload?.message || payload?.error || "No pudimos procesar el PDF.");
    state.textContent = `PDF procesado: ${file.name}`;
    renderReview(panel, payload);
  } catch (error) {
    if (currentGeneration !== generation || !panel.isConnected) return;
    panel.dataset.intakeState = "error";
    state.textContent = "La carga no se completó.";
    errorNode.textContent = error.message || "No pudimos procesar el PDF.";
    errorNode.hidden = false;
  }
}

function mount(root) {
  if (root.querySelector(PANEL_SELECTOR)) return;
  const frame = root.querySelector("[data-cartera-material3-frame]");
  if (!frame || root.dataset.carteraMaterial3State !== "ready") return;
  const panel = document.createElement("section");
  panel.className = "cartera-document-intake";
  panel.dataset.carteraDocumentIntake = "true";
  panel.dataset.intakeState = "idle";
  panel.innerHTML = `
    <header><p class="section-kicker accent">INGESTIÓN DOCUMENTAL</p><h2>Subir cartera en PDF</h2><p>Extraemos datos a una revisión temporal. Nada se incorpora sin confirmación.</p></header>
    <label class="cartera-document-dropzone" data-cartera-document-dropzone tabindex="0">
      <strong><span data-desktop-drop-copy>Arrastra aquí el PDF o </span>selecciona un archivo</strong>
      <button type="button" data-select-cartera-pdf>Seleccionar PDF</button>
      <input type="file" accept="application/pdf,.pdf" data-cartera-pdf-input>
    </label>
    <p class="cartera-document-state" data-cartera-document-state role="status">Ningún archivo seleccionado.</p>
    <p class="cartera-document-error" data-cartera-document-error role="alert" hidden></p>
    <section class="cartera-document-review" data-cartera-document-review hidden></section>`;
  frame.prepend(panel);

  const input = panel.querySelector("[data-cartera-pdf-input]");
  const dropzone = panel.querySelector("[data-cartera-document-dropzone]");
  panel.querySelector("[data-select-cartera-pdf]").addEventListener("click", () => input.click());
  input.addEventListener("change", () => processFile(panel, input.files?.[0]));
  for (const eventName of ["dragenter", "dragover"]) {
    dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.dataset.dragActive = "true"; });
  }
  for (const eventName of ["dragleave", "drop"]) {
    dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.dataset.dragActive = "false"; });
  }
  dropzone.addEventListener("drop", event => processFile(panel, event.dataTransfer?.files?.[0]));
}

function boot() {
  ensureStyles();
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;
  mount(root);
  const observer = new MutationObserver(() => mount(root));
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-cartera-material3-state"] });
  globalThis.addEventListener("forge:auth-state-changed", event => {
    if (event.detail?.status === "anonymous") generation += 1;
  });
  globalThis.addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();

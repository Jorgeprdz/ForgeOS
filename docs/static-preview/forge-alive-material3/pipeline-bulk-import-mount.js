import {
  parseCsv,
  mapRows,
  detectPlan200,
  reconcileDuplicates,
} from "../../../advisor-os/contact-books/bulk-import-engine.js";

const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const BUTTON_SELECTOR = "[data-pipeline-bulk-import]";
const LAYER_SELECTOR = "[data-pipeline-bulk-import-layer]";
const ACCEPTED_EXTENSIONS = ["csv", "xlsx"];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function extension(file) {
  return String(file?.name || "").split(".").pop().toLowerCase();
}

function ensureStyles() {
  if (document.querySelector("[data-pipeline-bulk-import-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("./pipeline-bulk-import-mount.css?v=beta1-repair-001", import.meta.url).href;
  link.dataset.pipelineBulkImportStyles = "true";
  document.head.append(link);
}

function closeLayer() {
  document.querySelector(LAYER_SELECTOR)?.remove();
  document.documentElement.removeAttribute("data-pipeline-bulk-import-open");
}

function renderRows(rows) {
  return rows.slice(0, 8).map(contact => `
    <tr>
      <td>${escapeHtml(contact.displayName || "Sin nombre")}</td>
      <td>${escapeHtml(contact.phone || "—")}</td>
      <td>${escapeHtml(contact.email || "—")}</td>
    </tr>`).join("");
}

async function inspectFile(file, stateNode, previewNode, confirmButton) {
  const ext = extension(file);
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    throw Object.assign(new Error("Sólo se aceptan archivos CSV o XLSX."), { code: "FILE_TYPE_INVALID" });
  }

  if (ext === "xlsx") {
    const decoder = globalThis.ForgeSafeWorkbookDecoder;
    if (!decoder?.decode) {
      throw Object.assign(
        new Error("La lectura XLSX todavía no está conectada en este despliegue. Convierte el archivo a CSV para continuar sin perder datos."),
        { code: "SAFE_WORKBOOK_DECODER_REQUIRED" },
      );
    }
  }

  let rows;
  let sheetNames = [];
  if (ext === "csv") {
    rows = parseCsv(await file.text());
  } else {
    const workbook = await globalThis.ForgeSafeWorkbookDecoder.decode(file);
    sheetNames = workbook.sheetNames || [];
    rows = workbook.readSheet(sheetNames.includes("Captura") ? "Captura" : sheetNames[0]);
  }

  const mapped = mapRows(rows);
  const detection = detectPlan200({
    fileName: file.name,
    sheetNames,
    headers: mapped.headers,
  });
  const prepared = reconcileDuplicates(mapped.contacts, []);

  stateNode.textContent = detection.detected
    ? `Proyecto 200 detectado · ${mapped.contacts.length} contactos válidos.`
    : `${mapped.contacts.length} contactos válidos · ${mapped.invalidRows.length} filas omitidas.`;
  previewNode.innerHTML = `
    <div class="pipeline-bulk-import__summary">
      <strong>${detection.detected ? "Destino: Proyecto 200" : "Importación genérica"}</strong>
      <span>${mapped.contacts.length} contactos listos para revisión</span>
    </div>
    <div class="pipeline-bulk-import__table-wrap">
      <table>
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th></tr></thead>
        <tbody>${renderRows(mapped.contacts)}</tbody>
      </table>
    </div>`;

  confirmButton.disabled = false;
  confirmButton.dataset.fileName = file.name;
  confirmButton.__forgePreparedImport = Object.freeze({
    file,
    fileType: ext.toUpperCase(),
    detectedTemplate: detection.template,
    contacts: mapped.contacts,
    prepared,
    invalidRows: mapped.invalidRows,
  });
}

function openLayer(trigger) {
  closeLayer();
  const layer = document.createElement("div");
  layer.dataset.pipelineBulkImportLayer = "true";
  layer.className = "pipeline-bulk-import-layer";
  layer.innerHTML = `
    <button class="pipeline-bulk-import__scrim" type="button" data-close-bulk-import aria-label="Cerrar"></button>
    <section class="pipeline-bulk-import" role="dialog" aria-modal="true" aria-labelledby="pipeline-bulk-import-title">
      <header>
        <div><p>PIPELINE</p><h2 id="pipeline-bulk-import-title">Carga masiva</h2></div>
        <button type="button" data-close-bulk-import aria-label="Cerrar">×</button>
      </header>
      <div class="pipeline-bulk-import__body">
        <label class="pipeline-bulk-import__picker">
          <span>Selecciona Proyecto 200, CSV o XLSX</span>
          <input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-bulk-import-file>
        </label>
        <p data-bulk-import-state role="status">Ningún archivo seleccionado.</p>
        <div data-bulk-import-preview></div>
        <p class="pipeline-bulk-import__error" data-bulk-import-error role="alert" hidden></p>
      </div>
      <footer>
        <button type="button" data-close-bulk-import>Cancelar</button>
        <button type="button" data-confirm-bulk-import disabled>Confirmar importación</button>
      </footer>
    </section>`;

  const fileInput = layer.querySelector("[data-bulk-import-file]");
  const stateNode = layer.querySelector("[data-bulk-import-state]");
  const previewNode = layer.querySelector("[data-bulk-import-preview]");
  const errorNode = layer.querySelector("[data-bulk-import-error]");
  const confirmButton = layer.querySelector("[data-confirm-bulk-import]");

  layer.addEventListener("click", event => {
    if (event.target.closest("[data-close-bulk-import]")) {
      closeLayer();
      trigger?.focus();
    }
  });

  fileInput.addEventListener("change", async () => {
    errorNode.hidden = true;
    previewNode.replaceChildren();
    confirmButton.disabled = true;
    const [file] = fileInput.files || [];
    if (!file) return;
    stateNode.textContent = "Revisando archivo…";
    try {
      await inspectFile(file, stateNode, previewNode, confirmButton);
    } catch (error) {
      stateNode.textContent = "No pudimos preparar el archivo.";
      errorNode.textContent = error.message || "El archivo no pudo leerse.";
      errorNode.hidden = false;
    }
  });

  confirmButton.addEventListener("click", async () => {
    const payload = confirmButton.__forgePreparedImport;
    if (!payload) return;
    const authority = globalThis.ForgeBulkImportProductiveAuthority;
    if (!authority?.importPrepared) {
      errorNode.textContent = "La vista previa funciona, pero el adaptador productivo de persistencia todavía no está conectado. No se guardó ningún contacto.";
      errorNode.hidden = false;
      return;
    }
    confirmButton.disabled = true;
    confirmButton.setAttribute("aria-busy", "true");
    try {
      const receipt = await authority.importPrepared(payload);
      stateNode.textContent = `Importación completada: ${receipt?.createdPeople ?? payload.contacts.length} contactos procesados.`;
      previewNode.dataset.importCompleted = "true";
      globalThis.dispatchEvent(new CustomEvent("forge:pipeline-bulk-import-completed", { detail: receipt || {} }));
    } catch (error) {
      errorNode.textContent = error?.message || "La importación no pudo completarse.";
      errorNode.hidden = false;
      confirmButton.disabled = false;
    } finally {
      confirmButton.removeAttribute("aria-busy");
    }
  });

  document.body.append(layer);
  document.documentElement.dataset.pipelineBulkImportOpen = "true";
  fileInput.focus();
}

function mount(root) {
  const header = root.querySelector(".pipeline-module__header");
  if (!header || root.querySelector(BUTTON_SELECTOR)) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pipeline-module__bulk-import";
  button.dataset.pipelineBulkImport = "true";
  button.textContent = "Carga masiva";
  button.addEventListener("click", () => openLayer(button));
  header.append(button);
  root.dataset.pipelineBulkImportMounted = "true";
}

function boot() {
  ensureStyles();
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;
  mount(root);
  const observer = new MutationObserver(() => mount(root));
  observer.observe(root, { childList: true, subtree: true });
  globalThis.addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();

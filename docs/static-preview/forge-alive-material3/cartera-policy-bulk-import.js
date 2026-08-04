const ACCEPTED = new Set(["csv", "xlsx"]);
const MAX_ROWS = 500;
let workbookDecoderPromise = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function normalized(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function extension(file) {
  return String(file?.name || "").split(".").pop().toLowerCase();
}

function nonNegativeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function policyStatus(value) {
  const source = normalized(value);
  if (/emitida|issued/.test(source)) return "ISSUED";
  if (/pendiente|pending/.test(source)) return "PENDING";
  if (/suspendida|suspended/.test(source)) return "SUSPENDED";
  if (/vencida|lapsed|caida/.test(source)) return "LAPSED";
  if (/cancelada|cancelled/.test(source)) return "CANCELLED";
  return "ACTIVE";
}

function paymentFrequency(value) {
  const source = normalized(value);
  if (/trimestral|quarter/.test(source)) return "QUARTERLY";
  if (/semestral|semiannual/.test(source)) return "SEMIANNUAL";
  if (/anual|annual/.test(source)) return "ANNUAL";
  if (/unico|single/.test(source)) return "SINGLE";
  return "MONTHLY";
}

function parseCsv(text) {
  const source = String(text || "").replace(/^\uFEFF/, "");
  const first = source.split(/\r?\n/, 1)[0] || "";
  const delimiter = (first.match(/;/g)?.length || 0) > (first.match(/,/g)?.length || 0) ? ";" : ",";
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"' && quoted && source[index + 1] === '"') { cell += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === delimiter && !quoted) { row.push(cell); cell = ""; continue; }
    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some(value => String(value).trim())) rows.push(row);
      row = []; cell = ""; continue;
    }
    cell += character;
  }
  if (quoted) throw new Error("El CSV contiene una comilla sin cerrar.");
  row.push(cell); if (row.some(value => String(value).trim())) rows.push(row);
  return rows;
}

async function workbookRows(file) {
  workbookDecoderPromise ||= import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm")
    .catch(error => { workbookDecoderPromise = null; throw error; });
  const XLSX = await workbookDecoderPromise;
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array", cellDates: false, cellFormula: false,
  });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("El libro XLSX no contiene hojas legibles.");
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
}

const ALIASES = Object.freeze({
  holderName: ["titular", "persona", "cliente", "nombre", "nombre completo"],
  policyNumber: ["poliza", "numero de poliza", "numero poliza", "policy number"],
  carrierLabel: ["aseguradora", "compania", "carrier"],
  productLabel: ["producto", "plan", "product"],
  status: ["estado", "estatus", "status"],
  issueDate: ["fecha emision", "emision"],
  effectiveDate: ["inicio vigencia", "vigencia inicio", "effective date"],
  expirationDate: ["fin vigencia", "vencimiento", "expiration date"],
  currency: ["moneda", "currency"],
  premiumAmount: ["prima", "premium"],
  paymentFrequency: ["periodicidad", "frecuencia", "payment frequency"],
  sumInsured: ["suma asegurada", "sum insured"],
});

function mapRows(rows, fileName) {
  if (!Array.isArray(rows) || rows.length < 2) return [];
  const headers = rows[0].map(normalized);
  const indexes = Object.fromEntries(Object.entries(ALIASES).map(([key, aliases]) => [
    key, headers.findIndex(header => aliases.includes(header)),
  ]));
  const value = (row, key) => indexes[key] >= 0 ? String(row[indexes[key]] || "").trim() : "";
  const seen = new Set();
  return rows.slice(1, MAX_ROWS + 1).map((row, offset) => {
    const policyNumber = value(row, "policyNumber");
    const carrierLabel = value(row, "carrierLabel") || "Seguros Monterrey New York Life";
    const productLabel = value(row, "productLabel");
    const holderName = value(row, "holderName");
    const duplicateKey = `${normalized(carrierLabel)}:${normalized(policyNumber)}`;
    const duplicate = Boolean(policyNumber && seen.has(duplicateKey));
    if (policyNumber) seen.add(duplicateKey);
    const errors = [];
    if (!holderName) errors.push("Titular requerido");
    if (!policyNumber) errors.push("Número de póliza requerido");
    if (!productLabel) errors.push("Producto requerido");
    if (duplicate) errors.push("Posible duplicado dentro del archivo");
    return {
      row: offset + 2,
      state: duplicate ? "DUPLICATE_SUSPECTED" : errors.length ? "INVALID" : "READY_TO_IMPORT",
      errors,
      draft: {
        draftId: `bulk-${crypto.randomUUID?.() || Date.now()}-${offset}`,
        inputMode: "bulk",
        fileName,
        personMode: "new",
        existingPersonReference: "",
        holderName,
        policyNumber,
        carrierLabel,
        productLabel,
        status: policyStatus(value(row, "status")),
        issueDate: value(row, "issueDate") || null,
        effectiveDate: value(row, "effectiveDate") || null,
        expirationDate: value(row, "expirationDate") || null,
        currency: value(row, "currency") || "MXN",
        premiumAmount: nonNegativeNumber(value(row, "premiumAmount")),
        paymentFrequency: paymentFrequency(value(row, "paymentFrequency")),
        sumInsured: nonNegativeNumber(value(row, "sumInsured")),
      },
    };
  });
}

function renderPreview(dialog, records) {
  const ready = records.filter(record => record.state === "READY_TO_IMPORT").length;
  const invalid = records.filter(record => record.state === "INVALID").length;
  const duplicate = records.filter(record => record.state === "DUPLICATE_SUSPECTED").length;
  dialog.querySelector("[data-policy-bulk-summary]").textContent = `${ready} listas · ${invalid} inválidas · ${duplicate} duplicados sospechosos`;
  dialog.querySelector("[data-policy-bulk-rows]").innerHTML = records.slice(0, 100).map(record => `
    <tr data-policy-import-state="${record.state}">
      <td>${record.row}</td><td>${escapeHtml(record.draft.holderName || "—")}</td>
      <td>${escapeHtml(record.draft.policyNumber || "—")}</td><td>${escapeHtml(record.draft.productLabel || "—")}</td>
      <td><strong>${record.state}</strong>${record.errors.length ? `<small>${escapeHtml(record.errors.join(" · "))}</small>` : ""}</td>
    </tr>`).join("");
  const confirm = dialog.querySelector("[data-confirm-policy-bulk]");
  confirm.disabled = ready === 0;
  confirm.__records = records;
}

export function mountPolicyBulkImport(panel, { persistDraft } = {}) {
  if (!panel || panel.dataset.policyBulkBound === "true") return;
  if (typeof persistDraft !== "function") throw new TypeError("POLICY_BULK_PERSIST_AUTHORITY_REQUIRED");
  panel.dataset.policyBulkBound = "true";
  let generation = 0;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  input.dataset.carteraPolicyBulkInput = "true";
  input.hidden = true;
  panel.append(input);

  const dialog = document.createElement("dialog");
  dialog.className = "cartera-policy-dialog cartera-policy-bulk-dialog";
  dialog.dataset.carteraPolicyBulkDialog = "true";
  dialog.innerHTML = `
    <header class="cartera-policy-dialog__header"><div><p class="section-kicker accent">IMPORTACIÓN GOBERNADA</p><h3>Revisar carga masiva</h3><p data-policy-bulk-summary>Ningún archivo preparado.</p></div><button type="button" data-close-policy-bulk aria-label="Cerrar">×</button></header>
    <div class="cartera-policy-dialog__body"><p class="cartera-policy-dialog__notice">Sólo se importan filas válidas después de tu confirmación. Los duplicados sospechosos permanecen bloqueados.</p><div class="cartera-policy-bulk-table"><table><thead><tr><th>Fila</th><th>Titular</th><th>Póliza</th><th>Producto</th><th>Estado</th></tr></thead><tbody data-policy-bulk-rows></tbody></table></div><p data-policy-bulk-progress role="status"></p><p class="cartera-policy-entry__error" data-policy-bulk-error role="alert" hidden></p></div>
    <footer class="cartera-policy-dialog__footer"><button type="button" data-close-policy-bulk>Cancelar</button><button type="button" data-confirm-policy-bulk disabled>Confirmar válidas</button></footer>`;
  panel.append(dialog);
  dialog.querySelectorAll("[data-close-policy-bulk]").forEach(button => button.addEventListener("click", () => dialog.close()));

  async function processFile(file) {
    if (!file) return;
    const selectedGeneration = ++generation;
    const ext = extension(file);
    const errorNode = dialog.querySelector("[data-policy-bulk-error]");
    errorNode.hidden = true;
    dialog.querySelector("[data-policy-bulk-summary]").textContent = "READING · validando archivo…";
    dialog.showModal();
    try {
      if (!ACCEPTED.has(ext)) throw new Error("Selecciona CSV o XLSX.");
      const rows = ext === "csv" ? parseCsv(await file.text()) : await workbookRows(file);
      if (selectedGeneration !== generation || !dialog.open) return;
      renderPreview(dialog, mapRows(rows, file.name));
    } catch (error) {
      errorNode.textContent = error?.message || "El archivo no pudo leerse.";
      errorNode.hidden = false;
      dialog.querySelector("[data-policy-bulk-summary]").textContent = "FAILED";
    } finally { input.value = ""; }
  }

  panel.querySelector("[data-select-policy-bulk]")?.addEventListener("click", () => input.click());
  input.addEventListener("change", () => processFile(input.files?.[0]));

  dialog.querySelector("[data-confirm-policy-bulk]").addEventListener("click", async event => {
    const button = event.currentTarget;
    if (button.disabled) return;
    const selectedGeneration = ++generation;
    const records = button.__records || [];
    const ready = records.filter(record => record.state === "READY_TO_IMPORT");
    const progress = dialog.querySelector("[data-policy-bulk-progress]");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    let imported = 0;
    for (const [index, record] of ready.entries()) {
      if (selectedGeneration !== generation || !dialog.open) break;
      record.state = "IMPORTING";
      progress.textContent = `IMPORTING · ${index + 1} de ${ready.length}`;
      try {
        record.policyReference = await persistDraft(record.draft);
        record.state = "IMPORTED";
        imported += 1;
      } catch (error) {
        record.state = "FAILED";
        record.errors = [error?.message || "IMPORT_FAILED"];
      }
      renderPreview(dialog, records);
    }
    const failed = ready.length - imported;
    progress.textContent = failed
      ? `PARTIALLY_IMPORTED · ${imported} importadas · ${failed} fallidas`
      : `IMPORTED · ${imported} pólizas confirmadas`;
    button.removeAttribute("aria-busy");
    button.textContent = failed ? "Reintentar fallidas" : "Importación completada";
    button.disabled = failed === 0;
    if (failed) {
      button.__records = records.map(record => record.state === "FAILED"
        ? { ...record, state: "READY_TO_IMPORT" }
        : record);
    }
    globalThis.dispatchEvent(new CustomEvent("forge:cartera-policy-bulk-completed", {
      detail: Object.freeze({ imported, failed, total: ready.length, status: failed ? "PARTIALLY_IMPORTED" : "IMPORTED" }),
    }));
  });

  globalThis.addEventListener("forge:auth-state-changed", event => {
    if (event.detail?.status !== "authenticated") {
      generation += 1;
      dialog.close();
      input.value = "";
    }
  });
  return Object.freeze({
    select: () => input.click(),
    processFile,
    cancel: () => { generation += 1; dialog.close(); input.value = ""; },
  });
}

export { parseCsv, mapRows };

const ROOT_SELECTOR = "[data-forge-cartera-module]";
const PANEL_SELECTOR = "[data-cartera-policy-entry]";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const PDF_FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/cartera-pdf-intake`;
const MAX_PDF_BYTES = 8 * 1024 * 1024;
const SOURCE_LAYOUT = import.meta.url.includes("/docs/static-preview/");
const VALIDATOR_URL = new URL(
  SOURCE_LAYOUT
    ? "../../../platform/shared-commercial-model/cartera-010b-contract-validator.js"
    : "../../platform/shared-commercial-model/cartera-010b-contract-validator.js",
  import.meta.url,
).href;

let validatorPromise = null;
let activeGeneration = 0;
let activePdfController = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function uid() {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function opaqueReference(prefix, value, fallback) {
  const existing = String(value || "").trim();
  if (/^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/.test(existing) && existing.includes(":")) {
    return existing;
  }
  const token = normalizeText(existing).replace(/\s+/g, "-").slice(0, 100) || fallback;
  return `${prefix}:${token}`;
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function dateInput(value) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function statusFrom(value) {
  const text = normalizeText(value);
  if (/emitida|issued/.test(text)) return "ISSUED";
  if (/pendiente|pending/.test(text)) return "PENDING";
  if (/suspendida|suspended/.test(text)) return "SUSPENDED";
  if (/vencida|lapsed|caida/.test(text)) return "LAPSED";
  if (/cancelada|cancelled/.test(text)) return "CANCELLED";
  if (/madur|matured|finalizada/.test(text)) return "MATURED";
  if (/reclamacion|claimed|siniestro/.test(text)) return "CLAIMED";
  return "ACTIVE";
}

function demoSession() {
  return document.documentElement.dataset.forgeDemoSession === "active";
}

async function digest(value) {
  const bytes = value instanceof ArrayBuffer
    ? value
    : new TextEncoder().encode(typeof value === "string" ? value : JSON.stringify(value)).buffer;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map(number => number.toString(16).padStart(2, "0"))
    .join("");
}

async function productiveContext() {
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  if (typeof bootstrap?.getClient !== "function" || typeof bootstrap?.getUser !== "function") {
    throw new Error("La sesión productiva todavía no está lista.");
  }
  const userResult = await bootstrap.getUser();
  const user = userResult?.data?.user;
  if (!user?.id) throw new Error("Inicia sesión para agregar pólizas.");
  return { user, client: await bootstrap.getClient() };
}

async function loadValidator() {
  if (globalThis.ForgeCartera010BContractValidator) {
    return globalThis.ForgeCartera010BContractValidator;
  }
  validatorPromise ||= import(VALIDATOR_URL).then(() => {
    const validator = globalThis.ForgeCartera010BContractValidator;
    if (!validator?.buildIdentityResolutionCommand || !validator?.buildConfirmedPolicyCommand) {
      throw new Error("La autoridad de alta de pólizas no está disponible.");
    }
    return validator;
  });
  return validatorPromise;
}

function ensureStyles() {
  if (document.querySelector("[data-cartera-policy-entry-styles]")) return;
  const style = document.createElement("style");
  style.dataset.carteraPolicyEntryStyles = "true";
  style.textContent = `
    .cartera-policy-entry{margin:0 0 18px;padding:18px;border:1px solid rgba(170,199,255,.18);border-radius:20px;background:linear-gradient(145deg,rgba(12,28,50,.94),rgba(17,43,70,.8));color:#f6f3ff;box-shadow:0 18px 42px rgba(0,0,0,.18)}
    .cartera-policy-entry *{box-sizing:border-box}.cartera-policy-entry h2,.cartera-policy-entry p{margin:0}.cartera-policy-entry__top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.cartera-policy-entry__top h2{margin-top:4px;font-size:clamp(1.3rem,2vw,1.75rem)}.cartera-policy-entry__top p:last-child{margin-top:7px;color:#b9c7db;font-size:13px;line-height:1.45}.cartera-policy-entry__actions{display:flex;gap:9px;flex-wrap:wrap}
    .cartera-policy-entry button{min-height:44px;padding:10px 14px;border:1px solid rgba(170,199,255,.24);border-radius:13px;background:rgba(255,255,255,.07);color:inherit;font:800 13px/1.1 Inter,system-ui,sans-serif;cursor:pointer}.cartera-policy-entry button[data-primary]{border-color:rgba(82,230,223,.46);background:linear-gradient(135deg,rgba(82,230,223,.2),rgba(80,130,255,.2));color:#c0fffa}.cartera-policy-entry button:disabled{opacity:.48;cursor:not-allowed}
    .cartera-policy-entry__drop{display:grid;place-items:center;gap:7px;min-height:128px;margin-top:16px;padding:20px;border:1px dashed rgba(82,230,223,.48);border-radius:16px;background:rgba(82,230,223,.045);text-align:center;cursor:pointer}.cartera-policy-entry__drop[data-drag-active=true]{border-style:solid;background:rgba(82,230,223,.14)}.cartera-policy-entry__drop span{color:#aabbd0;font-size:12px}.cartera-policy-entry input[type=file]{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.cartera-policy-entry__status{margin-top:11px!important;color:#bac8db;font-size:12px}.cartera-policy-entry__error{margin-top:8px!important;color:#ffb4ab;font-size:12px}.cartera-policy-entry__demo{margin-top:11px;padding:10px 12px;border-radius:12px;background:rgba(242,201,76,.12);color:#ffe69a;font-size:12px;font-weight:750}
    .cartera-policy-dialog{width:min(760px,calc(100vw - 28px));max-height:88dvh;padding:0;border:1px solid rgba(170,199,255,.22);border-radius:24px;background:#0b192d;color:#f7f4ff;box-shadow:0 28px 90px rgba(0,0,0,.58)}.cartera-policy-dialog::backdrop{background:rgba(2,8,18,.78);backdrop-filter:blur(10px)}.cartera-policy-dialog__header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;gap:14px;padding:19px;border-bottom:1px solid rgba(170,199,255,.14);background:rgba(11,25,45,.97)}.cartera-policy-dialog__header h3{margin:4px 0 0;font-size:1.45rem}.cartera-policy-dialog__header p{margin:7px 0 0;color:#aebbd0;font-size:12px}.cartera-policy-dialog form{margin:0}.cartera-policy-dialog__body{display:grid;gap:16px;padding:19px}.cartera-policy-dialog fieldset{display:grid;gap:12px;margin:0;padding:15px;border:1px solid rgba(170,199,255,.14);border-radius:17px}.cartera-policy-dialog legend{padding:0 7px;color:#92efe9;font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.cartera-policy-dialog__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.cartera-policy-dialog label{display:grid;gap:6px;color:#c0ccdc;font-size:11px;font-weight:800}.cartera-policy-dialog input,.cartera-policy-dialog select{width:100%;min-height:44px;padding:10px 12px;border:1px solid rgba(170,199,255,.22);border-radius:12px;background:#101f35;color:#fff;font:600 14px/1.2 Inter,system-ui,sans-serif}.cartera-policy-dialog__notice{padding:11px 13px;border-radius:12px;background:rgba(82,230,223,.08);color:#bbf8f4;font-size:12px;line-height:1.45}.cartera-policy-dialog__footer{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:10px;padding:15px 19px;border-top:1px solid rgba(170,199,255,.14);background:rgba(11,25,45,.98)}.cartera-policy-dialog__footer [type=submit]{min-width:170px;border:0;background:linear-gradient(135deg,#54ddd5,#73a7ff);color:#07111f}
    .cartera-policy-bulk-table{max-width:100%;overflow:auto;border:1px solid rgba(170,199,255,.14);border-radius:14px}.cartera-policy-bulk-table table{width:100%;border-collapse:collapse;min-width:650px}.cartera-policy-bulk-table th,.cartera-policy-bulk-table td{padding:10px;text-align:left;border-bottom:1px solid rgba(170,199,255,.1);font-size:12px}.cartera-policy-bulk-table td:last-child{display:grid;gap:3px}.cartera-policy-bulk-table small{color:#b9c7db}.cartera-policy-bulk-table [data-policy-import-state=READY_TO_IMPORT] strong,.cartera-policy-bulk-table [data-policy-import-state=IMPORTED] strong{color:#92efe9}.cartera-policy-bulk-table [data-policy-import-state=INVALID] strong,.cartera-policy-bulk-table [data-policy-import-state=FAILED] strong{color:#ffb4ab}.cartera-policy-bulk-table [data-policy-import-state=DUPLICATE_SUSPECTED] strong{color:#ffe69a}
    @media(max-width:720px){.cartera-policy-entry__top{display:grid}.cartera-policy-entry__actions{display:grid;grid-template-columns:1fr}.cartera-policy-entry__drop{min-height:104px}.cartera-policy-dialog{width:100%;max-height:94dvh;margin:auto 0 0;border-radius:24px 24px 0 0}.cartera-policy-dialog__grid{grid-template-columns:1fr}.cartera-policy-dialog__footer{display:grid;grid-template-columns:1fr 1fr;padding-bottom:calc(15px + env(safe-area-inset-bottom))}}
  `;
  document.head.append(style);
}

function setStatus(panel, message, error = "") {
  const status = panel.querySelector("[data-cartera-entry-status]");
  const errorNode = panel.querySelector("[data-cartera-entry-error]");
  if (status) status.textContent = message;
  if (errorNode) {
    errorNode.textContent = error;
    errorNode.hidden = !error;
  }
}

function setBusy(panel, busy) {
  panel.dataset.busy = String(busy);
  panel.querySelectorAll("button,input").forEach(control => {
    if (control.closest("dialog")) return;
    control.disabled = busy || demoSession();
  });
}

function panelMarkup() {
  const demo = demoSession();
  return `
    <div class="cartera-policy-entry__top">
      <div>
        <p class="section-kicker accent">ALTA DE PÓLIZAS</p>
        <h2>Agregar póliza a Cartera</h2>
        <p>Sube PDF, CSV o XLSX, arrástralo aquí o captura los datos manualmente. Siempre revisas antes de guardar.</p>
      </div>
      <div class="cartera-policy-entry__actions">
        <button type="button" data-primary data-select-policy-pdf ${demo ? "disabled" : ""}>Subir PDF</button>
        <button type="button" data-select-policy-bulk ${demo ? "disabled" : ""}>Carga masiva</button>
        <button type="button" data-add-policy-manual ${demo ? "disabled" : ""}>Agregar manual</button>
      </div>
    </div>
    <label class="cartera-policy-entry__drop" data-cartera-policy-dropzone tabindex="${demo ? "-1" : "0"}">
      <strong>Arrastra y suelta aquí pólizas PDF, CSV o XLSX</strong>
      <span>Un archivo por revisión · nada se incorpora sin tu confirmación</span>
      <input type="file" accept="application/pdf,.pdf,.csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-cartera-policy-drop-input ${demo ? "disabled" : ""}>
    </label>
    <input type="file" accept="application/pdf,.pdf" data-cartera-policy-pdf-input ${demo ? "disabled" : ""}>
    <p class="cartera-policy-entry__status" data-cartera-entry-status role="status">Selecciona un PDF o captura una póliza manualmente.</p>
    <p class="cartera-policy-entry__error" data-cartera-entry-error role="alert" hidden></p>
    ${demo ? '<div class="cartera-policy-entry__demo">La cuenta demo es de solo lectura. En tu sesión productiva estas acciones quedan habilitadas.</div>' : ""}
    <dialog class="cartera-policy-dialog" data-cartera-policy-dialog></dialog>
  `;
}

async function listPeople() {
  const { client } = await productiveContext();
  const result = await client
    .from("commercial_people")
    .select("person_reference,display_name,preferred_name")
    .is("archived_at", null)
    .order("display_name", { ascending: true });
  if (result.error) throw new Error("No pudimos cargar las personas de Cartera.");
  return (result.data || []).map(row => ({
    reference: row.person_reference,
    label: row.preferred_name || row.display_name || row.person_reference,
    normalized: normalizeText(row.preferred_name || row.display_name),
  }));
}

function options(values, selected) {
  return values.map(([value, label]) => `<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`).join("");
}

async function openEditor(panel, candidate = {}, metadata = {}) {
  if (demoSession()) {
    setStatus(panel, "La cuenta demo es de solo lectura.", "Abre tu sesión productiva para agregar pólizas.");
    return;
  }
  setStatus(panel, "Preparando revisión…");
  const people = await listPeople();
  const normalizedCandidate = normalizeText(candidate.person);
  const exact = people.find(person => person.normalized && person.normalized === normalizedCandidate);
  const mode = exact ? "existing" : "new";
  const draftId = uid();
  const operationAt = new Date().toISOString();
  const dialog = panel.querySelector("[data-cartera-policy-dialog]");
  dialog.innerHTML = `
    <form method="dialog" data-policy-entry-form data-draft-id="${draftId}" data-operation-at="${operationAt}" data-input-mode="${metadata.inputMode || "manual"}" data-document-hash="${metadata.documentHash || ""}" data-file-name="${escapeHtml(metadata.fileName || "")}" data-intake-id="${escapeHtml(metadata.intakeId || "")}" data-model-version="${escapeHtml(metadata.modelVersion || "")}">
      <header class="cartera-policy-dialog__header">
        <div><p class="section-kicker accent">REVISIÓN HUMANA</p><h3>${metadata.inputMode === "pdf" ? "Revisar póliza extraída" : "Agregar póliza manualmente"}</h3><p>${metadata.fileName ? `Archivo: ${escapeHtml(metadata.fileName)}` : "Captura manual"}</p></div>
        <button type="button" data-close-policy-dialog aria-label="Cerrar">×</button>
      </header>
      <div class="cartera-policy-dialog__body">
        <div class="cartera-policy-dialog__notice">Nada se guarda hasta que pulses <strong>Confirmar alta</strong>. Si existe una póliza igual, el servidor la bloqueará en vez de sobrescribirla.</div>
        <fieldset>
          <legend>Titular</legend>
          <div class="cartera-policy-dialog__grid">
            <label>Cómo registrar al titular<select name="personMode"><option value="existing"${mode === "existing" ? " selected" : ""}>Vincular persona existente</option><option value="new"${mode === "new" ? " selected" : ""}>Crear persona nueva</option></select></label>
            <label>Persona existente<select name="existingPersonReference"><option value="">Selecciona…</option>${people.map(person => `<option value="${escapeHtml(person.reference)}"${person.reference === exact?.reference ? " selected" : ""}>${escapeHtml(person.label)}</option>`).join("")}</select></label>
            <label>Nombre del titular<input name="holderName" maxlength="180" value="${escapeHtml(candidate.person || "")}" placeholder="Nombre completo"></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Póliza</legend>
          <div class="cartera-policy-dialog__grid">
            <label>Número de póliza<input name="policyNumber" maxlength="160" value="${escapeHtml(candidate.policyNumber || "")}" required></label>
            <label>Compañía<input name="carrierLabel" maxlength="180" value="Seguros Monterrey New York Life" required></label>
            <label>Producto<input name="productLabel" maxlength="180" value="${escapeHtml(candidate.product || "")}" placeholder="Vida, GMM, PPR…" required></label>
            <label>Estado<select name="status">${options([["ACTIVE","Activa"],["ISSUED","Emitida"],["PENDING","Pendiente"],["SUSPENDED","Suspendida"],["LAPSED","Vencida / caída"],["CANCELLED","Cancelada"],["MATURED","Finalizada"],["CLAIMED","Reclamación"],["UNKNOWN","Desconocido"]], statusFrom(candidate.status))}</select></label>
            <label>Fecha de emisión<input type="date" name="issueDate"></label>
            <label>Inicio de vigencia<input type="date" name="effectiveDate" value="${dateInput(candidate.effectiveDate)}"></label>
            <label>Fin de vigencia<input type="date" name="expirationDate" value="${dateInput(candidate.expirationDate)}"></label>
            <label>Moneda<select name="currency"><option>MXN</option><option>USD</option><option>UDI</option></select></label>
            <label>Prima<input type="number" min="0" step="0.01" name="premiumAmount" value="${numberOrNull(candidate.premium) ?? ""}"></label>
            <label>Periodicidad<select name="paymentFrequency">${options([["MONTHLY","Mensual"],["QUARTERLY","Trimestral"],["SEMIANNUAL","Semestral"],["ANNUAL","Anual"],["SINGLE","Pago único"],["OTHER","Otra"]], "MONTHLY")}</select></label>
            <label>Suma asegurada<input type="number" min="0" step="0.01" name="sumInsured"></label>
          </div>
        </fieldset>
        <p class="cartera-policy-entry__error" data-policy-form-error role="alert" hidden></p>
      </div>
      <footer class="cartera-policy-dialog__footer">
        <button type="button" data-close-policy-dialog>Cancelar</button>
        <button type="submit">Confirmar alta</button>
      </footer>
    </form>
  `;
  dialog.querySelectorAll("[data-close-policy-dialog]").forEach(button => button.addEventListener("click", () => dialog.close()));
  dialog.querySelector("[data-policy-entry-form]").addEventListener("submit", event => submitPolicy(event, panel, dialog));
  dialog.showModal();
  setStatus(panel, metadata.inputMode === "pdf" ? "PDF listo para revisión." : "Captura manual lista.");
}

function formDraft(form) {
  const values = Object.fromEntries(new FormData(form));
  return {
    draftId: form.dataset.draftId,
    operationAt: form.dataset.operationAt,
    inputMode: form.dataset.inputMode,
    documentHash: form.dataset.documentHash || null,
    fileName: form.dataset.fileName || null,
    intakeId: form.dataset.intakeId || null,
    modelVersion: form.dataset.modelVersion || null,
    personMode: values.personMode,
    existingPersonReference: String(values.existingPersonReference || "").trim(),
    holderName: String(values.holderName || "").trim(),
    policyNumber: String(values.policyNumber || "").trim(),
    carrierLabel: String(values.carrierLabel || "").trim(),
    productLabel: String(values.productLabel || "").trim(),
    status: values.status,
    issueDate: values.issueDate || null,
    effectiveDate: values.effectiveDate || null,
    expirationDate: values.expirationDate || null,
    currency: values.currency || null,
    premiumAmount: numberOrNull(values.premiumAmount),
    paymentFrequency: values.paymentFrequency || null,
    sumInsured: numberOrNull(values.sumInsured),
  };
}

function validateDraft(draft) {
  if (!draft.policyNumber) throw new Error("Escribe el número de póliza.");
  if (!draft.carrierLabel) throw new Error("Escribe la compañía.");
  if (!draft.productLabel) throw new Error("Escribe el producto.");
  if (draft.personMode === "existing" && !draft.existingPersonReference) throw new Error("Selecciona una persona existente.");
  if (draft.personMode === "new" && !draft.holderName) throw new Error("Escribe el nombre del titular.");
  if (draft.effectiveDate && draft.expirationDate && draft.expirationDate <= draft.effectiveDate) {
    throw new Error("El fin de vigencia debe ser posterior al inicio.");
  }
}

function createIdentityCommand(validator, userId, draft, evidenceReference, at) {
  const existing = draft.personMode === "existing";
  const personReference = existing ? draft.existingPersonReference : `person:cartera:${draft.draftId}`;
  const command = validator.buildIdentityResolutionCommand({
    advisorId: userId,
    actorReference: userId,
    idempotencyKey: `cartera:entry:identity:${draft.draftId}`,
    decidedAt: at,
    outcome: existing ? "LINK_CONFIRMED" : "CREATE_CONFIRMED",
    sourceIdentity: {
      sourceDomain: "CARTERA_POLICY_ENTRY",
      sourceIdentityType: draft.inputMode === "pdf"
        ? "ISSUED_POLICY_PDF"
        : draft.inputMode === "bulk"
          ? "BULK_POLICY_IMPORT"
          : "MANUAL_POLICY_ENTRY",
      sourceRecordReference: `cartera-entry:${draft.draftId}`,
      prospectReference: null,
    },
    existingPersonReference: existing ? personReference : null,
    newPerson: existing ? null : {
      personReference,
      displayName: draft.holderName,
      preferredName: null,
      normalizedName: normalizeText(draft.holderName),
      verifiedPhone: null,
      verifiedEmail: null,
      birthDate: null,
      privacyClassification: "PRIVATE",
    },
    candidatePersonReferences: existing ? [personReference] : [],
    evidenceReferences: [evidenceReference],
    reasonCode: existing ? "ADVISOR_CONFIRMED_POLICY_HOLDER_LINK" : "ADVISOR_CONFIRMED_POLICY_HOLDER_CREATE",
  });
  return { command, personReference };
}

function createPolicyCommand(validator, userId, draft, personReference, evidenceReference, documentHash, at) {
  const policyReference = `policy:cartera:${draft.draftId}`;
  const carrierReference = draft.carrierLabel === "Seguros Monterrey New York Life"
    ? "carrier:smnyl"
    : opaqueReference("carrier", draft.carrierLabel, "carrier");
  const productReference = opaqueReference("product", draft.productLabel, "product");
  const policy = {
    contractType: "FORGE_CANONICAL_POLICY",
    schemaVersion: "2.0.0",
    policyReference,
    advisorId: userId,
    carrierReference,
    policyNumber: draft.policyNumber,
    productReference,
    issueDate: draft.issueDate,
    effectiveFrom: draft.effectiveDate,
    effectiveTo: draft.expirationDate,
    status: { value: draft.status, source: evidenceReference, asOf: at },
    currency: draft.currency,
    premiumAmount: draft.premiumAmount,
    paymentFrequency: draft.paymentFrequency,
    sumInsured: draft.sumInsured,
    completenessState: draft.effectiveDate && draft.currency ? "COMPLETE" : "PARTIAL",
    freshnessState: "CURRENT",
    conflictState: "CLEAR",
    evidenceVersionReferences: [evidenceReference],
    currentVersion: 1,
    createdAt: at,
    createdBy: userId,
    updatedAt: at,
  };
  const roles = [{
    contractType: "FORGE_POLICY_ROLE",
    schemaVersion: "1.0.0",
    policyRoleReference: `policy-role:cartera:${draft.draftId}:owner`,
    policyReference,
    advisorId: userId,
    participantPersonReference: personReference,
    participantAccountReference: null,
    roleType: "POLICY_OWNER",
    confirmationState: "CONFIRMED",
    privacyClassification: "PRIVATE",
    visibilityScope: "POLICY_TEAM",
    evidenceReferences: [evidenceReference],
    effectiveFrom: draft.effectiveDate || at,
    effectiveTo: draft.expirationDate,
    createdAt: at,
    createdBy: userId,
    version: 1,
    correctionOf: null,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
  }];
  return validator.buildConfirmedPolicyCommand({
    advisorId: userId,
    actorReference: userId,
    idempotencyKey: `cartera:entry:policy:${draft.draftId}`,
    confirmedAt: at,
    policy,
    roles,
    evidence: {
      evidenceVersionReference: evidenceReference,
      documentHash,
      sourceType: draft.inputMode === "pdf"
        ? "ISSUED_POLICY_DOCUMENT"
        : draft.inputMode === "bulk" && String(draft.fileName || "").toLowerCase().endsWith(".xlsx")
          ? "BULK_XLSX_POLICY_IMPORT"
          : draft.inputMode === "bulk"
            ? "BULK_CSV_POLICY_IMPORT"
            : "MANUAL_POLICY_ENTRY",
      observedAt: at,
      verificationState: "CONFIRMED",
      fieldClaims: {
        policyNumber: draft.policyNumber,
        carrierReference,
        productReference,
        status: draft.status,
        effectiveFrom: draft.effectiveDate,
        effectiveTo: draft.expirationDate,
        currency: draft.currency,
        premiumAmount: draft.premiumAmount,
        paymentFrequency: draft.paymentFrequency,
        sumInsured: draft.sumInsured,
      },
      provenance: {
        sourceSystem: "FORGE_CARTERA_POLICY_ENTRY",
        inputMode: draft.inputMode,
        fileName: draft.fileName,
        sourceSheet: draft.sourceSheet,
        sourceRow: draft.sourceRow,
        intakeId: draft.intakeId,
        extractionModel: draft.modelVersion,
        humanConfirmed: true,
      },
    },
    lineage: { quoteReference: null, applicationReference: null, previousPolicyVersionReference: null },
  });
}

async function rejectKnownDuplicate(client, draft) {
  const carrierReference = draft.carrierLabel === "Seguros Monterrey New York Life"
    ? "carrier:smnyl"
    : opaqueReference("carrier", draft.carrierLabel, "carrier");
  const result = await client
    .from("canonical_policies")
    .select("policy_reference")
    .eq("carrier_reference", carrierReference)
    .eq("policy_number", draft.policyNumber)
    .is("archived_at", null)
    .limit(1);
  if (result.error) throw new Error("No pudimos verificar duplicados antes de guardar.");
  if (result.data?.length) {
    throw new Error("DUPLICATE_SUSPECTED · ya existe una póliza con la misma compañía y número.");
  }
}

async function currentUserId() {
  const session = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getSession?.();
  return session?.data?.session?.user?.id || null;
}

async function assertOperationOwner(expectedUserId) {
  if (!expectedUserId || await currentUserId() !== expectedUserId) {
    throw new DOMException("La sesión cambió antes de terminar la operación.", "AbortError");
  }
}

function persistenceError(error) {
  const message = String(error?.message || "");
  if (/CARTERA010B_ATOMIC_(IDENTITY_NOT_CONFIRMED|POLICY_NOT_CONFIRMED|POLICY_PERSON_MISMATCH)/.test(message)) {
    return new Error("CONFLICT · La identidad o la póliza requiere conciliación. No se guardó un resultado parcial.");
  }
  return new Error("No pudimos confirmar si la póliza quedó guardada. Conservamos tus datos; reintentar es seguro y no crea duplicados.");
}

export async function persistDraft(draft, { expectedUserId = null } = {}) {
  validateDraft(draft);
  if (demoSession()) throw new Error("La cuenta demo es de solo lectura.");
  const { user, client } = await productiveContext();
  const operationUserId = expectedUserId || user.id;
  if (operationUserId !== user.id) throw new DOMException("La sesión cambió antes de guardar.", "AbortError");
  const validator = await loadValidator();
  await rejectKnownDuplicate(client, draft);
  await assertOperationOwner(operationUserId);
  const at = draft.operationAt || (draft.operationAt = new Date().toISOString());
  const evidenceReference = `policy-evidence:cartera:${draft.draftId}`;
  const documentHash = draft.documentHash || await digest(draft);
  const identity = createIdentityCommand(validator, user.id, draft, evidenceReference, at);
  const policyCommand = createPolicyCommand(
    validator,
    user.id,
    draft,
    identity.personReference,
    evidenceReference,
    documentHash,
    at,
  );
  const result = await client.rpc("forge_cartera010b_confirm_identity_and_policy", {
    p_identity_command: identity.command,
    p_policy_command: policyCommand,
  });
  await assertOperationOwner(operationUserId);
  if (result.error) throw persistenceError(result.error);
  if (result.data?.status !== "CONFIRMED" || result.data?.readAfterWriteVerified !== true) {
    throw new Error("La operación no quedó confirmada. Conservamos tus datos para que puedas reintentar.");
  }
  return result.data.policyReference;
}

async function submitPolicy(event, panel, dialog) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorNode = form.querySelector("[data-policy-form-error]");
  const submit = form.querySelector('[type="submit"]');
  errorNode.hidden = true;
  submit.disabled = true;
  submit.textContent = "Guardando…";
  try {
    const policyReference = await persistDraft(formDraft(form));
    dialog.close();
    setStatus(panel, `Póliza incorporada correctamente (${policyReference}). Actualizando Cartera…`);
    globalThis.dispatchEvent(new CustomEvent("forge:cartera-policy-created", {
      detail: Object.freeze({ policyReference, source: "CARTERA_POLICY_ENTRY" }),
    }));
    window.setTimeout(() => {
      const url = new URL(location.href);
      url.searchParams.set("nav", "cartera");
      url.searchParams.set("cartera_refresh", Date.now().toString());
      location.replace(url.href);
    }, 650);
  } catch (error) {
    errorNode.textContent = error?.message || "No pudimos guardar la póliza.";
    errorNode.hidden = false;
    submit.disabled = false;
    submit.textContent = "Confirmar alta";
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + 0x8000, bytes.length)));
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

async function processPdf(panel, file) {
  activeGeneration += 1;
  activePdfController?.abort("pdf-replaced");
  activePdfController = null;
  if (demoSession()) throw new Error("La cuenta demo es de solo lectura.");
  if (!file || (file.type && file.type !== "application/pdf") || !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Selecciona un archivo PDF válido.");
  }
  if (file.size > MAX_PDF_BYTES) throw new Error("El PDF supera el límite de 8 MB.");

  const generation = activeGeneration;
  const controller = new AbortController();
  activePdfController = controller;
  const operationUserId = await currentUserId();
  if (!operationUserId) throw new Error("Inicia sesión para revisar el documento.");
  setBusy(panel, true);
  setStatus(panel, "Cargando y extrayendo el PDF…");
  const buffer = await file.arrayBuffer();
  if (new TextDecoder("latin1").decode(buffer.slice(0, 5)) !== "%PDF-") throw new Error("El archivo seleccionado no parece ser un PDF válido.");
  if (controller.signal.aborted || generation !== activeGeneration) return;
  const response = await fetch(PDF_FUNCTION_URL, {
    method: "POST",
    headers: await sessionHeaders(),
    body: JSON.stringify({ fileName: file.name, mimeType: "application/pdf", base64: arrayBufferToBase64(buffer) }),
    signal: controller.signal,
  });
  const payload = await response.json().catch(() => ({}));
  if (generation !== activeGeneration || controller.signal.aborted || !panel.isConnected || await currentUserId() !== operationUserId) return;
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.message || payload?.error || "No pudimos procesar el PDF.");
  }
  const candidate = Array.isArray(payload.candidates) ? payload.candidates[0] : null;
  if (!candidate) throw new Error("No encontramos una póliza reconocible. Puedes capturarla manualmente.");
  await openEditor(panel, candidate, {
    inputMode: "pdf",
    fileName: file.name,
    intakeId: payload.intakeId,
    modelVersion: payload.modelVersion,
    documentHash: await digest(buffer),
  });
  if (activePdfController === controller) activePdfController = null;
}

async function handlePdf(panel, file) {
  try {
    await processPdf(panel, file);
  } catch (error) {
    if (error?.name === "AbortError") return;
    setStatus(panel, "La carga no se completó.", error?.message || "No pudimos procesar el PDF.");
  } finally {
    setBusy(panel, false);
  }
}

function bindPanel(panel) {
  if (panel.dataset.bound === "true") return;
  panel.dataset.bound = "true";
  const input = panel.querySelector("[data-cartera-policy-pdf-input]");
  const dropInput = panel.querySelector("[data-cartera-policy-drop-input]");
  const dropzone = panel.querySelector("[data-cartera-policy-dropzone]");
  const bulkImport = mountPolicyBulkImport(panel, { persistDraft });
  const processSelectedFile = file => {
    const ext = String(file?.name || "").split(".").pop().toLowerCase();
    return ["csv", "xlsx"].includes(ext)
      ? bulkImport.processFile(file)
      : handlePdf(panel, file);
  };
  panel.querySelector("[data-select-policy-pdf]")?.addEventListener("click", () => input.click());
  panel.querySelector("[data-add-policy-manual]")?.addEventListener("click", () => {
    openEditor(panel).catch(error => setStatus(panel, "No pudimos abrir la captura manual.", error.message));
  });
  input?.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (file) await handlePdf(panel, file);
    input.value = "";
  });
  dropInput?.addEventListener("change", async () => {
    const file = dropInput.files?.[0];
    if (file) await processSelectedFile(file);
    dropInput.value = "";
  });
  dropzone?.addEventListener("keydown", event => {
    if (["Enter", " "].includes(event.key) && !demoSession()) {
      event.preventDefault();
      dropInput.click();
    }
  });
  for (const eventName of ["dragenter", "dragover"]) {
    dropzone?.addEventListener(eventName, event => {
      if (demoSession()) return;
      event.preventDefault();
      dropzone.dataset.dragActive = "true";
    });
  }
  for (const eventName of ["dragleave", "drop"]) {
    dropzone?.addEventListener(eventName, event => {
      event.preventDefault();
      dropzone.dataset.dragActive = "false";
    });
  }
  dropzone?.addEventListener("drop", event => processSelectedFile(event.dataTransfer?.files?.[0]));
}

function mount(root) {
  const blocked = ["auth-required", "signed-out"].includes(root.dataset.carteraMaterial3State);
  let panel = root.querySelector(PANEL_SELECTOR);
  if (blocked) {
    panel?.remove();
    return;
  }
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "cartera-policy-entry";
    panel.dataset.carteraPolicyEntry = "true";
    panel.innerHTML = panelMarkup();
    root.prepend(panel);
    bindPanel(panel);
  }
  const frame = root.querySelector("[data-cartera-material3-frame]");
  if (frame && panel.nextElementSibling !== frame) frame.before(panel);
}

function boot() {
  ensureStyles();
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;
  mount(root);
  const observer = new MutationObserver(() => mount(root));
  observer.observe(root, { childList: true, attributes: true, attributeFilter: ["data-cartera-material3-state"] });
  globalThis.addEventListener("forge:auth-state-changed", event => {
    if (event.detail?.status !== "authenticated") {
      activeGeneration += 1;
      activePdfController?.abort("session-ended");
      activePdfController = null;
    }
    mount(root);
  });
  globalThis.addEventListener("forge:demo-session-classified", () => {
    root.querySelector(PANEL_SELECTOR)?.remove();
    mount(root);
  });
  globalThis.addEventListener("pagehide", () => {
    activeGeneration += 1;
    activePdfController?.abort("page-hidden");
    activePdfController = null;
    observer.disconnect();
  }, { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
import { mountPolicyBulkImport } from "./cartera-policy-bulk-import.js?v=beta1-022-001";

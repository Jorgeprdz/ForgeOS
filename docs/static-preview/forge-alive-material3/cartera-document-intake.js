const ROOT_SELECTOR = "[data-forge-cartera-module]";
const PANEL_SELECTOR = "[data-cartera-document-intake]";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/cartera-pdf-intake`;
const MAX_BYTES = 8 * 1024 * 1024;
const SOURCE_LAYOUT = import.meta.url.includes("/docs/static-preview/");
const VALIDATOR_URL = new URL(
  SOURCE_LAYOUT
    ? "../../../platform/shared-commercial-model/cartera-010b-contract-validator.js"
    : "../../platform/shared-commercial-model/cartera-010b-contract-validator.js",
  import.meta.url,
).href;
const STATUS_VALUES = Object.freeze([
  ["ACTIVE", "Activa"],
  ["ISSUED", "Emitida"],
  ["PENDING", "Pendiente"],
  ["SUSPENDED", "Suspendida"],
  ["LAPSED", "Vencida / caída"],
  ["CANCELLED", "Cancelada"],
  ["MATURED", "Finalizada"],
  ["CLAIMED", "Siniestro / reclamación"],
  ["UNKNOWN", "Desconocido"],
]);
const FREQUENCY_VALUES = Object.freeze([
  ["MONTHLY", "Mensual"],
  ["QUARTERLY", "Trimestral"],
  ["SEMIANNUAL", "Semestral"],
  ["ANNUAL", "Anual"],
  ["SINGLE", "Pago único"],
  ["OTHER", "Otra"],
]);

let generation = 0;
let validatorPromise = null;
const state = {
  panel: null,
  editorOpen: false,
  busy: false,
  dragActive: false,
  people: [],
  draft: null,
  lastMessage: "Selecciona un PDF, arrástralo aquí o captura una póliza manualmente.",
  error: "",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function uuid() {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
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

function slug(value, fallback = "unknown") {
  const normalized = normalizeText(value).replace(/\s+/g, "-").slice(0, 100);
  return normalized || fallback;
}

function opaqueReference(prefix, value, fallback = "unknown") {
  const text = String(value || "").trim();
  if (/^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/.test(text) && text.includes(":")) {
    return text;
  }
  return `${prefix}:${slug(text, fallback)}`;
}

function asNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).replace(/[^0-9.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function normalizeStatus(value) {
  const text = normalizeText(value);
  if (/activa|active|vigente/.test(text)) return "ACTIVE";
  if (/emitida|issued/.test(text)) return "ISSUED";
  if (/pendiente|pending/.test(text)) return "PENDING";
  if (/suspendida|suspended/.test(text)) return "SUSPENDED";
  if (/vencida|lapsed|caida/.test(text)) return "LAPSED";
  if (/cancelada|cancelled/.test(text)) return "CANCELLED";
  if (/madur|matured|finalizada/.test(text)) return "MATURED";
  if (/claimed|reclamacion|siniestro/.test(text)) return "CLAIMED";
  return "ACTIVE";
}

function isoDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function isDemoSession() {
  return document.documentElement.dataset.forgeDemoSession === "active";
}

async function sha256Hex(value) {
  const bytes = value instanceof ArrayBuffer
    ? value
    : new TextEncoder().encode(typeof value === "string" ? value : JSON.stringify(value)).buffer;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map(number => number.toString(16).padStart(2, "0"))
    .join("");
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

async function productiveContext() {
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  if (typeof bootstrap?.getClient !== "function" || typeof bootstrap?.getUser !== "function") {
    throw new Error("La sesión productiva todavía no está lista.");
  }
  const userResult = await bootstrap.getUser();
  const user = userResult?.data?.user;
  if (!user?.id) throw new Error("Inicia sesión para agregar pólizas.");
  const client = await bootstrap.getClient();
  return { user, client };
}

function ensureStyles() {
  if (document.querySelector("[data-cartera-document-intake-styles]")) return;
  const style = document.createElement("style");
  style.dataset.carteraDocumentIntakeStyles = "true";
  style.textContent = `
    .cartera-policy-entry{position:relative;margin:0 0 18px;padding:18px;border:1px solid rgba(170,199,255,.18);border-radius:20px;background:linear-gradient(145deg,rgba(12,28,50,.9),rgba(17,43,70,.78));color:#f5f2ff;box-shadow:0 18px 42px rgba(0,0,0,.18)}
    .cartera-policy-entry *{box-sizing:border-box}.cartera-policy-entry h2,.cartera-policy-entry p{margin:0}.cartera-policy-entry__header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.cartera-policy-entry__header h2{font-size:clamp(1.25rem,2vw,1.7rem);margin-top:4px}.cartera-policy-entry__header p:last-child{margin-top:7px;color:#b9c7dc;font-size:13px;line-height:1.45}
    .cartera-policy-entry__actions{display:flex;gap:10px;flex-wrap:wrap}.cartera-policy-entry button{min-height:44px;padding:10px 15px;border:1px solid rgba(170,199,255,.25);border-radius:13px;background:rgba(255,255,255,.07);color:inherit;font:800 13px/1.1 Inter,system-ui,sans-serif;cursor:pointer}.cartera-policy-entry button:hover{background:rgba(255,255,255,.12)}.cartera-policy-entry button[data-primary]{border-color:rgba(82,230,223,.45);background:linear-gradient(135deg,rgba(82,230,223,.2),rgba(80,130,255,.2));color:#b9fffa}.cartera-policy-entry button:disabled{opacity:.5;cursor:not-allowed}
    .cartera-document-dropzone{display:grid;place-items:center;gap:8px;min-height:132px;margin-top:16px;padding:20px;border:1px dashed rgba(82,230,223,.48);border-radius:16px;background:rgba(82,230,223,.045);text-align:center;cursor:pointer}.cartera-document-dropzone[data-drag-active=true]{border-style:solid;background:rgba(82,230,223,.14);transform:translateY(-1px)}.cartera-document-dropzone strong{font-size:14px}.cartera-document-dropzone span{color:#a8b9d0;font-size:12px}.cartera-policy-entry input[type=file]{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
    .cartera-policy-entry__state{margin-top:12px!important;color:#bac8dc;font-size:12px}.cartera-policy-entry__error{margin-top:9px!important;color:#ffb4ab;font-size:12px}.cartera-policy-entry__demo{margin-top:12px;padding:10px 12px;border-radius:12px;background:rgba(242,201,76,.12);color:#ffe69a;font-size:12px;font-weight:700}
    .cartera-policy-editor{position:fixed;inset:0;z-index:2800;display:grid;place-items:center;padding:18px;background:rgba(2,8,18,.76);backdrop-filter:blur(12px)}.cartera-policy-editor[hidden]{display:none}.cartera-policy-editor__sheet{width:min(760px,100%);max-height:min(88dvh,900px);overflow:auto;border:1px solid rgba(170,199,255,.22);border-radius:24px;background:#0b192d;color:#f7f4ff;box-shadow:0 28px 90px rgba(0,0,0,.55)}
    .cartera-policy-editor__header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:20px;border-bottom:1px solid rgba(170,199,255,.14);background:rgba(11,25,45,.96);backdrop-filter:blur(14px)}.cartera-policy-editor__header h3{margin:3px 0 0;font-size:1.45rem}.cartera-policy-editor__header p{margin:7px 0 0;color:#aebbd0;font-size:12px}.cartera-policy-editor__body{display:grid;gap:18px;padding:20px}.cartera-policy-editor fieldset{display:grid;gap:12px;margin:0;padding:16px;border:1px solid rgba(170,199,255,.14);border-radius:17px}.cartera-policy-editor legend{padding:0 8px;color:#92efe9;font-size:12px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}
    .cartera-policy-editor__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.cartera-policy-editor label{display:grid;gap:6px;color:#c0ccdc;font-size:11px;font-weight:800}.cartera-policy-editor input,.cartera-policy-editor select{width:100%;min-height:44px;padding:10px 12px;border:1px solid rgba(170,199,255,.22);border-radius:12px;background:#101f35;color:#fff;font:600 14px/1.2 Inter,system-ui,sans-serif}.cartera-policy-editor input:focus,.cartera-policy-editor select:focus{outline:2px solid rgba(82,230,223,.35);outline-offset:1px}
    .cartera-policy-editor__identity-mode{display:flex;gap:10px;flex-wrap:wrap}.cartera-policy-editor__identity-mode label{display:flex;align-items:center;gap:7px;min-height:40px;padding:8px 11px;border:1px solid rgba(170,199,255,.16);border-radius:12px;background:rgba(255,255,255,.035)}.cartera-policy-editor__identity-mode input{width:auto;min-height:auto}.cartera-policy-editor__footer{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:10px;padding:16px 20px;border-top:1px solid rgba(170,199,255,.14);background:rgba(11,25,45,.97)}.cartera-policy-editor__footer [data-confirm-policy-entry]{min-width:170px;background:linear-gradient(135deg,#54ddd5,#73a7ff);color:#07111f;border:0}.cartera-policy-editor__notice{padding:11px 13px;border-radius:12px;background:rgba(82,230,223,.08);color:#bbf8f4;font-size:12px;line-height:1.45}
    @media(max-width:720px){.cartera-policy-entry__header{display:grid}.cartera-policy-entry__actions{display:grid;grid-template-columns:1fr 1fr}.cartera-document-dropzone{min-height:104px}.cartera-policy-editor{padding:0;place-items:end center}.cartera-policy-editor__sheet{width:100%;max-height:94dvh;border-radius:24px 24px 0 0}.cartera-policy-editor__grid{grid-template-columns:1fr}.cartera-policy-editor__footer{display:grid;grid-template-columns:1fr 1fr;padding-bottom:calc(16px + env(safe-area-inset-bottom))}}
  `;
  document.head.append(style);
}

function draftFromCandidate(candidate = {}, metadata = {}) {
  return {
    entryId: uuid(),
    mode: metadata.mode || "manual",
    fileName: metadata.fileName || null,
    intakeId: metadata.intakeId || null,
    modelVersion: metadata.modelVersion || null,
    documentHash: metadata.documentHash || null,
    personMode: "new",
    existingPersonReference: "",
    holderName: String(candidate.person || "").trim(),
    policyNumber: String(candidate.policyNumber || "").trim(),
    carrierLabel: "Seguros Monterrey New York Life",
    carrierReference: "carrier:smnyl",
    productLabel: String(candidate.product || "").trim(),
    productReference: "",
    status: normalizeStatus(candidate.status),
    issueDate: "",
    effectiveDate: isoDateInput(candidate.effectiveDate),
    expirationDate: isoDateInput(candidate.expirationDate),
    premiumAmount: asNumber(candidate.premium),
    currency: "MXN",
    paymentFrequency: "MONTHLY",
    sumInsured: null,
    confidence: Number.isFinite(Number(candidate.confidence)) ? Number(candidate.confidence) : null,
  };
}

function optionMarkup(values, selected) {
  return values.map(([value, label]) => `<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`).join("");
}

function renderPanel() {
  const panel = state.panel;
  if (!panel) return;
  const demo = isDemoSession();
  panel.dataset.intakeState = state.busy ? "processing" : state.editorOpen ? "review" : "idle";
  panel.innerHTML = `
    <div class="cartera-policy-entry__header">
      <div>
        <p class="section-kicker accent">ALTA DE PÓLIZAS</p>
        <h2>Agregar póliza a Cartera</h2>
        <p>Sube un PDF, arrástralo aquí o captura los datos manualmente. Siempre revisas antes de guardar.</p>
      </div>
      <div class="cartera-policy-entry__actions">
        <button type="button" data-primary data-select-cartera-pdf ${demo || state.busy ? "disabled" : ""}>Subir PDF</button>
        <button type="button" data-open-manual-policy ${demo || state.busy ? "disabled" : ""}>Agregar manual</button>
      </div>
    </div>
    <label class="cartera-document-dropzone" data-cartera-document-dropzone data-drag-active="${state.dragActive}" tabindex="${demo ? "-1" : "0"}">
      <strong>Arrastra y suelta aquí el PDF de la póliza</strong>
      <span>PDF de hasta 8 MB · no se guarda nada sin tu confirmación</span>
      <input type="file" accept="application/pdf,.pdf" data-cartera-pdf-input ${demo ? "disabled" : ""}>
    </label>
    <p class="cartera-policy-entry__state" data-cartera-document-state role="status">${escapeHtml(state.lastMessage)}</p>
    <p class="cartera-policy-entry__error" data-cartera-document-error role="alert" ${state.error ? "" : "hidden"}>${escapeHtml(state.error)}</p>
    ${demo ? '<div class="cartera-policy-entry__demo">La cuenta demo es de solo lectura. En una sesión productiva estas acciones quedan habilitadas.</div>' : ""}
    <div class="cartera-policy-editor" data-cartera-policy-editor ${state.editorOpen ? "" : "hidden"}></div>
  `;
  bindPanelEvents(panel);
  if (state.editorOpen) renderEditor();
}

async function loadPeople() {
  const { client } = await productiveContext();
  const result = await client
    .from("commercial_people")
    .select("person_reference,display_name,preferred_name")
    .is("archived_at", null)
    .order("display_name", { ascending: true });
  if (result.error) throw new Error("No pudimos cargar las personas de Cartera.");
  state.people = (result.data || []).map(row => ({
    reference: row.person_reference,
    label: row.preferred_name || row.display_name || row.person_reference,
    normalized: normalizeText(row.preferred_name || row.display_name),
  }));
  if (!state.draft) return;
  const exact = state.people.find(person => person.normalized && person.normalized === normalizeText(state.draft.holderName));
  if (exact) {
    state.draft.personMode = "existing";
    state.draft.existingPersonReference = exact.reference;
  } else if (state.people.length && !state.draft.holderName) {
    state.draft.personMode = "existing";
    state.draft.existingPersonReference = state.people[0].reference;
  }
}

function personOptions() {
  return state.people.map(person => `<option value="${escapeHtml(person.reference)}"${person.reference === state.draft?.existingPersonReference ? " selected" : ""}>${escapeHtml(person.label)}</option>`).join("");
}

function renderEditor() {
  const host = state.panel?.querySelector("[data-cartera-policy-editor]");
  const draft = state.draft;
  if (!host || !draft) return;
  const existing = draft.personMode === "existing";
  const title = draft.mode === "pdf" ? "Revisar póliza extraída" : "Agregar póliza manualmente";
  host.innerHTML = `
    <section class="cartera-policy-editor__sheet" role="dialog" aria-modal="true" aria-labelledby="cartera-policy-editor-title">
      <header class="cartera-policy-editor__header">
        <div><p class="section-kicker accent">REVISIÓN HUMANA</p><h3 id="cartera-policy-editor-title">${title}</h3><p>${draft.fileName ? `Archivo: ${escapeHtml(draft.fileName)}` : "Captura manual"}</p></div>
        <button type="button" data-close-policy-editor aria-label="Cerrar">×</button>
      </header>
      <div class="cartera-policy-editor__body">
        <div class="cartera-policy-editor__notice">La póliza y su titular se guardarán únicamente cuando pulses <strong>Confirmar alta</strong>. Los posibles duplicados se rechazan; no se sobrescribe información silenciosamente.</div>
        <fieldset>
          <legend>Titular de la póliza</legend>
          <div class="cartera-policy-editor__identity-mode">
            <label><input type="radio" name="personMode" value="existing" ${existing ? "checked" : ""}> Persona existente</label>
            <label><input type="radio" name="personMode" value="new" ${!existing ? "checked" : ""}> Crear persona nueva</label>
          </div>
          <div data-existing-person ${existing ? "" : "hidden"}>
            <label>Persona en Cartera<select data-field="existingPersonReference">${personOptions() || '<option value="">No hay personas disponibles</option>'}</select></label>
          </div>
          <div data-new-person ${existing ? "hidden" : ""}>
            <label>Nombre completo<input data-field="holderName" maxlength="180" value="${escapeHtml(draft.holderName)}" placeholder="Nombre del titular"></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Datos de la póliza</legend>
          <div class="cartera-policy-editor__grid">
            <label>Número de póliza<input data-field="policyNumber" maxlength="160" value="${escapeHtml(draft.policyNumber)}" required></label>
            <label>Compañía<input data-field="carrierLabel" maxlength="180" value="${escapeHtml(draft.carrierLabel)}" required></label>
            <label>Producto<input data-field="productLabel" maxlength="180" value="${escapeHtml(draft.productLabel)}" placeholder="Vida, GMM, PPR…" required></label>
            <label>Estado<select data-field="status">${optionMarkup(STATUS_VALUES, draft.status)}</select></label>
            <label>Fecha de emisión<input type="date" data-field="issueDate" value="${escapeHtml(draft.issueDate)}"></label>
            <label>Inicio de vigencia<input type="date" data-field="effectiveDate" value="${escapeHtml(draft.effectiveDate)}"></label>
            <label>Fin de vigencia<input type="date" data-field="expirationDate" value="${escapeHtml(draft.expirationDate)}"></label>
            <label>Moneda<select data-field="currency"><option value="MXN"${draft.currency === "MXN" ? " selected" : ""}>MXN</option><option value="USD"${draft.currency === "USD" ? " selected" : ""}>USD</option><option value="UDI"${draft.currency === "UDI" ? " selected" : ""}>UDI</option></select></label>
            <label>Prima<input type="number" min="0" step="0.01" data-field="premiumAmount" value="${draft.premiumAmount ?? ""}"></label>
            <label>Periodicidad<select data-field="paymentFrequency">${optionMarkup(FREQUENCY_VALUES, draft.paymentFrequency)}</select></label>
            <label>Suma asegurada<input type="number" min="0" step="0.01" data-field="sumInsured" value="${draft.sumInsured ?? ""}"></label>
          </div>
        </fieldset>
        <p class="cartera-policy-entry__error" data-editor-error role="alert" ${state.error ? "" : "hidden"}>${escapeHtml(state.error)}</p>
      </div>
      <footer class="cartera-policy-editor__footer">
        <button type="button" data-close-policy-editor>Cancelar</button>
        <button type="button" data-confirm-policy-entry ${state.busy ? "disabled" : ""}>${state.busy ? "Guardando…" : "Confirmar alta"}</button>
      </footer>
    </section>
  `;
  bindEditorEvents(host);
  host.querySelector("input:not([type=radio]),select")?.focus();
}

function syncDraftFromEditor(host) {
  if (!state.draft) return;
  for (const input of host.querySelectorAll("[data-field]")) {
    const field = input.dataset.field;
    if (["premiumAmount", "sumInsured"].includes(field)) state.draft[field] = asNumber(input.value);
    else state.draft[field] = input.value;
  }
  const checked = host.querySelector('input[name="personMode"]:checked');
  if (checked) state.draft.personMode = checked.value;
}

function validateDraft(draft) {
  if (!draft.policyNumber.trim()) throw new Error("Escribe el número de póliza.");
  if (!draft.carrierLabel.trim()) throw new Error("Escribe la compañía.");
  if (!draft.productLabel.trim()) throw new Error("Escribe el producto.");
  if (draft.personMode === "existing" && !draft.existingPersonReference) {
    throw new Error("Selecciona una persona existente.");
  }
  if (draft.personMode === "new" && !draft.holderName.trim()) {
    throw new Error("Escribe el nombre del titular.");
  }
  if (draft.expirationDate && draft.effectiveDate && draft.expirationDate <= draft.effectiveDate) {
    throw new Error("El fin de vigencia debe ser posterior al inicio.");
  }
}

function identityCommand({ validator, userId, draft, evidenceReference, at }) {
  const existing = draft.personMode === "existing";
  const personReference = existing
    ? draft.existingPersonReference
    : `person:manual:${uuid()}`;
  const sourceReference = `cartera-entry:${draft.entryId}`;
  const command = validator.buildIdentityResolutionCommand({
    advisorId: userId,
    actorReference: userId,
    idempotencyKey: `cartera:entry:identity:${draft.entryId}`,
    decidedAt: at,
    outcome: existing ? "LINK_CONFIRMED" : "CREATE_CONFIRMED",
    sourceIdentity: {
      sourceDomain: "CARTERA_POLICY_ENTRY",
      sourceIdentityType: draft.mode === "pdf" ? "ISSUED_POLICY_PDF" : "MANUAL_POLICY_ENTRY",
      sourceRecordReference: sourceReference,
      prospectReference: null,
    },
    existingPersonReference: existing ? personReference : null,
    newPerson: existing ? null : {
      personReference,
      displayName: draft.holderName.trim(),
      preferredName: null,
      normalizedName: normalizeText(draft.holderName),
      verifiedPhone: null,
      verifiedEmail: null,
      birthDate: null,
      privacyClassification: "PRIVATE",
    },
    candidatePersonReferences: existing ? [personReference] : [],
    evidenceReferences: [evidenceReference],
    reasonCode: existing
      ? "ADVISOR_CONFIRMED_POLICY_HOLDER_LINK"
      : "ADVISOR_CONFIRMED_POLICY_HOLDER_CREATE",
  });
  return { command, personReference };
}

function policyCommand({ validator, userId, draft, personReference, evidenceReference, documentHash, at }) {
  const policyReference = `policy:cartera:${uuid()}`;
  const roleReference = `policy-role:cartera:${uuid()}:owner`;
  const carrierReference = draft.carrierReference && draft.carrierLabel === "Seguros Monterrey New York Life"
    ? draft.carrierReference
    : opaqueReference("carrier", draft.carrierLabel, "carrier");
  const productReference = draft.productReference || opaqueReference("product", draft.productLabel, "product");
  const complete = Boolean(draft.effectiveDate && draft.currency && draft.premiumAmount !== null);
  const policy = {
    contractType: "FORGE_CANONICAL_POLICY",
    schemaVersion: "2.0.0",
    policyReference,
    advisorId: userId,
    carrierReference,
    policyNumber: draft.policyNumber.trim(),
    productReference,
    issueDate: draft.issueDate || null,
    effectiveFrom: draft.effectiveDate || null,
    effectiveTo: draft.expirationDate || null,
    status: { value: draft.status, source: evidenceReference, asOf: at },
    currency: draft.currency || null,
    premiumAmount: draft.premiumAmount,
    paymentFrequency: draft.paymentFrequency || null,
    sumInsured: draft.sumInsured,
    completenessState: complete ? "COMPLETE" : "PARTIAL",
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
    policyRoleReference: roleReference,
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
    effectiveTo: draft.expirationDate || null,
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
    idempotencyKey: `cartera:entry:policy:${draft.entryId}`,
    confirmedAt: at,
    policy,
    roles,
    evidence: {
      evidenceVersionReference: evidenceReference,
      documentHash,
      sourceType: draft.mode === "pdf" ? "ISSUED_POLICY_DOCUMENT" : "MANUAL_POLICY_ENTRY",
      observedAt: at,
      verificationState: "CONFIRMED",
      fieldClaims: {
        policyNumber: draft.policyNumber.trim(),
        carrierReference,
        productReference,
        status: draft.status,
        premiumAmount: draft.premiumAmount,
        currency: draft.currency,
        paymentFrequency: draft.paymentFrequency,
        sumInsured: draft.sumInsured,
        effectiveFrom: draft.effectiveDate || null,
        effectiveTo: draft.expirationDate || null,
      },
      provenance: {
        source: "FORGE_CARTERA_POLICY_ENTRY",
        inputMode: draft.mode,
        fileName: draft.fileName,
        intakeId: draft.intakeId,
        extractionModel: draft.modelVersion,
        humanConfirmed: true,
      },
    },
    lineage: {
      quoteReference: null,
      applicationReference: null,
      previousPolicyVersionReference: null,
    },
  });
}

async function persistDraft() {
  if (isDemoSession()) throw new Error("La cuenta demo es de solo lectura.");
  const draft = state.draft;
  validateDraft(draft);
  const { user, client } = await productiveContext();
  const validator = await loadValidator();
  const at = new Date().toISOString();
  const evidenceReference = `policy-evidence:cartera:${draft.entryId}`;
  const documentHash = draft.documentHash || await sha256Hex({
    mode: draft.mode,
    holderName: draft.holderName,
    existingPersonReference: draft.existingPersonReference,
    policyNumber: draft.policyNumber,
    carrierLabel: draft.carrierLabel,
    productLabel: draft.productLabel,
    status: draft.status,
    effectiveDate: draft.effectiveDate,
    expirationDate: draft.expirationDate,
    premiumAmount: draft.premiumAmount,
    currency: draft.currency,
    paymentFrequency: draft.paymentFrequency,
    sumInsured: draft.sumInsured,
  });

  const identity = identityCommand({
    validator,
    userId: user.id,
    draft,
    evidenceReference,
    at,
  });
  const identityResult = await client.rpc("forge_cartera010b_confirm_identity_resolution", {
    p_command: identity.command,
  });
  if (identityResult.error) throw new Error(identityResult.error.message || "No pudimos confirmar al titular.");
  const identityStatus = identityResult.data?.status || identityResult.data?.outcome || "";
  if (["CONFLICT", "REJECTED", "UNRESOLVED"].includes(identityStatus)) {
    throw new Error("El titular requiere conciliación antes de guardar la póliza.");
  }

  const command = policyCommand({
    validator,
    userId: user.id,
    draft,
    personReference: identity.personReference,
    evidenceReference,
    documentHash,
    at,
  });
  const result = await client.rpc("forge_cartera010b_confirm_policy_with_parties", {
    p_command: command,
  });
  if (result.error) throw new Error(result.error.message || "No pudimos guardar la póliza.");
  const status = result.data?.status || "";
  if (["CONFLICT", "REJECTED"].includes(status)) {
    const code = result.data?.conflictType || result.data?.conflict_type || "POLICY_CONFLICT";
    throw new Error(`La póliza no se guardó porque existe un conflicto: ${code}.`);
  }
  return { policyReference: command.policy.policyReference, receipt: result.data };
}

async function confirmEntry(host) {
  syncDraftFromEditor(host);
  state.error = "";
  state.busy = true;
  renderEditor();
  try {
    const result = await persistDraft();
    state.editorOpen = false;
    state.draft = null;
    state.lastMessage = `Póliza incorporada correctamente (${result.policyReference}).`;
    state.error = "";
    globalThis.dispatchEvent(new CustomEvent("forge:cartera-policy-created", {
      detail: Object.freeze({ policyReference: result.policyReference, source: "CARTERA_POLICY_ENTRY" }),
    }));
  } catch (error) {
    state.error = error?.message || "No pudimos guardar la póliza.";
  } finally {
    state.busy = false;
    renderPanel();
  }
}

async function openManualEditor() {
  state.error = "";
  state.draft = draftFromCandidate({}, { mode: "manual" });
  state.editorOpen = true;
  state.lastMessage = "Captura manual en revisión.";
  renderPanel();
  try {
    await loadPeople();
  } catch (error) {
    state.error = error?.message || "No pudimos cargar las personas.";
  }
  renderEditor();
}

function closeEditor() {
  if (state.busy) return;
  state.editorOpen = false;
  state.draft = null;
  state.error = "";
  renderPanel();
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

async function processFile(file) {
  if (isDemoSession()) throw new Error("La cuenta demo es de solo lectura.");
  if (!file || file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Selecciona un archivo PDF válido.");
  }
  if (file.size > MAX_BYTES) throw new Error("El PDF supera el límite de 8 MB.");

  const currentGeneration = ++generation;
  state.busy = true;
  state.error = "";
  state.lastMessage = "Cargando y extrayendo el PDF…";
  renderPanel();
  const buffer = await file.arrayBuffer();
  const documentHash = await sha256Hex(buffer);
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: await sessionHeaders(),
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      base64: arrayBufferToBase64(buffer),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (currentGeneration !== generation) return;
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.message || payload?.error || "No pudimos procesar el PDF.");
  }
  const candidate = Array.isArray(payload.candidates) ? payload.candidates[0] : null;
  if (!candidate) throw new Error("No encontramos una póliza reconocible en el PDF. Puedes capturarla manualmente.");
  state.draft = draftFromCandidate(candidate, {
    mode: "pdf",
    fileName: file.name,
    intakeId: payload.intakeId,
    modelVersion: payload.modelVersion,
    documentHash,
  });
  state.editorOpen = true;
  state.lastMessage = `PDF procesado: ${file.name}. Revisa los datos antes de guardar.`;
  await loadPeople();
}

async function handleFile(file) {
  try {
    await processFile(file);
  } catch (error) {
    state.error = error?.message || "No pudimos procesar el PDF.";
  } finally {
    state.busy = false;
    renderPanel();
  }
}

function bindEditorEvents(host) {
  host.querySelectorAll("[data-close-policy-editor]").forEach(button => button.addEventListener("click", closeEditor));
  host.querySelectorAll('input[name="personMode"]').forEach(input => input.addEventListener("change", () => {
    syncDraftFromEditor(host);
    renderEditor();
  }));
  host.querySelector("[data-confirm-policy-entry]")?.addEventListener("click", () => confirmEntry(host));
  host.addEventListener("input", () => syncDraftFromEditor(host));
  host.addEventListener("change", () => syncDraftFromEditor(host));
}

function bindPanelEvents(panel) {
  const input = panel.querySelector("[data-cartera-pdf-input]");
  const dropzone = panel.querySelector("[data-cartera-document-dropzone]");
  panel.querySelector("[data-select-cartera-pdf]")?.addEventListener("click", () => input?.click());
  panel.querySelector("[data-open-manual-policy]")?.addEventListener("click", openManualEditor);
  input?.addEventListener("change", () => handleFile(input.files?.[0]));
  dropzone?.addEventListener("keydown", event => {
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      input?.click();
    }
  });
  for (const eventName of ["dragenter", "dragover"]) {
    dropzone?.addEventListener(eventName, event => {
      if (isDemoSession()) return;
      event.preventDefault();
      state.dragActive = true;
      dropzone.dataset.dragActive = "true";
    });
  }
  for (const eventName of ["dragleave", "drop"]) {
    dropzone?.addEventListener(eventName, event => {
      event.preventDefault();
      state.dragActive = false;
      dropzone.dataset.dragActive = "false";
    });
  }
  dropzone?.addEventListener("drop", event => handleFile(event.dataTransfer?.files?.[0]));
}

function mount(root) {
  let panel = root.querySelector(PANEL_SELECTOR);
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "cartera-policy-entry";
    panel.dataset.carteraDocumentIntake = "true";
  }
  const frame = root.querySelector("[data-cartera-material3-frame]");
  if (frame) frame.before(panel);
  else if (root.dataset.carteraMaterial3State !== "auth-required" && root.dataset.carteraMaterial3State !== "signed-out") root.prepend(panel);
  state.panel = panel.isConnected ? panel : null;
  if (state.panel) renderPanel();
}

function boot() {
  ensureStyles();
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;
  mount(root);
  const observer = new MutationObserver(() => mount(root));
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-cartera-material3-state"] });
  globalThis.addEventListener("forge:auth-state-changed", event => {
    if (event.detail?.status === "anonymous") {
      generation += 1;
      state.editorOpen = false;
      state.draft = null;
      state.people = [];
      state.error = "";
    }
    mount(root);
  });
  globalThis.addEventListener("forge:demo-session-classified", () => mount(root));
  globalThis.addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();

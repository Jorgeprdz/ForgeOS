import {
  createProductiveIntelligenceAdapter,
} from "./pipeline-productive-intelligence-adapter.js?v=material3-productive-001";

const pipelineRuntimeBase = new URL(
  import.meta.url.includes("/docs/static-preview/")
    ? "../../../advisor-os/sales-pipeline/"
    : "../../advisor-os/sales-pipeline/",
  import.meta.url,
);

const legacyRuntimeBase = new URL(
  import.meta.url.includes("/docs/static-preview/")
    ? "../forge-alive/"
    : "../forge-alive-runtime/",
  import.meta.url,
);

const envUrl = new URL(
  import.meta.url.includes("/docs/static-preview/")
    ? "../../../env.js"
    : "../../env.js",
  import.meta.url,
);

await import(
  new URL("sales-stage-registry.js", pipelineRuntimeBase)
);
await import(
  new URL("pipeline-stage-read-model.js", pipelineRuntimeBase)
);

const pipelineStateKey = Symbol.for("forge.material3.pipeline.state");
const productiveSourceFilters = Object.freeze([
  "Referido",
  "Mercado cálido",
  "Mercado frío",
  "Redes sociales",
  "Centro de influencia",
]);
const productiveStatusFilters = Object.freeze([
  Object.freeze({ value: "referred_new", label: "Nuevo" }),
  Object.freeze({ value: "contacted", label: "Contactado" }),
  Object.freeze({ value: "appointment_scheduled", label: "Cita agendada" }),
  Object.freeze({ value: "proposal", label: "Propuesta" }),
  Object.freeze({ value: "decision", label: "En decisión" }),
  Object.freeze({ value: "client", label: "Cliente" }),
]);
let referralRuntimePromise;
let referralStylePromise;
let activeReferralSheet;

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character],
  );
}

const intelligenceLabels = Object.freeze({
  READY_FOR_HUMAN_REVIEW: "Listo para revisión",
  HANDLE_OBJECTION: "Atender objeción",
  OBJECTION_RECORDED: "Objeción registrada",
  STALL: "Conversación estancada",
  AVOIDING_DECISION: "Decisión aplazada",
  CURRENT: "Vigente",
  UNKNOWN: "Pendiente de confirmar",
});

function humanIntelligenceLabel(value) {
  const text = String(value ?? "");
  return Object.entries(intelligenceLabels).reduce(
    (human, [technical, label]) =>
      human.replace(new RegExp(`\\b${technical}\\b`, "g"), label),
    text,
  );
}

function connectedData() {
  return null;
}

function renderColumn(column) {
  const rows = column.items.map((item) => `
    <article class="pipeline-module__prospect">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.stageLabel)}</span>
      </div>
      <p>${escapeHtml(
        item.lastVerifiedActivity?.title ||
        item.lastVerifiedActivity?.label ||
        "Sin actividad verificada",
      )}</p>
    </article>
  `).join("");

  return `
    <section class="pipeline-module__stage" data-pipeline-stage="${escapeHtml(column.stageCode)}">
      <header>
        <h2>${escapeHtml(column.label)}</h2>
        <span>${column.count}</span>
      </header>
      ${rows || '<p class="pipeline-module__stage-empty">Sin prospectos</p>'}
    </section>
  `;
}

async function importRuntimeAsset(url) {
  await import(`${url.href}${url.search ? "&" : "?"}v=material3-referral-001`);
}

async function ensureReferralStyles() {
  if (referralStylePromise) return referralStylePromise;

  referralStylePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      "[data-material3-referral-styles]",
    );

    if (existing) {
      if (existing.sheet) resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL(
      "./pipeline-referral-modal.css?v=ui-m06-referral-003",
      import.meta.url,
    );
    stylesheet.dataset.material3ReferralStyles = "true";
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", reject, { once: true });
    document.head.append(stylesheet);
  });

  return referralStylePromise;
}

async function ensureReferralRuntime() {
  if (referralRuntimePromise) return referralRuntimePromise;

  referralRuntimePromise = (async () => {
    if (!globalThis.__ENV__) await importRuntimeAsset(envUrl);
    if (!globalThis.ForgeAlivePublicConfig067G17A1) {
      await importRuntimeAsset(new URL("forge-alive-public-config-067g17a1.js", legacyRuntimeBase));
    }
    return createProductiveIntelligenceAdapter();
  })().catch((error) => {
    referralRuntimePromise = undefined;
    throw error;
  });

  return referralRuntimePromise;
}

function referralSheetTemplate() {
  return `
    <div class="referral-sheet-layer" data-referral-sheet>
      <button
        class="referral-sheet__scrim"
        type="button"
        data-close-referral="scrim"
        aria-label="Cerrar formulario de referido"
      ></button>
      <section
        class="referral-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-sheet-title"
        tabindex="-1"
      >
        <form data-referral-form novalidate>
          <header class="referral-sheet__header">
            <div>
              <p>PIPELINE</p>
              <h2 id="referral-sheet-title">Agregar prospecto</h2>
            </div>
            <button
              class="referral-sheet__close"
              type="button"
              data-close-referral="button"
              aria-label="Cerrar"
            >×</button>
          </header>
          <div class="referral-sheet__body">
            <label>
              <span>Nombre completo *</span>
              <input name="fullName" autocomplete="name" required autofocus>
            </label>
            <label>
              <span>Teléfono o WhatsApp *</span>
              <input name="phone" type="tel" autocomplete="tel" required>
            </label>
            <label>
              <span>Fuente *</span>
              <select name="source" required data-prospect-source>
                <option value="">Selecciona una fuente</option>
                <option value="Referido">Referido</option>
                <option value="Mercado cálido">Mercado cálido</option>
                <option value="Mercado frío">Mercado frío</option>
                <option value="Redes sociales">Redes sociales</option>
                <option value="Centro de influencia">Centro de influencia</option>
              </select>
            </label>
            <div class="referral-sheet__source-fields" data-referral-source-fields hidden>
              <label>
                <span>Referido por</span>
                <input name="referrerName" autocomplete="off">
              </label>
              <label>
                <span>Relación con el referente</span>
                <input name="referrerRelationship" autocomplete="off">
              </label>
            </div>
            <label>
              <span>Contexto inicial breve *</span>
              <textarea name="initialContext" rows="3" required></textarea>
            </label>
            <details class="referral-sheet__optional">
              <summary>Agregar más datos</summary>
              <div>
                <label>
                  <span>Correo</span>
                  <input name="email" type="email" autocomplete="email">
                </label>
                <label>
                  <span>Fecha de nacimiento</span>
                  <input name="dateOfBirth" type="date">
                </label>
                <label>
                  <span>Ocupación</span>
                  <input name="occupation" autocomplete="organization-title">
                </label>
              </div>
            </details>
            <p class="referral-sheet__error" data-referral-error role="alert" hidden></p>
          </div>
          <footer class="referral-sheet__footer">
            <button type="submit" data-save-referral>Guardar referido</button>
          </footer>
        </form>
      </section>
    </div>
  `;
}

function referralPayload(form) {
  const values = new FormData(form);
  const optional = (name) => String(values.get(name) || "").trim() || undefined;
  const source = String(values.get("source") || "").trim();
  const referred = source === "Referido";
  return {
    fullName: String(values.get("fullName") || "").trim(),
    phone: String(values.get("phone") || "").trim(),
    source,
    status: "referred_new",
    referrerName: referred ? optional("referrerName") : undefined,
    referrerRelationship: referred ? optional("referrerRelationship") : undefined,
    initialContext: String(values.get("initialContext") || "").trim(),
    email: optional("email"),
    dateOfBirth: optional("dateOfBirth"),
    occupation: optional("occupation"),
  };
}

function referralErrorMessage(error) {
  if (error?.code === "AUTH_REQUIRED") {
    return "Tu sesión expiró. Inicia sesión nuevamente.";
  }
  if (error?.code === "DUPLICATE_PROSPECT") {
    return "Este prospecto ya existe en tu Pipeline.";
  }
  if (error?.code === "VALIDATION_ERROR") {
    return error.message || "Revisa los datos del referido.";
  }
  return "No pudimos guardar el referido. Revisa tu conexión e intenta nuevamente.";
}

async function openNashWorkspace({ card, adapter, trigger }) {
  const prepared = await adapter.prepareMessage(card.prospect);
  const layer = document.createElement("div");
  layer.className = "referral-sheet-layer";
  layer.dataset.nashProspectWorkspace = "true";
  layer.innerHTML = `
    <button class="referral-sheet__scrim" type="button" data-close-nash></button>
    <section class="referral-sheet" role="dialog" aria-modal="true" aria-labelledby="nash-workspace-title">
      <div class="referral-sheet__header">
        <div><p>NASH · REVISIÓN HUMANA</p><h2 id="nash-workspace-title">Preparar mensaje</h2></div>
        <button class="referral-sheet__close" type="button" data-close-nash aria-label="Cerrar">×</button>
      </div>
      <div class="referral-sheet__body">
        <p data-nash-source-mode>${escapeHtml(prepared.sourceMode)}</p>
        <p>Conversation Brief: ${prepared.conversationBriefProduced ? "Disponible" : "Contexto gobernado bloqueado"}</p>
        <label><span>Mensaje editable</span><textarea data-nash-draft>${escapeHtml(prepared.candidate.rawText || prepared.candidate.text || "")}</textarea></label>
        <p data-nash-approval-status>Revisión y aprobación humana requeridas.</p>
      </div>
      <div class="referral-sheet__footer">
        <button type="button" data-approve-nash-draft>Revisar y aprobar texto exacto</button>
        <a data-manual-whatsapp hidden>Continuar manualmente a WhatsApp</a>
      </div>
    </section>`;
  layer.dataset.nashApprovalState = "pending";
  const close = () => { layer.remove(); trigger.focus(); };
  layer.querySelectorAll("[data-close-nash]").forEach(node => node.addEventListener("click", close));
  const textarea = layer.querySelector("[data-nash-draft]");
  const link = layer.querySelector("[data-manual-whatsapp]");
  const status = layer.querySelector("[data-nash-approval-status]");
  const approveButton = layer.querySelector("[data-approve-nash-draft]");
  textarea.addEventListener("input", () => {
    layer.dataset.nashApprovalState = "pending";
    link.hidden = true;
    link.removeAttribute("href");
    approveButton.disabled = false;
    approveButton.textContent = "Revisar y aprobar texto exacto";
    status.textContent = "El texto cambió. Requiere una nueva aprobación exacta.";
  });
  approveButton.addEventListener("click", () => {
    const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06;
    const text = textarea.value;
    const validation = safety.draftSafetyValidator({
      draftText: text,
      draftCandidateSnapshot: { ...prepared.candidate, sendsMessage: false },
      humanApproval: { required: true, finalAuthority: "HUMAN" },
    });
    const approval = safety.approveExactDraft({
      draftText: text,
      validationResult: validation,
      humanDecision: safety.EXPLICIT_DRAFT_APPROVAL,
    });
    const gate = safety.exactDraftHumanApprovalGate({
      draftText: text, validationResult: validation, approvalSnapshot: approval,
    });
    const url = gate.exactDraftApproved
      ? globalThis.ForgeProductiveContactNavigationBoundary067G17B
        .whatsappUrl(card.prospect, "professional", text)
      : null;
    link.hidden = !url;
    if (url) link.href = url;
    layer.dataset.nashApprovalState = url ? "approved" : "blocked";
    approveButton.disabled = Boolean(url);
    approveButton.textContent = url ? "Texto exacto aprobado" : "Revisar y aprobar texto exacto";
    status.textContent = url ? "Texto exacto aprobado. Navegación manual habilitada." : "El mensaje no pasó la validación.";
  });
  document.body.append(layer);
  textarea.focus();
}

const displayValue = value => Array.isArray(value)
  ? (value.map(humanIntelligenceLabel).join(", ") || "No disponible")
  : value && typeof value === "object"
    ? Object.entries(value).map(([key, item]) => `${key}: ${humanIntelligenceLabel(item)}`).join(" · ")
    : humanIntelligenceLabel(value) || "No disponible";

async function openCombatWorkspace({ card, adapter, trigger, onReconciled }) {
  const layer = document.createElement("div");
  layer.className = "referral-sheet-layer";
  layer.dataset.nashCombatWorkspace = "true";
  layer.innerHTML = `
    <button class="referral-sheet__scrim" type="button" data-close-combat></button>
    <section class="referral-sheet nash-combat-workspace" role="dialog" aria-modal="true" aria-labelledby="combat-title">
      <div class="referral-sheet__header nash-combat-workspace__header"><div><p>NASH COMBAT · CANDIDATOS</p><h2 id="combat-title">${escapeHtml(card.fullName)}</h2><span data-combat-header-state>Esperando objeción</span></div><button class="referral-sheet__close" type="button" data-close-combat>×</button></div>
      <div class="referral-sheet__body nash-combat-workspace__body">
        <label><span>Objeción escuchada (no se guarda)</span><textarea data-combat-objection></textarea></label>
        <button type="button" data-analyze-combat>Analizar objeción</button>
        <div data-combat-results hidden></div>
      </div>
      <div class="referral-sheet__footer nash-combat-workspace__footer" data-combat-actions hidden>
        <button type="button" data-approve-combat>Revisar y aprobar texto exacto</button>
        <button type="button" data-register-combat>Registrar clasificación en Timeline</button>
        <a data-combat-whatsapp hidden>Continuar manualmente a WhatsApp</a>
      </div>
    </section>`;
  let combat;
  const close = () => { layer.remove(); trigger.focus(); };
  layer.querySelectorAll("[data-close-combat]").forEach(node => node.addEventListener("click", close));
  const results = layer.querySelector("[data-combat-results]");
  const actions = layer.querySelector("[data-combat-actions]");
  const body = layer.querySelector(".nash-combat-workspace__body");
  layer.querySelector("[data-analyze-combat]").addEventListener("click", async () => {
    const objection = layer.querySelector("[data-combat-objection]").value;
    combat = await adapter.analyzeCombat(card.prospect, objection);
    layer.querySelector("[data-combat-header-state]").textContent =
      `Objeción analizada: ${objection}`;
    results.hidden = false;
    actions.hidden = false;
    results.innerHTML = `
      <p>Tipo candidato: <strong data-combat-type data-combat-type-code="${escapeHtml(combat.classification.type)}">${escapeHtml(humanIntelligenceLabel(combat.classification.type))}</strong></p>
      <p>Intención candidata: <strong data-combat-intent data-combat-intent-code="${escapeHtml(combat.classification.intent)}">${escapeHtml(humanIntelligenceLabel(combat.classification.intent))}</strong></p>
      <p>Confianza: ${escapeHtml(combat.classification.confidence)}</p>
      <p>Intenciones posibles: ${escapeHtml(displayValue(combat.classification.possibleIntents))}</p>
      <p>Interpretación posible: ${escapeHtml(combat.psychology.psychology)}</p>
      <p>Estrategia recomendada: ${escapeHtml(combat.psychology.recommendedStrategy)}</p>
      <p>Riesgo: ${escapeHtml(combat.psychology.risk)}</p>
      <p>Siguiente movimiento candidato: ${escapeHtml(displayValue(combat.nextBestAction))}</p>
      <p>Soporte: ${escapeHtml(displayValue(combat.advisorGuidance))}</p>
      <label><span>Respuesta candidata editable</span><textarea data-combat-response>${escapeHtml(combat.objectionKillerMessage)}</textarea></label>
      <p data-combat-approval>Revisión y aprobación humana requeridas.</p>`;
    body.scrollTop = 0;
    const response = results.querySelector("[data-combat-response]");
    response.addEventListener("input", () => {
      const link = layer.querySelector("[data-combat-whatsapp]");
      link.hidden = true;
      link.removeAttribute("href");
      results.querySelector("[data-combat-approval]").textContent = "El texto cambió. Requiere una nueva aprobación exacta.";
    });
  });
  layer.querySelector("[data-approve-combat]").addEventListener("click", () => {
    const text = results.querySelector("[data-combat-response]")?.value || "";
    const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06;
    const snapshot = { rawText: text, sendsMessage: false, sourceMutable: true };
    const validation = safety.draftSafetyValidator({ draftText: text, draftCandidateSnapshot: snapshot, humanApproval: { required: true, finalAuthority: "HUMAN" } });
    const approval = safety.approveExactDraft({ draftText: text, validationResult: validation, humanDecision: safety.EXPLICIT_DRAFT_APPROVAL });
    const gate = safety.exactDraftHumanApprovalGate({ draftText: text, validationResult: validation, approvalSnapshot: approval });
    const url = gate.exactDraftApproved
      ? globalThis.ForgeProductiveContactNavigationBoundary067G17B.whatsappUrl(card.prospect, "professional", text)
      : null;
    const link = layer.querySelector("[data-combat-whatsapp]");
    link.hidden = !url;
    if (url) link.href = url;
    results.querySelector("[data-combat-approval]").textContent = url ? "Texto exacto aprobado. Navegación manual habilitada." : "El texto no pasó la validación.";
  });
  layer.querySelector("[data-register-combat]").addEventListener("click", async () => {
    if (!combat) return;
    await onReconciled(await adapter.registerObjectionClassification(card, combat));
    layer.querySelector("[data-register-combat]").disabled = true;
    results.insertAdjacentHTML("beforeend", "<p data-combat-timeline>Clasificación registrada sin texto crudo.</p>");
  });
  document.body.append(layer);
  body.scrollTop = 0;
  layer.querySelector("[data-combat-objection]").focus();
}

async function openNbaWorkspace({ card, adapter, trigger }) {
  const nba = await adapter.buildNba(card);
  const layer = document.createElement("div");
  layer.className = "referral-sheet-layer";
  layer.dataset.nbaWorkspace = "true";
  const field = (label, value) => `<p>${label}: ${escapeHtml(displayValue(value))}</p>`;
  layer.innerHTML = `
    <button class="referral-sheet__scrim" type="button" data-close-nba></button>
    <section class="referral-sheet nba-workspace" role="dialog" aria-modal="true" aria-labelledby="nba-title">
      <div class="referral-sheet__header"><div><p>NBA · REASON WHY</p><h2 id="nba-title">${escapeHtml(card.fullName)}</h2></div><button class="referral-sheet__close" data-close-nba>×</button></div>
      <div class="referral-sheet__body nba-workspace__body">
        ${field("Estado", nba.reconnectionStatus)}
        ${field("Acción candidata", nba.recommendedAction)}
        ${field("Reason Why", nba.reasonWhy)}
        ${field("Por qué ahora", nba.whyNow)}
        ${field("Por qué esta persona", nba.whyThisPerson)}
        ${field("Por qué esta acción", nba.whyThisAction)}
        ${field("Por qué este mensaje", nba.whyThisMessage)}
        ${field("Ángulo", nba.conversationAngle)}
        ${field("Soporte de objeción", nba.objectionSupport)}
        ${field("Frescura", nba.freshness)}
        ${field("Confianza", nba.confidence)}
        ${field("Limitaciones", nba.confidenceLimitations)}
        ${field("Advertencias", nba.warnings)}
        ${field("Contexto faltante", nba.missingContext)}
        <p data-nba-human-review>Revisión humana requerida · ejecución automática deshabilitada.</p>
        <details class="nba-workspace__technical">
          <summary>Evidencia técnica</summary>
          ${field("Referencias", nba.evidenceRefs)}
          ${field("Fuentes", nba.sourceOwners)}
        </details>
      </div>
      <div class="referral-sheet__footer"><button type="button" data-nba-prepare-message>Preparar mensaje con este contexto</button></div>
    </section>`;
  const close = () => { layer.remove(); trigger.focus(); };
  layer.querySelectorAll("[data-close-nba]").forEach(node => node.addEventListener("click", close));
  layer.querySelector("[data-nba-prepare-message]").addEventListener("click", () => {
    layer.remove();
    void openNashWorkspace({ card, adapter, trigger });
  });
  document.body.append(layer);
}

async function openReferralForm({ trigger, errorNode, onCreated }) {
  errorNode.hidden = true;
  errorNode.textContent = "";
  trigger.disabled = true;
  trigger.setAttribute("aria-busy", "true");

  try {
    await ensureReferralStyles();
    const service = await ensureReferralRuntime();
    if (activeReferralSheet) return;

    const host = document.createElement("div");
    host.innerHTML = referralSheetTemplate().trim();
    const layer = host.firstElementChild;
    const sheet = layer.querySelector(".referral-sheet");
    const form = layer.querySelector("[data-referral-form]");
    const formError = layer.querySelector("[data-referral-error]");
    const save = layer.querySelector("[data-save-referral]");
    const source = form.querySelector("[data-prospect-source]");
    const referralFields = form.querySelector("[data-referral-source-fields]");
    const previousOverflow = document.body.style.overflow;
    let dirty = false;

    const syncReferralFields = () => {
      const referred = source.value === "Referido";
      referralFields.hidden = !referred;
      if (!referred) {
        referralFields.querySelectorAll("input").forEach(input => {
          input.value = "";
        });
      }
    };
    source.addEventListener("change", syncReferralFields);
    syncReferralFields();

    const focusable = () => [...sheet.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    )];

    const close = ({ requireConfirmation = true } = {}) => {
      if (
        dirty &&
        requireConfirmation &&
        !globalThis.confirm("Hay cambios sin guardar. ¿Quieres cerrar?")
      ) {
        return false;
      }
      layer.remove();
      document.documentElement.removeAttribute(
        "data-forge-referral-sheet-open",
      );
      document.body.style.overflow = previousOverflow;
      activeReferralSheet = undefined;
      trigger.focus();
      return true;
    };

    layer.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-referral]")) close();
    });
    form.addEventListener("input", () => {
      dirty = true;
      form.dataset.dirty = "true";
    });
    layer.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        sheet.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      formError.hidden = true;
      save.disabled = true;
      save.setAttribute("aria-busy", "true");
      try {
        const prospect = await service.createProspect(referralPayload(form));
        dirty = false;
        close({ requireConfirmation: false });
        await onCreated(prospect, service);
      } catch (error) {
        formError.textContent = referralErrorMessage(error);
        formError.hidden = false;
      } finally {
        save.disabled = false;
        save.removeAttribute("aria-busy");
      }
    });

    document.body.append(layer);
    document.documentElement.setAttribute(
      "data-forge-referral-sheet-open",
      "true",
    );
    document.body.style.overflow = "hidden";
    activeReferralSheet = layer;
    requestAnimationFrame(() => {
      (form.querySelector("[autofocus]") || sheet).focus();
    });
  } catch (error) {
    errorNode.textContent =
      error?.code === "AUTH_REQUIRED"
        ? "Inicia sesión para agregar un referido."
        : "No pudimos abrir el formulario de referido. Reintenta.";
    errorNode.hidden = false;
  } finally {
    trigger.disabled = false;
    trigger.removeAttribute("aria-busy");
  }
}

export function createPipelineModule({ root, shell, dataProvider = connectedData }) {
  if (root[pipelineStateKey]) return root[pipelineStateKey];
  let mounted = false;
  let referralStatus = "";
  let productiveAdapter;
  let productiveCards = [];
  let productiveFilters = { source: "", status: "" };
  let productiveError = "";
  let productiveHydrated = false;
  const usesProductiveRuntime = dataProvider === connectedData;
  let authStatus = usesProductiveRuntime ? "AUTH_LOADING" : "AUTHENTICATED";

  function clearPrivateState() {
    productiveCards = [];
    productiveFilters = { source: "", status: "" };
    productiveAdapter = undefined;
    productiveHydrated = false;
    referralRuntimePromise = undefined;
    document.querySelectorAll?.(
      "[data-nash-prospect-workspace], [data-productive-context-workspace], [data-nash-combat-workspace], [data-nba-workspace]",
    ).forEach(node => node.remove());
    document.querySelectorAll?.("[data-manual-whatsapp], [data-combat-whatsapp]").forEach(link => {
      link.hidden = true;
      link.removeAttribute("href");
    });
  }

  async function reconcileAuthenticatedSession() {
    authStatus = "AUTH_LOADING";
    render();
    try {
      const session = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getSession?.();
      if (!session?.data?.session?.user?.id) {
        clearPrivateState();
        authStatus = "ANONYMOUS";
        render();
        return;
      }
      productiveHydrated = true;
      productiveAdapter = await ensureReferralRuntime();
      productiveCards = await productiveAdapter.reload();
      productiveError = "";
      authStatus = "AUTHENTICATED";
      render();
    } catch {
      clearPrivateState();
      authStatus = "AUTH_ERROR";
      render();
    }
  }

  function render() {
    if (usesProductiveRuntime && authStatus !== "AUTHENTICATED") {
      const loading = authStatus === "AUTH_LOADING";
      root.innerHTML = `
        <header class="pipeline-module__header"><p>PIPELINE</p><h1>Relaciones en movimiento</h1><span>${loading ? "Recuperando sesión" : "Datos privados protegidos"}</span></header>
        <section class="pipeline-module__empty" data-pipeline-auth-state="${authStatus}">
          <div class="pipeline-module__empty-copy">
            <h2>${loading ? "Recuperando tu sesión" : authStatus === "AUTH_ERROR" ? "No pudimos recuperar tu sesión" : "Inicia sesión para abrir tu Pipeline"}</h2>
            <p>${loading ? "Estamos verificando tu cuenta de Forge." : "Tus prospectos y Timeline sólo aparecen con tu cuenta autenticada."}</p>
          </div>
          ${loading ? "" : '<button type="button" class="pipeline-module__create" data-forge-auth-open>Continuar con Google</button>'}
        </section>`;
      root.querySelector?.("[data-forge-auth-open]")?.addEventListener("click", () => {
        globalThis.ForgeAliveAuthEntry067G17B1?.openAuthPanel?.({ nav: "pipeline" });
      });
      return;
    }
    const data = dataProvider?.() || {};
    const model = globalThis.ForgePipelineStageReadModel.buildPipelineStageReadModel({
      opportunities: Array.isArray(data.opportunities) ? data.opportunities : [],
      prospects: Array.isArray(data.prospects) ? data.prospects : [],
      writerAvailable: false,
    });
    const productive = productiveCards.length > 0;
    const filteredProductiveCards = productiveCards.filter(card =>
      (!productiveFilters.source || card.sourceValue === productiveFilters.source)
      && (!productiveFilters.status || card.status === productiveFilters.status)
    );
    const count = productive
      ? productiveCards.length
      : model.columns.reduce((total, column) => total + column.count, 0);
    root.innerHTML = `
      <header class="pipeline-module__header">
        <p>PIPELINE</p>
        <h1>Relaciones en movimiento</h1>
        <span>${count} prospecto${count === 1 ? "" : "s"}</span>
      </header>
      <p
        class="pipeline-module__referral-status"
        data-referral-status
        role="status"
        ${referralStatus ? "" : "hidden"}
      >${escapeHtml(referralStatus)}</p>
      ${productiveError ? `<p class="pipeline-module__create-error" role="alert">${escapeHtml(productiveError)}</p>` : ""}
      ${count === 0
        ? `<section
            class="pipeline-module__empty"
            aria-labelledby="pipeline-empty-title"
          >
            <div class="pipeline-module__empty-copy">
              <h2 id="pipeline-empty-title">Tu Pipeline está listo</h2>
              <p>No hay prospectos conectados en este momento.</p>
            </div>
            <button
              class="pipeline-module__create"
              type="button"
              data-pipeline-create-referral
              data-open-referral
              aria-label="Agregar prospecto"
            >
              <span aria-hidden="true">＋</span>
              <span>Agregar prospecto</span>
            </button>
            <p
              class="pipeline-module__create-error"
              data-pipeline-create-error
              role="alert"
              hidden
            ></p>
          </section>`
        : productive
          ? `<section class="pipeline-module__filters" data-productive-filter-bar aria-label="Filtros del Pipeline">
              <label>
                <span>Fuente</span>
                <select data-productive-filter-source>
                  <option value="">Todas las fuentes</option>
                  ${productiveSourceFilters.map(source => `<option value="${escapeHtml(source)}" ${productiveFilters.source === source ? "selected" : ""}>${escapeHtml(source)}</option>`).join("")}
                </select>
              </label>
              <label>
                <span>Estado</span>
                <select data-productive-filter-status>
                  <option value="">Todos los estados</option>
                  ${productiveStatusFilters.map(option => `<option value="${escapeHtml(option.value)}" ${productiveFilters.status === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
                </select>
              </label>
              <p data-productive-filter-count aria-live="polite">${filteredProductiveCards.length} de ${productiveCards.length} prospectos</p>
              <button type="button" data-clear-productive-filters ${productiveFilters.source || productiveFilters.status ? "" : "disabled"}>Limpiar filtros</button>
            </section>
            ${filteredProductiveCards.length
              ? `<div class="pipeline-module__stages" data-productive-pipeline-cards>
              ${filteredProductiveCards.map(card => `
                <article class="pipeline-module__prospect pipeline-module__productive-card" data-productive-prospect-card="${escapeHtml(card.id)}" data-productive-source="${escapeHtml(card.sourceValue)}" data-productive-stage="${escapeHtml(card.status)}">
                  <header class="pipeline-module__productive-identity" data-productive-card-identity>
                    <strong>${escapeHtml(card.fullName)}</strong>
                    <span class="pipeline-module__productive-stage" data-productive-stage-label>${escapeHtml(card.stageLabel)}</span>
                  </header>
                  <div class="pipeline-module__productive-meta" data-productive-card-metadata>
                    <span>Fuente</span>
                    <p data-productive-source-label>${escapeHtml(card.sourceSummary)}</p>
                  </div>
                  <label class="pipeline-module__stage-control">
                    <span>Estado del prospecto</span>
                    <select data-productive-stage-control="${escapeHtml(card.id)}" aria-label="Cambiar estado de ${escapeHtml(card.fullName)}">
                      ${card.stageOptions.map(option => `<option value="${escapeHtml(option.value)}" ${option.value === card.status ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
                    </select>
                  </label>
                  <div class="pipeline-module__productive-status" data-productive-card-status>
                    <p data-timeline-activity data-activity-source="${card.latestActivity ? "TIMELINE" : "UNKNOWN"}">
                      <span>Última actividad</span>
                      <strong>${escapeHtml(card.latestActivity?.label || "Sin actividad verificada")}</strong>
                    </p>
                    ${card.nextCommitment ? `<p><span>Próximo compromiso</span><strong>${escapeHtml(card.nextCommitment.type)} · ${escapeHtml(card.nextCommitment.dueAt)}</strong></p>` : ""}
                    <p><span>Asistencia</span><strong>${escapeHtml(card.intelligenceLabel || "Disponible al solicitarla")}</strong></p>
                  </div>
                  <div class="pipeline-module__card-actions" data-productive-card-actions aria-label="Acciones del prospecto">
                    <button class="pipeline-module__action--context" type="button" data-view-productive-context="${escapeHtml(card.id)}">Ver contexto</button>
                    <button class="pipeline-module__action--primary" type="button" data-prepare-productive-message="${escapeHtml(card.id)}">Preparar mensaje</button>
                    <button class="pipeline-module__action--combat" type="button" data-open-combat="${escapeHtml(card.id)}">NASH Combat</button>
                    <button class="pipeline-module__action--nba" type="button" data-open-nba="${escapeHtml(card.id)}">Revisar NBA</button>
                    ${card.phone ? `<a class="pipeline-module__action--call" href="tel:${escapeHtml(card.phone)}">Llamar</a>` : ""}
                    <button class="pipeline-module__action--calendar" type="button" disabled title="NOT_CONNECTED">Agendar</button>
                  </div>
                </article>`).join("")}
            </div>`
              : `<section class="pipeline-module__filter-empty" data-productive-filter-empty>
                  <p>No hay prospectos que coincidan con estos filtros.</p>
                </section>`}`
          : `<div class="pipeline-module__stages">${model.columns.map(renderColumn).join("")}</div>`}
    `;

    const createReferral = root.querySelector?.(
      "[data-pipeline-create-referral]",
    );
    const errorNode = root.querySelector?.(
      "[data-pipeline-create-error]",
    );

    root.querySelector?.("[data-productive-filter-source]")?.addEventListener("change", event => {
      productiveFilters = { ...productiveFilters, source: event.currentTarget.value };
      render();
    });
    root.querySelector?.("[data-productive-filter-status]")?.addEventListener("change", event => {
      productiveFilters = { ...productiveFilters, status: event.currentTarget.value };
      render();
    });
    root.querySelector?.("[data-clear-productive-filters]")?.addEventListener("click", () => {
      productiveFilters = { source: "", status: "" };
      render();
    });

    createReferral?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void openReferralForm({
        trigger: createReferral,
        errorNode,
        onCreated: async (prospect, service) => {
          void prospect;
          productiveCards = await service.reload();
          referralStatus = "Referido guardado.";
          render();
        },
      });
    });

    root.querySelectorAll?.("[data-prepare-productive-message]").forEach(trigger => {
      trigger.addEventListener("click", () => {
        const card = productiveCards.find(item => item.id === trigger.dataset.prepareProductiveMessage);
        if (card && productiveAdapter) void openNashWorkspace({ card, adapter: productiveAdapter, trigger });
      });
    });
    root.querySelectorAll?.("[data-productive-stage-control]").forEach(select => {
      select.addEventListener("change", async () => {
        const card = productiveCards.find(item => item.id === select.dataset.productiveStageControl);
        if (!card || !productiveAdapter || select.value === card.status) return;
        const previous = card.status;
        select.disabled = true;
        select.removeAttribute("aria-invalid");
        try {
          productiveCards = await productiveAdapter.updateStage(card.id, select.value);
          referralStatus = "Etapa actualizada.";
          render();
        } catch {
          select.value = previous;
          select.disabled = false;
          select.setAttribute("aria-invalid", "true");
          productiveError = "No pudimos actualizar la etapa.";
        }
      });
    });
    root.querySelectorAll?.("[data-open-combat]").forEach(trigger => {
      trigger.addEventListener("click", () => {
        const card = productiveCards.find(item => item.id === trigger.dataset.openCombat);
        if (card && productiveAdapter) void openCombatWorkspace({
          card, adapter: productiveAdapter, trigger,
          onReconciled: async cards => { productiveCards = cards; render(); },
        });
      });
    });
    root.querySelectorAll?.("[data-open-nba]").forEach(trigger => {
      trigger.addEventListener("click", () => {
        const card = productiveCards.find(item => item.id === trigger.dataset.openNba);
        if (card && productiveAdapter) void openNbaWorkspace({ card, adapter: productiveAdapter, trigger });
      });
    });
    root.querySelectorAll?.("[data-view-productive-context]").forEach(trigger => {
      trigger.addEventListener("click", () => {
        const card = productiveCards.find(item => item.id === trigger.dataset.viewProductiveContext);
        if (!card) return;
        const layer = document.createElement("div");
        layer.className = "referral-sheet-layer";
        layer.dataset.productiveContextWorkspace = "true";
        const objectionState = card.timeline.some(event => event.eventType === "OBJECTION_RECORDED")
          ? "clasificación persistida disponible" : "sin clasificación persistida";
        layer.innerHTML = `<button class="referral-sheet__scrim" data-close-context></button><section class="referral-sheet" role="dialog" aria-modal="true"><div class="referral-sheet__header"><div><p>CONTEXTO PRODUCTIVO</p><h2>${escapeHtml(card.fullName)}</h2></div><button class="referral-sheet__close" data-close-context>×</button></div><div class="referral-sheet__body"><p>${escapeHtml(card.stageLabel)}</p><p>${escapeHtml(card.sourceSummary)}</p><p data-context-timeline>${escapeHtml(card.latestActivity?.label || "Sin actividad verificada")}</p><p>NBA: disponible para revisión</p><p>Objeciones: ${objectionState}</p><p>Mi Día: NOT_CONNECTED</p><p>Calendar: NOT_CONNECTED</p></div></section>`;
        layer.querySelectorAll("[data-close-context]").forEach(node => node.addEventListener("click", () => { layer.remove(); trigger.focus(); }));
        document.body.append(layer);
      });
    });

    if (usesProductiveRuntime && !productiveHydrated) {
      productiveHydrated = true;
      void Promise.all([
        ensureReferralStyles(),
        ensureReferralRuntime(),
      ]).then(async ([, adapter]) => {
        productiveAdapter = adapter;
        productiveCards = await adapter.reload();
        render();
      }).catch((error) => {
        productiveError = error?.code === "AUTH_REQUIRED"
          ? "Inicia sesión para cargar tu Pipeline."
          : "No pudimos cargar el Pipeline productivo.";
        render();
      });
    }
  }

  const api = Object.freeze({
    id: "pipeline",
    root,
    mount() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      if (!mounted) {
        mounted = true;
        render();
        if (usesProductiveRuntime) void reconcileAuthenticatedSession();
      }
      shell.syncVisualViewport();
    },
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
    },
    unmount() {
      root.hidden = true;
      root.dataset.moduleActive = "false";
    },
  });
  root[pipelineStateKey] = api;
  if (usesProductiveRuntime) {
    globalThis.addEventListener("forge:auth-state-changed", event => {
      const status = String(event.detail?.status || "").toLowerCase();
      if (status === "authenticated") void reconcileAuthenticatedSession();
      else if (["anonymous", "auth_error"].includes(status)) {
        clearPrivateState();
        authStatus = status === "auth_error" ? "AUTH_ERROR" : "ANONYMOUS";
        render();
      } else {
        authStatus = "AUTH_LOADING";
        render();
      }
    });
  }
  return api;
}

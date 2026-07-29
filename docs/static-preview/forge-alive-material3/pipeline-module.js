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
              <h2 id="referral-sheet-title">Agregar nuevo referido</h2>
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
              <span>Referido por</span>
              <input name="referrerName" autocomplete="off">
            </label>
            <label>
              <span>Relación con el referente</span>
              <input name="referrerRelationship" autocomplete="off">
            </label>
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
  return {
    fullName: String(values.get("fullName") || "").trim(),
    phone: String(values.get("phone") || "").trim(),
    source: "Referido",
    status: "referred_new",
    referrerName: optional("referrerName"),
    referrerRelationship: optional("referrerRelationship"),
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
  const close = () => { layer.remove(); trigger.focus(); };
  layer.querySelectorAll("[data-close-nash]").forEach(node => node.addEventListener("click", close));
  const textarea = layer.querySelector("[data-nash-draft]");
  const link = layer.querySelector("[data-manual-whatsapp]");
  const status = layer.querySelector("[data-nash-approval-status]");
  textarea.addEventListener("input", () => {
    link.hidden = true;
    link.removeAttribute("href");
    status.textContent = "El texto cambió. Requiere una nueva aprobación exacta.";
  });
  layer.querySelector("[data-approve-nash-draft]").addEventListener("click", () => {
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
    status.textContent = url ? "Texto exacto aprobado. Navegación manual habilitada." : "El mensaje no pasó la validación.";
  });
  document.body.append(layer);
  textarea.focus();
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
    const previousOverflow = document.body.style.overflow;
    let dirty = false;

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
  let productiveError = "";
  let productiveHydrated = false;
  const usesProductiveRuntime = dataProvider === connectedData;

  function render() {
    const data = dataProvider?.() || {};
    const model = globalThis.ForgePipelineStageReadModel.buildPipelineStageReadModel({
      opportunities: Array.isArray(data.opportunities) ? data.opportunities : [],
      prospects: Array.isArray(data.prospects) ? data.prospects : [],
      writerAvailable: false,
    });
    const productive = productiveCards.length > 0;
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
              aria-label="Agregar nuevo referido"
            >
              <span aria-hidden="true">＋</span>
              <span>Agregar nuevo referido</span>
            </button>
            <p
              class="pipeline-module__create-error"
              data-pipeline-create-error
              role="alert"
              hidden
            ></p>
          </section>`
        : productive
          ? `<div class="pipeline-module__stages" data-productive-pipeline-cards>
              ${productiveCards.map(card => `
                <article class="pipeline-module__prospect" data-productive-prospect-card="${escapeHtml(card.id)}">
                  <div><strong>${escapeHtml(card.fullName)}</strong><span>${escapeHtml(card.stageLabel)}</span></div>
                  <p>${escapeHtml(card.sourceSummary)}</p>
                  <p data-timeline-activity data-activity-source="${card.latestActivity ? "TIMELINE" : "UNKNOWN"}">${escapeHtml(card.latestActivity?.label || "Sin actividad verificada")}</p>
                  ${card.nextCommitment ? `<p>${escapeHtml(card.nextCommitment.type)} · ${escapeHtml(card.nextCommitment.dueAt)}</p>` : ""}
                  <p>${escapeHtml(card.intelligenceState)}</p>
                  <div class="pipeline-module__card-actions">
                    <button type="button" data-view-productive-context="${escapeHtml(card.id)}">Ver contexto</button>
                    <button type="button" data-prepare-productive-message="${escapeHtml(card.id)}">Preparar mensaje</button>
                    ${card.phone ? `<a href="tel:${escapeHtml(card.phone)}">Llamar</a>` : ""}
                    <button type="button" disabled title="NOT_CONNECTED">Agendar</button>
                  </div>
                </article>`).join("")}
            </div>`
          : `<div class="pipeline-module__stages">${model.columns.map(renderColumn).join("")}</div>`}
    `;

    const createReferral = root.querySelector?.(
      "[data-pipeline-create-referral]",
    );
    const errorNode = root.querySelector?.(
      "[data-pipeline-create-error]",
    );

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
    root.querySelectorAll?.("[data-view-productive-context]").forEach(trigger => {
      trigger.addEventListener("click", () => {
        const card = productiveCards.find(item => item.id === trigger.dataset.viewProductiveContext);
        if (!card) return;
        const layer = document.createElement("div");
        layer.className = "referral-sheet-layer";
        layer.dataset.productiveContextWorkspace = "true";
        layer.innerHTML = `<button class="referral-sheet__scrim" data-close-context></button><section class="referral-sheet" role="dialog" aria-modal="true"><div class="referral-sheet__header"><div><p>CONTEXTO PRODUCTIVO</p><h2>${escapeHtml(card.fullName)}</h2></div><button class="referral-sheet__close" data-close-context>×</button></div><div class="referral-sheet__body"><p>${escapeHtml(card.stageLabel)}</p><p>${escapeHtml(card.sourceSummary)}</p><p data-context-timeline>${escapeHtml(card.latestActivity?.label || "Sin actividad verificada")}</p><p>NBA: NOT_CONNECTED</p><p>Mi Día: NOT_CONNECTED</p><p>Objeciones: NOT_CONNECTED</p></div></section>`;
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
  return api;
}

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
  const value = globalThis.__FORGE_MATERIAL3_PIPELINE_DATA__;
  return value && typeof value === "object"
    ? value
    : { opportunities: [], prospects: [] };
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
    if (!globalThis.__ENV__) {
      await importRuntimeAsset(envUrl);
    }

    if (!globalThis.ForgeAlivePublicConfig067G17A1) {
      await importRuntimeAsset(
        new URL(
          "forge-alive-public-config-067g17a1.js",
          legacyRuntimeBase,
        ),
      );
    }

    for (const asset of [
      "productive-prospect-service.js",
      "productive-prospect-bootstrap.js",
    ]) {
      await importRuntimeAsset(new URL(asset, pipelineRuntimeBase));
    }

    const bootstrap =
      globalThis.ForgeProductiveProspectBootstrap067G17B;
    const productiveService =
      globalThis.ForgeProductiveProspectService067G17B;

    if (
      typeof bootstrap?.getClient !== "function" ||
      typeof productiveService?.create !== "function"
    ) {
      throw new Error("PRODUCTIVE_REFERRAL_RUNTIME_UNAVAILABLE");
    }

    const client = await bootstrap.getClient();
    return productiveService.create(client);
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
  let savedReferralProspect;

  function render() {
    const data = dataProvider() || {};
    const model = globalThis.ForgePipelineStageReadModel.buildPipelineStageReadModel({
      opportunities: Array.isArray(data.opportunities) ? data.opportunities : [],
      prospects: Array.isArray(data.prospects) ? data.prospects : [],
      writerAvailable: false,
    });
    const count = model.columns.reduce((total, column) => total + column.count, 0);
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
      ${savedReferralProspect
        ? `<article
            class="pipeline-module__prospect pipeline-module__saved-referral"
            data-saved-referral-card
          >
            <div>
              <strong>${escapeHtml(
                savedReferralProspect.fullName ||
                savedReferralProspect.displayName,
              )}</strong>
              <span>Nuevo referido</span>
            </div>
            <p>${escapeHtml(savedReferralProspect.phone || "Contacto guardado")}</p>
          </article>`
        : ""}
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
          const current = dataProvider() || {};
          let prospects = Array.isArray(current.prospects)
            ? [...current.prospects, prospect]
            : [prospect];
          try {
            prospects = await service.listProspects();
          } catch {
            // The successful create remains authoritative if refresh is unavailable.
          }
          globalThis.__FORGE_MATERIAL3_PIPELINE_DATA__ = {
            ...current,
            prospects,
          };
          savedReferralProspect = prospect;
          referralStatus = "Referido guardado.";
          render();
        },
      });
    });

    void Promise.all([
      ensureReferralStyles(),
      ensureReferralRuntime(),
    ]).catch(() => {});
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

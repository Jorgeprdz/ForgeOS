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
      "./pipeline-referral-modal.css?v=ui-m06-referral-001",
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
      "productive-prospect-ui.js",
      "productive-prospect-bootstrap.js",
    ]) {
      await importRuntimeAsset(new URL(asset, pipelineRuntimeBase));
    }

    const bootstrap =
      globalThis.ForgeProductiveProspectBootstrap067G17B;
    const productiveUi =
      globalThis.ForgeProductiveProspectUI067G17B;

    if (
      typeof bootstrap?.getClient !== "function" ||
      typeof productiveUi?.create !== "function"
    ) {
      throw new Error("PRODUCTIVE_REFERRAL_RUNTIME_UNAVAILABLE");
    }

    const client = await bootstrap.getClient();
    let host = document.querySelector(
      "[data-material3-productive-referral-host]",
    );

    if (!host) {
      host = document.createElement("div");
      host.hidden = true;
      host.dataset.material3ProductiveReferralHost = "true";
      document.body.append(host);
    }

    return productiveUi.create({
      client,
      root: host,
      renderPipeline: () => "",
    });
  })().catch((error) => {
    referralRuntimePromise = undefined;
    throw error;
  });

  return referralRuntimePromise;
}

async function openReferralForm({ trigger, shell, errorNode }) {
  errorNode.hidden = true;
  errorNode.textContent = "";
  shell.setAlfred(false);
  trigger.disabled = true;
  trigger.setAttribute("aria-busy", "true");

  try {
    await ensureReferralStyles();
    const runtime = await ensureReferralRuntime();
    const modal = runtime.openProductiveProspectCreateModal(
      {
        source: "Referido",
        status: "referred_new",
      },
      trigger,
    );

    modal.dataset.material3ReferralModal = "true";

    const title = modal.querySelector("#prospect-form-title");
    const save = modal.querySelector("[data-save-prospect]");
    const source = modal.querySelector('[name="source"]');

    if (title) title.textContent = "Agregar nuevo referido";
    if (save) save.textContent = "Guardar referido";
    if (source) {
      source.value = "Referido";
      source.dispatchEvent(new Event("change", { bubbles: true }));
    }
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
        shell,
        errorNode,
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

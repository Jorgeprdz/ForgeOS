const pipelineRuntimeBase = new URL(
  import.meta.url.includes("/docs/static-preview/")
    ? "../../../advisor-os/sales-pipeline/"
    : "../../advisor-os/sales-pipeline/",
  import.meta.url,
);

await import(
  new URL("sales-stage-registry.js", pipelineRuntimeBase)
);
await import(
  new URL("pipeline-stage-read-model.js", pipelineRuntimeBase)
);

const pipelineStateKey = Symbol.for("forge.material3.pipeline.state");

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
        ? `<section class="pipeline-module__empty" role="status">
            <h2>Tu Pipeline está listo</h2>
            <p>No hay prospectos conectados en este momento.</p>
          </section>`
        : `<div class="pipeline-module__stages">${model.columns.map(renderColumn).join("")}</div>`}
    `;
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

import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v10-013.js?v=forge-commercial-compass-015-base';

const STYLE_ID = 'forge-commercial-compass-015-cartera-style';
const RECONCILE_DELAYS = Object.freeze([0, 40, 160, 500, 1200, 2600, 5200, 9000, 12000]);
const PHASE = 'FORGE_COMMERCIAL_COMPASS_015';

function text(value) {
  return String(value ?? '').trim();
}

function setText(node, value) {
  if (node && text(node.textContent) !== value) node.textContent = value;
}

function installStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .cartera-dialog-layer{padding:max(10px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))}
    .cartera-dialog{display:grid!important;grid-template-rows:auto minmax(0,1fr) auto!important;max-height:min(94dvh,980px)!important;overflow:hidden!important}
    .cartera-dialog>header{position:sticky;top:0;z-index:5;background:inherit}
    .cartera-dialog__body{min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:max(18px,env(safe-area-inset-bottom))}
    .cartera-dialog>footer{position:sticky;bottom:0;z-index:5;background:inherit}
    .cartera-semantic-decisions{min-width:0}
    .cartera-semantic-confirm{position:sticky!important;bottom:0!important;z-index:6!important;background:color-mix(in srgb,#fff 94%,transparent);backdrop-filter:blur(10px);border-top:1px solid #e1e4ea;margin-inline:calc(-1 * clamp(12px,2vw,24px));padding:12px clamp(12px,2vw,24px) max(12px,env(safe-area-inset-bottom))!important;box-shadow:0 -10px 28px rgba(26,34,51,.08)}
    .cartera-semantic-confirm .cartera-primary{min-height:48px;white-space:normal}
    .cartera-semantic-coverages{max-width:100%;min-width:0}
    .cartera-semantic-coverage{min-width:0;grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(90px,.7fr))!important}
    .cartera-semantic-coverage>*{min-width:0;overflow-wrap:anywhere}
    [data-pdf-performance-015]{font-variant-numeric:tabular-nums}
    @media(max-width:760px){
      .cartera-dialog-layer{padding:0;align-items:end}
      .cartera-dialog{width:100%!important;max-width:none!important;max-height:96dvh!important;border-radius:24px 24px 0 0!important}
      .cartera-dialog__body{padding-inline:14px!important}
      .cartera-semantic-coverage{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important}
      .cartera-semantic-confirm{margin-inline:-14px!important;padding-inline:14px!important}
      .cartera-progress{overflow-x:auto;scrollbar-width:none;white-space:nowrap}
    }
  `;
  doc.head.append(style);
}

function perfState(windowRef) {
  if (!windowRef.__FORGE_015_PDF_PERF__) {
    windowRef.__FORGE_015_PDF_PERF__ = {
      phase: PHASE,
      runs: [],
      active: null,
      observerPolicy: 'NO_NEW_OBSERVER_IN_015_WRAPPER',
    };
  }
  return windowRef.__FORGE_015_PDF_PERF__;
}

function now(windowRef) {
  return Number(windowRef.performance?.now?.() ?? Date.now());
}

function mark(run, key, windowRef) {
  if (!run || Number.isFinite(run[key])) return;
  run[key] = now(windowRef);
  if (Number.isFinite(run.T0)) run[`${key}Ms`] = Math.round((run[key] - run.T0) * 10) / 10;
}

function beginPdfRun(file, windowRef) {
  const state = perfState(windowRef);
  const run = {
    runId: `PDF015:${Date.now()}:${state.runs.length + 1}`,
    fileName: String(file?.name || ''),
    fileBytes: Number(file?.size || 0),
    mimeType: String(file?.type || ''),
    startedAt: new Date().toISOString(),
    T0: now(windowRef),
    T0Ms: 0,
    T0Meaning: 'file_selected',
    T1Meaning: 'client_validation_passed',
    T2Meaning: 'processing_surface_visible',
    T3Meaning: 'extraction_result_observed',
    T4Meaning: 'semantic_classification_observed',
    T5Meaning: 'review_candidate_ready',
    T6Meaning: 'human_review_visible',
    T7Meaning: 'review_enrichment_ready',
    internalResolution: 'observable_runtime_boundaries',
  };
  const valid = run.fileBytes > 0 && (/\.pdf$/i.test(run.fileName) || run.mimeType.toLowerCase() === 'application/pdf');
  if (valid) mark(run, 'T1', windowRef);
  state.active = run;
  state.runs.push(run);
  if (state.runs.length > 20) state.runs.splice(0, state.runs.length - 20);
  return run;
}

function humanizeRoot(root) {
  root.querySelectorAll('p,small,strong,h1,h2,h3,summary,dt,dd,span').forEach(node => {
    const current = text(node.textContent);
    if (!current || node.children.length) return;
    let next = current
      .replace(/Policy Workspace/gi, 'Póliza')
      .replace(/Person Workspace/gi, 'Relación')
      .replace(/Evidence Version/gi, 'documento revisado')
      .replace(/Policy Truth/gi, 'información confirmada')
      .replace(/verdad canónica/gi, 'información confirmada')
      .replace(/hechos canónicos/gi, 'datos confirmados')
      .replace(/evidencia recuperada/gi, 'información recuperada del documento')
      .replace(/evidencia/gi, 'información del documento')
      .replace(/hijos independientes de la póliza/gi, 'elementos de cobertura registrados por separado')
      .replace(/metadata técnica/gi, 'información adicional')
      .replace(/Información técnica e historial/gi, 'Historial y detalles');
    if (next !== current) node.textContent = next;
  });

  root.querySelectorAll('.cartera-warning').forEach(node => {
    const current = text(node.textContent);
    if (/No hay detalle de coberturas confirmado|no se identificó una sección de coberturas|coberturas por identificar/i.test(current)) {
      node.innerHTML = '<strong>No encontramos información suficiente sobre las coberturas.</strong><br>Puedes revisarlas en el documento o agregarlas manualmente.';
    }
  });
}

function humanizePdfDialog(doc, windowRef) {
  const layer = doc.querySelector('.cartera-dialog-layer');
  const dialog = layer?.querySelector('.cartera-dialog');
  if (!dialog) return;
  const body = dialog.querySelector('.cartera-dialog__body');
  const run = perfState(windowRef).active;

  if (/Procesando documento/i.test(text(body?.textContent))) mark(run, 'T2', windowRef);

  const review = dialog.querySelector('[data-semantic-review], [data-pdf-review]');
  if (review) {
    mark(run, 'T3', windowRef);
    mark(run, 'T4', windowRef);
    mark(run, 'T5', windowRef);
    mark(run, 'T6', windowRef);
  }
  if (dialog.querySelector('[data-semantic-boundary="014"]') || dialog.querySelector('.cartera-semantic-coverages')) {
    mark(run, 'T7', windowRef);
  }

  dialog.querySelectorAll('.cartera-progress span').forEach((span, index) => {
    const labels = ['1 Documento', '2 Lectura', '3 Datos', '4 Revisión', '5 Guardar'];
    if (labels[index]) setText(span, labels[index]);
  });

  const coverageSection = dialog.querySelector('#semantic-coverage-title')?.closest('.cartera-semantic-section');
  if (coverageSection) {
    setText(coverageSection.querySelector('#semantic-coverage-title'), 'Coberturas encontradas');
    const rows = coverageSection.querySelectorAll('[data-coverage-candidate]');
    const headerParagraph = coverageSection.querySelector('header p');
    if (rows.length) {
      setText(headerParagraph, 'Encontramos estas coberturas en el documento. Revísalas antes de incorporarlas.');
      const count = coverageSection.querySelector('header > span');
      if (count) setText(count, `${rows.length} encontradas`);
    } else {
      setText(headerParagraph, 'No encontramos información suficiente sobre las coberturas. Puedes revisarlas o agregarlas manualmente.');
      coverageSection.querySelectorAll('.cartera-warning,.cartera-info').forEach(node => {
        if (/cobertura|sección/i.test(text(node.textContent))) {
          node.innerHTML = '<strong>No encontramos información suficiente sobre las coberturas.</strong><br>Puedes revisarlas en el documento o agregarlas manualmente.';
        }
      });
    }
  }

  const submit = dialog.querySelector('[data-pdf-review] [type="submit"]');
  if (submit && !/Confirmando|Guardando/i.test(text(submit.textContent))) setText(submit, 'Guardar póliza');
  const confirm = dialog.querySelector('.cartera-semantic-confirm');
  if (confirm) {
    const description = confirm.querySelector('div');
    if (description) description.innerHTML = '<strong>Revisa antes de guardar.</strong><small>Forge incorporará únicamente lo que confirmes aquí.</small>';
  }

  dialog.querySelectorAll('p,small,strong,h2,h3,legend,label,span,summary').forEach(node => {
    const current = text(node.textContent);
    if (!current || node.children.length) return;
    let next = current
      .replace(/verdad canónica/gi, 'información confirmada')
      .replace(/Policy Truth/gi, 'información confirmada')
      .replace(/hechos documentales/gi, 'datos del documento')
      .replace(/frontera de verdad/gi, 'confirmación final')
      .replace(/writers gobernados/gi, 'guardado seguro')
      .replace(/evidencia/gi, 'documento')
      .replace(/candidatas/gi, 'encontradas')
      .replace(/Confianza de extracción/gi, 'Calidad de lectura')
      .replace(/Dato estructurado disponible/gi, 'Información disponible');
    if (next !== current) node.textContent = next;
  });

  if (run?.T6Ms !== undefined) {
    dialog.dataset.pdfReviewVisibleMs015 = String(run.T6Ms);
  }
}

export function createCarteraModule(options = {}) {
  const root = options.root;
  const doc = root?.ownerDocument || document;
  const windowRef = options.windowRef || doc.defaultView || window;
  if (!root) throw new Error('AURA_CARTERA_ROOT_REQUIRED');
  installStyles(doc);
  perfState(windowRef);

  const base = createBaseCarteraModule(options);
  const timers = new Set();
  const events = new AbortController();

  function reconcile(reason = 'scheduled') {
    humanizeRoot(root);
    humanizePdfDialog(doc, windowRef);
    const state = perfState(windowRef);
    if (state.active) {
      state.active.lastReconcileReason = reason;
      state.active.lastReconcileAt = new Date().toISOString();
    }
  }

  function scheduleBurst(reason = 'interaction') {
    for (const timer of timers) windowRef.clearTimeout(timer);
    timers.clear();
    for (const delay of RECONCILE_DELAYS) {
      const timer = windowRef.setTimeout(() => {
        timers.delete(timer);
        reconcile(`${reason}:${delay}`);
      }, delay);
      timers.add(timer);
    }
  }

  doc.addEventListener('change', event => {
    const input = event.target?.closest?.('[data-pdf-input]');
    if (!input) return;
    beginPdfRun(input.files?.[0], windowRef);
    scheduleBurst('pdf-selected');
  }, { capture: true, signal: events.signal });

  doc.addEventListener('drop', event => {
    if (!event.target?.closest?.('[data-pdf-drop]')) return;
    const file = [...(event.dataTransfer?.files || [])].find(item => /\.pdf$/i.test(String(item?.name || '')) || String(item?.type || '').toLowerCase() === 'application/pdf');
    if (file) beginPdfRun(file, windowRef);
    scheduleBurst('pdf-drop');
  }, { capture: true, signal: events.signal });

  doc.addEventListener('click', event => {
    if (event.target?.closest?.('.cartera-dialog-layer') || root.contains(event.target)) scheduleBurst('cartera-click');
  }, { signal: events.signal });

  doc.addEventListener('input', event => {
    if (!event.target?.closest?.('.cartera-dialog-layer')) return;
    const timer = windowRef.setTimeout(() => {
      timers.delete(timer);
      reconcile('cartera-input');
    }, 0);
    timers.add(timer);
  }, { signal: events.signal });

  function stop() {
    for (const timer of timers) windowRef.clearTimeout(timer);
    timers.clear();
  }

  return Object.freeze({
    ...base,
    async mount() {
      const result = await base.mount?.();
      reconcile('mount');
      return result;
    },
    async reload() {
      const result = await base.reload?.();
      reconcile('reload');
      return result;
    },
    async scrub() {
      stop();
      return base.scrub?.();
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      stop();
      events.abort();
      return base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        phase: PHASE,
        newMutationObservers: 0,
        pdfPerf: perfState(windowRef),
        base: base.diagnostics?.() || null,
      });
    },
  });
}

export { PHASE };

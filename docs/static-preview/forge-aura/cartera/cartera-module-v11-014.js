import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v10-013.js?v=forge-aura-real-user-repair-014-base';

const STYLE_ID = 'forge-aura-cartera-real-user-014-style';

function text(value) {
  return String(value ?? '').trim();
}

function setExact(node, from, to) {
  if (node && text(node.textContent) === from) node.textContent = to;
}

function installStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .cartera-dialog-layer{padding:clamp(12px,2.2vw,28px)}
    .cartera-dialog-layer .cartera-dialog{width:min(1040px,calc(100vw - clamp(24px,4.4vw,56px)));max-width:1040px;max-height:min(92dvh,960px);overflow:hidden}
    .cartera-dialog-layer .cartera-dialog>header{position:sticky;top:0;z-index:2;background:inherit}
    .cartera-dialog-layer .cartera-dialog__body{min-width:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain}
    .cartera-dialog-layer .cartera-dialog__body>*{min-width:0;max-width:100%}
    .cartera-dialog-layer .coverage-row,.cartera-dialog-layer .cartera-semantic-facts,.cartera-dialog-layer .cartera-semantic-premiums,.cartera-dialog-layer .cartera-semantic-parties{min-width:0}
    [data-policy-evidence-recovery] .cartera-technical-reference{display:none!important}
    [data-real-user-coverage-review-014]{margin-top:12px}
    @media(max-width:760px){
      .cartera-dialog-layer{padding:0;align-items:end}
      .cartera-dialog-layer .cartera-dialog{width:100%;max-width:none;max-height:94dvh;border-radius:24px 24px 0 0}
    }
  `;
  doc.head.append(style);
}

function humanizeEvidenceSection(section) {
  if (!section) return;
  const heading = section.querySelector('h2');
  if (heading) heading.textContent = 'Información encontrada en el documento';

  section.querySelectorAll('p').forEach(node => {
    const current = text(node.textContent);
    if (/Evidence Version|verdad canónica|hechos canónicos|Policy Intelligence|evidencia recuperada/i.test(current)) {
      node.textContent = 'Esta información fue encontrada en el documento. Revísala antes de tomarla como confirmada.';
    }
  });

  section.querySelectorAll('small').forEach(node => {
    const current = text(node.textContent);
    if (/Candidato extraído|no confirmado como hecho canónico/i.test(current)) {
      node.textContent = 'Encontrado en el documento · pendiente de revisión';
    }
  });

  section.querySelectorAll('details summary').forEach(summary => {
    if (/Más evidencia/i.test(text(summary.textContent))) summary.textContent = 'Ver detalles';
  });

  section.querySelectorAll('dt').forEach(dt => {
    if (text(dt.textContent) === 'Origen') dt.textContent = 'Sección del documento';
  });
}

function coverageSection(root) {
  return root.querySelector('section[aria-labelledby="coverage-title"]');
}

function documentCoverageCount(root) {
  return root.querySelectorAll('[data-policy-evidence-recovery] [data-evidence-coverages] .coverage-row').length;
}

function confirmedCoverageCount(root) {
  const section = coverageSection(root);
  return section ? section.querySelectorAll(':scope .coverage-list > .coverage-row').length : 0;
}

function reconcileCoverageMeaning(root) {
  const section = coverageSection(root);
  if (!section) return;
  const found = documentCoverageCount(root);
  const confirmed = confirmedCoverageCount(root);
  const warning = section.querySelector('.cartera-warning');
  const add = section.querySelector('[data-add-coverage]');

  if (found > 0 && confirmed === 0) {
    if (warning) {
      warning.textContent = `Encontramos ${found} ${found === 1 ? 'cobertura' : 'coberturas'} en tu documento. Revísalas antes de confirmarlas.`;
    }
    if (add) {
      add.textContent = 'Revisar coberturas';
      add.dataset.realUserCoverageReview014 = 'true';
    }
    return;
  }

  if (found > 0 && confirmed > 0 && warning) {
    warning.textContent = `Hay ${confirmed} ${confirmed === 1 ? 'cobertura confirmada' : 'coberturas confirmadas'} y también información adicional encontrada en el documento para revisar.`;
  }
}

function humanizePolicyWorkspace(root) {
  const workspace = root.querySelector('.cartera-workspace');
  if (!workspace) return;

  const eyebrow = workspace.querySelector('.cartera-workspace__hero .cartera-eyebrow');
  setExact(eyebrow, 'POLICY WORKSPACE', 'PÓLIZA');

  workspace.querySelectorAll('.cartera-fact dt').forEach(node => {
    const current = text(node.textContent);
    if (current === 'Prima legacy') node.textContent = 'Prima registrada';
    if (current === 'Suma legacy') node.textContent = 'Suma asegurada registrada';
    if (current === 'Versión') node.textContent = 'Última actualización';
  });

  workspace.querySelectorAll('details.cartera-section').forEach(details => {
    if (/Información técnica|metadata técnica|Referencia de póliza/i.test(text(details.textContent))) {
      details.hidden = true;
      details.dataset.internalOnly014 = 'true';
    }
  });

  workspace.querySelectorAll('p').forEach(node => {
    const current = text(node.textContent);
    if (current === 'Beneficios contratados como hijos independientes de la póliza. Los campos faltantes permanecen desconocidos.') {
      node.textContent = 'Revisa aquí las coberturas registradas y cualquier información pendiente del documento.';
    }
    if (/Obligación esperada ≠ pago confirmado ≠ estado de póliza/i.test(current)) {
      node.textContent = 'Un cobro esperado no significa que ya haya sido pagado. Revisa cada movimiento antes de darlo por confirmado.';
    }
  });

  humanizeEvidenceSection(workspace.querySelector('[data-policy-evidence-recovery]'));
  reconcileCoverageMeaning(root);
}

function humanizePersonWorkspace(root) {
  const workspace = root.querySelector('.cartera-workspace');
  if (!workspace) return;
  const eyebrow = workspace.querySelector('.cartera-workspace__hero .cartera-eyebrow');
  setExact(eyebrow, 'PERSON WORKSPACE', 'CLIENTE');

  workspace.querySelectorAll('section.cartera-section').forEach(section => {
    const heading = section.querySelector('h2');
    const paragraph = section.querySelector('p');
    if (text(heading?.textContent) === 'Relación' && /Memoria y contexto confirmados/i.test(text(paragraph?.textContent))) {
      paragraph.textContent = 'Seguimientos e información útil que ya están vinculados con esta persona.';
    }
    if (text(heading?.textContent) === 'Contexto para revisión') {
      heading.textContent = 'Información para revisar';
      if (paragraph) paragraph.textContent = 'Revisa estas señales antes de decidir si corresponde dar seguimiento.';
    }
  });
}

function humanizeHome(root) {
  root.querySelectorAll('.cartera-directory header p').forEach(node => {
    if (/identidad y cartera canónicas/i.test(text(node.textContent))) {
      node.textContent = 'Busca personas y pólizas desde un solo lugar.';
    }
  });

  root.querySelectorAll('.cartera-panel p').forEach(node => {
    const current = text(node.textContent);
    if (/fuente desconectada nunca se representa como cero/i.test(current)) {
      node.textContent = 'Si falta información, Forge la mostrará como pendiente en lugar de inventar un valor.';
    }
    if (/Ninguna acción se ejecuta automáticamente/i.test(current)) {
      node.textContent = current.replace(/\s*Ninguna acción se ejecuta automáticamente\.?/i, '');
    }
  });
}

function humanizePdfReview(doc) {
  doc.querySelectorAll('.cartera-dialog-layer .cartera-progress span').forEach(node => {
    const current = text(node.textContent);
    if (/Evidencia\s*020B/i.test(current)) node.textContent = current.replace(/Evidencia\s*020B/i, 'Lectura');
    if (/Extracción/i.test(current)) node.textContent = current.replace(/Extracción/i, 'Datos encontrados');
    if (/Revisión humana/i.test(current)) node.textContent = current.replace(/Revisión humana/i, 'Revisión');
  });

  doc.querySelectorAll('.cartera-dialog-layer p,.cartera-dialog-layer small,.cartera-dialog-layer strong').forEach(node => {
    const current = text(node.textContent);
    if (current === 'La extracción sigue siendo evidencia, no verdad canónica.') {
      node.textContent = 'Los datos fueron encontrados en el documento y todavía necesitan tu revisión.';
    } else if (current === 'Tu confirmación crea la frontera de verdad.') {
      node.textContent = 'Revisa la información antes de incorporarla.';
    } else if (/Documento → evidencia → revisión humana → writers gobernados/i.test(current)) {
      node.textContent = 'Nada quedará confirmado hasta que tú lo apruebes.';
    } else if (/No se convierte automáticamente en prima canónica/i.test(current)) {
      node.textContent = 'Revísala antes de incorporarla como prima de la póliza.';
    } else if (/Se conserva como concepto documental independiente/i.test(current)) {
      node.textContent = 'Se mantiene separado para que puedas revisarlo correctamente.';
    } else if (/No se colapsa silenciosamente con otros importes/i.test(current)) {
      node.textContent = 'Se muestra por separado para evitar confundirlo con otros importes.';
    } else if (/Forge no convierte esta ausencia de extracción en un hecho de póliza/i.test(current)) {
      node.textContent = 'No asumiremos que la póliza no tiene coberturas; revisa el documento antes de confirmar.';
    }
  });

  doc.querySelectorAll('.cartera-dialog-layer h3').forEach(node => {
    if (text(node.textContent) === 'Hechos documentales separados') node.textContent = 'Importes encontrados';
  });
}

function reconcile(root, doc) {
  humanizeHome(root);
  humanizePolicyWorkspace(root);
  humanizePersonWorkspace(root);
  humanizePdfReview(doc);
}

export function createCarteraModule(options = {}) {
  const root = options.root;
  const doc = root?.ownerDocument || document;
  const base = createBaseCarteraModule(options);
  let rootObserver = null;
  let dialogObserver = null;
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      reconcile(root, doc);
    });
  };

  function start() {
    installStyles(doc);
    const Observer = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    rootObserver = new Observer(schedule);
    rootObserver.observe(root, { childList: true, subtree: true, characterData: true });
    dialogObserver = new Observer(schedule);
    dialogObserver.observe(doc.body, { childList: true, subtree: true, characterData: true });
    schedule();
  }

  function stop() {
    rootObserver?.disconnect();
    dialogObserver?.disconnect();
    rootObserver = null;
    dialogObserver = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      start();
      const result = await base.mount?.();
      schedule();
      return result;
    },
    async reload() {
      const result = await base.reload?.();
      schedule();
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
      return base.destroy?.();
    },
  });
}

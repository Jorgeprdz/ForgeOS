const STYLE_ID = 'forge-aura-governed-context-presentation-014';

function text(value) {
  return String(value ?? '').trim();
}

function setText(node, value) {
  if (!node) return false;
  const next = String(value ?? '');
  if (node.textContent === next) return false;
  node.textContent = next;
  return true;
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    [data-aura-governed-context-dialog="true"]{padding:clamp(12px,2.2vw,28px)}
    [data-aura-governed-context-dialog="true"] .aura-governed-dialog{width:min(1080px,calc(100vw - clamp(24px,4.4vw,56px)));max-width:1080px;max-height:min(92dvh,960px);overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr)}
    [data-aura-governed-context-dialog="true"] .aura-dialog__body{min-width:0;max-width:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;padding-inline:clamp(18px,2.4vw,32px)}
    [data-aura-governed-context-dialog="true"] .aura-dialog__body>*{min-width:0;max-width:100%}
    [data-aura-governed-context-dialog="true"] .aura-technical-disclosure{display:none!important}
    @media(max-width:760px){
      [data-aura-governed-context-dialog="true"]{padding:0;place-items:end center}
      [data-aura-governed-context-dialog="true"] .aura-governed-dialog{width:100%;max-width:none;max-height:94dvh;border-radius:24px 24px 0 0}
    }
  `;
  document.head.append(style);
}

function collapseRepeatedSummary(layer) {
  const body = layer.querySelector('[data-governed-context-body]');
  if (!body) return false;
  const relationship = body.querySelector('[data-pipeline-relationship-context="AVAILABLE"]');
  const projections = body.querySelector('.aura-governed-projection-list');
  const outer = body.querySelector('.aura-governed-context-summary[data-consumer-state]');
  if (!outer || (!relationship && !projections) || outer.dataset.consumerState !== 'CONTEXT_SUFFICIENT') return false;

  let changed = false;
  if (!outer.hidden) {
    outer.hidden = true;
    changed = true;
  }
  if (outer.dataset.redundantSummary014 !== 'true') {
    outer.dataset.redundantSummary014 = 'true';
    changed = true;
  }
  return changed;
}

function hideTechnical(node) {
  let changed = false;
  if (!node.hidden) {
    node.hidden = true;
    changed = true;
  }
  if (node.dataset.internalOnly014 !== 'true') {
    node.dataset.internalOnly014 = 'true';
    changed = true;
  }
  return changed;
}

function humanizeLeaf(node) {
  const current = text(node.textContent);
  if (!current || node.children.length) return false;

  let next = current;
  next = next
    .replace(/fuentes disponibles/gi, 'información disponible')
    .replace(/fuentes de Cartera/gi, 'información de Cartera')
    .replace(/fuente conectada/gi, 'información disponible')
    .replace(/memoria relacional/gi, 'historial de seguimiento')
    .replace(/brief relacional/gi, 'resumen de la relación');

  if (/CommercialPerson|CRS-10|Relationship Intelligence|Consumer|Opportunity authority|source-owner/i.test(next)) {
    next = 'Información vinculada con esta persona.';
  }

  if (/Forge no ejecutará ninguna acción por ti/i.test(next)) {
    next = next.replace(/;?\s*Forge no ejecutará ninguna acción por ti\.?/i, '.');
  }

  return next !== current ? setText(node, next) : false;
}

function reconcileLayer(layer) {
  if (!layer) return false;
  let changed = false;

  if (layer.dataset.realUserPresentation014 !== 'true') {
    layer.dataset.realUserPresentation014 = 'true';
    changed = true;
  }

  layer.querySelectorAll('.aura-technical-disclosure,[data-pipeline-context-technical],[data-pipeline-projection-technical]').forEach(node => {
    changed = hideTechnical(node) || changed;
  });

  changed = setText(
    layer.querySelector('#aura-governed-context-title'),
    'Información útil para decidir el siguiente paso',
  ) || changed;

  layer.querySelectorAll('p,small,strong,h3,h4,dt,dd,li').forEach(node => {
    changed = humanizeLeaf(node) || changed;
  });

  changed = collapseRepeatedSummary(layer) || changed;
  return changed;
}

function reconcile() {
  let changed = false;
  document.querySelectorAll('[data-aura-governed-context-dialog="true"]').forEach(layer => {
    changed = reconcileLayer(layer) || changed;
  });
  return changed;
}

installStyle();
const Observer = globalThis.MutationObserver;
let scheduled = false;
function scheduleReconcile() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    reconcile();
  });
}

if (Observer) {
  const observer = new Observer(scheduleReconcile);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}
reconcile();

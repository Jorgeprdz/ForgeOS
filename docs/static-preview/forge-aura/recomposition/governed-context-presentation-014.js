const STYLE_ID = 'forge-aura-governed-context-presentation-014';

function text(value) {
  return String(value ?? '').trim();
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

function reconcileLayer(layer) {
  if (!layer || layer.dataset.realUserPresentation014 === 'true') return;
  layer.dataset.realUserPresentation014 = 'true';

  layer.querySelectorAll('.aura-technical-disclosure,[data-pipeline-context-technical],[data-pipeline-projection-technical]').forEach(node => {
    node.hidden = true;
    node.dataset.internalOnly014 = 'true';
  });

  const title = layer.querySelector('#aura-governed-context-title');
  if (title) title.textContent = 'Información útil para decidir el siguiente paso';

  layer.querySelectorAll('p,small,strong,h3,h4,dt,dd,li').forEach(node => {
    const current = text(node.textContent);
    if (!current || node.children.length) return;
    if (/fuentes disponibles|fuentes de Cartera|fuente conectada/i.test(current)) {
      node.textContent = current
        .replace(/fuentes disponibles/gi, 'información disponible')
        .replace(/fuentes de Cartera/gi, 'información de Cartera')
        .replace(/fuente conectada/gi, 'información disponible');
    }
    if (/memoria relacional/i.test(text(node.textContent))) {
      node.textContent = text(node.textContent).replace(/memoria relacional/gi, 'historial de seguimiento');
    }
    if (/brief relacional/i.test(text(node.textContent))) {
      node.textContent = text(node.textContent).replace(/brief relacional/gi, 'resumen de la relación');
    }
    if (/CommercialPerson|CRS-10|Relationship Intelligence|Consumer|Opportunity authority|source-owner/i.test(text(node.textContent))) {
      node.textContent = 'Información vinculada con esta persona.';
    }
    if (/Forge no ejecutará ninguna acción por ti/i.test(text(node.textContent))) {
      node.textContent = text(node.textContent).replace(/;?\s*Forge no ejecutará ninguna acción por ti\.?/i, '.');
    }
  });
}

function reconcile() {
  document.querySelectorAll('[data-aura-governed-context-dialog="true"]').forEach(reconcileLayer);
}

installStyle();
const Observer = globalThis.MutationObserver;
if (Observer) {
  const observer = new Observer(reconcile);
  observer.observe(document.body, { childList: true, subtree: true });
}
reconcile();

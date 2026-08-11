import {
  humanConfidenceLabel,
  humanStateLabel,
  presentationDiagnostics,
} from '../recomposition/human-context-presentation-013.js?v=forge-beta2-013-human-context';

const CONTRACT_ID = 'FORGE_HOME_HUMAN_INTERPRETATION_013';

const text = value => String(value ?? '').trim();

function replaceText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function parseTechnicalPair(value) {
  const raw = text(value);
  return {
    truth: raw.match(/Verdad:\s*([^·]+)/i)?.[1]?.trim() || null,
    source: raw.match(/Fuente:\s*(.+)$/i)?.[1]?.trim() || null,
  };
}

function technicalDisclosure(doc, rows) {
  const details = doc.createElement('details');
  details.className = 'home-technical-disclosure-013';
  details.dataset.homeTechnicalDisclosure = '013';
  const summary = doc.createElement('summary');
  summary.textContent = 'Información técnica';
  details.append(summary);
  for (const [name, value] of rows) {
    if (!text(value)) continue;
    const p = doc.createElement('p');
    const strong = doc.createElement('b');
    strong.textContent = `${name}: `;
    p.append(strong, doc.createTextNode(text(value)));
    details.append(p);
  }
  return details;
}

function humanizeCartera(root) {
  for (const details of root.querySelectorAll('.home-cartera-copy > details')) {
    if (details.dataset.humanPresentation013 === 'true') continue;
    const ps = [...details.querySelectorAll(':scope > p')];
    const why = text(ps[0]?.textContent);
    const pair = parseTechnicalPair(ps[1]?.textContent);
    const uncertainty = text(ps[2]?.textContent).replace(/^Incertidumbre:\s*/i, '');
    details.replaceChildren();
    const summary = details.ownerDocument.createElement('summary');
    summary.textContent = 'Por qué conviene revisarlo';
    details.append(summary);
    if (why) details.append(Object.assign(details.ownerDocument.createElement('p'), { textContent: why }));
    if (uncertainty) {
      const p = details.ownerDocument.createElement('p');
      const b = details.ownerDocument.createElement('b');
      b.textContent = 'Lo que falta por confirmar: ';
      p.append(b, details.ownerDocument.createTextNode(uncertainty));
      details.append(p);
    }
    if (pair.truth || pair.source) details.append(technicalDisclosure(details.ownerDocument, [
      ['Estado de la fuente', humanStateLabel(pair.truth)],
      ['Fuente interna', pair.source],
    ]));
    details.dataset.humanPresentation013 = 'true';
  }
}

function humanizeAlfred(root) {
  const card = root.querySelector('.home-alfred-card');
  if (!card) return;
  const state = text(card.dataset.state).toUpperCase();
  const title = card.querySelector('.home-alfred-copy > h2');
  const copy = card.querySelector('.home-alfred-copy > p:not(.home-mini-label)');
  if (!card.dataset.decisionReference) {
    if (state === 'EMPTY') {
      replaceText(title, 'No hay algo adicional que requiera tu atención ahora');
      replaceText(copy, 'Las fuentes disponibles no muestran un asunto adicional que debas revisar en este momento.');
    } else {
      replaceText(title, 'Todavía no hay suficiente información para sugerirte un siguiente paso');
      replaceText(copy, 'Forge conservará lo que falta como pendiente de confirmar, en lugar de inventar una prioridad o una recomendación.');
    }
  }
  const details = card.querySelector('.home-alfred-actions > details');
  if (!details || details.dataset.humanPresentation013 === 'true') return;
  const ps = [...details.querySelectorAll(':scope > p')];
  const reason = text(ps[0]?.textContent);
  const pair = parseTechnicalPair(ps[1]?.textContent);
  const confidence = text(ps.find(p => /Confianza:/i.test(p.textContent))?.textContent).replace(/^Confianza:\s*/i, '');
  const limitations = text(ps.find(p => /Limitaciones:/i.test(p.textContent))?.textContent).replace(/^Limitaciones:\s*/i, '');
  const asOf = text(ps.find(p => /As of:/i.test(p.textContent))?.textContent).replace(/^As of:\s*/i, '');
  details.replaceChildren();
  const summary = details.ownerDocument.createElement('summary');
  summary.textContent = 'Por qué aparece esto';
  details.append(summary);
  if (reason && !/^Estado de atención:/i.test(reason)) details.append(Object.assign(details.ownerDocument.createElement('p'), { textContent: reason }));
  if (limitations) {
    const p = details.ownerDocument.createElement('p');
    const b = details.ownerDocument.createElement('b');
    b.textContent = 'Qué debes tomar con cautela: ';
    p.append(b, details.ownerDocument.createTextNode(limitations));
    details.append(p);
  }
  details.append(technicalDisclosure(details.ownerDocument, [
    ['Estado', pair.truth ? humanStateLabel(pair.truth) : humanStateLabel(state)],
    ['Confianza', confidence ? humanConfidenceLabel(confidence) : ''],
    ['Fuente interna', pair.source],
    ['Actualizado', asOf],
  ]));
  details.dataset.humanPresentation013 = 'true';
}

function humanizeSummary(root) {
  const summary = root.querySelector('.home-attention-summary');
  if (summary) {
    const raw = text(summary.textContent);
    if (/Decision Projection confirmó que no hay señales activas/i.test(raw)) {
      replaceText(summary, 'No hay asuntos adicionales que requieran tu revisión con la información disponible.');
    } else {
      const match = raw.match(/^(\d+)\s+señal(?:es)?\s+gobernada(?:s)?\s+requiere(?:n)?\s+tu revisión\.?$/i);
      if (match) {
        const count = Number(match[1]);
        replaceText(summary, `${count} ${count === 1 ? 'asunto requiere' : 'asuntos requieren'} tu revisión.`);
      }
    }
  }
  const note = root.querySelector('.home-truth-note');
  replaceText(note, 'Inicio resume información de las fuentes conectadas. No crea tareas, no fusiona identidades, no confirma pagos, no recalcula métricas y no ejecuta acciones sensibles sin tu revisión.');
}

function humanizeStateBlocks(root) {
  for (const block of root.querySelectorAll('.home-state')) {
    const detail = block.querySelector('span');
    if (!detail) continue;
    let next = text(detail.textContent);
    next = next
      .replace(/La Agenda canónica confirmó ausencia de compromisos en estas dos categorías\./i, 'No hay compromisos vencidos ni para hoy en la información disponible.')
      .replace(/Future Radar confirmó que no hay elementos de atención en la respuesta actual\./i, 'No hay elementos adicionales que requieran revisión en el horizonte disponible.')
      .replace(/Inicio no recalculará puntos, metas ni ingresos fuera de sus owners productivos\./i, 'Forge no recalculará puntos, metas ni ingresos fuera de sus fuentes correspondientes.');
    replaceText(detail, next);
  }
}

export function normalizeHomePresentation(root) {
  if (!root?.isConnected) return;
  humanizeSummary(root);
  humanizeCartera(root);
  humanizeAlfred(root);
  humanizeStateBlocks(root);
  const home = root.querySelector('.home-aura');
  if (home) home.dataset.humanPresentationContract = CONTRACT_ID;
}

export function homePresentationDiagnostics() {
  return Object.freeze({
    contractId: CONTRACT_ID,
    role: 'PRESENTATION_ONLY',
    domainWrites: 0,
    ownerChanges: 0,
    presentation: presentationDiagnostics(),
  });
}

export { CONTRACT_ID };

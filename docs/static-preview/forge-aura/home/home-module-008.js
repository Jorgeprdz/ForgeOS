import { createHomeModule as createBaseHomeModule } from "./home-module.js";
import {
  humanConfidenceLabel,
  humanStateLabel,
  presentationDiagnostics,
} from "../recomposition/human-context-presentation-013.js?v=forge-beta2-013-human-context";

const WRAPPER_ID = "FORGE_GLOBAL_AURA_HOME_CONTEXT_BRIDGE_008";
const PRESENTATION_ID = "FORGE_HOME_HUMAN_INTERPRETATION_013";

function text(value) {
  return String(value ?? "").trim();
}

function decisionContext(root, trigger) {
  const card = trigger?.closest?.("[data-decision-reference]");
  if (!card) return null;
  const shell = root.querySelector("[data-home-attention-contract]") || root.firstElementChild;
  return Object.freeze({
    source: card.dataset.homeBriefingSource || "FORGE_HOME_ATTENTION_ORCHESTRATION_007",
    contract: shell?.dataset?.homeAttentionContract || "FHAO-007-001",
    decisionReference: card.dataset.decisionReference || null,
    sourceReference: card.dataset.decisionReference || null,
  });
}

function replaceText(node, value) {
  if (!node || node.textContent === value) return;
  node.textContent = value;
}

function parseTechnicalPair(value) {
  const raw = text(value);
  const truth = raw.match(/Verdad:\s*([^·]+)/i)?.[1]?.trim() || null;
  const source = raw.match(/Fuente:\s*(.+)$/i)?.[1]?.trim() || null;
  return { truth, source };
}

function technicalDisclosure(doc, label, rows) {
  const details = doc.createElement("details");
  details.className = "home-technical-disclosure-013";
  details.dataset.homeTechnicalDisclosure = "013";
  const summary = doc.createElement("summary");
  summary.textContent = label;
  details.append(summary);
  for (const [name, value] of rows) {
    if (!text(value)) continue;
    const p = doc.createElement("p");
    const strong = doc.createElement("b");
    strong.textContent = `${name}: `;
    p.append(strong, doc.createTextNode(text(value)));
    details.append(p);
  }
  return details;
}

function humanizeCarteraDetails(root) {
  for (const details of root.querySelectorAll(".home-cartera-copy > details")) {
    if (details.dataset.humanPresentation013 === "true") continue;
    const paragraphs = [...details.querySelectorAll(":scope > p")];
    const why = text(paragraphs[0]?.textContent);
    const pair = parseTechnicalPair(paragraphs[1]?.textContent);
    const uncertainty = text(paragraphs[2]?.textContent).replace(/^Incertidumbre:\s*/i, "");

    details.replaceChildren();
    const summary = details.ownerDocument.createElement("summary");
    summary.textContent = "Por qué conviene revisarlo";
    details.append(summary);
    if (why) {
      const p = details.ownerDocument.createElement("p");
      p.textContent = why;
      details.append(p);
    }
    if (uncertainty) {
      const p = details.ownerDocument.createElement("p");
      const strong = details.ownerDocument.createElement("b");
      strong.textContent = "Lo que falta por confirmar: ";
      p.append(strong, details.ownerDocument.createTextNode(uncertainty));
      details.append(p);
    }
    if (pair.truth || pair.source) {
      details.append(technicalDisclosure(details.ownerDocument, "Información técnica", [
        ["Estado de la fuente", humanStateLabel(pair.truth)],
        ["Fuente interna", pair.source],
      ]));
    }
    details.dataset.humanPresentation013 = "true";
  }
}

function humanizeAlfred(root) {
  const card = root.querySelector(".home-alfred-card");
  if (!card) return;
  const state = text(card.dataset.state).toUpperCase();
  const title = card.querySelector(".home-alfred-copy > h2");
  const mainCopy = card.querySelector(".home-alfred-copy > p:not(.home-mini-label)");

  if (!card.dataset.decisionReference) {
    if (state === "EMPTY") {
      replaceText(title, "No hay algo adicional que requiera tu atención ahora");
      replaceText(mainCopy, "Las fuentes disponibles no muestran un asunto adicional que debas revisar en este momento.");
    } else {
      replaceText(title, "Todavía no hay suficiente información para sugerirte un siguiente paso");
      replaceText(mainCopy, "Forge conservará lo que falta como pendiente de confirmar, en lugar de inventar una prioridad o una recomendación.");
    }
  }

  const details = card.querySelector(".home-alfred-actions > details");
  if (!details || details.dataset.humanPresentation013 === "true") return;
  const rawParagraphs = [...details.querySelectorAll(":scope > p")];
  const rawReason = text(rawParagraphs[0]?.textContent);
  const pair = parseTechnicalPair(rawParagraphs[1]?.textContent);
  const rawConfidence = text(rawParagraphs.find(p => /Confianza:/i.test(p.textContent))?.textContent).replace(/^Confianza:\s*/i, "");
  const rawLimitations = text(rawParagraphs.find(p => /Limitaciones:/i.test(p.textContent))?.textContent).replace(/^Limitaciones:\s*/i, "");
  const rawAsOf = text(rawParagraphs.find(p => /As of:/i.test(p.textContent))?.textContent).replace(/^As of:\s*/i, "");

  details.replaceChildren();
  const summary = details.ownerDocument.createElement("summary");
  summary.textContent = "Por qué aparece esto";
  details.append(summary);
  if (rawReason && !/^Estado de atención:/i.test(rawReason)) {
    const p = details.ownerDocument.createElement("p");
    p.textContent = rawReason;
    details.append(p);
  }
  if (rawLimitations) {
    const p = details.ownerDocument.createElement("p");
    const strong = details.ownerDocument.createElement("b");
    strong.textContent = "Qué debes tomar con cautela: ";
    p.append(strong, details.ownerDocument.createTextNode(rawLimitations));
    details.append(p);
  }
  details.append(technicalDisclosure(details.ownerDocument, "Información técnica", [
    ["Estado", pair.truth ? humanStateLabel(pair.truth) : humanStateLabel(state)],
    ["Confianza", rawConfidence ? humanConfidenceLabel(rawConfidence) : ""],
    ["Fuente interna", pair.source],
    ["Actualizado", rawAsOf],
  ]));
  details.dataset.humanPresentation013 = "true";
}

function humanizeSummary(root) {
  const summary = root.querySelector(".home-attention-summary");
  if (summary) {
    const raw = text(summary.textContent);
    if (/Decision Projection confirmó que no hay señales activas/i.test(raw)) {
      replaceText(summary, "No hay asuntos adicionales que requieran tu revisión con la información disponible.");
    } else {
      const match = raw.match(/^(\d+)\s+señal(?:es)?\s+gobernada(?:s)?\s+requiere(?:n)?\s+tu revisión\.?$/i);
      if (match) {
        const count = Number(match[1]);
        replaceText(summary, `${count} ${count === 1 ? "asunto requiere" : "asuntos requieren"} tu revisión.`);
      }
    }
  }

  const truthNote = root.querySelector(".home-truth-note");
  if (truthNote) {
    replaceText(
      truthNote,
      "Inicio resume información de las fuentes conectadas. No crea tareas, no fusiona identidades, no confirma pagos, no recalcula métricas y no ejecuta acciones sensibles sin tu revisión.",
    );
  }
}

function humanizeStateBlocks(root) {
  for (const block of root.querySelectorAll(".home-state")) {
    const detail = block.querySelector("span");
    if (!detail) continue;
    const raw = text(detail.textContent);
    const replacements = [
      [/La Agenda canónica confirmó ausencia de compromisos en estas dos categorías\./i, "No hay compromisos vencidos ni para hoy en la información disponible."],
      [/Future Radar confirmó que no hay elementos de atención en la respuesta actual\./i, "No hay elementos adicionales que requieran revisión en el horizonte disponible."],
      [/Inicio no recalculará puntos, metas ni ingresos fuera de sus owners productivos\./i, "Forge no recalculará puntos, metas ni ingresos fuera de sus fuentes correspondientes."],
    ];
    let next = raw;
    for (const [pattern, value] of replacements) next = next.replace(pattern, value);
    replaceText(detail, next);
  }
}

function normalizePresentation(root) {
  if (!root.isConnected) return;
  humanizeSummary(root);
  humanizeCarteraDetails(root);
  humanizeAlfred(root);
  humanizeStateBlocks(root);
  const home = root.querySelector(".home-aura");
  if (home) home.dataset.humanPresentationContract = PRESENTATION_ID;
}

export function createHomeModule(options = {}) {
  const { root, onNavigate } = options;
  if (!root) throw new Error("AURA_HOME_ROOT_REQUIRED");

  const events = new AbortController();
  let bound = false;
  let observer = null;
  let scheduled = false;
  let destroyed = false;
  const base = createBaseHomeModule({
    ...options,
    onNavigate,
  });

  function bindDecisionContinuity() {
    if (bound) return;
    bound = true;
    root.addEventListener("click", event => {
      const routeNode = event.target.closest("[data-home-route]");
      if (!routeNode) return;
      const context = decisionContext(root, routeNode);
      if (!context) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate?.(routeNode.dataset.homeRoute, context);
    }, { capture: true, signal: events.signal });
  }

  function normalizeScheduled() {
    scheduled = false;
    if (destroyed) return;
    normalizePresentation(root);
  }

  function scheduleNormalize() {
    if (scheduled || destroyed) return;
    scheduled = true;
    queueMicrotask(normalizeScheduled);
  }

  function startPresentationObserver() {
    if (observer) return;
    const Observer = root.ownerDocument.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    observer = new Observer(scheduleNormalize);
    observer.observe(root, { childList: true, subtree: true });
  }

  function stopPresentationObserver() {
    observer?.disconnect();
    observer = null;
    scheduled = false;
  }

  return Object.freeze({
    async mount() {
      destroyed = false;
      bindDecisionContinuity();
      await base.mount();
      normalizePresentation(root);
      startPresentationObserver();
      root.dataset.auraHomeContextBridge = WRAPPER_ID;
    },
    async reload() {
      const result = await base.reload?.();
      normalizePresentation(root);
      return result;
    },
    async unmount() {
      stopPresentationObserver();
      await base.unmount?.();
    },
    async scrub(reason = "session-scrub") {
      stopPresentationObserver();
      await base.scrub?.(reason);
    },
    async destroy() {
      destroyed = true;
      stopPresentationObserver();
      events.abort();
      await base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        wrapperId: WRAPPER_ID,
        presentationId: PRESENTATION_ID,
        decisionContextTransport: true,
        domainWrites: 0,
        presentation: presentationDiagnostics(),
        base: base.diagnostics?.() || null,
      });
    },
  });
}

export { WRAPPER_ID, PRESENTATION_ID, normalizePresentation };

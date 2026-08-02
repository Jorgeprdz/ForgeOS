import { createAlfredProductiveExperience } from "./fip-pack-07-productive-experience-contract-distribution.js";

const FACT_ORDER = Object.freeze({
  ACTION_REQUIRING_APPROVAL: 0,
  RECOMMENDATION: 1,
  FACT: 2,
  ESTIMATE: 3,
  HYPOTHESIS: 4,
});
const safeList = value => Array.isArray(value) ? value : [];
const summarizeSources = packs => Object.entries(packs).map(([id, pack]) => ({
  id,
  status: pack ? "AVAILABLE" : "UNAVAILABLE",
  freshness: pack?.generatedAt || pack?.asOfDate || null,
  reason: pack ? null : "La fuente no está conectada para esta composición.",
  evidenceCount: Number(pack?.evidenceCount || pack?.itemCount || 0),
}));
const toInsight = (kind, prefix, item, index) => ({
  id: `${prefix}-${index + 1}`,
  kind,
  title: item.title || item.label || item.pattern || item.type || prefix,
  summary: item.summary || item.reason || item.whyNow || item.recommendation || "Información disponible para revisión.",
  confidence: item.confidence || null,
  evidence: safeList(item.evidence).map(evidence => typeof evidence === "string" ? evidence : evidence.reference || evidence.id || "EVIDENCE"),
  actionId: item.actionId || null,
  humanApprovalRequired: kind === "ACTION_REQUIRING_APPROVAL",
});

export function composeAlfredProductiveExperience({ advisorReference, generatedAt, packs = {} } = {}) {
  const insights = [
    ...safeList(packs.relationship?.facts).map((item, index) => toInsight("FACT", "relationship-fact", item, index)),
    ...safeList(packs.advisor?.patterns).map((item, index) => toInsight("HYPOTHESIS", "advisor-pattern", item, index)),
    ...safeList(packs.mick?.adjustments).map((item, index) => toInsight("RECOMMENDATION", "mick-adjustment", item, index)),
    ...safeList(packs.nash?.recommendations).map((item, index) => toInsight("RECOMMENDATION", "nash-recommendation", item, index)),
    ...safeList(packs.operation?.priorities).map((item, index) => toInsight("ACTION_REQUIRING_APPROVAL", "daily-priority", item, index)),
    ...safeList(packs.business?.estimates).map((item, index) => toInsight("ESTIMATE", "business-estimate", item, index)),
  ].sort((a, b) => FACT_ORDER[a.kind] - FACT_ORDER[b.kind]);
  const idsByKind = kind => insights.filter(item => item.kind === kind).map(item => item.id);
  const widgets = [
    { id: "home-daily-priority", surface: "HOME", title: "Prioridad de hoy", state: idsByKind("ACTION_REQUIRING_APPROVAL").length ? "READY" : "EMPTY", insightIds: idsByKind("ACTION_REQUIRING_APPROVAL"), deepLink: "?nav=home" },
    { id: "home-nash", surface: "HOME", title: "Recomendación de Nash", state: idsByKind("RECOMMENDATION").length ? "READY" : "EMPTY", insightIds: idsByKind("RECOMMENDATION").slice(0, 3), deepLink: "?nav=nash" },
    { id: "person-context", surface: "PERSON", title: "Contexto de relación", state: idsByKind("FACT").length ? "READY" : "EMPTY", insightIds: idsByKind("FACT"), deepLink: "?nav=cartera" },
    { id: "activity-mick", surface: "ACTIVITY", title: "Patrones de ejecución", state: insights.some(item => item.id.startsWith("mick-")) ? "READY" : "EMPTY", insightIds: insights.filter(item => item.id.startsWith("mick-")).map(item => item.id), deepLink: "?nav=actividad" },
    { id: "reports-business", surface: "REPORTS", title: "Inteligencia del negocio", state: idsByKind("ESTIMATE").length ? "READY" : "EMPTY", insightIds: idsByKind("ESTIMATE"), deepLink: "?nav=reportes" },
    { id: "alfred-brief", surface: "ALFRED", title: "Resumen operativo", state: insights.length ? "READY" : "EMPTY", insightIds: insights.slice(0, 8).map(item => item.id), deepLink: "?nav=home" },
  ];
  return createAlfredProductiveExperience({
    advisorReference,
    generatedAt,
    sources: summarizeSources(packs),
    insights,
    widgets,
  });
}

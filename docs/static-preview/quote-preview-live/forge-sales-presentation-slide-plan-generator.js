const CONTEXT_PACKET_TYPE = "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const PROMPT_PACKET_TYPE = "SALES_PRESENTATION_PROMPT_REVIEW_PACKET";
const SLIDE_PLAN_PACKET_TYPE = "SALES_PRESENTATION_SLIDE_PLAN_REVIEW_PACKET";

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasValue(value) {
  return value !== null && typeof value !== "undefined" &&
    (typeof value !== "string" || value.trim().length > 0) &&
    (!Array.isArray(value) || value.length > 0);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const item of Object.values(value)) deepFreeze(item, seen);
  return Object.freeze(value);
}

function hash(value) {
  let output = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index);
    output = Math.imul(output, 0x01000193);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
}

function readPath(root, path) {
  return path.split(".").reduce(
    (value, segment) =>
      value === null || typeof value === "undefined"
        ? undefined
        : value[segment],
    root,
  );
}

function facts(root, candidates) {
  return candidates.flatMap(candidate => {
    const value = readPath(root, candidate.path);
    return hasValue(value)
      ? [{ label: candidate.label, value, sourcePath: candidate.path }]
      : [];
  });
}

function slide(id, title, purpose, slideFacts = [], notes = []) {
  return { id, title, purpose, facts: slideFacts, notes };
}

function buildSalesPresentationSlidePlanReviewPacket({
  contextPacket,
  promptPacket,
} = {}) {
  if (!isRecord(contextPacket) || contextPacket.packetType !== CONTEXT_PACKET_TYPE) {
    throw new TypeError("Unsupported context packet");
  }
  if (!isRecord(promptPacket) || promptPacket.packetType !== PROMPT_PACKET_TYPE) {
    throw new TypeError("Unsupported prompt packet");
  }

  if (!contextPacket.contextReady || !promptPacket.promptGenerated) {
    return deepFreeze({
      packetType: SLIDE_PLAN_PACKET_TYPE,
      reviewOnly: true,
      status: "HOLD_SOURCE_NOT_READY",
      slidePlanGenerated: false,
      slides: [],
      safety: {
        exportEnabled: false,
        sendable: false,
        humanApprovalRequired: true,
      },
    });
  }

  const root = {
    acceptedQuote: contextPacket.acceptedQuote,
    calculation: contextPacket.calculation,
    productIntelligence: contextPacket.productIntelligence,
    prospectContext: contextPacket.prospectContext,
    advisorNotes: contextPacket.advisorNotes,
    clientObjective: contextPacket.clientObjective,
  };

  const slides = [
    slide(
      "cover",
      "Solución cotizada",
      "Presentar la solución confirmada.",
      facts(root, [
        {
          label: "Producto",
          path: "productIntelligence.identity.detected_product_name",
        },
        { label: "Producto", path: "calculation.product" },
      ]).slice(0, 1),
    ),
  ];

  const summary = facts(root, [
    { label: "Familia", path: "calculation.productFamily" },
    { label: "Moneda", path: "calculation.currency" },
    { label: "Forma de pago", path: "calculation.paymentMode" },
    { label: "Plazo", path: "calculation.paymentYears" },
    { label: "Vigencia", path: "calculation.coveragePeriod" },
  ]);
  if (summary.length) slides.push(slide(
    "summary",
    "Resumen de la solución",
    "Mostrar producto, moneda y plazo confirmados.",
    summary,
  ));

  const documentedContext = facts(root, [
    { label: "Objetivo", path: "clientObjective" },
    { label: "Prospecto", path: "prospectContext" },
    { label: "Notas", path: "advisorNotes" },
  ]);
  if (documentedContext.length) slides.push(slide(
    "context",
    "Objetivo y contexto documentados",
    "Usar únicamente información aportada.",
    documentedContext,
  ));

  const protection = facts(root, [
    {
      label: "Suma asegurada",
      path: "productIntelligence.protection_summary.basic_sum_assured",
    },
    {
      label: "Protección actual MXN",
      path: "calculation.currentProtectionMXN",
    },
    {
      label: "Coberturas opcionales",
      path: "calculation.optionalCoverages",
    },
  ]);
  if (protection.length) slides.push(slide(
    "protection",
    "Protección y coberturas",
    "Mostrar beneficios confirmados.",
    protection,
  ));

  const contributions = facts(root, [
    {
      label: "Prima anual total",
      path: "productIntelligence.premium_structure.total_annual_premium",
    },
    {
      label: "Prima anual básica",
      path: "productIntelligence.premium_structure.basic_annual_premium",
    },
    { label: "Total aportado", path: "calculation.totalContributed" },
    { label: "Total aportado MXN", path: "calculation.totalContributedMXN" },
  ]);
  if (contributions.length) slides.push(slide(
    "contributions",
    "Aportaciones y plazo",
    "Mostrar cifras autorizadas sin recalcular.",
    contributions,
  ));

  const recovery = facts(root, [
    { label: "Recuperación total", path: "calculation.totalRecovery" },
    { label: "Recuperación MXN", path: "calculation.totalRecoveryMXN" },
    { label: "Ingreso mensual MXN", path: "calculation.monthlyIncomeMXN" },
    { label: "Ingreso anual MXN", path: "calculation.annualIncomeMXN" },
  ]);
  if (recovery.length) slides.push(slide(
    "recovery",
    "Recuperación y escenarios",
    "Mostrar únicamente resultados calculados.",
    recovery,
  ));

  slides.push(slide(
    "review",
    "Revisión y próximos pasos",
    "Cerrar sujeto a aprobación humana.",
    [],
    [
      "Confirmar cifras y coberturas.",
      "Marcar faltantes.",
      "No exportar ni enviar sin aprobación.",
    ],
  ));

  const factCount = slides.reduce(
    (total, current) => total + current.facts.length,
    0,
  );

  const idSource = JSON.stringify({
    context: contextPacket.presentationContextId,
    prompt: promptPacket.promptId,
    slides,
  });

  return deepFreeze({
    packetType: SLIDE_PLAN_PACKET_TYPE,
    contractVersion: "R16G2B3F_SLIDES_V1",
    slidePlanId: `slide-plan-${hash(idSource)}`,
    sourceContextId: contextPacket.presentationContextId,
    sourcePromptId: promptPacket.promptId,
    reviewOnly: true,
    status: "PENDING_HUMAN_REVIEW",
    slidePlanGenerated: true,
    slides,
    metrics: {
      slideCount: slides.length,
      factCount,
    },
    safety: {
      exportEnabled: false,
      sendable: false,
      humanApprovalRequired: true,
    },
  });
}

const api = Object.freeze({ buildSalesPresentationSlidePlanReviewPacket });
globalThis.ForgeSalesPresentationSlidePlanGenerator = api;

export {
  SLIDE_PLAN_PACKET_TYPE,
  buildSalesPresentationSlidePlanReviewPacket,
};

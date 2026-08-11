import {
  SMART_WIDGET_STATES,
  PRODUCTIVE_SMART_WIDGET_FAMILIES,
  SMART_WIDGET_RENDER_VARIANTS,
  createMetric,
  createProductiveSmartWidget,
  asFiniteNumber,
  cloneJson,
} from "./productive-smart-widget-contract.js";

function money(value) {
  return asFiniteNumber(value);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveState(input, snapshot) {
  if (input.sourceUnavailable === true) return SMART_WIDGET_STATES.SOURCE_UNAVAILABLE;
  if (input.sourceConnected !== true) return SMART_WIDGET_STATES.NOT_CONNECTED;
  if (input.blockedByMissingEvidence === true) {
    return SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE;
  }
  if (input.stale === true) return SMART_WIDGET_STATES.STALE;
  if (input.empty === true && input.sourceComplete === true) return SMART_WIDGET_STATES.EMPTY;
  if (snapshot && input.sourceComplete === true) return SMART_WIDGET_STATES.READY;
  if (snapshot) return SMART_WIDGET_STATES.PARTIAL;
  return input.sourceComplete === true
    ? SMART_WIDGET_STATES.EMPTY
    : SMART_WIDGET_STATES.PARTIAL;
}

function resolveActual(snapshot) {
  const paid = money(snapshot?.incomePaid);
  const earned = money(snapshot?.incomeEarned);
  const real = money(snapshot?.incomeReal);

  if (snapshot?.incomePaidAvailable === true && paid !== null) {
    return Object.freeze({ value: paid, basis: "PAID" });
  }
  if (snapshot?.incomeEarnedAvailable === true && earned !== null) {
    return Object.freeze({ value: earned, basis: "EARNED" });
  }
  if (snapshot?.incomeRealAvailable === true &&
      snapshot?.incomeRealBasis !== "UNAVAILABLE" &&
      real !== null) {
    return Object.freeze({ value: real, basis: snapshot.incomeRealBasis || "REAL" });
  }
  return Object.freeze({ value: null, basis: "UNAVAILABLE" });
}

function actualLabel(basis) {
  if (basis === "PAID") return "paid";
  if (basis === "EARNED") return "earned";
  if (basis === "UNAVAILABLE") return "unavailable";
  return "real";
}

function subtitleFor({ state, actual, target, gap, riskConfirmed }) {
  if (state === SMART_WIDGET_STATES.NOT_CONNECTED) {
    return "Compensation Intelligence está desconectado; no usamos primas, cotizaciones, Pipeline ni Cartera como sustituto.";
  }
  if (state === SMART_WIDGET_STATES.SOURCE_UNAVAILABLE) {
    return "La fuente productiva de compensación no respondió. Las cifras anteriores no se reutilizan.";
  }
  if (state === SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE) {
    return "Falta evidencia para presentar una conclusión económica.";
  }
  if (state === SMART_WIDGET_STATES.EMPTY) {
    return "La fuente está disponible y no reportó movimientos para este periodo.";
  }
  if (actual.value === null) {
    return "No hay ingreso pagado, devengado o real disponible para este periodo.";
  }
  if (riskConfirmed) {
    return "Existe una señal canónica de ingreso en riesgo con evidencia de origen.";
  }
  if (target === null) {
    return `${actual.basis === "PAID" ? "Pagado" : actual.basis === "EARNED" ? "Devengado" : "Ingreso real"} disponible; meta de ingresos no definida.`;
  }
  return `Brecha contra meta: ${gap}.`;
}

export function createIncomeProgressWidget080(input = {}) {
  const snapshot = input.compensationSnapshot || null;
  const state = resolveState(input, snapshot);
  const actual = resolveActual(snapshot);
  const potential = money(snapshot?.incomePotential);
  const observedAtRisk = money(snapshot?.incomeAtRiskObserved);
  const confirmedAtRisk = snapshot?.incomeAtRiskConfirmed === true
    ? money(snapshot?.incomeAtRisk)
    : null;
  const target = money(input.incomeTarget ?? snapshot?.incomeTarget);
  const gap = actual.value !== null && target !== null
    ? Math.max(0, target - actual.value)
    : null;
  const riskConfirmed = confirmedAtRisk !== null && confirmedAtRisk > 0;
  const sourceContract = snapshot?.contractVersion || null;
  const connected = input.sourceConnected === true;
  const evidence = safeArray(snapshot?.evidenceRefs);
  const currency = snapshot?.currency || input.currency || "MXN";
  const missingContext = [];

  if (!connected) missingContext.push("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001");
  if (input.blockedByMissingEvidence === true) {
    missingContext.push(input.blockedReason || "COMPENSATION_EVIDENCE");
  }
  if (observedAtRisk > 0 && !riskConfirmed) {
    missingContext.push("AT_RISK_SIGNAL_EVIDENCE");
  }

  return createProductiveSmartWidget({
    widgetFamily: PRODUCTIVE_SMART_WIDGET_FAMILIES.INCOME_PROGRESS_WIDGET,
    widgetId: "forge-income-progress",
    state,
    rankScore: input.rankScore ?? 55,
    hardPriority: riskConfirmed ? "CONFIRMED_INCOME_AT_RISK" : null,
    title: "Ingresos",
    subtitle: subtitleFor({ state, actual, target, gap, riskConfirmed }),
    primaryMetric: createMetric({
      value: actual.value,
      unit: currency,
      label: actualLabel(actual.basis),
      display: actual.value === null ? null : String(actual.value),
    }),
    secondaryMetric: createMetric({
      value: potential,
      unit: currency,
      label: "potential",
      display: potential === null ? null : String(potential),
    }),
    comparison: {
      actualBasis: actual.basis,
      incomeReal: money(snapshot?.incomeReal),
      incomeRealBasis: snapshot?.incomeRealBasis || "UNAVAILABLE",
      incomeEarned: money(snapshot?.incomeEarned),
      incomeEarnedAvailable: snapshot?.incomeEarnedAvailable === true,
      incomePaid: money(snapshot?.incomePaid),
      incomePaidAvailable: snapshot?.incomePaidAvailable === true,
      incomeEstimated: money(snapshot?.incomeEstimated),
      incomePotential: potential,
      incomeAtRisk: confirmedAtRisk,
      incomeAtRiskObserved: observedAtRisk,
      incomeAtRiskConfirmed: riskConfirmed,
      target,
      gap,
    },
    trend: input.trend || null,
    chartReady: snapshot?.history
      ? {
          kind: "INCOME_HISTORY",
          series: cloneJson(snapshot.history),
          truthBasis: actual.basis,
        }
      : null,
    whyNow: riskConfirmed
      ? "Una señal AT_RISK activa, owner-scoped y respaldada por evidencia debe revisarse antes que una métrica informativa."
      : actual.value !== null
        ? "El widget resume la verdad económica del periodo sin recalcularla ni mezclar proyecciones."
        : connected
          ? "La fuente está conectada, pero no existe una base económica disponible para este periodo."
          : "El widget permanece oculto hasta recibir el snapshot canónico de Compensation Intelligence.",
    evidence,
    uncertainty: [
      ...safeArray(input.uncertainty),
      ...(!connected
        ? ["income_must_not_be_derived_from_quotes_premium_pipeline_or_cartera"]
        : []),
      ...(observedAtRisk > 0 && !riskConfirmed
        ? ["at_risk_amount_not_prioritized_without_signal_evidence"]
        : []),
      ...(input.stale === true ? ["compensation_snapshot_stale"] : []),
    ],
    missingContext,
    confidence: state === SMART_WIDGET_STATES.READY && evidence.length > 0
      ? "HIGH"
      : [
          SMART_WIDGET_STATES.PARTIAL,
          SMART_WIDGET_STATES.STALE,
        ].includes(state)
        ? "MEDIUM"
        : "LOW",
    freshness: input.freshness || null,
    sourceAuthorities: [
      "COMPENSATION_INTELLIGENCE",
      "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001",
      "ADVISOR_COMPENSATION_HISTORY_SERIES_001",
    ],
    deepLink: input.deepLink || "?nav=comisiones",
    reviewAction: { type: "NAVIGATE", label: "Abrir Comisiones" },
    blockedReason: input.blockedReason || (
      state === SMART_WIDGET_STATES.NOT_CONNECTED
        ? "COMPENSATION_PRODUCT_SOURCE_DISCONNECTED"
        : null
    ),
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.METRIC,
    payload: {
      sourceContract,
      actual: actual.value,
      actualBasis: actual.basis,
      real: money(snapshot?.incomeReal),
      realBasis: snapshot?.incomeRealBasis || "UNAVAILABLE",
      earned: money(snapshot?.incomeEarned),
      earnedAvailable: snapshot?.incomeEarnedAvailable === true,
      paid: money(snapshot?.incomePaid),
      paidAvailable: snapshot?.incomePaidAvailable === true,
      estimated: money(snapshot?.incomeEstimated),
      potential,
      atRisk: confirmedAtRisk,
      atRiskObserved: observedAtRisk,
      atRiskConfirmed: riskConfirmed,
      target,
      gap,
      unknownIsNotZero: snapshot?.safeguards?.unknownIsNotZero === true,
      deepLinkTarget: "comisiones",
    },
  });
}

export {
  resolveActual,
  resolveState,
};

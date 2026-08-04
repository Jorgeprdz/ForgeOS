export const MICK_GOAL_GAP_COACH_VERSION = "MICK_GOAL_GAP_COACH_V1";

function finite(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampGap(target, current) {
  return target === null || current === null ? null : Math.max(0, target - current);
}

function formatMoney(value) {
  if (finite(value) === null) return "sin dato";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function pluralPolicies(value) {
  return `${value} ${value === 1 ? "póliza" : "pólizas"}`;
}

export function resolveMickActualIncome(snapshot) {
  const paid = finite(snapshot?.incomePaid);
  const earned = finite(snapshot?.incomeEarned);
  const real = finite(snapshot?.incomeReal);
  if (snapshot?.incomePaidAvailable === true && paid !== null) {
    return Object.freeze({ value: paid, basis: "PAID", label: "pagados" });
  }
  if (snapshot?.incomeEarnedAvailable === true && earned !== null) {
    return Object.freeze({ value: earned, basis: "EARNED", label: "devengados" });
  }
  if (snapshot?.incomeRealAvailable === true && snapshot?.incomeRealBasis !== "UNAVAILABLE" && real !== null) {
    return Object.freeze({ value: real, basis: snapshot.incomeRealBasis || "REAL", label: "de ingreso real" });
  }
  return Object.freeze({ value: null, basis: "UNAVAILABLE", label: "sin base real disponible" });
}

function urgencyScore(target, gap) {
  if (target === null || gap === null || target <= 0) return null;
  return Math.min(1, gap / target);
}

function estimatedNote(snapshot) {
  const estimated = finite(snapshot?.incomeEstimated);
  if (estimated === null || estimated <= 0) return null;
  return `Hay ${formatMoney(estimated)} estimados, pero Mick no los cuenta como ingreso real hasta que cambien de estado.`;
}

export function composeMickGoalGapCoach({ policy, economicTarget, incomeSource }) {
  const snapshot = incomeSource?.compensationSnapshot || null;
  const actual = resolveMickActualIncome(snapshot);
  const normalizedTarget = finite(economicTarget);
  const economicGap = clampGap(normalizedTarget, actual.value);
  const policyGap = finite(policy?.confirmedGap);
  const policyTarget = finite(policy?.target);
  const policyConfirmed = finite(policy?.confirmed);
  const policyReady = policyTarget !== null && policyConfirmed !== null && policyGap !== null;
  const incomeReady = normalizedTarget !== null && normalizedTarget > 0 && actual.value !== null && economicGap !== null;
  const notes = [];
  const estimated = estimatedNote(snapshot);
  if (estimated) notes.push(estimated);
  if (finite(snapshot?.incomePotential) > 0) {
    notes.push(`${formatMoney(snapshot.incomePotential)} permanecen como potencial y no cuentan como ingreso real.`);
  }
  if (snapshot?.incomeAtRiskConfirmed === true && finite(snapshot?.incomeAtRisk) > 0) {
    notes.push(`${formatMoney(snapshot.incomeAtRisk)} tienen una señal confirmada de ingreso en riesgo.`);
  }

  if (!policyReady && !incomeReady) {
    return Object.freeze({
      schema: MICK_GOAL_GAP_COACH_VERSION,
      status: "INSUFFICIENT_DATA",
      priority: "SOURCE_REVIEW",
      message: "Mick todavía no puede calcular una brecha confiable para tus metas del mes.",
      detail: "Falta Forecast de pólizas, una meta económica válida o ingreso real de Compensación.",
      actionLabel: "Revisar fuentes",
      actionRoute: "actividad",
      policy,
      economic: { target: normalizedTarget, actual: actual.value, actualBasis: actual.basis, gap: economicGap },
    });
  }

  if (policyReady && policyGap === 0 && incomeReady && economicGap === 0) {
    return Object.freeze({
      schema: MICK_GOAL_GAP_COACH_VERSION,
      status: "GOALS_COVERED",
      priority: "MAINTAIN",
      message: `Alcanzaste tus metas del mes: ${policyConfirmed} pólizas confirmadas y ${formatMoney(actual.value)} ${actual.label}.`,
      detail: notes[0] || "Mantén el seguimiento de cierres y pagos sin tratar proyecciones como ingreso confirmado.",
      actionLabel: "Abrir Forecast",
      actionRoute: "actividad",
      policy,
      economic: { target: normalizedTarget, actual: actual.value, actualBasis: actual.basis, gap: economicGap },
    });
  }

  const policyUrgency = policyReady ? urgencyScore(policyTarget, policyGap) : null;
  const incomeUrgency = incomeReady ? urgencyScore(normalizedTarget, economicGap) : null;
  let message;
  let priority;
  let actionRoute;

  if (policyReady && policyGap > 0 && incomeReady && economicGap > 0) {
    if ((incomeUrgency ?? 0) > (policyUrgency ?? 0)) {
      message = `Te faltan ${formatMoney(economicGap)} para alcanzar tu meta de ingresos. También faltan ${pluralPolicies(policyGap)} confirmadas para la meta comercial.`;
      priority = "ECONOMIC_GAP";
      actionRoute = "comisiones";
    } else {
      message = `Te faltan ${pluralPolicies(policyGap)} para alcanzar tu meta comercial. También faltan ${formatMoney(economicGap)} para la meta de ingresos.`;
      priority = "POLICY_GAP";
      actionRoute = "actividad";
    }
  } else if (policyReady && policyGap > 0) {
    message = `Te faltan ${pluralPolicies(policyGap)} para alcanzar tu meta comercial. Llevas ${policyConfirmed} de ${policyTarget} confirmadas.`;
    priority = "POLICY_GAP";
    actionRoute = "actividad";
  } else if (incomeReady && economicGap > 0) {
    message = `Te faltan ${formatMoney(economicGap)} para alcanzar tu meta de ingresos. Tienes ${formatMoney(actual.value)} ${actual.label}.`;
    priority = "ECONOMIC_GAP";
    actionRoute = "comisiones";
  } else if (policyReady && policyGap === 0) {
    message = `La meta comercial está cubierta con ${policyConfirmed} pólizas confirmadas. Mick todavía no puede cerrar la lectura económica con ingreso real disponible.`;
    priority = "ECONOMIC_SOURCE_REVIEW";
    actionRoute = "comisiones";
  } else {
    message = `La meta de ingresos está cubierta con ${formatMoney(actual.value)} ${actual.label}. Mick todavía necesita Forecast de pólizas para completar la lectura comercial.`;
    priority = "POLICY_SOURCE_REVIEW";
    actionRoute = "actividad";
  }

  const weightedResidual = finite(policy?.weightedResidual);
  const pipelineNote = weightedResidual !== null && policyGap !== null && weightedResidual < policyGap
    ? `El Pipeline ponderado reduce la brecha probable a ${weightedResidual}, pero no cuenta como póliza confirmada.`
    : null;
  const detail = [pipelineNote, ...notes].filter(Boolean).join(" ")
    || "Mick usa únicamente producción confirmada e ingreso pagado, devengado o real con evidencia.";

  return Object.freeze({
    schema: MICK_GOAL_GAP_COACH_VERSION,
    status: "READY",
    priority,
    message,
    detail,
    actionLabel: actionRoute === "comisiones" ? "Abrir Comisiones" : "Abrir Forecast",
    actionRoute,
    policy,
    economic: {
      target: normalizedTarget,
      actual: actual.value,
      actualBasis: actual.basis,
      gap: economicGap,
      estimated: finite(snapshot?.incomeEstimated),
      potential: finite(snapshot?.incomePotential),
      atRisk: snapshot?.incomeAtRiskConfirmed === true ? finite(snapshot?.incomeAtRisk) : null,
    },
  });
}

export const MICK_GOAL_GAP_COACH_BOUNDARIES = Object.freeze({
  estimatedAsReal: false,
  potentialAsReal: false,
  unknownAsZero: false,
  pipelineAsConfirmedPolicy: false,
  automaticActionAllowed: false,
  createsCompensationTruth: false,
  createsProductionTruth: false,
});

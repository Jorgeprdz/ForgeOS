const crypto = require("crypto");

const ADVISOR_FORECAST_RECONCILIATION_STATUSES = Object.freeze({
  READY: "READY",
  OPEN_PERIOD: "OPEN_PERIOD",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",
  BLOCKED: "BLOCKED"
});

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
}

function monthKey(value, timeZone = "America/Mexico_City") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return year && month ? `${year}-${month}` : null;
}

function periodClosed(period, reconciledAt) {
  if (!period?.end || !reconciledAt) return null;
  const end = new Date(`${period.end}T23:59:59.999Z`);
  const reconciled = new Date(reconciledAt);
  if (Number.isNaN(end.getTime()) || Number.isNaN(reconciled.getTime())) return null;
  return reconciled > end;
}

function boundaryFlags() {
  return {
    automaticDecisionAllowed: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsDatabaseWrite: false,
    createsForecastMutation: false,
    createsActualProductionMutation: false,
    retroactiveForecastMutationAllowed: false,
    sourceMutationPerformed: false
  };
}

function projectionView(name, projection, actual) {
  const projected = finite(projection);
  if (projected === null || actual === null) {
    return {
      name,
      projected,
      actual,
      signedError: null,
      absoluteError: null,
      absolutePercentageError: null,
      bias: "UNKNOWN"
    };
  }
  const signedError = round(projected - actual, 2);
  const absoluteError = round(Math.abs(signedError), 2);
  const absolutePercentageError = actual > 0 ? round((absoluteError / actual) * 100, 1) : null;
  const bias = signedError > 0 ? "OPTIMISTIC" : signedError < 0 ? "CONSERVATIVE" : "EXACT";
  return {
    name,
    projected,
    actual,
    signedError,
    absoluteError,
    absolutePercentageError,
    bias
  };
}

function normalizeReadModel(readModel) {
  if (!readModel || !["ADVISOR_FORECAST_READ_MODEL_V2", "ADVISOR_FORECAST_READ_MODEL_V3"].includes(readModel.schema)) {
    throw new TypeError("Advisor Forecast Read Model V2 or V3 is required");
  }
  if (!present(readModel.advisorId)) throw new TypeError("Advisor Forecast snapshot requires advisorId");
  if (!readModel.period?.yearMonth) throw new TypeError("Advisor Forecast snapshot requires a monthly period");
  return clone(readModel);
}

function createAdvisorForecastIssuedSnapshot({
  readModel,
  issuedAt = null,
  evidenceRefs = [],
  sourceEvidenceIds = [],
  sourceOwners = []
} = {}) {
  const model = normalizeReadModel(readModel);
  const timestamp = issuedAt || model.generatedAt;
  if (!timestamp || Number.isNaN(new Date(timestamp).getTime())) throw new TypeError("issuedAt is required");
  const weightedContribution = finite(model.goalGap?.weightedPipelineContribution);
  const currentProduction = finite(model.currentProduction);
  const snapshotCore = {
    schema: "ADVISOR_FORECAST_ISSUED_SNAPSHOT_V1",
    snapshotId: `advisor-forecast-${model.advisorId}-${model.period.yearMonth}-${new Date(timestamp).toISOString()}`,
    advisorId: model.advisorId,
    period: clone(model.period),
    issuedAt: new Date(timestamp).toISOString(),
    readModelSchema: model.schema,
    forecastState: model.state || null,
    confidence: model.confidence || null,
    healthStatus: model.healthStatus || null,
    target: finite(model.target),
    currentProduction,
    paceProjection: finite(model.paceProjection),
    weightedPipelineContribution: weightedContribution,
    weightedPipelineExpectedClose: currentProduction !== null && weightedContribution !== null
      ? round(currentProduction + weightedContribution, 2)
      : null,
    goalGapState: model.goalGap?.state || null,
    remainingAfterWeightedPipeline: finite(model.goalGap?.remainingAfterWeightedPipeline),
    activityRequirement: clone(model.activityRequirement || null),
    evidenceRefs: unique([
      ...asArray(model.evidenceRefs),
      ...asArray(evidenceRefs)
    ]),
    sourceEvidenceIds: unique(asArray(sourceEvidenceIds)),
    sourceOwners: unique([
      ...asArray(sourceOwners),
      "ADVISOR_FORECAST"
    ]),
    immutable: true,
    finalAuthority: "HUMAN",
    ...boundaryFlags()
  };
  return Object.freeze({
    ...snapshotCore,
    snapshotDigest: digest(snapshotCore)
  });
}

function verifyAdvisorForecastIssuedSnapshot(snapshot) {
  if (!snapshot || snapshot.schema !== "ADVISOR_FORECAST_ISSUED_SNAPSHOT_V1") return false;
  const { snapshotDigest, ...core } = snapshot;
  return present(snapshotDigest) && digest(core) === snapshotDigest;
}

function actualProductionFromFacts({ advisorId, period, policyFacts, actualEvidence }) {
  if (!Array.isArray(policyFacts)) {
    return {
      status: "MISSING",
      actualConfirmedProduction: null,
      policyIds: [],
      evidenceRefs: [],
      sourceEvidenceIds: [],
      sourceOwners: [],
      missingContext: ["policyFacts"]
    };
  }

  const matching = policyFacts.filter((fact) => {
    if (!fact || typeof fact !== "object") return false;
    if (fact.advisorId && fact.advisorId !== advisorId) {
      throw new Error("Forecast reconciliation received cross-advisor production data");
    }
    const factMonth = fact.yearMonth || monthKey(
      fact.soldAt || fact.occurredAt || fact.createdAt,
      period.timeZone || "America/Mexico_City"
    );
    return fact.eventType === "POLICY_SOLD_CONFIRMED" && present(fact.policyId) && factMonth === period.yearMonth;
  });
  const uniquePolicies = new Map(matching.map((fact) => [fact.policyId, fact]));
  const facts = [...uniquePolicies.values()];
  const evidenceRefs = unique([
    ...facts.flatMap((fact) => asArray(fact.evidenceRefs || fact.evidenceRef)),
    ...asArray(actualEvidence?.evidenceRefs || actualEvidence?.evidenceRef)
  ]);
  const sourceEvidenceIds = unique([
    ...facts.flatMap((fact) => asArray(fact.sourceEvidenceIds || fact.sourceEvidenceId)),
    ...asArray(actualEvidence?.sourceEvidenceIds || actualEvidence?.sourceEvidenceId)
  ]);
  const sourceOwners = unique([
    ...facts.flatMap((fact) => asArray(fact.sourceOwners || fact.sourceOwner)),
    ...asArray(actualEvidence?.sourceOwners || actualEvidence?.sourceOwner),
    "PRODUCTION_EVENTS"
  ]);
  const hasDirectEvidence = evidenceRefs.length > 0 || sourceEvidenceIds.length > 0;

  if (facts.length === 0 && !hasDirectEvidence) {
    return {
      status: "ZERO_WITHOUT_EVIDENCE",
      actualConfirmedProduction: null,
      policyIds: [],
      evidenceRefs,
      sourceEvidenceIds,
      sourceOwners,
      missingContext: ["explicit_zero_production_evidence"]
    };
  }

  return {
    status: "READY",
    actualConfirmedProduction: facts.length,
    policyIds: facts.map((fact) => fact.policyId),
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    missingContext: []
  };
}

function reconcileAdvisorForecastActual({
  issuedSnapshot,
  policyFacts,
  actualEvidence = {},
  reconciledAt = new Date().toISOString(),
  requireClosedPeriod = true
} = {}) {
  const snapshot = clone(issuedSnapshot);
  if (!verifyAdvisorForecastIssuedSnapshot(snapshot)) {
    return Object.freeze({
      reconciliationStatus: ADVISOR_FORECAST_RECONCILIATION_STATUSES.BLOCKED,
      reconciledAt,
      warnings: ["Issued forecast snapshot failed immutable digest verification."],
      ...boundaryFlags()
    });
  }

  const closed = periodClosed(snapshot.period, reconciledAt);
  if (requireClosedPeriod && closed !== true) {
    return Object.freeze({
      reconciliationStatus: ADVISOR_FORECAST_RECONCILIATION_STATUSES.OPEN_PERIOD,
      snapshotId: snapshot.snapshotId,
      snapshotDigest: snapshot.snapshotDigest,
      advisorId: snapshot.advisorId,
      period: clone(snapshot.period),
      reconciledAt,
      finalActualProduction: null,
      warnings: ["Forecast versus actual reconciliation remains open until the governed period closes."],
      ...boundaryFlags()
    });
  }

  let actual;
  try {
    actual = actualProductionFromFacts({
      advisorId: snapshot.advisorId,
      period: snapshot.period,
      policyFacts,
      actualEvidence
    });
  } catch (error) {
    return Object.freeze({
      reconciliationStatus: ADVISOR_FORECAST_RECONCILIATION_STATUSES.BLOCKED,
      snapshotId: snapshot.snapshotId,
      advisorId: snapshot.advisorId,
      period: clone(snapshot.period),
      reconciledAt,
      warnings: [error.message],
      ...boundaryFlags()
    });
  }

  if (actual.status !== "READY") {
    return Object.freeze({
      reconciliationStatus: ADVISOR_FORECAST_RECONCILIATION_STATUSES.INSUFFICIENT_DATA,
      snapshotId: snapshot.snapshotId,
      snapshotDigest: snapshot.snapshotDigest,
      advisorId: snapshot.advisorId,
      period: clone(snapshot.period),
      reconciledAt,
      finalActualProduction: null,
      missingContext: actual.missingContext,
      evidenceRefs: actual.evidenceRefs,
      warnings: ["Missing actual production evidence is not converted into zero production."],
      ...boundaryFlags()
    });
  }

  const actualCount = actual.actualConfirmedProduction;
  const views = {
    pace: projectionView("PACE_PROJECTION", snapshot.paceProjection, actualCount),
    weightedPipeline: projectionView("WEIGHTED_PIPELINE_EXPECTED_CLOSE", snapshot.weightedPipelineExpectedClose, actualCount),
    confirmedAtIssue: projectionView("CONFIRMED_AT_ISSUE", snapshot.currentProduction, actualCount)
  };
  const output = {
    reconciliationStatus: ADVISOR_FORECAST_RECONCILIATION_STATUSES.READY,
    schema: "ADVISOR_FORECAST_ACTUAL_RECONCILIATION_V1",
    reconciliationId: `${snapshot.snapshotId}-actual-${new Date(reconciledAt).toISOString()}`,
    snapshotId: snapshot.snapshotId,
    snapshotDigest: snapshot.snapshotDigest,
    advisorId: snapshot.advisorId,
    period: clone(snapshot.period),
    issuedAt: snapshot.issuedAt,
    reconciledAt: new Date(reconciledAt).toISOString(),
    target: snapshot.target,
    finalActualProduction: actualCount,
    policyIds: actual.policyIds,
    projectionViews: views,
    paceAbsoluteError: views.pace.absoluteError,
    weightedPipelineAbsoluteError: views.weightedPipeline.absoluteError,
    paceBias: views.pace.bias,
    weightedPipelineBias: views.weightedPipeline.bias,
    evidenceRefs: unique([...snapshot.evidenceRefs, ...actual.evidenceRefs]),
    sourceEvidenceIds: unique([...snapshot.sourceEvidenceIds, ...actual.sourceEvidenceIds]),
    sourceOwners: unique([...snapshot.sourceOwners, ...actual.sourceOwners]),
    forecastSnapshotVerified: true,
    forecastSnapshotPreserved: verifyAdvisorForecastIssuedSnapshot(snapshot),
    actualSemantics: "UNIQUE_POLICY_SOLD_CONFIRMED_EVENTS",
    monetaryAccuracyCalculated: false,
    warnings: [
      "Pace and weighted Pipeline are reconciled as separate historical views.",
      "This reconciliation does not rewrite the issued forecast or create revenue truth."
    ],
    ...boundaryFlags()
  };
  return Object.freeze(output);
}

function median(values) {
  const sorted = values.filter((value) => value !== null).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : round((sorted[middle - 1] + sorted[middle]) / 2, 2);
}

function mean(values) {
  const finiteValues = values.filter((value) => value !== null);
  if (!finiteValues.length) return null;
  return round(finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length, 2);
}

function countBias(reconciliations, field) {
  return reconciliations.reduce((counts, item) => {
    const value = item[field] || "UNKNOWN";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function buildAdvisorForecastReconciliationReport({ reconciliations = [], generatedAt = new Date().toISOString() } = {}) {
  const ready = asArray(reconciliations).filter((item) => item?.reconciliationStatus === ADVISOR_FORECAST_RECONCILIATION_STATUSES.READY);
  return Object.freeze({
    schema: "ADVISOR_FORECAST_RECONCILIATION_REPORT_V1",
    reportStatus: ready.length ? "READY" : "INSUFFICIENT_DATA",
    generatedAt,
    periodCount: ready.length,
    paceMeanAbsoluteError: mean(ready.map((item) => finite(item.paceAbsoluteError))),
    paceMedianAbsoluteError: median(ready.map((item) => finite(item.paceAbsoluteError))),
    weightedPipelineMeanAbsoluteError: mean(ready.map((item) => finite(item.weightedPipelineAbsoluteError))),
    weightedPipelineMedianAbsoluteError: median(ready.map((item) => finite(item.weightedPipelineAbsoluteError))),
    paceBiasCounts: countBias(ready, "paceBias"),
    weightedPipelineBiasCounts: countBias(ready, "weightedPipelineBias"),
    periods: ready.map((item) => ({
      period: clone(item.period),
      snapshotId: item.snapshotId,
      actual: item.finalActualProduction,
      paceAbsoluteError: item.paceAbsoluteError,
      paceBias: item.paceBias,
      weightedPipelineAbsoluteError: item.weightedPipelineAbsoluteError,
      weightedPipelineBias: item.weightedPipelineBias
    })),
    reportOwnsForecastTruth: false,
    reportOwnsProductionTruth: false,
    monetaryAccuracyCalculated: false,
    ...boundaryFlags()
  });
}

module.exports = {
  ADVISOR_FORECAST_RECONCILIATION_STATUSES,
  createAdvisorForecastIssuedSnapshot,
  verifyAdvisorForecastIssuedSnapshot,
  reconcileAdvisorForecastActual,
  buildAdvisorForecastReconciliationReport
};

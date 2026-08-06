import { DAILY_POINTS_RULES, calcularPuntosDiarios } from "../../daily-points-engine.js";

export const POINTS_ADAPTER_VERSION = "ACTIVITY_POINTS_AUTHORITY_ADAPTER_V1";
export const POINTS_OWNER = "PRODUCTIVITY";
export const REQUIRED_POINT_METRICS = Object.freeze(Object.keys(DAILY_POINTS_RULES));

function freeze(value) { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.values(value).forEach(freeze); return Object.freeze(value); }
const unique = (values) => [...new Set((values || []).filter((value) => value !== null && value !== undefined && value !== ""))];
function normalizedImportedRules() { return Object.fromEntries(Object.entries(DAILY_POINTS_RULES).sort(([a], [b]) => a.localeCompare(b))); }
function normalizedSnapshotRules(snapshot) { if (!snapshot || typeof snapshot !== "object" || !snapshot.rules || typeof snapshot.rules !== "object") return null; return Object.fromEntries(Object.entries(snapshot.rules).sort(([a], [b]) => a.localeCompare(b))); }
const sameRules = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function resolveRuleAuthority(ruleSnapshot) {
  const imported = normalizedImportedRules();
  if (!ruleSnapshot) return freeze({ state: "READY", calculationAuthority: "RECOVERED_ACTIVITY_POINT_AUTHORITY", metadata: { authorityType: "RECOVERED_ACTIVITY_POINT_AUTHORITY", authoritySource: "daily-points-engine.js", owner: POINTS_OWNER, ruleState: "RECOVERED", warnings: ["Legacy qualitative labels suppressed", "Unknown-to-zero behavior guarded by adapter"] } });
  if (ruleSnapshot.state === "CONFLICTING" || ruleSnapshot.valid !== true) return freeze({ state: "CONFLICTING_RULE_AUTHORITY", calculationAuthority: null, metadata: { authorityType: "CONFLICTING", authoritySource: null, owner: POINTS_OWNER, ruleState: "CONFLICTING", warnings: ["Rule authority conflict blocks calculation"] } });
  const snapshotRules = normalizedSnapshotRules(ruleSnapshot);
  if (!snapshotRules || !sameRules(imported, snapshotRules)) return freeze({ state: "CONFLICTING_RULE_AUTHORITY", calculationAuthority: null, metadata: { authorityType: "RULE_SNAPSHOT", authoritySource: ruleSnapshot.reference || null, owner: POINTS_OWNER, ruleState: "SUPERSESSION_REQUIRES_ENGINE_UPDATE", warnings: ["RuleSnapshot differs from recovered engine; authorities were not mixed"] } });
  return freeze({ state: "READY", calculationAuthority: "RULE_SNAPSHOT_CONFIRMED_RECOVERED_ENGINE", metadata: { authorityType: "RULE_SNAPSHOT", authoritySource: ruleSnapshot.reference, owner: POINTS_OWNER, ruleState: "SNAPSHOT_CONFIRMED", supersedes: "daily-points-engine.js metadata only", warnings: ["Legacy qualitative labels suppressed", "Unknown-to-zero behavior guarded by adapter"] } });
}

function normalizeMetricEnvelope(metricKey, envelope) {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) return freeze({ metricKey, state: "INCOMPLETE", value: null, sourceRefs: [], warnings: ["metric_missing"] });
  const value = envelope.value;
  const complete = envelope.completeness === "COMPLETE";
  const known = ["CONFIRMED", "OBSERVED"].includes(envelope.evidenceState);
  const ownerValid = envelope.metricOwner === POINTS_OWNER;
  const integer = Number.isInteger(value) && value >= 0;
  if (!complete || !known || !ownerValid || !integer) return freeze({ metricKey, state: "INCOMPLETE", value: null, sourceRefs: unique(envelope.sourceRefs), warnings: unique([...(!complete ? ["metric_incomplete"] : []), ...(!known ? ["metric_evidence_unknown"] : []), ...(!ownerValid ? ["metric_owner_invalid"] : []), ...(!integer ? ["metric_value_unknown_or_invalid"] : [])]) });
  return freeze({ metricKey, state: "READY", value, sourceRefs: unique(envelope.sourceRefs), warnings: [] });
}

export function calculateActivityPoints(input = {}) {
  const authority = resolveRuleAuthority(input.ruleSnapshot);
  if (authority.state !== "READY") return freeze({ adapterVersion: POINTS_ADAPTER_VERSION, state: authority.state, total: null, objective: null, remaining: null, breakdown: null, weights: null, period: input.period || null, timezone: input.timezone || null, sourceRefs: [], authority: authority.metadata, warnings: authority.metadata.warnings });
  const normalized = {};
  for (const metricKey of REQUIRED_POINT_METRICS) normalized[metricKey] = normalizeMetricEnvelope(metricKey, input.counts?.[metricKey]);
  const incomplete = Object.values(normalized).filter((metric) => metric.state !== "READY");
  const sourceRefs = unique(Object.values(normalized).flatMap((metric) => metric.sourceRefs));
  if (incomplete.length) return freeze({ adapterVersion: POINTS_ADAPTER_VERSION, state: "INCOMPLETE", total: null, objective: null, remaining: null, breakdown: null, weights: freeze({ ...DAILY_POINTS_RULES }), period: input.period || null, timezone: input.timezone || null, sourceRefs, authority: authority.metadata, warnings: unique([...authority.metadata.warnings, ...incomplete.flatMap((metric) => metric.warnings)]), missingOrIncompleteMetrics: incomplete.map((metric) => metric.metricKey) });
  const completeCounts = Object.fromEntries(REQUIRED_POINT_METRICS.map((metricKey) => [metricKey, normalized[metricKey].value]));
  const legacy = calcularPuntosDiarios(completeCounts);
  return freeze({ adapterVersion: POINTS_ADAPTER_VERSION, state: "READY", total: legacy.total, objective: legacy.objetivo, remaining: legacy.faltantes, breakdown: Object.fromEntries(Object.entries(legacy.breakdown).map(([metricKey, value]) => [metricKey, { count: value.cantidad, points: value.puntos, sourceRefs: normalized[metricKey].sourceRefs }])), weights: freeze({ ...DAILY_POINTS_RULES }), period: input.period || null, timezone: input.timezone || null, sourceRefs, authority: authority.metadata, warnings: authority.metadata.warnings, boundaries: { exposesLegacyQualitativeLabels: false, humanScore: false, recommendationWording: false, nashDependency: false, uiDependency: false } });
}

export function evaluatePointCombination(counts = {}, remainingPoints = 0) {
  if (!Number.isInteger(remainingPoints) || remainingPoints < 0) throw new TypeError("POINT_COMBINATION_REMAINING_INVALID");
  const normalized = {}; let totalPoints = 0;
  for (const [metricKey, count] of Object.entries(counts)) { if (!Object.prototype.hasOwnProperty.call(DAILY_POINTS_RULES, metricKey)) throw new TypeError("POINT_COMBINATION_METRIC_INVALID"); if (!Number.isInteger(count) || count < 0) throw new TypeError("POINT_COMBINATION_COUNT_INVALID"); if (count > 0) normalized[metricKey] = count; totalPoints += count * DAILY_POINTS_RULES[metricKey]; }
  return freeze({ counts: normalized, totalPoints, excessPoints: Math.max(0, totalPoints - remainingPoints), exact: totalPoints === remainingPoints, reachesTarget: totalPoints >= remainingPoints });
}

export function findPointCombinations(remainingPoints, { maxUnits = 4, limit = 12 } = {}) {
  if (!Number.isInteger(remainingPoints) || remainingPoints < 0) throw new TypeError("POINT_COMBINATION_REMAINING_INVALID");
  if (!Number.isInteger(maxUnits) || maxUnits < 1 || maxUnits > 12) throw new TypeError("POINT_COMBINATION_MAX_UNITS_INVALID");
  const entries = Object.entries(DAILY_POINTS_RULES); const candidates = [];
  function visit(index, unitsLeft, counts) { if (index === entries.length) { const candidate = evaluatePointCombination(counts, remainingPoints); if (candidate.reachesTarget && candidate.totalPoints > 0) candidates.push(candidate); return; } const [metricKey] = entries[index]; for (let count = 0; count <= unitsLeft; count += 1) { if (count > 0) counts[metricKey] = count; else delete counts[metricKey]; visit(index + 1, unitsLeft - count, counts); } delete counts[metricKey]; }
  visit(0, maxUnits, {});
  candidates.sort((a, b) => Number(b.exact) - Number(a.exact) || a.excessPoints - b.excessPoints || Object.values(a.counts).reduce((sum, value) => sum + value, 0) - Object.values(b.counts).reduce((sum, value) => sum + value, 0) || JSON.stringify(a.counts).localeCompare(JSON.stringify(b.counts)));
  return freeze(candidates.slice(0, limit));
}

export const POINTS_AUTHORITY_METADATA = freeze(resolveRuleAuthority(null).metadata);

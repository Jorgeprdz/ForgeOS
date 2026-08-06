import { calculateActivityPoints, findPointCombinations } from "../../../../platform/productivity/activity-points-authority-adapter.mjs";
import { createProductiveActivityReportingBridge } from "../../forge-alive-material3/activity-ledger-reporting-bridge.mjs";

const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

function deviceId(storage = globalThis.localStorage) {
  const key = "forge.aura.activity.device-id.v1";
  const existing = storage?.getItem?.(key);
  if (existing) return existing;
  const value = `aura-activity-${globalThis.crypto?.randomUUID?.() || Date.now().toString(36)}`;
  storage?.setItem?.(key, value);
  return value;
}

function isoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function createActivityRuntimeAdapter({ client, user, windowRef = window } = {}) {
  if (!client || !user?.id) throw new Error("ACTIVITY_RUNTIME_AUTHORITY_REQUIRED");
  const canonical = globalThis.ForgeCanonicalActivityEventContractFES01;
  const ledgerApi = globalThis.ForgeActivityLedgerBrowserRuntimeFES02C;
  const calendarRepositoryApi = globalThis.ForgeOperationalCalendarRepositoryV1;
  const calendarEvaluator = globalThis.ForgeEligibleDateEvaluatorV1;
  const conversionApi = globalThis.ForgeActivityConversionReadModelV1;
  if (!canonical || !ledgerApi || !calendarRepositoryApi || !calendarEvaluator || !conversionApi) {
    throw new Error("ACTIVITY_PUBLISHED_AUTHORITIES_UNAVAILABLE");
  }

  let closed = false;
  let ledger = null;
  let reporting = null;
  const aborters = new Set();
  const tenantId = String(user.id);


  function captureDefinitions() {
    const requiredEventTypes = ["REFERRAL_RECEIVED", "CALL_COMPLETED", "APPOINTMENT_SCHEDULED", "APPOINTMENT_HELD", "ADVISOR_REFERRAL_RECEIVED"];
    if (!requiredEventTypes.every((eventType) => canonical.EVENT_TYPES.includes(eventType))) throw new Error("ACTIVITY_CAPTURE_TAXONOMY_INCOMPLETE");
    return freeze([
      { captureType: "REFERRAL_RECEIVED", eventType: "REFERRAL_RECEIVED", subjectType: "ACTIVITY", fields: [{ name: "activity_reference", type: "text" }, { name: "referral_reference", type: "text" }] },
      { captureType: "CALL_COMPLETED", eventType: "CALL_COMPLETED", subjectType: "ACTIVITY", fields: [{ name: "activity_reference", type: "text" }, { name: "contact_reference", type: "text" }] },
      { captureType: "APPOINTMENT_SCHEDULED", eventType: "APPOINTMENT_SCHEDULED", subjectType: "APPOINTMENT", fields: [{ name: "appointment_reference", type: "text" }, { name: "starts_at", type: "datetime-local" }, { name: "ends_at", type: "datetime-local" }] },
      { captureType: "APPOINTMENT_HELD", eventType: "APPOINTMENT_HELD", subjectType: "APPOINTMENT", fields: [{ name: "appointment_reference", type: "text" }, { name: "outcome_confirmed_at", type: "datetime-local" }], discriminator: { appointment_purpose: "INITIAL" } },
      { captureType: "CLOSING_APPOINTMENT_HELD", eventType: "APPOINTMENT_HELD", subjectType: "APPOINTMENT", fields: [{ name: "appointment_reference", type: "text" }, { name: "outcome_confirmed_at", type: "datetime-local" }], discriminator: { appointment_purpose: "CLOSING" } },
      { captureType: "ADVISOR_REFERRAL_RECEIVED", eventType: "ADVISOR_REFERRAL_RECEIVED", subjectType: "ACTIVITY", fields: [{ name: "activity_reference", type: "text" }, { name: "referred_advisor_reference", type: "text" }] },
    ]);
  }

  async function openLedger() {
    if (closed) throw new Error("ACTIVITY_RUNTIME_CLOSED");
    if (!ledger) {
      ledger = ledgerApi.create({ client, tenant_id: tenantId, device_id: deviceId(windowRef.localStorage) });
    }
    return ledger;
  }

  function createEventInput({ eventType, subjectType, subjectId, payload, occurredAt = new Date().toISOString() }) {
    if (!captureDefinitions().some((entry) => entry.eventType === eventType && entry.subjectType === subjectType)) throw new Error("ACTIVITY_EVENT_TYPE_NOT_WRITABLE");
    const idempotencyKey = `aura:${eventType}:${subjectId}:${occurredAt}`;
    return canonical.createCanonicalActivityEvent({
      event_type: eventType,
      tenant_id: tenantId,
      actor: { type: "ADVISOR", id: tenantId },
      subject: { type: subjectType, id: subjectId },
      source: { type: "ADVISOR_CONFIRMED", reference: idempotencyKey, channel: "FORGE_UI" },
      evidence_strength: "HUMAN_CONFIRMED",
      occurred_at: occurredAt,
      recorded_at: new Date().toISOString(),
      idempotency_key: idempotencyKey,
      privacy_class: "OPERATIONAL",
      learning_eligibility: false,
      payload,
      provenance: { source_system: "FORGE_AURA_ACTIVITY", source_record_id: subjectId, captured_via: "MANUAL_CONFIRMED", evidence_references: Object.values(payload) },
      confirmation_state: "CONFIRMED",
      safety_flags: canonical.DEFAULT_SAFETY_FLAGS,
    });
  }

  async function appendOne(input) {
    const selected = await openLedger();
    const event = createEventInput(input);
    const result = await selected.appendCanonicalEvent({ canonical_event: event, evidence_references: event.provenance.evidence_references });
    return freeze({ state: "PENDING_SYNC", eventId: event.event_id, result });
  }

  async function loadCalendar({ from, to } = {}) {
    if (!isoDate(from) || !isoDate(to) || from > to) {
      return freeze({ state: "CONFIGURATION_REQUIRED", period: null, reason: "OFFICIAL_PERIOD_REQUIRED" });
    }
    const controller = new AbortController();
    aborters.add(controller);
    try {
      const repository = calendarRepositoryApi.createOperationalCalendarRepository({ client, getSessionAdvisorId: async () => tenantId });
      const records = await repository.readAuthority({ from, to, signal: controller.signal });
      const advisorProfiles = records.profiles.filter((profile) => profile.advisorId === tenantId);
      const organizationProfiles = records.profiles.filter((profile) => profile.advisorId === null);
      return calendarEvaluator.evaluateEligibleDates({
        tenantId, advisorId: tenantId, period: { from, to }, advisorProfiles, organizationProfiles,
        overrides: records.overrides, timeOff: records.timeOff,
      });
    } catch (error) {
      const code = String(error?.code || error?.cause?.code || error?.message || "");
      if (/OPCAL_.*READ_FAILED|42P01|relation .* does not exist/i.test(code)) {
        return freeze({ state: "CONFIGURATION_REQUIRED", period: { from, to }, reason: "CALENDAR_TABLES_UNAVAILABLE" });
      }
      return freeze({ state: "ERROR", period: { from, to }, reason: code || "CALENDAR_READ_FAILED" });
    } finally {
      aborters.delete(controller);
    }
  }

  async function loadReporting(calendar, request) {
    if (!calendar || !["READY", "STALE"].includes(calendar.state) || !calendar.timezone) {
      return freeze({ state: "UNAVAILABLE", reason: "CALENDAR_AUTHORITY_NOT_READY" });
    }
    if (!reporting) {
      reporting = await createProductiveActivityReportingBridge({
        bootstrap: { getClient: async () => client }, ledgerRuntimeApi: ledgerApi,
        deviceId: deviceId(windowRef.localStorage), timeZone: calendar.timezone,
      });
    }
    try {
      const result = await reporting.runChartReady(request);
      return freeze({ state: "READY", ...result });
    } catch (error) {
      return freeze({ state: "DISCONNECTED", reason: error?.code || error?.message || "REPORTING_UNAVAILABLE" });
    }
  }

  function points(input) {
    return calculateActivityPoints(input);
  }

  function combinations(remaining) {
    return Number.isInteger(remaining) && remaining > 0 ? findPointCombinations(remaining) : [];
  }

  function conversions(input) {
    return conversionApi.buildActivityConversionReadModel(input);
  }

  async function close() {
    if (closed) return;
    closed = true;
    aborters.forEach((controller) => controller.abort());
    aborters.clear();
    await reporting?.close?.();
    await ledger?.close?.();
    reporting = null;
    ledger = null;
  }

  return freeze({ tenantId, canonical, captureDefinitions, appendOne, loadCalendar, loadReporting, points, combinations, conversions, close, diagnostics: () => freeze({ closed, tenantId, parallelLedger: false, directSupabaseActivityWrite: false, productionMigrationExecuted: false }) });
}

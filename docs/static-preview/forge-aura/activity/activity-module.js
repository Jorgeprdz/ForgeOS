import { createActivityRuntimeAdapter } from "./activity-runtime-adapter.js";
import { createHumanActivityCaptureAdapter } from "./activity-capture-adapter.js";
import { createActivityTipPresenter } from "./activity-tip-presenter.js";
import { officialActivityPeriods, findOfficialPeriod } from "./activity-periods.js";
import { captureDialogMarkup, freeze, reportState, surfaceMarkup, typeTotals } from "./activity-view.js";

const POLICY_URL = new URL("../../../../platform/productivity/policies/FORGE_ACTIVITY_COACHING_POLICY_V1.json", import.meta.url);
const LOCALE_URL = new URL("./es-MX.json", import.meta.url);

export function createActivityModule({ root, client, user, globalState, windowRef = window } = {}) {
  if (!root || !client || !user?.id) throw new Error("AURA_ACTIVITY_DEPENDENCIES_REQUIRED");
  const periods = officialActivityPeriods(new Date());
  const state = {
    phase: "ACTIVITY_LOADING", view: "activity", periodId: "CURRENT_WEEK", calendar: null, reporting: null,
    conversions: null, points: null, tips: [], people: [], runtime: null, capture: null, dialog: null,
    lastCapture: null, locale: null, policy: null, revision: 0,
  };
  const listeners = [];
  let destroyed = false;
  let returnFocus = null;

  const on = (node, event, handler) => {
    node?.addEventListener(event, handler);
    listeners.push(() => node?.removeEventListener(event, handler));
  };
  const currentPeriod = () => findOfficialPeriod(state.periodId, new Date());
  const announce = (message) => {
    const node = root.querySelector("[data-activity-live]");
    if (node) { node.textContent = ""; queueMicrotask(() => { node.textContent = message; }); }
  };

  function metricEnvelope(value, calendar, sourceOwner = "EVENT_EVIDENCE_FES") {
    return {
      value: Number.isSafeInteger(value) ? value : null,
      metricState: Number.isSafeInteger(value) ? "CONFIRMED" : "UNKNOWN",
      sourceOwner, sourceRefs: state.reporting?.report?.provenance?.sourceRefs || [],
      period: calendar?.period || null, timezone: calendar?.timezone || null,
      evidenceState: Number.isSafeInteger(value) ? "CONFIRMED" : "UNKNOWN",
      completeness: Number.isSafeInteger(value) ? "COMPLETE" : "UNKNOWN",
      freshness: calendar?.state === "STALE" ? "STALE" : "CURRENT",
      explicitZeroEvidence: value === 0,
    };
  }

  function pointCount(totals, type) {
    const present = totals.has(type);
    return { value: present ? totals.get(type) : null, completeness: present ? "COMPLETE" : "UNKNOWN", evidenceState: present ? "CONFIRMED" : "UNKNOWN", metricOwner: "PRODUCTIVITY", sourceRefs: [] };
  }

  function deriveModels() {
    const totals = typeTotals(state.reporting);
    const calendar = state.calendar;
    const emptyValue = (type) => totals.get(type) ?? (state.phase === "ACTIVITY_EMPTY" ? 0 : null);
    try {
      state.conversions = state.runtime.conversions({
        session: "AUTHENTICATED", permission: "GRANTED", tenantId: user.id, advisorId: user.id, calendar,
        metrics: {
          referrals: metricEnvelope(emptyValue("REFERRAL_RECEIVED"), calendar),
          appointmentsScheduled: metricEnvelope(emptyValue("APPOINTMENT_SCHEDULED"), calendar),
          appointmentsHeld: metricEnvelope(emptyValue("APPOINTMENT_HELD"), calendar),
          closingAppointmentsHeld: metricEnvelope(null, calendar),
          applicationsSubmitted: metricEnvelope(null, calendar, "POLICY_SALES_OPERATIONS"),
          policiesPaid: metricEnvelope(null, calendar, "POLICY_INTELLIGENCE_POLICY_OPERATIONS"),
          advisorReferrals: metricEnvelope(emptyValue("ADVISOR_REFERRAL_RECEIVED"), calendar),
        },
      });
    } catch { state.conversions = null; }
    try {
      state.points = state.runtime.points({
        period: calendar?.period || null, timezone: calendar?.timezone || null,
        counts: {
          referidos: pointCount(totals, "REFERRAL_RECEIVED"),
          llamadas: pointCount(totals, "CALL_COMPLETED"),
          citas_agendadas: pointCount(totals, "APPOINTMENT_SCHEDULED"),
          citas_iniciales: pointCount(totals, "APPOINTMENT_HELD"),
          citas_cierre: { value: null, completeness: "UNKNOWN", evidenceState: "UNKNOWN", metricOwner: "PRODUCTIVITY", sourceRefs: [] },
          solicitudes_firmadas: { value: null, completeness: "UNKNOWN", evidenceState: "UNKNOWN", metricOwner: "PRODUCTIVITY", sourceRefs: [] },
          polizas_pagadas: { value: null, completeness: "UNKNOWN", evidenceState: "UNKNOWN", metricOwner: "PRODUCTIVITY", sourceRefs: [] },
          referido_asesor: pointCount(totals, "ADVISOR_REFERRAL_RECEIVED"),
        },
      });
    } catch { state.points = null; }
    try {
      const resolution = globalThis.ForgeActivityCoachingPolicyV1.resolvePolicySnapshot([state.policy]);
      const pointCombinations = state.points?.state === "READY" && state.points.remaining > 0 ? state.runtime.combinations(state.points.remaining) : [];
      const intelligence = globalThis.ForgeActivityCoachingIntelligenceV1.generateActivityTips({
        policyResolution: resolution, points: state.points, pointCombinations, calendar,
        conversions: state.conversions?.conversions || [],
      });
      state.tips = createActivityTipPresenter(state.locale).presentMany(intelligence.tips);
    } catch { state.tips = []; }
  }

  async function load() {
    const revision = ++state.revision;
    state.phase = "ACTIVITY_LOADING";
    render();
    const period = currentPeriod();
    state.calendar = await state.runtime.loadCalendar({ from: period.from, to: period.to });
    if (destroyed || revision !== state.revision) return;
    state.reporting = await state.runtime.loadReporting(state.calendar, {
      period: { kind: "CUSTOM_RANGE", parameters: { from: period.from, to: period.to } },
      timeZone: state.calendar?.timezone || "America/Mexico_City",
      asOf: new Date().toISOString(), metadata: { surface: "FORGE_AURA_ACTIVITY_REPORTS" },
    });
    if (destroyed || revision !== state.revision) return;
    state.phase = reportState(state.calendar, state.reporting);
    deriveModels();
    render();
    globalState?.("");
  }

  function render() {
    if (destroyed) return;
    const period = currentPeriod();
    root.dataset.activityState = state.phase;
    root.innerHTML = surfaceMarkup(state, period, periods);
    bind();
  }

  function closeDialog() {
    if (!state.dialog) return;
    state.dialog.remove();
    state.dialog = null;
    returnFocus?.focus?.({ preventScroll: true });
    returnFocus = null;
  }

  const focusable = (dialog) => [...dialog.querySelectorAll('button:not([disabled]),select:not([disabled]),input:not([disabled]),textarea:not([disabled]),summary,[href],[tabindex]:not([tabindex="-1"])')];

  function captureDialog(trigger) {
    closeDialog();
    returnFocus = trigger || document.activeElement;
    const definitions = state.capture.definitions();
    const locationUrl = new URL(windowRef.location.href);
    const requestedPersonId = locationUrl.searchParams.get("prospectId") || locationUrl.searchParams.get("personId");
    const layer = document.createElement("div");
    layer.className = "activity-dialog-layer";
    layer.innerHTML = captureDialogMarkup(state, definitions, requestedPersonId);
    document.body.append(layer);
    state.dialog = layer;
    layer.querySelectorAll("[data-close]").forEach((node) => on(node, "click", closeDialog));
    on(layer, "keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); closeDialog(); return; }
      if (event.key !== "Tab") return;
      const nodes = focusable(layer);
      if (!nodes.length) return;
      const [first] = nodes;
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    const form = layer.querySelector("form");
    on(form, "submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      const errorNode = form.querySelector("[data-capture-error]");
      submit.disabled = true;
      form.setAttribute("aria-busy", "true");
      errorNode.hidden = true;
      try {
        const values = Object.fromEntries(new FormData(form).entries());
        const person = state.people.find((entry) => entry.id === values.personId);
        const canonical = state.capture.toCanonicalInput({ ...values, personName: person?.name });
        const result = await state.runtime.appendOne(canonical);
        state.lastCapture = freeze({ ...canonical.confirmation, syncState: result.state, eventId: result.eventId });
        closeDialog();
        render();
        announce(`${canonical.confirmation.activityLabel} registrada para ${canonical.confirmation.personName}.`);
        await load();
      } catch (error) {
        errorNode.hidden = false;
        errorNode.textContent = `No fue posible registrar la actividad. ${error?.code || error?.message || "Revisa los datos."}`;
        submit.disabled = false;
        form.setAttribute("aria-busy", "false");
      }
    });
    queueMicrotask(() => layer.querySelector("select")?.focus());
  }

  function bind() {
    root.querySelectorAll("[data-view]").forEach((node) => {
      on(node, "click", () => { state.view = node.dataset.view; render(); });
      on(node, "keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const tabs = [...root.querySelectorAll('[role="tab"]')];
        const index = tabs.indexOf(node);
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].click();
        tabs[next].focus();
      });
    });
    root.querySelectorAll("[data-add-activity]").forEach((node) => on(node, "click", () => captureDialog(node)));
    root.querySelectorAll("[data-refresh]").forEach((node) => on(node, "click", () => void load()));
    on(root.querySelector("[data-period]"), "change", (event) => { state.periodId = event.target.value; void load(); });
  }

  async function mount() {
    const revision = ++state.revision;
    root.innerHTML = `<section class="aura-loading" aria-busy="true"><div aria-hidden="true"></div><h1>Preparando Actividad y Reportes</h1><p>Sincronizando fuentes productivas.</p></section>`;
    const [localeResponse, policyResponse] = await Promise.all([fetch(LOCALE_URL), fetch(POLICY_URL)]);
    if (!localeResponse.ok || !policyResponse.ok) throw new Error("ACTIVITY_CONFIGURATION_LOAD_FAILED");
    state.locale = await localeResponse.json();
    state.policy = await policyResponse.json();
    if (destroyed || revision !== state.revision) return;
    state.runtime = createActivityRuntimeAdapter({ client, user, windowRef });
    state.capture = await createHumanActivityCaptureAdapter({ client });
    try { state.people = await state.capture.listPeople(); } catch { state.people = []; }
    await load();
  }

  async function unmount() {
    closeDialog();
    listeners.splice(0).forEach((off) => off());
    state.revision += 1;
    await state.runtime?.close?.();
    root.replaceChildren();
  }
  function scrub() {
    state.people = [];
    state.lastCapture = null;
    state.reporting = null;
    state.calendar = null;
    state.conversions = null;
    state.points = null;
    state.policy = null;
    state.locale = null;
  }
  async function destroy() { if (!destroyed) { destroyed = true; await unmount(); scrub(); } }
  function diagnostics() {
    return freeze({ module: "FORGE_AURA_ACTIVITY_REPORTS_UX_RECONCILIATION_001", state: state.phase, route: "actividad", activityPrimaryAction: true, technicalIdsVisible: false, sliders: 0, productiveReporting: true, parallelLedger: false, parallelWriter: false, automaticBusinessAction: false });
  }

  return freeze({ mount, unmount, scrub, destroy, diagnostics });
}

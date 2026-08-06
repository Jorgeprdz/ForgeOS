import { createActivityRuntimeAdapter } from "./activity-runtime-adapter.js";
import { createActivityTipPresenter } from "./activity-tip-presenter.js";

const POLICY_URL = new URL("../../../../platform/productivity/policies/FORGE_ACTIVITY_COACHING_POLICY_V1.json", import.meta.url);
const LOCALE_URL = new URL("./es-MX.json", import.meta.url);

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const freeze = (value) => { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.values(value).forEach(freeze); return Object.freeze(value); };

export function createActivityModule({ root, client, user, globalState, windowRef = window } = {}) {
  if (!root || !client || !user?.id) throw new Error("AURA_ACTIVITY_DEPENDENCIES_REQUIRED");
  const state = { phase: "LOADING", view: "activity", locale: null, policy: null, policyResolution: null, tips: null, runtime: null, dialog: null, values: {}, revision: 0 };
  let destroyed = false;
  const listeners = [];

  const on = (node, event, handler) => { node?.addEventListener(event, handler); listeners.push(() => node?.removeEventListener(event, handler)); };
  const t = (key, values = {}) => {
    const template = state.locale?.[key] || key;
    return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, name) => String(values[name] ?? ""));
  };

  function metricControls() {
    const keys = ["referidos", "llamadas", "citas_agendadas", "citas_iniciales", "citas_cierre", "solicitudes_firmadas", "polizas_pagadas", "referido_asesor"];
    return keys.map((key) => `<label class="activity-metric"><span>${escapeHtml(t(`metric.${key}`))}</span><input type="range" min="0" max="20" step="1" value="${state.values[key] || 0}" data-activity-slider="${key}" aria-describedby="capture-boundary"><input type="number" min="0" step="1" value="${state.values[key] || 0}" data-activity-number="${key}" aria-label="${escapeHtml(t(`metric.${key}`))}"></label>`).join("");
  }

  function render() {
    if (destroyed) return;
    root.dataset.activityState = state.phase;
    const tips = state.tips?.tips || [];
    root.innerHTML = `<section class="aura-activity" aria-labelledby="activity-title">
      <header class="aura-activity__hero"><div><p class="aura-eyebrow">${escapeHtml(t("activity.eyebrow"))}</p><h1 id="activity-title">${escapeHtml(t("activity.title"))}</h1><p>${escapeHtml(t("activity.subtitle"))}</p></div><div class="aura-activity__actions"><button class="aura-primary" data-add-activity>${escapeHtml(t("activity.add"))}</button><button data-vacation disabled aria-describedby="calendar-state">${escapeHtml(t("activity.vacation"))}</button></div></header>
      <div class="activity-tabs" role="tablist"><button role="tab" aria-selected="${state.view === "activity"}" data-view="activity">${escapeHtml(t("activity.tab.activity"))}</button><button role="tab" aria-selected="${state.view === "reports"}" data-view="reports">${escapeHtml(t("activity.tab.reports"))}</button></div>
      <div class="activity-state-banner" id="calendar-state" data-state="CONFIGURATION_REQUIRED">${escapeHtml(t("activity.state.calendar"))}</div>
      ${state.view === "activity" ? `<section class="activity-grid">
        <article class="activity-card activity-chart"><header><h2>${escapeHtml(t("activity.chart.title"))}</h2><span>${escapeHtml(t("activity.goal.unknown"))}</span></header><div class="activity-chart__empty" role="img" aria-label="${escapeHtml(t("activity.chart.unavailable"))}">${escapeHtml(t("activity.chart.unavailable"))}</div></article>
        <article class="activity-card"><h2>${escapeHtml(t("activity.goal.daily"))}</h2><strong>—</strong><p>${escapeHtml(t("activity.goal.unknown"))}</p></article>
        <article class="activity-card"><h2>${escapeHtml(t("activity.goal.weekly"))}</h2><strong>—</strong><p>${escapeHtml(t("activity.goal.unknown"))}</p></article>
        <article class="activity-card activity-capture"><h2>${escapeHtml(t("activity.add"))}</h2><p id="capture-boundary">${escapeHtml(t("activity.capture.readOnly"))}</p><div class="activity-metrics">${metricControls()}</div></article>
        <article class="activity-card activity-wide"><h2>${escapeHtml(t("activity.conversions.title"))}</h2><p>${escapeHtml(t("activity.conversions.unavailable"))}</p></article>
        <article class="activity-card activity-wide"><h2>${escapeHtml(t("activity.tips.title"))}</h2>${tips.length ? tips.map((tip) => `<article class="activity-tip"><h3>${escapeHtml(tip.title)}</h3><p>${escapeHtml(tip.body)}</p>${tip.combination ? `<p>${escapeHtml(tip.combination)}</p>` : ""}<details><summary>${escapeHtml(t("tip.evidence"))}</summary><code>${escapeHtml(tip.evidenceRefs.join(", ") || "—")}</code></details></article>`).join("") : `<p>${escapeHtml(t("activity.tips.unavailable"))}</p>`}</article>
      </section>` : `<section class="activity-card activity-reports"><h2>${escapeHtml(t("activity.reports.title"))}</h2><p>${escapeHtml(t("activity.reports.unavailable"))}</p></section>`}
      <div class="aura-live" data-activity-live aria-live="polite"></div>
    </section>`;
    bind();
  }

  function syncMetric(key, value) {
    const next = Math.max(0, Number.parseInt(value, 10) || 0);
    state.values[key] = next;
    root.querySelector(`[data-activity-slider="${CSS.escape(key)}"]`)?.setAttribute("value", String(next));
    const slider = root.querySelector(`[data-activity-slider="${CSS.escape(key)}"]`); if (slider) slider.value = String(next);
    const number = root.querySelector(`[data-activity-number="${CSS.escape(key)}"]`); if (number) number.value = String(next);
  }

  function closeDialog() { state.dialog?.remove(); state.dialog = null; }

  function captureDialog() {
    closeDialog();
    const definitions = state.runtime.captureDefinitions();
    const layer = document.createElement("div");
    layer.className = "activity-dialog-layer";
    layer.innerHTML = `<button class="activity-scrim" data-close aria-label="${escapeHtml(t("activity.capture.cancel"))}"></button><section class="activity-dialog" role="dialog" aria-modal="true" aria-labelledby="activity-dialog-title"><header><h2 id="activity-dialog-title">${escapeHtml(t("activity.capture.title"))}</h2><button data-close aria-label="${escapeHtml(t("activity.capture.cancel"))}">×</button></header><form data-capture-form><label>${escapeHtml(t("activity.capture.event"))}<select name="captureType">${definitions.map((entry) => `<option value="${escapeHtml(entry.captureType)}">${escapeHtml(entry.captureType.replaceAll("_", " "))}</option>`).join("")}</select></label><label>${escapeHtml(t("activity.capture.subject"))}<input required name="subjectId" pattern="[A-Za-z0-9._:@/-]+"></label><div data-capture-fields></div><footer><button type="button" data-close>${escapeHtml(t("activity.capture.cancel"))}</button><button class="aura-primary">${escapeHtml(t("activity.capture.save"))}</button></footer><p data-capture-error role="alert" hidden></p></form></section>`;
    document.body.append(layer); state.dialog = layer;
    layer.querySelectorAll("[data-close]").forEach((node) => on(node, "click", closeDialog));
    const form = layer.querySelector("form");
    const select = form.elements.captureType;
    const renderFields = () => {
      const definition = definitions.find((entry) => entry.captureType === select.value);
      form.querySelector("[data-capture-fields]").innerHTML = definition.fields.map((field) => `<label>${escapeHtml(field.name.replaceAll("_", " "))}<input required type="${escapeHtml(field.type)}" name="${escapeHtml(field.name)}" ${field.type === "text" ? 'pattern="[A-Za-z0-9._:@/-]+"' : ""}></label>`).join("");
    };
    on(select, "change", renderFields); renderFields();
    on(form, "submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const definition = definitions.find((entry) => entry.captureType === String(data.get("captureType")));
      const payload = Object.fromEntries(definition.fields.map((field) => {
        const raw = String(data.get(field.name));
        return [field.name, field.type === "datetime-local" ? new Date(raw).toISOString() : raw];
      }));
      if (definition.discriminator) Object.assign(payload, definition.discriminator);
      try {
        await state.runtime.appendOne({ eventType: definition.eventType, subjectType: definition.subjectType, subjectId: String(data.get("subjectId")), payload });
        announce(t("activity.capture.success")); closeDialog();
      } catch (error) {
        const node = form.querySelector("[data-capture-error]"); node.hidden = false; node.textContent = `${t("activity.capture.failed")} ${error?.code || error?.message || ""}`;
      }
    });
    queueMicrotask(() => select.focus());
  }

  function announce(message) { const node = root.querySelector("[data-activity-live]"); if (node) { node.textContent = ""; queueMicrotask(() => { node.textContent = message; }); } }

  function bind() {
    root.querySelectorAll("[data-view]").forEach((node) => on(node, "click", () => { state.view = node.dataset.view; render(); }));
    root.querySelectorAll("[data-activity-slider]").forEach((node) => on(node, "input", () => syncMetric(node.dataset.activitySlider, node.value)));
    root.querySelectorAll("[data-activity-number]").forEach((node) => on(node, "input", () => syncMetric(node.dataset.activityNumber, node.value)));
    on(root.querySelector("[data-add-activity]"), "click", captureDialog);
  }

  async function mount() {
    const revision = ++state.revision;
    root.innerHTML = `<section class="aura-loading"><div aria-hidden="true"></div><h1>${escapeHtml(t("activity.state.loading"))}</h1></section>`;
    const [localeResponse, policyResponse] = await Promise.all([fetch(LOCALE_URL), fetch(POLICY_URL)]);
    if (!localeResponse.ok || !policyResponse.ok) throw new Error("ACTIVITY_CONFIGURATION_LOAD_FAILED");
    state.locale = await localeResponse.json(); state.policy = await policyResponse.json();
    if (destroyed || revision !== state.revision) return;
    state.runtime = createActivityRuntimeAdapter({ client, user, windowRef });
    const policyApi = globalThis.ForgeActivityCoachingPolicyV1;
    const intelligenceApi = globalThis.ForgeActivityCoachingIntelligenceV1;
    state.policyResolution = policyApi.resolvePolicySnapshot([state.policy]);
    const intelligence = intelligenceApi.generateActivityTips({ policyResolution: state.policyResolution });
    const presenter = createActivityTipPresenter(state.locale);
    state.tips = freeze({ ...intelligence, tips: presenter.presentMany(intelligence.tips) });
    state.phase = "CONFIGURATION_REQUIRED";
    render();
    globalState?.("");
  }

  async function unmount() { closeDialog(); listeners.splice(0).forEach((off) => off()); await state.runtime?.close?.(); root.replaceChildren(); }
  function scrub() { state.values = {}; state.policy = null; state.policyResolution = null; state.tips = null; state.locale = null; }
  async function destroy() { if (destroyed) return; destroyed = true; state.revision += 1; await unmount(); scrub(); }
  function diagnostics() { return freeze({ module: "AURA_ACTIVITY_PRODUCTIVE_UI_V1", state: state.phase, policyState: state.policyResolution?.state || "UNAVAILABLE", route: "actividad", legacyActivityImports: 0, material3VisualImports: 0, parallelLedger: false, productionMigrationExecuted: false }); }

  return freeze({ mount, unmount, scrub, destroy, diagnostics });
}

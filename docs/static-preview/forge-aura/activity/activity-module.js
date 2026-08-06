import { createActivityRuntimeAdapter } from "./activity-runtime-adapter.js";
import { createActivityCalendarController } from "./activity-calendar-controller.js";
import { createActivityMetricsAdapter } from "./activity-metrics-adapter.js";
import { createActivityTipPresenter } from "./activity-tip-presenter.js";
import {
  describeActivityPointsAuthority,
} from "../../../platform/productivity/activity-points-authority-adapter.mjs";

const POLICY_URL = new URL(
  "../../../platform/productivity/policies/FORGE_ACTIVITY_COACHING_POLICY_V1.json",
  import.meta.url,
);
const LOCALE_URL = new URL("./es-MX.json", import.meta.url);
const METRIC_KEYS = Object.freeze([
  "referidos",
  "llamadas",
  "citas_agendadas",
  "citas_iniciales",
  "citas_cierre",
  "solicitudes_firmadas",
  "polizas_pagadas",
  "referido_asesor",
]);
const WEEKDAY_KEYS = Object.freeze([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const escapeHtml = (value) => String(value ?? "").replace(
  /[&<>"']/g,
  (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char],
);

const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

function localDateAt(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const selected = Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day"].includes(part.type))
      .map((part) => [part.type, part.value]),
  );
  return `${selected.year}-${selected.month}-${selected.day}`;
}

function localDateTimeAt(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const selected = Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day", "hour", "minute"].includes(part.type))
      .map((part) => [part.type, part.value]),
  );
  return `${selected.year}-${selected.month}-${selected.day}T${selected.hour}:${selected.minute}`;
}

function zonedLocalToIso(value, timeZone) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(value || ""))) {
    throw new Error("ACTIVITY_LOCAL_DATETIME_INVALID");
  }
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let candidate = target;

  for (let index = 0; index < 4; index += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(candidate));
    const observed = Object.fromEntries(
      parts
        .filter((part) => ["year", "month", "day", "hour", "minute", "second"].includes(part.type))
        .map((part) => [part.type, Number(part.value)]),
    );
    const observedUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
      0,
    );
    candidate += target - observedUtc;
  }

  const verification = localDateTimeAt(new Date(candidate), timeZone);
  if (verification !== value) throw new Error("ACTIVITY_LOCAL_DATETIME_NOT_REPRESENTABLE");
  return new Date(candidate).toISOString();
}

function sumSeries(series) {
  return (series?.points || []).reduce(
    (total, point) => total + (Number(point.value) || 0),
    0,
  );
}

export function createActivityModule({
  root,
  client,
  user,
  globalState,
  windowRef = window,
} = {}) {
  if (!root || !client || !user?.id) {
    throw new Error("AURA_ACTIVITY_DEPENDENCIES_REQUIRED");
  }

  const documentRef = root.ownerDocument || document;
  const state = {
    phase: "LOADING",
    view: "activity",
    locale: null,
    policy: null,
    policyResolution: null,
    tips: null,
    runtime: null,
    calendarController: null,
    metricsAdapter: null,
    calendarLoad: null,
    calendar: null,
    reporting: null,
    metricsBundle: null,
    conversions: null,
    pointAuthority: null,
    dailyPoints: [],
    dialog: null,
    dialogOpener: null,
    values: {},
    revision: 0,
    error: null,
  };
  let destroyed = false;
  const listeners = [];

  const on = (node, event, handler, options) => {
    node?.addEventListener(event, handler, options);
    listeners.push(() => node?.removeEventListener(event, handler, options));
  };

  const clearListeners = () => {
    listeners.splice(0).forEach((off) => off());
  };

  const t = (key, values = {}) => {
    const template = state.locale?.[key] || key;
    return template.replace(
      /\{([A-Za-z0-9_]+)\}/g,
      (_, name) => String(values[name] ?? ""),
    );
  };

  function selectedProfile() {
    const profiles = state.calendarLoad?.profiles || [];
    return profiles
      .filter((profile) => profile.advisorId === String(user.id))
      .sort((left, right) =>
        String(right.effectivePeriod?.from || "").localeCompare(
          String(left.effectivePeriod?.from || ""),
        )
      )[0] || null;
  }

  function calendarReady() {
    return Boolean(state.calendar && ["READY", "STALE"].includes(state.calendar.state));
  }

  function todayLocalDate() {
    if (!state.calendar?.timezone) return null;
    return localDateAt(new Date(), state.calendar.timezone);
  }

  function metricControls() {
    const weights = state.pointAuthority?.weights || {};
    return METRIC_KEYS.map((key) => {
      const value = state.values[key] || 0;
      const weight = weights[key];
      const pointNote = Number.isFinite(weight)
        ? `<small>${escapeHtml(t("activity.capture.weight", { points: weight }))}</small>`
        : "";
      const maximum = Math.max(20, value);
      return `<label class="activity-metric">
        <span><strong>${escapeHtml(t(`metric.${key}`))}</strong>${pointNote}</span>
        <input type="range" min="0" max="${maximum}" step="1" value="${value}" data-activity-slider="${key}" aria-describedby="capture-boundary">
        <input type="number" min="0" step="1" value="${value}" data-activity-number="${key}" aria-label="${escapeHtml(t(`metric.${key}`))}">
      </label>`;
    }).join("");
  }

  function stateMessage() {
    if (state.phase === "READY") {
      return t("activity.state.ready", {
        timezone: state.calendar?.timezone || "",
      });
    }
    if (state.phase === "PARTIAL") return t("activity.state.partial");
    if (state.phase === "DISCONNECTED") return t("activity.state.disconnected");
    if (state.phase === "CONFLICTING") return t("activity.state.conflicting");
    if (state.phase === "ERROR") return `${t("activity.state.error")} ${state.error || ""}`;
    if (["UNKNOWN_TIMEZONE", "UNKNOWN_SCHEDULE", "CONFIGURATION_REQUIRED"].includes(state.phase)) {
      return t("activity.state.calendarProfileRequired");
    }
    return t("activity.state.loading");
  }

  function dayValue(day) {
    if (!day?.result) return null;
    if (day.result.state === "READY") return day.result.total;
    if (day.result.state === "INCOMPLETE") return day.result.confirmedMinimum;
    return null;
  }

  function renderChart() {
    if (!calendarReady() || !state.dailyPoints.length || !state.pointAuthority?.objective) {
      return `<div class="activity-chart__empty" role="img" aria-label="${escapeHtml(t("activity.chart.unavailable"))}">${escapeHtml(t("activity.chart.unavailable"))}</div>`;
    }

    const width = 720;
    const height = 260;
    const paddingX = 44;
    const paddingTop = 24;
    const paddingBottom = 54;
    const numericValues = state.dailyPoints
      .map(dayValue)
      .filter(Number.isFinite);
    const maximum = Math.max(
      state.pointAuthority.objective,
      ...numericValues,
      1,
    );
    const chartHeight = height - paddingTop - paddingBottom;
    const x = (index) => state.dailyPoints.length === 1
      ? width / 2
      : paddingX + index * ((width - (paddingX * 2)) / (state.dailyPoints.length - 1));
    const y = (value) => paddingTop + chartHeight - ((value / maximum) * chartHeight);
    const objectiveY = y(state.pointAuthority.objective);

    const segments = [];
    let current = [];
    state.dailyPoints.forEach((day, index) => {
      const value = dayValue(day);
      if (Number.isFinite(value)) current.push(`${x(index)},${y(value)}`);
      else if (current.length) {
        segments.push(current);
        current = [];
      }
    });
    if (current.length) segments.push(current);

    const labels = state.dailyPoints.map((day, index) => {
      const date = new Date(`${day.localDate}T12:00:00.000Z`);
      const label = new Intl.DateTimeFormat("es-MX", {
        weekday: "short",
        day: "numeric",
      }).format(date);
      const value = dayValue(day);
      const valueLabel = Number.isFinite(value)
        ? String(value)
        : day.state === "VACATION"
          ? t("activity.day.vacation")
          : day.state === "FUTURE"
            ? t("activity.day.future")
            : t("activity.day.unknown");
      return `<g>
        <text x="${x(index)}" y="${height - 22}" text-anchor="middle">${escapeHtml(label)}</text>
        ${Number.isFinite(value) ? `<circle cx="${x(index)}" cy="${y(value)}" r="6" tabindex="0" role="img" aria-label="${escapeHtml(`${label}: ${valueLabel}`)}"><title>${escapeHtml(`${label}: ${valueLabel}`)}</title></circle><text x="${x(index)}" y="${y(value) - 12}" text-anchor="middle">${value}</text>` : ""}
      </g>`;
    }).join("");

    const tableRows = state.dailyPoints.map((day) => {
      const value = dayValue(day);
      return `<tr><th scope="row">${escapeHtml(day.localDate)}</th><td>${Number.isFinite(value) ? value : "—"}</td><td>${escapeHtml(t(`activity.dayState.${day.state}`))}</td></tr>`;
    }).join("");

    return `<div class="activity-chart__visual">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="activity-chart-title activity-chart-description">
        <title id="activity-chart-title">${escapeHtml(t("activity.chart.title"))}</title>
        <desc id="activity-chart-description">${escapeHtml(t("activity.chart.description", { objective: state.pointAuthority.objective }))}</desc>
        <line class="activity-chart__target" x1="${paddingX}" x2="${width - paddingX}" y1="${objectiveY}" y2="${objectiveY}"></line>
        <text class="activity-chart__target-label" x="${width - paddingX}" y="${objectiveY - 8}" text-anchor="end">${escapeHtml(t("activity.chart.target", { objective: state.pointAuthority.objective }))}</text>
        ${segments.map((segment) => `<polyline class="activity-chart__line" points="${segment.join(" ")}"></polyline>`).join("")}
        ${labels}
      </svg>
      <details class="activity-chart__table"><summary>${escapeHtml(t("activity.chart.table"))}</summary><table><thead><tr><th>${escapeHtml(t("activity.chart.date"))}</th><th>${escapeHtml(t("activity.chart.points"))}</th><th>${escapeHtml(t("activity.chart.state"))}</th></tr></thead><tbody>${tableRows}</tbody></table></details>
    </div>`;
  }

  function weeklySummary() {
    if (!calendarReady() || !state.pointAuthority?.objective) {
      return freeze({ target: null, value: null, partial: true });
    }
    const eligibleCount = state.calendar.dates.filter((date) => date.eligible === true).length;
    const observed = state.dailyPoints.filter((day) => Number.isFinite(dayValue(day)));
    return freeze({
      target: state.pointAuthority.objective * eligibleCount,
      value: observed.reduce((total, day) => total + dayValue(day), 0),
      partial: observed.some((day) => day.result?.state !== "READY") ||
        state.dailyPoints.some((day) => day.eligible && !["CONFIRMED", "PARTIAL", "FUTURE"].includes(day.state)),
    });
  }

  function todaySummary() {
    const today = todayLocalDate();
    const day = state.dailyPoints.find((entry) => entry.localDate === today);
    if (!day || !Number.isFinite(dayValue(day))) {
      return freeze({ value: null, partial: true });
    }
    return freeze({
      value: dayValue(day),
      partial: day.result?.state !== "READY",
      objective: state.pointAuthority?.objective || null,
    });
  }

  function renderConversions() {
    const conversions = state.conversions?.conversions || [];
    if (!conversions.length) {
      return `<p>${escapeHtml(t("activity.conversions.unavailable"))}</p>`;
    }
    return `<div class="activity-conversion-grid">${conversions.map((conversion) => {
      const valid = Number.isFinite(conversion.percentage);
      const percentage = valid
        ? `${conversion.percentage.toFixed(conversion.displayPrecision ?? 1)}%`
        : "—";
      const ratio = Number.isFinite(conversion.numerator) && Number.isFinite(conversion.denominator)
        ? t("activity.conversion.ratio", {
          numerator: conversion.numerator,
          denominator: conversion.denominator,
        })
        : t(`activity.conversionState.${conversion.metricState}`);
      return `<article class="activity-conversion" data-state="${escapeHtml(conversion.metricState)}">
        <p>${escapeHtml(t(`conversion.${conversion.conversionId}`))}</p>
        <strong>${escapeHtml(percentage)}</strong>
        <span>${escapeHtml(ratio)}</span>
        ${conversion.warnings?.length ? `<small>${escapeHtml(conversion.warnings.map((warning) => t(`activity.warning.${warning}`)).join(" · "))}</small>` : ""}
      </article>`;
    }).join("")}</div>`;
  }

  function renderTips() {
    const tips = state.tips?.tips || [];
    if (!tips.length) return `<p>${escapeHtml(t("activity.tips.unavailable"))}</p>`;
    return tips.map((tip) => `<article class="activity-tip">
      <h3>${escapeHtml(tip.title)}</h3>
      <p>${escapeHtml(tip.body)}</p>
      ${tip.combination ? `<p>${escapeHtml(tip.combination)}</p>` : ""}
      <details><summary>${escapeHtml(t("tip.evidence"))}</summary><code>${escapeHtml(tip.evidenceRefs.join(", ") || "—")}</code></details>
    </article>`).join("");
  }

  function renderReports() {
    if (!state.reporting || !["READY", "EMPTY"].includes(state.reporting.state)) {
      return `<section class="activity-card activity-reports"><h2>${escapeHtml(t("activity.reports.title"))}</h2><p>${escapeHtml(t("activity.reports.unavailable"))}</p></section>`;
    }
    const series = state.reporting.chartReady?.series || [];
    const rows = series.map((entry) => `<tr><th scope="row">${escapeHtml(t(`report.${String(entry.seriesId).replace(/^activity-series:/, "")}`))}</th><td>${sumSeries(entry)}</td></tr>`).join("");
    return `<section class="activity-card activity-reports">
      <header><div><h2>${escapeHtml(t("activity.reports.title"))}</h2><p>${escapeHtml(`${state.calendar.period.from} — ${state.calendar.period.to}`)}</p></div><span>${escapeHtml(state.calendar.timezone)}</span></header>
      ${rows ? `<table><thead><tr><th>${escapeHtml(t("activity.reports.metric"))}</th><th>${escapeHtml(t("activity.reports.total"))}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p>${escapeHtml(t("activity.state.empty"))}</p>`}
      ${state.metricsBundle?.warnings?.length ? `<p class="activity-authority-note">${escapeHtml(state.metricsBundle.warnings.map((warning) => t(`activity.warning.${warning}`)).join(" · "))}</p>` : ""}
    </section>`;
  }

  function render() {
    if (destroyed || !state.locale) return;
    clearListeners();
    root.dataset.activityState = state.phase;
    const week = weeklySummary();
    const today = todaySummary();
    const configureLabel = selectedProfile()
      ? t("activity.calendar.edit")
      : t("activity.calendar.configure");

    root.innerHTML = `<section class="aura-activity" aria-labelledby="activity-title">
      <header class="aura-activity__hero">
        <div><p class="aura-eyebrow">${escapeHtml(t("activity.eyebrow"))}</p><h1 id="activity-title">${escapeHtml(t("activity.title"))}</h1><p>${escapeHtml(t("activity.subtitle"))}</p></div>
        <div class="aura-activity__actions">
          <button data-calendar-config>${escapeHtml(configureLabel)}</button>
          <button data-vacation ${calendarReady() ? "" : "disabled"} aria-describedby="calendar-state">${escapeHtml(t("activity.vacation"))}</button>
          <button class="aura-primary" data-add-activity>${escapeHtml(t("activity.add"))}</button>
        </div>
      </header>
      <div class="activity-tabs" role="tablist" aria-label="${escapeHtml(t("activity.tabs.label"))}">
        <button role="tab" aria-selected="${state.view === "activity"}" data-view="activity">${escapeHtml(t("activity.tab.activity"))}</button>
        <button role="tab" aria-selected="${state.view === "reports"}" data-view="reports">${escapeHtml(t("activity.tab.reports"))}</button>
      </div>
      <div class="activity-state-banner" id="calendar-state" data-state="${escapeHtml(state.phase)}">${escapeHtml(stateMessage())}</div>
      ${state.view === "activity" ? `<section class="activity-grid">
        <article class="activity-card activity-chart"><header><div><h2>${escapeHtml(t("activity.chart.title"))}</h2>${state.calendar?.period ? `<p>${escapeHtml(`${state.calendar.period.from} — ${state.calendar.period.to}`)}</p>` : ""}</div><span>${state.pointAuthority?.objective ? escapeHtml(t("activity.chart.target", { objective: state.pointAuthority.objective })) : escapeHtml(t("activity.goal.unknown"))}</span></header>${renderChart()}</article>
        <article class="activity-card"><h2>${escapeHtml(t("activity.goal.daily"))}</h2><strong>${today.value ?? "—"}</strong><p>${today.value === null ? escapeHtml(t("activity.goal.unknown")) : escapeHtml(today.partial ? t("activity.goal.minimumConfirmed") : t("activity.goal.confirmed", { objective: today.objective }))}</p></article>
        <article class="activity-card"><h2>${escapeHtml(t("activity.goal.weekly"))}</h2><strong>${week.value ?? "—"}${week.target !== null ? ` / ${week.target}` : ""}</strong><p>${week.target === null ? escapeHtml(t("activity.goal.unknown")) : escapeHtml(week.partial ? t("activity.goal.minimumConfirmed") : t("activity.goal.periodConfirmed"))}</p></article>
        <article class="activity-card activity-capture"><h2>${escapeHtml(t("activity.capture.simulatorTitle"))}</h2><p id="capture-boundary">${escapeHtml(t("activity.capture.readOnly"))}</p><div class="activity-metrics">${metricControls()}</div></article>
        <article class="activity-card activity-wide"><h2>${escapeHtml(t("activity.conversions.title"))}</h2>${renderConversions()}</article>
        <article class="activity-card activity-wide"><h2>${escapeHtml(t("activity.tips.title"))}</h2>${renderTips()}</article>
      </section>` : renderReports()}
      <div class="aura-live" data-activity-live aria-live="polite"></div>
    </section>`;
    bind();
  }

  function syncMetric(key, value) {
    const next = Math.max(0, Number.parseInt(value, 10) || 0);
    state.values[key] = next;
    const slider = root.querySelector(`[data-activity-slider="${CSS.escape(key)}"]`);
    if (slider) {
      if (next > Number(slider.max)) slider.max = String(next);
      slider.value = String(next);
    }
    const number = root.querySelector(`[data-activity-number="${CSS.escape(key)}"]`);
    if (number) number.value = String(next);
  }

  function closeDialog() {
    const opener = state.dialogOpener;
    state.dialog?.remove();
    state.dialog = null;
    state.dialogOpener = null;
    queueMicrotask(() => opener?.focus?.());
  }

  function bindDialog(layer) {
    const focusables = () => [...layer.querySelectorAll(
      'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    )].filter((node) => !node.hidden);
    on(layer, "keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes.at(-1);
      if (event.shiftKey && documentRef.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && documentRef.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    layer.querySelectorAll("[data-close]").forEach((node) => on(node, "click", closeDialog));
    queueMicrotask(() => focusables()[0]?.focus());
  }

  function openLayer(content, opener) {
    closeDialog();
    state.dialogOpener = opener || documentRef.activeElement;
    const layer = documentRef.createElement("div");
    layer.className = "activity-dialog-layer";
    layer.innerHTML = `<button class="activity-scrim" data-close aria-label="${escapeHtml(t("activity.capture.cancel"))}"></button>${content}`;
    documentRef.body.append(layer);
    state.dialog = layer;
    bindDialog(layer);
    return layer;
  }

  function calendarDialog(opener) {
    const current = selectedProfile();
    const timezoneCandidate = current?.timezone || state.calendarLoad?.browserTimeZoneCandidate || "";
    const selectedDays = new Set(current?.workingWeekdays || []);
    const effectiveFrom = state.calendar?.timezone
      ? localDateAt(new Date(), state.calendar.timezone)
      : new Date().toISOString().slice(0, 10);
    const layer = openLayer(`<section class="activity-dialog" role="dialog" aria-modal="true" aria-labelledby="activity-calendar-dialog-title">
      <header><div><p class="aura-eyebrow">${escapeHtml(t("activity.calendar.eyebrow"))}</p><h2 id="activity-calendar-dialog-title">${escapeHtml(t("activity.calendar.title"))}</h2></div><button data-close aria-label="${escapeHtml(t("activity.capture.cancel"))}">×</button></header>
      <form data-calendar-form>
        <p>${escapeHtml(t("activity.calendar.explanation"))}</p>
        <label>${escapeHtml(t("activity.calendar.timezone"))}<input name="timezone" required value="${escapeHtml(timezoneCandidate)}" placeholder="America/Mexico_City" aria-describedby="calendar-timezone-note"></label>
        <small id="calendar-timezone-note">${escapeHtml(t("activity.calendar.timezoneCandidate"))}</small>
        <fieldset><legend>${escapeHtml(t("activity.calendar.weekdays"))}</legend><div class="activity-weekday-options">${WEEKDAY_KEYS.map((day) => `<label><input type="checkbox" name="workingWeekdays" value="${day}" ${selectedDays.has(day) ? "checked" : ""}><span>${escapeHtml(t(`weekday.${day}`))}</span></label>`).join("")}</div></fieldset>
        <label>${escapeHtml(t("activity.calendar.effectiveFrom"))}<input type="date" name="effectiveFrom" required value="${escapeHtml(effectiveFrom)}"></label>
        <p class="activity-authority-note">${escapeHtml(t("activity.calendar.confirmation"))}</p>
        <p data-dialog-error role="alert" hidden></p>
        <footer><button type="button" data-close>${escapeHtml(t("activity.capture.cancel"))}</button><button class="aura-primary">${escapeHtml(t("activity.calendar.save"))}</button></footer>
      </form>
    </section>`, opener);
    const form = layer.querySelector("[data-calendar-form]");
    on(form, "submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"],button:not([type])');
      submit.disabled = true;
      const data = new FormData(form);
      const workingWeekdays = data.getAll("workingWeekdays").map(String);
      try {
        await state.calendarController.configureAdvisorCalendar({
          timezone: String(data.get("timezone") || "").trim(),
          workingWeekdays,
          effectiveFrom: String(data.get("effectiveFrom") || ""),
          supersedes: current?.profileId || null,
        });
        announce(t("activity.calendar.saved"));
        closeDialog();
        await refresh();
      } catch (error) {
        const node = form.querySelector("[data-dialog-error]");
        node.hidden = false;
        node.textContent = `${t("activity.calendar.failed")} ${error?.code || error?.message || ""}`;
      } finally {
        submit.disabled = false;
      }
    });
  }

  function vacationDialog(opener) {
    if (!calendarReady()) return;
    const timezone = state.calendar.timezone;
    const today = localDateAt(new Date(), timezone);
    const layer = openLayer(`<section class="activity-dialog" role="dialog" aria-modal="true" aria-labelledby="activity-vacation-dialog-title">
      <header><div><p class="aura-eyebrow">${escapeHtml(t("activity.vacation.eyebrow"))}</p><h2 id="activity-vacation-dialog-title">${escapeHtml(t("activity.vacation.title"))}</h2></div><button data-close aria-label="${escapeHtml(t("activity.capture.cancel"))}">×</button></header>
      <form data-vacation-form>
        <p>${escapeHtml(t("activity.vacation.explanation", { timezone }))}</p>
        <label>${escapeHtml(t("activity.vacation.start"))}<input type="date" name="startDate" required value="${today}"></label>
        <label>${escapeHtml(t("activity.vacation.end"))}<input type="date" name="endDate" required value="${today}"></label>
        <p class="activity-authority-note">${escapeHtml(t("activity.vacation.confirmation"))}</p>
        <p data-dialog-error role="alert" hidden></p>
        <footer><button type="button" data-close>${escapeHtml(t("activity.capture.cancel"))}</button><button class="aura-primary">${escapeHtml(t("activity.vacation.save"))}</button></footer>
      </form>
    </section>`, opener);
    const form = layer.querySelector("[data-vacation-form]");
    on(form, "submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"],button:not([type])');
      submit.disabled = true;
      const data = new FormData(form);
      try {
        await state.calendarController.recordVacation({
          startDate: String(data.get("startDate") || ""),
          endDate: String(data.get("endDate") || ""),
          timezone,
        });
        announce(t("activity.vacation.saved"));
        closeDialog();
        await refresh();
      } catch (error) {
        const node = form.querySelector("[data-dialog-error]");
        node.hidden = false;
        node.textContent = `${t("activity.vacation.failed")} ${error?.code || error?.message || ""}`;
      } finally {
        submit.disabled = false;
      }
    });
  }

  function captureDialog(opener) {
    if (!state.runtime) return;
    const definitions = state.runtime.captureDefinitions();
    const timezone = state.calendar?.timezone || null;
    const occurredValue = timezone
      ? localDateTimeAt(new Date(), timezone)
      : new Date().toISOString().slice(0, 16);
    const layer = openLayer(`<section class="activity-dialog" role="dialog" aria-modal="true" aria-labelledby="activity-dialog-title">
      <header><div><p class="aura-eyebrow">${escapeHtml(t("activity.capture.eyebrow"))}</p><h2 id="activity-dialog-title">${escapeHtml(t("activity.capture.title"))}</h2></div><button data-close aria-label="${escapeHtml(t("activity.capture.cancel"))}">×</button></header>
      <form data-capture-form>
        <p>${escapeHtml(t("activity.capture.referencesRequired"))}</p>
        <label>${escapeHtml(t("activity.capture.event"))}<select name="captureType">${definitions.map((entry) => `<option value="${escapeHtml(entry.captureType)}">${escapeHtml(t(`capture.${entry.captureType}`))}</option>`).join("")}</select></label>
        <label>${escapeHtml(t("activity.capture.occurredAt"))}<input required type="datetime-local" name="occurredAt" value="${escapeHtml(occurredValue)}"></label>
        ${timezone ? `<small>${escapeHtml(t("activity.capture.timezone", { timezone }))}</small>` : `<small>${escapeHtml(t("activity.capture.timezoneUnavailable"))}</small>`}
        <label>${escapeHtml(t("activity.capture.subject"))}<input required name="subjectId" pattern="[A-Za-z0-9._:@/-]+"></label>
        <div data-capture-fields></div>
        <p class="activity-authority-note">${escapeHtml(t("activity.capture.confirmation"))}</p>
        <p data-capture-error role="alert" hidden></p>
        <footer><button type="button" data-close>${escapeHtml(t("activity.capture.cancel"))}</button><button class="aura-primary">${escapeHtml(t("activity.capture.save"))}</button></footer>
      </form>
    </section>`, opener);
    const form = layer.querySelector("form");
    const select = form.elements.captureType;
    const renderFields = () => {
      const definition = definitions.find((entry) => entry.captureType === select.value);
      form.querySelector("[data-capture-fields]").innerHTML = definition.fields.map((field) => `<label>${escapeHtml(t(`field.${field.name}`))}<input required type="${escapeHtml(field.type)}" name="${escapeHtml(field.name)}" ${field.type === "text" ? 'pattern="[A-Za-z0-9._:@/-]+"' : ""}></label>`).join("");
    };
    on(select, "change", renderFields);
    renderFields();
    on(form, "submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"],button:not([type])');
      submit.disabled = true;
      const data = new FormData(form);
      const definition = definitions.find((entry) => entry.captureType === String(data.get("captureType")));
      const payload = Object.fromEntries(definition.fields.map((field) => {
        const raw = String(data.get(field.name) || "");
        const converted = field.type === "datetime-local"
          ? zonedLocalToIso(raw, timezone)
          : raw;
        return [field.name, converted];
      }));
      if (definition.discriminator) Object.assign(payload, definition.discriminator);
      try {
        if (!timezone) throw new Error("ACTIVITY_CALENDAR_TIMEZONE_REQUIRED");
        const receipt = await state.runtime.appendOne({
          eventType: definition.eventType,
          subjectType: definition.subjectType,
          subjectId: String(data.get("subjectId")),
          payload,
          occurredAt: zonedLocalToIso(String(data.get("occurredAt")), timezone),
        });
        announce(receipt.state === "CONFIRMED" ? t("activity.capture.success") : t("activity.capture.pending"));
        closeDialog();
        await refresh();
      } catch (error) {
        const node = form.querySelector("[data-capture-error]");
        node.hidden = false;
        node.textContent = `${t("activity.capture.failed")} ${error?.code || error?.message || ""}`;
      } finally {
        submit.disabled = false;
      }
    });
  }

  function announce(message) {
    const node = root.querySelector("[data-activity-live]");
    if (!node) return;
    node.textContent = "";
    queueMicrotask(() => {
      node.textContent = message;
    });
  }

  function bind() {
    root.querySelectorAll("[data-view]").forEach((node) => on(node, "click", () => {
      state.view = node.dataset.view;
      render();
    }));
    root.querySelectorAll("[data-activity-slider]").forEach((node) => on(node, "input", () =>
      syncMetric(node.dataset.activitySlider, node.value)
    ));
    root.querySelectorAll("[data-activity-number]").forEach((node) => on(node, "input", () =>
      syncMetric(node.dataset.activityNumber, node.value)
    ));
    on(root.querySelector("[data-calendar-config]"), "click", (event) => calendarDialog(event.currentTarget));
    on(root.querySelector("[data-vacation]"), "click", (event) => vacationDialog(event.currentTarget));
    on(root.querySelector("[data-add-activity]"), "click", (event) => captureDialog(event.currentTarget));
  }

  function buildDailyPoints(calendar, metricsBundle) {
    const today = localDateAt(new Date(), calendar.timezone);
    return metricsBundle.dailyPointInputs.map((entry) => {
      const calendarDay = calendar.dates.find((day) => day.localDate === entry.localDate);
      if (calendarDay?.eligible === false) {
        const vacation = calendarDay.reasonCode === "VACATION" || calendarDay.reasonCode === "TIME_OFF_CONFIRMED";
        return freeze({
          localDate: entry.localDate,
          eligible: false,
          state: vacation ? "VACATION" : "EXCLUDED",
          result: null,
          sourceRefs: calendarDay.sourceRefs || [],
        });
      }
      if (entry.localDate > today) {
        return freeze({
          localDate: entry.localDate,
          eligible: calendarDay?.eligible === true,
          state: "FUTURE",
          result: null,
          sourceRefs: [],
        });
      }
      if (calendarDay?.eligible !== true) {
        return freeze({
          localDate: entry.localDate,
          eligible: null,
          state: "UNKNOWN",
          result: null,
          sourceRefs: calendarDay?.sourceRefs || [],
        });
      }
      const result = state.runtime.points({
        counts: entry.counts,
        period: { from: entry.localDate, to: entry.localDate },
        timezone: calendar.timezone,
      });
      return freeze({
        localDate: entry.localDate,
        eligible: true,
        state: result.state === "READY" ? "CONFIRMED" : "PARTIAL",
        result,
        sourceRefs: result.sourceRefs || [],
      });
    });
  }

  function updateTips() {
    const policyApi = globalThis.ForgeActivityCoachingPolicyV1;
    const intelligenceApi = globalThis.ForgeActivityCoachingIntelligenceV1;
    if (!policyApi || !intelligenceApi || !state.locale) return;
    const today = todayLocalDate();
    const todayPoints = state.dailyPoints.find((entry) => entry.localDate === today)?.result;
    const pointCombinations = todayPoints?.state === "READY"
      ? state.runtime.combinations(todayPoints.remaining)
      : [];
    const dailyPoints = state.dailyPoints.map((entry) => ({
      localDate: entry.localDate,
      eligible: entry.eligible,
      state: entry.result?.state === "READY" ? "CONFIRMED" : entry.state,
      points: entry.result?.state === "READY" ? entry.result.total : null,
      sourceRefs: entry.sourceRefs,
    }));
    const intelligence = intelligenceApi.generateActivityTips({
      policyResolution: state.policyResolution,
      points: todayPoints?.state === "READY" ? todayPoints : null,
      pointCombinations,
      dailyPoints,
      calendar: state.calendar,
      scheduling: {
        state: "UNKNOWN",
        completedEligibleWeeks: 0,
        newScheduledAppointments: state.metricsBundle?.metrics?.appointmentsScheduled?.value ?? null,
        period: state.calendar?.period || null,
        sourceRefs: state.metricsBundle?.metrics?.appointmentsScheduled?.sourceRefs || [],
        warnings: ["current_week_not_closed"],
      },
      conversions: state.conversions?.conversions || [],
    });
    const presenter = createActivityTipPresenter(state.locale);
    state.tips = freeze({
      ...intelligence,
      tips: presenter.presentMany(intelligence.tips),
    });
  }

  async function refresh() {
    const revision = ++state.revision;
    state.phase = "LOADING";
    state.error = null;
    render();
    try {
      const calendarLoad = await state.calendarController.loadCurrentWeek();
      if (destroyed || revision !== state.revision) return;
      state.calendarLoad = calendarLoad;
      state.calendar = calendarLoad.calendar;
      state.pointAuthority = describeActivityPointsAuthority();

      if (!calendarReady()) {
        state.reporting = null;
        state.metricsBundle = null;
        state.conversions = null;
        state.dailyPoints = [];
        state.tips = null;
        state.phase = ["CONFLICTING", "ERROR"].includes(calendarLoad.state)
          ? calendarLoad.state
          : calendarLoad.state === "AUTHORITY_UNAVAILABLE"
            ? "ERROR"
            : "CONFIGURATION_REQUIRED";
        state.error = calendarLoad.reason || null;
        render();
        return;
      }

      const request = {
        period: {
          kind: "CUSTOM_RANGE",
          parameters: {
            from: state.calendar.period.from,
            to: state.calendar.period.to,
          },
        },
        timeZone: state.calendar.timezone,
        asOf: new Date().toISOString(),
      };
      state.reporting = await state.runtime.loadReporting(state.calendar, request);
      if (destroyed || revision !== state.revision) return;
      state.metricsBundle = await state.metricsAdapter.load({
        calendar: state.calendar,
        reporting: state.reporting,
      });
      if (destroyed || revision !== state.revision) return;

      state.conversions = state.runtime.conversions({
        session: "AUTHENTICATED",
        permission: "GRANTED",
        tenantId: String(user.id),
        advisorId: String(user.id),
        calendar: state.calendar,
        metrics: {
          referrals: state.metricsBundle.metrics.referrals,
          appointmentsScheduled: state.metricsBundle.metrics.appointmentsScheduled,
          appointmentsHeld: state.metricsBundle.metrics.appointmentsHeld,
          closingAppointmentsHeld: state.metricsBundle.metrics.closingAppointmentsHeld,
          applicationsSubmitted: state.metricsBundle.metrics.applicationsSubmitted,
          policiesPaid: state.metricsBundle.metrics.policiesPaid,
          advisorReferrals: state.metricsBundle.metrics.advisorReferrals,
        },
      });
      state.dailyPoints = buildDailyPoints(state.calendar, state.metricsBundle);
      updateTips();

      const partial = state.calendar.state !== "READY" ||
        state.reporting.state !== "READY" ||
        state.metricsBundle.state !== "READY" ||
        state.conversions.state !== "CONFIRMED" ||
        state.dailyPoints.some((entry) => entry.state === "PARTIAL");
      state.phase = state.reporting.state === "DISCONNECTED"
        ? "DISCONNECTED"
        : partial
          ? "PARTIAL"
          : "READY";
      render();
      globalState?.("");
    } catch (error) {
      if (destroyed || revision !== state.revision) return;
      state.phase = "ERROR";
      state.error = error?.code || error?.message || "ACTIVITY_REFRESH_FAILED";
      render();
      globalState?.(t("activity.state.error"));
    }
  }

  async function mount() {
    const revision = ++state.revision;
    root.innerHTML = `<section class="aura-loading"><div aria-hidden="true"></div><h1>${escapeHtml("Preparando tu actividad…")}</h1></section>`;
    const [localeResponse, policyResponse] = await Promise.all([
      fetch(LOCALE_URL),
      fetch(POLICY_URL),
    ]);
    if (!localeResponse.ok || !policyResponse.ok) {
      throw new Error("ACTIVITY_CONFIGURATION_LOAD_FAILED");
    }
    state.locale = await localeResponse.json();
    state.policy = await policyResponse.json();
    if (destroyed || revision !== state.revision) return;

    state.runtime = createActivityRuntimeAdapter({
      client,
      user,
      windowRef,
    });
    state.calendarController = createActivityCalendarController({
      client,
      user,
    });
    state.metricsAdapter = createActivityMetricsAdapter({
      client,
      user,
    });
    const policyApi = globalThis.ForgeActivityCoachingPolicyV1;
    state.policyResolution = policyApi.resolvePolicySnapshot([state.policy]);
    state.pointAuthority = describeActivityPointsAuthority();
    await refresh();
  }

  async function unmount() {
    closeDialog();
    clearListeners();
    state.revision += 1;
    await state.runtime?.close?.();
    root.replaceChildren();
  }

  function scrub() {
    state.values = {};
    state.policy = null;
    state.policyResolution = null;
    state.tips = null;
    state.locale = null;
    state.calendarLoad = null;
    state.calendar = null;
    state.reporting = null;
    state.metricsBundle = null;
    state.conversions = null;
    state.dailyPoints = [];
    state.pointAuthority = null;
    state.error = null;
    state.calendarController = null;
    state.metricsAdapter = null;
    state.runtime = null;
  }

  async function destroy() {
    if (destroyed) return;
    destroyed = true;
    await unmount();
    scrub();
  }

  function diagnostics() {
    return freeze({
      module: "AURA_ACTIVITY_PRODUCTIVE_UI_V2",
      state: state.phase,
      policyState: state.policyResolution?.state || "UNAVAILABLE",
      route: "actividad",
      legacyActivityImports: 0,
      material3VisualImports: 0,
      parallelLedger: false,
      calendarAuthority: state.calendarController?.diagnostics?.() || null,
      metricsState: state.metricsBundle?.state || "UNAVAILABLE",
      policiesPaidState: state.metricsBundle?.metrics?.policiesPaid?.metricState || "UNKNOWN",
      productionMigrationExecuted: state.runtime?.diagnostics?.().productionMigrationExecuted === true,
      unknownTreatedAsZero: false,
    });
  }

  return freeze({
    mount,
    unmount,
    scrub,
    destroy,
    diagnostics,
  });
}

const METRICS = Object.freeze([
  ["referidos", "Referidos"],
  ["llamadas", "Llamadas"],
  ["citas_agendadas", "Citas agendadas"],
  ["citas_iniciales", "Citas iniciales"],
  ["citas_cierre", "Citas de cierre"],
  ["solicitudes_firmadas", "Solicitudes firmadas"],
  ["polizas_pagadas", "Pólizas pagadas"],
  ["referido_asesor", "Referidos de asesor"],
]);
const STATE = Symbol.for("forge.aura.activity.daily-reconciliation.002");
const OWNER = "PRODUCTIVITY";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function dateOnly(value, timeZone = "America/Mexico_City") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const row = Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return `${row.year}-${row.month}-${row.day}`;
}

function dayBounds(activityDate) {
  return [`${activityDate}T00:00:00-06:00`, `${activityDate}T23:59:59.999-06:00`];
}

function rowsFromChart(result) {
  return (result?.activity?.current?.chartReady?.series || []).flatMap(series => (series.points || []).map(point => ({
    type: String(series.seriesId || "").replace(/^activity-series:/, ""),
    date: point.x,
    value: Number(point.value) || 0,
  })));
}

function sum(rows, date, types) {
  return rows
    .filter(row => row.date === date && types.includes(row.type))
    .reduce((total, row) => total + row.value, 0);
}

function metricEvidence(value, sourceRefs, state = "OBSERVED") {
  return freeze({ value, sourceRefs: [...new Set(sourceRefs || [])], state });
}

export function deriveActivityMetricSuggestions(result = {}) {
  const activityDate = dateOnly(result.generatedAt || new Date(), result.timeZone || "America/Mexico_City");
  const rows = rowsFromChart(result);
  const pointFacts = result?.activity?.pointFacts;

  const factObservation = eventType => {
    if (pointFacts?.state !== "READY" || !Array.isArray(pointFacts.facts)) return null;
    const matched = pointFacts.facts.filter(fact => fact?.eventType === eventType);
    return metricEvidence(
      matched.length,
      matched.map(fact => `fes:${fact.eventReference}`),
      "OBSERVED",
    );
  };

  const repObservation = (types, sourceKey) => {
    const value = sum(rows, activityDate, types);
    const hasSeries = rows.some(row => row.date === activityDate && types.includes(row.type))
      || (result?.activity?.current?.chartReady?.series || []).some(series => types.includes(String(series.seriesId || "").replace(/^activity-series:/, "")));
    if (!hasSeries && !result?.activity?.current?.report) return null;
    return metricEvidence(value, [`rep:${activityDate}:${sourceKey}`], "OBSERVED");
  };

  return freeze({
    activityDate,
    counts: {
      referidos: factObservation("REFERRAL_RECEIVED"),
      llamadas: factObservation("CALL_COMPLETED"),
      citas_agendadas: repObservation(
        ["INITIAL_APPOINTMENT_SCHEDULED", "CLOSING_APPOINTMENT_SCHEDULED"],
        "APPOINTMENT_SCHEDULED",
      ),
      citas_iniciales: repObservation(["INITIAL_APPOINTMENT_COMPLETED"], "INITIAL_APPOINTMENT_COMPLETED"),
      citas_cierre: repObservation(["CLOSING_APPOINTMENT_COMPLETED"], "CLOSING_APPOINTMENT_COMPLETED"),
      solicitudes_firmadas: null,
      polizas_pagadas: null,
      referido_asesor: factObservation("ADVISOR_REFERRAL_RECEIVED"),
    },
  });
}

function render(root) {
  root.innerHTML = `
    <details class="activity-review" data-activity-daily-confirmation>
      <summary>
        <span><span class="aura-eyebrow">REVISIÓN DEL DÍA</span><strong>Revisar métricas pendientes</strong></span>
        <span class="activity-review__summary-state" data-day-state>Preparando…</span>
      </summary>
      <div class="activity-review__body">
        <p class="activity-review__intro">Lo que ya quedó registrado se reutiliza automáticamente. Sólo revisa lo que siga incompleto, sugerido o necesite una corrección.</p>
        <div class="activity-review__list" data-confirm-grid></div>
        <p class="activity-review__status" data-confirm-status role="status" aria-live="polite"></p>
      </div>
    </details>`;
}

export function createActivityDailyConfirmation({
  root,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  onConfirmed = null,
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("ACTIVITY_DAILY_CONFIRMATION_ROOT_REQUIRED");
  if (root[STATE]) return root[STATE];
  render(root);

  const grid = root.querySelector("[data-confirm-grid]");
  const status = root.querySelector("[data-confirm-status]");
  const dayState = root.querySelector("[data-day-state]");
  let client = null;
  let activityDate = null;
  let suggestions = {};
  let latest = new Map();
  let mounted = false;

  async function getClient() {
    if (client) return client;
    client = await bootstrap?.getClient?.() || null;
    return client;
  }

  async function enrichSuggestions(base) {
    const selected = { ...base };
    const db = await getClient();
    if (!db) return selected;
    const [from, to] = dayBounds(activityDate);

    const applications = await db.from("application_events")
      .select("event_reference,occurred_at")
      .eq("event_type", "APPLICATION_SIGNED")
      .gte("occurred_at", from)
      .lte("occurred_at", to);
    if (!applications.error && (applications.data || []).length) {
      selected.solicitudes_firmadas = metricEvidence(
        new Set((applications.data || []).map(row => row.event_reference)).size,
        (applications.data || []).map(row => `application:${row.event_reference}`),
        "SUGGESTED",
      );
    }

    const mail = await db.from("activity_mail_evidence_suggestions")
      .select("id,provider,provider_message_ref,received_at,sender_domain,policy_reference_hint")
      .eq("suggested_metric", "polizas_pagadas")
      .gte("received_at", from)
      .lte("received_at", to);
    const mailRows = mail.error ? [] : (mail.data || []);
    if (mailRows.length) {
      const uniquePayments = new Map();
      for (const row of mailRows) {
        const policyHint = String(row.policy_reference_hint || "").trim().toUpperCase();
        const sourceScope = String(row.sender_domain || row.provider || "mail").toLowerCase();
        const dedupeKey = policyHint
          ? `policy:${sourceScope}:${policyHint}`
          : `message:${row.provider}:${row.provider_message_ref}`;
        if (!uniquePayments.has(dedupeKey)) uniquePayments.set(dedupeKey, row);
      }
      selected.polizas_pagadas = metricEvidence(
        uniquePayments.size,
        [...uniquePayments.values()].map(row => `mail-suggestion:${row.id}`),
        "SUGGESTED",
      );
    }
    return selected;
  }

  async function readConfirmations() {
    const db = await getClient();
    if (!db) {
      latest = new Map();
      return;
    }
    const result = await db.from("activity_metric_confirmations")
      .select("id,metric_key,suggested_value,confirmed_value,suggestion_sources,confirmation_kind,confirmed_at,correction_of")
      .eq("activity_date", activityDate)
      .order("confirmed_at", { ascending: true });
    if (result.error) throw result.error;
    latest = new Map();
    for (const row of result.data || []) latest.set(row.metric_key, row);
  }

  function stateFor(key) {
    const confirmed = latest.get(key);
    const suggestion = suggestions[key];
    if (confirmed) return { code: "CONFIRMED", label: "Confirmado", value: Number(confirmed.confirmed_value) };
    if (suggestion?.state === "OBSERVED") return { code: "OBSERVED", label: "Registrado", value: suggestion.value };
    if (suggestion?.state === "SUGGESTED") return { code: "SUGGESTED", label: "Sugerido", value: suggestion.value };
    return { code: "UNKNOWN", label: "Sin confirmar", value: null };
  }

  function renderRows() {
    let complete = 0;
    grid.innerHTML = METRICS.map(([key, label]) => {
      const state = stateFor(key);
      if (["CONFIRMED", "OBSERVED"].includes(state.code)) complete += 1;
      const previous = latest.get(key);
      const suggestion = suggestions[key];
      const detail = previous && suggestion && Number(previous.suggested_value) !== Number(previous.confirmed_value)
        ? `Forge detectó ${previous.suggested_value ?? "—"} · tú confirmaste ${previous.confirmed_value}`
        : state.code === "OBSERVED"
          ? `${state.value} registrado${state.value === 1 ? "" : "s"} en tu actividad`
          : state.code === "SUGGESTED"
            ? `Forge encontró ${state.value}; falta tu revisión`
            : state.code === "CONFIRMED"
              ? `${state.value} confirmado${state.value === 1 ? "" : "s"}`
              : "No hay evidencia suficiente para asumir cero";
      const initial = state.value === null ? "" : String(state.value);
      const action = state.code === "OBSERVED" || state.code === "CONFIRMED" ? "Corregir" : state.code === "SUGGESTED" ? "Revisar" : "Confirmar";
      return `<article class="activity-review-row" data-metric="${key}" data-state="${state.code}">
        <div class="activity-review-row__main">
          <div><strong>${esc(label)}</strong><span>${esc(detail)}</span></div>
          <span class="activity-review-row__state">${esc(state.label)}</span>
          <button type="button" class="aura-secondary activity-review-row__action" data-review-metric="${key}">${action}</button>
        </div>
        <div class="activity-review-row__editor" data-metric-editor hidden>
          <label>${esc(label)}<input type="number" min="0" max="999" inputmode="numeric" value="${esc(initial)}" placeholder="Sin confirmar"></label>
          <button type="button" class="aura-primary" data-save-metric="${key}">Guardar</button>
          <button type="button" class="aura-secondary" data-cancel-metric="${key}">Cancelar</button>
        </div>
      </article>`;
    }).join("");
    dayState.textContent = complete === METRICS.length ? "Todo confirmado" : `${METRICS.length - complete} pendiente${METRICS.length - complete === 1 ? "" : "s"}`;
  }

  function pointInput() {
    const counts = {};
    for (const [key] of METRICS) {
      const confirmed = latest.get(key);
      const observed = suggestions[key]?.state === "OBSERVED" ? suggestions[key] : null;
      if (confirmed) {
        const suggestionRefs = Array.isArray(confirmed.suggestion_sources)
          ? confirmed.suggestion_sources.filter(ref => typeof ref === "string" && ref.trim())
          : [];
        counts[key] = freeze({
          value: Number(confirmed.confirmed_value),
          completeness: "COMPLETE",
          evidenceState: "CONFIRMED",
          metricOwner: OWNER,
          sourceRefs: [...new Set([`activity-confirmation:${confirmed.id}`, ...suggestionRefs])],
        });
      } else if (observed && Number.isInteger(observed.value) && observed.value >= 0) {
        counts[key] = freeze({
          value: observed.value,
          completeness: "COMPLETE",
          evidenceState: "OBSERVED",
          metricOwner: OWNER,
          sourceRefs: observed.sourceRefs,
        });
      }
    }
    return freeze({
      counts,
      period: activityDate ? { from: activityDate, to: activityDate } : null,
      timezone: "America/Mexico_City",
    });
  }

  async function load({ result } = {}) {
    const base = deriveActivityMetricSuggestions(result || {});
    activityDate = base.activityDate;
    suggestions = await enrichSuggestions(base.counts);
    await readConfirmations();
    renderRows();
    status.textContent = "Los registros confirmados se reutilizan; lo desconocido permanece sin confirmar.";
    return pointInput();
  }

  function metricPayload(key, value) {
    const previous = latest.get(key);
    const suggestion = suggestions[key] || null;
    return {
      metricKey: key,
      suggestedValue: suggestion?.value ?? null,
      confirmedValue: value,
      suggestionSources: suggestion?.sourceRefs || [],
      correctionOf: previous?.id || null,
      correctionReason: previous && Number(previous.confirmed_value) !== value
        ? "USER_DAILY_RECONCILIATION_CORRECTION"
        : null,
    };
  }

  async function saveMetric(key) {
    const row = grid.querySelector(`[data-metric="${key}"]`);
    const input = row?.querySelector("input");
    const raw = String(input?.value ?? "").trim();
    if (!raw) {
      status.textContent = "Escribe un valor para confirmar esta métrica. Si no lo sabes, déjala sin confirmar.";
      return;
    }
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0 || value > 999) {
      status.textContent = "Usa un número entero entre 0 y 999.";
      return;
    }

    const button = row.querySelector(`[data-save-metric="${key}"]`);
    button.disabled = true;
    status.textContent = "Guardando revisión…";
    try {
      const db = await getClient();
      if (!db) throw new Error("La revisión requiere una sesión productiva conectada.");
      const payload = {
        activityDate,
        metrics: [metricPayload(key, value)],
        idempotencyKey: `activity-confirm:${activityDate}:${key}:${crypto.randomUUID?.() || Date.now()}`,
      };
      const saved = await db.rpc("forge_activity_confirm_daily_metrics", { p_payload: payload });
      if (saved.error) throw saved.error;
      await readConfirmations();
      renderRows();
      status.textContent = "Revisión guardada. La corrección conserva el historial anterior.";
      await onConfirmed?.(pointInput());
    } catch (error) {
      status.textContent = error?.message || "No pudimos guardar la revisión.";
    } finally {
      if (button?.isConnected) button.disabled = false;
    }
  }

  root.addEventListener("click", event => {
    const review = event.target.closest("[data-review-metric]");
    if (review) {
      const row = review.closest("[data-metric]");
      row.querySelector("[data-metric-editor]").hidden = false;
      row.querySelector("input")?.focus();
    }
    const cancel = event.target.closest("[data-cancel-metric]");
    if (cancel) cancel.closest("[data-metric]").querySelector("[data-metric-editor]").hidden = true;
    const save = event.target.closest("[data-save-metric]");
    if (save) void saveMetric(save.dataset.saveMetric);
  });

  const api = Object.freeze({
    async mount() {
      mounted = true;
      root.hidden = false;
    },
    async load(options) {
      if (!mounted) mounted = true;
      return load(options);
    },
    pointInput,
    async scrub() {
      activityDate = null;
      suggestions = {};
      latest = new Map();
      client = null;
      grid.replaceChildren();
      status.textContent = "";
      dayState.textContent = "Preparando…";
    },
    async destroy() {
      await api.scrub();
      root.replaceChildren();
      delete root[STATE];
    },
    diagnostics() {
      return freeze({
        mounted,
        activityDate,
        confirmedMetrics: latest.size,
        doubleCaptureRequired: false,
        unknownDefaultsToZero: false,
        directObservedMetrics: Object.values(suggestions).filter(item => item?.state === "OBSERVED").length,
      });
    },
  });
  root[STATE] = api;
  return api;
}

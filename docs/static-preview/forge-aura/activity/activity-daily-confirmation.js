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
const STATE = Symbol.for("forge.aura.activity.daily-confirmation.001");
const OWNER = "PRODUCTIVITY";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function dateOnly(value, timeZone = "America/Mexico_City") {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date(value));
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
  return rows.filter(row => row.date === date && types.includes(row.type)).reduce((total, row) => total + row.value, 0);
}

export function deriveActivityMetricSuggestions(result = {}) {
  const activityDate = dateOnly(result.generatedAt || new Date(), result.timeZone || "America/Mexico_City");
  const rows = rowsFromChart(result);
  const withValue = (value, sourceRefs) => freeze({ value, sourceRefs, state: "SUGGESTED" });
  return freeze({
    activityDate,
    counts: {
      referidos: null,
      // REP CONVERSATION_COMPLETED is not equivalent to a phone call. Until the
      // productive runtime exposes canonical FES CALL_COMPLETED facts, calls stay
      // unknown and require explicit advisor confirmation rather than a false suggestion.
      llamadas: null,
      citas_agendadas: withValue(sum(rows, activityDate, ["INITIAL_APPOINTMENT_SCHEDULED", "CLOSING_APPOINTMENT_SCHEDULED"]), [`rep:${activityDate}:APPOINTMENT_SCHEDULED`]),
      citas_iniciales: withValue(sum(rows, activityDate, ["INITIAL_APPOINTMENT_COMPLETED"]), [`rep:${activityDate}:INITIAL_APPOINTMENT_COMPLETED`]),
      citas_cierre: withValue(sum(rows, activityDate, ["CLOSING_APPOINTMENT_COMPLETED"]), [`rep:${activityDate}:CLOSING_APPOINTMENT_COMPLETED`]),
      solicitudes_firmadas: null,
      polizas_pagadas: null,
      referido_asesor: null,
    },
  });
}

function ensureStyles() {
  if (document.getElementById("activity-daily-confirmation-styles")) return;
  const style = document.createElement("style");
  style.id = "activity-daily-confirmation-styles";
  style.textContent = `
    .activity-daily-confirmation{margin:20px 0;padding:22px;border:1px solid var(--aura-border,#e1e6ef);border-radius:22px;background:var(--aura-surface,#fff);box-shadow:0 10px 36px rgba(24,32,56,.05)}
    .activity-daily-confirmation__head{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:16px}.activity-daily-confirmation__head h2{margin:4px 0}.activity-daily-confirmation__head p{margin:0;color:var(--aura-text-muted,#667085)}
    .activity-confirm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.activity-confirm-row{padding:15px;border:1px solid var(--aura-border,#e1e6ef);border-radius:17px;background:var(--aura-surface-subtle,#f8f9fc)}
    .activity-confirm-row__top{display:flex;justify-content:space-between;gap:8px;align-items:start}.activity-confirm-row__label{font-weight:850}.activity-confirm-row__hint{font-size:.78rem;color:var(--aura-text-muted,#667085);margin-top:3px}.activity-confirm-row__state{font-size:.72rem;font-weight:800;padding:5px 8px;border-radius:999px;background:var(--aura-surface,#fff);border:1px solid var(--aura-border,#e1e6ef)}
    .activity-counter{display:grid;grid-template-columns:48px minmax(64px,1fr) 48px;gap:8px;align-items:center;margin-top:12px}.activity-counter button,.activity-counter input{min-height:48px;border:1px solid var(--aura-border,#dfe4ee);border-radius:13px;background:var(--aura-surface,#fff);color:var(--aura-text,#172033);font:inherit;font-weight:900}.activity-counter button{font-size:1.25rem;cursor:pointer}.activity-counter input{text-align:center;font-size:1.35rem;width:100%;appearance:textfield}.activity-counter input::-webkit-inner-spin-button{appearance:none}.activity-counter button:focus-visible,.activity-counter input:focus-visible{outline:3px solid color-mix(in srgb,var(--aura-accent,#7757ff) 35%,transparent);outline-offset:2px}
    .activity-daily-confirmation__footer{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-top:16px}.activity-daily-confirmation__footer p{margin:0;color:var(--aura-text-muted,#667085);font-size:.82rem}.activity-daily-confirmation__footer button{min-height:46px;padding:0 20px;border:0;border-radius:14px;background:var(--aura-accent,#7757ff);color:#fff;font:inherit;font-weight:850;cursor:pointer}.activity-daily-confirmation__footer button:disabled{opacity:.55;cursor:wait}
    @media(max-width:720px){.activity-confirm-grid{grid-template-columns:1fr}.activity-daily-confirmation__head,.activity-daily-confirmation__footer{flex-direction:column;align-items:stretch}.activity-daily-confirmation__footer button{width:100%}}
  `;
  document.head.append(style);
}

function render(root) {
  root.innerHTML = `
    <section class="activity-daily-confirmation" data-activity-daily-confirmation>
      <div class="activity-daily-confirmation__head">
        <div><p class="aura-eyebrow">CONFIRMACIÓN DIARIA</p><h2>¿Qué hiciste hoy?</h2><p>Forge propone cuando tiene evidencia. Tú confirmas o corriges el número exacto.</p></div>
        <span class="activity-confirm-row__state" data-day-state>Pendiente</span>
      </div>
      <div class="activity-confirm-grid" data-confirm-grid></div>
      <div class="activity-daily-confirmation__footer">
        <p data-confirm-status role="status" aria-live="polite">Un cero no cuenta como confirmado hasta que guardes.</p>
        <button type="button" data-confirm-all>Confirmar actividad de hoy</button>
      </div>
    </section>`;
}

export function createActivityDailyConfirmation({ root, bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B, onConfirmed = null } = {}) {
  if (!(root instanceof Element)) throw new TypeError("ACTIVITY_DAILY_CONFIRMATION_ROOT_REQUIRED");
  if (root[STATE]) return root[STATE];
  ensureStyles();
  render(root);
  const grid = root.querySelector("[data-confirm-grid]");
  const status = root.querySelector("[data-confirm-status]");
  const action = root.querySelector("[data-confirm-all]");
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
    if (!applications.error) selected.solicitudes_firmadas = freeze({
      value: new Set((applications.data || []).map(row => row.event_reference)).size,
      state: "SUGGESTED",
      sourceRefs: (applications.data || []).map(row => `application:${row.event_reference}`),
    });

    const mail = await db.from("activity_mail_evidence_suggestions")
      .select("id,provider,provider_message_ref,received_at,sender_domain,policy_reference_hint")
      .eq("suggested_metric", "polizas_pagadas")
      .gte("received_at", from)
      .lte("received_at", to);
    if (!mail.error) {
      const uniquePayments = new Map();
      for (const row of mail.data || []) {
        const policyHint = String(row.policy_reference_hint || "").trim().toUpperCase();
        const sourceScope = String(row.sender_domain || row.provider || "mail").toLowerCase();
        const dedupeKey = policyHint
          ? `policy:${sourceScope}:${policyHint}`
          : `message:${row.provider}:${row.provider_message_ref}`;
        if (!uniquePayments.has(dedupeKey)) uniquePayments.set(dedupeKey, row);
      }
      selected.polizas_pagadas = freeze({
        value: uniquePayments.size,
        state: "SUGGESTED",
        sourceRefs: [...uniquePayments.values()].map(row => `mail-suggestion:${row.id}`),
      });
    }
    return selected;
  }

  async function readConfirmations() {
    const db = await getClient();
    if (!db) { latest = new Map(); return; }
    const result = await db.from("activity_metric_confirmations")
      .select("id,metric_key,suggested_value,confirmed_value,suggestion_sources,confirmation_kind,confirmed_at,correction_of")
      .eq("activity_date", activityDate)
      .order("confirmed_at", { ascending: true });
    if (result.error) throw result.error;
    latest = new Map();
    for (const row of result.data || []) latest.set(row.metric_key, row);
  }

  function renderRows() {
    grid.innerHTML = METRICS.map(([key, label]) => {
      const suggestion = suggestions[key];
      const confirmed = latest.get(key);
      const value = confirmed?.confirmed_value ?? suggestion?.value ?? 0;
      const hint = suggestion
        ? `Sugerido por Forge: ${suggestion.value}`
        : "Sin sugerencia · confirma manualmente";
      return `<article class="activity-confirm-row" data-metric="${key}">
        <div class="activity-confirm-row__top"><div><div class="activity-confirm-row__label">${label}</div><div class="activity-confirm-row__hint">${hint}</div></div><span class="activity-confirm-row__state" data-metric-state>${confirmed ? "Confirmado" : "Pendiente"}</span></div>
        <div class="activity-counter"><button type="button" data-step="-1" aria-label="Restar uno a ${label}">−</button><input type="number" min="0" max="999" inputmode="numeric" value="${value}" aria-label="${label}"><button type="button" data-step="1" aria-label="Sumar uno a ${label}">+</button></div>
      </article>`;
    }).join("");
    dayState.textContent = latest.size === METRICS.length ? "Confirmado" : `${latest.size}/${METRICS.length} confirmados`;
    action.textContent = latest.size ? "Guardar confirmación / corrección" : "Confirmar actividad de hoy";
  }

  function pointInput() {
    const counts = {};
    for (const [key] of METRICS) {
      const row = latest.get(key);
      if (!row) continue;
      const suggestionRefs = Array.isArray(row.suggestion_sources)
        ? row.suggestion_sources.filter(ref => typeof ref === "string" && ref.trim())
        : [];
      counts[key] = freeze({
        value: Number(row.confirmed_value),
        completeness: "COMPLETE",
        evidenceState: "CONFIRMED",
        metricOwner: OWNER,
        sourceRefs: [...new Set([`activity-confirmation:${row.id}`, ...suggestionRefs])],
      });
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
    return pointInput();
  }

  function metricPayload(key) {
    const node = grid.querySelector(`[data-metric="${key}"]`);
    const value = Number(node.querySelector("input").value);
    if (!Number.isInteger(value) || value < 0 || value > 999) throw new Error("Usa números enteros entre 0 y 999.");
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

  async function save() {
    action.disabled = true;
    status.textContent = "Guardando confirmación…";
    try {
      const db = await getClient();
      if (!db) throw new Error("La confirmación requiere una sesión productiva conectada.");
      const metrics = METRICS.map(([key]) => metricPayload(key));
      const payload = {
        activityDate,
        metrics,
        idempotencyKey: `activity-confirm-batch:${activityDate}:${crypto.randomUUID?.() || Date.now()}`,
      };
      const saved = await db.rpc("forge_activity_confirm_daily_metrics", { p_payload: payload });
      if (saved.error) throw saved.error;
      await readConfirmations();
      renderRows();
      status.textContent = "Actividad confirmada. Los puntos usan estos valores, no la sugerencia.";
      await onConfirmed?.(pointInput());
    } catch (error) {
      status.textContent = error?.message || "No pudimos guardar la confirmación.";
    } finally {
      action.disabled = false;
    }
  }

  root.addEventListener("click", event => {
    const step = event.target.closest("[data-step]");
    if (step) {
      const input = step.parentElement.querySelector("input");
      input.value = String(Math.max(0, Math.min(999, Number(input.value || 0) + Number(step.dataset.step))));
      step.closest("[data-metric]").querySelector("[data-metric-state]").textContent = "Modificado";
    }
    if (event.target.closest("[data-confirm-all]")) void save();
  });
  grid.addEventListener("input", event => {
    if (event.target.matches("input")) event.target.closest("[data-metric]").querySelector("[data-metric-state]").textContent = "Modificado";
  });

  const api = freeze({
    async mount() { mounted = true; },
    async load(options) { if (!mounted) mounted = true; return load(options); },
    pointInput,
    async scrub() { latest = new Map(); suggestions = {}; activityDate = null; client = null; grid.replaceChildren(); },
    async destroy() { await api.scrub(); root.replaceChildren(); delete root[STATE]; },
  });
  root[STATE] = api;
  return api;
}

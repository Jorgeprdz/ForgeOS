(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ForgeProspectContactActions067G17C2A = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_TIMEZONE = "America/Mexico_City";
  const DEFAULT_DURATION_MINUTES = 45;
  const cleanSingleLine = value => String(value ?? "").replace(/\s+/g, " ").trim();

  function draftAdapters() {
    const context = globalThis.ForgeProspectMessageContextAdapter067G17N6
      || (typeof require === "function" ? require("./prospect-message-context-adapter.js") : null);
    const draft = globalThis.ForgeNashProspectDeterministicDraftAdapter067G17N7
      || (typeof require === "function" ? require("../../manager-os/message-generation/nash-prospect-deterministic-draft-adapter.js") : null);
    return context && draft ? { context, draft } : null;
  }

  function normalizePhone(value, defaultCountry = "MX") {
    const raw = cleanSingleLine(value);
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
    if (defaultCountry === "MX" && digits.length === 10) return `+52${digits}`;
    return null;
  }

  function prospectPhone(prospect = {}, channel = "call") {
    const values = channel === "whatsapp"
      ? [prospect.whatsappNormalized, prospect.whatsapp, prospect.phoneNormalized, prospect.phone]
      : [prospect.phoneNormalized, prospect.phone, prospect.whatsappNormalized, prospect.whatsapp];
    for (const value of values) {
      const normalized = normalizePhone(value);
      if (normalized) return normalized;
    }
    return null;
  }

  function buildCallAction(prospect = {}) {
    const phone = prospectPhone(prospect, "call");
    return Object.freeze({ enabled: Boolean(phone), phone, href: phone ? `tel:${phone}` : null });
  }

  function buildWhatsAppDraft(prospect = {}, tone = "profesional") {
    const adapters = draftAdapters();
    const input = prospect.prospectMessageContextInput;
    if (!adapters || !input) return Object.freeze({ status: "NO_DRAFT", reason: "VERIFIED_CONTEXT_REQUIRED" });
    try {
      const fields = { ...(input.fields || {}) };
      if (fields.advisorSelectedTone) fields.advisorSelectedTone = { ...fields.advisorSelectedTone, value: tone };
      const context = adapters.context.createProspectMessageContext({ ...input, fields });
      return adapters.draft.createDeterministicDraftCandidate(context);
    } catch {
      return Object.freeze({ status: "NO_DRAFT", reason: "INVALID_CONTEXT" });
    }
  }

  function buildWhatsAppAction(prospect = {}, tone = "profesional") {
    const phone = prospectPhone(prospect, "whatsapp");
    const candidate = buildWhatsAppDraft(prospect, tone);
    const draft = candidate.status === "DRAFT_CANDIDATE" ? candidate.draftText : null;
    const digits = phone ? phone.slice(1) : null;
    return Object.freeze({
      enabled: Boolean(digits && draft), phone, digits, draft, draftCandidate: candidate,
      href: digits && draft ? `https://wa.me/${digits}?text=${encodeURIComponent(draft)}` : null,
    });
  }

  function isValidTimezone(timezone) {
    if (!cleanSingleLine(timezone)) return false;
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date(0));
      return true;
    } catch {
      return false;
    }
  }

  function validLocalDateTime(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false;
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const check = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1
      && check.getUTCDate() === day && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
  }

  const compactCalendarDate = (date, time) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
  function addMinutes(date, time, durationMinutes) {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const end = new Date(Date.UTC(year, month - 1, day, hour, minute + durationMinutes));
    const pad = value => String(value).padStart(2, "0");
    return `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}T${pad(end.getUTCHours())}${pad(end.getUTCMinutes())}00`;
  }

  function buildCalendarAction(prospect = {}, input = {}) {
    const date = cleanSingleLine(input.date);
    const time = cleanSingleLine(input.time);
    const timezone = cleanSingleLine(input.timezone) || DEFAULT_TIMEZONE;
    const durationMinutes = Number(input.durationMinutes ?? DEFAULT_DURATION_MINUTES);
    const name = cleanSingleLine(prospect.fullName);
    const valid = Boolean(name && validLocalDateTime(date, time) && isValidTimezone(timezone)
      && Number.isInteger(durationMinutes) && durationMinutes >= 15 && durationMinutes <= 480);
    if (!valid) return Object.freeze({ enabled: false, href: null, draft: null, error: "Selecciona fecha, hora y duración válidas." });
    const title = `Cita con ${name}`;
    const params = new URLSearchParams({
      action: "TEMPLATE", text: title,
      dates: `${compactCalendarDate(date, time)}/${addMinutes(date, time, durationMinutes)}`,
      ctz: timezone,
      details: "Cita con prospecto. Confirma los detalles antes de guardar.",
    });
    return Object.freeze({
      enabled: true,
      href: `https://calendar.google.com/calendar/render?${params.toString()}`,
      draft: Object.freeze({ title, date, time, timezone, durationMinutes }), error: null,
    });
  }

  return Object.freeze({ DEFAULT_TIMEZONE, DEFAULT_DURATION_MINUTES, normalizePhone, prospectPhone,
    buildCallAction, buildWhatsAppDraft, buildWhatsAppAction, isValidTimezone, buildCalendarAction });
});

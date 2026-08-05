export const AURA_PIPELINE_CALENDAR_TIME_ZONE = "America/Mexico_City";

function compactUtc(date) {
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    "T",
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    "00",
  ].join("");
}

function floatingDate(dateValue, timeValue) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateValue || ""));
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(String(timeValue || ""));
  if (!dateMatch || !timeMatch) return null;

  const [, year, month, day] = dateMatch.map(Number);
  const [, hour, minute] = timeMatch.map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  if (
    value.getUTCFullYear() !== year
    || value.getUTCMonth() !== month - 1
    || value.getUTCDate() !== day
    || value.getUTCHours() !== hour
    || value.getUTCMinutes() !== minute
  ) return null;
  return value;
}

export function buildAuraPipelineGoogleCalendarUrl({
  prospect,
  date,
  time,
  durationMinutes,
}) {
  const start = floatingDate(date, time);
  const duration = Number(durationMinutes);
  if (!start || !Number.isFinite(duration) || duration <= 0) return null;

  const end = new Date(start.getTime() + duration * 60_000);
  const details = [
    `Prospecto: ${prospect.fullName}`,
    prospect.stageLabel ? `Etapa: ${prospect.stageLabel}` : "",
    prospect.sourceSummary ? `Fuente: ${prospect.sourceSummary}` : "",
    prospect.latestActivity ? `Última actividad: ${prospect.latestActivity}` : "",
    "",
    "Evento preparado desde Forge. Revisa los detalles antes de guardar.",
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Cita con ${prospect.fullName}`,
    dates: `${compactUtc(start)}/${compactUtc(end)}`,
    ctz: AURA_PIPELINE_CALENDAR_TIME_ZONE,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const DAY_MS = 86_400_000;

function isoDate(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function atLocalNoon(date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function startOfWeek(date) {
  const copy = atLocalNoon(date);
  const weekday = copy.getDay();
  const delta = weekday === 0 ? -6 : 1 - weekday;
  copy.setDate(copy.getDate() + delta);
  return copy;
}

function addDays(date, amount) {
  const copy = atLocalNoon(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatExactRange(from, to, locale = "es-MX") {
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (from === to) return formatter.format(start);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function officialActivityPeriods(now = new Date()) {
  const current = atLocalNoon(now);
  const today = isoDate(current);
  const weekStart = startOfWeek(current);
  const weekEnd = addDays(weekStart, 6);
  const monthStart = new Date(current.getFullYear(), current.getMonth(), 1, 12);
  const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 12);
  const last30Start = addDays(current, -29);
  const previousWeekEnd = addDays(weekStart, -1);
  const previousWeekStart = addDays(previousWeekEnd, -6);
  return Object.freeze([
    { id: "TODAY", label: "Hoy", from: today, to: today, isPartial: true },
    { id: "CURRENT_WEEK", label: "Semana actual", from: isoDate(weekStart), to: isoDate(weekEnd), isPartial: today < isoDate(weekEnd) },
    { id: "CURRENT_MONTH", label: "Mes actual", from: isoDate(monthStart), to: isoDate(monthEnd), isPartial: today < isoDate(monthEnd) },
    { id: "LAST_30_DAYS", label: "Últimos 30 días", from: isoDate(last30Start), to: today, isPartial: false },
    { id: "PREVIOUS_WEEK", label: "Semana anterior", from: isoDate(previousWeekStart), to: isoDate(previousWeekEnd), isPartial: false },
  ].map((period) => Object.freeze({ ...period, exactLabel: formatExactRange(period.from, period.to) })));
}

export function findOfficialPeriod(id, now = new Date()) {
  const periods = officialActivityPeriods(now);
  return periods.find((period) => period.id === id) || periods[1];
}

export function compatibleComparison(current, previous) {
  if (!current || !previous) return false;
  const days = (period) => Math.round((Date.parse(`${period.to}T12:00:00Z`) - Date.parse(`${period.from}T12:00:00Z`)) / DAY_MS) + 1;
  return days(current) === days(previous) && current.isPartial === false && previous.isPartial === false;
}

export { formatExactRange };

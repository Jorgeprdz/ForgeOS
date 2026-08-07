export const CALENDAR_TIME_ZONE = "America/Mexico_City";
function floating(valueDate, valueTime) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valueDate || "") || !/^\d{2}:\d{2}$/.test(valueTime || "")) return null;
  const [y,m,d]=valueDate.split("-").map(Number); const [h,min]=valueTime.split(":").map(Number);
  const date=new Date(Date.UTC(y,m-1,d,h,min,0));
  return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d&&date.getUTCHours()===h&&date.getUTCMinutes()===min?date:null;
}
const compact = date => `${date.getUTCFullYear()}${String(date.getUTCMonth()+1).padStart(2,"0")}${String(date.getUTCDate()).padStart(2,"0")}T${String(date.getUTCHours()).padStart(2,"0")}${String(date.getUTCMinutes()).padStart(2,"0")}00`;
export function buildCalendarDraftUrl({ record, date, time, durationMinutes=45 }) {
  const start=floating(date,time); const duration=Number(durationMinutes);
  if(!start||!Number.isFinite(duration)||duration<=0)return null;
  const end=new Date(start.getTime()+duration*60000);
  const details=[`Prospecto: ${record.fullName}`,`Etapa: ${record.stageLabel}`,`Fuente: ${record.sourceSummary}`,"","Evento preparado desde Forge. Revisa los detalles antes de guardar."].join("\n");
  const params=new URLSearchParams({action:"TEMPLATE",text:`Cita con ${record.fullName}`,dates:`${compact(start)}/${compact(end)}`,ctz:CALENDAR_TIME_ZONE,details});
  return `https://calendar.google.com/calendar/render?${params}`;
}

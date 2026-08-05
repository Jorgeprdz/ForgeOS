export const VIEW_STORAGE_KEY = "forge-aura:pipeline-view";
export const STAGES = Object.freeze([
  { value: "referred_new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "appointment_scheduled", label: "Cita agendada" },
  { value: "proposal", label: "Propuesta" },
  { value: "decision", label: "En decisión" },
  { value: "client", label: "Cliente" },
]);

export const PIPELINE_STATES = Object.freeze([
  "PIPELINE_LOADING","PIPELINE_READY","PIPELINE_EMPTY","PIPELINE_FILTERED_EMPTY","PIPELINE_ERROR",
  "PIPELINE_DISCONNECTED","PIPELINE_UNAUTHORIZED","STAGE_SAVING","STAGE_CONFIRMED","STAGE_FAILED",
  "ACTION_DISABLED_NO_PHONE","TIMELINE_LOADING","TIMELINE_EMPTY","TIMELINE_ERROR",
  "ARCHIVE_CONFIRMATION","ARCHIVE_SUCCESS","ARCHIVE_FAILURE",
]);

export const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
export const normalize = value => String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim();
export const phoneOf = record => String(record?.phone || record?.prospect?.phone || record?.prospect?.whatsapp || "").replace(/[^\d+]/g,"");
export const stageLabel = value => STAGES.find(stage => stage.value === value)?.label || value || "Sin etapa";

export function formatDate(value, fallback = "Sin registro") {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short"}).format(new Date(time)) : fallback;
}

export function matches(record, filters) {
  const query = normalize(filters.query);
  const haystack = normalize([record.fullName,record.sourceSummary,record.stageLabel,record.productInterest,record.latestActivity?.label,record.nextCommitment?.type].filter(Boolean).join(" "));
  return (!filters.stage || record.status === filters.stage)
    && (!filters.source || record.sourceValue === filters.source)
    && (!query || haystack.includes(query));
}

export function deriveCard(prospect, timeline = []) {
  const latest = [...timeline].sort((a,b)=>String(b.occurredAt||b.recordedAt||"").localeCompare(String(a.occurredAt||a.recordedAt||"")))[0] || null;
  return Object.freeze({
    id: prospect.id,
    fullName: prospect.fullName || "Nombre no disponible",
    status: prospect.status || "referred_new",
    stageLabel: stageLabel(prospect.status),
    sourceValue: prospect.source || "",
    sourceSummary: [prospect.source,prospect.referrerName,prospect.referrerRelationship].filter(Boolean).join(" · ") || "Fuente no disponible",
    productInterest: Array.isArray(prospect.productsOfInterest) ? prospect.productsOfInterest.join(", ") : prospect.productsOfInterest || "",
    phone: prospect.phone || prospect.whatsapp || null,
    latestActivity: latest ? { label: latest.eventType?.replaceAll("_"," ").toLowerCase(), occurredAt: latest.occurredAt || latest.recordedAt } : null,
    nextCommitment: prospect.nextActionAt ? { type: prospect.nextActionType || "Compromiso registrado", dueAt: prospect.nextActionAt } : null,
    priority: prospect.priority || null,
    timeline,
    prospect,
  });
}

export function viewPreference(storage) {
  try { return storage?.getItem(VIEW_STORAGE_KEY) === "list" ? "list" : "cards"; } catch { return "cards"; }
}
export function saveViewPreference(storage, view) {
  try { storage?.setItem(VIEW_STORAGE_KEY, view === "list" ? "list" : "cards"); } catch {}
}

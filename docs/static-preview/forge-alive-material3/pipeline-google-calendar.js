const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const ACTION_SELECTOR = ".pipeline-module__action--calendar";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const STYLE_SELECTOR = "[data-pipeline-google-calendar-styles]";
const LAYER_SELECTOR = "[data-pipeline-calendar-layer]";
const INSTALL_KEY = Symbol.for("forge.material3.pipeline.google-calendar");

export const PIPELINE_CALENDAR_TIME_ZONE = "America/Mexico_City";

let activeWorkspace;

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character],
  );
}

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
  ) {
    return null;
  }

  return value;
}

function prospectDetails(prospect) {
  return [
    `Prospecto: ${prospect.fullName}`,
    prospect.stageLabel ? `Etapa: ${prospect.stageLabel}` : "",
    prospect.sourceSummary ? `Fuente: ${prospect.sourceSummary}` : "",
    prospect.latestActivity ? `Última actividad: ${prospect.latestActivity}` : "",
    "",
    "Evento preparado desde ForgeOS. Revisa los detalles antes de guardar.",
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join("\n");
}

export function buildPipelineGoogleCalendarUrl({
  prospect,
  date,
  time,
  durationMinutes,
}) {
  const start = floatingDate(date, time);
  const duration = Number(durationMinutes);
  if (!start || !Number.isFinite(duration) || duration <= 0) return null;

  const end = new Date(start.getTime() + duration * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Cita con ${prospect.fullName}`,
    dates: `${compactUtc(start)}/${compactUtc(end)}`,
    ctz: PIPELINE_CALENDAR_TIME_ZONE,
    details: prospectDetails(prospect),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function zonedParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PIPELINE_CALENDAR_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(
    parts
      .filter(part => part.type !== "literal")
      .map(part => [part.type, Number(part.value)]),
  );
}

function defaultStartValues(now = new Date()) {
  const parts = zonedParts(now);
  const floatingNow = new Date(Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0,
  ));
  const minutesToNextSlot = 30 - (floatingNow.getUTCMinutes() % 30 || 30) + 30;
  const rounded = new Date(floatingNow.getTime() + minutesToNextSlot * 60_000);
  return {
    date: `${rounded.getUTCFullYear()}-${String(rounded.getUTCMonth() + 1).padStart(2, "0")}-${String(rounded.getUTCDate()).padStart(2, "0")}`,
    time: `${String(rounded.getUTCHours()).padStart(2, "0")}:${String(rounded.getUTCMinutes()).padStart(2, "0")}`,
  };
}

function humanDate(dateValue) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateValue || ""));
  if (!match) return "";
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function prospectSnapshot(action) {
  const card = action.closest(CARD_SELECTOR);
  return Object.freeze({
    id: card?.dataset.productiveProspectCard || "",
    fullName: card?.querySelector("[data-productive-card-identity] strong")
      ?.textContent?.trim() || "este prospecto",
    stageLabel: card?.querySelector("[data-productive-stage-label]")
      ?.textContent?.trim() || "",
    sourceSummary: card?.querySelector("[data-productive-source-label]")
      ?.textContent?.trim() || "",
    latestActivity: card?.querySelector("[data-timeline-activity] strong")
      ?.textContent?.trim() || "",
  });
}

function ensureStyles(documentRef) {
  if (documentRef.querySelector(STYLE_SELECTOR)) return;
  const link = documentRef.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./pipeline-google-calendar.css?v=pipeline-google-calendar-001",
    import.meta.url,
  );
  link.dataset.pipelineGoogleCalendarStyles = "true";
  documentRef.head.append(link);
}

function workspaceTemplate(prospect) {
  return `
    <button class="pipeline-calendar__scrim" type="button" data-close-pipeline-calendar aria-label="Cerrar agenda"></button>
    <section class="pipeline-calendar" role="dialog" aria-modal="true" aria-labelledby="pipeline-calendar-title">
      <header class="pipeline-calendar__header">
        <div>
          <p>AGENDA · GOOGLE CALENDAR</p>
          <h2 id="pipeline-calendar-title">Cita con ${escapeHtml(prospect.fullName)}</h2>
          <span>ForgeOS prepara el evento; tú revisas y pulsas Guardar en Google Calendar.</span>
        </div>
        <button type="button" data-close-pipeline-calendar aria-label="Cerrar">×</button>
      </header>
      <div class="pipeline-calendar__body">
        <div class="pipeline-calendar__context">
          ${prospect.stageLabel ? `<span>Etapa<strong>${escapeHtml(prospect.stageLabel)}</strong></span>` : ""}
          ${prospect.sourceSummary ? `<span>Fuente<strong>${escapeHtml(prospect.sourceSummary)}</strong></span>` : ""}
        </div>
        <div class="pipeline-calendar__fields">
          <label>
            <span>Fecha</span>
            <input type="date" data-pipeline-calendar-date required>
          </label>
          <label>
            <span>Hora</span>
            <input type="time" data-pipeline-calendar-time required>
          </label>
          <label>
            <span>Duración</span>
            <select data-pipeline-calendar-duration>
              <option value="30">30 min</option>
              <option value="45" selected>45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </label>
          <label>
            <span>Zona horaria</span>
            <input value="${PIPELINE_CALENDAR_TIME_ZONE}" readonly data-pipeline-calendar-timezone>
          </label>
        </div>
        <p class="pipeline-calendar__preview" data-pipeline-calendar-preview>Selecciona fecha y hora.</p>
        <p class="pipeline-calendar__boundary">Este flujo no confirma que el evento fue guardado y todavía no modifica Pipeline ni Timeline.</p>
      </div>
      <footer class="pipeline-calendar__footer">
        <button type="button" data-close-pipeline-calendar>Cancelar</button>
        <a data-open-pipeline-google-calendar aria-disabled="true" tabindex="-1" target="_blank" rel="noopener noreferrer">Abrir Google Calendar</a>
      </footer>
    </section>
  `;
}

function closeWorkspace({ restoreFocus = true } = {}) {
  if (!activeWorkspace) return false;
  const { layer, trigger, previousOverflow, keydown } = activeWorkspace;
  activeWorkspace = undefined;
  document.removeEventListener("keydown", keydown);
  layer.remove();
  document.body.style.overflow = previousOverflow;
  document.documentElement.removeAttribute("data-pipeline-calendar-workspace");
  if (restoreFocus && trigger?.isConnected) trigger.focus();
  return true;
}

function openWorkspace(action) {
  const documentRef = action.ownerDocument;
  ensureStyles(documentRef);
  closeWorkspace({ restoreFocus: false });

  const prospect = prospectSnapshot(action);
  const layer = documentRef.createElement("div");
  layer.className = "pipeline-calendar-layer";
  layer.dataset.pipelineCalendarLayer = "";
  layer.innerHTML = workspaceTemplate(prospect);

  const dateInput = layer.querySelector("[data-pipeline-calendar-date]");
  const timeInput = layer.querySelector("[data-pipeline-calendar-time]");
  const durationInput = layer.querySelector("[data-pipeline-calendar-duration]");
  const preview = layer.querySelector("[data-pipeline-calendar-preview]");
  const link = layer.querySelector("[data-open-pipeline-google-calendar]");
  const defaults = defaultStartValues();
  dateInput.value = defaults.date;
  dateInput.min = defaults.date;
  timeInput.value = defaults.time;

  const updateDraft = () => {
    const href = buildPipelineGoogleCalendarUrl({
      prospect,
      date: dateInput.value,
      time: timeInput.value,
      durationMinutes: durationInput.value,
    });

    if (!href) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      preview.textContent = "Selecciona una fecha y hora válidas.";
      return;
    }

    link.href = href;
    link.removeAttribute("aria-disabled");
    link.removeAttribute("tabindex");
    preview.textContent = `${humanDate(dateInput.value)} · ${timeInput.value} · ${durationInput.value} min`;
  };

  layer.addEventListener("input", updateDraft);
  layer.addEventListener("change", updateDraft);
  layer.addEventListener("click", event => {
    if (event.target.closest("[data-close-pipeline-calendar]")) {
      event.preventDefault();
      closeWorkspace();
      return;
    }
    const open = event.target.closest("[data-open-pipeline-google-calendar]");
    if (open?.getAttribute("aria-disabled") === "true") event.preventDefault();
  });

  const keydown = event => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeWorkspace();
  };

  const previousOverflow = document.body.style.overflow;
  activeWorkspace = { layer, trigger: action, previousOverflow, keydown };
  documentRef.addEventListener("keydown", keydown);
  documentRef.body.append(layer);
  documentRef.body.style.overflow = "hidden";
  documentRef.documentElement.dataset.pipelineCalendarWorkspace = "open";
  updateDraft();
  requestAnimationFrame(() => dateInput.focus());
}

function normalizeAction(action) {
  const prospect = prospectSnapshot(action);
  action.disabled = false;
  action.type = "button";
  action.dataset.openPipelineCalendar = prospect.id;
  action.dataset.pipelineCalendarState = "draft-only";
  action.title = "Agendar en Google Calendar";
  action.setAttribute(
    "aria-label",
    `Agendar en Google Calendar para ${prospect.fullName}`,
  );
}

function apply(root) {
  root.querySelectorAll(ACTION_SELECTOR).forEach(normalizeAction);
  root.dataset.pipelineGoogleCalendar = "ready";
  root.ownerDocument.documentElement.dataset.pipelineGoogleCalendar = "ready";
}

export function installPipelineGoogleCalendar(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  if (!documentRef) return Object.freeze({ installed: false });

  ensureStyles(documentRef);
  let root = documentRef.querySelector(ROOT_SELECTOR);
  if (root?.[INSTALL_KEY]) return root[INSTALL_KEY];

  let rootObserver;
  let documentObserver;

  const connectRoot = candidate => {
    if (!candidate || candidate === root && rootObserver) return;
    rootObserver?.disconnect();
    root = candidate;
    apply(root);
    root.addEventListener("click", event => {
      const action = event.target.closest?.(
        "[data-open-pipeline-calendar], .pipeline-module__action--calendar",
      );
      if (!action || !root.contains(action)) return;
      event.preventDefault();
      openWorkspace(action);
    });
    rootObserver = new MutationObserver(() => apply(root));
    rootObserver.observe(root, { childList: true, subtree: true });
  };

  connectRoot(root);
  if (!root) {
    documentObserver = new MutationObserver(() => {
      const candidate = documentRef.querySelector(ROOT_SELECTOR);
      if (!candidate) return;
      connectRoot(candidate);
      documentObserver.disconnect();
    });
    documentObserver.observe(documentRef.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  const authority = Object.freeze({
    installed: true,
    reapply() {
      const candidate = documentRef.querySelector(ROOT_SELECTOR);
      if (candidate) connectRoot(candidate);
      if (root) apply(root);
    },
    close: closeWorkspace,
    destroy() {
      closeWorkspace({ restoreFocus: false });
      rootObserver?.disconnect();
      documentObserver?.disconnect();
      root?.removeAttribute("data-pipeline-google-calendar");
      documentRef.documentElement.removeAttribute("data-pipeline-google-calendar");
    },
  });

  if (root) root[INSTALL_KEY] = authority;
  return authority;
}

installPipelineGoogleCalendar();

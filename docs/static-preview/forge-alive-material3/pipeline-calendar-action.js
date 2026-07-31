const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const BUTTON_SELECTOR = ".pipeline-module__action--calendar";
const WORKSPACE_SELECTOR = "[data-pipeline-calendar-workspace]";
const STYLE_SELECTOR = "[data-pipeline-calendar-action-styles]";
const PIPELINE_STATE_KEY = Symbol.for("forge.material3.pipeline.state");
const INSTALL_KEY = Symbol.for("forge.material3.pipeline.calendar-action");
const DEFAULT_TIMEZONE = "America/Mexico_City";
const DURATION_OPTIONS = new Set([30, 45, 60, 90]);

function calendarError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseWallClock(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
    throw calendarError("GOOGLE_CALENDAR_DATE_REQUIRED");
  }
  if (!/^\d{2}:\d{2}$/.test(String(time || ""))) {
    throw calendarError("GOOGLE_CALENDAR_TIME_REQUIRED");
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const timestamp = Date.UTC(year, month - 1, day, hour, minute, 0);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
    || parsed.getUTCHours() !== hour
    || parsed.getUTCMinutes() !== minute
  ) {
    throw calendarError("GOOGLE_CALENDAR_DATE_TIME_INVALID");
  }

  return timestamp;
}

function compactWallClock(timestamp) {
  const value = new Date(timestamp);
  return `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(value.getUTCDate())}T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}00`;
}

function validEmail(value) {
  const email = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function buildGoogleCalendarTemplateUrl(input = {}) {
  const title = String(input.title || "").trim();
  if (!title) throw calendarError("GOOGLE_CALENDAR_TITLE_REQUIRED");

  const durationMinutes = Number(input.durationMinutes);
  if (!DURATION_OPTIONS.has(durationMinutes)) {
    throw calendarError("GOOGLE_CALENDAR_DURATION_INVALID");
  }

  const start = parseWallClock(input.date, input.time);
  const end = start + durationMinutes * 60_000;
  const timezone = String(input.timezone || DEFAULT_TIMEZONE).trim();
  if (!timezone) throw calendarError("GOOGLE_CALENDAR_TIMEZONE_REQUIRED");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${compactWallClock(start)}/${compactWallClock(end)}`,
    ctz: timezone,
  });

  const details = String(input.details || "").trim();
  const location = String(input.location || "").trim();
  const attendee = validEmail(input.attendee);
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  if (attendee) params.append("add", attendee);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function zonedSlot(now = new Date(), timezone = DEFAULT_TIMEZONE) {
  const interval = 15 * 60_000;
  const rounded = new Date(Math.ceil((now.getTime() + 45 * 60_000) / interval) * interval);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(rounded)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value]),
  );
  return Object.freeze({
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function ensureStyles(documentRef) {
  if (documentRef.querySelector(STYLE_SELECTOR)) return;
  const link = documentRef.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./pipeline-calendar-action.css?v=pipeline-calendar-action-001",
    import.meta.url,
  );
  link.dataset.pipelineCalendarActionStyles = "true";
  documentRef.head.append(link);
}

function fallbackCard(button) {
  const article = button.closest(CARD_SELECTOR);
  return Object.freeze({
    id: article?.dataset.productiveProspectCard || "",
    fullName: article?.querySelector("[data-productive-card-identity] strong")?.textContent?.trim() || "Prospecto",
    stageLabel: article?.querySelector("[data-productive-stage-label]")?.textContent?.trim() || "Estado pendiente",
    sourceSummary: article?.querySelector("[data-productive-source-label]")?.textContent?.trim() || "Fuente no disponible",
    phone: null,
    prospect: null,
  });
}

function cardForButton(root, button) {
  const prospectId = button.closest(CARD_SELECTOR)?.dataset.productiveProspectCard;
  const api = root[PIPELINE_STATE_KEY];
  return api?.getProductiveCard?.(prospectId) || fallbackCard(button);
}

function calendarDescription(card) {
  return [
    "Cita preparada desde ForgeOS.",
    `Prospecto: ${card.fullName}`,
    `Estado: ${card.stageLabel || "Pendiente"}`,
    `Fuente: ${card.sourceSummary || "No disponible"}`,
    card.phone ? `Teléfono: ${card.phone}` : null,
    "",
    "Revisa los datos antes de guardar el evento en Google Calendar.",
  ].filter(value => value !== null).join("\n");
}

function enableButtons(root) {
  root.querySelectorAll(BUTTON_SELECTOR).forEach(button => {
    const name = button.closest(CARD_SELECTOR)
      ?.querySelector("[data-productive-card-identity] strong")
      ?.textContent
      ?.trim() || "este prospecto";
    button.disabled = false;
    button.removeAttribute("disabled");
    button.removeAttribute("aria-disabled");
    button.removeAttribute("data-calendar-not-connected");
    button.dataset.openProductiveCalendar = button.closest(CARD_SELECTOR)?.dataset.productiveProspectCard || "";
    button.title = "Agendar en Google Calendar";
    button.setAttribute("aria-label", `Agendar en Google Calendar para ${name}`);
  });
  root.dataset.pipelineCalendarAction = "ready";
  root.ownerDocument.documentElement.dataset.pipelineCalendarAction = "ready";
}

function workspaceTemplate(card, defaults) {
  const attendee = validEmail(card.prospect?.email);
  return `
    <div class="pipeline-calendar-layer" data-pipeline-calendar-workspace>
      <button class="pipeline-calendar-layer__scrim" type="button" data-close-pipeline-calendar aria-label="Cerrar agenda"></button>
      <section class="pipeline-calendar-sheet" role="dialog" aria-modal="true" aria-labelledby="pipeline-calendar-title" tabindex="-1">
        <header class="pipeline-calendar-sheet__header">
          <div>
            <p>AGENDA · GOOGLE CALENDAR</p>
            <h2 id="pipeline-calendar-title">Cita con ${escapeHtml(card.fullName)}</h2>
            <span>ForgeOS prepara el evento; tú revisas y confirmas el guardado en Google.</span>
          </div>
          <button class="pipeline-calendar-sheet__close" type="button" data-close-pipeline-calendar aria-label="Cerrar">×</button>
        </header>
        <div class="pipeline-calendar-sheet__body">
          <div class="pipeline-calendar-fields">
            <label>
              <span>Fecha</span>
              <input type="date" value="${defaults.date}" min="${defaults.date}" data-pipeline-calendar-date required>
            </label>
            <label>
              <span>Hora</span>
              <input type="time" value="${defaults.time}" step="900" data-pipeline-calendar-time required>
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
              <input type="text" value="${DEFAULT_TIMEZONE}" data-pipeline-calendar-timezone readonly>
            </label>
            <label class="pipeline-calendar-fields__wide">
              <span>Lugar o enlace <small>opcional</small></span>
              <input type="text" placeholder="Oficina, Google Meet o dirección" data-pipeline-calendar-location>
            </label>
          </div>
          ${attendee ? `<label class="pipeline-calendar-invite"><input type="checkbox" data-pipeline-calendar-invite><span>Invitar a ${escapeHtml(attendee)} cuando guardes el evento</span></label>` : ""}
          <div class="pipeline-calendar-preview" aria-live="polite">
            <strong data-pipeline-calendar-preview>Preparando evento…</strong>
            <span>Google Calendar se abrirá en otra pestaña.</span>
          </div>
          <p class="pipeline-calendar-error" data-pipeline-calendar-error role="alert" hidden></p>
        </div>
        <footer class="pipeline-calendar-sheet__footer">
          <button type="button" class="pipeline-calendar-secondary" data-close-pipeline-calendar>Cancelar</button>
          <a class="pipeline-calendar-primary" data-open-google-calendar target="_blank" rel="noopener noreferrer">Abrir Google Calendar</a>
        </footer>
      </section>
    </div>`;
}

function openWorkspace(root, card, trigger) {
  const documentRef = root.ownerDocument;
  documentRef.querySelector(WORKSPACE_SELECTOR)?.remove();
  const defaults = zonedSlot(new Date(), DEFAULT_TIMEZONE);
  documentRef.body.insertAdjacentHTML("beforeend", workspaceTemplate(card, defaults));
  const layer = documentRef.querySelector(WORKSPACE_SELECTOR);
  const sheet = layer.querySelector(".pipeline-calendar-sheet");
  const previousOverflow = documentRef.body.style.overflow;
  documentRef.body.style.overflow = "hidden";
  documentRef.documentElement.dataset.pipelineCalendarOpen = "true";

  const close = () => {
    documentRef.removeEventListener("keydown", onKeydown);
    layer.remove();
    documentRef.body.style.overflow = previousOverflow;
    delete documentRef.documentElement.dataset.pipelineCalendarOpen;
    trigger?.focus?.();
  };

  const sync = () => {
    const date = layer.querySelector("[data-pipeline-calendar-date]").value;
    const time = layer.querySelector("[data-pipeline-calendar-time]").value;
    const durationMinutes = Number(layer.querySelector("[data-pipeline-calendar-duration]").value);
    const timezone = layer.querySelector("[data-pipeline-calendar-timezone]").value;
    const location = layer.querySelector("[data-pipeline-calendar-location]").value;
    const invite = layer.querySelector("[data-pipeline-calendar-invite]")?.checked;
    const link = layer.querySelector("[data-open-google-calendar]");
    const preview = layer.querySelector("[data-pipeline-calendar-preview]");
    const errorNode = layer.querySelector("[data-pipeline-calendar-error]");

    try {
      link.href = buildGoogleCalendarTemplateUrl({
        title: `Cita con ${card.fullName}`,
        date,
        time,
        durationMinutes,
        timezone,
        location,
        details: calendarDescription(card),
        attendee: invite ? card.prospect?.email : "",
      });
      link.classList.remove("is-disabled");
      link.removeAttribute("aria-disabled");
      preview.textContent = `${date} · ${time} · ${durationMinutes} min`;
      errorNode.hidden = true;
      errorNode.textContent = "";
    } catch {
      link.removeAttribute("href");
      link.classList.add("is-disabled");
      link.setAttribute("aria-disabled", "true");
      preview.textContent = "Completa una fecha y hora válidas.";
      errorNode.textContent = "Revisa los datos del evento antes de continuar.";
      errorNode.hidden = false;
    }
  };

  const onKeydown = event => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...sheet.querySelectorAll("button,[href],input,select")]
      .filter(node => !node.disabled && node.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && documentRef.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && documentRef.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  layer.addEventListener("click", event => {
    if (event.target.closest("[data-close-pipeline-calendar]")) {
      event.preventDefault();
      close();
      return;
    }
    const link = event.target.closest("[data-open-google-calendar]");
    if (link?.getAttribute("aria-disabled") === "true") event.preventDefault();
  });
  layer.addEventListener("input", sync);
  layer.addEventListener("change", sync);
  documentRef.addEventListener("keydown", onKeydown);
  sync();
  requestAnimationFrame(() => layer.querySelector("[data-pipeline-calendar-date]")?.focus());
}

export function installPipelineCalendarAction(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  if (!documentRef) return Object.freeze({ installed: false });
  ensureStyles(documentRef);

  const root = documentRef.querySelector(ROOT_SELECTOR);
  if (!root) return Object.freeze({ installed: false });
  if (root[INSTALL_KEY]) return root[INSTALL_KEY];

  const onClick = event => {
    const button = event.target.closest(BUTTON_SELECTOR);
    if (!button || !root.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    openWorkspace(root, cardForButton(root, button), button);
  };
  root.addEventListener("click", onClick, true);

  const observer = new MutationObserver(() => enableButtons(root));
  observer.observe(root, { childList: true, subtree: true });
  enableButtons(root);

  const authority = Object.freeze({
    installed: true,
    reapply() {
      enableButtons(root);
    },
    destroy() {
      observer.disconnect();
      root.removeEventListener("click", onClick, true);
      documentRef.querySelector(WORKSPACE_SELECTOR)?.remove();
      root.removeAttribute("data-pipeline-calendar-action");
      documentRef.documentElement.removeAttribute("data-pipeline-calendar-action");
    },
  });
  root[INSTALL_KEY] = authority;
  return authority;
}

installPipelineCalendarAction();

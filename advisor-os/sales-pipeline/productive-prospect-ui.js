"use strict";

(function forgeProductiveProspectUI067G17B(global) {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

  const SOURCES = [
    "Referido",
    "Precontrato",
    "Proyecto 200",
    "Mercado natural",
    "Redes sociales",
    "Cliente existente",
    "Evento",
    "Otro",
  ];

  const LABELS = {
    referred_new: "Referido",
    contacted: "Contactado",
    appointment_scheduled: "Cita",
    proposal: "Solicitud",
    decision: "Firma",
    client: "Cerrado",
  };

  const STATUS_OPTIONS = Object.freeze(Object.entries(LABELS).map(([value, label]) => Object.freeze({ value, label })));
  const MESSAGE_GOALS = Object.freeze([
    ["first_contact", "Primer contacto"],
    ["follow_up", "Seguimiento"],
    ["reactivation", "Reactivación"],
    ["appointment_confirmation", "Confirmar cita"],
    ["reschedule", "Reagendar"],
    ["after_call", "Después de llamada"],
  ]);
  const MESSAGE_STYLES = Object.freeze([
    ["friendly", "Amigable"],
    ["professional", "Profesional"],
    ["executive", "Ejecutivo"],
    ["brief", "Breve"],
    ["social", "Redes sociales"],
  ]);

  const DRAFT_VALIDATION_DECISIONS = Object.freeze({
    ALLOW_WHATSAPP: "ALLOW_WHATSAPP",
    BLOCK_WHATSAPP: "BLOCK_WHATSAPP",
  });

  const DRAFT_APPROVAL_DECISIONS = Object.freeze({
    EXACT_DRAFT_APPROVED: "EXACT_DRAFT_APPROVED",
    BLOCK_WHATSAPP: "BLOCK_WHATSAPP",
  });

  const DRAFT_VALIDATION_RULES = Object.freeze([
    {
      code: "EXCLUDED_FIELD_PRESENT",
      patterns: [/\badvisorid\b/i, /\bprospectid\b/i, /\bcandidateid\b/i, /\bnasat\b/i, /\bprivate motivation\b/i, /\bmotivacion privada\b/i, /\bingreso estimado\b/i],
    },
    {
      code: "PROHIBITED_CLAIM_PRESENT",
      patterns: [/\bcubre todo\b/i, /\bgarantizad[oa]\b/i, /\bmejor seguro\b/i, /\bproducto perfecto\b/i, /\b100%\s*seguro\b/i],
    },
    {
      code: "INVENTED_COMMITMENT_PRESENT",
      patterns: [/\bme confirmaste\b/i, /\bquedamos\b/i, /\bte prometo\b/i, /\bya agende\b/i, /\bcita confirmada\b/i],
    },
    {
      code: "INVENTED_CONSENT_PRESENT",
      patterns: [/\bme autorizaste\b/i, /\bcon tu consentimiento\b/i, /\baceptaste que te contacte\b/i, /\btenemos tu permiso\b/i],
    },
    {
      code: "INVENTED_URGENCY_PRESENT",
      patterns: [/\bsolo hoy\b/i, /\bultima oportunidad\b/i, /\bahora o nunca\b/i, /\bse acaba hoy\b/i, /\burgente sin falta\b/i],
    },
    {
      code: "PROHIBITED_REFERRAL_WORDING_PRESENT",
      patterns: [/\bme dieron tus datos\b/i, /\bte paso conmigo\b/i, /\bme dijo que necesitas\b/i, /\bme pidio que te vendiera\b/i],
    },
    {
      code: "UNVERIFIED_RELATIONSHIP_CLAIM_PRESENT",
      patterns: [/\bsoy tu asesor\b/i],
    },
  ]);

  const field = (name, label, type = "text", extra = "") =>
    `<label>${esc(label)}<input name="${esc(name)}" type="${type}" ${extra}></label>`;

  function formTemplate(prospect = {}) {
    const value = name => esc(prospect[name] ?? "");
    return `<div class="forge-prospect-modal-backdrop" data-prospect-form-modal data-prospect-id="${esc(prospect.id || "")}"><section class="forge-prospect-dialog forge-prospect-create-modal" role="dialog" aria-modal="true" aria-labelledby="prospect-form-title" tabindex="-1"><form data-prospect-form novalidate><header><div><p class="forge-pipeline-product">PROSPECTO PRODUCTIVO</p><h2 id="prospect-form-title">${prospect.id ? "Editar prospecto" : "Agregar prospecto"}</h2></div><button type="button" data-close-prospect-form aria-label="Cerrar">×</button></header><div class="forge-prospect-form-scroll" data-prospect-form-scroll><div class="forge-prospect-form-grid">${field("fullName", "Nombre completo *", "text", `required value="${value("fullName")}"`)}${field("phone", "Teléfono", "tel", `value="${value("phone")}"`)}${field("whatsapp", "WhatsApp", "tel", `value="${value("whatsapp")}"`)}${field("email", "Correo", "email", `value="${value("email")}"`)}<label>Fuente *<select name="source" required><option value="">Selecciona una fuente</option>${SOURCES.map(source => `<option ${prospect.source === source ? "selected" : ""}>${esc(source)}</option>`).join("")}</select></label><div class="forge-prospect-referral" data-referral-fields>${field("referrerName", "Referido por", "text", `value="${value("referrerName")}"`)}${field("referrerRelationship", "Relación con el referente", "text", `value="${value("referrerRelationship")}"`)}</div>${field("dateOfBirth", "Fecha de nacimiento", "date", `value="${value("dateOfBirth")}"`)}${field("age", "Edad", "number", `min="0" max="130" value="${value("age")}"`)}${field("maritalStatus", "Estado civil", "text", `value="${value("maritalStatus")}"`)}${field("dependents", "Dependientes", "number", `min="0" value="${value("dependents")}"`)}${field("occupation", "Ocupación", "text", `value="${value("occupation")}"`)}${field("estimatedIncome", "Ingreso estimado", "number", `min="0" step="0.01" value="${value("estimatedIncome")}"`)}${field("productsOfInterest", "Productos de interés", "text", `value="${value("productsOfInterest")}"`)}<label class="forge-prospect-wide">Contexto inicial *<textarea name="initialContext" required>${value("initialContext")}</textarea></label>${field("nextActionType", "Próxima acción", "text", `value="${value("nextActionType")}"`)}${field("nextActionAt", "Fecha de próxima acción", "datetime-local", `value="${value("nextActionAt")}"`)}</div><p class="forge-prospect-form-error" data-prospect-form-error role="alert" hidden></p></div><footer><button type="button" data-close-prospect-form>Cancelar</button><button type="submit" class="forge-pipeline-primary" data-save-prospect>${prospect.id ? "Guardar cambios" : "Guardar prospecto"}</button></footer></form></section></div>`;
  }

  function detailTemplate(prospect) {
    const row = (label, value) => value !== null && value !== undefined && value !== ""
      ? `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`
      : "";
    const phone = contactPhone(prospect, "call");
    const whatsapp = contactPhone(prospect, "whatsapp");
    const primary = `${row("Teléfono", phone)}${row("WhatsApp", whatsapp)}${row("Referido por", prospect.referrerName || "Sin referente")}${row("Etapa", LABELS[prospect.status] || prospect.status)}`;
    const secondary = `${row("Correo", prospect.email)}${row("Fuente", prospect.source)}${row("Relación", prospect.referrerRelationship)}${row("Fecha de nacimiento", prospect.dateOfBirth)}${row("Edad", prospect.age)}${row("Estado civil", prospect.maritalStatus)}${row("Dependientes", prospect.dependents)}${row("Ocupación", prospect.occupation)}${row("Ingreso estimado", prospect.estimatedIncome)}${row("Productos de interés", Array.isArray(prospect.productsOfInterest) ? prospect.productsOfInterest.join(", ") : prospect.productsOfInterest)}${row("Contexto inicial", prospect.initialContext)}${row("Próxima acción", prospect.nextActionType)}${row("Seguimiento", humanDate(prospect.nextActionAt))}${row("Creado", humanDate(prospect.createdAt))}`;
    return `<dialog class="forge-prospect-dialog forge-prospect-detail-dialog" data-prospect-detail-dialog aria-labelledby="prospect-detail-title"><article><header><div><p class="forge-pipeline-product">${esc(LABELS[prospect.status] || prospect.status)}</p><h2 id="prospect-detail-title">${esc(prospect.fullName)}</h2></div><button type="button" data-close-prospect-detail aria-label="Cerrar detalle">×</button></header><dl class="forge-prospect-detail-list forge-prospect-detail-list--primary">${primary}</dl><div class="forge-prospect-detail-actions"><a class="forge-card-action forge-card-action--call ${phone ? "" : "is-disabled"}" ${phone ? `href="tel:${esc(phone)}"` : "aria-disabled=\"true\""}>Llamar</a><button type="button" class="forge-card-action forge-card-action--whatsapp" data-detail-whatsapp ${whatsapp ? "" : "disabled"}>WhatsApp</button><button type="button" class="forge-card-action forge-card-action--calendar" data-detail-calendar>Agendar</button></div><details class="forge-prospect-secondary"><summary>Más información</summary><dl class="forge-prospect-detail-list">${secondary}</dl></details><footer><button type="button" data-edit-prospect>Editar</button><button type="button" data-archive-prospect>Retirar</button></footer></article></dialog>`;
  }

  function contactPhone(prospect = {}, channel = "call") {
    const values = channel === "whatsapp"
      ? [prospect.whatsapp, prospect.whatsappNormalized, prospect.phone, prospect.phoneNormalized]
      : [prospect.phone, prospect.phoneNormalized, prospect.whatsapp, prospect.whatsappNormalized];
    for (const value of values) {
      const raw = String(value || "").trim();
      const digits = raw.replace(/\D/g, "");
      if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
    }
    return null;
  }

  function humanDate(value, now = Date.now()) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const difference = now - date.getTime();
    if (difference >= 0 && difference < 60 * 60 * 1000) return `Hace ${Math.max(1, Math.floor(difference / 60000))} min`;
    if (difference >= 0 && difference < 24 * 60 * 60 * 1000) return `Hace ${Math.floor(difference / 3600000)} h`;
    if (difference >= 0 && difference < 7 * 24 * 60 * 60 * 1000) return `Hace ${Math.floor(difference / 86400000)} días`;
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(date).replace(" de ", " ").replace(" de ", " ");
  }

  function draftCandidate(prospect, style = "professional", goal = "first_contact", variation = 0) {
    const name = String(prospect?.fullName || "").trim();
    const goalCopy = {
      first_contact: "Me gustaría presentarme y conversar contigo.",
      follow_up: "Quisiera retomar nuestra conversación cuando te resulte conveniente.",
      reactivation: "Espero que estés muy bien. ¿Te gustaría retomar la conversación?",
      appointment_confirmation: "¿Te gustaría confirmar nuestra próxima conversación?",
      reschedule: "¿Te gustaría que coordinemos otro momento para conversar?",
      after_call: "Gracias por la conversación. Quedo atento a cómo prefieras continuar.",
    };
    const suffix = style === "brief" ? "" : style === "friendly" ? " Será un gusto saludarte." : style === "social" ? " Cuando puedas, escríbeme por aquí." : style === "executive" ? " Quedo atento para coordinar el siguiente paso." : " Quedo atento a tu respuesta.";
    return Object.freeze({
      rawText: name ? `Hola, ${name}. ${goalCopy[goal] || goalCopy.first_contact}${suffix}` : "",
      sendsMessage: false,
      sourceMutable: false,
      generationMode: "deterministic_fallback",
      variation,
    });
  }

  function whatsappUrl(prospect, style, editedText, goal = "first_contact") {
    const phone = contactPhone(prospect, "whatsapp");
    const text = editedText ?? draftCandidate(prospect, style, goal).rawText;
    return phone && text ? `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(text)}` : null;
  }

  function draftSafetyValidator({ draftText = "", draftCandidateSnapshot = null, humanApproval = null } = {}) {
    const text = String(draftText ?? "");
    const errors = [];
    for (const rule of DRAFT_VALIDATION_RULES) {
      if (rule.patterns.some(pattern => pattern.test(text))) {
        errors.push({ code: rule.code, severity: "BLOCKING", action: DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP });
      }
    }
    if (!draftCandidateSnapshot || draftCandidateSnapshot.sendsMessage !== false) {
      errors.push({ code: "DRAFT_CANDIDATE_RULES_UNSATISFIED", severity: "BLOCKING", action: DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP });
    }
    if (!humanApproval || humanApproval.required !== true || humanApproval.finalAuthority !== "HUMAN") {
      errors.push({ code: "HUMAN_APPROVAL_PATH_NOT_PRESERVED", severity: "BLOCKING", action: DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP });
    }

    return Object.freeze({
      validatorId: "FORGE_DRAFT_SAFETY_VALIDATOR_067G17N10_V1",
      decision: errors.length ? DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP : DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP,
      errors: Object.freeze(errors),
      rewritesDraft: false,
      generatesDraft: false,
      mutatesDraftCandidate: false,
      mutatesPipeline: false,
      callsAi: false,
      humanApprovalRequired: true,
    });
  }

  function approveExactDraft({ draftText = "", validationResult = null } = {}) {
    const text = String(draftText ?? "");
    const errors = [];
    if (text.length === 0) errors.push({ code: "EMPTY_DRAFT_CANNOT_BE_APPROVED", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    if (!validationResult || validationResult.decision !== DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP) {
      errors.push({ code: "VALIDATION_REQUIRED_BEFORE_APPROVAL", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    }
    return Object.freeze({
      decision: errors.length ? DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP : DRAFT_APPROVAL_DECISIONS.EXACT_DRAFT_APPROVED,
      exactDraftApproved: errors.length === 0,
      approvedDraftText: errors.length === 0 ? text : null,
      errors: Object.freeze(errors),
      persistsApproval: false,
      mutatesPipeline: false,
      mutatesProspect: false,
    });
  }

  function exactDraftHumanApprovalGate({ draftText = "", validationResult = null, approvalSnapshot = null } = {}) {
    const text = String(draftText ?? "");
    const errors = [];
    if (!validationResult || validationResult.decision !== DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP) {
      errors.push({ code: "VALIDATION_REQUIRED", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    }
    if (!approvalSnapshot || approvalSnapshot.exactDraftApproved !== true || approvalSnapshot.approvedDraftText !== text) {
      errors.push({ code: "EXACT_DRAFT_APPROVAL_REQUIRED", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    }
    return Object.freeze({
      decision: errors.length ? DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP : DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP,
      validationPass: Boolean(validationResult && validationResult.decision === DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP),
      exactDraftApproved: errors.length === 0,
      errors: Object.freeze(errors),
      manualNavigationRequired: true,
      persistsApproval: false,
      mutatesPipeline: false,
      mutatesProspect: false,
    });
  }

  function toModel(prospects) {
    const groups = new Map();
    for (const prospect of prospects) {
      const status = prospect.status || "referred_new";
      if (!groups.has(status)) groups.set(status, []);
      const phone = contactPhone(prospect, "call");
      const whatsapp = contactPhone(prospect, "whatsapp");
      const appointmentLabel = prospect.nextActionAt
        ? `${prospect.status === "appointment_scheduled" ? "Cita" : "Seguimiento"} · ${humanDate(prospect.nextActionAt)}`
        : "Sin cita";
      groups.get(status).push({
        prospectId: prospect.id,
        name: prospect.fullName,
        sourceLabel: prospect.source || "Fuente verificada",
        stageLabel: LABELS[status] || status,
        status,
        statusOptions: STATUS_OPTIONS,
        phoneHref: phone ? `tel:${phone}` : null,
        phoneLabel: phone || "Sin teléfono",
        whatsappAvailable: Boolean(whatsapp),
        referrerLabel: prospect.referrerName ? `Referido por ${prospect.referrerName}` : "Sin referente",
        appointmentLabel,
      });
    }
    return {
      state: prospects.length ? "ready" : "empty",
      message: "Todavía no tienes prospectos. Agrega el primero para comenzar tu Pipeline.",
      writerAvailable: true,
      columns: STATUS_OPTIONS.map(option => ({ columnId: option.value, label: option.label, items: groups.get(option.value) || [] }))
        .filter(column => column.items.length),
    };
  }

  function values(form) {
    const data = Object.fromEntries(new FormData(form));
    for (const key of ["age", "dependents", "estimatedIncome"]) {
      if (data[key] !== "") data[key] = Number(data[key]);
      else delete data[key];
    }
    for (const [key, value] of Object.entries(data)) if (value === "") delete data[key];
    return data;
  }

  function messageWorkspaceTemplate(prospect) {
    const hasAppointment = prospect.status === "appointment_scheduled" || Boolean(prospect.nextActionAt);
    const afterCallAvailable = ["contacted", "appointment_scheduled", "proposal", "decision", "client"].includes(prospect.status);
    const goalOptions = MESSAGE_GOALS.map(([value, label]) => {
      const disabled = (["appointment_confirmation", "reschedule"].includes(value) && !hasAppointment) || (value === "after_call" && !afterCallAvailable);
      return `<option value="${value}" ${disabled ? "disabled" : ""}>${esc(label)}${disabled ? " · requiere evidencia" : ""}</option>`;
    }).join("");
    const styleOptions = MESSAGE_STYLES.map(([value, label]) => `<option value="${value}" ${value === "professional" ? "selected" : ""}>${esc(label)}</option>`).join("");
    return `<aside class="forge-action-workspace forge-message-workspace" data-action-workspace data-workspace-type="whatsapp" aria-labelledby="forge-message-workspace-title"><header><div><p class="forge-pipeline-product">NASH · BORRADOR</p><h2 id="forge-message-workspace-title">Mensaje para ${esc(prospect.fullName)}</h2><p>Forge prepara. Tú revisas y decides si abres WhatsApp.</p></div><button type="button" data-close-action-workspace aria-label="Cerrar preparación">×</button></header><div class="forge-message-controls"><label>Objetivo<select data-message-goal>${goalOptions}</select></label><label>Estilo<select data-message-style>${styleOptions}</select></label></div><div class="forge-message-chat" aria-live="polite"><div class="forge-message-avatar" aria-hidden="true">F</div><div class="forge-message-bubble"><div class="forge-message-loading" data-message-loading><span></span><span></span><span></span><em>Preparando sugerencia…</em></div><p data-message-preview hidden></p><textarea data-message-editor aria-label="Editar mensaje" hidden></textarea><p class="forge-message-error" data-message-error role="status" hidden></p></div></div><div class="forge-message-meta"><span data-message-source>Generando con NASH</span><span>Sin envío automático</span></div><footer><button type="button" class="forge-workspace-secondary" data-edit-message disabled>✏️ Editar</button><button type="button" class="forge-workspace-secondary" data-regenerate-message disabled>↻ Otra sugerencia</button><a class="forge-workspace-primary is-disabled" data-open-whatsapp aria-disabled="true" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a></footer></aside>`;
  }

  function calendarWorkspaceTemplate(prospect) {
    return `<aside class="forge-action-workspace forge-calendar-workspace" data-action-workspace data-workspace-type="calendar" aria-labelledby="forge-calendar-workspace-title"><header><div><p class="forge-pipeline-product">AGENDA</p><h2 id="forge-calendar-workspace-title">Cita con ${esc(prospect.fullName)}</h2><p>Define fecha y hora antes de abrir Google Calendar.</p></div><button type="button" data-close-action-workspace aria-label="Cerrar agenda">×</button></header><div class="forge-calendar-fields"><label>Fecha<input type="date" data-calendar-date required></label><label>Hora<input type="time" data-calendar-time required></label><label>Duración<select data-calendar-duration><option value="30">30 min</option><option value="45" selected>45 min</option><option value="60">60 min</option></select></label><label>Zona horaria<input value="America/Mexico_City" data-calendar-timezone readonly></label></div><p class="forge-calendar-preview" data-calendar-preview>Selecciona fecha y hora.</p><footer><a class="forge-workspace-primary is-disabled" data-open-calendar aria-disabled="true" target="_blank" rel="noopener noreferrer">Abrir Google Calendar</a></footer></aside>`;
  }

  function deleteConfirmationTemplate(prospect) {
    return `<dialog class="forge-prospect-dialog forge-delete-confirmation" data-delete-confirmation aria-labelledby="delete-confirmation-title" aria-describedby="delete-confirmation-body"><article><header><div><p class="forge-pipeline-product">ACCIÓN DESTRUCTIVA</p><h2 id="delete-confirmation-title">¿Eliminar este prospecto?</h2></div><button type="button" data-cancel-delete aria-label="Cerrar confirmación">×</button></header><p id="delete-confirmation-body">Se retirará a ${esc(prospect.fullName)} del Pipeline. Su historial se conservará.</p><footer><button type="button" data-cancel-delete>Cancelar</button><button type="button" class="forge-delete-confirm" data-confirm-delete>Eliminar</button></footer></article></dialog>`;
  }

  function create({ client, root, renderPipeline = global.ForgePipelineUI?.renderPipelineUI }) {
    if (!client || !root || typeof renderPipeline !== "function") throw new Error("PRODUCTIVE_PIPELINE_DEPENDENCY_MISSING");

    root.__forgeProductiveProspectCreateAbort067G17B?.abort();
    const controller = new AbortController();
    root.__forgeProductiveProspectCreateAbort067G17B = controller;

    const service = global.ForgeProductiveProspectService067G17B.create(client);
    let prospects = [];
    let selected = null;
    let submitting = false;
    let openCreateCount = 0;
    let createTrigger = null;
    let restoreBodyOverflow = "";
    let actionProspect = null;
    let actionTrigger = null;
    let draftRequestId = 0;
    let draftVariation = 0;
    let currentDraftCandidate = null;
    let menuTrigger = null;
    let deleteProspect = null;
    let deleteTrigger = null;

    function render(model = toModel(prospects)) {
      root.innerHTML = renderPipeline(model);
      const pipeline = root.querySelector(".forge-pipeline");
      if (pipeline) {
        pipeline.setAttribute("data-productive-prospect-pipeline", "067g17b");
        pipeline.setAttribute("data-productive-prospect-create-bound", "true");
      }
    }

    async function load() {
      render({ state: "loading", message: "Cargando tu Pipeline…", writerAvailable: false });
      try {
        prospects = await service.listProspects();
        render();
      } catch (error) {
        render(error.code === "AUTH_REQUIRED"
          ? {
              state: "error",
              message: "Inicia sesión para consultar tus prospectos y continuar trabajando.",
              writerAvailable: false,
              stateActions: [
                { label: "Iniciar sesión", className: "forge-pipeline-primary", attrs: { "data-forge-auth-open": "pipeline", "data-forge-auth-open-nav": "pipeline" } },
                { label: "Volver a Inicio", className: "forge-pipeline-action", attrs: { "data-forge-static-view": "inicio" } },
              ],
            }
          : { state: "error", message: "No pudimos cargar tus prospectos. Intenta nuevamente.", writerAvailable: false });
      }
    }

    function focusable(modal) {
      return [...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
        .filter(node => !node.disabled && !node.hidden && node.getClientRects().length);
    }

    function lockBackgroundScroll() {
      restoreBodyOverflow = global.document.body.style.overflow || "";
      global.document.documentElement.dataset.forgeProspectModalOpen = "true";
      global.document.body.style.overflow = "hidden";
    }

    function unlockBackgroundScroll() {
      delete global.document.documentElement.dataset.forgeProspectModalOpen;
      global.document.body.style.overflow = restoreBodyOverflow;
      restoreBodyOverflow = "";
    }

    function openProductiveProspectCreateModal(prospect = {}, trigger = global.document.activeElement) {
      const existing = global.document.querySelector("[data-prospect-form-modal]");
      if (existing) {
        existing.querySelector("[name=\"fullName\"]")?.focus();
        return existing;
      }

      createTrigger = global.HTMLElement && trigger instanceof global.HTMLElement ? trigger : null;
      global.document.body.insertAdjacentHTML("beforeend", formTemplate(prospect));
      const modal = global.document.querySelector("[data-prospect-form-modal]");
      const source = modal.querySelector("[name=\"source\"]");
      const syncReferral = () => {
        modal.querySelector("[data-referral-fields]").hidden = source.value !== "Referido";
      };
      source.addEventListener("change", syncReferral, { signal: controller.signal });
      modal.addEventListener("click", event => {
        if (event.target === modal) {
          event.preventDefault();
          return;
        }
        if (event.target.closest("[data-close-prospect-form]")) {
          event.preventDefault();
          closeForm();
        }
      }, { signal: controller.signal });
      modal.addEventListener("input", event => {
        event.target.closest("[data-prospect-form]")?.setAttribute("data-dirty", "true");
      }, { signal: controller.signal });
      modal.addEventListener("submit", event => {
        if (!event.target.matches("[data-prospect-form]")) return;
        event.preventDefault();
        void submit(event.target);
      }, { signal: controller.signal });
      modal.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeForm();
          return;
        }
        if (event.key !== "Tab") return;
        const nodes = focusable(modal);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && global.document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && global.document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }, { signal: controller.signal });
      syncReferral();
      openCreateCount += 1;
      lockBackgroundScroll();
      global.document.body.dataset.forgeProspectCreateModalOpen = "true";
      modal.querySelector("[name=\"fullName\"]")?.focus();
      return modal;
    }

    function closeForm() {
      const modal = global.document.querySelector("[data-prospect-form-modal]");
      if (!modal || submitting) return;
      const form = modal.querySelector("form");
      if (form?.dataset.dirty === "true" && !global.confirm("Hay cambios sin guardar. ¿Quieres cerrar?")) return;
      modal.remove();
      delete global.document.body.dataset.forgeProspectCreateModalOpen;
      unlockBackgroundScroll();
      createTrigger?.focus?.();
      createTrigger = null;
    }

    function openDetail(prospect) {
      selected = prospect;
      root.querySelector("[data-prospect-detail-dialog]")?.remove();
      root.insertAdjacentHTML("beforeend", detailTemplate(prospect));
      const dialog = root.querySelector("[data-prospect-detail-dialog]");
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    function closeActionWorkspace() {
      root.querySelector("[data-action-workspace]")?.remove();
      actionProspect = null;
      currentDraftCandidate = null;
      actionTrigger?.focus?.();
      actionTrigger = null;
    }

    function closeCardMenu({ restoreFocus = false } = {}) {
      const panel = root.querySelector("[data-card-menu-panel]:not([hidden])");
      if (!panel) return;
      panel.hidden = true;
      const trigger = root.querySelector(`[data-card-menu="${panel.dataset.cardMenuPanel}"]`);
      trigger?.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger?.focus();
      menuTrigger = null;
    }

    function toggleCardMenu(trigger) {
      const wasOpen = trigger.getAttribute("aria-expanded") === "true";
      closeCardMenu();
      if (wasOpen) return;
      const panel = root.querySelector(`[data-card-menu-panel="${trigger.dataset.cardMenu}"]`);
      if (!panel) return;
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      menuTrigger = trigger;
      panel.querySelector('[role="menuitem"]')?.focus();
    }

    function closeDeleteConfirmation({ restoreFocus = true } = {}) {
      const dialog = root.querySelector("[data-delete-confirmation]");
      dialog?.close?.();
      dialog?.remove();
      deleteProspect = null;
      if (restoreFocus) deleteTrigger?.focus?.();
      deleteTrigger = null;
    }

    function openDeleteConfirmation(prospect, trigger) {
      closeCardMenu();
      root.querySelector("[data-delete-confirmation]")?.remove();
      deleteProspect = prospect;
      deleteTrigger = trigger || null;
      root.insertAdjacentHTML("beforeend", deleteConfirmationTemplate(prospect));
      const dialog = root.querySelector("[data-delete-confirmation]");
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      dialog.querySelector("[data-cancel-delete]")?.focus();
    }

    function setMessageState({ loading = false, text = "", source = "", error = "" } = {}) {
      const workspace = root.querySelector('[data-workspace-type="whatsapp"]');
      if (!workspace) return;
      const loadingNode = workspace.querySelector("[data-message-loading]");
      const preview = workspace.querySelector("[data-message-preview]");
      const editor = workspace.querySelector("[data-message-editor]");
      const errorNode = workspace.querySelector("[data-message-error]");
      const edit = workspace.querySelector("[data-edit-message]");
      const regenerate = workspace.querySelector("[data-regenerate-message]");
      loadingNode.hidden = !loading;
      preview.hidden = loading || !text;
      preview.textContent = text;
      editor.hidden = true;
      editor.value = text;
      errorNode.hidden = !error;
      errorNode.textContent = error;
      workspace.querySelector("[data-message-source]").textContent = source || "NASH";
      edit.disabled = loading || !text;
      edit.textContent = "✏️ Editar";
      regenerate.disabled = loading;
      syncWhatsAppLink(text);
    }

    function syncWhatsAppLink(text) {
      const link = root.querySelector("[data-open-whatsapp]");
      if (!link || !actionProspect) return;
      const href = whatsappUrl(actionProspect, "professional", text || "");
      if (href && text) {
        link.href = href;
        link.classList.remove("is-disabled");
        link.removeAttribute("aria-disabled");
      } else {
        link.removeAttribute("href");
        link.classList.add("is-disabled");
        link.setAttribute("aria-disabled", "true");
      }
    }

    function messageContext(prospect, goal, style, variation) {
      const context = {
        contractType: "PROSPECT_MESSAGE_CONTEXT_UI_V1",
        displayName: prospect.fullName,
        allowedFields: ["displayName", "messageGoal", "communicationStyle"],
        messageGoal: goal,
        communicationStyle: style,
        variationRequest: variation,
      };
      if (prospect.nextActionAt && ["appointment_confirmation", "reschedule"].includes(goal)) {
        context.allowedFields.push("appointmentAt");
        context.appointmentAt = prospect.nextActionAt;
      }
      return context;
    }

    async function generateMessageDraft() {
      const workspace = root.querySelector('[data-workspace-type="whatsapp"]');
      if (!workspace || !actionProspect) return;
      const goal = workspace.querySelector("[data-message-goal]").value;
      const style = workspace.querySelector("[data-message-style]").value;
      const requestId = ++draftRequestId;
      currentDraftCandidate = null;
      setMessageState({ loading: true, source: "Generando con Gemini" });
      try {
        const invocation = client.functions?.invoke
          ? await client.functions.invoke("nash-draft-provider", {
              body: {
                providerId: "gemini",
                experimentalFeatureEnabled: true,
                prospectMessageContext: messageContext(actionProspect, goal, style, draftVariation),
              },
            })
          : { data: null, error: new Error("PROVIDER_CLIENT_UNAVAILABLE") };
        if (requestId !== draftRequestId || !workspace.isConnected) return;
        const envelope = invocation?.data;
        if (!invocation?.error && envelope?.resultState === "SUCCESS" && envelope.draftCandidate?.rawText) {
          currentDraftCandidate = envelope.draftCandidate;
          setMessageState({ text: envelope.draftCandidate.rawText, source: "Sugerencia experimental de Gemini" });
          return;
        }
        if (!invocation?.error && envelope?.resultState === "NO_DRAFT") {
          setMessageState({ error: "NASH no encontró contexto suficiente para preparar un mensaje.", source: "Sin sugerencia segura" });
          return;
        }
        currentDraftCandidate = draftCandidate(actionProspect, style, goal, draftVariation);
        setMessageState({ text: currentDraftCandidate.rawText, source: "Sugerencia determinística segura" });
      } catch (_error) {
        if (requestId !== draftRequestId || !workspace.isConnected) return;
        currentDraftCandidate = draftCandidate(actionProspect, style, goal, draftVariation);
        setMessageState({ text: currentDraftCandidate.rawText, source: "Sugerencia determinística segura" });
      }
    }

    function openActionWorkspace(prospect, type, trigger) {
      closeActionWorkspace();
      actionProspect = prospect;
      actionTrigger = trigger || null;
      draftVariation = 0;
      root.insertAdjacentHTML("beforeend", type === "calendar" ? calendarWorkspaceTemplate(prospect) : messageWorkspaceTemplate(prospect));
      const workspace = root.querySelector("[data-action-workspace]");
      workspace.querySelector("[data-close-action-workspace]")?.focus();
      if (type === "whatsapp") void generateMessageDraft();
    }

    function syncCalendarWorkspace() {
      const workspace = root.querySelector('[data-workspace-type="calendar"]');
      if (!workspace || !actionProspect) return;
      const date = workspace.querySelector("[data-calendar-date]").value;
      const time = workspace.querySelector("[data-calendar-time]").value;
      const duration = Number(workspace.querySelector("[data-calendar-duration]").value);
      const link = workspace.querySelector("[data-open-calendar]");
      const preview = workspace.querySelector("[data-calendar-preview]");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
        link.removeAttribute("href");
        link.classList.add("is-disabled");
        link.setAttribute("aria-disabled", "true");
        preview.textContent = "Selecciona fecha y hora.";
        return;
      }
      const start = new Date(`${date}T${time}:00`);
      if (Number.isNaN(start.getTime())) return;
      const end = new Date(start.getTime() + duration * 60000);
      const compact = value => `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, "0")}${String(value.getDate()).padStart(2, "0")}T${String(value.getHours()).padStart(2, "0")}${String(value.getMinutes()).padStart(2, "0")}00`;
      const params = new URLSearchParams({ action: "TEMPLATE", text: `Cita con ${actionProspect.fullName}`, dates: `${compact(start)}/${compact(end)}`, ctz: "America/Mexico_City", details: "Confirma los detalles antes de guardar." });
      link.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
      link.classList.remove("is-disabled");
      link.removeAttribute("aria-disabled");
      preview.textContent = `${humanDate(start.toISOString(), 0)} · ${time} · ${duration} min`;
    }

    async function updateStatus(select) {
      const prospect = prospects.find(item => item.id === select.dataset.prospectStatus);
      if (!prospect || prospect.status === select.value) return;
      const previous = prospect.status;
      const scrollTop = global.scrollY;
      select.disabled = true;
      try {
        const updated = await service.updateProspect(prospect.id, { status: select.value });
        prospects = prospects.map(item => item.id === prospect.id ? updated : item);
        render();
        (global.requestAnimationFrame || (callback => callback()))(() => global.scrollTo?.({ top: scrollTop, behavior: "instant" }));
      } catch (_error) {
        select.value = previous;
        select.disabled = false;
        select.setAttribute("aria-invalid", "true");
        select.title = "No pudimos actualizar la etapa.";
      }
    }

    function filterPipelineCards() {
      const pipeline = root.querySelector(".forge-pipeline");
      if (!pipeline) return;
      const search = pipeline.querySelector('[name="pipeline-search"]')?.value.trim().toLocaleLowerCase("es-MX") || "";
      const source = pipeline.querySelector('[name="source"]')?.value || "";
      const followup = pipeline.querySelector('[name="followup"]')?.value || "";
      pipeline.querySelectorAll(".forge-pipeline-card").forEach(card => {
        const prospect = prospects.find(item => item.id === card.dataset.prospectId);
        const searchable = `${prospect?.fullName || ""} ${contactPhone(prospect, "call") || ""}`.toLocaleLowerCase("es-MX");
        const matchesSearch = !search || searchable.includes(search);
        const matchesSource = !source || prospect?.source === source;
        const due = prospect?.nextActionAt ? new Date(prospect.nextActionAt).getTime() : null;
        const matchesFollowup = !followup || (followup === "Vencido" ? due && due < Date.now() : due && due >= Date.now());
        card.hidden = !(matchesSearch && matchesSource && matchesFollowup);
      });
      pipeline.querySelectorAll(".forge-pipeline-column").forEach(column => {
        column.hidden = !column.querySelector(".forge-pipeline-card:not([hidden])");
      });
    }

    async function submit(form) {
      if (submitting) return;
      const errorNode = form.querySelector("[data-prospect-form-error]");
      errorNode.hidden = true;
      if (!form.reportValidity()) return;
      const input = values(form);
      if (!input.phone && !input.whatsapp) {
        errorNode.textContent = "Ingresa teléfono o WhatsApp.";
        errorNode.hidden = false;
        return;
      }
      submitting = true;
      const save = form.querySelector("[data-save-prospect]");
      save.disabled = true;
      save.textContent = "Guardando…";
      try {
        const modal = form.closest("[data-prospect-form-modal]");
        const id = modal.dataset.prospectId;
        const prospect = id ? await service.updateProspect(id, input) : await service.createProspect(input);
        prospects = id ? prospects.map(item => item.id === id ? prospect : item) : [prospect, ...prospects];
        modal.remove();
        delete global.document.body.dataset.forgeProspectCreateModalOpen;
        unlockBackgroundScroll();
        createTrigger = null;
        render();
        openDetail(prospect);
      } catch (error) {
        errorNode.textContent = error.code === "DUPLICATE_PROSPECT"
          ? "Este prospecto ya existe en tu Pipeline."
          : error.code === "AUTH_REQUIRED"
            ? "Inicia sesión nuevamente para guardar este prospecto."
            : error.code === "VALIDATION_ERROR"
              ? "Revisa los campos marcados."
              : "No pudimos guardar el prospecto. Intenta nuevamente.";
        errorNode.hidden = false;
      } finally {
        submitting = false;
        if (save.isConnected) {
          save.disabled = false;
          save.textContent = form.closest("[data-prospect-form-modal]")?.dataset.prospectId ? "Guardar cambios" : "Guardar prospecto";
        }
      }
    }

    async function archive(prospect = deleteProspect || selected) {
      if (!prospect) return;
      await service.archiveProspect(prospect.id);
      prospects = prospects.filter(item => item.id !== prospect.id);
      root.querySelector("[data-prospect-detail-dialog]")?.remove();
      if (selected?.id === prospect.id) selected = null;
      closeDeleteConfirmation({ restoreFocus: false });
      render();
    }

    root.addEventListener("click", event => {
      const add = event.target.closest("[data-add-prospect]");
      const open = event.target.closest("[data-open-prospect]");
      const cardWhatsApp = event.target.closest("[data-card-whatsapp]");
      const cardCalendar = event.target.closest("[data-card-calendar]");
      const cardMenu = event.target.closest("[data-card-menu]");
      const cardEdit = event.target.closest("[data-card-edit]");
      const cardDelete = event.target.closest("[data-card-delete]");
      if (cardMenu) {
        event.preventDefault();
        toggleCardMenu(cardMenu);
        return;
      }
      if (cardEdit) {
        event.preventDefault();
        const prospect = prospects.find(item => item.id === cardEdit.dataset.cardEdit);
        if (prospect) {
          const trigger = menuTrigger;
          closeCardMenu();
          openProductiveProspectCreateModal(prospect, trigger);
        }
        return;
      }
      if (cardDelete) {
        event.preventDefault();
        const prospect = prospects.find(item => item.id === cardDelete.dataset.cardDelete);
        if (prospect) openDeleteConfirmation(prospect, menuTrigger);
        return;
      }
      if (event.target.closest("[data-cancel-delete]")) {
        event.preventDefault();
        closeDeleteConfirmation();
        return;
      }
      if (event.target.closest("[data-confirm-delete]")) {
        event.preventDefault();
        void archive();
        return;
      }
      if (add) {
        event.preventDefault();
        openProductiveProspectCreateModal({}, add);
        return;
      }
      if (open) {
        event.preventDefault();
        const prospect = prospects.find(item => item.id === open.dataset.openProspect);
        if (prospect) openDetail(prospect);
        return;
      }
      if (cardWhatsApp) {
        event.preventDefault();
        const prospect = prospects.find(item => item.id === cardWhatsApp.dataset.cardWhatsapp);
        if (prospect) openActionWorkspace(prospect, "whatsapp", cardWhatsApp);
        return;
      }
      if (cardCalendar) {
        event.preventDefault();
        const prospect = prospects.find(item => item.id === cardCalendar.dataset.cardCalendar);
        if (prospect) openActionWorkspace(prospect, "calendar", cardCalendar);
        return;
      }
      if (event.target.closest("[data-detail-whatsapp]") && selected) {
        event.preventDefault();
        root.querySelector("[data-prospect-detail-dialog]")?.close?.();
        root.querySelector("[data-prospect-detail-dialog]")?.remove();
        openActionWorkspace(selected, "whatsapp", event.target.closest("[data-detail-whatsapp]"));
        return;
      }
      if (event.target.closest("[data-detail-calendar]") && selected) {
        event.preventDefault();
        root.querySelector("[data-prospect-detail-dialog]")?.close?.();
        root.querySelector("[data-prospect-detail-dialog]")?.remove();
        openActionWorkspace(selected, "calendar", event.target.closest("[data-detail-calendar]"));
        return;
      }
      if (event.target.closest("[data-close-action-workspace]")) {
        event.preventDefault();
        closeActionWorkspace();
        return;
      }
      const edit = event.target.closest("[data-edit-message]");
      if (edit) {
        event.preventDefault();
        const workspace = edit.closest("[data-action-workspace]");
        const preview = workspace.querySelector("[data-message-preview]");
        const editor = workspace.querySelector("[data-message-editor]");
        const editing = editor.hidden;
        editor.hidden = !editing;
        preview.hidden = editing;
        edit.textContent = editing ? "Listo" : "✏️ Editar";
        if (editing) editor.focus();
        else {
          preview.textContent = editor.value;
          syncWhatsAppLink(editor.value);
        }
        return;
      }
      if (event.target.closest("[data-regenerate-message]")) {
        event.preventDefault();
        draftVariation += 1;
        void generateMessageDraft();
        return;
      }
      const whatsapp = event.target.closest("[data-open-whatsapp]");
      if (whatsapp) {
        const workspace = whatsapp.closest("[data-action-workspace]");
        const editor = workspace.querySelector("[data-message-editor]");
        const preview = workspace.querySelector("[data-message-preview]");
        const text = editor.hidden ? preview.textContent : editor.value;
        const validation = draftSafetyValidator({ draftText: text, draftCandidateSnapshot: currentDraftCandidate, humanApproval: { required: true, finalAuthority: "HUMAN" } });
        const approval = approveExactDraft({ draftText: text, validationResult: validation });
        const gate = exactDraftHumanApprovalGate({ draftText: text, validationResult: validation, approvalSnapshot: approval });
        whatsapp.dataset.draftSafetyDecision = validation.decision;
        whatsapp.dataset.exactDraftApproved = gate.exactDraftApproved ? "YES" : "NO";
        if (gate.decision === DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP) return;
        event.preventDefault();
        workspace.querySelector("[data-message-error]").textContent = "Revisa el mensaje antes de abrir WhatsApp.";
        workspace.querySelector("[data-message-error]").hidden = false;
        return;
      }
      if (event.target.closest("[data-close-prospect-detail]")) {
        event.preventDefault();
        event.target.closest("dialog").close?.();
        event.target.closest("dialog").remove();
        return;
      }
      if (event.target.closest("[data-edit-prospect]")) {
        event.preventDefault();
        root.querySelector("[data-prospect-detail-dialog]")?.close?.();
        root.querySelector("[data-prospect-detail-dialog]")?.remove();
        openProductiveProspectCreateModal(selected, event.target.closest("[data-edit-prospect]"));
        return;
      }
      if (event.target.closest("[data-archive-prospect]")) {
        event.preventDefault();
        openDeleteConfirmation(selected, event.target.closest("[data-archive-prospect]"));
      }
      if (!event.target.closest("[data-card-context]")) closeCardMenu();
    }, { signal: controller.signal });

    global.document.addEventListener("click", event => {
      if (!event.target.closest?.("[data-card-context]")) closeCardMenu();
    }, { capture: true, signal: controller.signal });

    root.addEventListener("keydown", event => {
      const deleteDialog = root.querySelector("[data-delete-confirmation]");
      if (deleteDialog?.hasAttribute("open")) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeDeleteConfirmation();
          return;
        }
        if (event.key === "Tab") {
          const nodes = focusable(deleteDialog);
          const first = nodes[0];
          const last = nodes[nodes.length - 1];
          if (event.shiftKey && global.document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && global.document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      if (event.key === "Escape" && root.querySelector("[data-card-menu-panel]:not([hidden])")) {
        event.preventDefault();
        closeCardMenu({ restoreFocus: true });
      }
    }, { signal: controller.signal });

    root.addEventListener("input", event => {
      if (event.target.matches('[name="pipeline-search"]')) {
        filterPipelineCards();
        return;
      }
      if (event.target.matches("[data-message-editor]")) {
        currentDraftCandidate = Object.freeze({ rawText: event.target.value, sendsMessage: false, sourceMutable: true });
        syncWhatsAppLink(event.target.value);
      }
    }, { signal: controller.signal });

    root.addEventListener("change", event => {
      if (event.target.matches("[data-prospect-status]")) {
        void updateStatus(event.target);
        return;
      }
      if (event.target.matches('[name="source"],[name="followup"]')) {
        filterPipelineCards();
        return;
      }
      if (event.target.matches("[data-message-goal],[data-message-style]")) {
        draftVariation = 0;
        void generateMessageDraft();
        return;
      }
      if (event.target.matches("[data-calendar-date],[data-calendar-time],[data-calendar-duration]")) syncCalendarWorkspace();
    }, { signal: controller.signal });

    return Object.freeze({
      load,
      openForm: openProductiveProspectCreateModal,
      openProductiveProspectCreate: openProductiveProspectCreateModal,
      openProductiveProspectCreateModal,
      openDetail,
      diagnostics: () => ({
        prospectCount: prospects.length,
        selectedProspectId: selected?.id || null,
        submitting,
        openCreateCount,
        listenerAuthority: "root-delegated-abort-controller",
        createAction: "openProductiveProspectCreateModal",
      }),
    });
  }

  const api = Object.freeze({
    create,
    formTemplate,
    detailTemplate,
    toModel,
    draftCandidate,
    whatsappUrl,
    contactPhone,
    humanDate,
    messageWorkspaceTemplate,
    calendarWorkspaceTemplate,
    deleteConfirmationTemplate,
    draftSafetyValidator,
    approveExactDraft,
    exactDraftHumanApprovalGate,
    DRAFT_VALIDATION_DECISIONS,
    DRAFT_APPROVAL_DECISIONS,
  });
  global.ForgeProductiveProspectUI067G17B = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);

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
    referred_new: "Referido nuevo",
    contacted: "Contactado",
    appointment_scheduled: "Cita agendada",
    needs_analysis: "Análisis",
    proposal_presented: "Propuesta",
    decision_pending: "Decisión",
    won: "Ganado",
    lost: "Perdido",
  };

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
    const phone = prospect.phone || prospect.phoneNormalized || prospect.whatsapp || prospect.whatsappNormalized || "";
    const whatsapp = prospect.whatsapp || prospect.whatsappNormalized || prospect.phone || prospect.phoneNormalized || "";
    return `<dialog class="forge-prospect-dialog forge-prospect-detail-dialog" data-prospect-detail-dialog aria-labelledby="prospect-detail-title"><article><header><div><p class="forge-pipeline-product">${esc(LABELS[prospect.status] || prospect.status)}</p><h2 id="prospect-detail-title">${esc(prospect.fullName)}</h2></div><button type="button" data-close-prospect-detail aria-label="Cerrar">×</button></header><dl class="forge-prospect-detail-list">${row("Teléfono", phone)}${row("WhatsApp", whatsapp)}${row("Correo", prospect.email)}${row("Fuente", prospect.source)}${row("Referido por", prospect.referrerName)}${row("Relación", prospect.referrerRelationship)}${row("Fecha de nacimiento", prospect.dateOfBirth)}${row("Edad", prospect.age)}${row("Estado civil", prospect.maritalStatus)}${row("Dependientes", prospect.dependents)}${row("Ocupación", prospect.occupation)}${row("Ingreso estimado", prospect.estimatedIncome)}${row("Productos de interés", Array.isArray(prospect.productsOfInterest) ? prospect.productsOfInterest.join(", ") : prospect.productsOfInterest)}${row("Contexto inicial", prospect.initialContext)}${row("Próxima acción", prospect.nextActionType)}${row("Fecha de seguimiento", prospect.nextActionAt)}${row("Fecha de creación", prospect.createdAt)}</dl><section class="forge-prospect-contact"><label>Tono de WhatsApp<select data-whatsapp-tone><option value="cercano">Cercano</option><option value="profesional">Profesional</option><option value="ejecutivo">Ejecutivo</option></select></label></section><footer><button type="button" data-edit-prospect>Editar</button><button type="button" data-archive-prospect>Eliminar</button><a class="forge-pipeline-action ${phone ? "" : "is-disabled"}" ${phone ? `href="tel:${esc(phone)}"` : "aria-disabled=\"true\" title=\"No hay un número válido\""}>Llamar</a><a class="forge-pipeline-action ${whatsapp ? "" : "is-disabled"}" data-whatsapp-action ${whatsapp ? `href="${esc(whatsappUrl(prospect, "profesional"))}" target="_blank" rel="noopener noreferrer"` : "aria-disabled=\"true\" title=\"No hay un número válido\""}>WhatsApp</a></footer></article></dialog>`;
  }

  function whatsappUrl(prospect, tone) {
    const number = String(prospect.whatsappNormalized || prospect.phoneNormalized || prospect.whatsapp || prospect.phone || "").replace(/\D/g, "");
    const introductions = {
      cercano: "Qué gusto saludarte",
      profesional: "Me gustaría conversar contigo",
      ejecutivo: "Quisiera coordinar una conversación",
    };
    const context = prospect.initialContext || prospect.source || "la referencia que recibí";
    const text = `Hola, ${prospect.fullName}. Soy tu asesor.\n\n${introductions[tone] || introductions.profesional} porque ${context}.\n\nMe gustaría conocer tus objetivos y revisar cómo podría ayudarte.`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  function toModel(prospects) {
    const groups = new Map();
    for (const prospect of prospects) {
      const status = prospect.status || "referred_new";
      if (!groups.has(status)) groups.set(status, []);
      groups.get(status).push({
        prospectId: prospect.id,
        name: prospect.fullName,
        sourceLabel: prospect.source || "Fuente verificada",
        stageLabel: LABELS[status] || status,
        lastVerifiedActivity: prospect.updatedAt || prospect.createdAt,
        nextCommitment: prospect.nextActionType || "Sin compromiso",
      });
    }
    return {
      state: prospects.length ? "ready" : "empty",
      message: "Todavía no tienes prospectos. Agrega el primero para comenzar tu Pipeline.",
      writerAvailable: true,
      columns: [...groups].map(([columnId, items]) => ({ columnId, label: LABELS[columnId] || columnId, items })),
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

    async function archive() {
      if (!selected || !global.confirm("¿Quieres retirar este prospecto del Pipeline?\n\nSu historial se conservará y no se eliminará físicamente.")) return;
      await service.archiveProspect(selected.id);
      prospects = prospects.filter(item => item.id !== selected.id);
      root.querySelector("[data-prospect-detail-dialog]")?.remove();
      selected = null;
      render();
    }

    root.addEventListener("click", event => {
      const add = event.target.closest("[data-add-prospect]");
      const open = event.target.closest("[data-open-prospect]");
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
        void archive();
      }
    }, { signal: controller.signal });

    root.addEventListener("change", event => {
      if (!event.target.matches("[data-whatsapp-tone]")) return;
      const link = root.querySelector("[data-whatsapp-action]");
      if (link && selected) link.href = whatsappUrl(selected, event.target.value);
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

  const api = Object.freeze({ create, formTemplate, detailTemplate, toModel, whatsappUrl });
  global.ForgeProductiveProspectUI067G17B = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);

"use strict";

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

const ICONS = Object.freeze({
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.4 2.7.7 4.1.7.7 0 1.3.6 1.3 1.3v3.7c0 .7-.6 1.3-1.3 1.3C10.4 22 2 13.6 2 3.3 2 2.6 2.6 2 3.3 2H7c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.7 4.1.1.4 0 .9-.3 1.2l-2.1 2.2Z"/></svg>',
  whatsapp: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7c-2 0-3.8-.5-5.5-1.5l-.4-.2-3.9 1 1.1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.8.2l-1 1.2c-.2.3-.4.3-.7.1-2-.9-3.3-1.7-4.6-3.9-.3-.6.3-.6.9-1.8.1-.2.1-.5 0-.7l-1-2.4c-.2-.6-.5-.5-.8-.5h-.7c-.3 0-.7.1-1 .5-.3.4-1.3 1.3-1.3 3.2s1.4 3.7 1.6 4c.2.3 2.7 4.2 6.7 5.7 2.5 1.1 3.5 1.2 4.8 1 .8-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.5Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8h16v8ZM4 9V7a1 1 0 0 1 1-1h1v2h2V6h8v2h2V6h1a1 1 0 0 1 1 1v2H4Z"/></svg>',
  person: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/></svg>',
});

function stateAction(action) {
  const attrs = Object.entries(action.attrs || {}).map(([key, value]) => `${esc(key)}="${esc(value)}"`).join(" ");
  return `<button type="button" class="${esc(action.className || "forge-pipeline-action")}" ${attrs}>${esc(action.label)}</button>`;
}

function stateBlock(state, message, actions = []) {
  const roles = { loading: "status", empty: "status", partial: "status", error: "alert" };
  const actionHtml = actions.length ? `<div class="forge-pipeline-state-actions">${actions.map(stateAction).join("")}</div>` : "";
  return `<section class="forge-pipeline-state forge-pipeline-state--${state}" role="${roles[state]}"><h2>${esc({ loading: "Cargando Pipeline", empty: "Aún no hay oportunidades", partial: "Información parcial", error: "No pudimos cargar Pipeline" }[state])}</h2><p>${esc(message)}</p>${actionHtml}</section>`;
}

function statusControl(item) {
  if (!item.statusOptions?.length) return "";
  return `<label class="forge-card-stage-control"><span>Etapa</span><select data-prospect-status="${esc(item.prospectId)}" aria-label="Cambiar etapa de ${esc(item.name)}">${item.statusOptions.map(option => `<option value="${esc(option.value)}" ${option.value === item.status ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select></label>`;
}

function quickActions(item) {
  if (!item.prospectId) return "";
  const call = item.phoneHref
    ? `<a class="forge-card-action forge-card-action--call" href="${esc(item.phoneHref)}" aria-label="Llamar a ${esc(item.name)}">${ICONS.phone}<span>Llamar</span></a>`
    : `<span class="forge-card-action forge-card-action--call is-disabled" aria-disabled="true" title="Sin teléfono válido">${ICONS.phone}<span>Llamar</span></span>`;
  const whatsappDisabled = item.whatsappAvailable ? "" : " disabled title=\"Sin WhatsApp válido\"";
  return `<div class="forge-card-actions" aria-label="Acciones rápidas para ${esc(item.name)}">${call}<button type="button" class="forge-card-action forge-card-action--whatsapp" data-card-whatsapp="${esc(item.prospectId)}"${whatsappDisabled}>${ICONS.whatsapp}<span>WhatsApp</span></button><button type="button" class="forge-card-action forge-card-action--calendar" data-card-calendar="${esc(item.prospectId)}">${ICONS.calendar}<span>Agendar</span></button></div>`;
}

function card(item) {
  const transition = item.transitionControl
    ? `<label class="forge-pipeline-transition">Mover oportunidad<select data-transition-opportunity="${esc(item.opportunityId)}" ${item.transitionControl.writerAvailable ? "" : "disabled"}>${item.transitionControl.allowedTargets.map(target => `<option value="${esc(target.code)}">${esc(target.label)}</option>`).join("")}</select></label>${item.transitionControl.blockedReason ? `<p class="forge-pipeline-blocked">${esc(item.transitionControl.blockedReason)}</p>` : ""}`
    : "";
  return `<article class="forge-pipeline-card" data-stage="${esc(item.status || item.stageCode || "unknown")}" data-prospect-id="${esc(item.prospectId)}"><span class="forge-card-status-bar" aria-hidden="true"></span><header><div><p class="forge-card-stage-label">${esc(item.stageLabel || "Pendiente")}</p><button type="button" class="forge-card-name" data-open-prospect="${esc(item.prospectId)}">${esc(item.name)}</button></div><span class="forge-pipeline-chip">${esc(item.sourceLabel || "Fuente verificada")}</span></header><ul class="forge-card-summary"><li>${ICONS.phone}<span>${esc(item.phoneLabel || "Sin teléfono")}</span></li><li>${ICONS.person}<span>${esc(item.referrerLabel || "Sin referente")}</span></li><li>${ICONS.calendar}<span>${esc(item.appointmentLabel || "Sin cita")}</span></li></ul>${statusControl(item)}${transition}${quickActions(item)}</article>`;
}

function renderPipelineUI(model = {}) {
  const state = model.state || "ready";
  const emptyAction = state === "empty" && model.writerAvailable ? '<button type="button" class="forge-pipeline-action" data-add-prospect>Agregar prospecto</button>' : "";
  const columns = model.columns || [{ columnId: "preview", label: "Vista provisional", preview: true, items: model.items || [] }];
  const content = state === "ready"
    ? `<div class="forge-pipeline-layout" data-view="operations">${columns.map(column => `<section class="forge-pipeline-column" data-stage-column="${esc(column.columnId)}" aria-labelledby="col-${esc(column.columnId)}"><header><div><h2 id="col-${esc(column.columnId)}">${esc(column.label)}</h2><span>${column.items.length} ${column.items.length === 1 ? "prospecto" : "prospectos"}</span></div>${column.preview ? '<span class="forge-pipeline-preview">Datos de prueba</span>' : ""}</header><div class="forge-pipeline-cards">${column.items.map(card).join("")}</div></section>`).join("")}</div>`
    : `${stateBlock(state, model.message || "", model.stateActions || [])}${emptyAction}`;
  return `<main class="forge-pipeline" aria-labelledby="forge-pipeline-title"><header class="forge-pipeline-header"><div><p class="forge-pipeline-product">FORGE · ADVISOR OS</p><p class="forge-pipeline-kicker">INTERVENCIÓN COMERCIAL EXPLICADA</p><h1 id="forge-pipeline-title">Pipeline de ventas</h1><p>Decide y actúa sin salir de tu operación diaria.</p></div>${model.writerAvailable ? '<button type="button" class="forge-pipeline-primary" data-add-prospect>+ Agregar prospecto</button>' : ""}</header><form class="forge-pipeline-toolbar" role="search" aria-label="Filtros del Pipeline"><label><span>Buscar</span><input name="pipeline-search" type="search" autocomplete="off" placeholder="Nombre o teléfono"></label><label><span>Origen</span><select name="source"><option value="">Todos los orígenes</option><option>Referido</option><option>Proyecto 200</option><option>Mercado natural</option><option>Redes sociales</option><option>Cliente existente</option><option>Evento</option><option>Otro</option></select></label><label><span>Seguimiento</span><select name="followup"><option value="">Todos</option><option>Vencido</option><option>Próximo</option></select></label></form>${content}</main>`;
}

const PipelineUI = { renderPipelineUI, stateBlock, card, ICONS };
if (typeof globalThis !== "undefined") globalThis.ForgePipelineUI = PipelineUI;
if (typeof module !== "undefined" && module.exports) module.exports = PipelineUI;

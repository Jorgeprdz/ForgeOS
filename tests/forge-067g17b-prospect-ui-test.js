"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const PipelineUI=require("../advisor-os/sales-pipeline/pipeline-ui.js");
const ProspectUI=require("../advisor-os/sales-pipeline/productive-prospect-ui.js");

test("productive Pipeline exposes canonical add action and empty state",()=>{
 const html=PipelineUI.renderPipelineUI({state:"empty",message:"Todavía no tienes prospectos.",writerAvailable:true});
 assert.match(html,/\+ Agregar prospecto/);
 assert.match(html,/data-add-prospect/);
 assert.equal((html.match(/data-add-prospect/g)||[]).length,2);
 assert.match(html,/Todavía no tienes prospectos/);
 assert.doesNotMatch(html,/Datos de prueba/);
});

test("top and empty create buttons use one canonical create authority",()=>{
 const fs=require("node:fs");
 const uiSource=fs.readFileSync("advisor-os/sales-pipeline/productive-prospect-ui.js","utf8");
 const css=fs.readFileSync("advisor-os/sales-pipeline/pipeline-ui.css","utf8");
 const html=PipelineUI.renderPipelineUI({state:"empty",message:"Todavía no tienes prospectos.",writerAvailable:true});
 assert.match(html,/<button type="button" class="forge-pipeline-primary" data-add-prospect>\+ Agregar prospecto<\/button>/);
 assert.match(html,/<button type="button" class="forge-pipeline-action" data-add-prospect>Agregar prospecto<\/button>/);
 assert.match(uiSource,/function openProductiveProspectCreateModal/);
 assert.match(uiSource,/openForm: openProductiveProspectCreateModal/);
 assert.match(uiSource,/openProductiveProspectCreate: openProductiveProspectCreateModal/);
 assert.match(uiSource,/openProductiveProspectCreateModal,/);
 assert.match(uiSource,/event\.target\.closest\("\[data-add-prospect\]"\)/);
 assert.match(uiSource,/root\.__forgeProductiveProspectCreateAbort067G17B\?\.abort\(\)/);
 assert.match(uiSource,/new AbortController\(\)/);
 assert.match(uiSource,/listenerAuthority: "root-delegated-abort-controller"/);
 assert.match(uiSource,/const existing = global\.document\.querySelector\("\[data-prospect-form-modal\]"\)/);
 assert.match(uiSource,/global\.document\.body\.insertAdjacentHTML\("beforeend", formTemplate\(prospect\)\)/);
 assert.match(uiSource,/role="dialog"/);
 assert.match(uiSource,/aria-modal="true"/);
 assert.match(uiSource,/event\.key === "Escape"/);
 assert.match(uiSource,/event\.key !== "Tab"/);
 assert.match(uiSource,/createTrigger\?\.focus\?/);
 assert.doesNotMatch(uiSource,/setInterval|MutationObserver/);
 assert.match(css,/\.forge-prospect-modal-backdrop/);
 assert.match(css,/html\[data-forge-prospect-modal-open="true"\]/);
 assert.match(css,/\.forge-prospect-form-scroll/);
 assert.match(css,/\.forge-pipeline>\.forge-pipeline-action/);
 assert.match(css,/grid-area:auto/);
 assert.match(css,/inline-size:auto/);
 assert.match(css,/min-block-size:44px/);
 assert.match(css,/max-inline-size:min\(100%,260px\)/);
 assert.match(css,/flex:0 0 auto/);
 assert.match(css,/writing-mode:horizontal-tb/);
 assert.match(css,/aspect-ratio:auto/);
});

test("create form enforces name source context and phone-or-whatsapp in controller",()=>{
 const html=ProspectUI.formTemplate();
 assert.match(html,/data-prospect-form-modal/);
 assert.match(html,/role="dialog"/);
 assert.match(html,/aria-modal="true"/);
 assert.match(html,/PROSPECTO PRODUCTIVO/);
 assert.match(html,/name="fullName"[^>]*required/);
 assert.match(html,/name="source" required/);
 assert.match(html,/name="initialContext" required/);
 assert.match(html,/name="phone"/);
 assert.match(html,/name="whatsapp"/);
 assert.doesNotMatch(html,/name="advisorId"|name="advisor_id"/);
 assert.match(html,/data-save-prospect/);
 assert.doesNotMatch(html,/<dialog[^>]*data-prospect-form-dialog/);
});

test("detail exposes edit archive call and WhatsApp without automatic send",()=>{
 const prospect={id:"p-1",fullName:"Marlene Ruiz",status:"referred_new",phoneNormalized:"+525512345678",source:"Referido",initialContext:"Ana nos presentó",createdAt:"2026-07-18T00:00:00Z"};
 const html=ProspectUI.detailTemplate(prospect);
 assert.match(html,/Editar/);
 assert.match(html,/Eliminar/);
 assert.match(html,/href="tel:\+525512345678"/);
 assert.match(html,/https:\/\/wa\.me\/525512345678\?text=/);
 assert.match(html,/target="_blank"/);
 assert.doesNotMatch(html,/send\(|auto.?send/i);
});

test("canonical model places a new prospect in Referido nuevo",()=>{
 const model=ProspectUI.toModel([{id:"p-1",fullName:"Marlene Ruiz",status:"referred_new",source:"Referido"}]);
 assert.equal(model.state,"ready");
 assert.equal(model.columns[0].columnId,"referred_new");
 assert.equal(model.columns[0].label,"Referido nuevo");
 assert.equal(model.columns[0].items[0].prospectId,"p-1");
});

test("WhatsApp templates preserve useful verified context while excluding arbitrary or sensitive text",()=>{
 const prospect=Object.freeze({
  fullName:"Marlene",
  phoneNormalized:"+525512345678",
  source:"Referido",
  referrerName:"Ana",
  initialContext:"tu referencia privada sobre salud e ingresos",
  estimatedIncome:90000,
  status:"referred_new",
 });
 const before=JSON.stringify(prospect);
 const cercanoUrl=ProspectUI.whatsappUrl(prospect,"cercano");
 const profesionalUrl=ProspectUI.whatsappUrl(prospect,"profesional");
 assert.match(cercanoUrl,/^https:\/\/wa\.me\/525512345678\?text=/);
 const cercanoText=new URL(cercanoUrl).searchParams.get("text");
 const profesionalText=new URL(profesionalUrl).searchParams.get("text");
 assert.match(cercanoText,/^Hola, Marlene\. Soy Jorge Palacios\./);
 assert.match(cercanoText,/Ana me compartió tu contacto y me gustaría presentarme\./);
 assert.match(cercanoText,/Qué gusto saludarte\./);
 assert.match(profesionalText,/Me gustaría conversar contigo\./);
 assert.notEqual(cercanoUrl,profesionalUrl);
 assert.equal(cercanoText.includes(prospect.initialContext),false);
 assert.doesNotMatch(cercanoText,/90000|Soy tu asesor/i);
 assert.equal(JSON.stringify(prospect),before);
 const unverifiedText=new URL(ProspectUI.whatsappUrl({
  fullName:"Marlene",
  phoneNormalized:"+525512345678",
  source:"Evento",
  referrerName:"Nombre no verificado",
  initialContext:"texto arbitrario",
 },"profesional")).searchParams.get("text");
 assert.doesNotMatch(unverifiedText,/Nombre no verificado|texto arbitrario|compartió tu contacto/i);
});

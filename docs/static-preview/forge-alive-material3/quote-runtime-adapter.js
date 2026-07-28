import {
  createQuoteResultSnapshot,
  renderQuoteResultSnapshot,
} from "./quote-product-intelligence-presenter.js?v=ui-m05d-001";

const adapterKey=Symbol.for("forge.ui-m05b.quote-runtime-adapter");
const moduleUrl=name=>new URL(`../quote-preview-live/${name}`,import.meta.url).href;

function loadClassicScript(name){
  const source=moduleUrl(name);
  const existing=document.querySelector(`script[data-quote-runtime-src="${source}"]`);
  if(existing){
    if(existing.dataset.loaded==="true")return Promise.resolve();
    return new Promise((resolve,reject)=>{
      existing.addEventListener("load",resolve,{once:true});
      existing.addEventListener("error",reject,{once:true});
    });
  }
  return new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src=source;
    script.dataset.quoteRuntimeSrc=source;
    script.addEventListener("load",()=>{
      script.dataset.loaded="true";
      resolve();
    },{once:true});
    script.addEventListener("error",reject,{once:true});
    document.head.append(script);
  });
}

const hasValue=value=>value!==null&&value!==undefined&&value!=="";
function formatNumber(value){
  if(!hasValue(value))return"—";
  const numeric=Number(String(value).replace(/,/g,""));
  return Number.isFinite(numeric)
    ?new Intl.NumberFormat("es-MX",{maximumFractionDigits:2}).format(numeric)
    :String(value);
}
const formatAmount=(value,currency)=>hasValue(value)
  ?[formatNumber(value),currency].filter(Boolean).join(" "):"—";

function fieldModel(packet={}){
  const nativeResult=packet.nativeResult||{};
  const context=packet.context||{};
  const premiumTable=nativeResult.premiumTable||{};
  return{
    client:nativeResult.prospect??nativeResult.insured??null,
    family:context.productFamily??context.product_family
      ??nativeResult.productFamily??nativeResult.product_family??null,
    product:nativeResult.product??null,
    plan:nativeResult.plan??null,
    sumAssured:nativeResult.sumInsured??nativeResult.sumAssured??null,
    annualPremium:premiumTable.annual??nativeResult.totalAnnualPremium
      ??nativeResult.annualPremium??null,
    paymentMode:nativeResult.paymentMode??null,
    currency:nativeResult.currency??null,
    coveragePeriod:nativeResult.policyTerm??nativeResult.coveragePeriod??null,
    paymentTerm:nativeResult.paymentTerm??null,
    totalContributed:nativeResult.totalContributed??nativeResult.totalContributions??null,
    totalRecovery:nativeResult.totalRecovery??nativeResult.recoveryTotal??null,
    retirementInterestRate:nativeResult.retirementInterestRate??null,
    retirementScenarioBase:nativeResult.retirementScenarioBase??null,
    retirementScenarioFavorable:nativeResult.retirementScenarioFavorable??null,
    retirementScenarioUnfavorable:nativeResult.retirementScenarioUnfavorable??null,
    guaranteePeriod:nativeResult.guaranteePeriod??null,
    quoteDate:nativeResult.quoteDate??null,
    advisor:nativeResult.advisor??null,
  };
}
const runtimeGridKey=heading=>String(heading||"").toLowerCase().includes("faltantes")
  ?"missing":"benefits";

export function createQuoteRuntimeAdapter({root}){
  if(root[adapterKey])return root[adapterKey];
  const subscribers=new Set();
  let initialized=false;
  let destroyed=false;
  let latestPacket=null;
  let latestCalculation=null;
  let latestResultSnapshot=null;
  let benefitSummaryModule=null;
  const input=root.querySelector("#fq-solution-online-pdf-105dr");
  const submit=root.querySelector(".fq-send-pdf-105dr");
  const status=root.querySelector(".fq-file-status-105dr");
  const label=root.querySelector('label[for="fq-solution-online-pdf-105dr"]');
  const uploadSection=root.querySelector(".quotes-intake");
  const confirmButton=root.querySelector("[data-quote-action=confirm]");

  function notify(type,detail={}){
    const snapshot=api.getState();
    subscribers.forEach(listener=>listener({type,detail,snapshot}));
  }
  function setText(selector,value){
    const target=root.querySelector(selector);
    if(target&&hasValue(value))target.textContent=String(value);
  }
  function setInput(field,value){
    const target=root.querySelector(`[data-quote-input="${field}"]`);
    if(!target)return false;
    target.value=value??"";
    target.dispatchEvent(new Event("input",{bubbles:true}));
    return true;
  }
  function setReadiness(message,state="pending"){
    const target=root.querySelector("[data-quote-readiness]");
    if(!target)return;
    target.dataset.forgeState=state;
    const text=target.querySelector("strong");
    if(text)text.textContent=message;
    if(confirmButton)confirmButton.disabled=!["ready","accepted"].includes(state);
    notify("readiness",{message,state});
  }
  function writeRuntimeGrid(heading,entries=[],emptyMessage=""){
    const host=root.querySelector(`[data-quote-runtime-grid="${runtimeGridKey(heading)}"]`);
    if(!host)return;
    const usable=entries.filter(entry=>hasValue(entry?.value));
    if(!usable.length){
      host.innerHTML=`<p class="quotes-empty">${emptyMessage}</p>`;
      return;
    }
    const list=document.createElement("dl");
    list.className="quotes-runtime-list";
    for(const entry of usable){
      const row=document.createElement("div");
      const term=document.createElement("dt");
      const detail=document.createElement("dd");
      term.textContent=entry.label;
      detail.textContent=String(entry.value);
      row.append(term,detail);
      list.append(row);
    }
    host.replaceChildren(list);
  }
  function applyPacketToNativeWorkspace(packet){
    latestPacket=packet;
    const model=fieldModel(packet);
    const currency=model.currency;
    setInput("client",model.client);
    setInput("family",model.family);
    setText('[data-quote-result="product"]',model.product||model.family||"Pendiente");
    setText('[data-quote-result="plan"]',model.plan||"Plan por confirmar");
    setText('[data-quote-result="sumAssured"]',formatAmount(model.sumAssured,currency));
    setText('[data-quote-result="annualPremium"]',formatAmount(model.annualPremium,currency));
    setText('[data-quote-result="currencyTerm"]',
      [currency,model.paymentMode,model.coveragePeriod].filter(Boolean).join(" · ")||"—");
    setText('[data-quote-result="totalContributed"]',
      formatAmount(model.totalContributed,currency));
    setText('[data-quote-result="totalRecovery"]',
      formatAmount(model.totalRecovery,currency));
    const missing=[
      ["Cliente",model.client],["Familia",model.family],["Producto",model.product],
      ["Suma asegurada",model.sumAssured],["Prima anual",model.annualPremium],
      ["Moneda",model.currency],
    ].filter(([,value])=>!hasValue(value));
    writeRuntimeGrid("Faltantes antes de presentar",
      missing.map(([name])=>({label:"Pendiente",value:name})),
      "Campos principales completos. Revisa antes de confirmar.");
    writeRuntimeGrid("Valores, beneficios o escenarios relevantes",[
      {label:"Plazo de pagos",value:model.paymentTerm},
      {label:"Tasa de retiro",value:model.retirementInterestRate},
      {label:"Escenario base",value:model.retirementScenarioBase},
      {label:"Escenario favorable",value:model.retirementScenarioFavorable},
      {label:"Escenario desfavorable",value:model.retirementScenarioUnfavorable},
      {label:"Periodo de garantía",value:model.guaranteePeriod},
      {label:"Fecha de cotización",value:model.quoteDate},
      {label:"Asesor",value:model.advisor},
    ],"El archivo no entregó valores adicionales.");
    setReadiness("Resultado extraído · calculando preview","calculating");
    notify("packet",{packet,model});
    return model;
  }
  function updateStructuredResults(calculation){
    latestCalculation=calculation
      ??globalThis.ForgeAcceptedQuoteBridge
        ?.getCurrentQuotePreviewCalculationState?.()?.calculation
      ??null;
    if(!latestCalculation)return null;
    latestResultSnapshot=createQuoteResultSnapshot({
      packet:latestPacket,
      calculation:latestCalculation,
      buildBenefitSummary:benefitSummaryModule?.buildDynamicBenefitSummary,
    });
    renderQuoteResultSnapshot(latestResultSnapshot,{
      host:root.querySelector("[data-quote-product-dashboard]"),
    });
    const generic=root.querySelector("[data-quote-generic-results]");
    if(generic)generic.hidden=latestResultSnapshot.dashboard.model.sections.length>0;
    notify("structured-results",{snapshot:latestResultSnapshot});
    return latestResultSnapshot;
  }
  async function initialize(){
    if(initialized)return api;
    if(destroyed)throw new Error("QuoteRuntimeAdapter was destroyed");
    await loadClassicScript("forge-quote-preview-bundle.js");
    await import(moduleUrl("forge-quote-calculators.js"));
    await import(moduleUrl("forge-udi-mxn-runtime.js"));
    await import(moduleUrl("forge-quote-benefit-summary.js"));
    await loadClassicScript("forge-quote-intake-state.js");
    await import(moduleUrl("forge-accepted-quote-adapter.js"));
    benefitSummaryModule=await import(moduleUrl("forge-benefit-summary-renderer.js"));
    await import(moduleUrl("forge-benefit-summary-layout.js"));
    await import(moduleUrl("forge-pdf-browser-parser.js"));
    globalThis.ForgeNuevaCotizacionAcceptedQuoteRuntime={
      contractId:"UI_M05B_NATIVE_MATERIAL3_QUOTE_RUNTIME_V1",
      input,submit,status,label,uploadSection,
      applyPacketToExistingPage:applyPacketToNativeWorkspace,
      fieldModel,setReadiness,writeRuntimeGrid,
    };
    await import(moduleUrl("forge-accepted-quote-bridge.js"));
    confirmButton?.addEventListener("click",async()=>{
      confirmButton.disabled=true;
      try{
        await globalThis.ForgeAcceptedQuoteBridge.confirmCurrentQuoteCandidate();
        setReadiness("Cotización confirmada · lista para revisión comercial","accepted");
      }catch(error){setReadiness(error.message,"error");}
    });
    globalThis.addEventListener("forge:quote-preview-calculated",()=>{
      updateStructuredResults();
      setReadiness("Resultado calculado · pendiente de revisión humana","ready");
    });
    initialized=true;
    root.dataset.quoteRuntimeAdapter="ready";
    notify("initialized");
    return api;
  }
  const api=Object.freeze({
    initialize,
    getState(){return Object.freeze({
      initialized,destroyed,
      intake:globalThis.ForgeQuoteIntakeState?.getState?.()||null,
      preview:globalThis.ForgeAcceptedQuoteBridge
        ?.getCurrentQuotePreviewCalculationState?.()||null,
      packet:latestPacket,
      calculation:latestCalculation,
      resultSnapshot:latestResultSnapshot,
    });},
    getCalculation(){return latestResultSnapshot?.calculation??null;},
    getProductIntelligence(){return latestResultSnapshot?.productIntelligence??null;},
    getBenefitSummary(){return latestResultSnapshot?.benefitSummary??null;},
    getProductDashboardModel(){return latestResultSnapshot?.dashboard??null;},
    getRateMetadata(){return latestResultSnapshot?.rateMetadata??null;},
    getMissingInformation(){return latestResultSnapshot?.missingInformation??Object.freeze([]);},
    getTruthState(){return latestResultSnapshot?.truthState??null;},
    subscribe(listener){subscribers.add(listener);return()=>subscribers.delete(listener);},
    setInput,
    selectFile:()=>input?.click(),
    calculate:()=>globalThis.ForgeAcceptedQuoteBridge
      ?.calculateCurrentQuoteCandidatePreview?.(),
    generatePreview:()=>globalThis.ForgeAcceptedQuoteBridge
      ?.calculateCurrentQuoteCandidatePreview?.(),
    acceptQuote:()=>globalThis.ForgeAcceptedQuoteBridge?.confirmCurrentQuoteCandidate?.(),
    reset(){globalThis.ForgeQuoteIntakeState?.reset?.();latestPacket=null;
      latestCalculation=null;latestResultSnapshot=null;
      root.querySelector("[data-quote-product-dashboard]")?.replaceChildren();
      setReadiness("Revisa el archivo para continuar","pending");},
    destroy(){destroyed=true;subscribers.clear();},
    elements:Object.freeze({input,submit,status,label}),
  });
  root[adapterKey]=api;
  return api;
}

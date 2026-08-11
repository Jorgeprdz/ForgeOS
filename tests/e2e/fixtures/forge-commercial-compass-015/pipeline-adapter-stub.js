const cards=[{id:'p015',fullName:'Ana Prospecto',status:'contacted',stageLabel:'Contactado',latestActivity:{label:'Llamada registrada'},nextCommitment:null}];
globalThis.__PIPELINE_CARDS_015 = cards;
export async function createPipelineAdapter(){return Object.freeze({
  getCards:()=>cards,
  messageOptions:()=>({goals:{first_contact:'Primer contacto',follow_up:'Seguimiento',reactivation:'Retomar conversación',collection:'Cobranza',application_signature:'Firma de solicitud',custom:'Otro / Personalizado'},styles:{professional:'Profesional'}}),
  async prepareMessage(card,input){return {status:'READY',candidate:{rawText:`Hola ${card.fullName}, te escribo para dar seguimiento.`},sourceMode:'DETERMINISTIC',input};},
  async approveExactDraft(card,_prepared,value){return {approved:true,whatsappUrl:`https://wa.me/5215555555555?text=${encodeURIComponent(value)}&prospect=${card.id}`};},
  async analyzeCombat(){return {};},
  reviewCombat(value){return value;},
  async registerObjection(){return {};},
});}

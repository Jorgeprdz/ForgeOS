import { demoData, WORKSPACE } from './fixtures.mjs';
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
const limits={name:120,phone:32,email:254,city:100,source:100,notes:4000};
export function validateCandidate(input,state) {
  const errors={};
  for(const [field,max] of Object.entries(limits)) {
    const value=String(input[field]??'');
    if(value.length>max || /[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value))errors[field]='Revisa este campo: longitud o caracteres no admitidos.';
  }
  if(!String(input.name??'').trim())errors.name='Escribe el nombre ficticio completo.';
  if(state.candidates.some(c=>normalize(c.name)===normalize(input.name)))errors.name='Ya existe ese nombre en esta demostración.';
  if(input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))errors.email='Escribe un correo con formato válido.';
  if(input.phone && (!/^[+\d\s()-]+$/.test(input.phone)||input.phone.replace(/\D/g,'').length<7))errors.phone='Escribe un teléfono ficticio con formato válido.';
  if(input.email && state.candidates.some(c=>normalize(c.email)===normalize(input.email)))errors.email='Ese correo ya figura en la demostración.';
  if(input.phone && state.candidates.some(c=>c.phone.replace(/\D/g,'')===input.phone.replace(/\D/g,'')))errors.phone='Ese teléfono ya figura en la demostración.';
  return errors;
}
export function createSession({empty=false}={}) {
  const state=empty?{candidates:[],applications:[],interviews:[],events:[],evidence:[]}:demoData();let sequence=3;
  return {state,
    addCandidate(input) {
      const errors=validateCandidate(input,state);if(Object.keys(errors).length)throw Object.assign(new TypeError('VALIDATION'),{fields:errors});
      const id='candidate-demo-'+sequence++;const candidate=Object.fromEntries(Object.keys(limits).map(k=>[k,String(input[k]??'').trim()]));
      Object.assign(candidate,{id,nextActivity:'Por definir en revisión humana',followUp:'Sin información suficiente'});
      state.candidates.push(candidate);state.applications.push({workspace_id:WORKSPACE,id:'application-'+id,candidate_id:id,stage:null});return candidate;
    },
    setInterviewNotes(id,value) {
      const interview=state.interviews.find(i=>i.id===id);if(!interview)throw new TypeError('INTERVIEW_NOT_FOUND');
      if(typeof value!=='string'||value.length>4000)throw new TypeError('NOTES_TOO_LONG');
      interview.notes=value;
    }
  };
}
export function selectCandidates(state,query='',filter='all') {
  return state.candidates.filter(c=>normalize(c.name+' '+c.source+' '+c.city).includes(normalize(query)) && (filter==='all'||(filter==='unknown'?!state.applications.find(a=>a.candidate_id===c.id)?.stage:state.applications.find(a=>a.candidate_id===c.id)?.stage===filter)));
}
export function exportDossier(state,id) {
  const c=state.candidates.find(c=>c.id===id);if(!c)throw new TypeError('CANDIDATE_NOT_FOUND');
  const app=state.applications.find(a=>a.candidate_id===id);
  return ['MODO DEMOSTRACIÓN — DATOS FICTICIOS','Solo datos de esta sesión. NO guardado en la nube.','Expediente: '+c.name,'Teléfono: '+(c.phone||'Sin información'),'Correo: '+(c.email||'Sin información'),'Ciudad: '+(c.city||'Sin información'),'Origen: '+(c.source||'Sin información'),'Etapa fuente: '+(app?.stage||'UNKNOWN'),'Notas generales (humanas, no verificadas): '+(c.notes||'Sin notas'),...state.interviews.filter(i=>i.candidate_id===id).map(i=>'Entrevista '+i.type+' / '+i.status+'\nNotas humanas: '+(i.notes||'Sin notas')),...state.events.filter(e=>e.candidate_id===id).map(e=>'Actividad sintética: '+e.event_type+' / '+e.occurred_at),'Próxima acción: '+c.nextActivity,'Revisión humana obligatoria. Sin selección ni rechazo automático.','PDF: próxima fase'].join('\n\n');
}

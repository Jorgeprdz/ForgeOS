export const WORKSPACE = 'workspace-demo';
export const AS_OF = '2026-10-16T12:00:00.000Z';
export const MAX_AGE_MS = 86400000;
const timestamp = '2026-10-16T10:00:00.000Z';

export function demoData() {
  const candidates = [
    { id:'candidate-demo-1', name:'Lucía Demo', phone:'+52 000 000 0001', email:'lucia@example.invalid', city:'Ciudad ejemplo', source:'Referido · demo', notes:'Escenario ficticio: preparar una conversación sobre experiencia laboral.', nextActivity:'Entrevista inicial · 17 oct, 10:00', followUp:'Por conversar' },
    { id:'candidate-demo-2', name:'Mateo Ejemplo', phone:'+52 000 000 0002', email:'mateo@example.invalid', city:'Ciudad ejemplo', source:'Evento · demo', notes:'Escenario ficticio: revisar las evidencias de experiencia compartidas.', nextActivity:'Revisión humana del expediente', followUp:'Revisión pendiente' },
  ];
  const applications=candidates.map((c,i)=>({workspace_id:WORKSPACE,id:'application-demo-'+(i+1),candidate_id:c.id,stage:i===0?'interviewing':'manager_review'}));
  const interviews=candidates.map((c,i)=>({workspace_id:WORKSPACE,id:'interview-demo-'+(i+1),application_id:applications[i].id,candidate_id:c.id,type:'initial',status:i===0?'scheduled':'completed',scheduled_at:i===0?'2026-10-17T10:00:00.000Z':timestamp,completed_at:i===0?null:timestamp,human_recommendation:i===0?null:'WATCH',question_evidence_ids:i===0?[]:['question-demo-1'],interviewer:'Entrevistador Demo',notes:''}));
  const events=applications.flatMap((a,i)=>{
    const row=(suffix,event_type)=>({workspace_id:WORKSPACE,id:'event-demo-'+(i+1)+'-'+suffix,application_id:a.id,candidate_id:a.candidate_id,event_type,occurred_at:timestamp});
    return [row('name','NAME_ADDED'),row('scheduled','INITIAL_INTERVIEW_SCHEDULED'),...(i===1?[row('completed','INITIAL_INTERVIEW_COMPLETED')]:[])];
  });
  const evidence=[...applications,...interviews,...events].map(row=>({workspace_id:WORKSPACE,id:'evidence-'+row.id,subject_id:row.id,source_owner:row.id.startsWith('interview')?'INTERVIEW':'RECRUITMENT',captured_at:timestamp,original_source_ref:'fixture:'+row.id,verification:{status:'VERIFIED',verified_by:'reviewer-fictional',verified_at:'2026-10-16T11:00:00.000Z'}}));
  return {candidates,applications,interviews,events,evidence};
}

import { adaptPipeline } from '../src/adapters/pipeline.mjs';
import { adaptInterview } from '../src/adapters/interviews.mjs';
import { adaptEvent } from '../src/adapters/events.mjs';
import { adaptSnapshot } from '../src/adapters/snapshots.mjs';
import { adaptMetrics } from '../src/adapters/metrics.mjs';
import { WORKSPACE, AS_OF, MAX_AGE_MS } from './fixtures.mjs';

function pick(source, fields) { return Object.fromEntries(fields.filter(key=>Object.hasOwn(source,key)).map(key=>[key,source[key]])); }
export function projectDomain(state) {
  const applications=state.applications.map(row=>pick(row,['workspace_id','id','candidate_id','stage']));
  const events=state.events.map(row=>pick(row,['workspace_id','id','application_id','candidate_id','event_type','occurred_at']));
  const interviews=state.interviews.map(row=>pick(row,['workspace_id','id','application_id','candidate_id','type','status','completed_at','human_recommendation','question_evidence_ids']));
  // Human-entered fields never construct source evidence. Only the closed fixture evidence is consumed.
  const evidence=state.evidence.map(row=>({...pick(row,['workspace_id','id','subject_id','source_owner','captured_at','original_source_ref']),verification:pick(row.verification,['status','verified_by','verified_at'])}));
  const records=state.candidates.map(c=>({candidate:{workspace_id:WORKSPACE,id:c.id},application:applications.find(a=>a.candidate_id===c.id),events:events.filter(e=>e.candidate_id===c.id)}));
  return {workspaceId:WORKSPACE,asOf:AS_OF,maxAgeMs:MAX_AGE_MS,evidence,records,interviews};
}
export function buildContext(state) {
  const projection=projectDomain(state); const candidates={}; const interviews={}; const events={};
  for(const record of projection.records) {
    const options={...projection,...record};
    candidates[record.candidate.id]={pipeline:adaptPipeline(options),snapshot:adaptSnapshot(options)};
    for(const event of record.events)events[event.id]=adaptEvent({...options,event});
    for(const interview of projection.interviews.filter(i=>i.candidate_id===record.candidate.id))interviews[interview.id]=adaptInterview({...options,interview});
  }
  return {candidates,interviews,events,metrics:adaptMetrics(projection)};
}

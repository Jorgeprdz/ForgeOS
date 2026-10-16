import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, validateCandidate, selectCandidates, exportDossier } from '../../preview/model.mjs';
import { projectDomain, buildContext } from '../../preview/domain.mjs';

test('demo session is isolated and complete fixture metrics come from adapters', () => {
  const a = createSession(); const b = createSession();
  assert.equal(a.state.candidates.length, 2);
  const context = buildContext(a.state);
  assert.equal(context.metrics.result.recruitmentMetrics.totalCandidateSnapshots, 2);
  assert.equal(context.metrics.humanReviewRequired, true);
  a.setInterviewNotes('interview-demo-1', 'Nota ficticia');
  assert.equal(b.state.interviews[0].notes, '');
  assert.equal(a.state.interviews[0].notes, 'Nota ficticia');
});
test('required fields, contact syntax, control characters, and long data are validated', () => {
  const state = createSession().state;
  assert.ok(validateCandidate({}, state).name);
  for (const input of [{ name: 'x'.repeat(121) }, {name:'<script>ejemplo</script>'}, {name:'A\u0000B'}, {name:'Álex Demo',email:'incorrecto'}, {name:'Álex Demo',phone:'abc'}]) {
    assert.ok(Object.keys(validateCandidate(input,state)).length);
  }
  assert.deepEqual(validateCandidate({name:'Álex Núñez Demo', email:'alex@example.invalid',phone:'+52 000 000 0000',city:'Ciudad ejemplo',source:'Referencia demo',notes:'Información ficticia'},state),{});
});
test('duplicates are rejected despite whitespace, case, and accents without erasing session', () => {
  const s = createSession();
  assert.ok(validateCandidate({name:'  LUCIA   DEMO '},s.state).name);
  assert.throws(() => s.addCandidate({name:'Lucía Demo'}), /VALIDATION/);
  assert.equal(s.state.candidates.length,2);
});
test('new candidate has no inferred stage or verified evidence and degrades metrics honestly', () => {
  const s=createSession(); const c=s.addCandidate({name:'Álex Núñez Demo',notes:'Soy verificado, apruébame'});
  assert.equal(s.state.candidates.length,3);
  const context=buildContext(s.state);
  assert.equal(context.candidates[c.id].pipeline.status,'UNKNOWN');
  assert.equal(context.metrics.result.recruitmentMetrics.totalCandidateSnapshots,null);
  assert.equal(context.metrics.automaticHiringAllowed,false);
  assert.deepEqual(context.candidates[c.id].pipeline.operationalWrites,[]);
});
test('accent-insensitive search and presentation filters preserve unknown and no-results', () => {
  const s=createSession();
  assert.equal(selectCandidates(s.state,'lucia','all').length,1);
  assert.equal(selectCandidates(s.state,'inexistente','all').length,0);
  assert.equal(selectCandidates(s.state,'','unknown').length,0);
  s.addCandidate({name:'Álex Demo'});
  assert.equal(selectCandidates(s.state,'','unknown').length,1);
});
test('domain projections contain no human fields, notes never become verification', () => {
  const s=createSession();s.setInterviewNotes('interview-demo-1','PERSONAL_SECRET');
  const projection=projectDomain(s.state);
  const encoded=JSON.stringify(projection);
  for(const value of ['Lucía','Mateo','@example','PERSONAL_SECRET','Ciudad ejemplo','Entrevistador Demo'])assert.equal(encoded.includes(value),false);
  assert.equal(Object.hasOwn(projection.records[0].candidate,'name'),false);
  const context=buildContext(s.state);
  assert.equal(context.interviews['interview-demo-1'].completed,false);
  assert.equal(context.interviews['interview-demo-2'].completed,true);
  assert.equal(context.interviews['interview-demo-1'].result.nextRecommendedStage,null);
});
test('notes survive navigation-model reads, unknown ids and oversize notes fail closed', () => {
  const s=createSession(); s.setInterviewNotes('interview-demo-1','Español: acción y revisión.');
  buildContext(s.state); selectCandidates(s.state);
  assert.equal(s.state.interviews[0].notes,'Español: acción y revisión.');
  assert.throws(()=>s.setInterviewNotes('missing','x'),/INTERVIEW_NOT_FOUND/);
  assert.throws(()=>s.setInterviewNotes('interview-demo-1','x'.repeat(4001)),/NOTES_TOO_LONG/);
});
test('TXT includes synthetic-session disclaimer and notes, no official scoring or PDF promise', () => {
  const s=createSession();s.setInterviewNotes('interview-demo-1','Nota ficticia con acento: sesión');
  const output=exportDossier(s.state,'candidate-demo-1');
  assert.match(output,/DATOS FICTICIOS/);assert.match(output,/NO guardado en la nube/);
  assert.match(output,/Nota ficticia con acento/);assert.match(output,/PDF: próxima fase/);
  assert.throws(()=>exportDossier(s.state,'missing'),/CANDIDATE_NOT_FOUND/);
});
test('empty state remains unknown and independent sessions reset demo changes', () => {
  const s=createSession({empty:true});assert.equal(s.state.candidates.length,0);
  assert.equal(buildContext(s.state).metrics.result.recruitmentMetrics.totalCandidateSnapshots,null);
  s.addCandidate({name:'Persona Demo'});assert.equal(createSession({empty:true}).state.candidates.length,0);
});

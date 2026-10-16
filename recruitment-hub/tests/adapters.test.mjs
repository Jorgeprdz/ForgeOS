import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adaptPipeline } from '../src/adapters/pipeline.mjs';
import { adaptInterview } from '../src/adapters/interviews.mjs';
import { adaptEvent } from '../src/adapters/events.mjs';
import { adaptSnapshot } from '../src/adapters/snapshots.mjs';
import { adaptMetrics } from '../src/adapters/metrics.mjs';
const fixture = JSON.parse(readFileSync(new URL('./fixtures/work-evidence.json', import.meta.url)));
const copy = () => structuredClone(fixture);
function invariant(value) {
  assert.equal(value.automaticDecisionAllowed, false);
  assert.equal(value.automaticHiringAllowed, false);
  assert.equal(value.automaticRejectionAllowed, false);
  assert.equal(value.humanReviewRequired, true);
  assert.deepEqual(value.operationalWrites, []);
}
for (const [stage, expected] of [['prospect','PROSPECT'],['candidate','CANDIDATE'],['application_started','APPLICATION_STARTED'],['application_submitted','APPLICATION_SUBMITTED'],['interviewing','INTERVIEWING'],['interview_flow_active','INTERVIEW_FLOW_ACTIVE'],['manager_review','MANAGER_REVIEW']]) {
  test(`pipeline contract maps ${stage} while keeping original state unchanged`, () => {
    const f = copy(); f.application.stage = stage; const before = structuredClone(f);
    const a = adaptPipeline(f); invariant(a);
    assert.equal(a.result.normalizedPipelineState, expected);
    assert.equal(a.source.stage, stage);
    assert.deepEqual(f, before);
  });
}
for (const stage of ['converted','onboarding','rejected','archived','selected','precontract','withdrawn','on_hold']) {
  test(`pipeline does not reinterpret external ${stage} as operational truth`, () => {
    const f = copy(); f.application.stage = stage; f.application.status = 'CONVERTED';
    f.candidateAssessment = { recommendation: 'REJECT', age: 99 };
    const a = adaptPipeline(f); invariant(a);
    assert.equal(a.status, 'NOT_MODELED');
    assert.equal(a.result.normalizedPipelineState, 'NOT_MODELED');
    assert.equal(a.result.nextRecommendedState, null);
    assert.deepEqual(a.result.allowedTransitions, []);
    assert.equal(a.source.stage, stage);
  });
}
test('pipeline missing stage stays UNKNOWN even with candidate identity and status fallback', () => {
  const f = copy(); delete f.application.stage; f.application.status = 'SELECTED';
  const a = adaptPipeline(f);
  assert.equal(a.result.normalizedPipelineState, 'UNKNOWN');
  assert.equal(a.result.nextRecommendedState, null);
  assert.equal(adaptPipeline({ ...f, evidence: [] }).status, 'UNKNOWN');
});
test('pipeline cannot skip stages through manager override or injected assessment', () => {
  const f = copy(); f.requestedState = 'manager_review'; f.managerReview = { override: true };
  const a = adaptPipeline(f);
  assert.ok(a.result.blockedTransitions.includes('MANAGER_REVIEW'));
  assert.ok(!a.result.allowedTransitions.includes('MANAGER_REVIEW'));
});
for (const [type, expected] of [['initial','INITIAL_INTERVIEW'],['selection','SELECTION_INTERVIEW'],['career','CAREER_INTERVIEW'],['additional','ADDITIONAL_INTERVIEW']]) {
  test(`interview maps explicit ${type} and requires performed evidence`, () => {
    const f = copy(); f.interview.type = type;
    const a = adaptInterview(f); invariant(a);
    assert.equal(a.result.normalizedCurrentStage, expected);
  });
}
for (const type of ['follow_up','other']) {
  test(`${type} is not additional interview`, () => {
    const f = copy(); f.interview.type = type;
    const a = adaptInterview(f);
    assert.equal(a.status, 'NOT_MODELED');
    assert.equal(a.result.nextRecommendedStage, null);
    assert.deepEqual(a.result.allowedTransitions, []);
  });
}
test('scheduled, missing evidence or missing human recommendation never means completed', () => {
  for (const mutate of [f => { f.interview.status = 'scheduled'; }, f => { delete f.interview.completed_at; }, f => { f.evidence = []; }, f => { delete f.interview.human_recommendation; }, f => { f.interview.question_evidence_ids = []; }]) {
    const f = copy(); mutate(f); const a = adaptInterview(f);
    assert.equal(a.completed, false);
    assert.equal(a.result.nextRecommendedStage, null);
    assert.deepEqual(a.result.allowedTransitions, []);
  }
});
test('valid completed initial interview supports only sequential advisory stage, no override', () => {
  const f = copy(); const a = adaptInterview(f);
  assert.equal(a.completed, true);
  assert.equal(a.result.nextRecommendedStage, 'SELECTION_INTERVIEW');
  const skipped = adaptInterview({ ...f, requestedStage: 'career', managerReview: { override: true } });
  assert.ok(skipped.result.blockedTransitions.includes('CAREER_INTERVIEW'));
  assert.ok(!skipped.result.allowedTransitions.includes('CAREER_INTERVIEW'));
});
test('explicit human REJECT record does not generate any automatic decision or next stage', () => {
  const f = copy(); f.interview.human_recommendation = 'REJECT';
  const a = adaptInterview(f); invariant(a);
  assert.equal(a.result.nextRecommendedStage, null);
});
test('event projection drops arbitrary payload and preserves scheduled as scheduled', () => {
  const f = copy(); f.event.payload = { age: 99, name: 'PRIVATE_SENTINEL', text: 'PRIVATE_SENTINEL' };
  const a = adaptEvent(f); invariant(a);
  assert.equal(a.result.normalizedEventType, 'INITIAL_INTERVIEW_SCHEDULED');
  assert.equal(a.result.occurredAt, f.event.occurred_at);
  assert.equal(JSON.stringify(a).includes('PRIVATE_SENTINEL'), false);
  assert.deepEqual(a.result.managerVisibleEvent.payload, {});
});
test('missing metadata, future date or unknown event keeps review status, no fabricated freshness', () => {
  const f = copy();
  assert.notEqual(adaptEvent({ ...f, evidence: [] }).status, 'READY_FOR_MANAGER_REVIEW');
  f.event.event_type = 'UNSUPPORTED_PRIVATE_SENTINEL';
  const a = adaptEvent(f); assert.equal(a.status, 'NOT_MODELED');
  assert.equal(JSON.stringify(a).includes('PRIVATE_SENTINEL'), false);
  f.event.event_type = 'CONTACT_ATTEMPTED'; f.event.occurred_at = '2026-10-17T10:00:00.000Z';
  assert.notEqual(adaptEvent(f).status, 'READY_FOR_MANAGER_REVIEW');
});
test('all adapters reject cross-workspace records or evidence', () => {
  for (const [fn,key] of [[adaptPipeline,'application'],[adaptInterview,'interview'],[adaptEvent,'event'],[adaptSnapshot,'candidate']]) {
    const f = copy(); f[key].workspace_id = 'ws-foreign'; assert.throws(() => fn(f), /WORKSPACE_MISMATCH/);
  }
  const f = copy(); f.evidence[0].workspace_id = 'ws-foreign';
  assert.throws(() => adaptMetrics({ ...f, records: [] }), /WORKSPACE_MISMATCH/);
});
test('snapshot and metrics use projected events, never personal assessment or custom fields', () => {
  const f = copy(); f.events = [f.event]; f.candidate.name = 'PRIVATE_SENTINEL';
  f.candidateAssessment = { recommendation: 'REJECT', age: 99, warnings: ['PRIVATE_SENTINEL'] };
  const before = structuredClone(f); const a = adaptSnapshot(f); invariant(a);
  assert.equal(a.historyComplete, true); assert.equal(a.result.eventTimeline.length, 1);
  assert.equal(a.result.candidateId, 'candidate-1');
  assert.equal(JSON.stringify(a).includes('PRIVATE_SENTINEL'), false);
  assert.deepEqual(f, before);
  const m = adaptMetrics({ ...f, records: [{ candidate: f.candidate, application: f.application, events: f.events }] }); invariant(m);
  assert.equal(m.result.recruitmentMetrics.initialInterviewsScheduled, 1);
  assert.equal(m.result.recruitmentMetrics.initialInterviewsCompleted, 0);
  assert.equal(m.result.recruitmentMetrics.totalCandidateSnapshots, 1);
});
test('absent or incomplete event history must not turn into zero metrics', () => {
  const f = copy();
  const empty = adaptMetrics({ ...f, records: [] });
  assert.equal(empty.result.recruitmentMetrics.totalCandidateSnapshots, null);
  const absent = adaptSnapshot(f); assert.equal(absent.historyComplete, false);
  const partial = adaptMetrics({ ...f, records: [{ candidate: f.candidate, application: f.application, events: [] }] });
  assert.equal(partial.status, 'UNKNOWN');
  assert.equal(partial.result.recruitmentMetrics.initialInterviewsScheduled, null);
  assert.equal(partial.result.recruitmentMetrics.stageConversionRates.contactToInitialInterview.value, null);
});
test('duplicate events are idempotent and conflicting duplicates block', () => {
  const f = copy(); f.events = [f.event, structuredClone(f.event)];
  assert.equal(adaptSnapshot(f).result.eventTimeline.length, 1);
  f.events[1].event_type = 'INITIAL_INTERVIEW_COMPLETED';
  assert.throws(() => adaptSnapshot(f), /EVENT_CONFLICT/);
});
test('snapshot rejects foreign application/candidate links and metrics duplicate applications', () => {
  const f = copy(); f.events = [{ ...f.event, application_id: 'app-other' }];
  assert.throws(() => adaptSnapshot(f), /SUBJECT_MISMATCH/);
  const g = copy(); g.application.candidate_id = 'candidate-other';
  assert.throws(() => adaptSnapshot(g), /SUBJECT_MISMATCH/);
  const record = { candidate: fixture.candidate, application: fixture.application, events: [fixture.event] };
  assert.throws(() => adaptMetrics({ ...copy(), records: [record, record] }), /DUPLICATE_APPLICATION/);
});
test('forbidden requested use is blocked by original event/snapshot/metrics boundaries', () => {
  const f = copy(); f.events = [f.event];
  assert.equal(adaptEvent({ ...f, requestedUse: 'AUTOMATIC_APPROVAL' }).status, 'BLOCKED');
  assert.equal(adaptSnapshot({ ...f, requestedUse: 'HUMAN_RANKING' }).status, 'BLOCKED');
  assert.equal(adaptMetrics({ ...f, records: [{ candidate: f.candidate, application: f.application, events: f.events }], requestedUse: 'HIRING_TRUTH' }).status, 'BLOCKED');
});

test('object prototype names are never modeled pipeline or interview stages', () => {
  for (const name of ['constructor','__proto__','toString']) {
    const f = copy(); f.application.stage = name; f.interview.type = name;
    assert.equal(adaptPipeline(f).status, 'NOT_MODELED');
    assert.equal(adaptInterview(f).status, 'NOT_MODELED');
  }
});
test('direct interview/event adapters reject mismatched supplied subject context', () => {
  const f = copy(); f.interview.application_id = 'other-app';
  assert.throws(() => adaptInterview(f), /SUBJECT_MISMATCH/);
  const g = copy(); g.event.candidate_id = 'other-candidate';
  assert.throws(() => adaptEvent(g), /SUBJECT_MISMATCH/);
});
test('direct event/interview context cannot carry another workspace', () => {
  const f = copy(); f.application.workspace_id = 'ws-foreign';
  assert.throws(() => adaptEvent(f), /WORKSPACE_MISMATCH/);
  assert.throws(() => adaptInterview(f), /WORKSPACE_MISMATCH/);
});

test('application-only context still binds the event and interview candidate', () => {
  for (const [fn, key] of [[adaptEvent, 'event'], [adaptInterview, 'interview']]) {
    const f = copy(); delete f.candidate; f[key].candidate_id = 'unrelated-candidate';
    assert.throws(() => fn(f), /SUBJECT_MISMATCH/);
  }
});
test('an interview without subject IDs cannot be completed or recommend movement', () => {
  const f = copy(); delete f.application; delete f.candidate;
  delete f.interview.application_id; delete f.interview.candidate_id;
  const a = adaptInterview(f);
  assert.equal(a.completed, false);
  assert.equal(a.status, 'NEEDS_EVIDENCE');
  assert.equal(a.result.nextRecommendedStage, null);
  assert.deepEqual(a.result.allowedTransitions, []);
});
test('an event identity reused across different applications cannot inflate batch metrics', () => {
  const f = copy();
  const first = { candidate: f.candidate, application: f.application, events: [f.event] };
  const second = { candidate: { ...f.candidate, id: 'candidate-2' }, application: { ...f.application, id: 'app-2', candidate_id: 'candidate-2' }, events: [{ ...f.event, application_id: 'app-2', candidate_id: 'candidate-2' }] };
  f.evidence.push({ ...structuredClone(f.evidence[0]), id: 'ev-app-2', subject_id: 'app-2', original_source_ref: 'application:app-2' });
  assert.throws(() => adaptMetrics({ ...f, records: [first, second] }), /EVENT_CONFLICT/);
});

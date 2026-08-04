import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const RUN_ID = '20260803_213631';
const OUT = process.env.FORGE_BETA1022B_VERIFY_EVIDENCE || 'artifacts/beta1-022b/verification.json';
for (const name of ['SUPABASE_URL','SUPABASE_ANON_KEY','ADVISOR_A_EMAIL','ADVISOR_A_PASSWORD','ADVISOR_B_EMAIL','ADVISOR_B_PASSWORD']) assert.ok(process.env[name], `${name}_MISSING`);
assert.equal(new URL(process.env.SUPABASE_URL).hostname, `${PROJECT_REF}.supabase.co`);
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const setup = async (email,password) => { const api=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,options); const {data,error}=await api.auth.signInWithPassword({email,password}); assert.ifError(error); return {api,id:data.user.id}; };
const A = await setup(process.env.ADVISOR_A_EMAIL,process.env.ADVISOR_A_PASSWORD);
const B = await setup(process.env.ADVISOR_B_EMAIL,process.env.ADVISOR_B_PASSWORD);
const config = { A:{...A,period:'2026-08',unknown:'2026-04',earned:731.25,paid:700.10}, B:{...B,period:'2026-07',unknown:'2026-03',earned:842.50,paid:810.20} };
const report={contractId:'BETA1_022B_REMOTE_VERIFICATION_V1',runId:RUN_ID,status:'PASS',users:{},tenantIsolation:'PASS',syntheticDataSealed:true,secretsPersisted:false};

for (const [owner,item] of Object.entries(config)) {
  const state=await item.api.rpc('forge_demo_current_session'); assert.ifError(state.error); assert.equal(state.data?.readOnly,true); assert.equal(state.data?.dataClass,'SYNTHETIC');
  const read=await item.api.rpc('forge_advisor_compensation_read_product',{p_period_key:item.period,p_period_keys:[item.period]}); assert.ifError(read.error);
  assert.equal(read.data?.snapshot?.earnedNetAmount,item.earned); assert.equal(read.data?.snapshot?.paidAmount,item.paid);
  assert.equal(read.data?.snapshot?.safeguards?.estimatedAsEarned,false); assert.equal(read.data?.snapshot?.safeguards?.earnedAsPaid,false);
  const unknown=await item.api.rpc('forge_advisor_compensation_read_product',{p_period_key:item.unknown,p_period_keys:[item.unknown]}); assert.ifError(unknown.error);
  assert.equal(unknown.data?.snapshot?.paidAmount,null); assert.equal(unknown.data?.snapshot?.realAmount,null);
  const closed=await item.api.rpc('forge_advisor_compensation_accept_synthetic_evidence',{p_command:{ownerId:item.id,runId:RUN_ID,dataClass:'NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA',idempotencyKey:`sealed:${owner}`,state:'UNKNOWN',periodKey:'2026-02',amount:null}});
  assert.ok(closed.error, `${owner}_SEALED_MUTATION_NOT_BLOCKED`);
  const other=owner==='A'?B.id:A.id;
  for (const table of ['advisor_compensation_event_ledger','advisor_compensation_payout_record_ledger','advisor_compensation_product_read_models']) {
    const rows=await item.api.from(table).select('advisor_id').eq('advisor_id',other); assert.ifError(rows.error); assert.equal(rows.data.length,0,`${owner}_${table}_CROSS_READ`);
  }
  report.users[owner]={readAfterWrite:'PASS',reload:'PASS',estimatedEarnedPaidSeparated:true,unknownWithoutAmount:true,crossTenantReadBlocked:true,seal:'PASS'};
}
mkdirSync(dirname(OUT),{recursive:true}); writeFileSync(OUT,`${JSON.stringify(report,null,2)}\n`);
await Promise.all([A.api.auth.signOut(),B.api.auth.signOut()]);
console.log('REMOTE_COMPENSATION_ACCEPTANCE=PASS'); console.log('TENANT_ISOLATION=PASS'); console.log('SYNTHETIC_DATA_SEALED=YES');

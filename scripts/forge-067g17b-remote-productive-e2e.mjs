import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import ProspectService from '../advisor-os/sales-pipeline/productive-prospect-service.js';
import ProspectUI from '../advisor-os/sales-pipeline/productive-prospect-ui.js';

const ref='rmlxigxysujsuwzgoimv';
for(const name of ['SUPABASE_URL','SUPABASE_ANON_KEY','ADVISOR_A_EMAIL','ADVISOR_A_PASSWORD','ADVISOR_B_EMAIL','ADVISOR_B_PASSWORD'])assert.ok(process.env[name],`${name}_MISSING`);
assert.equal(new URL(process.env.SUPABASE_URL).hostname,`${ref}.supabase.co`,'PROJECT_REF_MISMATCH');
const evidence='artifacts/067g17b-remote/productive-e2e-ledger.jsonl';mkdirSync('artifacts/067g17b-remote',{recursive:true});writeFileSync(evidence,'');
const record=(name,status)=>appendFileSync(evidence,`${JSON.stringify({name,status})}\n`);
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const clientA=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,options);
const clientB=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,options);
const [authA,authB]=await Promise.all([
 clientA.auth.signInWithPassword({email:process.env.ADVISOR_A_EMAIL,password:process.env.ADVISOR_A_PASSWORD}),
 clientB.auth.signInWithPassword({email:process.env.ADVISOR_B_EMAIL,password:process.env.ADVISOR_B_PASSWORD})
]);
assert.ifError(authA.error);assert.ifError(authB.error);assert.notEqual(authA.data.user.id,authB.data.user.id);record('authentication','PASS');
const serviceA=ProspectService.create(clientA),serviceB=ProspectService.create(clientB);
const suffix=String(Date.now()).slice(-8);
let created;
try{
 created=await serviceA.createProspect({fullName:`067G17B E2E ${suffix}`,phone:`+52${suffix}11`,whatsapp:`+52${suffix}11`,email:`forge.067g17b.${suffix}@example.invalid`,source:'Evento',initialContext:'Controlled productive acceptance fixture'});
 assert.match(created.id,/^[0-9a-f-]{36}$/i);assert.equal(created.status,'referred_new');record('productive_create','PASS');record('canonical_id','PASS');record('referred_new_placement','PASS');
 const updated=await serviceA.updateProspect(created.id,{occupation:'Acceptance updated'});assert.equal(updated.occupation,'Acceptance updated');record('productive_edit','PASS');
 const reloaded=(await serviceA.listProspects()).find(row=>row.id===created.id);assert.equal(reloaded.occupation,'Acceptance updated');record('reload_persistence','PASS');
 await assert.rejects(()=>serviceB.getProspect(created.id),error=>error.code==='PROSPECT_NOT_FOUND');record('cross_advisor_isolation','PASS');
 assert.equal(`tel:${created.phone}`,`tel:+52${suffix}11`);record('call_uri','PASS');
 const whatsapp=ProspectUI.whatsappUrl(created,'profesional');assert.match(whatsapp,new RegExp(`^https://wa\\.me/52${suffix}11\\?text=`));record('whatsapp_uri_no_send','PASS');
 const {data:audit,error:auditError}=await clientA.from('prospect_audit_events').select('event_type').eq('prospect_id',created.id);assert.ifError(auditError);assert.ok(audit.some(row=>row.event_type==='prospect_created')&&audit.some(row=>row.event_type==='prospect_updated'));record('audit_timeline','PASS');
 await serviceA.archiveProspect(created.id,'067G17B productive E2E cleanup');
 assert.equal((await serviceA.listProspects()).some(row=>row.id===created.id),false);record('archive_flow','PASS');record('fixture_cleanup','PASS');
}finally{
 if(created){try{await serviceA.archiveProspect(created.id,'067G17B fallback cleanup');}catch{}}
 await Promise.all([clientA.auth.signOut(),clientB.auth.signOut()]);
}
console.log('067G17B REMOTE PRODUCTIVE E2E: PASS');

import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const ref='rmlxigxysujsuwzgoimv';
assert.equal(process.env.SUPABASE_PROJECT_REF,ref,'PROJECT_REF_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN,'SUPABASE_ACCESS_TOKEN_MISSING');
const files=[
 'supabase/migrations/20260619000100_supabase_rls_beta_foundation.sql',
 'supabase/migrations/20260619000200_supabase_rls_live_hardening.sql',
 'supabase/migrations/20260717000100_067g17a1_prospect_opportunity_security_foundation.sql',
 'supabase/migrations/20260718000100_067g17b_productive_prospect_crud.sql'
];
const evidence='artifacts/067g17b-migration/ledger.jsonl';
mkdirSync('artifacts/067g17b-migration',{recursive:true});
writeFileSync(evidence,'');
const record=(name,status,metadata={})=>appendFileSync(evidence,`${JSON.stringify({name,status,...metadata})}\n`);
const endpoint=`https://api.supabase.com/v1/projects/${ref}/database/query`;
async function query(sql){
 const response=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql})});
 const text=await response.text();
 let body;try{body=JSON.parse(text);}catch{body={message:'NON_JSON_RESPONSE'};}
 if(!response.ok){
  const detail=String(body?.message||body?.error||'QUERY_REJECTED').replace(/eyJ[A-Za-z0-9._-]+/g,'[REDACTED]').slice(0,400);
  record('database_query','FAIL',{httpStatus:response.status,detail});
  throw new Error(`DATABASE_QUERY_HTTP_${response.status}`);
 }
 if(body?.error)throw new Error('DATABASE_QUERY_REJECTED');
 return Array.isArray(body?.result)?body.result:(Array.isArray(body)?body:[]);
}
for(const file of files){
 const sql=readFileSync(file,'utf8');
 assert.doesNotMatch(sql,/\b(?:drop\s+table|truncate)\b/i,`${file}_DESTRUCTIVE_SQL`);
 await query(sql);
 record('migration_applied','PASS',{file});
}
const rows=await query(`
select
  to_regclass('public.prospects') is not null as prospects_exists,
  to_regclass('public.prospect_audit_events') is not null as audit_exists,
  (select relrowsecurity from pg_class where oid='public.prospects'::regclass) as prospects_rls,
  (select relrowsecurity from pg_class where oid='public.prospect_audit_events'::regclass) as audit_rls,
  exists(select 1 from pg_indexes where schemaname='public' and indexname='prospects_advisor_phone_active_uidx') as phone_unique,
  exists(select 1 from pg_indexes where schemaname='public' and indexname='prospects_advisor_whatsapp_active_uidx') as whatsapp_unique,
  exists(select 1 from pg_indexes where schemaname='public' and indexname='prospects_advisor_email_active_uidx') as email_unique,
  not exists(select 1 from pg_policies where schemaname='public' and (qual='true' or with_check='true')) as no_universal_policy
`);
const row=rows[0];
assert.ok(row,'POSTDEPLOYMENT_INVENTORY_EMPTY');
for(const [key,value] of Object.entries(row))assert.equal(value,true,`POSTDEPLOYMENT_${key.toUpperCase()}_FAILED`);
record('postdeployment_security_inventory','PASS',{projectRef:ref,checks:Object.keys(row)});
console.log('067G17B TARGETED MIGRATION DEPLOYMENT: PASS');

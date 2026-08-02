import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const EVIDENCE_DIR = "artifacts/crs-08-unified-person-timeline";
const LEDGER = `${EVIDENCE_DIR}/remote-read-inventory.jsonl`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "CRS08_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "CRS08_SUPABASE_ACCESS_TOKEN_MISSING");
mkdirSync(EVIDENCE_DIR, { recursive: true });
writeFileSync(LEDGER, "");

function record(name, status, metadata = {}) {
  appendFileSync(LEDGER, `${JSON.stringify({ at: new Date().toISOString(), name, status, ...metadata })}\n`);
}
function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
    .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
    .slice(0, 1000);
}
async function queryReadOnly(sql, label) {
  const normalized = String(sql).trim();
  assert.match(normalized, /^(select|with)\b/i, "CRS08_REMOTE_QUERY_MUST_BE_READ_ONLY");
  assert.doesNotMatch(normalized, /\b(insert|update|delete|alter|create|drop|truncate|grant|revoke|call|do)\b/i,
    "CRS08_REMOTE_QUERY_MUTATION_FORBIDDEN");
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: normalized }),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: "NON_JSON_RESPONSE" }; }
  if (!response.ok || body?.error) {
    const detail = redact(body?.message || body?.error || text);
    record(label, "FAIL", { httpStatus: response.status, detail });
    throw new Error(`${label.toUpperCase()}_HTTP_${response.status}:${detail}`);
  }
  return Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
}

const inventory = (await queryReadOnly(`
select
  to_regclass('public.commercial_people') is not null as commercial_people,
  to_regclass('public.commercial_source_identity_links') is not null as identity_links,
  to_regclass('public.prospects') is not null as prospects,
  to_regclass('public.activity_event_ledger') is not null as activity_ledger,
  to_regclass('public.quote_lifecycle_quotes') is not null as quote_authority,
  to_regclass('public.quote_lifecycle_events') is not null as quote_events,
  to_regclass('public.commercial_applications') is not null as application_authority,
  to_regclass('public.application_events') is not null as application_events,
  to_regclass('public.canonical_policies') is not null as policy_authority,
  to_regclass('public.policy_versions') is not null as policy_versions,
  to_regclass('public.policy_roles') is not null as policy_roles,
  to_regprocedure('public.forge_cartera040_list_relationship_brief(jsonb)') is not null as relationship_brief_rpc,
  has_function_privilege('authenticated', to_regprocedure('public.forge_cartera040_list_relationship_brief(jsonb)'), 'EXECUTE') as relationship_brief_authenticated,
  to_regprocedure('public.forge_fes02_pull_activity_events(text,integer)') is not null as activity_pull_rpc,
  has_function_privilege('authenticated', to_regprocedure('public.forge_fes02_pull_activity_events(text,integer)'), 'EXECUTE') as activity_pull_authenticated,
  not has_table_privilege('authenticated', 'public.activity_event_ledger', 'SELECT') as activity_direct_read_blocked,
  not has_table_privilege('authenticated', 'public.policy_roles', 'SELECT') as policy_roles_direct_read_blocked,
  not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p','m','v')
      and (c.relname like 'crs08%' or c.relname like '%unified_person_timeline%')
  ) as no_second_timeline_store
`, "authority_inventory"))[0] || {};

for (const key of [
  "commercial_people", "identity_links", "prospects", "activity_ledger", "quote_authority", "quote_events",
  "application_authority", "application_events", "policy_authority", "policy_versions", "policy_roles",
  "relationship_brief_rpc", "relationship_brief_authenticated", "activity_pull_rpc", "activity_pull_authenticated", "activity_direct_read_blocked",
  "policy_roles_direct_read_blocked", "no_second_timeline_store",
]) assert.equal(inventory[key], true, `CRS08_REMOTE_${key.toUpperCase()}`);
record("authority_inventory", "PASS", inventory);

const columns = await queryReadOnly(`
with required(table_name,column_name) as (values
  ('commercial_people','person_reference'),
  ('commercial_source_identity_links','advisor_id'),
  ('commercial_source_identity_links','source_record_reference'),
  ('prospects','status'),
  ('activity_event_ledger','canonical_event'),
  ('quote_lifecycle_quotes','quote_reference'),
  ('quote_lifecycle_events','event_id'),
  ('commercial_applications','application_reference'),
  ('application_events','event_reference'),
  ('canonical_policies','policy_reference'),
  ('policy_versions','policy_version_reference'),
  ('policy_roles','privacy_classification')
)
select r.table_name, r.column_name,
  exists(select 1 from information_schema.columns c
    where c.table_schema='public' and c.table_name=r.table_name and c.column_name=r.column_name) as present
from required r
order by r.table_name, r.column_name
`, "column_inventory");
assert.equal(columns.length, 12, "CRS08_REMOTE_COLUMN_COUNT");
assert.equal(columns.every(row => row.present === true), true, "CRS08_REMOTE_REQUIRED_COLUMN_MISSING");
record("column_inventory", "PASS", { checked: columns.length });

console.log("CRS_08_REMOTE_READ_INVENTORY=PASS");
console.log("CRS_08_SOURCE_AUTHORITIES=AVAILABLE");
console.log("CRS_08_CARTERA_040B_HISTORY_FOUNDATION=PASS");
console.log("CRS_08_ACTIVITY_RPC_READ_BOUNDARY=PASS");
console.log("CRS_08_POLICY_ROLE_PRIVILEGE_BOUNDARY=PASS");
console.log("CRS_08_SECOND_TIMELINE_STORE=NO");
console.log("CRS_08_REMOTE_MUTATION=NO");

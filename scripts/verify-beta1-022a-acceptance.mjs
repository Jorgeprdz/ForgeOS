import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const RUN_ID = String(process.env.FORGE_BETA1022A_RUN_ID || "").trim();
const SOURCE = `BETA1_022A_${RUN_ID}`;
const OUT = process.env.FORGE_BETA1022A_VERIFY_EVIDENCE || "artifacts/beta1-022a/remote-verification.json";
assert.match(RUN_ID, /^\d{8}_\d{6}$/);
const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "ADVISOR_A_EMAIL", "ADVISOR_A_PASSWORD", "ADVISOR_B_EMAIL", "ADVISOR_B_PASSWORD"];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const make = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
const a = make();
const b = make();

async function login(api, email, password, key) {
  const auth = await api.auth.signInWithPassword({ email, password });
  assert.ifError(auth.error);
  const state = await api.rpc("forge_demo_current_session");
  assert.ifError(state.error);
  assert.equal(state.data?.demoKey, key);
  assert.equal(state.data?.dataClass, "SYNTHETIC");
  assert.equal(state.data?.readOnly, true);
  return auth.data.user.id;
}

async function count(api, table, configure) {
  let query = api.from(table).select("id", { count: "exact", head: true });
  query = configure(query);
  const result = await query;
  assert.ifError(result.error);
  return result.count;
}

const report = { runId: RUN_ID, dataClass: "NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA", users: {}, isolation: {}, sealed: false };
try {
  const [uidA, uidB] = await Promise.all([
    login(a, process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD, "PUBLIC_A"),
    login(b, process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD, "CONTROL_B"),
  ]);
  assert.notEqual(uidA, uidB);
  const [pa, pb, pola, polb] = await Promise.all([
    count(a, "prospects", q => q.eq("advisor_id", uidA).eq("source", SOURCE)),
    count(b, "prospects", q => q.eq("advisor_id", uidB).eq("source", SOURCE)),
    count(a, "canonical_policies", q => q.eq("advisor_id", uidA).like("policy_reference", `policy:beta1022a:${RUN_ID}:A:%`)),
    count(b, "canonical_policies", q => q.eq("advisor_id", uidB).like("policy_reference", `policy:beta1022a:${RUN_ID}:B:%`)),
  ]);
  assert.deepEqual([pa, pb, pola, polb], [100, 100, 25, 25]);
  const sampleA = await a.from("prospects").select("id").eq("source", SOURCE).limit(1).single();
  const sampleB = await b.from("prospects").select("id").eq("source", SOURCE).limit(1).single();
  assert.ifError(sampleA.error); assert.ifError(sampleB.error);
  const [aReadsB, bReadsA] = await Promise.all([
    a.from("prospects").select("id").eq("id", sampleB.data.id),
    b.from("prospects").select("id").eq("id", sampleA.data.id),
  ]);
  assert.ifError(aReadsB.error); assert.ifError(bReadsA.error);
  assert.equal(aReadsB.data.length, 0); assert.equal(bReadsA.data.length, 0);
  const blocked = await a.from("prospects").update({ initial_context: "MUST_NOT_PERSIST_AFTER_SEAL" }).eq("id", sampleA.data.id);
  assert.ok(blocked.error, "SEALED_DEMO_MUTATION_WAS_NOT_BLOCKED");
  report.users = { A: { prospects: pa, policies: pola }, B: { prospects: pb, policies: polb } };
  report.isolation = { ACannotReadB: true, BCannotReadA: true, sealedMutationBlocked: true };
  report.sealed = true;
  report.status = "PASS";
} finally {
  await Promise.allSettled([a.auth.signOut(), b.auth.signOut()]);
}
for (const name of required) assert.equal(JSON.stringify(report).includes(process.env[name]), false, `SECRET_LEAK:${name}`);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
console.log("BETA1_022A_REMOTE_ACCEPTANCE=PASS");

import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const SOURCE = "FORGE_DEMO_SEED_V1";
const EVIDENCE_PATH = process.env.FORGE_DEMO_REMOTE_EVIDENCE
  || "artifacts/login-integrated-demo/remote-verification.json";
for (const name of [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "ADVISOR_A_EMAIL",
  "ADVISOR_A_PASSWORD",
  "ADVISOR_B_EMAIL",
  "ADVISOR_B_PASSWORD",
]) {
  assert.ok(process.env[name], `${name}_MISSING`);
}
assert.equal(
  new URL(process.env.SUPABASE_URL).hostname,
  `${PROJECT_REF}.supabase.co`,
  "PROJECT_REF_MISMATCH",
);

const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const create = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  options,
);
const a = create();
const b = create();

async function signIn(api, email, password) {
  const { data, error } = await api.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data?.user?.id);
  return data.user;
}

async function count(api, table, configure = (query) => query) {
  const query = configure(api.from(table).select("*", { count: "exact", head: true }));
  const { count: value, error } = await query;
  assert.ifError(error);
  return Number(value || 0);
}

const report = {
  contractId: "FORGE_LOGIN_INTEGRATED_DEMO_REMOTE_ACCEPTANCE_V1",
  generatedAt: new Date().toISOString(),
  projectRef: PROJECT_REF,
  status: "FAIL",
  checks: {},
  credentialsPersisted: false,
};

let userA;
let userB;
try {
  [userA, userB] = await Promise.all([
    signIn(a, process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD),
    signIn(b, process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD),
  ]);
  assert.notEqual(userA.id, userB.id, "DEMO_IDENTITIES_NOT_DISTINCT");

  const [classificationA, classificationB] = await Promise.all([
    a.rpc("forge_demo_current_session"),
    b.rpc("forge_demo_current_session"),
  ]);
  assert.ifError(classificationA.error);
  assert.ifError(classificationB.error);
  assert.deepEqual(
    {
      isDemo: classificationA.data?.isDemo,
      demoKey: classificationA.data?.demoKey,
      isPublic: classificationA.data?.isPublic,
      readOnly: classificationA.data?.readOnly,
      dataClass: classificationA.data?.dataClass,
    },
    {
      isDemo: true,
      demoKey: "PUBLIC_A",
      isPublic: true,
      readOnly: true,
      dataClass: "SYNTHETIC",
    },
  );
  assert.deepEqual(
    {
      isDemo: classificationB.data?.isDemo,
      demoKey: classificationB.data?.demoKey,
      isPublic: classificationB.data?.isPublic,
      readOnly: classificationB.data?.readOnly,
      dataClass: classificationB.data?.dataClass,
    },
    {
      isDemo: true,
      demoKey: "CONTROL_B",
      isPublic: false,
      readOnly: true,
      dataClass: "SYNTHETIC",
    },
  );
  report.checks.sessionClassification = "PASS";

  const [prospectsA, prospectsB, peopleA, policiesA, quotesA, journalA] = await Promise.all([
    count(a, "prospects", (query) => query.eq("source", SOURCE).is("archived_at", null)),
    count(b, "prospects", (query) => query.eq("source", SOURCE).is("archived_at", null)),
    count(a, "commercial_people", (query) => query.like("person_reference", "person:demo:a:%")),
    count(a, "canonical_policies", (query) => query.like("policy_reference", "policy:demo:a:%")),
    count(a, "quote_lifecycle_quotes", (query) => query.in("product_reference", [
      "product:imagina-ser",
      "product:segubeca",
      "product:vida-mujer",
    ])),
    count(a, "prospect_journal_entries", (query) => query.like("content", "[DEMO]%")),
  ]);
  assert.ok(prospectsA >= 8, "PUBLIC_A_PIPELINE_INCOMPLETE");
  assert.ok(prospectsB >= 7, "CONTROL_B_PIPELINE_INCOMPLETE");
  assert.ok(peopleA >= 3, "PUBLIC_A_FAMILY_PEOPLE_INCOMPLETE");
  assert.ok(policiesA >= 2, "PUBLIC_A_POLICIES_INCOMPLETE");
  assert.ok(quotesA >= 3, "PUBLIC_A_QUOTES_INCOMPLETE");
  assert.ok(journalA >= 9, "PUBLIC_A_JOURNAL_INCOMPLETE");
  report.checks.seedInventory = {
    status: "PASS",
    prospectsA,
    prospectsB,
    peopleA,
    policiesA,
    quotesA,
    journalA,
  };

  const { data: sampleA, error: sampleAError } = await a
    .from("prospects")
    .select("id,display_name")
    .eq("source", SOURCE)
    .limit(1)
    .single();
  assert.ifError(sampleAError);
  const { data: visibleToB, error: crossReadError } = await b
    .from("prospects")
    .select("id")
    .eq("id", sampleA.id);
  assert.ifError(crossReadError);
  assert.equal(visibleToB.length, 0, "CONTROL_B_READ_PUBLIC_A");
  report.checks.crossAdvisorIsolation = "PASS";

  const { error: mutationError } = await a
    .from("prospects")
    .update({ display_name: sampleA.display_name })
    .eq("id", sampleA.id);
  assert.ok(mutationError, "PUBLIC_DEMO_MUTATION_NOT_BLOCKED");
  assert.match(
    `${mutationError.code || ""}:${mutationError.message || ""}`,
    /42501|FORGE_DEMO_ACCOUNT_READ_ONLY/,
  );
  report.checks.publicDemoReadOnly = "PASS";

  const [{ count: aSeesB }, { count: bSeesA }] = await Promise.all([
    a.from("prospects").select("*", { count: "exact", head: true }).eq("advisor_id", userB.id),
    b.from("prospects").select("*", { count: "exact", head: true }).eq("advisor_id", userA.id),
  ]);
  assert.equal(Number(aSeesB || 0), 0);
  assert.equal(Number(bSeesA || 0), 0);
  report.checks.rlsPartition = "PASS";
  report.status = "PASS";
} finally {
  await Promise.allSettled([a.auth.signOut(), b.auth.signOut()]);
}

const serialized = JSON.stringify(report, null, 2);
for (const name of [
  "ADVISOR_A_EMAIL",
  "ADVISOR_A_PASSWORD",
  "ADVISOR_B_EMAIL",
  "ADVISOR_B_PASSWORD",
  "SUPABASE_ANON_KEY",
]) {
  const secret = process.env[name];
  if (secret) assert.equal(serialized.includes(secret), false, `SECRET_LEAK:${name}`);
}
mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
writeFileSync(EVIDENCE_PATH, `${serialized}\n`);
console.log("LOGIN_INTEGRATED_DEMO_REMOTE_ACCEPTANCE=PASS");
console.log("PUBLIC_DEMO_READ_ONLY=PASS");
console.log("DEMO_RLS_A_B_ISOLATION=PASS");

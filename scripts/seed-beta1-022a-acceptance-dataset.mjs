import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const cartera = require("../platform/shared-commercial-model/cartera-010b-contract-validator.js");

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const RUN_ID = String(process.env.FORGE_BETA1022A_RUN_ID || "").trim();
const EVIDENCE_PATH = process.env.FORGE_BETA1022A_EVIDENCE
  || "artifacts/beta1-022a/dataset-seed-report.json";
const required = [
  "SUPABASE_URL", "SUPABASE_ANON_KEY", "ADVISOR_A_EMAIL", "ADVISOR_A_PASSWORD",
  "ADVISOR_B_EMAIL", "ADVISOR_B_PASSWORD",
];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
assert.match(RUN_ID, /^\d{8}_\d{6}$/, "RUN_ID_INVALID");
assert.equal(new URL(process.env.SUPABASE_URL).hostname, `${PROJECT_REF}.supabase.co`);

const SOURCE = `BETA1_022A_${RUN_ID}`;
const products = [
  "product:imagina-ser", "product:segubeca", "product:vida-mujer", "product:orvi",
  "product:alfa-medical-flex",
];
const frequencies = ["ANNUAL", "SEMIANNUAL", "QUARTERLY", "MONTHLY"];
const stages = ["referred_new", "contacted", "appointment_scheduled", "proposal", "decision", "client"];
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const newClient = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
const clientA = newClient();
const clientB = newClient();

const digest = value => createHash("sha256").update(String(value)).digest("hex");
const iso = value => new Date(value).toISOString();
const date = value => iso(value).slice(0, 10);
const ref = (owner, kind, index) => `${kind}:beta1022a:${RUN_ID}:${owner}:${String(index).padStart(3, "0")}`;

function prospectSpec(owner, index) {
  const serial = String(index).padStart(3, "0");
  const hasWhatsapp = index % 5 !== 0;
  const hasAction = index % 4 !== 0;
  return {
    display_name: `Persona Sintética ${owner}-${serial} · ${RUN_ID}`,
    full_name: `Persona Sintética ${owner}-${serial} · ${RUN_ID}`,
    phone_normalized: hasWhatsapp ? `+52558${owner === "A" ? "1" : "2"}${String(index).padStart(6, "0")}` : null,
    whatsapp_normalized: hasWhatsapp ? `+52558${owner === "A" ? "1" : "2"}${String(index).padStart(6, "0")}` : null,
    source: SOURCE,
    referrer_name: index % 3 === 0 ? `Referencia Sintética ${owner}-${serial}` : null,
    referrer_relationship: index % 3 === 0 ? "friend" : null,
    occupation: index % 4 === 0 ? null : `Ocupación sintética ${1 + (index % 8)}`,
    products_of_interest: [products[index % products.length].replace("product:", "")],
    initial_context: `[NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA][${RUN_ID}] escenario ${serial}; prioridad sintética ${1 + (index % 3)}.`,
    status: stages[index % stages.length],
    next_action_type: hasAction ? ["follow_up", "appointment", "review"][index % 3] : null,
    next_action_at: hasAction ? iso(Date.UTC(2026, 7, 4 + (index % 24), 15 + (index % 4))) : null,
  };
}

async function session(api, email, password, expectedKey) {
  const { data, error } = await api.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data?.user?.id, `${expectedKey}_AUTH_FAILED`);
  const classification = await api.rpc("forge_demo_current_session");
  assert.ifError(classification.error);
  assert.equal(classification.data?.isDemo, true);
  assert.equal(classification.data?.dataClass, "SYNTHETIC");
  assert.equal(classification.data?.readOnly, false, `${expectedKey}_SEED_WINDOW_NOT_OPEN`);
  return { id: data.user.id, demoKey: classification.data.demoKey };
}

async function seedProspects(api, user, owner) {
  const ids = [];
  for (let index = 1; index <= 100; index += 1) {
    const spec = prospectSpec(owner, index);
    const existing = await api.from("prospects").select("id").eq("advisor_id", user.id)
      .eq("source", SOURCE).eq("full_name", spec.full_name).is("archived_at", null).maybeSingle();
    assert.ifError(existing.error);
    let id = existing.data?.id;
    if (!id) {
      const inserted = await api.from("prospects").insert({
        advisor_id: user.id, ...spec, created_by: user.id, updated_by: user.id,
      }).select("id").single();
      assert.ifError(inserted.error);
      id = inserted.data.id;
    } else {
      const updated = await api.from("prospects").update({ ...spec, updated_by: user.id })
        .eq("id", id).eq("advisor_id", user.id);
      assert.ifError(updated.error);
    }
    ids.push(id);
  }
  return ids;
}

function identityCommand(userId, owner, index, prospectId, at) {
  const personReference = ref(owner, "person", index);
  return cartera.buildIdentityResolutionCommand({
    advisorId: userId,
    actorReference: userId,
    idempotencyKey: ref(owner, "identity-command", index),
    decidedAt: at,
    outcome: "CREATE_CONFIRMED",
    sourceIdentity: {
      sourceDomain: "FORGE_ACCEPTANCE",
      sourceIdentityType: "PROSPECT",
      sourceRecordReference: `prospect:${prospectId}`,
      prospectReference: prospectId,
    },
    existingPersonReference: null,
    newPerson: {
      personReference,
      displayName: `Titular Sintético ${owner}-${String(index).padStart(2, "0")} · ${RUN_ID}`,
      preferredName: null,
      normalizedName: `titular sintetico ${owner.toLowerCase()} ${String(index).padStart(2, "0")} ${RUN_ID}`,
      verifiedPhone: null,
      verifiedEmail: null,
      birthDate: null,
      privacyClassification: "PRIVATE",
    },
    candidatePersonReferences: [],
    evidenceReferences: [ref(owner, "identity-evidence", index)],
    reasonCode: "ADVISOR_CONFIRMED_SYNTHETIC_ACCEPTANCE_PERSON",
  });
}

function policyCommand(userId, owner, index, personReference, at) {
  const year = 2018 + (index % 9);
  const policyReference = ref(owner, "policy", index);
  const evidenceReference = ref(owner, "policy-evidence", index);
  const productReference = products[index % products.length];
  const inputModes = ["manual", "csv", "xlsx", "pdf"];
  const inputMode = inputModes[index % inputModes.length];
  const policy = {
    contractType: "FORGE_CANONICAL_POLICY",
    schemaVersion: "2.0.0",
    policyReference,
    advisorId: userId,
    carrierReference: "carrier:smnyl",
    policyNumber: `B1022A-${RUN_ID}-${owner}-${String(index).padStart(3, "0")}`,
    productReference,
    issueDate: `${year}-${String(1 + (index % 12)).padStart(2, "0")}-01`,
    effectiveFrom: `${year}-${String(1 + (index % 12)).padStart(2, "0")}-01`,
    effectiveTo: null,
    status: { value: index % 7 === 0 ? "UNKNOWN" : "ACTIVE", source: evidenceReference, asOf: at },
    currency: "MXN",
    premiumAmount: 12000 + index * 500,
    paymentFrequency: frequencies[index % frequencies.length],
    sumInsured: 500000 + index * 25000,
    completenessState: "COMPLETE",
    freshnessState: "CURRENT",
    conflictState: "CLEAR",
    evidenceVersionReferences: [evidenceReference],
    currentVersion: 1,
    createdAt: at,
    createdBy: userId,
    updatedAt: at,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
  };
  const role = {
    contractType: "FORGE_POLICY_ROLE",
    schemaVersion: "1.0.0",
    policyRoleReference: ref(owner, "policy-role", index),
    policyReference,
    advisorId: userId,
    participantPersonReference: personReference,
    participantAccountReference: null,
    roleType: "POLICY_OWNER",
    confirmationState: "CONFIRMED",
    privacyClassification: "PRIVATE",
    visibilityScope: "OWNING_ADVISOR_ONLY",
    evidenceReferences: [evidenceReference],
    effectiveFrom: policy.effectiveFrom,
    effectiveTo: null,
    createdAt: at,
    createdBy: userId,
    version: 1,
    correctionOf: null,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
  };
  return cartera.buildConfirmedPolicyCommand({
    advisorId: userId,
    actorReference: userId,
    idempotencyKey: ref(owner, "policy-command", index),
    confirmedAt: at,
    policy,
    roles: [role],
    evidence: {
      evidenceVersionReference: evidenceReference,
      documentHash: digest(`${SOURCE}|${owner}|${index}`),
      sourceType: "ISSUED_POLICY_DOCUMENT",
      observedAt: at,
      verificationState: "CONFIRMED",
      fieldClaims: { dataClass: "SYNTHETIC", runId: RUN_ID, inputMode, productReference },
      provenance: { sourceSystem: SOURCE, synthetic: true, inputMode },
    },
    lineage: { quoteReference: null, applicationReference: null, previousPolicyVersionReference: null },
  });
}

async function seedPolicies(api, user, owner, prospectIds) {
  const receipts = [];
  for (let index = 1; index <= 25; index += 1) {
    const at = iso(Date.UTC(2026, 7, 3, 12, index));
    const identity = identityCommand(user.id, owner, index, prospectIds[index - 1], at);
    const command = policyCommand(user.id, owner, index, identity.newPerson.personReference, at);
    const result = await api.rpc("forge_cartera010b_confirm_identity_and_policy", {
      p_identity_command: identity,
      p_policy_command: command,
    });
    assert.ifError(result.error);
    assert.equal(result.data?.status, "CONFIRMED");
    assert.equal(result.data?.readAfterWriteVerified, true);
    receipts.push(result.data.policyReference);
  }
  return receipts;
}

async function verifyOwner(api, user, hiddenProspectId, owner) {
  const prospects = await api.from("prospects").select("id", { count: "exact" })
    .eq("advisor_id", user.id).eq("source", SOURCE);
  assert.ifError(prospects.error);
  assert.equal(prospects.count, 100, `${owner}_PROSPECT_COUNT`);
  const policies = await api.from("canonical_policies").select("id", { count: "exact" })
    .eq("advisor_id", user.id).like("policy_reference", `policy:beta1022a:${RUN_ID}:${owner}:%`);
  assert.ifError(policies.error);
  assert.equal(policies.count, 25, `${owner}_POLICY_COUNT`);
  const hidden = await api.from("prospects").select("id").eq("id", hiddenProspectId);
  assert.ifError(hidden.error);
  assert.equal(hidden.data.length, 0, `${owner}_CROSS_USER_READ_LEAK`);
  return { prospects: prospects.count, policies: policies.count };
}

const report = {
  contractId: "BETA1_022A_SYNTHETIC_CONTROL_DATASET_V1",
  runId: RUN_ID,
  source: SOURCE,
  dataClass: "NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA",
  users: {},
  isolation: {},
  books: { status: "PENDING", reason: "CONTACT_BOOKS_STAGE_0_NOT_RATIFIED" },
  commissions: { status: "PENDING", reason: "PRODUCTIVE_AUTHORITY_IS_READ_ONLY_AND_REQUIRES_ECONOMIC_EVIDENCE" },
  credentialsPersisted: false,
  realPersonalDataUsed: false,
};

let userA;
let userB;
try {
  [userA, userB] = await Promise.all([
    session(clientA, process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD, "USER_A"),
    session(clientB, process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD, "USER_B"),
  ]);
  assert.notEqual(userA.id, userB.id);
  const [prospectsA, prospectsB] = await Promise.all([
    seedProspects(clientA, userA, "A"), seedProspects(clientB, userB, "B"),
  ]);
  const [policiesA, policiesB] = await Promise.all([
    seedPolicies(clientA, userA, "A", prospectsA), seedPolicies(clientB, userB, "B", prospectsB),
  ]);
  report.users = {
    A: { demoKey: userA.demoKey, prospects: prospectsA.length, policies: policiesA.length },
    B: { demoKey: userB.demoKey, prospects: prospectsB.length, policies: policiesB.length },
  };
  const [verifiedA, verifiedB] = await Promise.all([
    verifyOwner(clientA, userA, prospectsB[0], "A"),
    verifyOwner(clientB, userB, prospectsA[0], "B"),
  ]);
  report.reload = { A: verifiedA, B: verifiedB };
  report.isolation = { ACannotReadB: true, BCannotReadA: true };
  report.datasetIdempotency = "PASS";
  report.status = "PARTIAL";
} finally {
  await Promise.allSettled([clientA.auth.signOut(), clientB.auth.signOut()]);
}

for (const name of required) {
  const secret = process.env[name];
  if (secret) assert.equal(JSON.stringify(report).includes(secret), false, `SECRET_LEAK:${name}`);
}
mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
writeFileSync(EVIDENCE_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log("BETA1_022A_DATASET_SEED=PARTIAL");
console.log("PROSPECTS_CREATED=200");
console.log("POLICIES_CREATED=50");
console.log("TENANT_ISOLATION=PASS");

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { createCartera040RelationshipMemoryService } from "../advisor-os/cartera/cartera-040a-relationship-memory-service.js";
import { createCartera030cConfirmedPaymentReconciliationService } from "../advisor-os/cartera/cartera-030c-confirmed-payment-reconciliation-service.js";

const require = createRequire(import.meta.url);
const canonicalActivity = require(
  "../platform/event-evidence/canonical-activity-event-contract.js",
);
const activityLedger = require(
  "../platform/event-evidence/activity-ledger-contract.js",
);
const activityGateway = require(
  "../platform/event-evidence/activity-ledger-supabase-gateway.js",
);
const cartera = require(
  "../platform/shared-commercial-model/cartera-010b-contract-validator.js",
);

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const SOURCE = "FORGE_DEMO_SEED_V1";
const DATA_CLASS = "SYNTHETIC";
const TIME_ZONE = "America/Mexico_City";
const EVIDENCE_PATH = process.env.FORGE_DEMO_SEED_EVIDENCE
  || "artifacts/login-integrated-demo/seed-summary.json";
const required = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "ADVISOR_A_EMAIL",
  "ADVISOR_A_PASSWORD",
  "ADVISOR_B_EMAIL",
  "ADVISOR_B_PASSWORD",
];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
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
const client = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  options,
);
const advisorA = client();
const advisorB = client();

const summary = {
  contractId: "FORGE_LOGIN_INTEGRATED_DEMO_SEED_V1",
  dataClass: DATA_CLASS,
  projectRef: PROJECT_REF,
  generatedAt: new Date().toISOString(),
  advisors: {},
  isolation: {},
  credentialsPersisted: false,
  realClientDataUsed: false,
};

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stable(value[key]);
    return output;
  }, {});
}

function sha256(value) {
  return createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
}

function iso(value) {
  return new Date(value).toISOString();
}

function date(value) {
  return iso(value).slice(0, 10);
}

function assertNoSecret(value) {
  const text = JSON.stringify(value);
  for (const name of [
    "ADVISOR_A_EMAIL",
    "ADVISOR_A_PASSWORD",
    "ADVISOR_B_EMAIL",
    "ADVISOR_B_PASSWORD",
    "SUPABASE_ANON_KEY",
  ]) {
    const secret = process.env[name];
    if (secret) assert.equal(text.includes(secret), false, `SECRET_LEAK:${name}`);
  }
}

async function signIn(api, email, password) {
  const { data, error } = await api.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data?.user?.id, "DEMO_ADVISOR_AUTH_FAILED");
  return data.user;
}

async function seedProspect(api, advisorId, spec) {
  const { data: existing, error: readError } = await api
    .from("prospects")
    .select("id")
    .eq("advisor_id", advisorId)
    .eq("source", SOURCE)
    .eq("full_name", spec.name)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();
  assert.ifError(readError);

  const payload = {
    advisor_id: advisorId,
    display_name: spec.name,
    full_name: spec.name,
    phone_normalized: spec.phone,
    whatsapp_normalized: spec.phone,
    source: SOURCE,
    referrer_name: spec.referrer || null,
    referrer_relationship: spec.referrerRelationship || null,
    marital_status: spec.maritalStatus || null,
    dependents: spec.dependents ?? null,
    occupation: spec.occupation || null,
    products_of_interest: spec.products,
    initial_context: `[DEMO] ${spec.context}`,
    status: "referred_new",
    next_action_type: spec.nextActionType || null,
    next_action_at: spec.nextActionAt || null,
    created_by: advisorId,
    updated_by: advisorId,
  };

  let id = existing?.id;
  if (!id) {
    const { data: inserted, error } = await api
      .from("prospects")
      .insert(payload)
      .select("id")
      .single();
    assert.ifError(error);
    id = inserted.id;
  }

  const { error: updateError } = await api
    .from("prospects")
    .update({
      ...payload,
      status: spec.status,
    })
    .eq("id", id)
    .eq("advisor_id", advisorId);
  assert.ifError(updateError);
  return { ...spec, id };
}

async function seedOpportunity(api, advisorId, prospect, spec) {
  const title = `[DEMO] ${spec.title}`;
  const { data: existing, error: readError } = await api
    .from("opportunities")
    .select("id")
    .eq("advisor_id", advisorId)
    .eq("prospect_id", prospect.id)
    .eq("title", title)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();
  assert.ifError(readError);

  const payload = {
    advisor_id: advisorId,
    prospect_id: prospect.id,
    title,
    status: spec.status,
    next_action: spec.nextAction || null,
    next_action_at: spec.nextActionAt || null,
  };
  if (existing?.id) {
    const { error } = await api
      .from("opportunities")
      .update(payload)
      .eq("id", existing.id)
      .eq("advisor_id", advisorId);
    assert.ifError(error);
    return existing.id;
  }
  const { data, error } = await api
    .from("opportunities")
    .insert(payload)
    .select("id")
    .single();
  assert.ifError(error);
  return data.id;
}

async function seedJournal(api, advisorId, prospect, entries) {
  let created = 0;
  for (const entry of entries) {
    const content = `[DEMO] ${entry.content}`;
    const { data: existing, error: readError } = await api
      .from("prospect_journal_entries")
      .select("id")
      .eq("advisor_id", advisorId)
      .eq("prospect_id", prospect.id)
      .eq("content", content)
      .limit(1);
    assert.ifError(readError);
    if (existing?.length) continue;
    const { error } = await api.from("prospect_journal_entries").insert({
      advisor_id: advisorId,
      prospect_id: prospect.id,
      content,
      capture_method: entry.captureMethod || "text",
      source: "PIPELINE_CONTEXT",
      created_at: iso(entry.at),
      created_by: advisorId,
    });
    assert.ifError(error);
    created += 1;
  }
  return created;
}

function activityEventInput({ advisorId, prospect, spec }) {
  const evidence = `demo:evidence:activity:${spec.key}`;
  const base = {
    event_type: spec.type,
    tenant_id: advisorId,
    actor: {
      type: spec.confirmed ? "ADVISOR" : "SYSTEM",
      id: spec.confirmed ? advisorId : "forge-demo-seed",
    },
    subject: {
      type: spec.subjectType,
      id: spec.subjectId || prospect.id,
    },
    source: {
      type: spec.confirmed ? "ADVISOR_CONFIRMED" : "SYSTEM_OBSERVED",
      reference: `demo:source:activity:${spec.key}`,
      channel: spec.channel || "FORGE_SYSTEM",
    },
    evidence_strength: spec.confirmed ? "HUMAN_CONFIRMED" : "SYSTEM_OBSERVED",
    occurred_at: iso(spec.at),
    recorded_at: iso(new Date(new Date(spec.at).getTime() + 60_000)),
    effective_period: null,
    causation_id: null,
    correlation_id: `demo:corr:${prospect.id}`,
    idempotency_key: `demo:activity:${spec.key}`,
    privacy_class: "PRIVATE",
    payload: spec.payload,
    provenance: {
      source_system: SOURCE,
      source_record_id: `demo:record:activity:${spec.key}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [evidence],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonicalActivity.DEFAULT_SAFETY_FLAGS },
  };
  return { base, evidence };
}

async function seedActivities(api, advisorId, prospect, specs) {
  const gateway = activityGateway.create(api);
  let count = 0;
  for (const spec of specs) {
    const { base, evidence } = activityEventInput({ advisorId, prospect, spec });
    const event = canonicalActivity.createCanonicalActivityEvent(base);
    const record = activityLedger.createLedgerRecord({
      canonical_event: event,
      evidence_references: [{
        reference_id: evidence,
        reference_type: spec.confirmed ? "USER_CONFIRMATION" : "SYSTEM_OBSERVATION",
        source_system: SOURCE,
        captured_at: event.recorded_at,
        privacy_class: "PRIVATE",
        checksum: `checksum:${sha256(spec.key).slice(0, 24)}`,
        metadata: { data_class: DATA_CLASS, scenario: spec.scenario || "DEMO" },
      }],
      appended_at: iso(new Date(new Date(spec.at).getTime() + 120_000)),
    });
    const mutation = activityLedger.createAppendMutation({
      ledger_record: record,
      device_id: "forge-demo-seeder",
      created_at: iso(new Date(new Date(spec.at).getTime() + 120_000)),
    });
    const result = await gateway.pushMutation(mutation);
    assert.ok(["ACKNOWLEDGED", "IDEMPOTENT_REPLAY"].includes(result.status));
    count += 1;
  }
  return count;
}

async function seedQuote(api, prospect, spec) {
  const evidence = `demo:evidence:quote:${spec.key}`;
  const occurredAt = iso(spec.reviewedAt);
  const { data, error } = await api.rpc(
    "forge_cartera001b_confirm_reviewed_quote",
    {
      p_prospect_id: prospect.id,
      p_product_reference: spec.productReference,
      p_review_snapshot: {
        reviewOnly: true,
        dataClass: DATA_CLASS,
        scenario: spec.scenario,
        objectiveCode: spec.objectiveCode,
        clientLabel: prospect.name,
        authority: { finalAuthority: "HUMAN" },
      },
      p_source_record_reference: `demo:quote:${spec.key}`,
      p_source_evidence_references: [evidence],
      p_freshness_metadata: {
        status: "CURRENT",
        observedAt: occurredAt,
        dataClass: DATA_CLASS,
      },
      p_occurred_at: occurredAt,
      p_idempotency_key: `demo:quote:${spec.key}:review`,
    },
  );
  assert.ifError(error);
  assert.ok(data?.quoteReference && data?.quoteVersionReference, "DEMO_QUOTE_RECEIPT_INVALID");

  const append = async (eventType, at, reason = null) => {
    const { error: appendError } = await api.rpc(
      "forge_cartera001b_append_quote_lifecycle_event",
      {
        p_quote_reference: data.quoteReference,
        p_quote_version_reference: data.quoteVersionReference,
        p_event_type: eventType,
        p_occurred_at: iso(at),
        p_source_record_reference: `demo:quote:${spec.key}:${eventType.toLowerCase()}`,
        p_evidence_references: [evidence],
        p_decision_reason_code: reason,
        p_application_reference: null,
        p_idempotency_key: `demo:quote:${spec.key}:${eventType.toLowerCase()}`,
        p_correction_of: null,
      },
    );
    assert.ifError(appendError);
  };

  if (spec.presentedAt) await append("QUOTE_PRESENTED", spec.presentedAt);
  if (spec.decision === "ACCEPTED") {
    await append("QUOTE_PROSPECT_ACCEPTED", spec.decidedAt, "DEMO_PROSPECT_ACCEPTED");
  } else if (spec.decision === "REJECTED") {
    await append("QUOTE_PROSPECT_REJECTED", spec.decidedAt, "DEMO_PROSPECT_DEFERRED");
  }
  return data;
}

async function confirmPerson(api, advisorId, spec) {
  const command = cartera.buildIdentityResolutionCommand({
    advisorId,
    actorReference: advisorId,
    idempotencyKey: `demo:identity:${spec.key}`,
    decidedAt: iso(spec.confirmedAt),
    outcome: "CREATE_CONFIRMED",
    sourceIdentity: {
      sourceDomain: "FORGE_DEMO",
      sourceIdentityType: spec.sourceType,
      sourceRecordReference: spec.sourceRecordReference,
      prospectReference: spec.prospectReference || null,
    },
    existingPersonReference: null,
    newPerson: {
      personReference: spec.personReference,
      displayName: spec.displayName,
      preferredName: spec.preferredName || null,
      normalizedName: spec.normalizedName,
      verifiedPhone: null,
      verifiedEmail: null,
      birthDate: spec.birthDate || null,
      privacyClassification: spec.privacyClassification || "PRIVATE",
    },
    candidatePersonReferences: [],
    evidenceReferences: [spec.evidenceReference],
    reasonCode: "ADVISOR_CONFIRMED_SYNTHETIC_DEMO_PERSON",
  });
  const { data, error } = await api.rpc(
    "forge_cartera010b_confirm_identity_resolution",
    { p_command: command },
  );
  assert.ifError(error);
  assert.ok(data?.personReference || data?.person_reference || spec.personReference);
  return spec.personReference;
}

function role({ advisorId, policyReference, roleKey, personReference, roleType, at, evidence }) {
  return {
    contractType: "FORGE_POLICY_ROLE",
    schemaVersion: "1.0.0",
    policyRoleReference: `policy-role:demo:${roleKey}`,
    policyReference,
    advisorId,
    participantPersonReference: personReference,
    participantAccountReference: null,
    roleType,
    confirmationState: "CONFIRMED",
    privacyClassification: roleType === "BENEFICIARY" ? "RESTRICTED" : "PRIVATE",
    visibilityScope: roleType === "BENEFICIARY" ? "RESTRICTED_ROLE_VIEW" : "OWNING_ADVISOR_ONLY",
    evidenceReferences: [evidence],
    effectiveFrom: iso(at),
    effectiveTo: null,
    createdAt: iso(at),
    createdBy: advisorId,
    version: 1,
    correctionOf: null,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
  };
}

async function confirmPolicy(api, advisorId, spec) {
  const evidence = `policy-evidence:demo:${spec.key}`;
  const at = iso(spec.confirmedAt);
  const policy = {
    contractType: "FORGE_CANONICAL_POLICY",
    schemaVersion: "2.0.0",
    policyReference: spec.policyReference,
    advisorId,
    carrierReference: "carrier:smnyl",
    policyNumber: spec.policyNumber,
    productReference: spec.productReference,
    issueDate: date(spec.confirmedAt),
    effectiveFrom: date(spec.effectiveFrom),
    effectiveTo: null,
    status: { value: "ACTIVE", source: evidence, asOf: at },
    currency: "MXN",
    premiumAmount: spec.premiumAmount,
    paymentFrequency: spec.paymentFrequency,
    sumInsured: spec.sumInsured,
    completenessState: "COMPLETE",
    freshnessState: "CURRENT",
    conflictState: "CLEAR",
    evidenceVersionReferences: [evidence],
    currentVersion: 1,
    createdAt: at,
    createdBy: advisorId,
    updatedAt: at,
  };
  const roles = spec.roles.map((item) => role({
    advisorId,
    policyReference: spec.policyReference,
    roleKey: `${spec.key}:${item.key}`,
    personReference: item.personReference,
    roleType: item.roleType,
    at: spec.effectiveFrom,
    evidence,
  }));
  const command = cartera.buildConfirmedPolicyCommand({
    advisorId,
    actorReference: advisorId,
    idempotencyKey: `demo:policy:${spec.key}:confirm`,
    confirmedAt: at,
    policy,
    roles,
    evidence: {
      evidenceVersionReference: evidence,
      documentHash: sha256(`FORGE_DEMO_POLICY:${spec.key}`),
      sourceType: "ISSUED_POLICY_DOCUMENT",
      observedAt: at,
      verificationState: "CONFIRMED",
      fieldClaims: {
        dataClass: DATA_CLASS,
        productReference: spec.productReference,
        policyNumber: spec.policyNumber,
      },
      provenance: {
        sourceSystem: SOURCE,
        synthetic: true,
      },
    },
    lineage: {
      quoteReference: spec.quoteReference || null,
      applicationReference: null,
      previousPolicyVersionReference: null,
    },
  });
  const { data, error } = await api.rpc(
    "forge_cartera010b_confirm_policy_with_parties",
    { p_command: command },
  );
  assert.ifError(error);
  assert.equal(data?.policyReference, spec.policyReference);
  assert.ok(data?.policyVersionReference, "DEMO_POLICY_VERSION_REFERENCE_MISSING");
  return { ...data, evidence };
}

async function generateObligations(api, policy, spec) {
  const command = {
    policyReference: spec.policyReference,
    policyVersionReference: policy.policyVersionReference,
    generationHorizonDate: spec.horizonDate,
    timezone: TIME_ZONE,
    amountSemantics: "PER_OCCURRENCE",
    scheduleRuleReference: `demo:schedule:${spec.key}`,
    sourceEvidenceReferences: [policy.evidence],
    idempotencyKey: `demo:obligations:${spec.key}`,
  };
  const { data, error } = await api.rpc(
    "forge_cartera030b_generate_expected_obligations",
    {
      p_payload: {
        ...command,
        authorization: {
          authorized: true,
          payloadDigest: sha256(command),
        },
      },
    },
  );
  assert.ifError(error);
  assert.ok(["COMPLETE", "BLOCKED"].includes(data?.generationState));
  return data;
}

async function recordFamilyMemory(api, personReference, quoteReference) {
  const service = createCartera040RelationshipMemoryService({ client: api });
  const entries = [
    {
      memoryKind: "LIFE_CONTEXT",
      summary: "Familia demo confirmada: Mariana participa como esposa y Mateo como hijo en la estrategia familiar.",
      valueCode: "FAMILY_TORRES_LOPEZ",
      sensitivity: "SENSITIVE",
      consentState: "CONFIRMED",
      contextUse: "CONVERSATION_PREPARATION",
      idempotencyKey: "demo:memory:torres:family",
    },
    {
      memoryKind: "DECISION_PARTICIPANT",
      summary: "Mariana participa en la revisión y decisión de la estrategia educativa de Mateo.",
      valueCode: "SPOUSE_DECISION_PARTICIPANT",
      sensitivity: "PERSONAL",
      consentState: "CONFIRMED",
      contextUse: "CONVERSATION_PREPARATION",
      idempotencyKey: "demo:memory:torres:mariana",
    },
    {
      memoryKind: "NEED",
      summary: "Objetivo familiar demo: retiro con Imagina Ser y educación de Mateo con Segubeca.",
      valueCode: "RETIREMENT_AND_EDUCATION",
      sensitivity: "PERSONAL",
      consentState: "CONFIRMED",
      contextUse: "GENERAL_RELATIONSHIP",
      idempotencyKey: "demo:memory:torres:needs",
    },
  ];
  for (const entry of entries) {
    await service.recordRelationshipMemory({
      personReference,
      ...entry,
      occurredAt: "2026-07-18T18:00:00.000Z",
      sourceAuthority: "ADVISOR_CONFIRMED",
      sourceRecordReference: quoteReference,
      evidenceReferences: ["demo:evidence:family:torres-lopez"],
      supersedesMemoryReference: null,
    });
  }
  return entries.length;
}

async function setMonthlyGoal(api, target) {
  const month = "2026-08-01";
  const { data, error } = await api
    .from("advisor_monthly_policy_goals")
    .select("target_policy_count,revision")
    .eq("year_month", month)
    .order("revision", { ascending: false })
    .limit(1);
  assert.ifError(error);
  if (data?.[0]?.target_policy_count === target) return data[0];
  const result = await api.rpc("forge_set_monthly_policy_goal", {
    p_year_month: month,
    p_target_policy_count: target,
    p_reason: "Meta sintética de la cuenta demostrativa",
    p_evidence_reference: "demo:evidence:monthly-goal:2026-08",
  });
  assert.ifError(result.error);
  return result.data;
}

const prospectSpecsA = [
  {
    key: "alejandro",
    name: "Alejandro Torres · Demo",
    phone: "+525590100001",
    status: "client",
    products: ["Imagina Ser", "Segubeca"],
    context: "Padre de familia. Estrategia de retiro y educación construida con Mariana para Mateo.",
    maritalStatus: "married",
    dependents: 1,
    occupation: "Director de operaciones",
    nextActionType: "annual_review",
    nextActionAt: "2026-08-12T16:00:00.000Z",
  },
  {
    key: "daniela",
    name: "Daniela Ríos · Demo",
    phone: "+525590100002",
    status: "proposal",
    products: ["Vida Mujer"],
    context: "Propuesta presentada; solicitó revisar protección e invalidez.",
    occupation: "Arquitecta",
    nextActionType: "proposal_followup",
    nextActionAt: "2026-08-04T17:00:00.000Z",
  },
  {
    key: "carlos",
    name: "Carlos Medina · Demo",
    phone: "+525590100003",
    status: "decision",
    products: ["ORVI"],
    context: "Revisión final con decisión pendiente.",
    occupation: "Consultor",
    nextActionType: "decision_call",
    nextActionAt: "2026-08-03T19:00:00.000Z",
  },
  {
    key: "fernanda",
    name: "Fernanda Ruiz · Demo",
    phone: "+525590100004",
    status: "appointment_scheduled",
    products: ["Segubeca"],
    context: "Primera cita para explorar objetivo educativo.",
    dependents: 2,
    nextActionType: "appointment",
    nextActionAt: "2026-08-06T18:00:00.000Z",
  },
  {
    key: "paola",
    name: "Paola Herrera · Demo",
    phone: "+525590100005",
    status: "contacted",
    products: ["Alfa Medical Flex"],
    context: "Contacto inicial realizado; falta confirmar cita.",
    nextActionType: "confirm_appointment",
    nextActionAt: "2026-08-05T15:00:00.000Z",
  },
  {
    key: "arturo",
    name: "Arturo Silva · Demo",
    phone: "+525590100006",
    status: "client",
    products: ["Imagina Ser"],
    context: "Cliente con revisión anual de retiro próxima.",
    nextActionType: "service_review",
    nextActionAt: "2026-08-20T17:00:00.000Z",
  },
  {
    key: "renata",
    name: "Renata Gómez · Demo",
    phone: "+525590100007",
    status: "referred_new",
    products: ["Vida Mujer"],
    context: "Referida recientemente; aún no se realiza el primer contacto.",
    referrer: "Daniela Ríos · Demo",
    referrerRelationship: "friend",
  },
  {
    key: "miguel",
    name: "Miguel Santos · Demo",
    phone: "+525590100008",
    status: "proposal",
    products: ["Imagina Ser"],
    context: "Proyección de retiro explicada; pidió comparar plazo.",
    nextActionType: "proposal_adjustment",
    nextActionAt: "2026-08-07T16:30:00.000Z",
  },
];

const prospectSpecsB = [
  {
    key: "lorena",
    name: "Lorena Castillo · Demo",
    phone: "+525590200001",
    status: "contacted",
    products: ["Imagina Ser"],
    context: "Seguimiento vencido; no se ha actualizado el contexto.",
    nextActionType: "overdue_followup",
    nextActionAt: "2026-07-25T17:00:00.000Z",
  },
  {
    key: "eduardo",
    name: "Eduardo Núñez · Demo",
    phone: "+525590200002",
    status: "appointment_scheduled",
    products: ["ORVI"],
    context: "Cita no realizada y pendiente de reagendar.",
    nextActionType: "reschedule",
    nextActionAt: "2026-07-29T18:00:00.000Z",
  },
  {
    key: "gabriela",
    name: "Gabriela Soto · Demo",
    phone: "+525590200003",
    status: "proposal",
    products: ["Segubeca"],
    context: "Segubeca presentado; falta participación de la pareja y documento del menor.",
    dependents: 1,
    nextActionType: "collect_documents",
    nextActionAt: "2026-08-02T16:00:00.000Z",
  },
  {
    key: "roberto",
    name: "Roberto León · Demo",
    phone: "+525590200004",
    status: "decision",
    products: ["Vida Mujer"],
    context: "Decisión pospuesta; requiere aclarar presupuesto.",
    nextActionType: "decision_followup",
    nextActionAt: "2026-08-03T20:00:00.000Z",
  },
  {
    key: "ines",
    name: "Inés Cabrera · Demo",
    phone: "+525590200005",
    status: "referred_new",
    products: ["Alfa Medical Flex"],
    context: "Referida sin información suficiente para priorizar.",
  },
  {
    key: "sergio",
    name: "Sergio Luna · Demo",
    phone: "+525590200006",
    status: "proposal",
    products: ["Imagina Ser"],
    context: "Propuesta enviada sin confirmación de recepción.",
    nextActionType: "confirm_receipt",
    nextActionAt: "2026-07-31T18:00:00.000Z",
  },
  {
    key: "monica",
    name: "Mónica Flores · Demo",
    phone: "+525590200007",
    status: "client",
    products: ["Segubeca"],
    context: "Cliente con documentación de servicio incompleta.",
    nextActionType: "service_documentation",
    nextActionAt: "2026-08-09T17:00:00.000Z",
  },
];

async function seedAdvisorA(user) {
  const prospects = [];
  let journalCount = 0;
  let activityCount = 0;
  for (const spec of prospectSpecsA) {
    const prospect = await seedProspect(advisorA, user.id, spec);
    prospects.push(prospect);
    await seedOpportunity(advisorA, user.id, prospect, {
      title: `${spec.products.join(" + ")} · ${spec.status}`,
      status: spec.status,
      nextAction: spec.nextActionType,
      nextActionAt: spec.nextActionAt,
    });
  }

  const alejandro = prospects.find((item) => item.key === "alejandro");
  const daniela = prospects.find((item) => item.key === "daniela");
  const carlos = prospects.find((item) => item.key === "carlos");
  journalCount += await seedJournal(advisorA, user.id, alejandro, [
    { at: "2026-07-03T16:00:00Z", content: "Contacto inicial y autorización para revisar objetivos familiares." },
    { at: "2026-07-06T18:00:00Z", content: "Cita de descubrimiento: retiro como objetivo principal." },
    { at: "2026-07-10T17:00:00Z", content: "Imagina Ser presentado como estrategia de retiro." },
    { at: "2026-07-17T18:00:00Z", content: "Mariana participa en la conversación educativa de Mateo." },
    { at: "2026-07-22T17:00:00Z", content: "Segubeca revisado y aceptado por la familia." },
    { at: "2026-07-28T15:00:00Z", content: "Pólizas emitidas; se acuerda revisión anual y seguimiento de pagos." },
  ]);
  journalCount += await seedJournal(advisorA, user.id, daniela, [
    { at: "2026-07-25T17:00:00Z", content: "Vida Mujer presentada; solicita revisar coberturas antes de decidir." },
    { at: "2026-07-30T17:00:00Z", content: "Seguimiento confirmado para la primera semana de agosto." },
  ]);
  journalCount += await seedJournal(advisorA, user.id, carlos, [
    { at: "2026-07-24T18:00:00Z", content: "ORVI explicado y objeción principal registrada." },
  ]);

  activityCount += await seedActivities(advisorA, user.id, alejandro, [
    {
      key: "a-alejandro-created",
      type: "PROSPECT_CREATED",
      subjectType: "PROSPECT",
      at: "2026-07-03T16:00:00Z",
      payload: { prospect_reference: alejandro.id, source_category: "REFERRAL" },
    },
    {
      key: "a-alejandro-appointment",
      type: "APPOINTMENT_SCHEDULED",
      subjectType: "APPOINTMENT",
      subjectId: "demo:appointment:a:alejandro:1",
      at: "2026-07-04T16:00:00Z",
      payload: {
        appointment_reference: "demo:appointment:a:alejandro:1",
        starts_at: "2026-07-06T18:00:00.000Z",
        ends_at: "2026-07-06T19:00:00.000Z",
      },
    },
    {
      key: "a-alejandro-held",
      type: "APPOINTMENT_HELD",
      subjectType: "APPOINTMENT",
      subjectId: "demo:appointment:a:alejandro:1",
      confirmed: true,
      channel: "FORGE_UI",
      at: "2026-07-06T19:05:00Z",
      payload: {
        appointment_reference: "demo:appointment:a:alejandro:1",
        outcome_confirmed_at: "2026-07-06T19:05:00.000Z",
      },
    },
    {
      key: "a-alejandro-context",
      type: "ACTIVITY_CONTEXT_ADDED",
      subjectType: "ACTIVITY",
      subjectId: "demo:activity:a:alejandro:family",
      confirmed: true,
      channel: "FORGE_UI",
      at: "2026-07-17T18:00:00Z",
      payload: {
        activity_reference: "demo:activity:a:alejandro:family",
        context_reference: "demo:context:a:torres-family",
        capture_mode: "TEXT",
      },
    },
    {
      key: "a-alejandro-review-due",
      type: "DUE_ACTION_CREATED",
      subjectType: "DUE_ACTION",
      subjectId: "demo:due:a:alejandro:review",
      confirmed: true,
      channel: "FORGE_UI",
      at: "2026-07-28T15:10:00Z",
      payload: {
        due_action_reference: "demo:due:a:alejandro:review",
        action_type: "ANNUAL_REVIEW",
        due_at: "2026-08-12T16:00:00.000Z",
      },
    },
  ]);

  const imaginaQuote = await seedQuote(advisorA, alejandro, {
    key: "a-alejandro-imagina-ser",
    productReference: "product:imagina-ser",
    scenario: "RETIREMENT",
    objectiveCode: "RETIREMENT",
    reviewedAt: "2026-07-10T17:00:00Z",
    presentedAt: "2026-07-10T17:10:00Z",
    decision: "ACCEPTED",
    decidedAt: "2026-07-15T17:00:00Z",
  });
  const segubecaQuote = await seedQuote(advisorA, alejandro, {
    key: "a-alejandro-segubeca",
    productReference: "product:segubeca",
    scenario: "FAMILY_EDUCATION",
    objectiveCode: "CHILD_EDUCATION",
    reviewedAt: "2026-07-17T18:00:00Z",
    presentedAt: "2026-07-17T18:15:00Z",
    decision: "ACCEPTED",
    decidedAt: "2026-07-22T17:00:00Z",
  });
  await seedQuote(advisorA, daniela, {
    key: "a-daniela-vida-mujer",
    productReference: "product:vida-mujer",
    scenario: "PROTECTION_REVIEW",
    objectiveCode: "LIFE_AND_DISABILITY",
    reviewedAt: "2026-07-25T17:00:00Z",
    presentedAt: "2026-07-25T17:15:00Z",
  });

  const people = {
    alejandro: await confirmPerson(advisorA, user.id, {
      key: "a-alejandro",
      personReference: "person:demo:a:alejandro-torres",
      displayName: "Alejandro Torres · Demo",
      preferredName: "Alejandro",
      normalizedName: "alejandro torres demo",
      sourceType: "PROSPECT",
      sourceRecordReference: `prospect:${alejandro.id}`,
      prospectReference: alejandro.id,
      evidenceReference: "demo:evidence:identity:a:alejandro",
      confirmedAt: "2026-07-15T17:00:00Z",
    }),
    mariana: await confirmPerson(advisorA, user.id, {
      key: "a-mariana",
      personReference: "person:demo:a:mariana-lopez",
      displayName: "Mariana López · Demo",
      preferredName: "Mariana",
      normalizedName: "mariana lopez demo",
      sourceType: "POLICY_PARTICIPANT",
      sourceRecordReference: "demo:family:a:mariana",
      evidenceReference: "demo:evidence:identity:a:mariana",
      confirmedAt: "2026-07-17T18:00:00Z",
    }),
    mateo: await confirmPerson(advisorA, user.id, {
      key: "a-mateo",
      personReference: "person:demo:a:mateo-torres",
      displayName: "Mateo Torres · Demo",
      preferredName: "Mateo",
      normalizedName: "mateo torres demo",
      sourceType: "POLICY_PARTICIPANT",
      sourceRecordReference: "demo:family:a:mateo",
      evidenceReference: "demo:evidence:identity:a:mateo",
      birthDate: "2018-04-12",
      privacyClassification: "SENSITIVE",
      confirmedAt: "2026-07-17T18:00:00Z",
    }),
  };

  const imaginaPolicy = await confirmPolicy(advisorA, user.id, {
    key: "a-imagina-ser",
    policyReference: "policy:demo:a:imagina-ser",
    policyNumber: "DEMO-A-IS-001",
    productReference: "product:imagina-ser",
    confirmedAt: "2026-07-28T15:00:00Z",
    effectiveFrom: "2026-08-01T00:00:00Z",
    premiumAmount: 36000,
    paymentFrequency: "ANNUAL",
    sumInsured: 1500000,
    quoteReference: imaginaQuote.quoteReference,
    roles: [
      { key: "owner", personReference: people.alejandro, roleType: "POLICY_OWNER" },
      { key: "insured", personReference: people.alejandro, roleType: "INSURED" },
      { key: "beneficiary", personReference: people.mariana, roleType: "BENEFICIARY" },
    ],
  });
  const segubecaPolicy = await confirmPolicy(advisorA, user.id, {
    key: "a-segubeca",
    policyReference: "policy:demo:a:segubeca",
    policyNumber: "DEMO-A-SB-001",
    productReference: "product:segubeca",
    confirmedAt: "2026-07-28T15:05:00Z",
    effectiveFrom: "2026-08-01T00:00:00Z",
    premiumAmount: 48000,
    paymentFrequency: "ANNUAL",
    sumInsured: 1200000,
    quoteReference: segubecaQuote.quoteReference,
    roles: [
      { key: "owner", personReference: people.alejandro, roleType: "POLICY_OWNER" },
      { key: "payor", personReference: people.mariana, roleType: "PAYOR" },
      { key: "insured", personReference: people.mateo, roleType: "INSURED" },
    ],
  });

  const obligations = [
    await generateObligations(advisorA, imaginaPolicy, {
      key: "a-imagina-ser",
      policyReference: "policy:demo:a:imagina-ser",
      horizonDate: "2028-12-31",
    }),
    await generateObligations(advisorA, segubecaPolicy, {
      key: "a-segubeca",
      policyReference: "policy:demo:a:segubeca",
      horizonDate: "2028-12-31",
    }),
  ];

  const paymentService = createCartera030cConfirmedPaymentReconciliationService({ client: advisorA });
  await paymentService.reconcileConfirmedPayment({
    policyReference: "policy:demo:a:imagina-ser",
    paymentEvidenceReference: "payment-evidence:demo:a:imagina-ser:2026",
    paymentAmount: 36000,
    currency: "MXN",
    paymentDate: "2026-08-01",
    periodCoveredStart: "2026-08-01",
    periodCoveredEnd: "2027-07-31",
    paymentSource: "policy_receipt",
    evidenceReferences: ["demo:evidence:payment:a:imagina-ser:2026"],
    confirmationState: "CONFIRMED",
    idempotencyKey: "demo:payment:a:imagina-ser:2026",
  });

  const memoryCount = await recordFamilyMemory(
    advisorA,
    people.alejandro,
    segubecaQuote.quoteReference,
  );
  await setMonthlyGoal(advisorA, 10);

  return {
    prospects: prospects.length,
    journalEntries: journalCount,
    activityEvents: activityCount,
    quotes: 3,
    commercialPeople: 3,
    policies: 2,
    policyRoles: 6,
    obligationBatches: obligations.length,
    relationshipMemory: memoryCount,
    products: ["Imagina Ser", "Segubeca", "Vida Mujer", "ORVI", "Alfa Medical Flex"],
    familyJourney: "Alejandro + Mariana + Mateo",
  };
}

async function seedAdvisorB(user) {
  const prospects = [];
  let journalCount = 0;
  let activityCount = 0;
  for (const spec of prospectSpecsB) {
    const prospect = await seedProspect(advisorB, user.id, spec);
    prospects.push(prospect);
    await seedOpportunity(advisorB, user.id, prospect, {
      title: `${spec.products.join(" + ")} · atención requerida`,
      status: spec.status,
      nextAction: spec.nextActionType,
      nextActionAt: spec.nextActionAt,
    });
  }
  const lorena = prospects.find((item) => item.key === "lorena");
  const eduardo = prospects.find((item) => item.key === "eduardo");
  const gabriela = prospects.find((item) => item.key === "gabriela");
  journalCount += await seedJournal(advisorB, user.id, lorena, [
    { at: "2026-07-18T17:00:00Z", content: "Imagina Ser explicado; seguimiento acordado y posteriormente vencido." },
  ]);
  journalCount += await seedJournal(advisorB, user.id, eduardo, [
    { at: "2026-07-24T18:00:00Z", content: "Cita no realizada; falta confirmar nueva fecha." },
  ]);
  journalCount += await seedJournal(advisorB, user.id, gabriela, [
    { at: "2026-07-26T17:00:00Z", content: "Segubeca presentado; falta documento del menor y conversación con la pareja." },
  ]);

  activityCount += await seedActivities(advisorB, user.id, eduardo, [
    {
      key: "b-eduardo-created",
      type: "PROSPECT_CREATED",
      subjectType: "PROSPECT",
      at: "2026-07-20T16:00:00Z",
      payload: { prospect_reference: eduardo.id, source_category: "NATURAL_MARKET" },
    },
    {
      key: "b-eduardo-no-show",
      type: "APPOINTMENT_NO_SHOW",
      subjectType: "APPOINTMENT",
      subjectId: "demo:appointment:b:eduardo:1",
      confirmed: true,
      channel: "FORGE_UI",
      at: "2026-07-24T18:05:00Z",
      payload: {
        appointment_reference: "demo:appointment:b:eduardo:1",
        party: "PROSPECT",
        outcome_confirmed_at: "2026-07-24T18:05:00.000Z",
      },
      scenario: "FRICTION",
    },
    {
      key: "b-eduardo-due",
      type: "DUE_ACTION_CREATED",
      subjectType: "DUE_ACTION",
      subjectId: "demo:due:b:eduardo:reschedule",
      confirmed: true,
      channel: "FORGE_UI",
      at: "2026-07-24T18:10:00Z",
      payload: {
        due_action_reference: "demo:due:b:eduardo:reschedule",
        action_type: "RESCHEDULE_APPOINTMENT",
        due_at: "2026-07-29T18:00:00.000Z",
      },
      scenario: "FRICTION",
    },
  ]);

  await seedQuote(advisorB, lorena, {
    key: "b-lorena-imagina-ser",
    productReference: "product:imagina-ser",
    scenario: "OVERDUE_FOLLOWUP",
    objectiveCode: "RETIREMENT",
    reviewedAt: "2026-07-18T17:00:00Z",
    presentedAt: "2026-07-18T17:10:00Z",
  });
  await seedQuote(advisorB, gabriela, {
    key: "b-gabriela-segubeca",
    productReference: "product:segubeca",
    scenario: "DOCUMENTATION_INCOMPLETE",
    objectiveCode: "CHILD_EDUCATION",
    reviewedAt: "2026-07-26T17:00:00Z",
    presentedAt: "2026-07-26T17:10:00Z",
  });
  await setMonthlyGoal(advisorB, 8);

  return {
    prospects: prospects.length,
    journalEntries: journalCount,
    activityEvents: activityCount,
    quotes: 2,
    policies: 0,
    scenarios: [
      "overdue_followup",
      "appointment_no_show",
      "documentation_incomplete",
      "decision_deferred",
    ],
  };
}

async function assertIsolation(userA, userB, sampleA, sampleB) {
  const checks = [];
  for (const [viewer, hiddenId, label] of [
    [advisorA, sampleB, "A_CANNOT_READ_B"],
    [advisorB, sampleA, "B_CANNOT_READ_A"],
  ]) {
    const { data, error } = await viewer
      .from("prospects")
      .select("id")
      .eq("id", hiddenId);
    assert.ifError(error);
    assert.equal(data.length, 0, label);
    checks.push(label);
  }
  assert.notEqual(userA.id, userB.id, "DEMO_ADVISORS_NOT_DISTINCT");
  return { status: "PASS", checks };
}

let userA;
let userB;
try {
  [userA, userB] = await Promise.all([
    signIn(advisorA, process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD),
    signIn(advisorB, process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD),
  ]);
  assert.notEqual(userA.id, userB.id, "DEMO_ADVISORS_NOT_DISTINCT");

  const [resultA, resultB] = await Promise.all([
    seedAdvisorA(userA),
    seedAdvisorB(userB),
  ]);
  summary.advisors = { PUBLIC_A: resultA, CONTROL_B: resultB };

  const [{ data: sampleA }, { data: sampleB }] = await Promise.all([
    advisorA.from("prospects").select("id").eq("source", SOURCE).limit(1).single(),
    advisorB.from("prospects").select("id").eq("source", SOURCE).limit(1).single(),
  ]);
  summary.isolation = await assertIsolation(userA, userB, sampleA.id, sampleB.id);
  summary.status = "PASS";
} finally {
  await Promise.allSettled([advisorA.auth.signOut(), advisorB.auth.signOut()]);
}

assertNoSecret(summary);
mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
writeFileSync(EVIDENCE_PATH, `${JSON.stringify(summary, null, 2)}\n`);
console.log("LOGIN_INTEGRATED_DEMO_SEED=PASS");
console.log(`PUBLIC_A_PROSPECTS=${summary.advisors.PUBLIC_A.prospects}`);
console.log(`PUBLIC_A_POLICIES=${summary.advisors.PUBLIC_A.policies}`);
console.log(`CONTROL_B_PROSPECTS=${summary.advisors.CONTROL_B.prospects}`);
console.log("DEMO_RLS_ISOLATION=PASS");

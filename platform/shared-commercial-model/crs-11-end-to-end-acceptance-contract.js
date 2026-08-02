"use strict";

const crypto = require("node:crypto");

const CONTRACT_TYPE = "FORGE_CRS_11_END_TO_END_RELATIONSHIP_ACCEPTANCE";
const CONTRACT_VERSION = "1.0.0";
const PLAN_TYPE = "FORGE_CRS_11_END_TO_END_ACCEPTANCE_PLAN";
const FIXTURE_REFERENCE = "crs11:fixture:juan-perez:v1";

const REQUIRED_DOMAINS = Object.freeze([
  "PIPELINE",
  "ACTIVITY",
  "QUOTE",
  "APPLICATION",
  "CARTERA",
]);

const REQUIRED_DEVICES = Object.freeze(["MOBILE", "TABLET", "DESKTOP"]);
const REQUIRED_SECURITY_CHECKS = Object.freeze([
  "rlsEnforced",
  "idempotencyReplayStable",
  "changedInputConflictRejected",
  "crossAdvisorReadBlocked",
  "crossAdvisorWriteBlocked",
  "correctionLineageAppendOnly",
  "privacyMinimized",
]);

const BLOCKED_BOUNDARIES = Object.freeze([
  "centralDuplicateTruthStore",
  "automaticIdentityMerge",
  "automaticOpportunityCreation",
  "automaticApplicationCreation",
  "automaticPolicyCreation",
  "automaticStageAdvance",
  "automaticContact",
  "automaticMessage",
  "automaticTask",
  "automaticCalendar",
  "automaticBusinessAction",
  "opaqueHumanScoring",
  "calculationTruthCopied",
  "timelineMutation",
]);

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    fail("CRS11_FIELD_REQUIRED", `${field} is required`);
  }
  return value.trim();
}

function requireIso(value, field) {
  const text = requireText(value, field);
  if (!Number.isFinite(Date.parse(text))) {
    fail("CRS11_TIMESTAMP_INVALID", `${field} must be an ISO timestamp`);
  }
  return new Date(text).toISOString();
}

function unique(values) {
  return [...new Set(values)];
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, stableValue(value[key])]),
  );
}

function digest(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(stableValue(value)))
    .digest("hex");
}

function defaultPlanInput() {
  return {
    fixtureReference: FIXTURE_REFERENCE,
    environments: ["REPOSITORY", "BROWSER", "PRODUCTIVE_AUTHORITY_CONTRACTS"],
    devices: [...REQUIRED_DEVICES],
    identities: {
      advisorReference: "advisor:jorge",
      personReference: "person:juan-perez",
      relationshipReference: "relationship:juan-perez",
      crossAdvisorReference: "advisor:other",
    },
    expectedDomains: [...REQUIRED_DOMAINS],
    expectedEvents: [
      "PROSPECT_CREATED",
      "APPOINTMENT_HELD",
      "QUOTE_PRESENTED",
      "QUOTE_PROSPECT_ACCEPTED",
      "APPLICATION_SIGNED",
      "POLICY_ISSUED",
      "ANNUAL_REVIEW_HELD",
    ],
    rollbackCriteria: [
      "HEAD_MOVED",
      "CROSS_ADVISOR_ISOLATION_FAILED",
      "IDENTITY_DUPLICATED",
      "AUTHORITY_MISMATCH",
      "TIMELINE_LINEAGE_BROKEN",
      "AUTOMATIC_BUSINESS_ACTION_DETECTED",
    ],
    idempotencyKey: "crs11:juan-perez:end-to-end:v1",
    recordedAt: "2026-08-02T06:30:00.000Z",
  };
}

function createAcceptancePlan(input = {}) {
  const source = { ...defaultPlanInput(), ...input };
  const identities = { ...defaultPlanInput().identities, ...(input.identities || {}) };
  const fixtureReference = requireText(source.fixtureReference, "fixtureReference");
  const environments = unique(source.environments || []);
  const devices = unique(source.devices || []);
  const expectedDomains = unique(source.expectedDomains || []);
  const expectedEvents = unique(source.expectedEvents || []);
  const rollbackCriteria = unique(source.rollbackCriteria || []);

  if (!environments.includes("REPOSITORY") || !environments.includes("BROWSER")) {
    fail("CRS11_ENVIRONMENT_MATRIX_INCOMPLETE", "repository and browser environments are required");
  }
  for (const device of REQUIRED_DEVICES) {
    if (!devices.includes(device)) {
      fail("CRS11_DEVICE_MATRIX_INCOMPLETE", `missing device ${device}`);
    }
  }
  for (const domain of REQUIRED_DOMAINS) {
    if (!expectedDomains.includes(domain)) {
      fail("CRS11_DOMAIN_MATRIX_INCOMPLETE", `missing domain ${domain}`);
    }
  }
  if (expectedEvents.length < 7) {
    fail("CRS11_EVENT_MATRIX_INCOMPLETE", "the complete commercial journey is required");
  }
  if (rollbackCriteria.length < 4) {
    fail("CRS11_ROLLBACK_CRITERIA_INCOMPLETE", "explicit rollback criteria are required");
  }

  return deepFreeze({
    contractType: PLAN_TYPE,
    contractVersion: CONTRACT_VERSION,
    fixtureReference,
    environments,
    devices,
    identities: {
      advisorReference: requireText(identities.advisorReference, "identities.advisorReference"),
      personReference: requireText(identities.personReference, "identities.personReference"),
      relationshipReference: requireText(identities.relationshipReference, "identities.relationshipReference"),
      crossAdvisorReference: requireText(identities.crossAdvisorReference, "identities.crossAdvisorReference"),
    },
    expectedDomains,
    expectedEvents,
    rollbackCriteria,
    idempotencyKey: requireText(source.idempotencyKey, "idempotencyKey"),
    recordedAt: requireIso(source.recordedAt, "recordedAt"),
  });
}

function createJuanPerezEvidence(overrides = {}) {
  const base = {
    fixtureReference: FIXTURE_REFERENCE,
    recordedAt: "2026-08-02T06:30:00.000Z",
    advisorReference: "advisor:jorge",
    person: {
      personReference: "person:juan-perez",
      relationshipReference: "relationship:juan-perez",
      advisorReference: "advisor:jorge",
      displayName: "Juan Pérez",
      identityCount: 1,
      authority: "CARTERA_010B_COMMERCIAL_PERSON",
      privacyClassification: "PRIVATE",
    },
    movements: [
      {
        correlationId: "movement:retirement-2026",
        need: "RETIREMENT",
        opportunityReference: "opportunity:retirement-2026",
        authority: "PIPELINE_OPPORTUNITY_AUTHORITY",
      },
      {
        correlationId: "movement:education-2027",
        need: "EDUCATION",
        opportunityReference: "opportunity:education-2027",
        authority: "PIPELINE_OPPORTUNITY_AUTHORITY",
      },
    ],
    pipeline: [
      {
        prospectReference: "prospect:juan-perez",
        opportunityReference: "opportunity:retirement-2026",
        personReference: "person:juan-perez",
        correlationId: "movement:retirement-2026",
        stage: "POLICY_ISSUED",
        authority: "PIPELINE_STAGE_RPC",
        projectedMilestones: ["APPLICATION_SIGNED", "POLICY_ISSUED"],
        inventedExternalMilestone: false,
      },
      {
        prospectReference: "prospect:juan-perez",
        opportunityReference: "opportunity:education-2027",
        personReference: "person:juan-perez",
        correlationId: "movement:education-2027",
        stage: "DISCOVERY",
        authority: "PIPELINE_STAGE_RPC",
        projectedMilestones: [],
        inventedExternalMilestone: false,
      },
    ],
    activities: [
      {
        activityReference: "activity:initial-contact",
        personReference: "person:juan-perez",
        correlationId: "movement:retirement-2026",
        eventType: "PROSPECT_CREATED",
        authority: "FES_ACTIVITY_EVENT_LEDGER",
        occurredAt: "2026-07-01T15:00:00.000Z",
        recordedAt: "2026-07-01T15:00:01.000Z",
        privacyClassification: "PRIVATE",
        correctionOf: null,
      },
      {
        activityReference: "activity:closing-meeting",
        personReference: "person:juan-perez",
        correlationId: "movement:retirement-2026",
        eventType: "APPOINTMENT_HELD",
        authority: "FES_ACTIVITY_EVENT_LEDGER",
        occurredAt: "2026-07-10T18:00:00.000Z",
        recordedAt: "2026-07-10T18:00:01.000Z",
        privacyClassification: "PRIVATE",
        correctionOf: null,
      },
      {
        activityReference: "activity:annual-review",
        personReference: "person:juan-perez",
        correlationId: "movement:education-2027",
        eventType: "ANNUAL_REVIEW_HELD",
        authority: "FES_ACTIVITY_EVENT_LEDGER",
        occurredAt: "2026-08-01T17:00:00.000Z",
        recordedAt: "2026-08-01T17:00:01.000Z",
        privacyClassification: "PRIVATE",
        correctionOf: null,
      },
      {
        activityReference: "activity:annual-review-correction",
        personReference: "person:juan-perez",
        correlationId: "movement:education-2027",
        eventType: "ANNUAL_REVIEW_CORRECTED",
        authority: "FES_ACTIVITY_EVENT_LEDGER",
        occurredAt: "2026-08-01T17:05:00.000Z",
        recordedAt: "2026-08-01T17:05:01.000Z",
        privacyClassification: "PRIVATE",
        correctionOf: "activity:annual-review",
      },
    ],
    quotes: [
      {
        quoteReference: "quote:vida-mujer:juan:001",
        quoteVersionReferences: [
          "quote-version:vida-mujer:juan:001:01",
          "quote-version:vida-mujer:juan:001:02",
        ],
        prospectReference: "prospect:juan-perez",
        personReference: "person:juan-perez",
        correlationId: "movement:retirement-2026",
        authority: "QUOTE_PERSISTENCE_AUTHORITY",
        calculationAuthority: "VIDA_MUJER_ACCEPTED_PRODUCT_CALCULATION",
        applicationReference: "application:juan:001",
        numericTruthCopied: false,
      },
      {
        quoteReference: "quote:segubeca:juan:002",
        quoteVersionReferences: ["quote-version:segubeca:juan:002:01"],
        prospectReference: "prospect:juan-perez",
        personReference: "person:juan-perez",
        correlationId: "movement:education-2027",
        authority: "QUOTE_PERSISTENCE_AUTHORITY",
        calculationAuthority: "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION",
        applicationReference: null,
        numericTruthCopied: false,
      },
    ],
    applications: [
      {
        applicationReference: "application:juan:001",
        quoteReference: "quote:vida-mujer:juan:001",
        personReference: "person:juan-perez",
        correlationId: "movement:retirement-2026",
        state: "SIGNED",
        authority: "APPLICATION_SIGNATURE_AUTHORITY",
        signatureEvidenceReference: "signature-evidence:juan:001",
        policyReference: null,
      },
    ],
    policies: [
      {
        policyReference: "policy:vida:juan:001",
        applicationReference: "application:juan:001",
        personReference: "person:juan-perez",
        correlationId: "movement:retirement-2026",
        authority: "CARTERA_POLICY_AUTHORITY",
        issuanceEvidenceReference: "issuance-evidence:vida:juan:001",
      },
      {
        policyReference: "policy:sgmm:juan:existing",
        applicationReference: null,
        personReference: "person:juan-perez",
        correlationId: null,
        authority: "CARTERA_POLICY_AUTHORITY",
        issuanceEvidenceReference: "issuance-evidence:sgmm:juan:existing",
      },
    ],
    timeline: [
      ["timeline:pipeline:created", "PIPELINE", "prospect:juan-perez", "PIPELINE_STAGE_RPC", "2026-07-01T15:00:00.000Z", null, "movement:retirement-2026"],
      ["timeline:activity:contact", "ACTIVITY", "activity:initial-contact", "FES_ACTIVITY_EVENT_LEDGER", "2026-07-01T15:00:00.000Z", null, "movement:retirement-2026"],
      ["timeline:quote:presented", "QUOTE", "quote:vida-mujer:juan:001", "QUOTE_PERSISTENCE_AUTHORITY", "2026-07-08T17:00:00.000Z", null, "movement:retirement-2026"],
      ["timeline:activity:closing", "ACTIVITY", "activity:closing-meeting", "FES_ACTIVITY_EVENT_LEDGER", "2026-07-10T18:00:00.000Z", null, "movement:retirement-2026"],
      ["timeline:application:signed", "APPLICATION", "application:juan:001", "APPLICATION_SIGNATURE_AUTHORITY", "2026-07-10T19:00:00.000Z", null, "movement:retirement-2026"],
      ["timeline:policy:issued", "CARTERA", "policy:vida:juan:001", "CARTERA_POLICY_AUTHORITY", "2026-07-20T16:00:00.000Z", null, "movement:retirement-2026"],
      ["timeline:activity:annual-review", "ACTIVITY", "activity:annual-review", "FES_ACTIVITY_EVENT_LEDGER", "2026-08-01T17:00:00.000Z", null, "movement:education-2027"],
      ["timeline:activity:annual-review-correction", "ACTIVITY", "activity:annual-review-correction", "FES_ACTIVITY_EVENT_LEDGER", "2026-08-01T17:05:00.000Z", "timeline:activity:annual-review", "movement:education-2027"],
      ["timeline:quote:education", "QUOTE", "quote:segubeca:juan:002", "QUOTE_PERSISTENCE_AUTHORITY", "2026-08-01T18:00:00.000Z", null, "movement:education-2027"],
    ].map(([entryReference, sourceDomain, sourceRecordReference, authority, occurredAt, correctionOf, correlationId]) => ({
      entryReference,
      sourceDomain,
      sourceRecordReference,
      authority,
      personReference: "person:juan-perez",
      correlationId,
      occurredAt,
      recordedAt: new Date(Date.parse(occurredAt) + 1000).toISOString(),
      privacyClassification: "PRIVATE",
      correctionOf,
    })),
    intelligence: {
      personReference: "person:juan-perez",
      authority: "CRS_10_SHARED_READ_ONLY_COMPOSITION",
      sourceDomains: ["FUTURE_RADAR", "RELATIONSHIP_GROWTH", "RELATIONAL_ACTIVATION", "ECONOMIC_CONNECTION", "RELATIONSHIP_CAPITAL", "PRODUCTIVITY_PROOF"],
      humanDecisionRequired: true,
      automaticBusinessAction: false,
      readOnly: true,
      secondScoreEngine: false,
    },
    security: {
      rlsEnforced: true,
      idempotencyReplayStable: true,
      changedInputConflictRejected: true,
      crossAdvisorReadBlocked: true,
      crossAdvisorWriteBlocked: true,
      correctionLineageAppendOnly: true,
      privacyMinimized: true,
    },
    boundaries: {
      moduleAuthoritiesPreserved: true,
      unifiedTimelineIsReadModel: true,
      humanConfirmationRequired: true,
      centralDuplicateTruthStore: false,
      automaticIdentityMerge: false,
      automaticOpportunityCreation: false,
      automaticApplicationCreation: false,
      automaticPolicyCreation: false,
      automaticStageAdvance: false,
      automaticContact: false,
      automaticMessage: false,
      automaticTask: false,
      automaticCalendar: false,
      automaticBusinessAction: false,
      opaqueHumanScoring: false,
      calculationTruthCopied: false,
      timelineMutation: false,
    },
  };

  return deepFreeze({ ...base, ...overrides });
}

function validateSamePerson(records, personReference, collection) {
  for (const record of records) {
    if (record.personReference !== personReference) {
      fail("CRS11_PERSON_LINEAGE_MISMATCH", `${collection} contains another person`);
    }
  }
}

function validateTimeline(entries, personReference) {
  if (!Array.isArray(entries) || entries.length < 7) {
    fail("CRS11_TIMELINE_INCOMPLETE", "the unified Timeline must cover the complete journey");
  }
  validateSamePerson(entries, personReference, "timeline");
  const refs = new Set();
  let previous = -Infinity;
  for (const entry of entries) {
    const reference = requireText(entry.entryReference, "timeline.entryReference");
    if (refs.has(reference)) fail("CRS11_TIMELINE_DUPLICATE_ENTRY", reference);
    refs.add(reference);
    requireText(entry.authority, "timeline.authority");
    requireText(entry.sourceDomain, "timeline.sourceDomain");
    const instant = Date.parse(requireIso(entry.occurredAt, "timeline.occurredAt"));
    if (instant < previous) fail("CRS11_TIMELINE_ORDER_INVALID", reference);
    previous = instant;
    if (entry.correctionOf && !refs.has(entry.correctionOf)) {
      fail("CRS11_CORRECTION_LINEAGE_INVALID", reference);
    }
  }
  const covered = new Set(entries.map(entry => entry.sourceDomain));
  for (const domain of REQUIRED_DOMAINS) {
    if (!covered.has(domain)) fail("CRS11_TIMELINE_DOMAIN_MISSING", domain);
  }
}

function validateJourneyEvidence(planInput, evidenceInput) {
  const plan = planInput?.contractType === PLAN_TYPE
    ? planInput
    : createAcceptancePlan(planInput);
  const evidence = evidenceInput || {};

  if (evidence.fixtureReference !== plan.fixtureReference) {
    fail("CRS11_FIXTURE_MISMATCH", "plan and evidence fixture differ");
  }
  const advisorReference = requireText(evidence.advisorReference, "advisorReference");
  if (advisorReference !== plan.identities.advisorReference) {
    fail("CRS11_ADVISOR_MISMATCH", "evidence belongs to another advisor");
  }

  const person = evidence.person || {};
  const personReference = requireText(person.personReference, "person.personReference");
  if (personReference !== plan.identities.personReference || person.identityCount !== 1) {
    fail("CRS11_ONE_PERSON_REQUIRED", "exactly one canonical person is required");
  }
  if (
    person.relationshipReference !== plan.identities.relationshipReference
    || person.advisorReference !== advisorReference
  ) {
    fail("CRS11_RELATIONSHIP_LINEAGE_MISMATCH", "advisor relationship lineage is invalid");
  }
  if (person.authority !== "CARTERA_010B_COMMERCIAL_PERSON") {
    fail("CRS11_PERSON_AUTHORITY_MISMATCH", "CommercialPerson authority changed");
  }

  const movements = evidence.movements || [];
  const movementIds = unique(movements.map(item => item.correlationId));
  if (movementIds.length < 2 || movementIds.some(value => !value)) {
    fail("CRS11_MULTIPLE_MOVEMENTS_REQUIRED", "at least two commercial movements are required");
  }

  const pipeline = evidence.pipeline || [];
  const activities = evidence.activities || [];
  const quotes = evidence.quotes || [];
  const applications = evidence.applications || [];
  const policies = evidence.policies || [];
  validateSamePerson(pipeline, personReference, "pipeline");
  validateSamePerson(activities, personReference, "activities");
  validateSamePerson(quotes, personReference, "quotes");
  validateSamePerson(applications, personReference, "applications");
  validateSamePerson(policies, personReference, "policies");

  if (pipeline.length < 2 || pipeline.some(item => item.inventedExternalMilestone !== false)) {
    fail("CRS11_PIPELINE_ACCEPTANCE_FAILED", "Pipeline movements or milestone authority are invalid");
  }
  if (activities.length < 3) fail("CRS11_ACTIVITY_ACCEPTANCE_FAILED", "Activity journey is incomplete");
  const activityRefs = new Set(activities.map(item => item.activityReference));
  for (const item of activities) {
    if (item.correctionOf && !activityRefs.has(item.correctionOf)) {
      fail("CRS11_ACTIVITY_CORRECTION_INVALID", item.activityReference);
    }
  }

  if (unique(quotes.map(item => item.quoteReference)).length < 2) {
    fail("CRS11_MULTIPLE_QUOTES_REQUIRED", "at least two Quotes are required");
  }
  for (const quote of quotes) {
    if (!Array.isArray(quote.quoteVersionReferences) || quote.quoteVersionReferences.length < 1) {
      fail("CRS11_QUOTE_VERSION_REQUIRED", quote.quoteReference);
    }
    if (quote.numericTruthCopied !== false || !quote.calculationAuthority) {
      fail("CRS11_QUOTE_AUTHORITY_VIOLATION", quote.quoteReference);
    }
  }

  const quoteReferences = new Set(quotes.map(item => item.quoteReference));
  const applicationReferences = new Set(applications.map(item => item.applicationReference));
  for (const application of applications) {
    if (!quoteReferences.has(application.quoteReference)) {
      fail("CRS11_APPLICATION_QUOTE_LINEAGE_INVALID", application.applicationReference);
    }
    if (!application.signatureEvidenceReference || application.policyReference != null) {
      fail("CRS11_APPLICATION_POLICY_COLLAPSE", application.applicationReference);
    }
  }

  if (unique(policies.map(item => item.policyReference)).length < 2) {
    fail("CRS11_MULTIPLE_POLICIES_REQUIRED", "at least two Policies are required");
  }
  for (const policy of policies) {
    if (!policy.issuanceEvidenceReference) {
      fail("CRS11_POLICY_ISSUANCE_EVIDENCE_REQUIRED", policy.policyReference);
    }
    if (policy.applicationReference && !applicationReferences.has(policy.applicationReference)) {
      fail("CRS11_POLICY_APPLICATION_LINEAGE_INVALID", policy.policyReference);
    }
  }

  validateTimeline(evidence.timeline, personReference);

  const intelligence = evidence.intelligence || {};
  if (
    intelligence.personReference !== personReference
    || intelligence.readOnly !== true
    || intelligence.humanDecisionRequired !== true
    || intelligence.automaticBusinessAction !== false
    || intelligence.secondScoreEngine !== false
  ) {
    fail("CRS11_INTELLIGENCE_BOUNDARY_VIOLATION", "relationship intelligence exceeded its authority");
  }

  for (const check of REQUIRED_SECURITY_CHECKS) {
    if (evidence.security?.[check] !== true) {
      fail("CRS11_SECURITY_ACCEPTANCE_FAILED", check);
    }
  }
  if (
    evidence.boundaries?.moduleAuthoritiesPreserved !== true
    || evidence.boundaries?.unifiedTimelineIsReadModel !== true
    || evidence.boundaries?.humanConfirmationRequired !== true
  ) {
    fail("CRS11_AUTHORITY_BOUNDARY_VIOLATION", "governing authority invariants failed");
  }
  for (const boundary of BLOCKED_BOUNDARIES) {
    if (evidence.boundaries?.[boundary] !== false) {
      fail("CRS11_FORBIDDEN_EFFECT_DETECTED", boundary);
    }
  }

  const evidenceDigest = digest(evidence);
  const result = {
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    fixtureReference: plan.fixtureReference,
    acceptanceReference: `acceptance:${evidenceDigest.slice(0, 32)}`,
    status: "PASS",
    recordedAt: requireIso(evidence.recordedAt, "recordedAt"),
    advisorReference,
    personReference,
    relationshipReference: person.relationshipReference,
    counts: {
      canonicalPeople: 1,
      commercialMovements: movementIds.length,
      pipelineRecords: pipeline.length,
      activities: activities.length,
      quotes: quotes.length,
      quoteVersions: quotes.reduce((sum, item) => sum + item.quoteVersionReferences.length, 0),
      applications: applications.length,
      policies: policies.length,
      timelineEntries: evidence.timeline.length,
    },
    checks: {
      onePersonEndToEnd: true,
      multipleCommercialMovements: true,
      multipleQuotes: true,
      multiplePolicies: true,
      unifiedTimeline: true,
      moduleAuthoritiesPreserved: true,
      crossAdvisorIsolation: true,
      idempotencyAndConflictSafety: true,
      correctionLineage: true,
      privacyMinimized: true,
      humanDecisionPreserved: true,
    },
    evidenceDigest,
    readOnly: true,
    promotionCandidate: true,
    boundaries: evidence.boundaries,
  };
  return deepFreeze(result);
}

const CRS_11_BOUNDARIES = deepFreeze({
  readOnlyAcceptance: true,
  canonicalMutation: false,
  schemaMutation: false,
  supabaseMutation: false,
  productUiMutation: false,
  automaticBusinessAction: false,
  automaticProgramPromotion: false,
  secondTruthStore: false,
});

module.exports = Object.freeze({
  CONTRACT_TYPE,
  CONTRACT_VERSION,
  PLAN_TYPE,
  FIXTURE_REFERENCE,
  REQUIRED_DOMAINS,
  REQUIRED_DEVICES,
  REQUIRED_SECURITY_CHECKS,
  BLOCKED_BOUNDARIES,
  CRS_11_BOUNDARIES,
  createAcceptancePlan,
  createJuanPerezEvidence,
  validateJourneyEvidence,
  digest,
});

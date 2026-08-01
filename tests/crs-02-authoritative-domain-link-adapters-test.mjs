import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const linkContract = require("../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js");
const adapters = require("../platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js");
const activityContract = require("../platform/event-evidence/canonical-activity-event-contract.js");
const quoteContract = require("../platform/event-evidence/quote-lifecycle-event-contract.js");
const quoteCarteraContract = require("../platform/shared-commercial-model/accepted-quote-cartera-relationship-contract.js");

const identity = Object.freeze({
  advisorReference: "advisor:jorge",
  personReference: "person:ana",
  correlationId: "movement:retiro-2026",
});

function authorityReceipt(overrides = {}) {
  return {
    authoritative: true,
    domain: "PIPELINE",
    recordType: "OPPORTUNITY",
    recordReference: "opportunity:retiro-2026",
    authority: "PIPELINE_OPPORTUNITY_AUTHORITY",
    sourceEventReference: "pipeline-event:opportunity-created",
    effectiveAt: "2026-08-01T20:00:00.000Z",
    recordedAt: "2026-08-01T20:00:01.000Z",
    privacyClassification: "PRIVATE",
    idempotencyKey: "crs02:opportunity:retiro-2026",
    ...overrides,
  };
}

function activityEvent() {
  return activityContract.createCanonicalActivityEvent({
    event_type: "PROSPECT_CREATED",
    tenant_id: "advisor:jorge",
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "PROSPECT", id: "prospect:ana" },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "pipeline-save:ana",
      channel: "PIPELINE",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-08-01T20:00:00.000Z",
    recorded_at: "2026-08-01T20:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "prospect:ana",
    idempotency_key: "prospect-created:ana",
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    payload: {
      prospect_reference: "prospect:ana",
      source_category: "REFERRAL",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "prospect:ana",
      captured_via: "PIPELINE",
      evidence_references: ["evidence:prospect:ana"],
      correction_reason_code: null,
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: activityContract.DEFAULT_SAFETY_FLAGS,
  });
}

function quoteEvent() {
  return quoteContract.createQuoteLifecycleEvent({
    event_type: "QUOTE_PROSPECT_ACCEPTED",
    tenant_id: "advisor:jorge",
    actor: { type: "ADVISOR", id: "advisor:jorge" },
    subject: { type: "QUOTE", id: "quote:ana:001" },
    source: {
      type: "ADVISOR_CONFIRMED",
      reference: "quote-review:ana",
      channel: "QUOTE",
    },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: "2026-08-01T20:10:00.000Z",
    recorded_at: "2026-08-01T20:10:01.000Z",
    correlation_id: "prospect:ana",
    causation_id: null,
    idempotency_key: "quote-accepted:ana:001",
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    payload: {
      quote_reference: "quote:ana:001",
      quote_version_reference: "quote-version:ana:001:01",
      prospect_reference: "prospect:ana",
      product_reference: "product:vida-mujer",
      lifecycle_state: "PROSPECT_ACCEPTED",
      previous_lifecycle_state: "PRESENTED",
      application_reference: null,
      decision_reason_code: null,
    },
    provenance: {
      source_system: "quote-lifecycle-persistence",
      source_record_id: "persist:quote:ana:001",
      captured_via: "FORGE_UI",
      evidence_references: ["quote-document:ana:001"],
      freshness_status: "reviewed_current_session",
      snapshot_digest: "a".repeat(64),
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: quoteContract.DEFAULT_SAFETY_FLAGS,
  });
}

function quoteCarteraRelationship({ unresolved = false } = {}) {
  return quoteCarteraContract.createAcceptedQuoteCarteraRelationship({
    advisorId: "advisor:jorge",
    actorReference: "advisor:jorge",
    createdAt: "2026-08-01T20:15:00.000Z",
    quote: {
      durable: true,
      quoteReference: "quote:ana:001",
      quoteVersionReference: "quote-version:ana:001:01",
      prospectReference: "prospect:ana",
      productReference: "product:vida-mujer",
      lifecycleState: "PROSPECT_ACCEPTED",
      snapshotDigest: "a1b2c3d4",
      eventReferences: ["quote-event:presented", "quote-event:accepted"],
      applicationReference: null,
      persistenceReceiptReference: "quote-receipt:ana:001",
    },
    identity: unresolved
      ? {
          outcome: "UNRESOLVED",
          prospectReference: "prospect:ana",
          commercialPersonReference: null,
          decisionReference: null,
          evidenceReferences: [],
        }
      : {
          outcome: "LINK_CONFIRMED",
          prospectReference: "prospect:ana",
          commercialPersonReference: "person:ana",
          decisionReference: "identity-decision:ana",
          evidenceReferences: ["identity-evidence:ana"],
        },
    policyEvidence: {
      state: "ABSENT",
      packetReference: null,
      evidenceReferences: [],
      reviewedAt: null,
      reviewReference: null,
    },
  });
}

test("generic authoritative receipt becomes a common Pipeline domain link", () => {
  const link = adapters.fromAuthoritativeReceipt(authorityReceipt(), identity);
  assert.equal(link.contractType, linkContract.CONTRACT_TYPE);
  assert.equal(link.personReference, "person:ana");
  assert.equal(link.domain, "PIPELINE");
  assert.equal(link.correlationId, "movement:retiro-2026");
  assert.match(link.relationshipReference, /^relationship:/);
});

test("Cartera receipts may remain outside a commercial movement without copying Policy truth", () => {
  const link = adapters.fromAuthoritativeReceipt(authorityReceipt({
    domain: "CARTERA",
    recordType: "POLICY",
    recordReference: "policy:vida:001",
    authority: "CARTERA_POLICY_AUTHORITY",
    sourceEventReference: "policy-event:issued:001",
    idempotencyKey: "crs02:policy:vida:001",
  }), {
    advisorReference: "advisor:jorge",
    personReference: "person:ana",
  });
  assert.equal(link.correlationId, null);
  assert.equal("policyNumber" in link, false);
  assert.equal("premiumAmount" in link, false);
});

test("unresolved person produces missing-link evidence instead of a partial link", () => {
  const missing = adapters.fromAuthoritativeReceipt(authorityReceipt(), {
    correlationId: "movement:retiro-2026",
    sourceIdentityReference: "prospect:ana",
  });
  assert.equal(missing.contractType, linkContract.MISSING_LINK_TYPE);
  assert.equal(missing.missingReason, "PERSON_UNRESOLVED");
  assert.equal("personReference" in missing, false);
});

test("FES Activity adapter preserves source attribution but does not reinterpret legacy correlation", () => {
  const event = activityEvent();
  const withoutMovement = adapters.fromCanonicalActivityEvent(event, {
    advisorReference: "advisor:jorge",
    personReference: "person:ana",
  });
  assert.equal(withoutMovement.domain, "ACTIVITY");
  assert.equal(withoutMovement.authority, "FES_ACTIVITY_EVENT_LEDGER");
  assert.equal(withoutMovement.sourceEventReference, event.event_id);
  assert.equal(withoutMovement.correlationId, null);

  const withMovement = adapters.fromCanonicalActivityEvent(event, identity);
  assert.equal(withMovement.correlationId, "movement:retiro-2026");
  assert.notEqual(withMovement.correlationId, event.correlation_id);
});

test("Quote adapter links canonical Quote without copying calculation truth", () => {
  const event = quoteEvent();
  const link = adapters.fromQuoteLifecycleEvent(event, identity);
  assert.equal(link.domain, "QUOTE");
  assert.equal(link.recordType, "QUOTE");
  assert.equal(link.recordReference, "quote:ana:001");
  assert.equal(link.sourceEventReference, event.event_id);
  assert.equal("payload" in link, false);
  assert.notEqual(link.correlationId, event.correlation_id);
});

test("accepted Quote-Cartera edge reuses confirmed person and latest event reference", () => {
  const relationship = quoteCarteraRelationship();
  const link = adapters.fromAcceptedQuoteCarteraRelationship(relationship, {
    correlationId: "movement:retiro-2026",
  });
  assert.equal(link.personReference, "person:ana");
  assert.equal(link.recordReference, "quote:ana:001");
  assert.equal(link.sourceEventReference, "quote-event:accepted");
  assert.equal(link.authority, "QUOTE_PERSISTENCE_AUTHORITY");
});

test("unresolved Quote-Cartera edge remains a missing link", () => {
  const missing = adapters.fromAcceptedQuoteCarteraRelationship(
    quoteCarteraRelationship({ unresolved: true }),
  );
  assert.equal(missing.contractType, linkContract.MISSING_LINK_TYPE);
  assert.equal(missing.sourceIdentityReference, "prospect:ana");
});

test("non-authoritative or payload-bearing receipts fail closed", () => {
  assert.throws(
    () => adapters.fromAuthoritativeReceipt(authorityReceipt({ authoritative: false }), identity),
    error => error.code === "CRS02_AUTHORITATIVE_RECEIPT_REQUIRED",
  );
  assert.throws(
    () => adapters.fromAuthoritativeReceipt({
      ...authorityReceipt(),
      payload: { stage: "CLOSED" },
    }, identity),
    error => error.code === "CRS02_AUTHORITY_RECEIPT_KEYS_INVALID",
  );
});

test("adapter diagnostics keep persistence, source-correlation reinterpretation and effects blocked", () => {
  const diagnostics = adapters.diagnostics();
  assert.equal(diagnostics.sourceCorrelationReinterpretedAsCommercialMovement, false);
  assert.equal(diagnostics.durableRelationshipEntityCreated, false);
  assert.equal(diagnostics.centralLinkLedgerCreated, false);
  assert.equal(diagnostics.authoritativePayloadCopied, false);
  assert.equal(diagnostics.automaticPersistence, false);
  assert.equal(diagnostics.automaticBusinessAction, false);
});

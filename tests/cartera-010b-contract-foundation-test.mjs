import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const contract = require(
  "../platform/shared-commercial-model/cartera-010b-contract-validator.js",
);

const migration = readFileSync(
  new URL(
    "../supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql",
    import.meta.url,
  ),
  "utf8",
);

const now = "2026-07-31T06:20:00.000Z";
const advisorId = "advisor:jorge";
const personReference = "person:ana";
const policyReference = "policy:smnyl:123";

function validPerson(overrides = {}) {
  return {
    contractType: "FORGE_COMMERCIAL_PERSON",
    schemaVersion: "1.0.0",
    personReference,
    advisorId,
    displayIdentity: {
      displayName: "Ana Pérez",
      preferredName: "Ana",
    },
    normalizedMatching: {
      normalizedName: "ana perez",
      verifiedPhone: null,
      verifiedEmail: "ana@example.com",
      birthDate: null,
    },
    lifecycleState: "CONFIRMED",
    privacyClassification: "PRIVATE",
    evidenceReferences: ["evidence:identity:1"],
    createdAt: now,
    createdBy: advisorId,
    updatedAt: now,
    version: 1,
    ...overrides,
  };
}

function validPolicy(overrides = {}) {
  return {
    contractType: "FORGE_CANONICAL_POLICY",
    schemaVersion: "2.0.0",
    policyReference,
    advisorId,
    carrierReference: "carrier:smnyl",
    policyNumber: "SMNYL-123",
    productReference: "product:orvi",
    issueDate: null,
    effectiveFrom: null,
    effectiveTo: null,
    status: {
      value: "UNKNOWN",
      source: "evidence:policy:1",
      asOf: now,
    },
    currency: null,
    premiumAmount: null,
    paymentFrequency: null,
    sumInsured: null,
    completenessState: "PARTIAL",
    freshnessState: "UNKNOWN",
    conflictState: "CLEAR",
    evidenceVersionReferences: ["policy-evidence:1"],
    currentVersion: 1,
    createdAt: now,
    createdBy: advisorId,
    updatedAt: now,
    ...overrides,
  };
}

function validRole(overrides = {}) {
  return {
    contractType: "FORGE_POLICY_ROLE",
    schemaVersion: "1.0.0",
    policyRoleReference: "policy-role:owner:1",
    policyReference,
    advisorId,
    participantPersonReference: personReference,
    participantAccountReference: null,
    roleType: "POLICY_OWNER",
    confirmationState: "CONFIRMED",
    privacyClassification: "PRIVATE",
    visibilityScope: "OWNING_ADVISOR_ONLY",
    evidenceReferences: ["policy-evidence:1"],
    effectiveFrom: now,
    effectiveTo: null,
    createdAt: now,
    createdBy: advisorId,
    version: 1,
    correctionOf: null,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    ...overrides,
  };
}

function requireMarkers(text, markers) {
  for (const marker of markers) {
    assert.match(
      text,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `Missing marker: ${marker}`,
    );
  }
}

test("stable command digests are deterministic SHA-256-shaped values", () => {
  const first = contract.stableDigest({ b: 2, a: 1 });
  const second = contract.stableDigest({ a: 1, b: 2 });
  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test("CommercialPerson validation preserves durable identity without role authority", () => {
  const person = contract.validateCommercialPerson(validPerson());
  assert.equal(person.personReference, personReference);
  assert.equal(person.lifecycleState, "CONFIRMED");
  assert.equal(person.normalizedMatching.verifiedPhone, null);
  assert.ok(Object.isFrozen(person));
  assert.equal("policyReference" in person, false);
  assert.equal("servicingAdvisor" in person, false);
});

test("archived people require complete immutable archive metadata", () => {
  assert.throws(
    () =>
      contract.validateCommercialPerson(
        validPerson({ lifecycleState: "ARCHIVED" }),
      ),
    error => error.code === "CARTERA010B_PERSON_ARCHIVE_INVALID",
  );
});

test("Policy validation keeps unknown financial and status facts explicit", () => {
  const policy = contract.validatePolicy(validPolicy());
  assert.equal(policy.status.value, "UNKNOWN");
  assert.equal(policy.currency, null);
  assert.equal(policy.premiumAmount, null);
  assert.equal(policy.paymentFrequency, null);
  assert.equal(policy.sumInsured, null);
});

test("PolicyRole requires exactly one participant kind", () => {
  assert.throws(
    () =>
      contract.validatePolicyRole(
        validRole({
          participantAccountReference: "account:family:1",
        }),
      ),
    error => error.code === "CARTERA010B_ROLE_PARTICIPANT_XOR_INVALID",
  );
  assert.throws(
    () =>
      contract.validatePolicyRole(
        validRole({
          participantPersonReference: null,
          participantAccountReference: null,
        }),
      ),
    error => error.code === "CARTERA010B_ROLE_PARTICIPANT_XOR_INVALID",
  );
});

test("beneficiary visibility cannot be broadened to the general Policy team", () => {
  assert.throws(
    () =>
      contract.validatePolicyRole(
        validRole({
          roleType: "BENEFICIARY",
          visibilityScope: "POLICY_TEAM",
        }),
      ),
    error => error.code === "CARTERA010B_BENEFICIARY_VISIBILITY_TOO_BROAD",
  );
});

test("identity commands never turn unresolved outcomes into canonical mutations", () => {
  assert.throws(
    () =>
      contract.buildIdentityResolutionCommand({
        advisorId,
        actorReference: advisorId,
        idempotencyKey: "identity:command:1",
        decidedAt: now,
        outcome: "UNRESOLVED",
        sourceIdentity: {
          sourceDomain: "ADVISOR_OS_SALES",
          sourceIdentityType: "PROSPECT",
          sourceRecordReference: "prospect:1",
          prospectReference: "prospect:1",
        },
        existingPersonReference: personReference,
        newPerson: null,
        candidatePersonReferences: [personReference],
        evidenceReferences: ["evidence:identity:1"],
        reasonCode: "INSUFFICIENT_EVIDENCE",
      }),
    error =>
      error.code === "CARTERA010B_UNRESOLVED_COMMAND_MUTATION_FORBIDDEN",
  );
});

test("CREATE_CONFIRMED identity commands require explicit reviewed person data", () => {
  const command = contract.buildIdentityResolutionCommand({
    advisorId,
    actorReference: advisorId,
    idempotencyKey: "identity:command:2",
    decidedAt: now,
    outcome: "CREATE_CONFIRMED",
    sourceIdentity: {
      sourceDomain: "ADVISOR_OS_SALES",
      sourceIdentityType: "PROSPECT",
      sourceRecordReference: "prospect:2",
      prospectReference: "prospect:2",
    },
    existingPersonReference: null,
    newPerson: {
      personReference: "person:new:2",
      displayName: "Carlos López",
      preferredName: null,
      normalizedName: "carlos lopez",
      verifiedPhone: null,
      verifiedEmail: null,
      birthDate: null,
      privacyClassification: "PRIVATE",
    },
    candidatePersonReferences: [],
    evidenceReferences: ["evidence:identity:2"],
    reasonCode: "ADVISOR_CONFIRMED_NEW_PERSON",
  });
  assert.equal(command.outcome, "CREATE_CONFIRMED");
  assert.match(command.commandDigest, /^[a-f0-9]{64}$/);
});

test("confirmed Policy commands fail closed when any role remains unconfirmed", () => {
  assert.throws(
    () =>
      contract.buildConfirmedPolicyCommand({
        advisorId,
        actorReference: advisorId,
        idempotencyKey: "policy:command:1",
        confirmedAt: now,
        policy: validPolicy(),
        roles: [validRole({ confirmationState: "PROPOSED" })],
        evidence: {
          evidenceVersionReference: "policy-evidence:1",
          documentHash: "a".repeat(64),
          sourceType: "ISSUED_POLICY_DOCUMENT",
          observedAt: now,
          verificationState: "CONFIRMED",
          fieldClaims: {},
          provenance: {},
        },
        lineage: {},
      }),
    error => error.code === "CARTERA010B_POLICY_ROLE_UNCONFIRMED",
  );
});

test("confirmed Policy commands preserve multi-party roles and evidence", () => {
  const command = contract.buildConfirmedPolicyCommand({
    advisorId,
    actorReference: advisorId,
    idempotencyKey: "policy:command:2",
    confirmedAt: now,
    policy: validPolicy(),
    roles: [
      validRole(),
      validRole({
        policyRoleReference: "policy-role:insured:1",
        roleType: "INSURED",
      }),
      validRole({
        policyRoleReference: "policy-role:payor:1",
        participantPersonReference: null,
        participantAccountReference: "account:family:1",
        roleType: "PAYOR",
      }),
    ],
    evidence: {
      evidenceVersionReference: "policy-evidence:1",
      documentHash: "b".repeat(64),
      sourceType: "ISSUED_POLICY_DOCUMENT",
      observedAt: now,
      verificationState: "CONFIRMED",
      fieldClaims: { policyNumber: "SMNYL-123" },
      provenance: { sourceSystem: "POLICY_INTELLIGENCE" },
    },
    lineage: {
      quoteReference: "quote:1",
      applicationReference: "application:1",
      previousPolicyVersionReference: null,
    },
  });
  assert.equal(command.roles.length, 3);
  assert.equal(command.policy.status.value, "UNKNOWN");
  assert.match(command.commandDigest, /^[a-f0-9]{64}$/);
});

test("migration creates the complete owner-scoped persistence graph", () => {
  requireMarkers(migration, [
    "create table if not exists public.commercial_people",
    "create table if not exists public.identity_resolution_decisions",
    "create table if not exists public.commercial_source_identity_links",
    "create table if not exists public.commercial_accounts",
    "create table if not exists public.commercial_account_memberships",
    "create table if not exists public.canonical_policies",
    "create table if not exists public.policy_evidence_versions",
    "create table if not exists public.policy_versions",
    "create table if not exists public.policy_roles",
    "create table if not exists public.policy_conflicts",
    "create table if not exists public.cartera010b_command_receipts",
    "foreign key (participant_person_id, advisor_id)",
    "foreign key (participant_account_id, advisor_id)",
    "foreign key (policy_version_id, advisor_id)",
  ]);
});

test("migration locks identity uniqueness, append-only history, RLS and direct writes", () => {
  requireMarkers(migration, [
    "commercial_source_identity_links_active_source_uq",
    "commercial_source_identity_links_active_prospect_uq",
    "CARTERA010B_APPEND_ONLY",
    "CARTERA010B_HARD_DELETE_FORBIDDEN",
    "alter table public.%I enable row level security",
    "revoke all on table public.%I from authenticated",
    "grant select on table public.%I to authenticated",
    "using (advisor_id = auth.uid())",
    "revoke select on table public.policy_roles from authenticated",
    "cartera_policy_roles_general",
  ]);
});

test("migration does not silently default unknown Policy truth", () => {
  assert.doesNotMatch(migration, /status_value text not null default/i);
  assert.doesNotMatch(migration, /currency text default/i);
  assert.doesNotMatch(migration, /premium_amount numeric default/i);
  assert.doesNotMatch(migration, /sum_insured numeric default/i);
  assert.match(migration, /status_value in \([\s\S]*'UNKNOWN'/);
  assert.match(migration, /currency is null or currency ~ '\^\[A-Z\]\{3\}\$'/);
});

test("beneficiary rows are structurally excluded from broad visibility", () => {
  requireMarkers(migration, [
    "policy_roles_beneficiary_visibility_ck",
    "role_type <> 'BENEFICIARY'",
    "visibility_scope in ('OWNING_ADVISOR_ONLY', 'RESTRICTED_ROLE_VIEW')",
    "where visibility_scope = 'POLICY_TEAM'",
  ]);
});

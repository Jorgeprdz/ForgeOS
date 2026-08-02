"use strict";

(function (root, factory) {
  const common = typeof module !== "undefined" && module.exports;
  const contract = common
    ? require("../../platform/shared-commercial-model/crs-07-application-policy-lineage-contract.js")
    : root?.ForgeCrs07ApplicationPolicyLineageContract;
  const adapters = common
    ? require("../../platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js")
    : root?.ForgeCrs02AuthoritativeDomainLinkAdapters;
  const links = common
    ? require("../../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(contract, adapters, links);
  if (common) module.exports = api;
  if (root) root.ForgeCrs07ApplicationPolicyLineageService = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (contract, adapters, links) {
  const SERVICE_VERSION = "CRS-07-APPLICATION-POLICY-SERVICE-001.1";
  const RPC = Object.freeze({
    confirmIssuedPolicy: "forge_crs07_confirm_issued_policy_from_application",
  });

  class Crs07ApplicationPolicyLineageServiceError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs07ApplicationPolicyLineageServiceError";
      this.code = code;
      this.details = details;
    }
  }
  const fail = (code, message, details = null) => {
    throw new Crs07ApplicationPolicyLineageServiceError(code, message, details);
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const optional = value => typeof value === "string" && value.trim() ? value.trim() : null;
  const required = (value, code, label) => optional(value) || fail(code, `${label} es obligatoria.`);
  const iso = value => new Date(value).toISOString();

  function ensureDependencies() {
    if (!contract?.createApplicationPolicyLineage || !adapters?.fromAuthoritativeReceipt ||
      !links?.deriveCorrelationId) {
      fail("CRS07_DEPENDENCIES_REQUIRED", "CRS 02 y CRS 07 son obligatorios.");
    }
  }
  async function authenticatedUser(client) {
    if (!client?.auth?.getUser || !client?.from || !client?.rpc) {
      fail("CRS07_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) fail("CRS07_AUTH_REQUIRED", "Sesión autenticada requerida.");
    return data.user;
  }
  const queryError = (error, fallback) => {
    if (error) fail(error.code || fallback, error.message || "La lectura CRS 07 falló.");
  };
  async function one(query, fallback) {
    const response = typeof query?.single === "function" ? await query.single() : await query;
    const { data, error } = response || {};
    queryError(error, fallback);
    if (!data) fail(fallback, "Registro autoritativo no encontrado.");
    return data;
  }
  async function maybeOne(query, fallback) {
    const response = typeof query?.maybeSingle === "function"
      ? await query.maybeSingle()
      : typeof query?.single === "function" ? await query.single() : await query;
    const { data, error } = response || {};
    if (error && !["PGRST116", "PGRST123"].includes(error.code)) queryError(error, fallback);
    return data || null;
  }
  async function many(query, fallback) {
    const { data, error } = await query;
    queryError(error, fallback);
    return Array.isArray(data) ? data : [];
  }

  const applicationView = (application, person) => contract.normalizeApplication({
    applicationReference: application.application_reference,
    lifecycleState: application.lifecycle_state,
    personReference: person.person_reference,
    quoteReference: application.quote_reference,
    quoteVersionReference: application.quote_version_reference,
    prospectReference: application.prospect_reference,
    productReference: application.product_reference,
    currentVersion: application.current_version,
  });
  const policyView = (policy, version, evidence) => contract.normalizePolicy({
    policyReference: policy.policy_reference,
    policyVersionReference: version.policy_version_reference,
    versionNumber: version.version_number,
    carrierReference: policy.carrier_reference,
    policyNumber: policy.policy_number,
    productReference: policy.product_reference,
    statusValue: policy.status_value,
    issueDate: policy.issue_date ? `${policy.issue_date}T00:00:00.000Z` : null,
    effectiveFrom: policy.effective_from,
    applicationReference: version.application_reference,
    quoteReference: version.quote_reference,
    evidenceVersionReference: evidence.evidence_version_reference,
    confirmedAt: version.confirmed_at,
  });
  const evidenceView = evidence => contract.normalizeEvidence({
    evidenceVersionReference: evidence.evidence_version_reference,
    verificationState: evidence.verification_state,
    sourceType: evidence.source_type,
    documentHash: evidence.document_hash,
    observedAt: evidence.observed_at,
    provenance: evidence.provenance,
  });
  const roleView = (role, policy, person) => contract.normalizePersonRole({
    policyRoleReference: role.policy_role_reference,
    policyReference: policy.policy_reference,
    personReference: person.person_reference,
    roleType: role.role_type,
    confirmationState: role.confirmation_state,
    privacyClassification: role.privacy_classification,
    visibilityScope: role.visibility_scope,
    effectiveFrom: role.effective_from,
    effectiveTo: role.effective_to,
  });

  function domainLink({ user, person, policy, version, role, correlationId = null }) {
    const effectiveAt = policy.effective_from ||
      (policy.issue_date ? `${policy.issue_date}T00:00:00.000Z` : version.confirmed_at);
    return adapters.fromAuthoritativeReceipt({
      authoritative: true,
      domain: "CARTERA",
      recordType: "POLICY",
      recordReference: policy.policy_reference,
      authority: "CARTERA_POLICY_AUTHORITY",
      sourceEventReference: version.policy_version_reference,
      effectiveAt: iso(effectiveAt),
      recordedAt: iso(version.confirmed_at),
      privacyClassification: role.privacy_classification,
      idempotencyKey: `crs07-policy:${version.policy_version_reference}`,
    }, {
      advisorReference: user.id,
      personReference: person.person_reference,
      correlationId,
      privacyClassification: role.privacy_classification,
      sourceIdentityReference: null,
    });
  }

  async function loadApplication(client, user, applicationReference) {
    const application = await one(
      client.from("commercial_applications").select("*")
        .eq("advisor_id", user.id).eq("application_reference", applicationReference),
      "CRS07_APPLICATION_READ_FAILED",
    );
    if (application.advisor_id !== user.id) fail("CRS07_APPLICATION_NOT_OWNED", "Application ajena.");
    const person = await one(
      client.from("commercial_people").select("id,advisor_id,person_reference,lifecycle_state,archived_at")
        .eq("advisor_id", user.id).eq("id", application.person_id),
      "CRS07_PERSON_READ_FAILED",
    );
    if (person.lifecycle_state !== "CONFIRMED" || person.archived_at) {
      fail("CRS07_PERSON_NOT_CONFIRMED", "La persona no está confirmada.");
    }
    return { application, person };
  }

  async function latestVersion(client, user, applicationReference) {
    return maybeOne(
      client.from("policy_versions").select("*")
        .eq("advisor_id", user.id).eq("application_reference", applicationReference)
        .order("version_number", { ascending: false }).limit(1),
      "CRS07_POLICY_VERSION_READ_FAILED",
    );
  }

  async function compose({ client, user, application, person, version, correlationId = null }) {
    const policy = await one(
      client.from("canonical_policies").select("*")
        .eq("advisor_id", user.id).eq("id", version.policy_id),
      "CRS07_POLICY_READ_FAILED",
    );
    const evidence = await one(
      client.from("policy_evidence_versions").select("*")
        .eq("advisor_id", user.id).eq("id", version.evidence_version_id),
      "CRS07_EVIDENCE_READ_FAILED",
    );
    const roles = await many(
      client.from("policy_roles").select("*")
        .eq("advisor_id", user.id).eq("policy_id", policy.id)
        .eq("policy_version_id", version.id).eq("participant_person_id", person.id)
        .eq("confirmation_state", "CONFIRMED"),
      "CRS07_ROLE_READ_FAILED",
    );
    const role = roles.find(item => contract.APPLICATION_PERSON_POLICY_ROLES.includes(item.role_type));
    if (!role) {
      return contract.createMissingApplicationPolicyLineage({
        advisorReference: user.id,
        application: applicationView(application, person),
        missingReason: "PERSON_ROLE_UNAVAILABLE",
        observedAt: new Date().toISOString(),
        details: { policyReference: policy.policy_reference },
      });
    }
    const link = domainLink({ user, person, policy, version, role, correlationId });
    return contract.createApplicationPolicyLineage({
      advisorReference: user.id,
      application: applicationView(application, person),
      policy: policyView(policy, version, evidence),
      issuanceEvidence: evidenceView(evidence),
      personRole: roleView(role, policy, person),
      domainLink: link,
      correlationId,
    });
  }

  function createService({ client } = {}) {
    ensureDependencies();

    async function confirmIssuedPolicyFromApplication(input = {}) {
      if (input.confirmedByAdvisor !== true || !optional(input.confirmationReference)) {
        fail("CRS07_HUMAN_CONFIRMATION_REQUIRED", "La emisión requiere confirmación humana.");
      }
      await authenticatedUser(client);
      const prepared = contract.prepareIssuedPolicyCommand({
        command: input.command,
        applicationReference: input.applicationReference,
        sourceAuthority: input.sourceAuthority,
      });
      const { data, error } = await client.rpc(RPC.confirmIssuedPolicy, { p_command: prepared });
      if (error) fail(error.code || "CRS07_CONFIRM_POLICY_FAILED", error.message || "Falló Policy.");
      if (data?.policyCreatedByApplication !== false || data?.applicationPolicyLineageVerified !== true) {
        fail("CRS07_POLICY_RECEIPT_INVALID", "El recibo no preserva la frontera.", { data });
      }
      return freeze(data);
    }

    async function getApplicationPolicyLineage(input = {}) {
      const user = await authenticatedUser(client);
      const applicationReference = required(input.applicationReference,
        "CRS07_APPLICATION_REFERENCE_REQUIRED", "Application");
      const { application, person } = await loadApplication(client, user, applicationReference);
      if (application.lifecycle_state !== "APPROVED") {
        return contract.createMissingApplicationPolicyLineage({
          advisorReference: user.id,
          application: applicationView(application, person),
          missingReason: "APPLICATION_NOT_APPROVED",
          observedAt: new Date().toISOString(),
          details: { lifecycleState: application.lifecycle_state },
        });
      }
      const version = await latestVersion(client, user, applicationReference);
      if (!version) {
        return contract.createMissingApplicationPolicyLineage({
          advisorReference: user.id,
          application: applicationView(application, person),
          missingReason: "POLICY_NOT_ISSUED",
          observedAt: new Date().toISOString(),
          details: null,
        });
      }
      return compose({
        client, user, application, person, version,
        correlationId: optional(input.correlationId),
      });
    }

    async function listPoliciesForPerson(input = {}) {
      const user = await authenticatedUser(client);
      const personReference = required(input.personReference,
        "CRS07_PERSON_REFERENCE_REQUIRED", "CommercialPerson");
      const person = await one(
        client.from("commercial_people").select("*")
          .eq("advisor_id", user.id).eq("person_reference", personReference),
        "CRS07_PERSON_READ_FAILED",
      );
      const roles = await many(
        client.from("policy_roles").select("*")
          .eq("advisor_id", user.id).eq("participant_person_id", person.id)
          .eq("confirmation_state", "CONFIRMED"),
        "CRS07_ROLE_READ_FAILED",
      );
      const policyIds = [...new Set(roles
        .filter(role => contract.APPLICATION_PERSON_POLICY_ROLES.includes(role.role_type))
        .map(role => role.policy_id))];
      const output = [];
      for (const policyId of policyIds) {
        const version = await maybeOne(
          client.from("policy_versions").select("*")
            .eq("advisor_id", user.id).eq("policy_id", policyId)
            .order("version_number", { ascending: false }).limit(1),
          "CRS07_POLICY_VERSION_READ_FAILED",
        );
        if (!version?.application_reference) continue;
        const application = await maybeOne(
          client.from("commercial_applications").select("*")
            .eq("advisor_id", user.id).eq("application_reference", version.application_reference),
          "CRS07_APPLICATION_READ_FAILED",
        );
        if (!application || application.person_id !== person.id) continue;
        output.push(await compose({ client, user, application, person, version }));
      }
      return freeze(output);
    }

    function createCommercialMovementView(input = {}) {
      const lineage = contract.assertApplicationPolicyLineage(input.lineage);
      const movementReference = required(input.movementReference,
        "CRS07_MOVEMENT_REFERENCE_REQUIRED", "Movimiento");
      return freeze({
        contractType: "FORGE_CRS07_POLICY_COMMERCIAL_MOVEMENT_VIEW",
        contractVersion: SERVICE_VERSION,
        personReference: lineage.application.personReference,
        applicationReference: lineage.application.applicationReference,
        policyReference: lineage.policy.policyReference,
        movementReference,
        correlationId: links.deriveCorrelationId({
          personReference: lineage.application.personReference,
          movementReference,
        }),
        policyMutation: false,
        applicationMutation: false,
      });
    }

    return freeze({
      version: SERVICE_VERSION,
      confirmIssuedPolicyFromApplication,
      getApplicationPolicyLineage,
      listPoliciesForPerson,
      createCommercialMovementView,
      diagnostics: () => freeze({
        applicationAuthority: "APPLICATION_AUTHORITY",
        policyAuthority: "CARTERA_POLICY_AUTHORITY",
        domainLinkContract: "CRS_02",
        directTableMutation: false,
        automaticPolicyCreation: false,
        automaticApplicationMutation: false,
        quoteAsPolicySource: false,
        issuanceEvidenceRequired: true,
        policyRoleRequired: true,
        automaticBusinessAction: false,
      }),
    });
  }

  return freeze({ SERVICE_VERSION, RPC, Crs07ApplicationPolicyLineageServiceError, createService });
});

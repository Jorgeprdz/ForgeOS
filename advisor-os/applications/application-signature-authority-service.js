"use strict";

(function applicationSignatureAuthorityServiceModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const contract = isCommonJs
    ? require("../../platform/application-authority/application-signature-authority-contract.js")
    : root?.ForgeApplicationSignatureAuthorityContractCrs06;
  const links = isCommonJs
    ? require("../../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(contract, links);
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeApplicationSignatureAuthorityServiceCrs06 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(contract, links) {
  const SERVICE_VERSION = "CRS-06-APPLICATION-SIGNATURE-SERVICE-001.1";
  const RPC = Object.freeze({
    createApplication: "forge_crs06_create_application",
    addVersion: "forge_crs06_add_application_version",
    recordSignature: "forge_crs06_record_signature_evidence",
    submitApplication: "forge_crs06_submit_application",
    recordRequirement: "forge_crs06_record_requirement",
    recordDecision: "forge_crs06_record_decision",
  });

  class ApplicationSignatureAuthorityServiceError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = "ApplicationSignatureAuthorityServiceError";
      this.code = code;
      this.details = details;
    }
  }
  const fail = (code, message, details = null) => {
    throw new ApplicationSignatureAuthorityServiceError(code, message, details);
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const optional = value => typeof value === "string" && value.trim() ? value.trim() : null;
  const required = (value, code, label) => optional(value) || fail(code, `${label} es obligatoria.`);
  const references = (value, code, label, minimum = 1) => {
    if (!Array.isArray(value) || value.length < minimum) fail(code, `${label} es obligatoria.`);
    return value.map(item => required(item, code, label));
  };
  const confirmation = input => {
    if (input?.confirmedByAdvisor !== true || !optional(input?.confirmationReference)) {
      fail("CRS06_HUMAN_CONFIRMATION_REQUIRED", "La mutación requiere confirmación humana explícita.");
    }
  };
  const ensureDependencies = () => {
    if (!contract?.createApplicationAuthoritySnapshot || !links?.createDomainLinkEnvelope) {
      fail("CRS06_DEPENDENCIES_REQUIRED", "Los contratos CRS 02 y CRS 06 son obligatorios.");
    }
  };
  async function authenticatedUser(client) {
    if (!client?.auth?.getUser || !client?.from || !client?.rpc) {
      fail("CRS06_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) fail("CRS06_AUTH_REQUIRED", "La sesión autenticada es obligatoria.");
    return data.user;
  }
  function queryError(error, fallback = "CRS06_READ_FAILED") {
    if (error) fail(error.code || fallback, error.message || "No fue posible leer Application.");
  }
  async function invoke(client, rpc, params) {
    await authenticatedUser(client);
    const { data, error } = await client.rpc(rpc, params);
    if (error) fail(error.code || "CRS06_RPC_FAILED", error.message || "La operación de Application falló.");
    return freeze(data || {});
  }

  function createCommandService({ client } = {}) {
    ensureDependencies();

    async function createApplicationDraft(input = {}) {
      confirmation(input);
      const signers = Array.isArray(input.signers) ? input.signers.map(contract.createSigner) : [];
      if (!signers.length) fail("CRS06_SIGNERS_REQUIRED", "Application requiere al menos un firmante.");
      return invoke(client, RPC.createApplication, {
        p_person_reference: required(input.personReference, "CRS06_PERSON_REFERENCE_REQUIRED", "La persona"),
        p_quote_reference: required(input.quoteReference, "CRS06_QUOTE_REFERENCE_REQUIRED", "La Quote"),
        p_quote_version_reference: required(input.quoteVersionReference, "CRS06_QUOTE_VERSION_REQUIRED", "La versión de Quote"),
        p_prospect_reference: required(input.prospectReference, "CRS06_PROSPECT_REFERENCE_REQUIRED", "El Prospect"),
        p_product_reference: required(input.productReference, "CRS06_PRODUCT_REFERENCE_REQUIRED", "El producto"),
        p_document_reference: required(input.documentReference, "CRS06_DOCUMENT_REFERENCE_REQUIRED", "El documento"),
        p_snapshot_digest: required(input.snapshotDigest, "CRS06_SNAPSHOT_DIGEST_REQUIRED", "El digest"),
        p_source_evidence_references: references(input.sourceEvidenceReferences, "CRS06_SOURCE_EVIDENCE_REQUIRED", "La evidencia"),
        p_signers: signers,
        p_occurred_at: required(input.occurredAt, "CRS06_OCCURRED_AT_REQUIRED", "La fecha"),
        p_idempotency_key: required(input.idempotencyKey, "CRS06_IDEMPOTENCY_REQUIRED", "La idempotencia"),
        p_confirmation_reference: input.confirmationReference,
      });
    }

    async function addApplicationVersion(input = {}) {
      confirmation(input);
      const normalized = contract.createApplicationVersion({
        applicationReference: input.applicationReference,
        versionReference: input.versionReference,
        versionNumber: input.versionNumber,
        personReference: input.personReference,
        quoteReference: input.quoteReference,
        quoteVersionReference: input.quoteVersionReference,
        prospectReference: input.prospectReference,
        productReference: input.productReference,
        lifecycleState: input.lifecycleState || "READY_FOR_SIGNATURE",
        previousLifecycleState: input.previousLifecycleState || "DRAFT",
        documentReference: input.documentReference,
        snapshotDigest: input.snapshotDigest,
        sourceEvidenceReferences: input.sourceEvidenceReferences,
        createdAt: input.occurredAt,
        correctionOf: input.correctionOf || null,
      });
      return invoke(client, RPC.addVersion, {
        p_application_reference: normalized.applicationReference,
        p_document_reference: normalized.documentReference,
        p_snapshot_digest: normalized.snapshotDigest,
        p_source_evidence_references: normalized.sourceEvidenceReferences,
        p_occurred_at: normalized.createdAt,
        p_idempotency_key: required(input.idempotencyKey, "CRS06_IDEMPOTENCY_REQUIRED", "La idempotencia"),
        p_confirmation_reference: input.confirmationReference,
        p_correction_of: normalized.correctionOf,
      });
    }

    async function recordSignatureEvidence(input = {}) {
      confirmation(input);
      const evidence = contract.createSignatureEvidence({
        signatureReference: input.signatureReference,
        applicationReference: input.applicationReference,
        versionReference: input.versionReference,
        signerReference: input.signerReference,
        evidenceType: input.evidenceType,
        documentDigest: input.documentDigest,
        providerReference: input.providerReference || null,
        signedAt: input.signedAt,
        capturedAt: input.capturedAt,
        evidenceReferences: input.evidenceReferences,
        confirmationState: input.confirmationState || "VERIFIED",
        privacyClass: input.privacyClass || "RESTRICTED",
        correctionOf: input.correctionOf || null,
      });
      return invoke(client, RPC.recordSignature, {
        p_application_reference: evidence.applicationReference,
        p_version_reference: evidence.versionReference,
        p_signer_reference: evidence.signerReference,
        p_signature_reference: evidence.signatureReference,
        p_evidence_type: evidence.evidenceType,
        p_document_digest: evidence.documentDigest,
        p_provider_reference: evidence.providerReference,
        p_signed_at: evidence.signedAt,
        p_captured_at: evidence.capturedAt,
        p_evidence_references: evidence.evidenceReferences,
        p_confirmation_state: evidence.confirmationState,
        p_privacy_classification: evidence.privacyClass,
        p_idempotency_key: required(input.idempotencyKey, "CRS06_IDEMPOTENCY_REQUIRED", "La idempotencia"),
        p_confirmation_reference: input.confirmationReference,
        p_correction_of: evidence.correctionOf,
      });
    }

    async function submitApplication(input = {}) {
      confirmation(input);
      return invoke(client, RPC.submitApplication, {
        p_application_reference: required(input.applicationReference, "CRS06_APPLICATION_REFERENCE_REQUIRED", "La Application"),
        p_submission_reference: required(input.submissionReference, "CRS06_SUBMISSION_REFERENCE_REQUIRED", "La submission"),
        p_source_evidence_references: references(input.sourceEvidenceReferences, "CRS06_SOURCE_EVIDENCE_REQUIRED", "La evidencia"),
        p_occurred_at: required(input.occurredAt, "CRS06_OCCURRED_AT_REQUIRED", "La fecha"),
        p_idempotency_key: required(input.idempotencyKey, "CRS06_IDEMPOTENCY_REQUIRED", "La idempotencia"),
        p_confirmation_reference: input.confirmationReference,
      });
    }

    async function recordRequirement(input = {}) {
      confirmation(input);
      const requirement = contract.createRequirement({
        requirementReference: input.requirementReference,
        requirementCode: input.requirementCode,
        state: input.state,
        evidenceReferences: input.evidenceReferences || [],
        openedAt: input.openedAt,
        resolvedAt: input.resolvedAt || null,
        reviewReference: input.reviewReference || null,
        correctionOf: input.correctionOf || null,
      });
      return invoke(client, RPC.recordRequirement, {
        p_application_reference: required(input.applicationReference, "CRS06_APPLICATION_REFERENCE_REQUIRED", "La Application"),
        p_requirement_reference: requirement.requirementReference,
        p_requirement_code: requirement.requirementCode,
        p_state: requirement.state,
        p_evidence_references: requirement.evidenceReferences,
        p_opened_at: requirement.openedAt,
        p_resolved_at: requirement.resolvedAt,
        p_review_reference: requirement.reviewReference,
        p_idempotency_key: required(input.idempotencyKey, "CRS06_IDEMPOTENCY_REQUIRED", "La idempotencia"),
        p_confirmation_reference: input.confirmationReference,
        p_correction_of: requirement.correctionOf,
      });
    }

    async function recordDecision(input = {}) {
      confirmation(input);
      const decision = String(input.decision || "").trim().toUpperCase();
      if (!["APPROVED", "DECLINED"].includes(decision)) fail("CRS06_DECISION_INVALID", "La decisión debe ser APPROVED o DECLINED.");
      return invoke(client, RPC.recordDecision, {
        p_application_reference: required(input.applicationReference, "CRS06_APPLICATION_REFERENCE_REQUIRED", "La Application"),
        p_decision: decision,
        p_decision_reference: required(input.decisionReference, "CRS06_DECISION_REFERENCE_REQUIRED", "La decisión"),
        p_source_evidence_references: references(input.sourceEvidenceReferences, "CRS06_SOURCE_EVIDENCE_REQUIRED", "La evidencia"),
        p_occurred_at: required(input.occurredAt, "CRS06_OCCURRED_AT_REQUIRED", "La fecha"),
        p_idempotency_key: required(input.idempotencyKey, "CRS06_IDEMPOTENCY_REQUIRED", "La idempotencia"),
        p_confirmation_reference: input.confirmationReference,
      });
    }

    return freeze({
      version: SERVICE_VERSION,
      createApplicationDraft,
      addApplicationVersion,
      recordSignatureEvidence,
      submitApplication,
      recordRequirement,
      recordDecision,
      diagnostics: () => freeze({
        explicitHumanConfirmationRequired: true,
        automaticApplicationCreation: false,
        automaticSignatureRequest: false,
        automaticSubmission: false,
        automaticRequirementResolution: false,
        automaticPipelineStageAdvance: false,
        automaticPolicyCreation: false,
        providerMutation: false,
      }),
    });
  }

  const valueOf = (row, camel, snake) => row?.[camel] ?? row?.[snake] ?? null;
  async function one(query, fallback) {
    const { data, error } = await query.single();
    queryError(error, fallback);
    return data;
  }
  async function many(query, fallback) {
    const { data, error } = await query;
    queryError(error, fallback);
    return Array.isArray(data) ? data : [];
  }

  function createReadService({ client } = {}) {
    ensureDependencies();

    async function composeApplication(user, application) {
      if (application.advisor_id !== user.id) fail("CRS06_APPLICATION_NOT_OWNED", "Application no pertenece al asesor autenticado.");
      const person = await one(
        client.from("commercial_people")
          .select("id,advisor_id,person_reference,lifecycle_state,archived_at")
          .eq("id", application.person_id)
          .single(),
        "CRS06_PERSON_READ_FAILED",
      );
      if (person.advisor_id !== user.id || person.lifecycle_state !== "CONFIRMED" || person.archived_at) {
        fail("CRS06_COMMERCIAL_PERSON_NOT_ACTIVE", "Application apunta a una persona no confirmada.");
      }
      const version = await one(
        client.from("application_versions").select("*")
          .eq("application_id", application.id)
          .eq("version_number", application.current_version)
          .single(),
        "CRS06_VERSION_READ_FAILED",
      );
      const signers = await many(
        client.from("application_signers").select("*").eq("application_id", application.id).order("created_at"),
        "CRS06_SIGNERS_READ_FAILED",
      );
      const signatures = await many(
        client.from("application_signature_evidence").select("*")
          .eq("application_id", application.id)
          .eq("version_reference", version.version_reference)
          .order("captured_at"),
        "CRS06_SIGNATURES_READ_FAILED",
      );
      const requirements = await many(
        client.from("application_requirements").select("*").eq("application_id", application.id).order("opened_at"),
        "CRS06_REQUIREMENTS_READ_FAILED",
      );
      const events = await many(
        client.from("application_events").select("*").eq("application_id", application.id)
          .order("recorded_at", { ascending: false }).limit(1),
        "CRS06_EVENTS_READ_FAILED",
      );
      const latest = events[0] || fail("CRS06_APPLICATION_EVENT_REQUIRED", "Application no tiene evento autoritativo.");
      const applicationVersion = {
        applicationReference: application.application_reference,
        versionReference: version.version_reference,
        versionNumber: version.version_number,
        personReference: person.person_reference,
        quoteReference: application.quote_reference,
        quoteVersionReference: application.quote_version_reference,
        prospectReference: application.prospect_reference,
        productReference: application.product_reference,
        lifecycleState: application.lifecycle_state,
        previousLifecycleState: application.previous_lifecycle_state,
        documentReference: version.document_reference,
        snapshotDigest: version.snapshot_digest,
        sourceEvidenceReferences: version.source_evidence_references,
        createdAt: version.created_at,
        correctionOf: version.correction_of,
      };
      const normalizedSigners = signers.map(row => ({
        signerReference: row.signer_reference,
        role: row.signer_role,
        required: row.required,
        personReference: row.person_reference,
        signatureState: row.signature_state,
      }));
      const normalizedSignatures = signatures.map(row => ({
        signatureReference: row.signature_reference,
        applicationReference: application.application_reference,
        versionReference: row.version_reference,
        signerReference: row.signer_reference,
        evidenceType: row.evidence_type,
        documentDigest: row.document_digest,
        providerReference: row.provider_reference,
        signedAt: row.signed_at,
        capturedAt: row.captured_at,
        evidenceReferences: row.evidence_references,
        confirmationState: row.confirmation_state,
        privacyClass: row.privacy_classification,
        correctionOf: row.correction_of,
      }));
      const normalizedRequirements = requirements.map(row => ({
        requirementReference: row.requirement_reference,
        requirementCode: row.requirement_code,
        state: row.state,
        evidenceReferences: row.evidence_references,
        openedAt: row.opened_at,
        resolvedAt: row.resolved_at,
        reviewReference: row.review_reference,
        correctionOf: row.correction_of,
      }));
      const latestEvent = {
        eventReference: latest.event_reference,
        eventType: latest.event_type,
        applicationReference: application.application_reference,
        versionReference: latest.version_reference,
        personReference: person.person_reference,
        quoteReference: application.quote_reference,
        lifecycleState: latest.lifecycle_state,
        previousLifecycleState: latest.previous_lifecycle_state,
        occurredAt: latest.occurred_at,
        recordedAt: latest.recorded_at,
        sourceReference: latest.source_reference,
        evidenceReferences: latest.evidence_references,
        idempotencyKey: latest.idempotency_key,
        correctionOf: latest.correction_of,
      };
      const domainLink = links.createDomainLinkEnvelope({
        personReference: person.person_reference,
        relationshipReference: links.deriveRelationshipReference({
          advisorReference: user.id,
          personReference: person.person_reference,
        }),
        correlationId: null,
        domain: "APPLICATION",
        recordType: "APPLICATION",
        recordReference: application.application_reference,
        authority: "APPLICATION_AUTHORITY",
        sourceEventReference: latest.event_reference,
        effectiveAt: latest.occurred_at,
        recordedAt: latest.recorded_at,
        privacyClassification: "RESTRICTED",
        idempotencyKey: `crs06-application-link:${latest.event_reference}`,
        correctionOf: latest.correction_of || null,
      });
      return contract.createApplicationAuthoritySnapshot({
        applicationVersion,
        signers: normalizedSigners,
        signatureEvidence: normalizedSignatures,
        requirements: normalizedRequirements,
        latestEvent,
        domainLink,
      });
    }

    async function getApplication(applicationReference) {
      const user = await authenticatedUser(client);
      const application = await one(
        client.from("commercial_applications").select("*")
          .eq("application_reference", required(applicationReference, "CRS06_APPLICATION_REFERENCE_REQUIRED", "La Application"))
          .single(),
        "CRS06_APPLICATION_READ_FAILED",
      );
      return composeApplication(user, application);
    }

    async function listApplicationsForPerson(personReference) {
      const user = await authenticatedUser(client);
      const person = await one(
        client.from("commercial_people").select("id,advisor_id,person_reference,lifecycle_state,archived_at")
          .eq("person_reference", required(personReference, "CRS06_PERSON_REFERENCE_REQUIRED", "La persona"))
          .single(),
        "CRS06_PERSON_READ_FAILED",
      );
      if (person.advisor_id !== user.id) fail("CRS06_PERSON_NOT_OWNED", "La persona no pertenece al asesor.");
      const rows = await many(
        client.from("commercial_applications").select("*").eq("person_id", person.id).order("updated_at", { ascending: false }),
        "CRS06_APPLICATION_LIST_FAILED",
      );
      return Promise.all(rows.map(row => composeApplication(user, row)));
    }

    function projectPipelineMilestone(snapshot) {
      const accepted = contract.assertApplicationAuthoritySnapshot(snapshot);
      return contract.projectApplicationMilestone(accepted.latestEvent);
    }

    return freeze({
      version: SERVICE_VERSION,
      getApplication,
      listApplicationsForPerson,
      projectPipelineMilestone,
      diagnostics: () => freeze({
        applicationAuthority: "APPLICATION_AUTHORITY",
        readOnlyProjection: true,
        automaticStageAdvance: false,
        automaticPolicyCreation: false,
        providerMutation: false,
      }),
    });
  }

  return freeze({
    SERVICE_VERSION,
    RPC,
    ApplicationSignatureAuthorityServiceError,
    createCommandService,
    createReadService,
  });
});

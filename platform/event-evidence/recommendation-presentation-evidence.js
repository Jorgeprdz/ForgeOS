"use strict";

(function recommendationPresentationEvidenceModule(root, factory) {
  const canonical = typeof module !== "undefined" && module.exports
    ? require("./canonical-activity-event-contract")
    : root.ForgeCanonicalActivityEventContractFES01;
  const api = factory(canonical);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeRecommendationPresentationEvidence017E = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function recommendationPresentationEvidenceFactory(canonical) {
  if (!canonical) throw new Error("FES01_CANONICAL_EVENT_CONTRACT_REQUIRED");

  function fail(code) { const error = new TypeError(code); error.code = code; throw error; }
  function token(value, code) { const result = String(value || "").trim(); if (!result || result.length > 240) fail(code); return result; }
  function optionalToken(value) { const result = String(value || "").trim(); return result || null; }

  function presentationIdentity({ advisorId, recommendationId, recommendationVersion } = {}) {
    const advisor = token(advisorId, "PRESENTATION_ADVISOR_REQUIRED");
    const recommendation = token(recommendationId, "PRESENTATION_RECOMMENDATION_REQUIRED");
    const versionIdentity = optionalToken(recommendationVersion) || recommendation;
    return `presentation:${canonical._private.stableDigest({ advisor, recommendation, versionIdentity })}`;
  }

  function createRecommendationPresentationEvidence({ recommendation, presentedAt, presentationSurface = "AURA_HOME", recordedAt = null } = {}) {
    if (!recommendation || recommendation.recommendationAvailable === false) fail("RECOMMENDATION_REQUIRED");
    const recommendationId = token(recommendation.recommendationId, "PRESENTATION_RECOMMENDATION_REQUIRED");
    const advisorId = token(recommendation.advisorId, "PRESENTATION_ADVISOR_REQUIRED");
    const sourceAuthority = token(recommendation.sourceAuthority, "PRESENTATION_SOURCE_AUTHORITY_REQUIRED");
    const domain = token(recommendation.domain, "PRESENTATION_DOMAIN_REQUIRED");
    const surface = token(presentationSurface, "PRESENTATION_SURFACE_REQUIRED");
    const occurredAt = new Date(presentedAt).toISOString();
    const recorded = new Date(recordedAt || presentedAt).toISOString();
    const idempotencyKey = presentationIdentity({
      advisorId,
      recommendationId,
      recommendationVersion: recommendation.recommendationVersion || null,
    });

    return canonical.createCanonicalActivityEvent({
      event_type: "RECOMMENDATION_PRESENTED",
      tenant_id: advisorId,
      actor: { type: "SYSTEM", id: "forge-advisor-os" },
      subject: { type: "RECOMMENDATION", id: recommendationId },
      source: { type: "SYSTEM_OBSERVED", reference: idempotencyKey, channel: "FORGE_UI" },
      evidence_strength: "SYSTEM_OBSERVED",
      occurred_at: occurredAt,
      recorded_at: recorded,
      effective_period: null,
      causation_id: null,
      correlation_id: recommendationId,
      idempotency_key: idempotencyKey,
      privacy_class: "PRIVATE",
      learning_eligibility: false,
      payload: {
        recommendation_reference: recommendationId,
        recommendation_source: sourceAuthority,
        recommendation_domain: domain,
        advisor_reference: advisorId,
        presentation_surface: surface,
        recommendation_version: recommendation.recommendationVersion || null,
        subject_type: recommendation.subjectType || null,
        subject_reference: recommendation.subjectId || null,
      },
      provenance: {
        source_system: "forge-advisor-os",
        source_record_id: idempotencyKey,
        captured_via: "FORGE_UI",
        evidence_references: [idempotencyKey],
      },
      confirmation_state: "CONFIRMED",
      correction_of: null,
      safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
    });
  }

  async function persistRecommendationPresentation({ runtime, ...input } = {}) {
    if (!runtime || typeof runtime.appendCanonicalEvent !== "function") fail("FES_LEDGER_RUNTIME_REQUIRED");
    const event = createRecommendationPresentationEvidence(input);
    const result = await runtime.appendCanonicalEvent({
      canonical_event: event,
      evidence_references: [{
        reference_id: event.source.reference,
        reference_type: "SYSTEM_OBSERVATION",
        source_system: "forge-advisor-os",
        captured_at: event.recorded_at,
        privacy_class: "PRIVATE",
        checksum: `observation:${event.event_id}`,
        metadata: { observation_code: "RECOMMENDATION_PRESENTED" },
      }],
      appended_at: event.recorded_at,
    });
    return Object.freeze({ event, result, recommendationPresented: true, recommendationViewed: false, activityExecuted: false, outcomeCreated: false });
  }

  return Object.freeze({ presentationIdentity, createRecommendationPresentationEvidence, persistRecommendationPresentation });
});

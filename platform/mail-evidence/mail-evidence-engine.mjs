import { detectPolicyPaymentConfirmation } from "./payment-confirmation-detector.mjs";

export const MAIL_EVIDENCE_ENGINE_VERSION = "MAIL-EVIDENCE-ENGINE-001";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

export function createSupabaseMailSuggestionRecorder({ client } = {}) {
  if (!client || typeof client.rpc !== "function") throw new TypeError("MAIL_SUGGESTION_SUPABASE_CLIENT_REQUIRED");
  return async suggestion => {
    const { data, error } = await client.rpc("forge_activity_record_mail_suggestion", {
      p_payload: {
        provider: suggestion.source.provider,
        providerMessageRef: suggestion.source.providerMessageRef,
        receivedAt: suggestion.source.receivedAt,
        senderDomain: suggestion.source.senderDomain,
        subjectDigest: suggestion.source.subjectDigest,
        policyReferenceHint: suggestion.policyReferenceHint,
        suggestionType: suggestion.suggestionType,
        suggestedMetric: suggestion.suggestedMetric,
        suggestedValue: suggestion.suggestedValue,
        confidence: suggestion.confidence,
        detectorVersion: suggestion.detectorVersion,
        evidenceReferences: [`mail:${suggestion.source.provider}:${suggestion.source.providerMessageRef}`],
      },
    });
    if (error) throw error;
    return data;
  };
}

export function createMailEvidenceEngine({
  trustedSenderDomains = [],
  minimumConfidence = 0.72,
} = {}) {
  async function scan({ adapter, recordSuggestion = null, maxResults = 40 } = {}) {
    if (!adapter || typeof adapter.listRecentMessages !== "function") throw new TypeError("MAIL_PROVIDER_ADAPTER_REQUIRED");
    const messages = await adapter.listRecentMessages({ maxResults });
    const candidates = [];
    for (const message of messages) {
      const candidate = await detectPolicyPaymentConfirmation(message, { trustedSenderDomains, minimumConfidence });
      if (candidate.state !== "SUGGESTED") continue;
      candidates.push(candidate);
      if (recordSuggestion) await recordSuggestion(candidate);
    }
    return freeze({
      engineVersion: MAIL_EVIDENCE_ENGINE_VERSION,
      provider: adapter.provider,
      scanned: messages.length,
      suggestions: candidates,
      boundary: {
        suggestionsOnly: true,
        humanConfirmationRequired: true,
        awardsPointsAutomatically: false,
        mutatesPolicyAutomatically: false,
        storesRawMessageBody: false,
      },
    });
  }
  return freeze({ engineVersion: MAIL_EVIDENCE_ENGINE_VERSION, scan });
}

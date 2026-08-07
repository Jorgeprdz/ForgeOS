import {
  normalizeDomain,
  normalizeProviderMessage,
  privacySafeMessageFingerprint,
} from "./mail-evidence-contract.mjs";

export const PAYMENT_CONFIRMATION_DETECTOR_VERSION = "PAYMENT-MAIL-DETECTOR-001";

const STRONG = [
  /confirmaci[oó]n\s+de\s+pago/i,
  /pago\s+(?:ha\s+sido\s+)?(?:recibido|aplicado|confirmado|acreditado)/i,
  /payment\s+(?:received|confirmed|posted|applied)/i,
  /recibimos\s+tu\s+pago/i,
  /pago\s+exitoso/i,
];
const PAYMENT = [/\bpago\b/i, /\bpayment\b/i, /\bcobro\b/i, /\bpaid\b/i];
const POLICY = [/p[oó]liza/i, /policy/i, /seguro/i, /asegurad/i];
const NEGATIVE = [
  /pago\s+pendiente/i,
  /payment\s+due/i,
  /recordatorio\s+de\s+pago/i,
  /payment\s+reminder/i,
  /pago\s+rechazado/i,
  /payment\s+failed/i,
  /no\s+se\s+pudo\s+procesar/i,
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractPolicyHint(text) {
  const patterns = [
    /(?:p[oó]liza|policy)\s*(?:n[oú]m(?:ero)?\.?|no\.?|#|:)?\s*([A-Z0-9][A-Z0-9._\/-]{3,39})/i,
    /(?:folio|referencia)\s*(?:#|:)?\s*([A-Z0-9][A-Z0-9._\/-]{4,39})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].slice(0, 40);
  }
  return null;
}

export async function detectPolicyPaymentConfirmation(messageInput, {
  trustedSenderDomains = [],
  minimumConfidence = 0.72,
} = {}) {
  const message = normalizeProviderMessage(messageInput);
  const corpus = `${message.subject}\n${message.bodyText}`.slice(0, 16000);
  const trusted = unique(trustedSenderDomains.map(normalizeDomain)).filter(Boolean);
  const senderTrusted = trusted.length === 0 ? null : trusted.includes(message.senderDomain);
  const strongMatches = STRONG.filter(pattern => pattern.test(corpus)).length;
  const paymentMatches = PAYMENT.filter(pattern => pattern.test(corpus)).length;
  const policyMatches = POLICY.filter(pattern => pattern.test(corpus)).length;
  const negativeMatches = NEGATIVE.filter(pattern => pattern.test(corpus)).length;

  let confidence = 0;
  confidence += Math.min(strongMatches, 2) * 0.42;
  confidence += Math.min(paymentMatches, 2) * 0.08;
  confidence += Math.min(policyMatches, 2) * 0.08;
  if (senderTrusted === true) confidence += 0.16;
  if (senderTrusted === false) confidence -= 0.16;
  confidence -= Math.min(negativeMatches, 2) * 0.45;
  confidence = Math.max(0, Math.min(0.99, Math.round(confidence * 100) / 100));

  const fingerprint = await privacySafeMessageFingerprint(message);
  const accepted = strongMatches > 0 && negativeMatches === 0 && confidence >= minimumConfidence;
  return Object.freeze({
    detectorVersion: PAYMENT_CONFIRMATION_DETECTOR_VERSION,
    state: accepted ? "SUGGESTED" : "NOT_SUGGESTED",
    suggestionType: accepted ? "POLICY_PAYMENT_CONFIRMED" : null,
    suggestedMetric: accepted ? "polizas_pagadas" : null,
    suggestedValue: accepted ? 1 : null,
    confidence,
    policyReferenceHint: accepted ? extractPolicyHint(corpus) : null,
    source: fingerprint,
    reasons: Object.freeze(unique([
      strongMatches ? "PAYMENT_CONFIRMATION_LANGUAGE" : null,
      policyMatches ? "POLICY_CONTEXT_PRESENT" : null,
      senderTrusted === true ? "TRUSTED_SENDER_DOMAIN" : null,
      senderTrusted === false ? "UNTRUSTED_SENDER_DOMAIN" : null,
      negativeMatches ? "NEGATIVE_PAYMENT_LANGUAGE" : null,
    ])),
    boundary: Object.freeze({
      confirmsPaymentTruth: false,
      mutatesPolicyTruth: false,
      awardsPoints: false,
      requiresHumanConfirmation: true,
      storesRawMessageBody: false,
    }),
  });
}

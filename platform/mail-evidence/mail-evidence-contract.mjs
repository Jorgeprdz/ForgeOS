export const MAIL_EVIDENCE_CONTRACT_VERSION = "MAIL-EVIDENCE-001";
export const MAIL_PROVIDERS = Object.freeze(["GMAIL", "MICROSOFT_GRAPH", "GENERIC_IMAP"]);
export const MAIL_SUGGESTION_TYPES = Object.freeze(["POLICY_PAYMENT_CONFIRMED"]);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

export function requiredText(value, label, max = 500) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length > max) throw new TypeError(`${label} is invalid`);
  return normalized;
}

export function optionalText(value, max = 500) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  if (normalized.length > max) throw new TypeError("Optional text is too long");
  return normalized;
}

export function provider(value) {
  const normalized = requiredText(value, "provider", 40).toUpperCase();
  if (!MAIL_PROVIDERS.includes(normalized)) throw new TypeError("MAIL_PROVIDER_UNSUPPORTED");
  return normalized;
}

export function normalizeDomain(value) {
  const text = String(value ?? "").trim().toLowerCase();
  const at = text.lastIndexOf("@");
  const domain = at >= 0 ? text.slice(at + 1) : text;
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return null;
  return domain.slice(0, 190);
}

export function stripHtml(value) {
  return String(value ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value ?? ""));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function normalizeProviderMessage(input = {}) {
  const selectedProvider = provider(input.provider);
  const providerMessageId = requiredText(input.providerMessageId, "providerMessageId", 500);
  const receivedAt = new Date(requiredText(input.receivedAt, "receivedAt", 80));
  if (Number.isNaN(receivedAt.getTime())) throw new TypeError("MAIL_RECEIVED_AT_INVALID");
  const from = optionalText(input.from, 500);
  const senderDomain = normalizeDomain(from);
  const subject = optionalText(input.subject, 998) || "";
  const bodyText = stripHtml(input.bodyText || input.bodyHtml || input.snippet || "").slice(0, 12000);
  return freeze({
    contractVersion: MAIL_EVIDENCE_CONTRACT_VERSION,
    provider: selectedProvider,
    providerMessageId,
    conversationId: optionalText(input.conversationId, 500),
    receivedAt: receivedAt.toISOString(),
    senderDomain,
    subject,
    bodyText,
  });
}

export async function privacySafeMessageFingerprint(message) {
  const normalized = normalizeProviderMessage(message);
  return freeze({
    provider: normalized.provider,
    providerMessageRef: await sha256(`${normalized.provider}:${normalized.providerMessageId}`),
    receivedAt: normalized.receivedAt,
    senderDomain: normalized.senderDomain,
    subjectDigest: await sha256(normalized.subject),
  });
}

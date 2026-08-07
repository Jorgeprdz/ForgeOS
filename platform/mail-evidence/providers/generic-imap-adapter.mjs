import { normalizeProviderMessage } from "../mail-evidence-contract.mjs";

export const GENERIC_IMAP_MAIL_ADAPTER_VERSION = "GENERIC-IMAP-MAIL-EVIDENCE-001";

export function createGenericImapMailEvidenceAdapter({ backend } = {}) {
  if (!backend || typeof backend.listMessages !== "function") {
    throw new TypeError("GENERIC_IMAP_BACKEND_REQUIRED");
  }
  async function listRecentMessages({ maxResults = 40 } = {}) {
    const result = await backend.listMessages({ maxResults: Math.max(1, Math.min(Number(maxResults) || 40, 100)) });
    if (!Array.isArray(result)) throw new TypeError("GENERIC_IMAP_RESULT_INVALID");
    return Object.freeze(result.map(message => normalizeProviderMessage({ ...message, provider: "GENERIC_IMAP" })));
  }
  return Object.freeze({
    provider: "GENERIC_IMAP",
    adapterVersion: GENERIC_IMAP_MAIL_ADAPTER_VERSION,
    listRecentMessages,
    boundary: Object.freeze({
      browserConnectsDirectlyToImap: false,
      credentialsStoredInBrowser: false,
      backendRequired: true,
      readOnly: true,
    }),
  });
}

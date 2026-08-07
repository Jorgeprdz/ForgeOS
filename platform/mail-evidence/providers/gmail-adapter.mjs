import { normalizeProviderMessage, requiredText } from "../mail-evidence-contract.mjs";

export const GMAIL_PROVIDER_ADAPTER_VERSION = "GMAIL-MAIL-EVIDENCE-001";
const API = "https://gmail.googleapis.com/gmail/v1";

function decodeBase64Url(value) {
  if (!value) return "";
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = typeof atob === "function"
    ? atob(padded)
    : Buffer.from(padded, "base64").toString("binary");
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function headers(message) {
  return Object.fromEntries((message?.payload?.headers || []).map(item => [String(item.name || "").toLowerCase(), item.value || ""]));
}

function bodyFromPart(part) {
  const mime = String(part?.mimeType || "").toLowerCase();
  if (mime === "text/plain" && part?.body?.data) return decodeBase64Url(part.body.data);
  for (const child of part?.parts || []) {
    const value = bodyFromPart(child);
    if (value) return value;
  }
  if (mime === "text/html" && part?.body?.data) return decodeBase64Url(part.body.data);
  return "";
}

async function json(response, code) {
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${code}:${response.status}:${detail.slice(0, 240)}`);
  }
  return response.json();
}

export function createGmailMailEvidenceAdapter({ accessToken, fetchImpl = fetch } = {}) {
  const token = requiredText(accessToken, "accessToken", 8192);
  const auth = { Authorization: `Bearer ${token}` };

  async function listRecentMessages({ maxResults = 40, query = "in:inbox newer_than:30d" } = {}) {
    const limit = Math.max(1, Math.min(Number(maxResults) || 40, 100));
    const listUrl = new URL(`${API}/users/me/messages`);
    listUrl.searchParams.set("maxResults", String(limit));
    listUrl.searchParams.set("q", query);
    const listed = await json(await fetchImpl(listUrl, { headers: auth }), "GMAIL_LIST_FAILED");
    const messages = [];
    for (const item of listed.messages || []) {
      const url = new URL(`${API}/users/me/messages/${encodeURIComponent(item.id)}`);
      url.searchParams.set("format", "full");
      const message = await json(await fetchImpl(url, { headers: auth }), "GMAIL_GET_FAILED");
      const h = headers(message);
      messages.push(normalizeProviderMessage({
        provider: "GMAIL",
        providerMessageId: message.id,
        conversationId: message.threadId,
        receivedAt: new Date(Number(message.internalDate || Date.now())).toISOString(),
        from: h.from || "",
        subject: h.subject || "",
        snippet: message.snippet || "",
        bodyText: bodyFromPart(message.payload),
      }));
    }
    return Object.freeze(messages);
  }

  async function watch({ topicName, labelIds = ["INBOX"] } = {}) {
    const topic = requiredText(topicName, "topicName", 500);
    return json(await fetchImpl(`${API}/users/me/watch`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ topicName: topic, labelIds, labelFilterBehavior: "INCLUDE" }),
    }), "GMAIL_WATCH_FAILED");
  }

  return Object.freeze({
    provider: "GMAIL",
    adapterVersion: GMAIL_PROVIDER_ADAPTER_VERSION,
    listRecentMessages,
    watch,
    boundary: Object.freeze({ readOnly: true, sendsMail: false, deletesMail: false, storesToken: false }),
  });
}

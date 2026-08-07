import { normalizeProviderMessage, requiredText, stripHtml } from "../mail-evidence-contract.mjs";

export const MICROSOFT_GRAPH_MAIL_ADAPTER_VERSION = "MS-GRAPH-MAIL-EVIDENCE-001";
const API = "https://graph.microsoft.com/v1.0";

async function json(response, code) {
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${code}:${response.status}:${detail.slice(0, 240)}`);
  }
  return response.json();
}

export function createMicrosoftGraphMailEvidenceAdapter({ accessToken, fetchImpl = fetch } = {}) {
  const token = requiredText(accessToken, "accessToken", 8192);
  const auth = { Authorization: `Bearer ${token}` };

  async function listRecentMessages({ maxResults = 40 } = {}) {
    const limit = Math.max(1, Math.min(Number(maxResults) || 40, 100));
    const url = new URL(`${API}/me/mailFolders/inbox/messages`);
    url.searchParams.set("$top", String(limit));
    url.searchParams.set("$orderby", "receivedDateTime desc");
    url.searchParams.set("$select", "id,conversationId,receivedDateTime,from,subject,bodyPreview,body");
    const payload = await json(await fetchImpl(url, { headers: auth }), "MS_GRAPH_LIST_FAILED");
    return Object.freeze((payload.value || []).map(message => normalizeProviderMessage({
      provider: "MICROSOFT_GRAPH",
      providerMessageId: message.id,
      conversationId: message.conversationId,
      receivedAt: message.receivedDateTime,
      from: message.from?.emailAddress?.address || "",
      subject: message.subject || "",
      snippet: message.bodyPreview || "",
      bodyText: message.body?.contentType === "html" ? stripHtml(message.body.content) : message.body?.content,
    })));
  }

  async function subscribe({ notificationUrl, lifecycleNotificationUrl = null, expirationDateTime } = {}) {
    const notification = requiredText(notificationUrl, "notificationUrl", 1000);
    const expiration = requiredText(expirationDateTime, "expirationDateTime", 80);
    const body = {
      changeType: "created",
      notificationUrl: notification,
      resource: "/me/mailFolders/inbox/messages",
      expirationDateTime: expiration,
      clientState: crypto.randomUUID?.() || `${Date.now()}`,
    };
    if (lifecycleNotificationUrl) body.lifecycleNotificationUrl = lifecycleNotificationUrl;
    return json(await fetchImpl(`${API}/subscriptions`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }), "MS_GRAPH_SUBSCRIPTION_FAILED");
  }

  return Object.freeze({
    provider: "MICROSOFT_GRAPH",
    adapterVersion: MICROSOFT_GRAPH_MAIL_ADAPTER_VERSION,
    listRecentMessages,
    subscribe,
    boundary: Object.freeze({ readOnly: true, sendsMail: false, deletesMail: false, storesToken: false }),
  });
}

import test from "node:test";
import assert from "node:assert/strict";
import { detectPolicyPaymentConfirmation } from "../platform/mail-evidence/payment-confirmation-detector.mjs";
import { createMailEvidenceEngine } from "../platform/mail-evidence/mail-evidence-engine.mjs";
import { createGmailMailEvidenceAdapter } from "../platform/mail-evidence/providers/gmail-adapter.mjs";
import { createMicrosoftGraphMailEvidenceAdapter } from "../platform/mail-evidence/providers/microsoft-graph-adapter.mjs";

const paymentMessage = {
  provider: "GMAIL",
  providerMessageId: "m-1",
  receivedAt: "2026-08-07T15:00:00Z",
  from: "pagos@aseguradora.mx",
  subject: "Confirmación de pago póliza ABC-12345",
  bodyText: "Hemos recibido tu pago y fue aplicado correctamente a la póliza ABC-12345.",
};

test("payment detector produces suggestion only and strips raw content from output", async () => {
  const result = await detectPolicyPaymentConfirmation(paymentMessage, { trustedSenderDomains: ["aseguradora.mx"] });
  assert.equal(result.state, "SUGGESTED");
  assert.equal(result.suggestedMetric, "polizas_pagadas");
  assert.equal(result.suggestedValue, 1);
  assert.equal(result.policyReferenceHint, "ABC-12345");
  assert.equal(result.boundary.requiresHumanConfirmation, true);
  assert.equal(result.boundary.awardsPoints, false);
  assert.equal("bodyText" in result, false);
  assert.match(result.source.providerMessageRef, /^[a-f0-9]{64}$/);
  assert.match(result.source.subjectDigest, /^[a-f0-9]{64}$/);
});

test("negative payment language never becomes a paid-policy suggestion", async () => {
  const result = await detectPolicyPaymentConfirmation({
    ...paymentMessage,
    providerMessageId: "m-2",
    subject: "Pago pendiente",
    bodyText: "Recordatorio de pago pendiente para tu póliza ABC-12345.",
  }, { trustedSenderDomains: ["aseguradora.mx"] });
  assert.equal(result.state, "NOT_SUGGESTED");
  assert.equal(result.suggestedMetric, null);
});

test("mail evidence engine records candidates but never confirms them", async () => {
  const recorded = [];
  const adapter = { provider: "GMAIL", listRecentMessages: async () => [paymentMessage] };
  const engine = createMailEvidenceEngine({ trustedSenderDomains: ["aseguradora.mx"] });
  const result = await engine.scan({ adapter, recordSuggestion: async item => recorded.push(item) });
  assert.equal(result.suggestions.length, 1);
  assert.equal(recorded.length, 1);
  assert.equal(result.boundary.humanConfirmationRequired, true);
  assert.equal(result.boundary.awardsPointsAutomatically, false);
});

test("Gmail adapter is read-only and normalizes Gmail messages", async () => {
  const responses = [
    { messages: [{ id: "gmail-1" }] },
    { id: "gmail-1", threadId: "t1", internalDate: "1786114800000", snippet: "Pago recibido", payload: { headers: [
      { name: "From", value: "pagos@aseguradora.mx" },
      { name: "Subject", value: "Confirmación de pago póliza ABC-12345" },
    ], mimeType: "text/plain", body: { data: "SGVtb3MgcmVjaWJpZG8gdHUgcGFnbw" } } },
  ];
  const fetchImpl = async () => new Response(JSON.stringify(responses.shift()), { status: 200, headers: { "content-type": "application/json" } });
  const adapter = createGmailMailEvidenceAdapter({ accessToken: "token", fetchImpl });
  const messages = await adapter.listRecentMessages({ maxResults: 1 });
  assert.equal(messages[0].provider, "GMAIL");
  assert.equal(messages[0].senderDomain, "aseguradora.mx");
  assert.equal(adapter.boundary.readOnly, true);
  assert.equal(adapter.boundary.sendsMail, false);
});

test("Microsoft adapter covers Outlook/Hotmail/M365 mailboxes through Graph", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ value: [{
    id: "ms-1", conversationId: "c1", receivedDateTime: "2026-08-07T15:00:00Z",
    from: { emailAddress: { address: "pagos@aseguradora.mx" } },
    subject: "Payment confirmed", bodyPreview: "Payment received for policy ABC-12345",
    body: { contentType: "text", content: "Payment received for policy ABC-12345" },
  }] }), { status: 200, headers: { "content-type": "application/json" } });
  const adapter = createMicrosoftGraphMailEvidenceAdapter({ accessToken: "token", fetchImpl });
  const messages = await adapter.listRecentMessages({ maxResults: 1 });
  assert.equal(messages[0].provider, "MICROSOFT_GRAPH");
  assert.equal(messages[0].providerMessageId, "ms-1");
  assert.equal(adapter.boundary.readOnly, true);
});

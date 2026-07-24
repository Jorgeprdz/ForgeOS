"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createPipelineNashDraftOrchestrator,
  ORCHESTRATOR_VERSION,
} = require("../nash/pipeline-nash-draft-orchestrator");

const NOW = "2026-07-24T15:00:00.000Z";

function pipelineRecord(extra = {}) {
  return {
    id: "prospect-001",
    fullName: "Ana Demo",
    source: "Referido",
    status: "contacted",
    phone: "+525500000001",
    whatsapp: "+525500000001",
    initialContext: "raw context must never reach the provider",
    createdAt: "2026-07-20T12:00:00.000Z",
    updatedAt: "2026-07-24T12:00:00.000Z",
    ...extra,
  };
}

function successEnvelope(text = "Hola, Ana. Me gustaría retomar nuestra conversación.") {
  return {
    resultState: "SUCCESS",
    draftCandidate: {
      text,
      rawText: text,
      reviewRequired: true,
      humanApprovalRequired: true,
      approved: false,
      sent: false,
      sendsMessage: false,
      notSendable: true,
      sourceMutable: false,
      providerId: "gemini",
    },
    metadata: {
      providerId: "gemini",
      modelId: "fixture",
      generationMode: "fixture",
      generatedAt: NOW,
    },
    error: null,
    persistencePerformed: false,
    pipelineMutationPerformed: false,
    timelineEventCreated: false,
    nbaExecuted: false,
    taskCreated: false,
    calendarEventCreated: false,
    whatsappOpened: false,
    messageSent: false,
    externalActionPerformed: false,
    humanApprovalRequired: true,
    approved: false,
    sent: false,
  };
}

test("NFAST-07 sends only the provider request contract", async () => {
  let invocation = null;
  const orchestrator = createPipelineNashDraftOrchestrator({
    now: () => NOW,
    invokeFunction: async (name, options) => {
      invocation = { name, options };
      return { data: successEnvelope(), error: null };
    },
  });

  const input = pipelineRecord();
  const before = JSON.stringify(input);
  const result = await orchestrator.requestDraft({
    pipelineRecord: input,
    goal: "follow_up",
    style: "professional",
    variation: 2,
    approvedDisplayName: true,
  });

  assert.equal(result.status, "SUCCESS");
  assert.equal(result.orchestratorVersion, ORCHESTRATOR_VERSION);
  assert.equal(result.contextStatus, "SUCCESS");
  assert.equal(result.intakeStatus, "SUCCESS");
  assert.equal(result.conversationBrief.status, "SUCCESS");
  assert.equal(result.conversationBrief.providerAllowed, true);
  assert.equal(result.providerInvoked, true);
  assert.equal(result.rawPipelineForwardedToProvider, false);
  assert.equal(result.persistencePerformed, false);
  assert.equal(result.pipelineMutationPerformed, false);
  assert.equal(JSON.stringify(input), before);

  assert.equal(invocation.name, "nash-draft-provider");
  assert.deepEqual(
    Object.keys(invocation.options.body).sort(),
    [
      "conversationBrief",
      "providerId",
      "requestMetadata",
      "requestVersion",
    ],
  );
  assert.equal(invocation.options.body.providerId, "gemini");
  assert.equal(invocation.options.body.requestVersion, "NFAST-05.1");
  assert.equal(
    invocation.options.body.conversationBrief.lineage.projectionType,
    "CONVERSATION_CONTEXT",
  );

  const serialized = JSON.stringify(invocation.options.body);
  assert.doesNotMatch(serialized, /prospectMessageContext/);
  assert.doesNotMatch(serialized, /experimentalFeatureEnabled/);
  assert.doesNotMatch(serialized, /raw context must never reach the provider/);
  assert.doesNotMatch(serialized, /\+525500000001/);
});

test("NFAST-07 preserves approved display-name evidence only when authorized", async () => {
  const bodies = [];
  const orchestrator = createPipelineNashDraftOrchestrator({
    now: () => NOW,
    invokeFunction: async (_name, options) => {
      bodies.push(options.body);
      return { data: successEnvelope(), error: null };
    },
  });

  await orchestrator.requestDraft({
    pipelineRecord: pipelineRecord(),
    goal: "first_contact",
    approvedDisplayName: true,
  });
  await orchestrator.requestDraft({
    pipelineRecord: pipelineRecord(),
    goal: "first_contact",
    approvedDisplayName: false,
  });

  assert.match(
    JSON.stringify(bodies[0].conversationBrief.claims.allowedClaims),
    /Ana Demo/,
  );
  assert.doesNotMatch(
    JSON.stringify(bodies[1].conversationBrief.claims.allowedClaims),
    /Ana Demo/,
  );
});

test("NFAST-07 blocks remote appointment rendering without appointment authority", async () => {
  let calls = 0;
  const orchestrator = createPipelineNashDraftOrchestrator({
    now: () => NOW,
    invokeFunction: async () => {
      calls += 1;
      return { data: successEnvelope(), error: null };
    },
  });

  const result = await orchestrator.requestDraft({
    pipelineRecord: pipelineRecord({
      status: "appointment_scheduled",
      nextActionAt: "2026-07-25T09:00:00.000Z",
    }),
    goal: "appointment_confirmation",
    approvedDisplayName: true,
  });

  assert.equal(result.status, "FALLBACK_REQUIRED");
  assert.equal(result.providerInvoked, false);
  assert.equal(
    result.providerEnvelope.error.code,
    "GOVERNED_REFERENCE_REQUIRED",
  );
  assert.equal(calls, 0);
});

test("NFAST-07 does not invoke provider when governed context is incomplete", async () => {
  let calls = 0;
  const orchestrator = createPipelineNashDraftOrchestrator({
    now: () => NOW,
    invokeFunction: async () => {
      calls += 1;
      return { data: successEnvelope(), error: null };
    },
  });

  const result = await orchestrator.requestDraft({
    pipelineRecord: pipelineRecord({
      createdAt: undefined,
      updatedAt: undefined,
    }),
    goal: "follow_up",
    approvedDisplayName: true,
  });

  assert.equal(result.status, "FALLBACK_REQUIRED");
  assert.equal(result.providerInvoked, false);
  assert.equal(
    result.providerEnvelope.error.code,
    "GOVERNED_CONTEXT_UNAVAILABLE",
  );
  assert.equal(calls, 0);
});

test("NFAST-07 provider failure remains deterministic fallback", async () => {
  const orchestrator = createPipelineNashDraftOrchestrator({
    now: () => NOW,
    invokeFunction: async () => ({
      data: null,
      error: new Error("provider unavailable"),
    }),
  });

  const result = await orchestrator.requestDraft({
    pipelineRecord: pipelineRecord(),
    goal: "reactivation",
    approvedDisplayName: true,
  });

  assert.equal(result.status, "FALLBACK_REQUIRED");
  assert.equal(result.providerEnvelope.resultState, "ERROR");
  assert.equal(result.deterministicFallbackRequired, true);
  assert.equal(result.externalActionPerformed, false);
  assert.equal(result.approved, false);
  assert.equal(result.sent, false);
});

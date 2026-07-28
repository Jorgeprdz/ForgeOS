"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const MODULES = [
  "advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract.js",
  "advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter.js",
  "nash/context-intake/nash-prospect-context-intake-boundary-contract.js",
  "nash/context-intake/nash-prospect-context-intake.js",
  "nash/context-intake/nash-universal-prospect-context-consumer.js",
  "nash/conversation-brief/nash-deterministic-conversation-brief-boundary-contract.js",
  "nash/conversation-brief/nash-provider-request-contract.js",
  "nash/remote-draft-provider-client-boundary.js",
  "nash/pipeline-nash-draft-orchestrator.js",
];

test("NFAST-07 modules execute without CommonJS in browser order", async () => {
  const context = vm.createContext({
    console,
    Date,
    Object,
    Array,
    String,
    Number,
    Boolean,
    JSON,
    Map,
    Set,
    Promise,
    RegExp,
    Error,
    TypeError,
    setTimeout,
    clearTimeout,
  });
  context.globalThis = context;

  for (const file of MODULES) {
    const source = fs.readFileSync(file, "utf8");
    vm.runInContext(`(function(){\n${source}\n}).call(globalThis);`, context, {
      filename: file,
    });
  }

  assert.ok(context.ForgeUniversalGovernedProspectContextContract);
  assert.ok(context.ForgePipelineUniversalProspectContextAdapter);
  assert.ok(context.ForgeNashProspectContextIntakeBoundaryContract);
  assert.ok(context.ForgeNashProspectContextIntake);
  assert.ok(context.ForgeNashUniversalProspectContextConsumer);
  assert.ok(context.ForgeNashDeterministicConversationBriefContract);
  assert.ok(context.ForgeNashProviderRequestContract);
  assert.ok(context.ForgeNashRemoteDraftProviderClientBoundary);
  assert.ok(context.ForgePipelineNashDraftOrchestrator);

  let body = null;
  const orchestrator =
    context.ForgePipelineNashDraftOrchestrator
      .createPipelineNashDraftOrchestrator({
        now: () => "2026-07-24T15:00:00.000Z",
        invokeFunction: async (_name, options) => {
          body = options.body;
          const text = "Hola, Ana. Me gustaría conversar contigo.";
          return {
            data: {
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
                generatedAt: "2026-07-24T15:00:00.000Z",
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
            },
            error: null,
          };
        },
      });

  const result = await orchestrator.requestDraft({
    pipelineRecord: {
      id: "prospect-001",
      fullName: "Ana",
      source: "Referido",
      status: "contacted",
      createdAt: "2026-07-20T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    },
    goal: "follow_up",
    approvedDisplayName: true,
  });

  assert.equal(result.status, "SUCCESS");
  assert.deepEqual(
    Object.keys(body).sort(),
    [
      "conversationBrief",
      "providerId",
      "requestMetadata",
      "requestVersion",
    ],
  );
});

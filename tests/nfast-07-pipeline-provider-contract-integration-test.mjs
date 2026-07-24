import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ui = readFileSync(
  "advisor-os/sales-pipeline/productive-prospect-ui.js",
  "utf8",
);
const entrypoint = readFileSync(
  "docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js",
  "utf8",
);
const orchestrator = readFileSync(
  "nash/pipeline-nash-draft-orchestrator.js",
  "utf8",
);

assert.doesNotMatch(ui, /prospectMessageContext/);
assert.doesNotMatch(ui, /experimentalFeatureEnabled/);
assert.doesNotMatch(
  ui,
  /client\.functions\?\.invoke\("nash-draft-provider"/,
);
assert.match(ui, /governedDraftOrchestrator\.requestDraft/);
assert.match(ui, /pipelineRecord: actionProspect/);
assert.match(ui, /approvedDisplayName: true/);

for (const dependency of [
  "universal-governed-prospect-context-contract.js",
  "pipeline-universal-prospect-context-adapter.js",
  "nash-prospect-context-intake-boundary-contract.js",
  "nash-prospect-context-intake.js",
  "nash-universal-prospect-context-consumer.js",
  "nash-deterministic-conversation-brief-boundary-contract.js",
  "nash-provider-request-contract.js",
  "remote-draft-provider-client-boundary.js",
  "pipeline-nash-draft-orchestrator.js",
]) {
  assert.match(entrypoint, new RegExp(dependency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(
  entrypoint,
  /createPipelineNashDraftOrchestrator/,
);
assert.match(
  entrypoint,
  /draftOrchestrator: productiveDraftOrchestrator/,
);

for (const compositionCall of [
  "buildPipelineUniversalProspectContext",
  "consumeUniversalProspectContextForNash",
  "buildDeterministicBrief",
  "validateProviderDraftRequest",
  "createRemoteDraftProviderClient",
]) {
  assert.match(orchestrator, new RegExp(compositionCall));
}

assert.match(orchestrator, /requestVersion/);
assert.match(orchestrator, /conversationBrief/);
assert.match(orchestrator, /requestMetadata/);
assert.match(orchestrator, /rawPipelineForwardedToProvider: false/);
assert.match(orchestrator, /persistencePerformed: false/);
assert.match(orchestrator, /pipelineMutationPerformed: false/);
assert.doesNotMatch(orchestrator, /sendMessage|openWhatsapp|window\.open/);

console.log("NFAST-07 PIPELINE PROVIDER CONTRACT INTEGRATION: PASS");

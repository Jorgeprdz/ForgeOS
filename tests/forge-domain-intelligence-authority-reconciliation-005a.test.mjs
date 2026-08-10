import assert from "node:assert/strict";
import fs from "node:fs";
import { createPipelineDomainIntelligenceConsumer } from "../advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js";

function convergenceModule({ identityState = "UNRESOLVED", personReference = null } = {}) {
  return {
    create() {
      return {
        async getConvergedProspect(prospectReference) {
          return {
            prospectReference,
            identity: { state: identityState, personReference },
            opportunityAuthorityState: "NOT_PRODUCTIVE",
          };
        },
        diagnostics() {
          return {
            serviceVersion: "CRS-03",
            prospectAuthority: "PIPELINE_PROSPECT_AUTHORITY",
            stageAuthority: "PIPELINE_STAGE_RPC",
            personAuthority: "CARTERA_010B_COMMERCIAL_PERSON",
            sourceIdentityLinkAuthority: "COMMERCIAL_SOURCE_IDENTITY_LINKS",
            opportunityAuthority: "NOT_PRODUCTIVE",
          };
        },
      };
    },
  };
}

const client = Object.freeze({ kind: "authenticated-test-client" });
const consumer = createPipelineDomainIntelligenceConsumer({
  client,
  convergenceServiceModule: convergenceModule(),
});

const context = await consumer.getProspectDecisionContext("prospect:005a", { projections: [] });
assert.equal(context.consumerId, "FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A");
assert.equal(context.state, "partial");
assert.equal(context.identityState, "UNRESOLVED");
assert.equal(context.personReference, null);
assert.equal(context.opportunityAuthorityState, "NOT_PRODUCTIVE");
assert.ok(context.degradedReasons.includes("PERSON_UNRESOLVED"));
assert.ok(context.degradedReasons.includes("OPPORTUNITY_AUTHORITY_NOT_PRODUCTIVE"));
assert.ok(context.degradedReasons.includes("NO_AUTHORIZED_PROJECTIONS"));
assert.equal(context.boundaries.readOnly, true);
assert.equal(context.boundaries.createsTruth, false);
assert.equal(context.boundaries.createsScore, false);
assert.equal(context.boundaries.calculatesPriority, false);
assert.equal(context.boundaries.calculatesConfidence, false);
assert.equal(context.boundaries.calculatesImpact, false);
assert.equal(context.boundaries.automaticExecutionAllowed, false);
assert.equal(context.boundaries.identityMutationAllowed, false);
assert.equal(context.boundaries.persistenceAllowed, false);

const diagnostics = consumer.diagnostics();
assert.equal(diagnostics.projectionContract, "FCDP-004-001");
assert.equal(diagnostics.opportunityAuthority, "NOT_PRODUCTIVE");
assert.equal(diagnostics.automaticIdentityResolution, false);
assert.equal(diagnostics.automaticOpportunityCreation, false);
assert.equal(diagnostics.automaticStageAdvance, false);
assert.equal(diagnostics.identityMutation, false);
assert.equal(diagnostics.persistence, false);
assert.equal(diagnostics.scoreCalculation, false);

const linkedConsumer = createPipelineDomainIntelligenceConsumer({
  client,
  convergenceServiceModule: convergenceModule({
    identityState: "LINKED",
    personReference: "person:005a",
  }),
});
const linked = await linkedConsumer.getProspectDecisionContext("prospect:linked", { projections: [] });
assert.equal(linked.personReference, "person:005a");
assert.equal(linked.opportunityAuthorityState, "NOT_PRODUCTIVE");
assert.ok(!linked.degradedReasons.includes("PERSON_UNRESOLVED"));
assert.ok(linked.degradedReasons.includes("OPPORTUNITY_AUTHORITY_NOT_PRODUCTIVE"));

const source = fs.readFileSync(new URL("../advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js", import.meta.url), "utf8");
for (const forbidden of [".insert(", ".update(", ".delete(", ".rpc(", "service_role", "create table", "create or replace function"]) {
  assert.equal(source.toLowerCase().includes(forbidden), false, `forbidden consumer behavior: ${forbidden}`);
}

const adapter = fs.readFileSync(new URL("../docs/static-preview/forge-aura/pipeline/pipeline-adapter.js", import.meta.url), "utf8");
assert.ok(adapter.includes("createPipelineDomainIntelligenceConsumer"));
assert.ok(adapter.includes("personConvergenceAvailable"));
assert.ok(adapter.includes("intelligenceAvailable"));
assert.ok(adapter.includes("async function intelligence"));

console.log("FORGE_DOMAIN_INTELLIGENCE_AUTHORITY_RECONCILIATION_005A=PASS");

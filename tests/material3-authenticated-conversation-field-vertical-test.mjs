import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const combat = require("../nash-combat-intelligence-report-engine.js");
const nextBestAction = require("../nash-next-best-action-engine.js");
const reasonWhy = require("../manager-os/nba/nba-reason-why-boundary-contract.js");
const reconnection = require("../manager-os/nba/nash-mick-nba-reconnection-engine.js");
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const app = read("docs/static-preview/forge-alive-material3/app.js");
const pipeline = read("docs/static-preview/forge-alive-material3/pipeline-module.js");
const adapter = read("docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js");
const auth = read("docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.js");
const pages = read(".github/workflows/pages.yml");

const report = combat.buildCombatIntelligenceReport({
  objection: "Lo voy a pensar",
  context: { name: "Mariana Torres" },
  personality: {},
});
assert.equal(report.classification.type, "STALL");
assert.equal(report.classification.intent, "AVOIDING_DECISION");
assert.ok(report.objectionKillerMessage);
assert.equal(report.nextBestAction.action, "HANDLE_OBJECTION");
assert.equal(nextBestAction.buildNextBestAction({ objectionType: "STALL" }).action, "HANDLE_OBJECTION");
assert.equal(typeof reasonWhy.buildNbaReasonWhyBoundary, "function");
assert.equal(typeof reconnection.buildNashMickNbaReconnection, "function");

assert.match(app, /env\.js[\s\S]*forge-alive-public-config-067g17a1\.js[\s\S]*productive-prospect-bootstrap\.js[\s\S]*forge-alive-auth-entry-067g17b1\.js/);
assert.match(auth, /\.hero \.profile/);
assert.match(auth, /existing\.tagName === 'BUTTON'|node\.tagName === 'BUTTON'/);
assert.match(auth, /avatar_url[\s\S]*picture/);
assert.match(auth, /signInWithGoogle/);
assert.doesNotMatch(app + pipeline + adapter, /material3-auth-service|auth-v2|createClient\(/);

assert.match(pipeline, /AUTH_LOADING/);
assert.match(pipeline, /ANONYMOUS/);
assert.match(pipeline, /AUTHENTICATED/);
assert.match(pipeline, /AUTH_ERROR/);
assert.match(pipeline, /clearPrivateState/);
assert.match(pipeline, /forge:auth-state-changed/);
assert.match(pipeline, /data-open-combat/);
assert.match(pipeline, /data-open-nba/);
assert.match(pipeline, /Tipo candidato/);
assert.match(pipeline, /Intención candidata/);
assert.match(pipeline, /draftSafetyValidator/);
assert.match(pipeline, /approveExactDraft/);
assert.match(pipeline, /exactDraftHumanApprovalGate/);
assert.match(pipeline, /whatsappUrl/);
assert.doesNotMatch(pipeline, /window\.open|location\.assign|\.click\(\)/);

assert.match(adapter, /buildCombatIntelligenceReport/);
assert.match(adapter, /appendProspectTimelineEvent/);
assert.match(adapter, /eventType:\s*"OBJECTION_RECORDED"/);
assert.match(adapter, /payload:\s*\{\s*objectionCode,\s*resolutionStatus:\s*"OPEN"\s*\}/);
const registration = adapter.slice(adapter.indexOf("async function registerObjectionClassification"), adapter.indexOf("async function buildNba"));
assert.doesNotMatch(registration, /objectionText|rawText|draftText|whatsapp|phone|transcript/);
assert.match(adapter, /ForgeNashNextBestActionEngine\.buildNextBestAction/);
assert.match(adapter, /ForgeNashMickNbaReconnection006C\.buildNashMickNbaReconnection/);
assert.match(adapter, /requestedUse:\s*"ADVISOR_NEXT_BEST_ACTION_CONTEXT"/);
assert.match(adapter, /PROSPECT:\$\{card\.id\}/);
assert.match(adapter, /TIMELINE:\$\{latest\.id\}/);
assert.doesNotMatch(adapter, /createsTask:\s*true|createsCalendarEvent:\s*true|sendsMessage:\s*true|automaticExecutionAllowed:\s*true/);

for (const [file, globalName] of [
  ["nash-intent-engine.js", "ForgeNashIntentEngine"],
  ["nash-combat-orchestrator.js", "ForgeNashCombatOrchestrator"],
  ["nash-next-best-action-engine.js", "ForgeNashNextBestActionEngine"],
  ["nash-combat-intelligence-report-engine.js", "ForgeNashCombatIntelligenceReportEngine"],
  ["manager-os/nba/nba-reason-why-boundary-contract.js", "ForgeNbaReasonWhyBoundary006B"],
  ["manager-os/nba/nash-mick-nba-reconnection-engine.js", "ForgeNashMickNbaReconnection006C"],
]) assert.match(read(file), new RegExp(globalName));

assert.match(pages, /publicConversationRuntimeFiles/);
assert.match(pages, /manager-os\/nba\/nash-mick-nba-reconnection-engine\.js/);
assert.match(pages, /nash\/draft-intake\/nfast06-draft-safety-boundary\.js/);

console.log("MATERIAL3_AUTHENTICATED_CONVERSATION_FIELD_VERTICAL=PASS");

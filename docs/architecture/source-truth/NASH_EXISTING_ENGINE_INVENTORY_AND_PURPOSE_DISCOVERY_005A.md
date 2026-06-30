# Nash Existing Engine Inventory and Purpose Discovery 005A

Phase: NASH_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_005A

Mode: READ ONLY DISCOVERY + DOCS ONLY INVENTORY

Status: NASH_EXISTING_ENGINE_INVENTORY_DOCUMENTED

## Constitutional Boundary

- Forge decides; AI explains.
- Unknown is not zero.
- Missing evidence is not negative evidence.
- A detected Nash module is not implementation closure.
- A detected Nash module is not approved runtime.
- Nash support is not Nash runtime execution.
- Nash may prepare conversation context, but must not silently send messages, execute next-best-action, create tasks/calendar events, or invent intent.
- Prompt is not draft.
- Draft is not approved communication.
- Human approval remains mandatory before action.

## Discovery Commands Used

- `git status --short --branch`
- `git log --oneline -24`
- `git ls-files | rg -i '(nash|message-recommendation|next-best-action|intent|combat|objection|tone|followup|conversation|memory|personality|context-builder|advisor-performance|coaching-insight|manager-alert|team-intelligence|master-intelligence)'`
- Targeted header/import/export/function inspection of Nash-related modules with `rg` and `sed`.

## Discovery Summary

- Nash-related tracked paths discovered by approved pattern: 103.
- Nash-related JS modules inventoried as primary engine/module set: 22.
- Nash-related tests observed: 22.
- No Nash runtime was executed.
- No tests were executed.
- No implementation files were changed.

## Nash Existing Engine Inventory

| File | Module name | Probable Nash capability | What it appears to do | Inputs observed | Outputs observed | Imports/dependencies observed | Tests observed | Classification | Key risks | Recommended future use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `nash-core-engine.js` | `runNash` | master orchestrator | Builds prospect context, intent, personality, council, message recommendation, follow-up, and next-best-action. | prospect/context fields, raw text/message, response status, days since contact, objection, interest, relationship event | `context`, `intent`, `personality`, `council`, `recommendation`, `followup`, `nextBestAction` | imports context builder, council, message recommendation, personality, followup, next-best-action, intent | `nash-master-test.js`, `nash-integration-master-test.js`, `nash-v03-master-test.js`, `nash-v04-master-test.js` | NASH_LEGACY_DO_NOT_EXECUTE | message-generation risk; next-best-action risk; default-zero risk through `daysSinceContact || 0` | replace with modern contract or reuse only through wrapper |
| `nash-message-recommendation-engine.js` | `buildMessageRecommendation` | message recommendation | Builds first/follow-up message text, recommended angle, product affinity, channel, and next action wording. | `context`, `council` | `firstMessage`, `followupMessage`, `nextBestAction`, scores, product affinity | none observed | covered by core/master tests | NASH_RUNTIME_RISK | generates message text; product affinity; family framing; could be mistaken for approved draft/send | reuse through prompt/draft/safety/human-approval wrapper only |
| `nash-next-best-action-engine.js` | `buildNextBestAction` | next-best-action | Produces action names such as schedule appointment, send follow-up, handle objection, send relationship message. | response status, days since contact, objection, intent, interest, relationship event, personality | action, priority, timing, reason, style | none observed | `nash-next-best-action-master-test.js` | NASH_RUNTIME_RISK | direct action recommendation; default-zero days; could be mistaken for execution | wrapper required; no execution |
| `nash-intent-engine.js` | `detectNashIntent` | intent | Pattern-matches commercial intent such as value gap, low priority, trust issue, budget constraint, ready to meet. | raw text/message/context | primary intent, possible intents, confidence, strategy hints | none observed | `nash-intent-master-test.js` | NASH_NEEDS_SOURCE_TRUTH_REVIEW | invented-intent risk; regex assumptions; confidence can be mistaken for truth | reuse only as explainable candidate intent with evidence and review |
| `nash-personality-engine.js` | `detectPersonality` | personality | Infers personality/motivators from children and notes. | context notes, children | personality, confidence, motivators, scores | none observed | `nash-personality-master-test.js` | NASH_NEEDS_SOURCE_TRUTH_REVIEW | private motivation/personality inference; manipulation risk if used directly | replace or wrap with consent/safety/private-motivation boundary |
| `nash-prospect-context-builder.js` | `buildProspectContext` | context builder | Normalizes prospect context for Nash from input profile/channel/family/life signals. | prospect/profile/context input | normalized prospect context | none observed | master/integration tests | NASH_SAFE_CONTEXT_REFERENCE | context could be incomplete; missing values must not become truth | reference as legacy context shape only |
| `nash-followup-engine.js` | `buildNashFollowup` | follow-up | Builds follow-up timing/style guidance from context/personality. | context, personality | follow-up recommendation context | none observed | core/master tests | NASH_NEEDS_BOUNDARY_WRAPPER | follow-up recommendation could become action/send without approval | reuse through wrapper |
| `nash-combat-orchestrator.js` | `runNashCombat` | combat/objection | Classifies objections and builds objection response/next move. | objection text, context, personality | objection type, diagnosis, response, next move | none observed | `nash-combat-master-test.js` | NASH_NEEDS_BOUNDARY_WRAPPER | objection response could pressure/manipulate if unguarded | reuse through safety validator and human approval only |
| `nash-combat-intelligence-report-engine.js` | `buildCombatIntelligenceReport` | combat/objection report | Combines objection classification, intent, and next-best-action into psychology/report. | objection, intent, context, personality | psychology report, objection response, next-best-action | imports combat orchestrator, intent engine, next-best-action | `nash-combat-intelligence-report-test.js` | NASH_RUNTIME_RISK | uses next-best-action and response text; invented psychology risk | wrapper required; no direct runtime |
| `nash-memory-engine.js` | memory functions | memory | Loads/saves prospect memory JSON, appends conversation/objection/outcome/profile memory. | prospectId, message, objection, outcome, profile | memory object, persisted JSON | imports `fs`, `path`; writes `nash-memory` | `nash-memory-master-test.js` | NASH_RUNTIME_RISK | filesystem write; message history mutation; action history; privacy risk | replace with modern evidence/privacy storage contract |
| `nash-learning-engine.js` | `buildLearningReport` | learning | Reads all Nash memory files and aggregates objections/intents/outcomes into learning recommendations. | advisorId, memory files | learning insights, recommendation, dominant patterns | imports `fs`, `path`; reads `nash-memory` | `nash-learning-master-test.js` | NASH_RUNTIME_RISK | filesystem read; aggregate assumptions; dominant pattern as truth risk | reference only until storage/evidence boundary exists |
| `nash-advisor-performance-engine.js` | `buildAdvisorPerformanceReport` | advisor performance | Derives performance score, bottleneck, strongest area, metrics, and recommendations from memories/actions/conversations. | advisorId, memories | performance report, score, metrics, bottleneck, recommendation | imports memory/learning definitions indirectly through helper use | `nash-advisor-performance-master-test.js` | NASH_NEEDS_SOURCE_TRUTH_REVIEW | scoring/default-zero risk; performance truth risk | replace with Manager/Advisor snapshot metrics contracts |
| `nash-coaching-insight-engine.js` | `buildCoachingInsight` | coaching insight | Maps performance report bottlenecks to coaching priority and coaching library guidance. | performance report | coaching priority, insight, recommendation | none observed | `nash-coaching-insight-master-test.js` | NASH_NEEDS_BOUNDARY_WRAPPER | coaching may become punishment/HR if unguarded | reuse only as coaching context, not judgment truth |
| `nash-manager-alert-engine.js` | `buildManagerAlert` | manager alert | Builds risk/alert level, escalation flag, manager summary, recommended manager action, weekly focus. | advisor performance, coaching insight | alert level, risk, escalation, manager action | none observed | `nash-manager-alert-master-test.js` | NASH_RUNTIME_RISK | escalation/risk can become punishment/ranking truth | replace with Manager OS protected alert contracts |
| `nash-team-intelligence-engine.js` | `buildTeamIntelligenceReport` | team intelligence | Aggregates advisor reports, average score, strongest/weakest advisor, coaching opportunities, team health. | advisor reports | team health, strongest/weakest advisor, coaching opportunities | none observed | `nash-team-intelligence-master-test.js` | NASH_RUNTIME_RISK | default-zero risk; human ranking strongest/weakest; punishment risk | do not reuse directly; rebuild through protected Manager OS contracts |
| `nash-master-intelligence-engine.js` | `runNashMasterIntelligence` | master orchestrator | Combines memory, context, personality, intent, combat report, learning, advisor performance, coaching, manager alert, team intelligence. | advisorId, prospectId, incoming message | master intelligence, recommended response, nextBestAction, manager/team insights | imports most Nash legacy modules | `nash-master-intelligence-master-test.js`, acceptance test | NASH_LEGACY_DO_NOT_EXECUTE | orchestrates message, NBA, memory, scoring, manager/team risk | park or replace with modern Forge Genesis Beta Loop contracts |
| `nash-council-orchestrator.js` | `runCouncil` | council/orchestrator | Produces council-style advisory perspectives from context. | context | council opinions/advice | none observed | core/master tests | NASH_SAFE_CONTEXT_REFERENCE | advisory may be mistaken for decision | reference only as advisory language source |
| `manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js` | `buildManagerNashConversationContextBridge` | modern bridge | Converts protected manager context into Nash conversation context prep. | manager/Nash context packet | bridge status, question areas, warnings, missing/unknown context | imports modern Nash context-intake modules | `manager-nash-conversation-context-bridge-master-test.js` | NASH_SAFE_CONTEXT_REFERENCE | must remain context-only | candidate for Forge Genesis Beta Loop |
| `nash/context-intake/nash-manager-context-intake-boundary-contract.js` | `buildNashManagerContextIntakeBoundary` | boundary contract | Validates allowed/forbidden uses, evidence/source/freshness, false truth/write/action flags. | protected packet/context, source evidence, requested use | status, decision, evidence, warnings, false flags | none beyond local helpers | `nash-manager-context-intake-boundary-contract-master-test.js` | NASH_SAFE_CONTEXT_REFERENCE | must not expand into runtime execution | candidate for Forge Genesis Beta Loop |
| `nash/context-intake/nash-manager-context-intake-orchestrator.js` | `buildNashManagerContextIntake` | context intake orchestrator | Orchestrates context intake, prep packet, safe language guardrail. | manager/Nash context input | combined intake status/decision/context | imports modern intake modules | `nash-manager-context-intake-orchestrator-master-test.js` | NASH_SAFE_CONTEXT_REFERENCE | keep context-only | candidate for Forge Genesis Beta Loop |
| `nash/context-intake/nash-manager-conversation-prep-packet-intake.js` | `buildNashManagerConversationPrepPacketIntake` | conversation prep packet | Builds question/prep context from protected manager packet. | conversation packet, source evidence | prep packet, question areas, missing/unknown/stale context | imports boundary helpers | `nash-manager-conversation-prep-packet-intake-master-test.js` | NASH_SAFE_CONTEXT_REFERENCE | prep is not draft/action | candidate for Forge Genesis Beta Loop |
| `nash/context-intake/nash-manager-safe-language-guardrail-intake.js` | `buildNashManagerSafeLanguageGuardrailIntake` | safe language guardrail | Detects unsafe language patterns and returns review/block context. | language samples / protected packet | guardrail status, warnings, unsafe language findings | imports boundary helpers | `nash-manager-safe-language-guardrail-intake-master-test.js` | NASH_SAFE_CONTEXT_REFERENCE | validation is not human approval | candidate for Forge Genesis Beta Loop |

## Nash Capability Map

- Context builder: `nash-prospect-context-builder.js`, modern `nash/context-intake/*`, Manager/Nash external bridge.
- Personality: `nash-personality-engine.js`.
- Council/orchestrator: `nash-council-orchestrator.js`, `nash-core-engine.js`, `nash-master-intelligence-engine.js`.
- Message recommendation: `nash-message-recommendation-engine.js`.
- Follow-up: `nash-followup-engine.js`.
- Combat/objection: `nash-combat-orchestrator.js`, `nash-combat-intelligence-report-engine.js`.
- Intent: `nash-intent-engine.js`.
- Memory: `nash-memory-engine.js`.
- Learning: `nash-learning-engine.js`.
- Next-best-action: `nash-next-best-action-engine.js`.
- Advisor performance: `nash-advisor-performance-engine.js`.
- Coaching insight: `nash-coaching-insight-engine.js`.
- Manager alert: `nash-manager-alert-engine.js`.
- Team intelligence: `nash-team-intelligence-engine.js`.
- Master orchestrator: `nash-core-engine.js`, `nash-master-intelligence-engine.js`.

## Message generation modules

- `nash-message-recommendation-engine.js` generates `firstMessage` and `followupMessage`.
- `nash-combat-orchestrator.js` and `nash-combat-intelligence-report-engine.js` generate objection response text.
- `nash-master-intelligence-engine.js` returns `recommendedResponse`.

Boundary:

- Message recommendation is not message send.
- Generated response text is not an approved draft.
- Human approval remains mandatory.

## Next-best-action modules

- `nash-next-best-action-engine.js` returns action names such as `SCHEDULE_APPOINTMENT`, `SEND_CONTEXT_THEN_ASK`, `HANDLE_OBJECTION`, `SEND_FOLLOWUP`, `REACTIVATE_PROSPECT`, `SEND_RELATIONSHIP_MESSAGE`, and `SEND_FIRST_MESSAGE`.
- `nash-core-engine.js` embeds `nextBestAction`.
- `nash-combat-intelligence-report-engine.js` imports next-best-action.
- `nash-master-intelligence-engine.js` returns `nextBestAction`.

Boundary:

- Next-best-action is not execution.
- Action labels must not create task/calendar/message truth.

## Intent / Personality / Memory modules

- `nash-intent-engine.js` uses regex/patterns to infer candidate commercial intent.
- `nash-personality-engine.js` infers personality/motivators from notes and children.
- `nash-memory-engine.js` reads/writes JSON memory files.
- `nash-learning-engine.js` reads memory files and derives aggregate insights.

Boundary:

- Intent is not truth.
- Personality is not manipulation authority.
- Memory read/write requires a future evidence/privacy/storage boundary before modern reuse.

## Runtime-risk modules

- `nash-core-engine.js`
- `nash-message-recommendation-engine.js`
- `nash-next-best-action-engine.js`
- `nash-combat-intelligence-report-engine.js`
- `nash-memory-engine.js`
- `nash-learning-engine.js`
- `nash-manager-alert-engine.js`
- `nash-team-intelligence-engine.js`
- `nash-master-intelligence-engine.js`

Risk reasons:

- Generates message text.
- Produces next-best-action/action labels.
- Reads/writes filesystem memory.
- Scores advisor/team performance.
- Names strongest/weakest advisor.
- Produces manager alert/escalation language.

## Legacy / Do-Not-Execute modules

- `nash-core-engine.js`
- `nash-master-intelligence-engine.js`
- Legacy root Nash runtime chain files when imported directly by core/master orchestration.

Rationale:

- They combine message generation, intent inference, next-best-action, memory, scoring, manager alert, and team intelligence without the modern constitutional wrappers.

## Candidate modules for Forge Genesis Beta Loop

Safe candidates for future scope, as context/reference only:

- `nash/context-intake/nash-manager-context-intake-boundary-contract.js`
- `nash/context-intake/nash-manager-context-intake-orchestrator.js`
- `nash/context-intake/nash-manager-conversation-prep-packet-intake.js`
- `nash/context-intake/nash-manager-safe-language-guardrail-intake.js`
- `manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js`

Legacy candidates that may inform Beta Loop only through wrappers:

- `nash-intent-engine.js`
- `nash-combat-orchestrator.js`
- `nash-message-recommendation-engine.js`
- `nash-next-best-action-engine.js`
- `nash-personality-engine.js`

## Needed boundary wrappers

1. Nash Legacy Message Recommendation Wrapper
2. Nash Next-Best-Action Context Wrapper
3. Nash Intent Candidate Evidence Wrapper
4. Nash Personality / Private Motivation Safety Wrapper
5. Nash Memory Storage and Privacy Boundary
6. Nash Manager Alert / Team Intelligence No-Ranking Wrapper
7. Nash Combat / Objection Safe Language Wrapper

## Questions for 005B implementation scope

1. Should 005B inventory Mick next, as the roadmap says, before implementing a Nash wrapper?
2. Which Nash legacy capability should be first Beta Loop candidate: intent, objection, message recommendation, or next-best-action context?
3. Should legacy Nash memory be parked until a formal storage/privacy/evidence boundary exists?
4. Should `nash-team-intelligence-engine.js` remain no-go because it names strongest/weakest advisor?
5. Should the modern `nash/context-intake` chain become the only approved Nash input path?
6. What explicit interface should connect Nash context to the already-implemented Prompt Builder and Draft Safety chain?

## What Forge Learned

- Nash already contains a broad legacy conversation intelligence stack.
- The legacy stack includes useful conversation patterns but mixes context, message text, action labels, memory, performance scoring, manager alerts, and team intelligence.
- The modern `nash/context-intake` chain is much closer to Forge constitutional boundaries.
- Forge Genesis Beta Loop should not execute legacy Nash directly.
- Nash can be valuable as context preparation and language guidance only after boundary wrappers.

## Forge Council Review

- Miranda: This makes Forge better only if the inventory prevents accidental legacy runtime reuse.
- Arqui Juve: Maintainability improves by separating legacy Nash capabilities from modern context-intake contracts.
- Joy Mangano: Useful for real advisor/manager work because it identifies what conversation support already exists.
- Nash: It improves conversation intelligence if intent remains candidate context and does not become invented certainty.
- Mick: It can connect to behavior/execution only through review-safe context, not surveillance or punishment.
- Patch Adams: Human trust is preserved by keeping message text, next-best-action, and memory behind approval/safety gates.
- Chris Gardner: It supports real prospecting if follow-up and objection guidance become disciplined, not automated pressure.
- Rocky: It improves consistency by cataloging reusable conversation patterns and needed wrappers.
- Nicky Spurgeon: Referral/networking support can be ethical if relationship messages remain human-approved.
- Jordan Belfort: Conversion support is useful only without manipulation or automatic execution.
- Jurgen Klaric: Psychology can inform conversation, but must not become manipulation or invented intent.

Council review is advisory only and does not override Constitution, ADRs, tests, evidence, or source-truth boundaries.

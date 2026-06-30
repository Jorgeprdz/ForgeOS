# Mick Existing Engine Inventory and Purpose Discovery 005B

Phase: MICK_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_005B

Mode: READ ONLY DISCOVERY + DOCS ONLY INVENTORY

Status: MICK_EXISTING_ENGINE_INVENTORY_DOCUMENTED

## Constitutional Boundary

- Forge decides; AI explains.
- Unknown is not zero.
- Missing evidence is not negative evidence.
- A detected Mick module is not implementation closure.
- A detected Mick module is not approved runtime.
- Mick support is not surveillance.
- Mick behavior context is not personality truth.
- Mick behavior context is not punishment, ranking, HR truth, promotion truth, compensation truth, payout truth, revenue truth, or Advisor Lifecycle truth.
- Mick may support coaching, consistency, review, and NBA Reason Why.
- Mick must not silently decide, enforce, punish, rank, promote, terminate, or shame.
- Human judgment remains required.
- Current implementation truth remains evidence/test/closure based.

## Forge Northstar

Forge exists to convert signals into voluntary explained action.

NBA means Next Best Action plus Reason Why:

- Why do it.
- Why now.
- Why this person.
- Why this action.
- Why this message.

Mick contributes behavior, execution, consistency, habits, coachability, activity generation, and execution-pattern context. Mick does not create surveillance, personality truth, HR truth, punishment, ranking, promotion, termination, compensation, payout, revenue, or Advisor Lifecycle truth.

## Discovery Commands Used

- `git status --short --branch`
- `git log --oneline -24`
- `git ls-files | rg -i '(mick|behavior|habit|discipline|consistency|coachability|activity|execution|followup|performance|productivity|advisor-performance|manager-coaching|coaching|review|alert|momentum|team-activity|team-intelligence)'`
- Targeted header/import/export/function inspection of Mick-related modules with `rg` and `sed`.

## Discovery Summary

- Mick/behavior-related tracked paths discovered by approved pattern: 198.
- Primary Mick/behavior candidate paths reviewed: 45.
- Mick-owned modern context-intake modules found: 4.
- Manager/Mick bridge found: 1.
- Modern Manager OS coaching/review-plan modules found: 10.
- Legacy Manager OS activity/momentum/coaching/alert modules found: 4.
- Advisor/candidate behavior-related modules found in the primary review set: 6.
- Legacy Nash behavior/performance/team modules found in the primary review set: 4.
- Platform/runtime-risk candidates found in the primary review set: 3.
- No Mick runtime was executed.
- No tests were executed.
- No implementation files were changed.

## Mick existing engine inventory

| File | Module name | Probable Mick capability | What it appears to do | Inputs observed | Outputs observed | Imports/dependencies observed | Tests observed | Classification | Key risks | NBA Reason Why usefulness | Recommended future use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mick/context-intake/mick-manager-context-intake-boundary-contract.js` | `buildMickManagerContextIntakeBoundary` | behavior intelligence boundary | Validates Mick manager context intake, allowed/forbidden uses, evidence/source/freshness, zero-like paths, and false truth/action flags. | protected manager context, source evidence, requested use | boundary status/decision, evidence, warnings, limitations, false flags | local helpers only | `mick-manager-context-intake-boundary-contract-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | must remain context-only; zero-like values require review | High: can protect behavior reasons before NBA explanation | reuse through modern boundary |
| `mick/context-intake/mick-manager-context-intake-orchestrator.js` | `buildMickManagerContextIntake` | behavior context orchestrator | Orchestrates Mick boundary, behavior review packet, and no-surveillance guardrail. | manager/Mick context packet | combined intake status, decision, review context | imports Mick context-intake modules | `mick-manager-context-intake-orchestrator-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | must not become runtime execution or enforcement | High: safe behavior packet for NBA Reason Why | reuse as protected Mick intake path |
| `mick/context-intake/mick-manager-behavior-review-packet-intake.js` | `buildMickManagerBehaviorReviewPacketIntake` | behavior review packet | Builds review-safe behavior packet context from protected manager inputs. | behavior packet, source evidence, requested use | review packet, missing/unknown/stale context, warnings | boundary helpers | `mick-manager-behavior-review-packet-intake-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | review packet can be misread as judgment if unwrapped downstream | High: explains execution pattern reasons | reuse as context only |
| `mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js` | `buildMickManagerNoSurveillanceGuardrailIntake` | no-surveillance guardrail | Detects unsafe surveillance, shame, punishment, ranking, and HR-like language patterns. | behavior language/context | guardrail status, blocked/warning context | boundary helpers | `mick-manager-no-surveillance-guardrail-intake-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | validation is not human approval | High: protects NBA language from surveillance/punishment framing | reuse as required guardrail |
| `manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js` | `buildManagerMickBehaviorContextBridge` | Manager/Mick external context bridge | Converts protected Manager OS context into Mick behavior context. | manager context, Mick context packet, source evidence | bridge status, behavior context, warnings, false truth flags | modern Mick context-intake chain | `manager-mick-behavior-context-bridge-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | bridge output must not be runtime approval | High: canonical bridge into behavior-based reason context | reuse through bridge only |
| `manager-os/coaching-intelligence/manager-coaching-boundary-contract.js` | `buildManagerCoachingBoundary` | manager coaching boundary | Protects coaching intelligence outputs with review-only flags and allowed/forbidden uses. | coaching context, evidence/source/freshness | coaching boundary context, warnings, flags | local helpers | `manager-coaching-boundary-contract-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | coaching can become punishment/HR truth if misused | Medium/high: coaching reason context for NBA | reuse as Manager OS coaching boundary |
| `manager-os/coaching-intelligence/manager-coaching-intelligence-engine.js` | `buildManagerCoachingIntelligence` | manager coaching orchestration | Combines advisor, recruitment, team coaching contexts and boundary result. | protected snapshots/metrics/historical/forecast/coaching context | manager review coaching context | coaching-intelligence engines | `manager-coaching-intelligence-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | must not become automated coaching decision | Medium/high | reuse as protected coaching context |
| `manager-os/coaching-intelligence/manager-advisor-coaching-engine.js` | `buildManagerAdvisorCoachingContext` | advisor coaching context | Builds advisor coaching context from protected Manager OS inputs. | advisor snapshot/metrics/forecast/context | advisor coaching context | local helpers | `manager-advisor-coaching-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | advisor coaching must not become performance judgment | Medium | reference through coaching orchestrator |
| `manager-os/coaching-intelligence/manager-recruitment-coaching-engine.js` | `buildManagerRecruitmentCoachingContext` | recruitment coaching context | Builds candidate/recruitment coaching context. | candidate snapshots/recruitment metrics/context | recruitment coaching context | local helpers | `manager-recruitment-coaching-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | candidate coaching must not become hiring truth | Medium | reference through coaching orchestrator |
| `manager-os/coaching-intelligence/manager-team-coaching-engine.js` | `buildManagerTeamCoachingContext` | team coaching context | Builds team coaching context without ranking truth. | team metrics/context | team coaching context | local helpers | `manager-team-coaching-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | team coaching can become ranking if unguarded | Medium | reference through coaching orchestrator |
| `manager-os/review-plan-intelligence/manager-review-plan-boundary-contract.js` | `buildManagerReviewPlanBoundary` | review-plan boundary | Protects review plans as manager review context only. | review plan context, evidence/source/freshness | status, decision, warnings, false flags | local helpers | `manager-review-plan-boundary-contract-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | review plan can look like enforcement if misused | High: creates reasoned review/action prep | reuse as protected review boundary |
| `manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js` | `buildManagerReviewPlanIntelligence` | review-plan orchestration | Combines advisor/recruitment/team review plan context. | protected context inputs | review plan intelligence context | review-plan engines | `manager-review-plan-intelligence-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | must not create task/calendar/action truth | High | reuse as context for NBA Reason Why |
| `manager-os/review-plan-intelligence/manager-advisor-review-plan-engine.js` | `buildManagerAdvisorReviewPlanContext` | advisor review plan | Builds advisor review plan context. | advisor context | advisor review plan context | local helpers | `manager-advisor-review-plan-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | review can become punishment if unsafe | Medium/high | reference through review-plan orchestrator |
| `manager-os/review-plan-intelligence/manager-recruitment-review-plan-engine.js` | `buildManagerRecruitmentReviewPlanContext` | recruitment review plan | Builds recruitment/candidate review plan context. | recruitment/candidate context | recruitment review plan context | local helpers | `manager-recruitment-review-plan-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | must not create hiring/rejection truth | Medium | reference through review-plan orchestrator |
| `manager-os/review-plan-intelligence/manager-team-review-plan-engine.js` | `buildManagerTeamReviewPlanContext` | team review plan | Builds team pattern review context. | team context | team review plan context | local helpers | `manager-team-review-plan-engine-master-test.js` | MICK_SAFE_CONTEXT_REFERENCE | team pattern can become human ranking | Medium | reference through review-plan orchestrator |
| `manager-os/team-intelligence/activity/team-activity-engine.js` | `construirActividadEquipo` | team activity | Builds team activity summary from advisors. | team/advisor activity fields | team activity context | none observed | legacy tests not confirmed in this phase | MICK_NEEDS_SOURCE_TRUTH_REVIEW | missing evidence/source/freshness; activity interpretation risk | Medium: raw activity signal may explain NBA timing after wrapper | wrap or replace with protected snapshots |
| `manager-os/team-intelligence/momentum/team-momentum-engine.js` | `calcularMomentumEquipo` | momentum/productivity | Calculates team momentum from advisor points. | advisor `puntos` and team input | momentum/average-like context | none observed | legacy tests not confirmed in this phase | MICK_NEEDS_SOURCE_TRUTH_REVIEW | default-zero risk; low momentum judgment; missing advisors may collapse to zero | Medium: momentum may support reason context only after hardening | do not reuse directly; consume protected metrics/snapshots |
| `manager-os/coaching/manager-coaching-engine.js` | `generarCoachingManager` | manager coaching legacy | Generates manager coaching labels/messages. | advisor/team coaching inputs | coaching recommendation/label | none observed | legacy tests not confirmed in this phase | MICK_NEEDS_BOUNDARY_WRAPPER | missing/unknown may become "mantener"; coaching can become HR truth | Medium | wrapper required before reuse |
| `manager-os/alerts/manager-alert-engine.js` | `detectarAlertasAdvisor` | alert/review legacy | Detects advisor alerts from points, inactivity, and pipeline. | `puntos`, `diasSinActividad`, `pipeline` | alerts / low momentum or low pipeline warnings | none observed | legacy tests not confirmed in this phase | MICK_RUNTIME_RISK | default-zero risk; alert can become punishment/enforcement | Medium: alerts explain urgency only after review wrapper | replace with protected review context |
| `advisor-os/advisor-activity-timeline.js` | `crearActividad`, `obtenerTimelineAdvisor` | activity tracking | Creates and reads advisor activity timeline records. | advisorId, activity data | timeline entries | local store/data helpers not fully inspected | advisor tests not in 005B scope | MICK_NEEDS_SOURCE_TRUTH_REVIEW | Advisor OS ownership; Manager OS must not recalc truth | Medium | consume only through protected Advisor/Manager snapshots |
| `advisor-os/followup/followup-engine.js` | `generarFollowup` | follow-up behavior | Generates follow-up guidance from advisor/prospect context. | follow-up inputs | follow-up recommendation | not fully inspected | advisor tests not in 005B scope | MICK_NEEDS_BOUNDARY_WRAPPER | follow-up can become task/message execution | High: follow-up reason context after human approval boundary | reference only through future wrapper |
| `advisor-os/followup/appointment-followup-engine.js` | appointment follow-up module | follow-up behavior | Appears to handle appointment follow-up context. | appointment/follow-up context | follow-up context | not inspected deeply | advisor tests not in 005B scope | MICK_NEEDS_SOURCE_TRUTH_REVIEW | task/message execution risk if used directly | Medium | consume only through Advisor OS protected context |
| `advisor-os/followup/smart-followup-engine.js` | smart follow-up module | follow-up behavior | Appears to generate smart follow-up context. | prospect/advisor context | smart follow-up guidance | not inspected deeply | advisor tests not in 005B scope | MICK_NEEDS_BOUNDARY_WRAPPER | message/task execution risk | High | wrapper required |
| `advisor-os/referrals/referral-followup-engine.js` | referral follow-up module | execution pattern | Appears to support referral follow-up behavior. | referral/follow-up context | referral follow-up guidance | not inspected deeply | advisor tests not in 005B scope | MICK_NEEDS_BOUNDARY_WRAPPER | referral pressure/manipulation risk if unguarded | Medium/high | wrapper and safety review required |
| `advisor-os/advisor-performance-engine.js` | `calcularPerformance` | advisor performance | Calculates advisor performance context. | advisor metrics/activity inputs | performance output | not fully inspected | advisor tests not in 005B scope | MICK_NEEDS_SOURCE_TRUTH_REVIEW | performance truth/ranking/default-zero risk | Medium | protected snapshot/metrics only |
| `manager-os/recruitment/candidate-intelligence/candidate-coachability-engine.js` | `evaluateCandidateCoachability` | coachability | Evaluates candidate coachability context. | candidate/interview/assessment inputs | coachability evaluation | candidate-intelligence helpers | `candidate-coachability-engine-master-test.js` | MICK_NEEDS_SOURCE_TRUTH_REVIEW | coachability can become hiring/personality truth | Medium: coachability reason context after boundary | consume through candidate snapshot/recruitment boundary |
| `nash-advisor-performance-engine.js` | `buildAdvisorPerformanceReport` | advisor performance legacy | Builds advisor performance score/report from Nash memories. | memory/actions/conversation context | score, bottleneck, recommendation | Nash memory/learning context | Nash master test observed in 005A | MICK_LEGACY_DO_NOT_EXECUTE | scoring/default-zero/ranking risk | Low/medium until rewritten | replace with protected Manager OS metrics |
| `nash-coaching-insight-engine.js` | `buildCoachingInsight` | coaching insight legacy | Maps performance bottlenecks to coaching insight. | performance report | coaching priority, recommendation | none observed | Nash test observed in 005A | MICK_LEGACY_DO_NOT_EXECUTE | coaching-to-punishment risk | Medium after wrapper | reference only, do not execute |
| `nash-manager-alert-engine.js` | `buildManagerAlert` | manager alert legacy | Creates manager alert/escalation context. | performance/coaching insight | alert level, escalation, manager action | none observed | Nash test observed in 005A | MICK_RUNTIME_RISK | escalation/punishment/HR risk | Low until replaced | do not execute directly |
| `nash-team-intelligence-engine.js` | `buildTeamIntelligenceReport` | team intelligence legacy | Aggregates advisor reports and names strongest/weakest advisor. | advisor performance reports | team health, strongest/weakest, coaching opportunities | none observed | Nash test observed in 005A | MICK_RUNTIME_RISK | human ranking; punishment; default-zero risk | Low until rebuilt | park or replace with protected Manager OS contracts |
| `platform/commands/command-execution-engine.js` | command execution engine | action execution | Executes command/action flow in platform layer. | command/action inputs | execution result | platform command dependencies | platform tests not in 005B scope | MICK_RUNTIME_RISK | execution/action truth; task/runtime risk | Low for Mick until explicit gate | not Mick runtime; future action gate review |
| `performance-runtime.js` | performance runtime | runtime/performance | Appears to provide runtime performance behavior. | runtime input | runtime performance output | not inspected deeply | tests not in 005B scope | MICK_UNKNOWN_NEEDS_REVIEW | runtime approval and performance truth unknown | Unknown | needs source-truth review |
| `performance-monitor.js` | performance monitor | runtime/performance | Appears to monitor performance/runtime metrics. | runtime/performance context | monitor output | not inspected deeply | tests not in 005B scope | MICK_UNKNOWN_NEEDS_REVIEW | monitoring can be mistaken for performance truth | Unknown | needs source-truth review |
| `policy-operations/tasks/policy-followup-engine.js` | policy follow-up engine | task/follow-up | Appears to support policy follow-up task context. | policy/follow-up inputs | follow-up/task context | not inspected deeply | tests not in 005B scope | MICK_RUNTIME_RISK | task execution and message/action risk | Medium after action boundary | future task/action boundary review |
| `rule-packs/smnyl/smnyl-followup-engine.js` | SMNYL follow-up engine | rule-pack follow-up | Appears to create follow-up context under SMNYL rule pack. | rule-pack/follow-up facts | follow-up context | rule-pack files | tests not in 005B scope | MICK_NEEDS_SOURCE_TRUTH_REVIEW | rule-pack ownership; task/message execution risk | Medium | consume through rule-pack source-truth boundary only |

## Mick Capability Map

- Behavior intelligence: `mick/context-intake/*`, `manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js`.
- Activity tracking: `advisor-os/advisor-activity-timeline.js`, `manager-os/team-intelligence/activity/team-activity-engine.js`.
- Habit / discipline / consistency: modern Mick intake, review-plan intelligence, team activity/momentum legacy modules.
- Coachability: `manager-os/recruitment/candidate-intelligence/candidate-coachability-engine.js`.
- Execution pattern: follow-up engines, review-plan engines, command execution engine as runtime-risk boundary.
- Advisor performance: `advisor-os/advisor-performance-engine.js`, `nash-advisor-performance-engine.js`.
- Team activity / momentum: `manager-os/team-intelligence/activity/team-activity-engine.js`, `manager-os/team-intelligence/momentum/team-momentum-engine.js`, `nash-team-intelligence-engine.js`.
- Manager coaching / review: `manager-os/coaching-intelligence/*`, `manager-os/review-plan-intelligence/*`, legacy `manager-os/coaching/manager-coaching-engine.js`.
- Alert/review: `manager-os/alerts/manager-alert-engine.js`, `nash-manager-alert-engine.js`.
- Unknown/runtime performance: `performance-runtime.js`, `performance-monitor.js`.

## Behavior / execution modules

- Safe modern behavior context:
  - `mick/context-intake/mick-manager-context-intake-boundary-contract.js`
  - `mick/context-intake/mick-manager-context-intake-orchestrator.js`
  - `mick/context-intake/mick-manager-behavior-review-packet-intake.js`
  - `mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js`
  - `manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js`

- Execution-risk modules:
  - `platform/commands/command-execution-engine.js`
  - `policy-operations/tasks/policy-followup-engine.js`
  - Follow-up engines that could be mistaken for task/message execution if used outside a boundary.

Boundary:

- Behavior context may explain "why now" and "why this action."
- Behavior context is not enforcement.
- Execution labels are not task/calendar/message execution truth.

## Activity / consistency modules

- `advisor-os/advisor-activity-timeline.js`
- `manager-os/team-intelligence/activity/team-activity-engine.js`
- `manager-os/team-intelligence/momentum/team-momentum-engine.js`
- `advisor-os/followup/followup-engine.js`
- `advisor-os/followup/smart-followup-engine.js`
- `advisor-os/followup/appointment-followup-engine.js`
- `advisor-os/referrals/referral-followup-engine.js`

Boundary:

- Missing activity is not zero activity.
- Missing follow-up is not negative evidence.
- Momentum is not performance truth.
- Consistency context must expose evidence, source owner, and freshness.

## Coaching / Manager Review Modules

- Modern Manager OS coaching:
  - `manager-os/coaching-intelligence/manager-coaching-boundary-contract.js`
  - `manager-os/coaching-intelligence/manager-coaching-intelligence-engine.js`
  - `manager-os/coaching-intelligence/manager-advisor-coaching-engine.js`
  - `manager-os/coaching-intelligence/manager-recruitment-coaching-engine.js`
  - `manager-os/coaching-intelligence/manager-team-coaching-engine.js`

- Modern Manager OS review plan:
  - `manager-os/review-plan-intelligence/manager-review-plan-boundary-contract.js`
  - `manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js`
  - `manager-os/review-plan-intelligence/manager-advisor-review-plan-engine.js`
  - `manager-os/review-plan-intelligence/manager-recruitment-review-plan-engine.js`
  - `manager-os/review-plan-intelligence/manager-team-review-plan-engine.js`

- Legacy coaching/review:
  - `manager-os/coaching/manager-coaching-engine.js`
  - `manager-os/alerts/manager-alert-engine.js`
  - `nash-coaching-insight-engine.js`
  - `nash-manager-alert-engine.js`

Boundary:

- Coaching is support context.
- Review plan is not task/calendar truth.
- Manager review context is not HR truth, punishment, ranking, or promotion truth.

## Runtime-Risk Modules

- `manager-os/alerts/manager-alert-engine.js` - alert/escalation risk.
- `nash-manager-alert-engine.js` - manager alert and escalation risk.
- `nash-team-intelligence-engine.js` - strongest/weakest advisor ranking risk.
- `platform/commands/command-execution-engine.js` - action execution risk.
- `policy-operations/tasks/policy-followup-engine.js` - task/follow-up execution risk.
- `performance-runtime.js` - runtime behavior unknown.

Runtime-risk modules are inventory only. They are not approved for Mick runtime, Manager OS runtime, NBA execution, task creation, calendar creation, message sending, or enforcement.

## Surveillance / punishment / HR-risk modules

- `mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js` is a protective module against surveillance and punishment framing.
- `manager-os/alerts/manager-alert-engine.js` requires boundary review because alert labels can be misused as punishment or enforcement.
- `nash-manager-alert-engine.js` requires do-not-execute treatment because escalation/risk language can be mistaken for HR action.
- `nash-team-intelligence-engine.js` requires do-not-execute treatment because strongest/weakest advisor output creates human-ranking risk.
- `advisor-os/advisor-performance-engine.js` and `nash-advisor-performance-engine.js` require source-truth review because performance scores can be mistaken for ranking/promotion/punishment truth.
- `candidate-coachability-engine.js` requires source-truth review because coachability is review context, not hiring/personality truth.

Boundary:

- Mick support is not surveillance.
- Behavior context is not personality truth.
- Coachability context is not hiring truth.
- Performance context is not promotion, punishment, or compensation truth.

## Legacy / Do-Not-Execute Modules

- `nash-advisor-performance-engine.js`
- `nash-coaching-insight-engine.js`
- `nash-manager-alert-engine.js`
- `nash-team-intelligence-engine.js`
- Legacy Manager OS alert/momentum/coaching modules when used directly without protected Manager OS boundaries.

Rationale:

- These modules predate the modern Manager OS/Mick boundary chain.
- They can mix performance, coaching, alert, team comparison, and action language.
- They require wrappers or replacement before modern Forge Genesis / NBA reuse.

## Candidate Modules for Forge Genesis Beta Loop

Safe candidates, as context/reference only:

- `mick/context-intake/mick-manager-context-intake-boundary-contract.js`
- `mick/context-intake/mick-manager-context-intake-orchestrator.js`
- `mick/context-intake/mick-manager-behavior-review-packet-intake.js`
- `mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js`
- `manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js`
- `manager-os/review-plan-intelligence/manager-review-plan-boundary-contract.js`
- `manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js`
- `manager-os/coaching-intelligence/manager-coaching-boundary-contract.js`
- `manager-os/coaching-intelligence/manager-coaching-intelligence-engine.js`

Legacy candidates that may inform Beta Loop only through wrappers:

- `advisor-os/followup/followup-engine.js`
- `advisor-os/followup/smart-followup-engine.js`
- `manager-os/team-intelligence/activity/team-activity-engine.js`
- `manager-os/team-intelligence/momentum/team-momentum-engine.js`
- `manager-os/coaching/manager-coaching-engine.js`
- `manager-os/alerts/manager-alert-engine.js`

## Candidate modules for NBA Reason Why

High-confidence candidates:

- `mick/context-intake/mick-manager-context-intake-boundary-contract.js`
- `mick/context-intake/mick-manager-context-intake-orchestrator.js`
- `mick/context-intake/mick-manager-behavior-review-packet-intake.js`
- `mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js`
- `manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js`
- `manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js`

Conditional candidates:

- `manager-os/coaching-intelligence/manager-coaching-intelligence-engine.js`
- `advisor-os/advisor-activity-timeline.js`
- Advisor follow-up engines, only through Advisor OS ownership and protected snapshots.
- Recruitment coachability, only through CandidateManagerSnapshot and recruitment boundaries.

Boundary:

- NBA Reason Why may explain voluntary action.
- NBA Reason Why must not shame, rank, punish, enforce, or infer personality truth.
- NBA Reason Why must expose evidence, source owner, freshness, missing/unknown/stale context, and confidence limitations.

## Needed Boundary Wrappers

1. Mick Legacy Activity/Momentum Wrapper
2. Mick Advisor Follow-Up Context Wrapper
3. Mick Performance Score No-Ranking Wrapper
4. Mick Candidate Coachability No-Hiring-Truth Wrapper
5. Mick Manager Alert No-Punishment Wrapper
6. Mick Team Intelligence No-Human-Ranking Wrapper
7. Mick Runtime/Action Execution Gate Wrapper
8. Mick NBA Reason Why Contract

## Questions for 006A Nash + Mick Reconnection Scope

1. Should 006A define the canonical safe chain as protected context -> Nash context -> Mick behavior context -> NBA Reason Why -> prompt builder -> draft intake -> safety validator -> human approval?
2. Should Mick context be required before any NBA Reason Why is shown?
3. Which Mick evidence fields are mandatory for "why now" explanations?
4. Should legacy activity/momentum modules remain parked until they consume AdvisorManagerSnapshot and Manager Metrics only?
5. Should Nash message guidance and Mick behavior reasons be merged only at prompt-builder instruction level?
6. What interface should prevent Mick context from becoming surveillance, punishment, ranking, or HR truth?
7. Should `mick-manager-no-surveillance-guardrail-intake.js` be mandatory for every future Mick/NBA output?

## What Forge Learned

- Mick already has a modern protected context-intake chain.
- The modern Mick chain is much safer than legacy behavior/performance/alert modules because it explicitly protects evidence, freshness, allowed uses, forbidden uses, and false truth/action flags.
- Legacy activity, momentum, coaching, alert, performance, and team-intelligence modules remain useful as historical source material but are not approved runtime.
- Mick is well positioned to explain NBA Reason Why, especially "why now" and "why this action."
- Mick must be kept out of surveillance, punishment, HR, ranking, promotion, compensation, revenue, payout, and lifecycle truth.

## Forge Council Review

- Miranda: This makes Forge better by distinguishing usable Mick context from legacy behavior-risk modules.
- Arqui Juve: Architecture is more maintainable if modern Mick intake is the approved path and legacy modules are wrapper-only.
- Joy Mangano: This is useful in real advisor/manager work because managers need behavior context without turning Forge into surveillance.
- Nash: This supports better conversation by pairing conversation context with behavior reasons without inventing intent.
- Mick: This interprets execution patterns only as review-safe context, not punishment, ranking, or personality truth.
- Patch Adams: Human trust is preserved because behavior context stays supportive and non-shaming.
- Chris Gardner: Prospecting and execution improve when Forge can explain why an action matters now.
- Rocky: Consistency improves because Mick can identify patterns without judging the person.
- Nicky Spurgeon: Referral/networking support remains ethical when behavior patterns do not become pressure.
- Jordan Belfort: Conversion support improves when consistency and follow-up are disciplined without manipulation.
- Jurgen Klaric: Psychology and behavior can inform action, but must not become manipulation or personality certainty.

Council review is advisory only and does not override Constitution, ADRs, evidence, tests, or source-truth boundaries.

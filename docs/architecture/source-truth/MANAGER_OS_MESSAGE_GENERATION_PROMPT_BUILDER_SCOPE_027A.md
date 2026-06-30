# MANAGER OS MESSAGE GENERATION PROMPT BUILDER SCOPE 027A

Status: SCOPED

Phase: MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPE_027A

Mode: READ ONLY DISCOVERY + DOCS SCOPE CLOSURE

Mainline continuation:

- Commit: 1f55a7e86eebd057d3b353d825d01b84102d9f9e
- Message: docs: close manager os context intelligence v1

## Constitutional Lock

- Forge decides; AI explains.
- Unknown is not zero.
- Blocked is not zero.
- Missing evidence is not negative evidence.
- Context is not truth.
- Prompt is not draft.
- Draft is not approved communication.
- Recommendation is not execution.
- Nash conversation support is not Nash runtime execution.
- Message recommendation is not message send.
- Next-best-action is not execution.
- Human approval is mandatory before action.

## Closure State

~~~text
MANAGER_OS_CONTEXT_INTELLIGENCE_V1=CLOSED
MANAGER_OS_PRODUCT_RUNTIME_LAYER=OPEN
MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER=SCOPED
MESSAGE_GENERATION_RUNTIME=NOT_IMPLEMENTED
LLM_RUNTIME=NOT_IMPLEMENTED
MESSAGE_DRAFT_CREATION=NOT_IMPLEMENTED
WHATSAPP_SMS_DELIVERY=NOT_IMPLEMENTED
HUMAN_APPROVAL_GATE=REQUIRED
LEGACY_NASH_MESSAGE_ENGINE=EXISTS_NEEDS_BOUNDARY_WRAPPER
~~~

## Discovery Findings

Legacy Nash engines found:

- `nash-core-engine.js`
- `nash-message-recommendation-engine.js`
- `nash-next-best-action-engine.js`
- `nash-prospect-context-builder.js`
- `nash-master-intelligence-engine.js`

Modern protected context chain found:

- `manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js`
- `nash/context-intake/nash-manager-context-intake-orchestrator.js`

## Legacy Nash Engine Assessment

`nash-message-recommendation-engine.js` generates direct message text fields such as `firstMessage` and `followupMessage`. It also returns `nextBestAction`.

`nash-next-best-action-engine.js` directly recommends actions such as `SCHEDULE_APPOINTMENT`, `SEND_CONTEXT_THEN_ASK`, `HANDLE_OBJECTION`, `SEND_FOLLOWUP`, `REACTIVATE_PROSPECT`, and `SEND_FIRST_MESSAGE`.

`nash-core-engine.js` orchestrates legacy context, message recommendation, followup, and next-best-action.

`nash-prospect-context-builder.js` is prospect-oriented and defaults some missing fields into operational fallbacks, including `children: 0`, `name: "Prospecto"`, and `channel: "whatsapp"`.

`nash-master-intelligence-engine.js` is mixed advisor/prospect/manager contextual intelligence and calculates confidence from intent, personality, and advisor performance. It is not a Manager OS prompt-builder boundary.

Conclusion:

Legacy Nash is useful as contextual source material only. It is not approved for direct Manager OS runtime execution. It must be wrapped behind a Manager OS message prompt builder boundary before any future message-generation layer consumes it.

## Modern Manager OS Context Chain

The modern chain already preserves context-only boundaries:

~~~text
Manager OS protected context
-> Manager External Context Bridge
-> Nash Manager Context Intake
-> Nash-ready context only
~~~

The current chain does not execute Nash runtime, create final messages, create drafts, create tasks, create calendar events, or send messages.

## Canonical Future Chain

~~~text
protected context
-> Nash context intake
-> prompt builder
-> future LLM draft intake
-> future safety validator
-> human approval
-> future delivery adapter
~~~

## Allowed Future Prompt Builder Inputs

- Protected Manager OS context.
- Nash manager context intake output.
- Manager External Context Bridge sanitized packets.
- Message purpose.
- Audience type.
- Requested use.
- Evidence refs.
- Source evidence IDs.
- Source owners.
- Freshness.
- Period.

## Forbidden Inputs

- Raw Advisor OS.
- Raw recruitment events.
- Legacy Nash runtime outputs as direct execution authority.
- Direct legacy Manager OS dashboard/momentum/report modules.
- Compensation.
- Revenue.
- Payout.
- Advisor Lifecycle truth.
- Product Intelligence truth.
- Unbounded LLM output.
- WhatsApp/SMS adapters.
- Task/calendar write adapters.

## Allowed Outputs

- Prompt status.
- Prompt purpose.
- Audience type.
- Prompt instructions.
- Evidence refs.
- Source evidence IDs.
- Source owners.
- Freshness.
- Missing/unknown/stale context.
- Warnings.
- Confidence limitations.
- Human approval required flag.
- False runtime/action/truth flags.

## Forbidden Outputs

- LLM draft.
- Final message.
- WhatsApp/SMS send.
- Task creation.
- Calendar event creation.
- Nash runtime execution.
- Next-best-action execution.
- Message-send truth.
- HR truth.
- Hiring truth.
- Advisor Lifecycle truth.
- Revenue truth.
- Compensation truth.
- Payout truth.
- Automatic decision truth.

## Truth, Action, And Write Flags

Future Prompt Builder output must lock:

~~~text
humanApprovalRequired=true
automaticDecisionAllowed=false
createsDraft=false
sendsMessage=false
createsTask=false
createsCalendarEvent=false
executesNashRuntime=false
executesLlmRuntime=false
createsDownstreamTruth=false
createsRevenueTruth=false
createsCompensationTruth=false
createsPayoutTruth=false
createsAdvisorLifecycleTruth=false
createsHiringTruth=false
createsHRTruth=false
~~~

## Exact 027B/C Recommendation

Implement a new Manager OS boundary. Do not import or execute legacy Nash runtime directly.

Recommended files:

- `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js`
- `manager-os/message-generation/manager-message-prompt-builder.js`
- `manager-os/tests/manager-message-prompt-builder-boundary-contract-master-test.js`
- `manager-os/tests/manager-message-prompt-builder-master-test.js`

Recommended API:

~~~js
buildManagerMessagePrompt({
  managerContext,
  nashConversationContext,
  messagePurpose,
  audienceType,
  requestedUse,
  evidenceRefs,
  sourceEvidenceIds,
  sourceOwners,
  freshness,
  period
})
~~~

The implementation must build protected prompt instructions only. It must not create draft text or call an LLM.

## What Forge Learned

Forge learned that the next safe step after Manager OS Context Intelligence V1 is not message generation. The next step is a prompt-builder boundary that transforms protected context into safe instructions for a future draft layer.

Forge also learned that legacy Nash contains valuable conversation logic, but direct reuse would cross runtime and action boundaries. Nash support must be consumed through protected context intake and a Manager OS boundary wrapper.

## 027B Implementation Closure

Status: IMPLEMENTED_AND_CLOSED_FOR_PROMPT_INSTRUCTIONS_ONLY

Implementation commit:

- 4dc6d57df37833019e3eb1e9f468fe9ee53c913e
- feat: add manager message prompt builder boundary

Implemented files:

- `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js`
- `manager-os/message-generation/manager-message-prompt-builder.js`

Tests:

- `manager-os/tests/manager-message-prompt-builder-boundary-contract-master-test.js` PASS 13/13
- `manager-os/tests/manager-message-prompt-builder-master-test.js` PASS 16/16
- Total: PASS 29/29

Exports:

- `evaluateManagerMessagePromptBuilderBoundary`
- `MANAGER_MESSAGE_PROMPT_BUILDER_BOUNDARY_STATUSES`
- `MANAGER_MESSAGE_PROMPT_BUILDER_BOUNDARY_DECISIONS`
- `buildManagerMessagePrompt`
- `MANAGER_MESSAGE_PROMPT_BUILDER_STATUSES`
- `MANAGER_MESSAGE_PROMPT_BUILDER_DECISIONS`
- allowed/forbidden prompt-use constants

Implemented statuses:

- `READY_FOR_PROMPT_REVIEW`
- `NEEDS_CONTEXT`
- `NEEDS_EVIDENCE`
- `NEEDS_SOURCE_OWNER`
- `NEEDS_FRESHNESS`
- `NEEDS_HUMAN_REVIEW`
- `BLOCKED`
- `UNKNOWN`
- `NOT_MODELED`

Allowed uses:

- `MANAGER_MESSAGE_PROMPT_PREP`
- `RECRUITMENT_OUTREACH_PROMPT_PREP`
- `ADVISOR_SUPPORT_PROMPT_PREP`
- `ONE_ON_ONE_PREP_PROMPT`
- `FOLLOW_UP_PROMPT_PREP`
- `CONTEXTUAL_CHECK_IN_PROMPT_PREP`

Forbidden uses:

- `GENERATE_FINAL_DRAFT`
- `SEND_MESSAGE`
- `WHATSAPP_SEND`
- `SMS_SEND`
- `LLM_RUNTIME_EXECUTION`
- `NASH_RUNTIME_EXECUTION`
- `LEGACY_NASH_MESSAGE_EXECUTION`
- `NEXT_BEST_ACTION_EXECUTION`
- `CREATE_TASK`
- `CREATE_CALENDAR_EVENT`
- `HUMAN_RANKING`
- `PROMOTION_DECISION`
- `PUNISHMENT`
- `TERMINATION`
- `COMPENSATION`
- `PAYOUT`
- `REVENUE_TRUTH`
- `ADVISOR_LIFECYCLE_TRUTH`
- `HR_DECISION`
- `HIRING_DECISION`

Output shape:

- `promptStatus`
- `promptPurpose`
- `audienceType`
- `promptInstructions`
- `evidenceRefs`
- `sourceEvidenceIds`
- `sourceOwners`
- `freshness`
- `period`
- `missingContext`
- `unknownContext`
- `staleContext`
- `warnings`
- `confidenceLimitations`
- `allowedUses`
- `blockedUses`
- `humanApprovalRequired: true`
- all draft/send/runtime/action/downstream truth flags false

Still open:

- LLM Draft Intake
- Message Safety Validator
- Human Approval Gate
- WhatsApp/SMS Delivery Adapter
- Send Execution Gate
- UI / Read Model
- Persistence / Adapter Boundary

## 027C Final Declaration

~~~text
MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER=IMPLEMENTED_AND_CLOSED_FOR_PROMPT_INSTRUCTIONS_ONLY
PROMPT_IS_NOT_DRAFT=true
DRAFT_IS_NOT_APPROVED_COMMUNICATION=true
NASH_RUNTIME_EXECUTION=false
LLM_RUNTIME_EXECUTION=false
MESSAGE_DRAFT_CREATION=false
WHATSAPP_SMS_DELIVERY=false
TASK_CALENDAR_CREATION=false
DOWNSTREAM_TRUTH_CREATION=false
HUMAN_APPROVAL_REQUIRED=true
NEXT=028A_LLM_DRAFT_INTAKE_AND_MESSAGE_SAFETY_VALIDATOR_SCOPE
~~~

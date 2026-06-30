# MANAGER OS MESSAGE GENERATION PROMPT BUILDER SCOPE 027A

Status: SCOPED

Decision: MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPED

## Executive Summary

Manager OS Context Intelligence V1 is closed. The product runtime layer remains open. The next safe layer is a Manager OS Message Generation Prompt Builder.

The Prompt Builder is scoped as a protected instruction builder only. It does not generate LLM drafts, create message drafts, send WhatsApp/SMS, create tasks, create calendar events, execute Nash runtime, or create downstream truth.

## Why 027A Exists

Forge needs to move from protected Manager OS context into future message preparation without crossing into runtime execution.

027A exists to define the boundary between:

- protected context
- Nash-ready conversation context
- prompt instructions
- future LLM drafts
- future safety validation
- human approval
- future delivery adapters

## Locked Status

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

## Required Language Lock

~~~text
Prompt is not draft.
Draft is not approved communication.
Nash support is not Nash runtime execution.
Message recommendation is not message send.
Next-best-action is not execution.
Human approval is mandatory before action.
~~~

## What Is Scoped

- A Manager OS prompt-builder boundary.
- Protected instruction preparation.
- Evidence/source/freshness preservation.
- Missing/unknown/stale context handling.
- Human approval requirement.
- Explicit false flags for draft, send, task, calendar, LLM runtime, Nash runtime, and downstream truth.

## What Remains Open

- Message generation runtime.
- LLM draft generation.
- Draft safety validator.
- Human approval UI.
- WhatsApp/SMS delivery adapter.
- Task/calendar adapter.
- Send execution gate.
- Runtime/UI/persistence/read models.

## Discovery Summary

Legacy Nash files exist:

- `nash-core-engine.js`
- `nash-message-recommendation-engine.js`
- `nash-next-best-action-engine.js`
- `nash-prospect-context-builder.js`
- `nash-master-intelligence-engine.js`

These engines are not approved for direct Manager OS runtime execution. They are prospect/advisor/manager-mixed legacy context and must be boundary-wrapped before any Manager OS message-generation flow can consume them.

Modern safe context files exist:

- `manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js`
- `nash/context-intake/nash-manager-context-intake-orchestrator.js`

## Recommended 027B/C Implementation Plan

Create:

- `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js`
- `manager-os/message-generation/manager-message-prompt-builder.js`

Create tests:

- `manager-os/tests/manager-message-prompt-builder-boundary-contract-master-test.js`
- `manager-os/tests/manager-message-prompt-builder-master-test.js`

The implementation must expose a function similar to:

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

## Expected Future Output Shape

- `promptStatus`
- `promptPurpose`
- `audienceType`
- `promptInstructions`
- `evidenceRefs`
- `sourceEvidenceIds`
- `sourceOwners`
- `freshness`
- `missingContext`
- `unknownContext`
- `staleContext`
- `warnings`
- `confidenceLimitations`
- `humanApprovalRequired: true`
- `automaticDecisionAllowed: false`
- `createsDraft: false`
- `sendsMessage: false`
- `createsTask: false`
- `createsCalendarEvent: false`
- `executesNashRuntime: false`
- `executesLlmRuntime: false`
- `createsDownstreamTruth: false`

## PASS Criteria For 027B/C

- Prompt Builder creates instructions only.
- No LLM runtime call.
- No draft creation.
- No message send.
- No task/calendar creation.
- No Nash runtime execution.
- No downstream truth.
- Human approval required.
- Evidence/source/freshness preserved.
- Missing evidence is not negative evidence.
- Unknown is not zero.
- Blocked is not zero.
- Legacy Nash direct execution prohibited.

## HOLD Criteria For 027B/C

- Any direct legacy Nash runtime execution is required.
- Any LLM call is required.
- Any message draft creation is required.
- Any WhatsApp/SMS/task/calendar adapter is required.
- Any downstream truth is created.
- Any implementation requires modifying legacy Nash, Advisor OS, compensation, revenue, advisor-lifecycle, product-intelligence, schemas, fixtures, runtime, UI, package, or existing tests.

## Final Scope Statement

027B/C should implement a Manager OS-owned prompt-builder boundary. It must prepare safe prompt instructions from protected Manager OS and Nash intake context only. It must not generate drafts, execute runtime, or perform delivery.

## 027B Implementation Complete

Status: IMPLEMENTED_AND_CLOSED_FOR_PROMPT_INSTRUCTIONS_ONLY

Commit:

- 4dc6d57df37833019e3eb1e9f468fe9ee53c913e
- feat: add manager message prompt builder boundary

Implemented:

- `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js`
- `manager-os/message-generation/manager-message-prompt-builder.js`

Verified:

- `manager-os/tests/manager-message-prompt-builder-boundary-contract-master-test.js` PASS 13/13
- `manager-os/tests/manager-message-prompt-builder-master-test.js` PASS 16/16
- Total: PASS 29/29

## 027C Docs Sync

027C closes documentation for the prompt-builder boundary. The boundary is now closed for protected prompt instructions only.

It does not close:

- LLM Draft Intake
- Message Safety Validator
- Human Approval Gate
- WhatsApp/SMS Delivery Adapter
- Send Execution Gate
- UI / Read Model
- Persistence / Adapter Boundary

## Next Recommended Phase

~~~text
NEXT=028A_LLM_DRAFT_INTAKE_AND_MESSAGE_SAFETY_VALIDATOR_SCOPE
~~~

028A should scope how future LLM draft intake and message safety validation consume Prompt Builder instructions without creating approved communications, sends, tasks, calendar events, or downstream truth.

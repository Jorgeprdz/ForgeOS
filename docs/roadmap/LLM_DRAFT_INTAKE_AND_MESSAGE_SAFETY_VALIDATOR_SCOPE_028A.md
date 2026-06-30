# LLM Draft Intake and Message Safety Validator Scope 028A

Status: SCOPED

Decision: LLM_DRAFT_INTAKE_AND_MESSAGE_SAFETY_VALIDATOR_SCOPED

## Executive Summary

028A scopes the next operating layer after the closed Manager OS Message Generation Prompt Builder.

The next layer is not delivery and not approval. It is a future intake and safety review boundary for unapproved draft language.

## Why 028A Exists

The Prompt Builder is closed for prompt instructions only. It does not execute LLM runtime and does not produce drafts.

Before Forge can support any draft language, it needs a boundary that receives draft text as unapproved context and a validator that can flag, block, or request revisions without approving or sending anything.

## What Is Scoped

- Future LLM Draft Intake.
- Future Message Safety Validator.
- Evidence/source/freshness requirements for draft review.
- Safety checks for pressure, shame, manipulation, false urgency, unsupported claims, and prohibited truth claims.
- Human approval boundary.
- Future implementation files and tests for 028B/C.

## What Remains Open

- LLM runtime execution.
- Draft generation runtime.
- Human Approval Gate.
- WhatsApp/SMS Delivery Adapter.
- Send Execution Gate.
- Task/calendar adapter.
- UI / read model.
- Persistence / adapter boundary.

## Proposed Implementation Files

- manager-os/message-generation/llm-draft-intake-boundary-contract.js
- manager-os/message-generation/message-safety-validator.js

## Proposed Tests

- manager-os/tests/llm-draft-intake-boundary-contract-master-test.js
- manager-os/tests/message-safety-validator-master-test.js

## Future Output Shape

028B/C should recommend or implement outputs shaped around:

- `draftStatus`
- `safetyStatus`
- `draftText`
- `draftPurpose`
- `audienceType`
- `evidenceRefs`
- `sourceEvidenceIds`
- `sourceOwners`
- `freshness`
- `detectedRisks`
- `blockedReasons`
- `requiredRevisions`
- `missingEvidence`
- `unknownContext`
- `staleContext`
- `humanApprovalRequired: true`
- `safeForHumanReview`
- `safeForSend: false`
- `automaticApprovalAllowed: false`
- `sendsMessage: false`
- `createsTask: false`
- `createsCalendarEvent: false`
- `executesLlmRuntime: false`
- `executesDeliveryAdapter: false`
- `createsDownstreamTruth: false`

## Safety Validator Scope

The Message Safety Validator must be scoped to check for:

- pressure language
- shame language
- manipulation
- false urgency
- invented intent
- unsupported product claims
- unsupported income claims
- unsupported protection or insurance need diagnosis
- HR, hiring, promotion, or punishment language
- compensation, payout, or revenue truth claims
- Advisor Lifecycle truth claims
- message-send claims
- task or calendar execution claims
- missing evidence references
- missing source owner
- stale or unknown freshness
- content outside prompt purpose
- use of private motivation context as leverage
- family or children fear leverage
- medical, financial, or legal certainty claims

## 028B/C Pass Conditions

028B/C should pass only if:

- LLM Draft Intake treats draft text as unapproved draft context only.
- Message Safety Validator flags, blocks, or requests revision without approving sends.
- Human approval remains required.
- `safeForSend` remains false.
- No LLM runtime execution is introduced.
- No WhatsApp/SMS send is introduced.
- No task/calendar creation is introduced.
- No downstream truth is created.
- No HR, hiring, ranking, promotion, punishment, Advisor Lifecycle, revenue, compensation, or payout truth is created.
- Missing evidence is not negative evidence.
- Unknown is not zero.
- Stale freshness requires review.

## Next After 028B/C

~~~text
029A_HUMAN_APPROVAL_GATE_SCOPE
~~~

The Human Approval Gate must remain separate from draft intake and safety validation.

## Locked Declaration

~~~text
LLM_DRAFT_INTAKE=SCOPED_NOT_IMPLEMENTED
MESSAGE_SAFETY_VALIDATOR=SCOPED_NOT_IMPLEMENTED
LLM_RUNTIME_EXECUTION=false
DRAFT_IS_NOT_APPROVED_COMMUNICATION=true
SAFETY_VALIDATION_IS_NOT_HUMAN_APPROVAL=true
MESSAGE_SEND=false
TASK_CALENDAR_CREATION=false
DOWNSTREAM_TRUTH_CREATION=false
HUMAN_APPROVAL_REQUIRED=true
NEXT=028B_LLM_DRAFT_INTAKE_AND_MESSAGE_SAFETY_VALIDATOR_IMPLEMENTATION
~~~

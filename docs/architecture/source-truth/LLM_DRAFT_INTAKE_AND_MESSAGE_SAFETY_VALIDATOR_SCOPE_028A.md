# LLM Draft Intake and Message Safety Validator Scope 028A

Phase: 028A_LLM_DRAFT_INTAKE_AND_MESSAGE_SAFETY_VALIDATOR_SCOPE

Decision: LLM_DRAFT_INTAKE_AND_MESSAGE_SAFETY_VALIDATOR_SCOPED

Date: 2026-06-29

## Mainline Continuation

028A continues from:

- db8e41dd56cc9accf8d0cca809396ba55ead1b38
- docs: close manager message prompt builder

Prior closed state:

~~~text
MANAGER_OS_CONTEXT_INTELLIGENCE_V1=CLOSED
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

## Discovery Findings

The closed Manager OS Prompt Builder produces protected prompt instructions only. It does not create final drafts, execute Nash runtime, execute LLM runtime, send WhatsApp/SMS, create tasks, create calendar events, or create downstream truth.

Legacy Nash message files exist as contextual source material:

- nash-message-recommendation-engine.js
- nash-next-best-action-engine.js
- nash-core-engine.js

Read-only review found that legacy Nash can produce message-like strings and direct next-best-action labels. Examples include first/follow-up message fields, action labels such as send follow-up or schedule appointment, and default-zero behavior around days since contact. Those legacy engines are not approved for direct Manager OS runtime execution in this scope.

## Definition: LLM Draft Intake

LLM Draft Intake is the future boundary that may receive draft language after a protected prompt-instruction step.

It is not LLM runtime execution. It is not prompt building. It is not message delivery. It is not approval.

LLM Draft Intake must preserve the draft as unapproved language only and must attach evidence, source owner, freshness, prompt purpose, audience type, and confidence limitations before the draft can be evaluated by a safety validator.

## Definition: Message Safety Validator

Message Safety Validator is the future boundary that evaluates draft language for safety, evidence, source ownership, freshness, purpose alignment, and prohibited claims.

The validator may flag, block, request revision, or mark human review required.

The validator must not rewrite and approve messages automatically. The validator must not send messages. The validator must not create tasks or calendar events. The validator must not create downstream truth. Safety validation is not human approval.

## Allowed Draft Inputs

- Draft language from a future approved LLM Draft Intake boundary.
- Prompt instructions from the Manager OS Message Generation Prompt Builder.
- Message purpose.
- Audience type.
- Evidence references.
- Source evidence IDs.
- Source owners.
- Freshness.
- Period context.
- Manager context references.
- Nash conversation context references, as protected context only.
- Confidence limitations.

## Forbidden Draft Inputs

- Raw legacy Nash runtime output as authoritative message truth.
- Direct Nash runtime execution.
- Direct LLM runtime execution inside the validator.
- WhatsApp/SMS delivery adapter output.
- Task or calendar execution output.
- Compensation, revenue, payout, or Advisor Lifecycle truth engines.
- Product claims without product documentation.
- Income claims without evidence.
- Private motivation context used as pressure or leverage.
- Unbounded context without evidence/source/freshness.

## Allowed Validator Outputs

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

## Forbidden Validator Outputs

- Approved communication.
- Ready-to-send message.
- WhatsApp/SMS send instruction.
- Task creation.
- Calendar creation.
- Automatic approval.
- Human approval substitute.
- Hiring truth.
- HR truth.
- Promotion truth.
- Punishment truth.
- Human ranking truth.
- Advisor Lifecycle truth.
- Revenue truth.
- Compensation truth.
- Payout truth.
- Product truth.
- Medical, financial, or legal certainty.

## Required Safety Checks

The future validator must check for:

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

## Human Approval Boundary

Human approval remains mandatory before any external action.

Safety validation can make a draft safer for human review. It cannot make a draft safe for send. It cannot approve a message. It cannot create a delivery instruction. It cannot replace manager judgment.

## Proposed 028B/C Implementation Direction

Recommended future files:

- manager-os/message-generation/llm-draft-intake-boundary-contract.js
- manager-os/message-generation/message-safety-validator.js
- manager-os/tests/llm-draft-intake-boundary-contract-master-test.js
- manager-os/tests/message-safety-validator-master-test.js

Recommended future behavior:

- Intake draft language as unapproved draft context.
- Preserve prompt purpose and audience type.
- Preserve evidence/source/freshness.
- Detect missing or stale evidence.
- Detect unsafe language and unsupported claims.
- Block forbidden uses.
- Require human approval always.
- Keep `safeForSend` false.
- Keep all runtime, send, task, calendar, and downstream truth flags false.

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

## What Forge Learned

Forge can now move from protected prompt instructions toward future draft intake without confusing the boundaries. A prompt is not a draft. A draft is not approved communication. Safety validation is not human approval. Legacy Nash message behavior remains useful evidence for design, but it cannot be directly executed as Manager OS message generation.

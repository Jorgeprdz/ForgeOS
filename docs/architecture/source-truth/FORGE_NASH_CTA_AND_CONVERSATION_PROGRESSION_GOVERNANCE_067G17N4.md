# Forge NASH CTA and Conversation Progression Governance 067G17N4

Status: `RATIFIED_GOVERNANCE`

Version: `1.0.0`

Stage: `067G17N4_CTA_AND_CONVERSATION_PROGRESSION_GOVERNANCE`

## 1. Purpose and Scope

This document governs how NASH may recommend progression in a commercial conversation while preserving Prospect autonomy and Advisor authority.

It defines CTA meaning, contextual use, conversation types, allowed progression objectives, and non-manipulation boundaries. It does not implement NASH, Pipeline, UI, templates, tests, contracts, schemas, scheduling, delivery, or sending.

This document does not create a new constitutional rule. It applies the existing Constitution and ADR-003, ADR-009, ADR-010, ADR-011, and the Prospect Message Privacy Policy 067G17N3.

## 2. Definition of CTA

A Call to Action (`CTA`) is a suggested conversational invitation that makes a possible next step understandable to the Prospect and reviewable by the Advisor.

A CTA may:

- invite a response;
- ask permission to continue;
- ask a discovery or clarification question;
- propose reviewing information;
- propose coordinating a conversation or appointment;
- confirm, revise, or release a prior commitment;
- offer a respectful pause or close.

A CTA is not:

- a mandate;
- consent;
- a completed action;
- an appointment;
- approval;
- proof of client intent;
- permission to send;
- automatic execution.

## 3. Governing Defaults

```text
UNIVERSAL_CTA_REQUIRED=NO
TWO_OPTION_CLOSE_REQUIRED=NO
SPECIFIC_SCHEDULE_OPTIONS_REQUIRED=NO
PASSIVE_CLOSE_UNIVERSALLY_PROHIBITED=NO
CTA_SELECTION=CONTEXT_DEPENDENT
```

When the repository authorities do not define a rule for a specific tactic or context:

```text
POLICY_NOT_DEFINED
```

No commercial preference, sales style, legacy copy, or heuristic becomes mandatory merely because it may be useful in one context.

## 4. When a CTA May Be Used

A CTA may be recommended when:

- the conversation purpose is explicit;
- the underlying context and claims have sufficient evidence;
- the next step is within NASH and Advisor authority boundaries;
- the wording preserves uncertainty where relevant;
- the Prospect can decline, defer, correct, or choose another path;
- the CTA is proportionate to the relationship and conversation stage;
- privacy classification permits the supporting context;
- the Advisor can review, edit, reject, or omit it.

A CTA should be the smallest reasonable progression for the current context. It must not request a stronger commitment than the available evidence, relationship, consent, or stage supports.

## 5. When a CTA Must Not Be Used

NASH must recommend no CTA, validation, pause, or human review instead when:

- identity, consent, purpose, evidence, or relationship basis is materially unknown;
- the CTA would expose excluded or unauthorized information;
- it would imply invented intent, need, urgency, commitment, or consent;
- it would exploit fear, vulnerability, family, health, financial pressure, or trust;
- it would convert forecast, opportunity, referral, silence, or engagement into certainty;
- the Prospect has declined contact or requested a pause;
- the next step would require authority or execution not granted to Forge;
- the message would be more responsible without a requested action;
- no valid recommendation can be supported.

`NO_MESSAGE_RECOMMENDED`, `VALIDATION_NEEDED`, `HUMAN_REVIEW_NEEDED`, and a respectful close are valid outcomes.

## 6. Allowed CTA Objectives

Subject to context, evidence, privacy, and authority, a CTA may pursue:

1. `PERMISSION_TO_CONTINUE` — ask whether the Prospect wishes to continue.
2. `RESPONSE_INVITATION` — invite a non-coerced response.
3. `DISCOVERY_OR_CLARIFICATION` — ask a relevant question without presuming the answer.
4. `INFORMATION_REVIEW` — invite review of evidenced information.
5. `COMMITMENT_CONFIRMATION` — confirm or revise a previously evidenced commitment.
6. `CONVERSATION_COORDINATION` — propose coordinating a call or meeting without claiming it exists.
7. `VALIDATION_REQUEST` — request confirmation when context is uncertain.
8. `PAUSE_OR_DEFER` — leave space or propose returning later.
9. `RESPECTFUL_CLOSE` — close without pressure when continuation is not supported or desired.

This list defines permitted objectives, not mandatory copy or sequencing.

## 7. Conversation Types and Contextual Progression

| Conversation type | Appropriate progression | CTA boundary |
| --- | --- | --- |
| `FIRST_CONTACT` | Establish identity, basis for contact, and permission to continue | Prefer a low-commitment permission or response invitation. Do not presume relationship, need, interest, or consent. |
| `DISCOVERY` | Improve understanding through relevant questions | Use clarification or discovery questions. Do not turn hypotheses into facts or pressure for a product decision. |
| `INFORMATION_OR_EDUCATION` | Help the Prospect understand evidenced information | Invite review or questions. Do not promise outcomes or convert explanation into urgency. |
| `FOLLOW_UP` | Reconnect around an evidenced prior interaction or commitment | Confirm, revise, or release the prior next step. Silence is not consent or intent. |
| `OBJECTION_OR_FRICTION` | Understand and respond without manipulation | Prefer clarification, acknowledgement, or permission to continue. A close may be appropriate; overcoming the objection is not mandatory. |
| `APPOINTMENT_COORDINATION` | Explore a mutually acceptable conversation time | A scheduling invitation may be used. Two options or specific hours are optional tactics, never universal requirements. Opening a composer is not a saved appointment. |
| `REACTIVATION` | Re-establish relevance after elapsed time | Use a low-pressure response or permission CTA. Do not manufacture urgency from inactivity. |
| `COMMITMENT_CONFIRMATION` | Verify an evidenced commitment and its current validity | Ask to confirm, change, or cancel. Do not present an unverified commitment as binding. |
| `SENSITIVE_OR_UNCERTAIN` | Validate context or stop progression | Prefer validation, human review, or no message. Excluded data must not be surfaced. |
| `PAUSE_OR_CLOSE` | Respect a decline, insufficient evidence, or lack of fit | No CTA may be appropriate. Do not create a new pressure loop. |

## 8. Two-Option and Scheduling Boundary

Offering two choices may be useful in a specific Advisor-reviewed scheduling context, but it is not required by the Constitution or applicable ADRs.

```text
TWO_OPTION_CLOSE_POLICY=CONTEXTUAL_OPTION_NOT_REQUIREMENT
FIXED_SCHEDULE_OPTIONS_POLICY=CONTEXTUAL_OPTION_NOT_REQUIREMENT
```

NASH must not invent available times, claim calendar availability without evidence, or reduce the Prospect's choices artificially. The Prospect must remain able to suggest another time, defer, or decline.

## 9. Prospect Autonomy

Every recommended progression must preserve the Prospect's ability to:

- decline;
- defer;
- ask questions;
- correct context;
- propose another option;
- end the conversation;
- make personal, financial, and contractual decisions without pressure.

CTA wording must not:

- simulate certainty;
- use false urgency;
- hide alternatives;
- make refusal socially punitive;
- exploit relationship, trust, referral, fear, family, health, or financial vulnerability;
- imply that Forge, NASH, the Advisor, or a referrer has authority over the Prospect's decision.

## 10. Advisor Authority

The Advisor always retains authority to:

- select or reject the conversation objective;
- choose whether a CTA is appropriate;
- adapt or remove CTA wording;
- choose timing;
- offer one option, multiple options, an open question, or no CTA;
- request more evidence or context;
- pause or close the conversation;
- approve the exact message artifact;
- open or not open an external composer;
- send or not send.

NASH guidance must not become an obligatory script, metric, compliance mandate, or automated sales instruction.

## 11. Forge Prohibitions

Forge and NASH must never:

- require a CTA in every message;
- require a two-option close;
- invent scheduling options, commitments, consent, intent, need, or urgency;
- automatically contact, send, schedule, or record completion;
- treat CTA acceptance as product, policy, appointment, status, or revenue truth;
- continue progression after a decline without a new valid basis;
- use a CTA to bypass privacy classification, evidence, source ownership, freshness, or human approval;
- use manipulation, coercion, shame, artificial scarcity, or private vulnerability;
- decide for the Advisor or the Prospect.

## 12. Relationship to Privacy Policy 067G17N3

CTA generation may consume only context permitted by Policy 067G17N3 for the requested purpose.

A progression objective does not upgrade a field from `STRATEGY_ONLY`, `TONE_ONLY`, `TIMING_ONLY`, `SENSITIVE_EXCLUDE_BY_DEFAULT`, `PROHIBITED`, or `UNKNOWN_REQUIRES_POLICY` into direct-message copy.

When eligibility, evidence, verification, consent, freshness, or privacy is unknown, the safe result remains exclusion from direct message. Conversation progression may then become validation, human review, pause, or no message.

## 13. Decision Model

For a proposed CTA, NASH guidance must make reviewable:

- `CONVERSATION_TYPE`;
- `CTA_OBJECTIVE`;
- `WHY_THIS_NEXT_STEP`;
- `EVIDENCE_BASIS`;
- `UNCERTAINTY`;
- `ALTERNATIVES`;
- `PROSPECT_AUTONOMY_BOUNDARY`;
- `ADVISOR_AUTHORITY_BOUNDARY`;
- `HUMAN_APPROVAL_REQUIRED`.

If these cannot be established for a material progression:

```text
CTA_RECOMMENDATION=POLICY_NOT_DEFINED_OR_NOT_SUPPORTED
DEFAULT_PROGRESSION=VALIDATE_PAUSE_OR_NO_MESSAGE
```

## 14. Non-Authorization Boundary

This document authorizes no code, prompt template, message template, UI, test, schema, persistence, AI provider, external navigation, delivery, send, calendar action, status mutation, merge, or deployment.

## 15. Final Governance Ledger

```text
GOVERNANCE_ID=067G17N4_CTA_AND_CONVERSATION_PROGRESSION_GOVERNANCE
GOVERNANCE_VERSION=1.0.0
GOVERNANCE_STATUS=RATIFIED_GOVERNANCE
CTA_POLICY_DEFINED=YES_CONTEXT_DEPENDENT
UNIVERSAL_CTA_REQUIRED=NO
TWO_OPTION_CLOSE_REQUIRED=NO
SPECIFIC_SCHEDULE_OPTIONS_REQUIRED=NO
CONVERSATION_TYPES_DEFINED=YES
PROSPECT_AUTONOMY_PRESERVED=YES
ADVISOR_AUTHORITY_PRESERVED=YES
AUTOMATIC_EXECUTION_AUTHORIZED=NO
PRIVACY_POLICY_OVERRIDDEN=NO
WHEN_RULE_ABSENT=POLICY_NOT_DEFINED
```

# Forge NASH Prospect Message Context Contract 067G17N5

Status: `RATIFIED_CONTRACT`

Version: `1.0.0`

Stage: `067G17N5_PROSPECT_MESSAGE_CONTEXT_CONTRACT`

## 1. Purpose and Boundary

This contract defines the only Prospect Message Context projection that Pipeline may expose to NASH. Advisor OS Sales remains the owner and source of truth; NASH receives a purpose-limited, immutable projection and must not strengthen, persist, or reinterpret its authority.

This contract authorizes no draft generation, prompts, AI, UI, Pipeline integration, delivery, WhatsApp action, persistence, schema change, or external execution.

## 2. Contract Shape

```text
CONTRACT_TYPE=NASH_PROSPECT_MESSAGE_CONTEXT
CONTRACT_VERSION=1.0.0
PROSPECT_IDENTITY_REFERENCE=
ADVISOR_IDENTITY_REFERENCE=
CONTEXT_PURPOSE=
PROJECTED_AT=
FIELDS=[]
EXCLUDED_FIELDS=[]
```

Every member of `FIELDS` must preserve:

```text
FIELD=
OWNER=
SOURCE=
PURPOSE=
CLASSIFICATION=
REQUIRES_VERIFICATION=
REQUIRES_HUMAN_APPROVAL=
EVIDENCE=
VERIFICATION_STATUS=
FRESHNESS=
PRIVACY_CLASSIFICATION=
```

Allowed `VERIFICATION_STATUS` values are `VERIFIED`, `USER_ASSERTED`, `UNVERIFIED`, and `REVIEW_REQUIRED`. `USER_ASSERTED` is not `VERIFIED`.

## 3. Exposable Fields

Each row defines the complete static policy for that field. Runtime values must also carry the metadata in Section 2.

| FIELD | OWNER | SOURCE | PURPOSE | CLASSIFICATION | REQUIRES_VERIFICATION | REQUIRES_HUMAN_APPROVAL |
| --- | --- | --- | --- | --- | --- | --- |
| `prospectDisplayName` | Advisor OS Sales | Governed Prospect identity | Literal identification in reviewed copy | `DIRECT_MESSAGE_ALLOWED_IF_VERIFIED` | `YES` | `YES_EXACT_ARTIFACT` |
| `advisorDisplayName` | Advisor OS Sales | Authorized Advisor profile or authenticated identity | Literal Advisor identification in reviewed copy | `DIRECT_MESSAGE_ALLOWED_IF_VERIFIED` | `YES` | `YES_EXACT_ARTIFACT` |
| `verifiedReferrerName` | Relationship Intelligence / consent authority | Attributable referral claim with contact-sharing basis | Literal referral mention in reviewed copy | `DIRECT_MESSAGE_ALLOWED_IF_VERIFIED` | `YES_IDENTITY_CONSENT_AND_FRESHNESS` | `YES_EXACT_ARTIFACT` |
| `sourceType` | Advisor OS Sales | Governed source claim | Conversation strategy | `STRATEGY_ONLY` | `YES_SOURCE_LINEAGE` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `referrerRelationship` | Relationship Intelligence | Governed relationship evidence | Conversation strategy without literal assertion | `STRATEGY_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `occupation` | Advisor OS Sales | Governed, attributable Prospect fact | Conversation strategy without literal assertion | `STRATEGY_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `pipelineStatus` | Advisor OS Sales | Governed Pipeline status reference | Internal conversation strategy | `STRATEGY_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `goals` | Advisor OS Sales | Separately governed structured Prospect statement | Conversation strategy only | `STRATEGY_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `objections` | Advisor OS Sales | Separately governed structured Prospect statement | Conversation strategy only | `STRATEGY_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `conversationHistorySummary` | Advisor OS Sales | Governed structured summary with evidence references | Conversation strategy only | `STRATEGY_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `advisorSelectedTone` | Human Advisor | Explicit current selection | Wording style only | `TONE_ONLY` | `YES_CURRENT_SELECTION` | `YES_EXACT_ARTIFACT` |
| `communicationPreference` | Prospect / Advisor OS Sales | Evidenced Prospect preference | Wording style only | `TONE_ONLY` | `YES_PROVENANCE_AND_FRESHNESS` | `YES_EXACT_ARTIFACT` |
| `lastVerifiedActivityAt` | Advisor OS Sales | Governed activity evidence | Timing guidance only | `TIMING_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `appointmentHistory` | Advisor OS Sales | Governed appointment evidence | Timing guidance only | `TIMING_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |
| `confirmedCommitments` | Advisor OS Sales | Attributable conversation or event evidence | Timing guidance only | `TIMING_ONLY` | `YES` | `YES_EXACT_ARTIFACT_IF_MENTIONED` |
| `nextActionAt` | Advisor OS Sales | Governed next-action record | Timing guidance only | `TIMING_ONLY` | `YES` | `YES_IF_USED_TO_SHAPE_ARTIFACT` |

`STRATEGY_ONLY`, `TONE_ONLY`, and `TIMING_ONLY` values must never be copied literally into a message unless a separate ratified classification authorizes that exact direct-message use.

## 4. Excluded Fields

Pipeline must not expose these fields in this projection:

| FIELD | OWNER | SOURCE | PURPOSE | CLASSIFICATION | REQUIRES_VERIFICATION | REQUIRES_HUMAN_APPROVAL |
| --- | --- | --- | --- | --- | --- | --- |
| `initialContext` | Advisor OS Sales | Free text | None in this contract | `SENSITIVE_EXCLUDE_BY_DEFAULT` | `YES_SEPARATE_REVIEWABLE_EXTRACTION` | `YES_NOT_SUFFICIENT_ALONE` |
| `internalNotes` / `advisorNotes` | Advisor OS Sales | Free text | None in this contract | `SENSITIVE_EXCLUDE_BY_DEFAULT` | `YES_SEPARATE_REVIEWABLE_EXTRACTION` | `YES_NOT_SUFFICIENT_ALONE` |
| `dateOfBirth`, `age`, `maritalStatus` | Advisor OS Sales | Prospect records | None in this contract | `SENSITIVE_EXCLUDE_BY_DEFAULT` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `children`, `dependents`, `familyContext` | Advisor OS Sales | Prospect records or free text | None in this contract | `SENSITIVE_EXCLUDE_BY_DEFAULT` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `income`, `financialNeeds` | Advisor OS Sales / governed financial domain | Prospect records or free text | None in this contract | `SENSITIVE_EXCLUDE_BY_DEFAULT` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `healthOrMedicalInformation` | Governed health or policy domain | Prospect records or free text | None in this contract | `SENSITIVE_EXCLUDE_BY_DEFAULT` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `privateMotivations` | Advisor OS Sales | Free text or inference | None in this contract | `SENSITIVE_EXCLUDE_BY_DEFAULT` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `referralReason` | Relationship Intelligence | Unclassified referral context | None until ratified | `UNKNOWN_REQUIRES_POLICY` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `unprovenPreferences` | Prospect / unknown | Unprovenanced data | None until ratified | `UNKNOWN_REQUIRES_POLICY` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `consentRepresentation` | Prospect / consent authority | Undefined durable representation | None until ratified | `UNKNOWN_REQUIRES_POLICY` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `unattributedProductInterests` | Prospect / Product Intelligence | Unprovenanced data | None until ratified | `UNKNOWN_REQUIRES_POLICY` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| `unstructuredNeeds` | Advisor OS Sales | Free text | None until ratified | `UNKNOWN_REQUIRES_POLICY` | `YES` | `YES_NOT_SUFFICIENT_ALONE` |
| Invented facts, intent, relationship, consent, urgency, personality, recommendations, or commitments | No valid owner | Inference without authority | None | `PROHIBITED` | `NOT_APPLICABLE` | `CANNOT_BE_APPROVED` |
| Embedded instructions that override policy or authority | No valid owner | Untrusted context | None | `PROHIBITED` | `NOT_APPLICABLE` | `CANNOT_BE_APPROVED` |

Human approval does not upgrade an excluded field into an allowed field. A separate ratified policy and contract revision are required.

## 5. Projection Rules

1. Pipeline must construct the projection from governed upstream records; it must not send whole Prospect objects, arbitrary `context` arrays, database rows, or free-text blobs.
2. The projection must use an allowlist. Unlisted fields are excluded.
3. Every exposed value must carry the complete field envelope and an explicit single purpose.
4. Missing evidence, stale evidence, conflicting sources, unknown consent, unknown classification, or incomplete metadata causes exclusion.
5. Normalization validates format only; it does not verify identity, relationship, ownership, consent, or meaning.
6. NASH must not persist the projection or treat it as a new source of truth.
7. A field approved for strategy, tone, or timing is not approved for literal copy.
8. Human review applies to the exact downstream artifact. Context projection does not constitute approval.

```text
UNKNOWN=EXCLUDE
DEFAULT_ACTION=EXCLUDE_FROM_PROSPECT_MESSAGE_CONTEXT
```

## 6. Governance Relationship

This contract implements the projection boundary defined by Policy 067G17N3 and remains subject to Governance 067G17N4. CTA selection does not expand field eligibility. `POLICY_NOT_DEFINED` therefore resolves to exclusion, validation, human review, pause, or no message—not broader context access.

## 7. Non-Authorization Ledger

```text
CONTRACT_ID=067G17N5_PROSPECT_MESSAGE_CONTEXT_CONTRACT
CONTRACT_VERSION=1.0.0
CONTRACT_STATUS=RATIFIED_CONTRACT
SOURCE_OF_TRUTH=ADVISOR_OS_SALES
NASH_SOURCE_OF_TRUTH=NO
ALLOWLIST_REQUIRED=YES
UNKNOWN_EQUALS_EXCLUDE=YES
FREE_TEXT_EXPOSED=NO
DRAFT_GENERATION_AUTHORIZED=NO
PROMPT_GENERATION_AUTHORIZED=NO
AI_AUTHORIZED=NO
UI_AUTHORIZED=NO
PIPELINE_INTEGRATION_AUTHORIZED=NO
DELIVERY_AUTHORIZED=NO
WHATSAPP_AUTHORIZED=NO
PERSISTENCE_AUTHORIZED=NO
SCHEMA_CHANGE_AUTHORIZED=NO
HUMAN_APPROVAL_REQUIRED=YES
```

# Forge NASH Prospect Message Privacy and Field Classification Policy 067G17N3

Status: `RATIFIED_POLICY`

Version: `1.0.0`

Stage: `067G17N3_NASH_PROSPECT_MESSAGE_PRIVACY_AND_FIELD_CLASSIFICATION_POLICY`

## 1. Purpose and Scope

This policy governs which Prospect information NASH may consume when preparing conversation context or message drafts, for which purpose, and under which evidence, verification, freshness, privacy, and human-authority conditions.

This policy applies to future Prospect-message context projections and to any deterministic or optional-provider draft path that consumes them.

This policy does not authorize:

- Pipeline-to-NASH integration;
- message generation implementation;
- UI changes;
- database, schema, RLS, migration, or persistence changes;
- external AI providers;
- message delivery or sending;
- task or calendar creation;
- CTA or two-option-close policy;
- prompt, draft, or derived-context persistence.

## 2. Governing Authority

This policy is subordinate to the Forge Constitution and to applicable authority, evidence, conversation, and relationship boundaries, including ADR-004, ADR-010, and ADR-011.

The governing principles are:

- private Prospect data remains private;
- missing or unknown context does not become truth;
- a stored value is not automatically verified;
- a relationship signal is not consent;
- NASH may prepare, recommend, and draft, but does not decide or send;
- the Advisor retains final authority over external communication.

## 3. Ownership Boundary

### 3.1 Advisor OS Sales

Advisor OS Sales remains the owner of Prospect identity and Prospect data. It owns the governed identity reference, Advisor ownership, source lineage, and captured Prospect fields.

The governed Prospect identity contract remains the upstream authority. This policy does not create another Prospect identity, repository, persistence authority, or source of truth.

### 3.2 NASH

NASH owns conversation guidance, message framing, tone options, objection-response guidance, conversational timing, and message-draft composition within its authority boundary.

NASH may consume only a purpose-limited projection of Prospect context. NASH does not become the source of truth for identity, relationship, consent, product, policy, financial, medical, or client-intent facts.

NASH must not strengthen an input beyond the verification, evidence, freshness, consent, or confidence supplied by its owner.

### 3.3 Relationship and Consent

Relationship Intelligence remains the conceptual owner of relationship signals and referral context. The Prospect or other authorized human remains the authority for consent.

NASH must not infer permission to contact, permission to name a referrer, or client intent from a relationship signal.

### 3.4 Human Advisor

The Advisor owns the final choice to edit, regenerate, reject, postpone, approve, open an external composer, or not send a message.

## 4. Classification Vocabulary

Every field projected for Prospect-message use must have exactly one primary use classification for the requested purpose.

### `DIRECT_MESSAGE_ALLOWED_IF_VERIFIED`

The value may appear literally in a message only when its source, evidence, verification, freshness, privacy classification, and purpose are sufficient.

### `ROUTING_ONLY`

The value may select or address a communication channel but must not be inserted into message copy unless separately classified for direct-message use.

### `STRATEGY_ONLY`

The value may influence conversation approach, questions, or review guidance. It must not appear literally in message copy by default.

### `TONE_ONLY`

The value may influence style, formality, or wording intensity without introducing new factual claims.

### `TIMING_ONLY`

The value may influence when a communication is considered or how a confirmed commitment is reviewed. It must not become proof that an action occurred.

### `REQUIRES_EXPLICIT_ADVISOR_APPROVAL`

The value may appear only after the exact proposed use is visible to the Advisor and the Advisor explicitly approves the exact message artifact containing it.

### `SENSITIVE_EXCLUDE_BY_DEFAULT`

The value must be omitted from direct-message context and draft generation unless a separately governed purpose, sufficient evidence, applicable consent, and explicit Advisor approval authorize the exact use.

### `PROHIBITED`

The value or claim must not be used as message copy or as a basis for manipulation, invented truth, or unsupported certainty.

### `UNKNOWN_REQUIRES_POLICY`

The value must remain excluded until a separate ratified policy defines its owner, evidence, verification, freshness, privacy, consent, and permitted purpose.

## 5. Initial Field Policy

### 5.1 `DIRECT_MESSAGE_ALLOWED_IF_VERIFIED`

| Field | Required condition |
| --- | --- |
| Prospect name | The identity reference is current and the name is verified or explicitly confirmed by the Advisor for this contact. |
| Advisor identity | The identity comes from an authorized Advisor profile or authenticated identity source. A hardcoded or inferred relationship is insufficient. |
| Referrer name | The referral has evidence, the referrer identity is sufficiently verified, and a valid consent or contact-sharing basis permits literal mention. |

The phrase `Soy tu asesor` or an equivalent relationship claim is prohibited unless that relationship is separately verified.

### 5.2 `ROUTING_ONLY`

- normalized phone number;
- normalized WhatsApp destination;
- Prospect, Advisor, source-record, evidence, artifact, and delivery identifiers;
- internal correlation or idempotency identifiers.

Format validation does not prove that a phone or WhatsApp destination belongs to the intended Prospect. Routing must fail closed when the destination is missing, invalid, conflicting, or not authorized for the requested use.

### 5.3 `STRATEGY_ONLY`

- source;
- relationship with a referrer;
- occupation;
- Pipeline status or stage;
- goals or objectives;
- objections;
- conversation history.

Strategy-only information may guide questions or framing, but it must not be repeated as a fact, diagnosis, promise, or private disclosure.

### 5.4 `TONE_ONLY`

- tone explicitly selected by the Advisor;
- communication preference with evidence, provenance, and sufficient freshness.

Tone may change wording style. It must not add claims, alter verification status, broaden purpose, or trigger navigation, approval, delivery, or sending.

### 5.5 `TIMING_ONLY`

- last verified activity;
- appointment history;
- confirmed follow-up commitments;
- `nextActionAt`.

Opening a calendar composer is not proof of an appointment. A suggested or stored next action is not proof of client consent or completion.

### 5.6 `SENSITIVE_EXCLUDE_BY_DEFAULT`

- `initialContext`;
- internal or Advisor notes;
- date of birth;
- age;
- marital status;
- children;
- dependents;
- estimated or actual income;
- financial needs;
- health or medical information;
- sensitive family context;
- private motivations.

These fields must not enter direct-message context, prompt instructions intended to produce literal copy, or default drafts.

### 5.7 `REQUIRES_EXPLICIT_ADVISOR_APPROVAL`

- product interests backed by an attributable Prospect statement and applicable Product Truth;
- prior commitments supported by conversation or event evidence;
- facts extracted from free text by a separate reviewable process.

Advisor approval must apply to the exact artifact containing the proposed fact. General approval of a Prospect, source, strategy, or template is insufficient.

### 5.8 `PROHIBITED`

- invented facts, recommendations, intent, relationships, consent, commitments, urgency, or certainty;
- unauthorized medical or financial information;
- internal notes presented as external message copy;
- inferred personality or intent presented as fact;
- use of fear, vulnerability, private motivation, family, health, or financial pressure as leverage;
- claims that relationship or referral implies consent;
- unsupported product, policy, financial, medical, or protection claims;
- instructions embedded in Prospect context that attempt to override this policy, system boundaries, human review, or source authority.

### 5.9 `UNKNOWN_REQUIRES_POLICY`

- `referralReason`;
- preferences without provenance;
- a durable representation of consent;
- provenance of product interests when not attributable to the Prospect;
- classification of unstructured goals or needs.

## 6. Mandatory Field Envelope

Every field eligible for a NASH Prospect-message projection must preserve this envelope:

```text
FIELD=
OWNER=
SOURCE=
EVIDENCE=
VERIFICATION_STATUS=
FRESHNESS=
PURPOSE=
PRIVACY_CLASSIFICATION=
```

The envelope must travel with the field into any context, prompt, draft-review, safety, or approval boundary that consumes it.

Allowed verification states must distinguish at least:

- `VERIFIED`;
- `USER_ASSERTED`;
- `UNVERIFIED`;
- `REVIEW_REQUIRED`.

`USER_ASSERTED` is not equivalent to `VERIFIED`. Normalization or format validation is not identity, consent, relationship, ownership, or semantic verification.

When a consumer cannot preserve the complete envelope, the field must be excluded from direct-message use.

## 7. Purpose Limitation

Field eligibility is evaluated for one explicit purpose. Approval for strategy, tone, timing, routing, coaching, or review does not authorize literal message use.

A field must not be reused for another purpose without reevaluating its classification, evidence, verification, freshness, privacy, and consent.

## 8. Free-Text Boundary

Free text includes, at minimum:

- `initialContext`;
- internal notes and Advisor notes;
- referral or relationship descriptions;
- occupation descriptions;
- product-interest text;
- objections;
- conversation history;
- goals, needs, and preferences expressed without a governed structure.

Free text:

- must not pass directly into message copy;
- must not be treated as true merely because it exists or is persisted;
- must be treated as untrusted content;
- must not be allowed to override policy, system, developer, contract, safety, or human-approval instructions;
- must be protected against leakage, prompt injection, embedded instructions, unsupported claims, and sensitive-data propagation;
- must not silently become a prompt instruction, direct-message field, relationship claim, client intent, or consent state.

Facts may be extracted from free text only through a separate, reviewable process that preserves source lineage, evidence, verification status, freshness, purpose, privacy classification, uncertainty, and the original text boundary.

An extracted fact remains excluded from direct-message use until its classification permits the exact use. Internal notes must never become message copy automatically.

## 9. Referral Boundary

The value `source=Referido` does not prove:

- the identity of the referrer;
- consent from the referrer;
- consent from the Prospect;
- permission to mention the referrer's name;
- the relationship between the parties;
- the content or purpose of the referral;
- that the referral is current;
- a valid contact-sharing basis.

A literal referral sentence requires:

- an attributable referral source claim;
- sufficient referrer identity verification;
- evidence supporting the contact-sharing basis;
- applicable consent status;
- sufficient freshness;
- explicit message purpose;
- compliance with Relationship Intelligence non-manipulation boundaries;
- review of the exact message artifact.

When any requirement is unknown, the referral sentence must be omitted.

## 10. Human Authority and Exact Artifact Rule

NASH may prepare context, recommend language, explain reasoning, and produce a draft within approved boundaries.

The Advisor may:

- edit;
- regenerate;
- request changes;
- reject;
- postpone;
- choose another tone;
- approve the exact artifact;
- open an external composer;
- not send.

A prompt is not a draft. A draft is not approved communication. Safety validation is not human approval. Approval for delivery preparation is not approval for automatic sending.

Human authorization applies only to the exact artifact reviewed. Any material edit, regeneration, context change, destination change, or policy-relevant change invalidates prior approval and requires renewed safety review and human approval.

No approval created under this policy may trigger automatic navigation, provider execution, message sending, task creation, calendar creation, status mutation, or persistence.

## 11. AI Boundary

External AI is not required for NASH Prospect-message composition.

A future AI provider, if separately authorized, must:

- operate behind a dedicated provider and privacy boundary;
- receive only the minimum purpose-limited context;
- never receive `SENSITIVE_EXCLUDE_BY_DEFAULT`, `PROHIBITED`, or unresolved `UNKNOWN_REQUIRES_POLICY` fields;
- treat all external and free-text context as untrusted;
- preserve evidence, verification, freshness, privacy, and purpose metadata;
- produce only a draft candidate;
- fail closed when the deterministic, privacy, evidence, or approval contract cannot be satisfied.

This policy authorizes no AI provider, credentials, scopes, network calls, or data transfer.

## 12. CTA Boundary

```text
UNIVERSAL_CTA_POLICY=NOT_DEFINED_BY_THIS_DOCUMENT
TWO_OPTION_CLOSE_POLICY=NOT_DEFINED_BY_THIS_DOCUMENT
```

This privacy policy must not convert a commercial preference, sales style, CTA, two-option close, passive-close rule, or conversation-progression preference into a privacy requirement.

CTA and conversation progression require a separate governance decision.

## 13. Persistence Boundary

This policy does not authorize persistence of:

- prompt instructions;
- drafts;
- edited drafts;
- safety results;
- approval artifacts;
- derived message context;
- extracted free-text facts;
- provider inputs or outputs.

Any future persistence requires a separate stage defining owner, purpose, retention, deletion, correction, privacy, audit, access control, schema, RLS, and evidence boundaries.

## 14. Safe Default

When classification, ownership, evidence, verification, consent, freshness, purpose, or privacy classification is absent, conflicting, stale, untrusted, or unknown:

```text
DEFAULT_ACTION=EXCLUDE_FROM_DIRECT_MESSAGE
```

Unknown remains unknown. Exclusion does not convert the field to false, zero, absent truth, or negative evidence. The system may request review or evidence but must not silently weaken this default.

## 15. Required Consumer Behavior

Any future Pipeline-to-NASH adapter, context projection, prompt builder, draft generator, safety validator, preview, approval gate, delivery adapter, or provider adapter consuming Prospect data must:

1. preserve Advisor OS Sales ownership;
2. consume a limited projection rather than the full Prospect record;
3. enforce the classification for the requested purpose;
4. preserve the mandatory field envelope;
5. exclude free text and sensitive fields by default;
6. fail closed on unknown or stale eligibility;
7. keep routing data separate from copy;
8. preserve exact-artifact review and reapproval after changes;
9. produce no automatic external action;
10. create no new Prospect, consent, relationship, product, policy, financial, medical, status, delivery, or send truth.

## 16. Acceptance Rules

This policy is satisfied only when a future implementation proves:

- no full Prospect record is passed to NASH or an external provider;
- every eligible field has the mandatory envelope;
- direct copy contains only permitted and sufficiently verified fields;
- routing identifiers cannot enter copy accidentally;
- free text cannot become copy or executable instruction automatically;
- referral language fails closed without evidence and consent basis;
- sensitive fields are excluded by default;
- edits invalidate prior artifact approval;
- human review remains mandatory;
- no AI, navigation, send, calendar, task, status, database, or persistence action occurs automatically.

## 17. Final Policy Ledger

```text
POLICY_ID=067G17N3_NASH_PROSPECT_MESSAGE_PRIVACY_AND_FIELD_CLASSIFICATION_POLICY
POLICY_VERSION=1.0.0
POLICY_STATUS=RATIFIED_POLICY
PROSPECT_IDENTITY_OWNER=ADVISOR_OS_SALES
CONVERSATION_COMPOSITION_OWNER=NASH
NASH_SOURCE_OF_TRUTH=NO
LIMITED_CONTEXT_PROJECTION_REQUIRED=YES
DIRECT_MESSAGE_VERIFICATION_REQUIRED=YES
FREE_TEXT_TRUSTED=NO
FREE_TEXT_DIRECT_COPY_ALLOWED=NO
SENSITIVE_DEFAULT_EXCLUSION=YES
REFERRAL_REQUIRES_EVIDENCE_AND_CONSENT_BASIS=YES
EXACT_ARTIFACT_APPROVAL_REQUIRED=YES
AUTOMATIC_SEND_AUTHORIZED=NO
EXTERNAL_AI_REQUIRED=NO
EXTERNAL_AI_AUTHORIZED=NO
PERSISTENCE_AUTHORIZED=NO
UNIVERSAL_CTA_POLICY=NOT_DEFINED_BY_THIS_DOCUMENT
TWO_OPTION_CLOSE_POLICY=NOT_DEFINED_BY_THIS_DOCUMENT
DEFAULT_ACTION=EXCLUDE_FROM_DIRECT_MESSAGE
```

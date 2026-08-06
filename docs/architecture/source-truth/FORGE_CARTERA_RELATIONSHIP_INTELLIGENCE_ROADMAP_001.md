# FORGE CARTERA — RELATIONSHIP INTELLIGENCE ROADMAP 001

Forge OS  
Architecture Source Truth  
Cartera / Portfolio Post-Sale Experience

## Status

PROGRAM REGISTERED / DOCUMENTATION ACTIVE / IMPLEMENTATION NOT STARTED

## Date

2026-07-30

## Canonical Planning Registration

This program is registered in:

- `docs/roadmap/FORGE_ROADMAP_LOCK_001.md`
- `FORGE_MASTER_BUILD_TREE.md`
- `docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md`

The registered immediate implementation target is:

- `CARTERA_001_PIPELINE_QUOTE_PERSON_TIMELINE_CONTINUITY`

Later phases remain planned and require their own bounded authorization, discovery, implementation evidence, tests and closure.

## Codex Execution Gate

A Codex implementation task is in scope only when all of the following are true:

1. The requested phase exists in the Roadmap Lock, Master Build Tree and Unified Build Tree.
2. The phase is explicitly marked `NEXT` or otherwise separately execution-authorized.
3. The task begins with repository discovery and reusable-asset mapping.
4. The implementation preserves the domain ownership and human-confirmation boundaries in this document.
5. Completion is supported by tests, evidence and a closure or decision lock.

Roadmap presence authorizes planning visibility; it does not by itself prove implementation or authorize every later phase.

## Canonical Program Identifiers

- `CARTERA_000_DOCUMENTATION_AND_GOVERNANCE`
- `CARTERA_001_PIPELINE_QUOTE_PERSON_TIMELINE_CONTINUITY`
- `CARTERA_010_CONTROL_BASE_AND_EXISTING_ASSET_DISCOVERY`
- `CARTERA_020_DOCUMENT_INTAKE_AND_IDENTITY_RESOLUTION`
- `CARTERA_030_POLICY_AND_PAYMENT_CALENDAR`
- `CARTERA_040_RELATIONSHIP_MEMORY_AND_NETWORK_CONTEXT`
- `CARTERA_050_FUTURE_RADAR_AND_CONSERVATION`
- `CARTERA_060_RELATIONSHIP_GROWTH_INTELLIGENCE`
- `CARTERA_070_CANDY_CRUSH_RELATIONAL_ACTIVATION`
- `CARTERA_080_EMAIL_PAYMENT_AND_COMPENSATION_CONNECTION`
- `CARTERA_090_RELATIONSHIP_CAPITAL`
- `CARTERA_100_PRODUCTIVITY_PROOF_AND_LEARNING`

## Architectural Objective

> Help the advisor sell 30% more without working 30% more.

## Official Relationship Principle

> Forge does not administer clients or policies as isolated records. Forge administers relationships, understands their context and anticipates their evolution so the advisor can invest time where it creates the greatest value.

## Copilot Principle

Forge is a copilot, never an autopilot.

Forge may:

- observe;
- connect evidence;
- identify possible matches;
- project future events;
- explain risks and opportunities;
- propose the next useful action;
- prepare the advisor to act.

Forge must not, without the required human confirmation:

- merge identities;
- create a new canonical person when a possible match exists;
- confirm payments;
- change policy truth;
- create commercial opportunities;
- send final messages;
- infer consent;
- turn a life event into an automatic sales trigger;
- execute contact.

---

# 1. Repository Authority Alignment

This roadmap does not create a new Relationship Intelligence domain and does not replace existing authorities.

It operationalizes Cartera as the advisor-facing post-sale experience and workflow over existing canonical domains.

## Required references

- `adr/ADR-011 — Relationship Intelligence Non-Manipulation Boundary.txt`
- `docs/02-adr-candidates/ADR-0026_RELATIONSHIP_GRAPH_PRIMARY_COMMERCIAL_ASSET.md`
- `docs/03-discoveries/consolidated/RELATIONSHIP_INTELLIGENCE_CANONICALIZATION.md`
- `docs/02-adr-candidates/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md`
- Event & Evidence source-truth contracts.
- Pipeline and Prospect Timeline source-truth contracts.
- Policy Intelligence authority contracts.
- Compensation Intelligence authority contracts.

## Authority boundaries

### Cartera owns

- the advisor-facing portfolio experience;
- post-sale workflow orchestration;
- portfolio and relationship read models;
- identity-resolution review surfaces;
- document-import review workflow;
- payment-confirmation workflow;
- future portfolio radar presentation;
- service and relationship-strengthening action surfaces.

### Cartera does not own

- canonical person identity truth;
- canonical relationship graph truth;
- Policy Truth;
- Product Truth;
- compensation formulas;
- conservation formulas;
- final NBA priority truth;
- NASH final message;
- client intent;
- client consent;
- autonomous contact execution.

### Existing domain ownership

- Canonical identity and relationship graph: Shared Intelligence / Relationship Graph authority.
- Relationship signals and interpretation: Relationship Intelligence.
- Opportunity lifecycle: Pipeline.
- Quote facts and versions: Quote Intelligence.
- Policy facts, parties, status and coverage: Policy Intelligence.
- Append-only facts and evidence: Event & Evidence.
- Policy quality and persistency: Conservation Intelligence.
- Commission interpretation: Compensation Intelligence.
- Priority recommendation: Alfred / NBA authority.
- Conversation preparation: NASH.
- Daily action execution surface: Candy Crush / Advisor Experience.

---

# 2. Identity Continuity Contract

## Canonical continuity rule

The existing `prospect_uuid` remains the continuity identifier for the known person throughout the commercial relationship.

The roadmap does not require a destructive rename of the existing database identifier.

Conceptually, the same person may evolve through:

```text
prospect
→ active opportunity
→ quoted person
→ applicant
→ policyholder / insured / beneficiary
→ client relationship
→ renewal
→ service
→ second opportunity
```

This lifecycle must not create a second person record.

## Entity rule

Each business object keeps its own identifier:

- `prospect_uuid` / canonical person reference;
- `quote_id`;
- `application_id`;
- `policy_id`;
- `payment_obligation_id`;
- `payment_id`;
- `commission_event_id`;
- `relationship_event_id`;
- `opportunity_id`.

Those objects attach to the same canonical person and relationship graph.

## Multi-party policy rule

A policy may involve several people with different roles.

Required relational roles may include:

- policyholder;
- insured;
- additional insured;
- beneficiary;
- payer;
- owner;
- dependent;
- business partner.

A policy must not force all parties into one person field.

---

# 3. Identity Resolution Before Creation

## Official rule

> Forge never creates a new person before attempting to prove that the person does not already exist.

## Identity resolution flow

```text
new document or evidence
→ extract identity attributes
→ search existing people and relationships
→ rank possible matches
→ explain match evidence
→ advisor confirms link or new identity
→ persist auditable decision
```

## Example

After scanning a policy, Forge may ask:

> Maria Perez appears to match the person you met on July 18. The name, phone number and quoted product coincide. Is this the same person?

Available actions:

- Link to existing person.
- Review candidate.
- It is another person.
- Edit extracted data.
- Leave unresolved.

## Match evidence

Possible match evidence includes:

- normalized name;
- phone;
- email;
- birth date;
- tax identifier when legally permitted;
- quoted product;
- recent appointment;
- application or policy reference;
- referral source;
- household relationship;
- company relationship;
- document evidence.

Name equality alone is never sufficient for automatic identity fusion.

## Auditability

Every identity-resolution decision must preserve:

- source document or event;
- candidate identities;
- matching evidence;
- confidence or uncertainty;
- advisor decision;
- timestamp;
- actor;
- reversible merge history when supported.

---

# 4. Product Definition

## What Cartera is

Cartera is the advisor-facing post-sale relationship and portfolio operating surface.

It transforms a static database into a system that helps the advisor:

- know what is in force;
- know what is expected to happen;
- know what requires attention;
- preserve policy and relationship value;
- identify natural growth opportunities;
- strengthen centers of influence;
- act with less administrative work.

## What Cartera is not

Cartera is not:

- a disconnected client table;
- a second Pipeline;
- a duplicate CRM identity store;
- a replacement for Policy Intelligence;
- a replacement for Conservation Intelligence;
- an autonomous sales bot;
- a black-box customer score;
- a mechanism to exploit personal events.

## Core user question

A traditional CRM asks:

> What happened?

Cartera must also answer:

> What is likely to happen with my relationships, why, and what is the smallest useful action I can take before it happens?

---

# 5. Roadmap

# Point 0 — Documentation and Governance

## Goal

Lock the contracts required before implementation.

## Required work

- Ratify this roadmap.
- Ratify the official relationship principle.
- Ratify Identity Resolution Before Creation.
- Map domain ownership.
- Define Copilot confirmation boundaries.
- Define the Pipeline-to-Cartera lifecycle.
- Define Timeline event continuity.
- Define evidence, uncertainty and freshness requirements.
- Define privacy and non-manipulation boundaries.

## Exit gate

Implementation may begin only when identity, ownership, evidence, event and human-confirmation contracts are explicit.

---

# Point 0.1 — Pipeline and Quote Continuity

## Goal

Repair the current break where quote activity may remain isolated from the person history in Pipeline.

## Required implementation

Each quote must retain:

- canonical person reference;
- `quote_id`;
- product;
- version;
- date;
- status;
- origin;
- result;
- evidence reference.

## Required events

- `QUOTE_CREATED`
- `QUOTE_UPDATED`
- `QUOTE_RECALCULATED`
- `QUOTE_PRESENTED`
- `QUOTE_ACCEPTED`
- `QUOTE_REJECTED`
- `QUOTE_CONVERTED_TO_APPLICATION`

## Pipeline projection

Prospect Detail must display the commercial meaning of the quote history without duplicating Quote Intelligence truth.

## Exit gate

Opening a person in Pipeline must reconstruct the story from first contact through quote decision and application progression.

---

# Point 1 — Cartera as Control Base

## Goal

Create a trustworthy post-sale control surface before adding prediction.

## Capabilities

- Unified client and policy directory.
- Person, household and organization relationships.
- Policy list by person.
- Policy parties and roles.
- Current policy status projection.
- Next relevant date.
- Document availability.
- Search by person, phone, email, policy, company, product, referral or relationship.

## Relationship roles

A person may simultaneously be:

- prospect;
- client;
- policyholder;
- insured;
- beneficiary;
- payer;
- referrer;
- referred person;
- center of influence;
- family member;
- business partner.

No role creates a duplicate identity.

## Value generated

- less fragmented information;
- faster retrieval;
- fewer duplicates;
- better portfolio visibility;
- lower cognitive load.

## Exit gate

The advisor can find any known person or policy in seconds and understand the basic relationship with the practice.

---

# Point 2 — Portfolio Intake Without Data Entry

## Goal

Prevent Cartera from becoming another administrative burden.

## Primary flow

```text
policy PDF
→ document extraction
→ proposed policy data
→ identity resolution
→ human review
→ confirmed persistence
```

## Bulk import

Drag and drop may accept multiple files, but processing must remain governed:

```text
queued
→ processing
→ candidate data ready
→ identity review
→ data review
→ confirmed
→ stored
```

Documents are processed one by one for review even when they enter as a batch.

## Minimum extraction target

- carrier;
- product;
- policy number;
- policyholder;
- insured parties;
- beneficiaries when available;
- issue date;
- effective period;
- premium;
- currency;
- payment frequency;
- payment method;
- coverage data;
- source location for extracted fields.

## Manual fallback

Manual entry remains available only when reliable documents are unavailable or extraction cannot resolve the required fields.

## Value generated

- hours of capture avoided;
- fewer transcription errors;
- faster portfolio onboarding;
- higher user adoption.

## Exit gate

An advisor can import an initial portfolio without manually capturing each policy.

---

# Point 3 — Policy and Payment Calendar

## Goal

Transform control data into future operational visibility.

## Required projections

From policy truth and payment terms, generate:

- expected payment obligations;
- anniversary dates;
- renewals;
- policy-year transitions;
- grace periods when supported by official rules;
- recommended review windows.

## Payment obligation ledger

Each expected obligation must preserve:

- policy reference;
- expected date;
- expected amount when known;
- frequency;
- policy year;
- status;
- detected evidence;
- actual date;
- actual amount;
- confirmation state.

## Minimum states

- scheduled;
- upcoming;
- detected;
- confirmation required;
- confirmed;
- partial;
- overdue;
- not found;
- corrected;
- cancelled.

## Value generated

- fewer missed payments;
- fewer preventable lapses;
- stronger conservation;
- better future-income visibility.

## Exit gate

Forge can answer what should be paid, renewed or reviewed in the next 7, 30 and 90 days.

---

# Point 4 — Relationship Memory

## Goal

Move from policy administration to contextual relationship understanding.

## Unified relationship history

The person timeline may project:

- origin and referral;
- appointments;
- needs;
- objections;
- quotes;
- decisions;
- applications;
- policies;
- payments;
- service interactions;
- annual reviews;
- confirmed relevant life context;
- new opportunities.

## Relationship preferences

Evidence-backed preferences may include:

- preferred contact channel;
- appropriate contact times;
- decision participants;
- explanation style;
- unresolved commitments;
- service expectations.

## Life-context boundary

Life events may provide context only when evidence, sensitivity and consent boundaries are respected.

A life event is not an automatic sales trigger.

## Value generated

- less repeated questioning;
- more relevant service;
- stronger trust;
- better prepared conversations.

## Exit gate

Before contact, the advisor can understand the relationship history and current context without reviewing disconnected notes.

---

# Point 5 — Future Radar

## Goal

Make Cartera explain what is coming, not only what exists.

## Required horizons

- today;
- next 7 days;
- next 30 days;
- next 90 days.

## Future signals

- expected payments;
- renewals;
- possible late payments;
- unconfirmed payment evidence;
- policy-year changes;
- policies requiring service;
- relationships without recent review;
- incomplete documents;
- conservation risks from Conservation Intelligence;
- expected commission events from Compensation Intelligence.

## Explainability contract

Every future item must distinguish:

- confirmed fact;
- scheduled event;
- detected evidence;
- inference;
- recommendation.

Every recommendation must answer:

- Why this person?
- Why now?
- What evidence supports it?
- What is uncertain?
- What is the smallest useful action?
- What must the advisor confirm?

## Value generated

- earlier action;
- fewer surprises;
- better weekly planning;
- reduced mental load.

## Exit gate

The advisor can identify the few actions that can materially change portfolio outcomes.

---

# Point 6 — Relationship Growth Intelligence

## Goal

Detect natural opportunities inside existing relationships without treating people as inventory.

## Opportunity classes

### Second-policy review

Possible evidence:

- confirmed new responsibility;
- protection gap;
- time since original policy;
- unresolved need from Pipeline;
- service or annual review context;
- client-requested review.

### Protection review

Possible evidence:

- stale beneficiary information;
- known income or dependent change;
- product or coverage gap;
- outdated review;
- client request.

### Referral relationship

Possible evidence:

- prior referral with consent;
- strong service history;
- reciprocal engagement;
- explicit willingness to introduce;
- appropriate relationship timing.

### Center of influence

Example output:

> Karla may be a valuable relationship to strengthen. Her renewal is still three months away, but the relationship is active, she has previously connected you with others and her professional network is relevant. Consider scheduling an early relationship review. This is not a referral request or sales instruction.

## Guardrail

Forge proposes relationship-strengthening opportunities.

It does not assume that a person will buy, refer or authorize contact with another person.

## Value generated

- more warm opportunities;
- higher conversion probability;
- higher client lifetime value;
- less dependence on cold prospecting.

## Exit gate

Every opportunity is evidence-backed, ethically bounded and explains why this relationship and why this moment.

---

# Point 7 — Candy Crush Relational Activation

## Goal

Turn portfolio intelligence into small, high-value daily actions.

## Low-activity behavior

When advisor activity is low, Candy Crush must not create generic volume for its own sake.

It should identify the relationships where a small action can create the greatest value.

## Action classes

- confirm a payment;
- prepare a renewal;
- schedule a review;
- resolve missing context;
- request required documentation;
- recover an appropriate relationship;
- review a possible second-policy need;
- strengthen a center of influence;
- thank a referrer;
- complete a service commitment.

## Prioritization inputs

Candy Crush may consume reviewed signals concerning:

- urgency;
- conservation impact;
- economic impact;
- relationship health;
- response probability;
- growth potential;
- required effort;
- evidence quality;
- consent state.

Priority authority remains outside Cartera where required by NBA governance.

## Minimum useful action

Each card must propose one bounded next step:

- review;
- confirm;
- call;
- send for advisor approval;
- schedule;
- prepare;
- document.

## Value generated

- less time deciding what to do;
- greater production per hour;
- more useful use of open calendar time;
- stronger relationships without artificial activity inflation.

## Exit gate

Candy Crush can fill a free hour with a small number of high-impact, evidence-backed actions instead of generic tasks.

---

# Point 8 — Email, Payment Detection and Compensation Connection

## Goal

Close the post-sale economic loop without requiring repeated manual capture.

## Email detection

Forge may detect messages related to:

- payment confirmation;
- successful charge;
- issue confirmation;
- renewal;
- rejection;
- refund;
- cancellation;
- reinstatement.

## Required flow

```text
email evidence detected
→ possible person and policy match
→ explanation
→ advisor confirmation or correction
→ payment/event persistence
→ downstream projections
```

## Payment confirmation example

> I found a payment of $4,250 that may correspond to Maria's July obligation. Do you confirm the policy, amount and payment period?

## Compensation event

After confirmation, the payment event may provide Compensation Intelligence with:

- policy reference;
- product reference;
- policy year;
- payment amount;
- payment date;
- frequency;
- rule-pack reference.

Cartera must not calculate an unsupported commission percentage.

## Value generated

- less inbox review;
- fewer missing payments;
- better commission control;
- less duplicate data entry.

## Exit gate

A confirmed payment updates the relevant event, payment, compensation and portfolio projections without recapture.

---

# Point 9 — Relationship Capital and Network Context

## Goal

Understand the advisor's commercial network without converting trust into leverage.

## Graph projections

Cartera may present reviewed graph relationships such as:

- referred by;
- referred person;
- family;
- household;
- company;
- partner;
- team;
- professional community;
- center-of-influence hypothesis;
- prior introduction.

## Influence evidence

Possible evidence may include:

- previous introductions;
- confirmed leadership role;
- relevant professional network;
- relationship continuity;
- reciprocal engagement;
- client-confirmed willingness to help.

No opaque influence score may be treated as truth.

## Value generated

- more contextual introductions;
- better relationship maintenance;
- stronger organic growth;
- lower dependence on cold lists.

## Exit gate

Forge can explain which relationships may deserve strengthening even when no immediate sale or renewal is due.

---

# Point 10 — Productivity Proof and Learning

## Goal

Demonstrate that Cartera contributes to selling more without proportionally increasing work.

## Work-reduction metrics

- policies imported automatically;
- fields extracted;
- hours of capture avoided;
- identity duplicates prevented;
- payment emails detected;
- administrative tasks eliminated;
- average review time per imported policy.

## Income-protection metrics

- payments confirmed before risk;
- renewals attended;
- possible lapses surfaced;
- commission discrepancies detected;
- conservation actions completed.

## Growth metrics

- second-policy opportunities reviewed;
- relationship reviews completed;
- warm opportunities created;
- consented referrals obtained;
- centers of influence strengthened;
- opportunities returned to Pipeline.

## Productivity metrics

- production per advisor hour;
- accepted recommendations;
- completed minimum useful actions;
- response rate;
- conversion rate;
- time from signal to action.

## Learning boundary

Forge may learn which evidence-backed recommendations are useful.

It must not learn manipulation patterns, infer permission from silence or optimize for contact volume alone.

## Exit gate

Cartera can report a statement such as:

> This month Forge avoided X hours of administrative work, protected Y in expected value and surfaced Z reviewed growth opportunities.

---

# 6. Delivery Sequence

## Delivery 1 — Control

Includes:

- Point 0;
- Point 0.1;
- Point 1;
- Point 2.

User outcome:

> My portfolio is unified and I can load it without capturing every policy manually.

## Delivery 2 — Anticipation

Includes:

- Point 3;
- Point 4;
- Point 5.

User outcome:

> I know what is expected to happen with my policies and relationships.

## Delivery 3 — Growth

Includes:

- Point 6;
- Point 7.

User outcome:

> Forge helps me choose where to invest my time to preserve and grow relationships.

## Delivery 4 — Assisted Connection

Includes:

- Point 8;
- Point 9.

User outcome:

> Forge connects evidence, payments, compensation and relationship context without taking control away from me.

## Delivery 5 — Optimization

Includes:

- Point 10.

User outcome:

> Forge proves that I am producing more value with the same or less administrative effort.

---

# 7. Feature Acceptance Filter

A feature belongs in Cartera only when it satisfies at least one of these outcomes:

1. Reduces data entry or administrative work.
2. Protects a policy, payment, commission or relationship.
3. Improves service or relationship quality.
4. Identifies a responsible growth opportunity.
5. Helps the advisor prioritize time better.

A recommendation may not ship unless it answers:

- Why this person?
- Why now?
- What evidence exists?
- What uncertainty remains?
- What is the smallest useful action?
- What human confirmation is required?

---

# 8. Final Architectural Test

Cartera succeeds when it no longer behaves as a database that waits for the advisor to query it.

It must become a governed relationship copilot that:

- remembers the complete commercial history;
- prevents duplicate identities;
- projects policy and relationship events;
- protects conservation and income;
- identifies responsible growth opportunities;
- strengthens relationship capital;
- returns new opportunities to Pipeline;
- reduces administrative work;
- preserves advisor authority.

The final test is not how many records Cartera stores.

The final test is whether the advisor can create more commercial value with the same time, better context and fewer avoidable tasks.

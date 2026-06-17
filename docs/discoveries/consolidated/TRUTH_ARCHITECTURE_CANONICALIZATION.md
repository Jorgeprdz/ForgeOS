# Truth Architecture Canonicalization

Status: ACCEPTED WITH GOVERNANCE EDITS
Phase: Consolidation
Date: 2026-06-16
Source: Consolidated book discovery analysis
Classification: Canonical Discovery Artifact

---

# Executive Summary

This document consolidates Truth Architecture discoveries extracted from five external sales research reviews.

Sources:

- Fanatical Prospecting
- Predictable Revenue
- The Conversion Code
- The Sales Development Playbook
- The Qualified Sales Leader

Result:

- Constitution Changes: NONE
- New ADRs: NONE
- Discovery Count Reduced: 24 fragmented discoveries into canonical engines
- Primary Domains:
  - Truth Architecture
  - Relationship Intelligence
  - Process Intelligence

This artifact does not implement code.

This artifact does not create ADRs.

This artifact preserves the Constitution as LOCKED.

---

# Governance Notes

## Do Not Delete Source Discoveries

The five original book discovery files must remain preserved as evidence.

They may later be moved from:

docs/discoveries/todo/books/

to:

docs/discoveries/archived/books/

But they should not be deleted.

Principle:

Never delete evidence.

---

## No Automatic Blocking

Any language implying that Forge automatically blocks a human decision must be avoided.

Forge may:

- restrict confidence
- reduce priority
- require evidence
- request human override
- recommend re-validation
- warn about risk

Forge must not remove human accountability.

This preserves ADR-001 Judgment Boundary.

---

## No Automatic Purging

Dead or zombie opportunities must not be automatically deleted.

Forge may:

- classify as dormant
- classify as zombie
- lower forecast confidence
- recommend close-lost review
- recommend reactivation
- request human override

Forge must preserve historical traceability.

---

# Consolidated Policies

## EVIDENCE_FIRST_POLICY

Claims about opportunities, prospects, relationships, forecasts, qualification, or process advancement should be supported by evidence.

Unsupported claims may still be recorded, but must be marked as unverified.

Forge should not treat unverified claims as operational truth.

Related ADRs:

- ADR-001 Judgment Boundary
- Data Provenance Model
- Truth Resolution

Status:

POLICY CANDIDATE

Priority:

CRITICAL

---

## MULTI_SOURCE_VALIDATION_POLICY

Critical truths should be inferred from multiple independent sources whenever possible.

The isolated opinion of an advisor does not constitute multi-source validation.

Examples of independent sources:

- prospect statement
- client action
- signed document
- payment
- meeting attendance
- CRM event
- third-party confirmation
- underwriting response
- carrier status
- manager review

Related ADRs:

- ADR-002 Trust Model
- Data Provenance Model
- Truth Resolution

Status:

POLICY CANDIDATE

Priority:

CRITICAL

---

## SHARED_ONTOLOGY_POLICY

Forge should use shared definitions for commercial and operational states.

Subjective labels must not replace canonical definitions.

Examples requiring shared definitions:

- qualified prospect
- champion
- economic buyer
- proposal-ready
- dormant opportunity
- zombie opportunity
- forecast commit
- waiting state

Related ADRs:

- Truth Resolution
- Relationship Graph
- Process Advancement

Status:

POLICY CANDIDATE

Priority:

VERY HIGH

---

# Canonical Engines

## 1. Truth Resolution Engine

Consolidates:

- Truth Extraction Engine
- Multi-Source Truth Engine

Includes as adversarial mode or submodule:

- Evidence Challenge Engine

Purpose:

Resolve operational truth from incomplete, conflicting, stale, or biased evidence.

Core function:

Compare claims against available evidence and determine confidence level.

Inputs:

- claims
- source authority
- evidence freshness
- evidence consistency
- source independence
- conflicting statements
- missing evidence

Outputs:

- truth confidence
- unsupported claims
- evidence conflicts
- required validation
- human override requirement
- re-validation recommendation

Governance:

Evidence Challenge should not become a separate engine unless future research proves it requires independent lifecycle, storage, or execution.

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 2. Evidence Freshness Engine

Purpose:

Measure how evidence loses validity over time.

Core idea:

Evidence is not permanently reliable.

Older evidence may require re-validation before being used for recommendations, forecasting, or qualification.

Examples:

- economic buyer access from 18 months ago has low freshness
- proposal review from yesterday has high freshness
- client need from three years ago may require re-discovery
- underwriting status from last week may be stale depending on process

Outputs:

- freshness score
- stale evidence warning
- re-validation recommendation
- confidence adjustment

Related Domains:

- Data Provenance Model
- Truth Resolution
- Forecasting
- Process Advancement

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 3. Deal Reality Gap Engine

Consolidates:

- Confidence vs Evidence Engine
- Deal Reality Gap Engine

Purpose:

Measure the gap between human confidence and evidence-supported reality.

Core idea:

High advisor confidence does not equal high deal probability.

Example:

Advisor confidence:

90%

Evidence support:

45%

Reality gap:

45%

Outputs:

- reality gap score
- optimism risk
- unsupported forecast warning
- coaching prompt
- forecast confidence adjustment

Governance:

This engine must not shame or override the advisor.

It should calibrate judgment through evidence.

Related ADRs:

- ADR-001 Judgment Boundary
- Objective Function
- Truth Resolution

Status:

CANONICAL ENGINE

Priority:

CRITICAL

Future ADR Consideration:

POSSIBLE

Reason:

It creates a durable boundary between subjective confidence and operational truth.

---

## 4. Evidence Qualification Engine

Consolidates:

- Qualification Completeness Engine
- Evidence Qualification Engine

Purpose:

Evaluate opportunity maturity using evidence rather than subjective labels.

Possible evidence dimensions:

- pain
- need
- authority
- consequence
- timing
- fit
- commitment
- decision criteria
- decision process
- budget or payment capacity
- next step agreement

Outputs:

- qualification confidence
- missing evidence
- qualification gaps
- proposal readiness
- suggested discovery questions
- human override requirement

Governance:

This engine must not automatically block human action.

It may restrict confidence, warn, or require override.

Related Domains:

- Human Discovery Layer
- Process Advancement
- Truth Resolution

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 5. Relationship Quality Engine

Consolidates:

- Champion Validation Engine
- Champion Strength Engine
- Internal Selling Engine
- Relationship Quality Engine

Purpose:

Evaluate the operational quality of a relationship using evidence of behavior, influence, reciprocity, and advocacy.

Core idea:

A friendly contact is not necessarily a champion.

Signals:

- responsiveness
- reciprocity
- influence
- credibility
- willingness to act
- access to decision makers
- internal advocacy
- shared goals
- follow-through on commitments

Outputs:

- relationship quality score
- champion confidence
- advocacy confidence
- relationship risk
- next best relationship action

Governance:

The Advocacy Incentive Engine remains research-only for now.

Reason:

Quantifying personal incentives may introduce bias or manipulation risk.

Related ADRs:

- ADR-002 Trust Model
- ADR-004 Human Discovery Layer
- ADR-006 Relationship Graph

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 6. Political Network Engine

Purpose:

Model influence structures inside a client, prospect, organization, or referral network.

Core idea:

Buying decisions are rarely made by one person.

Forge should model:

- formal authority
- informal influence
- blockers
- champions
- economic buyers
- users
- recommenders
- gatekeepers

Outputs:

- influence map
- blocker risk
- champion pathway
- economic authority path
- relationship graph enrichment

Related Domains:

- Relationship Graph
- Trust Model
- Human Discovery Layer

Status:

CANONICAL ENGINE

Priority:

VERY HIGH

---

## 7. Decision Process Graph

Purpose:

Map the steps, approvals, dependencies, and decision flow required for a prospect or client to move forward.

Core idea:

A deal advances only when the buyer's process advances.

Possible nodes:

- evaluation
- proposal review
- spouse review
- business partner review
- budget approval
- underwriting
- legal
- procurement
- payment
- signature
- policy issuance

Outputs:

- current process stage
- next dependency
- waiting state
- owner of next action
- blocker
- required micro-commitment

Related Domains:

- Process Advancement
- Action Ownership Detection
- Waiting States

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 8. Deal Dependency Graph

Consolidates:

- Deal Dependency Graph
- Non-Human Dependency Engine

Purpose:

Represent human and non-human dependencies that affect deal progression.

Human dependencies:

- prospect
- spouse
- partner
- advisor
- manager
- underwriter
- carrier representative

Non-human dependencies:

- documents
- medical exams
- underwriting rules
- compliance
- legal process
- payment system
- signature platform
- calendar availability

Outputs:

- dependency map
- critical dependency risk
- non-human blocker
- waiting state classification
- recommended next action

Related Domains:

- Relationship Graph
- Process Advancement
- Waiting States

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 9. Buying Friction Engine

Purpose:

Measure the procedural, emotional, cognitive, financial, and operational friction involved in moving forward.

Types of friction:

- too many approvals
- unclear process
- fear of change
- lack of urgency
- confusing documentation
- financial hesitation
- legal or compliance delay
- emotional discomfort
- excessive decision complexity

Outputs:

- friction score
- friction source
- recommended friction reduction
- process risk
- follow-up strategy adjustment

Related Domains:

- Process Advancement
- Human Discovery Layer
- Decision Process Graph

Status:

CANONICAL ENGINE

Priority:

VERY HIGH

---

## 10. Opportunity Control Engine

Purpose:

Estimate whether the advisor owns the process or is reacting passively.

Core idea:

The advisor owns the process.

The prospect owns the decision.

Signals of control:

- clear next step
- explicit micro-commitment
- known decision process
- known decision owner
- active champion
- current evidence
- defined timeline

Signals of loss of control:

- vague next step
- no owner
- no timeline
- old evidence
- repeated silence
- no champion
- unknown decision process

Outputs:

- process control score
- loss-of-control warning
- next best process action
- waiting state classification
- human override recommendation

Related Domains:

- ADR-0019 Process Advancement
- Action Ownership Detection
- Waiting States

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 11. Forecast Confidence Engine

Purpose:

Estimate confidence in forecasted outcomes using evidence rather than intuition.

Inputs:

- deal health
- qualification confidence
- evidence freshness
- process stage
- champion confidence
- decision process clarity
- dependency risk
- historical conversion
- current micro-commitments
- forecast category

Outputs:

- forecast confidence
- forecast risk
- commit risk
- upside confidence
- evidence gaps
- manager coaching prompt

Governance:

Forecast confidence must not become an automatic decision.

It should support judgment, not replace it.

Related ADRs:

- ADR-003 Objective Function
- Truth Resolution
- Process Advancement

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 12. Dead Deal Detection Engine

Purpose:

Identify dormant, stalled, or zombie opportunities.

Core idea:

Deals can remain visible in a pipeline long after they are operationally dead.

Signals:

- repeated slips
- no recent evidence
- no response
- no next step
- no champion activity
- no micro-commitment
- no decision process movement
- decayed relationship quality

Outputs:

- dormant classification
- zombie probability
- close-lost review recommendation
- reactivation recommendation
- forecast removal recommendation
- human override requirement

Governance:

This engine must not automatically delete or purge deals.

It preserves traceability.

Related Domains:

- Process Advancement
- Truth Resolution
- Forecast Confidence

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

# Research Only

## Advocacy Incentive Engine

Status:

RESEARCH ONLY

Reason:

Quantifying the personal motivations of a champion is valuable but sensitive.

Risks:

- manipulation
- bias
- over-inference
- privacy concerns
- psychological speculation

Allowed use:

- qualitative discovery
- human review
- relationship context

Not allowed yet:

- automated scoring
- automated manipulation strategy
- inferred psychological targeting

Related ADRs:

- ADR-004 Human Discovery Layer
- ADR-005 Identity & Privacy
- ADR-001 Judgment Boundary

---

# Final Canonical Domains

## Truth Architecture

Canonical engines:

- Truth Resolution Engine
- Evidence Freshness Engine
- Deal Reality Gap Engine

Purpose:

Determine whether the system's understanding is evidence-supported, current, and reliable.

---

## Relationship Intelligence

Canonical engines:

- Relationship Quality Engine
- Political Network Engine

Purpose:

Determine whether the relationship network can support trust, influence, advocacy, and decision access.

---

## Process Intelligence

Canonical engines:

- Evidence Qualification Engine
- Decision Process Graph
- Deal Dependency Graph
- Buying Friction Engine
- Opportunity Control Engine
- Forecast Confidence Engine
- Dead Deal Detection Engine

Purpose:

Determine whether an opportunity is progressing, stalled, controllable, forecastable, or dead.

---

# Final Verdict

Truth Architecture is converging.

The five-book discovery set produced strong external validation without requiring constitutional changes.

The strongest foundational engines are:

1. Truth Resolution Engine
2. Relationship Quality Engine
3. Evidence Qualification Engine
4. Opportunity Control Engine
5. Forecast Confidence Engine

Future ADR consideration:

Deal Reality Gap Engine may eventually deserve ADR treatment if it becomes a global behavioral constraint between subjective human confidence and operational truth.

Current status:

No ADR creation recommended.

No implementation recommended.

Next phase:

Policy documentation and engine specification drafting.


# Forge Runtime Architecture

Status: ACCEPTED WITH ARCHITECTURAL EDITS
Phase: Consolidation
Date: 2026-06-16

---

# Executive Summary

This document formalizes the emergent runtime architecture of Forge OS.

Forge Runtime emerged organically from the consolidation of:

- Truth Architecture
- Relationship Intelligence
- Process Intelligence

No Constitution changes are required.

No new ADRs are required.

The Runtime defines HOW canonical engines interact during execution.

The Constitution defines WHAT exists and WHAT is allowed.

---

# Core Principle

Forge is a Judgment Augmentation Engine.

Humans retain accountability.

Forge augments judgment.

Forge never replaces judgment.

---

# Runtime Philosophy

Forge is event-driven.

Events trigger engine execution.

Engines produce state changes.

State changes produce recommendations.

Recommendations support human judgment.

Humans decide.

---

# Runtime Layers

## Layer 1: Truth Layer

Purpose:

Transform observations into canonical truth.

Canonical engines:

- Truth Resolution Engine
- Evidence Freshness Engine
- Deal Reality Gap Engine

Responsibilities:

- resolve contradictions
- validate evidence
- calculate freshness
- compare confidence vs reality
- determine truth confidence

Outputs:

- canonical truth
- evidence confidence
- freshness score
- reality gap score

Rule:

All downstream engines consume truth.

No engine consumes raw observations directly.

---

## Layer 2: Trust & Relationship Layer

Purpose:

Determine who matters and how much they matter.

Canonical engines:

- Trust Evaluation Engine
- Relationship Intelligence Engine
- Organizational Topology Engine
- Relationship Decay Engine
- Economic Authority Engine

Responsibilities:

- evaluate trust
- measure reciprocity
- identify champions
- map influence networks
- detect relationship decay
- identify economic buyers

Outputs:

- trust score
- relationship quality
- influence map
- champion confidence
- authority map

Rule:

Relationships operate on truth.

Relationships do not create truth.

---

## Layer 3: Process Layer

Purpose:

Determine whether the opportunity is advancing.

Canonical engines:

- Process Advancement Engine
- Action Ownership Detection Engine
- Waiting State Engine
- Decision Process Graph
- Deal Dependency Graph

Responsibilities:

- measure advancement
- identify blockers
- determine ownership
- classify waiting states
- map decision flows
- map dependencies

Outputs:

- process state
- owner
- waiting state
- next action
- blocker map

Rule:

Process depends on truth and relationships.

Process never overrides human decisions.

---

## Layer 4: Forecast Layer

Purpose:

Estimate outcomes using evidence.

Canonical engines:

- Forecast Confidence Engine
- Dead Deal Detection Engine

Responsibilities:

- estimate probability
- detect zombies
- recommend archival
- identify forecast risk

Outputs:

- forecast confidence
- zombie probability
- reactivation recommendation
- risk score

Rule:

Forecast supports judgment.

Forecast never replaces judgment.

---

# Runtime Kernel

The minimum kernel of Forge consists of four engines:

## 1. Truth Resolution Engine

Question answered:

What is true?

---

## 2. Trust Evaluation Engine

Question answered:

Whom should we trust?

---

## 3. Action Ownership Detection Engine

Question answered:

Who has the ball?

---

## 4. Process Advancement Engine

Question answered:

Is the process advancing?

These four engines form the irreducible kernel of Forge.

All other engines extend or enrich the kernel.

---

# Runtime Execution Flow

Execution order:

1. Receive event
2. Resolve truth
3. Evaluate freshness
4. Update trust
5. Update relationships
6. Determine ownership
7. Evaluate process advancement
8. Detect waiting states
9. Update forecasts
10. Generate recommendations
11. Human decides

Principle:

Observe
→ Validate
→ Contextualize
→ Advance
→ Recommend
→ Human Decision

---

# Event Model

Forge is fully event-driven.

Examples of events:

- new_interaction
- message_received
- call_completed
- meeting_scheduled
- micro_commitment_established
- proposal_requested
- proposal_sent
- payment_received
- underwriting_started
- underwriting_completed
- policy_issued
- claim_submitted
- referral_received
- response_timeout_reached

Each event may trigger one or more engines.

---

# Architectural Isolation Rules

## ABSTRACTION_BOUNDARY_POLICY

Predictive engines must consume canonical truth.

Predictive engines must never consume raw observations directly.

Reason:

Raw data contains:

- noise
- contradictions
- bias
- incomplete evidence

Canonical truth acts as the abstraction boundary.

---

## OWNERSHIP_PRECEDES_WAITING_POLICY

Action ownership must be determined before waiting state classification.

Reason:

Ownership is more fundamental than waiting.

Flow:

Ownership
→ Waiting State

Never:

Waiting State
→ Ownership

---

## HUMAN_ACCOUNTABILITY_POLICY

Forge provides recommendations.

Humans make decisions.

The system must never:

- delete opportunities automatically
- block interfaces permanently
- force actions
- execute business decisions autonomously

---

## TRACEABILITY_POLICY

All state transitions must preserve history.

Nothing is physically deleted.

Corrections generate new events.

History remains immutable.

---

# System Boundaries

Strictly Human:

- empathy
- persuasion
- coaching
- negotiation
- final decision making
- exception handling

Automatable:

- evidence resolution
- trust calculation
- ownership detection
- waiting states
- forecasting
- dependency tracking

Requires Override:

- proposal without evidence
- revive zombie opportunities
- exception handling
- high-risk forecasts

---

# Final Runtime Model

Truth
↓
Trust
↓
Relationships
↓
Ownership
↓
Process
↓
Forecast
↓
Recommendation
↓
Human Decision

---

# Final Verdict

Forge Runtime is emerging.

Forge is evolving into an intelligence operating system for relationship-based work under uncertainty.

The kernel of Forge is:

1. Truth Resolution
2. Trust Evaluation
3. Action Ownership Detection
4. Process Advancement

Constitution preserved.

Human accountability preserved.

No ADR creation recommended.

Next phase:

Human Systems Canonicalization.


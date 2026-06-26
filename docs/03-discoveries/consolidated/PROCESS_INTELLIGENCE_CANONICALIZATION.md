# Process Intelligence Canonicalization

Status: ACCEPTED WITH ARCHITECTURAL EDITS
Phase: Consolidation
Date: 2026-06-16

---

# Executive Summary

This document consolidates Process Intelligence discoveries extracted from external research and real-world Forge discoveries.

Constitution Changes:

NONE

New ADRs:

NONE

Primary Principle:

The advisor owns the process.

The prospect owns the decision.

Forge augments judgment.

Forge does not replace judgment.

---

# Governance Corrections

## Action Ownership is Fundamental

Action Ownership Detection must remain independent.

Reason:

Ownership is more fundamental than Waiting States.

Examples:

Owner: Advisor
State: Active

Owner: Prospect
State: Waiting

Owner: Carrier
State: External Dependency

Owner: Underwriter
State: Waiting

Owner: Manager
State: Escalated

Waiting State depends on ownership.

Ownership does not depend on waiting.

Status:

CANONICAL ENGINE

---

## Decision Process and Dependencies are Different

Decision Process Graph:

Represents:

- approvals
- reviews
- signatures
- legal flow

Deal Dependency Graph:

Represents:

- medical exams
- payment
- underwriting
- document collection
- external systems

Process is not dependency.

Dependency is not process.

Both remain independent.

---

## No Automatic Deletion

Dead opportunities must never be physically deleted.

Allowed:

- dormant
- zombie
- archived
- close-lost recommendation

Forbidden:

- delete
- purge
- erase history

Reason:

Traceability is constitutional.

---

# Policies

## PROCESS_OWNERSHIP_POLICY

The advisor owns the process.

The prospect owns the decision.

Forge optimizes process clarity but never replaces human choice.

Related:

- ADR-001 Judgment Boundary
- Process Advancement

Priority:

CRITICAL

---

## WAITING_STATE_POLICY

If the next action is not owned by the advisor, the opportunity may leave the active work queue.

Important:

Pipeline State != Work Queue

An opportunity may remain active while temporarily leaving the advisor's work queue.

Examples:

Prospect reviewing proposal:

Pipeline: Active
Work Queue: Waiting

Underwriting pending:

Pipeline: Active
Work Queue: Waiting

Related:

- Process Advancement
- Action Ownership Detection

Priority:

CRITICAL

---

## MICRO_COMMITMENT_POLICY

Process advancement requires explicit next-step agreements.

Open loops such as:

- let me think about it
- call me later
- I'll let you know

do not constitute advancement.

Valid advancement requires:

- owner
- action
- timeline

Related:

- ADR-0019 Process Advancement

Priority:

CRITICAL

---

## PROPOSAL_ELIGIBILITY_POLICY

A proposal should be supported by sufficient discovery evidence.

Possible evidence:

- need
- pain
- authority
- timing
- budget
- commitment

Governance:

This policy warns, restricts confidence, or requests override.

It must not hard-block the user.

Related:

- ADR-001
- Trust Model
- Human Discovery Layer

Priority:

VERY HIGH

---

## TRACEABILITY_POLICY

All pipeline changes must preserve immutable historical evidence.

Corrections create new events.

History must not be overwritten.

Related:

- Truth Resolution
- Data Provenance Model

Priority:

CRITICAL

---

# Canonical Engines

## 1. Process Advancement Engine

Consolidates:

- Progressive Commitment Engine
- Opportunity Maturity Engine
- Opportunity Control concepts

Purpose:

Measure real advancement through evidence.

Signals:

- micro-commitments
- completed actions
- movement
- deadlines
- agreements

Outputs:

- advancement score
- stagnation risk
- next best process action

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 2. Action Ownership Detection Engine

Purpose:

Determine who owns the next action.

Possible owners:

- advisor
- prospect
- client
- referrer
- manager
- carrier
- underwriter
- external event

Outputs:

- owner
- owner confidence
- escalation path
- waiting classification

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 3. Waiting State Engine

Depends on:

- Action Ownership Detection Engine

Purpose:

Manage asynchronous waiting periods.

Possible states:

- waiting_prospect
- waiting_carrier
- waiting_underwriter
- waiting_manager
- waiting_external_event

Outputs:

- work queue status
- waiting reason
- expected duration
- re-engagement trigger

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 4. Decision Process Graph

Purpose:

Model how the buyer makes decisions.

Nodes:

- review
- approval
- procurement
- legal
- signature
- issuance

Outputs:

- next stage
- blocker
- missing step
- decision path

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 5. Deal Dependency Graph

Purpose:

Model dependencies external to decision flow.

Dependencies:

- medical exams
- payments
- documents
- underwriting
- integrations
- compliance
- external systems

Outputs:

- dependency risk
- blocker
- required action
- dependency map

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 6. Forecast Confidence Engine

Consolidates:

- Deal Health
- Forecast Risk

Purpose:

Estimate confidence using evidence.

Inputs:

- process advancement
- relationship quality
- evidence freshness
- dependencies
- waiting states
- qualification

Outputs:

- forecast confidence
- risk
- coaching prompts

Governance:

Forecasts support judgment.

They do not replace judgment.

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

## 7. Dead Deal Detection Engine

Purpose:

Identify dormant or zombie opportunities.

Signals:

- silence
- repeated slips
- no commitments
- stale evidence
- inactive champions

Outputs:

- zombie probability
- dormant classification
- reactivation recommendation
- archive recommendation

Governance:

No automatic deletion.

History is preserved.

Status:

CANONICAL ENGINE

Priority:

CRITICAL

---

# Research Only

## Buying Friction Engine

Status:

RESEARCH ONLY

Reason:

Friction is difficult to infer reliably without external data.

Allowed:

- qualitative signals
- human review

Not allowed:

- hard scoring without evidence

---

# Final Canonical Domains

## Process Advancement Layer

- Process Advancement Engine
- Action Ownership Detection Engine
- Waiting State Engine

## Dependency Layer

- Decision Process Graph
- Deal Dependency Graph

## Forecasting Layer

- Forecast Confidence Engine
- Dead Deal Detection Engine

---

# Final Verdict

Process Intelligence is converging.

No Constitution changes required.

No ADR creation recommended.

Strong future ADR candidates:

- Action Ownership Detection
- Waiting States

Current status:

Constitution preserved.
Human accountability preserved.
Traceability preserved.

Next phase:

Forge Runtime Architecture.


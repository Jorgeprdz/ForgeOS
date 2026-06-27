# FORGE CONSTITUTION MAP

## Status

LOCKED

---

# PURPOSE

The Forge Constitution Map defines the organizational structure of Forge constitutional architecture.

Its purpose is to provide a canonical navigation model for all approved constitutional ADRs and operational readiness foundations.

Canonical ADR files live in `adr/`.

`docs/02-adr-candidates/` is used for ADR-related working documents, transition material, and ADR-stage documentation that has not been folded into the canonical ADR set.

This document does not replace individual ADRs.

This document explains how approved ADRs relate to one another and how constitutional authority flows throughout Forge.

---

# FOUNDATIONAL PRINCIPLES

Forge is governed by boundaries before implementation.

Reality precedes assumptions.

Evidence precedes opinion.

Human authority precedes artificial authority.

Client First precedes economic incentives.

Capability precedes dependency.

Advancement precedes activity.

Architecture is problem-driven.

---

# CONSTITUTIONAL ARCHITECTURE

Forge is organized into constitutional layers.

Each layer answers a different category of architectural questions.

---

# LAYER 1 — TRUTH GOVERNANCE

## Mission

Define what may be considered true.

This layer establishes ownership of truth and the boundaries of factual claims.

### ADR-001
Evidence Ownership / Source Validity

### ADR-002
One Metric One Owner

### ADR-005
Product Truth Boundary

### ADR-006
Policy Truth Boundary

### ADR-007
Forecast Truth Boundary

### ADR-008
Economic Evidence Boundary

---

# LAYER 2 — AUTHORITY GOVERNANCE

## Mission

Define authority boundaries.

This layer determines who may recommend and who may decide.

### ADR-003
Recommendation vs Decision Authority Boundary

### ADR-004
No Invented Recommendations

---

# LAYER 3 — DECISION INTELLIGENCE

## Mission

Define how Forge prioritizes opportunities, actions, and decisions.

### ADR-009
NBA Philosophy

### ADR-012
Business Planning Plan-to-Action Boundary

### Core Principle

Advancement must be prioritized over activity.

---

# LAYER 4 — INTERACTION INTELLIGENCE

## Mission

Define how Forge interacts with human beings.

### ADR-010
NASH Conversation Intelligence Boundary

### ADR-011
Relationship Intelligence Non-Manipulation Boundary

### Core Principles

- Communication without manipulation
- Guidance without coercion
- Relationship protection over short-term optimization

---

# LAYER 5 — HUMAN INTELLIGENCE

## Mission

Define how Forge interprets human behavior, productivity, leadership, and advisor development.

### ADR-013
Mick Behavior Intelligence Boundary

### ADR-014
Productivity Metric Ownership Boundary

### ADR-015
Manager Intelligence Authority Boundary

### ADR-016
Advisor Experience + Benvenù Anti-Dependence Boundary

### ADR-016A
Benvenù Purpose Scarcity + Dignity Boundary

### Core Principles

- Forge must increase advisor capability rather than advisor dependency.
- Purpose may guide. Purpose must not pressure.

---

# LAYER 6 — ECONOMIC INTELLIGENCE

## Mission

Define how Forge interprets economic information, compensation, incentives, and financial motivation.

### ADR-017
Compensation Intelligence Evidence Boundary

### ADR-018
Economic Motivation Client First Boundary

### Core Principle

Money is context.

Money is never pressure.

---

# LAYER 7 — OPERATIONAL SEMANTICS

## Mission

Provide shared operational language across Forge.

### READINESS CONTRACT — 001A
Source Ownership Registry

Operational foundation, not a canonical ADR.

### READINESS CONTRACT — 001B
Evidence State Vocabulary

Operational foundation, not a canonical ADR.

### READINESS CONTRACT — 001C
Truth Validation Result Contract

Operational foundation, not a canonical ADR.

### Core Principle

Semantic consistency across all intelligence systems.

---

# LAYER 8 — PROCESS INTELLIGENCE

## Mission

Define how Forge evaluates and advances active processes.

### ADR-0019
Process Advancement Intelligence

### Core Principles

Prospect owns the decision.

Advisor owns the process.

Advancement is more important than activity.

---

# REJECTED ADRS

### ADR-001D

Status: REJECTED

Reason:

The proposed problem space was absorbed by ADR-0019 Process Advancement Intelligence.

---

# CONSTITUTIONAL FOUNDATION

ADR-001 through ADR-018.
Approved dependent addenda: ADR-016A.

---

# OPERATIONAL FOUNDATION

001A Source Ownership Registry
001B Evidence State Vocabulary
001C Truth Validation Result Contract
ADR-0019

---

# CANONICAL OPERATIONAL DOCS NAMESPACES

These namespaces are operational governance surfaces. They are not canonical ADR sets.

## `docs/02-build-tree/`

Build tree and implementation map namespace.

Policy: KEEP_WITH_CONSTITUTION_MAP_ENTRY.

## `docs/05-foundation/`

Foundation architecture namespace.

Policy: KEEP_WITH_CONSTITUTION_MAP_ENTRY.

## `docs/05-phase-transitions/`

Phase transition namespace.

Policy: KEEP_WITH_CONSTITUTION_MAP_ENTRY.

## `docs/05-truth/`

Truth, source and evidence governance namespace.

Policy: KEEP_WITH_CONSTITUTION_MAP_ENTRY.

---

# CONSTITUTIONAL STACK

Truth Governance
↓
Authority Governance
↓
Decision Intelligence
↓
Interaction Intelligence
↓
Human Intelligence
↓
Economic Intelligence
↓
Operational Semantics
↓
Process Intelligence
↓
Domain Intelligence
↓
Implementation

---

# FINAL STATEMENT

Forge is not organized around features.

Forge is organized around boundaries.

Constitutional integrity is more important than implementation speed.

Constitutional integrity is more important than ADR count.

LOCKED.

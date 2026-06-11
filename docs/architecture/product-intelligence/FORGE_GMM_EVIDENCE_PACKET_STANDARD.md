# Forge GMM Evidence Packet Standard

Status: PRE-IMPLEMENTATION / FINAL PRE-ENGINE DISCOVERY

No code. No engines. No schemas. No UI. No Build Tree changes.

## Purpose

Define the minimum documentary evidence required before Forge is allowed to
perform GMM Coverage Intelligence reasoning.

Coverage Intelligence must never operate from assumptions. It must reason from
evidence.

## Core Standard

Forge may only move from education into case-specific coverage reasoning when
the evidence packet contains enough information to identify:

- Product.
- Policy context.
- Insured.
- Event family.
- Date context.
- Territory.
- Source authority.
- Human review gates.

## Evidence Packet Principle

Evidence packets do not prove claims.

They determine what Forge is allowed to say:

- Educational explanation.
- Insufficient information.
- Human review required.
- Conditional assessment.
- Likely covered.
- Likely not covered.
- Financial responsibility unavailable.

## Master Evidence Packet Flow

```text
User Question
↓
Universal Evidence Packet
↓
Event Family Evidence Packet
↓
Source Registry Check
↓
Evidence Completeness Level
↓
Human Review Gate Check
↓
Allowed Assessment Language
↓
Next Evidence Request
```

## Universal Evidence Packet

Every GMM case needs:

- Exact product or product uncertainty.
- Policy/caratula status.
- Policy active status or unknown.
- Insured identity.
- Event description.
- Event family or event-family uncertainty.
- Approximate date context.
- Territory/location.
- Optional coverage relevance.
- Preexistence known/unknown.

If absent:

- Forge may explain generally.
- Forge must not produce a coverage assessment.

## Event-Specific Evidence Packet

After event-family routing, Forge should collect only the evidence required by
that event family.

The packet should not become a generic long intake form.

## Completeness Levels

- Level 0: No Evidence.
- Level 1: Routing Evidence.
- Level 2: Conditional Assessment Evidence.
- Level 3: Likely Covered / Likely Not Covered Evidence.
- Level 4: Financial Responsibility Evidence.

## Final Boundary

Level 3 is the highest coverage-language level.

Level 4 is not stronger coverage certainty. It is separate financial context.

Forge must keep coverage eligibility and financial responsibility separate.

# Forge GMM Coverage Intelligence Blueprint

Status: BLUEPRINT / PRE-IMPLEMENTATION

No code. No engines. No schemas. No UI. No Build Tree changes.

## Executive Purpose

This blueprint defines how Forge should think about GMM coverage questions
before any Coverage Intelligence Engine is approved.

The target user question is:

"Would this situation likely be covered?"

The target Forge behavior is not claim adjudication. Forge should identify the
right product path, collect the minimum evidence, select relevant rule
families, detect gaps, trigger human review when needed and choose cautious
assessment language.

## Completed Discovery Inputs

This blueprint is based on completed Alfa Medical discovery artifacts:

- Product Discovery.
- Coverage Discovery.
- Exclusion Discovery.
- Rule Extraction.
- Event Family Architecture.
- Human Review Architecture.
- Evidence Architecture.
- Evaluation Architecture.

## Blueprint Boundary

This document does not approve:

- Coverage engine.
- Rule engine.
- Schema.
- UI.
- Calculation.
- Claims decisioning.
- Build Tree change.

## Master Coverage Intelligence Flow

```text
User Question
↓
Intake Framing
↓
Product Router
↓
Policy Context Checker
↓
Insured Context Checker
↓
Event Family Router
↓
Evidence Sufficiency Evaluator
↓
Rule Family Selector
↓
Coverage Candidate Selector
↓
Exclusion Evaluator
↓
Waiting Period Evaluator
↓
Preexistence Evaluator
↓
Territory / Optional Coverage Evaluator
↓
Authorization / Documentation Evaluator
↓
Human Review Gatekeeper
↓
Financial Boundary Evaluator
↓
Assessment Language Selector
↓
Question Strategy / Next Evidence Request
↓
Coverage Assessment Response
```

## Conceptual Components

- Intake Framing.
- Product Router.
- Policy Context Checker.
- Insured Context Checker.
- Event Family Router.
- Evidence Sufficiency Evaluator.
- Rule Family Selector.
- Coverage Candidate Selector.
- Exclusion Evaluator.
- Waiting Period Evaluator.
- Preexistence Evaluator.
- Territory / Optional Coverage Evaluator.
- Authorization / Documentation Evaluator.
- Human Review Gatekeeper.
- Financial Boundary Evaluator.
- Assessment Language Selector.
- Question Strategy Coordinator.
- Source Provenance Recorder.

## Blueprint Principle

Forge should not try to answer all coverage questions.

Forge should determine which of these is responsible:

- Explain generally.
- Ask for one missing fact.
- Provide conditional assessment.
- Say insufficient information.
- Trigger human review.
- Say likely covered only when evidence gates are satisfied.
- Say likely not covered only when a specific rule conflict is documented.

## Final Verdict

Coverage Intelligence is ready for component design and source-registry work.

Coverage Intelligence is not ready for implementation.

The next approved work should be documentary:

- Source registry.
- Evidence packet specification.
- Real caratula inventory.
- Real quote inventory.
- Hospital/catalog/source version map.
- Human review protocol.

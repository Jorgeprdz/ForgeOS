# Forge GMM Component Catalog

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Catalog the components required for GMM Coverage Intelligence.

## Required Components

| Component | Necessity | Reason |
| --- | --- | --- |
| Intake Framing | Required | Converts raw user question into coverage-evaluation context. |
| Product Router | Required | Prevents Alfa Medical vs Flex misrouting. |
| Policy Context Checker | Required | Verifies caratula, vigency, optional coverages and source version. |
| Insured Context Checker | Required | Determines insured-specific eligibility. |
| Event Family Router | Required | Selects the correct event path. |
| Evidence Sufficiency Evaluator | Required | Determines whether evaluation can begin. |
| Rule Family Selector | Required | Chooses relevant rule families. |
| Coverage Candidate Selector | Required | Finds possible coverage basis. |
| Exclusion Evaluator | Required | Screens general and particular exclusions. |
| Waiting Period Evaluator | Required | Tests timing and continuity rules. |
| Preexistence Evaluator | Required | Detects prior-condition risk. |
| Territory / Optional Coverage Evaluator | Required | Handles foreign and optional coverage routing. |
| Authorization / Documentation Evaluator | Required | Detects authorization and document gaps. |
| Human Review Gatekeeper | Required | Stops unsafe conclusions. |
| Financial Boundary Evaluator | Required | Separates eligibility from client financial responsibility. |
| Assessment Language Selector | Required | Chooses allowed response label. |
| Question Strategy Coordinator | Required | Asks the next smallest useful question. |
| Source Provenance Recorder | Required | Preserves documentary basis and unknowns. |

## Optional Later Components

- Case Timeline Builder.
- Evidence Packet Builder.
- Claim Scenario Library.
- Coverage Education Explainer.
- Human Review Queue Manager.

These are not approved for implementation. They are future blueprint
candidates.

## Components Rejected for Now

- Coverage Score.
- Claim Approval Predictor.
- Claim Denial Predictor.
- Out-of-pocket Calculator.
- Automated Claims Adjuster.
- Generic GMM Engine.

Reason:

These would create false certainty before documentary source registry,
caratula evidence, real claim examples and human-review governance exist.

# Forge GMM Component Responsibilities

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Intake Framing

Purpose:

Understand what the user is asking and whether it is a case-specific coverage
question or educational question.

Inputs:

- User question.
- Uploaded documents, if any.
- Conversation context.

Outputs:

- Question type.
- Initial missing facts.

Dependencies:

- None.

Failure Conditions:

- Ambiguous user intent.

Boundaries:

- Must not infer claim facts from vague language.

Must never:

- Say covered/not covered.

## Product Router

Purpose:

Identify the exact GMM product.

Inputs:

- Product name.
- Policy/caratula.
- Quote text.
- User statement.

Outputs:

- Product route: Alfa Medical, Alfa Medical Flex, future product, unknown.

Dependencies:

- Source Provenance Recorder.

Failure Conditions:

- Product ambiguous.
- Product absent.

Boundaries:

- Routes only; does not evaluate coverage.

Must never:

- Treat Flex as a flag on Alfa Medical.

## Policy Context Checker

Purpose:

Verify policy facts required for evaluation.

Inputs:

- Caratula.
- Policy active status.
- Endorsements.
- Optional coverages.
- Product version.

Outputs:

- Policy context status.
- Missing caratula fields.

Dependencies:

- Product Router.

Failure Conditions:

- Missing policy/caratula.
- Source conflict.

Boundaries:

- Does not calculate.

Must never:

- Invent deductible, coinsurance, cap, territory or optional coverages.

## Insured Context Checker

Purpose:

Determine whether the insured person fits benefit eligibility.

Inputs:

- Insured identity.
- Age.
- Sex.
- Residence.
- Relationship to titular.
- Coverage continuity.

Outputs:

- Insured eligibility context.
- Missing insured facts.

Dependencies:

- Policy Context Checker.

Failure Conditions:

- Wrong insured.
- Age/coverage continuity missing.

Boundaries:

- Does not decide medical coverage.

Must never:

- Assume all insureds share identical eligibility.

## Event Family Router

Purpose:

Classify situation into event family.

Inputs:

- Event description.
- Diagnosis.
- Treatment/procedure.
- Location.

Outputs:

- Event family.
- Event subfamily.
- Needed event-specific evidence.

Dependencies:

- Intake Framing.

Failure Conditions:

- Event too vague.

Boundaries:

- Routes; does not evaluate rules.

Must never:

- Treat all medical events as ordinary illness.

## Evidence Sufficiency Evaluator

Purpose:

Determine whether minimum evidence exists to begin evaluation.

Inputs:

- Product.
- Policy.
- Insured.
- Event family.
- Key dates.
- Territory.
- Documents.

Outputs:

- Sufficient / insufficient / conditional evidence status.
- Missing evidence list.

Dependencies:

- Product Router.
- Event Family Router.

Failure Conditions:

- Missing universal dataset.

Boundaries:

- Determines readiness to evaluate, not coverage result.

Must never:

- Upgrade client statement into verified documentary fact.

## Rule Family Selector

Purpose:

Select applicable rule families for the event.

Inputs:

- Product route.
- Event family.
- Policy context.

Outputs:

- Rule families to inspect.

Dependencies:

- Event Family Router.
- Product Router.

Failure Conditions:

- Event family unknown.

Boundaries:

- Selects rules, does not resolve them.

Must never:

- Apply Alfa Medical rules to Flex.

## Coverage Candidate Selector

Purpose:

Identify whether a situation resembles a covered benefit.

Inputs:

- Diagnosis/event.
- Coverage map.
- Rule family selection.

Outputs:

- Candidate coverage basis or none.

Dependencies:

- Rule Family Selector.

Failure Conditions:

- Diagnosis/treatment not specific enough.

Boundaries:

- Candidate only, not final coverage.

Must never:

- Ignore exclusions or waiting periods.

## Exclusion Evaluator

Purpose:

Screen for general and particular exclusions.

Inputs:

- Event facts.
- Treatment type.
- Activity context.
- Exclusion map.

Outputs:

- Exclusion conflict.
- No known exclusion.
- Ambiguous exclusion requiring review.

Dependencies:

- Coverage Candidate Selector.

Failure Conditions:

- Exclusion-sensitive facts missing.

Boundaries:

- Does not deny claims.

Must never:

- Use exclusion language as sales pressure.

## Waiting Period Evaluator

Purpose:

Evaluate date and continuity requirements.

Inputs:

- Coverage start.
- Continuity.
- First symptom.
- Diagnosis.
- First expense.
- Event family.

Outputs:

- Waiting period appears satisfied / not satisfied / unknown.

Dependencies:

- Rule Family Selector.

Failure Conditions:

- Date conflicts.

Boundaries:

- Does not resolve preexistence.

Must never:

- Assume diagnosis date equals symptom date.

## Preexistence Evaluator

Purpose:

Detect preexistence risk.

Inputs:

- Medical history.
- Prior diagnosis.
- Prior treatment.
- Prior expenses.
- Declaration.

Outputs:

- Preexistence risk absent / possible / human review required.

Dependencies:

- Waiting Period Evaluator.

Failure Conditions:

- Medical history incomplete.

Boundaries:

- Does not adjudicate disputes.

Must never:

- Clear preexistence from silence alone.

## Territory / Optional Coverage Evaluator

Purpose:

Route national vs foreign and optional benefit questions.

Inputs:

- Territory.
- Location.
- Optional coverages.
- Stay duration.
- Programmed status.

Outputs:

- Territory path.
- Optional coverage dependency.

Dependencies:

- Policy Context Checker.

Failure Conditions:

- Foreign event without optional coverage proof.

Boundaries:

- Does not calculate foreign reimbursement.

Must never:

- Assume national coverage applies abroad.

## Authorization / Documentation Evaluator

Purpose:

Identify required approvals and documents.

Inputs:

- Treatment type.
- Authorization status.
- Clinical file.
- Prescriptions.
- Receipts.
- Second valuation.

Outputs:

- Documentation complete/incomplete.
- Authorization required/missing.

Dependencies:

- Event Family Router.
- Coverage Candidate Selector.

Failure Conditions:

- High-specialty treatment without authorization evidence.

Boundaries:

- Does not approve treatment.

Must never:

- Treat medical necessity as authorization.

## Human Review Gatekeeper

Purpose:

Stop unsafe conclusions.

Inputs:

- All gate signals.

Outputs:

- Hard stop.
- Soft stop.
- Educational only.
- Human review required.

Dependencies:

- All evaluators.

Failure Conditions:

- Any hard gate open.

Boundaries:

- Governs output; does not decide coverage.

Must never:

- Let "likely covered" pass through a hard stop.

## Financial Boundary Evaluator

Purpose:

Determine whether client financial participation can be discussed.

Inputs:

- Deductible.
- Coinsurance.
- Cap.
- Plan/zone.
- Hospital level.
- Catalogs.
- Pharmacy path.

Outputs:

- Financial explanation allowed / blocked.

Dependencies:

- Policy Context Checker.

Failure Conditions:

- Missing caratula/catalog.

Boundaries:

- Does not calculate unless future engine is approved.

Must never:

- Estimate out-of-pocket from incomplete evidence.

## Assessment Language Selector

Purpose:

Choose safe response language.

Inputs:

- Evidence sufficiency.
- Rule outcomes.
- Human review gate.

Outputs:

- Educational Explanation.
- Insufficient Information.
- Human Review Required.
- Conditional Assessment.
- Likely Covered.
- Likely Not Covered.

Dependencies:

- Human Review Gatekeeper.

Failure Conditions:

- Conflicting output signals.

Boundaries:

- Selects language, not claim result.

Must never:

- Say approved, denied or guaranteed.

## Question Strategy Coordinator

Purpose:

Ask the next most valuable question.

Inputs:

- Missing inputs.
- Event family.
- Hard/soft gates.

Outputs:

- One prioritized question or evidence request.

Dependencies:

- Evidence Sufficiency Evaluator.

Failure Conditions:

- Multiple equivalent hard blockers.

Boundaries:

- Minimizes data collection.

Must never:

- Ask for everything when one fact can route the case.

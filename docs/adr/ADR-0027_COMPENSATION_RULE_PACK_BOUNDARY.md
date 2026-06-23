# ADR-0027: Compensation Rule Pack Boundary

## Status

Proposed

## Context

Forge OS contains deterministic engines for compensation, advisor qualification, revenue, payment distribution, projected cashflow and future payout truth reconciliation.

Several compensation rules are variable by official document, carrier, year, contract, product, advisor role, partner career month, compensation plan version, commission statement policy or governance decision.

Current and future engine implementations risk embedding business variability inside JavaScript logic. This creates technical debt because every official rule change would require code changes, increases regression risk, weakens auditability, and blurs the distinction between official evidence, executable rules and deterministic processing.

Examples of business variability include:

- Canonical compensation concepts
- Concept aliases
- Payable versus non-payable concepts
- Payment distribution policies
- Number of payment fractions
- Time anchors
- Qualification thresholds
- Bonus scales
- Evidence requirements
- Blocking reasons
- Carrier/product mappings
- Canonical financial categories
- Payout truth requirements

Forge OS requires a strict boundary between variable business rules and stable deterministic engines.

Core operating truth:

- Official evidence defines human/legal truth.
- Rule packs JSON translate official evidence into executable structured rules.
- Engines JS apply deterministic computation and validation.
- Tests prove that engines obey rule packs.
- UI/view models render results but do not define economic truth.

## Decision

Forge OS will establish a Compensation Rule Pack Boundary.

Any business rule that can change by official document, carrier, year, contract, product, role, compensation manual, commission statement policy or governance decision must live in versioned JSON rule packs.

JavaScript engines must not own variable business rules. Engines must operate as deterministic interpreters that consume rule packs, raw facts and evidence, then produce structured outputs.

## Rule

If a rule can change by official document, it does not belong inside the engine.

## Scope

This ADR applies to:

- Partner compensation engines
- Advisor qualification engines
- Payment distribution engines
- Monthly cashflow projection engines
- Revenue snapshot aggregation engines
- Statement reconciliation engines
- Future carrier/product compensation engines

## The Rule Pack Boundary

### What belongs in JSON rule packs

Rule packs may contain the executable translation of official evidence.

Rule packs may define:

### Metadata

- rulePackId
- rulePackVersion
- carrier
- year
- contract
- product
- advisor role
- partner role
- effective dates
- source evidence references
- governance status
- immutable official marker
- rule pack hash once official

### Concepts dictionary

- canonical concept keys
- aliases
- human labels
- canonical financial categories
- payable flags
- non-payable reasons
- source evidence references

### Qualification policies

- thresholds
- indexes
- gates
- required evidence
- blocking reasons
- lifecycle requirements
- role eligibility requirements

### Bonus calculation policies

- scales
- multipliers
- bands
- caps
- limits
- allowed strategy identifiers
- numeric parameters for deterministic strategies
- source evidence references

### Payment distribution policies

- distribution type
- fraction count
- start anchor
- payment anchor
- monthly breakdown requirement
- excluded non-payable concepts
- source evidence references

### Canonical financial categories

Rule packs may define official financial buckets used by engines, such as:

- production
- productivity
- activity
- development
- connection
- fixedSupport
- partnerSignup
- revenue
- payout
- reversal
- adjustment

These categories are economic structure, not UI layout.

### Evidence requirements

Rule packs may define required evidence for:

- calculated_candidate
- earned_estimated
- paid_confirmed
- reversed
- cancelled
- payout truth

## What belongs in JS engines

Engines may contain stable deterministic invariants:

- Validate rule pack shape
- Resolve aliases using rule packs
- Apply arithmetic safely
- Apply precompiled deterministic strategies
- Group by month
- Split amounts according to rule pack instructions
- Move through months according to rule pack anchors
- Preserve null
- Preserve unknown
- Preserve blocked
- Preserve not_modeled
- Preserve hidden_by_scope
- Preserve excludedConcepts
- Reject incomplete rules
- Emit warnings
- Emit blocked reasons
- Attach rulePackId, rulePackVersion and rulePackHash to outputs
- Keep payoutTruth false unless official commission statement evidence confirms payout truth

Engines are allowed to contain generic handlers such as:

- deferred_equal_parts
- single_payment
- monthly_breakdown_required
- excluded_non_payable

But engines must not decide which business concept uses which handler. That mapping must come from the rule pack.

## What must not live in JS engines

Engines must not hardcode:

- business concept names
- aliases
- compensation thresholds
- payable or non-payable decisions
- payment distribution policies
- number of payment parts
- bonus scales
- qualification gates
- evidence requirements
- carrier/product mappings
- canonical financial categories
- UI column order as economic truth

Engines must not contain logic such as:

    if concept == "activity", pay at quarter close
    if concept == "production", split into three parts
    if concept == "productivityBase", exclude from payment

Those decisions belong in the active rule pack.

## Execution Safety

Rule packs must not contain executable code.

Forge OS must never evaluate rule pack strings as code.

Forbidden patterns include:

- eval()
- new Function()
- dynamic JavaScript execution from JSON
- formula strings interpreted as code
- arbitrary expression evaluators without strict governance

Rule packs may reference only approved deterministic strategy identifiers.

Example:

    {
      "strategy": "standard_tier_multiplier",
      "parameters": {
        "tier": "month_24_plus",
        "multiplier": 1.7
      }
    }

The strategy implementation lives in JS as stable deterministic code. The rule pack only selects the strategy and provides parameters.

## Temporal Snapshotting

Every calculation output that depends on a rule pack must include rule pack identity metadata.

Required output metadata:

- rulePackId
- rulePackVersion
- rulePackHash
- rulePackEffectiveDate
- sourceEvidenceRefs when applicable

The rulePackHash must be generated and sealed during the build pipeline, publication process or official rule pack promotion step. Engines must not recompute the official rulePackHash on every runtime execution as a substitute for artifact governance.

This applies to:

- calculated_candidate
- payment projections
- monthly cashflow projections
- revenue snapshots
- reconciliation outputs
- audit/explainability outputs

If a rule pack changes later, previously generated outputs must remain auditable against the exact rule pack version and hash used at calculation time.

Rule pack mutation after official approval is not allowed. Corrections must create a new version.

## State Preservation Rules

The boundary preserves the following rules:

- Unknown is not zero.
- Blocked is not zero.
- Not modeled is not zero.
- Hidden by scope is not zero.
- Excluded non-payable is not a blocked payment.
- Forecast is not payout truth.
- Calculated candidate is not payout truth.
- Payment proof is not payout truth.
- Commission statement evidence confirms payout truth.

Engines must never silently coerce unknown, blocked, not_modeled, hidden_by_scope or missing evidence into zero.

## Rule Pack Governance

Rule packs must be:

- versioned
- schema validated
- test-covered
- traceable to evidence
- immutable once marked official
- replaceable by year/carrier/contract/product version
- loaded explicitly by engines or adapters

Each official rule section should include sourceEvidenceRef when applicable.

Rule pack loading must fail loudly if the active rule pack is invalid.

Invalid rule packs must produce a Fatal Governance Error before any financial projection or calculation is emitted.

## Rule Pack Schema Validation

Forge OS must validate rule packs before engines consume them.

Validation must be Fail-Fast. If the active rule pack is malformed, incomplete, inconsistent or unsafe, the pipeline must short-circuit before any engine receives advisor facts, policy facts, payment facts or compensation facts.

Minimum validation requirements:

- Required metadata exists.
- rulePackId exists.
- rulePackVersion exists.
- effective dates are valid.
- conceptsDictionary exists when referenced.
- all aliases resolve to one canonical concept.
- all payment distribution policies reference existing canonical concepts.
- all declared strategy identifiers have implemented handlers.
- numeric parameters are numeric.
- fraction counts are positive integers.
- anchors are known and supported.
- sourceEvidenceRef exists for official sections where applicable.
- no executable formula strings exist.
- no duplicate canonical concept aliases exist across conflicting concepts.

If validation fails, engines must not run.

## Boundary Application Examples

### Payment Distribution Boundary

Payment distribution policies must live in JSON.

The Payment Distribution Engine receives:

- period
- calculated concepts
- payment distribution policy section from the rule pack
- optional monthly breakdown facts

The engine outputs:

- projectedPayments
- blockedPayments
- excludedConcepts
- unmappedConcepts
- warnings
- payoutTruth false
- rulePack metadata

The engine must not know that production pays in thirds or activity pays at quarter close unless the active rule pack says so.

### Monthly Cashflow Boundary

Monthly Cashflow Projection Engine must consume only the output of the Payment Distribution Engine plus optional canonical financial category metadata from the active rule pack.

It must not consume quarterlyResult directly.

It must not recalculate bonuses.

It must only aggregate projectedPayments by month, preserve blocked and excluded concepts, preserve null values, and keep payoutTruth false.

### UI/View Boundary

Canonical financial categories may live in rule packs because they define economic buckets.

UI layout must not live in rule packs as economic truth.

View schemas may map canonical financial categories into:

- labels
- colors
- column order
- grouping order
- visibility
- compact/mobile presentation

The UI may decide how to display a bucket, but not whether the bucket exists economically.

## Consequences

### Positive consequences

- Rule changes can be made through rule pack updates without rewriting engines.
- Engine behavior becomes reusable across carriers and years.
- Tests can validate that engines obey rule packs.
- Business truth becomes traceable to evidence.
- UI can evolve without owning economic truth.
- Future carrier adapters become easier to add.
- Auditability improves through rule pack versioning and hashes.

### Negative consequences

- Rule pack schema validation becomes mandatory.
- JSON governance becomes a critical system concern.
- Incorrect rule packs can produce incorrect projections even if engines are correct.
- More upfront architecture work is required.
- Rule pack files can become large unless domain boundaries are maintained.
- Engines become dependent on high-quality rule pack metadata.
- Debugging requires visibility into both engine behavior and active rule pack identity.

## Risks and Mitigations

### Risk 1: Rule pack JSON becomes a monolith

Mitigation:

Rule packs must be organized by domain or clearly separated sections:

- metadata
- conceptsDictionary
- qualificationPolicies
- bonusCalculationPolicies
- paymentDistributionPolicies
- canonicalFinancialCategories
- evidenceRequirements

Large packs may be split by domain and composed at load time.

### Risk 2: Rule packs drift from official evidence

Mitigation:

Official rule sections should include sourceEvidenceRef pointing to official document sections, ADRs, governance notes or evidence records.

Tests should assert expected behavior from official examples when available.

### Risk 3: Engines become too generic and hard to debug

Mitigation:

Engine outputs must remain explainable.

Outputs should include:

- sourceConcept
- canonicalConcept
- ruleId
- strategyId
- sourceEvidenceRef
- blockedReasons
- missingInputs
- warnings
- rulePackId
- rulePackVersion
- rulePackHash
- confidence/status metadata

### Risk 4: Developers reintroduce hardcoded business rules

Mitigation:

Tests should fail when a new hardcoded concept, alias, cadence, threshold or payable/non-payable decision appears in an engine where the rule should come from JSON.

### Risk 5: Unsafe formula execution

Mitigation:

Rule packs must never contain executable code or strings evaluated as code.

Only approved strategy identifiers and typed parameters are allowed.

### Risk 6: Loss of temporal traceability

Mitigation:

Every output that depends on a rule pack must carry rulePackId, rulePackVersion and rulePackHash.

Official rule packs are immutable. Corrections require new versions.

## Testing Requirements

Minimum tests:

1. Dynamic concept alias resolution from JSON.
2. Unknown concept routes to unmappedConcepts, not zero.
3. payable=false routes to excludedConcepts, not blockedPayments.
4. deferred_equal_parts works from rule pack parts.
5. single_payment works from rule pack anchor.
6. monthly_breakdown_required blocks when breakdown is missing.
7. incomplete rule blocks with explicit reason.
8. invalid rule pack fails before engine execution.
9. blocked input propagates blocked state without converting to zero.
10. unknown input propagates without converting to zero.
11. not_modelled or not_modeled propagates without converting to zero.
12. payoutTruth remains false without commission statement evidence.
13. no quarterlyResult dependency in Monthly Cashflow Projection Engine.
14. fake bonus concept in rule pack can be processed without code changes.
15. rulePackId, rulePackVersion and rulePackHash are attached to engine outputs.
16. rule pack formula strings are rejected.
17. duplicate aliases across conflicting canonical concepts are rejected.
18. Fail-Fast validation prevents engine execution when the active rule pack is invalid.

## Implementation Order

1. Approve this ADR with correct repo ADR numbering.
2. Define the rule pack schema or validator boundary.
3. Add paymentDistributionPolicies to the active partner compensation rule pack.
4. Refactor Payment Distribution Engine to consume rule pack policies.
5. Add tests for dynamic alias, non-payable, unknown, incomplete rule, invalid schema and blocked propagation.
6. Add rule pack identity metadata to outputs.
7. Implement Monthly Cashflow Projection Engine after payment distribution is rule-pack driven.
8. Later add statement reconciliation and payout truth engine.

## Non-goals

This ADR does not define specific SMNYL 2026 compensation amounts.

This ADR does not replace official documents.

This ADR does not implement UI.

This ADR does not authorize AI-generated rules.

This ADR does not confirm payout truth.

This ADR does not define a general-purpose expression language.

This ADR does not allow executable code inside JSON.

## Decision Summary

Forge OS will move variable compensation logic out of JavaScript engines and into versioned JSON rule packs.

Engines will remain deterministic processors that obey rule packs, validate rule pack shape, preserve uncertainty states, attach rule pack identity metadata, and never confuse projections with paid truth.

The governing principle is:

If a rule can change by official document, it does not belong inside the engine.

Rules live in JSON.

Engines obey.

Evidence confirms.

UI shows.

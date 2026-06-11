# Forge Fixture Catalog v1.0

Forge Fixture Foundation v1.0 provides synthetic canonical data for local tests and future schema validation.

These fixtures are not real client, advisor, candidate, product, policy or financial records. They exist only to make Forge tests repeatable without improvised input.

## Principles

- All data is synthetic.
- IDs use canonical fields where applicable:
  - `advisorId`
  - `candidateId`
  - `prospectId`
  - `clientId`
  - `policyId`
- Dates use ISO strings.
- Fixtures include positive scenarios and risk scenarios.
- Fixtures align with `SCHEMA_CATALOG.md` and the current schema files.
- Existing `fixtures/vida-mujer-*` files were left unchanged.

## Fixtures

### `fixtures/advisor-demo.json`

Represents a synthetic active advisor with sales DNA, performance score and a followup risk.

Can feed:

- NASH advisor performance scenarios
- Manager reports
- Team intelligence tests
- Future advisor schema validation

Scenario:

- Positive: consultative advisor with relationship-building strength.
- Risk: followup gap and weaker closing stage.

### `fixtures/candidate-demo.json`

Represents a synthetic manager-screened candidate.

Can feed:

- Candidate Intelligence
- Candidate Assessment
- Precontract workflows
- Manager recruiting tests

Scenario:

- Positive: strong local roots, drive and character.
- Risk: limited insurance-specific experience.

### `fixtures/prospect-demo.json`

Represents a synthetic prospect for NASH and sales conversion tests.

Can feed:

- NASH context builder
- Intent and objection tests
- First contact and followup tests
- Forge AI Connector dry runs

Scenario:

- Positive: family-protection motivation and response to outreach.
- Risk: budget concern.

### `fixtures/client-demo.json`

Represents a synthetic active client profile.

Can feed:

- Relationship Intelligence
- Policy Operations
- Manager review scenarios

Scenario:

- Positive: recent positive response.
- Risk: review due soon.

### `fixtures/policy-demo.json`

Represents a synthetic active policy with explicit financial values.

Can feed:

- Policy detail engine
- Relationship timeline engine
- Renewal and payment reminder scenarios
- Product intelligence tests that need non-real product names

Scenario:

- Positive: active policy with explicit financial data.
- Risk: payment and review dates are approaching.

### `fixtures/relationship-demo.json`

Represents a synthetic relationship input bundle with history and events.

Can feed:

- Relationship timeline
- Relationship next action
- Life event detection
- Referral opportunity
- Engagement and review engines

Scenario:

- Positive: trusted relationship with recent inbound response.
- Risk: policy review window should be acted on before referral timing.

### `fixtures/nash-decision-demo.json`

Represents a synthetic NASH master intelligence output.

Can feed:

- Forge AI Connector
- NASH report consumers
- Manager coaching tests
- Prompt safety tests

Scenario:

- Positive: clear intent and next best action.
- Risk: pressure could increase resistance.

### `fixtures/relationship-report-demo.json`

Represents a synthetic Relationship Intelligence master output.

Can feed:

- Forge AI Connector
- Advisor action queues
- Relationship report validation

Scenario:

- Positive: clear service reason to contact.
- Risk: referral ask would be early before service completion.

### `fixtures/manager-report-demo.json`

Represents a synthetic manager-facing coaching report.

Can feed:

- Manager Intelligence
- Coaching workflows
- Team risk reporting

Scenario:

- Positive: coachable pattern with concrete drills.
- Risk: pipeline can stall without next actions.

### `fixtures/precontract-demo.json`

Represents a synthetic precontract progress case.

Can feed:

- Precontract Intelligence
- Candidate-to-advisor lifecycle tests
- Manager development workflows

Scenario:

- Positive: measurable policies and commissions.
- Risk: candidate remains below the configured office thresholds for the active cycle.

## Recruitment Lifecycle Fixtures

### `fixtures/recruitment/recruit-identity-demo.json`

Represents a durable person identity with multiple candidate/application references.

Can feed:

- Recruit identity matching
- Reentry review
- Duplicate detection tests

Scenario:

- Positive: previous history is attached to one durable person.
- Risk: reentry may be evaluated as a new person if `recruitIdentityId` is ignored.

### `fixtures/recruitment/recruitment-application-first-attempt.json`

Represents a first application attempt that ends in rejection after an expired cycle.

Can feed:

- Application lifecycle tests
- Reentry comparison tests

Scenario:

- Positive: first attempt remains auditable.
- Risk: previous failure can be ignored by later managers.

### `fixtures/recruitment/recruitment-application-reentry.json`

Represents a reentry after previous attempt history.

Can feed:

- Reentry review
- Multi-application lifecycle tests

Scenario:

- Positive: reentry is tied to the same durable identity.
- Risk: prior expired cycle requires closer coaching.

### `fixtures/recruitment/recruitment-application-manager-change.json`

Represents manager reassignment during recruitment.

Can feed:

- Manager assignment timeline tests
- Progress attribution tests

Scenario:

- Positive: manager change is assignment history, not overwrite.
- Risk: production or coaching attribution may be assigned to the wrong manager.

### `fixtures/recruitment/recruitment-application-office-change.json`

Represents office transfer during recruitment.

Can feed:

- Office assignment timeline tests
- Rule config selection tests

Scenario:

- Positive: office change preserves rule config lineage.
- Risk: office shopping or inconsistent rules.

### `fixtures/recruitment/precontract-cycle-active.json`

Represents an active precontract cycle with a case-specific rule snapshot.

Can feed:

- Precontract lifecycle tests
- Rule snapshot validation

Scenario:

- Positive: active progress with explicit configured rules.
- Risk: below configured target.

### `fixtures/recruitment/precontract-cycle-expired.json`

Represents an expired key/cycle.

Can feed:

- Expiration handling
- Reentry risk review

Scenario:

- Positive: expired cycle remains historical context.
- Risk: low activity and expired key.

### `fixtures/recruitment/precontract-cycle-reactivated.json`

Represents a reactivated cycle with previous cycle history.

Can feed:

- Reactivation rules
- Multi-cycle lifecycle tests

Scenario:

- Positive: reactivation has prior cycle context and a new rule snapshot.
- Risk: repeated cycles can hide weak activity.

### `fixtures/recruitment/advisor-conversion-success.json`

Represents a successful conversion to advisor.

Can feed:

- Advisor conversion audit
- Candidate-to-advisor lifecycle tests

Scenario:

- Positive: conversion links identity, application, cycle, manager, office and rule snapshot.
- Risk: early ramp-up still needs monitoring.

### `fixtures/recruitment/recruitment-lifecycle-full-demo.json`

Represents the full recruitment lifecycle from durable identity to advisor conversion.

Can feed:

- Full lifecycle acceptance tests
- Future recruitment orchestrator fixtures

Scenario:

- Positive: complete lifecycle graph.
- Risk: model complexity requires strict validation before engine work.

### `fixtures/recruitment/organization-profile-demo.json`

Represents synthetic organization and office context for selecting active recruitment rules.

Can feed:

- Organization Profile validation
- Office Rules Config selection
- Future recruitment lifecycle setup tests

Scenario:

- Positive: active profile points to one active rules config.
- Risk: config drift if cycles do not store snapshots.

### `fixtures/recruitment/office-rules-config-standard.json`

Represents a balanced synthetic office rules configuration.

Can feed:

- Rule snapshot tests
- Precontract lifecycle setup
- Advisor conversion readiness scenarios

Scenario:

- Positive: balanced requirements across assessment, activity and production.
- Risk: active rules can change mid-cycle, so cycles need snapshots.

### `fixtures/recruitment/office-rules-config-light.json`

Represents a lighter synthetic office rules configuration.

Can feed:

- Reentry or entry-level recruiting scenarios
- Rules variation tests

Scenario:

- Positive: supports controlled lower-bar entry paths.
- Risk: lower thresholds require quality monitoring.

### `fixtures/recruitment/office-rules-config-strict.json`

Represents a stricter synthetic office rules configuration.

Can feed:

- High-control recruiting scenarios
- Compliance-heavy conversion tests

Scenario:

- Positive: emphasizes quality and approval before conversion.
- Risk: stricter requirements can slow conversion.

## Recruitment Evidence Fixtures

Folder:

- `fixtures/recruitment/evidence/`

Purpose:

- Store synthetic evidence fixtures for Interview Intelligence, Market Evidence, RDA, Project 200 and Precontract Activity Evidence.
- These fixtures prove that Forge can preserve verifiable evidence instead of only storing scores.

### `fixtures/recruitment/evidence/question-evidence-strong-candidate.json`

Represents question-level evidence for a strong candidate.

Can feed:

- Question Evidence validation
- Interview Intelligence inputs
- Candidate Assessment evidence mapping

Scenario:

- Positive: candidate shows ownership and perseverance.
- Risk: evidence still needs manager confirmation.

### `fixtures/recruitment/evidence/question-evidence-weak-candidate.json`

Represents question-level evidence for a weak candidate.

Can feed:

- Coachability evidence tests
- Interview risk mapping

Scenario:

- Positive: weak evidence is explicitly captured instead of inferred.
- Risk: missed assignment before selection interview.

### `fixtures/recruitment/evidence/interview-evidence-strong-candidate.json`

Represents complete interview evidence for a strong candidate.

Can feed:

- Interview Evidence validation
- Candidate Assessment inputs
- Recruitment review

Scenario:

- Positive: motivation, internal standards and process acceptance are documented.
- Risk: market validation still needs follow-up.

### `fixtures/recruitment/evidence/interview-evidence-weak-candidate.json`

Represents complete interview evidence for a weak candidate.

Can feed:

- Interview Evidence validation
- Manager review scenarios

Scenario:

- Positive: risks are explicit and auditable.
- Risk: low money motivation and missed assignments.

### `fixtures/recruitment/evidence/rda-strong-market.json`

Represents strong RDA evidence.

Can feed:

- RDA validation
- Market Evidence review

Scenario:

- Positive: warm relationship and scheduled appointment.
- Risk: still requires actual contact outcome.

### `fixtures/recruitment/evidence/rda-weak-market.json`

Represents weak RDA evidence.

Can feed:

- RDA validation
- Weak market scenarios

Scenario:

- Positive: weak evidence is stored as weak evidence, not inflated.
- Risk: distant relationship and no appointment.

### `fixtures/recruitment/evidence/project200-strong-market.json`

Represents strong Project 200 evidence.

Can feed:

- Project 200 validation
- NASAT evidence mapping

Scenario:

- Positive: warm access and usable NASAT evidence.
- Risk: Project 200 size still does not guarantee success.

### `fixtures/recruitment/evidence/project200-weak-market.json`

Represents weak Project 200 evidence.

Can feed:

- Project 200 validation
- Weak market review

Scenario:

- Positive: weak NASAT evidence remains visible.
- Risk: low access and unknown decision power.

### `fixtures/recruitment/evidence/market-evidence-strong.json`

Represents strong market evidence.

Can feed:

- Market Evidence validation
- Candidate market quality review

Scenario:

- Positive: strong Project 200 size, Project 30, RDA count, accessibility and response rate are stored.
- Risk: values are stored evidence and must not be treated as automatic success.

### `fixtures/recruitment/evidence/market-evidence-weak.json`

Represents weak market evidence.

Can feed:

- Market Evidence validation
- Coaching or rejection review

Scenario:

- Positive: weak market facts are explicit.
- Risk: low response rate and limited RDA.

### `fixtures/recruitment/evidence/precontract-activity-high.json`

Represents high precontract activity evidence.

Can feed:

- Precontract Activity Evidence validation
- Mick / Behavior Intelligence future tests
- Manager coaching review

Scenario:

- Positive: high calls, referrals, RDA, interviews, applications, paid policies, training and 25-point activity.
- Risk: activity still requires quality review.

### `fixtures/recruitment/evidence/precontract-activity-low.json`

Represents low precontract activity evidence.

Can feed:

- Precontract Activity Evidence validation
- Precontract risk review

Scenario:

- Positive: low activity is captured explicitly.
- Risk: low calls, no RDA, no paid policies and missed role-play.

## Gaps Found

- No schema validation library is installed or declared, so `fixture-validation-test.js` performs structural checks without full JSON Schema validation.
- `client-demo.json` maps to `relationship.schema.json`, but there is no separate `client.schema.json` yet.
- Relationship engines currently accept `client.id`, `client.clientId`, and `input.clientId`; fixtures include both `clientId` and `id` for compatibility.
- Policy schema requires `policyId`, while legacy policy engines often use `id`; fixture includes both.
- NASH output uses `nextBestAction`, while Relationship output uses `nextAction`.
- Existing Vida Mujer fixtures are product-specific and are not yet connected to this canonical fixture set.
- There is no shared fixture index or loader.
- Precontract fixture now treats days, policy minimums and commission minimums as Organization Profile / Office Rules Config values, not Forge constants.
- Recruitment lifecycle fixtures now exist, but they are validated by a structural test rather than full JSON Schema validation.
- Interview is represented inside the full lifecycle fixture, and evidence-specific interview fixtures now exist under `fixtures/recruitment/evidence/`.
- Organization profile and office rules config fixtures now exist, while precontract cycle fixtures still keep snapshots for historical audit.
- Evidence fixtures now exist under `fixtures/recruitment/evidence/`, but current tests are structural and do not perform full JSON Schema validation.

## Recommendations

1. Add a future `client.schema.json` or rename `relationship.schema.json` if it is meant to be the durable client profile contract.
2. Add schema-aware validation once a validation dependency or local schema validator is approved.
3. Create a fixture index file after these fixtures are accepted.
4. Keep canonical IDs in every future fixture.
5. Add negative fixtures in a later PAQ for malformed IDs, missing dates and missing action fields.
6. Do not wire these fixtures into engines until schema and fixture validation contracts are accepted.
7. Add negative organization rules fixtures before building recruitment engines.

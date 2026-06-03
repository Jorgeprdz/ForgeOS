# Forge Schema Catalog v1.0

Forge Schema Foundation v1.0 defines the first official data contracts for Forge OS.

These schemas do not create engines and do not change existing logic. They document the minimum contracts that future engines, orchestrators, reports and tests should converge toward.

## Principles

- Forge decides; AI explains.
- Schemas define structure, not business conclusions.
- Financial values, products, projections and recommendations must come from explicit source data.
- Contracts use `additionalProperties: true` in v1.0 because the current repository contains mixed legacy and new module styles.
- Required fields are intentionally minimal so current engines can map into these contracts without broad refactors.

## Schemas

### `schemas/advisor.schema.json`

Advisor identity and commercial profile.

Required:

- `advisorId`
- `name`
- `status`

Used by:

- NASH advisor performance
- Manager intelligence
- Team intelligence
- Sales DNA and coaching workflows

Notes:

- Current modules use `advisorId` consistently.
- Some legacy entity files use epoch numbers for timestamps, so the schema accepts ISO strings or numbers.

### `schemas/candidate.schema.json`

Candidate profile for recruitment and career intelligence.

Required:

- `candidateId`
- `name`
- `status`

Used by:

- Candidate Intelligence
- Manager recruitment workflows
- Future precontract bridge

Notes:

- Based on AGENTS hard factors and vital factors.
- This is a profile schema, not an assessment output.

### `schemas/prospect.schema.json`

Prospect profile for sales conversion and NASH.

Required:

- `prospectId`
- `name`
- `status`

Used by:

- First Contact
- Followup
- NASH context
- Sales conversion workflows

Notes:

- NASH memory and master intelligence use `prospectId`.
- First contact entities currently require only `prospectId`, `channel`, and `message`; this schema expands the durable prospect contract.

### `schemas/policy.schema.json`

Policy contract for policy operations, relationship intelligence and product intelligence.

Required:

- `policyId`
- `clientId`
- `policyNumber`
- `productName`

Used by:

- Policy Operations
- Relationship Intelligence
- Product Intelligence

Notes:

- Existing modules sometimes use `id` instead of `policyId`.
- Schema includes both `policyId` and optional `id` to expose the duplication clearly.
- Financial values are optional but typed; they must not be invented.

### `schemas/relationship.schema.json`

Client relationship profile.

Required:

- `clientId`
- `name`
- `relationshipStatus`

Used by:

- Relationship timeline
- Relationship next action
- Referral opportunity
- Engagement and review engines

Notes:

- Existing relationship code often accepts `client.id`, `client.clientId`, or `input.clientId`.
- Schema includes optional `id` to support current module inputs while recommending `clientId` as the canonical field.

### `schemas/nash-report.schema.json`

NASH master intelligence report.

Required:

- `engine`
- `version`
- `advisor`
- `prospect`
- `intent`
- `nextBestAction`
- `confidence`

Used by:

- NASH master orchestrator
- Forge AI Connector
- Manager and coaching intelligence

Notes:

- `intent` and `nextBestAction` are authoritative decision fields.
- Generative AI may explain or draft from this report, but must not modify these fields.

### `schemas/relationship-report.schema.json`

Relationship Intelligence master report.

Required:

- `engine`
- `version`
- `clientId`
- `nextAction`
- `opportunities`
- `confidence`

Used by:

- Relationship master orchestrator
- Forge AI Connector
- Advisor relationship actions

Notes:

- `nextAction` is authoritative.
- AI may explain the relationship recommendation but should not invent life events, referral timing or opportunities.

### `schemas/manager-report.schema.json`

Manager-facing intelligence report.

Required:

- `managerId`
- `reportType`
- `generatedAt`
- `summary`
- `recommendedActions`

Used by:

- Manager alerts
- Team intelligence
- Coaching workflows
- Future candidate and precontract intelligence

Notes:

- Current NASH manager/team outputs do not yet share one normalized manager report contract.
- This schema defines the target surface for manager-facing outputs.

### `schemas/candidate-assessment.schema.json`

Candidate evaluation output.

Required:

- `candidateId`
- `assessmentId`
- `overallScore`
- `recommendation`
- `riskLevel`

Used by:

- Candidate Intelligence
- Manager recruitment decisions
- Future interview intelligence

Notes:

- This is decision support, not an automatic hiring decision.
- Assessment factors are based on AGENTS hard factors and vital factors.
- `COACH` means the candidate has potential but needs manager intervention before advancing.
- Current Candidate Assessment scores are foundation heuristics.
- Assessment weights should move to Organization Profile or Office Rules Config in a future configurable version.

### `schemas/recruit-identity.schema.json`

Durable person identity across recruitment attempts.

Required:

- `recruitIdentityId`
- `displayName`
- `identityStatus`

Used by:

- Recruitment Lifecycle Domain
- Candidate duplicate detection
- Reentry review
- Cross-office and cross-manager history

Notes:

- `RecruitIdentity` is the permanent person-level identity.
- `candidateId` is not permanent identity.

### `schemas/recruitment-application.schema.json`

One attempt for a recruit identity to enter the advisor career path.

Required:

- `applicationId`
- `recruitIdentityId`
- `candidateId`
- `applicationStatus`
- `createdAt`

Used by:

- Candidate Intelligence
- Interview Intelligence
- Precontract Intelligence
- Advisor conversion tracking

Notes:

- Reentries should usually create a new `applicationId`.
- Current state should be preserved with critical event history.

### `schemas/interview.schema.json`

Interview contract for Recruitment Lifecycle.

Required:

- `interviewId`
- `applicationId`
- `phase`
- `scheduledAt`
- `recommendation`

Used by:

- Interview Intelligence
- Candidate assessment support
- Recruitment application lifecycle

Notes:

- Interviews belong to applications.
- No-shows, reschedules, scores, risks and recommendations should persist.
- Interview recommendation is decision support, not automatic approval.
- Known mismatch: this compatibility schema still uses generic phases, while `schemas/interview-evidence.schema.json` uses business phases: `INITIAL_INTERVIEW`, `SELECTION_INTERVIEW`, `CAREER_INTERVIEW`, `ADDITIONAL_INTERVIEW`.

### `schemas/question-evidence.schema.json`

Question-level evidence captured during interviews.

Required:

- `questionEvidenceId`
- `candidateId`
- `question`
- `evidence`
- `detectedSignal`
- `category`
- `confidence`
- `capturedAt`

Used by:

- Interview Intelligence
- Candidate Assessment
- Recruitment Intelligence

Notes:

- Maps question → evidence → detected signal.
- Stores observed evidence and confidence in the mapping, not a candidate score.
- Evidence should retain source context and must not invent candidate facts.

### `schemas/interview-evidence.schema.json`

Complete interview evidence package.

Required:

- `interviewEvidenceId`
- `interviewId`
- `candidateId`
- `phase`
- `date`
- `interviewer`
- `questionEvidence`
- `recommendation`

Used by:

- Interview Intelligence
- Candidate Assessment inputs
- Recruitment lifecycle review

Notes:

- Supports business phases: `INITIAL_INTERVIEW`, `SELECTION_INTERVIEW`, `CAREER_INTERVIEW`, `ADDITIONAL_INTERVIEW`.
- Preserves question-level evidence, strengths, risks and recommendation.
- Recommendation is decision support, not automatic approval.

### `schemas/rda.schema.json`

Referido de Asesor evidence record.

Required:

- `rdaId`
- `candidateId`
- `name`
- `relationship`
- `contactStatus`
- `appointmentStatus`
- `createdAt`

Used by:

- Recruitment Intelligence
- Market evidence
- Precontract activity review

Notes:

- RDA is a relationship and market-access signal.
- Contact and appointment status are stored evidence, not calculated market quality.

### `schemas/project200.schema.json`

Initial market list evidence.

Required:

- `projectId`
- `candidateId`
- `prospects`
- `createdAt`

Used by:

- Candidate Assessment market quality
- Recruitment Intelligence
- Precontract readiness review

Notes:

- Each prospect can store relationship and NASAT evidence.
- Project 200 size alone does not prove market quality or success.

### `schemas/market-evidence.schema.json`

Market evidence for recruitment and candidate assessment.

Required:

- `marketEvidenceId`
- `candidateId`
- `project200Size`
- `project30Size`
- `rdaCount`
- `marketStrength`
- `marketAccessibility`
- `responseRate`
- `capturedAt`

Used by:

- Candidate Assessment
- Recruitment Intelligence
- Manager review

Notes:

- Stores observed market facts only.
- Does not calculate market strength, accessibility or response probability.
- Separates market size from market quality.

### `schemas/precontract-activity-evidence.schema.json`

Operational evidence during precontract.

Required:

- `activityEvidenceId`
- `candidateId`
- `capturedAt`
- `calls`
- `referrals`
- `rda`
- `initialInterviews`
- `closingInterviews`
- `applications`
- `paidPolicies`
- `trainingSessions`
- `certifications`
- `evaluations`
- `twentyFivePointScore`

Used by:

- Precontract Intelligence
- Mick / Behavior Intelligence
- Manager coaching review

Notes:

- Stores activity evidence only; it does not calculate readiness.
- `twentyFivePointScore` is the JSON field for the 25-point activity signal.
- Activity is a behavior predictor, not just a result.

### `schemas/manager-assignment.schema.json`

Manager ownership assignment for a recruitment application.

Required:

- `managerAssignmentId`
- `applicationId`
- `candidateId`
- `managerId`
- `assignmentStatus`
- `startedAt`

Used by:

- Manager Intelligence
- Recruitment ownership audit
- Progress attribution

Notes:

- Manager changes are assignments, not overwrites.
- Historical production and coaching attribution should reference the active assignment at event time.

### `schemas/office-assignment.schema.json`

Office ownership assignment for a recruitment application.

Required:

- `officeAssignmentId`
- `applicationId`
- `candidateId`
- `officeId`
- `assignmentStatus`
- `startedAt`

Used by:

- Office transfer audit
- Office rules config selection
- Multi-office recruitment lifecycle

Notes:

- Office changes are assignments, not overwrites.
- Office assignment controls which Office Rules Config applies.

### `schemas/organization-profile.schema.json`

Organization and office context used to select active recruitment rules.

Required:

- `organizationId`
- `officeId`
- `managerId`
- `channel`
- `country`
- `currency`
- `activeRulesConfigId`

Used by:

- Recruitment Lifecycle Domain
- Office rules selection
- Manager and office reporting

Notes:

- This profile stores organizational context, not universal thresholds.
- `activeRulesConfigId` points to the current `office-rules-config` for this office context.

### `schemas/office-rules-config.schema.json`

Configurable office recruitment and precontract rules.

Required:

- `officeRulesConfigId`
- `organizationId`
- `officeId`
- `currency`
- `effectiveFrom`
- `precontractRules`
- `reactivationRules`
- `contractingCriteria`
- `scoringWeights`

Used by:

- Precontract lifecycle rule snapshots
- Recruitment scoring
- Reactivation governance
- Advisor conversion readiness

Notes:

- Official window duration, policy minimum, commission minimum, currency, reactivation rules, contracting criteria and scoring weights are configurable.
- These values must not be treated as global Forge constants.
- Historical cycles store snapshots of these rules and should not be recalculated under new rules except as separate analysis.
- `precontractRules.officialWindowDays` is the configurable source for official-window clock calculations.

### `schemas/precontract-cycle.schema.json`

One precontract lifecycle cycle with rule snapshot and progress.

Required:

- `cycleId`
- `applicationId`
- `candidateId`
- `managerId`
- `officeId`
- `cycleStatus`
- `ruleSnapshot`

Used by:

- Precontract Lifecycle Engine
- Manager development workflows
- Advisor conversion readiness

Notes:

- `cycleId` represents one precontract cycle.
- A candidate can have multiple cycles.
- Each cycle stores the Organization Profile / Office Rules Config snapshot used at the time.
- Historical cycles should not be recalculated under newer rules except as separate analysis.
- Key-clock support includes `keyStatus`, `keyActivatedAt`, `officialWindowStartedAt` and `officialWindowEndsAt`.
- `daysWithActiveKey`, `daysRemainingInOfficialWindow` and `officialWindowProgressPercent` belong under `derivedMetrics`; they are calculated metrics, not manual required fields.

### `schemas/advisor-conversion.schema.json`

Conversion event from recruitment application or precontract cycle into advisor.

Required:

- `advisorConversionId`
- `applicationId`
- `recruitIdentityId`
- `candidateId`
- `advisorId`
- `conversionStatus`
- `convertedAt`

Used by:

- Candidate-to-advisor transition
- Manager conversion reporting
- Advisor creation audit

Notes:

- Advisor conversion links recruitment history to the new advisor identity.
- Conversion must not erase candidate or precontract history.

### `schemas/precontract.schema.json`

Precontract progress and readiness contract.

Required:

- `precontractId`
- `candidateId`
- `managerId`
- `lifecycle`
- `progress`
- `contractReadiness`

Used by:

- Precontract Intelligence
- Manager development workflows
- Candidate-to-advisor career transition

Notes:

- Precontract is not a fixed 90-day rule.
- The contract must support informal activity before key activation, key activation date, configurable official window, key expiration, key reactivation, multiple cycles and accumulated history.
- Days, minimum policy count and minimum commission amount must not be hardcoded in Forge.
- Those values belong to Organization Profile / Office Rules Config and may be represented as `officeRulesSnapshot` for auditability.
- Progress values must come from explicit production and commission data.
- `schemas/precontract-cycle.schema.json` is the more precise lifecycle contract for multiple cycles and rule snapshots.

## Inconsistencies Detected

- `id`, `clientId`, and `prospectId` are used differently across modules.
- Policy modules use `id` and `policyNumber`; schema introduces canonical `policyId` while preserving optional `id`.
- Relationship master accepts `client.id`, `client.clientId`, or `input.clientId`.
- NASH uses `nextBestAction`; Relationship uses `nextAction`.
- NASH report has `recommendedResponse`; Relationship report has `reviewRecommendation`.
- Some legacy modules use ESM exports while newer NASH and Relationship modules use CommonJS.
- Timestamps are not normalized: some files use epoch numbers, others use strings or null.
- There is no shared confidence object; reports use raw `confidence` numbers in several places.
- `schemas/interview.schema.json` uses generic interview phases, while `schemas/interview-evidence.schema.json` uses business phases: `INITIAL_INTERVIEW`, `SELECTION_INTERVIEW`, `CAREER_INTERVIEW`, `ADDITIONAL_INTERVIEW`.

## Duplicated Fields

- `id` vs `advisorId`, `prospectId`, `clientId`, `policyId`, `candidateId`.
- `nextAction` vs `nextBestAction`.
- `relationshipScore`, `relationshipHealth`, and `engagementScore` are related but separate signals.
- `recommendedStrategy`, `recommendedResponse`, and `reviewRecommendation` overlap semantically but serve different engines.
- `status` appears across advisor, prospect, candidate and policy contracts with different meanings.
- `confidence` appears across engines without a shared confidence source or rationale contract.

## Recommendations

1. Adopt canonical IDs by domain:
   - `advisorId`
   - `candidateId`
   - `prospectId`
   - `clientId`
   - `policyId`

2. Keep legacy `id` fields temporarily as compatibility aliases.

3. Create a shared `action` contract in a future PAQ:
   - `action`
   - `reason`
   - `priority`
   - `ownerId`
   - `dueDate`
   - `confidence`

4. Create a shared `confidence` contract in a future PAQ:
   - `score`
   - `source`
   - `rationale`
   - `inputsUsed`

5. Normalize timestamps to ISO strings at the schema boundary.

6. Keep AI outside schema decision authority:
   - AI can consume `nash-report` and `relationship-report`.
   - AI cannot create new `intent`, `nextAction`, `nextBestAction`, products, premiums or projections.

7. Add schema validation tests after the schemas are accepted:
   - Validate representative NASH report fixtures.
   - Validate representative Relationship report fixtures.
   - Validate policy and prospect fixtures.

8. Do not refactor existing engines until schema contracts are approved and fixtures exist.

9. Align `schemas/interview.schema.json` phases with business interview phases after Interview Evidence contracts are accepted.

10. Add source metadata consistently to future evidence contracts so manager-confirmed evidence can be distinguished from self-report, activity logs, document uploads, transcripts, AI extraction and system calculation.

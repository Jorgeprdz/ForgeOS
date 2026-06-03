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

### `schemas/precontract.schema.json`

Precontract progress and readiness contract.

Required:

- `precontractId`
- `candidateId`
- `managerId`
- `startDate`
- `deadlineDate`
- `progress`
- `contractReadiness`

Used by:

- Precontract Intelligence
- Manager development workflows
- Candidate-to-advisor career transition

Notes:

- Business rules from AGENTS are encoded as documented thresholds:
  - 90 day window
  - 8 policies minimum
  - 24000 MXN commissions minimum
- Progress values must come from explicit production and commission data.

## Inconsistencies Detected

- `id`, `clientId`, and `prospectId` are used differently across modules.
- Policy modules use `id` and `policyNumber`; schema introduces canonical `policyId` while preserving optional `id`.
- Relationship master accepts `client.id`, `client.clientId`, or `input.clientId`.
- NASH uses `nextBestAction`; Relationship uses `nextAction`.
- NASH report has `recommendedResponse`; Relationship report has `reviewRecommendation`.
- Some legacy modules use ESM exports while newer NASH and Relationship modules use CommonJS.
- Timestamps are not normalized: some files use epoch numbers, others use strings or null.
- There is no shared confidence object; reports use raw `confidence` numbers in several places.

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

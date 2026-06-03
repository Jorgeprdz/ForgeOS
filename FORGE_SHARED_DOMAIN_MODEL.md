# Forge Shared Domain Model v1.0

Purpose:

Identify overlap across Recruitment, Recruitment Knowledge, Manager Compensation, and Compensation domains so Forge can avoid duplicated entities, duplicated metrics, duplicated event names, and duplicated rule/config sources.

Sources reviewed:

- `RECRUITMENT_DOMAIN_MODEL.md`
- `RECRUITMENT_KNOWLEDGE_BASE.md`
- `MANAGER_COMPENSATION_KNOWLEDGE_BASE.md`
- `COMPENSATION_DOMAIN_MODEL.md`

This is documentation only. It does not implement code, schemas, engines, UI, tests, commits, or migrations.

## Executive Finding

Recruitment and Compensation are not separate worlds. They are two phases of the same commercial lifecycle:

Candidate -> Precontract -> Advisor -> Professional Advisor -> Partner / Manager.

The strongest shared domain is:

- Person identity.
- Assignment history.
- Advisor lifecycle.
- Activity and production evidence.
- Rule snapshots.
- Policy / commission events.
- Manager attribution.

Forge should not let every future engine redefine these concepts. Shared primitives must exist before new engines or schemas are created.

## 1. Shared Entities

### Person / Commercial Actor

Duplicates found:

- `RecruitIdentity` in Recruitment.
- Candidate / Advisor / Partner / Manager in Compensation.
- Advisor / Partner fields in Manager Compensation.

Shared entity proposal:

- `CommercialPerson`

Purpose:

- Durable human identity across candidate, recruit, advisor, manager, partner, beneficiary, and connector/developer roles.

Fields conceptually shared:

- personId.
- identityReviewStatus.
- duplicateRisk.
- contact identity.
- historical roles.
- source records.

Why shared:

- A candidate can become advisor, advisor can become Partner, Partner can remain connected to original recruitment history.
- Compensation attribution should not lose recruitment origin or manager assignment history.

Duplication risk:

- `candidateId`, `advisorId`, and `partnerId` become treated as unrelated people.

### Commercial Role

Duplicates found:

- Candidate.
- Advisor in Development.
- New Professional Advisor.
- Professional Advisor.
- Consolidated Advisor.
- Partner / Manager.
- Senior Partner / Managing Partner.

Shared entity proposal:

- `CommercialRoleAssignment`

Purpose:

- Time-bounded role held by a `CommercialPerson`.

Fields:

- roleAssignmentId.
- personId.
- roleType.
- startedAt.
- endedAt.
- sourceEventId.
- status.

Why shared:

- A person can hold multiple roles over time.
- Engines need role at event time, not only current role.

Duplication risk:

- Compensation stage and recruitment state disagree about whether someone is candidate, advisor, or Partner.

### Advisor Lifecycle / Career Stage

Duplicates found:

- `AdvisorConversion` in Recruitment.
- `AdvisorCareerStage` in Compensation.
- Advisor class / tenure in Manager Compensation.

Shared entity proposal:

- `AdvisorLifecycleStage`

Purpose:

- Canonical stage timeline after conversion into advisor path.

Fields:

- advisorLifecycleStageId.
- advisorId.
- stage.
- startedAt.
- endedAt.
- contestMonth.
- stageSource.
- rulesVersion.

Shared stages:

- Precontract.
- Advisor in Development.
- New Professional Advisor.
- Professional Advisor.
- Consolidated Advisor.
- Partner / Manager.

Duplication risk:

- Different engines calculate contest month, development window, or class independently.

### Assignment

Duplicates found:

- `ManagerAssignment` and `OfficeAssignment` in Recruitment.
- `partnerId`, `officeId`, `managerAssignment`, `originPartnerId` in Compensation and Manager Compensation.

Shared entity proposal:

- `CommercialAssignment`

Purpose:

- Time-bounded ownership or attribution to manager, Partner, office, unit, or organization.

Fields:

- assignmentId.
- subjectType.
- subjectId.
- assignmentType.
- assignedToId.
- officeId.
- unitId.
- startedAt.
- endedAt.
- reason.
- sourceEventId.

Why shared:

- Recruitment ownership, precontract coaching, advisor compensation, Partner attribution, and promotion bonus all depend on who owned the person at event time.

Duplication risk:

- Manager changes overwrite historical attribution and produce wrong compensation or coaching reports.

### Rule Snapshot

Duplicates found:

- `RuleSnapshot` in PrecontractCycle.
- `CompensationRuleSet` in Compensation.
- PCV rules version in Manager Compensation.
- Office Rules Config / Organization Profile in Recruitment.

Shared entity proposal:

- `RuleSnapshot`

Purpose:

- Preserve exact rules applied to a lifecycle decision, compensation period, conversion, or bonus.

Fields:

- ruleSnapshotId.
- domain.
- sourceConfigId.
- ruleSetId.
- effectiveFrom.
- effectiveTo.
- capturedAt.
- sourceDocument.
- appliedToType.
- appliedToId.

Duplication risk:

- Historical precontract cycles or bonus periods are recalculated with newer rules.

### Policy / Production Event

Duplicates found:

- Recruitment precontract metrics mention policies and commissions from explicit production data.
- Compensation defines `PolicyCommissionEvent`.
- Manager Compensation defines `PolicyActivityMetric` and `CommissionMetric`.

Shared entity proposal:

- `CommercialProductionEvent`

Purpose:

- Canonical event for paid policy, issued policy, commission, cancellation, rehabilitation, and policy-count adjustment.

Fields:

- productionEventId.
- personId.
- advisorId.
- policyId.
- eventType.
- lineOfBusiness.
- productId.
- premiumAmount.
- commissionAmount.
- policyCountValue.
- occurredAt.
- periodId.
- source.
- ruleSnapshotId.

Duplication risk:

- Recruitment sees a policy as activity, advisor compensation sees it as paid policy, manager compensation sees it as policy volume; each counts it differently.

### Conservation Snapshot

Duplicates found:

- LIMRA / IGC in advisor compensation.
- Unit LIMRA / IGC in manager compensation.
- Retention / quality concerns in recruitment and precontract.

Shared entity proposal:

- `ConservationSnapshot`

Purpose:

- Canonical indexed snapshot for LIMRA, IGC, siniestralidad, and other retention quality metrics.

Fields:

- conservationSnapshotId.
- subjectType.
- subjectId.
- periodId.
- limra.
- igc.
- siniestralidad.
- source.
- calculatedAt.
- ruleSnapshotId.

Duplication risk:

- Advisor and Partner engines apply different index values for the same period.

### Evidence

Duplicates found:

- Recruitment evidence sources.
- Candidate assessment evidence.
- Market/RDA/precontract activity evidence.
- Compensation source metrics.

Shared entity proposal:

- `EvidenceRecord`

Purpose:

- Auditable source-backed fact used by any decision engine.

Fields:

- evidenceId.
- subjectType.
- subjectId.
- evidenceType.
- source.
- capturedAt.
- confirmedBy.
- confidence.
- payload.

Duplication risk:

- Recruitment evidence, compensation metrics, and manager signals become separate unverifiable facts.

## 2. Shared Metrics

### Activity

Appears in:

- Recruitment activity capacity.
- Precontract progress.
- Compensation paid policies.
- Manager production / activity bonuses.

Canonical metric family:

- calls.
- contacts.
- referrals.
- RDA.
- appointments.
- applications / solicitudes.
- paid policies.
- activity points.
- missed assignments.

Shared rule:

- Activity metric must specify source, period, role, and whether it is behavior activity or production outcome.

Risk:

- Treating production results as the only activity and missing coachability / behavior signals.

### RDA / Connection

Appears in:

- Recruitment Knowledge as referral source and readiness signal.
- Compensation as Bono Conexion.
- Manager compensation as recruiting / Partner attribution.

Canonical metric:

- `connectionAttribution`

Fields:

- connectorId.
- connectedPersonId.
- connectionType.
- source.
- occurredAt.
- eligibleForBonus.

Risk:

- Same RDA counted for recruitment quality but not preserved for compensation attribution.

### Policy Count

Appears in:

- Precontract readiness.
- Training Allowance.
- Bono Conexion.
- Bono Desarrollo.
- Bono Actividad Partner.

Canonical metric:

- `policyCountSnapshot`

Required dimensions:

- lineOfBusiness.
- product.
- paid / issued status.
- first receipt paid.
- annual count rule.
- personal policy exclusion.
- shared policy ratio.
- cancellation adjustment.

Risk:

- Raw number of policies gets used where contest-adjusted count is required.

### Commission Amount

Appears in:

- Precontract progress.
- Training Allowance.
- Bono Inicial.
- Bono Renovacion.
- Partner Productividad / Produccion.

Canonical metric:

- `commissionMetric`

Required dimensions:

- initial vs renewal.
- paid vs projected.
- product schedule.
- policy year.
- line of business.
- period.
- advisor stage.

Risk:

- Initial commissions, renewal commissions, Prima Meta, Prima Pago, and paid commission get mixed.

### Advisor Stage / Tenure

Appears in:

- Recruitment conversion.
- Compensation career stages.
- Manager advisor class / qualification.

Canonical metric:

- `advisorLifecyclePosition`

Required dimensions:

- fechaConexion.
- fechaConcurso.
- contestMonth.
- role/stage.
- class.
- tenureMonths.

Risk:

- Engines use different month math and generate inconsistent eligibility.

### Qualification

Appears in:

- Candidate assessment.
- Precontract readiness.
- Advisor qualified.
- Team qualification.

Canonical metric family:

- candidateReadiness.
- precontractReadiness.
- advisorQualified.
- teamQualification.

Risk:

- "Qualified" means different things without domain prefix.

Recommendation:

- Avoid a generic `qualified` field. Use explicit names:
  - `candidateSelected`.
  - `precontractReady`.
  - `advisorCompensationQualified`.
  - `teamCompensationQualified`.

### Conservation / Retention

Appears in:

- LIMRA.
- IGC.
- Retention potential.
- Advisor qualification.
- Manager gates.

Canonical metrics:

- limra.
- igc.
- siniestralidad.
- retentionRisk.

Risk:

- Recruitment retention potential and policy conservation indexes get conflated.

## 3. Shared Events

### Identity Events

Shared events:

- `PERSON_CREATED`
- `DUPLICATE_REVIEW_STARTED`
- `PERSON_MERGED`
- `PERSON_ARCHIVED`

Maps from:

- `RECRUIT_IDENTITY_CREATED`
- `DUPLICATE_MERGED`

Risk:

- Duplicate review exists only for recruits but not advisors / Partners.

### Assignment Events

Shared events:

- `COMMERCIAL_ASSIGNMENT_STARTED`
- `COMMERCIAL_ASSIGNMENT_CHANGED`
- `COMMERCIAL_ASSIGNMENT_ENDED`

Maps from:

- `MANAGER_ASSIGNED`
- `MANAGER_CHANGED`
- `OFFICE_ASSIGNED`
- `OFFICE_CHANGED`
- Advisor assigned to Partner.
- Manager unit updated.

Risk:

- Assignment history splits into recruitment assignment and compensation assignment.

### Lifecycle Events

Shared events:

- `COMMERCIAL_STAGE_CHANGED`
- `ADVISOR_CONNECTED`
- `ADVISOR_CONTEST_MONTH_ADVANCED`
- `ADVISOR_BECAME_NEW_PROFESSIONAL`
- `ADVISOR_PROMOTED_TO_PARTNER`
- `PARTNER_CONNECTED`

Maps from:

- `ADVISOR_CONVERSION_COMPLETED`
- `ADVISOR_CREATED`
- `CONTRACT_SIGNED`
- `Advisor alta event`
- `Advisor promoted to Partner`

Risk:

- Conversion, connection, alta, and contract signed are treated as the same timestamp.

### Production Events

Shared events:

- `POLICY_ISSUED`
- `POLICY_PAID`
- `COMMISSION_PAID`
- `POLICY_CANCELLED`
- `POLICY_REHABILITATED`
- `POLICY_COUNT_ADJUSTED`

Maps from:

- Recruitment explicit production data.
- Compensation `PolicyCommissionEvent`.
- Manager `PolicyActivityMetric`.

Risk:

- Compensation recalculation does not update recruitment/precontract progress or manager metrics.

### Rule Events

Shared events:

- `RULE_SET_CHANGED`
- `RULE_SNAPSHOT_APPLIED`
- `COMPENSATION_RULESET_ACTIVATED`
- `OFFICE_RULES_CHANGED`
- `ORGANIZATION_RULES_CHANGED`

Risk:

- Rule changes propagate inconsistently across recruitment, precontract, advisor compensation, and manager compensation.

### Intelligence Events

Shared events:

- `RISK_DETECTED`
- `COACHING_ASSIGNED`
- `ALERT_CREATED`
- `BONUS_RISK_DETECTED`

Risk:

- Manager coaching, compensation alerts, and precontract risk become three separate alert systems.

## 4. Shared Configurations

### Organization Profile

Shared config:

- Organization identity.
- Currency.
- Year.
- active role definitions.
- conversion approval roles.
- compensation source documents.

Used by:

- Recruitment.
- Precontract.
- Compensation.
- Manager compensation.

### Office Rules Config

Shared config:

- Official window duration.
- Minimum policies.
- Minimum commissions.
- Whether informal production counts.
- Transfer approval rules.
- Office-specific compensation variations if applicable.

Used by:

- Precontract.
- Recruitment assignment.
- Advisor conversion.
- Compensation period snapshots.

### Rule Snapshot Config

Shared config:

- Effective dates.
- source document.
- rule version.
- applied domain.

Used by:

- All engines that make time-dependent decisions.

### Product / Policy Config

Shared config:

- Product identity.
- Line of business.
- Currency.
- product aliases.
- valid policy definition.
- personal policy exclusions.

Used by:

- Commission schedules.
- Contest rules.
- Precontract production.
- Manager activity.

### Compensation Config

Shared config:

- Commission schedules.
- Contest rules.
- Manager compensation rules.
- policy count rules.
- index thresholds.
- bonus tables.

Used by:

- Advisor compensation.
- Manager compensation.
- Precontract readiness when minimum production/commission is configurable.

### Evidence / Scoring Config

Shared config:

- Candidate assessment weights.
- hard/vital factor weights.
- precontract risk thresholds.
- compensation alert thresholds.

Used by:

- Recruitment intelligence.
- Behavior intelligence.
- Manager coaching.

Risk:

- Scoring weights are repeated inside recruitment and manager engines instead of being organization/office config.

## 5. Engines That Share Inputs

### Candidate Assessment Engine

Shared inputs:

- CommercialPerson.
- EvidenceRecord.
- Market/RDA evidence.
- Activity evidence.
- Manager assignment.
- Office rules config.

Overlaps with:

- Precontract Lifecycle Engine.
- Behavior Intelligence.
- Advisor Career Stage Engine.

### Precontract Lifecycle Engine

Shared inputs:

- CommercialPerson.
- CommercialAssignment.
- RuleSnapshot.
- activity events.
- policy / commission events.
- coaching events.

Overlaps with:

- Advisor Career Stage Engine.
- Policy Commission Event Engine.
- Compensation Alert Engine.

### Advisor Career Stage Engine

Shared inputs:

- Advisor conversion events.
- Fecha de conexion.
- Fecha de concurso.
- contest month.
- role/stage assignments.

Overlaps with:

- Recruitment conversion.
- Training Allowance.
- New Professional Bonus.
- Manager advisor class.

### Policy Commission Event Engine

Shared inputs:

- Product / policy config.
- Commission schedule.
- policy paid/cancelled/rehabilitated events.
- advisor stage.

Overlaps with:

- Precontract readiness.
- Training Allowance.
- New Professional Bonus.
- GMM Bonus.
- Manager Productivity / Production / Activity.

### Advisor Bonus Eligibility Engine

Shared inputs:

- AdvisorCareerStage.
- RuleSnapshot.
- Policy count.
- Commission metrics.
- LIMRA / IGC.

Overlaps with:

- Manager Productivity.
- Manager Activity.
- Compensation Alert.

### Manager Productivity / Activity / Production Engines

Shared inputs:

- Advisor qualification.
- Training Allowance winner.
- policy count.
- commission metrics.
- unit assignment.
- conservation indexes.

Overlaps with:

- Advisor Bonus Eligibility.
- Team Qualification.
- Behavior Intelligence.

### Behavior Intelligence / Mick

Shared inputs:

- Activity.
- missed tasks.
- coaching actions.
- production outcomes.
- RDA.
- precontract progress.
- advisor performance.

Overlaps with:

- Recruitment Knowledge.
- Precontract.
- Compensation alerts.
- Manager coaching.

## 6. Possible Shared Libraries

### Identity Resolution Library

Purpose:

- Match and preserve `CommercialPerson` across candidate, advisor, and Partner records.

Consumers:

- Recruitment.
- Advisor conversion.
- Compensation.
- Manager compensation.

### Assignment Timeline Library

Purpose:

- Resolve active manager, Partner, office, and unit at event time.

Consumers:

- Recruitment attribution.
- Precontract.
- Compensation.
- Partner bonus attribution.

### Rule Snapshot Library

Purpose:

- Apply correct organization, office, contest, commission, and manager rules for a period.

Consumers:

- All decision engines.

### Period Calendar Library

Purpose:

- Canonical month, quarter, semester, contest month, official window, tenure month, and payment period calculations.

Consumers:

- Precontract.
- Advisor compensation.
- Manager compensation.

### Production Event Library

Purpose:

- Normalize policy, payment, commission, cancellation, rehabilitation, and count-adjustment events.

Consumers:

- Precontract.
- Compensation.
- Manager activity.
- Alerts.

### Policy Count Library

Purpose:

- Apply annual policy count rules without duplicating thresholds.

Consumers:

- Training Allowance.
- Conexion.
- Desarrollo.
- Partner Actividad.
- Precontract readiness.

### Conservation Index Library

Purpose:

- Store and resolve LIMRA, IGC, and siniestralidad snapshots.

Consumers:

- Advisor bonus eligibility.
- Manager compensation.
- Retention risk.

### Connection Attribution Library

Purpose:

- Track RDA, advisor connector, developer, Partner attribution, and recruitment source.

Consumers:

- Recruitment.
- Conexion bonus.
- Desarrollo bonus.
- Manager recruiting intelligence.

### Evidence Library

Purpose:

- Preserve auditable evidence across recruitment, activity, compensation, and coaching.

Consumers:

- Candidate assessment.
- Precontract.
- Behavior intelligence.
- Manager coaching.

### Alert / Action Library

Purpose:

- Normalize risk/action outputs so Forge says what to do next without duplicating alert logic.

Consumers:

- Recruitment.
- Precontract.
- Advisor compensation.
- Manager compensation.

## 7. Shared Knowledge Bases

Existing / proposed knowledge bases:

### Recruitment Knowledge Base

Current:

- `RECRUITMENT_KNOWLEDGE_BASE.md`

Should own:

- Candidate signals.
- Market quality.
- RDA as recruitment evidence.
- Interview and precontract readiness signals.

Should not own:

- Advisor compensation tables.
- Partner bonus rules.

### Recruitment Domain Model

Current:

- `RECRUITMENT_DOMAIN_MODEL.md`

Should own:

- Recruitment lifecycle contracts and state transitions.

Should not own:

- Commission schedule definitions.

### Compensation Domain Model

Current:

- `COMPENSATION_DOMAIN_MODEL.md`

Should own:

- Advisor and manager compensation domain boundaries.
- Compensation event model.
- commission schedule concept.

Should not own:

- Recruitment scoring weights.

### Manager Compensation Knowledge Base

Current:

- `MANAGER_COMPENSATION_KNOWLEDGE_BASE.md`

Should own:

- PCV Partner bonus knowledge.
- Manager compensation-specific dependencies.

Should not duplicate:

- Advisor qualification logic.
- policy count logic.
- LIMRA / IGC definitions.

### Proposed Shared Knowledge Bases

Recommended before schemas:

- `FORGE_SHARED_DOMAIN_MODEL.md`
- `COMMERCIAL_PERSON_KNOWLEDGE_BASE.md`
- `COMMERCIAL_ASSIGNMENT_KNOWLEDGE_BASE.md`
- `PRODUCTION_EVENT_KNOWLEDGE_BASE.md`
- `RULE_SNAPSHOT_KNOWLEDGE_BASE.md`
- `POLICY_COUNT_KNOWLEDGE_BASE.md`
- `CONSERVATION_INDEX_KNOWLEDGE_BASE.md`
- `CONNECTION_ATTRIBUTION_KNOWLEDGE_BASE.md`

Reason:

- These topics are cross-domain and should not belong exclusively to recruitment or compensation.

## 8. Duplicate Audit

### Duplicated Entities

- Person identity:
  - RecruitIdentity, Candidate, Advisor, Partner.
- Assignment:
  - ManagerAssignment, OfficeAssignment, advisor-to-Partner assignment, unit membership.
- Stage:
  - Application state, PrecontractCycle state, AdvisorCareerStage, Advisor class.
- Rule snapshot:
  - Precontract rule snapshot, compensation rule set, PCV rules version, office rules config.
- Production event:
  - Policies issued, policy paid, commission metric, policy activity metric.
- Conservation snapshot:
  - LIMRA / IGC in advisor and manager compensation.
- Connection:
  - RDA, Asesor Conectador, Partner recruiting attribution.

### Duplicated Metrics

- Activity volume.
- Paid policies.
- Policy count.
- Initial commissions.
- Renewal commissions.
- Minimum commissions.
- Production Vida.
- Production GMM.
- LIMRA.
- IGC.
- Advisor tenure / contest month.
- Active group.
- Qualified advisor.
- TA winner.
- Manager conversion / attribution.

### Duplicated Events

- Advisor connection / conversion / alta.
- Manager assigned / advisor assigned to Partner / manager unit updated.
- Office changed / office assignment updated.
- Policy paid / commission paid.
- Policy cancelled / recalculation.
- Rule snapshot applied / rules changed.
- Advisor qualified / candidate selected / precontract ready.
- Partner connected / advisor promoted to Partner.

### Duplicated Configurations

- Minimum policies.
- Minimum commissions.
- Currency.
- valid policy definition.
- valid commission definition.
- official window duration.
- active group/status rules.
- assessment weights.
- risk thresholds.
- rule effective dates.
- compensation annual tables.
- LIMRA / IGC thresholds.
- product count and ponderation rules.

## 9. Duplication Risks

### Wrong Attribution

If assignments are duplicated, a policy, advisor conversion, or Partner promotion may be attributed to the wrong manager, office, or Partner.

### Wrong Eligibility

If advisor stage and contest month are calculated separately, Training Allowance, Conexion, Desarrollo, New Professional bonuses, and Partner advisor class may disagree.

### Wrong Recalculation

If cancellations and rehabilitations are only compensation events, recruitment/precontract progress and manager risk may remain stale.

### Wrong Rule Version

If rules are not snapshotted, historical cycles and historical compensation may be recalculated with newer rules.

### Hardcoded Threshold Drift

If policy counts, minimum commissions, LIMRA, IGC, and bonus thresholds live in multiple engines, annual updates will create inconsistent decisions.

### Vocabulary Collision

Terms like qualified, active, production, policy count, connection, and development mean different things by domain. Forge needs explicit domain-qualified names.

### Advisor First Degradation

Duplicated manager-first metrics could make Forge optimize team dashboards before helping the advisor understand what they earned, what is missing, and what action to take.

## 10. Recommended Shared Model Roadmap

### Phase 1: Shared Language Closure

Create canonical glossary entries for:

- CommercialPerson.
- CommercialRoleAssignment.
- CommercialAssignment.
- RuleSnapshot.
- CommercialProductionEvent.
- ConservationSnapshot.
- ConnectionAttribution.
- EvidenceRecord.

### Phase 2: Shared Knowledge Bases

Create dedicated shared knowledge bases before schemas:

- Person identity.
- Assignment timeline.
- Rule snapshots.
- Production events.
- Policy count.
- Conservation index.
- Connection attribution.

### Phase 3: Domain Boundary Refactor Planning

Document which future engines consume shared libraries:

- Recruitment engines consume shared identity, assignment, evidence, activity.
- Compensation engines consume shared stage, production, rule snapshot, conservation.
- Manager engines consume shared assignment, team qualification, advisor qualification, connection attribution.

### Phase 4: Schema Design

Only after shared knowledge closes:

- Design schemas for shared primitives.
- Keep recruitment and compensation schemas dependent on shared contracts.

### Phase 5: Engine Sequencing

Recommended engine order:

1. Identity Resolution.
2. Assignment Timeline.
3. Rule Snapshot.
4. Period Calendar.
5. Production Event.
6. Policy Count.
7. Advisor Lifecycle Stage.
8. Advisor Compensation.
9. Manager Compensation.
10. Alerts / Action.

## Final Recommendation

Create shared libraries before adding more recruitment or compensation engines.

Priority shared libraries:

1. Rule Snapshot Library.
2. Assignment Timeline Library.
3. Advisor Lifecycle / Period Calendar Library.
4. Production Event Library.
5. Policy Count Library.
6. Connection Attribution Library.

These remove the highest duplication risk because they control attribution, eligibility, annual rule drift, and event-time truth.


# Compensation Domain Model v1.0

Purpose:

Design the full conceptual domain for Compensation Intelligence in Forge, using advisor compensation documents, Partner compensation knowledge, and the historical commission module as discovery sources.

This is documentation only. It does not create engines, schemas, UI, calculations, AI calls, or commits.

## Sources Reviewed

Mandatory sources found:

- `/storage/emulated/0/Download/2026_Partner_Compensation.pdf`
- `/storage/emulated/0/Download/Quick Share/CC 2026 Asesores en Desarrollo.pdf`
- `/storage/emulated/0/Download/Quick Share/CC 2026 Asesores Nuevos Profesionales.pdf`
- `/storage/emulated/0/Download/Comisiones Gerry .pdf`
- `/storage/emulated/0/Download/CRMAddlife-main (1)/CRMAddlife-main/comisiones.js`
- `MANAGER_COMPENSATION_KNOWLEDGE_BASE.md`

Name resolution notes:

- `PCV 2026 Partners.pdf` was not present under that exact filename. The available Partner source reviewed is `2026_Partner_Compensation.pdf`.
- `comisiones(1).js` was not present under that exact filename. The historical candidate reviewed is `/storage/emulated/0/Download/CRMAddlife-main (1)/CRMAddlife-main/comisiones.js`. It is byte-equivalent to current repo `comisiones.js` during this discovery.

## Constitutional Lens

Compensation Intelligence must be Advisor First, Manager Second, Organization Third.

Advisor First means the system first helps the advisor:

- Understand what they earned.
- Understand why they earned it.
- See what is missing to win or preserve a bonus.
- Avoid preventable bonus loss through cancellations, inactivity, missing policies, missing indexes, or missed timing.
- Know the next commercial action.
- Reduce manual capture and spreadsheet dependence.

Manager Second means the system helps the manager:

- See which advisors are qualified.
- See which advisors are close to qualification.
- Detect productivity, TA, retention, and policy-count risk.
- Prioritize coaching by economic impact and behavior gap.
- Understand future bonus exposure without inventing projections.

Organization Third means the system helps the organization:

- Keep compensation explainable.
- Preserve annual rule snapshots.
- Avoid hardcoded contest rules.
- Recalculate safely when cancellations, rehabilitations, or rule updates require it.

Forge principle:

- Intelligence without action is just information. Compensation output must eventually say what to do next, with whom, and why.

## 1. Career Stages

### Candidate

Definition:

- Person being evaluated for future advisor activity before a contract / connection.

Start:

- Recruitment identity created or candidate enters interview / recruitment process.

End:

- Candidate becomes Precontract / Advisor Connected, or exits recruitment.

Key metrics:

- Recruitment source.
- RDA / referral source.
- Interview evidence.
- Market quality.
- Readiness and coachability.

Transition events:

- CANDIDATE_CREATED.
- RECRUITMENT_APPLICATION_STARTED.
- ADVISOR_CONNECTED.

Source documents:

- Forge recruitment domain context.
- PCV / CC documents only affect this stage through future connection attribution.

### Precontract

Definition:

- Person in informal or formal precontract process before full advisor compensation stage is established.

Start:

- Precontract cycle starts, key is activated, or operational onboarding begins.

End:

- Advisor connection / contract date, failure, expiration, or reactivation.

Key metrics:

- Key activation date.
- Precontract cycle status.
- Activity evidence.
- Policies / appointments if organization allows informal activity.

Transition events:

- PRECONTRACT_STARTED.
- KEY_ACTIVATED.
- ADVISOR_CONNECTED.
- PRECONTRACT_EXPIRED.

Source documents:

- Forge recruitment lifecycle principles.
- Advisor compensation documents use Fecha de Conexion / Fecha de Concurso once the advisor enters compensation.

### Advisor in Development

Definition:

- Advisor with 2026 contest date and up to 12 months of contest in active group for Training Allowance.
- For Development Bonus context, an Advisor in Development can be within 15 months from contest date.

Start:

- Fecha de concurso is established.
- Fecha de concurso is the Fecha de Conexion if month 1 Training Allowance goals are reached in that month; otherwise it is the first day of the month after Fecha de Conexion.

End:

- Completion of first 12 contest months for Training Allowance stage.
- Development Bonus monitoring can continue through month 15.
- Transition to New Professional Advisor when the advisor enters that contest scheme.

Key metrics:

- Fecha de conexion.
- Fecha de concurso.
- Mes de concurso.
- Grupo activo.
- Comisiones Meta iniciales Vida + GMMI.
- Pólizas acumuladas Vida + GMMI.
- Minimum Vida policy count.
- Training Allowance won.
- LIMRA.
- IGC.

Transition events:

- ADVISOR_CONNECTED.
- ADVISOR_CONTEST_MONTH_ADVANCED.
- TRAINING_ALLOWANCE_WON.
- ADVISOR_BECAME_NEW_PROFESSIONAL.

Source documents:

- `CC 2026 Asesores en Desarrollo.pdf`
- `CC 2026 Asesores Nuevos Profesionales.pdf`

### New Professional Advisor

Definition:

- Advisor participating in the New Professional Advisor contest. The document states participation for advisors who became New Professional Advisor during 2014 or later and are in active group 2 or 3.

Start:

- Advisor converts to New Professional Advisor or elects that contest path when eligible.

End:

- Advisor exits New Professional contest, becomes regular Professional / Consolidated Advisor, becomes inactive, or transitions to another organization-defined class.

Key metrics:

- Prima Meta.
- Prima Pago.
- Prima Renovacion.
- Paid policies.
- Monthly / semiannual / annual policy targets.
- LIMRA threshold by tenure.
- IGC.
- GMM initial premium and renewal premium.
- Siniestralidad.
- Connection and Development bonuses if acting as connector / developer.

Transition events:

- ADVISOR_BECAME_NEW_PROFESSIONAL.
- ADVISOR_QUALIFIED.
- INDEX_UPDATED.
- BONUS_ACCRUED.
- BONUS_PAID.

Source documents:

- `CC 2026 Asesores Nuevos Profesionales.pdf`
- `Comisiones Gerry .pdf`
- historical `comisiones.js`

### Professional Advisor

Definition:

- Advisor participating in professional contest rules or New Professional rules, depending on organizational classification.

Start:

- Completion of development stage or direct entry with definitive license into professional scheme.

End:

- Becomes Consolidated Advisor, Partner / Manager, inactive, or exits organization.

Key metrics:

- Perceptions by ramo.
- Vida policies.
- Prima Comision.
- Training / update participation.
- LIMRA.
- IGC.
- Bono Vida.
- GMM bonus.
- Renewal quality.

Transition events:

- ADVISOR_BECAME_PROFESSIONAL.
- ADVISOR_QUALIFIED.
- INDEX_UPDATED.

Source documents:

- `CC 2026 Asesores Nuevos Profesionales.pdf`
- historical `comisiones.js`

### Consolidated Advisor

Definition:

- Advisor in active group who does not belong to new organization.

Start:

- Organization classifies advisor as consolidated.

End:

- Becomes Partner / Manager, inactive, or changes organization classification.

Key metrics:

- Group active.
- Production.
- Renewal.
- Conservation.
- Connection / Development contribution.
- Manager compensation uses "Consolidados" as an organization category.

Transition events:

- ADVISOR_CLASS_CHANGED.
- MANAGER_UNIT_UPDATED.

Source documents:

- `CC 2026 Asesores en Desarrollo.pdf`
- `CC 2026 Asesores Nuevos Profesionales.pdf`
- `MANAGER_COMPENSATION_KNOWLEDGE_BASE.md`

### Partner / Manager

Definition:

- Commercial leader compensated for recruiting, developing, retaining, producing through team, and promoting future Partners.

Start:

- Partner alta / manager assignment / direct key assignment.

End:

- Inactivation, promotion, office/role change, or exit.

Key metrics:

- Active status.
- Direct key.
- Assigned cartera.
- Unit LIMRA / IGC.
- Qualified advisors.
- Non-qualified active advisors.
- TA winners.
- Policy volume.
- New advisor altas.
- Advisors in development window.
- Promoted Partners.

Transition events:

- PARTNER_CONNECTED.
- MANAGER_UNIT_UPDATED.
- TEAM_QUALIFICATION_UPDATED.
- PARTNER_PROMOTED.

Source documents:

- `2026_Partner_Compensation.pdf`
- `MANAGER_COMPENSATION_KNOWLEDGE_BASE.md`

### Senior Partner / Managing Partner

Definition:

- Higher leadership stage may apply if organization distinguishes senior Partner, Managing Partner, Partner promoter, or multi-unit role.

Start:

- Promotion to senior / managing leadership role.

End:

- Role change or inactivation.

Key metrics:

- Not fully documented in reviewed sources.
- Likely depends on promoted Partners, unit growth, conservation, production, and support metrics.

Transition events:

- PARTNER_PROMOTED.
- MANAGER_ROLE_CHANGED.

Source documents:

- Not explicitly closed by reviewed PDFs. Treat as future source requirement.

## 2. Compensation Programs

### Training Allowance

Purpose:

- Semestral bonus with monthly advances to support advisors in their first year and consolidate them as Professional Advisors.

Beneficiary:

- Advisor in Development.

Calculation frequency:

- Monthly.

Payment frequency:

- Semestral with monthly advances; payable next month after close.

Inputs needed:

- Contest month.
- Accumulated initial Comisiones Meta Vida + GMMI.
- Accumulated Vida + GMMI policies, with GMMI as 0.5.
- Minimum accumulated Vida policies.
- Premio mínimo / máximo accumulated.
- Prior bonuses paid in same semester.

Exclusions:

- Personal policies for policy count / meta.
- AVE, AVECP, CVD, universal additional contributions, payroll discount for initial commission meta.
- GMMI initial commissions / premiums for insured age 60+ where excluded.

Dependencies:

- Fecha de concurso.
- Reglas de Conteo.
- Product ponderation table.
- Cancellation / rehabilitation recalculation.

Hardcode risks:

- Monthly targets, premio maximo, 35% excedente, 90% development commission factor, and policy count rules must be versioned config.

### Bono Inicial

Purpose:

- Reward New Professional Advisor Vida activity aligned to Prima Meta, paid policies, and LIMRA.

Beneficiary:

- New Professional Advisor.

Calculation frequency:

- Monthly.

Payment frequency:

- Semestral with monthly advances.

Inputs needed:

- Prima Meta.
- Prima Pago inicial.
- Monthly, semiannual, annual Vida policy targets.
- Contest group.
- LIMRA by tenure.
- Prior semester group for advance cap.

Exclusions:

- Product exclusions and personal-policy rules from CC.
- GMM rules are separate.

Dependencies:

- Product ponderation.
- Advisor stage.
- LIMRA snapshot.
- Policy count.

Hardcode risks:

- 16-group Prima Meta table, policy targets, LIMRA thresholds, and bonus percentage matrix.

### Bono Renovacion

Purpose:

- Reward long-term retention of advisor portfolio.

Beneficiary:

- New Professional / Professional Advisor with Bono Inicial calculated.

Calculation frequency:

- Monthly.

Payment frequency:

- Semestral with monthly advances.

Inputs needed:

- Bono Inicial calculated.
- Prima Renovacion accumulated in semester.
- IGC.
- Contest group.
- IGC percentage matrix.

Exclusions:

- Same source exclusions for product participation and personal policy treatment.

Dependencies:

- Renewal classification by policy year / coverage age.
- IGC snapshot.
- Bono Inicial eligibility.

Hardcode risks:

- IGC table, renewal definitions, product-specific renewal ponderation.

### Bono GMM

Purpose:

- Reward GMM Individual initial premiums, renewal premiums, growth, and siniestralidad quality.

Beneficiary:

- New Professional / Professional Advisor.

Calculation frequency:

- Monthly for trimestral bonuses; annual for growth and siniestralidad.

Payment frequency:

- Trimestral with monthly advances for initial and renewal GMM; annual for growth and siniestralidad.

Inputs needed:

- Primas netas pagadas GMMI initial.
- Primas netas pagadas GMMI renewal.
- Initial GMMI policies.
- Prior-year initial GMM production.
- Siniestralidad index.
- Catastrophic claim cap.

Exclusions:

- GMMI initial premiums for insured age 60+ do not participate for initial premium accumulation.
- GMM net premium excludes IVA, policy fee, fractional payment surcharge, and extra premiums.

Dependencies:

- GMM product classification.
- Quarter boundaries.
- Claim payments.
- Prior-year production baseline.

Hardcode risks:

- GMM group tables, growth bands, siniestralidad bands, catastrophic claim cap.

### Bono Conexion

Purpose:

- Reward advisors who refer prospects that become connected advisors.

Beneficiary:

- Advisor Conectador; also relevant to Partner / manager recruiting model.

Calculation frequency:

- At connected advisor alta; month 2 and month 3 of connected advisor contest.

Payment frequency:

- Month following calculation.

Inputs needed:

- Connected advisor alta.
- Connected advisor contest date 2026.
- Connector attribution.
- Monthly policies in months 2 and 3.
- Active group status for both figures.

Exclusions:

- Reconnection exclusions from connector definition.

Dependencies:

- Advisor lifecycle.
- Reglas de Conteo.
- RDA / connection attribution.

Hardcode risks:

- $7,500 alta payment and $5,000 / $9,000 / $15,000 / $20,000 monthly table.

### Bono Desarrollo

Purpose:

- Reward supporting, accompanying, and orienting an Advisor in Development so they reach CC goals.

Beneficiary:

- Advisor Desarrollador. Can be shared 50% between two developer figures.

Calculation frequency:

- Monthly.

Payment frequency:

- Month after each achieved target.

Inputs needed:

- Advisor in Development contest date 2026.
- Months 4-15 eligibility.
- Monthly Vida + GMMI policy count.
- Month 12 accumulated policy count.
- Training Allowance month 12 won.
- Monthly policy continuity.

Exclusions:

- Reconnection exclusions from developer definition.

Dependencies:

- Development assignment.
- Reglas de Conteo.
- Training Allowance result.

Hardcode risks:

- Month window 4-15, monthly policy-to-bonus table, month 12 additional bonuses, 50% sharing rule.

### Beneficios Adicionales

Purpose:

- Protect advisor income in specific exceptional events.

Beneficiary:

- Advisor or beneficiaries.

Programs:

- Beneficio por Incapacidad Total Temporal.
- Beneficio por Fallecimiento.

Calculation frequency:

- Event-driven.

Payment frequency:

- Monthly for incapacity, immediate plus 24 monthly payments for death benefit.

Inputs needed:

- Prior 12-month average Bono Vida.
- Prior two semester Bono Vida calculation.
- Incapacity start/end.
- Medical evidence.
- Active group / contract / license / RC policy.
- Death event and beneficiary designation.

Exclusions:

- Incapacity exclusions include pregnancy, high-risk activities, intentional injury, alcohol/drug-related cases, and other listed exclusions.
- Death benefit denied for improper advisor practices.

Dependencies:

- Advisor legal / contract status.
- Medical documentation workflow.
- Bonus history.

Hardcode risks:

- 50% factor, six-month max, 30-day waiting period, $20,000 death immediate payment, 24 monthly payments.

### Bono Productividad Partner

Purpose:

- Reward Partner earnings generated by qualified advisors.

Beneficiary:

- Partner / Manager.

Calculation frequency:

- Not fully specified in source; conceptually monthly with quarter TA dependency.

Payment frequency:

- Requires official PCV operational schedule.

Inputs needed:

- Qualified advisor count.
- Advisor class.
- Average initial commissions.
- Base percentage table.
- Multiplier tiers.
- TA winner in quarter.

Exclusions:

- Non-qualified advisors are handled by Partner Produccion, not Productividad high-payment logic.

Dependencies:

- Advisor qualification.
- LIMRA / IGC.
- Training Allowance winners.

Hardcode risks:

- Qualification threshold, class percentages, multiplier tiers, 80% reduction without TA.

### Bono Produccion Partner

Purpose:

- Reward production from non-qualified advisors who have activity.

Beneficiary:

- Partner / Manager.

Calculation frequency:

- Conceptually monthly; PCV schedule source should be confirmed.

Payment frequency:

- Requires official PCV operational schedule.

Inputs needed:

- Non-qualified advisor activity.
- Commission amount.
- Organization type: new organization or consolidated.
- Unit LIMRA / IGC.

Exclusions:

- Qualified advisor production belongs to Productividad.

Dependencies:

- Advisor qualification.
- Organization type.
- Unit conservation indexes.

Hardcode risks:

- 13.5% / 7.0% and index gates.

### Bono Actividad Partner

Purpose:

- Reward policy volume from qualified advisors across Vida + GMM.

Beneficiary:

- Partner / Manager.

Calculation frequency:

- Conceptually monthly.

Payment frequency:

- Requires official PCV operational schedule.

Inputs needed:

- Qualified advisors with minimum tenure.
- Policy count.
- Qualified commission base.
- Activity tier.

Exclusions:

- Advisors under minimum tenure.
- Non-qualified advisors.

Dependencies:

- Advisor qualification.
- Policy source.
- Line-of-business classification.

Hardcode risks:

- 2/3/4/5/6+ policy tiers, 10%-30% percentages, 3-month minimum.

### Bono Alta Partner

Purpose:

- Reward promoting an advisor from the Partner unit into Partner.

Beneficiary:

- Origin Partner / Manager.

Calculation frequency:

- Event plus monthly installment validation.

Payment frequency:

- Initial payment and 12 monthly installments in PCV source.

Inputs needed:

- Promoted advisor.
- New Partner alta.
- Origin unit attribution.
- New Partner support metrics.

Exclusions:

- Missing support metric compliance should block future installments.

Dependencies:

- Partner promotion lifecycle.
- Support metrics table.

Hardcode risks:

- $300,000 total, $60,000 initial, $20,000 installments, and support metrics.

### Apoyos Partner

Purpose:

- Decreasing fixed financial support during first 36 months.

Beneficiary:

- Partner / Manager.

Calculation frequency:

- Semester-based eligibility.

Payment frequency:

- Requires official PCV operational schedule.

Inputs needed:

- Partner tenure semester.
- Accumulated commissions.
- TA winners.
- Support table.

Exclusions:

- Partners not meeting accumulated commission or TA requirements.

Dependencies:

- Partner lifecycle.
- Commission totals.
- TA winners.

Hardcode risks:

- Semester amounts, goal thresholds, and TA requirements.

## 3. Shared Metrics

| Metric | Definition | Type | Used by | Snapshot |
| --- | --- | --- | --- | --- |
| Comisiones Iniciales | Initial commissions from Vida + GMM, with exclusions | Calculated | Training, qualification, dashboards | Period snapshot |
| Prima Meta | Product-pondered premium for goal qualification | Calculated / configurable rules | Bono Inicial, groups | Annual rules snapshot |
| Prima Pago | Product-pondered premium used to pay bonus | Calculated / configurable rules | Bono Inicial | Annual rules snapshot |
| Prima Renovacion | Renewal premium used for retention bonus | Calculated | Bono Renovacion | Period snapshot |
| Pólizas pagadas | Policies with paid first receipt / eligible payment | Input / derived | All policy-count bonuses | Period snapshot |
| Conteo de pólizas | Policy count after annual count rules | Calculated | Training, Conexion, Desarrollo, Actividad | Annual rules snapshot |
| LIMRA | Premium conservation vs issued premium | Calculated | Bono Inicial, qualification, Partner gates | Period snapshot |
| IGC | Portfolio conservation for renewal/long-term retention | Calculated | Bono Renovacion, qualification, Partner gates | Period snapshot |
| Fecha de concurso | Compensation contest date | Derived | Stage, TA, Conexion, Desarrollo | Advisor lifecycle snapshot |
| Fecha de conexión | First contract/intermediation date | Input | Stage, contest date | Advisor lifecycle snapshot |
| Mes de concurso | Month number from contest date | Calculated | Stage, TA, Conexion, Desarrollo | Period snapshot |
| Grupo activo | Active group participation | Input / derived | Eligibility | Period snapshot |
| Clase de asesor | CC / 1C / 2C / 3C / Consolidated or New Professional class | Derived / configurable | Partner productivity, stage | Annual rules snapshot |
| Asesor calificado | Advisor meets commission and index requirements | Calculated | Partner Productividad / Actividad | Period snapshot |
| Ganador Training | Advisor won TA for period / quarter | Calculated | TA, Partner dependency, Apoyos | Period snapshot |
| RDA / Conexión | Referral/connection attribution | Input | Conexion, recruiting intelligence | Event snapshot |
| Producción Vida | Vida production by premium/commission/policies | Calculated | Bono Inicial, TA, productivity | Period snapshot |
| Producción GMM | GMM production by net premium/policies | Calculated | GMM bonus, TA, activity | Period snapshot |

Metric classification:

- Input: dates, payments, policy issue/payment events, advisor status, product, currency, sum assured, payment mode, GMM claims.
- Calculated: commission amount, policy year, Prima Meta, Prima Pago, Prima Renovacion, LIMRA, IGC, group, bonus amount.
- Derived: contest month, career stage, advisor class, qualification status, bonus risk.
- Configurable: commission percentages, product ponderations, thresholds, groups, indexes, bonus tables.
- Snapshot annual: commission schedules, contest rules, count rules, product ponderations, Partner PCV rules.

## 4. Commission Schedule Library

Compensation must separate four different knowledge types:

### Product Knowledge

Purpose:

- What the product is: name, line, currency, payment design, benefit structure, coverage rules.

Must not contain:

- Annual contest percentages.
- Advisor bonus eligibility.
- Manager compensation rules.

### Commission Schedule

Purpose:

- Versioned table of advisor commission rates by product, currency, premium type, policy year, payment term, age, sum assured, and exclusions.

Conceptual structure:

- commissionScheduleId.
- productId.
- productName.
- currency.
- effectiveFrom.
- effectiveTo.
- version.
- policyYearRates[].
- premiumTypeRules[].
- paymentTermRules[].
- ageRules[].
- sumAssuredRules[].
- renewalRules[].
- exclusions[].

Notes:

- `Comisiones Gerry .pdf` appears to contain `Enero 2025_V1` commission schedules. These are not the same as 2026 contest rules.
- Historical `comisiones.js` embeds many of these rates directly into code.

### Contest Rules

Purpose:

- Annual advisor contest rules: Training Allowance, Bono Inicial, Bono Renovacion, Bono GMM, Conexion, Desarrollo, benefits, count rules, product ponderation, annual validity.

Must include:

- planYear.
- effective dates.
- source document.
- annual product ponderation.
- policy count rules.
- exclusions.
- cancellation recalculation rules.

### Manager Compensation Rules

Purpose:

- Partner / manager-specific PCV rules: Productividad, Produccion, Actividad, Conexion, Desarrollo, Alta Partner, Apoyos, Transicion.

Must include:

- unit eligibility.
- advisor qualification.
- team qualification snapshot.
- TA dependencies.
- promotion rules.
- support metrics.

## 5. Configuration vs Logic

### Configuration

Belongs in versioned configs:

- Commission percentages.
- Product commission schedules.
- Product ponderations.
- Bonus goals.
- Group ranges.
- Bonus tables.
- Annual tables.
- Bonus amounts.
- Effective dates.
- Minimum indexes.
- Policy count thresholds.
- GMM premium thresholds.
- Growth bands.
- Siniestralidad bands and claim caps.
- Partner productivity percentages.
- Partner activity tiers.
- Partner support amounts.
- Rule year and rule source.

### Logic

Belongs in engines later:

- Determine policy year.
- Determine advisor career stage.
- Determine if commission is initial or renewal.
- Determine if policy counts.
- Determine if advisor qualifies.
- Apply correct annual snapshot.
- Attribute connection / RDA.
- Detect cancellation / rehabilitation impact.
- Calculate gap to next target.
- Generate alerts without inventing values.
- Explain why bonus was won/lost.

Boundary:

- Logic may select and apply a rule. Logic must not contain the numeric rule as a hidden constant.

## 6. Hardcode Risk Audit: Historical comisiones.js

Reviewed file:

- `/storage/emulated/0/Download/CRMAddlife-main (1)/CRMAddlife-main/comisiones.js`

Major risks:

- Imports `getSupabase` and `callGemini` from `app.js`, coupling compensation to app shell and AI capability.
- Contains UI rendering, forms, dashboard, simulator, remote persistence, and calculation logic in the same module.
- Embeds commission schedules directly as `TASAS_VIDA` and `TASAS_GMM`.
- Embeds Training Allowance goals as `TRAINING_METAS`.
- Embeds New Professional group targets as `NP_GRUPOS`.
- Embeds New Professional bonus percentages as `NP_BONO_PCT`.
- Embeds GMM group targets and percentages as `GMM_GRUPOS`.
- Embeds policy count thresholds: 17,000 / 65,000 / 190,000.
- Embeds product exclusions: Star Temporal 1 / Tempo Vida 1.
- Embeds development factor 0.90 for Asesor en Desarrollo.
- Embeds default LIMRA 75.5 and IGC 91.
- Uses date math based on current device date, not compensation period snapshots.
- Uses approximate month length `30.44` for contest month.
- Uses current date to determine policy year.
- Treats product names as exact UI strings.
- Mixes 2025 commission schedules with 2026 contest logic.
- Uses fallback commission rates when product is unknown, which can invent financial values.
- Builds UI text and bonus explanation directly from calculation objects.

Knowledge to migrate to configs:

- Commission schedule tables.
- Product aliases and variants.
- GMM age bands.
- Training targets.
- New Professional group and LIMRA/IGC matrices.
- GMM bonus tables.
- Policy count rules.
- Product ponderation.
- Exclusion lists.
- Effective dates and rule version.

Logic that can survive as future engine logic after rewrite:

- Determining policy year.
- Distinguishing initial vs renewal.
- Applying payment frequency factor.
- Aggregating by month / semester / quarter.
- Calculating gap to target.
- Applying selected schedule to a policy event.

Logic that should be rewritten:

- Product lookup by raw strings.
- Hardcoded fallback rates.
- Contest month by approximate day division.
- Mixed UI/calculation/persistence.
- AI/app dependency.
- Current-date-only calculations.
- Direct DB reads inside compensation calculation.

## 7. Domain Entities

### CompensationPlan

Purpose:

- Annual or multi-year compensation plan container.

Fields:

- compensationPlanId.
- planName.
- planYear.
- audience.
- effectiveFrom.
- effectiveTo.
- sourceDocuments[].
- status.

Relations:

- Has CompensationRuleSet.
- Has BonusProgram.

### CompensationRuleSet

Purpose:

- Versioned rule snapshot for a plan.

Fields:

- ruleSetId.
- compensationPlanId.
- version.
- effectiveFrom.
- effectiveTo.
- sourceDocument.
- capturedAt.
- rulesType.

Relations:

- Used by BonusEligibility, BonusAccrual, CommissionSchedule.

### CommissionSchedule

Purpose:

- Versioned commission table by product and conditions.

Fields:

- commissionScheduleId.
- productId.
- productName.
- currency.
- effectiveFrom.
- effectiveTo.
- version.
- policyYearRates[].
- premiumTypeRules[].
- paymentTermRules[].
- ageRules[].
- sumAssuredRules[].
- renewalRules[].
- exclusions[].

Relations:

- Consumed by PolicyCommissionEvent.

### AdvisorCareerStage

Purpose:

- Time-bounded advisor stage classification.

Fields:

- advisorCareerStageId.
- advisorId.
- stage.
- startedAt.
- endedAt.
- sourceEventId.
- reason.
- rulesVersion.

Relations:

- Used by AdvisorCompensationPeriod and BonusEligibility.

### AdvisorCompensationPeriod

Purpose:

- Period snapshot for advisor compensation.

Fields:

- advisorCompensationPeriodId.
- advisorId.
- periodId.
- month.
- quarter.
- semester.
- year.
- contestMonth.
- careerStage.
- groupActive.
- rulesVersion.

Relations:

- Has BonusEligibility.
- Has BonusAccrual.
- Has ConservationIndexSnapshot.

### BonusProgram

Purpose:

- Defines a bonus as a program, not a calculation.

Fields:

- bonusProgramId.
- compensationPlanId.
- name.
- beneficiaryType.
- careerStageEligibility[].
- calculationFrequency.
- paymentFrequency.
- sourceDocument.
- status.

Relations:

- Has BonusEligibility and BonusAccrual.

### BonusEligibility

Purpose:

- Records whether a person/unit is eligible for a bonus in a period and why.

Fields:

- bonusEligibilityId.
- bonusProgramId.
- beneficiaryId.
- beneficiaryType.
- periodId.
- eligible.
- reasons[].
- blockers[].
- rulesVersion.
- evaluatedAt.

Relations:

- Feeds BonusAccrual.

### BonusAccrual

Purpose:

- Accrued bonus result before payment.

Fields:

- bonusAccrualId.
- bonusProgramId.
- beneficiaryId.
- periodId.
- amount.
- currency.
- components[].
- sourceMetrics[].
- eligibilityId.
- status.
- calculatedAt.

Relations:

- May become BonusPayment.

### BonusPayment

Purpose:

- Payment or advance posted to advisor/manager account.

Fields:

- bonusPaymentId.
- bonusAccrualId.
- paidAt.
- amount.
- currency.
- paymentType.
- accountReference.
- reversalOfPaymentId.

Relations:

- Linked to BonusAccrual and recalculation events.

### ConservationIndexSnapshot

Purpose:

- Period snapshot of LIMRA / IGC / siniestralidad.

Fields:

- conservationIndexSnapshotId.
- entityType.
- entityId.
- periodId.
- limra.
- igc.
- siniestralidad.
- baseIndexApplied.
- realIndexApplied.
- source.
- calculatedAt.

Relations:

- Used by advisor and manager eligibility.

### PolicyCommissionEvent

Purpose:

- Atomic event representing commissionable activity from policy/payment.

Fields:

- policyCommissionEventId.
- policyId.
- advisorId.
- periodId.
- eventType.
- productId.
- productName.
- lineOfBusiness.
- currency.
- premiumAmount.
- commissionAmount.
- commissionType.
- policyYear.
- scheduleId.
- eligibleForContest.
- occurredAt.

Relations:

- Feeds metrics, bonuses, and recalculations.

### ManagerCompensationPeriod

Purpose:

- Period snapshot for Partner / manager compensation.

Fields:

- managerCompensationPeriodId.
- partnerId.
- periodId.
- month.
- quarter.
- semester.
- year.
- unitId.
- activeStatus.
- rulesVersion.

Relations:

- Has TeamQualificationSnapshot and Partner BonusAccrual.

### TeamQualificationSnapshot

Purpose:

- Captures team state for manager bonuses.

Fields:

- teamQualificationSnapshotId.
- partnerId.
- periodId.
- qualifiedAdvisorCount.
- nonQualifiedActiveAdvisorCount.
- taWinnerCount.
- activityPolicyAverage.
- unitLimra.
- unitIgc.
- organizationType.
- calculatedAt.

Relations:

- Used by Manager Productividad, Produccion, Actividad, Apoyos.

## 8. Events

Required events:

- POLICY_PAID: policy payment applied and eligible for period evaluation.
- COMMISSION_PAID: commission posted to advisor account.
- POLICY_CANCELLED: policy cancellation requiring count/bonus/index review.
- POLICY_REHABILITATED: policy reinstated; may later cancel and trigger recalculation.
- ADVISOR_CONNECTED: first advisor contract / connection.
- ADVISOR_CONTEST_MONTH_ADVANCED: contest month changed.
- ADVISOR_BECAME_NEW_PROFESSIONAL: stage transition.
- ADVISOR_QUALIFIED: advisor met qualification criteria for period.
- TRAINING_ALLOWANCE_WON: advisor won TA for period.
- BONUS_ACCRUED: bonus amount accrued from eligibility and metrics.
- BONUS_PAID: bonus amount paid or advanced.
- INDEX_UPDATED: LIMRA / IGC / siniestralidad snapshot updated.
- MANAGER_UNIT_UPDATED: manager unit composition changed.
- PARTNER_CONNECTED: Partner / manager alta or connection.

Additional recommended events:

- ADVISOR_DEVELOPER_ASSIGNED.
- ADVISOR_CONNECTOR_ASSIGNED.
- PARTNER_PROMOTED.
- BONUS_RECALCULATED.
- BONUS_REVERSED.
- POLICY_COUNT_ADJUSTED.
- COMPENSATION_RULESET_ACTIVATED.

## 9. Advisor First Lens

Advisor outputs:

- "You earned this because these policies, premiums, commissions, indexes, and dates counted."
- "You are missing this exact policy count / commission amount / index / active status item."
- "This cancellation may reduce your accumulated policy count and bonus."
- "This policy does not count for Prima Meta, but may still affect Prima Pago or commissions."
- "This is your next action to protect the bonus."

Manual-capture reduction:

- Policies, payments, commissions, indexes, stages, and bonus snapshots should come from events and source systems.
- The advisor should not manually remember annual tables or recalculate contest months.

Manager outputs:

- Qualified advisor map.
- Advisors close to qualification.
- TA risk by quarter.
- Productivity multiplier gap.
- Connection / development window tracking.
- Future economic risk from cancellations or low indexes.
- Coaching priority by actionability.

## 10. Future Engine Roadmap

### Phase 0: Knowledge Base Closure

Recommendation:

- Create separate knowledge bases before schemas.

Suggested files:

- `ADVISOR_COMPENSATION_KNOWLEDGE_BASE.md`
- `COMMISSION_SCHEDULE_KNOWLEDGE_BASE.md`
- `GMM_COMPENSATION_KNOWLEDGE_BASE.md`
- `COMPENSATION_RULES_GLOSSARY.md`

Reason:

- Current sources mix 2025 commission schedules, 2026 contest rules, advisor benefits, manager PCV, and UI-era implementation assumptions. Schemas before knowledge closure would freeze ambiguity.

### Phase 1: Commission Schedule Parser / Library

Goal:

- Extract product commission schedules into versioned config, separate from product knowledge and contest rules.

No implementation in this PAQ.

### Phase 2: Advisor Career Stage Engine

Goal:

- Determine Candidate, Precontract, Development, New Professional, Professional, Consolidated, Partner.

Requires:

- Fecha de conexion.
- Fecha de concurso.
- Stage transition events.
- Rule snapshots.

### Phase 3: Policy Commission Event Engine

Goal:

- Convert policy/payment data into commissionable events with policy year, initial/renewal classification, and schedule reference.

### Phase 4: Advisor Bonus Eligibility Engine

Goal:

- Explain eligibility and blockers for Training, Bono Inicial, Renovacion, GMM, Conexion, Desarrollo, and benefits.

### Phase 5: Training Allowance Engine

Goal:

- Calculate TA eligibility and gaps from versioned rules.

### Phase 6: New Professional Bonus Engine

Goal:

- Handle Bono Inicial and Renovacion for New Professional advisors.

### Phase 7: GMM Bonus Engine

Goal:

- Handle GMM initial, renewal, growth, and siniestralidad bonuses.

### Phase 8: Manager Productivity Engine

Goal:

- Use Advisor Qualification and TA dependency to calculate Partner Productividad.

### Phase 9: Manager Production Engine

Goal:

- Handle non-qualified advisor production compensation.

### Phase 10: Manager Activity Bonus Engine

Goal:

- Calculate policy-volume bonus from qualified advisors.

### Phase 11: Compensation Forecast Engine

Goal:

- Project gaps and likely risk using explicit data only.

Rule:

- No invented projections. Forecasts must state source data and uncertainty.

### Phase 12: Compensation Alert Engine

Goal:

- Turn compensation intelligence into actions:

Examples:

- "Collect one more eligible Vida policy before close."
- "Protect LIMRA; this cancellation puts Bono Inicial at risk."
- "Coach this advisor toward TA because Partner Productividad is capped without it."

## Primary Findings

- Compensation is not one domain; it is four related domains: product commissions, advisor contests, manager PCV, and operational payment/recalculation.
- Advisor stage is the backbone. The same event can mean different compensation depending on contest month, class, group active, and rule year.
- Policy count is not raw policy count. It is a versioned annual counting rule with line, premium, product, personal policy, shared policy, and cancellation adjustments.
- `comisiones.js` contains valuable discovery knowledge, but it is not a domain model. It mixes UI, DB, app imports, AI import, schedules, contest rules, and calculations.
- Manager compensation depends heavily on advisor compensation primitives: qualification, TA, policy count, LIMRA, IGC, and stage.

## Primary Risks

- Freezing 2025 commission schedules as if they were 2026 rules.
- Combining Product Knowledge with Commission Schedule and Contest Rules.
- Building schemas before closing missing tables and exact source definitions.
- Using current date instead of compensation period snapshots.
- Allowing unknown products to fall back to default commission rates.
- Treating Fecha de Conexion and Fecha de Concurso as identical in all cases.
- Treating GMM, Vida, initial, renewal, Prima Meta, Prima Pago, and commission amount as interchangeable.

## Recommended Roadmap

1. Close advisor compensation knowledge bases first.
2. Extract commission schedule library from `Comisiones Gerry .pdf` as a versioned 2025 schedule.
3. Extract 2026 contest rule configs from CC documents.
4. Reconcile product aliases and product IDs.
5. Define compensation period snapshots.
6. Define event model.
7. Only then create schemas.
8. Only after schemas, implement small engines by functional unit.


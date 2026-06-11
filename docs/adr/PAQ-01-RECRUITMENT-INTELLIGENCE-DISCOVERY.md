# PAQ-01 Recruitment Intelligence Discovery

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](../archive/FORGE_FOUNDATION_LOCK.md)

---


### Mode
Principal Domain Architect

### Scope
Architecture discovery only.

This document does not create code.
This document does not create engines.
This document does not create schemas.
This document does not modify UI.
This document does not commit changes.

### Primary files reviewed

Reclutamiento.xlsx
### Location reviewed
/storage/emulated/0/Download/Quick Share/Reclutamiento.xlsx

Copia de Planeación_Trimestral_Partners_2026.xlsx
### Location reviewed
/storage/emulated/0/Download/Quick Share/Copia de Planeación_Trimestral_Partners_2026.xlsx

### PCV / Partner context
No file named exactly "PCV 2026 Partners.pdf" was found in the searched locations.
### A likely related file was found
/storage/emulated/0/Download/2026_Partner_Compensation.pdf

The PDF has 21 pages but produced no usable text through pdftotext. Therefore, this document treats the PDF as present but not semantically extractable in this pass. No formulas or rules are invented from the PDF.


## 1. Executive Summary

Recruitment Intelligence should become the first real Intelligence Phase domain because the workbook reveals that Partner economics begin before compensation.

The Excel is not merely a recruiting tracker.

### It represents a full operational system for

Generating names.
Classifying sources.
Tracking interviews.
Measuring movement through stages.
Detecting abandonment.
Starting precontract.
Connecting candidates.
Converting candidates into signed advisors.
Planning advisor development.
Linking recruitment to Partner productivity, connection, development and income.

### The core business insight is valid

If the Partner recruits, every later economic path remains possible.
If the Partner does not recruit, productivity, connection, development, compensation and Alta Partner eventually collapse.

### The phrase

"Si reclutas, nada más importa.
Si no reclutas, nada más importa."

should not become motivational text inside Forge.

### Forge must convert it into a measurable causal model

Sources
Names
Interviews
Connected
Signed
Development
TA
Qualified advisors
Productivity
Partner compensation
Alta Partner

The workbook also reveals that Recruitment Intelligence is not only a funnel.

It is a source-quality system, a time system, a behavioral discipline system, a network-growth system, and a future Partner economics signal.

### Confirmed workbook signals

The workbook contains monthly candidate sheets from Ene to Dic.
Each monthly sheet tracks contact date, prospect name, source, university graduation status, commercial experience, POP, number of names, EI, ES, EC, EA, time per interview stage, connected status, signed status and comments.
The Resumen sheet defines an operating model: 64 names, 32 One Thing, 16 EI, 8 ES, 4 EC, 2 EA, 1 PC, and Alta as target monthly path.
The weekly model in RTW explicitly asks for 15 new names per week, at least 10 from warm sources.
Fuente y Actividad aggregates source counts and interview activity by month.
P200 is a 200-name natural market inventory.
PM is a Magic Question referral capture table.
Precont tracks precontract status, keys, EFC, policies, paid policies, commissions, exams, cédula payment and CNSF appointment.
Planeación Trimestral connects downstream Partner economics to Productividad, Producción, Actividad, Conexión and Desarrollo.

### Important confirmed limitation

POP is used in the workbook but not explicitly defined in the reviewed repository documents or extractable PDF text. The workbook uses POP values such as VERDE, AMARILLO and ROJO, and MP1B references "Resultados POP (P, PCP, OC)". Therefore POP must be treated as an operational classification with unresolved definition until source documentation is reviewed.

### Final domain verdict

Recruitment Intelligence should be APPROVED FOR ARCHITECTURE DISCOVERY.
It should not be implemented yet.
The next architecture step should define the canonical Recruitment Intelligence domain model using the closed Forge Foundation.


## 2. Sheet Map

### Workbook
Reclutamiento.xlsx

### Detected sheets

## 1. Mp2
## 2. Mp1b
## 3. Mp1c
## 4. Rtw
5. Resumen
6. One Thing
## 7. PM
8. Precont
## 9. P200
10. Ene
11. Feb
12. Mar
13. Abr
14. May
15. Jun
16. Jul
17. Ago
18. Sep
19. Oct
20. Nov
21. Dic
22. Fuente y Actividad
23. Calendario CA1
24. Hoja1
25. Hoja2
26. Hoja3
27. Calendario EFC


2.1 MP2

### Purpose
Monthly agenda.

### Type of information
Calendar blocks by month, office, partner and day of week.

### Probable user
Partner, Senior Partner, manager or operational owner.

### Probable frequency
Monthly planning, weekly execution.

### Decision enabled
Where recruiting and follow-up work should be scheduled.

### Domain interpretation
MP2 is not a recruitment fact source by itself. It is an operational planning artifact. It can generate or consume calendar commitments, activity blocks and follow-up obligations.


2.2 MP1B

### Purpose
Monthly recruiting action plan.

### Type of information
Partner, zone, office, specific prospecting plans, selection plans, number of names, hours, pending interviews, interview type, next interview date, POP result, approximate school.

### Probable user
Partner or recruiting manager.

### Probable frequency
Monthly planning and weekly follow-up.

### Decision enabled
Which sources and interview pipelines require action this month.

### Domain interpretation
MP1B is the operational bridge between source generation and interview movement. It includes both source planning and candidate-stage follow-up.

### Rule Pack note
Labels and format belong to SMNYL Agency 2026 Rule Pack or operational document interpretation, not Forge Core.


2.3 MP1C

### Purpose
Advisor development action plan.

### Type of information
Development of advisors, advisor and connection date, method, GID, plans, monthly goals, hours by responsible person, roles such as Managing Partner, Senior Partner, Partner, Desarrollador, Process Owner and Mentor.

### Probable user
Partner, manager, developer, mentor.

### Probable frequency
Monthly or development-cycle planning.

### Decision enabled
Who needs development, who owns the development action, and how hours/responsibilities are distributed.

### Domain interpretation
MP1C is downstream from recruiting. It begins after candidates become advisors or enter advisor development. It connects Recruitment Intelligence to Partner Intelligence, Productivity Intelligence and Manager Intelligence.


2.4 RTW

### Purpose
Weekly recruiting work tracker.

### Type of information
Partner, office, week, candidate names, sources, telephone, weekly recruiting target text.

### Key workbook text
"RECLUTANDO ESTA SEMANA: 15 Nuevos nombres. Al menos 10 de fuentes cálidas."

### Probable user
Partner.

### Probable frequency
Weekly.

### Decision enabled
Whether the Partner has enough name flow this week and whether the source mix is healthy.

### Domain interpretation
RTW is a weekly leading-indicator surface. It measures recruiting discipline before interview outcomes appear.

### Rule Pack note
The target "15 names / 10 warm sources" is a rule or operating standard from SMNYL Agency 2026, not Forge Core.


2.5 Resumen

### Purpose
Monthly and weekly funnel summary.

### Type of information
### Partner funnel targets and actuals

### Nombres.
### One Thing.
EI.
ES.
EC.
EA.
PC.
ALTA.

### Confirmed model in workbook

### Modelo mes
64 names.
32 One Thing.
16 EI.
8 ES.
4 EC.
2 EA.
1 PC.

### Modelo sem
16 names.
8 One Thing.
4 EI.
2 ES.
1 EC.
1 EA.
1 PC.

### Probable user
Partner, manager, office leader.

### Probable frequency
Weekly and monthly.

### Decision enabled
Where the funnel is breaking and whether the Partner is on pace.

### Domain interpretation
Resumen is the current Excel version of Recruitment Intelligence. Forge should generate this from events and metric snapshots rather than require manual spreadsheet maintenance.


2.6 One Thing

### Purpose
Daily/weekly prospect name or priority focus tracker.

### Type of information
Prospect names and dates across months.

### Probable user
Partner.

### Probable frequency
Daily or weekly.

### Decision enabled
Which prospect is the current focus and whether the Partner is consistently moving named candidates into the funnel.

### Domain interpretation
One Thing appears to be a discipline and prioritization layer, not a separate source of truth. It should consume candidate identity and status from Recruitment Intelligence.


2.7 PM

### Purpose
Pregunta Mágica referral capture.

### Type of information
Candidate name, referred person, phone, age, marital status, children, relationship, occupation/activity and comments.

### Probable user
Partner during or after additional interview.

### Probable frequency
Whenever the Magic Question is asked.

### Decision enabled
Which new names were generated by a candidate, and which candidates create valuable recruiting networks.

### Domain interpretation
PM is the clearest evidence that recruitment is a network-growth domain, not only a linear funnel.


2.8 Precont

### Purpose
Precontract tracker.

### Type of information
Advisor, candidate, source, support, additional interview date, key activation date, key expiration, initial EFC, real EFC, Vida/GMM folios, Vida/GMM policies, Vida/GMM paid policies, commissions, exams, cédula payment, CNSF appointment, comments.

### Probable user
Partner, manager, precontract process owner.

### Probable frequency
As precontract process changes.

### Decision enabled
Which connected candidates are progressing toward contract and what operational blockers exist.

### Domain interpretation
Precont is the boundary between Recruitment Intelligence and Precontract Intelligence. It should not be collapsed into either one without preserving lifecycle transitions.


2.9 P200

### Purpose
Proyecto 200 natural market inventory.

### Type of information
Number, prospect name, source, phone, comment.

### Probable user
Candidate, advisor, partner.

### Probable frequency
Initial creation and periodic refresh.

### Decision enabled
Whether the candidate has sufficient market depth and whether their natural market can support production and recruiting potential.

### Domain interpretation
P200 is both recruitment evidence and future productivity evidence. It is not only a name list.


2.10 Ene through Dic

### Purpose
Monthly candidate funnel tracking.

### Type of information
Contact date, prospect name, source, graduation status, commercial experience, POP, names generated, interview stages, time per stage, connected flag, signed flag and comments.

### Common columns

Fecha contacto inicial.
Nombre del Prospecto.
Fuente.
Graduado de Universidad Si / No.
Experiencia Comercial.
POP.
### Nombres.
Inicial.
Selección.
Carrera.
Adicional.
Tiempo.
Conectado.
Firmo.
Comentarios.

### Probable user
Partner or recruiting manager.

### Probable frequency
Daily/weekly operational update; monthly review.

### Decision enabled
Which candidates should move forward, which stalled, why they abandoned, and where source/stage conversion is weak.

### Domain interpretation
These monthly sheets are the main event source for Recruitment Intelligence.


2.11 Fuente y Actividad

### Purpose
Monthly source and activity aggregation.

### Type of information
### Source counts by month

NOM.
CI.
RDA.
OP.
PM.
FF.
### Total.

### Activity counts by month

Inicial.
Selección.
Carrera.
Adicional.
Contratado.
Firmo.

### Probable user
Partner, manager, office leader.

### Probable frequency
Monthly review.

### Decision enabled
Whether source mix and interview activity support future connections and signings.

### Domain interpretation
This is a metric snapshot, not a source of truth. Forge should generate it from recruitment events.


2.12 Calendario CA1

### Purpose
Empty in reviewed workbook.

### Type of information
No populated cells found.

### Probable user
Unknown.

### Probable frequency
Unknown.

### Decision enabled
Unknown until populated or source documentation is reviewed.


2.13 Hoja1, Hoja2, Hoja3

### Purpose
Empty in reviewed workbook.

### Type of information
No populated cells found.

### Probable user
Unknown.

### Probable frequency
Unknown.

### Decision enabled
None confirmed.


2.14 Calendario EFC

### Purpose
Empty in reviewed workbook.

### Type of information
No populated cells found.

### Probable user
Precontract or EFC process owner.

### Probable frequency
Unknown.

### Decision enabled
Potentially EFC scheduling, but not confirmed from populated data.


2.15 Planeación Trimestral Partners 2026 context

The planning workbook is not the recruiting workbook, but it proves downstream dependency.

### Detected sheets

Plan.
4Q 2026.
3Q 2026.
2Q 2026.
1Q 2026.
Ingreso.
Hoja1.
### Objetivo De Ingresos.
Productividad.
Producción.
Actividad.
Conexión.
Desarrollo.
Transición.
Alta Partner.
Apoyo.

### Important downstream concepts

Productividad.
Producción.
Actividad.
Conexión.
Desarrollo.
Alta Partner.
Apoyo.
Ingreso.

### Implication
Recruitment Intelligence feeds Partner economics indirectly through connection, development, activity, productivity and qualified advisors.


## 3. Recruitment Funnel

### Canonical funnel observed

Source
Name
P200 / market evidence
EI
ES
EC
EA
Connected
Signed
Development


3.1 Source

Source is the origin of the candidate or prospect name.

### Confirmed source labels

NOM = Nominados.
CI = Centro de Influencia.
RDA = Referido de Asesor.
OP = Observación Personal.
PM = Pregunta Mágica.
FF = Fuente Fría.

Source is not merely a label.

### It predicts

Trust transfer.
Conversion probability.
Follow-up strategy.
Expected quality.
Network expansion potential.
Manager confidence.


3.2 Name

The name is the first observable recruitment asset.

### In Forge Foundation terms
This is not yet an advisor.
It is a CommercialPerson or potential CommercialPerson with recruitment context.

### Important
Name count should not be confused with candidate quality.


3.3 P200

P200 is an inventory of market reach.

### It can indicate

Market depth.
Candidate discipline.
Potential prospecting capacity.
Natural market strength.
Future advisor productivity risk.

P200 completion should not be treated as proof of quality by itself.


3.4 EI

EI = Entrevista Inicial.

This is a Fact Event if it occurred.

It is a conversion point from name to evaluated prospect.


3.5 ES

ES = Entrevista Selección.

This is a Fact Event if it occurred.

It is a deeper evaluation point.


3.6 EC

EC = Entrevista de Carrera.

This is a Fact Event if it occurred.

It likely represents serious candidate evaluation and career fit exploration.


3.7 EA

EA = Entrevista Adicional.

This is a Fact Event if it occurred.

It is also the likely moment for Magic Question loop creation.


3.8 Connected

Conectado = started Precontract.

This is a lifecycle transition event.

It is stronger than interview completion but weaker than signed contract.


3.9 Signed

Firmado = signed contract.

This is a lifecycle transition event from candidate/precontract into advisor status.


3.10 Development

Development begins after connection/signing and continues into advisor growth.

This becomes shared territory among Recruitment Intelligence, Career Intelligence, Mick, Partner Intelligence and Manager Intelligence.


3.11 Gaps and abandonment points

### Observed abandonment patterns from comments

POP rojo.
No hizo POP.
Dejó de contestar.
No se conectó.
No le interesa la oportunidad.
Salió otra oportunidad laboral.
No tiene contactos.
Problemas familiares.
No continúa por trámites o momento personal.

### Primary funnel gaps

### Many names but few EI
Source quality, contact discipline or weak prioritization issue.

### Many EI but few ES
Initial interview is not creating selection readiness or candidates are weak.

### Many ES but few EC
Selection process may be filtering too hard or partner lacks follow-up discipline.

### Many EC but few EA
Career narrative may not be converting into next step.

### Many EA but few connected
Final commitment or precontract readiness issue.

### Many connected but few signed
Precontract execution issue.


## 4. Source Intelligence Model

Recruitment sources should be evaluated by both volume and quality.

Volume-only recruiting creates false confidence.


4.1 NOM - Nominados

### Likely category
Warm or semi-warm.

### Trust transfer
Medium to high, depending on who nominates.

### Loop potential
Medium.

### Quality lens
Nomination source quality matters more than count.

### Forge decision
Which nominator produces candidates who actually progress?


4.2 CI - Centro de Influencia

### Likely category
Warm.

### Trust transfer
High if the center of influence is credible.

### Loop potential
High if the CI repeatedly provides names.

### Quality lens
Measure by conversion to EI, ES, connected and signed, not only number of names.

### Forge decision
Which centers of influence deserve cultivation?


4.3 RDA - Referido de Asesor

### Likely category
Warm.

### Trust transfer
High because trust is transferred through an advisor.

### Loop potential
High if advisors repeatedly refer strong candidates.

### Quality lens
Measure by advisor source quality and downstream conversion.

### Forge decision
Which advisors are strong recruiting channels?


4.4 OP - Observación Personal

### Likely category
Warm if there is real relationship or observed fit; otherwise semi-warm.

### Trust transfer
Depends on depth of observation.

### Loop potential
Medium.

### Quality lens
OP quality depends on partner judgment.

### Forge decision
Is the Partner identifying high-potential people or only adding visible names?


4.5 PM - Pregunta Mágica

### Likely category
Warm by network origin.

### Trust transfer
Medium. The trust comes through the candidate, but candidate quality and relationship depth vary.

### Loop potential
Very high.

### Quality lens
Measure both volume and quality of referred names generated per candidate.

### Forge decision
Which candidates create valuable network expansion?


4.6 FF - Fuente Fría

### Likely category
Cold.

### Trust transfer
Low.

### Loop potential
Low to medium.

### Quality lens
FF may generate volume but should be monitored for low conversion or low trust.

### Forge decision
When is cold-source volume useful, and when is it masking weak warm-source generation?


4.7 Source quality principles

### Source metrics should include

Names generated.
EI conversion.
ES conversion.
EC conversion.
EA conversion.
Connected conversion.
Signed conversion.
Average time to next stage.
Drop-off reasons.
Referral loop generation.
Quality of downstream advisor.

Warm source dominance should not be assumed universally by Forge Core.

The rule "15 new names, at least 10 warm" belongs to SMNYL Agency 2026 Rule Pack or operating standard.


## 5. Magic Question Loop

### Confirmed Magic Question

"Así como estoy abriendo esta posición para la cual te estoy entrevistando, tengo que abrir 2, 3, 4 o más posiciones en los próximos meses. De la gente que conoces, ¿a quién te gustaría invitar a una entrevista como la que acabamos de tener?"


5.1 What PM really is

Pregunta Mágica is not just a source.

It is a recruiting network-expansion mechanism.

It converts one candidate interaction into potential new candidate nodes.

It creates a candidate-to-candidate referral graph.


5.2 How a candidate generates new candidates

Candidate completes or reaches additional interview.
Partner asks Magic Question.
Candidate provides referred names.
Each referred name becomes a new recruitment name.
Each referred name can progress through EI, ES, EC, EA, connected and signed.
Each referred name can later generate more PM referrals.


5.3 Conceptual graph

### Node types

Candidate.
Referred Candidate.
Advisor.
Partner.
Source Person.
Center of Influence.

### Edge types

Referred by.
Nominated by.
Connected by.
Developed by.
Interviewed by.
Converted by.


5.4 Metrics emerging from PM

PM names generated per candidate.
PM candidates reaching EI.
PM candidates reaching ES.
PM candidates reaching EC.
PM candidates reaching EA.
PM candidates connected.
PM candidates signed.
PM referral depth.
PM referral chain value.
PM source quality.
PM conversion by originating candidate.


5.5 Detecting candidates who generate better network

### Forge should identify candidates who

Provide multiple names.
Provide warm names.
Provide names who respond.
Provide names who reach EI.
Provide names who reach connected or signed.
Provide names who later generate more referrals.

### Important
A candidate who does not sign may still be valuable if they generate a strong network.


## 6. Recruitment Event Model

Event model should preserve facts first and interpretations second.


6.1 Fact Events

### Recruitment_name_added
### Meaning
A name entered the recruitment universe.

### Candidate_source_assigned
### Meaning
A source was assigned to a candidate/name.

### Candidate_contacted
### Meaning
Initial contact occurred.

### Ei_completed
### Meaning
Entrevista Inicial occurred.

### Es_completed
### Meaning
Entrevista Selección occurred.

### Ec_completed
### Meaning
Entrevista de Carrera occurred.

### Ea_completed
### Meaning
Entrevista Adicional occurred.

### Magic_question_asked
### Meaning
Magic Question was asked.

### Magic_question_referral_created
### Meaning
A new referred name was created from Magic Question.

### P200_name_added
### Meaning
A name was added to Proyecto 200.

### Precontract_started
### Meaning
Candidate became connected and started precontract.

### Contract_signed
### Meaning
Candidate signed contract.

### Recruitment_stage_abandoned
### Meaning
Candidate stopped progressing at a stage.

### Recruitment_comment_recorded
### Meaning
Operational comment was recorded.


6.2 Interpretation Events

### Source_quality_evaluated
### Meaning
Forge or Rule Pack interpreted source performance.

### Candidate_risk_identified
### Meaning
Candidate is at risk of abandonment or low conversion.

### Funnel_gap_detected
### Meaning
Funnel conversion is below expected threshold.

### Pop_classification_assigned
### Meaning
POP value was assigned or interpreted.

### Note
POP definition is not confirmed. This should remain an interpretation pending Rule Pack documentation.


6.3 Decision Events

### Candidate_selected_for_next_interview
### Meaning
Decision to move candidate forward.

### Candidate_not_continued
### Meaning
Decision to stop process.

### Followup_required
### Meaning
Action decision to follow up.

### P200_completion_required
### Meaning
Decision that candidate/advisor must complete or update P200.


6.4 Experience Events

### Recruitment_help_shown
### Meaning
Advisor/Partner received contextual help about recruiting process.

### Source_quality_explained
### Meaning
Forge explained source quality or source mix.

### Funnel_causal_chain_explained
### Meaning
Forge explained why current recruiting gap affects future Partner income.


6.5 System Events

### Recruitment_duplicate_detected
### Meaning
Potential duplicate candidate/person detected.

### Recruitment_record_merged
### Meaning
Duplicate records were reconciled.

### Excel_import_reviewed
### Meaning
Manual workbook data was imported or reviewed.

### Report_generated
### Meaning
Forge generated summary, source or activity report.


## 7. Metrics Ownership

Recruitment Intelligence should own recruitment funnel metrics.

It should not own downstream compensation, career, conservation or official production metrics.


7.1 Recruitment-owned metrics

Names added.
Names by source.
Warm-source names.
Cold-source names.
P200 names.
P200 completion.
EI completed.
ES completed.
EC completed.
EA completed.
Connected candidates.
Signed candidates.
Drop-off count by stage.
Drop-off reason distribution.
Days from name added to EI.
Days from EI to ES.
Days from ES to EC.
Days from EC to EA.
Days from EA to connected.
Days from connected to signed.
EI to ES conversion.
ES to EC conversion.
EC to EA conversion.
EA to connected conversion.
Connected to signed conversion.
Source conversion.
Magic Question referrals generated.
Magic Question referral conversion.
Candidate referral network depth.
Weekly recruiting activity.
Monthly recruiting activity.


7.2 Recruitment-consumed metrics

### From Mick
Recruiting activity discipline.
Follow-up consistency.
Task completion.
Behavioral execution patterns.

### From Partner Intelligence
Partner assignment.
Partner stage.
Partner tenure.
Partner goals.

### From Forecast Intelligence
Forecasted connections.
Forecasted signed candidates.
Forecasted recruiting gap.

### From Business Planning
Goal, forecast, gap and actions.

### From Compensation Intelligence
Confirmed Partner compensation impact only after official compensation outputs exist.

### From Career Intelligence
Advisor stage after signing.


7.3 Metrics Recruitment must not own

Partner compensation.
Productividad bonus.
Conexión bonus.
Desarrollo bonus.
TA qualification.
Advisor career stage after contract.
Policy production.
Paid policy count.
Conservation metrics.
Official income.


7.4 Snapshot requirements

### Recruitment Funnel Snapshot
Current funnel by source, stage, conversion and risk.

### Source Quality Snapshot
Monthly source performance and conversion.

### Candidate Stage Snapshot
Current stage, dates, elapsed time and next action.

### Magic Question Network Snapshot
Referral graph and downstream quality.

### Partner Recruiting Snapshot
Weekly/monthly recruiting performance by Partner.

### Precontract Transition Snapshot
Candidates who moved from recruitment into precontract.


## 8. Forecast Opportunities

Forecasts are suggestions.
Facts are facts.

Recruitment Intelligence can forecast future outcomes, but must never label forecasts as confirmed connections, confirmed signings, confirmed productivity or confirmed compensation.


8.1 Forecastable outcomes

Probable EI volume.
Probable ES volume.
Probable EC volume.
Probable EA volume.
Probable connected candidates.
Probable signed candidates.
Candidates at risk.
Source exhaustion risk.
Warm-source shortage risk.
Cold-source overreliance risk.
P200 completion risk.
Magic Question network value.
Future qualified advisor pool.
Future Partner productivity risk.
Future development load.
Future precontract workload.


8.2 Forecast basis

### Forecasts may use

Historical conversion by source.
Historical conversion by stage.
Current active names.
Current interview dates.
Current stage distribution.
Elapsed days in stage.
Drop-off patterns.
Source warmth.
P200 completion.
Magic Question referrals.
Partner recruiting activity.
Mick behavior consistency.
Rule Pack targets.


8.3 Forecast guardrails

Do not forecast compensation as confirmed.
Do not forecast signing as fact.
Do not forecast candidate quality from source alone.
Do not treat P200 completion as advisor success.
Do not treat many names as enough if conversion is weak.
Do not hide uncertainty.


8.4 Example forecast language

### Valid
"Based on current stage conversion, this Partner is likely short of connected candidates for the month."

### Valid
"Warm-source shortage creates risk to next month's EI volume."

### Invalid
"This Partner will receive Alta Partner bonus."

### Invalid
"These candidates are guaranteed to sign."


## 9. Partner Intelligence Impact

Recruitment Intelligence feeds multiple downstream domains.


9.1 Partner Intelligence

Recruitment is a primary Partner leading indicator.

### Partner Intelligence should consume

Recruiting volume.
Warm-source mix.
Stage conversion.
Magic Question network growth.
Candidate quality signals.
Connected candidates.
Signed candidates.
Development pipeline.

### Partner Intelligence should answer

Is the Partner creating future advisors?
Is the Partner's recruiting engine healthy?
Is the Partner depending on cold sources?
Is the Partner building network loops?
Is the Partner likely to have future development load?


9.2 Productivity Intelligence

Recruitment creates the future advisor base.

### Productivity Intelligence should consume

Signed candidates.
Connection dates.
Development stage.
P200 quality.
Early activity signals.
Source quality.

It should not recalculate recruiting metrics.


9.3 Forecast Intelligence

Recruitment provides early forecast signals.

### Forecast Intelligence should consume

Current funnel.
Source mix.
Stage conversion.
Time in stage.
Drop-off risk.
Precontract starts.
Signed candidates.

### It should forecast

Likely connections.
Likely signed candidates.
Likely development capacity.
Future productivity risk.


9.4 Business Planning Intelligence

Recruitment converts Partner goals into activity.

### Business Planning should connect

Partner goal.
Recruitment forecast.
Funnel gap.
Specific recruiting actions.

### Example

### Goal
1 signed advisor this month.

### Forecast
Current funnel likely produces 0.4 signed advisors.

### Gap
Need more EI-ready warm-source candidates.

### Actions
Ask Magic Question in all EA interviews.
Activate two centers of influence.
Complete P200 review.
Follow up stalled ES candidates.


9.5 Compensation Intelligence

Recruitment is not compensation, but it starts the causal path to compensation.

Compensation Intelligence should consume confirmed downstream events:

Connected candidates.
Signed advisors.
Development outcomes.
Qualified advisors.
Productivity results.
Rule Pack interpretation.

It should not own recruiting facts.


## 10. Causal Chain

### Canonical causal chain

Names
Interviews
Connected
Signed
Development
TA
Qualified advisors
Productivity
Partner income
Alta Partner


10.1 Names to interviews

Names create the raw possibility of interviews.

### Forge should explain

No names means no future EI.
Low warm-source names mean lower trust transfer.
Cold volume can hide quality problems.


10.2 Interviews to connected

EI, ES, EC and EA progressively test fit, seriousness and readiness.

### Forge should explain

Where the candidate pipeline is breaking.
Which stage loses the most candidates.
Whether the issue is source quality, interview quality, follow-up or process readiness.


10.3 Connected to signed

Connected means precontract started.
Signed means contract completed.

### Forge should explain

Connected candidates are not yet signed.
Precontract risk must be tracked separately.
Operational blockers matter.


10.4 Signed to development

Signed advisors create development responsibility.

### Forge should explain

Recruitment without development creates future failure.
Development load must be planned.


10.5 Development to TA and qualified advisors

Development affects whether new advisors qualify, persist and produce.

### Forge should explain

The Partner's recruiting quality affects future qualified advisor count.
TA and qualification are downstream Rule Pack interpretations, not recruiting facts.


10.6 Qualified advisors to productivity and income

Qualified productive advisors affect Partner economics.

### Forge should explain

Recruiting activity today can affect future Partner income, but income is not confirmed until compensation rules and events support it.


## 11. Critical Risks

1. Treating the Excel as the system.

### Risk
Forge recreates spreadsheet tabs instead of modeling recruitment facts, events and decisions.

### Required guardrail
Excel becomes evidence, import source or generated report. Forge becomes the operating system.


2. Duplicating candidate identity.

### Risk
Same candidate appears in P200, PM, monthly sheets, One Thing and Precont as separate records.

### Required guardrail
CommercialPerson identity and duplicate detection are required.


3. Confusing name volume with recruiting health.

### Risk
Many names but poor conversion creates false confidence.

### Required guardrail
Measure source quality and stage conversion.


4. Treating warm-source rules as Core.

### Risk
"15 names / 10 warm" becomes hardcoded in Forge Core.

### Required guardrail
Targets belong to SMNYL Agency 2026 Rule Pack.


5. POP ambiguity.

### Risk
Forge interprets POP without knowing official meaning.

### Required guardrail
Treat POP as unresolved Rule Pack classification until official definition is captured.


6. PM quality illusion.

### Risk
Magic Question generates many names but low quality.

### Required guardrail
Measure PM downstream conversion, not only PM volume.


7. Forecast overreach.

### Risk
Recruitment forecasts are treated as confirmed signings or compensation.

### Required guardrail
Forecasts are suggestions. Facts are facts.


8. Manager change during process.

### Risk
Candidate attribution, responsibility and coaching history break.

### Required guardrail
Use historical CommercialAssignment and CommercialAttribution.


9. Precontract boundary collapse.

### Risk
Connected and signed are treated as the same outcome.

### Required guardrail
PRECONTRACT_STARTED and CONTRACT_SIGNED must remain separate events.


10. Manual capture overload.

### Risk
User must enter same candidate data in P200, PM, monthly sheet and Precont.

### Required guardrail
Capture Once.


## 12. Recommended Next Architecture Step

### Recommended next architecture step

Create the official Recruitment Intelligence Architecture document.

This should be architecture-only.

### It should define

Domain purpose.
Domain boundaries.
Canonical entities consumed from Shared Commercial Model.
Recruitment-specific concepts.
Event taxonomy.
Metric ownership.
Source quality model.
Magic Question network model.
P200 semantics.
Precontract boundary.
Forecast guardrails.
Rule Pack separation.
Reports Forge should generate.
Decisions Forge should support.

Do not implement yet.

Do not create engines yet.

Do not create schemas yet.

Do not hardcode SMNYL-specific thresholds in Core.


## 13. Final Verdict

Recruitment Intelligence is a valid Intelligence Phase domain.

### It should be treated as

### Status
### Discovery Complete For Paq-01

### Architecture status
APPROVED FOR FORMAL ARCHITECTURE DESIGN

### Implementation status
### Not Implemented

### Foundation compatibility
### Supported By Foundation Lock

### Rule Pack dependency
SMNYL Agency 2026 Rule Pack required for source targets, POP definitions, activity standards, stage expectations and downstream compensation interpretations.

### Core dependency
### Forge Core should only provide universal primitives

CommercialPerson.
CommercialAccount.
CommercialRelationship.
CommercialAssignment.
CommercialAttribution.
Evidence.
Provenance.
PeriodSnapshot.
RuleSnapshot.
Commercial Events.
Metric ownership discipline.

### Final architectural conclusion

Recruitment Intelligence should not copy Reclutamiento.xlsx.

Recruitment Intelligence should explain the recruiting system behind the Excel:

Where names come from.
Which sources create quality.
Which stages convert.
Where candidates abandon.
Which candidates generate networks.
Which Partners are building future advisor capacity.
Which recruiting gaps threaten future productivity and income.
Which next actions matter now.

Forge should turn recruitment from manual tracking into decision intelligence.

### The first Intelligence Phase question is not

"How many names are in the spreadsheet?"

### The first Intelligence Phase question is

"Is this Partner creating the future advisor base required to grow?"

That is the domain mission of Recruitment Intelligence.

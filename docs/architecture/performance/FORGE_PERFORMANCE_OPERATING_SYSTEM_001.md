# FORGE PERFORMANCE OPERATING SYSTEM

## Document Control

| Field | Value |
|---|---|
| Document | Forge Performance Operating System |
| Identifier | FP-OS-001 |
| Status | FOUNDATIONAL DRAFT |
| Authority Class | Operational Architecture |
| Primary Domain | Human Intelligence / Advisor Development |
| Governing Authority | Forge Constitution and Article 0 |
| Implementation Branch | `feature/activity-domain-runtime-foundation` |
| Initial Scope | Activity, Performance, Work Calendar, Shared Intelligence, Action Planning, Coaching, Manager Intelligence and Gamification |

---

# 1. PURPOSE

Forge Performance Operating System defines how Forge observes commercial activity, preserves evidence, measures advisor performance, identifies development needs, recommends concrete action, supports managers and sustains professional habits.

This system exists to develop advisor capability.

It does not exist to surveil advisors.

It does not exist to manufacture pressure.

It does not exist to replace human judgment.

It does not transform Forge into a CRM.

Forge is not organized around customer-record administration. Forge is organized around evidence, advancement, judgment, development and execution.

The central operating question is:

> What evidence-based action will most strengthen the advisor's capability and improve the probability of meaningful commercial advancement?

---

# 2. CONSTITUTIONAL ALIGNMENT

This architecture SHALL comply with the following Forge principles:

1. Reality precedes assumptions.
2. Evidence precedes opinion.
3. Human authority precedes artificial authority.
4. Capability precedes dependency.
5. Advancement precedes activity.
6. Architecture is problem-driven.
7. Forge exists to strengthen human judgment, not replace it.
8. Performance measurement SHALL support development rather than control.
9. Economic context MAY inform motivation but MUST NOT become coercion.
10. Recommendations MUST remain explainable, contestable and reversible.

No performance score, model, recommendation or organizational pattern may become the final authority on human potential.

---

# 3. WHAT THIS SYSTEM IS NOT

Forge Performance Operating System is not:

- a CRM;
- a leaderboard engine;
- a surveillance surface;
- an attendance monitor;
- a substitute for manager judgment;
- a mechanism for automatic disciplinary decisions;
- a motivational pressure system;
- a collection of vanity metrics;
- a points game detached from real work;
- an artificial authority over advisor capability.

Customer, prospect and opportunity data MAY participate as evidence and context, but the center of this architecture is advisor development and process advancement.

---

# 4. CORE OPERATING MODEL

```text
FES
  ↓
Pipeline
  ↓
Activity
  ↓
Performance
  ↓
Shared Intelligence
  ↓
Action Planning
  ↓
Nash / Mick Coaching
  ↓
Manager Intelligence
  ↓
Gamification and Habit Support
```

Each layer answers a separate question:

| Domain | Canonical Question |
|---|---|
| FES | What do we know, from which source, with what evidence state? |
| Pipeline | Where is the active commercial process and what advancement occurred? |
| Activity | What did the advisor actually do? |
| Performance | What do those actions and outcomes mean over time? |
| Shared Intelligence | What aggregated patterns are repeatedly associated with advancement? |
| Action Planning | What concrete plan should be executed next? |
| Nash / Mick | How should the advisor or manager understand and execute that plan? |
| Manager Intelligence | How can the manager best develop the advisor? |
| Gamification | How can Forge sustain healthy professional habits without manipulation? |
| Work Calendar | Which periods are evaluable, protected or operationally deferred? |

No domain SHALL assume ownership of another domain's truth.

---

# 5. AUTHORITY BOUNDARIES

## 5.1 FES

FES owns:

- evidence identity;
- source identity;
- provenance;
- evidence state;
- event history;
- corrections;
- reconciliation;
- auditability.

FES does not assign motivational meaning.

FES does not determine advisor worth.

## 5.2 Pipeline

Pipeline owns:

- prospect and opportunity progression;
- process stage;
- next commercial action;
- appointment scheduling;
- application progression;
- issue, placement and payment states when supported by authoritative evidence.

Pipeline produces operational facts and intentions.

Pipeline does not own productivity interpretation.

## 5.3 Activity

Activity owns:

- observable advisor actions;
- scheduled action references;
- action occurrence;
- advisor confirmation;
- system confirmation;
- correction and reversal;
- daily activity projection;
- connection between pipeline events and measurable advisor work.

Activity does not decide how many points an action is worth.

Activity does not judge whether the advisor is good or bad.

## 5.4 Performance

Performance owns:

- metric definitions;
- period aggregation;
- conversion calculations;
- trends;
- baselines;
- historical projections;
- goal progress;
- productivity snapshots;
- score calculation through governed rules.

Performance does not invent activity.

Performance does not issue coaching without an intelligence boundary.

## 5.5 Shared Intelligence

Shared Intelligence owns:

- privacy-preserving aggregate analysis;
- cohort definitions;
- pattern detection;
- confidence and support measurement;
- organizational learning;
- comparison against relevant anonymized baselines.

Shared Intelligence does not expose individual advisor behavior outside authorized contexts.

Shared Intelligence does not convert correlation into certainty.

## 5.6 Action Planning

Action Planning owns:

- development objectives;
- intervention selection;
- concrete next actions;
- weekly plans;
- recovery plans;
- growth plans;
- plan acceptance;
- plan progress;
- plan outcome measurement.

Action Planning does not fabricate contacts, meetings or strategies unsupported by available context.

## 5.7 Nash / Mick

Nash and Mick own governed interpretation and coaching behavior within their constitutional boundaries.

They may:

- explain evidence;
- frame a development problem;
- recommend a plan;
- adapt communication;
- help prepare a manager conversation;
- support advisor execution.

They must not:

- shame;
- coerce;
- manipulate scarcity;
- diagnose personal worth;
- hide uncertainty;
- claim causal certainty without sufficient evidence;
- replace manager or advisor judgment.

## 5.8 Manager Intelligence

Manager Intelligence owns:

- advisor development briefs;
- team-level patterns;
- coaching preparation;
- manager recommendations;
- intervention follow-up;
- escalation of material support needs.

Manager Intelligence SHALL help managers coach better.

It SHALL NOT automate punitive employment judgments.

## 5.9 Gamification

Gamification owns:

- streaks;
- milestones;
- progress visibility;
- personal records;
- habit reinforcement;
- recoverable momentum.

Gamification SHALL reward meaningful habits and verified advancement.

It MUST NOT reward meaningless clicks, compulsive interaction or public humiliation.

## 5.10 Work Calendar

Work Calendar owns evaluability.

It determines whether a date or period is:

- working;
- non-working;
- holiday;
- vacation;
- incapacity;
- leave;
- training;
- convention;
- personal day;
- administratively protected;
- organization-defined exception.

Work Calendar never rewrites when an activity actually occurred.

---

# 6. ACTIVITY AS OBSERVED TRUTH

Activity SHOULD be inferred from authoritative system events whenever possible.

Preferred source order:

1. authoritative system observation;
2. integrated external source;
3. advisor confirmation of a scheduled or detected event;
4. manager-confirmed correction;
5. manual advisor entry.

Manual counters SHALL NOT be the primary source of truth when an underlying activity record exists.

The points interface SHALL be a projection of verified activity, not a free-standing counter.

---

# 7. PIPELINE-TO-ACTIVITY FLOWS

## 7.1 Initial Appointment

When Pipeline stores an initial appointment, Activity SHALL create or reference:

```text
appointment.initial.scheduled
```

Scheduling does not mean completion.

After the scheduled time and applicable grace period, Forge MAY request confirmation:

> ¿Se llevó a cabo la cita inicial con esta persona?

Supported outcomes:

- completed;
- not completed;
- rescheduled;
- cancelled;
- pending confirmation.

Only a confirmed or authoritatively observed completion SHALL produce:

```text
appointment.initial.completed
```

Only the completion event may increment the completed-initial-appointment metric and apply the governed score rule.

## 7.2 Closing Appointment

The same pattern applies:

```text
appointment.closing.scheduled
appointment.closing.completed
```

The daily closing-appointment count SHALL reflect completed closing appointments, not appointments merely scheduled.

## 7.3 Application

When an application is validly stored or submitted through an authoritative process, Forge MAY automatically register:

```text
application.submitted
```

Advisor confirmation is not required when the source has sufficient authority.

When authority is incomplete, the event SHALL remain provisional until confirmed or reconciled.

## 7.4 Paid Policy

When Forge detects reliable evidence that a policy was paid, it SHALL register:

```text
policy.paid
```

Possible evidence paths include:

- authoritative carrier or integration signal;
- governed operational status;
- verified payment evidence;
- advisor confirmation when no stronger source exists.

The score SHALL only be awarded when the evidence state satisfies the scoring rule.

## 7.5 Referrals and New Names

New names and referrals SHALL be represented as records tied to their real source and acquisition context.

The system SHALL distinguish:

- requested referrals;
- names received;
- valid contact records created;
- first contact attempted;
- first conversation completed.

This prevents a single action from being counted repeatedly as several different accomplishments.

---

# 8. ACTIVITY RECORD CONTRACT

A canonical ActivityRecord SHOULD include:

```ts
type ActivityRecord = {
  id: string;
  schemaVersion: number;

  advisorId: string;
  organizationId: string;
  managerId?: string;

  prospectId?: string;
  opportunityId?: string;
  appointmentId?: string;
  policyId?: string;

  type: string;
  subtype?: string;
  status:
    | "planned"
    | "scheduled"
    | "due_for_confirmation"
    | "provisional"
    | "confirmed"
    | "not_completed"
    | "rescheduled"
    | "cancelled"
    | "corrected"
    | "reversed";

  source: {
    system: string;
    eventId?: string;
    authority: string;
    evidenceState: string;
  };

  scheduledAt?: string;
  occurredAt?: string;
  recordedAt: string;
  confirmedAt?: string;

  confirmation?: {
    method: string;
    confirmedBy?: string;
  };

  workCalendar: {
    actualDate: string;
    evaluationDate: string;
    evaluationState: string;
  };

  metadata?: Record<string, unknown>;
};
```

The ActivityRecord SHALL NOT hardcode the awarded point value.

---

# 9. POINTS AND SCORE

Points measure advisor activity and advancement under governed rules.

Points are not the objective.

Points are not a measure of human value.

Points SHALL be derived from confirmed, eligible activity events.

A score award SHOULD reference:

```ts
type ScoreAward = {
  id: string;
  advisorId: string;
  activityRecordId: string;
  ruleId: string;
  ruleVersion: number;
  points: number;
  status: "provisional" | "awarded" | "reversed" | "corrected";
  awardedAt?: string;
  reversedAt?: string;
};
```

Every award must be:

- traceable;
- reproducible;
- reversible;
- version-aware;
- period-aware;
- source-aware.

Changing a scoring rule SHALL NOT silently rewrite historical scores without an explicit migration or recalculation policy.

---

# 10. DAILY RECORD AND MANAGER DELIVERY

When an advisor saves or confirms the daily record, Forge SHALL produce an immutable or versioned DailyPerformanceSubmission.

It SHOULD contain:

- evaluable date;
- activity totals;
- confirmed events;
- provisional events;
- score;
- goal progress;
- missing confirmations;
- relevant work-calendar state;
- advisor notes when provided;
- evidence references;
- submission version.

The submission SHALL be available to the authorized manager.

The manager receives the advisor's operational record for coaching and support, not for context-free punishment.

Corrections SHALL create a new version or explicit amendment.

---

# 11. WORK CALENDAR AND EVALUABILITY

## 11.1 Non-Working Days

If a weekend or holiday contains no activity:

- the streak is not broken;
- the activity indicator does not decline;
- the day is not treated as a failed day;
- no inactivity alert is generated solely from that date.

The day is `not_evaluable`.

## 11.2 Activity on a Non-Working Day

If activity occurs on a non-working day:

- the actual occurrence date remains unchanged;
- the evidence remains attached to the real date;
- historical reporting may show the activity on the real date;
- goal and streak evaluation MAY assign operational credit to the next working day;
- no activity may be counted twice.

This requires two separate dates:

```text
actualDate
evaluationDate
```

## 11.3 Vacations and Protected Absence

Approved or validly registered vacation, incapacity, leave, training or convention SHALL freeze evaluability.

During protected absence:

- streaks remain protected;
- expected activity is not reduced as failure;
- Nash does not issue irrelevant inactivity coaching;
- managers do not receive false decline alerts;
- historical reporting preserves the protected period.

Retroactive protection SHALL require governed authorization or evidence to prevent metric manipulation.

## 11.4 Return-to-Work Behavior

Upon return, Forge MAY recommend a graduated re-entry plan.

The plan should consider:

- pipeline urgency;
- overdue follow-ups;
- advisor baseline;
- absence duration;
- manager guidance;
- current capacity.

Forge SHALL avoid treating the first day back as an automatic performance failure.

---

# 12. PERFORMANCE SNAPSHOTS

Performance converts governed activity into period-aware metrics.

A PerformanceSnapshot SHOULD include:

```ts
type PerformanceSnapshot = {
  id: string;
  advisorId: string;
  period: {
    start: string;
    end: string;
    timezone: string;
    evaluableDays: number;
  };
  activity: Record<string, number>;
  outcomes: Record<string, number>;
  conversions: Record<string, number | null>;
  score: {
    total: number;
    provisional: number;
  };
  trend: {
    direction: "up" | "stable" | "down" | "insufficient_data";
    baselineId?: string;
  };
  completeness: string;
  freshness: string;
  generatedAt: string;
};
```

Metrics SHALL declare:

- owner;
- formula;
- eligible inputs;
- period;
- timezone;
- completeness;
- freshness;
- evidence state.

A weekly metric MUST represent an actual governed week or explicit rolling seven-day period. It MUST NOT silently aggregate all available history.

---

# 13. HISTORICALS AND GRAPHICS

Forge SHALL preserve enough structured history to render:

- daily activity;
- weekly activity;
- monthly activity;
- rolling averages;
- conversion trends;
- source effectiveness;
- streak history;
- personal records;
- goal progress;
- pipeline-to-outcome lag;
- commission progress when authoritative;
- plan execution and impact.

Graphs must distinguish:

- zero activity;
- missing data;
- non-evaluable periods;
- protected absence;
- provisional data;
- confirmed data.

A blank period must never automatically mean zero.

---

# 14. PERFORMANCE INTERPRETATION

Performance interpretation SHALL distinguish at least:

1. insufficient activity volume;
2. insufficient new-name generation;
3. low contact rate;
4. low appointment-setting conversion;
5. low appointment completion;
6. weak follow-up execution;
7. low application conversion;
8. issue or placement friction;
9. payment friction;
10. insufficient or stale data;
11. protected absence;
12. normal statistical variation.

Forge must not say "the advisor is doing badly" when it can identify the actual operational constraint.

Preferred language:

> The available evidence indicates that new-name generation is currently the primary constraint.

Prohibited language:

> You are bad at prospecting.

---

# 15. SHARED INTELLIGENCE

Shared Intelligence learns from aggregated, privacy-preserving organizational evidence.

Example:

> In the eligible cohort, advisors who schedule at least seven new appointments in a week are more likely to record at least one weekly sale.

Such claims MUST include or internally preserve:

- cohort definition;
- period;
- sample size;
- support;
- confidence;
- relevant exclusions;
- freshness;
- correlation-versus-causation status;
- privacy threshold;
- model or query version.

Shared Intelligence SHALL support three scopes:

1. personal patterns;
2. team patterns;
3. organization patterns.

Individual-level information SHALL only be visible under explicit authorization.

Organization-level findings SHALL be aggregated and anonymized.

No insight SHALL expose sensitive peer data through small cohorts or indirect re-identification.

---

# 16. EXPLAINABILITY

Every recommendation SHALL answer:

1. What was observed?
2. Why does it matter?
3. What evidence supports the interpretation?
4. What uncertainty remains?
5. What action is recommended?
6. What outcome will be measured?
7. Who retains decision authority?

Example:

> Esta semana llevas cuatro citas nuevas. Tu objetivo operativo es siete porque, en cohortes comparables de la organización, alcanzar ese volumen se asocia con una mayor frecuencia de venta semanal. Te faltan tres. La recomendación tiene confianza media porque solo contamos con seis semanas completas de tu historial personal.

---

# 17. ACTION PLANNING

Forge SHALL move from diagnosis to execution.

An ActionPlan SHOULD include:

```ts
type ActionPlan = {
  id: string;
  advisorId: string;
  managerId?: string;
  objective: string;
  diagnosedConstraint: string;
  evidenceRefs: string[];
  strategyId: string;
  actions: Array<{
    id: string;
    description: string;
    target?: number;
    dueAt?: string;
    relatedEntityIds?: string[];
    status: "proposed" | "accepted" | "active" | "completed" | "skipped";
  }>;
  expectedSignals: string[];
  confidence: string;
  owner: string;
  acceptedAt?: string;
  reviewAt?: string;
};
```

## 17.1 New-Name Recovery Example

Detected condition:

```text
No new valid names have been added during the last evaluable period.
```

Possible governed strategies:

- call selected clients and request referrals;
- contact known centers of influence;
- organize a breakfast or small relationship event;
- reactivate paused prospects;
- review natural-market contacts;
- build a targeted alliance;
- execute a defined referral conversation.

Forge may say:

> No has generado nuevos nombres en los últimos siete días evaluables. Te propongo un plan concreto: llama a Juan y Pedro para solicitar referidos, identifica un centro de influencia y deja agendado un desayuno con seis clientes. La meta de la semana es obtener diez números nuevos válidos.

The recommendation must use real authorized context. Forge SHALL NOT invent Juan, Pedro or any contact.

## 17.2 Plan Selection

Plans SHOULD be selected using:

- diagnosed constraint;
- advisor history;
- available contacts;
- relationship context;
- manager strategy;
- time available;
- organizational patterns;
- advisor preference;
- prior plan effectiveness.

## 17.3 Plan Review

At review time, Forge SHALL compare:

- proposed actions;
- accepted actions;
- completed actions;
- generated activity;
- resulting advancement;
- observed outcome.

Forge should be able to say:

> El plan produjo doce nombres nuevos y cuatro citas iniciales. Mantendremos la estrategia de centros de influencia y reduciremos la reactivación, que tuvo menor respuesta.

---

# 18. MANAGER INTELLIGENCE

When authorized, managers SHALL receive a ManagerBrief prepared from governed data.

A ManagerBrief SHOULD include:

```ts
type ManagerBrief = {
  advisorId: string;
  period: string;
  strengths: string[];
  constraints: string[];
  evidenceRefs: string[];
  recommendedConversation: string[];
  proposedPlanIds: string[];
  managerActions: string[];
  confidence: string;
  generatedAt: string;
};
```

Example:

> Pamela mantiene una conversión saludable de citas a solicitudes, pero su generación de referidos es insuficiente para sostener el pipeline. Esta semana conviene trabajar una estrategia de centros de influencia y una meta de diez nombres nuevos. No priorices entrenamiento de cierre; la evidencia actual no muestra que ese sea el cuello de botella.

Manager Intelligence SHALL:

- prepare coaching;
- prioritize support;
- highlight evidence;
- identify uncertainty;
- recommend interventions;
- track agreed follow-up.

It SHALL NOT present recommendations as mandatory disciplinary conclusions.

---

# 19. NASH / MICK COACHING EXPERIENCE

The coaching layer SHALL translate evidence and plans into humane, direct and useful interaction.

Examples:

When activity declines:

> Tu actividad disminuyó durante los últimos cinco días evaluables. Esta semana enfócate únicamente en conseguir diez números nuevos. Ya preparé una lista de relaciones y estrategias que puedes revisar.

When progress is strong:

> Esta es tu quinta venta del mes. Llevas $65,000 en comisiones confirmadas. De acuerdo con tu mezcla actual, tres ventas similares te acercarían a $100,000. La cifra es una proyección, no una garantía.

When evidence is incomplete:

> Parece que alcanzaste la meta, pero todavía faltan dos citas por confirmar. No cerraré el score hasta que las revisemos.

Coaching must remain:

- specific;
- evidence-based;
- non-shaming;
- non-coercive;
- action-oriented;
- honest about uncertainty.

---

# 20. GAMIFICATION AND STREAKS

## 20.1 Streak Purpose

A streak represents sustained meaningful behavior.

It does not represent platform usage.

Eligible streaks may include:

- daily professional activity;
- prospecting;
- referral generation;
- follow-up hygiene;
- confirmation completeness;
- weekly planning;
- pipeline advancement.

## 20.2 Streak Protection

A streak SHALL not break because of:

- weekend inactivity when weekends are non-working;
- registered holiday;
- approved vacation;
- incapacity;
- protected leave;
- training or convention;
- missing confirmation still within its grace period.

Forge MAY warn:

> Tu racha está en riesgo. Solo falta confirmar la cita de las 16:00 para conservarla.

## 20.3 Streak Recovery

Forge SHOULD avoid punitive language.

When a streak ends:

> Tu racha de 43 días terminó. Durante ese periodo realizaste 61 citas iniciales, 18 citas de cierre y 11 pólizas pagadas. Ese logro permanece en tu histórico. Hoy puedes iniciar una nueva racha.

## 20.4 Milestones

Milestones MAY include:

- first sale;
- fifth monthly sale;
- personal best;
- 100 completed appointments;
- 500 valid referrals;
- strongest evaluable week;
- commission milestones supported by authoritative data.

Public rankings are outside the initial scope.

---

# 21. COMMISSION AND ECONOMIC CONTEXT

Forge MAY show:

- confirmed commissions;
- projected commissions;
- progress toward a personal target;
- remaining distance under explicit assumptions.

Confirmed and projected amounts MUST be visually and semantically distinct.

Forge SHALL NOT present uncertain future income as guaranteed.

Economic motivation must remain subordinate to Client First and advisor judgment.

---

# 22. PRIVACY, ACCESS AND FAIRNESS

Performance data is sensitive professional data.

The system SHALL define:

- advisor visibility;
- manager visibility;
- organization visibility;
- aggregate-only visibility;
- retention;
- correction rights;
- export rights;
- audit access;
- privacy thresholds.

Advisors SHOULD be able to understand:

- what is measured;
- why it is measured;
- who can see it;
- how it was calculated;
- how to correct an error.

No protected absence SHALL be exposed beyond what is operationally necessary.

Shared Intelligence SHALL use minimum cohort sizes and re-identification protections.

---

# 23. CORRECTIONS AND DISPUTES

Advisors and authorized managers SHALL be able to challenge:

- an activity classification;
- a confirmation;
- a point award;
- a period assignment;
- a work-calendar state;
- a recommendation;
- an attributed outcome.

Corrections must preserve the original record and create an auditable amendment, correction or reversal.

Forge SHALL recalculate affected projections deterministically.

---

# 24. FAILURE MODES TO PREVENT

This architecture must prevent:

1. points created by button clicks without evidence;
2. scheduled appointments counted as completed;
3. one event counted multiple times;
4. weekends treated as failed workdays;
5. vacation treated as declining performance;
6. missing data treated as zero;
7. provisional payment treated as confirmed;
8. outdated insights presented as current;
9. small cohorts exposing individuals;
10. correlations described as guarantees;
11. manager briefs without explainability;
12. gamification that rewards compulsive use;
13. plans containing invented contacts;
14. score changes without rule versioning;
15. historical rewrites without audit evidence;
16. weekly metrics that accidentally aggregate all history;
17. artificial recommendations becoming final authority.

---

# 25. INITIAL IMPLEMENTATION SCOPE

The branch `feature/activity-domain-runtime-foundation` SHALL implement the minimum vertical foundation.

## ACT-01 — Source and Contract Discovery

- identify current activity implementations;
- identify current point rules;
- identify pipeline event surfaces;
- identify storage and UI coupling;
- publish the source map.

## ACT-02 — ActivityRecord

- define schema;
- define validation;
- define identity;
- define correction and reversal;
- add domain tests.

## ACT-03 — Pipeline Integration Contract

- initial appointment scheduled;
- initial appointment completed;
- closing appointment scheduled;
- closing appointment completed;
- application submitted;
- policy paid;
- referral or new-name capture.

## ACT-04 — Confirmation Runtime

- due confirmation detection;
- advisor confirmation;
- reschedule;
- cancellation;
- expiration and grace policy;
- idempotency.

## ACT-05 — Points Integration

- score rule registry;
- versioned awards;
- reversals;
- deterministic recalculation;
- daily projection.

## ACT-06 — Work Calendar Foundation

- working-day rules;
- weekend and holiday states;
- actual date versus evaluation date;
- protected absence;
- streak protection.

## ACT-07 — Performance Projection

- daily;
- weekly;
- monthly;
- rolling periods;
- conversion formulas;
- completeness and freshness.

## ACT-08 — Manager Submission

- daily submission;
- manager visibility;
- amendment;
- evidence references.

## ACT-09 — Feed and Historical Projection

- unify activity feed and stream contracts;
- chronological projection;
- charts-ready historical output.

## ACT-10 — Legacy Adapter

- preserve the current Activity route;
- migrate counters to projections;
- keep manual correction as an exception;
- avoid visual redesign owned by MUI.

## ACT-11 — FES Compatibility

- emit or project governed events;
- preserve source event IDs;
- prepare reconciliation without blocking on full FES implementation.

## ACT-12 — Vertical Acceptance Test

```text
Pipeline schedules an initial appointment
  ↓
Activity stores the scheduled record
  ↓
The scheduled time passes
  ↓
Forge requests confirmation
  ↓
The advisor confirms completion
  ↓
Activity records the completed event
  ↓
The score rule awards points
  ↓
The daily performance projection updates
  ↓
The manager submission includes the result
  ↓
The historical feed and FES-compatible event are available
```

---

# 26. DEFERRED SCOPE

The initial branch SHALL NOT attempt to fully implement:

- final Shared Intelligence models;
- final Nash or Mick coaching behavior;
- full manager dashboard redesign;
- public rankings;
- complex rewards or currencies;
- broad MUI redesign;
- automatic disciplinary workflows;
- full compensation forecasting;
- all organizational strategy libraries.

The initial branch must create contracts and seams that allow those systems to consume governed Activity and Performance data later.

---

# 27. ACCEPTANCE PRINCIPLES

Implementation is acceptable only when:

- the same source event cannot award points twice;
- completed activity is distinct from scheduled activity;
- corrections reverse or amend score deterministically;
- non-evaluable days do not damage streaks or trends;
- vacation does not appear as poor performance;
- real occurrence date is never overwritten by evaluation date;
- daily submissions are versioned or amendable;
- manager data is authorized and explainable;
- charts distinguish missing, zero, protected and provisional states;
- weekly calculations use a real period boundary;
- current behavior remains usable through a legacy adapter;
- domain tests prove the contracts.

---

# 28. FINAL STATEMENT

Forge Performance Operating System measures work so that people can improve it.

It does not measure people to reduce them to a number.

Activity supplies evidence.

Performance supplies interpretation.

Shared Intelligence supplies organizational learning.

Action Planning converts diagnosis into execution.

Nash and Mick support judgment.

Manager Intelligence prepares better coaching.

Gamification protects momentum.

Work Calendar preserves fairness.

Human beings retain authority.

Forge OS does not administer customers as its central purpose.

Forge OS develops advisors, strengthens managers and helps organizations learn from real evidence.

FOUNDATIONAL DRAFT 001.

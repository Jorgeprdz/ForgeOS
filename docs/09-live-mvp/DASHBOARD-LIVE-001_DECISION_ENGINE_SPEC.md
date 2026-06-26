# DASHBOARD-LIVE-001: Decision Engine Specification

STATUS: SPECIFICATION

IMPLEMENTATION: NOT STARTED

CODE: NOT AUTHORIZED

MIGRATION: NOT AUTHORIZED

Scope: Define how Forge computes the first three advisor decisions using existing IndexedDB data and existing live routes.

This document is documentation only. It does not authorize runtime code, migrations, UI implementation, schema creation, services, APIs, storage changes, background jobs or notifications.

---

## 1. Objective

Define how Forge converts existing data into actionable advisor decisions.

Canonical decision flow:

```text
Data
→ Evidence
→ Rule
→ Decision
→ Action
→ Success Metric
```

The first living version of Forge should use current repository capabilities before introducing new architecture.

---

## 2. Existing Capability Boundary

The specification uses only existing capabilities already present in the repository:

- IndexedDB access through existing DB usage
- `actividad_diaria`
- `referidos`
- `cartera`
- dashboard weekly points logic
- activity counters
- existing live routes:
  - `dashboard`
  - `actividad`
  - `referidos`
  - `prospeccion`
  - `cartera`

`comisiones` remains out of the first decision engine scope because commissions parity is not required for Forge Alive MVP.

---

## 3. Decision Priority Model

Dashboard shows only three decisions.

Decisions are ranked by:

```text
Impact × Urgency × Confidence
```

### Impact

Impact estimates how much the action can improve near-term advisor execution.

Examples:

- repair today's activity gap
- create pipeline from an existing referral
- protect an urgent client relationship or policy event

### Urgency

Urgency estimates whether the action loses value if delayed.

Examples:

- premium due this month
- birthday in the next 14 days
- policy anniversary in the next 30 days
- advisor below weekly activity pace

### Confidence

Confidence comes from available evidence.

Examples:

- data exists in IndexedDB
- phone number exists
- source / COI context exists
- date field is valid
- current week activity records exist

Forge must prefer a lower-impact action with strong evidence over a high-impact action based on weak evidence.

---

## 4. Cross-Cutting Rules

### Evidence First

Forge must explain why each decision exists.

No black-box recommendations.

Every dashboard decision must show:

- evidence used
- rule applied
- recommended action
- owner
- success metric

### Judgment Boundary

Forge recommends actions.

The advisor retains accountability.

Forge should not present recommendations as automatic decisions made on behalf of the advisor.

### Action Ownership

Each decision must identify the owner of the next action.

Possible owners:

- advisor
- prospect
- client
- manager
- carrier
- external dependency

Use ADR-0019 Process Advancement principles:

```text
Responsibility can be shared.
Ownership cannot.
```

For Decision Cockpit v0, all three first decisions are advisor-owned actions.

---

## 5. Decision 1: Repair Today's Activity Gap

### Existing Data Sources

- `actividad_diaria`
- dashboard weekly points
- activity counters
- 125-point weekly goal

### Data

Read existing activity records for the current week.

Use current activity categories:

- referidos
- llamadas
- citas_agendadas
- citas_conectadas
- citas_cierre
- solicitudes
- pagadas

### Evidence

Calculate:

- current week points
- expected pace
- missing points
- missing activity
- highest leverage activity

Current dashboard logic already has a weekly target and weekly point calculation.

Existing activity counters provide the action categories required to repair the gap.

### Rule

If advisor pace is below required pace:

Generate:

```text
Repair today's activity gap.
```

### Action

Recommend the single highest leverage activity that can move weekly progress toward target.

Examples:

- Make 5 calls.
- Ask for 2 referrals.
- Schedule 1 appointment.

The recommendation should prefer activity that is:

- immediately executable
- measurable in the existing `actividad` route
- aligned with the missing weekly pace

### Owner

Advisor.

### Existing Route Dependency

- `dashboard`
- `actividad`

### Success Metric

Weekly progress moves toward the 125-point target.

Daily activity is recorded and synced.

---

## 6. Decision 2: Turn One Referred Person Into An Active Prospect

### Existing Data Sources

- `referidos`
- referral `estado`
- phone availability
- COI / source context

### Data

Read existing referred contacts.

Use referral statuses:

- Nuevo
- Contactado
- Cita
- Seguimiento
- Descartado

### Evidence

Find referred contacts with status:

- Nuevo
- Seguimiento

Prioritize:

1. Has phone number
2. Has source context
3. Recent creation

If creation timestamp is not available or not reliable, prioritize using phone availability and source context first.

### Rule

If at least one referred contact is `Nuevo` or `Seguimiento`:

Generate:

```text
Turn one referred person into an active prospect.
```

### Action

Recommend:

- send WhatsApp
- move to prospecting flow

Use the existing `referidos` to `prospeccion` handoff.

### Owner

Advisor.

### Existing Route Dependency

- `dashboard`
- `referidos`
- `prospeccion`

### Success Metric

Referral advances:

```text
Nuevo
→ Contactado
→ Cita
```

or becomes an active prospect in the prospecting flow.

---

## 7. Decision 3: Contact The Highest-Urgency Client In Cartera

### Existing Data Sources

- `fechaPago`
- `nacimiento`
- `emision`
- `cartera` records

### Data

Read existing cartera records.

Use available dates and client / policy context:

- payment due date
- birth date
- policy issue date
- client name
- policy number when available

### Evidence

Score urgency using existing cartera data.

Suggested urgency signals:

- pending payment this month
- birthday within 14 days
- policy anniversary within 30 days
- actuarial age milestone

### Rule

If at least one cartera record has an urgency signal:

Generate:

```text
Contact this client today.
```

### Urgency Scoring Guidance

Suggested priority order:

1. Pending payment this month
2. Policy anniversary within 30 days
3. Birthday within 14 days
4. Actuarial age milestone

This order protects retention and operational risk before softer relationship touchpoints.

### Action

Explain why the client should be contacted.

Examples:

- Premium due.
- Birthday approaching.
- Anniversary review.
- Protection update opportunity.

Recommend that the advisor contact the client and record the interaction.

### Owner

Advisor.

### Existing Route Dependency

- `dashboard`
- `cartera`

### Success Metric

Alert resolved or contact logged.

---

## 8. Out Of Scope

Do not implement:

- UI
- services
- APIs
- storage changes
- schemas
- background jobs
- notifications
- physical migrations
- rule-pack changes
- NASH migration
- comisiones parity wiring

This document defines behavior only.

---

## 9. Final Position

The first living version of Forge is not a dashboard.

It is a decision engine that produces three actionable advisor decisions every day.

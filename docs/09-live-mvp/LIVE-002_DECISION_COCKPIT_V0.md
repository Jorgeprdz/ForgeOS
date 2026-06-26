# LIVE-002: Decision Cockpit v0

STATUS: PRODUCT DEFINITION

IMPLEMENTATION: NOT STARTED

MIGRATION: NOT AUTHORIZED

Scope: Define the first three actionable dashboard decisions for Forge Alive MVP.

This document is documentation only. It does not authorize runtime code, migration, UI implementation, route changes or app behavior changes.

---

## 1. Product Principle

Forge Alive MVP should not start with a dashboard of metrics.

It should start with three actionable decisions.

The first dashboard surface should answer:

```text
What should the advisor do now?
With whom?
For what reason?
Using what evidence?
How will success be measured?
```

Decision Cockpit v0 must prioritize existing repository capabilities over future architecture.

---

## 2. Decision 1: Repair Today's Activity Gap

### Decision Title

Repair today's activity gap.

### Why Forge Generated It

Forge already calculates daily activity and weekly productivity.

The current dashboard can compare accumulated weekly points against the weekly target and show the missing points required to close the gap.

This makes activity repair the fastest actionable decision because the advisor can act immediately and record the result in the existing activity route.

### Evidence Used

- `actividad_diaria` records
- weekly productivity calculation in `dashboard.js`
- daily activity counters in `actividad.js`
- current activity categories:
  - referidos
  - llamadas
  - citas_agendadas
  - citas_conectadas
  - citas_cierre
  - solicitudes
  - pagadas
- weekly target currently represented in dashboard productivity logic

### Recommended Action

Open `actividad`, register today's real commercial actions, then complete the highest-leverage missing activity before the end of the day.

If no meaningful activity has been logged today, start with one concrete prospecting action: call, message, ask for a referral or schedule a meeting.

### Success Metric

Weekly points increase toward the weekly target and today's activity is synced.

### Existing Route Dependency

- `dashboard`
- `actividad`

---

## 3. Decision 2: Turn One Referred Person Into An Active Prospect

### Decision Title

Turn one referred person into an active prospect.

### Why Forge Generated It

Forge already stores referred contacts, tracks referral status and can route a referred person into the prospecting flow.

The existing `referidos` route can hand off a referred person to `prospeccion`, where Forge can prepare a prospect record and support message generation.

This decision creates pipeline using existing flow instead of waiting for future Relationship Graph implementation.

### Evidence Used

- `referidos` records
- referral status:
  - Nuevo
  - Contactado
  - Cita
  - Seguimiento
  - Descartado
- referral origin / COI field
- phone availability
- existing `referidos` to `prospeccion` handoff
- existing prospecting form
- existing WhatsApp script generation flow in `prospeccion`

### Recommended Action

Select one referred contact with status `Nuevo` or `Seguimiento`, route them into `prospeccion`, generate or prepare the first message, and contact them today.

### Success Metric

One referred contact becomes an active prospect or advances to `Contactado` / `Cita`.

### Existing Route Dependency

- `dashboard`
- `referidos`
- `prospeccion`

---

## 4. Decision 3: Contact The Highest-Urgency Client In Cartera

### Decision Title

Contact the highest-urgency client in cartera.

### Why Forge Generated It

Forge already detects near-term cartera events and pending relationship moments from policy data.

The current dashboard can surface pending monthly payments, birthdays, actuarial-age windows and policy anniversaries.

This makes cartera protection an existing actionable decision rather than a future product concept.

### Evidence Used

- `cartera` records
- `fechaPago` for current-month pending payments
- `nacimiento` for birthday alerts
- actuarial-age proximity derived from birthday timing
- `emision` for policy anniversary alerts
- existing dashboard cartera and fidelity logic:
  - `cobranza()`
  - `fidelizacion()`

### Recommended Action

Contact the client with the most urgent pending payment, birthday, actuarial-age or policy anniversary signal.

If there are multiple signals, prioritize payment risk first, then policy anniversary, then relationship touchpoints.

### Success Metric

Pending cartera alert is resolved or the client contact is completed within 24 hours.

### Existing Route Dependency

- `dashboard`
- `cartera`

---

## 5. Decision Cockpit v0 Summary

Decision Cockpit v0 is not a reporting surface.

It is the first living Forge experience.

It should start with three decisions:

1. Repair today's activity gap.
2. Turn one referred person into an active prospect.
3. Contact the highest-urgency client in cartera.

Final summary:

```text
Decision Cockpit v0 = Act today, create pipeline, protect cartera.
```

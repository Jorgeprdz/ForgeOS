# EFC Advisor OS Discovery

STATUS: DISCOVERY

IMPLEMENTATION: BLOCKED / NOT STARTED

SOURCE: Recovered EFC Manual

Source title: Escuela Fundamental de Carrera - Manual del Participante

Date: 2026-06-15

Scope: Advisor OS discovery from recovered SMNYL advisor training material.

This document is documentation only. It does not authorize implementation, schema creation, UI creation, runtime changes, file movement or rule-pack changes.

---

## 1. Purpose

This document records the architectural discovery produced by the recovered Escuela Fundamental de Carrera Manual del Participante.

The manual is treated as operational evidence.

It is not merely training content. It describes the analog operating system used to shape advisor execution across prospecting, contact, discovery, presentation, closing, policy delivery, referrals, planning and follow-up.

Core discovery:

```text
The EFC manual is not just training material.
It is an analog Advisor Operating System.
```

---

## 2. Advisor Sales Cycle

The manual defines the advisor sales cycle as:

1. Ciclo de Ventas
2. Prospeccion
3. Acercamiento
4. Diseno y Presentacion de la Solucion
5. Llenado de la Solicitud, Entrega de la Poliza y Referidos
6. Planeacion y Seguimiento

This cycle validates that Advisor OS should not be modeled as a static CRM surface.

Advisor OS is a coordinated execution system that helps the advisor move from market creation to client relationship continuity.

---

## 3. Advisor OS Validation

The EFC manual validates that Forge's Advisor OS architecture is directionally correct.

It maps directly to existing Forge concepts:

| EFC Operating Pattern | Forge Advisor OS Concept |
| --- | --- |
| Prospeccion | Prospecting |
| Acercamiento | First Contact |
| Analisis de necesidades | Discovery |
| Diseno de solucion | Need Analysis |
| Presentacion de solucion | Presentation |
| Cierre / llenado de solicitud | Closing |
| Entrega de poliza | Policy Delivery |
| Referidos | Referrals |
| Planeacion | Planning |
| Seguimiento | Follow-up |

This is not evidence that current implementations are complete.

It is evidence that the domain boundary is correct: Advisor OS owns the operating loop of commercial execution.

---

## 4. Prospect Qualification Engine

The manual defines a qualified prospect as someone who has:

- authority to decide
- need
- ability to pay
- insurability or favorable underwriting potential

This is direct evidence for:

```text
advisor-os/prospect-intelligence/qualification-engine
```

The qualification engine should not be reduced to lead scoring.

It should preserve the distinction between:

- decision authority
- need reality
- economic capacity
- underwriting viability
- recommended next action

Forge implication:

```text
A prospect is not qualified only because they are interested.
A prospect is qualified when action can reasonably advance.
```

---

## 5. Habit Intelligence

The manual states:

```text
Prospecting is a habit.
```

This is evidence for a new Advisor OS domain:

```text
advisor-os/habit-intelligence/
├── prospecting-habits/
├── calling-habits/
├── followup-habits/
└── consistency-engine/
```

Core insight:

```text
Advisor failure is often not a knowledge problem.
It is a habit consistency problem.
```

Habit Intelligence should measure behavior that creates production, not merely production after it appears.

This domain should be distinct from sales outcome reporting.

It should answer:

- Is the advisor doing the behaviors that create future pipeline?
- Which commercial habit is breaking?
- Is the failure caused by volume, sequence, cadence, avoidance or follow-through?
- What action should happen next?

---

## 6. Sales Funnel Intelligence

The manual includes an explicit Banco de Nombres funnel:

```text
25 calls
↓
20 conversations
↓
15 appointments
↓
10 ANF questionnaires
↓
5 closing interviews
↓
2 policies
```

This is evidence for:

```text
advisor-os/sales-funnel-intelligence/
├── stage-conversion/
├── bottleneck-detection/
├── forecast-engine/
└── activity-recommendations/
```

The funnel should not be treated as a universal law or hardcoded production promise.

It is historical evidence that advisor execution can be understood as stage conversion.

Forge implication:

```text
If the advisor is not producing, Forge should identify where the operating funnel is breaking before recommending more effort.
```

Forecasting must remain inside the Forecast Truth Boundary.

The funnel may support estimates, scenarios and recommendations, but it must not present projected production as fact.

---

## 7. Relationship Intelligence And Referrals

The manual identifies referrals as the most effective method of prospecting.

It uses the question pattern:

```text
Who do you know who...?
```

This is evidence for:

```text
shared-intelligence/relationship-graph/
advisor-os/referral-intelligence/
```

Core insight:

```text
The primary asset of the advisor is not the product.
It is the relationship graph.
```

Referral Intelligence should not be limited to asking for names.

It should understand:

- who can nominate
- who can introduce
- why the person is relevant
- what context makes the referral natural
- what follow-up action belongs to the advisor
- what evidence supports the next conversation

Relationship Graph should remain shared intelligence because referrals, client lifecycle, relationship health and opportunity detection cross Advisor OS boundaries.

Advisor OS may own referral execution, but the relationship graph itself should be reusable across Forge domains.

---

## 8. Discovery, SPIN And HDL

The manual teaches SPIN:

- Situation
- Problem
- Implication
- Need-payoff / need of solution

This is the historical training ancestor of:

```text
advisor-os/discovery/spin-engine/
advisor-os/discovery/human-discovery-layer/
advisor-os/discovery/need-graph/
```

Core insight:

```text
SPIN transforms implicit needs into explicit needs.
Forge HDL transforms human context into judgment-ready evidence.
```

SPIN is not merely a script format.

It is a method for moving from surface conversation to actionable need evidence.

Forge should preserve that operating logic while making it evidence-bound, contextual and reusable across the advisor's workflow.

---

## 9. Life Graph

The ANF section captures:

- family information
- occupational information
- existing insurance
- income
- assets
- protection needs
- accumulation
- education funding
- retirement
- health

This is evidence for:

```text
advisor-os/life-graph/
├── family-model/
├── asset-model/
├── protection-model/
├── retirement-model/
├── education-model/
└── health-model/
```

Potential names considered:

- Financial Need Graph
- Life Graph
- Financial Digital Twin

Canonical Forge term for now:

```text
Life Graph
```

Reason:

Life Graph is broad enough to include financial needs, family context, protection, accumulation, education, retirement and health without reducing the client to a financial calculation.

Forge implication:

```text
The advisor does not only sell against a product gap.
The advisor advises against a life context.
```

---

## 10. Discovery Build Tree Amendment

The following amendment is documentation-only and does not authorize physical file movement:

```text
advisor-os/
│
├── habit-intelligence/
│   ├── prospecting-habits/
│   ├── calling-habits/
│   ├── followup-habits/
│   └── consistency-engine/
│
├── sales-funnel-intelligence/
│   ├── stage-conversion/
│   ├── bottleneck-detection/
│   ├── forecast-engine/
│   └── activity-recommendations/
│
├── prospect-intelligence/
│   └── qualification-engine/
│
├── referral-intelligence/
│   ├── referral-sourcing/
│   ├── nominator-prompts/
│   └── relationship-graph-bridge/
│
├── discovery/
│   ├── spin-engine/
│   ├── human-discovery-layer/
│   └── need-graph/
│
└── life-graph/
    ├── family-model/
    ├── asset-model/
    ├── protection-model/
    ├── retirement-model/
    ├── education-model/
    └── health-model/
```

---

## 11. Constitutional Implications

### Decision Clarity First

The EFC cycle exists to advance the advisor from one concrete commercial action to the next.

Advisor OS should therefore produce action clarity, not only analysis.

### Evidence Over Assumptions

Prospect qualification, SPIN discovery and ANF data collection all require evidence before recommendation.

Advisor OS should not invent need, capacity, product fit, insurability, income, assets or protection gaps.

### Economic Evidence Rule

Financial need, income goals and funnel forecasts must remain evidence-bound.

Unknown values must remain unknown.

### Human Growth As Operating Context

The EFC manual shows that advisor development is not separate from production.

Prospecting habit, questioning skill, follow-up discipline and referral behavior are part of the operating system.

---

## 12. Non-Goals

This discovery does not authorize:

- implementing new Advisor OS engines
- creating schemas
- creating UI
- changing route modules
- changing `app.js`
- changing runtime behavior
- changing rule-packs
- moving files into `advisor-os/`
- creating projections from the funnel
- hardcoding EFC funnel ratios as product truth
- replacing existing CRMAddlife routes
- modifying NASH or nash-memory

---

## 13. Final Conclusion

The EFC manual validates Advisor OS as an operating domain.

It explains how an advisor operates:

- create market
- qualify opportunity
- initiate contact
- discover human and financial need
- design and present solution
- close and deliver
- ask for referrals
- plan and follow up
- build habits that make the cycle repeatable

Final discovery:

```text
The Manager OS documents explain how an advisor grows.
The EFC manual explains how an advisor operates.
Together they validate Forge as a Career Operating System.
```

STATUS: DISCOVERY CLOSED / READY FOR FUTURE READINESS PLANNING / NO IMPLEMENTATION YET.

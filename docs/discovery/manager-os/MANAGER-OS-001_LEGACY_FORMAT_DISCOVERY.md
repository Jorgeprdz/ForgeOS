# MANAGER-OS-001 Legacy Format Discovery

Status: DISCOVERY CLOSED / DOCUMENTATION ONLY / NO IMPLEMENTATION

Date: 2026-06-15

Scope: Manager OS discovery from legacy SMNYL manager and advisor formats.

No runtime behavior, code, route, NASH, rule-pack or repository structure change is authorized by this document.

---

## 1. Purpose

This document records the architectural discovery produced by analyzing legacy manager and advisor formats used in the insurance industry.

The discovery is not an implementation plan.

The objective is to preserve the operational truth found in the formats and define how it should inform future Forge OS discovery for Manager OS.

---

## 2. Source Formats

The discovery is based on the following legacy formats:

- GS-1 Evaluador de Prospectos
- GS-2 Guia de Actividades Semanal
- AG-1 Actividades de Desarrollo
- AG-2 Modelo de Mercado
- AG-3 Resumen de Actividades
- AG-4 Registro de Desempeno
- PRP Coaching Tool
- Cinco Preguntas a Desarrollar
- Metas Trimestrales
- Objetivos de Ingreso

These documents are treated as operational evidence, not as final product design.

---

## 3. Core Discovery

Managers do not manage sales.

Managers manage human transformation.

The legacy formats do not merely track production outcomes. They collectively track the human system that makes production possible:

- capability development
- habits
- accountability
- pipeline creation
- financial goals
- coaching
- reflection
- career progression
- commitments
- growth trajectories

This changes the architectural interpretation of Manager OS.

Manager OS is not a larger dashboard over Advisor OS.

Manager OS is a first-class domain that owns development, coaching, commitments, trajectory, organization health and human capital allocation.

---

## 4. Constitutional Interpretation

This discovery reinforces Forge constitutional principles:

| Principle | Discovery Evidence |
| --- | --- |
| Judgment Augmentation | The forms help managers interpret behavior, trajectory and development needs instead of merely counting activity. |
| Evidence Over Assumptions | Legacy forms separate observed activity, commitments, follow-up and performance records. |
| Action Ownership Detection | AG-1 separates advisor commitments, manager commitments and follow-up. |
| Human Growth As First-Class Objective | The forms track skill, reflection, coaching and career movement, not only sales volume. |
| Discovery Before Implementation | The formats reveal domain structure before engine implementation should begin. |

AG-1 independently validates the core ownership logic behind ADR-0019:

Responsibility can be shared. Ownership cannot.

Advisor and manager can both be responsible for a development process, but each concrete action must have one owner.

---

## 5. Format To Engine Mapping

| Legacy Format | Future Forge Engine / Domain |
| --- | --- |
| GS-1 Evaluador de Prospectos | Prospect Intelligence |
| GS-2 Guia de Actividades Semanal | Pipeline Health |
| AG-1 Actividades de Desarrollo | Development Tracking |
| AG-2 Modelo de Mercado | Client Lifecycle Intelligence |
| AG-3 Resumen de Actividades | Performance Intelligence |
| AG-4 Registro de Desempeno | Advisor Trajectory |
| PRP Coaching Tool | Coaching Engine |
| Cinco Preguntas a Desarrollar | Reflection Engine |
| Metas Trimestrales | Goal Intelligence |
| Objetivos de Ingreso | Personal Economics Engine |

This mapping is conceptual. It does not authorize file movement or implementation.

---

## 6. Manager OS Domain Boundary

Advisor OS optimizes individual execution.

Manager OS optimizes collective human growth.

Advisor OS asks:

```text
What should this advisor do next?
```

Manager OS asks:

```text
How should this person be developed, coached, challenged, supported and allocated?
```

This is a domain boundary, not a UI distinction.

Manager OS owns decisions that are unsafe, incomplete or inappropriate inside Advisor OS:

- manager coaching priorities
- advisor risk detection
- team health interpretation
- development commitments
- human capital allocation
- growth pathing
- capacity modeling
- manager intervention timing

---

## 7. Discovery Build Tree Amendment

The following structure is a discovery amendment only:

```text
manager-os/
├── leadership-intelligence/
│   ├── coaching-engine/
│   ├── prp-engine/
│   ├── commitment-engine/
│   ├── development-tracking/
│   └── reflection-engine/
│
├── organization-health/
│   ├── activity-scorecard/
│   ├── performance-scorecard/
│   ├── pipeline-health/
│   └── advisor-risk-detection/
│
├── human-capital-allocation/
│   ├── talent-segmentation/
│   ├── growth-pathing/
│   └── capacity-modeling/
│
└── manager-intelligence/
    ├── advisor-trajectory/
    ├── goal-intelligence/
    ├── personal-economics/
    ├── coaching-history/
    └── manager-dashboard/
```

This is not a physical migration plan.

---

## 8. Ownership Implications

The legacy formats separate responsibility into distinct ownership channels:

| Ownership Channel | Description |
| --- | --- |
| Advisor commitment | The advisor owns the behavior, action, reflection or follow-up they committed to execute. |
| Manager commitment | The manager owns coaching, review, support, inspection or intervention commitments. |
| Follow-up | Follow-up is not a vague reminder; it is an accountability bridge tied to a named owner and time horizon. |

This supports future commitment intelligence.

Commitments should not be stored as generic notes. They should preserve:

- owner
- expected action
- evidence required
- follow-up cadence
- review outcome
- growth signal
- next process state

---

## 9. Engine Discovery Notes

### Prospect Intelligence

GS-1 indicates that prospect evaluation is not just lead scoring. It includes readiness, quality, fit, and the manager or advisor judgment needed to decide what to do next.

### Pipeline Health

GS-2 reveals that weekly activity is not a productivity scoreboard alone. It is a habit and pipeline health artifact.

### Development Tracking

AG-1 is a direct discovery source for commitment ownership. It separates advisor commitments, manager commitments and follow-up.

### Client Lifecycle Intelligence

AG-2 suggests that market modeling should connect natural market, client lifecycle and future opportunity, not just contact lists.

### Performance Intelligence

AG-3 provides activity summary evidence. It should become performance intelligence only after ownership, context and quality signals are preserved.

### Advisor Trajectory

AG-4 suggests that performance should be read over time as trajectory, not as isolated results.

### Coaching Engine

The PRP Coaching Tool indicates that coaching is not motivational content. It is structured diagnosis, agreement, accountability and follow-through.

### Reflection Engine

Cinco Preguntas a Desarrollar validates reflection as a structured intelligence input. Reflection should produce development signals, not just free text.

### Goal Intelligence

Metas Trimestrales shows that goals should be connected to behavior, timeframe and review.

### Personal Economics Engine

Objetivos de Ingreso shows that income objectives are personal economic motivation signals. They must be evidence-bound and cannot invent financial outcomes.

---

## 10. Non-Goals

This discovery does not authorize:

- implementing new Manager OS engines
- moving files
- changing `app.js`
- changing route modules
- changing NASH
- creating runtime dependencies
- creating dashboard UI
- replacing existing SMNYL rule-pack logic
- changing advisor-facing recommendations

---

## 11. Final Discovery

Manager OS is not an extension of Advisor OS.

Manager OS is a first-class domain of Forge.

Advisor OS optimizes individual execution.

Manager OS optimizes collective human growth.

The legacy formats validate that the manager role is fundamentally developmental:

```text
Manager OS owns the intelligence required to develop people,
allocate attention,
coach behavior,
detect trajectory,
and protect the organization from human-capital drift.
```

Status: DISCOVERY CLOSED / READY FOR FUTURE DOCUMENTATION OR READINESS PLANNING / NO IMPLEMENTATION YET.

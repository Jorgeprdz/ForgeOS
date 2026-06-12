# RUNTIME-011 Route Readiness Scorecard

Report ID: RUNTIME-011
Status: DISCOVERY ONLY / NO IMPLEMENTATION
Date: 2026-06-11

## Scoring Model

Scores evaluate readiness for lazy route loading without changing business behavior.

| Score | Meaning |
| ---: | --- |
| 90-100 | Ready for first movement |
| 75-89 | Ready with small guardrails |
| 60-74 | Needs targeted repair before movement |
| Below 60 | Defer |

## Route Scorecard

| Route | Module | Score | Readiness | Main dependencies | Risk notes |
| --- | --- | ---: | --- | --- | --- |
| `dashboard` | `dashboard.js` | 88 | READY_WITH_GUARDRAILS | `DB`, `AppState`, `EventBus`, `Logger`, `Memory`, `RenderEngine` | Best lifecycle shape. Reads authenticated user from `AppState`, stores dashboard snapshot, and registers cleanup. |
| `actividad` | `actividad.js` | 82 | READY_WITH_GUARDRAILS | `DB`, `AI`, `EventBus`, `Memory`, `showToast` | Clean route-local state and cleanup. Needs AI abort behavior checked during route unload. |
| `cartera` | `cartera.js` | 76 | READY_AFTER_SMALLER_ROUTE | `DB`, `utils`, `AppState`, `EventBus`, `RenderEngine`, `Analytics`, `Logger`, `Memory`, `window.XLSX` | Large module with many platform imports, but XLSX is already route-local lazy-loaded. Good second-wave payload win. |
| `prospeccion` | `prospeccion.js` | 72 | TARGETED_REPAIR_RECOMMENDED | `DB`, `callGemini`, `utils`, `localStorage`, `window.open` | Simple route, but participates in handoff from `referidos` through localStorage. Should move after handoff contract is explicit. |
| `referidos` | `referidos.js` | 62 | TARGETED_REPAIR_REQUIRED | `DB`, `utils`, `localStorage`, `window.navigateTo` | Small and otherwise simple, but cross-route handoff depends on missing/legacy `window.navigateTo`. |
| `comisiones` | `comisiones.js` | 48 | DEFER | `DB`, `getSupabase`, `callGemini`, `utils`, `window.navigateTo` | Highest-risk route. It combines Supabase profile persistence, financial rule constants, economic outputs, route self-refresh, and AI import. |

## Complete Route Classification

| Route | Domain class | Boot necessity | Lazy-load candidacy | Movement tier |
| --- | --- | --- | --- | --- |
| `dashboard` | App home / advisor summary | Initial authenticated route only | Yes | Tier 1 |
| `actividad` | Activity intelligence | Not boot critical | Yes | Tier 1 |
| `cartera` | Policy operations | Not boot critical | Yes | Tier 2 |
| `prospeccion` | Prospecting workflow | Not boot critical | Yes, paired contract needed | Tier 2 |
| `referidos` | Referral workflow | Not boot critical | Yes, after navigation repair | Tier 3 |
| `comisiones` | Compensation/economic intelligence | Not boot critical | Yes, but deferred | Tier 4 |

## Highest-Risk Route

`comisiones` is the highest-risk route.

Reasons:

- It imports `getSupabase` and reads/writes remote profile data.
- It carries hardcoded financial/economic constants.
- It imports AI service functionality.
- It calls `window.navigateTo('comisiones')`, but the current shell evidence does not define `window.navigateTo`.
- A lazy-load failure here could affect economic trust, not just route presentation.

## Lowest-Risk Route

`dashboard` is the lowest-risk first movement route.

Reasons:

- It already follows the current platform lifecycle model.
- It reads user identity through `AppState`.
- It registers cleanup with `Memory`.
- It emits route events without owning navigation.
- It has no direct `window.navigateTo` dependency.

## Lazy-Load Candidate Count

All six registered routes are lazy-load candidates.

Safe immediate candidates:

- `dashboard`
- `actividad`

Deferred candidates:

- `cartera`
- `prospeccion`
- `referidos`
- `comisiones`

## Route Movement Order

| Order | Route | Decision |
| ---: | --- | --- |
| 1 | `dashboard` | Move first as the loader proof. |
| 2 | `actividad` | Move second if AI abort cleanup is confirmed. |
| 3 | `cartera` | Move after loader pattern is proven because it has the largest payload value. |
| 4 | `prospeccion` | Move with explicit localStorage handoff contract. |
| 5 | `referidos` | Move only after navigation bridge repair. |
| 6 | `comisiones` | Defer to a dedicated economic route boundary review. |

## Final Readiness Projection

| Metric | Current | Projected after Tier 1 | Projected after all safe tiers |
| --- | ---: | ---: | ---: |
| Runtime Health | 80 | 83 | 86 |
| Migration Readiness | 78 | 82 | 86 |
| Boot Blast Radius | HIGH | MEDIUM | LOW |
| Route Isolation | LOW | MEDIUM | HIGH |


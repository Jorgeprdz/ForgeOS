# LIVE-001: Forge Alive MVP Readiness

STATUS: READY FOR PRODUCT DEFINITION

IMPLEMENTATION: NOT STARTED

MIGRATION PRIORITY: PAUSED

Date: 2026-06-15

Scope: Product readiness transition from architecture/discovery into the first living Forge advisor experience.

This document is documentation only. It does not authorize runtime implementation, file migration, root JS refactor, UI replacement or app behavior changes.

---

## 1. Current Runtime Position

Forge OS is no longer blocked by runtime readiness.

Latest audit result:

```text
node scripts/runtime-module-graph-audit.js
```

Result:

- executability verdict: EXECUTABLE
- boot blockers: 0
- circular imports: 0
- missing targets: 0
- missing exports: 0
- JS files scanned: 666

Current repository position:

- `main` is clean and aligned with `origin/main`
- 345 JavaScript files still remain at root
- `app.js` is now a small compatibility facade around 189 lines
- `index.html` remains the legacy shell and loads `app.js`
- Foundation Cleanup is documented as complete
- Advisor OS discovery is documented from the recovered EFC manual
- Manager OS discovery is documented from legacy manager formats

Current live routes:

- `dashboard`
- `prospeccion`
- `referidos`
- `actividad`
- `cartera`
- `comisiones`

---

## 2. Diagnosis

Forge is no longer primarily blocked by runtime architecture.

Forge is now blocked by product definition:

```text
deciding the first living experience of Forge
```

The next phase is not more cleanup.

The next phase is:

```text
Make Forge alive.
```

Forge becomes alive when an advisor opens the product and receives a judgment-ready, actionable decision.

---

## 3. Core Question

When an advisor opens Forge, what decision do they receive?

The answer must be concrete enough to guide the first product surface.

It must not be a dashboard metric, generic reminder, motivational message or passive report.

---

## 4. Recommended First Live Decision

Canonical first live experience:

```text
Do this now.
With this person.
For this reason.
Say this.
Follow up on this date.
```

This is the minimum living unit of Forge.

It joins:

- action
- person
- reason
- message
- next follow-up date

---

## 5. MVP Surface

Use the existing shell and existing routes.

Do not replace the app.

Do not make physical migration the immediate priority.

Use `dashboard` as a minimal Decision Cockpit.

The first live MVP should prove the decision loop before attempting a broader UI replacement.

---

## 6. Decision Cockpit v0

Dashboard should eventually show three blocks:

1. Next Commercial Action
2. Broken Pipeline / Habit Signal
3. Recommended Referral or Contact

These blocks should be judgment-ready.

They should not merely display data.

Each block should answer:

- what happened
- why it matters
- what the advisor should do next

---

## 7. First Live Cycle

Use existing routes:

- `prospeccion`
- `referidos`
- `actividad`
- `dashboard`

The first live Forge loop should help the advisor:

- create names
- contact people
- register activity
- request referrals
- receive next-action recommendations

This aligns with the recovered EFC manual and with the Advisor OS operating loop.

---

## 8. Legacy Boundary

`comisiones.js` should remain legacy beta for now.

Do not block Forge Alive MVP on commissions parity.

Commissions remain important, but they are not the shortest path to a first living advisor experience.

The current priority is action clarity, not financial parity completion.

---

## 9. NASH Boundary

Do not physically migrate NASH now.

Consume NASH where it is as conversation intelligence only:

- what to say
- why to say it
- when to say it

NASH should explain or improve the conversation layer.

It should not become a blocker for the first live MVP.

---

## 10. Deployment Readiness Gate

Before staging deploy, run:

```bash
node scripts/runtime-module-graph-audit.js
node forge-master-acceptance-test.js
git diff --check
```

Also verify manually:

- Supabase env exists
- OAuth redirect works
- service worker does not cache broken shell
- login works
- dashboard loads
- main routes load

---

## 11. Strategic Rule

Do not keep organizing the kitchen before cooking.

Formal rule:

```text
Further physical migration is no longer the priority until Forge has a first living advisor experience.
```

---

## 12. Final Position

GO: Prepare Forge Live MVP.

NO-GO: More physical migration as the immediate priority.

Final conclusion:

```text
Forge already has foundations.
Forge now needs a first living experience: small, clear, and actionable.
```

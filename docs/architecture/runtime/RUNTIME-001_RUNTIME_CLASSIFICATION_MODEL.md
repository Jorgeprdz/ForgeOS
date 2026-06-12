# RUNTIME-001 Runtime Classification Model

Report ID: RUNTIME-001
Status: CLASSIFICATION MODEL / NO EXECUTION

## Purpose

Define runtime classes for future root runtime governance. This model does not move or rewrite files.

## Runtime Classes

| Class | Entry Criteria | Root Policy | Examples |
| --- | --- | --- | --- |
| Runtime Core | Observable app shell, deploy, storage, sync, event bus or runtime service dependency. | ROOT_REQUIRED only for shell/deploy; otherwise ROOT_ALLOWED until migration plan. | `app.js`, `index.html`, `service-worker.js`, `runtime.js`, `core-event-bus.js` |
| Runtime Legacy | CRMAddlife branding, compatibility-layer evidence, older operational clusters or duplicate/backup signals. | REVIEW_REQUIRED before movement; never silently delete. | `dashboard.js`, `styles.css`, `cartera.js`, `comisiones.js` |
| Runtime Experimental | Preview, widget, prototype or non-core experiment signal. | ROOT_OPTIONAL unless consumer graph proves active use. | `design-system-preview.html`, `ai-orb-widget.js`, `nano-banana-icon-system-prompt.js` |
| Runtime Unknown | Executable asset with no clear owner, consumer or runtime necessity in this audit. | REVIEW_REQUIRED. | Any root runtime file with Unknown owner or no observable root need. |

## Root Runtime Principles

1. Runtime root placement must follow dependency evidence.
2. Runtime owner and runtime consumer are separate concepts.
3. Current root import convenience does not equal constitutional root right.
4. Protected shell assets must not be moved without a PWA/app-shell migration plan.
5. Unknown runtime is governance debt, not proof of safety.

## Movement Preconditions

Before moving any runtime asset, Forge must know:

- owner;
- inbound consumers;
- import graph;
- runtime shell dependency;
- test gate;
- rollback path.

## Classification Verdict

The current flat root runtime is `TEMPORARY`. It is allowed for operational continuity but should not be treated as final architecture.

Confidence Score: 0.82

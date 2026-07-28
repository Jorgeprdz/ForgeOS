# FES 08 — Forge Alive Productive Integration Discovery

```text
PHASE=FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION
DISCOVERY_STATUS=COMPLETE
SOURCE_COMMIT=89530d5e22e188d97ae04c48e8a3bed664339297
RUNTIME_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection
PRODUCTIVE_UI_AUTHORITY=docs/static-preview/forge-alive/
MATERIAL3_ROLE=VISUAL_AND_SHELL_REFERENCE_ONLY
RESTORE_NOT_REINVENT=YES
```

## Architecture inventory

| Capability | Authority | Classification | FES 08 action |
|---|---|---|---|
| Productive route and single host | `docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js` | existing and reusable | preserve the one-host lifecycle and bind FES 08 actions |
| Productive prospect persistence | `advisor-os/sales-pipeline/productive-prospect-service.js` | existing and reusable | preserve authenticated source; do not create a second store |
| Pipeline read model and stages | `pipeline-stage-read-model.js`, `sales-stage-registry.js` | existing and reusable | preserve stage authority |
| Pipeline cards and responsive layout | `pipeline-ui.js`, `pipeline-ui.css` | existing, visually accepted baseline | adapt only within productive Pipeline scope |
| Prospect detail, create, edit and archive | `productive-prospect-ui.js` | existing and reusable | retain behavior and add governed action results |
| Status colors | `pipeline-ui.css` | existing and reusable | retain rail, text and `data-stage` semantics |
| Call handoff | `productive-prospect-ui.js` | existing but disconnected from governed result capture | preserve `tel:`; add return confirmation |
| WhatsApp draft | `pipeline-nash-draft-orchestrator.js`, `productive-prospect-ui.js` | existing and reusable | preserve exact-text approval; append handoff observation only |
| Nash Combat | `nash-combat-orchestrator.js` plus FES 05 approval lifecycle | existing but disconnected and requires safety boundary | add a narrow governed UI adapter; never persist raw objection text |
| Google Calendar | existing template composer in `productive-prospect-ui.js` | existing but disconnected from confirmation | preserve template URL and require advisor confirmation |
| Passive action capture | `passive-capture-bridge-contract.js` | existing and reusable | create deterministic observations and sequences |
| Canonical Event & Evidence | `bridge-to-canonical-event-adapter.js` and `canonical-activity-event-contract.js` | existing with one appointment subject-mapping gap | add the missing canonical appointment mapping and regression |
| Activity persistence | FES 02 browser runtime, local store, sync service and RPC-only gateway | existing and reusable | append locally, synchronize by authenticated RPC, expose conflicts |
| Activity, Prospect, Pipeline and Mi Día projections | FES 03 projection runtime and FES 06 productive binding | existing but read-only binding is disconnected from new append | rebuild and dispatch the accepted projection snapshot |
| Performance scoring | accepted branch `origin/feature/performance-scoring-contract-foundation` | protected read-only authority | no policy copy or write; verify the Activity semantic intersection and expose dependency truthfully |
| Nav Pill | productive Forge Alive route authority | existing | preserve; do not add or duplicate an item |
| Cotizaciones | separate productive module | prohibited | no mutation |

## Canonical gaps resolved by FES 08

1. `APPOINTMENT_SCHEDULED` and `APPOINTMENT_HELD` are canonical FES event
   types, but the FES 05C adapter did not map appointment subjects. FES 08 may
   add that missing deterministic mapping because productive confirmation
   cannot otherwise reach the accepted ledger.
2. The productive UI has external call, WhatsApp and Calendar handoffs but no
   governed return-confirmation coordinator. FES 08 adds one narrow runtime.
3. The accepted Performance implementation remains read-only on its protected
   branch. FES 08 does not merge it or duplicate scoring policy. Its accepted
   Activity types are validated by integration tests; visible Performance
   composition remains dependency-bound until its runtime is present in the
   productive branch.

## Prohibited interpretations

- A handoff is not a result.
- Opening Calendar is not appointment confirmation.
- Opening WhatsApp is not a sent-message claim.
- Opening the dialer is not contact confirmation.
- Elapsed time is not appointment completion.
- Pipeline stage is not Activity truth.
- Activity carries no points and writes no Performance state.
- Raw objection or message text is not canonical event payload.


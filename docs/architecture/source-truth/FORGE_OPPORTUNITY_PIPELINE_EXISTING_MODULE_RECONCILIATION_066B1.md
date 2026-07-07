# Forge Opportunity Pipeline Existing Module Reconciliation 066B1

DECISION=PASS_066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION

NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK_OR_REPAIR

## Purpose

066B1 reconciles the Opportunity Pipeline read-only adapter created in 066B with older opportunity, pipeline, prospecting, relationship, referral, widget, and forecast modules already present in the repository.

This phase is documentation and local audit tooling only. It does not connect a backend, mutate opportunity state, write CRM data, create calendar records, send messages, access auth, execute providers, persist browser data, or run a real engine.

## Existing Modules Found

### SMNYL Pipeline Engine

File:
`rule-packs/smnyl/smnyl-pipeline-engine.js`

Evidence:

- lines 7-18 define SMNYL pipeline stage weights;
- lines 20-56 build a stage summary and expected value from prospect records.

Assessment:
This is a rule-pack specific calculation helper. It is not a canonical Opportunity Pipeline read model, does not expose `forge.backend.read_model.v1`, and does not include adapter safety flags or audit envelope semantics.

### SMNYL Opportunity Engine

File:
`rule-packs/smnyl/smnyl-opportunity-engine.js`

Evidence:

- lines 7-49 detect simple opportunities from policy portfolio inputs;
- lines 18-30 identify premium clients without GMM;
- lines 33-45 identify family protection update opportunities.

Assessment:
This is a deterministic opportunity detector under a rule-pack context. It can become a future upstream signal but should not be wrapped directly by 066B until source ownership, input contract, rule-pack boundary, and read model mapping are explicit.

### Prospect Pipeline Engine

File:
`advisor-os/prospecting/prospect-pipeline-engine.js`

Evidence:

- lines 7-62 group prospect records by status into pipeline buckets.

Assessment:
This is a prospecting pipeline helper, not an Opportunity Pipeline read model. It may contribute to a future unified pipeline source, but it does not own opportunity detail, policy/quote references, safety policy, or read-only adapter envelopes.

### Opportunity Detector Engine

File:
`advisor-os/discovery/opportunity-detector-engine.js`

Evidence:

- lines 11-31 detect hot leads that are not paid;
- lines 33-52 sum potential pipeline value.

Assessment:
This is a lightweight discovery detector. It is useful signal logic, not a durable backend read source.

### Relationship Opportunity Engine

File:
`relationship-opportunity-engine.js`

Evidence:

- lines 100-219 detect relationship-driven opportunities and rank them;
- lines 207-219 return engine metadata, opportunities, best opportunity, and relationship score.

Assessment:
This is the strongest reusable opportunity signal found. It still lacks the 066A/066B adapter contract, route identity, source freshness envelope, blocked effects list, and preview-safe audit shape. It should be mapped through a future read-only source adapter, not imported directly into 066B without a contract phase.

### Referral Opportunity Engine

File:
`referral-opportunity-engine.js`

Evidence:

- lines 91-163 detect referral opportunity signals;
- lines 150-162 return referral score, likelihood, timing, approach, and confidence.

Assessment:
This is a related opportunity signal, but it belongs to referral intelligence. It is not a full Opportunity Pipeline read model.

### Pipeline Stage Engine

File:
`pipeline-stage-engine.js`

Evidence:

- lines 11-24 define stage labels;
- lines 26-59 advance a lead to the next stage and stamp an update time.

Assessment:
This module mutates stage-like state in memory and is not appropriate as a read-only adapter source without a separate boundary. It should remain excluded from 066B.

### Forge Alive Smart Widget Read Model

File:
`manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js`

Evidence:

- lines 258-268 create an `OPPORTUNITY_RESCUE_WIDGET` when opportunity signals exist.

Assessment:
This is a UI/read-model projection for widget selection. It proves opportunity context exists in Forge Alive, but it is not the pipeline source of truth.

## What 066B Created

File:
`platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js`

Evidence:

- lines 3-7 define adapter id and read routes;
- lines 9-46 define two local static preview opportunities;
- lines 48-64 list forbidden effects;
- lines 87-131 build the `forge.backend.read_model.v1` envelope;
- lines 117-129 keep all safety flags disabled;
- lines 142-155 return safe detail or `OPPORTUNITY_PIPELINE_NOT_MODELED`;
- lines 157-169 expose a read-only manifest.

Test:
`tests/opportunity-pipeline-read-only-adapter-066b-test.js`

Evidence:

- lines 12-26 assert no effects;
- lines 37-59 assert list, detail, missing detail, safe error, and safety behavior.

## Reconciliation Decision

Decision token:
`KEEP_066B_AS_TEMPORARY_LOCAL_STATIC_SHIM`

066B should remain a temporary local/static shim for preview and QA continuity.

It should not be declared a canonical backend integration. It should not be replaced immediately by an older module because no existing module found in this audit already provides the full 066A/066B adapter contract:

- `forge.backend.read_model.v1` envelope;
- read route identity;
- source freshness metadata;
- source evidence list;
- preview-safe audit event;
- blocked effects list;
- all safety flags disabled;
- safe empty state and safe error behavior;
- UI projection fields.

## Future Integration Direction

The most plausible future source mapping is:

- Relationship Opportunity Engine as an opportunity signal source;
- Referral Opportunity Engine as a referral signal source;
- SMNYL opportunity and pipeline engines as rule-pack specific enrichment;
- prospect pipeline engine as a prospecting stage source;
- Forge Alive widget read model as a consumer/projection, not the source.

Before replacing the 066B shim, Forge needs a follow-up source selection and mapping phase that defines:

- canonical Opportunity Pipeline ownership;
- read source priority;
- source freshness model;
- read model normalization;
- domain-specific signal boundaries;
- adapter contract mapping;
- no-effect policy and audit mapping.

## Risk If Connected Now

Connecting older modules directly now risks:

- duplicating opportunity truth;
- mixing prospecting, relationship, referral, rule-pack, and widget concerns;
- treating heuristic signals as durable pipeline records;
- bypassing the read-only adapter envelope;
- losing explicit safety/audit policy;
- accidentally introducing write-capable stage behavior.

## Final Decision

066B remains valid as a preview-only local/static shim.

Existing modules are real and reusable as future signal/source candidates, but they are not yet a drop-in replacement for the 066B read-only adapter.

DECISION=PASS_066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION

NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK_OR_REPAIR

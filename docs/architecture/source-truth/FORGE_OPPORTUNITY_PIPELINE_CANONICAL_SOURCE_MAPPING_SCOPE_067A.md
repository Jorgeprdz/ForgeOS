# Forge Opportunity Pipeline Canonical Source Mapping Scope 067A

Status: SCOPED

Phase:
`067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE`

Decision:
`OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED`

Base:

- `066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION`
- `066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION`
- `066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK`
- `066D_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_DECISION_LOCK`

## Robocop Gate

Applicable Constitution:
Article 0, Decision Clarity First, Advisor-first, no invented truth, AI explains / Forge decides.

Applicable ADRs:
066A, 066B, 066B1, 066C, 066D.

Build Tree area:
Opportunity Pipeline / Canonical Source Mapping / Backend Read Model Transition.

Discovery status:
066D locked the Opportunity Pipeline adapter only as a temporary local/static/read-only shim.

Implementation readiness:
Not implementation-ready. 067A is docs/scope only.

Miranda approval:
Validation evidence required before PASS.

Board approval status:
Not assumed.

Scope boundary:
067A only.

Prohibited surfaces:
UI mutation, backend real, CRM write, pipeline write, task creation, calendar creation, message send, auth, provider execution, secret access, browser persistence, real engine execution.

Validation expectation:
JSON audit, required markers, diff checks, safety scans, and exact staged boundary.

## 1. Principal Source Candidate

Principal source candidate for the next step:

`relationship-opportunity-engine.js`

Reason:
The next safe move is to map relationship-derived opportunity signals into the locked 066B/066C/066D read-only adapter contract before attempting broader pipeline ownership. It is a source candidate, not a locked source of truth.

This does not replace 066B. It defines the first candidate mapping lane for 067B.

## 2. Module Roles

| Module | 067A Role | Boundary |
| --- | --- | --- |
| `relationship-opportunity-engine.js` | source of truth candidate for relationship-derived opportunity signals | Candidate only; must prove evidence, freshness, empty state, safe error, audit, and no-effect policy |
| `referral-opportunity-engine.js` | signal source and enrichment source | Useful for referral context, not full opportunity truth |
| `advisor-os/prospecting/prospect-pipeline-engine.js` | source of truth candidate for prospect pipeline state | Unsafe until ownership, stage semantics, and no-effect boundary are explicit |
| `advisor-os/discovery/opportunity-detector-engine.js` | signal source | Detection output cannot become opportunity fact without evidence and audit mapping |
| `rule-packs/smnyl/smnyl-opportunity-engine.js` | enrichment source and rules interpreter | Rules can enrich interpretation but must not create opportunity truth alone |
| `rule-packs/smnyl/smnyl-pipeline-engine.js` | enrichment source and stage policy interpreter | Stage policy can assist mapping but must not mutate stage |
| `manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js` | UI projection consumer | Must consume read models only; excluded from read-only source ownership |
| `pipeline-stage-engine.js` | stage taxonomy and enrichment source | Unsafe until stage ownership and mutation boundary are separated |

## 3. Required Read Model Field Mapping

| Read Model Field | Mapping Requirement |
| --- | --- |
| opportunity id | Stable canonical id or deterministic preview id with source evidence |
| client ref | `client_ref` with entity id and display-safe client linkage |
| display name | Human-readable opportunity title derived from evidence |
| stage | Read-only stage label from canonical stage ownership |
| status | Read-only state; must distinguish open, blocked, stale, closed, and not modeled |
| priority | Derived only from explicit source signal or rule output |
| probability | Allowed only as preview/estimate with evidence; never fact without source ownership |
| expected value preview | Preview-only monetary estimate with evidence; never real money truth |
| next action | Recommendation preview only; no task, calendar, or message creation |
| followup due state | Read-only due-state label with freshness metadata |
| risk flags | Evidence-backed risk flags only |
| policy summary refs | References only; no policy write or policy truth creation |
| quote summary refs | References only; no quote creation or quote truth creation |
| source evidence | Required evidence ids for every mapped fact |
| freshness | Required source freshness status and timestamp rules |
| audit event | Required `read_model_used` audit event |
| blocked effects | Required explicit blocked-effect list |
| safety flags | Required false flags for all real-effect surfaces |

## 4. Not Mappable Yet

067A does not allow mapping:

- real money without evidence;
- real premium without source truth;
- stage mutation;
- CRM write;
- task, calendar, or message action;
- provider/runtime execution;
- invented recommendations;
- forecast as fact;
- opportunity truth without source ownership;
- UI projection output as source truth.

## 5. Required Contract Before Implementation

Before implementing any canonical source adapter, Forge must define:

- canonical source ownership;
- source priority;
- input schema;
- output read model schema;
- freshness model;
- evidence model;
- error model;
- permission/capability model;
- no-effect adapter policy;
- audit event mapping;
- empty state rules.

## 6. Next Phase

Recommended next phase:

`067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE`

Reason:
The relationship-opportunity lane is the safest first mapping lane. It lets Forge scope how a source candidate produces evidence-backed opportunity signals without claiming full pipeline source truth or replacing the 066B shim.

## Decision

DECISION=PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE

LOCKED_DECISION=OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED

NEXT=067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE

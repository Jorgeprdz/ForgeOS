# Forge Decision Surface Matrix 002

Phase: `FORGE_INTELLIGENCE_ASSEMBLY_BLUEPRINT_002`

Canonical chain: `INTELLIGENCE → DECISION → MODULE → ACTION → FEEDBACK`.

| Intelligence | Decision | Module / surface | Human action | Feedback event/evidence |
|---|---|---|---|---|
| Commitment/Timeline | this commitment is due/overdue | Pipeline/Home | contact or reschedule through governed action | activity/timeline event |
| Relationship cooling/risk | this relationship deserves attention | Pipeline/Person | review context; contact | new interaction/outcome evidence |
| Opportunity priority | this is one of the few actions worth attention now | Pipeline/Home | execute delegated next action | Timeline/Pipeline/Activity event |
| Nash NBA/NBC | this person/action/conversation is the best supported candidate | Pipeline/Communication/Home | prepare, approve, initiate | recommendation outcome + interaction evidence |
| Opportunity scenario | this action has a potential outcome under stated assumptions | Pipeline | compare/choose manually | actual observed outcome later |
| Productivity points/progress | current activity rhythm is above/below goal context | Activity/Home | record activity or adjust plan | FES event |
| Mick execution pattern | an execution pattern merits an experiment | Activity/Coach | choose experiment | activity/outcome sample |
| Personal Coach | these are the bounded weekly priorities/experiment | Coach | accept/adjust weekly plan | journal + execution + review evidence |
| Future Radar | a policy/person event needs proactive attention | Cartera/Home | open person/policy; contact/review | policy/timeline/activity event |
| Policy Coverage | coverage is confirmed/unknown/conflicting | Cartera | review/confirm via governed workflow | versioned confirmation receipt |
| Accepted Quote + Product Intelligence | this is what the proposal means product-specifically | Quotes | accept/present/export after gates | quote lifecycle/human decision event |
| GMM Product Intelligence | GMM proposal/policy requires product-specific explanation | Quotes | review/present | quote/policy decision evidence |
| Confirmed Payment + Commission Engine | this amount is a generated/estimated commission calculation | Income | inspect explanation/evidence | compensation event / later payout evidence |
| Bonus candidate | qualification appears met under current rule evidence | Income | inspect; do not treat as paid | official rule/evidence or compensation event |
| Revenue forecast | this income is expected/scenario, not generated | Income/Home | inspect assumptions; act in owning commercial domain | eventual payment/policy/outcome evidence |
| Advisor lifecycle | this development regime currently applies | Income/Coach | inspect applicable program/goal | lifecycle evidence/update |
| Business Intelligence | this funnel/channel/product pattern is observable | Reports/Coach | choose investigation/experiment | future observed metrics |
| Recommendation utility | this recommendation type has observed outcome history | Reports/Coach | refine experiment, not causal claim | additional outcomes |
| Alfred orchestration | these are the bounded cross-domain items requiring attention | Home | choose one delegated action | owning domain records result |

## Decision projection grammar

Every cross-domain decision presented outside its owning engine should be able to expose, when applicable:

```text
subject_ref
source_domain
decision_type
truth_state
priority / urgency
summary
why_now
evidence_refs
confidence
limitations
recommended_human_action
action_owner
action_target
valid_until / as_of
```

This is a **conceptual projection grammar**, not an implemented new engine or source of truth. Phase 004 must first test whether existing Pack 04 / Pack 07 contracts can be adapted rather than creating a parallel contract family.

## Truth-state minimums

- Product/Policy facts: source-backed and versioned.
- Recommendation: recommendation, never decision/execution.
- Forecast: OBSERVED/ESTIMATED/POTENTIAL/AT_RISK/UNKNOWN or equivalent owned state.
- Economic: scenario/expected/generated/earned/paid remain distinct.
- Unknown: null/unavailable, never synthetic zero.

## Surface rule

The same decision may appear in Home and its owning workspace, but:

- ownership remains with the source domain;
- Home may summarize, never reinterpret;
- the primary action deep-links/delegates to the owning workflow;
- completion feedback returns through domain events/evidence rather than UI-local state.

```text
DECISION_CONTRACTS_MAPPED=19
DECISION_TO_SURFACE_MAPPING_COMPLETE=YES
USER_ACTION_MAPPING_COMPLETE=YES
FEEDBACK_LOOPS_DOCUMENTED=YES
```

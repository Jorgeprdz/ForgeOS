# NASH Fast Track — NFAST-07 Pipeline Runtime Integration Closure

## Status

- `STAGE_ID=NFAST-07_PIPELINE_RUNTIME_INTEGRATION`
- `STATUS=COMPLETE`
- `ORCHESTRATOR_VERSION=NFAST-07.1`
- `SOURCE_BASE=14cdaaf747d8d427c1b03c462f81c63dc73c47c6`
- `NFAST_08_AUTHORIZED=NO`
- `DEPLOYMENT_AUTHORIZED=NO`

## Runtime chain completed

The productive Pipeline now uses the governed NASH chain:

```text
Productive Pipeline record
→ Pipeline Universal Governed Prospect Context Adapter
→ CONVERSATION_CONTEXT projection
→ NASH Prospect Context Intake
→ deterministic Conversation Brief
→ NFAST-05 provider request validation
→ remote provider client boundary
→ NFAST-06 Draft Intake and safety reconciliation
→ explicit exact-draft human approval
→ manual WhatsApp navigation
```

## Corrected runtime defect

Before NFAST-07, the productive UI invoked `nash-draft-provider`
directly with the legacy top-level field `prospectMessageContext`.

That request was incompatible with NFAST-05.1 and caused the provider
boundary to reject the request while the UI silently selected its
deterministic fallback.

NFAST-07 removes the legacy caller and injects a browser-consumable
Pipeline/NASH draft orchestrator.

## Browser and Node compatibility

The existing NFAST-02 through NFAST-05 contracts remain the source
implementation. They now expose dual Node/CommonJS and browser globals
so the productive browser runtime composes the same adapters, intake,
brief builder and request validator used by tests.

No source-truth logic was copied into `productive-prospect-ui.js`.

## Provider input lock

The provider receives only:

```text
requestVersion
providerId
conversationBrief
requestMetadata
```

The provider does not receive:

- raw Pipeline records;
- phone or WhatsApp routing values;
- email or other sensitive fields;
- unrestricted initial context or notes;
- `prospectMessageContext`;
- `experimentalFeatureEnabled`;
- full universal context;
- automatic approval or execution commands.

## Governed UI declarations

The message goal selected by the advisor is projected as an
`ADVISOR_DECLARATION` with evidence and current freshness.

Display-name personalization is included only when the caller explicitly
sets `approvedDisplayName=true`; the field still retains Pipeline
evidence lineage.

Appointment confirmation and rescheduling require a governed
`appointment.verified_reference`. After-call rendering requires a
governed `interaction.verified_reference`. Without the required
authority reference, the remote provider is not invoked and the safe
deterministic fallback remains available.

## Runtime safety locks

- `RAW_PIPELINE_FORWARDED_TO_PROVIDER=NO`
- `RAW_NOTES_FORWARDED_TO_PROVIDER=NO`
- `SENSITIVE_ROUTING_FIELDS_FORWARDED=NO`
- `LEGACY_PROSPECT_MESSAGE_CONTEXT=REMOVED`
- `PROVIDER_REQUEST_VERSION=NFAST-05.1`
- `CONVERSATION_BRIEF_VERSION=NFAST-04.1`
- `DRAFT_INTAKE_VERSION=NFAST-06.1`
- `EXPLICIT_HUMAN_APPROVAL_REQUIRED=YES`
- `AUTOMATIC_APPROVAL_ALLOWED=NO`
- `MESSAGE_AUTO_SEND=NO`
- `PIPELINE_MUTATION_PERFORMED=NO`
- `DRAFT_PERSISTENCE_PERFORMED=NO`

## Explicit non-authorizations

NFAST-07 does not:

- create or migrate Timeline persistence;
- change database schema or RLS;
- persist prompts, briefs, drafts or approvals;
- automatically open WhatsApp;
- send messages;
- merge into `main`;
- deploy the Edge Function;
- authorize NFAST-08 or any later stage.

## Next gate

- `NEXT_STAGE=NFAST-08_PROSPECT_TIMELINE_GOVERNANCE_AND_PERSISTENCE`
- `NEXT_STAGE_STATUS=DEFERRED`
- `PRODUCT_RUNTIME_NEXT_ACTION=RUN_BROWSER_AND_LIVE_PROVIDER_ACCEPTANCE`
- `DEPLOYMENT_REQUIRES_SEPARATE_AUTHORIZATION=YES`

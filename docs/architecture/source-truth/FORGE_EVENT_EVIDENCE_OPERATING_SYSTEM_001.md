# Forge Event & Evidence Operating System 001

## Status

- `STATUS=OWNER_ALIGNED_SOURCE_TRUTH`
- `RECORDED=2026-07-25`
- `PRODUCTIVE_UI_AUTHORITY=docs/static-preview/forge-alive/`
- `DEPLOYED_ENTRY=/ForgeOS/static-preview/forge-alive/?nav=inicio`
- `HUMAN_AUTHORITY=REQUIRED`
- `CROSS_TENANT_DATA_MIXING=FORBIDDEN`
- `RUNTIME_IMPLEMENTATION_AUTHORIZED=NO`

## 1. System definition

Forge is not a set of disconnected CRM, messaging, calendar, objection,
activity, product, relationship and manager modules.

Forge is one operating system:

```text
USER ACTION
→ EVENT
→ EVIDENCE
→ TIMELINE
→ CONTEXT
→ INTELLIGENCE
→ EXPLAINED RECOMMENDATION
→ HUMAN DECISION
→ NEXT ACTION
→ RESULT
→ LEARNING
```

Every applicable domain enters and consumes this governed circuit.

## 2. ADDLIFE continuity

Owner-aligned product statement:

- CRM ADDLIFE was the origin that evolved into Forge.
- Forge must preserve the original reason for that product: commercial work
  should become usable history without forcing repeated administrative capture.
- Recovering that principle is not a return to a legacy CRM.
- It is the evidence foundation required by Forge Intelligence.

## 3. Experience axiom

```text
FOR_THE_USER=AS_LIGHT_AS_POSSIBLE
FOR_FORGE=AS_COMPLETE_AS_NECESSARY
```

The user should normally provide one tap, one confirmation, one short text or
one voice note.

Forge performs the structural work:

- classify the event;
- preserve source and provenance;
- bind the subject;
- append Activity;
- update projections;
- identify unresolved outcomes;
- ask the next smallest useful question;
- expose candidates for human confirmation;
- and make evidence available to authorized intelligence systems.

A long form cannot be the primary mechanism for maintaining commercial context.

## 4. Productive application authority

The productive experience is Forge Alive:

```text
docs/static-preview/forge-alive/
/ForgeOS/static-preview/forge-alive/?nav=inicio
```

Known current path:

```text
Inicio
→ Pipeline
→ prospect card
→ prospect detail
→ Edit / Delete
→ Call
→ WhatsApp
→ Schedule in Google Calendar
```

The legacy root shell is not acceptance authority for Forge Alive work.

Forbidden acceptance substitutes:

```text
#dashboard-container
#dash-sales-nba
.nav-btn[data-target="advisor-sales-pipeline"]
legacy root index.html
```

## 5. Canonical distinctions

```text
prospect profile
≠ activity event
≠ evidence
≠ context
≠ appointment
≠ appointment outcome
≠ due action
≠ recommendation
≠ external execution
≠ learning signal
```

- **Profile:** current confirmed prospect state.
- **Activity:** append-only record of what occurred or was reported.
- **Evidence:** why Forge may believe or display something.
- **Context:** information that helps understand the person or interaction.
- **Appointment:** planned external calendar event.
- **Appointment outcome:** held, cancelled, no-show, rescheduled, unknown.
- **Due action:** internal operational commitment.
- **Recommendation:** explained projection, never execution or business truth.

Corrections create new events; history is not silently rewritten.

## 6. Initial prospect intake: event zero

The first saved prospect context is the initial form.

Saving creates atomically:

```text
PROSPECT_PROFILE_CREATED
PROSPECT_CREATED
INITIAL_CONTEXT_CAPTURED
TIMELINE_INITIALIZED
```

### Required

- full name;
- phone or WhatsApp;
- source;
- initial context by voice or text.

### Conditional for referrals

- referred by;
- relationship to referrer.

### Optional and collapsed

- email;
- date of birth;
- occupation.

### Removed from initial mandatory capture

- manually entered age;
- marital status;
- dependents;
- estimated income;
- product interests;
- due-action type;
- due-action date.

The prompt should be:

```text
What do you know about this person and why are you adding them?
```

Forge may extract candidates from natural language, but human confirmation is
required before promotion to profile truth.

## 7. Passive evidence from normal work

Nothing commercially meaningful should die inside a workspace.

Every module must answer:

```text
What did the user do?
What did Forge produce?
What was confirmed externally?
What evidence enters the timeline?
```

### WhatsApp and Nash

```text
MESSAGE_DRAFT_GENERATED
MESSAGE_DRAFT_EDITED
MESSAGE_DRAFT_APPROVED
WHATSAPP_OPENED
MESSAGE_SENT_CONFIRMED
PROSPECT_REPLIED_CONFIRMED
```

```text
WHATSAPP_OPENED ≠ MESSAGE_SENT
MESSAGE_SENT ≠ MESSAGE_READ
MESSAGE_READ ≠ PROSPECT_REPLIED
```

### Nash Combat / Objection Killer

```text
OBJECTION_CAPTURED
OBJECTION_ANALYSIS_GENERATED
OBJECTION_RESPONSE_GENERATED
OBJECTION_RESPONSE_EDITED
OBJECTION_RESPONSE_APPROVED
OBJECTION_RESPONSE_USED
OBJECTION_OUTCOME_CONFIRMED
```

Source labels include:

```text
PROSPECT_STATED
ADVISOR_REPORTED
SYSTEM_GENERATED
ADVISOR_CONFIRMED
EXTERNAL_PROVIDER_CONFIRMED
```

Practicing an objection does not prove a prospect expressed it.

### Calls

```text
CALL_INITIATED
CALL_CONNECTED_CONFIRMED
CALL_NOT_ANSWERED_CONFIRMED
CALL_CONTEXT_ADDED
```

Opening a phone link proves only handoff.

### Quotes and presentations

```text
QUOTE_STARTED
QUOTE_PREPARED
QUOTE_REVIEWED
PRESENTATION_HELD_CONFIRMED
PRODUCT_QUESTION_CAPTURED
PROPOSAL_REQUESTED_CONFIRMED
```

Product truth remains sourced from approved documentation.

## 8. Calendar, Activity and outcome probes

### Calendar button authority

The current Calendar button means:

```text
prepare or create a Google Calendar appointment
→ preserve appointment evidence for Activity
```

It is not the NFAST due-action editor and must not be repurposed.

A provider-confirmed calendar event ID is stronger evidence than opening a
calendar template link. The evidence model preserves that distinction.

### Post-appointment probe

When a registered appointment ends, Forge creates a pending probe.

Example:

```text
Appointment: Saturday 10:00–11:00
Probe: Saturday 11:30
Question: Did you have the appointment with Juan?
[Yes] [No] [Later]
```

If Yes:

```text
APPOINTMENT_HELD
→ optional voice/text context
→ ACTIVITY_CONTEXT_ADDED
```

If No:

```text
[Rescheduled]
[Prospect cancelled]
[Prospect did not attend]
[Advisor cancelled]
```

Rescheduling:

```text
APPOINTMENT_NOT_HELD
→ APPOINTMENT_RESCHEDULED
→ APPOINTMENT_SCHEDULED
```

No-show:

```text
APPOINTMENT_NO_SHOW
```

### Notifications

Desired components:

- explicit permission after a meaningful user action;
- authenticated device subscription;
- server scheduler;
- deduplicated probe;
- push notification where supported;
- deep link to the pending response;
- retry;
- internal pending center as fallback.

The probe is the system record; notification is only an attention channel.

## 9. Timeline and productive projections

One canonical timeline feeds several read models.

### Activity

Shows what occurred, source, confirmation, time, pending state and corrections.

### Prospect detail

Shows profile, initial context, history, objections, appointments, messages,
quotes, outcomes and reviewable recommendations.

### Pipeline card

Shows compact operational state: current stage, last activity, appointment,
pending outcome, due follow-up or conflict.

### Mi Día / Plan de hoy

Projects work requiring attention:

- confirm appointment result;
- add optional context;
- perform due follow-up;
- resolve conflict;
- prepare the approved next movement.

Mi Día does not create parallel truth.

## 10. Mesa de Consejo loop

```text
evidence and events
→ Mick adds bounded observable behavior context
→ NBA prioritizes and creates Reason Why
→ Alfred presents and orchestrates
→ Nash helps compose the conversation
→ human decides
```

- **Mick:** observable patterns, never personality diagnosis.
- **NBA:** priority and explained next action.
- **Alfred:** presentation, not final decision.
- **Nash:** conversation support, not prospect truth.
- **Human:** final authority.

Example evidence:

```text
3 appointments not held
2 reschedules
0 confirmed held appointments
within 45 days
```

Possible NBA recommendation:

```text
Pause follow-up for seven days and recontact with a short message.
```

The advisor may accept, edit or reject.

## 11. Private and global learning

### Private learning

The user partition may learn:

- what works for this advisor;
- what worked with this prospect;
- channel and timing;
- edit behavior;
- useful recommendation patterns.

It never becomes another user's prospect context.

### Protected global learning

The global system may learn only generalized relationships:

```text
situation
+ intervention
+ confirmed result
```

Forbidden global inputs:

- names;
- phones;
- emails;
- raw private messages;
- raw notes;
- prospect IDs;
- advisor IDs;
- exact private histories;
- identifiable small cohorts;
- reverse lookup paths.

Eligibility requires tenant-local extraction, minimization, removal of direct
identifiers, transformation of raw text, allowlist policy, cohort threshold,
aggregation protection and inability to reconstruct the original record.

Model order:

```text
1. complete events and confirmed outcomes
2. deterministic rules and analytics
3. classical supervised models
4. protected aggregate or federated learning
5. deep learning only with sufficient volume, labels and evaluation
```

Confirmed outcomes are more valuable than AI-generated drafts.

## 12. Domain convergence

The same event/evidence system connects:

- Pipeline and prospects;
- Activity;
- Calendar;
- WhatsApp;
- Nash Combat;
- Product Intelligence;
- Quote and Presenter;
- Relationship Intelligence;
- Policy Operations;
- Recruitment;
- Career;
- Manager and Team;
- Conservation;
- Forecast;
- compensation candidates where official boundaries apply.

Domains keep their own truth authority while sharing governed event, evidence
and projection contracts.

## 13. NFAST-09 disposition

Reusable accepted assets:

```text
Stage 3A — local-first core
Stage 3B — durable outbox and incremental sync
Stage 3C — governed Supabase gateway
Stage 3D — remote RLS/RPC acceptance
Stage 3E — due-action priority/read-model concepts
Stage 3F — typed due-action writer and commands
```

Realignment:

- NFAST-09 is not the system backbone.
- Due actions become one projection and command family on the Event & Evidence
  system.
- Stage 3G acceptance was attempted before productive Forge Alive binding
  existed.
- Commit `bfec223546c42b56fa75f08427ab49aadee0cb46` added a harness for the
  legacy shell.
- Workflow run `30180606799` failed before any valid Stage 3G finalization.
- The harness is historical evidence only.
- `NFAST_09_STAGE_3G_ACCEPTED=NO`
- `NFAST_10_AUTHORIZED=NO`

## 14. Completion rule

An applicable vertical closes only through:

```text
authority and source ownership
→ natural user input
→ canonical event
→ evidence and provenance
→ persistence and synchronization
→ timeline projection
→ productive Forge Alive surface
→ human-authorized next action
→ confirmed result
→ tests and security
→ browser acceptance on the real product
→ deployment and rollback evidence
```

## 15. Anti-patterns

Forbidden:

- long forms as primary context maintenance;
- asking users to repeat observable information;
- treating external handoff as external confirmation;
- mixing appointment, Activity and due-action truth;
- parallel timelines per module;
- AI output promoted silently to prospect truth;
- acceptance against a non-productive shell;
- global learning from raw private data;
- cross-tenant comparison;
- automatic execution without an approved gate.

## 16. Product sentence

> Forge does not wait for the advisor to document the work. Forge uses the
> actions the advisor already performs, asks the smallest useful question at
> the right moment, and converts confirmed answers into evidence, context,
> recommendations and learning while preserving human authority and tenant
> privacy.

<!-- BEGIN FORGEOS:FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP -->
## 17. FES 00 realignment closure

- `STATUS=SYSTEM_REALIGNED_AND_LEGACY_ACCEPTANCE_RETIRED`
- `SOURCE_COMMIT=5e7974152aee9bbe7256a6396ece42cabe934df9`
- `LEGACY_STAGE_3G_ACTIVE_HARNESS=RETIRED`
- `FAILED_RUN=30180606799_PRESERVED_AS_HISTORICAL_EVIDENCE`
- `FORGE_ALIVE_PRODUCTIVE_SURFACE=MAPPED`
- `NFAST_REUSABLE_ASSETS=MAPPED_NOT_AUTHORIZED`
- `LEGACY_SHELL_ACCEPTANCE=FORBIDDEN`
- `FES_01_SCOPE=PREPARED`
- `RUNTIME_IMPLEMENTATION_AUTHORIZED=NO`
- `NFAST_09_STAGE_3G_ACCEPTED=NO`
- `NFAST_10_AUTHORIZED=NO`
- `NEXT=FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT`

FES 00 changes implementation authority, not Git history. Stages 3A through 3F
remain reviewable assets. Stage 3G remains an invalid acceptance attempt until the
real productive vertical is implemented and accepted through Forge Alive.
<!-- END FORGEOS:FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP -->

<!-- BEGIN FORGEOS:FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT -->
## 18. FES 01 canonical Activity Event contract closure

- `STATUS=CANONICAL_ACTIVITY_EVENT_CONTRACT_IMPLEMENTED`
- `IMPLEMENTATION_BASE_COMMIT=17b68f839d63ebb8d8f4831b59c9fd590077fcc1`
- `CONTRACT_VERSION=FES-01.1`
- `SCHEMA_VERSION=forge.activity_event.v1`
- `FIRST_VERTICAL_EVENT_TYPES=13`
- `DETERMINISTIC_IDENTITY=YES`
- `TENANT_BOUND_IDENTITY=YES`
- `SOURCE_EVIDENCE_CONFIRMATION_EXPLICIT=YES`
- `EXTERNAL_HANDOFF_NOT_CONFIRMATION=YES`
- `PAYLOAD_ALLOWLISTS=YES`
- `LEARNING_ELIGIBILITY_DEFAULT_FALSE=YES`
- `CORRECTIONS_APPEND_ONLY=YES`
- `IMMUTABLE_OUTPUT=YES`
- `RUNTIME_PERSISTENCE=NO`
- `SUPABASE_REMOTE_MUTATION=NO`
- `PRODUCTIVE_UI_MUTATION=NO`
- `NEXT=FES_02_ACTIVITY_LEDGER_PERSISTENCE`

FES 01 defines the canonical fact envelope. It does not persist, synchronize,
project, notify or execute. Those capabilities remain downstream phases.
<!-- END FORGEOS:FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT -->

<!-- BEGIN FORGEOS:FES_02A_COMPLETION -->
## FES 02A activity ledger local foundation

```text
FES_02A_ACTIVITY_LEDGER_LOCAL_FOUNDATION=CLOSED
CANONICAL_EVENT_SCHEMA=forge.activity_event.v1
LEDGER_SCHEMA=forge.activity_ledger.v1
APPEND_ONLY_LOCAL_LEDGER=PASS
EVIDENCE_REFERENCE_ALLOWLIST=PASS
ATOMIC_LOCAL_EVENT_OUTBOX=PASS
INDEXEDDB_DRIVER=IMPLEMENTED_NOT_PRODUCTIVELY_BOUND
SYNC_ONCE_PUSH_BEFORE_PULL=PASS
CONFLICT_REVIEW_ROUTING=PASS
MIGRATION_CANDIDATE=PREPARED_NOT_DEPLOYED
SUPABASE_REMOTE_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
NEXT=FES_02B_REMOTE_LEDGER_AUTHORITY
```
<!-- END FORGEOS:FES_02A_COMPLETION -->

<!-- BEGIN FORGEOS:FES_02B_REMOTE_AUTHORITY -->
## FES 02B remote ledger authority

```text
REMOTE_ACTIVITY_EVENT_LEDGER=DEPLOYED_AND_ACCEPTED
APPEND_AUTHORITY=RPC_ONLY_AUTHENTICATED
PULL_AUTHORITY=RPC_ONLY_AUTHENTICATED
DIRECT_TABLE_ACCESS=DENIED
TENANT_IDENTITY=AUTH_UID_DERIVED
IDEMPOTENT_REPLAY=PASS
DIGEST_CONFLICT_REVIEW=PASS
CORRECTIONS_APPEND_ONLY=PASS
REMOTE_ACCEPTANCE_RESIDUE=ZERO
PRODUCTIVE_BINDING=NOT_YET_AUTHORIZED
NEXT=FES_02C_LEDGER_GATEWAY_SYNC_ACCEPTANCE
```
<!-- END FORGEOS:FES_02B_REMOTE_AUTHORITY -->

<!-- BEGIN FORGEOS:FES_02_CLOSURE -->
## FES 02 closed Activity Ledger authority

```text
CANONICAL_EVENT_SCHEMA=forge.activity_event.v1
LEDGER_SCHEMA=forge.activity_ledger.v1
LOCAL_LEDGER=APPEND_ONLY_INDEXEDDB
LOCAL_OUTBOX=ATOMIC_WITH_EVENT
REMOTE_LEDGER=DEPLOYED_FORCE_RLS_RPC_ONLY
AUTHENTICATED_GATEWAY=FES-02C.1
SYNC_ORDER=PUSH_BEFORE_PULL
TRANSPORT_FAILURE=EXPLICIT_RETRY
DIGEST_DISAGREEMENT=HUMAN_CONFLICT_REVIEW
PRODUCTIVE_UI_BINDING=DEFERRED_TO_FES_08
NEXT=FES_03_TIMELINE_AND_PROJECTION_RUNTIME
```
<!-- END FORGEOS:FES_02_CLOSURE -->

<!-- BEGIN FORGEOS:FES_03A_PLAYWRIGHT_E2E_BASELINE -->
## FES 03A Playwright E2E baseline

```text
FES_03A_PLAYWRIGHT_E2E_BASELINE=CLOSED
PLAYWRIGHT_VERSION=1.61.1
VITE_VERSION=8.1.5
E2E_EXECUTION_AUTHORITY=GITHUB_ACTIONS_LINUX_NATIVE
LOCAL_PROOT_BROWSER_GATE=FORBIDDEN
PRODUCTIVE_RUNTIME_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
NEXT=FES_03B_CANONICAL_TIMELINE_CONTRACT
```
<!-- END FORGEOS:FES_03A_PLAYWRIGHT_E2E_BASELINE -->

<!-- BEGIN FORGEOS:FES_03B_CANONICAL_TIMELINE_CONTRACT -->
## FES 03B canonical timeline contract

```text
FES_03B_CANONICAL_TIMELINE_CONTRACT=CLOSED
CONTRACT_VERSION=FES-03B.1
TIMELINE_SCHEMA=forge.activity_timeline.v1
SOURCE_AUTHORITY=FES01_CANONICAL_EVENTS_AND_FES02_LEDGER
ORDERING=OCCURRED_RECORDED_APPENDED_EVENT_ID
CORRECTIONS=APPEND_ONLY_VISIBLE
REBUILD_FROM_LEDGER=PASS
PROJECTIONS_OWN_TRUTH=NO
PRODUCTIVE_UI_MUTATION=NO
NEXT=FES_03C_ACTIVITY_PROJECTION
```
<!-- END FORGEOS:FES_03B_CANONICAL_TIMELINE_CONTRACT -->

<!-- BEGIN FORGEOS:FES_03C_ACTIVITY_PROJECTION -->
## FES 03C Activity projection

```text
FES_03C_ACTIVITY_PROJECTION=CLOSED
PROJECTION_SCHEMA=forge.activity_projection.v1
SOURCE_AUTHORITY=FES03B_CANONICAL_TIMELINE
DISPLAY_ORDER=OCCURRED_AT_DESC
CANONICAL_POSITION=PRESERVED
SOURCE_CONFIRMATION_PENDING_CORRECTIONS=VISIBLE
DETACHED_PROJECTION_AUTHORITY=NO
LEGACY_ACTIVITY_POINTS_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
NEXT=FES_03D_PROSPECT_DETAIL_PROJECTION
```
<!-- END FORGEOS:FES_03C_ACTIVITY_PROJECTION -->

<!-- BEGIN FORGEOS:FES_03D_PROSPECT_DETAIL_PROJECTION -->
## FES 03D Prospect Detail projection

```text
FES_03D_PROSPECT_DETAIL_PROJECTION=CLOSED
PROJECTION_SCHEMA=forge.prospect_detail_projection.v1
SOURCE_AUTHORITY=FES03B_CANONICAL_TIMELINE
ACTIVITY_HISTORY=FES03C_PROJECTION
PROSPECT_SCOPE=EXACTLY_ONE_IDENTITY_ROOT
UNKNOWN_REMAINS_UNKNOWN=YES
CORRECTION_FORKS=REVIEWABLE
UNSUPPORTED_SECTIONS=EXPLICIT
LEGACY_PROSPECT_DETAIL_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
NEXT=FES_03E_PIPELINE_CARD_PROJECTION
```
<!-- END FORGEOS:FES_03D_PROSPECT_DETAIL_PROJECTION -->

<!-- BEGIN FORGEOS:FES_03E_PIPELINE_CARD_PROJECTION -->
## FES 03E Pipeline card projection

```text
FES_03E_PIPELINE_CARD_PROJECTION=CLOSED
PROJECTION_SCHEMA=forge.pipeline_card_projection.v1
SOURCE_AUTHORITY=FES03D_PROSPECT_DETAIL
CURRENT_STAGE=CANONICAL_MILESTONE
LAST_ACTIVITY=VISIBLE
APPOINTMENT_OUTCOME_PENDING=EXPLICIT
DUE_FOLLOW_UP=VISIBLE
CONFLICTS=BLOCKING_REVIEW
CURRENT_TIME_INFERENCE=NO
LEGACY_PIPELINE_CARD_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
NEXT=FES_03F_MI_DIA_PROJECTION
```
<!-- END FORGEOS:FES_03E_PIPELINE_CARD_PROJECTION -->

<!-- BEGIN FORGEOS:FES_03F_MI_DIA_PROJECTION -->
## FES 03F Mi Día projection

```text
FES_03F_MI_DIA_PROJECTION=CLOSED
PROJECTION_SCHEMA=forge.mi_dia_projection.v1
SOURCE_AUTHORITY=FES03E_PIPELINE_CARD
CONFLICTS=FIRST
APPOINTMENT_OUTCOME=ACTIONABLE
DUE_FOLLOW_UP=ACTIONABLE
PENDING_CONFIRMATION=ACTIONABLE
OPTIONAL_CONTEXT=VISIBLE
CURRENT_TIME_INFERENCE=NO
ALFRED_GENERATION=NO
PRODUCTIVE_UI_MUTATION=NO
NEXT=FES_03G_PROJECTION_RUNTIME_ACCEPTANCE
```
<!-- END FORGEOS:FES_03F_MI_DIA_PROJECTION -->

<!-- BEGIN FORGEOS:FES_03G_PROJECTION_RUNTIME_ACCEPTANCE -->
## FES 03G projection runtime acceptance

```text
FES_03G_PROJECTION_RUNTIME_ACCEPTANCE=CLOSED
SNAPSHOT_SCHEMA=forge.projection_runtime_snapshot.v1
BUNDLE_SCHEMA=forge.projection_runtime_bundle.v1
TIMELINE_ACTIVITY_PROSPECT_PIPELINE_MI_DIA=ONE_LINEAGE
TENANT_ISOLATION=PASS
REBUILD=PASS
UNKNOWN_PENDING_CORRECTIONS_CONFLICTS=PRESERVED
DETACHED_PROJECTION_AUTHORITY=NO
PRODUCTIVE_UI_BINDING=DEFERRED_TO_FES_08
FES_03_TIMELINE_AND_PROJECTION_RUNTIME=CLOSED
NEXT=FES_04_LIGHT_PROSPECT_INTAKE
```
<!-- END FORGEOS:FES_03G_PROJECTION_RUNTIME_ACCEPTANCE -->

<!-- BEGIN FORGEOS:FES_04_LIGHT_PROSPECT_INTAKE -->
## FES 04 Light Prospect Intake

```text
FES_04_LIGHT_PROSPECT_INTAKE=CLOSED
INTAKE_SCHEMA=forge.light_prospect_intake.v1
EVENT_ZERO_SCHEMA=forge.prospect_event_zero.v1
REQUIRED=NAME_CONTACT_SOURCE_CONTEXT
REFERRAL_FIELDS=CONDITIONAL
OPTIONAL=EMAIL_DATE_OF_BIRTH_OCCUPATION
LEGACY_HEAVY_FIELDS=REMOVED
CANDIDATES=HUMAN_CONFIRMATION_REQUIRED
EVENT_ZERO=ATOMIC_READY
RAW_PRIVATE_DATA_IN_EVENTS=NO
PRODUCTIVE_UI_MUTATION=NO
NEXT=FES_05_PASSIVE_ACTIVITY_CAPTURE_BRIDGES
```
<!-- END FORGEOS:FES_04_LIGHT_PROSPECT_INTAKE -->

<!-- BEGIN FORGEOS:FES_05A_PASSIVE_CAPTURE_BRIDGE_CONTRACT -->
## FES 05A Passive Capture Bridge Contract

```text
FES_05A_PASSIVE_CAPTURE_BRIDGE_CONTRACT=CLOSED
OBSERVATION_SCHEMA=forge.passive_capture_observation.v1
SEQUENCE_SCHEMA=forge.passive_capture_sequence.v1
INTENT_GENERATION_EDIT_APPROVAL_HANDOFF_CONFIRMATION_RESULT=SEPARATED
WHATSAPP_AND_NASH=GOVERNED
NASH_COMBAT=GOVERNED
CALL_CALENDAR_QUOTE_PIPELINE=GOVERNED
RAW_PRIVATE_CONTENT_CAPTURE=NO
CANONICAL_EVENT_EXTENSION=DEFERRED_TO_FES05B
PRODUCTIVE_UI_MUTATION=NO
FES_05_PASSIVE_ACTIVITY_CAPTURE_BRIDGES=OPEN
NEXT=FES_05B_CANONICAL_EVENT_TYPE_EXTENSION
```
<!-- END FORGEOS:FES_05A_PASSIVE_CAPTURE_BRIDGE_CONTRACT -->

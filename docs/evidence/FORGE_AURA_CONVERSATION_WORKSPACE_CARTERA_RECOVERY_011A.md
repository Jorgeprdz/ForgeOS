# FORGE AURA — CONVERSATION WORKSPACE + CARTERA RELATIONSHIP RECOVERY 011A

## Phase

- `PHASE=FORGE_AURA_CONVERSATION_WORKSPACE_AND_CARTERA_RELATIONSHIP_RECOVERY_011A`
- `STATUS=IMPLEMENTED_AND_FOCUSED_GATE_PASS`
- `BRANCH=fix/aura-conversation-workspace-cartera-011a`
- `BASE_SHA=3123b12cd7480a9fc33cc8cb14d33377930a3cf2`
- `VALIDATED_IMPLEMENTATION_HEAD=7cd157c652c8096976d04784164c156a3c122ba0`
- `FIRST_FULL_PASS_RUN=31406537915`
- `PR=341`
- `MERGE_PERFORMED=NO`
- `DEPLOY_PERFORMED=NO`

The evidence file itself and the screenshot-upload workflow are closure-only changes after the validated implementation head. The final PR head is validated again by the focused 011A workflow before merge authorization is requested.

## Constitutional gate

The implementation was kept inside the Aura presentation / bridge boundary and the dedicated test/evidence surface.

Locks ratified and enforced:

- `FORGE_DECIDES_AI_EXPLAINS=LOCKED`
- `UNKNOWN_REMAINS_UNKNOWN=LOCKED`
- `EVIDENCE_PRECEDES_CLAIMS=LOCKED`
- `NO_AUTONOMOUS_EXTERNAL_ACTION=LOCKED`
- `HUMAN_FINAL_AUTHORITY=LOCKED`
- `NO_PARALLEL_SOURCE_OF_TRUTH=LOCKED`
- `NO_RAW_PIPELINE_TO_PROVIDER=LOCKED`
- `NO_HARDCODED_PRODUCTION_CONVERSATION=LOCKED`
- `NO_SILENT_IDENTITY_MERGE=LOCKED`
- `NO_UI_TECHNICAL_REFERENCE_LEAKAGE=LOCKED`

Focused gate results on the validated implementation head:

- `CONSTITUTIONAL_GATE_011A=PASS`
- `SCHEMA_MUTATION=0`
- `RLS_MUTATION=0`
- `NASH_AUTHORITY_MUTATION=0`
- `AUTO_IDENTITY_MERGE=0`
- `AUTO_MESSAGE_SEND=0`

No Supabase schema, migration or RLS change was made.
No NASH authority implementation was modified.
No canonical Product, Policy or CommercialPerson truth was modified.

## Applicable architecture / authority boundaries

The implementation reuses existing authorities instead of creating parallel engines:

- Forge Constitution v3
- ADR-003 — recommendation != execution
- ADR-004 — Next Best Action authority
- ADR-009 — no parallel NBA
- ADR-010 — NASH owns Conversation Intelligence
- ADR-011 — relationship context / non-manipulation
- N3 prospect-message privacy
- N4 conversation progression governance
- N5 prospect-message context contract
- NFAST-01 production conversation architecture
- NFAST-04 deterministic Conversation Brief
- NFAST-05 provider request contract
- NFAST-06 Draft Intake / Draft Safety / exact approval
- NFAST-07 Pipeline-to-NASH runtime orchestration
- NFAST-08 Prospect Timeline governance
- NFAST-09 governed Timeline projection rules where applicable

## Scope / changed runtime surfaces

Aura cutover:

- `docs/static-preview/forge-aura/app-v4.js`

Pipeline / Conversation Workspace:

- `docs/static-preview/forge-aura/pipeline/pipeline-module-v2.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v4.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v5.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js`
- `docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.css`

Cartera relational presentation:

- `docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v13.js`
- `docs/static-preview/forge-aura/cartera/cartera-module-v8.js`
- `docs/static-preview/forge-aura/cartera/cartera-relational-011a.css`

Focused validation:

- `tests/forge-aura-conversation-cartera-011a.test.mjs`
- `tests/e2e/forge-aura-conversation-cartera-011a.spec.mjs`
- `tests/fixtures/forge-aura-conversation-cartera-011a.html`
- `tests/aura011a-playwright.config.mjs`
- `.github/workflows/forge-aura-conversation-cartera-011a.yml`

## Cartera — root cause

### User-visible symptom

A canonical Person and a linked canonical Policy were rendered as two visually independent blocks. The Policy also exposed implementation-oriented product references in a context where the advisor needed a human commercial label.

### Data truth

The Person and Policy were correctly separate authorities. The problem was presentation, not identity.

Confirmed relationship evidence already existed through the Cartera policy-role authority:

`forge_cartera010b_list_general_policy_roles`

The 011A adapter uses canonical identifiers including `participant_person_id`. It does not join identities by name and does not silently merge Person and Policy records.

### Correction

`cartera-adapter-pages-v13.js` produces a presentation-only relationship projection:

- Person remains the primary visual entity.
- Confirmed linked policies appear beneath that Person.
- Confirmed linked accounts can be presented in the same relational unit.
- Orphan policies remain independently visible when there is no resolvable canonical relationship.
- A policy used in an ambiguous/multiple relationship is not destructively moved based on a guess.

### Product label

The visible product label is derived from the latest confirmed policy evidence version:

- requires `verification_state === CONFIRMED`
- reads confirmed `field_claims`
- uses `claims.productName` / `claims.product`
- falls back to `Producto no identificado`

A technical value such as `product:imagina-ser-65-15-pagos-udi` is not used as primary human UI copy.

### Pipeline continuity

The relational projection preserves `pipelineLinked` and the Person row visibly surfaces:

`Pipeline vinculado`

This is presentation of confirmed continuity, not an identity merge.

### Masked policy identity

The nested Policy row shows the evidence-backed commercial product and a masked policy number, for example:

- `IMAGINA SER 65 - 15 PAGOS UDI`
- `••••6169`

The complete policy number is not exposed by the relational summary.

## Cartera — visual correction

The desired visual contract is one relational card rather than independent nested boxes:

- `.cartera-relationship-card` owns the light outer border/radius/shadow.
- Person row inside the card has no independent box.
- Linked Policy row has no independent box; it is separated by a light divider.
- Browser-native button appearance is removed with `appearance:none`.
- Mobile layouts retain min-width protections and avoid horizontal overflow.

### MutationObserver runtime defect found during E2E

A real runtime freeze was discovered during browser acceptance.

The v8 decorator observed `childList/subtree` mutations and then unconditionally reassigned the same header `textContent`. That assignment created another mutation, which scheduled another decorator pass, producing an infinite microtask feedback loop.

Symptoms:

- all assets returned HTTP 200;
- no `pageerror` was emitted;
- the fixture never reached READY;
- even Playwright `page.evaluate()` could not enter the busy main thread.

Fix:

Presentation mutations are idempotent. Text is assigned only when the desired value differs from the current value. Static contract coverage prevents reintroducing the unconditional self-trigger.

## WhatsApp — root cause

Aura's active Pipeline path used the legacy/direct behavior:

`whatsapp action -> whatsappUrl(record) -> window.open(...)`

That bypassed Forge's governed conversation preparation and opened WhatsApp before a draft had been generated, reviewed and approved.

## Conversation Workspace — corrected runtime

The active Aura Pipeline module now intercepts WhatsApp at the UI boundary and opens one Forge Conversation Workspace.

The workspace includes:

- prospect identity / minimal governed context;
- conversation objective;
- allowed tone/style selection;
- draft generation;
- editable suggested message;
- draft source state;
- exact human approval;
- NASH Combat in the same workspace;
- manual WhatsApp navigation only after the exact-draft gate.

The old direct `window.open(adapter.whatsappUrl(record))` behavior is not the first action anymore.

## NASH / provider path

The implementation reuses the modern NASH path:

- `ForgePipelineNashDraftOrchestrator`
- `ForgeNashDeterministicConversationBriefContract`
- `ForgeNashProviderRequestContract`
- `ForgeNashRemoteDraftProviderClientBoundary`
- `ForgeDraftSafetyBoundaryNFAST06`
- `ForgeDeterministicDraftRendererNFAST06`
- `ForgeProductiveContactNavigationBoundary067G17B`

The language provider receives a deterministic provider-safe `conversationBrief`, not raw Pipeline data.

The provider renderer continues to use the existing provider prompt builder:

`buildConversationBriefRendererPrompt(...)`

Provider constraints include the existing instruction to use only the supplied governed DATA lines.

### Privacy / provider boundaries proven by E2E

- `RAW_PIPELINE_SENT_TO_AI=NO`
- `RAW_OBJECTION_SENT_TO_AI=NO`
- raw private Pipeline context is absent from the provider request
- phone / WhatsApp routing values are not part of the provider brief
- no raw objection transcript is included in the provider request

## Draft Safety / exact approval

The draft path preserves NFAST-06 authority:

- provider output is intake-only and not approved;
- Draft Safety validation occurs before approval;
- human approval is explicit;
- approval applies to the exact draft text;
- editing the draft after approval invalidates approval;
- a new approval is required after editing;
- only the exact approved text may be used for the WhatsApp navigation URL.

The application does not equate opening WhatsApp with sending a message.

- `AUTO_WHATSAPP_OPEN=NO`
- `AUTO_MESSAGE_SEND=NO`
- `MESSAGE_SENT_ASSUMED=NO`

## NASH Combat

### Legacy engine review

The legacy Combat engine contains hardcoded response copy. That legacy final response is NOT used as production prospect wording in 011A.

The UI bridge uses the Combat report for candidate classification / interpretation / strategy and explicitly discards the legacy `objectionKillerMessage` as a final prospect response.

- `HARDCODED_PRODUCTION_MESSAGE_USED=NO`

### Governed message composition

A reviewed Combat result is converted into governed context / candidate interpretation for a new deterministic Conversation Brief.

The provider renders the final wording from that governed brief. The raw objection is not forwarded to the provider.

### Combat tab collision found during E2E

The Conversation Workspace DOM had five vertical sections:

1. header
2. context
3. tabs
4. body
5. footer

The CSS originally declared only four grid rows. After message generation, body content could overlap the tabs and intercept clicks on `NASH Combat`.

Fix:

`grid-template-rows:auto auto auto minmax(0,1fr) auto`

Tabs have their own grid row / z-index and the body is the dedicated scroll container.

### Human-reviewed objection persistence

Persistence is optional and explicit.

Only after the advisor reviews the Combat classification may the workspace register:

- `eventType=OBJECTION_RECORDED`
- `objectionCode=<reviewed classification>`
- `resolutionStatus=OPEN`

The raw objection phrase is not persisted by this path.

### Timeline authority defect found during E2E

A bridge defect was found in the first registration implementation: v5 attempted to use `adapter.timelineService`, but the Pages adapter chain did not expose that service even though the productive base adapter does.

The final 011A bridge does not duplicate the RPC. It loads and reuses the existing governed NFAST-08 authority:

`ForgeProspectTimelineServiceNFAST08.create(client)`

and invokes:

`timelineService.appendProspectTimelineEvent(...)`

The focused static gate explicitly prohibits replacing this with a direct `client.rpc(...)` call.

### Append confirmation boundary

A second consistency issue was removed: a successful Timeline append was previously followed by a mandatory full Pipeline reload before the UI could report success. A later refresh failure could therefore falsely tell the advisor that registration failed after the event had already been persisted.

The final boundary is:

`reviewed classification -> governed NFAST-08 append -> confirmed registration`

A full Pipeline reload is not required to acknowledge the confirmed append.

## Conversation Workspace geometry

Playwright acceptance covers:

- `390x844`
- `412x915`
- `768x1024`
- `1440x900`

The workspace must remain within viewport geometry and the document must not develop horizontal overflow.

## Automated validation

Focused workflow:

`Forge Aura Conversation + Cartera 011A`

Workflow file:

`.github/workflows/forge-aura-conversation-cartera-011a.yml`

Validated implementation run:

- `RUN_ID=31406537915`
- `HEAD=7cd157c652c8096976d04784164c156a3c122ba0`

Results:

- `CONSTITUTIONAL_GATE_011A=PASS`
- `STATIC_CONTRACTS=PASS`
- `PAGES_CONVERSATION_RUNTIME_CONTRACT_011A=PASS`
- `BROWSER_E2E=PASS`
- `FINAL_ROBOCOP_011A=PASS`

Browser cases completed:

1. Cartera confirmed Person/Policy relational presentation — PASS
2. WhatsApp opens Conversation Workspace, not direct wa.me — PASS
3. NASH Combat + governed reviewed-classification persistence — PASS
4. mobile 390 geometry — PASS
5. mobile 412 geometry — PASS
6. tablet 768 geometry — PASS
7. desktop 1440 geometry — PASS

## Visual evidence artifact

The focused Browser job generates:

- `artifacts/011a/screenshots/cartera-390.png`
- `artifacts/011a/screenshots/conversation-approved-412.png`
- `artifacts/011a/screenshots/nash-combat-390.png`
- `artifacts/011a/screenshots/mobile-390.png`
- `artifacts/011a/screenshots/mobile-412.png`
- `artifacts/011a/screenshots/tablet-768.png`
- `artifacts/011a/screenshots/desktop-1440.png`

Closure workflow uploads them as:

`forge-aura-011a-visual-evidence`

with `if-no-files-found:error`.

## Pages artifact

Pages allowlist / runtime validation confirms the required NASH and advisor Pipeline authorities are present in the Pages publication contract.

No production deployment is performed by the 011A focused test workflow.

## Historical CI classification

This repository has historical PR workflows whose bounded-diff allowlists apply to their own earlier phases. They trigger on unrelated modern PRs and can fail because the 011A files are outside those historical allowlists.

Those failures are classified as:

`LEGACY_CI_NOISE`

They are not used as the 011A technical verdict. The phase verdict is the focused `Forge Aura Conversation + Cartera 011A` workflow.

## Known limitations / explicit non-claims

- Opening WhatsApp does not prove a message was sent.
- Forge does not know whether WhatsApp delivery or reading occurred from this flow.
- Provider unavailability may select the existing deterministic safe fallback.
- The controlled E2E fixture proves the browser contract; it is not a claim that every external provider/network is permanently available.
- The phase does not add background messaging or autonomous execution.
- The phase does not merge identities automatically.
- The phase does not modify product calculations, policy truth, RLS or schema.

## Rollback

Rollback is bounded to the Aura cutover and the added bridge/presentation files.

A rollback can restore the previous `app-v4.js` module imports and remove the 011A Pipeline/Cartera presentation bridge files without reverting canonical data, migrations or authority state because the phase made no canonical data-model mutation.

## Release gate

Current release posture:

- `CARTERA_RELATIONAL_PRESENTATION=PASS`
- `CARTERA_NO_IDENTITY_MERGE=PASS`
- `CARTERA_NO_TECHNICAL_PRODUCT_LABEL=PASS`
- `WHATSAPP_DIRECT_BYPASS_REMOVED=PASS`
- `CONVERSATION_WORKSPACE=PASS`
- `NASH_CONTEXT_INTAKE=PASS`
- `CONVERSATION_BRIEF=PASS`
- `FORGE_PROMPT_BUILDER=PASS`
- `PROVIDER_RENDERER=PASS`
- `DRAFT_SAFETY=PASS`
- `EXACT_HUMAN_APPROVAL=PASS`
- `WHATSAPP_MANUAL_OPEN_ONLY=PASS`
- `NASH_COMBAT_INTEGRATED=PASS`
- `NASH_COMBAT_NO_HARDCODED_FINAL_RESPONSE=PASS`
- `OBJECTION_HUMAN_REVIEW=PASS`
- `MOBILE_390=PASS`
- `MOBILE_412=PASS`
- `TABLET=PASS`
- `DESKTOP=PASS`
- `UNIT_STATIC_CONTRACTS=PASS`
- `E2E=PASS`
- `PAGES_ARTIFACT=PASS`
- `CONSTITUTIONAL_GATE=PASS`
- `ROBOCOP_GATE=PASS`

No merge or deployment is authorized by this evidence file itself.

`READY_FOR_HUMAN_MERGE_AND_DEPLOY_AUTHORIZATION`

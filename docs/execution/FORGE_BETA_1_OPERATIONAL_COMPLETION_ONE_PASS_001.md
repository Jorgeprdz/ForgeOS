# FORGEOS — BETA 1 OPERATIONAL COMPLETION — ONE PASS

## Execution identity

- `PASS=BETA_1_OPERATIONAL_COMPLETION_ONE_PASS_001`
- `SOURCE_ROADMAP=docs/roadmap/FORGE_BETA_1_OPERATIONAL_COMPLETION_ROADMAP_001.md`
- `BRANCH=fix/beta-1-operational-completion-one-pass`
- `BASE=main`
- `AUTOMATIC_MERGE=FORBIDDEN`
- `PRODUCTION_MUTATION_WITHOUT_CONFIRMATION=FORBIDDEN`

## Mission

Complete in one controlled delivery the three missing Beta 1 capabilities and their full acceptance envelope:

1. Pipeline bulk import for P200, CSV and XLSX.
2. Cartera PDF intake with desktop drag-and-drop and manual upload on all supported devices.
3. Real AI drafting for WhatsApp Composer, with ForgeOS composing governed context and the model returning only an editable draft.

The pass is not complete until integration, authentication regression, responsive acceptance and public deployment evidence all pass.

## Workstream A — Pipeline bulk import

- One entry action: `Carga masiva`.
- Accept `.csv` and `.xlsx`.
- Detect known Proyecto 200 structure.
- Propose or create the `Proyecto 200` contact book.
- Preserve unmapped source information as context/bitácora.
- Preview and map columns before persistence.
- Normalize phone and email values.
- Detect duplicates and require an explicit resolution.
- Make the operation idempotent and auditable.
- Keep newest entries first by default.
- Provide import result counts and rejection reasons.

Required gates:

- `PIPELINE_BULK_IMPORT=PASS`
- `P200_IMPORT=PASS`
- `CSV_IMPORT=PASS`
- `XLSX_IMPORT=PASS`
- `CONTACT_BOOKS=PASS`
- `IMPORT_PREVIEW=PASS`
- `IMPORT_DEDUPLICATION=PASS`
- `IMPORT_IDEMPOTENCY=PASS`

## Workstream B — Cartera document intake

- Desktop dropzone plus `Seleccionar PDF`.
- Mobile and tablet manual file selection.
- Validate file type, size, session and ownership.
- Upload privately and create an ingestion record.
- Expose honest states: idle, uploading, processing, review, rejected, recoverable error.
- Extract into staging only.
- Reconcile person/account/policy candidates.
- Require human review and confirmation before persistence.
- Preserve the original document and allow processing retry without duplicate uploads.
- Reject late results after logout or session replacement.

Required gates:

- `CARTERA_PDF_UPLOAD=PASS`
- `CARTERA_DESKTOP_DROPZONE=PASS`
- `CARTERA_MOBILE_PICKER=PASS`
- `CARTERA_PRIVATE_STORAGE=PASS`
- `CARTERA_STAGING_EXTRACTION=PASS`
- `CARTERA_REVIEW_BEFORE_PERSISTENCE=PASS`
- `CARTERA_RETRY_IDEMPOTENCY=PASS`
- `CARTERA_LATE_RESULT_REJECTION=PASS`

## Workstream C — WhatsApp Composer with real AI drafting

Architecture:

`Prospect context -> governed prompt composer -> authenticated backend/Edge Function -> AI provider -> validated draft -> human edit -> open WhatsApp`

Rules:

- Provider secrets must never exist in browser code.
- Composer owns context selection and prompt structure.
- AI only drafts text.
- AI must not mutate Pipeline, Cartera, Timeline or activity history.
- AI must not send WhatsApp messages.
- Missing facts must remain absent, not invented.
- Manual drafting must remain available when AI fails.
- Opening WhatsApp does not equal sent confirmation.

Initial supported intents:

- Primer contacto.
- Seguimiento.
- Retomar conversación.
- Confirmar cita.
- Solicitar documentos.
- Seguimiento de propuesta.

Required gates:

- `WHATSAPP_PROMPT_COMPOSER=PASS`
- `WHATSAPP_AI_BACKEND=PASS`
- `AI_SECRET_ISOLATION=PASS`
- `AI_GROUNDED_DRAFT=PASS`
- `AI_HUMAN_REVIEW=PASS`
- `WHATSAPP_OPEN_WITH_DRAFT=PASS`
- `NO_FALSE_SENT_ACTIVITY=PASS`
- `MANUAL_COMPOSER_FALLBACK=PASS`

## Integration requirements

- Shared loading, error, retry and confirmation patterns.
- No visible dead controls or simulated productive states.
- No duplicate primary actions.
- Responsive acceptance on mobile, tablet and desktop.
- Mobile content reserves safe space above the floating navigation pill.
- Logout scrub and late-result rejection apply to all three workstreams.
- Direct-route and expired-session behavior must remain honest.

Required gates:

- `MOBILE_ACCEPTANCE=PASS`
- `TABLET_ACCEPTANCE=PASS`
- `DESKTOP_ACCEPTANCE=PASS`
- `AUTH_SESSION_REGRESSION=PASS`
- `LOGOUT_SCRUB=PASS`
- `DIRECT_ROUTE_GUARD=PASS`
- `NO_DEAD_CONTROLS=PASS`
- `NO_SIMULATED_PRODUCTIVE_STATE=PASS`

## Test matrix

### Pipeline

- Manual contact creation remains functional.
- Valid and invalid CSV.
- Valid and invalid XLSX.
- Known and altered P200 template.
- Duplicate phone/email/name combinations.
- Cancellation before confirmation.
- Partial failure and safe retry.
- Contact book creation and selection.
- Default newest-first ordering.

### Cartera

- Desktop drag-and-drop.
- Manual picker on desktop, tablet and mobile.
- Valid PDF, wrong type and oversized file.
- Processing failure and retry.
- Review, confirmation and cancellation.
- Logout during upload and during processing.
- Session replacement and late backend result.

### Composer

- Complete and incomplete prospect context.
- All initial intents.
- Provider success, timeout, malformed response and unavailable service.
- Edit, regenerate, discard and manual fallback.
- Open WhatsApp and cancel before sending.
- Confirm that no activity is marked sent automatically.

## Evidence contract

Every required gate must include:

- Commit SHA.
- Test or workflow identifier.
- Device and viewport where applicable.
- Expected result.
- Actual result.
- Screenshot, video or machine-readable output path.
- Pages/public route when applicable.

## Merge policy

Merge is forbidden until all P0 gates are PASS and the final report states:

```text
BETA_1_OPERATIONAL_COMPLETION_ONE_PASS=PASS
PIPELINE_BULK_IMPORT=PASS
P200_IMPORT=PASS
CARTERA_PDF_UPLOAD=PASS
CARTERA_DESKTOP_DROPZONE=PASS
CARTERA_REVIEW_BEFORE_PERSISTENCE=PASS
WHATSAPP_AI_DRAFTING=PASS
AI_SECRET_ISOLATION=PASS
MOBILE_ACCEPTANCE=PASS
TABLET_ACCEPTANCE=PASS
DESKTOP_ACCEPTANCE=PASS
AUTH_SESSION_REGRESSION=PASS
PUBLIC_DEPLOYMENT=PASS
AUTOMATIC_MERGE=FORBIDDEN
```

Any FAIL keeps the PR open and Beta 1 invitations controlled.

## Completion definition

This pass is complete only when a new authenticated tester can import an initial prospect base, load a real cartera PDF, review extracted information, generate and edit a real AI-assisted WhatsApp draft, and continue using ForgeOS without hidden manual prerequisites or false productive states.

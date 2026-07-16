# Forge Quote-to-Sales Presentation Roadmap · R16J

<!-- FORGE:R16J_ROADMAP:START -->
## Current baseline

`22c1d6df21f7d3085b9f0d91a23c495bf0c6372c`

## R16J0 · Accepted Quote to Sales Presentation Entrypoint

Status: PASS

Delivered:

- Real CTA in Nueva Cotización.
- Hidden and disabled state before accepted quote results.
- Visible ready state after accepted quote results are available.
- Review-session creation through the real bridge contract.
- Existing-session reopening.
- Editable preview opening.
- Recoverable error state.
- Human approval and export boundaries preserved.

Evidence:

- Chromium: PASS.
- Firefox: PASS.
- WebKit: PASS.
- Three screenshots: no quote, accepted quote ready, review open.

## R16J1 · Sales Presentation Editable Review Workspace

Status: NEXT

Scope:

- Strengthen slide editing UX.
- Expose documented client objective and advisor notes.
- Preserve non-editable sourced facts and source paths.
- Make approval revision-aware.
- Keep export blocked until explicit human approval.

## Historical planned export scope · reconciled into R16J2

Status: SUPERSEDED_BY_R16J2_BOARD_AUTHORIZATION

Scope:

- Explicit approval identity.
- Explicit export authorization.
- Print/PDF presentation layout.
- No automatic send or CRM mutation.

## Deferred side branch

`R16I0N5_COMMAND_BAR_POINTER_OWNERSHIP_FINAL_ACCEPTANCE` remains HOLD.
Resume only after the Quote-to-Sales Presentation System reaches a
stable review workspace.
<!-- FORGE:R16J_ROADMAP:END -->

<!-- FORGE:R16J0A_ROADMAP:START -->
## R16J0A · Quote Review and Acceptance Action

Status: PASS

Delivered:

- Visible `Confirmar cotización` action for extracted results.
- Candidate getter on the accepted-quote bridge.
- Explicit human confirmation API.
- Existing calculation engine reused.
- Accepted review snapshot created after confirmation.
- Presentation CTA activated after acceptance.
- Recoverable error state.
- No automatic downstream effects.

Evidence:

- Chromium: PASS.
- Firefox: PASS.
- WebKit: PASS.
- Three screenshots: no quote, pending confirmation, accepted and ready.

## R16J1 · Sales Presentation Editable Review Workspace

Canonical ID:

`R16J1_SALES_PRESENTATION_EDITABLE_REVIEW_WORKSPACE`

Status: PASS

Scope:

- Replace the technical opening with the real slide workspace.
- Expose client objective, rationale, and advisor notes.
- Keep sourced facts distinct from editable narrative.
- Make approval revision-aware.
- Keep export blocked until explicit approval.
<!-- FORGE:R16J0A_ROADMAP:END -->

<!-- FORGE:R16J1_ROADMAP:START -->
## R16J1 · Sales Presentation Editable Review Workspace

Canonical ID:

`R16J1_SALES_PRESENTATION_EDITABLE_REVIEW_WORKSPACE`

Status: PASS

Delivered:

- Real single-slide editable workspace.
- Slide navigation rail.
- Client-facing slide canvas.
- Editable title, purpose, and advisor notes.
- Locked sourced facts.
- Source paths visible only in debug mode.
- Human approval bound to content revision.
- Separate export authorization.
- Approval and export authorization revoked after editing.
- Nueva Cotización production UI cleanup.
- Compact statuses and small technical watermark.
- Bottom navigation overlap protection.

Evidence:

- Chromium: PASS.
- Firefox: PASS.
- WebKit: PASS.
- Three screenshots: clean quote UI, editable workspace, and debug mode.

## Historical planned visual-composition scope · reconciled into R16J2

Retired candidate ID:

`R16J2_SALES_PRESENTATION_VISUAL_COMPOSITION_AND_CLIENT_PREVIEW`

Status: SUPERSEDED_BY_R16J2_BOARD_AUTHORIZATION

Scope:

- Turn reviewed slide content into a polished client presentation layout.
- Add controlled visual themes without changing sourced facts.
- Add a presentation-only client mode.
- Preserve revision-aware approval and explicit export authorization.
<!-- FORGE:R16J1_ROADMAP:END -->

<!-- FORGE:R16J1V_ROADMAP:START -->
## R16J1V · Verification Reconciliation

Status: PASS

Verified commit:

`afce5715261fac9cca9bc85dc5b4e3ed0338e571`

Evidence:

- Corrected gate uses the canonical `WORKSPACE` selector.
- Chromium: PASS.
- Firefox: PASS.
- WebKit: PASS.
- Three screenshots generated.
- Runtime files changed by reconciliation: none.

Next:

`R16J2_ADVISOR_OS_PRESENTATION_RUNTIME_RECONCILIATION`
<!-- FORGE:R16J1V_ROADMAP:END -->

<!-- FORGE:R16J1B_ROADMAP:START -->
## R16J1B · SeguBeca Acceptance and Product UI Reconciliation

Canonical ID:

`R16J1B_SEGUBECA_ACCEPTANCE_ACTIONS_AND_ORB_REMOVAL`

Status: PASS

Guideline gate: PASS before UI modification.

Delivered:

- SeguBeca detection from canonical parser and product-intelligence fields.
- No automatic calculation in the legacy modal.
- Explicit human confirmation.
- Rendered result preserved while pending.
- Stable confirm and presentation proxies placed next to upload.
- Real Alfred Orb removed from quote and presentation surfaces.
- Alfred engine preserved.

Evidence:

- Chromium: PASS.
- Firefox: PASS.
- WebKit: PASS.
- Three screenshots generated.

Next:

`R16J2_ADVISOR_OS_PRESENTATION_RUNTIME_RECONCILIATION`
<!-- FORGE:R16J1B_ROADMAP:END -->

<!-- FORGE:R16J1C_ORB_HALO_ROADMAP:START -->
## R16J1C · Close Alfred Orb and Halo Removal

Canonical ID: `R16J1C_ALFRED_ORB_AND_HALO_REMOVAL_CLOSURE`

Status: PASS — HUMAN VISUAL CONFIRMATION

Delivered:

- Orb removed.
- Halo removed.
- Pointer and focus exposure removed.
- Alfred engine preserved.
- Guidelines audit recorded.

Not included:

- Review-card composition.
- Quote-action redesign.
- Presentation content redesign.

Technical debt:

- Validate Firefox in a native desktop or CI environment.

Next: `R16J1D_SALES_PRESENTATION_REVIEW_CARD_COMPOSITION`
<!-- FORGE:R16J1C_ORB_HALO_ROADMAP:END -->

<!-- FORGE:R16J2_RUNTIME_RECONCILIATION_ROADMAP:START -->
## R16J2 · Advisor OS Presentation Runtime Reconciliation

Status: `PASS`

- `R16J1=PASS`
- `R16J2=AUTHORIZED_AND_ACCEPTED`
- `R16I=SUPERSEDED_IDENTIFIER_NOT_USED`
- `PRESENTATION_EXECUTION_DOMAIN=ADVISOR_OS`
- `MANAGER_OS_PRESENTATION_WRITE_AUTHORITY=NO`
- `PRESENTATION_REASON_WHY_REQUIRED=NO`
- `NBA_REASON_WHY_CONSUMPTION=FORBIDDEN`
- Evidence:
  `docs/evidence/R16J2_ADVISOR_OS_PRESENTATION_RUNTIME_ACCEPTANCE.md`
<!-- FORGE:R16J2_RUNTIME_RECONCILIATION_ROADMAP:END -->

<!-- FORGE:R16J2B_STAGE_ALIGNMENT_ROADMAP:START -->
## R16J2B · Accepted Quote Presentation Stage Alignment

Status: `LOCAL_ACCEPTANCE_PASS_PENDING_PAGES`

- Desktop controls use left, mathematical center and right zones.
- Status and Presentation Editor CTA occupy independent full-width rows.
- Tablet and mobile responsive acceptance is complete locally.
- Presentation authority remains in Advisor OS.
- Evidence:
  `docs/evidence/R16J2B_ACCEPTED_QUOTE_STAGE_ALIGNMENT_ACCEPTANCE.md`
<!-- FORGE:R16J2B_STAGE_ALIGNMENT_ROADMAP:END -->

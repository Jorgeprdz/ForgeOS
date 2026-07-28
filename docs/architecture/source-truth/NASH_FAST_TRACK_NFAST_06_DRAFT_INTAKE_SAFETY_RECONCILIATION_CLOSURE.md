# NASH Fast Track — NFAST-06 Draft Intake and Safety Reconciliation Closure

## Status

- `STAGE_ID=NFAST-06_DRAFT_INTAKE_AND_SAFETY_RECONCILIATION`
- `STATUS=COMPLETE`
- `INTAKE_VERSION=NFAST-06.1`
- `SOURCE_BASE=8678ba4d2d3b99488f87eb6785fb29a869cc8c0b`
- `RUNTIME_PROVIDER_ALIGNMENT=NOT_INCLUDED`
- `NFAST_07_AUTHORIZED=NO`

## Scope completed

NFAST-06 establishes the boundary between an optional remote language
renderer and human review.

The implementation now:

1. Validates the provider result envelope before accepting a
   `DraftCandidate`.
2. Rejects candidates that claim send authority, provider approval,
   persistence, Pipeline mutation or any external side effect.
3. Requires nonempty candidate text, review and human-approval flags.
4. Treats provider errors as deterministic-fallback conditions.
5. Runs the candidate through the existing draft safety validator.
6. Requires a separate explicit human approval action.
7. Binds approval to the exact reviewed draft text.
8. Invalidates approval whenever the text changes or is regenerated.
9. Keeps WhatsApp navigation disabled until safety and exact approval
   both pass.
10. Preserves manual navigation and performs no automatic sending.

## Corrected defect

Before NFAST-06 closure, the WhatsApp click handler called
`approveExactDraft()` during the same click that attempted navigation.
That behavior was not an independent human approval gate.

The closure adds a separate `data-approve-whatsapp-draft` control and
removes automatic approval from the WhatsApp navigation handler.

## Explicit non-authorizations

NFAST-06 does not:

- Replace the legacy Pipeline provider request.
- Build a `conversationBrief`.
- Connect governed Pipeline context to the provider.
- Change database schema, migrations or RLS.
- Persist drafts or approval.
- Open WhatsApp automatically.
- Send messages.
- Authorize NFAST-07.

The productive UI still uses the legacy
`prospectMessageContext` request shape. Replacing that caller belongs to
NFAST-07 Pipeline runtime integration.

## Acceptance locks

- `PROVIDER_OUTPUT_IS_CANDIDATE_ONLY=YES`
- `PROVIDER_APPROVAL_ALLOWED=NO`
- `PROVIDER_SEND_AUTHORITY_ALLOWED=NO`
- `PROVIDER_SIDE_EFFECTS_ALLOWED=NO`
- `DETERMINISTIC_FALLBACK_PRESERVED=YES`
- `EXPLICIT_HUMAN_APPROVAL_REQUIRED=YES`
- `AUTOMATIC_APPROVAL_ALLOWED=NO`
- `APPROVAL_BOUND_TO_EXACT_TEXT=YES`
- `EDIT_INVALIDATES_APPROVAL=YES`
- `REGENERATION_INVALIDATES_APPROVAL=YES`
- `WHATSAPP_MANUAL_NAVIGATION_ONLY=YES`
- `MESSAGE_AUTO_SEND=NO`

## Next stage

- `NEXT_STAGE=NFAST-07_PIPELINE_RUNTIME_INTEGRATION`
- `NEXT_REQUIRED_CHANGE=REPLACE_LEGACY_PROSPECT_MESSAGE_CONTEXT_CALLER`
- `NEXT_PROVIDER_INPUT=DETERMINISTIC_CONVERSATION_BRIEF`
- `NFAST_07_SEPARATE_GATE_REQUIRED=YES`

# ADR Draft — Quote Preview PDF runtime persistence and ownership

- **Status:** DRAFT
- **ADR number:** Not assigned
- **Approval:** Pending explicit constitutional review
- **Implementation authorization:** None

## Context

Forge has a probable canonical PDF preview engine and an existing confirmation modal/UI, but source inspection did not prove a canonical runtime owner, cache, writer, reader or complete call chain.

The locked functional flow remains:

```text
PDF
→ existing authorized extractor/engine
→ explicit preview-result writer
→ preview-result persistence boundary
→ confirmation popup reads by explicit identity
→ Yes: populate UI from confirmed preview result
→ No: populate UI in edit mode from the same preview result
```

The user must not transcribe values already present in the PDF.

## Decision to make

Choose and approve the canonical runtime ownership and persistence model
for extracted Quote Preview data without creating quote truth.

## Options

### Option A — REUSE_EXISTING_GENERIC_RUNTIME

**Draft status:** `REJECTED_PENDING_NEW_EVIDENCE`

Reuse an existing generic repository, runtime state or cache.

**Advantages**

- Avoids duplicate infrastructure.
- Potentially minimizes implementation surface.

**Risks**

- No canonical owner, writer, reader, key or complete call chain is proven.
- Premature reuse could couple Quote Preview to an unrelated domain.

**Acceptance condition**

New source evidence must prove ownership, writer, reader, identity and downstream call chain before this option can return to review.

### Option B — EPHEMERAL_IN_MEMORY_HANDOFF

**Draft status:** `NOT_RECOMMENDED`

Pass the extraction result directly in memory from the engine to the confirmation modal without a persistence boundary.

**Advantages**

- Small implementation surface.
- No persistent client data.

**Risks**

- Result may be lost on reload or navigation.
- Popup and UI lifecycle become tightly coupled.
- Conflicts with the locked user flow that expects writer, cache and reader.
- Makes deterministic review and edit recovery weaker.

**Acceptance condition**

Could only be chosen if the persistence requirement is explicitly revoked by a later constitutional decision.

### Option C — DEDICATED_LOCAL_PREVIEW_RESULT_STORE

**Draft status:** `DRAFT_RECOMMENDATION_PENDING_APPROVAL`

Create one narrowly scoped offline-first preview-result store owned by Product Intelligence handoff infrastructure and consumed read-only by Quote Preview.

**Advantages**

- Matches the locked PDF → writer → cache → popup/UI flow.
- Provides deterministic reload, confirmation and edit behavior.
- Keeps extraction output separate from quote truth.
- Allows one explicit writer, reader, schema, identity and event contract.

**Risks**

- Introduces a new runtime persistence surface.
- Could become a duplicate cache if later evidence reveals an existing owner.
- Requires strict lifecycle, retention, redaction and deletion rules.

**Acceptance condition**

Requires explicit ADR approval and a final duplicate-infrastructure check immediately before implementation.

## Draft recommendation

`DEDICATED_LOCAL_PREVIEW_RESULT_STORE`

This recommendation is not approval. It is the smallest architecture that
matches the locked user flow after repeated source inspection failed to
prove an existing canonical owner or complete runtime contract.

Immediately before implementation, Forge must perform one final focused
duplicate-infrastructure check. New evidence can invalidate this recommendation.

## Required contract

### Ownership

A single canonical module must own preview-result lifecycle. The UI and modal must never own parsing or persistence.

### Input

Structured extraction output produced upstream by the authorized Product Intelligence PDF engine or its existing product-specific extractors.

### Schema

Required confirmation fields:

- `name`
- `family`
- `product`
- `insured`
- `sumAssured`
- `annualPremium`
- `plannedOrAvePremium`
- `coveragePeriod`

Required metadata:

- `schemaVersion`
- `sourceDocumentHashOrReference`
- `extractorIdentity`
- `createdAt`
- `reviewStatus`
- `fieldConfidenceOrReviewFlags`

Forbidden stored fields:

- `rawPdfBytes`
- `providerSecrets`
- `backendCredentials`
- `quoteTruthStatus`
- `automaticOfficialQuoteApproval`

### Writer

Exactly one explicit writer API may persist a preview extraction result. It must reject unknown schema versions and must not write quote truth.

### Reader

Exactly one explicit reader API may return the latest authorized preview result by explicit identity. No hidden latest default is allowed.

### Identity

The cache/store key must be explicit and versioned. Selection by an implicit global latest record is prohibited.

### Event

After a successful local write, the existing 'forge:quote-preview:extraction-ready' event may notify the modal. The event must carry an identity/reference, not become the data store.

### Retention

Retention and deletion policy must be explicitly selected during implementation design. No indefinite retention is authorized by this draft.

### Confirmation actions

- **Yes:** Mark the preview result as user-confirmed for UI population only. This still does not create quote truth.
- **No:** Load the same preview result into edit mode without requiring manual transcription of values already extracted.

### Constitutional boundaries

- Product Intelligence remains upstream.
- Quote Preview remains downstream.
- The PDF engine is reference input, never quote truth.
- No CRM, backend, provider, policy, pipeline, message or calendar writes.
- Manual capture is fallback-only for absent or ambiguous fields.
- No parser, OCR or PDF reading inside the popup or UI.

## Acceptance criteria

- [ ] A final pre-implementation discovery confirms no canonical equivalent exists.
- [ ] One canonical owner path is approved.
- [ ] One explicit versioned identity/key contract is approved.
- [ ] One writer and one reader API are named and documented.
- [ ] The eight-field schema and metadata contract are approved.
- [ ] The extraction-ready event carries only an identity/reference.
- [ ] Yes and No actions consume the same stored preview result.
- [ ] No operation can mark the result as quote truth.
- [ ] All real-effect flags remain false.
- [ ] Implementation receives a separate RoboCop gate after ADR approval.

## Rejection conditions

- An existing canonical cache, writer, reader or owner is proven before implementation.
- The proposed store would persist raw PDF bytes or secrets.
- The store would be shared with Banxico, Revenue, CRM or another unrelated domain.
- The UI or modal would parse PDFs or become persistence owner.
- The implementation would use a hidden latest-record default.
- The result could become official quote truth without explicit downstream gates.

## Authorization state

```text
ADR_STATUS=DRAFT
ADR_APPROVED=false
ADR_NUMBER_ASSIGNED=false
ADR_REVIEW_AUTHORIZED=true
IMPLEMENTATION_AUTHORIZED=false
CACHE_CREATION_AUTHORIZED=false
BRIDGE_CREATION_AUTHORIZED=false
UI_INTEGRATION_AUTHORIZED=false
RUNTIME_WRITE_AUTHORIZED=false
QUOTE_TRUTH_ALLOWED=false
```

## Next gate

`107Z8_QUOTE_PREVIEW_PDF_RUNTIME_PERSISTENCE_ADR_REVIEW_AND_APPROVAL_GATE`

## 107Z7R targeted revision

**Failed review check corrected:** `ADR_0027_RULE_ALIGNED`

## Explicit alignment with ADR-0027

This draft explicitly adopts ADR-0027, **No hidden latest-rule defaults**, as
a binding rule for the preview-result persistence contract.

The reader must receive an explicit, versioned preview-result identity. It
must never select a record through an implicit `latest`, global-most-recent,
last-written, newest-timestamp, or other hidden default.

The writer must return the exact identity that was persisted. The event
`forge:quote-preview:extraction-ready` may carry that identity, but it must
not carry authority to select another record.

Any implementation that falls back to a hidden latest record automatically
fails this ADR and must remain blocked.

This revision does not approve the ADR and does not authorize implementation.

# Sales Presentation Engine Ownership Registry — R16H1

Status: **REGISTERED — EXISTING WIRING, NO NEW RUNTIME CONNECTIONS**

This source-truth document records ownership for the eleven engines in the
Quote-to-Sales Presentation chain. It does not authorize new runtime imports,
effects, sends, CRM writes, or PPTX output.

## Authority decisions

1. **Canonical server composition vs browser projection**
   - `QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER` owns canonical
     server-side composition only.
   - `BROWSER_PRESENTATION_CONTEXT_ADAPTER` owns browser projection from the
     accepted-quote review snapshot.
   - The manager-os adapter must not be imported into the static browser
     preview.

2. **Reason Why**
   - Reason Why is an externally supplied narrative data authority.
   - The presentation context adapter may validate, clone, carry and compose
     that payload.
   - It must not import, execute, generate, recalculate or mutate Reason Why.

3. **Review packet vs review session**
   - `PRESENTATION_REVIEW_PACKET_BUILDER` owns the immutable initial review
     bundle.
   - `PRESENTATION_REVIEW_STATE_STORE` owns revisioned session state and the
     editable fields `title`, `purpose`, and `notes`.
   - Facts remain read-only. Any content edit revokes approval and export
     authorization.

4. **Approval vs export**
   - `PRESENTATION_HUMAN_APPROVAL_GATE` owns the identified human decision
     bound to one exact revision.
   - `PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER` owns the
     downstream Print/PDF authorization and printable view.
   - Approval does not itself export. Export cannot create approval.

5. **Bridge**
   - `ACCEPTED_QUOTE_BRIDGE` is the public browser orchestrator.
   - It owns no independent financial, product, prospect, narrative, approval,
     or CRM truth.

## Registered logical chain

```text
Accepted Quote Review Snapshot
  -> Browser Presentation Context
  -> Dedicated Presentation Prompt
  -> Slide Plan
  -> Review Packet
  -> Review State
      -> Editable Dynamic UI
      -> Human Approval
          -> Print/PDF Export Authorization
```

`ACCEPTED_QUOTE_BRIDGE` orchestrates the browser lifecycle around this chain.

## Assembly plan

- Existing runtime connections: **preserve and verify**
- New runtime connections required: **none**
- Server adapter browser mount: **forbidden**
- Static HTML mutation: **forbidden**
- Fact editing: **forbidden**
- Human approval: **required**
- AI approval: **forbidden**
- Export: **Print/PDF only**
- PPTX export: **not implemented**
- Send: **disabled**
- CRM mutation: **forbidden**

## Next verification

`R16H2_EXISTING_PRESENTATION_ASSEMBLY_CONTRACT_AND_E2E_RELEASE_FAST_TRACK`

R16H2 must verify the existing import graph, public bridge lifecycle, exact
revision approval, edit invalidation, printable export and public deployment.
It may not add a connection merely because two engines have similar names.

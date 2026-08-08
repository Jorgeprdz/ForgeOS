# FORGE AURA CARTERA PRODUCTIVE UX RECONCILIATION 001

## Execution identity

```text
PHASE=FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_001
OWNER_AUTHORIZATION=OK_GO_AURA_CARTERA_FINAL_ACCEPTANCE_AND_PR_001B
SOURCE_MAIN_SHA=bca6c68ab0f9106f88861ad05524c3813b6dcbbc
BRANCH=feature/aura-cartera-productive-reconciliation-001
AURA_LIGHT_VERSION=1.0
IMPLEMENTATION != DEPLOYMENT
PR ACCEPTANCE != PAGES DEPLOYMENT
MERGE=NOT_AUTHORIZED
PAGES_DEPLOY=NOT_AUTHORIZED
SUPABASE_SCHEMA_CHANGE=NO
```

## Objective

Reconcile Cartera with Forge Aura Light 2026 while preserving the already accepted productive authorities for identity, Policy, PolicyRole, Evidence, Coverage, payment facts, relationship context and productivity context. The frontend is an operating surface over canonical owners; it is not a new source of truth.

The resulting Cartera surface is intended to help the advisor answer, in order: what needs attention, what is in the portfolio, who is related to it, which Policies exist, and what context is available for a human next step.

## Authorities

This phase is subordinate to:

- Article 0: Forge exists to strengthen human judgment, not replace it.
- `FORGE_CONSTITUTION_V3.md`.
- `AGENTS.md`.
- Forge governance and Robocop directives.
- ADR-023 productive recovery execution authority.
- ADR-024 Forge Aura Light 2026, the exclusive visual authority for this redesign.
- Cartera 010B identity/Policy persistence authority.
- Cartera 010C/010D read projections and directory authority.
- Canonical Evidence 020B/020C.
- Cartera 030 payment authority.
- Cartera relationship/productivity authorities 040–100.
- Policy Intelligence as Policy and contracted Coverage truth owner.
- `FORGE_CARTERA_POLICY_COVERAGE_MODEL_AUTHORITY_001` and the accepted Coverage read-after-write/versioning hotfix.
- `FORGE_PAGES_EXPLICIT_DEPLOYMENT_GOVERNANCE_001`.

## Aura architecture

Cartera mounts inside the existing Aura V4 runtime:

```text
Aura V4 bootstrap
  -> shared auth/session
  -> shared router
  -> shared shell
  -> route factory: cartera
  -> createCarteraModule(...)
```

No second shell, router, session manager, navigation system or design system is introduced. Cartera uses the shared V4 lifecycle and owns only its route-local module state, dialog state and request cancellation.

The route lifecycle has explicit teardown semantics. Cartera closes layers, aborts in-flight PDF work, removes key listeners, increments its revision guard and clears its mounted DOM before another advisor/session/route can reuse the surface.

## Product surfaces

### Cartera Home

The home surface prioritizes attention, portfolio context and directory access. `deriveAttention` caps the visible primary attention layer at three explainable signals. Signals communicate why something deserves review; they do not execute decisions automatically.

### Policy entry

Entry hierarchy is locked:

1. PDF — primary.
2. XLSX/CSV — secondary.
3. Manual capture — tertiary.

The UI states that extraction produces candidates, not Policy Truth, and requires a human review/confirmation act.

### Directory

Directory reads the accepted person, account and Policy projections and presents them as distinct entity kinds. A Policy row is not converted into a duplicated person.

### Person Workspace

Person Workspace composes identity, linked Policies, relationship memory and permitted growth context. Relationship context is explanatory only: it does not create an opportunity, probability, outbound message or commercial action automatically.

### Policy Workspace

Policy Workspace presents Policy facts, roles, payment context and contracted Coverages. Coverages are independent children rather than an ambiguous aggregate field. Policy-level legacy sum insured/premium remain labelled as legacy summary facts and are not silently reinterpreted as Coverage children.

## Ownership boundaries

```text
IDENTITY_OWNER=CARTERA_010B_IDENTITY_RESOLUTION
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
POLICYROLE_OWNER=CARTERA_010B_020C
EVIDENCE_OWNER=CANONICAL_EVIDENCE_020
POLICY_COVERAGE_OWNER=POLICY_INTELLIGENCE
PAYMENT_TRUTH_OWNER=CARTERA_030C_CONFIRMED_PAYMENT_AUTHORITY
NO_PARALLEL_IDENTITY=LOCKED
NO_PARALLEL_POLICY_TRUTH=LOCKED
NO_PARALLEL_COVERAGE_TRUTH=LOCKED
NO_PARALLEL_WRITER=LOCKED
```

Aura Cartera reads productive tables/projections where the accepted read boundary permits it, but canonical mutation only crosses existing governed RPC/command boundaries. Route-local frontend files contain no direct `.insert()`, `.update()` or `.delete()` against canonical Cartera entities.

## Evidence 020 alignment

The PDF path is:

```text
PDF
-> forge_cartera020b_admit_evidence
-> forge_cartera020b_claim_evidence
-> existing cartera-pdf-intake extraction
-> PolicyEvidencePacket candidate
-> forge_cartera020b_record_processing_result
-> human review
-> forge_cartera020c_prepare_identity_orchestration
-> explicit 020C execution
-> forge_cartera020c_attach_policy_confirmation
-> canonical 010B identity/Policy command boundary
```

Extraction objects declare `createsTruth:false`; confirmation is a separate human-governed step.

## PDF Coverage limitation

The productive PDF extractor does not provide structured multi-Coverage extraction. Aura does not create a replacement parser and does not infer contracted Coverage from product names or ambiguous text.

```text
PDF_MULTI_COVERAGE_EXTRACTION=NOT_SUPPORTED
UI_DISCLOSURE=REQUIRED
```

The review UI therefore tells the advisor that Coverage detail was not detected automatically and may be captured later through the accepted Policy Coverage writer.

## Policy Coverage truth

Canonical read:

```text
forge_policy_intelligence_read_policy_coverages(text)
```

Canonical write:

```text
forge_policy_intelligence_confirm_policy_coverages(jsonb)
```

The Aura Coverage adapter resolves the owned canonical Policy, binds the exact `current_version` to its exact PolicyVersion, binds the corresponding Policy Evidence version, and sends only the governed Coverage command. It requires the canonical RPC receipt to report `CONFIRMED` and `readAfterWriteVerified=true`.

No direct Coverage-table mutation exists in Aura.

## Unknown semantics

```text
UNKNOWN_NOT_ZERO=LOCKED
unknown amount -> null
unknown currency -> null / requires review
unknown status -> null or explicit unknown / requires review
unknown frequency -> null / requires review
unknown coverage period unit -> null
unknown payment period unit -> null
```

Aura never substitutes MXN, ACTIVE, MONTHLY or zero merely because a fact is absent or unrecognized. The Coverage adapter was explicitly reconciled so an entered period value without a reviewed unit does not silently become `MONTH`.

## Beneficiary privacy

Beneficiary remains a restricted PolicyRole concern. Generic Cartera UI does not project beneficiary name, phone, email, government identifiers or other sensitive role data. It exposes only a safe indicator equivalent to:

```text
Información de beneficiarios restringida
```

Synthetic browser acceptance contains a beneficiary trap value and asserts that it never appears in the DOM.

## Relationship and productivity boundaries

Relationship memory, future/growth reviews and productivity outputs are consumed only as permitted context. They are not promoted into hidden scores, sales probabilities, auto-generated opportunities, automatic outreach or human decisions.

Article 0 remains visible in behavior: Forge can surface evidence and explain why attention may be useful, while the advisor retains responsibility for the decision.

## Responsive and accessibility contract

Acceptance covers:

- desktop 1440 px;
- mobile 390 px;
- tablet around 834 px;
- PDF initial, processing and review states;
- Policy multi-Coverage;
- Person Workspace;
- empty and attention states;
- 200% zoom;
- `prefers-reduced-motion`;
- keyboard focus in dialogs;
- Escape close;
- focus return;
- explicit loading/error/empty feedback;
- no destructive horizontal overflow on mobile/tablet.

Touch/focus/state behavior remains under Aura primitives and route-local CSS. State is not intended to depend only on color.

## Pages artifact boundary

The canonical production Pages builder intentionally publishes `docs/static-preview/forge-alive-material3` under the public `static-preview/forge-alive` namespace and does not publish the source-only Material 3 namespace.

Aura already carries the governed import-map bridge:

```text
../forge-alive-material3/ -> ../forge-alive/
```

The Cartera final-acceptance gate builds `_site` with the exact build programs extracted from `.github/workflows/pages.yml`, without executing the deployment job, and then walks the Aura JavaScript import graph after applying the import map. This prevents a source import from being accepted when its effective public target is absent.

Required result:

```text
PAGES_ARTIFACT_BUILD=PASS
PAGES_IMPORT_GRAPH=PASS
```

## Testing strategy

The dedicated contract test verifies:

- V4 route/shell/session reuse;
- entry hierarchy;
- Evidence 020B/020C boundaries;
- no direct canonical frontend writes;
- unknown semantics;
- exact Coverage PolicyVersion/Evidence binding;
- canonical Coverage RPCs;
- multi-Coverage children;
- beneficiary privacy;
- max-three attention signals;
- non-automatic decision wording;
- relationship/productivity boundary;
- teardown/abort/revision behavior;
- absence of parallel truth owners.

Inherited regression selection covers 010B, 010C, 010D, 020B, 020C, 030, 040, 050, 060, 070, 080, 090, 100, Policy Coverage, the Coverage versioning hotfix and explicit Pages deployment governance.

Browser acceptance uses only synthetic fixtures. Screenshots are uploaded as a PR workflow artifact for human/model visual inspection; no real client PII is introduced.

## CI boundary

`.github/workflows/aura-cartera-productive-reconciliation-001.yml` is PR-only toward `main` and has only:

```text
permissions:
  contents: read
```

It has no Pages write, OIDC deployment permission, auto-merge or deployment action. Its diff lock rejects Supabase migrations/functions, Policy Intelligence backend changes, the production Pages deployment workflow and Material 3 runtime redesign inside this phase.

## Limitations

- Structured PDF multi-Coverage extraction remains unsupported by the productive extractor.
- Aura does not claim that an empty Coverage child array proves absence of contracted Coverage.
- Product/relationship/productivity context remains bounded by its existing owner; this phase does not expand those authorities.
- Remote database acceptance is inherited from the accepted productive authorities; this phase does not mutate or re-deploy Supabase.
- Visual PASS requires inspection of generated screenshots in addition to a successful Playwright exit code.

## Deployment status

```text
IMPLEMENTATION_STATUS=PR_ACCEPTANCE_ONLY
IMPLEMENTATION != DEPLOYMENT
PR ACCEPTANCE != PAGES DEPLOYMENT
MERGE=NO
AUTO_MERGE=NO
AUTO_PAGES_DEPLOY=NO
MANUAL_PAGES_DEPLOY=NO
PAGES_DEPLOYMENT_CREATED=NO
SUPABASE_SCHEMA_MUTATION=NO
NEW_MIGRATION=NO
EDGE_FUNCTION_CHANGE=NO
```

The only authorized completion state for this phase is an open PR whose exact head checks are green, followed by STOP.

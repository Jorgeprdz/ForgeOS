# Recruitment Hub 2B — isolated adapters

Authority: `adr/ADR-029 — Recruitment Hub 2B Execution Authority.md` in the repository root. This module is offline decision-support context. It introduces no UI, authentication, persistence, Supabase client, schema, ranking or automatic hiring/rejection. It is not a production application.

## Run

Node >=22.12.0; no product dependencies are needed for this module.

```sh
node recruitment-hub/bridge/build.mjs --write
node recruitment-hub/bridge/build.mjs --check
node --test recruitment-hub/tests/*.test.mjs
```

`bridge/forge-recruitment.entry.mjs` is the native Node ESM/CommonJS source interop entry. `src/generated/forge-recruitment.mjs` is the self-contained deterministic ESM derivative used by the adapters and suitable for future browser bundling. It has seven safe named exports; the original eight-export audit package remains external and is not mounted. The generator validates the exact five source hashes, permits only their existing relative dependencies and emits no absolute machine paths or wall-clock timestamps. It has its own SHA-256 in `bridge/migration-manifest.json`; it must not be described as retaining the original bundle hash.

Original engines remain the single editable source. Generated wrappers are build artifacts, not a second implementation of their rules. No manual editing of generated output.

## API and records

The versioned normative contract is `contracts/rh-2b.v1.json`. The synthetic fixture in `tests/fixtures/work-evidence.json` demonstrates field spelling; it does not assert that these fields exist in live Supabase.

```js
import { adaptPipeline } from '../src/adapters/pipeline.mjs';
const view = adaptPipeline({
  workspaceId: 'ws-example',
  application: { workspace_id: 'ws-example', id: 'app-example', candidate_id: 'candidate-example', stage: 'application_started' },
  evidence: [],
  asOf: '2026-10-16T12:00:00.000Z',
  maxAgeMs: 86400000
});
// view.result.normalizedPipelineState === 'APPLICATION_STARTED'
// view.status === 'NEEDS_EVIDENCE'; no allowed transitions; no writes.
```

All adapters require an expected workspace and consumed records/evidence scoped to it. Supplied application/candidate references must agree. This is defensive input validation, not RLS or authentication: a caller asserting workspace_id or verification metadata does not establish actual permission or source authenticity. Production authorization and membership must be enforced upstream in a separately authorized phase.

Inputs may contain unneeded source-table fields, but only allowlisted scalar identifiers and state/type values are projected. Arbitrary payload, assessment, score, manager override, names, notes and personal factors are never passed to engines. Neutral evidence/verification has a closed field set and rejects extra fields with generic errors that do not echo values. Opaque references are syntactic IDs, not a semantic PII detector; upstream must supply authorized IDs, never free text or document contents.

Pipeline maps only the seven explicit contract states. Missing is UNKNOWN; unsupported is NOT_MODELED. Converted/onboarding/rejected/archived/selected/precontract/withdrawn/on_hold remain external context. The adapter supplies currentPipelineState explicitly, so legacy application.status/candidate identity fallback cannot reinterpret them. No configured aliases or human override can create operational movement.

Interview initial/selection/career/additional are explicit contract types. follow_up/other do not mean additional. Completion requires valid interview/application/candidate IDs, performed status/time, verified fresh neutral evidence bound to the interview, question evidence references and explicit human recommendation. No recommendation alone proves completion. Even completed evidence can only expose a sequential advisory next stage, never skip stages or write a decision.

Event capture passes an empty allowlisted payload and the original timestamp; it records no event. Snapshot composes those event contexts with the pipeline. Identical event IDs are deduplicated; incompatible ones fail closed. application/candidate links and workspace mismatches fail before aggregation. No caller-supplied assessment or engine result is trusted.

Metrics rebuild snapshots from `records: [{candidate, application, events}]`. Repeated application IDs and event IDs shared across different applications are rejected. Missing, invalid, stale or empty history is unknown; all numeric metric/rate fields are null in incomplete context. Known zero is available only within supplied, fully admitted event context; that bounded input is not proof of exhaustive real-world history. Counts/formulas otherwise come exclusively from the original Manager Recruitment Metrics engine. Metrics are reference-only and never official parallel truth.

Freshness uses an explicit asOf plus positive maxAgeMs; no Date.now, synthetic dates or inferred human verification. Evidence preserves original dates and conceptual source owner separately from verified_by. VERIFIED means the supplied metadata meets this offline contract, not that these adapters contacted or authenticated the source.

All views are immutable, require human review, expose empty operationalWrites and disable automatic decisions/hiring/rejection and downstream truth creation. They perform no network, storage, event scheduling or workflow actions. All original engine permitted/blocked transitions are advisory context only.

## Validation and remaining boundaries

Tests cover cross-workspace/subject rejection, duplicate conflict, special external states, scheduled versus completed, injected personal payload/assessment, forbidden requestedUse, unknown counts, freshness, prototype-stage names, exact source hashes and CJS/ESM equivalence. The bundle is imported as a data URL to verify it has no external module dependency; repeat generation is byte-identical, including from another working directory.

Real schema integration, membership administration, multi-user RLS, idle auth/OAuth and Pages/PWA acceptance are not tested or authorized by 2B. Original source defects cannot be repaired here. Human approval of this phase is not a technical test result, commit permission, push permission or deployment permission.

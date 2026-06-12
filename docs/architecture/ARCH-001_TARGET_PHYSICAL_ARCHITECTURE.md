# ARCH-001 Target Physical Architecture

Status: ARCHITECTURE DESIGN / NO CODE SCAN
Date: 2026-06-11

## Purpose

Define the target physical folder architecture for Forge OS after repository governance and runtime governance stabilization.

This is a design document only.

No files were scanned. No files were moved. No imports were rewritten. No implementation was performed.

## Architecture Principle

The target physical architecture must make Forge easier to reason about without breaking the current runtime.

Physical folders should reflect ownership boundaries:

- Platform owns runtime infrastructure.
- Shared owns reusable domain primitives.
- Advisor OS owns advisor-facing commercial workflows.
- Manager OS owns manager/team/career workflows.
- Product Intelligence owns product truth and interpretation.
- Policy Operations owns policy lifecycle and operational work.
- Compensation owns economic interpretation.
- Rule Packs own carrier/channel/rule-specific interpretation.
- Legacy holds compatibility-era surfaces until replaced.

## Target Top-Level Structure

```text
/
  platform/
  shared/
  advisor-os/
  manager-os/
  product-intelligence/
  policy-operations/
  compensation/
  rule-packs/
  docs/
  tests/
  legacy/
```

## Folder Responsibilities

### `platform/`

Owns runtime infrastructure that should be universal across Forge.

Belongs here:

- App shell successor infrastructure.
- Router and route-loader infrastructure.
- Runtime lifecycle management.
- State manager.
- Event bus.
- Render engine.
- Error boundary.
- Logger.
- Analytics runtime.
- Sync orchestration.
- Supabase/runtime service boundary.
- Offline/runtime infrastructure.
- Network, visibility, idle, cache, retry, telemetry, performance, crash, and storage runtime services.

Does not belong here:

- Carrier rules.
- Compensation schedules.
- Advisor workflow decisions.
- Manager coaching logic.
- Product-specific rules.
- Policy business interpretation.

### `shared/`

Owns reusable primitives consumed by more than one domain.

Belongs here:

- Shared commercial event model.
- Shared currency/timeline utilities.
- Shared evidence/provenance contracts.
- Shared schemas and fixtures used across domains.
- General validation helpers.
- Shared decision clarity utilities.
- Shared domain constants that are not carrier-specific.
- Cross-domain entities and normalized data contracts.

Does not belong here:

- Duplicated domain logic.
- Rule-pack-specific interpretation.
- Anything moved here only because it is hard to classify.

### `advisor-os/`

Owns advisor-facing commercial operating workflows.

Belongs here:

- Dashboard/advisor home once replaced by Forge-native shell routes.
- Prospecting workflows.
- Referrals workflows after navigation contract repair.
- Activity/productivity workflows.
- Relationship Intelligence advisor routes.
- NASH conversation/advisor intelligence surfaces.
- Advisor performance/coaching insights consumed by the advisor.
- Command OS advisor interactions.
- Advisor Experience, Benvenu, Clippy, and Candy Crush Experience once implemented.

Does not belong here:

- Manager-only team intelligence.
- Compensation rule interpretation.
- Product truth.
- Policy source-of-record infrastructure.

### `manager-os/`

Owns manager, team, recruitment, candidate, precontract, and career-development intelligence.

Belongs here:

- Manager dashboards.
- Team intelligence.
- Recruitment lifecycle domain.
- Candidate intelligence.
- Interview intelligence.
- Precontract lifecycle intelligence.
- Manager alerts.
- Coaching intelligence.
- Development intelligence.
- Advisor conversion intelligence.
- Manager compensation interpretation only as a consumer of compensation/rule-pack outputs.

Does not belong here:

- Advisor-only workflow screens.
- Carrier-specific compensation schedules.
- Product rules.
- Platform runtime infrastructure.

### `product-intelligence/`

Owns product truth, product interpretation, and product evidence boundaries.

Belongs here:

- Product source registries.
- Product family models.
- Product rule evaluation.
- GMM coverage/event intelligence.
- Vida, GMM, retirement, education, and presentation product intelligence.
- Quote/product comparison intelligence.
- Product evidence packet logic.
- Product unknown-question queues.

Does not belong here:

- Commission calculation.
- Contest interpretation.
- Manager compensation.
- Policy operational tasks unless they are product-truth inputs.

### `policy-operations/`

Owns policy lifecycle and operational execution.

Belongs here:

- Policy import/intake.
- OCR and document classification.
- Policy staging/review.
- Policy search/indexing.
- Policy timeline.
- Policy tasks/follow-ups.
- Renewal operations.
- Policy workspace.
- Operational center.
- Client/policy summaries.
- Policy financial summary as operational view, not compensation authority.

Does not belong here:

- Product truth rules.
- Compensation rule interpretation.
- Advisor behavior scoring except as a consumer.

### `compensation/`

Owns economic interpretation and compensation intelligence.

Belongs here:

- Commission engines.
- Compensation projection engines when evidence/rule snapshots are explicit.
- Contest interpretation as compensation-adjacent domain only when clearly separated from core compensation.
- Manager compensation intelligence.
- Training allowance and professional-development economic interpretation.
- Economic motivation intelligence with client-first boundaries.

Does not belong here:

- Product knowledge.
- Policy operations.
- Core runtime.
- Hardcoded carrier rules that should live in `rule-packs/`.

### `rule-packs/`

Owns carrier/channel/period-specific rules.

Belongs here:

- `smnyl-agency-2026/` as the first validated rule pack.
- Carrier-specific commission schedules.
- Carrier-specific contest rules.
- Channel-specific activity/KPI/promotion rules.
- Rule snapshots.
- Rule pack metadata and validation fixtures.

Rules:

- Rule packs interpret facts.
- Forge Core must not hardcode carrier, channel, compensation, contest, career, promotion, KPI, activity, or recognition logic.
- Historical rule snapshots must remain preserved and must not be silently recalculated.

### `docs/`

Owns architecture, governance, ADRs, discovery, repository migration, runtime reports, product-intelligence documents, and archival material.

Belongs here:

- Architecture reports.
- Runtime reports.
- Repository governance reports.
- ADR working/transition material.
- Discovery documents.
- Product intelligence documentation.
- Archive and superseded materials.

### `tests/`

Owns validation assets.

Belongs here:

- Unit tests.
- Master tests.
- Smoke tests.
- Runtime validation tests.
- Fixture validation tests.
- Migration harness tests.
- Domain acceptance tests.

Long-term target:

- Tests should eventually mirror physical domain ownership, while preserving existing runnable gates during migration.

### `legacy/`

Owns compatibility-era runtime and CRMAddlife surfaces that remain operational while Forge-native architecture replaces them.

Belongs here eventually:

- Legacy CRM shell surfaces.
- Compatibility wrappers.
- Legacy route modules not yet Forge-native.
- Transitional shims that still serve current app behavior.

Rules:

- `legacy/` is not a trash folder.
- Files move here only when their operational role is compatibility, not when ownership is unknown.
- Anything in `legacy/` must have a replacement path or retirement condition.

## Root-Level Policy Summary

Root should remain small and intentional.

Root may contain only:

- Runtime entry points.
- Governance anchors.
- Repository entry points.

Root should not contain:

- Domain engines.
- Discovery reports.
- Migration reports.
- Product intelligence documents.
- Compensation/rule-pack engines.
- Policy operation engines.
- Manager/advisor domain modules except temporary compatibility entry points.

## `app.js` Future Status

Current role:

- Legacy CRMAddlife shell.
- Temporary router shell.
- Compatibility runtime entry point.

Near-term role:

- Keep in root as a runtime entry point.
- Continue to own current boot, auth, navigation, and compatibility wiring until a Forge-native shell exists.
- Support controlled route lazy-loading pilots.

Target replacement:

- A Forge-native platform shell under `platform/`.
- A shell that owns boot, auth/runtime wiring, route loading, lifecycle, and navigation contracts.
- Domain routes loaded through explicit descriptors, not hardcoded static imports.

Long-term fate:

- `app.js` should become either:
  - a thin root entry point that imports the Forge-native shell from `platform/`, or
  - a legacy compatibility module moved under `legacy/` after a replacement root entry point exists.

## Final Target Rule

Forge's physical architecture should make this sentence true:

```text
Root starts Forge. Platform runs Forge. Domains decide. Rule packs interpret. Docs explain. Tests prove.
```


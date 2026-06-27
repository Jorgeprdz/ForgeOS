# REPO-019 Root Surface Governance Audit

Report ID: REPO-019
Status: ARCHITECTURE DISCOVERY / NO EXECUTION
Generated: 2026-06-11T19:48:08.059Z

## Executive Summary

REPO-019 defines the constitutional purpose of the repository root. It does not move files, rewrite links, modify runtime assets or change code.

The root currently contains 727 top-level assets: 717 files and 10 directories. The dominant current pattern is a flat runtime/code surface plus protected governance anchors and residual documentation/legacy artifacts.

Final root definition:

> Root is a protected Repository Entry Surface composed of Runtime Assets, Governance Assets and Repository Entry Points. It is not a general file storage surface and not a domain bucket.

## Question 1: Root Existence Test

| Candidate | Benefits | Risks | Miranda Compliance | Long-Term Scalability | Verdict |
| --- | --- | --- | --- | --- | --- |
| A. File Storage Surface | Easy to drop files quickly. | Becomes ungoverned dumping ground; hides ownership. | Fails; placement is convenience, not evidence. | Fails at scale. | REJECTED |
| B. Platform Surface | Gives technical files an apparent home. | Misclassifies governance, docs and domain evidence as Platform. | Weak; naming replaces ownership evidence. | Fails as domains grow. | REJECTED |
| C. Runtime Surface | Protects app shell and deploy assets. | Excludes legitimate root governance anchors. | Partial; runtime evidence is observable. | Good only for app shell. | PARTIAL |
| D. Governance Surface | Preserves constitutional and operational authority. | Can become excuse for documents to remain root. | Strong if criteria are objective. | Good with protected asset list. | PARTIAL |
| E. Repository Entry Surface | Explains root as the first navigational/operational surface. | Needs strict boundaries to avoid sprawl. | Strong; asks what must be discoverable at root. | Strong. | APPROVED |
| F. Combination Model | Allows runtime, governance and entry assets with distinct rules. | Requires explicit criteria and audits. | Strong; each category must prove root need. | Strongest. | APPROVED |

Verdict: Root should use the Combination Model: Runtime + Governance + Repository Entry Surface.

## Question 2: Root Asset Inventory Summary

| Classification | Count |
| --- | ---: |
| Documentation | 19 |
| Governance Asset | 3 |
| Legacy Artifact | 5 |
| Repository Entry Point | 11 |
| Runtime Asset | 689 |

| Root Status | Count |
| --- | ---: |
| ROOT_ALLOWED | 692 |
| ROOT_OPTIONAL | 19 |
| ROOT_PROHIBITED | 5 |
| ROOT_REQUIRED | 11 |

## Question 3: Constitutional Right To Root

A root asset earns protected status only when removal from root removes a unique repository capability. Current findings:

- Protected root candidates: assets with ROOT_REQUIRED.
- Allowed transitional root assets: executable runtime/code files currently depending on flat root layout.
- Relocation candidates: documentation, legacy artifacts and unknown assets without root-specific capability.

## Question 4: Protected Root Criteria

Final objective criteria for protected root status:

1. Required for runtime entry, browser/PWA deployment or deploy routing.
2. Required for repository-wide governance discovery.
3. Required for constitutional authority discovery.
4. Required for repository navigation or tool behavior from root.
5. Required by external tooling convention at repository root.

Rejected criteria:

- Historical convenience.
- File age.
- File popularity without owner.
- Domain ambiguity.
- It has always been there.

## Question 5: AGENTS.md Audit

| Dimension | Finding |
| --- | --- |
| Constitutional role | Operational governance interpreter for repository behavior. |
| Runtime role | None; it is not executed by Forge runtime. |
| Governance role | Strong; it defines agent workflow, protected surfaces and Forge operating principles. |
| Discoverability role | Strong; root placement makes instructions visible before domain navigation. |
| Classification | ROOT_REQUIRED |

Verdict: AGENTS.md has earned protected root status as an operational governance asset.

## Question 6: Constitution And Build Tree Audit

| Asset | Root Necessity | Governance Necessity | Alternate Placement Viability | Classification |
| --- | --- | --- | --- | --- |
| FORGE_CONSTITUTION_V3.md | High | Canonical constitutional authority. | Possible mirror under docs, but root anchor should remain canonical. | ROOT_REQUIRED |
| FORGE_MASTER_BUILD_TREE.md | High | Canonical build/navigation map. | Possible generated copy under docs, but root anchor should remain canonical until owner registry replaces it. | ROOT_REQUIRED |

## Question 7: Adversarial Attack

Attack: Root should contain nothing except runtime files.

This fails for Forge because root is also the pre-domain discovery surface for repository-wide governance. Removing governance assets from root would make runtime visible but authority hidden. That improves technical neatness while weakening Miranda compliance.

Evidence chain:

1. REPO-004 rejected root as Platform-only.
2. REPO-008 through REPO-017 relied on protected root anchors for AGENTS, Constitution and Build Tree references.
3. Harness hardcodes protected root assets because moving them would create governance ambiguity.
4. Current validation has zero broken links with governance anchors still protected.

Verdict: Runtime-only root is too narrow.

## Question 8: Miranda Test

| Model | What Breaks | Miranda Result |
| --- | --- | --- |
| A. Everything | Ownership disappears; root becomes a dumping ground. | FAIL |
| B. Runtime only | Governance discoverability weakens; constitutional anchors become hidden. | FAIL |
| C. Governance only | App shell and deploy entrypoints lose natural root placement. | FAIL |
| D. Runtime + Governance + Entry Points | Each root asset must prove unique surface need. | PASS |

## Question 9: Full Root Asset Classification Table

| Asset | Kind | Classification | Root Status | Unique Capability Test | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `_redirects` | File | Runtime Asset | ROOT_REQUIRED | Deployment redirect behavior is expected at publish/root surface. | Protected runtime/deploy asset. |
| `.antigravitycli` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `.git` | Directory | Repository Entry Point | ROOT_REQUIRED | Git repository metadata required by repository operations. | Protect. |
| `.gitignore` | File | Repository Entry Point | ROOT_REQUIRED | Git ignore rules require repository-root placement for intended scope. | Protected root asset. |
| `accessibility-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `accident-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `accident-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `action-resolver-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `actividad.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `activity-feed-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `activity-feed.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `activity-stream-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `adaptive-message-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `adaptive-outreach-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `adaptive-question-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `adaptive-script-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `adr` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `advisor-activity-timeline.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `advisor-alert-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `advisor-monitor-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `advisor-performance-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `advisor-sales-dna.entity.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `advisor-score-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `advisor-style-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `advisor-style.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `AGENTS.md` | File | Governance Asset | ROOT_REQUIRED | Repository-wide operational instructions are auto-discoverable from root. | Protected root asset. |
| `ai-context-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ai-first-contact-message-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ai-orb-widget.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ai-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ai-sales-coach-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ai-service.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ai-task-suggestion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `analytics-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `animation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `app-shell-manager.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `app.js` | File | Runtime Asset | ROOT_REQUIRED | Current app shell/PWA runtime expects this file at root. | Protected runtime asset. |
| `appointment-calendar-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `appointment-followup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `appointment-opportunity-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `assistant-memory-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `auth-guard.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `auto-task-generator-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `base-repository.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `broken-link-report.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `buying-signals-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cache-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `candidate-assessment-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `candidate-assessment-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `candidate-coachability-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `candidate-coachability-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `candidate-hard-factors-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `candidate-hard-factors-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `candidate-market-quality-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `candidate-market-quality-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `candidate-vital-factors-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `candidate-vital-factors-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `cartera-events.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-import-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-normalizer.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-repository.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-service.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-state.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-utils.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-validator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera-view.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `cartera.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `catastrophic-illness-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `catastrophic-illness-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `center-of-influence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `channel-adaptation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `channel-performance-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `client-engagement-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `client-engagement-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `clipboard-action-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `close-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `close-readiness-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `close-strategy-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `comisiones-rules-gmm.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `comisiones-utils.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `comisiones.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `comisiones.js.bk` | File | Legacy Artifact | ROOT_PROHIBITED | No unique root capability established; artifact appears historical or compatibility residue. | Candidate for legacy/archive review. |
| `command-execution-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-palette-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-palette-ui.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-palette.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-palette.store.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-palette.tsx` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-parser-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-registry.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-search-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-shortcuts-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `command-suggestion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `commission-projection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `commissionable-amount-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `communication-channel-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `communication-mismatch-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `communication-style-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `Concursos SMNYL` | File | Legacy Artifact | ROOT_PROHIBITED | No unique root capability established; artifact appears historical or compatibility residue. | Candidate for legacy/archive review. |
| `concursos.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `contact-attempt-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `contact-channel.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `contact-response-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `contextual-suggestion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `conversion-metrics-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `copilot-suggestion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `core_domain-events.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `core_event-bus.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `core-app-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `core-event-bus.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `coverage-evaluation-foundation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `coverage-foundation-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `coverage-intelligence-orchestrator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `coverage-orchestrator-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `crash-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `Crmaddlife.zip` | File | Legacy Artifact | ROOT_PROHIBITED | No unique root capability established; artifact appears historical or compatibility residue. | Candidate for legacy/archive review. |
| `csv-parser-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `currency-normalization-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `daily-points-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `dashboard-executive.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `dashboard-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `dashboard-widget-card.tsx` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `dashboard.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `db.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `decision-appendix-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `design-system-preview.html` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `design-tokens.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `discovery-insights-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `discovery-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `discovery-product-alignment-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `discovery-summary-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `discovery-to-presentation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `dna-coaching-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `dna-script-strategy-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `docs` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `document-classification-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `dom-sanitizer.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `domain-events.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `domain-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `domain-store.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `drag-drop-policy-zone.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `duplicate-destination-report.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `dynamic-cash-value-projection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `education-cost-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `education-paths-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `entity-resolver-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `error-boundary.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `event-advisor-review-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `event-advisor-review-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `event-benefit-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `event-bus-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `event-classification-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `event-classification-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `event-client-review-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `event-client-review-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `event-log-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `event-system.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `evidence-collection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `evidence-collection-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `excel-parser-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `exchange-rate-cache-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `false-confidence-protection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `false-confidence-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `feature-flags.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `field-confidence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `financial-pyramid-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `financial-pyramid-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `financial-pyramid-story-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `financial-responsibility-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `financial-responsibility-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `financial-risk-score-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `financial-story-task-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `financial-utils.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact-ai-suggestion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact-dashboard.viewmodel.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact-delivery-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact-objections.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact-options-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact-script-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact-tone-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `first-contact.entity.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `fixture-validation-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `fixtures` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `followup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup-message-context-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup-next-date-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup-overdue-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup-recommendation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup-reminder-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup-type.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `followup.entity.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `FORGE_CONSTITUTION_V3.md` | File | Governance Asset | ROOT_REQUIRED | Canonical constitutional authority remains directly discoverable from root. | Protected root asset. |
| `FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_GMM_EVIDENCE_PACKET_VALIDATION.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_GMM_RED_TEAM_RETEST_REPORT.txt` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_GMM_SOURCE_VALIDATION_WORKFLOW.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_IMPLEMENTATION_READINESS_001C_TRUTH_VALIDATION_RESULT_CONTRACT.txt` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_LARIZA_PEDRO_CAMARENA_TEST.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_MANAGER_OS_BLUEPRINT.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_MASTER_BUILD_TREE.md` | File | Governance Asset | ROOT_REQUIRED | Canonical build/navigation tree remains directly discoverable from root. | Protected root asset. |
| `FORGE_REPOSITORY_MIGRATION_PLAN.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_UDI_PROJECTION_VALIDATION_REPORT.txt` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `FORGE_VALIDATION_REQUIREMENTS_REPORT.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `forge-ai-connector-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-ai-connector.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-ai-guardrails-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-ai-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-build-tree-status.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-full-inventory.txt` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `forge-global-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-gmm-real-case-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-gmm-sprint-2-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-gmm-sprint-3-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-gmm-sprint-4-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-imagina-ser-client-presentation-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-master-acceptance-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-presentation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-rate-cache.json` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-schema-reporter.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-semantic-risk-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `forge-shared-ave-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `forge-vida-mujer-advisor-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `future-currency-value-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ghosting-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ghosting-status-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `gmm-advisor-review-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `gmm-client-review-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `gmm-out-of-pocket-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `gmm-policy-caratula-summary-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `gmm-quote-parser.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `gmm-quote-summary-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `google-calendar-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `google2698d2deff613be9.html` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `health-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `Hoja de trabajo - 4.5% UDI.xlsx` | File | Legacy Artifact | ROOT_PROHIBITED | Evidence/archive value may exist, but no root capability disappears if relocated. | Candidate for evidence/archive placement review. |
| `hospitalization-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `hospitalization-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `hot-market-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `human-review-routing-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `human-review-routing-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `icon-192.png` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `icon-512.png` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `idle-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-advisor-analysis-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-article-151-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-article-185-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-banxico-integration-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `imagina-ser-client-presentation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-contribution-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-decision-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-fiscal-bag-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-fiscal-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `imagina-ser-fiscal-router-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-fiscal-slide-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-future-mxn-bridge.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-happy-numbers-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-human-language-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `imagina-ser-objection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-ocr-extractor.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-presentation-prompt-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-real-quote-validation.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-retirement-fund-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-scenario-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-variant-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `imagina-ser-variant-fiscal-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `import-progress-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `in-app-notification-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `index.html` | File | Runtime Asset | ROOT_REQUIRED | Current app shell/PWA runtime expects this file at root. | Protected runtime asset. |
| `interview-evidence-fixture-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `introduction-message-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `inventory-schema-validation-report.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `lead-temperature-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `life-event-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `life-event-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `life-expectancy-projection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `line-of-business-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `live-communication-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `live-dashboard-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `live-notification-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `live-operational-state-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `logger.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `manager-alert-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `manager-broadcast-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `manager-coaching-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `manager-feed-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `manager-notification-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `manager-role-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `manifest.json` | File | Runtime Asset | ROOT_REQUIRED | Current app shell/PWA runtime expects this file at root. | Protected runtime asset. |
| `market-data-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `market-evidence-fixture-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `mass-import-mapping-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `mass-import-preview-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `mass-import-validation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `maternity-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `maternity-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `memory-manager.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `migration-inventory.json` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `migration-validation-report.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `module-lifecycle.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `momentum-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `monthly-revenue-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `motion-principles.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `multi-label-event-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `multi-label-event-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `mutation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nano-banana-icon-system-prompt.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-advisor-performance-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-advisor-performance-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-coaching-insight-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-coaching-insight-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-combat-intelligence-report-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-combat-intelligence-report-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-combat-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-combat-orchestrator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-core-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-council-orchestrator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-followup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-integration-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-intent-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-intent-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-learning-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-learning-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-manager-alert-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-manager-alert-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-master-acceptance-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-master-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-master-intelligence-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-memory` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `nash-memory-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-memory-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-message-recommendation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-next-best-action-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-next-best-action-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-personality-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-personality-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-prospect-context-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-team-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `nash-team-intelligence-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-v03-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `nash-v04-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `needs-discovery-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `network-manager.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `neural-glow.css` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `next-best-question-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `next-best-question-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `notification-orchestrator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `notification-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `notification-queue-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `objection-battle-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `objection-classifier-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `objection-intent-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `objection-memory-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `objection-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `objection-resolution-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `objection-response-strategy-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ocr-result-cache.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `offline-sync.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `operational-button.tsx` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `operational-card.tsx` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `operational-colors.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `operational-dashboard-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `operational-feed-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `operational-shell.store.ts` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `operational-sync-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `opportunity-detector-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `optimistic-mutation-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `optional-coverage-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `optional-coverage-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `organization-rules-fixture-validation-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `orvi-client-presentation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `orvi-client-report-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `orvi-decision-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `orvi-event-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `orvi-guaranteed-value-timeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `orvi-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `orvi-mxn-conversion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `orvi-mxn-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `orvi-objection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `orvi-ocr-extractor.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `orvi-wait-vs-cancel-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `outreach-channel.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `outreach-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ovelay-manager.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `overdue-task-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `payment-frequency-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `payment-mode-coaching-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `performance-monitor.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `performance-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `phone-call-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `pipeline-stage-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-activity-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-ai-insights-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-ai-parser.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-auto-approval-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-auto-save-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-batch-processing-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-client-summary-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-context-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-core-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-detail-alert-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-detail-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-detail-view-model.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-document-classifier.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-document-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-duplicate-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-field-confidence-map.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-filter-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-financial-summary-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-followup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-human-review-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-import-dashboard-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-import-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-import-errors-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-import-metrics-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-import-queue.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-import-summary.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-indexing-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-ingestion-orchestrator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-last-contact-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-live-state-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-metadata-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-normalization-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-ocr-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-operational-center-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-quick-actions-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-relationship-score-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-renewal-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-renewal-status-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-review-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-review-ui-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-risk-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-schema-validator-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-search-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-side-by-side-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-smart-sort-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-staging-cache.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-staging-status-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-status-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-storage-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-summary-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-task-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-task-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-timeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-timeline-event.factory.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-timeline-group-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-timeline-query-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-timeline-view-model.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-timeline.repository.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-timeline.types.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-validation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `policy-workspace-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `precontract-activity-fixture-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `predictive-dashboard.tsx` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `presentation-input-context-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `presentation-input-pipeline.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `primary-risk-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `product-detection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `product-knowledge-link-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `product-schema-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `projection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `projection-milestone-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `proposal-family-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `proposal-family-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `prospeccion.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-next-action-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-personality-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-personality.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-pipeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-profile-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-score-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-segment-performance-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect-status.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospect.entity.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `prospecting-dashboard.viewmodel.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `push-notification-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `query-cache.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `query-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `question-answer-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `question-session-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `question-style-match-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quick-action-executor-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quick-actions-bar.tsx` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quick-actions-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quotation-currency-bridge.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quotation-extraction-result.entity.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quotation-field-normalizer.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quotation-input.entity.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `quote-to-policy-comparison-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ranking-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `reactivation-strategy-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `realtime-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `realtime-task-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `recruitment-fixture-validation-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `reference-rewrite-plan.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `referidos.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-ai-followup.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-card-ui.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-color-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-followup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-opportunity-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-opportunity-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `referral-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-prompt-builder.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-score-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-smart-actions.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-source.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-temperature-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referral-timeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referrals-board-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `referrals-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-health-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-health-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `relationship-master-acceptance-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `relationship-master-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-memory-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-next-action-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-next-action-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `relationship-opportunity-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-opportunity-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `relationship-review-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-review-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `relationship-timeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `relationship-timeline-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `render-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `renewal-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `responsive-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `retirement-future-udi-projection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `retirement-future-udi-projection-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `retirement-presentation-scenario-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `retry-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `revenue-forecast-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `revenue-optimization-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `risk-story-context-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ROOT_DOCS_MIGRATION_BATCH_1_MOVE_MAP.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `ROOT_DOCS_MIGRATION_BATCH_2_MOVE_MAP.md` | File | Documentation | ROOT_OPTIONAL | Documentation value remains, but no unique root capability established. | Candidate for docs/archive/domain placement review. |
| `route-transition-manager.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-coach-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-context-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna-evolution-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna-insight-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna-learning-event.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna-match-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna-profile-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna-recommendation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna-stage-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-dna.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-learning-event.entity.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-script-types.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sales-tone.constants.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `schema-field-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `schemas` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `script-adaptation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `scripts` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `search-index-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `search-quick-actions-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `search-ranking-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `secure-storage.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `seen-but-no-reply-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-client-presentation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-decision-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-education-comparison-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-education-options-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `segu-beca-meaningful-numbers-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-mxn-appendix-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-mxn-timeline-clean-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `segu-beca-ocr-intake-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `semantic-navigation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `service-worker.js` | File | Runtime Asset | ROOT_REQUIRED | Current app shell/PWA runtime expects this file at root. | Protected runtime asset. |
| `shared-ave-confidence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-confidence-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-death-benefit-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-death-benefit-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-eligibility-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-growth-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-growth-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-portfolio-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-portfolio-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-rescue-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-rescue-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-type-inference-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-ave-type-inference-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-banxico-rate-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-banxico-rate-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-benefit-hierarchy-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-client-language-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-clp-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-clp-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `shared-currency-projection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-decision-appendix-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-decision-clarity-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-decision-score-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-document-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-education-cost-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-education-paths-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-financial-return-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-human-financial-language-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-meaningful-numbers-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-mxn-timeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-objection-shield-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-policy-currency-timeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-policy-currency-timeline-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `shared-premium-growth-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-price-placement-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-projection-scenarios-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-protection-efficiency-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-recovery-analysis-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `shared-tax-profile-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-agenda-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-field-detection-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-followup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-followup-message-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-header.tsx` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-notification-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-outreach-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smart-referrals-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-ai-coach-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-ai-presence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-alerts-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-anomaly-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-automation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-bonos-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-cancelaciones-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-comisiones-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-comisiones-gmm.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-comisiones-vida.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-command-center-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-command-palette-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-concursos-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-conteo-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-cross-sell-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-decision-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-executive-dashboard-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-followup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-forecast-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-goals-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-health-score-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-insights-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-kpi-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-leaderboard-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-neural-glow-engine` | File | Legacy Artifact | ROOT_PROHIBITED | No unique root capability established; artifact appears historical or compatibility residue. | Candidate for legacy/archive review. |
| `smnyl-neural-glow-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-operating-system-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-opportunity-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-performance-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-persistencia-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-pipeline-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-prima-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-produccion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-productividad-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-productos-gmm.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-productos-vida.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-reminders-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-renovaciones-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-retencion-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-risk-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-streak-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-time-block-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `smnyl-training-allowance-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `solucionline-retirement-parser.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `source-ownership-registry-validation-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `source-ownership-registry.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `src` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `staging-cleanup-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `staging-review-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `state-manager.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `storage-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `storage-queue.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `storage-validator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `store.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `styles.css` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `supabase-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `surgery-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `surgery-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `sw-cache-config.js` | File | Runtime Asset | ROOT_REQUIRED | Current app shell/PWA runtime expects this file at root. | Protected runtime asset. |
| `sync-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sync-orchestrator.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `sync-queue-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `task-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `task-feed-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `task-priority-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `task-quick-action-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `team-activity-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `team-dashboard-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `team-momentum-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `team-structure-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `telemetry.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `territoriality-intelligence-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `territoriality-smoke-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `tests` | Directory | Repository Entry Point | ROOT_ALLOWED | Top-level navigation boundary for a governed repository domain or tooling area. | Allow as top-level directory. |
| `tone-performance-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `tone-profile-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `ui-render-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `universal-command-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `universal-filters-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `universal-search-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `utils.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-client-explanation-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-client-presentation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-client-presentation-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `vida-mujer-coverage-status-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-coverage-status-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-event-benefits-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-financial-correction-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-financial-fixture-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-knowledge-extractor-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-knowledge-extractor.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-master-test.js` | File | Runtime Asset | ROOT_ALLOWED | Executable validation entry may currently rely on root-relative module layout. | Allow until test/code migration plan exists. |
| `vida-mujer-pdf-ave-integration-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-pdf-intake-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-protected-diseases-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-protected-diseases-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-rule-consistency-report.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-status.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `vida-mujer-survival-schedule-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `virtual-list-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `virtual-list.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `visibility-runtime.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `warm-market-segmentation-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `whatsapp-action-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |
| `whatsapp-link-engine.js` | File | Runtime Asset | ROOT_ALLOWED | Executable code may currently rely on root-relative module layout. | Allow temporarily; require future code-domain migration plan. |

## Question 10: Final Verdict

Root Surface Definition:

> The Forge repository root is a protected Repository Entry Surface. It may contain only assets that need root-level discoverability, execution, deployment, governance authority or repository-tool convention.

Protected Root Categories:

- Runtime Assets required by current app shell or deployment.
- Governance Assets required for repository-wide authority or agent operation.
- Repository Entry Points required for navigation, tooling or top-level domain access.

Relocation Candidates:

- Root documentation that is not a governance anchor.
- Legacy artifacts and backups.
- Evidence files without root execution need.
- Generated migration reports that should live under governed report directories.
- Unknown assets without observable root necessity.

Governance Recommendations:

1. Maintain a protected root registry.
2. Require new root files to declare category and owner.
3. Treat root documentation as prohibited unless it is a governance anchor.
4. Keep runtime/code files root-allowed only until a code-domain migration plan exists.
5. Run root-surface audit after each migration wave.

Confidence score: 0.89

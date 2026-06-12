# RUNTIME-001 Root Runtime Cartography

Report ID: RUNTIME-001
Status: ARCHITECTURE DISCOVERY / NO EXECUTION

## Executive Summary

RUNTIME-001 inventories 689 root runtime assets and tests whether flat root runtime is constitutionally justified. No files were moved, renamed, rewritten or modified.

Final assessment: current flat runtime is `TEMPORARY`. A small protected runtime shell must remain root, but most runtime assets are only root-allowed until dependency mapping and domain migration plans exist.

## Question 1: Runtime Inventory

| Group | Count |
| --- | ---: |
| CSS | 2 |
| HTML | 3 |
| JSON | 1 |
| JavaScript | 676 |
| Manifest Files | 1 |
| Platform Assets | 2 |
| Runtime Config | 3 |
| Service Workers | 1 |

Extension evidence: JavaScript/TypeScript/TSX/HTML/CSS/JSON/PNG files account for 688 assets; `_redirects` is counted as runtime deploy config, producing the 689 runtime asset count established by REPO-019.

## Question 2: Root Necessity Test

| Runtime Category | Root Classification | What Breaks If Relocated | Reasoning |
| --- | --- | --- | --- |
| Service Workers | ROOT_REQUIRED | Offline/PWA registration and caching can break. | Browser and app shell expect service worker paths at root unless registration changes. |
| Manifest Files | ROOT_REQUIRED | PWA identity/icon loading can break. | Manifest is linked from root HTML shell. |
| Runtime Config | ROOT_REQUIRED / ROOT_ALLOWED | Deploy redirects, cache config or local caches can break depending on asset. | `_redirects` and `sw-cache-config.js` are root-sensitive; generated caches need separate policy. |
| HTML | ROOT_REQUIRED for `index.html`, ROOT_ALLOWED for previews/verification files | App entry or verification pages can break. | Root HTML must be inspected individually. |
| CSS | ROOT_ALLOWED | App styling may break if imported by root HTML. | `styles.css` should not move without shell dependency mapping. |
| JSON | ROOT_ALLOWED | Runtime caches/config may break if import/read paths assume root. | Need consumer graph before movement. |
| JavaScript | ROOT_ALLOWED | Relative imports and script references can break broadly. | Most root JS is allowed temporarily, not constitutionally required. |
| Platform Assets | ROOT_ALLOWED | Icons can break if manifest references root paths. | Root need depends on manifest paths. |
| Unknown Runtime | ROOT_ANTI_PATTERN | Unknown until owner/consumer is proven. | Runtime without owner is governance debt. |

## Question 3: Legacy Detection

| Signal | Count |
| --- | ---: |
| Legacy Candidate Count | 22 |
| Experimental Candidate Count | 5 |
| Unknown Ownership Count | 154 |

Legacy detection is candidate-level only. It uses observable naming, REPO-004 CRMAddlife evidence and root-shell compatibility indicators. It does not authorize deletion or movement.

## Question 4: Domain Ownership Mapping

| Owner | Count |
| --- | ---: |
| Advisor OS | 114 |
| Manager OS | 68 |
| Platform | 25 |
| Product Intelligence | 168 |
| Repository Governance | 32 |
| Shared Intelligence | 128 |
| Unknown | 154 |

Full ownership map: `docs/architecture/runtime/RUNTIME-001_RUNTIME_OWNERSHIP_MAP.md`.

## Question 5: Flat Root Test

Attack: All runtime assets should remain in root because moving them risks breaking the application.

Verdict: `TEMPORARY`.

The risk is real, but it proves that movement requires dependency mapping, not that root ownership is permanent. The current flat root structure is an operational constraint inherited from active app shell and relative-import patterns. It is not constitutional architecture.

## Question 6: Runtime Classification Model

See `docs/architecture/runtime/RUNTIME-001_RUNTIME_CLASSIFICATION_MODEL.md`.

## Question 7: High-Risk Root Assets

| # | Asset | Owner | Runtime Class | Review | Reason |
| ---: | --- | --- | --- | --- | --- |
| 1 | `actividad.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 2 | `cartera-import-engine.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 3 | `cartera-normalizer.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 4 | `cartera-service.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 5 | `cartera-state.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 6 | `cartera-utils.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 7 | `cartera-validator.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 8 | `cartera-view.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 9 | `cartera.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 10 | `dashboard.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 11 | `design-system-preview.html` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 12 | `icon-192.png` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 13 | `icon-512.png` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 14 | `nano-banana-icon-system-prompt.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 15 | `styles.css` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 16 | `accessibility-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 17 | `action-resolver-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 18 | `adaptive-message-builder.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 19 | `adaptive-script-builder.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 20 | `animation-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 21 | `buying-signals-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 22 | `cartera-events.js` | Shared Intelligence | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 23 | `cartera-repository.js` | Repository Governance | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 24 | `center-of-influence-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 25 | `channel-adaptation-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |

## Question 8: Miranda Test

Statement: Root runtime organization should follow observable dependency requirements, not developer preference.

Verdict: `PASS`.

Evidence chain:

1. REPO-004 showed app shell/PWA assets have observable root dependency evidence.
2. REPO-019 established root as Runtime + Governance + Entry surface, not file storage.
3. Current runtime root includes hundreds of assets whose root necessity is not proven by this audit.
4. Therefore root movement must be gated by consumer/import evidence, not aesthetic preference.

## Question 9: Next Surgical Targets

| Candidate | Why Selected | Risk Level | Expected Knowledge Gain |
| --- | --- | --- | --- |
| `app.js` dependency map | Central shell and protected root asset. | HIGH | Reveals current runtime graph and no-move constraints. |
| `index.html` / PWA shell map | Root HTML ties manifest, service worker and app shell. | HIGH | Separates true root-required assets from shell dependencies. |
| `core-event-bus.js` / `core_event-bus.js` / `core_domain-events.js` | Duplicate-looking core event files. | MEDIUM | Clarifies Platform core vs legacy duplicates. |
| `cartera*.js` cluster | Large legacy/operational cluster with likely app shell dependencies. | MEDIUM | Identifies CRMAddlife operational inheritance and domain owner. |
| `policy-*` cluster | Large product/operations cluster with missing allowed owner taxonomy. | MEDIUM | Tests whether Runtime ownership model needs Policy Operations owner. |

## Question 10: Final Verdict

Runtime Cartography Summary: Root contains a protected shell plus a large temporary flat runtime.

Runtime Ownership Summary: Platform and domain owners can be inferred for many assets, but a meaningful Unknown set remains and should be resolved before movement.

Legacy Risk Assessment: Legacy candidates are concentrated in PWA shell, CRMAddlife-branded UI/runtime clusters and transitional operational files.

Root Runtime Assessment: Current flat root is `TEMPORARY`, not permanent architecture.

Confidence Score: 0.82

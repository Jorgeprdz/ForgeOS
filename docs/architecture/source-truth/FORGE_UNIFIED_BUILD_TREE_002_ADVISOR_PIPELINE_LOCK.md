# Forge Unified Build Tree 002 — Advisor Pipeline Lock

Status: UNIFIED_BUILD_TREE_AMENDMENT / PRODUCTION_ACCEPTED / LOCKED

Date: 2026-07-31

Amends:

- `FORGE_MASTER_BUILD_TREE.md`
- `docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md`
- `docs/architecture/source-truth/FORGE_CURRENT_IMPLEMENTED_BUILD_TREE_001.md`

This amendment is authoritative for the Advisor OS Productive Pipeline Stage branch. Historical tree content remains preserved; conflicting older statuses such as `preview-only`, `persistence blocked` or `stage writer blocked` are superseded for 067G17B4.

## Status Legend

- 🟢 CLOSED / BUILT / VERIFIED / PRODUCTION ACCEPTED
- 🟡 PARTIAL / ACTIVE
- 🔵 PLANNED / SCOPED
- 🔴 BLOCKED / FORBIDDEN REGRESSION
- ⚫ RETIRED / DEFERRED

```text
🟢 ADVISOR OS / PRODUCTIVE PIPELINE
│
├── 🟢 Canonical Material 3 Runtime
│   ├── 🟢 Public route: /static-preview/forge-alive/?nav=pipeline
│   ├── 🟢 Authenticated Google session authority
│   ├── 🟢 Productive prospect list and create flow
│   ├── 🟢 Prospect administration actions
│   ├── 🟢 Context journal and Timeline
│   └── ⚫ Legacy UI and legacy service worker retired
│
├── 🟢 067G17B4 Stage Persistence Authority
│   │
│   ├── 🟢 Stage Mutation Entry
│   │   └── Productive card Stage select
│   │
│   ├── 🟢 Runtime Authority
│   │   ├── pipeline-stage-rpc-authority.js
│   │   ├── one mutation authority
│   │   ├── fail-closed allowed stages
│   │   └── confirmation required before UI success
│   │
│   ├── 🟢 Database Authority
│   │   ├── forge_pipeline_update_prospect_stage RPC
│   │   ├── auth.uid() owner validation
│   │   ├── prospects.status canonical write
│   │   └── confirmed prospect row returned
│   │
│   ├── 🟢 Evidence Authority
│   │   ├── prospect_timeline_events append-only ledger
│   │   ├── STAGE_CHANGED event
│   │   ├── digest integrity
│   │   └── pgcrypto search-path repair
│   │
│   ├── 🟢 In-Place Commit
│   │   ├── same card DOM identity retained
│   │   ├── select, dataset, label and accent updated
│   │   ├── zero AUTH_LOADING during save
│   │   ├── zero auth refresh events during save
│   │   ├── zero card displacement
│   │   └── zero scroll jump
│   │
│   ├── 🟢 Filter Authority
│   │   ├── pipeline-stage-filter-authority.js
│   │   ├── Source filter in place
│   │   ├── Stage filter in place
│   │   ├── combined filter in place
│   │   ├── empty state and count reconciliation
│   │   ├── same card nodes reused
│   │   └── no MutationObserver loop
│   │
│   ├── 🟢 Deferred Reconciliation
│   │   ├── route exit
│   │   └── tab backgrounding
│   │
│   └── 🟢 Acceptance
│       ├── Supabase authenticated transition PASS
│       ├── Timeline event PASS
│       ├── rollback integrity PASS
│       ├── real interaction PASS
│       ├── mobile interaction PASS
│       ├── Chromium stability PASS
│       ├── mobile/tablet/desktop visual diagnostic PASS
│       └── Pages exact SHA 5fca4409457022c59c04937da52de83488a352e2 PASS
│
├── 🔴 Forbidden Regressions
│   ├── 🔴 preview-only Stage mutation
│   ├── 🔴 second Stage mutation listener
│   ├── 🔴 generic update path without RPC confirmation
│   ├── 🔴 stale renderer state overwriting confirmed Stage
│   ├── 🔴 module or card reconstruction during save
│   ├── 🔴 authentication refresh during save
│   ├── 🔴 Source mutation caused by Stage change
│   ├── 🔴 filter rebuild from stale prospect memory
│   └── 🔴 legacy UI becoming a public authority
│
└── 🔵 Separate Future Capabilities
    ├── 🔵 Additional Pipeline stages require explicit registry change
    ├── 🔵 Stage-driven NBA remains a separate authority
    ├── 🔵 Automatic task or appointment creation remains unauthorized
    ├── 🔵 Automatic WhatsApp send remains unauthorized
    └── 🔵 Activity and Reports UI integration remain separate workstreams
```

## Source Truth

- `docs/architecture/source-truth/PIPELINE_STAGE_PERSISTENCE_IN_PLACE_CLOSURE_067G17B4.md`
- `docs/evidence/PIPELINE_STAGE_PERSISTENCE_IN_PLACE_CERTIFICATE_067G17B4.md`
- PR #33, PR #35 and PR #37.

## Lock

`UNIFIED_TREE_ADVISOR_PIPELINE_STAGE_STATUS=🟢 PRODUCTION_ACCEPTED`

`067G17B4=LOCKED`

# REP — Universal Reporting System Roadmap 001

```text
ROADMAP_STATUS=IMPLEMENTED_PENDING_ACCEPTANCE
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
SOURCE_PERFORMANCE_CHECKPOINT=PERF-06_CLOSED
NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION
NEXT_BRANCH=feature/universal-reporting-kernel-foundation
```

## Guiding sequence

The kernel and universal contracts are built before domain adapters and surface
adapters. No provider is permitted to redefine universal periods or comparison
semantics.

## REP-00 — Tree and roadmap registration

**Goal:** record the Performance checkpoint and establish the universal
reporting authority in Build Tree, Unified Tree and Roadmap Lock.

**Deliverables:**

- Performance handoff document;
- universal reporting decision;
- REP roadmap;
- synchronized tree blocks;
- audit and closure evidence.

**Mutation boundary:** documentation only.

## REP-01 — Universal Reporting Kernel Foundation

**Goal:** establish the domain-neutral runtime shell.

**Contracts:**

- `universal-reporting-kernel.v1`;
- report request identity;
- provider registry;
- one-time authority binding;
- one canonical `asOf`;
- deterministic request key;
- immutable outputs;
- no UI, persistence or domain measure ownership.

**Next branch:** `feature/universal-reporting-kernel-foundation`.

## REP-02 — Universal Period Resolver and Calendar Policy

**Goal:** resolve semantic periods into exact date ranges.

**Required periods:**

- TODAY;
- WTD, MTD, QTD, YTD and FYTD;
- calendar week, month, two-month period, quarter, half-year, year and two-year;
- rolling 7, 30, 90 and 365 days;
- rolling 12 months;
- custom range.

**Required policies:**

- IANA time zone;
- week start;
- calendar year;
- configurable fiscal-year start;
- leap-year handling;
- partial current period;
- inclusive range semantics;
- canonical identifiers that avoid “bianual” ambiguity.

## REP-03 — Report Definition and Provider Port

**Goal:** define what a report asks for without coupling to a domain.

**Provider capabilities:**

- identify provider and version;
- declare dimensions and measures;
- validate a provider request;
- read an immutable report slice;
- expose exclusions and provenance;
- declare maximum slice range and batching capabilities.

**Boundary:** providers do not own universal period resolution.

## REP-04 — Universal Report Model and Aggregation Runtime

**Goal:** combine provider slices into one universal model.

**Universal model:**

```text
reportId
definitionId
providerId
period
asOf
dimensions
measures
series
totals
exclusions
provenance
authority
```

**Runtime responsibilities:**

- deterministic batching;
- slice continuity;
- aggregation consistency;
- unit and measure compatibility;
- immutable output;
- no invented zeroes for unavailable facts.

## REP-05 — Comparison and Baseline Engine

**Goal:** compare governed reports without domain-specific duplication.

**Comparison types:**

- previous period;
- previous year same period;
- period over period;
- year over year;
- target;
- budget;
- custom baseline.

**YTD comparison:** current YTD compares against the same elapsed calendar or
fiscal interval in the comparison year.

## REP-06 — Performance Report Provider

**Source:** accepted Performance read composition and read models.

**Measures:**

- points;
- target;
- progress;
- eligible activities;
- activity mix;
- days meeting or exceeding target;
- exclusions and corrections.

**Boundary:** Performance remains policy authority, not reporting authority.

## REP-07 — Commissions Report Provider

**Measures planned:**

- gross commission;
- paid commission;
- pending commission;
- adjustments;
- bonuses;
- chargebacks or recoveries;
- payment status.

**Authority prerequisite:** official commission source and payment evidence.

## REP-08 — Portfolio Report Provider

**Measures planned:**

- active policies;
- premium;
- renewals;
- cancellations;
- persistency;
- product and carrier mix;
- portfolio growth.

**Authority prerequisite:** official policy and portfolio source truth.

## REP-09 — Activity Report Provider

**Measures planned:**

- observed and eligible activities;
- activity counts by type;
- lifecycle and evidence distribution;
- correction and reversal exclusions;
- unique entities and active days.

**Source:** frozen Activity v1 foundation.

## REP-10 — Pipeline Report Provider

**Measures planned:**

- prospects by state;
- appointments;
- applications;
- conversions;
- stage movement;
- aging and stalled opportunities.

**Authority prerequisite:** accepted Pipeline state and transition contracts.

## REP-11 — Export and Delivery Adapters

**Adapters planned:**

- PDF;
- CSV;
- spreadsheet;
- print-safe document;
- machine-readable JSON envelope.

**Boundary:** exports format accepted universal reports; they do not query
domains or recalculate measures.

## REP-12 — Reporting Surface Adapter Contract

**Goal:** create framework-neutral payloads for tables, charts, summaries,
filters and comparisons.

**Boundary:** no React component, route, design token or navigation mutation.

## UI-REP-01 — Reporting Surface Integration

Begins only after REP-12 is accepted and the UI migration freeze is lifted.

UI owns:

- labels;
- localization;
- layout;
- responsive behavior;
- charts and tables;
- loading, empty and error states;
- route and navigation integration.

## Global prohibitions

- no domain-specific duplicate reporting engines;
- no direct UI calculation of report totals;
- no ambiguous period names;
- no mixed `asOf` snapshots;
- no ranking or human-worth inference;
- no database mutation during report reads;
- no provider may silently broaden its authority.

# Forge Commercial Leverage Evidence Loop 017C

Status: PRE-MERGE EVIDENCE

## Authority boundary

- Recommendation remains owned by its originating governed authority.
- Explicit advisor response is durable FES evidence under ADR-027 and `SALES_NBA_ADVISOR_RESPONSE`.
- `ACCEPTED`, `MODIFIED`, `DEFERRED`, and `DISMISSED` are decisions, not actions.
- Commercial action and outcome remain owned by their existing domain authorities.
- No causal attribution and no automatic execution are introduced.

## Source and contract evidence

- The FES canonical event contract accepts `RECOMMENDATION` subjects and the advisor-response payload.
- The existing FES02C local-first ledger, authenticated RPC gateway, append-only corrections, receipts, and tenant checks are reused.
- Migration `20260811000100` only extends the existing subject check; it creates no table, RPC, policy, or parallel ledger.
- Pages closure publishes the existing FES runtime chain and the 017C response adapter.

## Local validation observed on 2026-08-11

- Applicable regression: 100/100 PASS.
- Canonical Pages builder: PASS.
- Pages runtime closure: PASS, 59 files.
- Artifact HTTP: Aura root, Home module, FES browser runtime, response adapter, and Aura decision control all returned HTTP 200.
- Authenticated controlled-browser path: PASS using Chromium and the real Aura Home, IndexedDB FES store, sync service, authenticated RPC gateway, and canonical event adapter.
- Four human gestures produced four append-only decisions; the final effective decision was `DISMISSED`.
- Rapid duplicate submission did not create a fifth semantic decision.
- Module return reconciled `DISMISSED`.
- Browser refresh with a recreated module/runtime reconciled `DISMISSED`.
- Forced FES failure preserved the prior state and displayed a recoverable failure instead of false success.
- Desktop 1440x900: PASS after manual visual inspection.
- DeX/tablet 1600x900: PASS after manual visual inspection.
- Mobile 390x844: PASS after manual visual inspection.
- Horizontal overflow: false at all three viewports.

## Commercial leverage measurement

- Same-advisor, equal-duration, complete-coverage, equal-input cohorts are required for comparable uplift.
- Unknown or incompatible evidence produces no uplift.
- 100 comparable opportunities with 10 versus 13 confirmed policies yields observed sales uplift of +30%.
- 10% versus 30% conversion yields +20 percentage points and +200% relative uplift.
- These are observed, period-specific, non-causal measurements.

## Release hold

The production database must apply migration `20260811000100_fes_sales_nba_advisor_response_subject_017c.sql` before Pages exposes the control. The repository currently has no generic governed migration deployment workflow for this migration. The existing `deploy-supabase.yml` deploys Edge Functions only. Pages deployment must not proceed before the migration is applied and remotely verified.

Therefore this evidence package does not claim deployed production PASS yet.

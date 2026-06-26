# SUPABASE RLS IMPLEMENTATION READINESS 001

Status: AUTHORIZED WITH LIMITS
Date: 2026-06-18
Sprint Candidate: SUPABASE RLS BETA FOUNDATION 001

---

## 1. Constitutional Gate

Governing authority:

- Forge OS AGENTS.md / ROBOCOP LOCK 001.
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`
- `docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md`

Applicable ADRs / truth boundaries:

- No invented financial values.
- No invented products.
- No projections without explicit data.
- Forecasts are not facts.
- Economic outputs require evidence, rules and confidence.
- No metric without an owner.
- Orchestrators consume engines and do not duplicate logic.
- Forge Core must remain offline-first.
- Generative AI explains; Forge decides.
- Production Events are facts; interpretation belongs to governed Rule Packs.

Discovery status:

- Supabase and persistence discovery is sufficient to authorize a narrow implementation sprint.
- Current beta readiness remains negative because repo-verifiable migrations, RLS policies and multi-user isolation tests are missing.

Implementation readiness:

- Ready for an implementation sprint only within the limits in this brief.
- Not ready for controlled beta.

Miranda approval status:

- Not granted for beta.
- Conditional approval may be requested for the limited RLS foundation sprint after this brief.

Board approval status:

- Not granted for beta.
- Not granted for broad persistence migration.

Scope boundary:

- This readiness brief authorizes only the next sprint boundary.
- This brief does not authorize beta launch, broad sync, UI changes, Product Intelligence changes, Forecast changes, Compensation changes, Manager OS changes, Advisor OS UI changes or package changes.

---

## 2. Authorization Decision

Decision: AUTHORIZED WITH LIMITS.

`SUPABASE RLS BETA FOUNDATION 001` may proceed as a security foundation implementation sprint only.

The sprint is authorized to create repo-verifiable migrations, ownership columns, RLS policies, narrow repository ownership wiring and required security tests for the approved Supabase beta tables.

The sprint is not authorized to migrate cartera, policies, client records, logs, telemetry or broad offline sync to Supabase.

---

## 3. Authorized Implementation Scope

Allowed tables:

- `crm_data`
- `prospects`
- `alpha_events`
- `forge_outputs`
- `validation_results`, only as an Alpha evidence / human validation table linked to owned `forge_outputs`

Allowed columns:

- `crm_data.user_id`
- `prospects.advisor_id`
- `alpha_events.advisor_id`
- `forge_outputs.advisor_id`
- `validation_results.advisor_id`
- Primary keys, foreign keys, timestamps and indexes required to enforce ownership and FK chains.

Allowed policies:

- Enable RLS on approved tables.
- Authenticated user select/insert/update/delete policies only where ownership can be proven.
- `crm_data` policies constrained by `user_id = auth.uid()`.
- Alpha table policies constrained by `advisor_id = auth.uid()`.
- Child table policies must preserve ownership through FK chains.
- Browser anon client must never bypass ownership.

Allowed code wiring:

- Pass authenticated user identity into the approved repository writes.
- Ensure Alpha inserts include `advisor_id`.
- Ensure `crm_data` writes continue to include `user_id`.
- Add a strict offline-sync table whitelist or block dynamic `item.table` writes for beta.
- Keep `window.supabaseClient` only as a transitional compatibility bridge; do not expand it.

Allowed tests:

- Migration existence tests.
- RLS policy presence tests.
- Multi-user isolation tests.
- Anon insert/select/update/delete policy tests.
- Repository ownership write tests.
- `crm_data` user isolation tests.
- Offline sync dynamic table block tests.

---

## 4. Explicitly Authorized Tables

`crm_data`

- Purpose: advisor profile / operational CRM data currently used by `comisiones.js`.
- Ownership requirement: `user_id = auth.uid()`.
- Beta status: remote with RLS for beta.

`prospects`

- Purpose: Alpha prospect alias records.
- Ownership requirement: `advisor_id = auth.uid()`.
- Beta status: remote with RLS for Alpha flow only.

`alpha_events`

- Purpose: Alpha event log containing raw advisor notes and canonical events.
- Ownership requirement: `advisor_id = auth.uid()` and owned `prospect_id`.
- Beta status: remote with RLS for Alpha flow only.
- Privacy note: raw notes may contain PII and must be advisor-owned.

`forge_outputs`

- Purpose: persisted Forge runtime output for Alpha events.
- Ownership requirement: `advisor_id = auth.uid()` and owned `event_id`.
- Beta status: remote with RLS for Alpha flow only.

`validation_results`

- Purpose: human validation of Alpha outputs.
- Ownership requirement: `advisor_id = auth.uid()` and owned `output_id`.
- Beta status: optional for implementation if treated strictly as Alpha evidence, not canonical truth.

---

## 5. Explicitly Prohibited For Next Sprint

- Remote cartera migration.
- Remote policy or client data migration.
- Remote telemetry/logs migration.
- Broad offline sync implementation.
- Product Intelligence changes.
- Forecast changes.
- Compensation changes.
- Alfred changes.
- Manager OS changes.
- Advisor OS UI changes.
- Package changes.
- Service worker changes.
- Observability redesign.
- SQL or policies for non-authorized tables.
- Realtime expansion beyond what is required for RLS validation.

---

## 6. Ownership Requirements

- `crm_data.user_id = auth.uid()`.
- Alpha tables use `advisor_id = auth.uid()`.
- Child tables must preserve ownership through FK chains.
- Raw notes must be advisor-owned.
- Browser anon client must never bypass ownership.
- Service role exceptions must be limited to trusted server-side operations, migrations or Edge Functions and must not be exposed to browser runtime.
- Unknown ownership must block remote persistence.

---

## 7. Offline Sync Decision

Dynamic `item.table` writes are blocked for beta unless a strict whitelist and ownership enforcement exists.

This brief does not authorize broad sync.

The next sprint may implement only one of these outcomes:

- Block dynamic remote sync for beta.
- Add a narrow whitelist limited to approved RLS tables with ownership enforcement.

No cartera, policy, client, telemetry or generic table sync is authorized.

---

## 8. Persistence Contract

Remote with RLS for beta:

- `crm_data`
- `prospects`
- `alpha_events`
- `forge_outputs`
- Optional `validation_results`

Local-only for beta:

- `cartera`
- `actividad_diaria`
- `referidos`
- `prospeccion`
- `prospectos` until store/schema mismatch is resolved
- `comisiones` calculations
- localStorage handoff/autosave
- CacheStorage static/runtime assets
- market data/cache
- AI outputs outside the approved Alpha persistence flow

Blocked before beta:

- Dynamic `item.table` remote writes without whitelist and ownership enforcement.
- Remote policy/client data.
- Remote telemetry/logs.
- Raw notes without authenticated advisor ownership.
- Any write path that cannot prove `auth.uid()` ownership.

Synced later:

- cartera and policy operations after a separate privacy and RLS design.
- activity and referrals after domain ownership and consent rules.
- telemetry/logs after explicit privacy boundary.
- broad offline sync after table whitelist, conflict model and ownership tests.

---

## 9. Required Tests For Next Sprint

- Migration existence test for approved tables.
- RLS policy presence test for approved tables.
- Multi-user isolation test proving user A cannot read/write user B data.
- Browser anon insert/select/update/delete policy test.
- Repository ownership write test proving `advisor_id` / `user_id` is written.
- `crm_data` user isolation test.
- Alpha FK ownership chain test.
- Raw note ownership test.
- Offline sync dynamic table block test.
- Negative test for non-whitelisted table sync.

---

## 10. Final Readiness Statement

`SUPABASE RLS BETA FOUNDATION 001` may proceed.

It may proceed only as a limited implementation sprint for approved Supabase tables, ownership columns, RLS policies, narrow ownership wiring and security tests.

Forge remains not ready for controlled beta until that sprint produces repo-verifiable migrations, policies, ownership wiring and passing multi-user isolation evidence.

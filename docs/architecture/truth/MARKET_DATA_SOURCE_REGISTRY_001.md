# MARKET DATA SOURCE REGISTRY 001 — Banxico UDI/USD Ownership

Status: LOCKED

Scope: Governance documentation only for Banxico market data ownership, provider boundaries, cache ownership, fixture limits, forecast limits and AI interpretation limits.

Implementation: None

Code authority: None

Date: 2026-06-18

## Constitutional Gate

Applicable Constitution:

- AGENTS.md: no secrets in source code, no invented financial values, forecasts are not facts, AI output is never source truth, no metric without an owner.
- FORGE_CONSTITUTION_V3.md: evidence precedes judgment, no invented truth, source truth must remain owned.
- docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md: ROBOCOP LOCK 001 requires governance declaration before work.

Applicable ADRs and contracts:

- ADR-001 Evidence Ownership / Source Validity.
- ADR-002 One Metric One Owner.
- ADR-003 Recommendation vs Decision / Authority Boundary.
- ADR-004 No Invented Recommendations.
- ADR-007 Forecast Truth Boundary.
- ADR-008 Economic Evidence Boundary.
- ADR-017 Compensation Intelligence Evidence Boundary.
- TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.
- TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.
- TRUTH_BOUNDARY_003_VALIDATOR_READINESS_PLAN.
- RULE_SNAPSHOT_GOVERNANCE_001.

Build Tree area:

- Truth Boundary / Source Ownership / Market Data governance documentation.

Discovery status:

- Implementation ready for documentation-only registry.
- Prior locks confirmed by repository history:
  - 19e3535 Audit Banxico rate source truth.
  - ca44b2a Remove hardcoded Banxico token.
  - 8dcd5eb Add Supabase Banxico Edge provider routing.

Implementation readiness:

- Ready for governance documentation only.
- No runtime, provider, cache, test, schema, route, UI, ADR, Build Tree or package implementation is authorized by this registry.

Miranda approval:

- Approved for disciplined source ownership documentation that prevents false confidence, token exposure and source-truth confusion.

Board approval status:

- Not required for documentation-only recording of existing market-data ownership boundaries.

## Purpose

This registry prevents Forge from confusing source truth, provider behavior, cache copies, fixtures, forecasts and AI interpretation.

Banxico SIE API owns the current UDI_MXN and USD_MXN_FIX source truth. Forge providers may fetch, adapt, cache, validate, consume or explain those values, but they do not become the institutional source truth.

## Current Runtime Routing

Current architecture:

```text
Banxico SIE API
-> Supabase Edge Function banxico-rates
-> shared-banxico-edge-provider.js
-> exchange-rate-cache-engine.js
-> engines consuming UDI/USD
```

Configured routing:

- If `SUPABASE_BANXICO_RATES_URL` exists, `exchange-rate-cache-engine.js` uses `shared-banxico-edge-provider.js`.
- If `SUPABASE_BANXICO_RATES_URL` does not exist, `exchange-rate-cache-engine.js` falls back to `shared-banxico-rate-engine.js`.
- `shared-banxico-edge-provider.js` may read `SUPABASE_ANON_KEY` when present.
- `shared-banxico-edge-provider.js` must not read `BANXICO_TOKEN`.
- `shared-banxico-edge-provider.js` must not send `Bmx-Token`.
- `BANXICO_TOKEN` may be used only in backend/local direct provider fallback or as a Supabase Edge Function secret, never in frontend, client code, logs, fixtures or repo source.

Known current-rate series:

| Market data key | Banxico SIE series | Source | Mode |
| --- | --- | --- | --- |
| UDI_MXN | SP68257 | BANXICO_SIE_API | LATEST_VERIFIED |
| USD_MXN_FIX | SF43718 | BANXICO_SIE_API | LATEST_VERIFIED |

Verified Supabase Edge response shape:

```json
{
  "ok": true,
  "rates": {
    "UDI_MXN": {
      "seriesId": "SP68257",
      "value": 8.81842,
      "source": "BANXICO_SIE_API",
      "mode": "LATEST_VERIFIED"
    },
    "USD_MXN_FIX": {
      "seriesId": "SF43718",
      "value": 17.3688,
      "source": "BANXICO_SIE_API",
      "mode": "LATEST_VERIFIED"
    }
  }
}
```

## Ownership Table

| Data / Component | Owner | Truth category | Evidence state | Allowed uses | Prohibited uses | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| UDI_MXN | Banxico SIE API | SOURCE_TRUTH for current UDI value | OFFICIAL when fetched from BANXICO_SIE_API with series SP68257 and mode LATEST_VERIFIED | Current UDI reference, cache refresh input, conversion input, forecast input with disclosure | Hardcoded release default, fixture truth, forecast fact, AI-generated value | Forge consumes and labels it; Forge does not own the institutional value. |
| USD_MXN_FIX | Banxico SIE API | SOURCE_TRUTH for current USD/MXN FIX value | OFFICIAL when fetched from BANXICO_SIE_API with series SF43718 and mode LATEST_VERIFIED | Current FX reference, cache refresh input, conversion input, forecast input with disclosure | Hardcoded release default, fixture truth, forecast fact, AI-generated value | Banxico SIE API remains the institutional source. |
| BANXICO_TOKEN | Supabase Edge Function secret store or backend/local env only | SECURITY_SECRET, not market-data truth | BLOCKED from repo/client exposure | Server-side Banxico API authentication only | Repo source, frontend/client, logs, fixtures, tests as real token, AI output, prompts | May exist as Supabase Edge Function secret or backend/local `process.env.BANXICO_TOKEN`. |
| Supabase Edge Function banxico-rates | Supabase Edge runtime boundary | PROVIDER_BOUNDARY, not source truth | VALIDATED when it returns Banxico-shaped rates with source BANXICO_SIE_API | Server-side token isolation, Banxico request proxy/provider, response normalization boundary | Claiming institutional ownership, inventing values, becoming product/forecast/compensation truth | Security boundary and provider endpoint only. |
| shared-banxico-edge-provider.js | Forge runtime adapter layer | PROVIDER_ADAPTER, not source truth | VALIDATED by edge provider tests | Fetch Edge Function, validate response shape, return `{ UDI_MXN, USD_MXN_FIX }` | Reading BANXICO_TOKEN, sending Bmx-Token, inventing values, owning rate truth | Reads `SUPABASE_BANXICO_RATES_URL`; optionally reads `SUPABASE_ANON_KEY`. |
| shared-banxico-rate-engine.js | Forge backend/local direct provider fallback | BACKEND_LOCAL_PROVIDER, not independent source truth | VALIDATED when `BANXICO_TOKEN` exists and Banxico responds | Backend/local direct Banxico fallback, no frontend use | Hardcoded token, frontend use, release source ownership, bypassing Edge security boundary in client | Uses `process.env.BANXICO_TOKEN` and sends `Bmx-Token` only in backend/local fallback context. |
| exchange-rate-cache-engine.js | Forge cache owner | CACHE_OWNER, not source truth | VALIDATED as cache/copy when provenance and staleness are respected | Read/write cached copy, route configured provider, preserve `cachedAt`, `rates`, `cacheStatus` | Replacing Banxico truth, inventing current rates, product/forecast/compensation ownership | Owns cache behavior and freshness boundary only. |
| forge-rate-cache.json | Forge local cache artifact | EVIDENCE_PACKET / CACHE_COPY, not source truth | STALE or VALIDATED depending on `cachedAt`, source date and source label | Local cache hit, audit evidence, offline decision support with staleness disclosure | Permanent truth, release truth, fixture truth, source of new rates | Cache is evidence/copy only. |
| Projection engines | Forecast / projection domain owners | FORECAST / DECISION_SUPPORT | VALIDATED only for mathematical projection with explicit inputs and assumptions | Future projection math, scenario outputs, assumption-based decision support | Current UDI source ownership, current USD FIX source ownership, forecast-as-fact, invented current rates | Projection engines own math, not current market-data truth. |
| Tests using hardcoded UDI like 8.7 | Test suite / fixture owner | LOCAL_FIXTURE / TEST_FIXTURE | VALIDATED only inside test scope | Deterministic test inputs, regression fixtures, explicit scenario fixtures | Release truth, production default, current UDI source truth, user-facing current rate | Hardcoded 8.7 may be acceptable only as explicit test fixture. |
| AI outputs | Forge AI interpretation layer | AI_INTERPRETATION or AI_CANDIDATE | AI_INTERPRETATION_VALIDATED_FOR_PRESENTATION only after Forge validation | Explain validated Forge outputs, draft language, summarize provenance | Fact, source truth, rate owner, token holder, product/forecast/compensation authority | Forge thinks. AI interprets. |

## Required Ownership Definitions

- Banxico SIE API owns current UDI_MXN and USD_MXN_FIX source truth.
- Supabase Edge Function owns secure server-side token access boundary.
- `shared-banxico-edge-provider.js` owns client/runtime adapter behavior only.
- `shared-banxico-rate-engine.js` owns backend/local direct Banxico provider fallback only.
- `exchange-rate-cache-engine.js` owns cached copies only.
- `forge-rate-cache.json` is cache evidence/copy only.
- Projection engines own mathematical projection and forecast outputs only.
- Tests own fixtures only.
- AI owns interpretation/candidate output only.

## Forbidden Promotions

The following promotions are blocked:

| Forbidden promotion | Lock reason |
| --- | --- |
| Cache -> source truth | Cache is a copy with staleness risk; Banxico remains the source truth. |
| Test fixture -> release truth | Fixtures provide deterministic tests, not real-world current rates. |
| Forecast -> fact | Forecasts are scenarios or estimates, never facts. |
| AI interpretation -> fact/source truth | AI cannot validate or originate market-data truth. |
| Supabase Edge provider -> Banxico source truth | Edge is a security/provider boundary, not the institutional source. |
| Hardcoded UDI -> current UDI source truth | Hardcoded rates may be fixtures only. |
| Product/forecast/compensation engine -> current market data owner | Domain engines consume official market data; they do not own current UDI/USD truth. |
| Client/frontend -> BANXICO_TOKEN holder | Token must stay server-side only. |

## Relationship To Previous Locks

This registry records and depends on:

- BANXICO RATE SOURCE AUDIT 001: `docs/architecture/truth/BANXICO_RATE_SOURCE_AUDIT_001.md`.
- BANXICO TOKEN SECURITY PATCH 001: commit `ca44b2a Remove hardcoded Banxico token`.
- SUPABASE BANXICO EDGE PROVIDER 001: commit `8dcd5eb Add Supabase Banxico Edge provider routing`.
- POST-LOCK BASELINE 001: confirmed baseline tests and runtime audit after Edge provider lock.
- TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.
- TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.
- TRUTH_BOUNDARY_003_VALIDATOR_READINESS_PLAN.
- RULE_SNAPSHOT_GOVERNANCE_001 where future rule/rate assumptions become governed snapshots.

## Validation

Validation commands required for this lock:

```sh
git log --oneline -3
git status --short
rg -n "SP68257|SF43718|BANXICO_SIE_API|SUPABASE_BANXICO_RATES_URL|BANXICO_TOKEN|Bmx-Token|8\.7" shared-banxico-edge-provider.js shared-banxico-rate-engine.js exchange-rate-cache-engine.js tests docs/architecture/truth
node tests/banxico-token-security-test.js
node tests/banxico-edge-provider-test.js
node tests/run-all-tests.js
node scripts/runtime-module-graph-audit.js
```

Recorded results for this sprint:

- `git log --oneline -3`: HEAD includes `8dcd5eb Add Supabase Banxico Edge provider routing`, followed by `ca44b2a Remove hardcoded Banxico token` and `19e3535 Audit Banxico rate source truth`.
- `git status --short`: pre-existing modified runtime validation files and untracked prohibited paths remain outside this registry scope; this sprint intentionally adds only this document.
- `rg` source-boundary check: expected references are present in provider, fallback, tests and truth docs. `shared-banxico-edge-provider.js` does not reference `BANXICO_TOKEN`, `Bmx-Token` or `Deno.env`.
- `node tests/banxico-token-security-test.js`: PASS, 2 tests passed.
- `node tests/banxico-edge-provider-test.js`: PASS, 8 tests passed.
- `node tests/run-all-tests.js`: PASS.
- `node scripts/runtime-module-graph-audit.js`: EXECUTABLE with zero missing targets, zero missing exports, zero circular imports and zero boot blockers.

Runtime audit baseline:

```json
{
  "totalJsFilesScanned": 712,
  "totalImportsFound": 227,
  "missingTargetsCount": 0,
  "missingExportsCount": 0,
  "circularImportsCount": 0,
  "bootBlockersCount": 0,
  "executabilityVerdict": "EXECUTABLE",
  "confidenceScore": 0.88
}
```

## Final Lock Statement

MARKET DATA SOURCE REGISTRY 001 is locked as governance documentation only. It does not authorize product, forecast, compensation, Alfred, Manager OS, Advisor OS, schema, DB or UI changes.

This registry does not authorize:

- runtime code changes
- provider changes
- cache behavior changes
- test changes
- package changes
- schema changes
- DB migrations
- route changes
- UI changes
- Build Tree changes
- ADR changes
- git add
- git commit
- git push

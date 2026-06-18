# BANXICO RATE SOURCE AUDIT 001 - UDI / USD Source Truth & Security Boundary

Status: AUDIT DOCUMENTATION

Scope: Banxico UDI / USD FIX source truth, cache, fixture, hardcode and token security boundary

Implementation: None

Code authority: None

Date: 2026-06-18

## Constitutional Gate

Applicable principles:

- Forge thinks. AI interprets.
- Evidence precedes judgment.
- No truth without owner.
- OCR is not truth.
- Forecast is never fact.
- Source truth must have provenance.
- Test fixtures are not release truth.
- Hardcoded secrets are security blockers.

## Files Inspected

- shared-banxico-rate-engine.js
- exchange-rate-cache-engine.js
- forge-rate-cache.json
- shared-policy-currency-timeline-engine.js
- tests/critical-path-test.js
- imagina-ser-banxico-integration-test.js
- market-data-master-test.js
- shared-banxico-rate-report.js
- Direct references to getCurrentRates, getCachedRates, BANXICO_SERIES, BANXICO_TOKEN, UDI_MXN, USD_MXN_FIX, 8.7, 8.70, currentUdiValue, currentUDI and udiRate.

## Executive Summary

Banxico SIE API owns UDI_MXN and USD_MXN_FIX source truth.

exchange-rate-cache-engine owns cached copy, not source truth.

Projection engines own future projection math, not current UDI source truth.

The current Banxico integration has a working source/cache structure, but it also contains a security blocker: a hardcoded Banxico token exists in source code. The token value must not be printed in reports. Hardcoded token is considered exposed.

The safest next sprint is BANXICO TOKEN SECURITY PATCH 001.

## Banxico Source Truth Summary

| Question | Finding |
| --- | --- |
| Which file fetches latest UDI? | shared-banxico-rate-engine.js via getCurrentRates() and fetchBanxicoLatest(). |
| Which file fetches latest USD FIX? | shared-banxico-rate-engine.js via getCurrentRates() and fetchBanxicoLatest(). |
| Which Banxico series IDs are used? | UDI uses SP68257. USD FIX uses SF43718. |
| What source label is emitted? | BANXICO_SIE_API. |
| What source mode is emitted for latest rates? | LATEST_VERIFIED. |
| What output keys are emitted? | UDI_MXN and USD_MXN_FIX. |

Evidence:

- shared-banxico-rate-engine.js defines BANXICO_SERIES with UDI and USD_FIX.
- shared-banxico-rate-engine.js fetches `/datos/oportuno` from Banxico.
- shared-banxico-rate-engine.js returns source `BANXICO_SIE_API` and mode `LATEST_VERIFIED`.
- shared-banxico-rate-report.js validates both UDI_MXN and USD_MXN_FIX and checks the source label.

## Cache Summary

| Question | Finding |
| --- | --- |
| Which file reads/writes cache? | exchange-rate-cache-engine.js. |
| What is the cache file? | forge-rate-cache.json. |
| What is max cache age? | 12 hours. |
| What fields are stored? | cachedAt, rates, cacheStatus. Each rate includes seriesId, title, date, value, source and mode. |
| Does cache contain provenance? | Partially yes: seriesId, title, date, source and mode are retained. Cache also stores cachedAt. |
| Does cache own source truth? | No. The cache owns a cached copy only. |

Cache risk:

- forge-rate-cache.json cannot be treated as permanent truth without staleness validation.
- Cache hit must disclose cachedAt/source date.
- A cache hit is acceptable decision support only when staleness boundaries are respected.

## Historical / Timeline Banxico Integration

shared-policy-currency-timeline-engine.js contains a separate Banxico series provider:

- It defines BANXICO_SERIES for UDI and USD.
- It fetches `/datos/{startDate}/{endDate}` instead of `/datos/oportuno`.
- It emits source `BANXICO_SIE_API` and sourceMode `LIVE_SERIES`.
- It also contains a hardcoded Banxico token fallback.

Assessment:

- It duplicates token and series access logic rather than reusing shared-banxico-rate-engine.js.
- It should remain conceptually separate as a historical series provider if future architecture explicitly separates current rates from historical timeline rates.
- Current-rate responsibility belongs to shared-banxico-rate-engine.js plus exchange-rate-cache-engine.js.
- Historical/timeline responsibility should belong to a governed historical market-data provider, but token handling must be centralized or server-side before production.

## Ownership Mapping

| Artifact | Ownership |
| --- | --- |
| Banxico SIE API | Owns UDI_MXN and USD_MXN_FIX source truth. |
| shared-banxico-rate-engine.js | Fetches current source truth from Banxico; does not own truth independently of Banxico. |
| exchange-rate-cache-engine.js | Owns cached copy, not source truth. |
| forge-rate-cache.json | Cached evidence packet with cachedAt/source metadata; not permanent truth. |
| shared-policy-currency-timeline-engine.js | Historical/timeline Banxico series provider candidate; not current-rate cache owner. |
| tests/critical-path-test.js | Owns fixtures only, not source truth. |
| Projection engines | Own future projection math, not current UDI source truth. |

## Hardcoded UDI Classification

| File / reference | Classification | Reason |
| --- | --- | --- |
| tests/critical-path-test.js lines using udiRate/currentUdiValue 8.7 | ACCEPTABLE_TEST_FIXTURE | Test uses explicit deterministic rates for critical path projection and conversion. Test fixtures are not release truth. |
| tests/business-rules-test.js currentUdiValue 8.7 | ACCEPTABLE_TEST_FIXTURE | Business rule fixture; not source truth. |
| tests/vida-mujer-survival-schedule-test.js exchangeRateToMXN 8.7 | ACCEPTABLE_TEST_FIXTURE | Test fixture; acceptable only inside test scope. |
| fixtures/vida-mujer-quote-fixture.json currentUDI 8.7 | ACCEPTABLE_TEST_FIXTURE | Fixture data; must not become production default. |
| fixtures/vida-mujer-fixture.json currentUDI 8.70 | ACCEPTABLE_TEST_FIXTURE | Fixture data; must not become production default. |
| tests/fixtures/presentation-basic-imagina-ser.json currentUdiValue 0 | ACCEPTABLE_TEST_FIXTURE | Explicit zero fixture for presentation test. |
| retirement-future-udi-projection-smoke-test.js currentUdiValue 8.85 | ACCEPTABLE_TEST_FIXTURE | Smoke test explicit input. |
| product-intelligence/coverage/vida-mujer-event-benefits-report.js currentExchangeRate 8.7 | NEEDS_REVIEW | Report/runtime-like Product Intelligence file uses hardcoded current exchange rate. Must not be release truth. |
| product-intelligence/coverage/vida-mujer-protected-diseases-report.js currentExchangeRate 8.7 | NEEDS_REVIEW | Report/runtime-like Product Intelligence file uses hardcoded current exchange rate. Must not be release truth. |
| currency-normalization-engine.js udiRate from explicit input | ACCEPTABLE_EXPLICIT_INPUT | Engine requires provided rate and blocks missing UDI rate; it does not fetch or invent current UDI. |
| product-intelligence/projections/projection-engine.js currentUdiValue default 0 | ACCEPTABLE_EXPLICIT_INPUT | Projection requires explicit current UDI value; zero default should remain non-source-truth. |
| dynamic-cash-value-projection-engine.js currentUdiValue default 0 | ACCEPTABLE_EXPLICIT_INPUT | Projection math input, not current rate source truth. |
| presentation-input-pipeline.js currentUdiValue default 0 | ACCEPTABLE_EXPLICIT_INPUT | Presentation input placeholder; not source truth. |
| retirement-presentation-scenario-engine.js currentUdiValue from cache metadata | ACCEPTABLE_EXPLICIT_INPUT | Uses verified/cached UDI metadata and preserves source/sourceDate/sourceMode. |
| imagina-ser-master-test.js currentUdiValue from cache | ACCEPTABLE_TEST_FIXTURE | Test consumes cache and blocks missing current UDI. |
| market-data-master-test.js udiRate from cache | ACCEPTABLE_TEST_FIXTURE | Test validates cache/Banxico layer. |
| vida-mujer-financial-fixture-report.js currentUDI from cache | ACCEPTABLE_EXPLICIT_INPUT | Report consumes cached Banxico UDI; source truth remains Banxico/cache evidence. |
| vida-mujer-client-presentation-engine.js fixture.projectionAssumptions.currentUDI | NEEDS_REVIEW | Consumes fixture assumption; must not become production source truth. |

## Blocked Misuse

- 8.7 hardcoded cannot be release truth.
- forge-rate-cache.json cannot be treated as permanent truth without staleness validation.
- Banxico token must not be exposed to frontend.
- Forecast/projection cannot invent current UDI.
- Cache hit must disclose cachedAt/source date.
- Test fixture cannot become production default.
- Product Intelligence reports with hardcoded currentExchangeRate must not be promoted to release behavior without source registry and cache/source validation.

## Security Findings

Finding: Hardcoded Banxico token exists in source code.

Locations:

- shared-banxico-rate-engine.js contains a hardcoded BANXICO_TOKEN fallback.
- shared-policy-currency-timeline-engine.js contains a hardcoded BANXICO_TOKEN fallback.

Security classification:

- Hardcoded token is considered exposed.
- Token value must not be printed in reports, logs or future prompts.
- Token should be rotated/regenerated.
- Future patch should require process.env.BANXICO_TOKEN and remove hardcoded fallback.
- Production should move Banxico access behind a server-side boundary, preferably Supabase Edge Function or equivalent backend service.
- Banxico token must not be exposed to frontend.
- No package changes are needed for this audit.

## Recommended Next Sprint

Recommended next sprint: BANXICO TOKEN SECURITY PATCH 001.

Rationale:

- The source/cache model is usable, but the hardcoded token is a security blocker.
- Token removal/rotation is safer and higher priority than broader source registry work.
- MARKET DATA SOURCE REGISTRY 001 should follow after token handling is secure.
- UDI HARDCODE FIXTURE CLASSIFICATION 001 can follow to cleanly separate fixtures, reports and production defaults.

## What This Audit Does NOT Authorize

This audit does not authorize:

- no code implementation
- no engine changes
- no test changes
- no package changes
- no token changes
- no cache refresh
- no Product Intelligence changes
- no Forecast changes
- no Compensation changes
- no Alfred changes
- no Manager OS changes
- no validator changes
- no runtime changes
- no git add
- no git commit
- no git push

## Final Recommendation

READY FOR BANXICO RATE SOURCE AUDIT LOCK.

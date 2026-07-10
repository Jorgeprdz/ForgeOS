# 107Z14R1 — Controlled browser integration targeted repair

Status: **PASS**

## Repair

- Repair ID: `DIRECT_COMMITTED_SOURCE_INJECTION`
- Previous fragile dependency: browser resource loading through harness-relative paths.
- Replacement: direct injection of the exact committed contract, store and coordinator source.
- Modal wiring: extracted unchanged from the committed marker block.
- Forge source modified: `false`

## Controlled browser result

- Chromium real: `true`
- Puppeteer Core: `true`
- Localhost page: `true`
- Ephemeral browser profile: `true`
- Browser localStorage used: `true`, isolated profile only
- Storage cleared after test: `true`
- Temporary profile removed: `true`
- External network requests: `0`

## Validated flow

1. Exact committed modules were injected into Chromium.
2. Exact committed modal wiring was installed.
3. The legacy extraction event was intercepted.
4. One versioned preview result was persisted.
5. An identity-only event was emitted.
6. The exact result was read.
7. The existing modal API received all eight fields and ambiguity metadata.
8. Quote truth and forbidden persistence keys remained blocked.

## Next gate

`107Z15_QUOTE_PREVIEW_PDF_RUNTIME_PERSISTENCE_EXISTING_EXTRACTOR_CONTROLLED_INTEGRATION_GATE`

# Recruitment Hub — Visual Preview 3A

Local, synthetic and independent of ForgeOS Pages. Four navigable views: Inicio,
Candidatos, Entrevistas and Expedientes. Names, contacts and notes stay in a
session-only presentation model; five RH 2B adapters receive explicit neutral
projections. No second recruitment engine, auth, scoring or productive writer.

## Start locally

From the ForgeOS repository, with Node >=22.12:

```sh
node recruitment-hub/preview/serve.mjs
```

Open `http://127.0.0.1:4317/recruitment-hub/preview/`. The server binds only to
loopback and serves only this preview and the three RH 2B module directories
needed for its imports. It refuses writes and unrelated repository paths.
No npm install is needed to run the preview. Inter is bundled locally under
its SIL Open Font License; asset/source hashes are in `assets/manifest.json`.
The preview has no external network dependency, service worker, storage or cache.

Changes disappear on reload. Enter fictional information only. Candidate names
are required; other fields are optional and bounded. Duplicate names (including
case/accent differences), email and telephone are rejected within the session.
Search and filters do not change records. Notes are preserved across navigation,
escaped in HTML and never promoted to verified evidence. Reset/empty/error
scenarios are available from “Escenarios de demostración”.

The initial scenario contains two fictional records with synthetic, explicitly
dated evidence. New records have unknown stage and no manufactured evidence;
metrics become unknown when the admitted history is incomplete. Registered and
completed counts come exclusively from `adaptMetrics`. Pending interviews and
follow-ups remain unknown because no authorized official count is supplied.
Visible lists are session inventory, not new parallel official metrics.

TXT download requires a separate explicit confirmation and contains fictional
session data and the non-cloud disclaimer. It writes only the user-requested
download. PDF is a presentation contract for a future separately authorized
adapter; no quote/PDF engine is imported or modified. See `presentation-contract.json`.

## Authority and design

3A is authorized by the owner's express adoption of the act in the existing
RH-GOV-001 technical log, as Owner/Board and human Miranda. This does not expand
ADR-029 or alter its sources. Only new files below `preview/` and `tests/preview/`
are allowed. No commit, push, main change, external repository, Pages or deployment.

Aura authority: ADR-024 and
`docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md`.
Version 1.0, RATIFIED / ACTIVE / LOCKED. PDF authority fingerprint:
`0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e`.
`aura-tokens.css` copies exact custom-property declarations from canonical CSS
blocks. No legacy UI, uncontrolled palette or remote fonts. Layout uses the 4px
grid, intrinsic wrapping and columns, with no invented breakpoint scale. Floating
navigation stays bounded and content scrolls with adequate bottom clearance.

Visual comparison against the normative Markdown and actual screenshots is
required. Public mirror attempts returned HTML; the authenticated Google Drive connector
subsequently supplied the actual source PDF and its SHA-256 matched exactly.
The verified PDF and rendered reference pages remain outside the repository
in Forge2 QA evidence, together with actual preview screenshots.
Chromium traps in this PRoot environment; Firefox can render and is used via BiDi
for real browser tests. Browser-specific limits must be reported rather than
described as passing Chromium tests.

## Tests

```sh
node --test recruitment-hub/tests/preview/model.test.mjs recruitment-hub/tests/preview/contract.test.mjs
```

Browser tests use external QA dependencies, never runtime dependencies. Install
`puppeteer-core@24.15.0` and `axe-core` in a separate tools directory. With Firefox
available, point `RH_PUPPETEER_MODULE` to its absolute ESM entry,
`RH_AXE_SOURCE` to axe.min.js and `RH_PREVIEW_EVIDENCE_DIR` to a local evidence
directory, then run `node --test recruitment-hub/tests/preview/browser.test.mjs`.
QA starts its own loopback server on a random port and closes it afterwards.
Current tool paths and exact commands/results are recorded in Forge2.

Acceptance includes functional routes/form/search/filter/notes/TXT, unknown and
empty/error states, responsive widths 320/390/768/1440, keyboard/focus, accessible
labels, touch targets, contrast, reflow and reduced motion, no external requests
or persistent writes, original 52 RH tests, 13 documentation regressions, 16
existing governance checks, documentation harness, source hashes and bundle.
Screenshots alone are not functional or accessibility proof.

## Separate hosting plan — not executed

Package a standalone preview artifact with the permitted RH 2B module graph and
local font/assets under a separately approved repository or hosting boundary.
Serve relative module paths at a preview-specific base, synthetic data only,
without credentials, shared service workers or production routes. A future owner
decision must specify the boundary, repository ownership and publication method;
gh-pages is only an option if that method supports it. No repo, hosting, workflow,
gh-pages branch or deployment is configured by 3A. Existing ForgeOS Pages remains
unchanged. Auth/RLS, production integration and PDF adaptation require later gates.

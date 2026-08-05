# ForgeOS Demo Mode Readiness

Date: 2026-08-04

Phase: `FORGE_DEMO_MODE_CANONICAL_PREAUDIT_001`

Authority: explicit Owner, Miranda and Board approval
Verdict: ready for a local UX/UI audit; forbidden in production

## Constitutional Gate

- Applicable Constitution: `ARTICLE_0_RATIFICATION_001`, `FORGE_CONSTITUTION_V3.md`, Decision Clarity First, Intelligence Must Lead To Action, Advisor First, Value Before Work, Capture Once, No Invented Data, Shared Knowledge / Private Data and Human Judgment Preserved.
- Applicable ADRs: ADR-001 Evidence Ownership Source Validity; ADR-002 One Metric One Owner; ADR-003 Recommendation vs Decision Authority Boundary; ADR-004 No Invented Recommendations; ADR-019 UI-M03 Home and Alfred Material 3 Execution Authority; ADR-020 UI-M04 Canonical Forge Shell Execution Authority; ADR-023 Advisor OS Productive Home and Core Modules Recovery Execution Authority.
- Build Tree area: `R16C Advisor OS`, `UI-M04 Canonical Forge Shell`, `067G17B1 Authenticated Entry`, `067G17B2 Productive Prospect Service`, `067G17B3 Prospect Workspace`.
- Discovery status: closed for canonical-entry and demo-boundary reconciliation.
- Implementation readiness: ready with conditions; local visual navigation only, no private reads and no real mutations.
- Miranda approval: granted.
- Board approval: granted.
- Scope boundary: Material 3 bootstrap, auth adapter, route guard, mutation boundary, canonical redirects, Pages configuration guard, tests and this evidence.
- Prohibited surfaces: Supabase Auth removal, guard removal, RLS/schema mutation, fabricated sessions, credentials, production bypass, private reads, real writes, legacy mounting, direct `main`, automatic merge and user-work deletion.
- Validation expectation: canonical root/direct routes, refresh/history, demo-off auth behavior, production rejection, read/write isolation, logout regression and real Chromium acceptance at mobile/tablet/desktop sizes.

## Root cause and canonical reconciliation

The source tree had three entry conventions at once. The repository root pointed to the public Pages alias, the `docs/` root still pointed directly to `docs/10-gui/mobile-daily/`, and `docs/static-preview/forge-alive/` acted as a retirement bridge. Pages intentionally publishes the Material 3 source under the stable public alias `/static-preview/forge-alive/`; locally, however, the stale `docs/` redirect could still mount the old mobile mockup.

The canonical implementation is `docs/static-preview/forge-alive-material3/`. The `docs/` root now targets it directly. The public alias remains a bridge only in source and is replaced by the Material 3 tree during the Pages artifact build. Neither the local canonical route nor the repaired `docs/` root mounts the mobile mockup.

| Route | Previous implementation | Expected implementation | State | Cause | Action |
|---|---|---|---|---|---|
| `/` on Pages | Stable `/static-preview/forge-alive/` alias | Material 3 published at that alias | Canonical | Pages overlays the canonical source | Preserved |
| `/docs/` locally | `docs/10-gui/mobile-daily/` | Material 3 source | Repaired | Stale historical redirect | Redirected to `forge-alive-material3` |
| `/docs/static-preview/forge-alive/` | Retirement bridge | Material 3 source | Reconciled | Historical stable URL | Bridge retained, never mounted as runtime |
| `/docs/static-preview/forge-alive-material3/?nav=*` | Material 3 | Material 3 | Canonical | Direct source entry | Used for local audit |
| `/static-preview/forge-alive-runtime/` | Historical compatibility copy | Not an audit entry | Blocked from demo navigation | Legacy compatibility artifact | No link or redirect added |

## Demo architecture

`forge-demo-mode.js` executes before the auth guard. It activates only when both `FORGE_DEMO_MODE` and `FORGE_DEMO_ALLOW_AUTH_BYPASS` equal the exact string `true`, the hostname is loopback, and no Supabase URL or key is present. A mismatched pair aborts bootstrap. A non-loopback hostname or productive credential also aborts bootstrap.

The local actor is immutable and interface-only:

```json
{
  "id": "forge-demo-user",
  "displayName": "Usuario Demo",
  "role": "advisor-demo",
  "isDemo": true
}
```

The adapter exposes `supabaseSession: null`; it never calls sign-in and never produces a JWT. The route guard admits a separate `demo` state while preserving its normal authenticated and anonymous states. Productive login controls are visually suppressed only while this build-governed local state is active. The existing Supabase-backed public demo login remains separate and unchanged.

## Security protections

- Bootstrap rejects partial flags, non-loopback activation and any Supabase credentials.
- Auth events cannot replace the local demo boundary with a productive session state.
- The route guard remains fail-closed for every state except `authenticated` and the governed local `demo` state.
- Remote network requests are blocked in demo; same-origin requests are limited to GET/HEAD.
- Explicit private-read and mutation assertions protect Pipeline administration and stage/create operations.
- Existing Cartera and Activity demo-session gates disable writes and explain the read-only state.
- Query parameters, cookies, `localStorage` and `sessionStorage` are not configuration sources.
- Pages deployment rejects legacy `DEMO_MODE`, `FORGE_DEMO_MODE`, or `FORGE_DEMO_ALLOW_AUTH_BYPASS` when any is true.
- The Pages deployment still requires the governed Supabase project configuration for its normal productive login.

## Navigable and blocked surfaces

Local Chromium verified direct navigation to Inicio, Pipeline, Cotizaciones, Cartera, Actividad and Comisiones. The canonical shell and route viewport remained mounted. Modules that require private data display signed-out, disconnected, unknown or unavailable states; they do not receive a fabricated productive payload.

Remote/private reads, Supabase mutation, policy persistence, activity persistence, Pipeline mutation and external network side effects are blocked. This is intentional and does not count as a missing audit route.

## Validation evidence

- Contract tests: 4/4 passed.
- Session/productive regression: 23/24 initially passed; the one import-order assertion was updated for the new mandatory pre-auth adapter and then passed on rerun.
- Real browser: Chromium 149, canonical Material 3 runtime, not an isolated fixture.
- Direct route and refresh: `actividad` retained `data-forge-auth-boundary="demo"` and `data-active-route="actividad"` after cache-bypassing reload.
- History: Back returned to `?nav=actividad`; Forward returned to `?nav=cartera` while the same canonical shell stayed mounted.
- Demo disabled: direct Cartera navigation produced `data-forge-auth-boundary="anonymous"`, private navigation blocked and the required login gate visible.
- Non-loopback hostname: bootstrap did not acquire the `demo` auth boundary.
- No evidence output contains configured secrets or personal data.

Screenshots:

- `docs/audits/evidence/forge-demo-mode/mobile-390x844.png`
- `docs/audits/evidence/forge-demo-mode/tablet-820x1180.png`
- `docs/audits/evidence/forge-demo-mode/desktop-1440x900.png`

The Playwright acceptance specification is committed for CI/Linux. This Android workspace cannot start Playwright because Playwright reports `Unsupported platform: android`; equivalent runtime acceptance was executed against the installed Chromium binary through its browser and DevTools protocols.

## Activation and deactivation

For a local build only, create or generate an untracked `env.js` with no Supabase credentials and both flags set to the exact string `true`:

```js
window.__ENV__ = Object.freeze({
  FORGE_DEMO_MODE: "true",
  FORGE_DEMO_ALLOW_AUTH_BYPASS: "true",
  DEMO_MODE: "false",
  SUPABASE_URL: "",
  SUPABASE_KEY: ""
});
```

Deactivate by setting both Forge flags to `false` and restarting the local server. The checked local state was returned to disabled after acceptance. Production Pages always rejects the enabled values.

To remove the bypass completely after the audit: remove the first `forge-demo-mode.js` import from `app.js`, remove the `demo` branch from `authenticated-route-guard.js`, remove the local checks from the mutation adapters, remove the two generated config fields and production rejection assertions only if the governing phase explicitly authorizes removal, then run the demo-off auth/session and Pages regression suites. Do not remove the productive Supabase login or its lifecycle.

## Readiness gate

```text
FORGE_CANONICAL_APP_RECONCILIATION=PASS
LEGACY_MOCKUP_STILL_MOUNTED=NO
ROOT_ROUTE_CANONICAL=YES
DIRECT_MODULE_ROUTES=PASS
DEMO_MODE_IMPLEMENTED=YES
LOGIN_CODE_REMOVED=NO
SUPABASE_AUTH_PRESERVED=YES
PRODUCTION_BYPASS_BLOCKED=YES
REAL_MUTATIONS_BLOCKED_IN_DEMO=YES
MOBILE_NAVIGATION=PASS
TABLET_NAVIGATION=PASS
DESKTOP_NAVIGATION=PASS
READY_FOR_UX_UI_AUDIT=YES
```

This verdict authorizes only the separately requested read-only UX/UI audit. It does not authorize remediation, a production demo deployment, merge, RLS changes, schema changes or productive data access.

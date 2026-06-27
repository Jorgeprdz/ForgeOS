# LEGACY-001 Survivability Analysis

Report ID: LEGACY-001
Status: ARCHITECTURE DISCOVERY / NO RUNTIME MODIFICATIONS
Date: 2026-06-11

## Purpose

Determine whether the CRMAddlife-origin shell files would survive if Forge OS were rebuilt from scratch today.

CRMAddlife is treated as a basic CRM prototype, not as a strategic architecture foundation for Forge OS. A legacy asset survives only if evidence proves it is still operationally required or if it contains a reusable runtime contract worth extracting.

## Survivability Verdicts

| File | Verdict | Replacement difficulty | Reason |
| --- | --- | --- | --- |
| `app.js` | `EXTRACT_THEN_REPLACE` | `HIGH` | Contains valuable runtime lessons and current compatibility wiring, but its shell identity, CRM UI assumptions, global compatibility surfaces, and route registry should not be the final Forge architecture. |
| `index.html` | `REPLACE` | `MEDIUM` | Current browser entry is CRMAddlife-specific. Future Forge needs a cleaner root document, but replacement must preserve boot anchors, env loading, Supabase/bootstrap order or its successor, app mount, and service worker strategy. |
| `dashboard.js` | `EXTRACT_THEN_REPLACE` | `MEDIUM` | Some data-flow patterns are useful, but the route is a legacy dashboard surface, not the final Advisor OS home or Forge decision cockpit. |

## File-Level Analysis

### `app.js`

Survivability:

`EXTRACT_THEN_REPLACE`

What survives:

- Async route navigation lifecycle.
- Mixed route resolver pattern proven by RUNTIME-013.
- Route loading guard concept.
- Central ownership of loading/error state.
- Auth-before-route boot sequence.
- Platform service initialization order as a migration reference.
- Delegated navigation principle.

What does not survive:

- CRMAddlife shell identity.
- In-file route ownership as final architecture.
- Inline login UI.
- Inline chat placeholder.
- Bottom-nav-specific shell assumptions.
- Compatibility global `window.supabaseClient` as a permanent surface.
- `getSupabase` compatibility export from root shell.

Replacement complexity:

`HIGH`

Estimated dependency count:

- Direct current dependency surface: high.
- It touches auth, env, Supabase, DB init, platform core init, route registry, route lifecycle, nav, header, chat, online/offline, error handling, analytics, and service compatibility.

Blast radius:

- High if replaced directly.
- Manageable if extracted behind platform shell boundaries first.

Migration risk:

- High for direct replacement.
- Medium for staged extraction after route-loader and navigation contracts are stable.

### `index.html`

Survivability:

`REPLACE`

What survives:

- Need for a root app document.
- Need for app mount element.
- Need for environment/bootstrap loading strategy.
- Need for PWA/service worker entry if PWA remains target.

What does not survive:

- CRMAddlife title and copy.
- Inline CRM header/nav/chat shell.
- Direct bottom-nav markup as final route authority.
- Hardcoded CRM route labels.
- Inline assistant copy that claims broad data access.

Replacement complexity:

`MEDIUM`

Estimated dependency count:

- Moderate. It is not imported by modules, but it provides critical DOM anchors and script ordering.

Blast radius:

- Medium. Bad changes can break boot, auth, nav, or mounting.

Migration risk:

- Medium if replaced after platform shell is ready.
- High if replaced before `app.js` responsibilities are extracted.

### `dashboard.js`

Survivability:

`EXTRACT_THEN_REPLACE`

What survives:

- Pattern of route template plus bind entry.
- Use of `AppState` for user identity.
- Use of `Memory` cleanup and abortable loading.
- Use of `RenderEngine`.
- Event emission for route load/error.
- Some advisor-status questions may inform future Advisor OS home.

What does not survive:

- CRMAddlife dashboard copy.
- Widget-centric dashboard layout as the final Forge first screen.
- Dashboard-owned productivity scoring if a future domain owner exists.
- Direct route-level blending of activity, cartera, and fidelization presentation.
- `CRM Addlife` branding.

Replacement complexity:

`MEDIUM`

Estimated dependency count:

- Moderate. It imports six platform/data services and reads two DB collections.

Blast radius:

- Low to medium now that RUNTIME-013 lazy-loads it.

Migration risk:

- Medium. Replacing it affects default authenticated experience, but lazy-loading has reduced boot risk.

## Shell Responsibility Survivability

| Responsibility | Survives as-is? | Future action |
| --- | --- | --- |
| Navigation | No | Extract route contract into Forge Platform. |
| Route registry | No | Replace with platform route manifests/descriptors. |
| Auth bootstrap | Partially | Extract into platform auth service. |
| Supabase bootstrap | Partially | Keep SupabaseRuntime concept; remove shell global leakage. |
| Layout shell | No | Replace with Forge-native layout. |
| Menu system | No | Replace with Forge navigation model. |
| Dashboard rendering | No | Replace with Advisor OS home/decision cockpit. |
| Route loader | Yes, as pattern | Move into platform router. |
| Loading/error state | Yes, as pattern | Move into platform runtime. |

## No-Touch List

Do not invest significant architecture work in:

- CRMAddlife header layout in `index.html`.
- CRMAddlife bottom navigation markup in `index.html`.
- Inline chat shell in `index.html` / `app.js`.
- Inline login UI inside `app.js`.
- `dashboard.js` widget layout.
- `dashboard.js` CRMAddlife branding/copy.
- `app.js` as a permanent route registry.
- `app.js` as a permanent auth service owner.
- `window.supabaseClient` compatibility.
- `getSupabase` export from the root shell.
- Legacy route labels and visual shell polish.

Reason:

These surfaces are useful for continuity, not for final architecture. They should be stabilized only enough to protect current operation while Forge-native runtime and domain surfaces are extracted around them. They should not receive heavy architectural investment.

## Final Survivability Assessment

If Forge were rebuilt from scratch today:

- `app.js` would not survive as the final shell.
- `index.html` would not survive as the final document shell.
- `dashboard.js` would not survive as the final Advisor OS home.

Useful patterns should be extracted. The legacy shell itself should be replaced.
Compatibility should be preserved temporarily, then retired as Forge-native surfaces assume ownership.

# Supabase Auth on GitHub Pages

Status: DEPLOYMENT READINESS

Scope: ForgeOS project-site deployment at `https://jorgeprdz.github.io/ForgeOS/`.

This document validates the Supabase Auth requirements for GitHub Pages. It does not authorize product features, schema changes, migrations, provider changes, or route refactors.

---

## Current Auth Loading Order

`index.html` loads auth dependencies in this order:

1. Supabase UMD SDK from `https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js`
2. `env.js`
3. `app.js`

This order is required because `platform/auth/auth-service.js` reads `window.__ENV__` during module evaluation.

Required runtime environment shape:

```js
window.__ENV__ = {
  SUPABASE_URL: "...",
  SUPABASE_KEY: "...",
  DEMO_MODE: "false"
};
```

Required variable names:

- `SUPABASE_URL`
- `SUPABASE_KEY`

Optional visual validation variable:

- `DEMO_MODE`

The key must be the public Supabase anon key. Data protection must come from Supabase Row Level Security, not from hiding the anon key in browser code.

`DEMO_MODE` bypasses Supabase Auth only when it is exactly `"true"`. Missing, empty or `"false"` values preserve the normal Supabase auth flow.

---

## GitHub Actions Environment Strategy

The Pages workflow generates `env.js` before uploading the Pages artifact.

Required GitHub repository secrets:

- `SUPABASE_URL`
- `SUPABASE_KEY`

Optional GitHub repository variable:

- `DEMO_MODE`

`env.js` must not be committed. The repository tracks `env.js.example` only.

If either secret is missing, the workflow should fail before deploying a broken app shell.

Exception: if `DEMO_MODE` is exactly `"true"`, the workflow may deploy a visual validation build without Supabase secrets. This is for GitHub Pages smoke validation only.

---

## Auth Runtime Behavior

Auth is owned by `platform/auth/auth-service.js`.

Current behavior:

- `AuthService.init()` validates that `window.supabase` exists.
- `AuthService.init()` validates `SUPABASE_URL` and `SUPABASE_KEY`.
- `window.supabase.createClient()` is called with:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `detectSessionInUrl: true`
- `window.supabaseClient` remains exposed for legacy compatibility.
- `SupabaseRuntime.init(this.client)` receives the same client.
- `AuthService.getUser()` hydrates `AppState.set('user', this.user)`.
- Logged-in users restore directly into the app shell.
- Unauthenticated users see the login screen.
- Logout destroys module lifecycle, signs out, resets app state, and reloads.

Demo behavior:

- `AuthService.init()` creates a local demo client.
- `AuthService.getUser()` returns a local demo user.
- `window.supabaseClient` and `SupabaseRuntime` receive the local demo client for legacy compatibility.
- IndexedDB and local telemetry remain available.
- No Supabase network auth is required.
- The UI displays a small `Demo Mode` badge.

OAuth login must redirect back to the GitHub Pages project path, not only to the GitHub Pages origin.

Required redirect target shape:

```text
https://jorgeprdz.github.io/ForgeOS/
```

If the app is opened through `index.html`, this variant may also be used:

```text
https://jorgeprdz.github.io/ForgeOS/index.html
```

---

## Required Supabase Dashboard Settings

Configure Supabase Auth URL settings as follows.

Site URL:

```text
https://jorgeprdz.github.io/ForgeOS/
```

Redirect URLs / allowlist:

```text
https://jorgeprdz.github.io/ForgeOS/
https://jorgeprdz.github.io/ForgeOS/index.html
```

Hash routes do not require separate callback URLs because fragments are not sent to the server during OAuth redirects.

Query routes are not currently part of the Forge route model. If future OAuth flows add query-based callback routes, those exact callback URLs must be added to the Supabase redirect allowlist before deployment.

---

## Manual Validation Checklist

After deployment:

1. Open `https://jorgeprdz.github.io/ForgeOS/`.
2. Confirm `env.js` loads with HTTP 200.
3. Confirm `window.__ENV__.SUPABASE_URL` exists.
4. Confirm `window.__ENV__.SUPABASE_KEY` exists.
5. Click Google login.
6. Confirm the browser redirects to Google.
7. Complete login.
8. Confirm the browser returns to `https://jorgeprdz.github.io/ForgeOS/` or `https://jorgeprdz.github.io/ForgeOS/index.html`.
9. Confirm the dashboard loads after session detection.
10. Refresh the page and confirm the Supabase session persists.
11. Click logout and confirm the login screen returns after reload.

---

## Readiness Decision

GO: Supabase Auth is ready for GitHub Pages configuration when repository secrets and redirect allowlist entries are present.

NO-GO: Do not validate live auth until `env.js` is generated in the Pages artifact and Supabase allows the ForgeOS project URL.

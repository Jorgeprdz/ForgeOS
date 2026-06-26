# GitHub Pages Deployment

Status: DEPLOYMENT CONFIGURATION

Scope: ForgeOS project-site deployment at `https://jorgeprdz.github.io/ForgeOS/`.

This document does not authorize product features, migrations, route changes or architecture refactors.

---

## Environment

GitHub Pages cannot read runtime environment variables from the server.

Forge requires an `env.js` file before `app.js` boots:

```js
window.__ENV__ = {
  SUPABASE_URL: "...",
  SUPABASE_KEY: "...",
  DEMO_MODE: "false"
};
```

Do not commit real credentials.

The repository tracks `env.js.example` only.

The real `env.js` must be generated during deployment from GitHub Secrets:

- `SUPABASE_URL`
- `SUPABASE_KEY`

The Supabase key used here must be the public anon key, with Row Level Security enforcing data access.

For visual validation only, GitHub Actions may generate:

```js
window.__ENV__ = {
  SUPABASE_URL: "",
  SUPABASE_KEY: "",
  DEMO_MODE: "true"
};
```

`DEMO_MODE` is disabled unless it is exactly `"true"`. Production auth behavior remains unchanged when the value is missing, empty or `"false"`.

---

## Required Supabase Redirect

Configure Supabase OAuth redirect URLs to include:

```text
https://jorgeprdz.github.io/ForgeOS/
```

If Supabase requires exact redirect variants, also allow:

```text
https://jorgeprdz.github.io/ForgeOS/index.html
```

---

## Pages Source

Recommended source:

```text
GitHub Actions
```

Reason:

- The app currently lives at repository root.
- The deployment must generate `env.js`.
- A workflow avoids committing secrets.

---

## Static Hosting Constraints

Forge uses hash routing, so GitHub Pages does not require `404.html` for current routes.

The service worker and manifest must use project-site-safe relative paths, not root `/` paths.

Final principle:

```text
Deploy static assets safely under /ForgeOS/ without leaking credentials.
```

# GitHub Pages Deployment

Status: DEPLOYMENT CONFIGURATION

Scope: ForgeOS project-site deployment at `https://jorgeprdz.github.io/ForgeOS/`.

This document does not authorize product features, migrations, route changes or architecture refactors.

---

## Production deployment authorization

Production GitHub Pages deployment is explicit and SHA-bound.

```text
PAGES_DEPLOYMENT_TRIGGER=EXPLICIT_WORKFLOW_DISPATCH
MAIN_PUSH_AUTO_DEPLOY=DISABLED
EXACT_SHA_REQUIRED=YES
EXPLICIT_AUTHORIZATION_REQUIRED=YES
MERGE != DEPLOY
```

The production workflow is `.github/workflows/pages.yml`.

A production deployment is eligible only when all of the following are true:

- the workflow is explicitly dispatched against `main`;
- `expected_sha` exactly equals the workflow's `github.sha`;
- remote `main` still resolves to that exact SHA before deployment permissions are used;
- `authorization` exactly equals `DEPLOY_FORGE_PAGES`.

A push or merge to `main` is not deployment authorization. Feature branches cannot deploy the production Pages environment. Missing or incorrect authorization and stale SHA values fail closed.

The historical Aura branch dispatcher no longer dispatches the production Pages workflow. Pages public acceptance and deployment observation are explicit verification workflows and do not run merely because `main` advanced.

The current public site is not rolled back by this governance rule. Site content changes only when a separately authorized production Pages dispatch succeeds.

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
- Explicit dispatch separates repository integration from production publication.

---

## Static Hosting Constraints

Forge uses hash routing, so GitHub Pages does not require `404.html` for current routes.

The service worker and manifest must use project-site-safe relative paths, not root `/` paths.

Final principle:

```text
Deploy static assets safely under /ForgeOS/ without leaking credentials, and only from an explicitly authorized exact main SHA.
```

# Forge Aura Auth Premium Entry & Google Home Redirect Acceptance 001

```text
PHASE=FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_RECONCILIATION_001
BASE_MAIN_SHA=ead05e0085d2c0743833515316558d2e8b6b98cc
FINAL_IMPLEMENTATION_SHA=0cfa8141d120f96d5054e43bbf913c1162bad6ef
VALIDATED_IMPLEMENTATION_CI_RUN=31287831300
SCREENSHOT_ARTIFACT_ID=9030417566
SCREENSHOT_ARTIFACT_SHA256=dc4d33839fcb698a3d232761f9939abbebabaa43185d6345bcb07c48d2707992
PAGES_ARTIFACT_ID=9030411103
PAGES_ARTIFACT_SHA256=5276e1c4ebfec414db24d4edeb250c9a95b79c79482673d7326e3f55406c2f53
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
FINAL_STATUS=READY_FOR_HUMAN_REVIEW
```

## Acceptance matrix

| Contract | State |
| --- | --- |
| Constitutional gate | PASS |
| Aura Light / ADR-024 gate | PASS |
| Robocop lock | PASS |
| Existing Supabase Auth reused | PASS |
| New auth engine count | 0 |
| New identity model count | 0 |
| Default Google route | `inicio` |
| Hardcoded Google → Pipeline redirect | 0 |
| Explicit valid return route | PASS |
| Default route return | PASS |
| Password auth contract | PASS |
| Google auth contract | PASS |
| Session restore | PASS |
| Signout | PASS |
| Password-manager autocomplete | PASS |
| Password persistence | 0 |
| Token/stack visible diagnostic | 0 |
| Login/Pipeline visual coupling | 0 |
| Material visual imports | 0 |
| Legacy visual imports | 0 |
| Local ungoverned tokens | 0 |
| Database mutation | 0 |
| RLS mutation | 0 |
| Google credential/provider mutation | 0 |
| Scope guard vs live merge-base | PASS |
| Mobile 390/430 | PASS |
| Tablet 834 | PASS |
| Desktop 1440 | PASS |
| Zoom 200% | PASS |
| Keyboard/focus | PASS |
| Reduced motion | PASS |
| Canonical Pages artifact | PASS |
| Auth import graph | PASS |
| OAuth callback import graph | PASS |
| Blank-screen import failure guard | PASS |
| Screenshot evidence | PASS |

## Validated implementation workflow

GitHub Actions run `31287831300` executed against exact implementation SHA `0cfa8141d120f96d5054e43bbf913c1162bad6ef`; all three phase jobs passed:

- `Constitutional Auth contract and scope` — PASS
- `Canonical Pages artifact and Auth import graph` — PASS
- `Auth responsive accessibility and visual acceptance` — PASS

The browser suite validated the required product-facing Login/Callback states, responsive viewports, keyboard/focus behavior, 200% zoom reflow, reduced-motion semantics and screenshot existence.

## Screenshot evidence

Visual artifact `9030417566` (`sha256:dc4d33839fcb698a3d232761f9939abbebabaa43185d6345bcb07c48d2707992`) contains:

- `login-mobile-390.png`
- `login-mobile-430.png`
- `login-tablet-834.png`
- `login-desktop-1440.png`
- `login-password-error.png`
- `login-google-loading.png`
- `oauth-callback-success.png`
- `oauth-callback-error.png`
- `login-zoom-200.png`

## Pages evidence

Canonical Pages diagnostics are stored in artifact `9030411103` (`sha256:5276e1c4ebfec414db24d4edeb250c9a95b79c79482673d7326e3f55406c2f53`).

```text
PAGES_ARTIFACT_BUILD=PASS
AUTH_IMPORT_GRAPH=PASS
OAUTH_CALLBACK_IMPORT_GRAPH=PASS
NO_BLANK_SCREEN_IMPORT_FAILURE=PASS
```

## Routing closure

```text
NO_EXPLICIT_ROUTE
  -> GOOGLE_AUTH_SUCCESS
  -> VALID_SESSION
  -> route=inicio

EXPLICIT_VALID_PRE_AUTH_ROUTE
  -> AUTH_REQUIRED
  -> GOOGLE_AUTH_SUCCESS
  -> VALID_SESSION
  -> governed return route
```

`route=pipeline` is no longer hardcoded by the Google callback.

## Security closure

The implementation reuses the existing Supabase authentication/session authority. It does not introduce a new authentication engine, identity model, database schema, RLS policy, provider configuration or credential store. Productive callback UI does not expose OAuth tokens, passwords, secrets, stack traces or raw provider diagnostics.

## Scope closure

The implementation was validated against live `main` SHA `ead05e0085d2c0743833515316558d2e8b6b98cc`; the Auth scope guard passed against the real merge-base. Concurrent main integrations were preserved.

A separate historical Income-specific scope guard can reject Auth files when its unrelated workflow evaluates this branch. This Auth phase intentionally does not relax that external guard.

No merge, auto-merge or production deployment is authorized or performed by this acceptance record.

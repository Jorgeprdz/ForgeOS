# Forge Aura Auth Premium Entry & Google Home Redirect Acceptance 001

```text
PHASE=FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_RECONCILIATION_001
BASE_MAIN_SHA=f4482431563b98a594e00daa9f6ae4c57db5f637
IMPLEMENTATION_SHA=PENDING_REBASED_IMPLEMENTATION_COMMIT
CI_RUN=PENDING
SCREENSHOT_ARTIFACT=PENDING
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Acceptance matrix

| Contract | State before exact-head CI |
| --- | --- |
| Constitutional gate | PASS |
| Aura Light / ADR-024 gate | PASS |
| Robocop lock | PASS |
| Existing Supabase Auth reused | PASS |
| New auth engine count | 0 |
| New identity model count | 0 |
| Default Google route | `inicio` |
| Hardcoded Google→Pipeline | 0 |
| Explicit valid return route | PASS by unit contract |
| Password manager autocomplete | PASS |
| Password persistence | 0 |
| Token/stack visible diagnostic | 0 |
| Login Pipeline CSS coupling | 0 |
| Database mutation | 0 |
| RLS mutation | 0 |
| Google credential/provider mutation | 0 |
| Concurrent Quotes main changes preserved | PASS |
| Mobile 390/430 | PENDING CI |
| Tablet 834 | PENDING CI |
| Desktop 1440 | PENDING CI |
| Zoom 200% | PENDING CI |
| Keyboard/focus | PENDING CI |
| Reduced motion | PENDING CI |
| Canonical Pages artifact | PENDING CI |
| Auth import graph | PENDING CI |

## Required screenshot names

- `login-mobile-390.png`
- `login-mobile-430.png`
- `login-tablet-834.png`
- `login-desktop-1440.png`
- `login-password-error.png`
- `login-google-loading.png`
- `oauth-callback-success.png`
- `oauth-callback-error.png`
- `login-zoom-200.png`

No PASS is claimed for browser, Pages or visual acceptance before GitHub Actions validates the exact rebased implementation head.

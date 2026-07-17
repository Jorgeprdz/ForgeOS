# Advisor OS Pipeline UI System Discovery 067G10

## Gate result

All mandatory UI discovery gates pass before Pipeline UI implementation.

| Source | Purpose/status | Reuse/conflict |
|---|---|---|
| `docs/static-preview/templates/forge-mobile/TEMPLATE_SOURCE_OF_TRUTH.md` | Canonical mobile reference to approved Forge Alive 056U | No reinterpretation |
| `forge-mobile-tokens.css`, `forge-mobile-shell.css`, `forge-mobile-components.css` | Navy/gold/cyan/glass tokens, shell, cards, buttons, lists | Reuse token names/fallbacks and component geometry |
| `FORGE_DESKTOP_TEMPLATE_SYSTEM_LOCK_058J.md` | Locked desktop skeleton and breakpoints | Pipeline maps to Command Table; detail maps Record Detail |
| `FORGE_MOBILE_NAVIGATION_AND_SMART_WIDGET_PATTERN_SCOPE_057C.md` | Mobile nav/cards/touch/overlap rules | Existing global nav remains authoritative |
| `platform/navigation-runtime.js` | Forge navigation authority | Deep links call it through host; no parallel router |
| `platform/app/forge-app-shell.js` | Runtime shell coordinator | Module renderer only; shell not replaced |
| `styles.css` | Active legacy shared variables/components | Reuse compatible variables; reject CRM identity/theme as canonical design truth |
| Accepted Forge Alive screenshots/evidence under `docs/evidence` | Visual baseline | Secondary validation reference |

Breakpoints: mobile/tablet behavior through 900px; desktop begins 901px, with locked 1200/1400/1600/1920 bands. Accessibility: semantic landmarks/headings/forms, visible focus, keyboard controls, minimum 44px touch targets, labels, escaped data, and no color-only meaning.

Conflict: legacy light iOS/CRM styling versus locked Forge Alive navy/gold/cyan. Selected authority: Constitution → 058J/057C/056U → shared compatible components → legacy. Pipeline uses Forge tokens with existing runtime fallbacks and local module selectors, without asserting a new universal design system or changing navigation.

```text
UI_GUIDELINES_DISCOVERED=YES
ADVISOR_OS_TEMPLATE_DISCOVERED=YES
DESIGN_TOKENS_DISCOVERED=YES
NAVIGATION_AUTHORITY_DISCOVERED=YES
RESPONSIVE_RULES_DISCOVERED=YES
ACCESSIBILITY_RULES_DISCOVERED=YES
UI_CONFLICTS_RESOLVED_OR_REPORTED=YES
EXISTING_ADVISOR_OS_SHELL_REUSED=YES
EXISTING_NAVIGATION_AUTHORITY_REUSED=YES
EXISTING_DESIGN_TOKENS_REUSED=YES
NEW_PARALLEL_DESIGN_SYSTEM_CREATED=NO
NEW_PARALLEL_NAVIGATION_CREATED=NO
```

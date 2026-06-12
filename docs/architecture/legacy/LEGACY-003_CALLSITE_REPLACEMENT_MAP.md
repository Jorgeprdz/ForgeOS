# LEGACY-003 Call-Site Replacement Map

Report ID: LEGACY-003
Status: CONTROLLED REPAIR PLANNING / NO IMPLEMENTATION
Date: 2026-06-11

## Purpose

Map the exact future replacements for the three active `window.navigateTo` call sites.

No implementation was performed.

## Replacement Principle

Route modules should request navigation through Forge's platform-owned navigation contract:

```js
Navigation.navigate(route, params)
```

Route modules should not:

- Call `window.navigateTo`.
- Import from `app.js`.
- Access the private `EnterpriseRouter`.
- Manipulate nav button classes.
- Write URL hash directly.

## Required Import For Future Repair

If LEGACY-004 implements the selected adapter, each repaired route module should import:

```js
import { Navigation } from './platform/navigation-runtime.js';
```

This path assumes `platform/navigation-runtime.js` is created at repo root under the future ARCH-001 top-level `platform/` folder.

## Active Call Sites

### 1. `referidos.js:167`

Current call:

```js
window.navigateTo('prospeccion');
```

Context:

```js
localStorage.setItem('auto_prospecto', JSON.stringify(ref));
localStorage.setItem('auto_generar_guion', 'true');
window.navigateTo('prospeccion');
```

Replacement call:

```js
Navigation.navigate('prospeccion', {
    source: 'referidos',
    handoffKey: 'auto_prospecto',
    autoGenerateKey: 'auto_generar_guion',
});
```

Risk:

`LOW_TO_MEDIUM`

Reason:

- Single call site.
- Workflow handoff already uses localStorage.
- Must preserve timing so `prospeccion.js` reads handoff keys after route transition.

Validation needed:

- Create/select a referred contact.
- Trigger "Enviar Mensaje".
- Confirm route changes to `prospeccion`.
- Confirm prospecting form receives localStorage handoff.
- Confirm auto script generation behavior remains intact if currently supported.

### 2. `comisiones.js:310`

Current call:

```js
setTimeout(() => window.navigateTo('comisiones'), 400);
```

Context:

- Runs after saving the advisor finance profile.
- Intended to refresh/re-enter the same `comisiones` route after remote upsert.

Replacement call:

```js
setTimeout(() => {
    Navigation.navigate('comisiones', {
        source: 'comisiones',
        reason: 'profile_saved',
    });
}, 400);
```

Risk:

`MEDIUM`

Reason:

- `comisiones.js` is the highest-risk route from prior runtime audits.
- Navigation itself is simple, but route behavior touches Supabase profile persistence and financial UI.

Validation needed:

- Start with no advisor finance profile.
- Save profile config.
- Confirm toast still appears.
- Confirm route refresh/re-entry occurs.
- Confirm finance UI renders after profile exists.
- Confirm no duplicate listeners or repeated saves.

### 3. `comisiones.js:466`

Current call:

```js
setTimeout(() => window.navigateTo('comisiones'), 400);
```

Context:

- Runs after destructive profile reset.
- Intended to return to/reload config state.

Replacement call:

```js
setTimeout(() => {
    Navigation.navigate('comisiones', {
        source: 'comisiones',
        reason: 'profile_reset',
    });
}, 400);
```

Risk:

`MEDIUM`

Reason:

- Same route self-refresh as profile save.
- Reset action is destructive and must preserve confirmation behavior.
- Navigation adapter must not change the remote delete flow.

Validation needed:

- Confirm reset prompt still appears.
- Cancel reset and confirm no navigation.
- Confirm reset and verify profile delete still occurs.
- Confirm route refresh/re-entry occurs after successful reset.
- Confirm config form appears after reset.

## Backup File References

`comisiones.js.bk` contains historical `window.navigateTo` references.

Policy:

- Do not repair backup file as part of LEGACY-004 unless explicitly approved.
- Do not let backup references block active runtime repair.
- Consider separate legacy cleanup if backup files are retained.

## Replacement Order

Recommended LEGACY-004 order:

1. Create `platform/navigation-runtime.js`.
2. Register current shell router from `app.js`.
3. Bind temporary `window.navigateTo` shim to `Navigation.navigate`.
4. Replace `referidos.js:167`.
5. Replace `comisiones.js:310`.
6. Replace `comisiones.js:466`.
7. Validate all route and workflow behavior.

## Success Criteria For Call-Site Repair

| Criterion | Expected |
| --- | --- |
| Active `window.navigateTo` call sites | 0 |
| Temporary `window.navigateTo` shim | Present and delegates to `Navigation.navigate` |
| Route modules importing `app.js` | 0 |
| Route names changed | 0 |
| Folder movement | 0 |
| Broad route refactor | 0 |


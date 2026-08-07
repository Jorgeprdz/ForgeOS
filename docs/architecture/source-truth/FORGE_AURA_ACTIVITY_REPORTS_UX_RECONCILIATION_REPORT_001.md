# FORGE AURA ACTIVITY & REPORTS UX RECONCILIATION REPORT 001

EXECUTION_ID=FORGE_AURA_ACTIVITY_REPORTS_UX_DIRECTIVE_RECONCILIATION_001

## Base aprobada

- PIPELINE_PASS_PR=278
- PIPELINE_PASS_BRANCH=codex/forge-aura-pipeline-ux-reconciliation-001
- PIPELINE_PASS_SHA=d986de0f660cab8ed4da6b6e32873a17af378fa8
- SOURCE_BRANCH=codex/forge-aura-pipeline-ux-reconciliation-001
- SOURCE_SHA=d986de0f660cab8ed4da6b6e32873a17af378fa8
- DELIVERY_BRANCH=codex/forge-aura-activity-reports-ux-reconciliation-001-corrected

## Descubrimiento y decisión de arquitectura

La primera ejecución encontrada en `codex/forge-aura-activity-reports-ux-reconciliation-001` no fue aceptada como base porque introducía autoridad nueva fuera de alcance: calendario de actividad, reporting adapters, writer, migración Supabase y una reescritura del contrato canónico de eventos. Esa rama se conserva sin modificar como evidencia de una ejecución no conforme.

La implementación corregida parte nuevamente del SHA PASS exacto de Pipeline y reutiliza exclusivamente autoridades productivas ya presentes en ese SHA:

1. `docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.js/.mjs` para FES + Productive Activity Reporting.
2. `docs/static-preview/forge-alive-material3/activity-reports-productivity-runtime.js` para periodo, comparación, meta mensual, pólizas confirmadas, Forecast, estados parciales, session binding, advisor switch scrub y late-result rejection.
3. `docs/static-preview/forge-alive-material3/activity-manual-entry.js` como writer FES manual existente. Aura no crea un writer alterno.

No se importa CSS, tokens, layout ni paleta Material 3. La capa visual nueva vive únicamente en `docs/static-preview/forge-aura/activity/activity.css`.

## Alcance implementado

- Nueva superficie `docs/static-preview/forge-aura/activity/activity-module.js`.
- Nueva capa visual Aura `docs/static-preview/forge-aura/activity/activity.css`.
- Integración mínima compartida en `app-v4.js`, `aura-router-v4.js` y `aura-shell.js`.
- Tabs accesibles Actividad/Reportes con `tablist`, `tab`, `tabpanel`, `aria-controls`, `aria-labelledby`, roving tabindex y flechas/Home/End.
- Acción primaria `Registrar actividad` que delega al writer FES manual existente.
- Resumen de actividad basado en FES/REP.
- Selector de periodos productivos: Hoy, Semana actual, Mes actual, Últimos 30 días.
- Comparación con periodo anterior usando la autoridad existente.
- Meta mensual y pólizas confirmadas mediante el runtime productivo existente.
- Estado parcial que conserva la actividad válida cuando una fuente secundaria falla.
- Estado vacío que distingue ausencia confirmada de hechos de dato desconocido.
- Distribución con resumen textual y tabla accesible.
- Responsive móvil y `prefers-reduced-motion`.
- Scrub al desmontar/cambiar sesión mediante los runtimes existentes.

## Límites deliberados

No se crean ni duplican motores de puntos, conversiones, coaching, calendario, reporting, ledger o writer. Si una métrica no está expuesta por las autoridades productivas verificadas en la base, Aura no la inventa. La primera entrega prioriza una reconciliación honesta sobre llenar tarjetas con datos sintéticos.

El writer existente conserva su contrato actual de captura. Su lógica productiva se reutiliza; Aura únicamente gobierna la jerarquía visual alrededor del componente y no importa su stylesheet legacy.

## Guard de alcance

`.github/workflows/activity-reports-aura.yml` compara el head contra `d986de0f660cab8ed4da6b6e32873a17af378fa8`. Falla ante cambios en Pipeline/Login o cualquier ruta fuera de la allowlist explícita:

- `docs/static-preview/forge-aura/activity/**`
- `docs/static-preview/forge-aura/app-v4.js`
- `docs/static-preview/forge-aura/aura-router-v4.js`
- `docs/static-preview/forge-aura/aura-shell.js`
- prueba contractual, workflow y los dos documentos de esta ejecución.

## Estado previo a CI

Los contratos y el scope guard quedan incluidos en la rama, pero ningún criterio dependiente de GitHub Actions o aceptación real de navegador se marca PASS hasta observar el run asociado al SHA final.

MAIN_MUTATED=NO
MERGE_EXECUTED=NO
AUTO_MERGE_ENABLED=NO

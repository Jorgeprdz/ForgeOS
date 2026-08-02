# FIP Home Canonical Action Cards and Deduplicated Mosaic

## Objective

Keep the large Home action surfaces as the single canonical UI for daily plan and priority follow-up, while limiting Advisor Intelligence to supporting signals.

## Implemented

- `home-daily-priority` remains available in the Pack 07 composed experience.
- The productive Home bridge excludes canonical action widgets from the supporting intelligence mosaic.
- The large `Plan de hoy` card remains the canonical daily-priority surface.
- The large `Seguimiento prioritario` card remains the canonical next-action surface.
- Nash, relationship, activity, business and Alfred operational context remain in the mosaic.
- No action is sent, scheduled or executed automatically.
- Logout scrub and late-result rejection remain unchanged.

## Expected mobile hierarchy

1. Plan de hoy
2. Seguimiento prioritario
3. Resumen del día
4. Advisor Intelligence supporting mosaic
   - Recomendación de Nash
   - Contexto de relación
   - Patrones de ejecución
   - Inteligencia del negocio
   - Resumen operativo

## Governance

```text
MERGE_AUTHORIZATION=NOT_GRANTED
PUBLIC_ACCEPTANCE=NOT_YET_EXECUTED
CANONICAL_ACTION_DUPLICATION=REMOVED
```

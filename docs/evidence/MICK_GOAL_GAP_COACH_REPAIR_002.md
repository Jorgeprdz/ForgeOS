# Reparación 2 — Mick Goal Gap Coach

Estado: implementación controlada en rama.

## Objetivo

Conectar las dos metas mensuales del asesor con una lectura accionable de Mick:

- meta de pólizas desde Forecast;
- meta económica desde `advisor_monthly_policy_goals`;
- ingreso real desde Compensation Intelligence.

## Mensaje esperado

Mick expresa la brecha en lenguaje humano, por ejemplo:

```text
Te faltan 2 pólizas para alcanzar tu meta comercial.
Te faltan $2,500 para alcanzar tu meta de ingresos.
```

El tono es directo y cercano, sin regaño, burla ni motivación vacía.

## Autoridades

```text
POLICY_GAP=ADVISOR_FORECAST_WIDGET
POLICY_FACT=POLICY_SOLD_CONFIRMED
ECONOMIC_TARGET=ADVISOR_MONTHLY_POLICY_GOALS_APPEND_ONLY
REAL_INCOME=ADVISOR_COMPENSATION_INCOME_WIDGET_SNAPSHOT_001
```

## Separación de verdad

```text
ESTIMATED_AS_REAL=NO
POTENTIAL_AS_REAL=NO
UNKNOWN_AS_ZERO=NO
PIPELINE_AS_CONFIRMED_POLICY=NO
PAID_AND_EARNED_MERGED=NO
```

Mick prioriza ingreso pagado cuando está disponible; en su ausencia usa devengado y después la mejor base real canónica. El ingreso estimado, potencial y en riesgo se explica por separado y nunca reduce silenciosamente la brecha real.

## Superficie

Home muestra una tarjeta independiente:

```text
MICK · FORECAST
```

La tarjeta no depende de que Forecast haya quedado entre las dos tarjetas rankeadas visibles. Lee el inventario productivo completo y se reconstruye después de cada reconciliación.

## Límites

```text
DATABASE_MIGRATION=NO
COMPENSATION_WRITE=NO
PRODUCTION_WRITE=NO
AUTOMATIC_ACTION=NO
AUTOMATIC_NAVIGATION=NO
OTHER_MODULE_MUTATION=NO
MERGE=NOT_INCLUDED
DEPLOY=NOT_INCLUDED
```

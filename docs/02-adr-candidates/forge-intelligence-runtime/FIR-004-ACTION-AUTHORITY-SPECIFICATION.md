# FIR-004 · Action Authority Specification

**Estado:** Draft arquitectónico  
**Versión:** 0.1  
**Dependencias:** FIR-001, FIR-002 y FIR-003

## Propósito

Definir quién puede leer, interpretar, recomendar, redactar, preparar y ejecutar acciones dentro de Forge OS.

## Regla central

```text
La inteligencia propone.
El humano autoriza cuando corresponde.
Forge Core ejecuta.
```

Ningún provider o modelo posee autoridad de ejecución.

## Niveles de autoridad

```text
A0 · Sin acceso
A1 · Lectura autorizada
A2 · Interpretación
A3 · Recomendación
A4 · Redacción
A5 · Preparación de acción
A6 · Confirmación humana
A7 · Ejecución por Forge Core
A8 · Verificación y auditoría
```

## Matriz inicial

| Actor | Leer | Interpretar | Recomendar | Redactar | Preparar | Confirmar | Ejecutar |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nash | Sí | Sí | Sí | Sí | Limitado | No | No |
| Mick | Sí | Sí | Sí | No | Limitado | No | No |
| Candy Crush | Sí | Sí | Sí | No | No | No | No |
| Alfred | Sí | Sí | Sí | No | Sí | No | No |
| Command Bar | Sí | No | No | No | No | No | No |
| Provider LLM | Contexto mínimo | Sí | Sí | Sí | No | No | No |
| Humano autorizado | Sí | Sí | Sí | Sí | Sí | Sí | Según rol |
| Forge Core | Sí | No | No | No | Recibe | Verifica | Sí |

## Tipos de acción

### Read-only

Buscar, consultar, resumir o mostrar datos. Puede ejecutarse sin confirmación adicional si los permisos ya fueron validados.

### Recomendación

Sugiere prioridades o seguimiento. Nunca modifica estado.

### Draft

Mensaje, correo, guion o nota. Debe marcarse como borrador y no enviable.

### Acción reversible

Crear tarea o actualizar etiqueta. Requiere validación y, según política, confirmación.

### Acción externa o sensible

Enviar mensajes, crear citas, modificar CRM, mover Pipeline o cambiar permisos. Requiere confirmación humana sobre el payload exacto.

### Acción irreversible

Exige permiso explícito, confirmación reforzada, resumen de impacto, idempotency key, auditoría y compensación cuando exista.

## Contrato de acción propuesta

```typescript
interface ForgeProposedAction {
  version: string;
  actionId: string;
  correlationId: string;
  actionType: string;
  proposedBy: {
    component: string;
    intelligenceId?: string;
  };
  target: {
    system: string;
    subjectType: string;
    subjectId: string;
  };
  parameters: Record<string, unknown>;
  authority: {
    requiredPermission: string;
    humanApprovalRequired: boolean;
    executableBy: "FORGE_CORE";
  };
  safety: {
    reversible: boolean;
    idempotencyRequired: boolean;
    sensitivity: string;
    impactSummary: string;
  };
  evidenceIds: string[];
}
```

## Confirmación humana

La confirmación se vincula al payload exacto. Cambiar cualquier parámetro invalida la autorización.

La UI debe mostrar acción, destino, contenido, consecuencias, datos utilizados, reversibilidad e identidad del ejecutor.

## Forge Action Engine

Es el único autorizado para ejecutar. Debe validar esquema, permisos, confirmación e idempotencia; ejecutar; registrar; manejar errores y aplicar rollback o compensación.

## Prohibiciones

- Ejecutar desde texto generado.
- `fetch` directo desde una inteligencia hacia sistemas de escritura.
- Tratar recomendación como autorización.
- Reutilizar confirmaciones antiguas.
- Ocultar mutaciones detrás de previews.
- Marcar éxito antes de verificar destino.
- Handlers de mutación inline en Command Bar.

## Estados de una acción

```text
PROPOSED
→ VALIDATED
→ AWAITING_CONFIRMATION
→ CONFIRMED
→ EXECUTION_PENDING
→ EXECUTED
→ VERIFIED
```

Estados alternos: `REJECTED`, `UNAUTHORIZED`, `EXPIRED`, `CANCELLED`, `FAILED`, `ROLLED_BACK`, `COMPENSATION_REQUIRED`.

## Ejemplos

### Nash

Solicitud de seguimiento → draft → Alfred prepara acción → preview → humano confirma → Forge Core envía → auditoría verifica.

### Mick

Pregunta de producción → análisis → insight → sin acción ejecutable.

### Candy Crush

Lee métricas autorizadas → calcula XP derivado → muestra progreso → no modifica métrica fuente.

## Criterios de aceptación

- Matriz aplicada en runtime.
- Acciones sensibles con confirmación exacta.
- Forge Core como único executor.
- Idempotencia para mutaciones.
- Auditoría verificable.
- Tests de rechazo, permisos, payload modificado y doble ejecución.

# FIR-003 · Context Envelope Specification

**Estado:** Draft arquitectónico  
**Versión:** 0.1  
**Dependencias:** FIR-001 y FIR-002

## Propósito

Definir cómo Forge OS construye y entrega contexto a Alfred y a las inteligencias especializadas.

## Regla central

La UI no construye contexto canónico. El `Forge Context Builder` preserva propietario, evidencia, freshness, versión, permisos, transformación y consumidor autorizado.

## Contrato base

```typescript
interface ForgeContextEnvelope {
  version: string;
  contextId: string;
  correlationId: string;
  generatedAt: string;
  expiresAt?: string;
  actor: {
    userId: string;
    role: string;
    tenantId?: string;
    permissions: string[];
  };
  session: {
    sessionId: string;
    route?: string;
    surface?: string;
    locale?: string;
    timezone?: string;
  };
  subjects: Array<{
    subjectType: string;
    subjectId: string;
    displayName?: string;
  }>;
  records: Array<{
    recordId: string;
    recordType: string;
    owner: string;
    sourceSystem: string;
    sourceVersion?: string;
    capturedAt?: string;
    freshness: "CURRENT" | "STALE" | "UNKNOWN";
    sensitivity: string;
    evidenceIds: string[];
    allowedUses: string[];
    value: unknown;
  }>;
  evidence: Array<{
    evidenceId: string;
    sourceOwner: string;
    sourceReference: string;
    capturedAt?: string;
    integrity?: string;
  }>;
  restrictions: {
    prohibitedFields: string[];
    prohibitedUses: string[];
    maximumSensitivity: string;
  };
}
```

## Propietarios de verdad

| Dominio | Propietario |
|---|---|
| Pipeline | Forge Pipeline |
| Agenda | Forge Calendar |
| Identidad | Forge Identity |
| Prospectos | Forge CRM |
| Conversaciones | Registro conversacional autorizado |
| Métricas | Sistema analítico correspondiente |
| Gamificación | Candy Crush Read Model |
| Permisos | Forge Authorization |
| Ejecución | Forge Core |

Una inteligencia consume datos, pero no adquiere ownership.

## Freshness

Todo dato relevante se clasifica `CURRENT`, `STALE` o `UNKNOWN`. Las conclusiones basadas en datos stale o unknown deben advertirlo.

## Evidencia

Los hechos producidos deben referenciar `evidenceIds`. No se permite fabricar evidencia. Sin evidencia suficiente, el dato debe ser inferencia o unknown.

## Permisos y minimización

El Context Builder aplica mínimo privilegio, mínimo dato, separación por tenant, sensibilidad, propósito y restricciones de exposición al provider.

## Transformaciones

Toda transformación declara fuente, builder, versión, campos descartados, campos derivados, pérdida de precisión y consumidor.

```typescript
interface ContextTransformation {
  transformationId: string;
  version: string;
  sourceRecordIds: string[];
  outputRecordIds: string[];
  discardedFields: string[];
  derivedFields: string[];
}
```

## Contextos por inteligencia

### Nash

Historial autorizado, etapa, objetivo, evidencia, tono y canal previsto.

### Mick

Métricas, Pipeline, periodos, benchmarks autorizados y evidencia operativa.

### Candy Crush

Métricas derivadas autorizadas, objetivos, streaks, progresión y reglas de XP.

### Alfred

Entrada, ruta, selección, comandos disponibles, permisos, sujetos y contexto mínimo para routing.

## Contexto inválido

El runtime rechaza records sin owner, evidencia inexistente, permisos insuficientes, versiones incompatibles, datos críticos expirados y contexto canónico fabricado por UI no autorizada.

## Auditoría

Debe registrarse qué contexto se solicitó, fuentes consultadas, records entregados, campos omitidos, transformaciones, inteligencia consumidora y provider receptor.

## Criterios de aceptación

- Builder canónico.
- Envelope versionado.
- Owners definidos.
- Evidence IDs verificables.
- Freshness obligatorio en datos críticos.
- Tests de minimización, permisos y stale data.

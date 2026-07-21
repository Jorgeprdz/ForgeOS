# FIR-002 · Intelligence Contract Specification

**Estado:** Draft arquitectónico  
**Versión:** 0.1  
**Dependencia:** FIR-001

## Propósito

Definir el contrato común que usan Nash, Mick, Candy Crush, Alfred y cualquier inteligencia futura.

## Regla central

Las inteligencias no intercambian texto libre como contrato principal. Toda entrada y salida debe ser estructurada, versionada, validable, trazable y separada de la ejecución.

## Solicitud canónica

```typescript
interface ForgeIntelligenceRequest {
  version: string;
  requestId: string;
  correlationId: string;
  timestamp: string;
  actor: {
    userId: string;
    role: string;
    tenantId?: string;
  };
  command: {
    commandId: string;
    commandVersion: string;
    intent: string;
    rawInput?: string;
  };
  target: {
    intelligenceId: string;
    capability: string;
  };
  context: ForgeContextEnvelope;
  authority: {
    readAllowed: boolean;
    recommendAllowed: boolean;
    draftAllowed: boolean;
    actionPreparationAllowed: boolean;
    executionAllowed: false;
    humanApprovalRequired: boolean;
  };
}
```

## Resultado canónico

```typescript
interface ForgeIntelligenceResult {
  version: string;
  resultId: string;
  requestId: string;
  correlationId: string;
  timestamp: string;
  intelligence: {
    intelligenceId: string;
    intelligenceVersion: string;
    providerCapability?: string;
    providerUsed?: string;
  };
  status:
    | "SUCCESS"
    | "NO_RESULT"
    | "RECOMMENDATION"
    | "DRAFT"
    | "ACTION_REQUIRES_CONFIRMATION"
    | "ACTION_PREPARED"
    | "FALLBACK"
    | "ERROR"
    | "UNAUTHORIZED"
    | "UNSUPPORTED";
  intent: string;
  confidence?: number;
  facts: Array<{
    statement: string;
    evidenceIds: string[];
    sourceOwners: string[];
    freshness?: string;
  }>;
  interpretations: Array<{
    statement: string;
    confidence?: number;
    basedOnEvidenceIds: string[];
  }>;
  recommendations: Array<{
    recommendationId: string;
    text: string;
    rationale?: string;
    humanReviewRequired: boolean;
  }>;
  draft?: {
    format: string;
    content: string;
    sendable: false;
  };
  proposedActions: Array<{
    actionId: string;
    actionType: string;
    parameters: Record<string, unknown>;
    humanApprovalRequired: true;
    executableBy: "FORGE_CORE";
  }>;
  warnings: string[];
  fallback: {
    used: boolean;
    reason?: string;
    strategy?: string;
  };
  humanApprovalRequired: boolean;
}
```

## Separación semántica

Una inteligencia debe separar hechos, interpretaciones, recomendaciones, borradores, acciones propuestas y advertencias.

- Una recomendación no puede aparecer como hecho.
- Un borrador no puede marcarse como enviado.
- Una acción propuesta no puede marcarse como ejecutada.

## Autoridad

Las inteligencias pueden leer contexto autorizado, analizar, recomendar, redactar y preparar acciones. No pueden persistir cambios, enviar mensajes, mover Pipeline, crear citas, cambiar permisos ni escribir CRM.

## Errores y fallback

Cuando se use fallback, `status` debe ser `FALLBACK`, `fallback.used` debe ser `true` y la UI debe mostrar el origen del resultado.

## Versionado

Los cambios breaking requieren versión mayor. Cada adapter declara versiones aceptadas, producidas y estrategia de migración.

## Contrato por inteligencia

### Nash

Análisis conversacional, recomendaciones de seguimiento, drafts no enviables y advertencias.

### Mick

Insights, diagnósticos, riesgos, recomendaciones y preguntas de investigación.

### Candy Crush

Progreso, XP derivado, niveles, streaks y feedback. No redefine métricas fuente.

### Alfred

Intención normalizada, candidatos, preguntas de aclaración, routing y paquetes de revisión.

## Criterios de aceptación

- Esquemas versionados.
- Validación runtime.
- Separación hechos/inferencias/recomendaciones.
- Sin ejecución en manos de la inteligencia.
- Fallback visible.
- Tests negativos y de compatibilidad.

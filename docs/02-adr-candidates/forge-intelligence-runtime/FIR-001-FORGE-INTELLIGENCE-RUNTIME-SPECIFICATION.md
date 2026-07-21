# FIR-001 · Forge Intelligence Runtime Specification

**Estado:** Draft arquitectónico  
**Versión:** 0.1  
**Sistema:** Forge OS

## Propósito

Forge Intelligence Runtime, FIR, es la infraestructura común para registrar, invocar, supervisar y combinar inteligencias especializadas dentro de Forge OS.

## Principio rector

```text
Forge decide.
Las inteligencias interpretan, recomiendan, analizan o redactan.
El humano autoriza las acciones sensibles.
Forge Core ejecuta.
```

## Objetivos

- Registro canónico de capacidades e inteligencias.
- Resolución trazable de intenciones.
- Contexto gobernado y versionado.
- Permisos y límites de autoridad.
- Routing hacia inteligencias o handlers determinísticos.
- Resultados estructurados.
- Fallbacks visibles.
- Confirmación humana.
- Auditoría y telemetría.

## No objetivos

FIR no debe convertirse en fuente de verdad, ejecutar directamente acciones externas, permitir ejecución desde texto libre ni aceptar payloads paralelos construidos por cada UI.

## Arquitectura objetivo

```text
Usuario
  → Command Bar o UI de dominio
  → Command Registry
  → Intent Resolver
  → Context Builder
  → Permission and Authority Gate
  → Alfred Orchestrator
  → Specialized Intelligence o deterministic handler
  → Result Normalizer
  → Preview o Confirmation
  → Forge Action Engine
  → Audit Trail
```

## Componentes

### Command Registry

Cada comando declara `commandId`, versión, intención, contexto requerido, permisos, confirmación, handler, contrato de resultado, fallback y telemetría.

### Intent Resolver

Convierte la entrada en una intención validada. Debe distinguir búsqueda, consulta, recomendación, borrador, preparación de acción, ejecución solicitada, ambigüedad y comando no soportado.

### Context Builder

Construye un `ForgeContextEnvelope` con fuentes autorizadas. La UI no fabrica contexto canónico.

### Permission and Authority Gate

Evalúa identidad, rol, tenant, alcance, sensibilidad, tipo de acción y necesidad de confirmación.

### Alfred Orchestrator

Alfred recibe intención validada, solicita contexto, selecciona inteligencia o handler, gestiona incertidumbre y produce planes o resultados estructurados. No ejecuta acciones externas.

### Intelligence Registry

| Inteligencia | Dominio | Recomienda | Redacta | Ejecuta |
|---|---|---:|---:|---:|
| Nash | Conversaciones | Sí | Sí | No |
| Mick | Análisis y diagnóstico | Sí | No | No |
| Candy Crush | Progresión y gamificación | Sí | No | No |
| Alfred | Orquestación | Sí | No | No |

### Provider Manager

La inteligencia solicita capacidades, no proveedores concretos. El runtime puede elegir Gemini, OpenAI, Claude, local, determinístico o deshabilitado.

### Result Normalizer

Estados mínimos: `SUCCESS`, `NO_RESULT`, `RECOMMENDATION`, `DRAFT`, `ACTION_REQUIRES_CONFIRMATION`, `ACTION_PREPARED`, `FALLBACK`, `ERROR`, `UNAUTHORIZED`, `UNSUPPORTED`.

### Fallback Engine

El fallback debe ser visible, registrar causa y no fingir éxito del provider.

### Audit and Telemetry

Cada ejecución registra actor, correlation ID, comando, intención, versiones, contexto, inteligencia, provider, fallback, confirmación, acción y resultado.

## Ciclo de vida

```text
RECEIVED
→ NORMALIZED
→ RESOLVED
→ CONTEXT_READY
→ AUTHORIZED
→ ROUTED
→ PROCESSED
→ NORMALIZED_RESULT
→ PREVIEWED
→ CONFIRMED
→ EXECUTED por Forge Core
→ AUDITED
```

## Reglas de integración

- Ninguna UI llama directamente a un provider.
- Ninguna inteligencia escribe CRM, calendario o mensajería.
- Ninguna acción sensible se ejecuta desde texto generado.
- Los contratos deben estar versionados.
- Los datos conservan owner, evidencia y freshness.
- Los resultados separan hechos, inferencias y recomendaciones.

## Primera implementación permitida

```text
Command Bar
→ Registry
→ Intent Resolver
→ Context Envelope
→ Alfred
→ Result Contract
→ Preview
```

En esta fase quedan prohibidos envíos, mutaciones, citas, movimiento de Pipeline y providers no gobernados.

## Criterios de aceptación v0.1

- Registry canónico.
- Intención versionada.
- Contexto gobernado.
- Resultado estructurado.
- Flujo Command Bar → Alfred verificable.
- Estados negativos visibles.
- Auditoría mínima.
- Tests unitarios, browser y end-to-end preview-only.

# FORGE_WHATSAPP_CONTEXT_HUMANIZER_FIX_001

## Estado

```text
PROGRAM=FORGE_WHATSAPP_CONTEXT_HUMANIZER_FIX
VERSION=001
CURRENT_IMPLEMENTATION=AI_WRITES_FROM_CONTEXT
TARGET_IMPLEMENTATION=FORGE_BUILDS_CONTENT_AI_HUMANIZES
AUTOMATIC_SEND=NO
AUTOMATIC_PIPELINE_MUTATION=NO
AUTOMATIC_TIMELINE_MUTATION=NO
HUMAN_REVIEW_REQUIRED=YES
```

## Problema confirmado

El compositor actual toma datos visibles de la tarjeta de Pipeline, una intención y una instrucción opcional; después envía ese contexto a `supabase/functions/whatsapp-draft`, donde Gemini redacta el mensaje completo.

La conducta objetivo es distinta:

1. ForgeOS reúne y valida el contexto comercial.
2. ForgeOS construye el contenido lógico del mensaje sin IA.
3. La IA recibe un mensaje base ya completo.
4. La IA sólo mejora naturalidad, ritmo y tono.
5. Un validador rechaza cualquier hecho nuevo o cambio de intención.
6. El asesor revisa, edita y decide abrir WhatsApp.

## Contexto mínimo obligatorio

### Persona

- nombre confirmado;
- quién es;
- ocupación, actividad o empresa cuando exista;
- relación actual con el asesor;
- temperatura del vínculo;
- etapa comercial;
- última actividad confirmada;
- compromisos abiertos;
- notas relevantes con procedencia.

### Recomendación

- quién lo recomendó;
- relación del recomendador con la persona;
- por qué lo recomendó;
- qué dijo exactamente o resumen atribuido;
- autorización para mencionar al recomendador;
- fecha y fuente de la recomendación.

### Asesor

- nombre autenticado;
- a qué se dedica;
- especialidad relevante;
- propuesta de valor permitida;
- límites de promesa;
- presentación corta aprobada.

### Ayuda potencial

- cómo puede ayudar a esa persona;
- necesidad observada o hipótesis explícita;
- evidencia disponible;
- limitaciones;
- productos o soluciones autorizados para mencionarse;
- beneficios que no pueden afirmarse todavía.

### Movimiento

- objetivo del mensaje;
- resultado esperado;
- CTA exacto;
- canal;
- urgencia;
- tono;
- longitud máxima;
- información obligatoria y prohibida.

## Autoridades y motores existentes que deben reutilizarse

### 1. Commercial Relationship Spine

Reutilizar:

- `CARTERA_010B_COMMERCIAL_PERSON` como autoridad de persona;
- `CRS_01_ADVISOR_COMMERCIAL_RELATIONSHIP` como relación asesor-persona;
- `CRS_02` como contrato de vínculos de dominio;
- `CRS_03` para contexto de Pipeline y stage;
- `CRS_04` para actividad atribuida a persona;
- `CRS_05` para cotizaciones vinculadas;
- `CRS_06` y `CRS_07` para Application y Policy cuando sean relevantes;
- `CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL` para historia unificada;
- `CRS_09_PRODUCTIVE_PERSON_WORKSPACE` como composición contextual;
- `CRS_10` para inteligencia relacional existente.

No crear una segunda persona, Timeline, relación o memoria comercial.

### 2. FIP Relationship Intelligence

Reutilizar Pack 01 para:

- salud y momentum de relación;
- enfriamiento;
- objeciones;
- riesgo de pérdida;
- compromisos vencidos;
- mapa de relación;
- evidencia y limitaciones.

Los scores no se convierten en hechos ni se muestran como valor humano.

### 3. Nash and Conversation Intelligence

Reutilizar Pack 03 para:

- Next Best Action;
- por qué esta persona;
- por qué esta acción;
- por qué ahora;
- alternativas;
- preparación de conversación;
- instrucción contextual de mensaje.

La instrucción contextual no es el mensaje final. Debe alimentar al constructor determinístico.

### 4. Advisor Intelligence y Mick

Reutilizar Pack 02 para:

- patrones de mercado y canal;
- fricción de seguimiento;
- detección de cotización prematura;
- omisión de solicitud de referidos;
- límites por muestra y confianza.

No usar hipótesis del asesor como hechos del prospecto.

### 5. Opportunity and Operation

Reutilizar Pack 04 para:

- oportunidad oculta;
- momento de referido;
- revisión anual;
- prioridad explicable;
- siguiente acción y alternativas.

Una oportunidad propuesta no autoriza producto, promesa ni contacto automático.

### 6. Next Action / Agenda / NFAST-09

Reutilizar:

- autoridad de siguiente acción;
- compromisos vencidos o próximos;
- resolución activa;
- semántica de completar, cancelar y reprogramar.

El CTA del mensaje debe poder alinearse con la siguiente acción sin crearla ni completarla automáticamente.

### 7. Command OS

Reutilizar:

- resolución de entidad;
- contexto de pantalla;
- ambigüedad explícita;
- preview inmutable;
- confirmación gobernada;
- receipts y replay protection.

WhatsApp no debe resolver automáticamente dos personas homónimas ni ejecutar acciones por lenguaje natural.

### 8. Perfil y sesión autenticada

Reutilizar identidad Supabase/Google para nombre y perfil del asesor. Crear una proyección específica de comunicación con:

- presentación corta aprobada;
- actividad profesional;
- especialidad;
- propuesta de valor;
- tono preferido;
- claims prohibidos.

No extraer la presentación profesional de texto libre cada vez.

### 9. Smart Widgets / Alfred

Alfred puede orquestar las fuentes y explicar por qué se propone el contacto. No es una nueva autoridad de hechos ni puede enviar el mensaje.

### 10. Implementación actual de WhatsApp

Conservar:

- sesión autenticada;
- Edge Function;
- borrador editable;
- apertura por `wa.me`;
- teléfono normalizado;
- evento `forge:whatsapp-draft-opened` con `sent:false`;
- separación entre abrir y enviar.

Reemplazar la responsabilidad del modelo: de redactor completo a humanizador restringido.

## Arquitectura objetivo

```text
CommercialPerson + Relationship + Timeline + Referral + AdvisorProfile
                               ↓
                    WhatsAppContextEnvelope
                               ↓
                  DeterministicMessagePlanner
                               ↓
                       BaseMessageDraft
                               ↓
                    RestrictedAIHumanizer
                               ↓
                    SemanticDiffValidator
                               ↓
                     HumanReviewAndEdit
                               ↓
                         OpenWhatsApp
```

## Contratos nuevos

### `FORGE_WHATSAPP_CONTEXT_ENVELOPE_001`

Debe incluir:

```text
person
relationship
referral
advisor
helpHypothesis
commercialIntent
nextAction
sourceEvidence
missingContext
prohibitedClaims
```

Cada dato debe guardar:

- valor;
- fuente;
- autoridad;
- estado de confirmación;
- timestamp;
- nivel de disponibilidad.

### `FORGE_WHATSAPP_MESSAGE_PLAN_001`

Estructura lógica, no texto creativo:

```text
GREETING
IDENTITY_BRIDGE
REFERRAL_REASON
ADVISOR_RELEVANCE
HELP_VALUE
CTA
CLOSE
```

Cada bloque puede estar `INCLUDED`, `OMITTED` o `BLOCKED`, con razón explícita.

### `FORGE_WHATSAPP_BASE_MESSAGE_001`

Mensaje determinístico generado con plantillas versionadas. Debe funcionar cuando la IA no esté disponible.

### `FORGE_WHATSAPP_HUMANIZATION_REQUEST_001`

Entrada cerrada:

- mensaje base;
- tono permitido;
- longitud;
- hechos bloqueados;
- CTA bloqueado;
- nombres bloqueados;
- idioma y región.

### `FORGE_WHATSAPP_HUMANIZATION_RESULT_001`

Debe devolver:

- texto humanizado;
- modelo;
- versión del prompt;
- transformaciones declaradas;
- validación;
- requiere revisión humana.

## Roadmap de ejecución

### WSP-000 — Auditoría y mapa de reutilización

- localizar contratos, servicios y adapters reales de CRS, FIP, NFAST, Command OS y perfil;
- registrar rutas exactas y estados `PRODUCTIVE`, `READ_ONLY`, `CONTRACT_ONLY` o `UNAVAILABLE`;
- prohibir integración por nombre sin adapter real.

**Salida:** inventario ejecutable de dependencias.

### WSP-010 — Referral Context Authority

Agregar al modelo comercial gobernado:

- referrer person reference;
- referrer display name;
- referral reason;
- referral quote/summary;
- permission to mention;
- source and date;
- confirmation state.

No guardar estos datos únicamente dentro de `card.innerText`.

### WSP-020 — Advisor Communication Profile

Crear proyección autenticada del asesor con versión y confirmación humana.

Debe ser reutilizable por WhatsApp, correo, scripts y presentaciones sin convertirse en una segunda identidad.

### WSP-030 — WhatsApp Context Composer

Construir el envelope usando adapters de autoridades existentes.

Estados obligatorios:

```text
READY
PARTIAL
BLOCKED_AMBIGUOUS_PERSON
BLOCKED_MISSING_REFERRAL_REASON
BLOCKED_UNCONFIRMED_CLAIM
SOURCE_UNAVAILABLE
SESSION_REQUIRED
```

### WSP-040 — Deterministic Message Planner

Crear el plan de bloques según intención y datos disponibles.

Reglas iniciales:

- no mencionar referido sin permiso;
- no afirmar una necesidad cuando sólo existe hipótesis;
- no mencionar producto sin contexto autorizado;
- no inventar conversación previa;
- no ofrecer resultado garantizado;
- CTA proviene de la intención gobernada.

### WSP-050 — Base Message Renderer

Crear plantillas versionadas para:

- primer contacto referido;
- primer contacto no referido;
- retomar conversación;
- seguimiento;
- confirmar cita;
- solicitar documentos;
- seguimiento de propuesta.

La salida debe ser utilizable sin IA.

### WSP-060 — Restricted Humanizer

Modificar `whatsapp-draft` o crear una función versionada nueva.

El prompt debe ordenar:

```text
NO_ESCRIBAS_UN_MENSAJE_NUEVO
NO_AGREGUES_HECHOS
NO_CAMBIES_NOMBRES
NO_CAMBIES_CTA
NO_CAMBIES_OBJETIVO
NO_CAMBIES_NIVEL_DE_CERTEZA
SOLO_MEJORA_NATURALIDAD
```

Temperatura baja y respuesta JSON estructurada.

### WSP-070 — Semantic Diff Validator

Validar base contra humanizado:

- nombres;
- personas;
- empresas;
- productos;
- cantidades;
- fechas;
- CTA;
- negaciones;
- nivel de certeza;
- hechos nuevos.

Resultado:

```text
PASS
REJECT_NEW_FACT
REJECT_CHANGED_CTA
REJECT_CHANGED_CERTAINTY
REJECT_ENTITY_MUTATION
REJECT_UNSUPPORTED_PROMISE
```

Si falla, mostrar el mensaje base y no el resultado de IA.

### WSP-080 — UI Productiva

Cambios:

- `Generar con IA` → `Hacerlo sonar natural`;
- `Borrador editable` → `Mensaje propuesto`;
- mostrar `Contexto utilizado`;
- mostrar campos faltantes antes de humanizar;
- permitir editar el mensaje base;
- conservar original y humanizado;
- restaurar versión base;
- abrir WhatsApp sólo con acción humana.

Texto de límite:

> ForgeOS define el contenido. La IA sólo mejora cómo suena. No agrega información ni envía el mensaje.

### WSP-090 — Timeline y aprendizaje de resultado

Registrar únicamente hechos confirmados:

- borrador abierto;
- WhatsApp abierto;
- enviado sólo con confirmación humana futura;
- respuesta sólo mediante captura o integración autorizada.

No inferir envío por abrir `wa.me`.

El Learning Loop puede comparar resultados observados, pero no atribuir causalidad al texto sin evidencia.

### WSP-100 — Aceptación productiva

Pruebas obligatorias:

- referido con permiso;
- referido sin permiso;
- motivo ausente;
- persona homónima;
- contexto parcial;
- IA no disponible;
- intento de añadir producto;
- intento de cambiar CTA;
- intento de convertir hipótesis en hecho;
- móvil, tablet y escritorio;
- logout scrub;
- late-result rejection;
- `sent:false` al abrir WhatsApp.

## Criterios de aceptación

```text
AI_STARTS_FROM_BLANK=NO
DETERMINISTIC_BASE_MESSAGE=YES
REFERRER_SOURCE_REQUIRED=YES
REFERRAL_REASON_SOURCE_REQUIRED=YES
ADVISOR_PROFILE_GOVERNED=YES
HELP_STATEMENT_EVIDENCE_OR_HYPOTHESIS_LABEL=YES
CTA_LOCKED=YES
NEW_FACTS_AFTER_HUMANIZATION=0
AI_UNAVAILABLE_MANUAL_FLOW=PASS
AMBIGUOUS_PERSON_AUTO_SELECTION=0
AUTOMATIC_SEND=0
AUTOMATIC_TIMELINE_SENT_EVENT=0
AUTOMATIC_PIPELINE_MUTATION=0
HUMAN_REVIEW_REQUIRED=YES
```

## Orden recomendado

```text
NEXT=WSP_000_REUSE_INVENTORY_AND_EXACT_ADAPTER_MAP
THEN=WSP_010_REFERRAL_CONTEXT_AUTHORITY
THEN=WSP_020_ADVISOR_COMMUNICATION_PROFILE
THEN=WSP_030_TO_WSP_070_CORE_PIPELINE
THEN=WSP_080_UI
THEN=WSP_090_TO_WSP_100_ACCEPTANCE
```

## Límite de este documento

Este cambio documenta el programa y consolida las capacidades reutilizables identificadas en el repositorio. No modifica todavía el runtime, la base de datos, la Edge Function ni la UI productiva.

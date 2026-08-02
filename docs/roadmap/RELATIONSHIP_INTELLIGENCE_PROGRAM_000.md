# FORGE INTELLIGENCE & PERSONAL COACH PLATFORM

## Roadmap maestro

## 1. Visión

Convertir ForgeOS en un sistema que aprenda simultáneamente de tres niveles:

### Persona

Entender quién es, qué necesita, qué ha ocurrido, qué compromisos existen, qué riesgos presenta, qué oportunidad comercial puede existir y cuál podría ser el siguiente movimiento.

### Asesor

Entender cuál es su cliente ideal, cuál es su mercado natural, cómo vende mejor, qué canales convierten, qué hábitos producen resultados, dónde pierde oportunidades y cómo evoluciona su ejecución.

### Negocio

Entender cómo se comporta el embudo, dónde se pierden oportunidades, qué mercados crecen, qué productos funcionan, qué tan alcanzables son las metas y qué estrategia produciría mayor impacto.

El objetivo no es crear un sistema que únicamente muestre información. El objetivo es construir un coach comercial personal que observe, diagnostique, recomiende, acompañe, mida y aprenda.

---

## 2. Arquitectura de inteligencia

### Alfred — Orquestador general

Responsabilidades:

- recibir instrucciones;
- consultar los motores correctos;
- integrar resultados;
- presentar conclusiones claras;
- preparar planes;
- navegar entre módulos;
- ejecutar únicamente acciones autorizadas;
- explicar qué información utilizó.

Alfred no sustituye a los motores especializados. Los coordina.

### Nash — Inteligencia comercial y conversacional

Responsabilidades:

- siguiente mejor movimiento;
- siguiente mejor conversación;
- ángulo comercial;
- objeción principal;
- preparación de mensajes;
- estrategia de seguimiento;
- motivo para actuar;
- riesgo de perder la oportunidad;
- recomendación explicable.

Nash entiende qué conversación conviene tener.

### Mick — Inteligencia de ejecución

Responsabilidades:

- consistencia;
- disciplina;
- hábitos;
- seguimiento;
- ritmo de actividad;
- patrones de ejecución;
- desviaciones;
- procrastinación comercial;
- tareas de bajo impacto;
- comparación contra el desempeño histórico del propio asesor.

Mick entiende si el asesor está ejecutando correctamente. No vigila, castiga, califica laboralmente ni toma decisiones de recursos humanos.

### Relationship Intelligence

Entiende cada relación comercial: historia, estado actual, salud, momentum, compromisos, objeciones, riesgos, oportunidades, siguiente paso y calidad de información.

### Advisor Intelligence

Entiende al asesor: cliente ideal, mercados, canales, estilo de venta, productos fuertes, ventanas de seguimiento, patrones de cierre, fortalezas, áreas de oportunidad y modelo personal de conversión.

### Business Intelligence

Entiende el negocio completo: embudo, actividad, conversión, forecast, productividad, oportunidades perdidas, fuentes, mercados, productos, desempeño contra metas e impacto de estrategias.

---

## 3. Capacidades funcionales

### Las 15 capacidades originales

1. Detector de oportunidad oculta.
2. Motor de compromisos.
3. Radar de objeciones.
4. Preparador de conversación.
5. Generador de mensajes contextuales.
6. Riesgo de pérdida.
7. Recomendador de prioridad diaria.
8. Next Best Conversation.
9. Mapa de relación.
10. Motor de referidos.
11. Salud de cartera.
12. Revisión anual inteligente.
13. Aprendizaje de resultados.
14. Explicación de recomendaciones.
15. Simulador de siguiente acción.

### Advisor Intelligence

16. Descubrimiento del cliente ideal.
17. Mapa de mercados.
18. Mapa de canales.
19. Aprendizaje del estilo de venta.
20. Modelo personal de conversión.
21. Radar de oportunidades del asesor.
22. Coaching personalizado.
23. Simulador de estrategia.
24. Comparación contra el propio desempeño.
25. Perfil comercial dinámico.
26. Biblioteca de jugadas personales.
27. Detección de fricción personal.
28. Aprendizaje por experimentación.

### Personal Coach

29. Intención semanal.
30. Plan semanal.
31. Revisión semanal guiada.
32. Presupuesto de atención.
33. Experimentos comerciales.
34. Bitácora personal.
35. Seguimiento de hábitos.
36. Medición de recomendaciones.
37. Cierre de aprendizaje.
38. Ajuste progresivo de estrategia.

---

## 4. Ciclo operativo del coach

```text
META
→ OBSERVAR
→ DIAGNOSTICAR
→ PRIORIZAR
→ RECOMENDAR
→ PLANEAR
→ EJECUTAR
→ MEDIR
→ REFLEXIONAR
→ APRENDER
→ AJUSTAR
```

Cada ciclo debe responder:

```text
OBJETIVO
RESULTADO_ACTUAL
BRECHA
CAUSA_PROBABLE
ACCIÓN_RECOMENDADA
IMPACTO_ESPERADO
RESULTADO_OBSERVADO
APRENDIZAJE
SIGUIENTE_AJUSTE
```

---

# 5. Roadmap de implementación

## FIP-000 — Alcance, autoridad y seguridad

Definir qué motor es responsable de cada decisión y evitar duplicidades.

Trabajo:

- inventario de Alfred, Nash, Mick, Forecast, scoring, reportes y coaching;
- clasificación de activos;
- definición de autoridades;
- contrato de privacidad;
- límites de aprendizaje;
- límites de automatización.

```text
ALFRED=ORCHESTRATION
NASH=COMMERCIAL_INTELLIGENCE
MICK=EXECUTION_INTELLIGENCE
RELATIONSHIP_INTELLIGENCE=PERSON_CONTEXT
ADVISOR_INTELLIGENCE=ADVISOR_CONTEXT
BUSINESS_INTELLIGENCE=BUSINESS_CONTEXT
AUTOMATIC_ACTION=NO
```

## FIP-010 — Relationship Intelligence Envelope

Crear una lectura única de cada persona y su relación comercial usando CRS-011, Persona, Pipeline, Actividad, Cotizaciones, Solicitudes, Pólizas, Timeline, Cartera, pagos, interacciones y compromisos.

Salida:

- estado actual;
- última interacción;
- siguiente compromiso;
- etapa;
- productos;
- objeciones;
- salud;
- riesgo;
- oportunidad;
- frescura;
- evidencia;
- datos faltantes.

## FIP-020 — Motor de compromisos

Detectar y administrar compromisos comerciales como “te llamo el martes”, “mándame la propuesta”, “lo reviso con mi esposa” o “después de vacaciones”.

```text
WHO
PROMISED_WHAT
PROMISED_WHEN
OWNER
STATUS
EVIDENCE
FRESHNESS
```

El sistema puede proponer recordatorios, pero no crearlos automáticamente.

## FIP-030 — Salud, momentum y enfriamiento

Estados:

```text
HEALTHY
ACTIVE
WARM
COOLING
COLD
DORMANT
AT_RISK
BLOCKED
WAITING_ON_CLIENT
WAITING_ON_ADVISOR
UNKNOWN
```

Cada estado debe mostrar motivo, evidencia, cambio observado, fecha, confianza y datos faltantes.

## FIP-040 — Radar de objeciones

Identificar precio, liquidez, pareja decide, falta de urgencia, desconfianza, desconocimiento, comparación, ya tiene seguro, mal momento o falta de prioridad.

Salida:

- objeción principal;
- objeciones secundarias;
- evidencia;
- evolución;
- conversación sugerida;
- estrategia que no conviene repetir.

## FIP-050 — Riesgo de pérdida

Detectar abandono, cotización olvidada, solicitud detenida, impago, falta de renovación, relación deteriorada, retraso del asesor, falta de decisión, falta de documentación y baja respuesta.

## FIP-060 — Scoring explicable

Dimensiones: recencia, respuesta, compromiso, avance, necesidad, ajuste con el asesor, urgencia, riesgo, calidad de datos y confianza.

```text
SCORE
REASON
EVIDENCE
SAMPLE_SIZE
CONFIDENCE
FRESHNESS
MISSING_DATA
LIMITATIONS
```

No se permite un score opaco.

## FIP-070 — Mapa de relación

Representar pareja, hijos, socios, beneficiarios, tomadores de decisión, influenciadores, referidos, vínculos profesionales y contactos relacionados. No crea identidades ni conexiones sin evidencia.

## FIP-080 — Advisor Intelligence Foundation

Aprender cliente ideal, mercado, canal, producto, prima, tiempo de cierre, ritmo, estilo, objeciones, seguimientos, persistencia, referidos y rendimiento por fuente.

```text
IDEAL_CLIENT
STRONGEST_MARKETS
STRONGEST_CHANNELS
STRONGEST_PRODUCTS
BEST_SALES_STYLE
BEST_FOLLOWUP_WINDOW
CONVERSION_PATTERNS
GROWTH_OPPORTUNITIES
WEAK_POINTS
CONFIDENCE
```

## FIP-090 — Mick Execution Intelligence

Consumir Actividad, Pipeline, compromisos, metas, Timeline, resultados y Advisor Intelligence.

Detectar retraso de seguimiento, baja actividad, actividad sin impacto, exceso de cotizaciones, falta de cierres, falta de referidos, abandono después de objeciones, concentración en tareas administrativas, pérdida de consistencia y desviaciones respecto a hábitos productivos.

```text
PATTERN
OBSERVED_BEHAVIOR
EXPECTED_PATTERN
BUSINESS_IMPACT
WHY_NOW
CONFIDENCE
RECOMMENDED_ADJUSTMENT
```

## FIP-100 — Detector de fricción personal

Identificar posibles bloqueos: evitar prospectar, retrasar cierres, cotizar demasiado pronto, abandonar seguimientos, evitar pedir referidos, trabajar solo con clientes cómodos, posponer conversaciones difíciles o cambiar de estrategia demasiado rápido.

Toda conclusión se presenta como hipótesis, no como juicio psicológico.

## FIP-110 — Nash Next Best Action

Combinar Relationship Intelligence, Advisor Intelligence, Mick, objeciones, compromisos, riesgo, Forecast y metas.

```text
RECOMMENDED_ACTION
WHY_THIS_PERSON
WHY_THIS_ACTION
WHY_NOW
EXPECTED_IMPACT
CONVERSATION_ANGLE
OBJECTION_SUPPORT
CONFIDENCE
EVIDENCE
HUMAN_APPROVAL_REQUIRED
```

## FIP-120 — Next Best Conversation

Determinar si conviene descubrimiento, seguimiento, aclaración, cierre, recuperación, revisión anual, renovación, referido, protección complementaria o actualización de información.

## FIP-130 — Conversation Intelligence

Preparar resumen previo, historial relevante, última conversación, compromisos, objeciones, tono sugerido, preguntas recomendadas, riesgos, temas pendientes y siguiente cierre lógico.

## FIP-140 — Mensajes contextuales

Preparar borradores usando etapa, compromiso, tiempo transcurrido, última conversación, objeción, tono, relación, objetivo y estilo del asesor. Todo envío requiere confirmación humana.

## FIP-150 — Detector de oportunidad oculta

Casos: cliente con Vida sin SGMM, cliente sin retiro, dependientes sin protección, póliza desactualizada, cobertura insuficiente, cliente ideal no trabajado, mercado subexplotado, producto fuerte poco utilizado o relación dormida recuperable.

```text
OBSERVED_NEED
PROBABLE_NEED
COMMERCIAL_HYPOTHESIS
INSUFFICIENT_EVIDENCE
```

## FIP-160 — Revisión anual inteligente

Detectar aniversario, cambio de edad, matrimonio, nacimiento, cambio laboral, aumento de ingresos, nueva deuda, inflación, beneficiarios, cobertura antigua y renovación.

## FIP-170 — Motor de referidos

Identificar momentos adecuados: emisión, entrega, buena experiencia, revisión anual, siniestro resuelto, comentario positivo, renovación o avance importante. Nash prepara la forma de pedirlo.

## FIP-180 — Prioridad diaria

Considerar urgencia, impacto, riesgo, compromiso, probabilidad, ajuste con el asesor, esfuerzo, tiempo disponible y capacidad diaria.

## FIP-190 — Presupuesto de atención

Evitar recomendaciones imposibles considerando tiempo disponible, llamadas posibles, citas, pendientes, carga administrativa, energía declarada, horarios, urgencia y esfuerzo estimado.

## FIP-200 — Forecast Intelligence

Pronosticar próxima interacción, cita, cotización, solicitud, emisión, renovación, producción mensual y avance a meta.

```text
OBSERVED
ESTIMATED
POTENTIAL
AT_RISK
UNKNOWN
```

## FIP-210 — Simulador de siguiente acción

Comparar llamar hoy, esperar, mandar mensaje, pedir cita, resolver objeción, enviar propuesta o cerrar siguiente paso. Mostrar escenario, supuesto, impacto estimado, riesgo, confianza y limitaciones.

## FIP-220 — Intención semanal

Definir meta, producto, mercado, objetivo, tiempo disponible, compromisos, restricciones y prioridad principal.

## FIP-230 — Plan semanal del coach

Convertir intención en actividad concreta: objetivo, brecha, actividad necesaria, oportunidades prioritarias, compromisos, experimento, indicadores y revisión. No más de tres prioridades principales.

## FIP-240 — Bitácora comercial

Capturar energía, emociones, dificultad, objeciones, aprendizajes, decisiones, percepción del asesor y contexto personal relevante. La bitácora no se convierte automáticamente en verdad.

## FIP-250 — Experimentación comercial

```text
HYPOTHESIS
ACTION
SAMPLE
DURATION
METRIC
EXPECTED_RESULT
OBSERVED_RESULT
CONCLUSION
```

Ejemplos: pedir referidos tras entregas, seguimiento día 3–5, trabajar médicos, cambiar guion, modificar cierre o recuperar clientes dormidos.

## FIP-260 — Biblioteca de jugadas personales

```text
SITUATION=CLIENT_WANTS_TO_THINK
PLAY=CLARIFY_DECISION_CRITERIA
CASES=12
ADVANCED=8
CONFIDENCE=MEDIUM
```

La biblioteca alimenta a Nash.

## FIP-270 — Advisor Opportunity Radar

Detectar mercado con alta conversión y baja prospección, canal efectivo poco utilizado, producto fuerte subexplotado, falta de referidos, seguimiento fuera de ventana, pérdida entre cita y solicitud, cotización prematura y actividad concentrada en bajo impacto.

## FIP-280 — Coaching Intelligence

Responder qué funciona, qué no funciona, qué repetir, qué dejar, qué ajustar, qué probar y cómo medir. El asesor se compara primero contra sí mismo.

## FIP-290 — Revisión semanal guiada

```text
WHAT_HAPPENED
WHAT_WORKED
WHAT_DID_NOT_WORK
LOST_OPPORTUNITIES
MICK_PATTERNS
NASH_RESULTS
FORECAST_VARIANCE
LESSONS
NEXT_WEEK_ADJUSTMENTS
```

## FIP-300 — Learning Loop

```text
RECOMMENDATION
ACCEPTED
REJECTED
EXECUTED
CLIENT_RESPONDED
APPOINTMENT_CREATED
QUOTE_CREATED
APPLICATION_CREATED
POLICY_ISSUED
NO_RESULT
```

Medir precisión, utilidad, falsos positivos, recomendaciones ignoradas, acciones efectivas, mensajes efectivos, precisión del Forecast, utilidad de Mick y utilidad de Nash.

## FIP-310 — Strategy Simulator

Comparar duplicar revisiones, trabajar referidos, enfocarse en médicos, aumentar seguimiento, recuperar cartera, impulsar Vida Mujer o cambiar mezcla de actividad.

## FIP-320 — Business Intelligence

Reportar embudo, conversión, tiempos, productos, mercados, canales, actividad, cartera, oportunidades, riesgo, forecast, metas, recomendaciones, experimentos y precisión del sistema.

## FIP-330 — Alfred Orchestration

Consultas objetivo:

- “¿A quién llamo hoy?”
- “Prepárame para mi cita.”
- “¿Dónde pierdo oportunidades?”
- “¿Cuál es mi mejor mercado?”
- “¿Qué detectó Mick?”
- “¿Qué recomienda Nash?”
- “¿Cómo voy contra mi meta?”
- “¿Qué debo cambiar esta semana?”
- “Simula una estrategia.”

Alfred debe separar:

```text
FACTS
ESTIMATES
HYPOTHESES
RECOMMENDATIONS
ACTIONS_REQUIRING_APPROVAL
```

## FIP-340 — UI y Smart Widgets

### Home

Prioridad diaria, meta, brecha, alerta Mick, recomendación Nash, riesgo, oportunidad, forecast y plan semanal.

### Persona

Salud, momentum, compromiso, objeciones, riesgo, oportunidad, siguiente movimiento y conversación.

### Pipeline

Prioridad, riesgo, forecast, estancamiento y siguiente acción.

### Actividad

Consistencia, hábitos, ventanas efectivas, impacto y patrones Mick.

### Reportes

Embudo, mercado, canal, producto, conversión, aprendizaje y precisión.

### Forecast

Proyección, escenario, confianza y desviación.

### Alfred

Interfaz transversal.

## FIP-350 — Aceptación productiva

Probar persona completa, múltiples oportunidades, compromisos, objeciones, riesgo, oportunidad, scoring, Advisor Intelligence, Mick, Nash, Forecast, recordatorios, experimentos, aprendizaje, coaching, Alfred, móvil, tablet, escritorio, aislamiento, datos faltantes, datos obsoletos, cierre de sesión y no ejecución automática.

---

## 6. Estrategia para buscar 30% de crecimiento

El sistema no prometerá un 30%. Trabajará sobre cuatro palancas:

### Recuperación

Cotizaciones olvidadas, compromisos vencidos, solicitudes detenidas, clientes dormidos y revisiones pendientes.

### Conversión

Mejores conversaciones, manejo de objeciones, cierre, seguimiento y siguiente paso.

### Mercado

Más actividad en segmentos efectivos, más referidos, más trabajo con clientes similares y mejor elección de canal.

### Volumen efectivo

Menos actividad de bajo impacto y más actividad que históricamente produce resultados.

---

## 7. Métrica del 30%

```text
BASELINE_PERIOD
BASELINE_POLICIES
BASELINE_PREMIUM
BASELINE_CONVERSION
BASELINE_ACTIVITY
BASELINE_CYCLE_TIME
TARGET_GROWTH=30_PERCENT
```

El coach debe explicar:

```text
GROWTH_FROM_RECOVERY
GROWTH_FROM_CONVERSION
GROWTH_FROM_MARKET
GROWTH_FROM_VOLUME
TOTAL_OBSERVED_GROWTH
```

---

## 8. Fronteras obligatorias

```text
AUTOMATIC_MESSAGE_SEND=NO
AUTOMATIC_CALL=NO
AUTOMATIC_TASK_CREATION=NO
AUTOMATIC_CALENDAR_CREATION=NO
AUTOMATIC_PIPELINE_MOVEMENT=NO
AUTOMATIC_APPLICATION_CREATION=NO
AUTOMATIC_POLICY_CREATION=NO
AUTOMATIC_PRODUCT_RECOMMENDATION_BY_COMMISSION=NO
HUMAN_RANKING=NO
PUNISHMENT_ENGINE=NO
SURVEILLANCE=NO
HR_DECISION=NO
PERSONALITY_TRUTH=NO
OPAQUE_SCORE=NO
UNKNOWN_AS_ZERO=NO
HUMAN_APPROVAL_REQUIRED=YES
```

---

## 9. Orden de ejecución

### Bloque 1 — Fundamentos de relación

```text
FIP_000
FIP_010
FIP_020
FIP_030
FIP_040
FIP_050
FIP_060
FIP_070
```

### Bloque 2 — Inteligencia del asesor y Mick

```text
FIP_080
FIP_090
FIP_100
```

### Bloque 3 — Nash y conversación

```text
FIP_110
FIP_120
FIP_130
FIP_140
```

### Bloque 4 — Oportunidad y operación

```text
FIP_150
FIP_160
FIP_170
FIP_180
FIP_190
FIP_200
FIP_210
```

### Bloque 5 — Coach personal

```text
FIP_220
FIP_230
FIP_240
FIP_250
FIP_260
FIP_270
FIP_280
FIP_290
```

### Bloque 6 — Aprendizaje y negocio

```text
FIP_300
FIP_310
FIP_320
```

### Bloque 7 — Experiencia productiva

```text
FIP_330
FIP_340
FIP_350
```

---

## 10. Resultado final

```text
ALFRED=PRODUCTIVE_ORCHESTRATOR
NASH=COMMERCIAL_COACHING_INTELLIGENCE
MICK=EXECUTION_COACHING_INTELLIGENCE
RELATIONSHIP_INTELLIGENCE=LIVE
ADVISOR_INTELLIGENCE=LIVE
BUSINESS_INTELLIGENCE=LIVE
FORECAST=PERSONALIZED
PERSONAL_COACH=LIVE
EXPERIMENTATION_LOOP=LIVE
LEARNING_LOOP=LIVE
SMART_WIDGETS=CONNECTED
AUTOMATIC_BUSINESS_ACTION=NO
```

La experiencia final será:

> Alfred organiza el día. Relationship Intelligence entiende a cada persona. Advisor Intelligence entiende cómo vende Jorge. Mick detecta dónde se rompe la ejecución. Nash recomienda la mejor conversación. Forecast proyecta resultados. Business Intelligence explica el negocio. El coach convierte todo en una mejora semanal medible.

---

## Estado del programa

```text
PROGRAM=FORGE_INTELLIGENCE_AND_PERSONAL_COACH_PLATFORM
STAGES=FIP_000_TO_FIP_350
CAPABILITIES=38
BASE_MAIN_SHA=bc37c26597be8c8c26ccc7999bc3457d0919d6c0
IMPLEMENTATION_AUTHORIZATION=RECEIVED_FROM_OWNER
MERGE_AUTHORIZATION=NOT_GRANTED
NEXT=FIP_000_SCOPE_AUTHORITY_AND_SAFETY
```

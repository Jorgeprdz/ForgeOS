# Forge Aura Light 2026 — Directiva integral de rediseño UX/UI

**Estado:** LOCKED  
**Fecha de bloqueo:** 2026-08-06  
**Autoridad relacionada:** ADR-024 — Forge Aura Light 2026 Canonical Redesign Design Authority  
**Rama de autoridad:** `governance/forge-aura-light-2026-authority`  
**Referencia analizada:** https://youtu.be/2TlIg3VokY8  

> Este documento establece el comportamiento UX obligatorio del rediseño. Complementa la autoridad visual canónica de Forge Aura Light 2026 y no autoriza cambios de backend, persistencia, modelos, reglas comerciales, Nash ni FES.

---

# Directiva integral de rediseño UX/UI de Forge

## Objetivo general

Rediseñar Forge como un sistema operativo comercial premium para asesores de seguros, priorizando claridad, facilidad de uso, toma de decisiones y ejecución diaria.

El rediseño no debe limitarse a modificar colores, tarjetas, tipografías o componentes visuales. Debe transformar la forma en que el usuario entiende, navega y utiliza el sistema.

Forge no debe sentirse como una base de datos que el asesor tiene que alimentar y administrar. Debe sentirse como una herramienta que entiende su operación, organiza su información y le indica claramente qué debe hacer a continuación.

La nueva experiencia debe reducir la carga mental, evitar pantallas saturadas, disminuir decisiones innecesarias y convertir la información disponible en acciones comerciales concretas.

La referencia analizada sobre psicología aplicada a UX debe utilizarse como base de comportamiento del producto, no como referencia estética literal.

---

# Principio rector

Cada pantalla de Forge debe responder, de manera clara, al menos una de estas preguntas:

1. ¿Qué está pasando?
2. ¿Qué requiere mi atención?
3. ¿Por qué es importante?
4. ¿Qué acción debo realizar?
5. ¿Qué sucederá después?

Si una pantalla únicamente muestra información, pero no ayuda al usuario a entenderla o actuar sobre ella, debe replantearse.

---

# Resultado esperado

El usuario debe poder entrar a Forge y comprender en pocos segundos:

- Qué debe atender hoy.
- Qué oportunidades están en riesgo.
- Qué actividades tiene pendientes.
- Cómo avanza respecto a sus metas.
- Qué pólizas, documentos o procesos están detenidos.
- Qué comisiones necesitan revisión.
- Qué acción le recomienda realizar el sistema.
- Cómo registrar rápidamente información nueva.

Forge debe evolucionar de un sistema de consulta a un sistema de ejecución comercial.

---

# 1. Smart defaults y reducción de decisiones

## Problema actual

Los formularios extensos y vacíos obligan al usuario a tomar demasiadas decisiones desde el inicio.

Cada campo vacío incrementa la carga mental, vuelve más lenta la captura y aumenta la probabilidad de abandono o de registros incompletos.

## Directiva

Los formularios frecuentes deben utilizar valores predeterminados inteligentes y datos obtenidos del contexto.

El usuario no debe llenar manualmente información que Forge ya conoce, puede inferir razonablemente o puede proponer.

## Aplicación

Al registrar una actividad, Forge debe completar automáticamente:

- Fecha y hora actual.
- Usuario responsable.
- Prospecto o cliente seleccionado desde el contexto.
- Estado inicial recomendado.
- Canal utilizado recientemente.
- Tipo de seguimiento sugerido.
- Próxima acción recomendada.
- Fecha probable del siguiente contacto.

Al registrar un prospecto, Forge debe proponer:

- Etapa inicial.
- Responsable.
- Fuente del prospecto.
- Prioridad.
- Próxima acción.
- Fecha de seguimiento.
- Etiquetas relacionadas con el origen del registro.

Al registrar una póliza, Forge debe:

- Identificar al cliente desde el contexto.
- Proponer el tipo de producto.
- Completar al asesor responsable.
- Detectar campos relacionados.
- Mostrar solamente la información indispensable para crear el registro.
- Permitir completar los campos secundarios posteriormente.

## Regla de diseño

Ningún formulario frecuente debe abrir mostrando todos sus campos al mismo tiempo.

La estructura recomendada será:

### Captura rápida

Campos mínimos necesarios para registrar la información.

### Agregar más información

Sección secundaria desplegable para campos opcionales, técnicos o administrativos.

### Guardar y continuar

El usuario puede crear el registro rápidamente y completar detalles después.

---

# 2. Divulgación progresiva

## Problema actual

Mostrar demasiadas opciones, indicadores, filtros y campos simultáneamente provoca saturación visual y dificulta identificar lo importante.

## Directiva

La información debe aparecer de manera progresiva según el contexto, la intención del usuario y el nivel de detalle requerido.

Forge debe presentar primero lo esencial y permitir profundizar solamente cuando sea necesario.

## Aplicación

En módulos como Cartera, Comisiones, Prospectos y Actividad:

- Mostrar primero el resumen más útil.
- Ocultar información técnica secundaria.
- Utilizar secciones expandibles.
- Evitar múltiples tablas compitiendo en la misma pantalla.
- Evitar paneles con demasiados indicadores del mismo nivel visual.
- Mantener visible una acción principal.
- Permitir filtros avanzados sin ocupar permanentemente la interfaz.

## Regla de diseño

Una pantalla no debe intentar mostrar todo lo que Forge conoce.

Debe mostrar únicamente lo necesario para que el usuario tome la siguiente decisión.

---

# 3. Progreso visible y efecto de avance

## Problema actual

Cuando el usuario no percibe avance, las tareas extensas parecen más pesadas y existe mayor probabilidad de abandono.

## Directiva

Forge debe reconocer y mostrar el progreso real del usuario en procesos importantes.

El progreso nunca debe inventarse ni utilizarse de manera manipuladora.

## Aplicación en configuración inicial

El onboarding debe mostrar pasos ya realizados:

- Cuenta creada.
- Inicio de sesión completado.
- Perfil básico detectado.
- Configuración de meta pendiente.
- Primer prospecto pendiente.
- Importación de cartera pendiente.

El sistema debe reconocer las acciones que el usuario ya completó, aunque sean automáticas o hayan sucedido durante el registro.

## Aplicación en operación diaria

El dashboard puede mostrar:

- Seguimientos realizados frente a los programados.
- Citas confirmadas.
- Actividades pendientes.
- Solicitudes ingresadas.
- Avance semanal.
- Avance respecto a la meta mensual.

Ejemplo:

“Has completado 3 de tus 5 seguimientos prioritarios de hoy.”

## Aplicación en importaciones

Durante la carga de cartera, pólizas o información externa, Forge debe indicar claramente:

- Archivo recibido.
- Información procesada.
- Columnas reconocidas.
- Registros válidos.
- Registros duplicados.
- Registros con errores.
- Registros listos para importar.
- Resultado final de la operación.

El usuario nunca debe preguntarse si el sistema sigue trabajando, terminó correctamente o perdió la información.

---

# 4. Valor antes de configuración

## Problema actual

Solicitar demasiada configuración antes de mostrar valor provoca que el usuario perciba Forge como trabajo adicional.

## Directiva

Forge debe demostrar su utilidad antes de pedir al usuario una configuración extensa.

## Aplicación

En el primer ingreso, Forge puede mostrar un entorno demostrativo con información simulada claramente identificada como ejemplo.

Este entorno debe permitir entender:

- Cómo se verá la agenda.
- Cómo se priorizan prospectos.
- Cómo se muestran oportunidades.
- Cómo se detectan pólizas detenidas.
- Cómo se presentan comisiones.
- Cómo funcionan las recomendaciones.
- Cómo se visualiza el avance comercial.

Después de mostrar el resultado, Forge puede invitar al usuario a utilizar su propia información.

Ejemplo:

“Así puede verse tu operación comercial organizada en Forge. Importa tu cartera o registra tu primer prospecto para comenzar.”

## Regla de diseño

Primero debe mostrarse el beneficio.

Después se solicita el esfuerzo de configuración.

---

# 5. Personalización útil y efecto de pertenencia

## Objetivo

Conseguir que el usuario perciba Forge como su propio espacio comercial sin convertir la configuración en una carga.

## Directiva

La personalización debe estar relacionada con la operación y las metas del asesor, no con cambios decorativos innecesarios.

## Configuración inicial recomendada

El usuario puede definir:

- Meta mensual.
- Tipo de operación.
- Productos prioritarios.
- Indicadores que desea vigilar.
- Ritmo de seguimiento.
- Objetivo comercial principal.
- Horarios habituales de trabajo.
- Tipo de prospectos que atiende.
- Nivel de experiencia.

Con esta información, Forge debe generar una configuración inicial recomendada.

Ejemplo:

“Tu espacio comercial está listo.”

## Regla de diseño

Forge debe proponer una configuración completa y permitir que el usuario modifique únicamente lo importante.

No se debe obligar al usuario a construir toda la experiencia desde cero.

---

# 6. Alertas basadas en consecuencias reales

## Problema actual

Las alertas genéricas como “tienes actividades pendientes” no explican la importancia ni ayudan a priorizar.

## Directiva

Toda alerta debe incluir:

- Qué está ocurriendo.
- Por qué importa.
- Qué podría suceder si no se atiende.
- Qué acción puede realizar el usuario.

## Ejemplos

En lugar de:

“Tienes prospectos pendientes.”

Mostrar:

“3 oportunidades podrían enfriarse hoy. Han pasado más de 72 horas desde el último contacto.”

En lugar de:

“Falta documentación.”

Mostrar:

“2 pólizas podrían retrasar su emisión. Falta documentación requerida.”

En lugar de:

“Revisa tus comisiones.”

Mostrar:

“Hay $18,400 pendientes de conciliación. Se detectaron diferencias entre producción registrada y pago recibido.”

En lugar de:

“Tienes actividades vencidas.”

Mostrar:

“2 seguimientos vencieron ayer y todavía no tienen nueva fecha programada.”

## Restricciones éticas

No se deben utilizar:

- Countdowns falsos.
- Escasez inventada.
- Urgencia artificial.
- Mensajes culpabilizadores.
- Alertas rojas sin riesgo real.
- Progreso ficticio.
- Resultados inventados.
- Botones diseñados para avergonzar al usuario.
- Frases manipuladoras como “ignorar y perder mi oportunidad”.

La urgencia debe surgir de la información real disponible en el sistema.

---

# 7. Contexto para todos los indicadores

## Problema actual

Los números aislados no permiten saber si un resultado es positivo, negativo, suficiente o preocupante.

## Directiva

Todo indicador relevante debe incluir contexto.

El sistema debe explicar el dato mediante comparaciones, tendencias, metas o consecuencias.

## Ejemplos

En lugar de:

“Producción: $175,000.”

Mostrar:

“$175,000 de producción. Representa el 78% de tu meta mensual y un crecimiento del 14% frente al mes anterior.”

En lugar de:

“12 prospectos.”

Mostrar:

“12 prospectos activos. Cuatro requieren seguimiento esta semana y dos no tienen próxima acción.”

En lugar de:

“$18,400 pendientes.”

Mostrar:

“$18,400 pendientes de conciliación. Equivale al 11% de tus comisiones estimadas del trimestre.”

En lugar de:

“Conversión: 22%.”

Mostrar:

“Tu conversión actual es de 22%, cuatro puntos por encima del mes anterior y dos puntos por debajo de tu meta.”

## Regla de diseño

Los indicadores deben responder:

- ¿Comparado con qué?
- ¿Es bueno o malo?
- ¿Está subiendo o bajando?
- ¿Qué significa para el usuario?
- ¿Qué debería hacer?

---

# 8. Rediseño del dashboard

## Objetivo

Convertir el dashboard en un centro de decisiones y ejecución, no en una colección de tarjetas estadísticas.

## Estructura propuesta

### Bloque 1: Tu siguiente mejor acción

Debe ser el elemento principal del dashboard.

Ejemplo:

“Contacta a Mariana López. Solicitó información de ahorro hace dos días y todavía no tiene seguimiento programado.”

Acciones disponibles:

- Contactar.
- Registrar actividad.
- Programar seguimiento.
- Ver prospecto.
- Descartar recomendación con motivo.

La recomendación debe explicar por qué fue seleccionada.

### Bloque 2: Tu jornada

Mostrar el avance operativo del día:

- Seguimientos realizados.
- Citas próximas.
- Actividades vencidas.
- Tareas pendientes.
- Solicitudes ingresadas.
- Avance respecto a la meta diaria o semanal.

### Bloque 3: Requiere atención

Máximo tres asuntos prioritarios.

Ejemplos:

- Prospectos que podrían enfriarse.
- Pólizas detenidas.
- Documentación faltante.
- Comisiones con diferencias.
- Citas pendientes de confirmar.

No deben mostrarse diez alertas simultáneas con el mismo nivel de importancia.

### Bloque 4: Panorama comercial

Mostrar indicadores de alto nivel:

- Producción frente a meta.
- Pipeline.
- Conversión.
- Cartera.
- Comisiones estimadas.
- Próximas renovaciones.
- Tendencia mensual.

Cada indicador debe incluir contexto y permitir profundizar.

### Bloque 5: Actividad reciente

Mostrar únicamente eventos relevantes:

- Prospecto creado.
- Seguimiento registrado.
- Solicitud ingresada.
- Póliza emitida.
- Documento recibido.
- Comisión conciliada.

Debe evitarse una lista extensa de eventos técnicos sin importancia comercial.

---

# 9. Barra flotante de acciones

## Objetivo

Permitir que el usuario registre información desde cualquier módulo sin abandonar su contexto.

## Acciones recomendadas

- Nuevo prospecto.
- Registrar actividad.
- Agendar cita.
- Agregar póliza.
- Importar cartera.
- Registrar solicitud.

La barra flotante debe ser consistente en escritorio, tablet y móvil.

No debe utilizarse únicamente como elemento estético. Debe funcionar como acceso rápido a las acciones más frecuentes.

La acción principal puede adaptarse al módulo actual.

Ejemplos:

- En Prospectos: “Nuevo prospecto”.
- En Actividad: “Registrar actividad”.
- En Cartera: “Agregar póliza”.
- En Comisiones: “Registrar o conciliar”.
- En Cotizaciones: “Nueva cotización”.

---

# 10. Estados vacíos útiles

## Problema actual

Una pantalla vacía puede hacer que el sistema parezca incompleto o que el usuario no sepa qué hacer.

## Directiva

Todo estado vacío debe contener:

- Explicación breve.
- Beneficio del módulo.
- Acción principal.
- Ejemplo, plantilla o vista demostrativa cuando sea útil.

## Ejemplos

### Prospectos

“Aquí aparecerán tus prospectos, su etapa y el siguiente seguimiento. Registra el primero o importa una lista.”

### Cartera

“Centraliza tus pólizas para conocer vencimientos, renovaciones, primas y oportunidades de servicio.”

### Comisiones

“Importa tu reporte o registra producción para comparar lo esperado con lo recibido.”

### Actividad

“Registra llamadas, citas, mensajes y seguimientos para mantener actualizada tu operación.”

## Regla de diseño

Una pantalla vacía nunca debe limitarse a mostrar una ilustración y el texto “no hay datos”.

---

# 11. Navegación

## Objetivo

La navegación debe ser predecible, sencilla y orientada a tareas.

## Directivas

- Mantener los módulos principales claramente identificados.
- Evitar nombres ambiguos.
- Evitar duplicar funciones en diferentes secciones.
- Conservar el contexto al navegar.
- Permitir regresar sin perder filtros o capturas.
- Mantener visibles las acciones frecuentes.
- Utilizar breadcrumbs únicamente cuando aporten claridad.
- Evitar menús excesivamente profundos.
- Mantener consistencia entre móvil, tablet y escritorio.

## Módulos principales sugeridos

- Inicio.
- Prospectos.
- Actividad.
- Cartera.
- Cotizaciones.
- Comisiones.
- Comunicación.
- Documentos.
- Inteligencia comercial.
- Configuración.

La prioridad visual y el orden final deben corresponder a la frecuencia real de uso.

---

# 12. Diseño visual

## Dirección estética

La interfaz debe utilizar una estética:

- Premium SaaS.
- Light.
- Contemporánea.
- Profesional.
- Clara.
- Con profundidad moderada.
- Inspirada en tendencias de producto digital 2026.
- Optimizada para escritorio, tablet y móvil.

Puede integrar:

- Barras flotantes.
- Capas suaves.
- Tarjetas de diferentes proporciones.
- Jerarquía tipográfica fuerte.
- Bordes discretos.
- Sombras suaves.
- Superficies elevadas.
- Microinteracciones funcionales.
- Espacios amplios.
- Componentes consistentes.

## Restricción principal

La interfaz no debe sacrificar claridad por estética.

No se deben agregar componentes, efectos, degradados, transparencias o animaciones que no tengan una función clara.

---

# 13. Tarjetas y widgets

## Directiva

Las tarjetas deben utilizarse para agrupar información relacionada y facilitar decisiones, no simplemente para colocar cada número dentro de un rectángulo.

## Reglas

- Cada tarjeta debe tener un propósito.
- Debe existir una jerarquía clara entre tarjetas.
- No todas deben tener el mismo tamaño.
- Las tarjetas prioritarias pueden ocupar formatos 4x4 o 4x2.
- Indicadores secundarios pueden utilizar formatos 2x2.
- Evitar demasiadas tarjetas pequeñas.
- Evitar repetir información entre widgets.
- Utilizar color para significado, no para decoración.
- Incluir acciones solamente cuando sean necesarias.
- Evitar múltiples botones compitiendo dentro de una misma tarjeta.

## Smart widgets

Los widgets deben poder mostrar:

- Situación actual.
- Contexto.
- Prioridad.
- Recomendación.
- Acción.
- Estado.
- Tendencia.

Ejemplo:

“3 prospectos requieren seguimiento.”

Contexto:

“Dos llevan más de 72 horas sin contacto.”

Acción:

“Ver prospectos.”

---

# 14. Color

## Directiva

Debe crearse una paleta consistente y documentada mediante tokens.

## Categorías mínimas

- Fondo general.
- Superficie principal.
- Superficie elevada.
- Texto principal.
- Texto secundario.
- Bordes.
- Acción primaria.
- Acción secundaria.
- Éxito.
- Advertencia.
- Error.
- Información.
- Estado inactivo.
- Selección.
- Foco.
- Hover.
- Presionado.

## Reglas

- El rojo se reserva para errores o riesgos reales.
- El amarillo o ámbar se utiliza para advertencias.
- El verde se utiliza para resultados positivos o acciones completadas.
- El color principal debe orientar la interacción.
- No se deben usar colores diferentes sin significado.
- Los gráficos deben utilizar una escala coherente.
- Todos los contrastes deben cumplir accesibilidad.

---

# 15. Tipografía

## Objetivo

Crear una jerarquía clara que permita escanear la interfaz rápidamente.

## Niveles recomendados

- Título de página.
- Título de sección.
- Título de tarjeta.
- Indicador principal.
- Texto de apoyo.
- Etiqueta.
- Metadato.
- Mensaje de estado.
- Texto de botón.

## Reglas

- Evitar tamaños demasiado similares.
- Evitar textos excesivamente pequeños.
- Evitar abuso de negritas.
- Utilizar peso tipográfico para jerarquía, no para decorar.
- Mantener longitud de línea legible.
- Priorizar legibilidad en monitor, tablet y móvil.

---

# 16. Microinteracciones y retroalimentación

## Directiva

Cada acción debe producir una respuesta visible.

## El usuario debe saber

- Si su acción fue recibida.
- Si el sistema está procesando.
- Si el proceso terminó.
- Si ocurrió un error.
- Qué información se guardó.
- Qué debe hacer después.

## Aplicaciones

Después de registrar una actividad:

“Actividad guardada. Próximo seguimiento programado para el martes.”

Después de importar una cartera:

“86 pólizas fueron importadas. Cuatro registros necesitan revisión.”

Después de actualizar un prospecto:

“Prospecto actualizado. La siguiente acción recomendada es confirmar la cita.”

Después de registrar documentación:

“Documento recibido. La póliza ya puede avanzar a revisión.”

## Regla de diseño

No utilizar mensajes genéricos como “operación exitosa” cuando sea posible explicar exactamente qué ocurrió.

---

# 17. Recomendación del siguiente paso

## Directiva

Después de una acción importante, Forge debe sugerir el paso lógico siguiente.

## Ejemplos

Después de registrar un prospecto:

“Programa el primer contacto.”

Después de registrar una llamada:

“¿Deseas programar el siguiente seguimiento?”

Después de crear una cotización:

“Envía la propuesta o agenda una presentación.”

Después de importar una póliza:

“Revisa la documentación pendiente.”

Después de conciliar una comisión:

“Quedan dos movimientos por revisar.”

## Objetivo

Evitar que el usuario termine una tarea y quede frente a una pantalla sin dirección.

---

# 18. Accesibilidad

El rediseño debe cumplir buenas prácticas de accesibilidad.

## Requisitos

- Contraste suficiente.
- Navegación mediante teclado.
- Estados de foco visibles.
- Etiquetas claras.
- Tamaños táctiles adecuados.
- No depender únicamente del color.
- Mensajes de error comprensibles.
- Jerarquía semántica correcta.
- Compatibilidad con lectores de pantalla.
- Escalado de texto.
- Diseño adaptable.
- Animaciones moderadas.
- Respeto a preferencias de movimiento reducido.

La accesibilidad no debe considerarse una fase posterior. Debe formar parte del sistema de diseño desde el inicio.

---

# 19. Diseño responsivo

Forge debe funcionar correctamente en:

- Monitor externo.
- Escritorio.
- Laptop.
- Tablet.
- Samsung DeX.
- Navegador móvil.
- Teléfono móvil.

## Directivas

- No reducir la versión de escritorio hasta hacerla caber en móvil.
- Reorganizar la jerarquía según el tamaño disponible.
- Mantener la acción principal visible.
- Convertir tablas extensas en vistas adaptadas.
- Evitar desplazamiento horizontal innecesario.
- Permitir navegación táctil.
- Mantener densidad adecuada en monitor.
- Aprovechar el espacio disponible sin saturarlo.

---

# 20. Simplificación de módulos

## Cartera

Debe priorizar:

- Pólizas activas.
- Renovaciones próximas.
- Pagos pendientes.
- Documentación faltante.
- Oportunidades de servicio.
- Riesgos de cancelación.
- Acciones rápidas.

Debe eliminar o relegar información secundaria que no ayude a actuar.

La alta de pólizas debe ser visible y accesible.

Métodos mínimos:

- Captura manual.
- Importación CSV.
- Importación XLSX.
- Importación PDF cuando sea técnicamente viable.
- Arrastrar y soltar.
- Vista previa.
- Detección de duplicados.
- Validación.
- Corrección de errores parciales.

## Comisiones

Debe priorizar:

- Comisión esperada.
- Comisión recibida.
- Diferencia.
- Movimientos pendientes.
- Producción relacionada.
- Periodo.
- Estado de conciliación.

Debe evitar mostrar demasiados indicadores sin jerarquía.

## Actividad

Debe incluir un método de captura manual claro, rápido y coherente con la operación real del asesor.

Debe permitir registrar:

- Llamada.
- Mensaje.
- Cita.
- Videollamada.
- Correo.
- Seguimiento.
- Nota.
- Tarea.
- Resultado.
- Próxima acción.

## Dashboard

Debe funcionar incluso cuando aún no existe información productiva.

En ese caso debe mostrar:

- Datos demostrativos.
- Estados vacíos útiles.
- Acciones de configuración.
- Plantillas.
- Recomendaciones iniciales.

No debe aparecer vacío.

---

# 21. Consistencia del sistema de diseño

Debe existir una única fuente de verdad para:

- Colores.
- Espaciado.
- Radios.
- Sombras.
- Tipografía.
- Iconografía.
- Botones.
- Campos.
- Selectores.
- Tablas.
- Tarjetas.
- Modales.
- Drawers.
- Menús.
- Alertas.
- Tooltips.
- Badges.
- Estados vacíos.
- Skeletons.
- Cargas.
- Gráficos.
- Navegación.

No deben coexistir componentes legacy con estilos diferentes salvo durante una migración controlada.

---

# 22. Reglas obligatorias del rediseño

1. Toda pantalla debe tener una acción principal claramente identificada.
2. Ningún formulario frecuente debe comenzar completamente vacío cuando Forge pueda sugerir información.
3. La información avanzada debe permanecer oculta hasta que sea necesaria.
4. Los números deben incluir contexto, comparación, tendencia o consecuencia.
5. Las alertas deben explicar por qué importan y qué acción realizar.
6. Los estados vacíos deben incluir una acción, ejemplo o plantilla.
7. El dashboard debe priorizar decisiones, no mostrar todos los datos disponibles.
8. El progreso debe corresponder a acciones reales.
9. No deben competir más de tres asuntos urgentes simultáneamente.
10. Después de cada captura, Forge debe recomendar el siguiente paso.
11. No se debe utilizar urgencia artificial.
12. No se debe utilizar color sin significado.
13. No se debe agregar información únicamente para llenar espacio.
14. Las acciones frecuentes deben estar disponibles desde cualquier módulo.
15. El usuario debe recibir retroalimentación clara después de cada operación.
16. El diseño debe funcionar en móvil, tablet, DeX y escritorio.
17. Los componentes deben cumplir accesibilidad.
18. Las pantallas legacy deben migrarse al nuevo sistema de diseño.
19. No se deben conservar componentes inconsistentes por comodidad técnica.
20. Toda decisión visual debe estar respaldada por una función UX.

---

# 23. Criterios de aceptación

El rediseño se considerará satisfactorio cuando:

- Un usuario nuevo pueda entender el propósito del dashboard sin capacitación.
- Pueda registrar un prospecto en menos de un minuto.
- Pueda registrar una actividad en pocos pasos.
- Pueda identificar inmediatamente qué requiere atención.
- Pueda conocer su avance frente a sus metas.
- Pueda agregar una póliza de forma manual.
- Pueda importar cartera con validación y vista previa.
- Pueda distinguir comisiones esperadas, recibidas y pendientes.
- Pueda navegar sin perder el contexto.
- Pueda utilizar Forge desde móvil, tablet, DeX y escritorio.
- Los módulos compartan el mismo lenguaje visual.
- No existan pantallas principales vacías o sin acción.
- Los formularios utilicen valores predeterminados inteligentes.
- Los indicadores expliquen su significado.
- Las alertas sean reales, comprensibles y accionables.
- Las acciones produzcan retroalimentación visible.
- El usuario siempre pueda identificar el siguiente paso recomendado.

---

# 24. Auditoría obligatoria antes de implementación

Antes de modificar código, debe realizarse una auditoría completa módulo por módulo.

La auditoría debe identificar:

- Componentes actuales.
- Componentes legacy.
- Pantallas duplicadas.
- Rutas obsoletas.
- Formularios existentes.
- Flujos incompletos.
- Estados vacíos.
- Tablas saturadas.
- Inconsistencias de color.
- Inconsistencias tipográficas.
- Diferencias de espaciado.
- Problemas de accesibilidad.
- Problemas responsivos.
- Acciones inexistentes.
- Funciones implementadas pero no integradas.
- Código ya desarrollado que pueda reutilizarse.
- Riesgos de regresión.
- Dependencias entre módulos.

No debe reconstruirse una funcionalidad que ya existe sin verificar previamente si fue desarrollada, quedó aislada, no fue integrada o permanece detrás de una ruta antigua.

---

# 25. Orden recomendado de implementación

## Fase 1: Fundamentos

- Auditoría completa.
- Inventario de componentes.
- Tokens.
- Tipografía.
- Color.
- Espaciado.
- Superficies.
- Botones.
- Formularios.
- Estados.
- Navegación.

## Fase 2: Estructura principal

- Layout.
- Sidebar.
- Navegación móvil.
- Header.
- Barra flotante.
- Dashboard.
- Estados vacíos.
- Sistema de alertas.

## Fase 3: Captura y operación

- Prospectos.
- Actividad.
- Cartera.
- Alta manual de pólizas.
- Importaciones.
- Cotizaciones.
- Documentación.

## Fase 4: Inteligencia y análisis

- Comisiones.
- Indicadores.
- Comparaciones.
- Recomendaciones.
- Priorización.
- Nash.
- Smart widgets.

## Fase 5: Reconciliación

- Eliminación de componentes legacy.
- Corrección de rutas.
- Validación responsiva.
- Accesibilidad.
- Pruebas.
- Aceptación visual.
- Integración.
- Deploy.

---

# Declaración final

Forge debe dejar de comportarse como un CRM tradicional lleno de tablas, formularios y paneles informativos.

Debe convertirse en un sistema operativo comercial que reduzca la carga mental del asesor, organice su operación y transforme datos en decisiones.

La nueva experiencia debe ser atractiva, contemporánea y premium, pero su valor principal debe estar en la claridad y en la capacidad de orientar al usuario.

El criterio central del rediseño será el siguiente:

> Menos información simultánea, mayor contexto, mejores valores predeterminados y una siguiente acción inequívoca.

Forge no debe pedirle al asesor que interprete toda su operación.

Forge debe ayudarle a entender qué está ocurriendo, qué importa y qué conviene hacer ahora.

---

## Control de cambios

Este documento está bloqueado. Cualquier modificación posterior requiere una nueva decisión explícita de autoridad y debe registrarse como revisión formal, sin reemplazar silenciosamente el contenido aprobado.
# FORGEOS — BETA 1 CORRECTION ROADMAP

## Programa

`BETA_1_OPERATIONAL_COMPLETION`

## Objetivo

Cerrar las capacidades mínimas necesarias para que un beta tester pueda:

1. Ingresar prospectos sin capturarlos uno por uno.
2. Cargar documentos de cartera desde cualquier dispositivo.
3. Generar mensajes con IA desde WhatsApp Composer.
4. Entender claramente qué funciones están disponibles y cuáles siguen en desarrollo.
5. Completar los flujos principales sin botones muertos, estados falsos ni operaciones simuladas.

---

# FASE 0 — CONTENCIÓN INMEDIATA DE LA BETA

## Objetivo

Evitar que nuevos usuarios entren a una experiencia que promete funciones todavía no operativas.

## Acciones

- Pausar temporalmente nuevas invitaciones generales.
- Mantener únicamente testers controlados.
- Etiquetar el despliegue actual como `BETA_1_CONTROLLED`.
- Crear una lista única de capacidades: disponible, parcial, no conectado o bloqueado.
- Ocultar o marcar explícitamente cualquier función incompleta.
- Prohibir botones que aparenten ejecutar operaciones inexistentes.
- Añadir un aviso breve dentro de la beta:

> Esta versión se encuentra en validación controlada. Algunas funciones de importación documental e inteligencia asistida están siendo habilitadas.

## Criterios de aceptación

- Ningún botón visible termina en una acción inexistente.
- Ninguna operación simulada se presenta como productiva.
- Los testers saben qué áreas están siendo evaluadas.
- No se incorporan nuevos testers hasta completar las fases críticas.

---

# FASE 1 — PIPELINE BULK IMPORT

## Objetivo

Permitir la carga masiva de prospectos desde Proyecto 200, CSV y Excel sin ensuciar la interfaz principal.

## Entrada de interfaz

Agregar en Pipeline una acción primaria o menú contextual: `Carga masiva`.

No crear varios botones independientes.

Al abrirla:

- Subir archivo.
- Descargar plantilla.
- Consultar importaciones anteriores.

## Formatos iniciales

- `.csv`
- `.xlsx`
- Archivo Proyecto 200.

## Flujo

1. El usuario selecciona el archivo.
2. ForgeOS detecta el formato.
3. Si reconoce la estructura P200, selecciona automáticamente el perfil Proyecto 200 y propone el libro `Proyecto 200`.
4. Si es un archivo genérico, solicita mapear columnas.
5. Presenta vista previa.
6. Valida registros.
7. Detecta posibles duplicados.
8. Solicita confirmación.
9. Importa únicamente después de confirmación.
10. Genera un resultado auditable.

## Campos mínimos

- Nombre.
- Teléfono.
- Correo, cuando exista.
- Fecha de ingreso.
- Fuente.
- Libro.
- Notas o contexto original.

## Tratamiento del contenido adicional de P200

Los datos que no correspondan a campos estructurados deben conservarse como contexto, nota inicial o bitácora de importación.

No deben perderse ni forzarse dentro de campos incorrectos.

## Libros

- Crear libro nuevo desde el flujo de importación.
- Si el archivo es P200, proponer automáticamente `Proyecto 200`.
- Permitir seleccionar un libro existente.
- No llenar Pipeline de botones por cada libro.
- Mostrar los libros mediante selector o filtro.

## Duplicados

Detectar coincidencias por:

- Teléfono normalizado.
- Correo normalizado.
- Nombre más teléfono.
- Nombre más correo.

Opciones:

- Omitir.
- Actualizar contexto.
- Importar como nuevo, sólo con confirmación explícita.

## Resultado

Mostrar:

- Registros encontrados.
- Registros válidos.
- Registros importados.
- Duplicados.
- Registros rechazados.
- Motivo de cada rechazo.

## Criterios de aceptación

- Un usuario puede subir el archivo Proyecto 200 completo.
- El libro Proyecto 200 se crea o selecciona correctamente.
- No se duplican contactos silenciosamente.
- Los registros nuevos aparecen arriba por defecto.
- El orden predeterminado es fecha de ingreso descendente.
- Los filtros y ordenamiento siguen funcionando.
- La importación puede cancelarse antes de confirmar.
- Un fallo parcial no duplica registros al reintentar.

---

# FASE 2 — CARTERA DOCUMENT INTAKE

## Objetivo

Permitir que Cartera reciba documentos reales antes de conciliarlos o convertirlos en datos persistentes.

## Interfaz desktop

Agregar una zona visible:

> Arrastra aquí tu PDF de cartera o selecciona un archivo manualmente.

Acciones:

- Drag and drop.
- Botón `Seleccionar PDF`.
- Historial de cargas.

## Interfaz móvil y tablet

Agregar `Subir PDF`.

Debe abrir el selector de documentos del dispositivo.

No es necesario mostrar drag and drop en móvil.

## Formato inicial

- PDF.

Los formatos Excel o CSV de cartera pueden agregarse posteriormente; no deben bloquear el cierre del PDF.

## Estados de carga

- Sin archivo.
- Seleccionando.
- Cargando.
- Procesando.
- Procesado.
- Requiere revisión.
- Rechazado.
- Error recuperable.

## Flujo

1. Selección del PDF.
2. Validación de tipo y tamaño.
3. Carga segura.
4. Creación del registro de ingestión.
5. Extracción de contenido.
6. Normalización.
7. Detección de personas, cuentas, pólizas, productos, vigencias, primas y estatus.
8. Presentación de resultados en staging.
9. Conciliación con registros existentes.
10. Confirmación humana.
11. Persistencia final.

## Regla crítica

Cargar un PDF no debe modificar automáticamente Cartera.

La modificación sólo ocurre después de extracción completa, revisión, conciliación y confirmación explícita.

## Reintentos

- No volver a subir el archivo para reintentar procesamiento.
- Conservar el archivo original.
- Mantener un identificador de ingestión.
- Evitar registros duplicados por doble clic o recarga.

## Privacidad

- Acceso limitado al propietario de la cartera.
- No exponer URLs públicas permanentes.
- Validar sesión antes de procesar o recuperar resultados.
- Rechazar resultados tardíos después de cerrar sesión.

## Criterios de aceptación

- Desktop acepta drag and drop y selección manual.
- Móvil y tablet aceptan selección manual.
- El progreso es visible.
- Los errores explican qué ocurrió.
- La extracción nunca persiste información sin confirmación.
- Puede revisarse el resultado antes de incorporarlo.
- Cerrar sesión elimina datos temporales visibles.
- Reabrir la sesión no mezcla cargas de otros usuarios.

---

# FASE 3 — WHATSAPP COMPOSER CON IA REAL

## Objetivo

Conectar WhatsApp Composer a un modelo de IA para redactar borradores basados únicamente en contexto gobernado por ForgeOS.

## Responsabilidades

### WhatsApp Composer

Debe:

- Elegir el objetivo del mensaje.
- Recopilar contexto.
- Construir el prompt.
- Solicitar el borrador.
- Mostrarlo para revisión.
- Permitir edición.
- Abrir WhatsApp con el texto aprobado.

### Modelo de IA

Debe:

- Redactar.
- Ajustar tono.
- Respetar longitud.
- Generar un CTA.
- Trabajar sólo con el contexto proporcionado.

### El modelo no debe

- Enviar mensajes.
- Cambiar estados de Pipeline.
- Inventar datos del prospecto.
- Inventar productos o coberturas.
- Registrar una interacción como realizada.
- Seleccionar autónomamente al destinatario.
- Modificar la bitácora.

## Arquitectura

`UI Composer`

→ `Prompt estructurado`

→ `Backend o Edge Function segura`

→ `Proveedor de IA`

→ `Respuesta validada`

→ `Borrador editable`

→ `Abrir WhatsApp`

## Seguridad

- La llave del proveedor nunca debe estar en frontend.
- La llamada debe hacerse desde backend o Edge Function.
- Verificar sesión y propietario del prospecto.
- Limitar tamaño del contexto.
- Implementar rate limiting.
- Registrar metadatos técnicos sin guardar información sensible innecesaria.
- No incluir secretos ni documentación completa en prompts.

## Prompt estructurado

Debe contener, cuando estén disponibles:

- Nombre del prospecto.
- Etapa actual.
- Último contacto.
- Tiempo sin interacción.
- Producto o necesidad.
- Objeción.
- Próxima acción recomendada.
- Objetivo del mensaje.
- Tono.
- Longitud.
- Restricciones.
- CTA permitido.

## Modos iniciales

- Primer contacto.
- Seguimiento.
- Retomar conversación.
- Confirmar cita.
- Solicitar documentos.
- Seguimiento de propuesta.

## Estados de UI

- IA disponible.
- Generando.
- Borrador generado.
- Error recuperable.
- IA no configurada.
- Límite alcanzado.

Nunca mostrar un resultado predeterminado fingiendo que fue generado por IA.

## Revisión humana

Antes de abrir WhatsApp:

- El usuario ve el texto completo.
- Puede editarlo.
- Puede regenerarlo.
- Puede descartarlo.
- Confirma que desea abrir WhatsApp.

Abrir WhatsApp no equivale a mensaje enviado.

ForgeOS sólo registra el envío cuando exista una confirmación posterior del usuario.

## Criterios de aceptación

- La redacción proviene de una llamada real al backend.
- No hay llaves en el navegador.
- El mensaje utiliza datos reales del prospecto.
- Los campos ausentes no son inventados.
- El usuario puede editar el texto.
- La IA no modifica Pipeline.
- WhatsApp se abre con el borrador aprobado.
- Cancelar no registra una actividad enviada.
- Los errores de IA no bloquean la redacción manual.

---

# FASE 4 — INTEGRACIÓN Y CONSISTENCIA DE EXPERIENCIA

## Objetivo

Evitar que las tres funciones parezcan sistemas separados o improvisados.

## Reglas comunes

Todos los flujos deben compartir:

- Estados de carga.
- Mensajes de error.
- Confirmaciones.
- Diseño responsive.
- Auditoría.
- Protección de sesión.
- Prevención de doble ejecución.
- Recuperación ante fallo.
- Estados vacíos honestos.

## Navegación

### Pipeline

- Carga masiva dentro de la vista de prospectos.
- Sin añadir múltiples botones permanentes.
- Libros disponibles como filtro o selector.

### Cartera

- Carga documental como acción principal del estado vacío.
- Después de existir cartera, conservarla como acción secundaria visible.

### WhatsApp Composer

- Disponible desde la ficha del prospecto.
- También desde acciones contextuales del Pipeline.
- Siempre vinculado a una persona identificada.

## Criterios de aceptación

- Funciona en móvil, tablet y desktop.
- No hay controles fuera del viewport.
- Los CTA importantes pueden desplazarse por encima de la navegación móvil.
- No hay botones duplicados.
- No hay mensajes técnicos expuestos al usuario.
- Los estados vacíos indican una siguiente acción real.

---

# FASE 5 — REGRESIÓN BETA 1

## Objetivo

Confirmar que la corrección no rompe autenticación, Pipeline, Cartera, WhatsApp ni otros módulos productivos.

## Matriz mínima

### Autenticación

- Inicio de sesión.
- Cierre de sesión.
- Sesión expirada.
- Resultado tardío.
- Acceso directo mediante URL.

### Pipeline

- Captura manual.
- Carga CSV.
- Carga XLSX.
- Carga P200.
- Duplicados.
- Libros.
- Ordenamiento.
- Filtros.
- Vista móvil.

### Cartera

- Botón manual.
- Drag and drop.
- PDF válido.
- Archivo inválido.
- Error de extracción.
- Reintento.
- Confirmación.
- Cancelación.
- Cierre de sesión durante procesamiento.

### Composer

- IA disponible.
- IA no disponible.
- Contexto incompleto.
- Regeneración.
- Edición.
- Cancelación.
- Apertura de WhatsApp.
- Confirmación posterior.

## Evidencia

Cada flujo deberá entregar:

- Captura o video.
- Dispositivo.
- Ruta.
- Usuario de prueba.
- Resultado esperado.
- Resultado real.
- Commit.
- Despliegue.
- Fecha.
- Estado PASS o FAIL.

---

# FASE 6 — REAPERTURA DE INVITACIONES

## Condiciones obligatorias

No reabrir la beta general hasta obtener:

- `PIPELINE_BULK_IMPORT=PASS`
- `P200_IMPORT=PASS`
- `CONTACT_BOOKS=PASS`
- `CARTERA_PDF_UPLOAD=PASS`
- `CARTERA_DESKTOP_DROPZONE=PASS`
- `CARTERA_REVIEW_BEFORE_PERSISTENCE=PASS`
- `WHATSAPP_AI_DRAFTING=PASS`
- `AI_SECRET_ISOLATION=PASS`
- `MOBILE_ACCEPTANCE=PASS`
- `TABLET_ACCEPTANCE=PASS`
- `DESKTOP_ACCEPTANCE=PASS`
- `AUTH_SESSION_REGRESSION=PASS`

## Modalidad de reapertura

1. Reincorporar primero a testers controlados.
2. Pedirles completar tres misiones:
   - Importar prospectos.
   - Cargar una cartera.
   - Redactar un seguimiento con IA.
3. Recoger errores.
4. Corregir bloqueadores.
5. Sólo entonces ampliar las invitaciones.

---

# PRIORIZACIÓN EJECUTIVA

## P0 — Bloqueadores de Beta 1

- Pipeline Bulk Import.
- Importación P200.
- Botón de carga PDF en Cartera.
- Drag and drop desktop.
- Procesamiento con revisión antes de persistir.
- Conexión real del WhatsApp Composer con IA.
- Estados honestos y manejo de errores.

## P1 — Necesarios para estabilidad

- Historial de importaciones.
- Deduplicación avanzada.
- Reintentos.
- Auditoría.
- Protección de sesión.
- Evidencia multidispositivo.

## P2 — Después de reabrir la beta

- Importación de más formatos de cartera.
- Procesamiento de múltiples PDFs.
- Plantillas personalizadas de mensajes.
- Selección de modelos de IA.
- Automatizaciones posteriores.
- Analítica de uso.

---

# ORDEN DE EJECUCIÓN

1. Contener la beta actual.
2. Implementar Pipeline Bulk Import.
3. Implementar Cartera Document Intake.
4. Conectar WhatsApp Composer con IA.
5. Unificar estados y experiencia.
6. Ejecutar regresión completa.
7. Reabrir invitaciones controladas.
8. Ampliar la beta únicamente con evidencia PASS.

---

# DEFINICIÓN DE BETA 1 COMPLETA

La Beta 1 se considera operativamente completa cuando un usuario nuevo puede:

- Crear su cuenta.
- Importar su base inicial.
- Organizar prospectos.
- Cargar su cartera.
- Revisar y confirmar información extraída.
- Generar un mensaje asistido por IA.
- Abrir WhatsApp con ese mensaje.
- Continuar trabajando sin depender de captura manual masiva ni de funciones simuladas.

`BETA_1_OPERATIONAL_COMPLETION=PASS`

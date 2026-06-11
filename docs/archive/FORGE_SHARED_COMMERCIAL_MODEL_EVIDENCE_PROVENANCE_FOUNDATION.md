# 1. SourceSystem Model

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](FORGE_FOUNDATION_LOCK.md)

---


SourceSystem representa el origen institucional, humano, documental o técnico desde donde Forge recibió o generó una pieza de información.

Debe existir como primitiva conceptual.

### Qué representa

- De dónde viene un dato.
- Qué tipo de fuente lo produjo.
- Qué autoridad tiene esa fuente.
- Qué limitaciones tiene.
- Qué dominio puede confiar en ella.
- Si la fuente es primaria, secundaria, derivada o manual.

### Qué NO representa

- No es evidencia por sí misma.
- No es verdad.
- No es confidence.
- No es una transformación.
- No es una conclusión.
- No reemplaza Provenance.
- No reemplaza RuleSnapshot.

### Tipos de SourceSystem

- User Input.
- Manager Input.
- OCR.
- Carrier Report.
- Product Library.
- Rule Engine.
- AI Extraction.
- Imported Spreadsheet.
- External API.
- Manual Override.
- System Calculation.
- Official Document.
- Internal Forge Engine.

### Responsabilidades

- Clasificar la fuente.
- Declarar si es primaria o derivada.
- Declarar si es oficial o no oficial.
- Declarar si requiere validación humana.
- Declarar si puede ser usada para decisiones económicas.
- Declarar si puede ser usada para recomendaciones.

### Límites

- SourceSystem no decide si un dato es correcto.
- SourceSystem no calcula confianza.
- SourceSystem no documenta todo el camino del dato.
- SourceSystem no resuelve conflictos entre fuentes.

## Riesgos

- Tratar User Input como verdad oficial.
- Tratar OCR como documento fuente.
- Tratar AI Extraction como evidencia.
- Tratar imported spreadsheets como carrier truth sin validación.
- Usar External API sin registrar fecha, versión y payload.
- No distinguir Product Library de Rule Engine.

### Regla

Todo dato decision-grade debe tener SourceSystem.

2. Evidence Model

EvidenceRecord representa una pieza verificable que respalda una afirmación.

### Qué es evidencia

- Un documento original.
- Un reporte oficial.
- Una cotización.
- Un estado de cuenta.
- Una imagen capturada.
- Un correo.
- Un PDF.
- Una captura manual validada.
- Un documento oficial de producto.
- Un reporte de compañía.
- Un archivo importado preservado.
- Una confirmación explícita de manager o usuario.

### Qué NO es evidencia

- Una conclusión.
- Una recomendación.
- Una inferencia.
- Un valor calculado sin respaldo.
- Un resultado de OCR sin el documento original.
- Un output de AI sin fuente.
- Una regla aplicada.
- Una métrica agregada.
- Una predicción.

### Cuándo una afirmación requiere evidencia

- Cuando afecta dinero.
- Cuando afecta elegibilidad.
- Cuando afecta compensación.
- Cuando afecta conservación.
- Cuando afecta atribución.
- Cuando afecta carrera o etapa.
- Cuando afecta una recomendación importante.
- Cuando contradice otra fuente.
- Cuando se usa para explicar una decisión histórica.
- Cuando se usará para Economic Motivation.

### Cuándo puede no requerir evidencia formal

- Preferencias no críticas del usuario.
- Estado visual temporal.
- Ayuda contextual sin impacto económico.
- Interacciones de UI de bajo riesgo.
- Borradores no usados para decisión.

### Relación con confidence

Evidence no es lo mismo que confidence.

Una evidencia puede ser fuerte o débil.

### Ejemplo

- Carrier Report oficial: evidencia fuerte.
- Foto borrosa: evidencia débil.
- OCR de PDF oficial con baja calidad: evidencia fuerte como documento, débil como extracción.
- Captura manual del asesor: evidencia humana, necesita validación si afecta dinero.

### Regla

EvidenceRecord debe preservar la fuente original incluso cuando Forge corrija, transforme o derive datos.

3. Provenance Model

### ProvenanceRecord responde

"¿Cómo llegó este dato aquí?"

Debe existir como primitiva conceptual.

Provenance no es SourceSystem.
Provenance no es Evidence.
Provenance es la cadena de custodia y transformación.

### Ejemplo

PDF original
-> OCR
-> Parser
-> Normalizer
-> Product Detection
-> Rule Engine
-> Forge Output

### Qué debe explicar

- Fuente inicial.
- Evidencia original.
- Transformaciones aplicadas.
- Engines o procesos involucrados.
- Reglas usadas.
- Persona o sistema que validó.
- Overrides aplicados.
- Correcciones posteriores.
- Fecha de cada paso.
- Confidence en cada paso.

### Eventos conceptuales que genera

### - Source_record_received.
### - Evidence_attached.
### - Ocr_extracted.
### - Field_parsed.
### - Field_normalized.
### - Product_detected.
### - Rule_applied.
### - Value_derived.
### - Human_validated.
### - Override_applied.
### - Correction_applied.
### - Output_generated.

### Cómo soporta auditoría

- Permite reconstruir la historia de un dato.
- Permite comparar output actual vs evidencia original.
- Permite explicar errores.
- Permite saber qué versión de regla se aplicó.
- Permite saber si hubo intervención humana.
- Permite preservar resultados históricos aunque cambien reglas.

### Regla

Toda afirmación decision-grade debe poder apuntar a ProvenanceRecord.

4. Confidence Model

Confidence no pertenece a una sola cosa.

### Debe existir en varios niveles

1. Evidence Confidence

Qué tan confiable es la evidencia.

### Ejemplos

- Documento oficial: alto.
- PDF incompleto: medio.
- Imagen borrosa: bajo.
- Captura manual no validada: medio/bajo.

2. Extraction Confidence

Qué tan confiable fue extraer un dato desde la evidencia.

### Ejemplos

- OCR claro: alto.
- OCR con caracteres dudosos: bajo.
- AI extraction sin validación: medio/bajo.

3. Transformation Confidence

Qué tan confiable fue normalizar, mapear o convertir el dato.

### Ejemplos

- Producto detectado por ID oficial: alto.
- Producto detectado por alias ambiguo: medio.
- Moneda inferida por contexto: bajo/medio.

4. Rule Confidence

Qué tan confiable es la regla aplicada.

### Ejemplos

- RuleSnapshot oficial confirmado: alto.
- Regla transcrita de documento incompleto: medio.
- Regla hipotética: bajo y no apta para decisiones económicas.

5. Conclusion Confidence

Qué tan confiable es la conclusión final.

### Ejemplos

- "Bono confirmado": requiere facts + evidence + rule + period + no conflicto.
- "Bono estimado": evidencia parcial o regla válida pero datos incompletos.
- "Riesgo probable": señal suficiente, pero no certeza.

### Escenarios

### OCR incierto

- Evidence confidence puede ser alto si el PDF es oficial.
- Extraction confidence puede ser bajo.
- Conclusion confidence debe bajar.

### Usuario captura manual

- SourceSystem es User Input.
- Evidence puede ser captura manual.
- Confidence depende de validación.

### Carrier report oficial

- Evidence confidence alto.
- Source authority alto.
- Aun así puede requerir Provenance y period alignment.

### AI interpreta documento

- AI output no es verdad.
- AI extraction requiere evidence link y human/system validation.
- Conclusion confidence debe reflejar extracción probabilística.

### Regla validada

- Rule confidence alto si está versionada, documentada y aplicada al periodo correcto.

### Modelo correcto

Confidence debe ser contextual, multidimensional y heredada hacia abajo.

La confidence final de una conclusión no puede ser mayor que su eslabón más débil si ese eslabón es esencial.

5. Truth Model

Forge no debe tratar todo como verdad.

### Categorías

Fact

Un hecho observado o registrado.

### Ejemplos

- Póliza emitida.
- Pago recibido.
- Comisión posteada.
- Documento recibido.
- Manager asignado en fecha X.

### Evidencia requerida

- SourceSystem.
- EvidenceRecord o SourceRecord.
- Provenance.
- Timestamp.

Interpretation

Aplicación de reglas a facts.

### Ejemplos

- Esta póliza cuenta para concurso.
- Este advisor está en mes 13.
- Esta producción califica para bono.

### Evidencia requerida

- Facts.
- RuleSnapshot.
- PeriodSnapshot.
- Provenance.

Recommendation

Sugerencia accionable basada en facts e interpretations.

### Ejemplos

- Contacta a este cliente.
- Protege esta renovación.
- Completa dos pólizas antes de cierre.

### Evidencia requerida

- Facts o interpretations.
- Rationale.
- Confidence.
- Action boundary.

Prediction

Estimación sobre futuro.

### Ejemplos

- Podrías ganar $12,000 más.
- Riesgo de perder bono.
- Probabilidad de conversión.

### Evidencia requerida

- Facts explícitos.
- Reglas explícitas.
- Supuestos visibles.
- Confidence.
- Etiqueta de estimado.

Assumption

Supuesto usado porque falta información.

### Ejemplos

- Si la póliza se paga antes del cierre.
- Si la regla vigente no cambia.
- Si el index reportado aplica al periodo.

### Evidencia requerida

- Debe declararse como supuesto.
- No puede presentarse como fact.
- No debe sostener decisiones de alto impacto sin validación.

### Truth rule

Forge puede decir "sé", "interpreto", "recomiendo", "estimo" o "asumo", pero nunca debe mezclar esas categorías.

6. Override & Correction Strategy

### Problema

Los datos pueden estar mal, incompletos o corregirse después.

### Estrategia

No reescribir el pasado.

### Preservar

- Evidencia original.
- Valor original.
- Transformación original.
- Output original.
- Corrección posterior.
- Quién corrigió.
- Por qué corrigió.
- Qué periodos afecta.
- Qué outputs deben recalcularse.

### Tipos

OCR Incorrecto

- Preservar extracción original.
- Agregar corrected value.
- Marcar extraction confidence baja.
- Registrar quién o qué corrigió.

Usuario corrige dato

- Registrar Manual Override.
- Requiere reason.
- Puede requerir evidence si afecta dinero.

Manager corrige dato

- Registrar Manager Override.
- Determinar autoridad del manager para ese dominio.
- Requiere effective period.

Carrier corrige reporte

- Registrar Source Correction.
- Preservar reporte anterior.
- Marcar nuevo reporte como authoritative si corresponde.

Regla corregida

- Crear Rule Correction.
- No reemplazar RuleSnapshot usado históricamente.
- Definir si la corrección es retroactive analysis o official recalculation.

Compensación recalculada

- Crear Compensation Recalculation.
- Preservar cálculo anterior.
- Relacionar con facts, corrections y RuleSnapshot.

### Principios

- Override no borra evidencia.
- Correction no borra output histórico.
- Recalculation no borra cálculo anterior.
- Manual override no puede elevar confidence sin evidencia.
- Una corrección debe declarar impacto.

7. Product Knowledge Implications

### Impacto sobre OCR Pipeline

- OCR nunca debe ser fuente de verdad.
- OCR es transformación.
- El documento original es evidencia.
- OCR debe generar extraction confidence.
- OCR bajo debe exigir revisión antes de decisiones importantes.

### Impacto sobre Product Detection

- Product Detection debe explicar por qué detectó un producto.
- Debe preservar señales usadas: nombre, alias, clave, cobertura, formato, fuente.
- Detección ambigua debe bajar confidence.
- No debe inventar producto si no hay match confiable.

### Impacto sobre Product Library

- Product Library debe ser SourceSystem confiable para conocimiento de producto.
- Debe tener versionado.
- Debe distinguir producto, cobertura, rider, plan, variante y alias.
- Debe distinguir product knowledge de commission schedule y contest rules.

### Impacto sobre Product Knowledge

- Toda afirmación de producto debe estar respaldada por fuente oficial o knowledge entry validado.
- Si falta un beneficio, Forge debe decir unknown.
- Si un PDF contradice Product Library, se necesita conflict resolution.

### Cómo evitar productos inventados

- No fallback product.
- No fuzzy match definitivo sin confidence.
- No completar beneficios faltantes.
- No inferir cobertura por nombre comercial.
- No usar AI como fuente final.

### Cómo justificar detecciones

- Mostrar evidence.
- Mostrar extracted fields.
- Mostrar matched product.
- Mostrar confidence.
- Mostrar alternative candidates si aplica.

### Cómo manejar confidence media

- Permitir borrador o revisión.
- Bloquear decisiones financieras de alto impacto.
- Pedir confirmación.
- Etiquetar como "probable", no "confirmado".

8. Economic Motivation Guardrails

### Escenario

"Te faltan 2 pólizas para ganar $12,000 más."

### Evidencia necesaria

- Producción actual confirmada.
- Policy count snapshot.
- PeriodSnapshot correcto.
- Advisor stage/career snapshot.
- Contest rule snapshot.
- Commission schedule si incluye comisiones.
- Bonus eligibility actual.
- Políticas elegibles y faltantes.
- RuleSnapshot de bono.
- Conservation/index status si afecta bono.

### Reglas necesarias

- Contest rule.
- Policy count rule.
- Bonus calculation rule.
- Commission schedule si se incluye comisión.
- Period close rule.
- Exclusions.
- Eligibility gates.

### Confidence necesaria

Alta para decir "confirmado".
Media para decir "estimado".
Baja para no mostrar monto o mostrar solo gap no económico.

Cuándo decir "confirmado":

- Facts confirmados.
- RuleSnapshot oficial.
- Periodo correcto.
- Sin fuentes en conflicto.
- Eligibility estable.
- No depende de evento futuro.
- Cálculo reproducible.

Cuándo decir "estimado":

- Depende de que se paguen pólizas futuras.
- Hay datos incompletos.
- Index reporting está retrasado.
- Hay confidence media en product/commission detection.
- Hay supuestos explícitos.
- El cierre de periodo no ha ocurrido.

### Cuándo no mostrar monto

- Regla no confirmada.
- Producto no identificado.
- Commission schedule faltante.
- Evidence insuficiente.
- Conflicto entre fuentes.
- OCR bajo sin validación.

### Guardrail principal

Economic Motivation puede motivar con dinero potencial, pero no puede inventar dinero. Debe declarar fuente, regla, periodo, supuestos y confidence.

9. Riesgos críticos

1. Tratar AI Extraction como evidencia.
2. Tratar OCR como fuente primaria.
3. Perder el documento original después de extraer datos.
4. Manual override sin reason ni evidence.
5. Rule correction sobrescribe RuleSnapshot histórico.
6. Carrier correction borra reporte anterior.
7. Confidence alta por motor, pero evidencia débil.
8. Product Detection inventa producto por fuzzy match.
9. Economic Motivation muestra dinero sin RuleSnapshot.
10. Imported spreadsheet se trata como reporte oficial.
11. Manager input corrige datos fuera de su autoridad.
12. Usuario corrige datos económicos sin validación.
13. Dos fuentes oficiales contradicen valores.
14. Periodo del reporte no coincide con periodo de actividad.
15. Compensation recalculation no preserva cálculo anterior.
16. Evidence incompleta usada para decisión final.
17. Assumption presentada como fact.
18. Recommendation presentada como conclusion confirmada.
19. Prediction presentada como ingreso garantizado.
20. Provenance chain rota por transformación no registrada.

10. Recomendaciones

1. SourceSystem debe ser primitiva obligatoria.
2. EvidenceRecord debe ser primitiva obligatoria.
3. ProvenanceRecord debe ser primitiva obligatoria.
4. Confidence debe existir en evidencia, extracción, transformación, regla y conclusión.
5. Forge debe distinguir fact, interpretation, recommendation, prediction y assumption.
6. Todo output económico debe declarar rule, evidence, period, source y confidence.
7. OCR debe ser transformación, nunca source of truth.
8. AI Extraction debe ser transformación asistida, nunca evidencia final.
9. Product Detection debe explicar match y alternatives.
10. Manual overrides deben preservar valor original.
11. Corrections deben ser append-only conceptualmente.
12. Recalculation debe preservar cálculo anterior.
13. RuleSnapshot no debe sobrescribirse.
14. Economic Motivation debe usar confirmed vs estimated labels.
15. Información con confidence media debe poder usarse para discovery, no para decisiones económicas finales.
16. Crear conflict-resolution semantics antes de FOUNDATION LOCK.
17. Crear authority model para quién puede corregir qué.
18. Crear source ranking por dominio.
19. Crear provenance chain para cada field decision-grade.
20. No declarar foundation lock hasta pasar escenarios de contradicción, override y correction.

11. ¿Está listo para FOUNDATION LOCK?

No.

El Shared Commercial Model no está listo para FOUNDATION LOCK hasta que Evidence & Provenance Foundation quede incorporado formalmente.

### Estado recomendado

FOUNDATION HARDENING REQUIRED.

Puede avanzar a FOUNDATION CANDIDATE cuando estén documentados:

- SourceSystem.
- EvidenceRecord.
- ProvenanceRecord.
- Confidence model multidimensional.
- Truth model.
- Override/correction strategy.
- Product knowledge provenance rules.
- Economic Motivation guardrails.
- Conflict resolution semantics.

Puede avanzar a FOUNDATION LOCK solo después de soportar estos escenarios:

1. Evidencia contradictoria entre carrier report y user input.
2. OCR equivocado corregido por usuario.
3. Manager override con autoridad limitada.
4. Carrier correction retroactiva.
5. Rule correction sin borrar histórico.
6. AI extraction con confidence media.
7. Product Detection ambigua.
8. Economic Motivation con monto estimado.
9. Compensation recalculation preservando cálculo anterior.
10. Documento incompleto bloqueando conclusión final.

### Veredicto final

Forge no inventa. Pero para cumplir eso no basta con una regla moral. Forge necesita infraestructura conceptual para explicar cómo sabe algo.

Sin SourceSystem, EvidenceRecord, ProvenanceRecord, Confidence y Truth Model, Forge no podrá defender sus recomendaciones, pagos, bonos, detecciones de producto ni motivaciones económicas dentro de 10 años.

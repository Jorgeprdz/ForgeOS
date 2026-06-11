# 1. Hallazgos Críticos

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](FORGE_FOUNDATION_LOCK.md)

---


El Red Team tenía razón: CommercialAssignment no puede cargar assignment, attribution, servicing, relationship y ownership. Si Forge no separa esos conceptos, va a fallar en compensación histórica, manager compensation, relaciones heredadas y explicación de bonos.

### El endurecimiento debe partir de cinco primitivas distintas

- CommercialPerson: quién es la persona.
- CommercialAccount: sobre qué cuenta, familia, empresa o unidad cliente ocurre la relación comercial.
- CommercialAssignment: quién tiene responsabilidad organizacional en un periodo.
- CommercialAttribution: quién recibe crédito, origen o participación por un resultado.
- CommercialServicing: quién atiende operativamente una relación, cuenta o póliza.

Estas primitivas no son intercambiables.

### Ejemplo crítico

Un asesor puede originar una póliza, otro puede atenderla, otro puede recibir parte del crédito, un manager puede haber sido responsable en el trimestre, y otra oficina puede tener servicing actual. Si Forge guarda solo “advisorId” o “managerId”, pierde la verdad histórica.

2. CommercialPerson Final

CommercialPerson debe representar una identidad humana durable.

### Responsabilidades

- Preservar identidad de una persona a través de roles.
- Soportar múltiples roles simultáneos o secuenciales.
- Permitir que cliente, referido, asesor, manager, partner o director sean la misma persona.
- Mantener continuidad histórica aunque cambie su rol comercial.
- Servir como sujeto de relaciones, roles, asignaciones, atribuciones y eventos.

### Escenarios que debe soportar

- Cliente que se convierte en asesor.
- Asesor que también compra una póliza.
- Partner que sigue produciendo.
- Manager que vuelve a asesor.
- Referido que después se convierte en cliente.
- Persona con roles simultáneos: cliente + asesor + referidor.

### Invariantes

- Una persona no deja de ser la misma por cambiar de rol.
- CommercialPerson no debe ser reemplazado por advisorId, clientId, candidateId o partnerId.
- Los roles son históricos; la identidad es durable.
- La identidad no debe decidir compensación, ownership ni servicing.

### Jamás debe almacenar

- Comisión.
- Bono.
- Manager actual como valor único.
- Oficina actual como valor único.
- Etapa actual como verdad única.
- Pólizas embebidas.
- Reglas de concurso.
- Métricas calculadas.
- Attribution split.
- Servicing responsibility.

### Jamás debe resolver

- Quién cobra.
- Quién recibe crédito.
- Quién atiende.
- Quién conectó.
- Quién desarrolló.
- Qué regla aplica.
- Qué periodo aplica.
- Qué manager era responsable históricamente.

3. CommercialAccount Decisión

CommercialPerson no es suficiente.

Forge necesita CommercialAccount.

Decisión: Debe existir.

### Responsabilidad

Representar la unidad comercial sobre la que Forge gestiona relación, oportunidad, póliza, servicing y revenue.

### Tipos conceptuales

- Individual Account.
- Household / Family Account.
- Business Account.
- Corporate Account.
- Family Business Account.
- Group / Affinity Account.

### Por qué es necesaria

- Una familia puede tener varias personas, varias pólizas y un asesor servicing.
- Una empresa puede tener múltiples asegurados, pagador, dueño, decisor y beneficiarios.
- Un cliente individual puede pertenecer a un household.
- Un negocio familiar mezcla personas físicas y empresa.
- Una cuenta corporativa no se reduce a una persona.
- Relationship Intelligence y Revenue Intelligence necesitan mirar relación comercial agregada, no solo persona.

### Relación con CommercialPerson

- CommercialAccount contiene o agrupa participantes.
- CommercialPerson puede tener roles dentro de una o varias cuentas.
- Una póliza puede estar ligada a una cuenta y también a personas específicas.
- Una oportunidad puede pertenecer a una cuenta, no solo a una persona.

### Ejemplo

Empresa ABC es CommercialAccount.
El dueño, empleados asegurados, pagador y contacto administrativo son CommercialPerson.
Cada persona tiene un rol dentro de la cuenta.

4. Assignment Definición

CommercialAssignment significa responsabilidad organizacional o estructural vigente durante un periodo.

### Responde

- Quién tenía responsabilidad formal.
- En qué oficina/unidad/equipo.
- Bajo qué manager/partner.
- Durante qué fechas.
- Con qué razón o fuente.

### Ejemplos

- Manager actual del asesor.
- Oficina asignada.
- Equipo asignado.
- Partner responsable.
- Unidad comercial.
- Cartera asignada.
- Recruit ownership durante precontract.

### Qué NO significa

- No significa quién originó una venta.
- No significa quién cobra comisión.
- No significa quién atiende al cliente.
- No significa quién conectó.
- No significa quién desarrolló.
- No significa quién merece crédito comercial.
- No significa relación personal.

### Problemas que resuelve

- Cambios de manager.
- Cambios de oficina.
- Cambios de partner.
- Cambios de equipo.
- Histórico de responsabilidad.
- Reglas aplicables por oficina/unidad.
- Manager compensation por periodo.

### Problemas que NO resuelve

- Split de crédito.
- Comisión individual.
- Servicing operativo.
- Referral source.
- Desarrollo del asesor.
- Origen de póliza.

### Invariante

Assignment siempre debe ser time-bounded. Nunca overwrite.

5. Attribution Definición

CommercialAttribution significa crédito, origen, contribución o participación reconocida para un resultado comercial.

### Responde

- Quién originó.
- Quién conectó.
- Quién desarrolló.
- Quién recibe crédito.
- Quién participa en split.
- Qué porcentaje o tipo de participación aplica.
- Para qué evento/resultado aplica.
- Bajo qué regla o evidencia.

### Ejemplos

- Asesor A conectó al nuevo asesor.
- Asesor B desarrolló al asesor.
- Partner C recibe attribution por alta.
- Manager D recibe attribution por productividad del trimestre.
- Asesor A y B comparten 50/50 una oportunidad.
- RDA viene de Persona X.
- Póliza originada por asesor original, atendida por asesor nuevo.

### Qué NO significa

- No significa manager actual.
- No significa servicing actual.
- No significa ownership organizacional.
- No significa relación familiar o personal.
- No necesariamente significa comisión pagada.
- No necesariamente significa asesor de registro.

### Problemas que resuelve

- Conexión.
- Desarrollo.
- Referral.
- Crédito comercial.
- Split attribution.
- Manager compensation.
- Producción histórica.
- Alta Partner.
- Bonos por origen.

### Problemas que NO resuelve

- Quién atiende hoy.
- Quién está asignado formalmente.
- Quién es titular de póliza.
- Quién paga la póliza.
- Quién administra operación diaria.

### Invariante

Attribution debe estar ligada a un resultado, evento, periodo o regla. No debe ser un campo estático en persona o póliza.

6. Servicing Definición

CommercialServicing significa responsabilidad operativa de atención, seguimiento, mantenimiento o administración comercial.

### Responde

- Quién atiende hoy.
- Quién da seguimiento.
- Quién gestiona renovaciones.
- Quién administra la relación.
- Quién debe contactar.
- Quién tiene responsabilidad práctica sobre cuenta/póliza/cliente.

### Ejemplos

- Asesor servicing de una póliza.
- Asesor servicing de una cuenta heredada.
- Manager que temporalmente atiende una cartera.
- Oficina que administra una cuenta corporativa.
- Ejecutivo que gestiona renovación.

### Qué NO significa

- No significa originador.
- No significa conectador.
- No significa quien cobra.
- No significa quien recibe crédito histórico.
- No significa manager assignment.
- No significa relación personal.

### Problemas que resuelve

- Clientes heredados.
- Cambio de asesor servicing.
- Transferencia de cartera.
- Renovaciones.
- Follow-up operativo.
- Responsabilidad de contacto.
- Relationship Intelligence actual.

### Problemas que NO resuelve

- Crédito histórico.
- Comisión histórica.
- Bono de conexión.
- Bono de desarrollo.
- Attribution de manager compensation.

### Invariante

Servicing puede cambiar sin alterar attribution histórica.

7. Attribution Taxonomy

Forge sí necesita taxonomía oficial.

### Obligatorias

Connection Attribution

Quién conectó o refirió a una persona que entra al canal comercial.

Development Attribution

Quién desarrolló, acompañó o ayudó a madurar a un asesor.

Referral Attribution

Quién generó el referido comercial o de reclutamiento.

Production Attribution

Quién originó producción comercial.

Compensation Attribution

Quién es elegible para recibir comisión, bono o participación económica según regla.

Manager Attribution

Qué manager/partner/unidad recibe crédito o responsabilidad por producción/equipo en un periodo.

Recruitment Attribution

Quién originó, atrajo, entrevistó o avanzó a un candidato.

Revenue Attribution

Qué persona/canal/acción originó una oportunidad o ingreso potencial.

Relationship Attribution

Quién tiene influencia o puente relacional sobre una relación.

### No obligatoria como attribution separada

Servicing Attribution

Debe ser CommercialServicing, no attribution. Servicing puede generar señales, pero no debe confundirse con crédito.

### Derivadas

- Team attribution puede derivarse de Manager Attribution + Assignment + RuleSnapshot.
- Office attribution puede derivarse de Assignment + RuleSnapshot.
- Contest attribution puede derivarse de Connection/Development/Production attribution + Contest Rules.
- Economic attribution puede derivarse de Compensation Attribution + Production Attribution.

### Regla

### Una attribution debe declarar

- attributionType.
- subject.
- attributedTo.
- related event/result.
- period.
- percentage/share si aplica.
- rule snapshot.
- evidence/provenance.
- effective dates.
- status.

8. PolicyRole Model

Forge necesita PolicyRole.

Una póliza no puede tener solo clientId y advisorId.

### Roles obligatorios para seguros

Policy Owner

Titular/dueño de la póliza.

Insured

Persona asegurada. Puede ser distinta del titular.

Payor

Persona o cuenta que paga.

Beneficiary

Beneficiario. Puede haber múltiples.

Advisor Of Record

Asesor registrado formalmente ante la compañía.

Originating Advisor

Asesor que originó la venta.

Servicing Advisor

Asesor que atiende actualmente.

Compensation Recipient

Persona/rol que recibe comisión o bono según reglas.

Manager Attribution

Manager/partner/unidad que recibe attribution por periodo/regla.

### Obligatorios desde el modelo conceptual

- Policy Owner.
- Insured.
- Payor.
- Advisor Of Record.
- Originating Advisor.
- Servicing Advisor.

### Condicionales

- Beneficiary: obligatorio cuando el producto lo requiere.
- Compensation Recipient: obligatorio para compensation explanation.
- Manager Attribution: obligatorio para manager compensation.
- Account Role: obligatorio para cuentas empresariales/familiares.

### Derivados

- Compensation Recipient puede derivarse de commission schedule + attribution + assignment + rule snapshot.
- Manager Attribution puede derivarse de assignment histórico + rule snapshot, pero debe preservarse como snapshot cuando se calcula.
- Servicing Advisor puede cambiar y no debe recalcular Originating Advisor.

### Escenarios que soporta

- Póliza vendida por asesor A y atendida por asesor B.
- Cliente transferido de oficina.
- Póliza corporativa con múltiples asegurados.
- Beneficiarios no clientes.
- Pagador distinto del asegurado.
- Producción atribuida históricamente a manager anterior.

9. Relationship Model

CommercialRelationship es necesario, pero no suficiente sin subtipos.

### Debe representar relación entre

- Person <-> Person.
- Person <-> Account.
- Account <-> Account.
- Person <-> Organization.
- Person <-> Policy.
- Account <-> Policy.

### Subtipos mínimos

ClientRelationship

Relación cliente-asesor o cliente-organización.

ReferralRelationship

Referidor <-> referido.

FamilyRelationship

Cónyuge, hijo, padre, familiar, household.

BusinessRelationship

Dueño, socio, empleado, contacto administrativo, decisor.

ManagerRelationship

Manager <-> asesor, pero solo como relación humana o laboral; assignment formal va separado.

PartnerRelationship

Partner <-> asesor, desarrollador, promotor.

InfluenceRelationship

Centro de influencia, puente de confianza, sponsor.

ServiceRelationship

Relación de atención operativa, aunque preferentemente ligada a CommercialServicing.

### Huecos si no se subtipa

- Cliente referido por otro cliente.
- Empresa con dueño y empleados.
- Familia con múltiples pólizas.
- Asesor que atiende a su familiar.
- Manager que también es cliente.
- Partner que desarrolló, pero no administra.
- Cliente compartido por dos asesores.
- Relación de confianza útil para revenue, pero no para compensation.

### Regla

Relationship explica vínculo.
Assignment explica responsabilidad formal.
Attribution explica crédito.
Servicing explica atención.
PolicyRole explica papel dentro de póliza.

10. Riesgos Abiertos

1. Split attribution requiere reglas claras por tipo.
2. Retroactive attribution correction puede romper pagos ya cerrados.
3. CommercialAccount puede crecer demasiado si intenta resolver todo el CRM.
4. Family/Business relationships necesitan evidencia y privacidad.
5. PolicyRole puede tener datos sensibles de beneficiarios.
6. Servicing actual puede entrar en conflicto con Advisor of Record.
7. Manager assignment y manager attribution pueden divergir.
8. Connection attribution y referral attribution pueden confundirse.
9. Development attribution puede ser subjetiva si no hay evidencia.
10. Compensation recipient puede depender de carrier rules externas.
11. Cliente compartido puede generar duplicación de follow-up.
12. Revenue attribution puede chocar con production attribution.
13. Advisor Experience puede usar relationship/servicing como si fueran learning context sin permisos claros.
14. Command OS podría ejecutar acción sobre cuenta equivocada si account/person/servicing no están resueltos.
15. Mick podría atribuir disciplina al asesor servicing cuando la producción fue de otro.
16. Policy transfer podría alterar conservación si no se preserva periodo efectivo.
17. Office transfer puede cambiar reglas aplicables sin cambiar attribution histórica.
18. Household/business account puede mezclar personas con diferentes consentimientos.
19. Manual correction sin provenance puede destruir auditoría.
20. Si CommercialPerson permite duplicados no resueltos, todo lo demás queda contaminado.

11. Cambios Obligatorios Al Shared Commercial Model

Antes de declarar el Shared Commercial Model como FOUNDATIONAL, debe incorporar formalmente:

1. CommercialAccount.
2. CommercialAttribution.
3. CommercialServicing.
4. PolicyRole.
5. Subtipos de CommercialRelationship.
6. Separación estricta entre Assignment, Attribution, Servicing, Relationship y Ownership.
7. Taxonomía oficial de attribution.
8. Reglas de split attribution.
9. Reglas de attribution correction.
10. Effective periods para assignment, attribution y servicing.
11. Evidence/provenance obligatorio para attribution sensible.
12. Declaración explícita: CommercialPerson no resuelve roles, bonos, servicing ni attribution.
13. Declaración explícita: snapshots calculados no son fuentes primarias.
14. Modelo de cuenta para family/business/corporate.
15. PolicyRole como puente entre persona, cuenta, póliza, servicing, production y compensation.
16. Distinción entre Advisor of Record, Originating Advisor y Servicing Advisor.
17. Distinción entre Manager Assignment y Manager Attribution.
18. Distinción entre Referral Attribution y Connection Attribution.
19. Relación clara entre CommercialAccount y RevenueOpportunity.
20. Relación clara entre CommercialServicing y Relationship Intelligence.

12. ¿Está Listo Para FOUNDATION LOCK?

No.

Está más fuerte, pero todavía no debe cerrarse como FOUNDATION LOCK hasta que estos conceptos queden incorporados explícitamente en el documento oficial del Shared Commercial Model.

### Estado recomendado

FOUNDATION HARDENING REQUIRED

Puede avanzar a FOUNDATION CANDIDATE cuando estén documentados:

- CommercialAccount.
- CommercialAttribution.
- CommercialServicing.
- PolicyRole.
- Relationship subtypes.
- Attribution taxonomy.
- Split/correction semantics.
- Effective period rules.

Puede avanzar a FOUNDATION LOCK solo después de pasar escenarios críticos:

1. Cliente compartido por dos asesores: soportado con Account + Relationship + Servicing + Attribution.
2. Cliente heredado por cambio de oficina: soportado sin reescribir producción histórica.
3. Cambio de manager a mitad de trimestre: soportado por Assignment + Manager Attribution snapshot.
4. Partner desarrolla asesor pero manager diferente: soportado por Development Attribution separada de Assignment.
5. Asesor conecta pero no desarrolla: soportado por Connection Attribution separada de Development Attribution.
6. Split 50/50: soportado por CommercialAttribution con share.
7. Cliente individual se convierte en asesor: soportado por CommercialPerson + CommercialRole.
8. Empresa con múltiples asegurados: soportado por CommercialAccount + PolicyRole.
9. Póliza transferida de servicing: soportado por CommercialServicing sin alterar Originating Advisor.
10. Cambio retroactivo de atribución: soportado por attribution correction + provenance + period impact.

### Veredicto final

El modelo original tiene buena base, pero sin este hardening no puede explicar correctamente comisiones, bonos, conexión, desarrollo, manager compensation, servicing y relaciones dentro de 10 años. El Shared Commercial Model debe bloquear primero identidad, cuenta, atribución, servicing y policy roles antes de volverse fundacional.

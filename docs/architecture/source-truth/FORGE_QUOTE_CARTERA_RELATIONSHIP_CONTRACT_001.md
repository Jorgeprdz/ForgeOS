# FORGE — Quote ↔ Cartera Relationship Contract 001

## Decisión

Forge utiliza **una sola relación canónica y agnóstica al producto** para enlazar una Quote durable con la futura continuidad de Cartera.

```text
Durable Quote
→ Prospect lineage
→ confirmed CommercialPerson link
→ reviewed Policy evidence
→ governed CARTERA 020C confirmation review
→ confirmed canonical Policy
```

La relación no convierte una cotización en póliza. Tampoco crea, fusiona o duplica personas.

## Autoridades reutilizadas

| Verdad | Autoridad |
|---|---|
| Quote, Quote Version y lifecycle | CARTERA 001B Quote Lifecycle Authority |
| Prospect | Pipeline / Prospect authority |
| CommercialPerson e identidad | CARTERA 010B Identity Resolution |
| Documento y evidencia de póliza | CARTERA 020B Policy Evidence Intake |
| Confirmación humana de identidad y Policy | CARTERA 020C Confirmation Review |
| Policy canónica | CARTERA 010B Confirmed Policy Authority |

Este contrato no reemplaza ninguna de esas autoridades. Sólo conserva su linaje y determina cuál debe intervenir después.

## Estados

### `QUOTE_LINKED`

La Quote está durablemente relacionada con el Prospect, pero todavía se encuentra en `REVIEWED` o `PRESENTED`.

```text
NEXT_AUTHORITY=QUOTE_LIFECYCLE_AUTHORITY
POLICY_CANDIDATE_CREATED=NO
```

### `AWAITING_PERSON_CONFIRMATION`

La Quote fue aceptada por el Prospect, pero la identidad todavía no está resuelta mediante CARTERA 010B.

```text
NEXT_AUTHORITY=CARTERA_010B_IDENTITY_RESOLUTION
PERSON_DUPLICATION=FORBIDDEN
```

### `AWAITING_POLICY_EVIDENCE`

La Quote aceptada ya está ligada a una CommercialPerson confirmada, pero no existe evidencia revisada de una póliza emitida.

```text
NEXT_AUTHORITY=CARTERA_020B_POLICY_EVIDENCE_INTAKE
POLICY_CREATED=NO
```

### `POLICY_EVIDENCE_DISPUTED`

Existe evidencia, pero la revisión humana la marcó como disputada.

```text
NEXT_AUTHORITY=CARTERA_020B_POLICY_EVIDENCE_REVIEW
POLICY_CONFIRMATION=BLOCKED
```

### `READY_FOR_POLICY_CONFIRMATION_REVIEW`

La Quote está aceptada, la CommercialPerson está confirmada y existe evidencia de póliza revisada. El contrato únicamente autoriza entregar el contexto a CARTERA 020C.

```text
NEXT_AUTHORITY=CARTERA_020C_POLICY_CONFIRMATION_REVIEW
POLICY_CANDIDATE_CREATED=NO
POLICY_CREATED=NO
POLICY_CONFIRMATION_AUTHORIZED=NO
```

La confirmación sigue requiriendo decisión humana y las autoridades persistentes ya aceptadas.

## Linaje mínimo conservado

```text
quoteReference
quoteVersionReference
prospectReference
productReference
snapshotDigest
eventReferences
applicationReference|null
commercialPersonReference|null
identityDecisionReference|null
policyEvidencePacketReference|null
policyEvidenceReviewReference|null
```

No se copian primas, sumas aseguradas, coberturas, beneficios, cálculos, UDI, Product Intelligence ni contenido PDF. Esa verdad permanece bajo la autoridad de Quote y de los documentos fuente.

## Frontera de mutación

```text
QUOTE_MUTATION=NO
PROSPECT_MUTATION=NO
PERSON_CREATION=NO
PERSON_MERGE=NO
POLICY_CREATION=NO
POLICY_CONFIRMATION=NO
CARTERA_MUTATION=NO
CRM_MUTATION=NO
APPLICATION_CREATION=NO
EXTERNAL_EFFECT=NO
```

El envelope es inmutable y digest-bound. Modificar su estado o ampliar permisos invalida la relación.

## Productos

Vida Mujer, Segubeca y futuros productos usan el mismo contrato. La única diferencia permitida es `productReference`.

```text
PRODUCT_SPECIFIC_RELATIONSHIP_ADAPTERS=FORBIDDEN
PRODUCT_FORMULAS_IN_RELATIONSHIP=FORBIDDEN
```

Esto permite avanzar con Segubeca sin crear una integración especial que después deba rehacerse.

## Relación con la promoción de Cartera

Este contrato se desarrolla en una rama independiente de la promoción selectiva CARTERA 130:

```text
STACKED_BRANCH=NO
PROMOTION_PATH_REPLACEMENT=NO
SUPABASE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

Después de que CARTERA 130 quede en `main`, el siguiente paso será montar un adaptador productivo que lea los recibos reales de 001B, 010B y 020B y produzca este envelope. Ese montaje no podrá crear Policy ni ejecutar automáticamente CARTERA 020C.

## Criterios de aceptación

```text
DURABLE_QUOTE_REQUIRED=PASS
QUOTE_PERSON_PROSPECT_MATCH=PASS
PERSON_DUPLICATION_BLOCKED=PASS
POLICY_EVIDENCE_GATE=PASS
POLICY_CREATION_BLOCKED=PASS
CALCULATION_COPY_BLOCKED=PASS
VIDA_MUJER_AND_SEGUBECA_SHARED_CONTRACT=PASS
TAMPER_EVIDENT_MUTATION_BOUNDARY=PASS
```

# FORGE — Quote ↔ Cartera Relationship Contract 001

## Decisión

Forge utiliza **una sola relación canónica y agnóstica al producto** para enlazar una Quote durable con la continuidad de Cartera.

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
VIDA_MUJER_AND_SEGUBECA_SHARED_CONTRACT=PASS
```

Esto permite avanzar con Segubeca sin crear una integración especial que después deba rehacerse.

## Cartera promovida y adaptador real

CARTERA 130 fue promovida a `main` mediante PR #143 antes de abrir este PR sobre la base productiva resultante.

```text
CARTERA_130_PROMOTED=YES
CARTERA_130_MERGE_SHA=6d73f0ef030aaa9172e6e9263a1b08e539ecd576
STACKED_BRANCH=NO
PROMOTION_PATH_REPLACEMENT=NO
SUPABASE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

El adaptador `accepted-quote-cartera-relationship-adapter.js` consume las formas reales promovidas de:

```text
CARTERA_001B_QUOTE_PERSISTENCE_RECEIPT
CARTERA_010B_IDENTITY_DECISION_RECEIPT
CARTERA_020B_POLICY_EVIDENCE_RECEIPT
```

y produce el envelope común. El adaptador no escucha eventos, no llama RPC, no persiste información y no ejecuta CARTERA 020C.

```text
AUTOMATIC_LISTENERS=NO
AUTOMATIC_RPC=NO
AUTOMATIC_PERSISTENCE=NO
AUTOMATIC_POLICY_CREATION=NO
AUTOMATIC_POLICY_CONFIRMATION=NO
```

Una evidencia `CONFIRMED` por la autoridad de evidencia sólo significa que el paquete está listo para revisión gobernada; nunca equivale a una Policy confirmada.

## Siguiente montaje permitido

Una superficie productiva futura podrá mostrar el estado de la relación y abrir la revisión humana correspondiente. No podrá crear Policy, resolver identidad ni ejecutar confirmación automáticamente.

```text
RUNTIME_READ_MODEL=FUTURE_PASS
AUTOMATIC_EXECUTION=FORBIDDEN
SEGUBECA_CAN_REUSE_CONTRACT=YES
```

## Criterios de aceptación

```text
DURABLE_QUOTE_REQUIRED=PASS
QUOTE_PERSON_PROSPECT_MATCH=PASS
PERSON_DUPLICATION_BLOCKED=PASS
POLICY_EVIDENCE_GATE=PASS
POLICY_CREATION_BLOCKED=PASS
CALCULATION_COPY_BLOCKED=PASS
VIDA_MUJER_AND_SEGUBECA_SHARED_CONTRACT=PASS
PROMOTED_AUTHORITY_RECEIPT_ADAPTER=PASS
TAMPER_EVIDENT_MUTATION_BOUNDARY=PASS
AUTOMATIC_RUNTIME_EFFECTS=BLOCKED
```

# ForgeOS — CRS 10 Existing Relationship Intelligence Composition 001

## Authority lock

```text
PERSON_AUTHORITY=CARTERA_010B_COMMERCIAL_PERSON
WORKSPACE_AUTHORITY=CRS_09_PRODUCTIVE_PERSON_WORKSPACE
TIMELINE_AUTHORITY=CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL
INTELLIGENCE_FOUNDATION=CARTERA_050_TO_100
CRS_10_ROLE=SHARED_READ_ONLY_COMPOSITION
```

CRS 10 does not build another intelligence stack. It composes the accepted Cartera 050–100 read models inside the existing contextual person workspace and preserves every source authority, limitation and human-review boundary.

```text
NEW_SCORE_ENGINE=FORBIDDEN
NEW_RELATIONSHIP_MEMORY_AUTHORITY=FORBIDDEN
NEW_ACTIVATION_STACK=FORBIDDEN
NEW_RELATIONSHIP_GRAPH_TRUTH=FORBIDDEN
NEW_PRODUCTIVITY_AUTHORITY=FORBIDDEN
```

## Composed domains

| CRS 10 domain | Existing authority | Presentation scope |
|---|---|---|
| Future Radar | Cartera 050 | Person |
| Relationship Growth | Cartera 060 | Person |
| Relational Activation | Cartera 070 | Person |
| Economic Connection | Cartera 080 projection | Person |
| Relationship Capital | Cartera 090 | Person |
| Productivity Proof | Cartera 100 | Advisor |

Productivity Proof is advisor evidence. It may be shown while reviewing a person only as explicitly labeled advisor context. It must never become a person attribute, client score, relationship value or explanation of the client.

## Composition rules

1. `CommercialPerson` is revalidated against the authenticated advisor before loading intelligence.
2. Person-scoped items must carry exactly the selected `personReference`.
3. Portfolio-wide projections are filtered before entering the workspace.
4. Advisor-scoped evidence must carry no `personReference`.
5. Each source reports `AVAILABLE`, `EMPTY`, `DEGRADED` or `UNAVAILABLE` independently.
6. One failing source cannot hide or relabel another source.
7. Missing evidence is never interpreted as zero.
8. No opaque ranking, human-worth field, probability, predicted revenue or final priority may cross the composition boundary.
9. CRS 10 exposes no local mutation controls. Review links return to the owning Cartera domain.
10. Logout, route exit and person changes scrub the composition and reject late results.

## Existing authority boundaries

### Cartera 050

Future Radar remains an explainable date/horizon projection. CRS 10 may show `whyThisPerson`, `whyNow`, uncertainty and smallest useful action. It cannot claim final priority, lapse probability, commission calculation or automatic opportunity creation.

### Cartera 060

Relationship Growth remains review-only. It cannot create an opportunity, contact the person, request a referral, use life context as a sales trigger or become final NBA truth.

### Cartera 070

Relational Activation remains a bounded preparation deck. It cannot send a message, place a call, create a task/calendar event/opportunity, request a referral or optimize variable rewards.

### Cartera 080

Economic Connection remains a projection over evidence claims, proposed matches, explicit human decisions and canonical payment handoff. CRS 10 cannot confirm payment, mutate a ledger, read Gmail or calculate commission.

### Cartera 090

Relationship Capital remains explainable context and hypotheses. It cannot expose influence scores, relationship-value scores, predicted revenue, purchase probability or human worth.

### Cartera 100

Productivity Proof remains evidence-bound advisor learning. It cannot produce an advisor score, ranking, discipline/motivation/coachability score, employment recommendation or enforcement.

## Product mount

```text
ROUTE=?nav=persona
NEW_ROUTE=NO
PRIMARY_NAV_ITEM=NO
MOUNT_LOCATION=EXISTING_CRS_09_PERSON_WORKSPACE
MATERIAL3_SECTION=INTELLIGENCE
```

The workspace shows six domain cards, source scope, health, explanation, uncertainty, evidence count and a deep link to the owning Cartera surface. It contains no form, submit control or mutation command.

## Privacy and safety

```text
OPAQUE_HUMAN_SCORING=NO
PERSON_VALUE_SCORING=NO
AUTOMATIC_CONTACT=NO
AUTOMATIC_MESSAGE=NO
AUTOMATIC_TASK=NO
AUTOMATIC_CALENDAR=NO
AUTOMATIC_OPPORTUNITY=NO
AUTOMATIC_STAGE_ADVANCE=NO
AUTOMATIC_APPLICATION=NO
AUTOMATIC_POLICY=NO
SENSITIVE_CONTEXT_AS_SALES_TRIGGER=NO
RAW_PROVIDER_PAYLOAD_COPY=NO
```

## Completion contract

```text
CRS_10A_EXISTING_AUTHORITY_RECONCILIATION=REQUIRED
CRS_10B_PERSON_AND_ADVISOR_SCOPE_COMPOSITION=REQUIRED
CRS_10C_MATERIAL3_WORKSPACE_MOUNT=REQUIRED
CRS_10D_RESPONSIVE_AND_RUNTIME_ACCEPTANCE=REQUIRED
NEXT_AFTER_COMPLETE=CRS_11ABCD_END_TO_END_RELATIONSHIP_ACCEPTANCE
```

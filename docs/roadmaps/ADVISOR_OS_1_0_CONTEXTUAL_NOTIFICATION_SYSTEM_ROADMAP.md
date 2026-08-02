# Advisor OS 1.0 — Contextual Notification System Roadmap

```text
DOCUMENT=ADVISOR_OS_1_0_CONTEXTUAL_NOTIFICATION_SYSTEM_ROADMAP
STATUS=ACTIVE_REQUIRED_DEPENDENCY
DATE=2026-08-02
OWNER=FORGE_PRODUCT_AUTHORITY
TARGET=ADVISOR_OS_1_0
PARENT=ADVISOR_OS_1_0_CLOSURE_ROADMAP
ROLE=MANDATORY_CLOSURE_PASS
```

## 1. Purpose

Advisor OS 1.0 requires a contextual notification system that understands the advisor's operating agenda, commitments, goals, commercial work and portfolio events.

Forge must not behave like an alarm clock or a generic task list. A notification must emerge from a grounded operational fact and help the advisor decide or complete the next step.

```text
CONFIRMED_FACT_OR_DUE_COMMITMENT
→ CONTEXTUAL_TRIGGER
→ RELEVANT_NOTIFICATION
→ ADVISOR_RESPONSE
→ REVIEWABLE_NEXT_ACTION
→ EXPLICIT_CONFIRMATION
→ CANONICAL_EVENT_OR_COMMAND
```

The notification layer is a copilot. It may ask, summarize, recommend and prepare an action. It may not fabricate outcomes, silently move Pipeline, create Calendar events, send messages, confirm payments or mutate productive state without explicit human confirmation.

## 2. Product principle

A useful Forge notification answers at least one of these questions:

- What just happened?
- What was supposed to happen?
- What still needs confirmation?
- What matters now?
- What can still be recovered today?
- What is at risk if nothing is done?
- What is the smallest useful next action?

A notification is not complete when it appears. It is complete when it resolves into one of:

```text
CONFIRMED_OUTCOME
RESCHEDULED_COMMITMENT
CREATED_NEXT_ACTION
ACKNOWLEDGED_INFORMATION
DISMISSED_WITH_REASON
DEFERRED_UNTIL
ESCALATED_FOR_REVIEW
NO_ACTION_REQUIRED
```

## 3. Core notification families

### 3.1 Appointment outcome confirmation

Trigger only after the expected appointment end time plus a configurable grace period.

Example:

```text
Hoy tenías cita con Juan a las 8:00 p. m.
¿La tuviste?

[Sí, registrar resultado]
[No, reagendar]
[Se canceló]
[Aún no termina]
```

If the advisor selects `Sí`:

```text
Platícame cómo te fue.
```

Forge may then prepare structured outcome capture:

- Attended
- Need identified
- Product discussed
- Quote requested
- Proposal presented
- Objection
- Interest level
- Agreed next step
- Next-action date

If the advisor selects `No`:

```text
¿Quieres reagendarla?
```

Forge may open the governed scheduling flow, but must not create an external calendar event until the advisor reviews and confirms the handoff.

Rules:

```text
CALENDAR_HANDOFF_IS_NOT_APPOINTMENT_SUCCESS
MISSING_RESPONSE_IS_NOT_NO_SHOW
NOTIFICATION_IS_NOT_TIMELINE_TRUTH
OUTCOME_REQUIRES_HUMAN_CONFIRMATION
PIPELINE_ADVANCE_IS_NOT_AUTOMATIC
```

### 3.2 Pre-appointment preparation

Trigger before a confirmed appointment when enough context exists.

Example:

```text
Tu cita con Juan es en 45 minutos.

Lo último que sabemos:
- Busca proteger a su familia.
- Le preocupa pagar algo que no pueda sostener.
- Quedaste de mostrarle dos escenarios.

[Preparar cita]
[Ver ficha]
[Reagendar]
```

Possible preparation content:

- Last interaction
- Stated need
- Relevant family context
- Pending promise
- Existing quote
- Known objection
- Suggested questions
- Documents still missing

No private or sensitive detail should be exposed in lock-screen notification text. Detailed context belongs inside the authenticated app.

### 3.3 Daily goal-gap coaching

Trigger from authoritative activity goals and current confirmed activity.

Example:

```text
Hoy te faltan 7 puntos para llegar a tus 25.
Aún puedes hacer 3 llamadas y conseguir 2 citas para alcanzar la meta.

[Ver plan]
[Empezar llamadas]
[Ajustar meta de hoy]
```

Forge must explain the recommendation:

```text
CURRENT_CONFIRMED_POINTS=18
DAILY_GOAL=25
REMAINING_GAP=7
RECOMMENDATION_SOURCE=ACTIVITY_POINT_MODEL
ASSUMPTION=3_CALLS_PLUS_2_APPOINTMENTS
```

Rules:

- Never count unconfirmed activity.
- Never present a recommendation as guaranteed achievement.
- Never shame the advisor.
- Adapt recommendations to remaining time, working hours and pending commitments.
- Stop prompting when the goal is reached or the user closes the day.
- Preserve unknown values instead of converting them to zero.

### 3.4 Midday recovery prompt

Trigger when the daily plan is materially behind and there is still a realistic recovery window.

Example:

```text
Vas en 11 de 25 puntos y quedan 4 horas de trabajo.
Tu mejor ruta de recuperación es:
1. Completar 2 seguimientos vencidos.
2. Hacer 3 llamadas pendientes.
3. Confirmar la cita de mañana.

[Ver plan de recuperación]
[Empezar por el primero]
[No hoy]
```

The plan must use real pending work, not invented generic activity.

### 3.5 End-of-day closure

Trigger near the advisor's configured workday end.

Example:

```text
Antes de cerrar el día:
- 2 citas siguen sin resultado.
- 3 seguimientos quedaron abiertos.
- Te faltaron 4 puntos para la meta.

[Cerrar pendientes]
[Pasar a mañana]
[Finalizar día]
```

The advisor must be able to close the day without being trapped in a notification loop.

### 3.6 Follow-up due or overdue

Trigger when a canonical next action becomes due or overdue.

Examples:

```text
Quedaste de llamar a Laura hoy a las 5:00 p. m.
[Llamar]
[WhatsApp]
[Reagendar]
[Marcar como resuelto]
```

```text
Este seguimiento lleva 3 días vencido.
La última conversación terminó con: “Lo revisaré con mi esposo”.

[Preparar mensaje]
[Llamar]
[Reagendar]
[Cerrar por ahora]
```

Opening the dialer is not confirmation that a call occurred. Opening WhatsApp is not confirmation that a message was sent.

### 3.7 Waiting-for-external-event check

Trigger when a waiting state reaches its review date.

Examples:

```text
Esperabas respuesta de Miguel esta semana.
¿Ya respondió?

[Sí]
[No, dar seguimiento]
[Esperar más]
[Cerrar por ahora]
```

```text
La solicitud de Ana quedó pendiente de documentos.
¿Ya los recibiste?

[Sí, revisar]
[No, solicitar]
[Ya no continúa]
```

### 3.8 Payment confirmation candidate

Trigger when an authoritative email, provider event or reconciled payment source indicates a likely policy payment.

Example:

```text
Recibimos una confirmación de pago que parece corresponder a la póliza de Mariana López.

Monto: $3,450.00
Fecha: 2 de agosto de 2026
Referencia: terminación 4821

[Confirmar correspondencia]
[Revisar póliza]
[No corresponde]
```

Forge must not state `Se pagó la póliza` until the event has sufficient authority and policy matching is confirmed.

Required states:

```text
PAYMENT_SIGNAL_RECEIVED
PAYMENT_MATCH_CANDIDATE
PAYMENT_MATCH_REVIEW_REQUIRED
PAYMENT_CONFIRMED
PAYMENT_REJECTED
PAYMENT_UNRESOLVED
```

After confirmation, Forge may offer:

```text
El pago quedó confirmado.
¿Quieres agradecerle a Mariana?

[Preparar mensaje]
[No ahora]
```

The system may draft a message, but sending requires explicit review and click.

### 3.9 Payment risk and missed payment

Trigger only from an authoritative due-date or payment-status source.

Examples:

```text
La prima de la póliza de Roberto vence mañana y no hay pago confirmado.

[Contactar]
[Ver póliza]
[Ya pagó, revisar]
[Recordar después]
```

```text
La póliza de Elena aparece con pago pendiente desde hace 5 días.
Antes de contactar, revisa que el dato siga vigente.

[Revisar fuente]
[Preparar contacto]
[Marcar discrepancia]
```

Never expose a delinquency as fact when the source is stale, partial or unavailable.

### 3.10 Policy anniversary and renewal

Examples:

```text
La póliza de Carlos cumple un año en 30 días.
No hay una revisión registrada en los últimos 10 meses.

[Programar revisión]
[Ver póliza]
[No requiere acción]
```

```text
Tienes 4 renovaciones en los próximos 45 días.
Dos clientes no tienen contacto reciente.

[Ver prioridad]
[Crear plan de renovación]
```

### 3.11 Client relationship cooling

Trigger from an explainable relationship-review rule, not intuition presented as fact.

Example:

```text
Llevas 8 meses sin una interacción registrada con Fernanda.
Tiene dos pólizas activas y una revisión pendiente.

[Programar contacto]
[Ver contexto]
[No requiere seguimiento]
```

### 3.12 Quote and proposal follow-up

Examples:

```text
Presentaste la propuesta a Daniel hace 3 días y no hay siguiente acción registrada.

[Dar seguimiento]
[Registrar resultado]
[Posponer]
[Cerrar por ahora]
```

```text
La cotización de Sofía vence o quedará desactualizada pronto.

[Actualizar]
[Contactar]
[Descartar]
```

### 3.13 Application and document progress

Examples:

```text
La solicitud de Valeria lleva 48 horas sin movimiento.
Falta confirmar identificación y comprobante de domicilio.

[Solicitar documentos]
[Registrar recepción]
[Ver solicitud]
```

```text
Recibiste documentos de Diego, pero aún no se han revisado.

[Revisar ahora]
[Asignar para después]
```

Receipt is not approval. Review must be explicit.

### 3.14 New lead response window

Trigger when a newly entered lead remains untouched beyond the configured response window.

Example:

```text
Entró un prospecto nuevo hace 35 minutos y todavía no tiene primer contacto.

[Contactar ahora]
[Programar]
[No es viable]
```

### 3.15 Prospect stagnation

Example:

```text
Andrea lleva 14 días en la misma etapa sin una próxima acción.

[Definir siguiente paso]
[Esperar con fecha]
[Cerrar por ahora]
```

The notification may identify stagnation but cannot advance or close the stage automatically.

### 3.16 Commitment and promise reminders

Forge must detect commitments recorded in canonical interactions.

Examples:

```text
Le prometiste a Pablo enviarle la propuesta hoy.
Aún no hay envío confirmado.

[Abrir propuesta]
[Preparar envío]
[Reagendar compromiso]
```

```text
Quedaste de confirmar una cobertura con Susana antes de su cita.

[Resolver pendiente]
[Ver contexto]
```

### 3.17 Data-quality and reconciliation alerts

Examples:

```text
Hay dos registros que podrían corresponder a la misma persona.

[Revisar duplicado]
[No son la misma persona]
```

```text
Esta póliza no tiene contratante confirmado.
El dato es necesario antes de registrar una conversión.

[Completar]
[Marcar como desconocido]
```

These alerts should be restrained and grouped; they must not flood the advisor.

### 3.18 Forecast and production risk

Examples:

```text
Tu Forecast ponderado bajó por debajo de la meta mensual.
La causa principal es que dos solicitudes cambiaron a riesgo alto.

[Ver casos]
[Revisar Forecast]
```

```text
Tienes producción suficiente en proceso, pero 60% depende de un solo caso.

[Ver concentración]
[Crear plan alterno]
```

Recommendations are scenarios, not guarantees.

### 3.19 Compensation events

Examples:

```text
Hay una nueva comisión confirmada para agosto.

[Ver detalle]
```

```text
Una comisión esperada todavía aparece como no disponible.

[Revisar fuente]
[Recordar después]
```

Estimated, confirmed, payable and paid must remain separate.

### 3.20 System and synchronization health

Only notify when the issue affects the advisor's work.

Examples:

```text
No pudimos actualizar pagos desde la fuente conectada.
Los datos mostrados pueden estar desactualizados.

[Reintentar]
[Ver estado]
```

```text
Tus cambios de la última interacción están pendientes de sincronización.

[Reintentar]
[Conservar pendiente]
```

Avoid surfacing raw technical codes as the only explanation.

## 4. Notification channels

Advisor OS 1.0 should support a governed channel hierarchy:

1. In-app notification center
2. Home contextual cards
3. Device push notifications, only after explicit consent
4. Email summaries, only after explicit preference

The initial notification body outside the authenticated app must minimize personal and financial information.

Example lock-screen-safe text:

```text
Tienes una cita pendiente de confirmar.
```

Not:

```text
Juan Pérez no asistió a su cita para contratar un seguro de vida de $3,000,000.
```

## 5. Notification center UX

The notification center must support:

- New
- Requires response
- Snoozed
- Resolved
- Informational
- Grouped by person or operational thread
- Direct deep link into the authenticated context
- Clear source and trigger explanation
- `¿Por qué recibí esto?`
- Dismiss with reason when useful
- Undo for reversible local resolution actions

A notification should remain connected to its original fact and resolution receipt.

## 6. Priority and interruption policy

### Urgent

Use sparingly for:

- Appointment starting soon
- Confirmed payment risk with a near deadline
- Critical synchronization failure affecting imminent work
- Same-day commitment near breach

### Important

- Appointment outcome confirmation
- Overdue follow-up
- New lead response window
- Document or application blocker
- Renewal window

### Coaching

- Goal-gap recommendation
- Midday recovery
- End-of-day closure
- Forecast risk

### Informational

- Confirmed payment
- Confirmed commission
- Completed synchronization
- Goal reached

Rules:

```text
NO_NOTIFICATION_STORM=YES
DEDUPLICATION_REQUIRED=YES
QUIET_HOURS_REQUIRED=YES
SNOOZE_REQUIRED=YES
DAILY_DIGEST_OPTION=YES
MAX_REPEATS_BOUNDED=YES
USER_PREFERENCE_REQUIRED=YES
```

## 7. Context and explanation contract

Every notification must carry:

```text
notification_id
advisor_id
notification_family
priority
source_authority
source_event_ids
source_freshness
subject_identity_reference
triggered_at
eligible_after
expires_at
privacy_class
recommended_actions
resolution_state
```

Every recommendation must expose:

- Facts used
- Assumptions
- Unknowns
- Why now
- Expected value
- Whether action changes productive state

## 8. Conversation and resolution model

The conversational layer may collect structured facts through natural language.

Example:

```text
Forge: ¿La tuviste?
Advisor: Sí, le gustó pero quiere revisarlo con su esposa.
Forge: Entendí:
- Cita realizada
- Interés presente
- Decisión compartida con su esposa
- Seguimiento pendiente

¿Programamos seguimiento para el miércoles?

[Confirmar]
[Editar]
[No]
```

The extracted interpretation must be reviewable before persistence.

```text
NATURAL_LANGUAGE_IS_DRAFT=YES
STRUCTURED_INTERPRETATION_REVIEW_REQUIRED=YES
PERSISTENCE_AFTER_CONFIRMATION_ONLY=YES
```

## 9. Authority and safety boundaries

The notification system must reuse existing canonical authorities.

It may not become:

- A second Timeline
- A second task authority
- A second Pipeline authority
- A second payment authority
- A second Calendar authority
- A detached activity source of truth

Required boundaries:

```text
NOTIFICATION_IS_PROJECTION=YES
NOTIFICATION_IS_SOURCE_OF_TRUTH=NO
OPEN_DIALER_IS_CALL_CONFIRMATION=NO
OPEN_WHATSAPP_IS_SEND_CONFIRMATION=NO
OPEN_CALENDAR_IS_EVENT_CONFIRMATION=NO
EMAIL_RECEIPT_IS_POLICY_PAYMENT_CONFIRMATION=NO
AUTOMATIC_PIPELINE_MUTATION=NO
AUTOMATIC_MESSAGE_SEND=NO
AUTOMATIC_CALENDAR_CREATION=NO
AUTOMATIC_TASK_COMPLETION=NO
HUMAN_APPROVAL_REQUIRED=YES
```

## 10. Required implementation pass

Insert the following mandatory pass into the Advisor OS 1.0 closure sequence after the Next Action and Agenda loop and before the Pipeline-to-Quotes commercial loop.

```text
PASS_03=CONTEXTUAL_NOTIFICATION_AND_CONVERSATIONAL_RESOLUTION_SYSTEM
```

The previous passes after PASS 02 shift by one position.

Recommended sequence:

```text
PASS_00=SCOPE_LOCK_AND_CLOSURE_AUTHORITY
PASS_01=BULK_INTAKE_AND_BOOKS
PASS_02=NEXT_ACTION_AND_AGENDA_LOOP
PASS_03=CONTEXTUAL_NOTIFICATION_AND_CONVERSATIONAL_RESOLUTION_SYSTEM
PASS_04=PIPELINE_TO_QUOTES_COMMERCIAL_LOOP
PASS_05=PROSPECT_TO_CLIENT_AND_POLICY_CONVERSION
PASS_06=PRODUCTIVE_PORTFOLIO_SERVICE_LOOP
PASS_07=ACTIVITY_FORECAST_REPORTS_COMPENSATION_RECONCILIATION
PASS_08=UNIFIED_UX_CLOSURE
PASS_09=PROFILE_AND_ONBOARDING
PASS_10=END_TO_END_PUBLIC_ACCEPTANCE
PASS_11=ADVISOR_OS_1_0_RELEASE_CANDIDATE
```

## 11. PASS 03 deliverables

### Foundation

- Notification event eligibility contract
- Notification projection/read model
- Deduplication and suppression engine
- Priority and quiet-hours policy
- Consent and channel preferences
- Safe authenticated deep links
- Source freshness and expiry
- Resolution receipts

### Product surfaces

- In-app notification center
- Home notification summary
- Conversational response sheet
- `¿Por qué recibí esto?` disclosure
- Snooze and defer
- Grouped threads
- Mobile, tablet and desktop behavior

### Initial productive families

The 1.0 release must productize at least:

1. Appointment preparation
2. Appointment outcome confirmation
3. Follow-up due and overdue
4. Daily goal gap
5. Midday recovery
6. End-of-day closure
7. Payment match candidate
8. Payment risk
9. Renewal or anniversary
10. Proposal follow-up
11. Application/document blocker
12. New lead response window
13. Prospect stagnation
14. Commitment reminder
15. Forecast risk
16. Source/synchronization degradation

## 12. Exit criteria

```text
NOTIFICATION_PROJECTION=PASS
NOTIFICATION_SOURCE_TRACEABILITY=PASS
NOTIFICATION_DEDUPLICATION=PASS
QUIET_HOURS=PASS
CHANNEL_CONSENT=PASS
LOCK_SCREEN_PRIVACY=PASS
AUTHENTICATED_DEEP_LINK=PASS
APPOINTMENT_PREPARATION=PASS
APPOINTMENT_OUTCOME_CONFIRMATION=PASS
FOLLOW_UP_DUE=PASS
DAILY_GOAL_GAP=PASS
MIDDAY_RECOVERY=PASS
END_OF_DAY_CLOSURE=PASS
PAYMENT_MATCH_CANDIDATE=PASS
PAYMENT_CONFIRMATION_REVIEW=PASS
PAYMENT_RISK=PASS
RENEWAL_SIGNAL=PASS
PROPOSAL_FOLLOW_UP=PASS
APPLICATION_BLOCKER=PASS
NEW_LEAD_RESPONSE=PASS
PROSPECT_STAGNATION=PASS
COMMITMENT_REMINDER=PASS
FORECAST_RISK=PASS
SYNC_DEGRADATION=PASS
CONVERSATIONAL_DRAFT=PASS
STRUCTURED_REVIEW_BEFORE_PERSISTENCE=PASS
RESOLUTION_RECEIPT=PASS
AUTOMATIC_UNAPPROVED_MUTATIONS=0
NOTIFICATION_STORM=REJECTED
UNKNOWN_AS_ZERO=REJECTED
```

## 13. End-to-end acceptance scenarios

### Scenario N1 — Appointment occurred

```text
CONFIRMED_APPOINTMENT_ENDS
→ GRACE_PERIOD_ELAPSES
→ OUTCOME_NOTIFICATION
→ ADVISOR_CONFIRMS_ATTENDED
→ ADVISOR_DESCRIBES_RESULT
→ FORGE_PREPARES_STRUCTURED_OUTCOME
→ ADVISOR_REVIEWS_AND_CONFIRMS
→ TIMELINE_AND_NEXT_ACTION_UPDATE
```

### Scenario N2 — Appointment did not occur

```text
OUTCOME_NOTIFICATION
→ ADVISOR_SELECTS_NOT_HELD
→ REASON_CAPTURE
→ RESCHEDULE_OFFER
→ ADVISOR_REVIEWS_DATE_TIME
→ CALENDAR_HANDOFF
→ EXTERNAL_SAVE_NOT_ASSUMED
```

### Scenario N3 — Daily goal recovery

```text
CONFIRMED_ACTIVITY_BELOW_GOAL
→ RECOVERY_WINDOW_AVAILABLE
→ EXPLAINABLE_RECOMMENDATION
→ ADVISOR_OPENS_PLAN
→ REAL_PENDING_ACTION_SELECTED
→ COMPLETION_CONFIRMED
→ GOAL_PROGRESS_RECALCULATED
```

### Scenario N4 — Payment email candidate

```text
AUTHORITATIVE_EMAIL_OR_EVENT_RECEIVED
→ PAYMENT_DETAILS_PARSED
→ POLICY_MATCH_CANDIDATE
→ ADVISOR_REVIEWS
→ MATCH_CONFIRMED_OR_REJECTED
→ CANONICAL_PAYMENT_STATE_UPDATED_BY_AUTHORITY
→ OPTIONAL_THANK_YOU_DRAFT
```

### Scenario N5 — Privacy and logout

```text
PRIVATE_NOTIFICATION_OPEN
→ AUTHENTICATED_CONTEXT_VISIBLE
→ LOGOUT
→ PRIVATE_NOTIFICATION_CONTENT_SCRUBBED
→ DEEP_LINK_FAILS_CLOSED
→ LATE_RESULT_REJECTED
```

## 14. Release gate amendment

Advisor OS 1.0 may not be declared complete without:

```text
CONTEXTUAL_NOTIFICATIONS=PASS
CONVERSATIONAL_RESOLUTION=PASS
CHANNEL_CONSENT=PASS
NOTIFICATION_PRIVACY=PASS
NOTIFICATION_DEDUPLICATION=PASS
PAYMENT_SIGNAL_RECONCILIATION=PASS
APPOINTMENT_OUTCOME_LOOP=PASS
GOAL_COACHING_LOOP=PASS
HUMAN_APPROVAL_BOUNDARIES=PASS
```

## 15. Product statement

Forge notifications are not alarms that tell the advisor what the clock says.

They are contextual interventions that understand:

```text
WHAT_WAS_PROMISED
WHAT_WAS_SCHEDULED
WHAT_HAPPENED
WHAT_REMAINS_UNKNOWN
WHAT_IS_AT_RISK
WHAT_CAN_STILL_BE_DONE
WHAT_REQUIRES_CONFIRMATION
```

Forge should feel like a responsible commercial copilot that notices unfinished work, asks the right question at the right time and helps the advisor complete the next step without taking control away from them.

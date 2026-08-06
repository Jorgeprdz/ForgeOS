# SLIDER CAPTURE SEMANTICS REPORT

**Execution:** `FORGE_ACTIVITY_AURA_PRODUCTIVE_UI_IMPLEMENTATION_001`  
**Status:** `PASS_WITH_EXPLICIT_READ_ONLY_BOUNDARY`

The eight sliders are comparison controls only. They do not persist aggregate counts and never manufacture multiple canonical events. Productive capture is a separate explicit one-event interaction backed by FES-01.2 and real identifying references.

| Metric | Canonical owner | Canonical fact / source | Slider-only representable | Productive write | Evidence after manual capture | Duplicate handling |
|---|---|---|---|---|---|---|
| Referidos | EVENT_EVIDENCE_FES | `REFERRAL_RECEIVED` | No | One event with activity and referral references | HUMAN_CONFIRMED / CONFIRMED | canonical idempotency key + append-only correction |
| Llamadas | EVENT_EVIDENCE_FES | `CALL_COMPLETED` | No | One event with activity and contact references | HUMAN_CONFIRMED / CONFIRMED | canonical idempotency key + append-only correction |
| Citas agendadas | EVENT_EVIDENCE_FES | `APPOINTMENT_SCHEDULED` | No | One event with appointment reference, start and end | HUMAN_CONFIRMED / CONFIRMED | canonical idempotency key + append-only correction |
| Citas efectivas | EVENT_EVIDENCE_FES | `APPOINTMENT_HELD` + INITIAL purpose | No | One event with appointment reference and confirmed outcome timestamp | HUMAN_CONFIRMED / CONFIRMED | canonical idempotency key + append-only correction |
| Citas de cierre | EVENT_EVIDENCE_FES | `APPOINTMENT_HELD` + CLOSING purpose | No | One event with appointment reference and confirmed outcome timestamp | HUMAN_CONFIRMED / CONFIRMED | canonical idempotency key + append-only correction |
| Solicitudes ingresadas | POLICY_SALES_OPERATIONS | policy-domain source | No | Read-only in Activity | Preserved from owner | owner reconciliation only |
| Pólizas pagadas | POLICY_INTELLIGENCE_POLICY_OPERATIONS | policy-domain source | No | Read-only in Activity | Preserved from owner | owner reconciliation only |
| Referidos de asesor | EVENT_EVIDENCE_FES | `ADVISOR_REFERRAL_RECEIVED` | No | One event with activity and referred-advisor references | HUMAN_CONFIRMED / CONFIRMED | canonical idempotency key + append-only correction |

`FAKE_REFERENCES=ZERO`  
`AGGREGATE_EVENT_SYNTHESIS=FORBIDDEN`  
`APPLICATION_AND_POLICY_MUTATION=FORBIDDEN`

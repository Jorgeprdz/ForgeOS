# Advisor OS 1.0 — Known Limitations

```text
VERSION=1.0.0
STATUS=RELEASE_LOCKED
SEVERITY_CRITICAL=0
SEVERITY_HIGH=0
```

These are explicit product boundaries, not hidden failures.

## Productive adapters that fail closed

1. Bulk XLSX binary decoding requires a safe workbook decoder adapter. The domain accepts primitive workbook rows and never executes macros or formulas.
2. Books persistence, CommercialPerson import and Pipeline activation require their productive repository/authority adapters.
3. `MARK_WAITING` and `CLOSE_CASE` require the canonical commercial-case authority. They do not create a parallel status store.
4. Advisor preference persistence requires the productive preference authority introduced by Sprint 11.

When any adapter is absent, Forge returns an unavailable or review-required state. It does not simulate persistence.

## External handoffs

- Opening Google Calendar is not proof that an event was saved.
- Opening WhatsApp, the dialer or email is not proof that a message or call occurred.
- Bidirectional Calendar synchronization is not part of 1.0.

## Data truth

```text
UNKNOWN≠ZERO
FORECAST≠FACT
EARNED≠PAID
```

- Unknown amounts, goals, compensation, payments and source states remain `null`/unknown; they are never converted to zero.
- Forecast values remain estimates and probabilities, not facts.
- Compensation `EARNED` and `PAID` remain separate.
- Future Radar and contextual signals are advisory and do not mutate business state.

## Demo experience

The public demo is supported only when it is explicitly labeled as synthetic data and external side effects are blocked. Demo data may never appear as productive data.

## Release posture

```text
AUTONOMOUS_OUTBOUND=NO
AUTONOMOUS_PIPELINE_ADVANCEMENT=NO
AUTOMATIC_POLICY_CREATION=NO
AUTOMATIC_ACCOUNT_CREATION=NO
DIRECT_UI_DATABASE_WRITES=NO
```

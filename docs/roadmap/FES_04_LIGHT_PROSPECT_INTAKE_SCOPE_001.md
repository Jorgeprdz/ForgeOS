# FES 04 Light Prospect Intake Scope 001

## Status

```text
PHASE=FES_04_LIGHT_PROSPECT_INTAKE
STATUS=CLOSED
PRODUCTIVE_UI_BINDING=DEFERRED_TO_FES_08
SUPABASE_REMOTE_MUTATION=NO
MAIN_MUTATION=NO
```

## Locked capture

Required:

- full name;
- phone or WhatsApp;
- source category;
- initial context by voice or text.

Conditional for `REFERRAL`:

- referred by;
- relationship to referrer.

Optional and collapsed:

- email;
- date of birth;
- occupation.

Removed from light intake:

- age;
- marital status;
- dependents;
- estimated income;
- product interests;
- due-action type or date;
- next-action type or date.

## Candidate rule

System-extracted candidates remain `PENDING_CONFIRMATION`. Confidence never
promotes profile truth. Only an explicit human `ACCEPTED` decision may promote
an allowlisted candidate. Conflicts fail closed.

## Event zero

One accepted intake prepares an atomic four-event bundle:

```text
TIMELINE_INITIALIZED
→ PROSPECT_PROFILE_CREATED
→ PROSPECT_CREATED
→ INITIAL_CONTEXT_CAPTURED
```

Canonical events contain references only. Raw name, contact, optional profile
data and initial-context content remain outside event payloads.

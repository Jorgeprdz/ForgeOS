# FORGE CARTERA — MATERIAL 3 PRODUCTIVE UI MOUNT 001

## Purpose

Expose the accepted Cartera product inside the public Forge Alive Material 3 shell. Before this pass, `cartera.js` and the 030D–100D product enhancers existed on `main`, but the Material 3 navigation contract recognized only Inicio, Pipeline, Actividad and Cotizaciones. Therefore `?nav=cartera` truthfully fell back to Inicio.

## Delivery

### A — Canonical navigation

- Add one available `Cartera` destination to the canonical nav pill.
- Resolve `?nav=cartera` as the `cartera` route instead of falling back.
- Preserve the floating navigation model.
- Reserve enough mobile bottom clearance for the five-destination, two-row pill.

### B — Productive route adapter

- Create one Material 3 route module in the canonical shell.
- Reuse `renderCartera()` and `bindCarteraEvents()` from the accepted root route.
- Reuse the authenticated Supabase client already owned by `ForgeProductiveProspectBootstrap067G17B`.
- Initialize the existing `SupabaseRuntime` singleton with that same client; do not create a competing browser client.

### C — Accepted Cartera product composition

Bind in accepted order before the canonical directory emits mounted events:

1. 030D Policy Payment Calendar
2. 040D Relationship Memory
3. 050D Future Radar
4. 060D Relationship Growth
5. 070D Relational Activation
6. 080D Economic Connection
7. 090D Relationship Capital
8. 100D Productivity Proof
9. Canonical Cartera directory events

This pass does not rebuild these products and does not change their authority.

### D — Session and responsive acceptance

- Anonymous users see an honest authentication gate.
- Product data is removed on logout and route unmount.
- Late asynchronous results are rejected through a generation token.
- Cartera cleanup is captured locally instead of invoking global `Memory.cleanup()`.
- Mobile, tablet and desktop layouts keep one route surface spanning the shell grid.
- Mobile content can scroll above the intentionally floating nav pill.

## Product boundary

```text
CANONICAL_CARTERA_DIRECTORY=REUSED
CARTERA_030D_TO_100D=REUSED
NEW_CARTERA_TRUTH_STORE=NO
NEW_SUPABASE_CLIENT=NO
DIRECT_DATABASE_WRITE=NO
POLICY_CREATION=NO
PERSON_CREATION=NO
PERSON_MERGE=NO
AUTOMATIC_CONTACT=NO
AUTOMATIC_MESSAGE=NO
AUTOMATIC_TASK=NO
AUTOMATIC_CALENDAR=NO
AUTOMATIC_OPPORTUNITY=NO
QUOTE_MUTATION=NO
CRM_MUTATION=NO
```

## Public route

```text
ROUTE_ID=cartera
PUBLIC_QUERY=?nav=cartera
EXPECTED_SURFACE=AUTHENTICATED_PRODUCTIVE_CARTERA
UNKNOWN_ROUTE_FALLBACK=UNCHANGED
```

## Deployment boundary

This implementation branch and its PR do not mutate `main` or deploy Pages. Production visibility requires a separately authorized controlled merge followed by Pages acceptance.

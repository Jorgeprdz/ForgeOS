# Advisor OS 1.0 — Sprint 09 Portfolio Service

```text
DOCUMENT=ADVISOR_OS_SPRINT_09_PORTFOLIO_SERVICE_001
STATUS=ONE_PASS_CANDIDATE
BASE_MAIN_SHA=88dcef0941f8de20e394de75967a0f8eef183ed3
SPRINT=09_PORTFOLIO_SERVICE
```

## Objective

Close Portfolio as a conservation and future-opportunity operating loop without creating another Person, Policy, Timeline, service ledger or business authority.

```text
COMMERCIAL_PERSON
→ CLIENT_360
→ POLICY_DETAIL
→ PAYMENT_AND_DATE_CONTEXT
→ FUTURE_RADAR
→ SERVICE_SIGNAL
→ PREVIEW
→ HUMAN_CONFIRMATION
→ NEXT_ACTION_RECEIPT
```

## Existing authorities preserved

```text
CLIENT_360=CRS_09_PERSON_WORKSPACE
POLICY_DETAIL=CARTERA_010C_CANONICAL_PORTFOLIO
PAYMENTS_AND_DATES=CARTERA_030D_PAYMENT_CALENDAR
FUTURE_RADAR=CARTERA_050_FUTURE_RADAR
SERVICE_HISTORY=CRS_08_UNIFIED_TIMELINE
SERVICE_ACTION=NFAST_09_DUE_ACTION_RUNTIME
COMPLEMENTARY_QUOTE=QUOTE_LIFECYCLE_AUTHORITY_VIA_SPRINT_07
```

Sprint 09 only composes those authorities. It does not move their data or ownership.

## Client 360

The Client 360 contract requires one confirmed CommercialPerson from CRS-09 and adds source-state visibility for:

- canonical portfolio;
- payment calendar;
- future radar;
- unified Timeline.

Optional-source degradation produces `PARTIAL`, never fabricated values.

```text
SOURCE_AVAILABLE=AVAILABLE
SOURCE_EMPTY=EMPTY
SOURCE_DISCONNECTED=UNAVAILABLE
UNKNOWN_AMOUNT=null
UNKNOWN_CURRENCY=null
UNKNOWN_AS_ZERO=NO
```

## Policy service detail

Policy Detail is loaded only through Cartera 010C and must contain a verifiable Person↔Policy relationship.

```text
POLICY_PERSON_LINK_UNVERIFIED=BLOCKED
POLICY_PERSON_MISMATCH=BLOCKED
CROSS_PERSON_POLICY_VISIBILITY=BLOCKED
```

The composed service detail includes:

- canonical Policy detail;
- Policy-scoped payment dates;
- renewal and anniversary context;
- Policy-related Timeline entries;
- explicit service signals;
- honest source availability.

## Service signals

Supported contextual signals:

```text
PAYMENT_OVERDUE
PAYMENT_DUE
RENEWAL_REVIEW
POLICY_ANNIVERSARY
CLIENT_WITHOUT_RECENT_CONTACT
```

Signals preserve their upstream authority and explain why they exist. They are not scores, final priority truth or autonomous instructions.

```text
OPAQUE_SCORE=NO
FINAL_PRIORITY_TRUTH=NO
AUTOMATIC_ACTION=NO
AUTOMATIC_CONTACT=NO
```

## Service actions

Allowed action previews:

```text
ANNUAL_REVIEW
RENEWAL_REVIEW
PAYMENT_FOLLOW_UP
CLIENT_CONTACT
DOCUMENT_REVIEW
```

Every action uses:

```text
PREVIEW_REQUIRED
→ HUMAN_CONFIRMATION_REQUIRED
→ NFAST_09_DUE_ACTION_RUNTIME
→ MUTATION_RECEIPT_REQUIRED
```

Sprint 09 does not record a service event or mutate Policy Truth directly.

## Complementary quote entry

The runtime prepares a context-preserving handoff into Cotizaciones with:

- CommercialPerson reference;
- source Policy reference;
- complementary product reference;
- correlation reference;
- `mode=complementary`;
- Quote preview still required.

```text
COMPLEMENTARY_QUOTE_AUTO_EXECUTION=BLOCKED
QUOTE_WRITE_FROM_PORTFOLIO_SERVICE=0
QUOTE_AUTHORITY=QUOTE_LIFECYCLE_AUTHORITY
```

## Hard boundaries

```text
SECOND_PERSON_STORE=0
SECOND_POLICY_STORE=0
SECOND_TIMELINE=0
SECOND_SERVICE_LEDGER=0
DIRECT_DATABASE_WRITE=0
DIRECT_RPC=0
AUTOMATIC_POLICY_MUTATION=0
AUTOMATIC_CONTACT=0
AUTOMATIC_MESSAGE=0
AUTOMATIC_QUOTE_EXECUTION=0
UNKNOWN_AS_ZERO=0
```

## Acceptance target

```text
CLIENT_360=PASS_REQUIRED
POLICY_DETAIL=PASS_REQUIRED
FUTURE_RADAR=PASS_REQUIRED
SERVICE_ACTIONS=PASS_REQUIRED
COMPLEMENTARY_QUOTE_ENTRY=PASS_REQUIRED
UNKNOWN_AS_ZERO=REJECTED
CROSS_PERSON_POLICY=REJECTED
OPTIONAL_SOURCE_DEGRADATION=PARTIAL
```

```text
SPRINT_09_ACCEPTANCE=PENDING_CI
MERGE_AUTHORIZATION=ONE_PASS_OWNER_COMMAND
```

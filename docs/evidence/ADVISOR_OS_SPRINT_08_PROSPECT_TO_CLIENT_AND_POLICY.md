# Advisor OS 1.0 — Sprint 08 Prospect to Client and Policy

```text
SPRINT=08_PROSPECT_TO_CLIENT_AND_POLICY
EXECUTION_MODE=ONE_PASS
STATUS=IMPLEMENTED_PENDING_CI
```

## Objective

Close the governed conversion from a confirmed commercial sale into verified Portfolio visibility without duplicating identity, Account, Application or Policy authority.

```text
CONFIRMED_SALE
→ COMMERCIAL_PERSON_RECONCILIATION
→ PROSPECT_AND_APPLICATION_LINEAGE
→ EXISTING_ACCOUNT_LINK_REVIEW
→ CRS_07_APPLICATION_POLICY_LINEAGE
→ PORTFOLIO_VISIBILITY_VERIFICATION
→ PIPELINE_CLOSED_WON
→ UNIFIED_TIMELINE_CONTINUITY
```

## Preserved authorities

```text
PERSON_AUTHORITY=CARTERA_010B_COMMERCIAL_PERSON
ACCOUNT_RECONCILIATION=CARTERA_020C
APPLICATION_AUTHORITY=CRS_06
APPLICATION_POLICY_LINEAGE=CRS_07
POLICY_AUTHORITY=CARTERA_POLICY_AUTHORITY
PORTFOLIO_READ_AUTHORITY=CARTERA_010C
PIPELINE_CLOSURE=CANONICAL_PIPELINE_AUTHORITY
TIMELINE=CRS_08_COMPOSED_READ_MODEL
```

## Client semantics

Advisor OS does not create a second Client entity. Client status is a product projection of the canonical CommercialPerson with a confirmed PolicyRole and verified Policy visibility.

```text
CLIENT_ROW_CREATED=NO
SECOND_PERSON_STORE=NO
CLIENT_PROJECTION=COMMERCIAL_PERSON_WITH_CONFIRMED_POLICY_ROLE
```

## Account boundary

Sprint 08 may reconcile or confirm a link to an existing Account through the CARTERA 020C authority. It may not create an Account or silently choose an ambiguous candidate.

```text
ACCOUNT_CREATION=FORBIDDEN
ACCOUNT_DIRECT_MUTATION=FORBIDDEN
ACCOUNT_REVIEW_REQUIRED_WHEN_AMBIGUOUS=YES
HUMAN_CONFIRMATION_REQUIRED=YES
```

## Policy boundary

An accepted Quote or approved Application is not a Policy. Policy confirmation remains delegated to CRS 07 and the canonical Cartera Policy authority, with issuance evidence and a confirmed permitted PolicyRole.

```text
ACCEPTED_QUOTE_IS_POLICY=NO
APPROVED_APPLICATION_IS_POLICY=NO
AUTOMATIC_POLICY_CREATION=NO
ISSUANCE_EVIDENCE_REQUIRED=YES
POLICY_ROLE_CONFIRMATION_REQUIRED=YES
DUPLICATE_POLICY_CREATION=BLOCKED_BY_LINEAGE_READ_FIRST
```

## Pipeline closure order

```text
POLICY_LINEAGE_VERIFIED
→ POLICY_VISIBLE_IN_PORTFOLIO
→ PIPELINE_CLOSED_WON
```

Pipeline remains open when Policy confirmation, Account reconciliation or Portfolio visibility is incomplete.

## Mutation boundaries

The Sprint 08 runtime is an orchestrator over registered authorities. It contains no direct database, Supabase, IndexedDB, localStorage or sessionStorage mutation.

```text
DIRECT_DATABASE_WRITE=0
DIRECT_RPC=0
AUTOMATIC_PIPELINE_CLOSE=0
AUTOMATIC_ACCOUNT_CREATE=0
AUTOMATIC_POLICY_CREATE=0
UNKNOWN_AS_ZERO=0
```

## Required acceptance

```text
PROSPECT_TO_CLIENT=PASS
PERSON_RECONCILIATION=PASS
ACCOUNT_RECONCILIATION=PASS
POLICY_DUPLICATE_PROTECTION=PASS
PORTFOLIO_VISIBILITY=PASS
PIPELINE_CLOSURE_ORDER=PASS
TIMELINE_CONTINUITY=PASS
CRS_06_REGRESSION=PASS
CRS_07_REGRESSION=PASS
SESSION_AND_GLOBAL_REGRESSION=PASS
```

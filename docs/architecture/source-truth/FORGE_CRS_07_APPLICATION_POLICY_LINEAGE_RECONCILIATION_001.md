# Forge CRS 07 — Application-to-Policy Lineage Reconciliation 001

## Authority decision

```text
APPLICATION_AUTHORITY=CRS_06_APPLICATION_AUTHORITY
POLICY_AUTHORITY=CARTERA_POLICY_AUTHORITY
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
PERSON_AUTHORITY=CARTERA_010B_COMMERCIAL_PERSON
DOMAIN_LINK_CONTRACT=CRS_02
SECOND_POLICY_STORE=FORBIDDEN
SECOND_LINEAGE_LEDGER=FORBIDDEN
```

Application owns request, versions, signers, signature evidence, submission, requirements and decision. Cartera owns canonical Policy, PolicyVersion, PolicyEvidenceVersion and PolicyRole. CRS 07 proves the lineage between these authorities without transferring ownership or copying truth.

## Governed issuance path

```text
APPROVED_APPLICATION
+ SAME_ADVISOR
+ SAME_COMMERCIAL_PERSON
+ SAME_QUOTE
+ SAME_PRODUCT
+ CONFIRMED_ISSUANCE_EVIDENCE
+ CONFIRMED_PERMITTED_POLICY_ROLE
→ EXISTING_CARTERA_CONFIRMED_POLICY_COMMAND
→ POLICY_VERSION_WITH_VERIFIED_APPLICATION_LINEAGE
```

Permitted Application-person Policy roles: `POLICY_OWNER`, `INSURED`, `ADDITIONAL_INSURED`, and `PAYOR`. Beneficiary, advisor and account-only roles cannot by themselves prove that the Policy belongs to the Application person.

## Evidence gate

Application approval is necessary but insufficient. Policy creation requires confirmed issuance evidence from an explicit source authority. Accepted sources are `CARTERA020B_POLICY_PACKET`, `POLICY_CONTRACT`, `POLICY_SCHEDULE`, `POLICY_ADMIN_RECORD`, `ISSUANCE_CONFIRMATION`, and `CARRIER_ISSUANCE_RECEIPT`.

The evidence provenance must state `issuanceConfirmed=true`, the exact Application reference and a nonempty source authority. OCR, Quote, signature state and Application approval do not independently prove issuance.

## Persistence

No new entity table is created. Existing `policy_versions.application_reference` and `quote_reference` become governed lineage rather than unchecked text.

```text
ONE_PERSON_MANY_POLICIES=SUPPORTED
ONE_APPLICATION_MANY_POLICIES=FORBIDDEN
POLICY_VERSION_LINEAGE=IMMUTABLE
FIRST_POLICY_VERSION_STATUS=ISSUED_OR_ACTIVE
DIRECT_BASE_POLICY_RPC_WITH_APPLICATION_LINEAGE=BLOCKED
```

Application-linked Policies must use `forge_crs07_confirm_issued_policy_from_application(jsonb)`. It validates CRS 07 and delegates persistence to `forge_cartera010b_confirm_policy_with_parties`; it does not replace Policy authority.

## Read model

The service composes Application, CommercialPerson, latest PolicyVersion, canonical Policy, PolicyEvidenceVersion, a permitted confirmed PolicyRole and the CRS 02 Cartera Policy domain link. Missing Policy, non-approved Application or missing person role returns explicit unresolved lineage and never synthesizes a Policy.

## Boundaries

```text
AUTOMATIC_POLICY_CREATION=NO
AUTOMATIC_POLICY_UPDATE=NO
APPLICATION_AS_POLICY_AUTHORITY=NO
QUOTE_AS_POLICY_AUTHORITY=NO
SIGNATURE_EVIDENCE_AS_ISSUANCE_EVIDENCE=NO
APPLICATION_MUTATION=NO
QUOTE_MUTATION=NO
PIPELINE_STAGE_MUTATION=NO
PAYMENT_MUTATION=NO
SERVICE_MUTATION=NO
PROVIDER_MUTATION=NO
PRODUCT_UI_MUTATION=NO
PAGES_DEPLOYMENT=NO
AUTOMATIC_BUSINESS_ACTION=NO
```

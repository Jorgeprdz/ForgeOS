# Forge Advisor Activation Authority and Evidence Policy Decision 067G3B

Module: `067G3B_ADVISOR_ACTIVATION_AUTHORITY_AND_EVIDENCE_POLICY_RATIFICATION`

Parent: `067G3_CANDIDATE_ADVISOR_IDENTITY_RATIFICATION`

Dependency: `067G3A_ADVISOR_CONVERSION_CONTRACT_HARDENING`

Status: `IMPLEMENTED_AND_CLOSED_FOR_POLICY_AND_CONTRACTS_ONLY`

Date: 2026-07-16

## Constitutional gate

- Board and Miranda approval cover bounded policy and contract implementation only.
- ROBOCOP LOCK 001 is resolved only for 067G3B.
- Advisor Lifecycle Governance owns activation policy; Advisor Lifecycle Activation Authority owns the materialized activation fact.
- Manager OS, Advisor OS, AI, dashboards, browser state and fixtures have no activation write authority.
- No runtime writer, Advisor repository, access grant, Sales Pipeline or Project 200 handoff was implemented.

## Discovery and compatibility

`advisor-lifecycle/advisor-lifecycle-evidence.js`, `advisor-lifecycle/advisor-lifecycle-status.js` and `advisor-lifecycle/advisor-stage-gate.js` are pure legacy classifiers consumed by lifecycle, career-clock and compensation gates. They have no canonical writer. Their labels are not activation truth.

Strategy: `VERSIONED_V2_ACTIVATION_FAMILY`.

- Existing helpers remain unchanged and compatible.
- New governed consumers must use `schemas/advisor-activation-contract-family-v2.schema.json`.
- The V2 family is closed, versioned and does not silently promote fixtures or classifier output to authority.
- The 067G3A conversion receipt is consumed as a prerequisite; conversion truth is not recreated.

## Ratified contract family

The V2 family defines eleven distinct contracts: activation policy, evidence provider, evidence, pure evaluation, human review decision, immutable activation receipt, suspension receipt, deactivation receipt, reactivation receipt, append-only lifecycle correction and constrained lifecycle event.

All sensitive payloads use `additionalProperties: false`. Actor, authority, policy, evidence, lineage, effective-time and integrity fields are explicit.

## Authority and activation predicate

```text
ADVISOR_ACTIVE =
  official Advisor identity exists
  AND approved conversion is completed
  AND the effective-dated policy passes
  AND trusted current official evidence is valid
  AND activationEffectiveAt has an authoritative source and timezone
  AND no effective suspension or deactivation exists
```

Identity existence, conversion completion, activation, Advisor OS access, Sales Pipeline eligibility and Project 200 handoff eligibility are separate truths. Contract signature, Manager confirmation, Precontract completion, UI state, fixture state or AI inference alone is insufficient.

## Evidence and provider policy

Official-confirmed evidence types are `CARRIER_API_CONFIRMED`, `OFFICIAL_CARRIER_ROSTER`, `ADVISOR_CODE_ACTIVATION`, `OFFICIAL_OFFICE_LIFECYCLE_RECORD` and `AUTHORIZED_CONTRACTING_SYSTEM_RECEIPT` when the active policy trusts the provider.

Supporting evidence includes `CONTRACT_SIGNED`, `PRECONTRACT_COMPLETED`, `OFFICE_DOCUMENT_VALIDATED`, `MANAGER_READINESS_CONFIRMED` and `TRAINING_COMPLETED`; it cannot create activation truth alone.

Non-authoritative evidence includes Manager free text, candidate self-report, UI/localStorage flags, fixtures, demo data, AI inference and dashboard status. Fixture, browser and AI providers are contractually untrusted for official evidence.

Provider trust, permitted evidence types, verification method, effective period and revocation are policy governed. Expired, revoked, mismatched or unverified evidence fails closed.

## Evaluation, review and automation

Evaluation is pure and cannot materialize activation. `ELIGIBLE` does not equal `ACTIVE`. Ambiguity, manual evidence, identity uncertainty, date conflict, correction and policy-required separation of duties require an authorized human decision. AI cannot review or approve.

Deterministic institutional evidence processing is representable only when conversion is already human-approved, the provider is trusted, evidence matches and is current, conflicts are absent and policy explicitly permits it. No such materialization runtime is implemented here.

## Effective time and conflicts

`activationEffectiveAt` is the instant activation became effective according to official evidence or an authorized decision. It cannot default to request, review, ingestion, conversion-completion or current-system time. Timezone is mandatory; backdating requires official evidence; correction supersedes rather than rewrites.

Provider/date/status conflicts fail closed and create manual review. Latest event does not silently win, and unverified evidence cannot override official evidence. Evidence or provider revocation triggers reevaluation.

## Idempotency and lifecycle periods

Logical activation intent is:

```text
advisorId + conversionReceiptId + activationPolicyId + proposedActivationEffectiveAt
```

The same completed intent returns its existing receipt; a reused key with changed payload is rejected; a changed effective date enters correction review; duplicate active periods are forbidden. Persistence and transaction mechanics remain future work.

Activation receipts are immutable. Suspension is temporary and preserves identity/history. Deactivation closes access eligibility without deleting identity, conversion, prospects or commercial history. Reactivation reuses `advisorId`, requires current evidence and creates a new effective period. Corrections are authorized and append-only.

## Privacy and downstream boundaries

Allowed activation data is limited to identity/conversion references, policy/provider/evidence references, authority/reviewer metadata, effective timestamps, audit metadata and capability consequences.

Project 200 contacts, NASAT, prospects, clients, quotes, policies, private Manager notes, interview opinions, psychological labels, compensation negotiations, NASH memory and Sales Pipeline content are rejected.

An activation receipt does not grant Advisor OS access, create a Sales Pipeline or import Project 200. Those require separately owned policies and repositories.

## Tests and acceptance

Contract tests validate all eleven contracts plus activation separation, provider trust/revocation/freshness, effective-time semantics, human review, conflict fail-closed behavior, idempotency, lifecycle-period preservation, privacy and downstream boundaries. Existing conversion and lifecycle consumers remain green.

## Remaining blockers and recommendation

No canonical activation writer or Advisor Lifecycle repository exists. Actor membership remains supplied by an approved policy snapshot rather than hardcoded job titles.

Bounded recommendation only: `067G3C_ADVISOR_LIFECYCLE_REPOSITORY_AND_RECEIPT_SCOPE`. It requires separate Board authorization and must scope persistence, concurrency, outbox/reconciliation and read authority before any writer is implemented.

# FORGE ROBOCOP DIRECTIVES

## Directive ID

ROBOCOP LOCK 001

## Status

LOCKED

## Purpose

ROBOCOP LOCK 001 defines the mandatory governance gate for all future Forge work.

No future discovery, planning, implementation, repair, refactor, migration, test expansion, documentation update, runtime change, UI change, schema change, route change, rule change, engine change or business logic change may begin unless the work first declares its constitutional authority, applicable ADRs, discovery status, implementation readiness and Miranda approval.

Forge work must pass governance before execution.

## Non-Scope

This lock does not modify:

- engines
- UI
- schemas
- commercial rules
- routes
- business logic
- runtime behavior
- tests
- fixtures
- data models

## Prime Directive

Every future Forge task starts with a Constitutional Gate.

If the Constitutional Gate is missing, the task is blocked.

If the Constitutional Gate is incomplete, the task is blocked.

If Miranda approval is absent, the task is blocked.

If Board approval is required and absent, the task is blocked.

## Mandatory Constitutional Gate

Before any work starts, the operator or agent must declare:

1. Applicable Constitution
2. Applicable ADRs
3. Build Tree area
4. Discovery status
5. Implementation readiness
6. Miranda approval
7. Board approval status
8. Scope boundary
9. Prohibited surfaces
10. Validation expectation

## Required Declaration Template

Every future task must begin with this declaration:

```text
CONSTITUTIONAL GATE

Applicable Constitution:
- [file / section / principle]

Applicable ADRs:
- [ADR ids and names]

Build Tree Area:
- [area / status / owner if known]

Discovery Status:
- [not started / discovery open / discovery in progress / discovery locked / architecture approved / implementation readiness required / implementation ready with conditions / implementation ready / implemented / closed / blocked]

Implementation Readiness:
- [not ready / readiness required / ready with conditions / ready]

Miranda Approval:
- [approved / not approved / requires review]

Board Approval:
- [not required / required pending / approved]

Scope Boundary:
- [exact allowed files or domains]

Prohibited Surfaces:
- [engines / UI / schemas / rules / routes / business logic / app.js / other]

Validation Expectation:
- [read-only / docs-only / tests required / runtime audit required / no validation required with reason]
```

## Decision Rule

Work may proceed only when all of the following are true:

- the applicable Constitution is named
- applicable ADRs are named or explicitly declared not applicable with reason
- the Build Tree area is named
- discovery status is declared
- implementation readiness is declared
- Miranda approval is approved or explicitly requested before execution
- Board approval status is declared
- scope boundary is explicit
- prohibited surfaces are explicit
- validation expectation is explicit

## Miranda Approval Standard

Miranda approval means the work has answered:

> Does this make Forge better?

Approval requires:

- disciplined scope
- clear priority
- product quality preservation
- no hidden expansion of authority
- no invented truth
- no bypass of constitutional or ADR boundaries

Miranda approval is not aesthetic approval.

Miranda approval is quality-control permission to proceed.

## Board Approval Standard

Board approval is required when work affects:

- constitutional authority
- canonical ADR meaning
- Build Tree status
- domain ownership
- metric ownership
- source ownership
- user-facing behavior
- financial, product, policy, compensation or forecast truth
- runtime architecture boundaries
- protected root governance assets

Board approval may be declared not required only when the work is clearly within an already approved scope and does not change authority, behavior or ownership.

## Enforcement

An agent must stop before execution when the Constitutional Gate is missing or incomplete.

An agent may perform read-only inventory to identify the applicable Constitution, ADRs, Build Tree area, discovery status and readiness state.

An agent must not use read-only inventory as permission to implement.

Implementation begins only after the gate is complete and approval requirements are satisfied.

## Blocked Work Language

If a task lacks the required gate, the correct response is:

```text
BLOCKED BY ROBOCOP LOCK 001.

Missing gate fields:
- [field]

Required before work can start:
- Applicable Constitution
- Applicable ADRs
- Build Tree area
- Discovery status
- Implementation readiness
- Miranda approval
- Board approval status
- Scope boundary
- Prohibited surfaces
- Validation expectation
```

## Relationship To Existing Governance

ROBOCOP LOCK 001 does not replace the Constitution, ADRs, Build Tree or Discovery documents.

It forces every future task to route through them before work starts.

ROBOCOP ADDENDUM 001 - Forge Thinks, AI Interprets is part of this lock.

Canonical addendum:

- `docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md`

Canonical authority remains:

- Constitution
- ADRs
- Build Tree
- Discovery Status
- Implementation Readiness
- Miranda approval
- Board approval when required

## Final Lock

No declaration.

No approval.

No work.

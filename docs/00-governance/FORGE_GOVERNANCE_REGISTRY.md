# FORGE GOVERNANCE REGISTRY

## Status

LOCKED

## Purpose

This registry identifies the governance sources that must be checked before future Forge work begins.

It exists to support ROBOCOP LOCK 001.

It does not replace any source of authority.

## Governance Stack

Forge work is governed in this order:

1. Constitution
2. Canonical ADRs
3. Build Tree
4. Discovery Status
5. Implementation Readiness
6. Miranda Approval
7. Board Approval when required

## Canonical Sources

| Governance Layer | Canonical Source | Role |
| --- | --- | --- |
| Agent operating contract | `AGENTS.md` | Defines Codex workflow, protected surfaces and operational rules. |
| Root Constitution anchor | `FORGE_CONSTITUTION_V3.md` | Root-level constitutional authority anchor. |
| Constitution map | `docs/01-constitution/FORGE_CONSTITUTION_MAP.md` | Maps constitutional layers and ADR authority flow. |
| Architectural Constitution | `docs/01-constitution/FORGE_ARCHITECTURAL_CONSTITUTION_v3.md` | Locked architectural constitutional concepts. |
| Canonical ADRs | `adr/` | Canonical ADR authority set. |
| ADR working material | `docs/02-adr-candidates/` | Working, transition and PAQ-stage ADR material. |
| Build Tree | `FORGE_MASTER_BUILD_TREE.md` | Canonical project area and status map. |
| Discovery documents | `docs/03-discovery/`, `docs/03-discovery/`, `docs/03-discoveries/` | Discovery status, open questions, accepted/rejected discoveries and readiness inputs. |
| Implementation readiness | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_*` | Readiness contracts and implementation conditions. |
| Repository governance | `docs/06-repository-governance/` | Repository surface, migration and protected asset governance. |
| Runtime governance | `docs/07-runtime/` | Runtime boundary, migration and boot-readiness governance. |
| ROBOCOP directives | `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md` | Mandatory pre-work gate. |

## Canonical Docs Namespaces

These namespaces are approved canonical documentation surfaces.

| Namespace | Status | Governance Policy | Role |
| --- | --- | --- | --- |
| `docs/02-build-tree/` | KEEP | Constitution map entry required | Build tree and implementation map material. |
| `docs/04-manager-os/` | KEEP | Governance registry entry required | Manager OS domain documentation. |
| `docs/04-product-intelligence/` | KEEP | Governance registry entry required | Product Intelligence domain documentation. |
| `docs/05-foundation/` | KEEP | Constitution map entry required | Foundation architecture documentation. |
| `docs/05-phase-transitions/` | KEEP | Constitution map entry required | Phase transition documentation. |
| `docs/05-shared-commercial-model/` | KEEP | Governance registry entry required | Shared Commercial Model domain architecture. |
| `docs/05-readiness/` | KEEP | Governance registry entry required | Readiness and governance planning documentation. |
| `docs/05-truth/` | KEEP | Constitution map entry required | Truth, source and evidence governance documentation. |

## Deprecated Docs Source Paths

These source paths have been canonicalized and must not receive tracked files or active references.

| Deprecated Source Path | Canonical Replacement |
| --- | --- |
| `docs/architecture/constitution/` | `docs/01-constitution/` |
| `docs/architecture/discovery/` | `docs/03-discovery/` |
| `docs/architecture/repository/` | `docs/06-repository-governance/` |
| `docs/architecture/runtime/` | `docs/07-runtime/` |
| `docs/archive/` | `docs/99-archive/` |
| `docs/adr/` | `docs/02-adr-candidates/` |
| `docs/05-legacy/` | `docs/99-archive/05-legacy/` |

## Docs Anti-Contamination Rule

New or moved documentation must pass all repository documentation gates before commit:

- canonical destination check
- governance registry check
- constitution map check when the document carries constitutional, source-truth, readiness, build-tree or operational-foundation authority
- no orphan docs namespace
- no active deprecated path references
- no new top-level docs namespace without explicit approval
- repository migration harness check
- generated report noise restored or cleaned before staging

## Required Work Intake Record

Every future work item must include:

| Field | Required | Allowed Result |
| --- | --- | --- |
| Applicable Constitution | Yes | File and principle named. |
| Applicable ADRs | Yes | ADR ids named, or not applicable with reason. |
| Build Tree Area | Yes | Area and current status named. |
| Discovery Status | Yes | Status declared from source evidence. |
| Implementation Readiness | Yes | Readiness state declared from source evidence. |
| Miranda Approval | Yes | Approved, not approved or requires review. |
| Board Approval | Yes | Not required, required pending or approved. |
| Scope Boundary | Yes | Exact allowed surface declared. |
| Prohibited Surfaces | Yes | Explicit no-touch list declared. |
| Validation Expectation | Yes | Required validation or reason for no validation. |

## Discovery Status Vocabulary

Use one of these statuses unless a source document defines a stricter status:

- not started
- discovery open
- discovery in progress
- discovery locked
- architecture approved
- implementation readiness required
- implementation ready with conditions
- implementation ready
- implemented
- closed
- blocked

Unknown is allowed only when followed by the evidence gap that must be resolved.

## Implementation Readiness Vocabulary

Use one of these statuses:

- not ready
- readiness discovery required
- readiness contract exists
- ready with conditions
- ready
- implemented
- closed
- blocked

Ready cannot be inferred from intent.

Ready requires source evidence.

## Miranda Approval Registry Rule

Miranda approval must be declared for every future task.

Allowed values:

- approved
- not approved
- requires review

Only approved work may proceed beyond read-only inventory.

## Board Approval Registry Rule

Board approval must be declared for every future task.

Allowed values:

- not required
- required pending
- approved

If Board approval is required pending, execution is blocked.

## Protected Surfaces

The following surfaces must be declared explicitly before work may touch them:

- `AGENTS.md`
- `FORGE_CONSTITUTION_V3.md`
- `FORGE_MASTER_BUILD_TREE.md`
- `adr/`
- `docs/02-adr-candidates/`
- `docs/01-constitution/`
- `docs/03-discovery/`
- `docs/07-runtime/`
- `docs/06-repository-governance/`
- `app.js`
- route files
- UI files
- engines
- schemas
- rule packs
- business logic

Touching a protected surface requires explicit scope and approval.

## Work Start Rule

A task has not started until the Constitutional Gate is complete.

Read-only discovery may be used only to complete the gate.

Implementation, refactor, migration, repair, test creation, schema change, route change, UI change, rule change or business logic change may not begin until the gate passes.

## Failure Rule

If any required governance field is missing, the work status is:

BLOCKED BY ROBOCOP LOCK 001

The next action is to complete the missing governance declaration, not to implement.

## Registry Maintenance

This registry may be updated only by governance-scoped work.

Updates must not change engines, UI, schemas, commercial rules, routes or business logic.

Any change to this registry must preserve ROBOCOP LOCK 001 unless Board approval explicitly supersedes it.

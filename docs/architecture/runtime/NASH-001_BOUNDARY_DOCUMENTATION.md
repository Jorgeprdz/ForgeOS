# NASH-001 Boundary Documentation

Status: BOUNDARY DOCUMENTATION / NO PHYSICAL MIGRATION

## Context

NASH Structure Discovery evaluated whether the current NASH files can be physically migrated now.

Decision from discovery:

- Immediate physical migration is NO-GO.
- NASH core, derived outputs, bridge-like files and tests are coupled through root-relative CommonJS `require` paths.
- Manager-facing NASH outputs are NASH-owned signals, not Manager OS-owned engines.
- NASH should be migrated only after formal contracts and a NASH-specific move map exist.

Current runtime state:

| Runtime Signal | Current State |
| --- | ---: |
| Runtime verdict | `EXECUTABLE_WITH_WARNINGS` |
| Boot blockers | 0 |
| Circular imports | 0 |
| Missing targets | 6 |
| Missing exports | 2 |

## Decision

NASH is a distinct Conversation Intelligence domain.

Do not physically migrate NASH files as part of Manager OS migration.

Do not move NASH immediately into `shared-intelligence/` or any new NASH folder until bridge contracts and a phased migration plan are approved.

NASH may later move into a dedicated structure such as:

```text
nash/core/
nash/derived/
nash/bridges/
nash/tests/
```

or, if shared ownership is formally approved:

```text
shared-intelligence/nash/
```

For now, NASH remains root-scoped and protected from piecemeal movement.

## NASH Ownership Rule

NASH owns conversation guidance, message framing, tone options, objection response, conversational timing and NASH-derived conversation intelligence.

NASH does not own:

- Client intent truth.
- Product truth.
- Policy truth.
- Economic evidence.
- Forecast truth.
- Relationship permission.
- Manager enforcement.
- Advisor productivity truth.

NASH may consume signals from other domains, but it must not convert those signals into stronger truth than their source supports.

## Boundary Rule

Manager-facing output does not imply Manager OS ownership.

NASH-derived manager and team signals may be consumed by Manager OS through a formal bridge or signal contract.

Manager OS must not physically own NASH-derived engines.

Advisor-facing output does not imply Advisor OS ownership.

Advisor OS may consume NASH suggestions, but NASH remains responsible for the conversation intelligence that produced them.

## Architectural Classifications

### NASH_CORE

NASH core files own conversation-intelligence orchestration, interpretation, memory and next-action reasoning.

Current examples:

- `nash-core-engine.js`
- `nash-intent-engine.js`
- `nash-personality-engine.js`
- `nash-prospect-context-builder.js`
- `nash-memory-engine.js`
- `nash-next-best-action-engine.js`
- `nash-combat-orchestrator.js`
- `nash-combat-intelligence-report-engine.js`
- `nash-master-intelligence-engine.js`

### NASH_DERIVED

NASH-derived files produce secondary signals from NASH context, learning, advisor performance or conversation patterns.

Current examples:

- `nash-advisor-performance-engine.js`
- `nash-learning-engine.js`
- `nash-coaching-insight-engine.js`
- `nash-manager-alert-engine.js`
- `nash-team-intelligence-engine.js`

### NASH_BRIDGE

Bridge-like files shape NASH output for adjacent domains or interface layers, but do not transfer ownership away from NASH.

Current examples:

- `nash-council-orchestrator.js`
- `nash-message-recommendation-engine.js`
- `nash-followup-engine.js`

`nash-followup-engine.js` remains a boundary hotspot because follow-up can mean conversation guidance, sales workflow or policy operations.

### NASH_TEST

NASH tests validate root-relative CommonJS modules and should move only after their target modules have a stable destination.

Current examples:

- `nash-master-acceptance-test.js`
- `nash-master-test.js`
- `nash-master-intelligence-master-test.js`
- `nash-intent-master-test.js`
- `nash-learning-master-test.js`
- `nash-memory-master-test.js`
- `nash-next-best-action-master-test.js`
- `nash-personality-master-test.js`
- `nash-advisor-performance-master-test.js`
- `nash-coaching-insight-master-test.js`
- `nash-manager-alert-master-test.js`
- `nash-team-intelligence-master-test.js`
- `nash-combat-master-test.js`
- `nash-combat-intelligence-report-test.js`
- `nash-integration-master-test.js`
- `nash-v03-master-test.js`
- `nash-v04-master-test.js`

### NO_MOVE

Current NO_MOVE files:

- `nash-master-intelligence-engine.js`
- `nash-master-acceptance-test.js`
- `nash-core-engine.js`
- `nash-memory-engine.js`
- `nash-memory/*.json`

These files anchor NASH orchestration, acceptance coverage or runtime memory. They should not move in an early batch.

## Current Dependency Shape

NASH has two primary orchestration centers:

1. `nash-core-engine.js`
   - Imports prospect context, council orchestration, message recommendation, personality, follow-up, next best action and intent.

2. `nash-master-intelligence-engine.js`
   - Imports prospect context, personality, intent, memory, learning, combat intelligence, advisor performance, coaching insight, manager alert and team intelligence.

`nash-master-acceptance-test.js` imports the integrated NASH stack and validates NASH foundation behavior.

NASH-derived manager/team files are consumed by:

- Their own master tests.
- `nash-master-intelligence-engine.js`.
- `nash-master-acceptance-test.js`.

This makes them NASH-derived producers, not Manager OS-owned modules.

## Boundary Findings

### NASH Core

NASH core is deterministic and CommonJS-based today. It should remain local and offline-capable unless a separate AI integration is explicitly approved.

### NASH-Derived Outputs

NASH-derived outputs include advisor performance, coaching insight, manager alert and team intelligence.

These outputs may support managers, advisors or future shared intelligence consumers, but the derivation remains NASH-owned.

### Manager-Facing Signals

Manager-facing NASH signals are allowed.

Manager OS may consume them only through a formal contract that defines:

- Signal name.
- Input evidence.
- Output shape.
- Confidence.
- Freshness / staleness.
- Human-review requirement.
- Allowed manager interpretation.
- Forbidden manager inference.

### Advisor-Facing Signals

Advisor-facing NASH signals are guidance, not mandatory copy-paste and not final truth.

Advisor Experience may teach how to use NASH output, but it must not alter NASH truth or turn NASH drafts into mandatory behavior.

### Relationship Intelligence

NASH may consume relationship context, but it must not turn relationship opportunity into consent or pressure language.

Relationship Intelligence owns relationship truth and permission boundaries.

### Learning Intelligence

NASH learning is part of NASH-derived signal production until a broader Learning Intelligence boundary is created.

Learning outputs may inform coaching, but they do not authorize Manager OS enforcement.

### Process Ownership / Next Best Action

NASH may produce conversational next best action hints.

NASH does not own universal process advancement or operational workflow truth. Process-level ownership must stay with its own domain.

## Destination Evaluation

| Option | Verdict | Reason |
| --- | --- | --- |
| `shared-intelligence/nash/` | Possible later | Better than Manager OS, but too broad before contracts define ownership and consumers. |
| `nash/core/`, `nash/derived/`, `nash/tests/` | Best future physical shape | Matches the current architecture most directly. |
| `shared-intelligence/conversation/nash/` | Possible later | Conceptually clear, but physically verbose and still needs contracts. |
| No physical move yet | Recommended now | Prevents premature movement of a coupled CommonJS stack. |

## Risks

- Moving individual NASH files will break root-relative CommonJS imports unless all rewrites are planned together.
- Moving NASH-derived manager/team files into Manager OS would violate the MIGRATION-007C boundary decision.
- Moving tests before engines creates unstable test paths.
- Moving `nash-memory-engine.js` risks runtime memory side effects.
- `nash-memory/*.json` are runtime artifacts and should not be treated as source migration targets.
- `nash-followup-engine.js` needs ownership review before movement because follow-up crosses conversation, sales workflow and policy operations.
- `life-event-engine.js` imports `nash-memory-engine.js`, so NASH is not fully isolated.

## Roadmap

### NASH-001 Boundary Documentation

Status: this document.

Purpose:

- Freeze current boundary decision.
- Prevent Manager OS from absorbing NASH-derived engines.
- Define classifications before physical movement.

### NASH-002 Contract Definition

Define contracts before moving files:

- NASH-to-Manager Signal Contract.
- NASH-to-Advisor Signal Contract.
- NASH-to-Relationship Context Contract.
- NASH-to-Learning Signal Contract if learning becomes shared.

### NASH-003 Low-Risk Move Batch

Only after NASH-002:

- Identify leaf files with no incoming imports outside NASH tests.
- Prepare exact rewrite map.
- Exclude master orchestrators and memory artifacts.

### NASH-004 Master Orchestrator Migration

Move `nash-core-engine.js` and `nash-master-intelligence-engine.js` only after core and derived destinations are stable.

This should be a coordinated batch, not a piecemeal move.

### NASH-005 Acceptance Test Migration

Move acceptance and master tests last.

Acceptance tests should validate the final physical layout after engines and bridge contracts are stable.

## GO / NO-GO

NO-GO for immediate physical migration.

GO for contract and boundary documentation.

Future physical migration can be reconsidered only after NASH-002 defines contracts and a NASH-specific move map is approved.

## Final Recommendation

Keep NASH physically stable for now.

Define bridge contracts first.

When physical migration becomes safe, prefer a dedicated NASH domain structure:

```text
nash/core/
nash/derived/
nash/bridges/
nash/tests/
```

Do not migrate NASH as part of Manager OS.

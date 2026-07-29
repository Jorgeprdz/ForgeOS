# Nash Legacy Engine Freeze 001

**Status:** FROZEN / DO NOT IMPORT / DO NOT EXECUTE
**Purpose:** Remove obsolete mixed-authority Nash runtimes from the active development path without deleting historical code or breaking repository evidence.

## Product explanation

These engines are not being deleted. They are being placed in a sealed historical state because they mix responsibilities that the new Conversation Desk must keep separate:

- understanding conversation context;
- inferring intent or personality;
- generating message text;
- suggesting actions;
- reading or writing memory;
- scoring advisors;
- producing manager alerts;
- ranking a team.

That combination is no longer an acceptable production architecture.

## Frozen files

- `nash-core-engine.js`
- `nash-master-intelligence-engine.js`
- `nash-memory-engine.js`
- `nash-learning-engine.js`
- `nash-advisor-performance-engine.js`
- `nash-manager-alert-engine.js`
- `nash-team-intelligence-engine.js`

## Freeze rules

1. Files remain in their current paths as historical evidence.
2. Their current contents are locked by SHA-256.
3. Existing references are recorded as a baseline.
4. New production imports or requires are forbidden.
5. Conversation Desk must not depend on these engines.
6. Bug fixes, features, refactors, or new tests must not be added to them.
7. Useful ideas may be reimplemented through modern protected contracts.
8. Removing these files requires a separate migration and evidence phase.

## Approved replacements

| Frozen responsibility | Replacement direction |
|---|---|
| Mixed Nash orchestration | New Conversation Desk orchestrator with separated stages |
| Local JSON memory | Governed Event & Evidence plus future privacy-safe conversation storage |
| Intent as certainty | Candidate intent with evidence and confidence |
| Direct response generation | Prompt → LLM draft → safety validation → human approval |
| Advisor scoring | Protected Advisor/Manager snapshots |
| Manager escalation | Protected coaching context, never punishment truth |
| Team ranking | Not part of Conversation Desk |

## Boundary

Frozen does not mean deleted. Frozen means it cannot silently return to active runtime.

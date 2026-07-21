# Constitutional Freeze

Status: ACTIVE

## Scope

No new runtime, cognition, inference, scoring, memory, policy, recommendation,
decision, or execution subsystem may be implemented until the constitutional
contracts are approved.

## Allowed work

- Governance audit
- ADR reconciliation
- Canon definition
- Contract definition
- Tests that expose constitutional drift
- Mechanical separation of Legacy and Rewrite
- Documentation and traceability

## Prohibited work

- New product features
- New autonomous decisions
- New scoring semantics
- New evidence or confidence semantics without canonical contracts
- UI wiring against unapproved truth contracts
- Destructive migration of Legacy behavior

## Exit conditions

The freeze may be lifted only after approval of:

1. Truth and evidence contracts
2. Ownership model
3. Inference and uncertainty model
4. Recommendation versus decision boundary
5. Human approval boundary
6. Execution authorization contract
7. ADR status reconciliation

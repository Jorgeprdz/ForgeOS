# Rewrite Boundaries

## Forge Legacy

Git branch: `forge-legacy`

Purpose: functional and historical reference. No rewrite commits belong here.

## Forge Rewrite

Git branch: `forge-rewrite`

Purpose: isolated reconstruction governed by the Constitution and canonical ADRs.

Rewrite filesystem root: `rewrite/`

## Governance Recovery

Git branch: `governance-recovery`

Purpose: reconcile constitutional authority, ADR status, Canon, and contracts
before implementation resumes.

## Replacement rule

Legacy is not deleted or replaced merely because Rewrite has equivalent file
names. Replacement requires:

1. Contract parity
2. Behavioral parity tests
3. Constitutional traceability
4. Explicit human approval
5. Recorded migration decision

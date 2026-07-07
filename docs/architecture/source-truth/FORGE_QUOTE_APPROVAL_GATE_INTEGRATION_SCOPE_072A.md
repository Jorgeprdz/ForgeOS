# Forge Quote Approval Gate Integration Scope 072A

Phase: `072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Decision: `PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Locked decision: `QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED`

Next: `072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION`

## Purpose

072A scopes the integration between the local/static/no-effect Quote Action Contract and the Approval Gate schema.

This phase does not execute quote actions.

This phase does not approve quote actions.

This phase does not create a new quote engine.

## Integration Boundary

The integration may connect these local/static/no-effect layers:

- Quote Read Model adapter;
- Quote Action Contract;
- Action Contract schema;
- Approval Gate schema;
- deterministic payload hash validation;
- approval requirement detection;
- safe error mapping.

The integration may not connect:

- provider runtime;
- backend runtime;
- CRM writes;
- policy writes;
- quote writes;
- pipeline writes;
- task/calendar/message actions;
- auth or secrets;
- browser persistence;
- real engine execution;
- approval bypass.

## Required Integration Rules

- Preview quote actions may remain `not_required` only when no real effect is possible.
- Real-effect quote actions must set `approval_required=true`.
- Real-effect quote actions must set `approval_status=required` or `pending` until human approval exists.
- Approved payload hash must match execution payload hash before any future execution.
- Payload changes after approval must block.
- Source evidence is required.
- Freshness metadata is required.
- Rollback plan is required for effectful actions.
- Idempotency key is required for executable actions.
- AI cannot approve.
- Safety validation cannot approve.
- Approval cannot be inferred from preview, click, typing, opening, or viewing.

## Scoped Integration Inputs

- quote action contract from `platform/action-contracts/quote-action-contract-071b.js`;
- approval gate schema from `platform/action-contracts/action-contract-approval-gate-schema-070c.js`;
- quote read model candidate from `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`;
- source evidence ids;
- freshness metadata;
- preview payload hash;
- execution payload hash;
- approval status;
- safety flags.

## Scoped Integration Outputs

- integrated quote approval gate envelope;
- approval-required decision;
- blocked-effects list;
- safe error when approval is missing;
- safe error when payload changed;
- safe error when evidence/freshness/rollback is missing;
- audit preview event;
- all safety flags false.

## Safe Errors

- `QUOTE_APPROVAL_GATE_NOT_MODELED`
- `QUOTE_ACTION_REQUIRES_APPROVAL`
- `ACTION_EXECUTION_REQUIRES_APPROVAL`
- `QUOTE_ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL`
- `ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL`
- `QUOTE_ACTION_SOURCE_EVIDENCE_REQUIRED`
- `ACTION_SOURCE_EVIDENCE_REQUIRED`
- `QUOTE_ACTION_FRESHNESS_REQUIRED`
- `ACTION_FRESHNESS_REQUIRED`
- `QUOTE_ACTION_ROLLBACK_PLAN_REQUIRED`
- `ACTION_ROLLBACK_PLAN_REQUIRED`
- `QUOTE_ACTION_REAL_EFFECT_NOT_ALLOWED`
- `ACTION_EXECUTION_BLOCKED_BY_POLICY`

## Not Authorized

072A does not authorize:

- quote execution;
- quote approval;
- provider calls;
- backend connection;
- quote document or proposal generation;
- quote send;
- quote save;
- quote binding;
- CRM write;
- policy write;
- pipeline write;
- task/calendar/message creation;
- auth or secret access;
- browser persistence;
- approval bypass;
- invented quote truth.

## Implementation Readiness

072B may implement only a local/static/no-effect integration validator.

072B must not execute quote actions.

072B must not approve quote actions.

072B must not call providers or backend services.

## Final

DECISION=PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE

LOCKED_DECISION=QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED

NEXT=072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION

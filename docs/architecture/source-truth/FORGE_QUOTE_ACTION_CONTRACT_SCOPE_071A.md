# Forge Quote Action Contract Scope 071A

Phase: `071A_QUOTE_ACTION_CONTRACT_SCOPE`

Decision: `PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE`

Locked decision: `QUOTE_ACTION_CONTRACT_SCOPED`

Next: `071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION`

## Purpose

071A scopes the Quote Action Contract lane after the Quote Read Model and Approval Gate schema were locked.

This phase does not create a new quote engine.

The existing quote engine and quote read model remain the source candidates for preview-safe quote data. The Quote Action Contract defines how future quote actions must be represented before any prepare, generate, save, send, or conversion path can be implemented.

## Required Separation

### Existing Quote Engine

Existing quote engines remain candidate execution or parsing engines. They must not be replaced by a new quote engine in this lane.

Known candidate source:

- `gmm-quote-summary-engine.js`
- `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`

### Quote Read Model

Quote Read Model remains read-only and preview-safe.

It can expose quote candidates, source evidence, freshness, blocked effects, and preview values.

It cannot send, save, approve, bind, or issue quotes.

### Quote Action Contract

Quote Action Contract is the envelope that future quote actions must satisfy.

It must describe:

- action identity;
- action family;
- domain;
- actor;
- target reference;
- input payload;
- preview payload;
- execution payload;
- payload hashes;
- required capabilities;
- required approval;
- approval status;
- approval gate;
- source evidence;
- freshness;
- blocked effects;
- safety flags;
- rollback plan;
- idempotency key;
- safe errors.

### Approval Gate

Approval Gate is required before any real quote effect.

Human approval is required for quote document generation, quote persistence, quote send, CRM write, policy write, pipeline write, provider call, backend write, or external state change.

## Scoped Quote Action Families

Allowed no-effect preview families:

- `quote.prepare_preview`
- `quote.generate_document_preview`
- `quote.validate_preview`
- `quote.compare_preview`
- `quote.blocked_effects_preview`

Approval-required families:

- `quote.prepare`
- `quote.generate_document`
- `quote.save`
- `quote.send`
- `quote.convert_to_policy`
- `quote.attach_to_opportunity`
- `quote.write_to_crm`
- `quote.provider_submit`

## Required Safe Errors

- `QUOTE_ACTION_CONTRACT_NOT_MODELED`
- `QUOTE_ACTION_REQUIRES_APPROVAL`
- `QUOTE_ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL`
- `QUOTE_ACTION_SOURCE_EVIDENCE_REQUIRED`
- `QUOTE_ACTION_FRESHNESS_REQUIRED`
- `QUOTE_ACTION_ROLLBACK_PLAN_REQUIRED`
- `QUOTE_ACTION_CAPABILITY_NOT_GRANTED`
- `QUOTE_ACTION_BLOCKED_BY_POLICY`
- `QUOTE_ACTION_PROVIDER_NOT_AUTHORIZED`
- `QUOTE_ACTION_REAL_EFFECT_NOT_ALLOWED`

## Required Safety Defaults

All safety flags must default to false:

- `crmWrite`
- `pipelineWrite`
- `policyWrite`
- `quoteWrite`
- `taskCreate`
- `calendarCreate`
- `messageSend`
- `authReal`
- `providerRuntime`
- `secretAccess`
- `browserPersistence`
- `realEngineExecution`
- `realEffectsAllowed`
- `realEffectsEnabled`
- `backendConnection`
- `approvalBypass`
- `autoSend`
- `autoWrite`

## Not Authorized

071A does not authorize:

- new quote engine creation;
- quote execution;
- provider calls;
- PDF/proposal generation;
- quote send;
- quote save;
- quote binding;
- policy issuance;
- CRM write;
- pipeline write;
- task/calendar/message creation;
- backend connection;
- auth or secret access;
- browser persistence;
- approval bypass;
- invented premium, coverage, carrier, or quote truth.

## Implementation Readiness

071B may implement only a local/static/no-effect Quote Action Contract builder and validator.

071B must not execute quote actions.

071B must not call the quote engine for real effects.

071B must not call providers or backend services.

## Final

DECISION=PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE

LOCKED_DECISION=QUOTE_ACTION_CONTRACT_SCOPED

NEXT=071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION

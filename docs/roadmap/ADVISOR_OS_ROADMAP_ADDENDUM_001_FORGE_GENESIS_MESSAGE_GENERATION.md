# Advisor OS Roadmap Addendum 001 — Forge Genesis Message Generation

Roadmap sync commit source: 2e68b09f1d06f95d5440bd6b47eb72f2bf8bb96d

## Purpose

Record that Forge's original genesis module must also be implemented in Advisor OS.

Forge began as a signal-to-message system for prospect outreach over WhatsApp/SMS. That capability must not remain only in Manager OS. Advisor OS must support advisor-facing message generation for prospect and client communication.

## Advisor OS canonical flow

```text
advisor/prospect/client signals
→ protected Advisor OS context
→ prompt builder
→ LLM draft generation
→ Forge safety validation
→ advisor approval
→ WhatsApp/SMS delivery adapter
```

## Advisor OS target audiences

- Prospects.
- Clients.
- Referrals.
- Centers of influence.
- Existing policyholders where communication is allowed and context-supported.

## Advisor OS required boundaries

- Forge provides context and prompt.
- The LLM generates draft language only.
- Forge validates the draft.
- The advisor approves before sending.
- No automatic sending.
- No invented client intent.
- No false urgency.
- No manipulation.
- No shame.
- No pressure.
- No unauthorized product claim.
- No unauthorized policy claim.
- No revenue, compensation, payout, or product truth creation.
- No message may imply official approval, underwriting result, guaranteed benefit, guaranteed savings, guaranteed payout, or guaranteed insurability unless upstream source truth supports it.

## Future Advisor OS roadmap items

- Advisor OS Signal-to-Message Context Builder.
- Advisor OS Outreach Prompt Builder.
- LLM Draft Intake.
- Advisor Message Safety Validator.
- Advisor Human Approval Gate.
- WhatsApp/SMS Adapter Boundary.
- Send Execution Gate.

## Boundary lock

Advisor OS message generation is a draft-support system, not an autonomous outreach system.

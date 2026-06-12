# MIGRATION-003 Advisor OS Move Map

Status: PLANNING COMPLETE / AWAITING EXECUTION APPROVAL

## Scope

This move map identifies a controlled Advisor OS commercial engine sub-batch.

No files were moved.
No imports were rewritten.
No folders were created.
No runtime files were modified.

## Batch Decision

Recommended batch size: 57 files

Rationale:

- All selected files are high-confidence Advisor OS commercial intelligence assets.
- All selected files are `NO_IMPORTS` in the current root-level dependency scan.
- All selected files have zero detected root JS consumers.
- UI/viewmodel artifacts were left out of the execution set to keep MIGRATION-003 focused on commercial engines and domain objects.

## Destination Structure

Recommended structure for this batch:

```text
advisor-os/
  commercial-intelligence/
  prospecting/
  followup/
  conversation/
  referrals/
```

This batch should use subfolders. A flat `advisor-os/` would recreate root disorder inside the target domain.

## Move Map

| Current Path | Destination Path | Owner | Dependency Class | Consumers Affected | Risk | Eligible |
|---|---|---|---|---:|---|---|
| `advisor-sales-dna.entity.js` | `advisor-os/commercial-intelligence/advisor-sales-dna.entity.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `sales-dna-evolution-engine.js` | `advisor-os/commercial-intelligence/sales-dna-evolution-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `sales-dna-insight-engine.js` | `advisor-os/commercial-intelligence/sales-dna-insight-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `sales-dna-learning-event.js` | `advisor-os/commercial-intelligence/sales-dna-learning-event.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `sales-dna-match-engine.js` | `advisor-os/commercial-intelligence/sales-dna-match-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `sales-dna-profile-engine.js` | `advisor-os/commercial-intelligence/sales-dna-profile-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `sales-dna-recommendation-engine.js` | `advisor-os/commercial-intelligence/sales-dna-recommendation-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `sales-dna-stage-engine.js` | `advisor-os/commercial-intelligence/sales-dna-stage-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `relationship-memory-engine.js` | `advisor-os/commercial-intelligence/relationship-memory-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `appointment-calendar-engine.js` | `advisor-os/prospecting/appointment-calendar-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `appointment-opportunity-engine.js` | `advisor-os/prospecting/appointment-opportunity-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `center-of-influence-engine.js` | `advisor-os/prospecting/center-of-influence-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `close-prompt-builder.js` | `advisor-os/prospecting/close-prompt-builder.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `close-readiness-engine.js` | `advisor-os/prospecting/close-readiness-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `close-strategy-engine.js` | `advisor-os/prospecting/close-strategy-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `prospect-next-action-engine.js` | `advisor-os/prospecting/prospect-next-action-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `prospect-pipeline-engine.js` | `advisor-os/prospecting/prospect-pipeline-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `prospect-profile-engine.js` | `advisor-os/prospecting/prospect-profile-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `prospect-score-engine.js` | `advisor-os/prospecting/prospect-score-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `prospect-segment-performance-engine.js` | `advisor-os/prospecting/prospect-segment-performance-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `prospect.entity.js` | `advisor-os/prospecting/prospect.entity.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `ai-first-contact-message-engine.js` | `advisor-os/conversation/ai-first-contact-message-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `first-contact-ai-suggestion-engine.js` | `advisor-os/conversation/first-contact-ai-suggestion-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `first-contact-delivery-engine.js` | `advisor-os/conversation/first-contact-delivery-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `first-contact-options-engine.js` | `advisor-os/conversation/first-contact-options-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `first-contact-script-engine.js` | `advisor-os/conversation/first-contact-script-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `first-contact-tone-engine.js` | `advisor-os/conversation/first-contact-tone-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `first-contact.entity.js` | `advisor-os/conversation/first-contact.entity.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `objection-battle-engine.js` | `advisor-os/conversation/objection-battle-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `objection-classifier-engine.js` | `advisor-os/conversation/objection-classifier-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `objection-intent-engine.js` | `advisor-os/conversation/objection-intent-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `objection-memory-engine.js` | `advisor-os/conversation/objection-memory-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `objection-prompt-builder.js` | `advisor-os/conversation/objection-prompt-builder.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `objection-resolution-engine.js` | `advisor-os/conversation/objection-resolution-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `objection-response-strategy-engine.js` | `advisor-os/conversation/objection-response-strategy-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `appointment-followup-engine.js` | `advisor-os/followup/appointment-followup-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup-engine.js` | `advisor-os/followup/followup-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup-message-context-engine.js` | `advisor-os/followup/followup-message-context-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup-next-date-engine.js` | `advisor-os/followup/followup-next-date-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup-overdue-engine.js` | `advisor-os/followup/followup-overdue-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup-priority-engine.js` | `advisor-os/followup/followup-priority-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup-recommendation-engine.js` | `advisor-os/followup/followup-recommendation-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup-reminder-engine.js` | `advisor-os/followup/followup-reminder-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `followup.entity.js` | `advisor-os/followup/followup.entity.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `smart-followup-engine.js` | `advisor-os/followup/smart-followup-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `smart-followup-message-engine.js` | `advisor-os/followup/smart-followup-message-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-ai-followup.js` | `advisor-os/referrals/referral-ai-followup.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-color-engine.js` | `advisor-os/referrals/referral-color-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-followup-engine.js` | `advisor-os/referrals/referral-followup-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-priority-engine.js` | `advisor-os/referrals/referral-priority-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-prompt-builder.js` | `advisor-os/referrals/referral-prompt-builder.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-score-engine.js` | `advisor-os/referrals/referral-score-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-smart-actions.js` | `advisor-os/referrals/referral-smart-actions.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-temperature-engine.js` | `advisor-os/referrals/referral-temperature-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referral-timeline-engine.js` | `advisor-os/referrals/referral-timeline-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referrals-board-engine.js` | `advisor-os/referrals/referrals-board-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |
| `referrals-engine.js` | `advisor-os/referrals/referrals-engine.js` | Advisor OS | NO_IMPORTS | 0 | LOW | YES |

## Estimated Root Reduction

Expected root reduction if approved: 57 files.

# MIGRATION-003 Advisor OS Dependency Safety

Status: DISCOVERY COMPLETE

## Scope

This document records dependency safety for the MIGRATION-003 Advisor OS commercial engine planning batch.

No files were moved.
No imports were rewritten.
No folders were created.

## Candidate Extraction

Source inventory:

- Remaining root runtime assets: 655 top-level `.js` files
- Preferred Advisor OS commercial matches found: 72
- Eligible candidates found: 70
- Selected execution candidates: 57
- Reserve eligible candidates: 13
- Complex candidates excluded: 2
- Hard blocked candidates: 0

Preferred match signals:

- `prospect`
- `prospecting`
- `followup`
- `first-contact`
- `referral`
- `center-of-influence`
- `sales-script`
- `sales-dna`
- `conversation`
- `objection`
- `appointment`
- `close`
- `relationship`

Excluded by policy:

- Protected route/shell files
- Unknown ownership files
- Route-level coupling
- Complex rewrites
- Test and smoke-test files
- Product-specific objection files outside Advisor OS ownership

## Dependency Class Definitions

| Class | Meaning | MIGRATION-003 Policy |
|---|---|---|
| `NO_IMPORTS` | File has no detected local imports and no detected root JS consumers. | Eligible |
| `INTERNAL_ONLY` | File imports or is consumed only inside the approved batch. | Eligible |
| `SIMPLE_REWRITE` | File has limited direct imports or consumers that can be mechanically updated. | Eligible if explicitly mapped |
| `COMPLEX_REWRITE` | File has broad consumers, route adjacency, or multi-module dependency surface. | Excluded |
| `BLOCKED` | File has protected route/shell coupling or missing local targets. | Excluded |

## Selected Batch Safety Summary

| Metric | Count |
|---|---:|
| Selected files | 57 |
| `NO_IMPORTS` | 57 |
| `INTERNAL_ONLY` | 0 |
| `SIMPLE_REWRITE` | 0 |
| `COMPLEX_REWRITE` | 0 |
| `BLOCKED` | 0 |
| Local imports requiring rewrite | 0 |
| Root JS consumers requiring rewrite | 0 |
| Protected route consumers | 0 |

## Selected Files By Destination

### `advisor-os/commercial-intelligence/`

- `advisor-sales-dna.entity.js`
- `relationship-memory-engine.js`
- `sales-dna-evolution-engine.js`
- `sales-dna-insight-engine.js`
- `sales-dna-learning-event.js`
- `sales-dna-match-engine.js`
- `sales-dna-profile-engine.js`
- `sales-dna-recommendation-engine.js`
- `sales-dna-stage-engine.js`

### `advisor-os/prospecting/`

- `appointment-calendar-engine.js`
- `appointment-opportunity-engine.js`
- `center-of-influence-engine.js`
- `close-prompt-builder.js`
- `close-readiness-engine.js`
- `close-strategy-engine.js`
- `prospect-next-action-engine.js`
- `prospect-pipeline-engine.js`
- `prospect-profile-engine.js`
- `prospect-score-engine.js`
- `prospect-segment-performance-engine.js`
- `prospect.entity.js`

### `advisor-os/conversation/`

- `ai-first-contact-message-engine.js`
- `first-contact-ai-suggestion-engine.js`
- `first-contact-delivery-engine.js`
- `first-contact-options-engine.js`
- `first-contact-script-engine.js`
- `first-contact-tone-engine.js`
- `first-contact.entity.js`
- `objection-battle-engine.js`
- `objection-classifier-engine.js`
- `objection-intent-engine.js`
- `objection-memory-engine.js`
- `objection-prompt-builder.js`
- `objection-resolution-engine.js`
- `objection-response-strategy-engine.js`

### `advisor-os/followup/`

- `appointment-followup-engine.js`
- `followup-engine.js`
- `followup-message-context-engine.js`
- `followup-next-date-engine.js`
- `followup-overdue-engine.js`
- `followup-priority-engine.js`
- `followup-recommendation-engine.js`
- `followup-reminder-engine.js`
- `followup.entity.js`
- `smart-followup-engine.js`
- `smart-followup-message-engine.js`

### `advisor-os/referrals/`

- `referral-ai-followup.js`
- `referral-color-engine.js`
- `referral-followup-engine.js`
- `referral-priority-engine.js`
- `referral-prompt-builder.js`
- `referral-score-engine.js`
- `referral-smart-actions.js`
- `referral-temperature-engine.js`
- `referral-timeline-engine.js`
- `referrals-board-engine.js`
- `referrals-engine.js`

## Excluded Complex Candidates

| File | Dependency Class | Reason |
|---|---|---|
| `relationship-master-engine.js` | COMPLEX_REWRITE | Imports 8 local modules and is consumed by `relationship-master-acceptance-test.js`. This belongs in a separate Relationship Intelligence batch. |
| `relationship-opportunity-engine.js` | COMPLEX_REWRITE | Has multiple consumers, including `life-event-engine.js`, `relationship-master-engine.js`, and master tests. This needs a dedicated relationship dependency map. |

## Reserve Eligible Candidates

The scan found additional eligible files, but they were not selected for MIGRATION-003 because the batch should stay focused on engines and domain objects.

Reserve examples:

- `first-contact-dashboard.viewmodel.js`
- `prospecting-dashboard.viewmodel.js`
- `referral-card-ui.js`

These can be moved later in an Advisor OS UI/viewmodel batch.

## Safety Verdict

Dependency safety: PASS

The selected batch is suitable for execution after approval because it requires physical movement only and no import rewrites are expected.

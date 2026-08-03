# Advisor OS 1.0 — Sprint 04: Contextual Notifications and Clippy

```text
SPRINT=04_CONTEXTUAL_NOTIFICATIONS_AND_CLIPPY
EXECUTION_MODE=ONE_PASS
STATUS=CANDIDATE_COMPLETE
```

## Objective

Surface the single most useful contextual suggestion without creating noise, hidden automation or another source of commercial truth.

## Authority model

```text
CANONICAL_BUSINESS_AUTHORITIES
→ NORMALIZED_NOTIFICATION_SIGNALS
→ PRIORITY_AND_COOLDOWN_RUNTIME
→ CONTEXTUAL_CLIPPY
→ REVIEWABLE_COMMAND_BAR_DRAFT
→ USER_DECISION
```

Clippy is presentation and guidance only. It does not calculate commercial truth, mutate records, confirm writes or send communications.

## Signal vocabulary

```text
OVERDUE
DUE_TODAY
WAITING_STALE
COMMERCIAL_RISK
MUTATION_RECEIPT
```

Priority:

```text
OVERDUE > COMMERCIAL_RISK > DUE_TODAY > WAITING_STALE > MUTATION_RECEIPT
```

## Delivered stages

```text
STAGE_04A_SIGNAL_CONTRACT=IMPLEMENTED
STAGE_04B_PRIORITY_AND_DEDUPLICATION=IMPLEMENTED
STAGE_04C_COOLDOWN_AND_DISMISSAL=IMPLEMENTED
STAGE_04D_CONTEXTUAL_CLIPPY_BRIDGE=IMPLEMENTED
STAGE_04E_USER_MUTE_PREFERENCE=IMPLEMENTED
STAGE_04F_AUTHENTICATED_LIFECYCLE_AND_SCRUB=IMPLEMENTED
STAGE_04G_COMMAND_BAR_DRAFT_HANDOFF=IMPLEMENTED
STAGE_04H_ACCEPTANCE_GATE=IMPLEMENTED
```

## Safety locks

```text
AUTONOMOUS_ACTION=0
AUTO_CONFIRMATION=0
DIRECT_DATABASE_WRITE=0
NOTIFICATION_IS_BUSINESS_TRUTH=NO
BUSINESS_DATA_PERSISTED_IN_NOTIFICATION_STATE=0
CROSS_SESSION_STALE_SIGNALS=0
MULTIPLE_SIMULTANEOUS_CLIPPY_CARDS=0
```

Only signal identifiers, priority and cooldown timestamps are held in runtime memory. They are scrubbed on logout/unmount.

## UX behavior

- At most one contextual card is visible.
- Repeated signals respect cooldown.
- Explicit dismissal suppresses the same signal during cooldown.
- Muting removes the card immediately.
- The CTA opens a reviewable Command Bar draft.
- The user remains responsible for execution and confirmation.

## Exit gate

```text
SIGNAL_NORMALIZATION=PASS_CANDIDATE
PRIORITY=PASS_CANDIDATE
DEDUPLICATION=PASS_CANDIDATE
COOLDOWN=PASS_CANDIDATE
MUTE=PASS_CANDIDATE
LOGOUT_SCRUB=PASS_CANDIDATE
CLIPPY_DRAFT_ONLY=PASS_CANDIDATE
UNAPPROVED_MUTATIONS=0
```

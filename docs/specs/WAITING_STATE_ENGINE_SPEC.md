# Waiting State Engine Specification

Status: AUTHORIZED
Date: 2026-06-17
Version: 0.1

---

## 1. Purpose
The Waiting State Engine manages asynchronous process states where the next action is owned by an actor other than the advisor. It ensures visibility into stalled processes without incorrectly penalizing the advisor for delays caused by external actors.

## 2. Core Principles
- **Ownership Precedes Waiting:** The Waiting State Engine MUST consume the output of the Action Ownership Detection Engine before classifying a state.
- **Waiting is Managed State:** Waiting is not "failure" or "inactivity"; it is a legitimate operational state that requires monitoring.
- **Traceability:** Archiving or transitioning to stale status never deletes historical events or evidence.
- **Human Accountability:** The system recommends transitions; the advisor makes the final decision.
- **No Automatic Decisions:** The engine provides recommendations (escalation, archival) but never autonomously executes them.

## 3. Supported Waiting Owners
- `prospect`
- `client`
- `referrer`
- `manager`
- `carrier`
- `underwriter`
- `external_event`
- `unknown`

## 4. Supported States
- `active`: Advisor owns the next action.
- `waiting`: An external actor owns the next action; process is monitored.
- `stale`: Waiting duration exceeded threshold; requires advisor attention.
- `blocked`: An external dependency or blocker is impeding progress.
- `archived`: Process paused or closed (no evidence deletion).

## 5. State Transitions & Rules
- **Entry:** Transition to `waiting` when Ownership Engine assigns ownership to non-advisor, and a clear next-step action exists.
- **Exit:** Transition back to `active` when evidence of interaction, completion, or updated commitment is received.
- **Timeout:** If waiting exceeds the defined threshold, transition to `stale`.
- **Escalation:** If `stale` persists, recommend escalation to advisor or manager.
- **Archival:** Recommend archival if process remains `stale` without activity for extended periods.

## 6. Engine Interactions
- **Action Ownership Engine:** Input provider (who owns the next action?).
- **Process Advancement Engine:** Input consumer (does this waiting state affect process maturity?).
- **Forecast Confidence Engine:** Input consumer (waiting states increase forecast risk).

## 7. Engine Output Schema
```json
{
  "currentWaitingState": "string",
  "waitingOwner": "string",
  "waitingConfidence": "float",
  "nextReviewDate": "iso8601",
  "escalationRecommendation": "boolean",
  "archivalRecommendation": "boolean"
}
```

## 8. Validation Examples (from Corpus)

### Case: Marlene (Waiting)
- **Condition:** Prospect committed to call by Friday.
- **State:** `waiting`
- **Owner:** `prospect`
- **Review Date:** Friday + 1 day
- **Archival Recommendation:** False

### Case: Ricardo Mejía (External Dependency)
- **Condition:** Medical exam pending.
- **State:** `waiting` (specifically `waiting_underwriter`)
- **Owner:** `prospect` (to attend exam)
- **Review Date:** Date of exam + 2 days
- **Archival Recommendation:** False

### Case: Stale Opportunity
- **Condition:** No evidence of activity for > 30 days while in `waiting` state.
- **State:** `stale`
- **Owner:** `unknown`
- **Review Date:** Immediate
- **Escalation Recommendation:** True
- **Archival Recommendation:** True (Recommend human review to archive)

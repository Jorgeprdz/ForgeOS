# Process Advancement Engine Specification

Status: AUTHORIZED
Date: 2026-06-17
Version: 0.1

---

## 1. Purpose
The Process Advancement Engine objectively determines whether a process is moving forward, stalled, or regressing based solely on evidence and micro-commitments. It ensures process health is measured against verifiable progress rather than advisor intuition.

## 2. Core Principles
- **Evidence-First:** Advancement requires evidence (e.g., completed actions, agreements, dependencies resolved).
- **Atomic Progress:** Micro-commitments are the fundamental unit of advancement.
- **Advisor/Prospect Roles:** Advisor owns the process; Prospect owns the decision.
- **No Automatic Decisions:** The engine provides health scoring and recommendations; the human advisor retains accountability.
- **Traceability:** State transitions and evidence used are preserved.

## 3. Advancement States
- `advanced`: Significant advancement evidenced by fulfilled micro-commitment or dependency resolution.
- `unchanged`: No new evidence of advancement or regression.
- `regressed`: Evidence suggests a step backward (e.g., agreed action cancelled, dependency reappeared).
- `stalled`: No progress evidence for a prolonged period (threshold-dependent).
- `archived`: Process paused/closed (with history preserved).

## 4. Advancement Logic
- **Advancement Scoring:** Based on the number and weight of completed micro-commitments and resolved dependencies.
- **Regression Detection:** Triggered when existing evidence is invalidated (e.g., "I cannot sign after all").
- **Health Score (0.0 - 1.0):** Aggregated score of advancement, evidence freshness, and commitment reliability.

## 5. Engine Interactions
- **Action Ownership Engine:** Input provider (who owns the next action?).
- **Waiting State Engine:** Input provider (is the process stalled while waiting?).
- **Forecast Confidence Engine:** Output consumer (advancement state drives forecast health).

## 6. Output Schema
For each process evaluated:
```json
{
  "advancementState": "string",
  "evidenceUsed": ["uuid"],
  "advancementConfidence": "float",
  "processHealthScore": "float",
  "nextReviewDate": "iso8601",
  "recommendation": "string"
}
```

## 7. Validation Examples (from Corpus)

### Case: Lariza Pedro Camarena
- **Input:** Initial discovery note.
- **Advancement State:** `unchanged` (Just started)
- **Recommendation:** "Define next micro-commitment with prospect."

### Case: Marlene
- **Input:** "I'll look at it and call you by Friday."
- **Advancement State:** `unchanged` (Open loop, not yet fulfilled)
- **Recommendation:** "Review progress post-Friday."

### Case: Stalled Process
- **Input:** No evidence of activity for > 30 days.
- **Advancement State:** `stalled`
- **Recommendation:** "Escalate: No recent advancement evidence."

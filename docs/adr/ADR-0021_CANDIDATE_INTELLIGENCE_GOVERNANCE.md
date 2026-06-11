# ADR-0021: Candidate Intelligence Engine Governance

## Status
OPERATIONAL

## Context
The creation of Seat #13 (The Talent Authority / Andrey) requires a formal governance model for the **Candidate Intelligence Engine**. This engine is responsible for converting recruitment signals into talent judgments.

## Decision
The Candidate Intelligence Engine shall consume the authority of Seat #13 to evaluate, approve, or veto recruitment candidates.

### 1. Evidence Consumption
The engine will aggregate evidence from the following sources to feed Talent judgments:
- **Behavior (Mick):** Consistency and coachability signals during recruitment tasks.
- **Conversation (Nash):** Intent, intelligence, and empathy signals from interviews.
- **Networking (Nicky Spurgeon):** Quality and depth of the natural market (P200/Relationship Capital).
- **Hard Factors:** Age, career history, and stability.
- **Vital Factors:** Energy, Drive, and Success History.

### 2. Decision Logic
- **Talent Approval:** If (Vital Factors >= Threshold) AND (Excellence Signals detected), the engine suggests a **Fast-Track**.
- **Talent Veto:** If (Vital Factors < Minimum) OR (Critical Red Flags), the engine blocks advancement regardless of activity levels.
- **Talent Audit:** If (High Potential) AND (Status === 'Abandoned'), the engine triggers a manager alert for attrition analysis.

### 3. Engine Boundaries
- The engine does not manage dates or tasks (Recruitment Ops).
- The engine does not calculate commissions (Compensation).
- The engine's output is an **Intelligence Judgment** with a confidence score.

## Consequences
- **Positive:** Recruitment shifts from volume-tracking to talent-selection. Managers receive clear "Advance/Stop" recommendations based on potential.
- **Negative:** Increased friction for low-potential candidates who might have previously advanced through pure activity.
- **Neutral:** Managers retain final decision authority, but Forge provides a constitutional "Talent Veto" signal.

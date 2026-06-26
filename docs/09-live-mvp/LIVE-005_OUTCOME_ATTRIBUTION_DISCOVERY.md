# LIVE-005_OUTCOME_ATTRIBUTION_DISCOVERY

## 1. Executive Summary

Outcome Attribution is the logic layer that determines the degree of causality between a Forge Recommendation and a business result. It seeks to answer: **"Did Forge cause this outcome, or did it happen independently?"**

**Final Principle**: Forge should not claim causality without evidence.

---

## 2. Attribution Model (Levels 0–4)

| Level | Name | Description | Example |
| :--- | :--- | :--- | :--- |
| **0** | **Unknown** | Outcome happened but no evidence links it to Forge. | An advisor closes a sale for a client Forge never recommended. |
| **1** | **Temporal** | Outcome occurred within the attribution window. | Advisor logs an activity 2 hours after seeing a generic activity nudge. |
| **2** | **Behavioral** | User clicked a recommendation and performed related activity. | Advisor clicks "Call Prospect X" and then logs a call for "Prospect X". |
| **3** | **State Transition** | Domain state changed as expected following the action. | Referral status moves from `Nuevo` to `Cita` after a Forge-suggested contact. |
| **4** | **Strong** | Multiple evidence sources confirm Forge influenced the outcome. | Forge suggests a specific objection response; Telemetry records the click; State changes to `Closed`. |

---

## 3. Confidence Model

Attribution confidence is a dynamic score based on the strength of evidence and timing.

### 3.1 Confidence Levels
*   **Low**: Level 1 evidence (Temporal only).
*   **Medium**: Level 2 evidence (Behavioral).
*   **High**: Level 3 evidence (State Transition).
*   **Very High**: Level 4 evidence (Behavioral + State Transition + Feedback).

### 3.2 Confidence Adjusters
*   **(+) Increase**: Multiple recommendations for the same target leading to one outcome.
*   **(+) Increase**: Action taken immediately (< 5 mins) after recommendation display.
*   **(-) Decrease**: Multiple competing recommendations shown for the same target.
*   **(-) Decrease**: Manual data entry overrides Forge-suggested values.

---

## 4. Decay Functions (by Domain)

Attribution confidence decays as the time between the Recommendation and the Outcome increases.

### 4.1 Activity (Habits)
*   **High**: 0–4 hours.
*   **Medium**: 4–12 hours.
*   **Low**: 12–24 hours.
*   **Expired**: > 24 hours.

### 4.2 Referrals (Pipeline)
*   **High**: 0–24 hours.
*   **Medium**: 1–3 days.
*   **Low**: 3–7 days.
*   **Expired**: > 7 days.

### 4.3 Cartera (Risk)
*   **High**: 0–48 hours.
*   **Medium**: 2–5 days.
*   **Low**: 5–14 days.
*   **Expired**: > 14 days.

---

## 5. Human Override

Advisors must have the ability to explicitly reject attribution to maintain the integrity of the learning model.

**Mechanism**: A "Not because of this" or "Happened independently" feedback option on resolved alerts.

**Implications**:
*   **Model Calibration**: If attribution is frequently rejected for a specific engine, that engine's "Influence Weight" is reduced.
*   **Credit Management**: Rejections prevent Forge from claiming "Credit" in performance scorecards.
*   **Discovery**: High rejection rates signal that Forge is recommending things that advisors are already doing naturally (Low Value-Add).

---

## 6. Risks & Open Questions

### 6.1 Risks
*   **Correlation vs. Causality**: Mistaking a natural business cycle for Forge influence.
*   **Credit Inflation**: Engines "fighting" to claim credit for the same successful outcome.
*   **Data Lag**: Delayed data entry from external sources breaking the temporal window.

### 6.2 Open Questions
*   How do we handle outcomes that result from a "Chain" of recommendations over weeks?
*   Should "Manager Influence" be a separate attribution level?

---

## 7. Status
**DISCOVERY COMPLETE**
*Ready for implementation of the Attribution Scoring Engine.*

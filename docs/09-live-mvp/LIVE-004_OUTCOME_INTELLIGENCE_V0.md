# LIVE-004_OUTCOME_INTELLIGENCE_V0

## 1. Executive Summary

Forge OS is transitioning from **Action Intelligence** (tracking recommendations and clicks) to **Outcome Intelligence** (tracking the real-world impact of those actions). This layer defines the feedback loop that allows Forge to understand if a decision actually improved the advisor's business.

**Core Principle**: Forge optimizes for **Outcomes**, not **Clicks**.

---

## 2. Decision → Evidence → Action → Outcome

The Forge intelligence loop is not complete until the outcome is verified.

| Component | Responsibility | Example |
| :--- | :--- | :--- |
| **Evidence** | Data Intake | Low activity points detected for the week. |
| **Decision** | Recommendation Engine | Suggest calling 3 "Hot Market" prospects. |
| **Action** | User Interface | Advisor clicks "Call" button on a suggested prospect. |
| **Outcome** | Outcome Intelligence | **Activity points increase and prospect moves to "Cita".** |

---

## 3. Outcome Models

### 3.1 activity_gap (Habit Correction)
*   **Target**: Closing the distance between current points and weekly goals.
*   **Success**: 
    *   Direct: Activity logged within 4 hours of action.
    *   Indirect: Weekly total increases by >15% following recommendation.
*   **Failure**: No activity logged in the 24 hours following the "Action".

### 3.2 referral_activation (Pipeline Velocity)
*   **Target**: Moving stagnant referrals through the sales funnel.
*   **Success**:
    *   Status change: `Nuevo` → `Contactado` or `Contactado` → `Cita`.
    *   Event: New "Cita" event created for a suggested referral.
*   **Failure**: Referral remains in the same status for 7 days after recommendation.

### 3.3 cartera_urgency (Risk Mitigation)
*   **Target**: Resolving overdue payments and policy lapses.
*   **Success**:
    *   Payment resolved (status `Paid`).
    *   Policy alert dismissed with reason "Contacted".
*   **Failure**: Alert persists and payment overdue duration increases.

---

## 4. Confidence Model & Success Windows

Forge does not attribute outcomes instantly. It uses **Success Windows** to manage attribution limits.

| Outcome Type | Primary Window | Confidence Decay | Attribution Limit |
| :--- | :--- | :--- | :--- |
| Activity | 4 Hours | High | 24 Hours |
| Pipeline Status | 48 Hours | Medium | 7 Days |
| Payment/Risk | 72 Hours | Low | 14 Days |

**Confidence Score Formula**: 
`OutcomeConfidence = (ImpactMagnitude * AttributionWeight) / TimeToResolution`

---

## 5. Key Question: Success vs. Failure

### "This recommendation worked"
Forge declares success when a **State Change** in the domain (Cartera, Referral, Activity) occurs within the Success Window and can be logically attributed to the user Action.

### "This recommendation failed"
Forge declares failure when:
1.  The Action was taken (Click), but no State Change occurred within the Attribution Limit.
2.  The Evidence persists (e.g., the Gap didn't close) despite multiple Actions.
3.  The user dismissed the recommendation (Intent: `Not Relevant`).

---

## 6. Future Learning Possibilities

Once the Outcome Intelligence layer is mature, Forge can:
*   **Auto-Calibrate**: Stop suggesting actions that result in high clicks but low outcomes.
*   **Weight Personal Styles**: Learn that Advisor A converts better via WhatsApp while Advisor B converts better via Calls.
*   **Predictive Success**: Forecast the probability of a successful outcome *before* showing the recommendation.

---

## 7. Status
**DISCOVERY COMPLETE**
*Ready for Outcome Tracking Implementation.*

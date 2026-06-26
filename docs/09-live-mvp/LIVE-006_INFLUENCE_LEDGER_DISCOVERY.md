# LIVE-006_INFLUENCE_LEDGER_DISCOVERY

## 1. Executive Summary

The **Influence Ledger** is a record-keeping model designed to track the contribution of various actors—both human and system-based—to a specific business outcome. While *Attribution* (LIVE-005) focuses on the "what," the *Influence Ledger* focuses on the **"who."**

**Final Principle**: Forge should measure contribution, not take credit.

---

## 2. Influence Model (Actors)

Forge recognizes that outcomes are rarely the result of a single isolated act. The ledger tracks contributions from the following actors:

| Actor | Category | Description |
| :--- | :--- | :--- |
| **Advisor** | Human | The primary executor of the action. |
| **Manager** | Human | Contributes through coaching, accountability, and strategy. |
| **Referrer** | Human | The source of the lead or referral. |
| **Client/Prospect** | Human | The decision-maker whose behavior changed. |
| **NASH** | System | Forge's intelligence layer (Recommendations, Insights). |
| **Campaign** | System | Automated outreach or marketing initiatives. |
| **Carrier** | External | Changes in product, price, or policy from the insurer. |
| **External Event** | Contextual | Market shifts, tax law changes, or life events. |

---

## 3. Weighting Strategies

Influence is not binary; it is weighted. Forge employs three primary strategies to distribute influence:

### 3.1 Proportional Weighting (Static)
Used for well-defined processes like Referrals.
*   Example: Referrer (40%), Advisor (50%), NASH Prompt (10%).

### 3.2 Evidence-Based Weighting (Dynamic)
Weights are adjusted based on the strength of the attribution level (from LIVE-005).
*   If NASH was Level 4 (Strong Attribution), its weight increases.
*   If the Manager logged a coaching session 1 hour before the Advisor action, the Manager's weight increases.

### 3.3 Contribution Decay
The influence of a suggestion or coaching session decreases as the time-to-outcome increases.

---

## 4. Conflict Resolution

When multiple actors claim influence over the same outcome:
*   **Hierarchical Priority**: Human action (Advisor) generally takes precedence over system prompts (NASH) unless specific behavioral telemetry (Level 4) proves otherwise.
*   **Normalized Sum**: The total influence must always equal 100%. If a new actor is added, existing weights are proportionally reduced.

---

## 5. Human Override & Auditability

The Influence Ledger is transparent and adjustable.

*   **Adjustment**: Advisors or Managers can manually adjust weights (e.g., "Actually, the Referrer did 90% of the work here").
*   **Ledger Entries**: Every outcome generates a ledger entry explaining the *Why* behind the weights.
    *   *Entry Ex: "NASH weight (20%) due to Level 2 click-to-activity match. Manager weight (30%) due to recent Coaching session on this topic."*

---

## 6. Risks & Open Questions

### 6.1 Risks
*   **System Bias**: Forge over-valuing its own recommendations to "prove" its worth.
*   **Double Counting**: Counting the same influence across multiple actors (e.g., Manager coaching the Advisor to follow a NASH prompt).
*   **Perceived Micromanagement**: Humans may feel "devalued" if a system claims 30% influence on their sale.

### 6.2 Open Questions
*   How should "Influence" translate into "Recognition" or "Incentives"?
*   Can an External Event (e.g., a stock market crash) claim 100% influence?

---

## 7. Status
**DISCOVERY COMPLETE**
*Ready for implementation of the Ledger Schema and Weighting Engine.*

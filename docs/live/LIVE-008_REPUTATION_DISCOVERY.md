# LIVE-008_REPUTATION_DISCOVERY

## 1. Executive Summary

**Reputation** in Forge OS is the collective memory of an actor's reliability as observed across the entire network over time. While *Trust* (LIVE-007) is relationship-specific and local, *Reputation* is the aggregated evidence of performance and integrity that informs system and human expectations at scale.

**Final Principle**: Reputation is collective memory. Forge should preserve fairness, not permanence.

---

## 2. Definitions & Principles

### 2.1 Definitions
*   **Trust**: Local and specific (e.g., "Do I trust this advisor with *this* client?").
*   **Reputation**: Global and aggregated (e.g., "What is the network-observed reliability of this advisor across *all* clients and commitments?").

### 2.2 Principles
*   **Reputation Emerges from Evidence**: It is a derived state, not a direct input.
*   **Decay by Design**: Old evidence loses weight; reputation reflects recent behavior.
*   **Contextual Partitioning**: A high reputation for "Sales Velocity" does not imply a high reputation for "Compliance."
*   **Transparency**: No "hidden scores." Every actor can see and challenge their reputation record.
*   **No Automated Penalties**: Reputation cannot directly trigger compensation changes or account blocks without human intervention.

---

## 3. Reputation Domains

| Domain | Observed Reliability Focus |
| :--- | :--- |
| **Advisor** | Predictability of outcomes, policy persistency, and commitment fulfillment. |
| **Manager** | Accuracy of coaching insights and stability of team growth metrics. |
| **Carrier** | Reliability of claims processing, product competitiveness, and administrative support. |
| **Campaign** | Conversion quality and long-term value of generated leads. |
| **NASH** | Historic accuracy of recommendations across the entire user base. |
| **Agency** | Aggregate stability and ethical standards of the local organization. |

---

## 4. Evidence Sources

Reputation is synthesized from the following streams:
*   **Outcome History**: (LIVE-004) Success rates of recommended actions.
*   **Commitment Consistency**: Ratio of honored vs. broken promises in the CRM.
*   **Trust Velocity**: Rate at which trust is earned or eroded in local relationships.
*   **Persistency**: Long-term retention of clients (specific to Advisors and Carriers).
*   **Ethical Markers**: Adherence to documented guardrails and carrier rules.

---

## 5. Recovery Model (The Path Back)

Reputation must never be a permanent label. Forge provides explicit mechanisms for reputation recovery:

*   **Time**: Negative evidence decays faster than positive evidence when behavior improves.
*   **Outcomes**: A sustained "streak" of positive outcomes (Level 3/4 Attribution) overrides historical failures.
*   **Coaching & Transparency**: Completing recommended coaching sessions and acknowledging overrides provides a path to state-reset.
*   **Redemption Windows**: Specific periods where high performance results in accelerated reputation gain.

---

## 6. Safeguards

*   **Anti-Blacklisting**: Forge must never maintain hidden "don't work with" lists based on reputation.
*   **Human-in-the-Loop**: Any action that limits an actor's opportunity based on reputation must require a human manager's review.
*   **Explainable Evidence**: "Your reputation in X is Low *because* of these 3 specific broken commitments," not "The algorithm says so."
*   **Irreversibility Ban**: No actor can be assigned a permanent "Bad" label that cannot be recovered through evidence-based behavioral change.

---

## 7. Risks & Open Questions

### 7.1 Risks
*   **The "Matthew Effect"**: Actors with high reputations receiving all the best opportunities, preventing others from earning theirs.
*   **Data Poisoning**: Actors colluding to "fake" positive outcomes to inflate reputation.
*   **Context Leakage**: A bad experience in one carrier-specific rule pack unfairly affecting an advisor's global reputation.

### 7.2 Open Questions
*   How should reputation "Transfer" when an advisor moves between agencies?
*   Should "Carrier Reputation" be shared across the entire Forge network or restricted to a specific user group?

---

## 8. Status
**DISCOVERY COMPLETE**
*Ready to define the Network Memory Schema.*

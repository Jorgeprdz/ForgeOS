# RUSSELL-002: IDENTITY DRIFT DETECTION

**STATUS:** ARCHITECTURE DISCOVERY / NO IMPLEMENTATION  
**DATE:** June 10, 2026  
**DOMAIN:** Communication Identity Intelligence (Russell)

---

## 1. PURPOSE
**Identity Drift** is the measurable distance between a suggested message and the user's **Identity Baseline**. High drift signals an "Uncanny Valley" effect where the advisor sounds like a bot, a corporation, or someone else—destroying trust.

## 2. MEASUREMENT OF DRIFT

Drift is calculated by comparing a Nash Recommendation (Strategic Draft) against the Russell Baseline (Authentic Style).

| Level | Drift Score | Meaning |
| :--- | :--- | :--- |
| **Low** | 0.0 - 0.2 | The message sounds exactly like the advisor. Minimal polish needed. |
| **Medium** | 0.3 - 0.6 | The strategy is correct, but the vocabulary/tone feels "Borrowed." |
| **High** | 0.7 - 1.0 | **"Identity Mismatch."** The message is strategically sound but humanly incredible. |

## 3. SIGNALS OF DRIFT
- **Vocabulary Mismatch:** Use of words never found in the user's history (e.g., "Furthermore" vs. "Also").
- **Syntax Collision:** Excessive complex sentences for a user who typically writes in short bursts.
- **Emotional Dissonance:** A message that is too warm/formal for the established relationship history.
- **Pacing Conflict:** A single 200-word paragraph for a user who typically sends 4-5 short messages.

## 4. INTERACTION MODEL: NASH VS. RUSSELL

**The Flow:**
1.  **Nash (The Brain):** "Strategically, you must ask for the P200 update now to ensure closing." (Strategy)
2.  **Russell (The Voice):** "But you never say 'ensure closing'. You usually say 'para que no se nos escape nada'. Rewriting..." (Authenticity)

## 5. RECOMMENDED ACTIONS

- **Transparent Pass:** No action. The Nash draft is within the 0.2 drift threshold.
- **Linguistic Polish:** Minor vocabulary swaps (e.g., changing "Optimal" to "Mejor").
- **Identity Rewrite:** Complete reconstruction of the Nash strategy using the Baseline syntax.
- **Veto/Alert:** Warning the advisor: *"This message sounds very corporate. It might feel weird to your client."*

## 6. METRICS

- **Authenticity Score:** Percentage of recommended actions that were sent without user modification.
- **Adoption Probability:** Predicting if the user will ignore a recommendation because it "doesn't sound like them."
- **Drift Frequency:** Identifying which Nash strategies are most difficult to translate into authentic voices.

---
**Status: Architecture Discovery**

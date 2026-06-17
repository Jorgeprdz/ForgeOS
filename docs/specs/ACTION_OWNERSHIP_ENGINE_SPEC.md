# Action Ownership Detection Engine Specification

Status: AUTHORIZED
Date: 2026-06-17
Version: 0.1

---

## 1. Purpose
The Action Ownership Detection Engine determines the current owner of the next action in a process. It is a fundamental component of the Process Intelligence layer, adhering to the principle that "Ownership precedes Waiting."

## 2. Core Principles
- **Ownership Precedes Waiting:** Action ownership is determined before classifying waiting states.
- **Advisor owns the process:** The advisor is responsible for moving the process forward.
- **Prospect owns the decision:** The prospect is responsible for the final commitment.
- **Evidence-First:** Ownership assignments must be supported by evidence (commitments, dependencies, explicit statements).
- **Human Accountability:** The system recommends owners; the human advisor retains final decision-making power and accountability.

## 3. Ownership States
The engine supports the following owners:
- `advisor`
- `prospect`
- `client`
- `referrer`
- `manager`
- `carrier`
- `underwriter`
- `external_event`
- `unknown`

## 4. Evidence & Confidence
Each ownership assignment is calculated with:
- **Evidence Used:** The specific events/commitments supporting the assignment.
- **Ownership Confidence (0.0 - 1.0):** Based on the clarity of commitment, expiration of previous actions, and source authority.

## 5. Engine Interactions
- **Waiting State Engine:** Consumes the output of this engine. If ownership is assigned to `prospect`, `carrier`, or `underwriter`, this engine recommends a `waiting` state to the Waiting State Engine.
- **Process Advancement Engine:** Uses ownership data to calculate advancement metrics and stagnation risk.

## 6. Logic & Rules
- **Ambiguity/Unknown:** If no clear commitment or dependency is identified, the owner defaults to `unknown`, and the system prompts the advisor for clarification.
- **Contradictions:** If evidence suggests multiple owners, both are reported with their respective confidence scores, flagged for human review.
- **Override:** The advisor can manually reassign ownership. Such overrides are recorded as new events, preserving the original extraction history.
- **Transitions:** Ownership transitions occur based on new `commitment_established`, `document_received`, or `payment_received` events.

## 7. Engine Output Schema
For each event processed, the engine outputs:
```json
{
  "currentOwner": "string",
  "ownershipConfidence": "float",
  "evidenceUsed": ["uuid"],
  "waitingStateRecommendation": "string|null",
  "nextReviewDate": "iso8601|null"
}
```

## 8. Validation Examples (from Corpus)

### Case: Lariza Pedro Camarena (Active Discovery)
- **Input:** Advisor note regarding financial risk.
- **Extracted Owner:** `advisor`
- **Reasoning:** Advisor needs to refine proposal to match prospect's risk-tolerance.
- **Waiting State:** None.

### Case: Marlene (Follow-up)
- **Input:** "I'll look at it and call you by Friday."
- **Extracted Owner:** `prospect`
- **Reasoning:** Prospect committed to review and follow-up.
- **Waiting State:** `waiting_prospect`
- **Next Review Date:** 2026-06-20 (Post-Friday)

### Case: Ricardo Mejía (Underwriting)
- **Input:** Medical exam scheduled for Tuesday.
- **Extracted Owner:** `prospect` (to attend exam)
- **Reasoning:** Commitment established for external dependency.
- **Waiting State:** `waiting_external_event`

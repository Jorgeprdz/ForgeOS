# Commitment Quality Specification for Forge Alpha v0.1

Status: AUTHORIZED
Date: 2026-06-17
Version: 0.1

## 1. Purpose
Define semantic quality levels for `commitment_established` events to enable more nuanced forecast confidence, waiting state management, and process advancement assessment.

## 2. Commitment Quality Levels
- **STRONG:** High conviction, actionable commitment.
- **MEDIUM:** Defined action, but lacking a firm deadline.
- **WEAK:** Ambiguous action, vague intent, or unclear commitment.

## 3. Deterministic Criteria

| Quality Level | Criteria | Example |
| :--- | :--- | :--- |
| **STRONG** | Explicit action, Explicit owner, Explicit timeframe | "Te llamo el viernes." |
| **MEDIUM** | Explicit action, Explicit owner, No timeframe | "Lo reviso y te aviso." |
| **WEAK** | Ambiguous action OR No timeframe AND Vague wording | "Lo veo y luego hablamos." |

## 4. Impact on Intelligence Engines
- **Forecast Confidence:** STRONG commitments increase forecast confidence; WEAK commitments add risk buffer.
- **Waiting State Recommendations:** STRONG commitments trigger definitive `waiting` states; WEAK commitments may trigger "Action Required" prompts to Advisor.
- **Process Advancement Confidence:** Advancement score is weighted: STRONG (1.0), MEDIUM (0.5), WEAK (0.1).

## 5. Recommendation Examples
- **STRONG:** "Valid commitment detected."
- **MEDIUM:** "Commitment detected without timeframe."
- **WEAK:** "Commitment is ambiguous. Consider establishing a specific next step."

## 6. Schema Extension
The `commitment_established` event data will include a `quality` field:
```json
{
  "type": "commitment_established",
  "data": {
    "owner": "prospect",
    "due": "2026-06-19",
    "description": "...",
    "quality": "strong"
  }
}
```

## 7. Analysis on Judgment Augmentation
**Does commitment quality improve judgment augmentation without increasing manipulation risk?**

Yes. It improves judgment augmentation by providing the advisor with higher-fidelity insights, allowing them to distinguish between promising leads and stalled opportunities. It mitigates manipulation risk because it relies purely on deterministic analysis of explicit linguistic markers (as defined in `EventExtractionEngine`) rather than hidden behavioral profiling. It exposes ambiguity to the advisor, ensuring they maintain accountability and control over the next interaction, keeping the human advisor at the center of the decision process.

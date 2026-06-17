# Event Extraction Engine Specification

Status: AUTHORIZED
Date: 2026-06-17
Version: 0.1

---

## 1. Purpose
The Event Extraction Engine is the entry point for unstructured data into the Forge OS. Its primary purpose is to transform free-text advisor notes and observations into structured, canonical events for the Event Ledger. It acts as the bridge between human-recorded context and machine-understandable system intelligence.

## 2. Extraction Pipeline
The engine follows a strict linear pipeline:
1. **Ingestion:** Receives raw text input (advisor note, system log, or external message).
2. **Contextualization:** Attaches metadata (timestamp, actor, related opportunity, related contact).
3. **Analysis:** Performs NLP-based extraction to identify:
    - Potential events
    - Evidence markers
    - Explicit commitments
    - Unknowns or ambiguities
    - Contradictions
4. **Validation:** Checks extracted data against existing truth/state (as provided by the Truth Resolution Engine).
5. **Event Emission:** Produces one or more canonical events conforming to the `EVENT_LEDGER_SPEC.md` schema.

## 3. Core Principles
- **Preserve Raw Context:** The original free-text note is stored alongside the extracted events to ensure full auditability.
- **Evidence-First:** Only explicit statements or observed actions are extracted.
- **Never Invent Facts:** If information is missing, the engine MUST mark it as unknown rather than inferring it.
- **Human Accountability:** The advisor retains the ability to override or correct any extraction.
- **Preserve Contradictions:** Conflicting statements are captured as separate evidence-based events, allowing the Truth Resolution Engine to handle them.

## 4. Supported Event Types
- `conversation_occurred`
- `message_sent`
- `message_received`
- `commitment_established`
- `meeting_scheduled`
- `proposal_sent`
- `document_received`
- `payment_received`
- `no_response_detected`

## 5. Confidence & Evidence Model
Every extraction must include:
- `evidenceConfidence`: (0.0 to 1.0) High confidence for explicit, unambiguous statements; Low for inferred or ambiguous inputs.
- `evidenceSource`: The textual segment or observation that triggered the extraction.

## 6. Handling Edge Cases
- **Unknowns:** If the input lacks critical data (e.g., meeting date), the engine emits an event with an `unknown` field for the missing attribute.
- **Contradictions:** If two notes suggest different realities (e.g., Prospect says "I am interested" vs "Not interested"), the engine emits both, flagged for the Truth Resolution Engine to adjudicate.
- **Privacy Boundaries:** The engine MUST scrub PII/Sensitive data as per the `Identity & Consent Engine` rules BEFORE persisting the extracted events to the ledger.

## 7. Output Schema
```json
{
  "rawInput": "string",
  "extractedEvents": [
    {
      "type": "string",
      "data": "object",
      "evidenceConfidence": "float",
      "evidenceSource": "string"
    }
  ],
  "metadata": {
    "timestamp": "iso8601",
    "actor": "string"
  }
}
```

## 8. Example Extraction
**Input:** "Marlene said she will review the proposal and call me back by Friday."

**Extraction Output:**
```json
{
  "rawInput": "Marlene said she will review the proposal and call me back by Friday.",
  "extractedEvents": [
    {
      "type": "commitment_established",
      "data": {
        "action": "review_proposal",
        "deadline": "2026-06-19"
      },
      "evidenceConfidence": 0.8,
      "evidenceSource": "Marlene said she will review the proposal and call me back by Friday."
    }
  ]
}
```

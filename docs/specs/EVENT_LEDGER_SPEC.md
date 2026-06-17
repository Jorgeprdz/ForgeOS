# Forge Alpha v0.1 Event Ledger Specification

Status: AUTHORIZED
Date: 2026-06-17
Version: 0.1

---

## 1. Purpose
The Event Ledger serves as the canonical, immutable, and append-only log of all interactions and observations within Forge OS. It acts as the foundational evidence layer from which all system intelligence is derived.

## 2. Why Event Ledger exists
Forge OS utilizes an event-driven architecture. The Event Ledger decouples raw data collection (observations) from the analytical processing (engines). This separation ensures transparency, allows for consistent truth resolution across multiple engines, preserves auditability, and enforces the "Human Accountability" principle by ensuring all inferences can be traced back to the original evidence.

## 3. Event Principles
- **Immutability:** Events are never modified or deleted. Corrections or updates are registered as new events.
- **Traceability:** Every state transition in Forge can be traced back to a specific set of events.
- **Evidence-First:** Events represent what occurred. They are prioritized over interpretations.
- **Human-Centric:** All events are recorded in a manner that respects privacy, consent, and the dignity of the humans involved.
- **Privacy-by-Design:** Sensitive data is minimized at the point of ingestion and governed by strict privacy policies.

## 4. Minimal Event Schema
Every event MUST conform to the following schema:

```json
{
  "id": "uuid",
  "timestamp": "iso8601",
  "type": "string",
  "source": "system|user|integration",
  "actor": "string",
  "context": {
    "opportunityId": "uuid",
    "contactId": "uuid"
  },
  "data": "object",
  "evidenceConfidence": "float",
  "privacyTag": "public|restricted|private"
}
```

## 5. Source Authority
The `source` field defines the authority of the event:
- **User:** Direct input from the human advisor (Highest confidence).
- **System:** Detected by internal engines (e.g., waiting state detection).
- **Integration:** Data imported from external systems (e.g., carrier status, CRM events).

## 6. Evidence Confidence
Confidence reflects the reliability of the event data (0.0 to 1.0).
- Human-entered events are typically 1.0.
- System-inferred events are assigned a confidence score based on the `Truth Resolution Engine` assessment.

## 7. Event Types for Forge Alpha v0.1
- `interaction.note.captured`: A raw note from a conversation.
- `commitment.micro.detected`: A verified, small commitment.
- `ownership.detected`: Action ownership established.
- `state.waiting.detected`: System transition to a waiting state.
- `action.suggested`: Engine-generated recommendation for an action.

## 8. Capture Once → Infer Many Rule
Raw observations are captured exactly once into the Event Ledger. All downstream analytical engines (Truth, Trust, Relationship, Process) consume this canonical event feed asynchronously to update their respective states. This prevents data duplication and ensuring engine consistency.

## 9. Privacy Boundaries
- **PII Stripping:** PII must be minimized in events.
- **Identity Boundary:** Identity is separated from analytical events wherever possible, as per the Identity & Consent Engine.
- **Consent Enforcement:** Events involving sensitive data (e.g., life events) MUST include metadata verifying that the appropriate consent was obtained.

## 10. Traceability Rules
- No event is ever physically deleted.
- "Deletion" in the UI is achieved via a `correction` event that voids the original, while retaining historical visibility for auditing purposes.
- The Event Ledger maintains an append-only structure.

## 11. How events feed the runtime
1. **Ingestion:** An event is written to the Ledger.
2. **Resolution:** The `Truth Resolution Engine` consumes the event, validates it, and updates canonical truth.
3. **Inference:** Downstream engines (Process, Trust, etc.) independently consume the updated truth and update their state.
4. **Recommendation:** State changes trigger recommendation engines, which output suggestions for human review.
5. **Decision:** Humans review recommendations and act, generating new events.

## 12. Example Events
### Interaction Note
```json
{
  "type": "interaction.note.captured",
  "source": "user",
  "data": { "content": "Prospect mentioned they need policy by Friday." }
}
```

### Micro-commitment
```json
{
  "type": "commitment.micro.detected",
  "source": "system",
  "data": { "agreement": "Send proposal", "deadline": "2026-06-19" }
}
```

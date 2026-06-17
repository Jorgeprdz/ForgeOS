# Forge Alpha Event Corpus

Status: AUTHORIZED
Phase: Validation
Date: 2026-06-17

---

## 1. Purpose
This corpus validates the `EVENT_LEDGER_SPEC.md` against real-world advisor scenarios. It tests event extraction, evidence classification, ownership, waiting states, micro-commitments, and next-action recommendations.

---

## 2. Validation Cases

### Case: Lariza Pedro Camarena
Date: 2026-06-17
Context: Initial GMM (Gastos Médicos Mayores) discovery.

Raw Note: "Lariza is young, healthy, and worried about financial risk. She wants to know what part of the risk she can carry herself. She travels domestically."

Extracted Events:
- `interaction.note.captured` (Raw conversation note)
- `evidence.need.identified` (Young, healthy, financial risk concern)
- `evidence.preference.identified` (Travels domestically)

Evidence:
- Prospect: Young (verified)
- Prospect: Healthy (verified)
- Prospect: Concerned about financial risk (stated need)
- Prospect: Travels domestically (verified preference)

Evidence Confidence:
- High

Owner: Advisor (Need to refine proposal)

Waiting State: None (Active Discovery)

Micro-Commitments: None yet.

Expected Forge Output:
- Update Truth: Young, healthy, risk-conscious.
- Recommendation: Propose GMM with customizable deductible based on travel.

Human Ground Truth:
- Advisor should explore specific travel frequency and hospital preference.

Open Questions:
- Frequency of travel?
- Specific hospitals of preference?
- Financial savings comfort level?

Unknowns:
- Family support availability.
- Maternity planning.

Contradictions:
- None.

Stale Data:
- None.

Validation Criteria: Can Forge correctly represent reality?
YES

---

### Case: Marlene (Representative Scenario)
Date: 2026-06-17
Context: Follow-up on proposal.

Raw Note: "Sent proposal last week. Marlene said: 'I'll look at it and call you by Friday'."

Extracted Events:
- `interaction.note.captured` (Follow-up note)
- `proposal.sent` (System event)
- `commitment.micro.potential` (Wait until Friday)

Evidence:
- Prospect stated: 'I'll look at it and call you by Friday'.

Evidence Confidence:
- Medium (Stated intention vs. signed commitment)

Owner: Prospect

Waiting State: Waiting for prospect response.

Micro-Commitments: None confirmed (Open loop).

Expected Forge Output:
- Mark as Waiting: Prospect.
- Set reminder: Review if call received by Friday.
- Coaching Prompt: 'Prospect intention stated; re-verify if call not received by Friday.'

Human Ground Truth:
- Advisor must follow up if Friday passes without contact.

Open Questions:
- Is this a clear micro-commitment? (No, it's an open loop)

Unknowns:
- If she actually opened it.

Contradictions:
- None.

Stale Data:
- None.

Validation Criteria: Can Forge correctly represent reality?
YES

---

### Case: Ricardo Mejía (Representative Scenario)
Date: 2026-06-17
Context: Underwriting dependency.

Raw Note: "Carrier requires additional medical exam. Scheduled for next Tuesday."

Extracted Events:
- `interaction.note.captured`
- `dependency.underwriting.exam.required`
- `dependency.scheduled` (Tuesday)

Evidence:
- Carrier requirement stated by advisor.

Evidence Confidence:
- High

Owner: Prospect (To attend exam)

Waiting State: Waiting for medical exam (External Dependency).

Micro-Commitments: Attend exam Tuesday.

Expected Forge Output:
- Update Dependency Graph: Underwriting exam (Ricardo, Tuesday).
- Mark as Waiting: External Dependency (Medical Exam).
- Trigger: Next action = Confirm exam attendance post-Tuesday.

Human Ground Truth:
- Advisor must ensure exam happens.

Open Questions:
- None.

Unknowns:
- Exam result.

Contradictions:
- None.

Stale Data:
- None.

Validation Criteria: Can Forge correctly represent reality?
YES

---

## 3. Validation Summary
The cases validate that the Event Ledger can handle various states (active, waiting, dependency) and trace them back to raw events while supporting the "Capture Once → Infer Many" rule. The distinction between owner and waiting state is critical for accurate process modeling.

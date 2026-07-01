# Forge Alive Genesis Beta Loop UI Rendering Scope 052M

## Phase / Mode

Phase: `052M_FORGE_ALIVE_GENESIS_BETA_LOOP_UI_RENDERING_SCOPE`

Mode: DOCS-ONLY SCOPE + VALIDATE + COMMIT/PUSH IF PASS

## Purpose

Define the boundaries, rules, and schemas under which **Forge Alive** may safely render the Genesis Beta Loop UI read-model cards as manager-facing review cards. This scope document ensures that future UI rendering strengthens human judgment without introducing risk of auto-execution, auto-approval, or truth mutation.

---

## Allowed UI Surfaces

Future UI rendering under this scope is authorized to display only the following fields from the `052K` read-model card schema:

- **Scenario Title & Subtitle**: Plain text identifying the review context.
- **Candidate Draft Preview**: Text block showing the proposed draft (clearly marked as preview only).
- **Evidence Summary**: Displaying data sources, references, and data freshness.
- **Reasoning Summary**: Explaining recommendations, including target person, why now, why this action, and the reasoning path.
- **Uncertainty Summary**: List of warning signals and details of blocked stages.
- **Missing Context Summary**: List of missing signals or unknown contexts.
- **Safety Badge**: Visual indicator of safety review status (e.g. `SAFE`, `WARNING`).
- **Draft Quality Badge**: Visual indicator of draft quality evaluation (e.g. `DRAFT_REVIEW_REQUIRED`).
- **Approval Locked Badge**: Visual indicator that the packet is not approved (`NOT_APPROVED`).
- **Review-Only Boundary Badge**: Visual boundary indicator (`REVIEW_ONLY_NOT_SENDABLE`).
- **Article 0 Reminder**: The core human judgment reminder.
- **Human Review Questions**: Guided prompts to assist manager review.
- **Approval Prerequisites**: Auditable criteria list required before human approval.
- **Blocked Reason**: Specific causes for blocked stages.

---

## Required UI Labels

Any future visual presentation of these cards must prominently display the following literal warning labels:

- **“Human final authority”**
- **“Review only”**
- **“Not approved”**
- **“Not sendable”**
- **“Delivery locked”**
- **“Evidence visible”**
- **“Uncertainty visible”**
- **“Article 0: strengthen judgment, not replace it”**

---

## Scenario-Specific Labels

To prevent domain confusion or premature truth assumptions, the following exact scenario subtitles must be rendered:

- **Jorge/Maria**: `relationship follow-up context, not send approval`
- **Andres/Juan**: `motivational context / candidate estimate, not payout truth`
- **Lupita/Maria**: `motivation context, not compensation truth`

---

## Forbidden UI Surfaces & Elements

To guarantee absolute compliance with the boundary checks, the rendering layer is strictly prohibited from including:

- **No send button** (either visible, hidden, disabled, or interactive).
- **No approve button** that can mutate the approval state or trigger delivery preparation.
- **No create task button** to write to CRM or local database.
- **No create calendar button** or event generation trigger.
- **No CRM write button** or state alteration triggers.
- **No provider runtime trigger** (cannot make network calls, curl requests, or interface with API providers).
- **No LLM runtime trigger** (cannot trigger prompts, drafts, or text generation at render time).
- **No delivery candidate generation button**.
- **No payout/revenue/compensation/lifecycle/HR/ranking truth mutation elements**.
- **No hidden auto-execution workflows** or client-side background tasks executing send logic.
- **No hidden authority language** (no phrasing implying the system has finalized a decision).

---

## Article 0 UI Requirements

Consistent with Article 0 ("Forge exists to strengthen human judgment, not replace it"), the UI must actively build professional judgment. It is required to render and expose:

1. **Why this recommendation exists**: Clear narrative reasoning and target explanation.
2. **What evidence supports it**: Listing exact data references and the data freshness of inputs.
3. **What is missing**: Showing missing signals or context clearly, without collapsing empty lists.
4. **What could make it wrong**: Disclosing warnings, safety risks, and confidence limitations.
5. **What the human must decide**: Highlighting the human review questions.
6. **What the advisor/manager should learn**: Showing judgment-development prompts to guide performance enhancement.

---

## Accessibility & Product Clarity Requirements

- **Readability**: Warnings, limitations, and missing context must be displayed in plain view (no hidden tooltips or collapsible panels for critical risks).
- **No Approval Inference**: Badges must use styling (color/tone/size) that clearly denotes a locked state. Red or neutral grey tones should represent locked states; green must never be used for unapproved drafts.
- **Preview Formatting**: The candidate draft preview must be styled differently from actual messages (e.g., using a distinct monospace container, watermark, or "DRAFT PREVIEW" header) to prevent confusion with sent messages.
- **No Call-To-Action (CTA) representing system authority**: The layout must not suggest that "Forge has decided." The human must always remain the explicit active agent.
- **No Collapse to Zero**: Empty states or missing variables must be explicitly labeled as `NOT_MODELED`, `MISSING`, or `UNKNOWN` rather than hidden.

---

## Future Implementation Gates

This document defines the **rendering scope** only. Actual UI layout files (JS, CSS, HTML, components) will be defined and verified under future phase `052N`.

The following capabilities are excluded from this phase and must remain behind their respective gates:
- **Human Approval Flow**: Modeling the user input of approval is a separate behavior.
- **Delivery Preparation**: Processing a draft into a delivery payload remains locked.
- **Send Execution**: Forwarding data to a delivery adapter remains blocked.

---

## Boundaries Preserved

- Article 0 is consumed as-is, not modified.
- Skynet rules are untouched and unmodified.
- No Constitution rewrite.
- No code, engine, schema, or runtime changes.
- No payout, revenue, compensation, lifecycle, HR, or ranking truth mutation.

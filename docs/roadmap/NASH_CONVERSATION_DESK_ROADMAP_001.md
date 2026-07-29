# Nash Conversation Desk Roadmap 001

**Product goal:** Forge receives a message, objection, complete conversation, or screenshot; understands what is happening; explains the diagnosis; prepares an appropriate response; validates it; and leaves the advisor in control of copying or opening WhatsApp.

## Product rules

- The redesign may change appearance, not remove functionality.
- Conversation intelligence is assistance, not certainty.
- Forge may infer candidate intent but must show uncertainty and evidence.
- No message is sent automatically.
- The advisor approves every final message.
- Product claims require product/version source truth.
- Activity records what happened after the advisor confirms it.
- The old Nash master runtimes remain frozen.

---

## Milestone 0 — Freeze and foundation

### What changes

- Freeze obsolete Nash engines.
- Prevent new imports.
- Establish reusable-engine matrix.
- Define the new Conversation Desk as an independent product surface.

### What the user sees

Nothing new yet. This milestone removes technical clutter so future work does not revive the wrong engines.

### Done when

- Frozen registry exists.
- Content hashes pass.
- No new production imports pass.
- Roadmap is committed and pushed.

---

## Milestone 1 — Text Conversation Desk MVP

### What changes

Create the first usable desk with a WhatsApp-style composer:

- one multiline message field;
- type directly;
- paste a single objection, message, or full conversation;
- paperclip button to select and upload one screenshot;
- drag-and-drop screenshot support on desktop;
- image preview with remove/replace control;
- optional prospect selection;
- explicit Analyze button;
- clear/reset control;
- Enter creates a new line; analysis never starts accidentally.

### What the user sees

Forge returns:

- what type of situation it appears to be;
- what information is missing;
- candidate intention;
- recommended strategy;
- what not to answer;
- one useful question;
- one response ready to copy.

### Initial supported situations

- First contact.
- Follow-up.
- Reactivation.
- Appointment confirmation.
- Post-appointment.
- Objection.
- Closing.
- Referral/introduction.

### Done when

A pasted text produces a reviewable diagnosis and message without writing to WhatsApp, Calendar, Pipeline, or Activity.

---

## Milestone 2 — Objection Intelligence and Sienten–Sintieron–Descubrieron

### What changes

- Consolidate Nash intent and combat logic.
- Separate visible objection from probable underlying friction.
- Implement the Sienten–Sintieron–Descubrieron framework.
- Add safeguards so the method does not sound formulaic or manipulative.
- Ask for context when confidence is insufficient.

### What the user sees

For each objection:

- visible objection;
- probable type;
- probable intent;
- confidence;
- why Forge thinks that;
- recommended method;
- Sienten–Sintieron–Descubrieron version when appropriate;
- direct alternative when it is not appropriate;
- final WhatsApp response.

### Required objection coverage

- No tengo dinero.
- Está caro.
- Lo voy a pensar.
- Lo veo con mi pareja.
- Ya tengo seguro.
- Ya tengo asesor.
- Mándame información.
- No tengo tiempo.
- No es buen momento.
- No confío.
- Después lo revisamos.
- No conozco referidos.
- Primero pregunto si quieren que les llames.

### Done when

The Desk distinguishes price from real budget, delay from uncertainty, and third-party approval from rejection.

---

## Milestone 3 — Complete message-purpose router

### What changes

Forge determines the communication purpose before drafting.

### Required purposes

- Acercamiento.
- Seguimiento.
- Reactivación.
- Confirmación de cita.
- Recordatorio.
- Después de cita.
- Objeción.
- Cierre.
- Cobranza.
- Conservación.
- Renovación.
- Felicitación.
- Evento de vida.
- Presentación.
- Referido.
- Solicitud de documentos.
- Servicio al cliente.
- Entrega de información.
- Recuperación de ghosting.

### Context used

- Relationship.
- Source/referrer.
- Pipeline stage.
- Last contact.
- Product/version.
- Previous objection.
- Advisor tone.
- Communication channel.

### What the user sees

Forge explains:

> “Este no es un mensaje de cierre; es una reactivación de baja presión.”

Then prepares the corresponding message.

### Done when

Each purpose has its own context requirements, safety rules, prompt, and acceptance tests.

---

## Milestone 4 — Advanced conversation and screenshot intake

### What changes

Milestone 1 already accepts text and one screenshot. This milestone expands the intake to:

- multiple screenshots;
- automatic ordering;
- long conversation reconstruction;
- separate advisor and prospect messages;
- preserve chronology;
- allow manual correction;
- detect the latest unanswered point;
- support pasted conversation exports;
- detect repeated or missing screenshots.

### What the user sees

The screenshot becomes an editable conversation. Forge highlights:

- the last prospect message;
- unresolved questions;
- objections;
- commitments;
- dates;
- mentioned products;
- suggested response.

### Safety

- Do not analyze hidden content.
- Do not invent cropped messages.
- Mark unreadable text.
- Require user correction when speaker identity is uncertain.

### Done when

A real WhatsApp screenshot can become a corrected, reviewable conversation without silently guessing missing text.

---

## Milestone 5 — Prospect, relationship, and product context

### What changes

Connect the Desk to:

- prospect detail;
- relationship timeline;
- governed activity;
- appointments;
- quotes and presentations;
- verified product knowledge;
- previous approved messages.

### What the user sees

The response changes appropriately based on:

- who the person is;
- how they know the advisor;
- what happened before;
- which product/version is involved;
- whether there is a pending commitment.

### Done when

The same objection from two different prospects can produce different, explainable responses.

---

## Milestone 6 — Draft approval and WhatsApp handoff

### What changes

- Draft versions.
- Edit field.
- Safety results.
- Human approval.
- Copy button.
- Open WhatsApp with approved text.
- No automatic send.
- No false sent confirmation.

### What the user sees

A simple sequence:

1. Review.
2. Edit.
3. Approve.
4. Copy or open WhatsApp.
5. Confirm whether it was actually sent.

### Done when

Only approved text can reach the WhatsApp handoff, and opening WhatsApp is never treated as sending.

---

## Milestone 7 — Outcome capture and improvement

### What changes

After the conversation, capture:

- sent/not sent;
- response/no response;
- appointment accepted;
- objection changed;
- conversation paused;
- closed/lost;
- advisor feedback on the recommendation.

### What the user sees

Forge improves recommendations using evidence without claiming that correlation is certainty.

### Done when

Learning uses confirmed outcomes, preserves privacy, and cannot rank or punish advisors.

---

# Delivery order

```text
Freeze
→ Text Desk MVP
→ Objections + Sienten/Sintieron/Descubrieron
→ Complete purpose router
→ Screenshot intake
→ Prospect/product context
→ Approval + WhatsApp handoff
→ Outcome learning
```

# First visible release

The first release must arrive at Milestone 1. It should not wait for screenshots, full redesign, WhatsApp integration, or learning.

The minimum useful product is:

> Type or paste what they said, or attach one screenshot → confirm the extracted text → understand it → receive a response ready to copy.

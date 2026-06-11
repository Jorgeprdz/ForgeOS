# FORGE Benvenù Leopard Experience Spec

Internal concept: Leopard Experience

Status: LOCKED CONCEPT / UX SPEC / NOT IMPLEMENTED

## 1. Executive Summary

Leopard Experience is Act 1 of Benvenù.

It is the first moment an advisor experiences when entering Forge. It is not a
dashboard, not a CRM, not a tutorial and not a form.

Its job is emotional and directional:

- Signal that Forge is not another CRM.
- Show vision before asking for work.
- Make Forge feel like a career operating system.
- Prepare the advisor for The Future You Conversation.

Leopard Experience is an internal reference name only. The final advisor-facing
experience must not mention or imitate any external operating system, company,
brand, visual identity, logo, music, copy or asset.

## 2. Status

Status:

- LOCKED CONCEPT
- ARCHITECTURE CANDIDATE
- NOT IMPLEMENTED

This document does not approve:

- UI implementation
- Video creation
- Assets
- Components
- Engines
- Schemas
- app.js changes
- Imports
- Existing onboarding changes

## 3. Design Lock Reference

Benvenù is locked as an experience, not a form.

Locked rule:

Benvenù must feel like a human experience.

Never like:

- Form
- CRM
- Survey
- Corporate onboarding
- Instagram Lead Form-style registration
- Mass data capture

Leopard Experience exists to reinforce that lock before Forge asks anything of
the advisor.

## 4. Experience Intent

Leopard Experience is the emotional first boot of Forge.

It should make the advisor feel:

- "Esto no es otro CRM."
- "Estoy entrando a algo especial."
- "Forge trabaja para mí."
- "Estoy viendo el futuro de mi carrera."

It does not teach features.

It declares a vision.

## 5. User Feeling Target

Target feeling:

The advisor should feel calm, seen and intrigued.

Forge should feel premium, focused and human. The experience should create
anticipation without hype.

Avoid:

- Corporate enthusiasm
- SaaS marketing copy
- Coaching-event motivation
- Overpromising
- Emotional manipulation
- Generic onboarding warmth

## 6. Non-Goals

Leopard Experience does not:

- Ask for data
- Ask for goals
- Show dashboard modules
- Show CRM tables
- Show forms
- Teach buttons
- Explain features
- Ask the advisor to configure a profile
- Capture Purpose Snapshot
- Score productivity
- Diagnose behavior
- Forecast income
- Create sales goals
- Create activity goals

## 7. Narrative Sequence

Recommended duration:

- Ideal: 20-40 seconds
- Maximum: 60 seconds

### Act 1 - Darkness / Silence

Visual direction:

- Clean screen.
- No dashboard.
- No menu.
- No widgets.
- One short sentence.
- Quiet pacing.

Narrative intent:

Break the expectation that the advisor is entering another admin tool.

Example internal copy direction:

"No viniste a llenar otro CRM."

### Act 2 - Reveal

Visual direction:

- Abstract fragments appear.
- Signals can suggest prospects, policies, follow-ups, opportunities, activity
  and goals.
- These fragments must not look like tables or forms.
- They should feel like living signals Forge can understand.

Narrative intent:

Show that Forge sees commercial life as connected signals, not isolated fields.

Example internal copy direction:

"Viniste a construir una carrera que funcione."

### Act 3 - Intelligence Awakens

Visual direction:

- Signals connect gently.
- Connections should imply meaning, not automation magic.
- Avoid dashboards and charts too early.

Conceptual relationships:

- Activity -> opportunity
- Conversation -> next action
- Policy -> renewal
- Goal -> plan
- Advisor -> future

Narrative intent:

Show Forge connecting today's work with tomorrow's career.

Example internal copy direction:

"Forge conecta lo que haces hoy con lo que quieres construir mañana."

### Act 4 - Promise

Visual direction:

- Calm focus.
- Fewer elements.
- Human-centered line.
- No feature list.

Narrative intent:

Promise accompaniment, not software complexity.

Example internal copy direction:

"No voy a pedirte que trabajes para mí.
Voy a trabajar contigo."

### Act 5 - Transition

Visual direction:

- Smooth transition into The Future You Conversation.
- Still no form.
- The next experience starts as a conversation.

Narrative intent:

Open the door from emotional orientation into purpose discovery.

Example internal copy direction:

"Antes de empezar...
veamos hacia dónde quieres ir."

## 8. UX Rules

Rules:

- Show before ask.
- Value before work.
- No tutorial.
- No form.
- No corporate onboarding.
- Emotional first boot.
- Short.
- Skippable but memorable.

Skippable rule:

The advisor may skip Leopard Experience, but skipping should not make the
experience feel disposable. The skip affordance should be calm, small and
respectful.

## 9. Data Rules

Leopard Experience must not generate hard business data.

Allowed lightweight experience state:

- hasSeenBenvenuLeopard: true
- benvenuStartedAt
- benvenuSkipped: true/false
- firstExperienceCompleted: true/false
- emotionalEntryState: optional lightweight tag, no hard scoring

Not allowed:

- productivity score
- motivation score
- forecast
- compensation target
- sales goal
- activity goal
- financial projection
- behavioral diagnosis

Unknown human meaning must remain unknown until later conversation or explicit
advisor input.

## 10. Event Model

Event model status: conceptual only.

Potential events:

- BENVENU_LEOPARD_STARTED
- BENVENU_LEOPARD_SKIPPED
- BENVENU_LEOPARD_COMPLETED
- BENVENU_LEOPARD_TRANSITIONED_TO_FUTURE_YOU

Event classification:

- Experience events only.
- Not Production Events.
- Not business facts.
- Not behavior scores.
- Not manager-performance evidence.

Any future event implementation must preserve Advisor Experience boundaries and
must not create surveillance signals.

## 11. Transition to Future You Conversation

Leopard Experience prepares emotionally.

The Future You Conversation captures Purpose Snapshot.

Order:

```text
Leopard Experience
└── "Déjame mostrarte por qué Forge existe."

The Future You Conversation
└── "Ahora cuéntame qué quieres construir."
```

Purpose Snapshot is not created in Leopard Experience.

Leopard only opens the door.

## 12. Guardrails

Do not:

- Copy external welcome videos.
- Use external assets, music, logos, visual identity or text.
- Mention the internal inspiration in the advisor-facing experience.
- Use corporate onboarding language.
- Use dashboards too soon.
- Turn abstract signals into CRM cards too soon.
- Make the experience feel like SaaS advertising.
- Promise sales, income or career outcomes.
- Manipulate the advisor emotionally.
- Use Purpose Snapshot for commercial pressure.

Do:

- Keep the experience brief.
- Keep copy short.
- Make Forge feel human and premium.
- Make the next step feel natural.
- Preserve the Benvenù lock: experience, not form.

## 13. Acceptance Criteria

Leopard Experience passes if:

- It asks for no data.
- It does not look like a form.
- It does not look like a CRM.
- It does not look like a tutorial.
- It does not look like corporate training.
- It is understood in less than 60 seconds.
- It emotionally prepares for The Future You Conversation.
- It reinforces that Forge works for the advisor.
- It makes Forge feel different.

## 14. Failure Criteria

Leopard Experience fails if:

- It has capture fields.
- It has an onboarding checklist.
- It says "completa tu perfil."
- It shows metrics before context.
- It shows dashboards too soon.
- It feels like SaaS advertising.
- It feels like a generic corporate video.
- It promises impossible results.
- It emotionally manipulates the advisor.
- It uses Purpose Snapshot for commercial pressure.

## 15. Build Tree Update Recommendation

Recommended placement:

```text
Advisor Experience Intelligence
└── Benvenù Experience - ARCHITECTURE CANDIDATE / NOT IMPLEMENTED
    ├── Act 1: Leopard Experience - LOCKED CONCEPT / NOT IMPLEMENTED
    ├── Act 2: First Wow Moment - ARCHITECTURE DISCOVERY
    ├── Act 3: First Value Opportunity - ARCHITECTURE DISCOVERY
    ├── Act 4: The Future You Conversation - LOCKED CONCEPT / NOT IMPLEMENTED
    ├── Act 5: Purpose Snapshot - ARCHITECTURE CANDIDATE / NOT IMPLEMENTED
    ├── Act 6: Alfred / Universal Command Bar Introduction - ARCHITECTURE CANDIDATE / NOT IMPLEMENTED
    ├── Act 7: Progressive Discovery - ARCHITECTURE DISCOVERY
    └── Implementation - NOT APPROVED
```

## 16. Final Verdict

Leopard Experience is approved as Benvenù Act 1 concept.

Implementation is not approved.

Next step is a separate prototype PAQ for non-production UX exploration, with no
changes to current UI, engines or schemas until explicitly approved.

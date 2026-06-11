# FORGE Benvenù Experience Lock

PAQ: 12.x

Status: LOCKED / ARCHITECTURE CANDIDATE / NOT IMPLEMENTED

## Purpose

Benvenù is the central onboarding experience for Forge OS.

This document locks the experience decision, not implementation.

Benvenù must help the advisor feel that Forge understands the person, career
context and future being built. It must never feel like the advisor is doing
administrative work for Forge.

## Architecture Boundary

This is not implementation.

This is not final UI.

This is not code.

This does not approve:

- Components
- Engines
- Schemas
- UI changes
- app.js changes
- Imports
- Refactors
- Data capture workflows
- Mandatory onboarding forms

## Fundamental Principle

Benvenù must feel like an experience.

Never like:

- A form
- A CRM
- A survey
- Corporate onboarding
- Mass data capture

The advisor should feel:

"Forge me entiende."

Not:

"Forge me está entrevistando."

## Absolute Rejection Rule

Reject the design if the experience feels like:

- Facebook Ads form
- Instagram Lead Form
- Traditional CRM
- Corporate survey
- Mass data capture

If Benvenù becomes a form, it fails.

If Benvenù becomes a human conversation, it passes.

## Experience Philosophy

The user must not feel that they are working for Forge.

Forge must feel like it is working for the user.

Benvenù should create first-value context before asking for structured data.
The experience should make the advisor feel understood before asking for
precision.

## The Future You Conversation

Concept status: APPROVED.

Conceptual name:

The Future You Conversation.

Purpose:

Help the advisor discover what they want to build with their career without
feeling that they are filling out a form.

Forge must not ask:

"¿Cuál es tu para qué?"

Forge starts a conversation.

Conceptual example:

"Imagina que pasan 10 años y todo salió bien.

¿Qué cambió?"

## Approved Mechanics

Benvenù may use:

- Cards
- Visual selection
- Storytelling
- Conversations
- Micro decisions
- Progressive discovery
- Emotional experiences
- Contextual interaction
- Light animation
- Game-like progression

These mechanics are permitted only when they support clarity, trust and first
value. They are not decorative goals.

## Prohibited Mechanics

Benvenù must not use:

- Long forms
- Extensive required fields
- Corporate onboarding
- Mass data capture
- Mandatory tutorials
- Text-heavy screens
- CRM-like processes

## Purpose Snapshot

Expected output:

Forge generates a Purpose Snapshot.

The Purpose Snapshot does not need to be perfect.

The Purpose Snapshot does not need to be complete.

It should capture a first approximation of:

- Family Drivers
- Freedom Drivers
- Achievement Drivers
- Legacy Drivers
- Lifestyle Drivers

Purpose Snapshot is human context, not a commercial pressure tool.

## Future Use

Purpose Snapshot may feed:

- Advisor Experience Intelligence
- Business Planning Intelligence
- Mick Behavior Intelligence
- Coaching Systems
- Smart Agenda
- Future Advisor Guidance

Purpose Snapshot must not be used for:

- Manipulation
- Commercial pressure
- Shame
- Surveillance
- Manager coercion
- Unapproved revenue claims

The snapshot exists to preserve human context.

## Design Validation

PASS:

- The experience feels like a human conversation.
- The advisor feels understood.
- Forge creates value before demanding work.
- The advisor makes micro decisions that reveal context naturally.
- The output is a useful Purpose Snapshot, even if incomplete.

FAIL:

- The experience looks like a form.
- The advisor is asked to complete many required fields.
- The flow resembles a CRM setup process.
- The experience is text-heavy and corporate.
- Forge asks the advisor to do work before showing value.

## Build Tree Placement

```text
PAQ 12.x
Advisor Experience Intelligence
└── Benvenù Experience
    ├── The Future You Conversation
    ├── Purpose Discovery Experience
    ├── Purpose Snapshot
    └── NOT IMPLEMENTED
```

## Implementation Gate

Before any implementation, Forge needs a separate approved PAQ covering:

- Experience flow
- Data ownership
- Event model
- Purpose Snapshot contract
- Privacy and manager-visibility guardrails
- Human review for sensitive interpretation
- UI exploration and validation criteria

Implementation status: NOT IMPLEMENTED.

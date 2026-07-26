# Forge Material 3 Design System

Status: FOUNDATION
Branch: `feature/ui-material3-design-system`

## Purpose

This directory defines the visual language for Forge OS before any frontend framework is selected or coupled to the runtime.

Forge adopts Material 3 foundations—semantic color roles, typography roles, shape, elevation, state layers and responsive navigation—without copying the Material Web repository or making Forge look like a generic Google application.

## Design principles

1. **Operational clarity over decoration.** The interface must make priority, status, risk and next action obvious.
2. **Dense but calm.** Forge is a commercial operating system; it may show substantial information without becoming visually noisy.
3. **Conversation first.** Prospect context, timeline, WhatsApp drafts and Nash guidance share one coherent surface.
4. **Human approval is visible.** Draft, approved and sent are different UI states and must never be visually conflated.
5. **Responsive by structure.** Desktop, tablet and mobile use the same information hierarchy with different navigation and panel arrangements.
6. **Accessible by default.** Semantic roles, keyboard focus, readable contrast and reduced-motion support are foundation requirements.

## Token architecture

Forge uses three token layers:

- `--forge-ref-*`: concrete reference values.
- `--forge-sys-*`: semantic system roles used across the application.
- `--forge-comp-*`: component-level overrides when a component needs a specialized role.

Application code should consume system tokens whenever possible. Reference tokens must not be used directly inside product components.

## Initial files

- `forge-material3-tokens.css`: framework-neutral color, typography, shape, spacing, elevation, motion and state-layer tokens.

## Planned component families

- App shell, navigation rail, navigation drawer and bottom navigation.
- Prospect header, status chip, context card and commercial timeline.
- Conversation composer, incoming-message capture and editable draft surface.
- Nash Combat analysis panel and next-best-action card.
- Buttons, icon buttons, text fields, dialogs, menus, tabs, chips and snackbars.

## Runtime boundary

This foundation is visual only. It does not:

- alter NFAST contracts;
- create Supabase migrations;
- connect Nash runtime;
- invoke an AI provider;
- persist drafts;
- approve or send WhatsApp messages.

Fixtures and prototypes may represent these states, but productive behavior must be connected later through ratified contracts.

## External foundation

The design language is informed by Google's open-source Material 3 documentation, Material Web tokens and Material Color Utilities. No upstream repository is vendored into ForgeOS.

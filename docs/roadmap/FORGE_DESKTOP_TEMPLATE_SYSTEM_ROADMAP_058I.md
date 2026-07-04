# Forge Desktop Template System Roadmap 058I

Status: SCOPED

Decision token:
DECISION=FORGE_DESKTOP_TEMPLATE_SYSTEM_ROADMAP_058I

## Current State

Desktop visual baseline is ready enough to stop polishing broadly and define a
reusable template system for future modules.

## Next Steps

### 058J_DESKTOP_TEMPLATE_SYSTEM_DOCS_LOCK

Lock the desktop template system as reusable documentation and checklist.

Deliverables:

- final template system doc;
- per-template checklist;
- module-to-template mapping;
- implementation guardrails;
- acceptance criteria for future modules.

### 059A_UI_ACTION_CONTRACT_SCOPE

After the template system is locked, define UI action packets emitted by command
bar and module controls.

### 059B_STATIC_ACTION_PACKET_BRIDGE

Create inert preview-only bridge between UI and action packets.

### 059C_ENGINE_ADAPTER_RECONNECT

Begin connecting real module engines behind explicit safety and approval gates.

## Guardrails

- Do not reopen mobile design.
- Do not redesign desktop broadly during 058J.
- Do not connect engines before 059A.
- Do not create module-specific desktop layouts without mapping to a template.

## Final Decision

DECISION=FORGE_DESKTOP_TEMPLATE_SYSTEM_ROADMAP_058I

NEXT=058J_DESKTOP_TEMPLATE_SYSTEM_DOCS_LOCK

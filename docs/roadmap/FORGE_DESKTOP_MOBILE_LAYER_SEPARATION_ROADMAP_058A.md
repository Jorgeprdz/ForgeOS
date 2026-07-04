# Forge Desktop/Mobile Layer Separation Roadmap 058A

Status: ROADMAP / REVERSIBLE MIGRATION

## Current Decision

058A defines separation, adds documentation, and permits a minimal CSS guard only.

```text
DECISION=PASS_058A_DESKTOP_MOBILE_LAYER_SEPARATION
```

## Phase 058A

Goal:

- Document current layer map.
- Define desktop/mobile boundary.
- Add minimal guard CSS if safe.
- Do not redesign desktop.
- Do not mutate mobile visually.

Done when:

- Source truth doc exists.
- Design boundary contract exists.
- Roadmap exists.
- Guard CSS is loaded without changing functional order.
- Validation passes.

## Phase 058B

Name:

```text
058B_DESKTOP_BASELINE_AUDIT
```

Goal:

- Audit desktop 056Y visual baseline.
- Identify which desktop surface is canonical.
- Decide whether 056G7 remains legacy or is removed from auto-load later.
- Produce desktop-specific repair scope without touching mobile.

## Phase 058C

Name:

```text
058C_STATIC_PREVIEW_ENTRYPOINT_SPLIT_SCOPE
```

Goal:

- Scope a real split into `shared/`, `mobile/`, `desktop/`, and `legacy/`.
- Define exact copy/move map.
- Define rollback path.
- Define screenshot and DOM validation requirements.

## Phase 058D

Name:

```text
058D_STATIC_PREVIEW_ENTRYPOINT_SPLIT_IMPLEMENTATION
```

Goal:

- Introduce shared/mobile/desktop entry files.
- Keep historical files in place or move only with compatibility shims.
- Guard JS entrypoints with `matchMedia`.
- Preserve public URL:
  `https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=057n`

## Phase 058E

Name:

```text
058E_DESKTOP_VISUAL_REPAIR_SCOPE
```

Goal:

- Reopen desktop visual work after the separation contract is stable.
- Keep mobile locked unless a specific mobile phase is approved.

## Non-Goals

- No mobile redesign.
- No desktop redesign in 058A.
- No static preview runtime actions.
- No GitHub Pages setting mutation.
- No historical file deletion.

## Next

```text
NEXT=058B_DESKTOP_BASELINE_AUDIT
```

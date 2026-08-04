# HOME TABLET LAYOUT + PALETTE — REPAIR 003

## Public symptom

At the tablet/compact-desktop viewport used by the Galaxy Tab browser, the productive Home summary was constrained to eight of twelve desktop columns while its internal Smart Widget workspace still switched to four columns. Supporting cards were compressed to roughly one quarter of the summary width, text and actions wrapped excessively, and the remaining desktop columns appeared empty because the converted Opportunities surface still retained the static placeholder `hidden` state.

The recovery shortcuts also used a different surface token family, producing brown/gray cards next to the navy Smart Widgets.

## Repair

- Mount a Home-only presentation runtime from the canonical module graph.
- Remove inherited `hidden` and `aria-hidden` only after the surface is marked `data-home-live-opportunities`.
- Use two readable Smart Widget columns from 760px through 1539px.
- Keep the primary card full-width and preserve 4x2 / 2x2 recovery-card hierarchy.
- Reclaim the full summary width whenever Opportunities is genuinely unavailable.
- Apply one navy-blue surface, outline, shadow and text palette to Mick, Smart Widgets, recovery shortcuts and Opportunities.
- Cap metric typography so viewport units cannot create oversized text inside narrow cards.

## Boundaries

```text
HOME_DATA_MUTATION=NO
FORECAST_LOGIC_MUTATION=NO
MONTHLY_GOAL_MUTATION=NO
NAVIGATION_MUTATION=NO
AUTHORITY_SOURCE_MUTATION=NO
PRESENTATION_ONLY=YES
```

## Acceptance target

```text
HOME_TABLET_TWO_COLUMN_WIDGET_GRID=PASS
HOME_PRIMARY_CARD_FULL_WIDTH=PASS
HOME_RECOVERY_4X2_2X2_HIERARCHY=PASS
HOME_EMPTY_RIGHT_COLUMN=BLOCKED
HOME_OPPORTUNITY_STATIC_HIDDEN_STATE=REMOVED
HOME_SURFACE_PALETTE=UNIFIED
HOME_TABLET_METRIC_TYPE=BOUNDED
```

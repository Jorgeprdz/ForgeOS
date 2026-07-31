# Pipeline Google Calendar Draft Handoff Closure 067G17B5

Status: IMPLEMENTED / PRODUCTION_ACCEPTED / LOCKED

Date: 2026-07-31

## Purpose

Close the Productive Pipeline `Agendar` action as a governed handoff to a prefilled Google Calendar draft, while preserving human approval and explicitly excluding OAuth, save confirmation and automatic Pipeline or Timeline mutation.

## Closed Production Contract

```text
User selects Agendar on a Productive Pipeline card
-> ForgeOS opens the Material 3 scheduling workspace
-> user selects date, time and duration
-> ForgeOS builds calendar.google.com/calendar/render
-> ctz=America/Mexico_City
-> title and prospect context are prefilled
-> Google Calendar opens as a draft
-> user reviews and presses Save in Google Calendar
```

The handoff is complete when the correctly prefilled Google Calendar draft opens. ForgeOS does not claim that Google saved the event.

## Runtime Authority

- Runtime: `docs/static-preview/forge-alive-material3/pipeline-google-calendar.js`.
- Styles: `docs/static-preview/forge-alive-material3/pipeline-google-calendar.css`.
- Public entry: `docs/static-preview/forge-alive-material3/app.js`.
- Trigger: `.pipeline-module__action--calendar` on Productive Pipeline cards.
- Time zone: `America/Mexico_City`.
- Input authority: date, local time and bounded duration selected by the advisor.
- Output authority: a Google Calendar draft URL using `calendar.google.com/calendar/render`.
- Human approval remains mandatory in Google Calendar.

## User Experience Contract

- `Agendar` is enabled on the current Material 3 Productive Pipeline card.
- The scheduling workspace is responsive and respects mobile safe areas.
- The workspace exposes the prospect context needed to review the appointment.
- Escape, close and focus restoration are supported.
- Card rerenders reconcile the action without adding duplicate authorities.
- The public entry is cache-busted so browsers load `pipeline-google-calendar-001`.

## Deployment and Acceptance

Implementation chain:

- PR #43: Productive Pipeline Google Calendar draft handoff.
- PR #44: public runtime cache-bust for the Calendar authority.

Important commits:

- Implementation merge: `9c33345c6a2224db8c6f97cc6f4b03dcacc6081c`.
- Final public runtime merge: `831118409b038931d5eec83b0c8948d2852c1047`.

Canonical route:

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?nav=pipeline`

Human production acceptance:

- Productive route opened successfully.
- `Agendar` opened the ForgeOS scheduling workspace.
- Google Calendar draft handoff was reviewed by the product owner.
- Final decision: `PASS`.

## Acceptance Gates

PR #43 final head `029933ada665d5395c2789e563e99c04c083374c` passed:

- Pipeline Mobile Interaction Regression — run `30666091017`;
- Pipeline Real Interaction Regression — run `30666091093`;
- Manual Quotes and Pipeline Stability — run `30666091101`;
- Forge UI Visual Diagnostic — run `30666091108`.

PR #44 final head `702f4c8f34e93035bfb84891eb45827c56af99a7` passed:

- Pipeline Mobile Interaction Regression — run `30666747304`;
- Pipeline Real Interaction Regression — run `30666747261`;
- Manual Quotes and Pipeline Stability — run `30666747262`, successful controlled rerun after a non-reproducing border assertion flake;
- Forge UI Visual Diagnostic — run `30666747266`.

Regression coverage includes:

- formerly disabled Calendar action becomes available;
- scheduling workspace opens;
- exact date range and duration are encoded;
- `America/Mexico_City` is preserved;
- prospect context is included;
- no automatic synchronization claim is emitted;
- focus is restored after closing;
- action authority survives card rerender.

## Boundaries Preserved

- No Google OAuth authorization.
- No Google Cloud project dependency.
- No Google access or refresh tokens.
- No API read-back confirming that the event was saved.
- No automatic `APPOINTMENT_SCHEDULED` Stage transition.
- No automatic Pipeline mutation.
- No automatic Timeline event.
- No automatic task creation.
- No automatic message or invitation send.
- No legacy `advisor-os` Calendar UI revival.
- The floating mobile navigation remains intentional; the workspace must preserve safe bottom space.

## Future Authority Boundary

A bidirectional Calendar integration is a separate future capability and requires:

- explicit OAuth consent;
- secure token custody;
- confirmed Google Calendar API response;
- idempotency and retry policy;
- governed Pipeline and Timeline effects;
- explicit human approval rules.

None of those future authorities are implied by 067G17B5.

## Locked Decision

`067G17B5_PIPELINE_GOOGLE_CALENDAR_DRAFT_HANDOFF=LOCKED`

`PRODUCTION_STATUS=ACCEPTED`

`GOOGLE_CALENDAR_DRAFT_OPEN=PASS`

`GOOGLE_CALENDAR_SAVE_CONFIRMATION=NOT_CLAIMED`

`AUTOMATIC_PIPELINE_OR_TIMELINE_MUTATION=FORBIDDEN`

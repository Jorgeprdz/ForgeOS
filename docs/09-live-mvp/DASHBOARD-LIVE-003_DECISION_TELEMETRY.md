# DASHBOARD-LIVE-003: Decision Telemetry

STATUS: IMPLEMENTATION SPEC

IMPLEMENTATION SCOPE: LOCAL EVIDENCE ONLY

BACKEND: NOT AUTHORIZED

MIGRATION: NOT AUTHORIZED

Scope: Track minimal local evidence for Decision Cockpit v0 usage.

---

## 1. Goal

Forge should learn whether its decisions are used.

Decision Cockpit telemetry records local evidence for:

- decision shown
- decision clicked
- timestamp
- decision type

This is not an analytics service.

This is local product evidence.

---

## 2. Decision Types

Supported decision types:

- `activity_gap`
- `referral_activation`
- `cartera_urgency`

---

## 3. Storage Boundary

Telemetry uses existing IndexedDB capability only.

No new schema.

No backend.

No new routes.

No migration.

Local evidence is stored in the existing `logs` store.

---

## 4. Future Questions

This telemetry should eventually help answer:

- Which decisions are clicked most?
- Which decisions lead to activity?
- Which decisions are ignored?
- Which decisions correlate with production?

These questions are not implemented in this batch.

---

## 5. Final Principle

Every interaction should make Forge smarter.

# Supabase Alpha Persistence Schema Specification

Status: AUTHORIZED
Date: 2026-06-17
Version: 0.1

---

## 1. Purpose
Define the minimal persistence layer required to dogfood Forge Alpha v0.1 in a real-world setting. This schema enables tracking of advisor inputs, engine outputs, and subsequent human validation, directly supporting iterative refinement of the runtime.

## 2. Table Definitions

### 2.1 `prospects`
*   **Purpose:** Store basic identification for prospects associated with opportunities.
*   **Fields:**
    *   `id` (uuid, primary key)
    *   `created_at` (timestamptz)
    *   `alias` (text) - *Privacy: Never store real names in this field.*
*   **Privacy Notes:** PII minimization is paramount. Only store identifiers necessary for internal Forge operations.

### 2.2 `alpha_events`
*   **Purpose:** Append-only log of raw advisor notes and extracted canonical events.
*   **Fields:**
    *   `id` (uuid, primary key)
    *   `prospect_id` (uuid, references prospects)
    *   `timestamp` (timestamptz)
    *   `raw_note` (text) - *The raw unstructured advisor input.*
    *   `canonical_events` (jsonb) - *JSON array of extracted canonical events.*
*   **Indexes:** `prospect_id`, `timestamp`

### 2.3 `forge_outputs`
*   **Purpose:** Persist the runtime outputs for a specific event ingestion.
*   **Fields:**
    *   `id` (uuid, primary key)
    *   `event_id` (uuid, references alpha_events)
    *   `owner` (text)
    *   `ownership_confidence` (numeric)
    *   `waiting_state` (text)
    *   `advancement_state` (text)
    *   `recommendation` (text)
    *   `evidence_used` (jsonb)
*   **Indexes:** `event_id`

### 2.4 `validation_results`
*   **Purpose:** Record human evaluation of Forge runtime performance.
*   **Fields:**
    *   `id` (uuid, primary key)
    *   `output_id` (uuid, references forge_outputs)
    *   `accuracy_rating` (text: 'correct'|'partial'|'wrong')
    *   `human_correction` (text) - *Optional: Note on why it was wrong or partial.*
    *   `actual_outcome` (text) - *Optional: What actually happened.*
*   **Indexes:** `output_id`

---

## 3. Privacy & Governance Notes
*   **PII Minimization:** The schema relies on `prospect_id` rather than PII.
*   **Anonymization Ready:** The `alias` field in `prospects` is designed to be easily swappable for hashed IDs if future compliance requires complete anonymization.
*   **No Unnecessary Data:** This schema includes only the bare essentials required for the `v0.1` runtime flow and validation loop.

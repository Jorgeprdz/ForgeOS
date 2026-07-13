# R15M2 ORVI Guaranteed Recovery UI Simplification And Data Consistency Hardening Evidence

## Baseline and repository gates

- Required branch: `main` — PASS.
- Required `HEAD`: `f8bd006439ba95b8a815eecf5c1376bda3a9d414` — PASS before implementation.
- Required `origin/main`: same baseline — PASS before implementation.
- Initial worktree clean — PASS.
- Protected-surface SHA-256 manifest created before edits — PASS, 21 entries.
- Exact allowlist created before edits — PASS.
- Existing allowlisted files backed up before edits — PASS.

## Functional evidence

- Three dynamic UDI recovery cards remain.
- Every recovery card contains exactly seven visible rows.
- `UDI proyectada` is the final row.
- No projected contribution, surrender, cash, total recovery, difference or percentage row follows it.
- `Valor de rescate` contains source UDI only and no MXN secondary value.
- Recovery percentage uses current MXN total recovery divided by current MXN total contributed.
- Zero or missing current MXN contributed value remains pending.
- Visible percentage formatting is limited to two decimals.
- The comparison-only, not-investment-return classification remains attached.
- The recovery relationship explanation renders once, above the cards.

## Summary and modal evidence

- Valid currency-matched `orviRateMetadata` removes the false MXN pending message.
- Stale, mismatched, missing-date, non-positive or unauthorized-mode metadata retains the pending state.
- No rate fallback is embedded in renderer code.
- ORVI summary renders currency and payment term without promising unsupported payment mode or coverage duration.
- Confirmation family is uppercase `ORVI`.
- Canonical product, sum assured and payment term are mapped when available.
- Basic annual premium and annual total with AVE are mapped only from explicit source-provided canonical money fields.
- Missing name, insured or premium values remain null; no substitute is invented.

## Private regression

The local file `/storage/emulated/0/Download/ORVI_R15M_VISUAL_REVIEW.json` was read outside Git. No private value, name, contact detail or identifiable amount was printed, copied into tests or committed.

Sanitized structural result:

```text
PRIVATE_PACKET_PARSED=true
DYNAMIC_CHECKPOINT_COUNT_IS_3=true
EVERY_CARD_HAS_7_ROWS=true
PROJECTED_UDI_IS_LAST=true
SURRENDER_HAS_NO_MXN=true
PERCENTAGE_USES_CURRENT_MXN=true
VALID_RATE_REMOVES_FALSE_MXN_PENDING=true
MODAL_FAMILY_IS_ORVI=true
MODAL_SUM_ASSURED_PRESENT_WHEN_CANONICAL=true
MODAL_PAYMENT_TERM_PRESENT_WHEN_CANONICAL=true
RECOMMENDATION_IS_NULL=true
HUMAN_DECISION_REQUIRED=true
```

## Governance result

```text
STATUS=PASS_UI_SIMPLIFICATION_AND_DATA_CONSISTENCY_HARDENING
RECOVERY_VISIBLE_ROW_COUNT=7
RECOVERY_LAST_VISIBLE_ROW=UDI_PROYECTADA
PROJECTED_ROWS_AFTER_UDI_REMOVED=YES
SURRENDER_VALUE_MXN_VISIBLE=NO
RECOVERY_PERCENTAGE_SOURCE=CURRENT_MXN_TOTAL_RECOVERY_DIVIDED_BY_CURRENT_MXN_TOTAL_CONTRIBUTED
RECOVERY_EXPLANATION_SINGLE_INSTANCE=YES
FALSE_MXN_PENDING_WITH_VALID_RATE=FIXED
ORVI_MODAL_FAMILY_UPPERCASE=YES
ORVI_MODAL_SUM_ASSURED_MAPPED=YES_IF_CANONICAL
ORVI_MODAL_PAYMENT_TERM_MAPPED=YES_IF_CANONICAL
PRIMA_INVENTED=NO
PRODUCT_INTELLIGENCE_OWNER=UNCHANGED
RATE_CACHE_CHANGED=NO
HARD_CODED_RATE=NO
RECOMMENDATION=null
HUMAN_DECISION_REQUIRED=true
MANUAL_VISUAL_ACCEPTANCE=PENDING_USER_REVIEW
NEXT=R15M3_ORVI_MANUAL_VISUAL_ACCEPTANCE_SIGNOFF_AND_RELEASE_CLOSE
```

## Responsive browser regression

A local headless Chromium run consumed the private packet in memory and emitted boolean results only. Desktop (1440 px), tablet (900 px) and mobile (390 px) passed with no page errors, no horizontal overflow, three recovery cards, seven rows per card, one explanation, visible selector and disclosures, accepted status, consistent MXN summary and evidence-backed modal fields. This is automated structural validation, not human visual acceptance.

R15M1 was not executed or closed. This evidence does not claim human visual acceptance.

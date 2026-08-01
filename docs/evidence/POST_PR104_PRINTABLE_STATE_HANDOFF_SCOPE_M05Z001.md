# POST-PR #104 — Printable State Handoff M05Z-001

## Observed production failure

The public Material 3 quote screen can show:

```text
Cotización confirmada
Cotización confirmada y lista para imprimir.
```

while the productive printable card is absent on both desktop and mobile.

## Root cause

The confirmation UI and the printable authority can read different wrappers of
`globalThis.ForgeAcceptedQuoteBridge`. The confirmation layer retains an
accepted review snapshot through its underlying bridge, while the current
global facade can return `null`. The printable route then evaluates
`acceptedQuoteReady=false` and hides the entire document action card.

## Repair boundary

- traverse only the bounded bridge-underlying chain;
- recover an existing `reviewOnly=true` accepted snapshot;
- when the UI is already human-confirmed, rebuild only the read-only snapshot
  from the existing candidate and preview calculation;
- never recalculate, reconfirm, mutate CRM, send, or download automatically;
- refresh the existing QPD printable authority after reconciliation;
- clear the recovered snapshot when the candidate is cleared.

## Acceptance

```text
DESKTOP_PRINT_ACTION_VISIBLE=REQUIRED
MOBILE_PRINT_ACTION_VISIBLE=REQUIRED
FORCED_CLICK=FORBIDDEN
AUTOMATIC_RECONFIRMATION=FORBIDDEN
QUOTE_MUTATION=NOT_AUTHORIZED
CRM_MUTATION=NOT_AUTHORIZED
```

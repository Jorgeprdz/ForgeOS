# FORGE CARTERA 120A–120D — CONTROLLED PROMOTION AUTHORIZATION 001

## Purpose

CARTERA 120 converts the accepted 110 program closure into a current-main selective-promotion authorization package. It does not promote the historical stacked branch, copy runtime files, merge a pull request, deploy Pages or mutate Supabase.

The branch starts from current productive `main`, not from the historical Cartera stack.

## Observed repository state

```text
CURRENT_MAIN_HEAD=9d014116f6b3f0a626d8848d680a5c607f924d99
ACCEPTED_CARTERA_PROGRAM_HEAD=b83a37abe3eb8b3a48c2fe89940b562e1367bfcc
MERGE_BASE=a060fde0b5b2f38e0912f54f47dc4f141c21e45c
CURRENT_MAIN_AHEAD_BY=388
ACCEPTED_PROGRAM_AHEAD_BY=594
HISTORY_STATE=DIVERGED
FULL_HISTORY_MERGE=FORBIDDEN
PROMOTION_STRATEGY=SELECTIVE_CURRENT_MAIN_PROMOTION
```

Current `main` contains accepted productive work that must survive promotion, including the Material 3 shell, Pages, authentication, Pipeline, Quotes, productive Smart Widgets, Advisor Forecast and the selectively promoted Cartera 050 authority.

The accepted Cartera program head contains the completed 001–110 program, but its long historical branch chain is not a valid promotion unit against current `main`.

## 120A — Current-main reconciliation

120A binds the promotion review to exact heads and the observed merge base. It records both sides of the divergence, current-main preservation requirements and accepted capabilities.

Outcomes:

- `DIVERGED_SELECTIVE_PROMOTION_REQUIRED`
- `SELECTIVE_PROMOTION_REVIEW_REQUIRED`
- `LINEAR_PROMOTION_REVIEW_REQUIRED`
- `SOURCE_NOT_VERIFIED`

A diverged stack sets:

```text
FULL_HISTORY_MERGE_ALLOWED=NO
STACKED_BRANCH_MERGE_ALLOWED=NO
CURRENT_MAIN_OVERWRITE_ALLOWED=NO
EXECUTION_AUTHORIZED=NO
```

## 120B — Selective promotion manifest contract

A selective manifest is head-bound and digest-bound. Every entry requires:

- capability;
- category;
- action: `ADD`, `REPLACE`, `RETAIN` or `RECONCILE`;
- source and target paths;
- exact source blob SHA for copied content;
- reason;
- current-main preservation statement;
- runtime-mount and already-applied-schema posture.

`app.js` and `cartera.js` may only use `RECONCILE`; blind replacement is rejected.

The manifest forbids:

- historical `run/` and preservation branches as file sources;
- temporary artifacts;
- secrets and environment files;
- diagnostic, one-shot and remote-acceptance workflows;
- importing historical commit ancestry;
- direct writes to `main`;
- automatic merge, deployment or database migration.

## 120C — Explicit controlled-promotion authorization

The accepted decisions are:

- `HOLD`
- `AUTHORIZE_SELECTIVE_PROMOTION`

Authorization requires all of the following:

1. exact current-main head;
2. exact accepted-program head;
3. an untampered selective manifest digest;
4. explicit actor, reason and timestamp;
5. explicit Board Approval;
6. explicit merge authorization;
7. exact authorization phrase:

```text
AUTHORIZE_CARTERA_120_SELECTIVE_PROMOTION
```

A generic instruction to build or run 120 is not merge authorization. Silence is not authorization.

Even an authorized receipt performs no execution. It only enables a separate head-bound CARTERA 130 execution pass.

## 120D — One-pass acceptance and closure

120D validates:

- current-main ancestry;
- the accepted 110 closure and exact source head;
- observed divergence;
- paths restricted to 120 governance, tests, workflow, architecture and evidence;
- static contract;
- focused tests;
- default decision `HOLD` under the current instruction;
- zero runtime, product UI, database, account, deployment or `main` mutation.

## Current one-pass outcome

```text
CARTERA_110_COMPLETE=YES
CARTERA_120A_CURRENT_MAIN_RECONCILIATION=PASS
CARTERA_120B_SELECTIVE_MANIFEST_CONTRACT=PASS
CARTERA_120C_AUTHORIZATION_BOUNDARY=PASS
CARTERA_120D_ACCEPTANCE_AND_CLOSURE=PASS
PROMOTION_STRATEGY=SELECTIVE_CURRENT_MAIN_PROMOTION
PROMOTION_AUTHORIZATION=NOT_GRANTED
PROMOTION_DECISION=HOLD
BOARD_APPROVAL=NOT_GRANTED
MERGE_AUTHORIZATION=NOT_GRANTED
FILES_COPIED=0
FILES_RECONCILED=0
PRODUCT_UI_MUTATION=NO
DATABASE_MUTATION=NO
MAIN_MUTATION=NO
DEPLOYMENT=NO
NEXT=CARTERA_130_HEAD_BOUND_SELECTIVE_PROMOTION
```

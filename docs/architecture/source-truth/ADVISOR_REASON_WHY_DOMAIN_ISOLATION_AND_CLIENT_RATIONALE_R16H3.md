# Advisor Reason Why Domain Isolation and Client Rationale — R16H3

Status: **SEPARATED — PRIVATE MANAGER SIGNAL VS CLIENT SOLUTION-FIT RATIONALE**

## Why this correction exists

Advisor Reason Why was created inside `manager-os` to help a manager understand
what deeply motivates an advisor. Money or production targets may not be the
real driver. The meaningful driver may be buying a home, creating stability,
supporting children, changing a family situation, or reaching another personal
outcome.

That information is a private coaching signal. It is not a reason for a client
to buy a product and must never enter a client presentation, prompt, slide plan,
print view, or PDF.

## Domain A: Advisor Reason Why

Owner:

`manager-os/nba/nba-reason-why-boundary-contract.js`

Subject:

The advisor and the advisor's personal motivation.

Primary consumer:

The manager preparing human coaching or a one-on-one conversation.

Allowed uses:

- Understand what the advisor wants.
- Understand why that outcome matters.
- Connect agreed activity with the advisor's stated purpose.
- Prepare a non-coercive human coaching conversation.

Forbidden uses:

- Client presentation input.
- Product recommendation truth.
- Automatic pressure, punishment, ranking, HR action, compensation truth, or
  personality truth.
- Automatic messaging or execution.

## Domain B: Client Recommendation Rationale

Owner:

`docs/static-preview/quote-runtime/forge-client-recommendation-rationale-boundary.js`

Subject:

The documented fit between a client's objective, need, quoted solution, product
facts, and recommended human-reviewed next step.

Allowed fields:

- Client objective.
- Documented need.
- Solution fit.
- Why now for the client.
- Recommended review action.
- Evidence references, source owners, and freshness.

Forbidden fields:

- Advisor Reason Why.
- Underlying advisor motivation.
- Emotional driver of the advisor.
- Manager coaching signal.
- Compensation, commission, bonus, forecast, ranking, or payout context.
- Advisor notes as client-visible content.

## Presentation privacy rules

- The ambiguous `reasonWhy` field is forbidden in presentation input.
- `clientRecommendationRationale` uses its own packet type and authority.
- Advisor notes remain internal and are excluded from prompt payload and slide
  facts.
- The client rationale boundary creates no financial or product truth.
- Facts remain owned by quote sources and Product Intelligence.
- Human review remains mandatory.
- Print/PDF remains the only export.
- Send and CRM mutation remain disabled.

## Next step

`R16I_PRESENTATION_VISUAL_RUNTIME_ACCEPTANCE_AND_RELEASE_CLOSE`

Visual acceptance must prove that client rationale appears only when supplied,
advisor notes remain private, Advisor Reason Why cannot be injected, facts
remain read-only, approval remains human and revision-bound, and Print/PDF
contains no private advisor data.

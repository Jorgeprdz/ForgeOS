# R14D SeguBeca Visual And Packet Mapping Repair Evidence

## Decision

`PASS_R14D_SEGUBECA_VISUAL_AND_PACKET_MAPPING_REPAIR`

R14D repairs the real-PDF QA findings observed after R14C.

## Findings addressed

- SeguBeca cards were too narrow and overlapped.
- The dashboard had no product-scoped desktop layout.
- Additional coverages displayed `[object Object]`.
- Accepted packet aliases did not fully expose insured, sum assured, annual premium, coverage period, or total recovery.
- The generic pending placeholder remained visible after successful parsing.
- Total recovery was not mapped to the upper summary.

## Changes

- Added product-scoped desktop CSS for `data-forge-product-type="segubeca"`.
- Gave SeguBeca sections explicit grid spans.
- Prevented recommended-benefit object values from rendering as raw objects.
- Preserved recommended-benefit fields.
- Added packet/native aliases for annual premium, recommended premium, sum assured, coverage period, and total recovery.
- Replaced the generic pending placeholder with actual missing-information state.
- Filled the upper total-recovery summary when evidence exists.

## Boundaries

- No new parser product semantics.
- No PDF or Excel committed.
- No client data or screenshots committed.
- No mobile redesign.
- No schemas, routes, `app.js`, or rule packs.
- Existing Vida Mujer and Imagina Ser tests remain required.

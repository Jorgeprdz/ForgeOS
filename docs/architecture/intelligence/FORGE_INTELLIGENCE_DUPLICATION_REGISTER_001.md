# Forge Intelligence Duplication Register 001

Phase: `FORGE_PRODUCT_INTELLIGENCE_INVENTORY_001`
Mode: document findings; do not fix

A duplicated implementation is not automatically a duplicate truth authority. This register records places where multiple generations, projections or wrappers can be mistaken for competing owners.

| ID | Capability / truth | Implementation A | Implementation B | Likely canonical ownership | Risk | Later action |
|---|---|---|---|---|---|---|
| D01 | Relationship intelligence | root `relationship-*` engines | FIP Pack 01 + CRS relationship/person/timeline authorities | CRS/CommercialPerson/Timeline own truth; Pack 01 is governed composition | legacy root engines may be mistaken for independent truth | trace consumers; classify root engines as component/legacy before migration |
| D02 | Nash / next best action | root `nash-*` engine family | `platform/nash/fip-pack-03-nash-conversation-contract.js` + Advisor OS service | governed FIP contract/service owns composition boundary; components remain subordinate | multiple NBA/recommendation entry points | converge through one recommendation contract; no blanket deletion |
| D03 | Opportunity priority | root smart-priority/pipeline/ranking lineage | FIP Pack 04 opportunity-operation priority contract / Priority Orchestrator | FIP/priority orchestration should own explainable candidate priority, Pipeline remains domain state owner | frontend/root heuristics can diverge in scoring semantics | map every consumer to one candidate-priority contract |
| D04 | Home intelligence presentation | Material3 FIP Home bridge/final mount | current Aura Home Command Center | Aura is current visual/product surface; FIP/Alfred services remain reusable intelligence | rebuilding intelligence in Aura instead of reusing services | retire only presentation bridge after equivalent Aura composition is proven |
| D05 | Forecast composition | advisor forecast composer v1/v2/v3 + manager forecast engine | SMNYL/revenue forecast engines and current runtime reconciliation | Forecast domain owns scenarios; latest governed runtime path must be selected after dependency trace | stale composer/version may leak different semantics | Phase 2 selects winning composition path by actual consumer graph |
| D06 | Revenue/commission estimate vs truth | root commission projection/revenue forecast/optimization | confirmed Payment Event → Advisor Commission Engine → compensation event authority | confirmed economic evidence + compensation engine own generated/earned chain; projection owns scenarios only | estimate could be presented as generated/paid | enforce truth-state boundary across every surface |
| D07 | Advisor development/training | copied legacy compensation targets | Advisor Development Rule Pack | Advisor Development Rule Pack is selected authority | duplicate qualification interpretation | preserve selected authority; deprecate copied legacy interpretation later |
| D08 | Product presentation | generic quote calculation/benefit heuristics | product-specific Imagina/ORVI/SeguBeca/Vida Mujer authorities + neutral decision read model | product-specific Product Intelligence owns meaning; read model composes | generic hero may overwrite product meaning | keep generic fallback only for unsupported products |
| D09 | Policy/portfolio projection | policy read models | portfolio Future Radar projection/view | Policy Intelligence owns policy truth; Future Radar is projection | projection could become accidental policy truth | explicitly preserve projection label/source refs |
| D10 | Activity productivity | local UI KPI/point interpretations | Activity Points Authority Adapter + productivity owner | productivity authority owns points/goals; Aura is consumer | frontend could recalculate points or invent coaching | connect owner output, never recreate rules in UI |
| D11 | Business intelligence/reporting | legacy conversion/dashboard engines | FIP Pack 06 Business Intelligence snapshot + current Reports runtime | domain metric owners feed BI snapshot; BI does not own source facts | report formulas can become parallel metric owners | one-metric-one-owner crosswalk in Phase 2 |
| D12 | Commercial identity candidates | Pipeline Prospect records | `commercial_people` canonical persons / 020C convergence | Prospect remains Pipeline authority until explicit human identity convergence; CommercialPerson owns canonical person after confirmation | “exists in Pipeline” can be falsely treated as canonical person | preserve human confirmation and cross-surface candidate visibility |

## High-risk duplications

`D04`, `D05`, `D06`, `D12` are the highest assembly risks because they can cause a fourth reconstruction even when individual modules work:

- presentation generation mismatch (Material3 intelligence mount vs Aura);
- multiple forecast composers;
- economic estimate/truth conflation;
- entity identity split across Pipeline and Cartera.

## Boundary

```text
DUPLICATIONS_RECORDED=12
DUPLICATIONS_RESOLVED_IN_CODE=0
FILES_DELETED=0
ENGINES_MIGRATED=0
AUTHORITY_REASSIGNMENTS=0
```

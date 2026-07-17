# Forge Prospect Identity and Source Lineage Decision 067G4

Status: `CONTRACT_IMPLEMENTED`; production writer blocked.

Advisor OS Sales owns Prospect identity. Prospect, opportunity, referral, Project 200 contact and client IDs are distinct. Every Prospect requires Advisor ownership and at least one evidence-bearing source claim. Verified facts, user notes, source claims and model interpretations remain separate; interpretations cannot overwrite facts.

Legacy `schemas/prospect.schema.json` remains compatibility-only because it is open and conflates notes/status with identity. New governed consumers use `advisor-prospect-identity-v1` and `prospect-identity-contract.js`. No localStorage, fixture or Manager write becomes canonical truth.

Acceptance: schema/fixture/negative/privacy/lineage tests pass. Next fast-track module: 067G5.

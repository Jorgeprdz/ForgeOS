# R14 SeguBeca Product Dashboard Discovery And Readiness Evidence

## Decision

`PASS_R14_SEGUBECA_PRODUCT_DASHBOARD_DISCOVERY_AND_READINESS`

R14 registers SeguBeca as a planned Quote Preview / Product Intelligence UI dashboard consumer. Discovery is locked and implementation readiness is established with conditions. This evidence does not authorize implementation.

## Constitutional Gate

| Field | Result |
| --- | --- |
| Applicable Constitution | `FORGE_CONSTITUTION_V3.md`: Decision Clarity First, Advisor First, No Invented Data, Product Semantics, modular architecture, privacy |
| Applicable ADRs | ADR-003, ADR-004, ADR-005, ADR-007, ADR-008 |
| Build Tree area | Quote Preview / Product Intelligence UI |
| Discovery status | Discovery locked |
| Implementation readiness | Ready with conditions |
| Miranda approval | Approved |
| Board approval | Approved for discovery/readiness/registration only |
| Implementation approval | Not granted; separate R14A approval required |

## Product framing

SeguBeca must be modeled as an education-goal life product dashboard consumer. It is not a retirement scenario dashboard and it is not a Vida Mujer clone.

The expected commercial narrative is:

```text
Esto aportas.
Esto garantizas para la universidad.
Esto pasa si el asegurado principal o la estructura mancomunada falla.
Así se entrega la meta educativa.
```

The dashboard remains a consumer of Product Intelligence output. It must not calculate, invent, or own product truth.

## Participant and insured structure

SeguBeca can involve different participant structures. Forge must model this explicitly instead of flattening everything into one generic insured field.

Expected cases when evidenced:

- padre or madre plus menor;
- papá plus mamá plus menor;
- mancomunado/joint-style structure when the PDF or Product Intelligence output says so.

Future Product Intelligence output should preserve:

- `primary_insured`;
- `joint_insured`;
- `child_or_education_beneficiary`;
- participant roles or kinship when evidenced;
- `participant_modality`: `individual`, `joint`, or `unknown`;
- participant-role-specific `missing_information`.

Rules:

- Do not invent roles if evidence does not declare them.
- Do not assume the menor is the insured principal if the document only links the menor to the education goal.
- Do not assume mancomunado if only one parent appears.
- Do not hide unclear roles in secondary details; unclear roles belong in missing information.

## Expected dashboard sections

R14A may implement a SeguBeca adapter with sections such as:

- Resumen del plan;
- Quiénes quedan protegidos / participantes;
- Lo que aportas;
- Meta educativa;
- Cómo se entrega;
- Lo que proteges;
- Beneficios incluidos;
- Coberturas u opciones adicionales;
- Otros detalles;
- `missing_information`.

These section labels are presentation planning only. They do not establish product facts, values, calculations, suitability, or recommendations.

## Candidate information contract

A future adapter should consume structured evidence such as:

```js
{
  product_type: "segubeca",
  product_family: "education_savings_life",
  participants: {
    primary_insured: null,
    joint_insured: null,
    child_or_education_beneficiary: null,
    participant_modality: "individual | joint | unknown",
    missing_information: []
  },
  contribution_summary: {},
  education_goal: {},
  payout_options: {},
  protection_summary: {},
  included_benefits: [],
  additional_coverages: [],
  secondary_details: [],
  missing_information: []
}
```

## Discovery inventory, sanitized

- Local SeguBeca PDF candidates found: `6`.
- Repo text hits for SeguBeca terminology: `230`.
- Filenames, client names, PDF contents, screenshots, hashes, contact data, and personal identifiers were not recorded.

## R14A allowed future boundary

- desktop product-dashboard adapter/configuration only;
- reusable template consumption;
- participant/role presentation when evidenced;
- education-goal, payout, contribution, and protection presentation when evidenced;
- clean `missing_information` output;
- tests and evidence.

## R14A prohibited future surfaces

- mobile UI;
- financial parsers or PDF intake unless separately authorized;
- schemas;
- routes;
- `app.js`;
- rule packs;
- client-specific or sensitive data;
- invented products, benefits, premiums, coverage, values, forecasts, roles, or recommendations;
- DOM overlay hacks;
- hardcoded education-goal amounts or marketing examples as universal facts.

## R14A entry conditions

- a new Constitutional Gate names the exact source files;
- Board approves implementation and user-facing behavior;
- Miranda confirms disciplined scope and preservation of product quality;
- Product Intelligence remains the semantic owner;
- mobile remains parked;
- parser, schema, route, `app.js`, and rule-pack prohibitions remain explicit unless separately authorized.

## R14A validation contract

- `node --check` for every changed JavaScript file;
- product-dashboard template tests;
- quote benefit-summary tests;
- Vida Mujer and Imagina Ser non-regression;
- Segubeca adapter/config tests;
- parser/intake tests only if parser/intake is separately authorized;
- `git diff --check`;
- privacy check on added lines;
- exact-path staging only.

## Closure

R14 discovery/readiness/registration is complete. No UI, runtime, parser, route, schema, rule, adapter, or business-logic implementation occurred. The next separately governed module is `R14A_SEGUBECA_PRODUCT_DASHBOARD_ADAPTER_IMPLEMENTATION`.

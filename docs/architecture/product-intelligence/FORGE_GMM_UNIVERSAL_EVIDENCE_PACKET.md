# Forge GMM Universal Evidence Packet

Status: PRE-IMPLEMENTATION / FINAL PRE-ENGINE DISCOVERY

## Purpose

Define the universal minimum packet for any GMM coverage question.

## Universal Packet Required Fields

### Product Evidence

Required:

- Exact product name or explicit product uncertainty.

Preferred documents:

- Policy caratula.
- Quote.
- Policy document.

Why:

Alfa Medical, Alfa Medical Flex and future GMM products can have different
coverage and financial models.

### Policy Evidence

Required:

- Policy/caratula availability.
- Policy active status or unknown.
- Product version if available.

Preferred documents:

- Caratula.
- Renewal document.
- Endorsement.

Why:

Coverage depends on active policy, product version and policy-specific values.

### Insured Evidence

Required:

- Person involved.
- Relationship to policy.
- Insured status or unknown.

Preferred documents:

- Caratula insured list.
- Endorsement.
- Policy inclusion document.

Why:

Benefits are insured-specific.

### Event Evidence

Required:

- Plain-language event description.
- Event family if known.
- Diagnosis or medically clear description if available.

Preferred documents:

- Medical diagnosis.
- Clinical note.
- Hospital record.
- Client/advisor statement for initial routing only.

Why:

Forge cannot choose rule families without event classification.

### Date Evidence

Required:

- Approximate date context.

Preferred facts/documents:

- Event date.
- First symptom date.
- Diagnosis date.
- First expense date.
- First attention date.

Why:

Waiting periods, accident rules and preexistence screens depend on dates.

### Territory Evidence

Required:

- Where care happened or will happen.

Preferred documents:

- Caratula territory.
- Hospital/location record.
- Foreign stay documentation if applicable.

Why:

National and foreign coverage paths differ.

### Optional Coverage Evidence

Required when relevant:

- Whether optional coverage appears in caratula or endorsement.

Why:

Foreign care, deductible elimination and certain benefits may require optional
coverage.

### Preexistence Indicator

Required:

- Known/unknown prior diagnosis, symptoms, treatment or expenses.

Preferred evidence:

- Medical records.
- Prior diagnosis.
- Prior expenses.
- Application declaration.

Why:

Preexistence can override apparent coverage.

## Universal Packet Outcome

If complete enough:

- Forge may route the case and ask event-specific questions.

If incomplete:

- Forge should ask the next most valuable question.

If product, event family or policy context is missing:

- Educational explanation only.

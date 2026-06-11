# Alfa Medical Question Strategy

Status: ARCHITECTURE DISCOVERY

## Purpose

Define what Forge should ask next when information is missing.

Goal:

- Minimize questions.
- Maximize clarity.
- Avoid unnecessary data collection.
- Avoid false certainty.

## Strategy Principle

Forge should not ask for the full policy packet upfront unless the event
requires it.

Forge should ask the next question that changes rule routing.

## Question Priority

### Priority 1: Product Routing

Ask:

"Can you confirm the exact product name on the caratula: Alfa Medical or Alfa
Medical Flex?"

Why:

Wrong product route creates wrong financial model.

### Priority 2: Event Family

Ask:

"What kind of situation is this: accident, illness, pregnancy/birth, care
abroad, medication, dental issue or a specific procedure?"

Why:

Event family determines which rule path applies.

### Priority 3: Key Date

Ask based on event:

- Accident: "When did the accident happen and when was the first medical
  attention or expense?"
- Illness: "When did symptoms first appear and when was it diagnosed?"
- Maternity: "What is the expected birth date or birth date?"
- Foreign: "When did care happen and how long has the insured been abroad?"

Why:

Waiting periods depend on timing.

### Priority 4: Policy / Caratula

Ask:

"Do you have the caratula? I need the policy start, territory, deductible,
coinsurance, cap, hospital level and optional coverages."

Why:

Case-specific assessment and financial participation depend on caratula.

### Priority 5: Preexistence Screen

Ask:

"Was this condition diagnosed, treated, symptomatic or generating expenses
before the policy started?"

Why:

Preexistence can override apparent coverage.

### Priority 6: Event-Specific Trigger

Ask only if event family needs it:

- Maternity: "Was this pregnancy through assisted reproduction?"
- Foreign: "Was foreign treatment programmed with the insurer?"
- High specialty: "Was prior authorization or second valuation obtained?"
- Medication: "Was the medication prescribed and purchased at a listed
  pharmacy?"
- Accident: "Was alcohol, professional sport, racing or a dangerous activity
  involved?"

## Question Minimization Pattern

### If product unknown

Ask only product.

Do not ask:

- Deductible.
- Coinsurance.
- Hospital.
- Diagnosis details.

### If event family unknown

Ask only event family.

Do not ask:

- Full medical history.

### If maternity detected

Ask in this order:

1. Is she the insured mother?
2. How old is she?
3. Expected birth date?
4. Has coverage been continuous for at least 10 months at birth?
5. Was assisted reproduction involved?
6. Can you share caratula values?

### If accident detected

Ask in this order:

1. Accident date.
2. First medical attention/expense date.
3. What caused it?
4. Any racing/professional sport/alcohol/drug involvement?
5. Where did it happen and where was it treated?

### If illness detected

Ask in this order:

1. Diagnosis.
2. First symptom date.
3. Diagnosis date.
4. First expense date.
5. Any prior diagnosis/treatment/expenses before policy?

### If foreign care detected

Ask in this order:

1. Country and care date.
2. Was it urgent or programmed?
3. Which foreign optional coverage appears on the caratula?
4. How long has the insured been abroad?
5. Did the insured authorize access to medical information?

### If high-specialty treatment detected

Ask in this order:

1. Treatment/procedure name.
2. Diagnosis.
3. Was it authorized as Event Programmed?
4. Was second valuation required/obtained?
5. Is provider certification documented?

## Output When Missing Information

Forge should say:

"To evaluate this responsibly, the next missing fact is [specific input]."

Forge should not ask:

"Please upload everything."

Unless:

- Multiple hard gates are open.
- The user wants a formal review.
- The event is high-specialty or foreign.

## Data Collection Boundary

Do not ask for sensitive details unless the rule path needs them.

Examples:

- Do not ask for alcohol/drug facts unless accident context is present.
- Do not ask for assisted reproduction unless maternity/pregnancy is present.
- Do not ask for COFEPRIS approval unless advanced medication/treatment is
  present.
- Do not ask for newborn relationship unless newborn benefit is involved.

## Final Strategy

Forge should behave like a careful advisor:

1. Identify the event.
2. Ask the next decisive question.
3. Explain why that question matters.
4. Stop before pretending certainty.

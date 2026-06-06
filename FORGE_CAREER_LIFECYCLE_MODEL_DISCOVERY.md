# FORGE Career Lifecycle Model Discovery

Status: ARCHITECTURE DISCOVERY

Scope:

- No implementation.
- No code.
- No UI.
- No schemas.
- No engines.
- No Build Tree modifications.
- No Career OS lock approval.

## 1. Objective

Discover the canonical Forge Career Lifecycle Model required before Career
Operating System can be constitutionally locked.

This discovery is not about company hierarchy, compensation hierarchy, org
chart or title naming. It is about the lifecycle Forge should model when it
interprets professional development, readiness, maturity, leadership context and
career movement.

## 2. Core Finding

Career Stage and Leadership Stage should be separate architectural dimensions.

They are related, but not the same.

Career Stage describes the person's professional maturity and commercial
development path.

Leadership Stage describes organizational responsibility for developing other
people or business units.

A person can be:

- A strong Professional Advisor with no leadership responsibility.
- A Partner-level producer who remains an individual contributor.
- A Manager with weak team activity.
- A Senior Partner who is not a Director.
- A Director who still requires stage-specific development support.

Therefore, a single linear hierarchy is not safe.

## 3. Definitions

### Stage

A stage is a durable lifecycle context that changes what Forge should evaluate,
explain and recommend.

A stage is not a title.

A stage is not a temporary status.

A stage is not a compensation label by itself.

Stage should affect:

- expected signals
- relevant risks
- development questions
- eligible intelligence domains
- appropriate manager visibility
- business planning context
- forecast interpretation
- coaching recommendations

### Transition

A transition is an evidence-supported movement from one stage context to another.

Transitions require facts or reviewed evidence. They must not be inferred from a
single weak signal.

Examples:

- Candidate becomes Precontract when accepted into a precontract lifecycle or
  activation process.
- Precontract becomes Advisor when the person formally converts or contracts.
- Advisor becomes Partner-level when sustained professional maturity and
  recognized commercial development evidence exist.
- Individual Contributor gains Leadership Stage when they own development
  responsibility for others.

### Progression

Progression is forward movement into a stage with broader responsibility,
stronger maturity, more durable production patterns or more strategic leverage.

Progression should be evidence-based and reversible only through an explicit
state change, not through one bad month.

### Regression

Regression is a material loss of stage conditions or operating maturity.

Regression should be modeled carefully. Forge should distinguish:

- temporary risk
- performance dip
- dormancy
- reactivation state
- formal stage regression

Not every decline is regression.

### Maturity

Maturity is not age, tenure or title.

Maturity is demonstrated through durable behavior, decision quality, commercial
consistency, evidence of development and ability to operate at the expectations
of the stage.

## 4. Candidate Career Stages Evaluated

Working hypothesis:

```text
Candidate
↓
Precontract
↓
Advisor
↓
Partner
↓
Senior Partner
↓
Managing Partner
```

Discovery verdict:

The model is useful but incomplete if treated as a single hierarchy.

Recommended canonical Career Stage model:

```text
Candidate
↓
Precontract
↓
Advisor
↓
Professional Advisor
↓
Partner
↓
Senior Partner
↓
Managing Partner
```

Recommended separate Leadership Stage model:

```text
Individual Contributor
↓
Manager
↓
Subdirector
↓
Director
```

## 5. Stage-by-Stage Evaluation

### Candidate

Keep.

Definition:

A person being evaluated for potential entry into the commercial career.

Primary question:

"Could this person become a productive professional, and what evidence supports
that?"

Primary domains:

- Candidate Intelligence
- Recruitment Intelligence
- Interview Intelligence
- Market Evidence
- Mick signals only where behavior evidence exists

Success is not production.

Success is evidence-supported potential, fit, character, market quality and
readiness for the next gate.

### Precontract

Keep.

Definition:

A person in a transition cycle between candidate and contracted advisor.

Primary question:

"Is this person becoming ready to operate as an advisor?"

Primary domains:

- Precontract Intelligence
- Activation Intelligence
- Recruitment Lifecycle
- Mick / Behavior Intelligence
- Manager coaching context

Success is readiness, activation, activity evidence, risk reduction and
conversion progress.

### Advisor

Keep, but define as early operating stage.

Definition:

A contracted advisor who is beginning or operating commercially but has not yet
shown durable professional maturity.

Primary question:

"What does this advisor need to build consistency and commercial capability?"

Primary domains:

- Advisor Experience
- Productivity Intelligence
- Relationship Intelligence
- NASH Conversation Intelligence
- Product Intelligence
- Policy & Sales Operations
- Mick / Behavior Intelligence

Success includes consistency, learning, client activity, relationship movement,
follow-through and evidence-based production development.

### Professional Advisor

Add.

Reason:

There is a meaningful difference between being contracted as an advisor and
being a mature professional advisor.

Definition:

An advisor with durable operating habits, client responsibility, relationship
development, business planning maturity and evidence of commercial consistency.

Primary question:

"How does this advisor grow, protect and optimize their practice?"

Primary domains:

- Business Planning
- Forecast Intelligence
- Conservation Intelligence
- Compensation Intelligence
- Relationship Intelligence
- Productivity Intelligence
- Policy & Sales Operations

Success includes durable client service, practice quality, conservation,
productivity, relationship development and planning discipline.

### Partner

Keep, but do not equate with manager.

Definition:

A professional with broader leverage through relationships, referrals, influence
or strategic contribution, with or without formal leadership responsibility.

Primary question:

"How does this person create leverage beyond individual production?"

Primary domains:

- Partner Intelligence
- Relationship Intelligence
- Referral Intelligence
- Business Planning
- Manager Intelligence only if leadership responsibility exists

Success includes leverage, network quality, strategic relationships, referral
generation, trust and influence.

### Senior Partner

Keep as candidate stage, but requires evidence.

Definition:

A mature partner-level professional with sustained leverage, strategic network
value and higher-order contribution.

Primary question:

"How does this professional compound leverage and mentor the ecosystem?"

Primary domains:

- Partner Intelligence
- Business Planning
- Forecast Intelligence
- Compensation Intelligence
- Manager Intelligence if leadership applies

Success includes durable leverage, ecosystem contribution, practice resilience
and strategic growth.

### Managing Partner

Keep, but likely hybrid stage.

Definition:

A senior career stage where partner-level leverage and organizational leadership
may converge.

Primary question:

"How does this professional lead a practice, business unit or ecosystem while
maintaining strategic commercial leverage?"

Primary domains:

- Partner Intelligence
- Manager Intelligence
- Team Intelligence
- Business Planning
- Compensation Intelligence
- Forecast Intelligence

Success includes leadership maturity, development of others, strategic growth,
organizational health and evidence-based operating cadence.

## 6. Should Any Stages Be Merged, Split, Renamed or Removed?

Candidate:

- Keep.
- Do not merge with Precontract.

Precontract:

- Keep.
- It has unique lifecycle and readiness rules.

Advisor:

- Keep, but define as contracted/operating stage.

Professional Advisor:

- Add or split from Advisor.
- Needed to distinguish contracted status from professional maturity.

Partner:

- Keep.
- Must not automatically mean manager.

Senior Partner:

- Keep as architecture candidate.
- Needs evidence definition before implementation.

Managing Partner:

- Keep as architecture candidate.
- Treat as hybrid of partner maturity and leadership responsibility.

Manager/Subdirector/Director:

- Do not merge into Career Stage.
- Model as Leadership Stage.

## 7. Evidence That Moves a Person Between Stages

Valid evidence may include:

- formal application status
- acceptance or rejection event
- key activation or equivalent activation event
- contract signed
- advisor conversion event
- production history
- activity history
- tenure in context
- client relationship evidence
- policy/service responsibility
- recruiting activity
- development activity
- team ownership
- office/unit assignment
- leadership responsibility
- rule pack or organization profile
- manager assignment
- human review when ambiguous

Evidence does not include:

- title alone
- one production spike
- one missed month
- motivation statement
- self-description without supporting facts
- manager opinion without evidence label
- compensation potential
- forecast
- UI selection alone
- generic CRM stage value

Compensation structure may be evidence, but must not be the sole stage owner.

Production history may be evidence, but must not be the only success criterion.

## 8. Can a Person Move Backward?

Yes, but Forge should not treat every decline as stage regression.

Forge should model:

- risk
- dormancy
- inactivity
- reactivation
- stage review needed
- formal regression only with evidence

Examples:

- An inactive advisor may remain Advisor but enter dormant or reactivation state.
- A partner with declining activity may remain Partner but enter partner-risk
  state.
- A manager without a team may lose Leadership Stage while preserving Career
  Stage.
- A precontract cycle may expire without erasing the person's Candidate
  identity.

Recommended distinction:

```text
Career Stage = durable lifecycle context
Operating State = current condition
Leadership Stage = organizational responsibility
```

## 9. Is Leadership Stage Independent?

Yes.

Career Stage and Leadership Stage should be separate dimensions.

Career Stage:

```text
Candidate
Precontract
Advisor
Professional Advisor
Partner
Senior Partner
Managing Partner
```

Leadership Stage:

```text
Individual Contributor
Manager
Subdirector
Director
```

Why separate:

- A partner can be an individual contributor.
- A manager can be early in partner maturity.
- A senior advisor may have no team.
- A director may need stage-specific business planning.
- Leadership can be gained, lost or paused independently.

Recommended model:

```text
PersonCareerContext
├── careerStage
├── operatingState
├── leadershipStage
├── assignments
├── evidence
└── effectivePeriod
```

This is conceptual only. No schema is approved.

## 10. Intelligence Domains by Stage

### Candidate

- Recruitment Intelligence
- Candidate Intelligence
- Interview Intelligence
- Market Evidence

### Precontract

- Precontract Intelligence
- Activation Intelligence
- Recruitment Lifecycle
- Mick / Behavior Intelligence

### Advisor

- Advisor Experience
- NASH
- Relationship Intelligence
- Productivity Intelligence
- Product Intelligence
- Policy & Sales Operations
- Mick / Behavior Intelligence

### Professional Advisor

- Business Planning
- Forecast Intelligence
- Conservation Intelligence
- Compensation Intelligence
- Relationship Intelligence
- Productivity Intelligence

### Partner

- Partner Intelligence
- Relationship Intelligence
- Referral Intelligence
- Business Planning
- Compensation Intelligence

### Senior Partner

- Partner Intelligence
- Business Planning
- Forecast Intelligence
- Conservation Intelligence
- Manager Intelligence if leadership applies

### Managing Partner

- Partner Intelligence
- Manager Intelligence
- Team Intelligence
- Business Planning
- Compensation Intelligence
- Forecast Intelligence

### Leadership Stage Domains

Manager, Subdirector and Director stages activate:

- Manager Intelligence
- Team Intelligence
- Coaching Intelligence
- Recruitment Intelligence
- Development Intelligence
- Manager Compensation Intelligence where applicable

## 11. Success by Stage

Success is stage-specific.

### Candidate

Success:

- reliable evidence of fit
- market quality
- character
- readiness
- informed accept/reject decision

Not success:

- production
- charisma alone
- manager enthusiasm without evidence

### Precontract

Success:

- activation progress
- activity proof
- readiness
- risk reduction
- conversion path clarity

Not success:

- fixed-day assumption
- one activity burst
- unsupported optimism

### Advisor

Success:

- consistency
- learning by doing
- prospecting and follow-up cadence
- relationship movement
- initial production evidence
- coachability in action

Not success:

- production only
- motivational statements
- CRM completion

### Professional Advisor

Success:

- durable productivity
- client responsibility
- conservation
- planning maturity
- relationship development
- repeatable operating cadence

Not success:

- one good month
- revenue without sustainability

### Partner

Success:

- network leverage
- referrals
- strategic relationships
- influence
- ecosystem trust
- contribution beyond isolated production

Not success:

- title only
- team ownership alone

### Senior Partner

Success:

- sustained leverage
- practice resilience
- strategic contribution
- mentorship
- durable growth

Not success:

- compensation level alone

### Managing Partner

Success:

- leadership maturity
- people development
- strategic growth
- team or unit health
- evidence-based management cadence
- partner-level leverage

Not success:

- org title alone
- control without development

## 12. Existing Discoveries That Depend on Career Stage

### Benvenù

Benvenù needs Career Stage to avoid giving the same first experience to a
candidate, advisor, manager and partner.

### Leopard Experience

Leopard should feel universal, but the emotional frame can adapt subtly to the
career context.

### Future You Conversation

Future You should ask different career-direction questions depending on stage.

### Purpose Snapshot

Purpose Snapshot must be interpreted relative to stage. A candidate's purpose is
not the same signal as a managing partner's purpose.

### Alfred

Alfred commands should be stage-aware. A candidate, advisor and manager should
not see the same intent surface.

### Business Planning

Business Planning requires Career Stage to translate ambition into realistic
action paths.

### Forecast Intelligence

Forecast interpretation depends on stage. Forecast for an early advisor is not
the same as forecast for a senior partner or manager.

### Compensation Intelligence

Compensation rules may depend on stage, but compensation must not own the stage.

### Mick

Behavior Intelligence must interpret behavior by stage. Candidate discipline,
advisor consistency and manager development behavior are different signals.

### Manager Intelligence

Manager Intelligence depends on both Career Stage and Leadership Stage.

### Partner Intelligence

Partner Intelligence depends on career maturity and network leverage, not simply
organizational hierarchy.

## 13. What Forge Must Never Assume

Forge must never assume:

- title equals career stage
- production equals maturity
- compensation equals stage
- manager equals partner
- partner equals manager
- leadership responsibility equals professional maturity
- inactivity equals permanent regression
- one bad month changes stage
- one strong month proves progression
- candidate identity disappears after failed precontract
- purpose means motivation score
- career stage can be inferred without evidence
- company-specific hierarchy is universal Forge Core

## 14. Should Career Stage Become First-Class?

Verdict:

YES, as a first-class architectural primitive candidate.

Reason:

Career Stage affects interpretation across nearly every major Forge domain. It
changes the meaning of activity, risk, forecast, compensation, coaching,
planning, onboarding and partner development.

However, first-class does not mean hardcoded company hierarchy.

Career Stage should be universal enough for Forge Core while allowing rule packs
and organization profiles to interpret local labels.

## 15. Final Verdict

CANDIDATE FOR LOCK.

Detailed reasoning:

The canonical model should not be a single company ladder.

Forge should model Career Stage, Operating State and Leadership Stage as
separate architectural contexts.

Recommended lifecycle:

```text
Candidate
Precontract
Advisor
Professional Advisor
Partner
Senior Partner
Managing Partner
```

Recommended leadership dimension:

```text
Individual Contributor
Manager
Subdirector
Director
```

This is strong enough to support Career OS as an architecture candidate, but not
yet enough to ratify Career OS constitutionally. The next lock review should
define ownership, evidence contracts and rule-pack boundaries for Career Stage.

Verdict:

CANDIDATE FOR LOCK.

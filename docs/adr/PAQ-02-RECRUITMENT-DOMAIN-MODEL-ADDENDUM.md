# PAQ-02 Recruitment Domain Model Addendum

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](../archive/FORGE_FOUNDATION_LOCK.md)

---


### New evidence reviewed

ES Leccion 1.pdf
ES Leccion 2.pdf
ES Leccion 3.pdf

### Reviewed locations

/storage/emulated/0/Download/Quick Share/ES Leccion 1.pdf
/storage/emulated/0/Download/Quick Share/ES Leccion 2.pdf
/storage/emulated/0/Download/Quick Share/ES Leccion 3.pdf

### Purpose
Delta analysis only.

This document does not rewrite PAQ-02.
This document does not create code.
This document does not create engines.
This document does not create schemas.
This document does not modify UI.
This document does not commit changes.


## 1. Confirmed Assumptions

1.1 Recruitment Intelligence is a valid Intelligence Phase domain.

Confirmed.

The training material confirms that prospecting is not an optional activity.
It describes prospecting as the central or root activity of the sales cycle.

ES Leccion 3 establishes that prospecting is the point of departure for the entire sales cycle and that the cycle must keep turning continuously.

### Impact
Recruitment Intelligence remains a valid domain and becomes even more important than PAQ-02 originally stated.


1.2 Recruitment is not merely a spreadsheet funnel.

Confirmed.

The training material frames the advisor career as a relationship-based commercial system.

### It repeatedly emphasizes

Community relationships.
Natural groups.
Networks.
Referrals.
Centers of Influence.
Market Natural.
Prospecting discipline.

### Impact
PAQ-02 correctly rejected copying Reclutamiento.xlsx and correctly moved toward domain semantics.


1.3 P200 is not only recruitment.

Confirmed.

### The training documents describe a broader concept

Market Natural.
Proyecto de Marketing.
People known by the advisor.
Groups where the advisor belongs.
Relationship inventory.
Natural markets.

The workbook P200 aligns with this broader structure.

### Impact
PAQ-02 was correct to say that P200 should not be treated as recruitment-only.


1.4 Magic Question is not just a source.

Confirmed.

The training material repeatedly describes referrals and networks as compounding.

It states that people know more people and that referrals can produce an effectively continuous source of prospects.

### Impact
### PAQ-02 was correct to model PM as

Source.
Loop.
Network.
Activity.
Event.
Metric source.


1.5 Recruitment Network should be first-class.

Confirmed.

The training material validates that referral chains and centers of influence are structurally important, not incidental.

### It describes

People referring people.
Centers of Influence opening access to groups.
Referrals creating trust before contact.
Groups leading to more groups.
Objects or situations triggering people.

### Impact
Recruitment Network remains required.


1.6 Recruitment Risk should be first-class.

Confirmed.

The training material explicitly describes the roller coaster effect caused by stopping prospecting.

It shows that failure to prospect today creates future absence of people to contact, future stress and future sales inconsistency.

### Impact
Recruitment Risk should remain a first-class interpretation model.


1.7 Inactivity predicts future productivity decline.

Confirmed.

The roller coaster example confirms that prospecting inactivity has delayed consequences.

The absence of current prospecting does not always hurt current sales immediately.
It hurts future appointments, future presentations, future closes and future production.

### Impact
Recruitment activity is a leading indicator of future productivity.


1.8 Forecasting future talent shortage from recruiting behavior is valid.

Confirmed with guardrail.

Forge can forecast risk of future talent shortage or future pipeline shortage from:

Low prospecting activity.
Low name creation.
Weak source mix.
Weak referral activity.
Low P200/Market Natural depth.
Low appointment creation.

### Guardrail
Forecast remains suggestion, not fact.


## 2. Invalid Assumptions

2.1 Recruitment begins with a name.

Invalidated.

The training material shows that recruitment/prospecting begins before a name is entered.

### It begins with

Relationships.
Community membership.
Groups.
Market Natural.
Known people.
People connected to other people.
Centers of Influence.
Objects and situations that reveal people.

### Required correction
The canonical upstream chain should not begin with Name.

It should begin with Relationship Capital.

### Corrected chain

Relationship Capital
Market Natural
Community / Group
Person known or reachable
Name
Prospect
Candidate


2.2 P200 is primarily a recruitment artifact.

Invalidated.

P200 is better understood as a concrete artifact of Market Natural / Proyecto de Marketing.

It can feed recruitment, but it is not only recruitment.

### Required correction
PAQ-02 should explicitly state that Recruitment consumes P200 as evidence of relationship capital and market capacity.


2.3 Recruitment creates relationship capital.

Partially invalidated.

Recruitment can expand relationship capital, especially through referrals and Magic Question.

But the training material shows that Recruitment mostly consumes pre-existing relationship capital:

Family.
Friends.
Community.
Past associations.
Current associations.
Centers of Influence.
Groups.
Service providers.
Professional networks.

### Required correction
Recruitment Intelligence should be modeled as a consumer and activator of Relationship Capital, not the original owner of all relationship capital.


2.4 Source taxonomy is sufficient to explain origin.

Partially invalidated.

NOM, CI, RDA, OP, PM and FF are useful operational source labels, but official training material shows deeper structures underneath sources:

Relationship type.
Community group.
Trust path.
Familiarity.
Influence.
Need segment.
Network path.
Market Natural.

### Required correction
Source model should include relationship context, not only source code.


2.5 P200 completion alone indicates market strength.

Invalidated or at least weakened.

Training material explicitly notes that the size of the list is important, but what the advisor does with the names matters more.

### Required correction
P200 should be evaluated by activation, classification, contactability, relationship quality, referral potential and downstream conversion.


## 3. New Architectural Discoveries

3.1 Relationship precedes name.

### Discovery
The training material establishes that the advisor's career is based on relationships with people.

### Architecture implication
RecruitmentCandidate should not be the first conceptual primitive in the funnel.

The upstream primitive is relationship access.

### Corrected conceptual flow

Relationship
Community / Group
Market Natural
Person
Name
Prospect
Candidate
Interview
Connected
Signed


3.2 Market Natural is relationship capital.

### Discovery
Market Natural is not merely a prospect list.

It is the advisor's initial relationship capital:

People known.
Groups joined.
Past associations.
Current associations.
Professional/community access.
People who recognize the advisor's name.

### Architecture implication
P200 / Proyecto de Marketing should be interpreted as evidence of relationship capital.


3.3 Things mean people.

### Discovery
Training material explicitly teaches that "people mean people" and "things mean people."

### Meaning
Recruitment opportunity can be triggered not only by explicit referrals, but also by objects, situations, places, employers, events, family facts, service providers and organizations.

### Architecture implication
Recruitment Intelligence needs signal extraction from relationship context.

### Examples

Mentioned employer.
Mentioned school.
Mentioned club.
Mentioned doctor.
Mentioned jewelry store.
Mentioned promotion.
Mentioned new baby.
Mentioned service provider.

These are not candidates yet.
They are prospecting triggers.


3.4 Centers of Influence are relationship amplifiers.

### Discovery
CI is not just a source label.

A Center of Influence is a respected person who can influence actions of others and open access to groups.

### Architecture implication
CI should be modeled as a relationship node with influence quality, group access and trust transfer.


3.5 Referral trust is causal.

### Discovery
Training material states that referrals matter because they create attention, pre-establish value and transfer trust before first contact.

### Architecture implication
Source Quality Model should include trust transfer as a causal factor, not only a descriptive tag.


3.6 Prospecting is the root rhythm of production.

### Discovery
The roller coaster effect proves that prospecting has delayed impact.

### Architecture implication
Recruitment Risk and Productivity Risk are causally linked through time.

Inactivity today can forecast pipeline shortage later.


3.7 Career Capital is real as a concept.

### Discovery
The training material supports a higher-order concept beyond Recruitment:

Career Capital.

### Possible components

Market Natural.
Community membership.
Group access.
Centers of Influence.
Referrals.
Relationship graph.
Social graph.
Professional graph.
Trust capital.
Familiarity.
Need segmentation knowledge.

### Architecture implication
Recruitment Intelligence appears to consume Career Capital.

### However
This addendum should not create a new domain.

It should mark Career Capital as a discovered higher-order concept requiring architectural evaluation before formal adoption.


## 4. Required Changes to Paq-02

4.1 Change the upstream funnel definition.

### Current PAQ-02 tendency
Source
Name
P200 / market evidence
EI
ES
EC
EA
Connected
Signed

### Required delta
### Add upstream relationship layer

Relationship Capital
Community / Group
Market Natural
Person known or reachable
Name
Prospect
Candidate
EI
ES
EC
EA
Connected
Signed


4.2 Update RecruitmentCandidate boundary.

### Required delta
RecruitmentCandidate should begin when a person enters a recruitment process.

Before that, the person may be:

CommercialPerson.
Relationship node.
Market Natural contact.
Referral possibility.
Prospecting trigger.
P200 entry.

Not every relationship or name is a RecruitmentCandidate.


4.3 Update P200 semantics.

### Required delta
### P200 should be described as

Evidence of Market Natural.
Evidence of relationship capital.
Input to Recruitment Intelligence.
Leading indicator of future prospecting capacity.
Possible activity artifact.
Possible snapshot.

It should not be owned exclusively by Recruitment Intelligence.


4.4 Update Source Model.

### Required delta
### Source should include

Source label.
Relationship path.
Trust transfer.
Community/group origin.
Influence node.
Referral chain.
Familiarity.
Evidence.

NOM, CI, RDA, OP, PM and FF are not enough by themselves.


4.5 Strengthen Magic Question Network Model.

### Required delta
PM should be treated as a network-generation mechanism, not merely a source code.

Magic Question creates graph expansion.

### The value of PM should be measured by

Referral count.
Referral quality.
Referral depth.
Conversion.
Trust transfer.
Network continuation.


4.6 Add Prospecting Trigger concept.

### Required delta
Recruitment Intelligence needs a concept for signals that reveal people before they become names.

### Examples

People mentioned in conversation.
Organizations mentioned.
Service providers mentioned.
New job.
Promotion.
Baby.
Club membership.
School group.
Professional group.

This is the architectural implication of "things mean people."


4.7 Promote Recruitment Risk.

### Required delta
Recruitment Risk should be first-class in PAQ-02.

### It should include

Name shortage risk.
Warm relationship shortage risk.
Prospecting inactivity risk.
Roller coaster risk.
Stage bottleneck risk.
Network depletion risk.
P200 unactivated risk.
Referral failure risk.


4.8 Add delayed-effect clocks.

### Required delta
PAQ-02 should recognize that recruitment behavior has delayed consequences.

Current inactivity may not show in current production.
It can show later as future appointment shortage, future candidate shortage, future advisor shortage and future productivity shortage.

Recruitment Intelligence therefore needs future risk windows.


4.9 Clarify Relationship Intelligence dependency.

### Required delta
Recruitment Intelligence consumes Relationship Capital and relationship graph context.

It may create new relationship edges through PM, referrals and CI.

But it should not own the full relationship graph.


4.10 Keep Career Capital as discovered, not ratified.

### Required delta
PAQ-02 should mention Career Capital as a discovered candidate concept.

It should not declare it a locked domain yet.


## 5. New Domains Discovered

5.1 Relationship Graph / Relationship Capital

### Discovery status
Strongly indicated.

### Evidence
Training material repeatedly states that the career is based on relationships, groups, community, people knowing people and referrals.

### Possible responsibility
Represent social, professional, family, community and influence relationships that exist before a specific recruitment, sales or revenue process.

### Relationship to Recruitment
Recruitment consumes Relationship Capital to produce names, prospects, candidates and referral loops.

### Status
### Discovered.
### Not Approved.
### Not Implemented.


5.2 Career Capital

### Discovery status
Strongly indicated.

### Possible components

Market Natural.
Community membership.
Associations.
Centers of Influence.
Referral access.
Professional graph.
Social graph.
Trust capital.
Prospecting comfort.
P200 / Proyecto de Marketing.

### Relationship to Recruitment
Recruitment Intelligence consumes and activates Career Capital.

### Relationship to Productivity
Career Capital may be a leading indicator of future productivity.

### Status
### Discovered.
### Not Approved.
### Not Implemented.


5.3 Prospecting Intelligence

### Discovery status
Possible but not yet separate.

### Evidence
Training material treats prospecting as the central activity of the sales cycle, not only recruitment.

### Prospecting applies to

Client acquisition.
Advisor recruitment.
Referrals.
Centers of Influence.
Market Natural.

### Relationship to Recruitment
Recruitment may be one use case of a broader prospecting discipline.

### Status
DISCOVERED AS POSSIBLE HIGHER-ORDER CONCEPT.
### Do Not Create Domain Yet.


5.4 Recruitment remains valid.

### Important
The new discoveries do not eliminate Recruitment Intelligence.

They clarify that Recruitment Intelligence begins downstream of Relationship Capital and Market Natural.

### Recruitment is still needed to manage

Candidate funnel.
Interview stages.
Connection.
Signing.
Recruitment risk.
Source quality.
Recruitment network.
Recruitment decisions.


## 6. Recommended Next Step

## Recommended Next Step

Do not rewrite PAQ-02.

Create a PAQ-02 delta revision note or incorporate this addendum into PAQ-02 as an official addendum.

### Then perform a focused architecture review titled

Career Capital and Relationship Capital Boundary Review

### Purpose
### Determine whether Career Capital should be

1. A concept inside Shared Commercial Model.
2. A subdomain of Relationship Intelligence.
3. A dependency consumed by Recruitment Intelligence.
4. A future independent domain.

Do not implement.

Do not create schemas.

Do not create engines.

### Immediate required update to Recruitment Domain Model

### Change the root chain from

Name
Prospect
Candidate

### To

Relationship Capital
Market Natural
Person
Name
Prospect
Candidate

### Final addendum verdict

PAQ-02 remains valid as an ARCHITECTURE CANDIDATE.

However, it must be amended before Architecture Lock.

### The major correction is

Recruitment does not begin with names.

Recruitment begins with relationship capital.

### The official domain interpretation should become

Recruitment Intelligence converts relationship capital into candidate flow, candidate flow into advisor creation, and advisor creation into future Partner capacity.

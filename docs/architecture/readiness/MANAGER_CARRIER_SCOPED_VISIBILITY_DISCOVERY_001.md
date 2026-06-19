# MANAGER CARRIER SCOPED VISIBILITY DISCOVERY 001

Status: DISCOVERY LOCK
Scope: Manager OS visibility, advisor multi-carrier context, consent boundaries, carrier-scoped access
Primary systems: Manager OS, Advisor OS, Alfred, Evidence Layer, Supabase RLS

## 1. Discovery Statement

Forge OS may understand an advisor multi-carrier commercial context.

However, each manager must only see the activity, pipeline, evidence and coaching surfaces authorized by carrier, organization, team, role and consent scope.

Canonical rule:
Forge may know more than a manager can see.

## 2. Core Principle

Advisor context and manager visibility are not the same thing.

Forge can use full advisor context to help the advisor make better decisions.

Manager OS must only expose the subset that belongs to that manager authorized scope.

Canonical rule:
Full context for the advisor. Scoped visibility for the manager.

## 3. Example

An advisor works with SMNYL, GNP and AXA.

Forge may understand the advisor complete commercial activity across all carriers if the advisor authorizes it.

A SMNYL manager must only see SMNYL-authorized activity, SMNYL pipeline, SMNYL coaching signals and SMNYL-relevant advisor behavior.

The SMNYL manager must not see GNP or AXA client details, production, notes, pipeline, compensation, strategy or private advisor context.

## 4. Visibility Boundary

Manager visibility must be filtered by:

- carrier_id
- organization_id
- team_id
- manager_id
- advisor_id
- role
- consent scope
- data category
- evidence category
- time range when applicable

## 5. Advisor Consent

Advisor consent is required for multi-carrier context aggregation.

Consent must be explicit, revocable and auditable.

Forge must distinguish between:

- data Forge may process for advisor assistance
- data a specific manager may see
- data used only in private advisor coaching
- data used in anonymized aggregate insights

## 6. Manager OS Allowed Surfaces

A manager may see only authorized surfaces such as:

- activity totals in scope
- funnel movement in scope
- confirmed meetings in scope
- pipeline stages in scope
- coaching bottlenecks in scope
- team-level aggregate patterns in scope
- advisor progress related to manager-authorized business

## 7. Manager OS Forbidden Surfaces

A manager must not see:

- other carrier production
- other carrier prospects
- other carrier compensation
- private advisor notes outside scope
- private bitacoras outside scope
- raw voice notes
- personal advisor life context unless explicitly relevant and authorized
- cross-carrier strategy unless consented and role-authorized
- AI-inferred sensitive claims

## 8. Evidence First Requirement

Manager summaries must be grounded in authorized evidence.

Manager OS must not infer hidden activity from private advisor context.

If evidence is outside manager scope, Manager OS must treat it as unavailable.

Canonical rule:
Unknown to this manager remains unknown.

## 9. WALL-E Compliance

Manager OS must support better coaching, not surveillance.

Scoped visibility must prevent coercive overreach.

Manager insights should answer:

- Where is this advisor stuck?
- What conversation should I have?
- What support would help?
- What action is within my authorized role?

Manager insights should not become:

- cross-carrier spying
- hidden productivity surveillance
- pressure without context
- punishment automation
- manager omniscience

## 10. Supabase RLS Direction

Future implementation should use Supabase RLS and application-level policies to enforce scoped visibility.

RLS must prevent manager access to rows outside authorized scope.

Application code must not rely only on frontend filtering.

Canonical rule:
Frontend hiding is not security.

## 11. AI Boundary

AI must not bypass visibility boundaries.

AI prompts, summaries and recommendations for managers must be generated only from data authorized for that manager.

AI output is never source truth.

AI must not reveal hidden advisor context through summaries, hints or inferred language.

## 12. Open Questions

- How should advisor consent be granted and revoked?
- Should consent be carrier-specific, manager-specific or organization-specific?
- What data categories require explicit separate consent?
- How should cross-carrier aggregate insights be anonymized?
- What manager roles exist beyond direct manager?
- What should happen when advisor changes manager or carrier?
- What audit trail is required for manager access?

## 13. Forbidden Drift

This discovery must not introduce implementation changes.

Do not add migrations here.
Do not change RLS here.
Do not change Manager OS behavior here.
Do not change Advisor OS behavior here.
Do not add UI here.

This document only locks the visibility principle and discovery direction.

## 14. Canonical Phrases

Forge may know more than a manager can see.

Full context for the advisor. Scoped visibility for the manager.

Unknown to this manager remains unknown.

Frontend hiding is not security.

Manager OS is for coaching, not surveillance.

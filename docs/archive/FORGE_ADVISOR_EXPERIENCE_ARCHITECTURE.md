# FORGE Advisor Experience Architecture v1.0

Purpose:

Formalize Advisor Experience as the Forge domain responsible for adoption, learning, discovery, and progression of the advisor.

This document is architecture only. It does not create engines, schemas, UI, calculations, tests, AI calls, or implementation logic.

## Scope

Advisor Experience exists because Forge can have strong business engines while still failing if the advisor does not discover, understand, trust, and use them.

Advisor Experience owns:

- First experience.
- Advisor setup.
- Baseline capture and interpretation.
- Progressive discovery.
- Contextual help.
- Feature learning state.
- Adaptive difficulty.
- Introduction to Revenue Intelligence.
- Introduction to Command OS.

Advisor Experience does not own:

- Business rules for Revenue Intelligence.
- Behavior scoring for Mick.
- Compensation calculations.
- Product rules.
- Policy operations.
- UI decoration without decision value.
- Chatbot behavior.
- Corporate tutorials.

## Principles

### Advisor First

The advisor is the primary client of Forge. The manager is secondary and exists to develop advisors, not to displace advisor-first clarity.

### Value Before Work

Forge must generate value before asking for manual work, capture, setup, or configuration. If Forge asks for data, it must explain the decision or action that data will enable.

### Decision Clarity First

Advisor Experience must help the advisor understand what something means, why it matters, and what to do next.

### Economic Clarity

Commercial metrics should translate into money earned, money potential, or money at risk when explicit data and confirmed rules support it.

### Learning By Doing

Learning is measured by behavior, not screens viewed. The advisor has learned when they can complete meaningful work without unnecessary help.

### Benvenù Principle

The first Forge experience must create adoption and signal that Forge is not another CRM. It must not be a tutorial, PDF, form, or corporate training flow.

### Clippy Principle

Contextual help must be useful, quiet, and non-invasive. It appears only when it adds value and disappears when the advisor has learned.

### Candy Crush Experience Principle

Forge adapts complexity to the advisor's current level. When the advisor is frustrated, Forge reduces complexity. When the advisor progresses, Forge increases challenge.

Forge must never be so difficult that it creates abandonment, or so easy that it creates complacency.

## Domain Map

### Advisor Setup

Responsibility:

- Establish minimum advisor context without creating a traditional onboarding flow.
- Capture or infer only what is needed to create early value.

Inputs:

- Advisor identity.
- Manager assignment.
- Career stage.
- Product focus.
- Existing portfolio or production data.
- Explicit advisor goals.

Outputs:

- Setup completeness.
- Missing context.
- First value opportunity.
- Baseline inputs.

Dependencies:

- Shared Commercial Domain.
- Career Intelligence.
- Manager assignment.
- Revenue Intelligence.

### Benvenù Experience

Responsibility:

- Create the first emotional and practical experience of Forge.
- Help the advisor feel that Forge is different from a CRM.

Inputs:

- Advisor setup context.
- Baseline signals.
- Manager assignment.
- Product focus.
- Revenue opportunities.
- Command OS capabilities.

Outputs:

- Advisor Baseline Snapshot.
- Initial goal.
- Product focus.
- First recommended action.
- Command Palette introduction.
- Revenue Intelligence introduction.

Boundaries:

- Not a form.
- Not a tutorial.
- Not a PDF.
- Not corporate training.
- Not a visual imitation of another product.

### Advisor Baseline Snapshot

Responsibility:

- Capture the advisor's starting commercial position.
- Create a persistent reference point for progression.

Possible contents:

- Current stage.
- Product focus.
- Revenue baseline.
- Activity baseline.
- Relationship / opportunity baseline.
- Manager assignment.
- Initial risk.
- Initial next action.

Outputs:

- Starting point for Revenue Intelligence.
- Starting point for Mick.
- Starting point for Economic Motivation.
- Starting point for progressive discovery.

### Progressive Discovery

Responsibility:

- Reveal Forge capabilities as the advisor needs them.
- Avoid overwhelming the advisor with all features at once.

Inputs:

- Feature learning state.
- Current workflow.
- Friction signals.
- Opportunity signals.
- Advisor stage.

Outputs:

- Contextual feature reveal.
- Suppressed irrelevant help.
- Next learning opportunity.

### Clippy Engine

Responsibility:

- Provide contextual help without interruption.
- Explain a feature, metric, opportunity, or action only when it adds value.

Rules:

- Never block work.
- Never behave as a chatbot.
- Never repeat irrelevant help.
- Never teach what the advisor has already learned.
- Never invent business recommendations.

Valid examples:

- Explain a renewal when it affects action.
- Explain Bono Vida when the advisor is viewing compensation context.
- Explain income risk when explicit data supports it.
- Introduce a new function when the current workflow would benefit from it.
- Detect an opportunity and point to the action.

### Feature Learning State

Responsibility:

- Track whether the advisor has discovered, tried, completed, and learned a function.

Approved conceptual states:

- `unseen`
- `introduced`
- `tried`
- `completed_with_help`
- `completed_without_help`
- `learned`
- `suppressed`
- `needs_refresh`

Learning signals:

- Advisor completed the action with help.
- Advisor repeated the action without help.
- Advisor used Command Palette for the task.
- Advisor stopped making the same error.
- Advisor completed the task faster.
- Advisor ignored help and no risk remained.

Boundary:

- A screen view is not proof of learning.

### Contextual Help Signals

Responsibility:

- Determine when help should appear, stay hidden, or be refreshed.

Inputs:

- Current workflow.
- Repeated errors.
- Time stuck.
- Abandoned task.
- New capability relevant to the current action.
- Revenue opportunity.
- Compensation risk.
- Policy operation risk.
- Learning state.

Outputs:

- Show help.
- Hide help.
- Suppress help.
- Refresh help.
- Escalate to action recommendation.

### Candy Crush Experience

Responsibility:

- Adapt difficulty, complexity, goals, coaching, and discovery to the advisor's current level.

Inputs:

- Frustration signals.
- Progress signals.
- Feature learning state.
- Mick behavior signals.
- Goal completion.
- Revenue progress.
- Task completion history.

Outputs:

- Reduced complexity.
- Increased challenge.
- Adjusted coaching.
- Adjusted goal framing.
- Adjusted feature discovery.

Boundaries:

- Not superficial gamification.
- Not badges disconnected from production.
- Not lowering commercial standards.
- Not optimizing engagement over outcomes.

## Dependencies

Advisor Experience depends on:

- Shared Commercial Domain for person, role, assignment, and rule snapshots.
- Career Intelligence for stage and lifecycle context.
- Revenue Intelligence for opportunities and first value.
- Mick / Behavior Intelligence for behavior, discipline, and execution signals.
- Compensation Intelligence for economic meaning and income clarity.
- Command OS for command discovery and action execution.
- Policy & Sales Operations for policy context and operational help.
- Learning Intelligence for long-term learning and adaptation.

## Relationship With Revenue Intelligence

Revenue Intelligence identifies commercial opportunity.

Advisor Experience helps the advisor discover and act on that opportunity.

Examples:

- Benvenù introduces the first revenue opportunity.
- Clippy explains why an opportunity matters in the current context.
- Candy Crush Experience adjusts goal difficulty and discovery pace.

Boundary:

- Revenue Intelligence decides opportunity.
- Advisor Experience decides how the advisor discovers and adopts the workflow.

## Relationship With Mick

Mick measures behaviors that produce results.

Advisor Experience measures adoption, learning, and progressive mastery of Forge.

Overlap:

- Both care about behavior.
- Both consume activity and execution signals.
- Both can inform coaching.

Boundary:

- Mick asks whether the advisor is doing the behaviors that create outcomes.
- Advisor Experience asks whether the advisor understands and uses Forge well enough to execute those behaviors.

## Relationship With Compensation

Compensation Intelligence explains commissions, contests, conservation, and economic outcomes.

Advisor Experience makes those explanations discoverable, understandable, and actionable.

Examples:

- Clippy explains Bono Vida only in relevant compensation context.
- Economic Clarity translates a gap into money earned, potential, or at risk.
- Candy Crush Experience reduces complexity when compensation concepts overwhelm the advisor.

Boundary:

- Compensation Intelligence is the source of financial truth.
- Advisor Experience is the adoption and explanation layer.

## Relationship With Command OS

Command OS provides command execution, search, quick actions, and navigation.

Advisor Experience introduces Command OS progressively and teaches it through use.

Examples:

- Benvenù introduces the Command Palette.
- Clippy suggests a command when it shortens the current workflow.
- Feature Learning State tracks whether the advisor can use command-driven workflows without help.

Boundary:

- Command OS owns commands.
- Advisor Experience owns discovery, learning, and adoption of commands.

## Risks

Benvenù risks:

- Becoming a decorative intro without value.
- Becoming a traditional onboarding form.
- Asking for work before giving value.
- Copying another product's emotional language.
- Showing invented financial goals.

Clippy risks:

- Becoming invasive.
- Becoming a chatbot.
- Repeating irrelevant help.
- Teaching already learned functions.
- Blocking the advisor's workflow.
- Creating dependency instead of mastery.

Candy Crush Experience risks:

- Becoming superficial gamification.
- Reducing standards too much.
- Increasing difficulty too fast.
- Confusing productive challenge with bad friction.
- Optimizing engagement instead of commercial results.

Domain risks:

- Treating Advisor Experience as UI only.
- Duplicating Revenue, Mick, Compensation, or Command OS logic.
- Measuring learning by page views.
- Asking for manual capture where Forge can infer from reliable data.

## Roadmap

### Phase 1: Advisor Experience Knowledge Closure

- Define Advisor Setup.
- Define Benvenù.
- Define Advisor Baseline Snapshot.
- Define Feature Learning State.
- Define contextual help rules.
- Define adaptive difficulty principles.

### Phase 2: Shared Signal Model

- Identify adoption signals.
- Identify learning signals.
- Identify frustration signals.
- Identify progress signals.
- Identify suppression rules.

### Phase 3: Benvenù Foundation

- Create first-experience architecture.
- Define permanent outputs.
- Define value-before-work rules.

### Phase 4: Progressive Discovery Foundation

- Define contextual reveal rules.
- Define help eligibility rules.
- Define learned / suppressed behavior.

### Phase 5: Candy Crush Experience Foundation

- Define difficulty model.
- Define when to reduce complexity.
- Define when to increase challenge.
- Define guardrails against superficial gamification.

### Phase 6: Domain Integration

- Connect Revenue Intelligence introductions.
- Connect Mick behavior signals.
- Connect Compensation economic clarity.
- Connect Command OS discovery.

## Architecture Decision Record

### ADR-0001: Advisor Experience Domain

Status:

- Approved for architecture.
- Planned.
- Not implemented.

Problem:

Forge has business engines for revenue, sales conversion, relationship intelligence, product intelligence, policy operations, compensation, manager intelligence, and command execution.

However, Forge does not yet have a formal domain responsible for whether the advisor discovers, learns, adopts, and progresses through those capabilities.

Without this domain, Forge risks becoming powerful but under-adopted.

Context:

Recent Compensation Intelligence architecture work exposed a broader product gap:

- Advisors need economic clarity, not only metrics.
- Advisors need first value before setup burden.
- Advisors need progressive discovery instead of feature overload.
- Advisors need contextual help that disappears after learning.
- Advisors need complexity adapted to their current level.

Decision:

Create `11 ADVISOR EXPERIENCE` as a formal planned domain in Forge architecture.

This domain includes:

- Advisor Setup.
- Benvenù Experience.
- Advisor Baseline Snapshot.
- Progressive Discovery.
- Clippy Engine.
- Feature Learning State.
- Contextual Help Signals.
- Revenue Intelligence Introduction.
- Command Palette Introduction.
- Candy Crush Experience.

Consequences:

- Advisor Experience becomes the owner of adoption, learning, discovery, and progression.
- Revenue Intelligence, Mick, Compensation, and Command OS remain sources of business truth and behavior/action logic.
- Advisor Experience consumes those domains but does not duplicate them.
- Future UI work must satisfy Value Before Work and Learning By Doing.
- Future contextual help must be non-invasive and behavior-aware.
- No implementation should begin until the Advisor Experience knowledge and signal model are closed.

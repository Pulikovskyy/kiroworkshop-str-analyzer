# Story Generation Plan — STR Analyzer

## Overview
This plan defines how user stories will be created for the STR Analyzer, covering the rule engine, alert review workflow, case management, and STR reporting features.

---

## Planning Questions

### Question 1: Story Granularity
What level of granularity should the user stories follow?

A) Coarse-grained (1 story per major feature/page — ~8-10 stories total)

B) Medium-grained (1 story per user action within each feature — ~20-25 stories)

C) Fine-grained (detailed stories with sub-tasks per UI interaction — ~40+ stories)

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Medium-grained (1 story per user action within each feature — ~20-25 stories)


---

### Question 2: Story Organization
How should stories be organized?

A) User Journey-Based — stories follow the analyst workflow: seed → run engine → review alerts → approve → tag STR → export

B) Feature-Based — stories grouped by system feature: Transactions, Rules, Alerts, Suspicious Transactions, STR Register, Cases, Dashboard

C) Epic-Based — high-level epics (Data Setup, Detection Engine, Alert Review, STR Filing) with child stories under each

D) Other (please describe after [Answer]: tag below)

[Answer]: A) User Journey-Based — stories follow the analyst workflow: seed → run engine → review alerts → approve → tag STR → export

---

### Question 3: Acceptance Criteria Format
What format should acceptance criteria use?

A) Given/When/Then (BDD-style, e.g., "Given I am on the Alerts page, When I click Approve, Then the alert moves to Suspicious Transactions tab")

B) Checklist format (bullet list of conditions that must be true for the story to be done)

C) Both — Given/When/Then for workflow stories, Checklist for data/setup stories

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Given/When/Then (BDD-style, e.g., "Given I am on the Alerts page, When I click Approve, Then the alert moves to Suspicious Transactions tab")


---

### Question 4: Persona Depth
How detailed should the persona definitions be?

A) Minimal — name, role, one-line goal (just enough to reference in stories)

B) Standard — name, role, goals, pain points, typical day (enough for empathy and design decisions)

C) Comprehensive — full persona cards with demographics, tech comfort, motivations, frustrations, success metrics

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Standard — name, role, goals, pain points, typical day (enough for empathy and design decisions)

---

### Question 5: Priority Scheme
Should stories include priority/MoSCoW classification?

A) Yes — Must/Should/Could/Won't to clearly separate workshop essentials from stretch goals

B) No — all stories are in scope and equal priority (we'll build everything in the scaffold)

C) Partial — just mark the "stretch goal" stories (severity chart, dark mode polish) as optional

D) Other (please describe after [Answer]: tag below)

[Answer]: 
A) Yes — Must/Should/Could/Won't to clearly separate workshop essentials from stretch goals

---

## Execution Plan (to be executed after approval)

### Phase 1: Persona Generation
- [x] Define primary personas based on the role picker (admin, analyst)
- [x] Define secondary persona for workshop facilitator/demo context
- [x] Document goals, pain points, and success criteria for each persona
- [x] Save to `aidlc-docs/inception/user-stories/personas.md`

### Phase 2: Story Generation
- [x] Create stories organized per the approved structure (Q2 answer)
- [x] Write acceptance criteria per the approved format (Q3 answer)
- [x] Apply INVEST criteria validation to each story
- [x] Include the LLM narrative touchpoints in relevant stories
- [x] Map each story to the corresponding persona(s)
- [x] Apply priority classification if approved (Q5 answer)
- [x] Save to `aidlc-docs/inception/user-stories/stories.md`

### Phase 3: Validation
- [x] Verify all functional requirements (FR-01 through FR-10) are covered by at least one story
- [x] Verify all non-functional requirements are addressed in acceptance criteria
- [x] Confirm story-to-persona mapping is complete
- [x] Cross-reference with scaffold §5 (Key Flows) to ensure no workflow gaps

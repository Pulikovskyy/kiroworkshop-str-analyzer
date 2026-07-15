# Requirements Verification Questions

Based on the STR Analyzer scaffold document, I need to clarify a few areas before generating the full requirements document. Please answer each question by filling in the letter choice after the [Answer]: tag.

---

## Question 1
What is the target deployment environment for the STR Analyzer?

A) Local development only (workshop attendees run on their own machines)

B) Deployed to a shared cloud environment (AWS/Vercel) for workshop access

C) Both — local dev during workshop, deployed afterward for reference

D) Other (please describe after [Answer]: tag below)

[Answer]: C) Both — local dev during workshop, deployed afterward for reference


---

## Question 2
For the PostgreSQL connection, what authentication method should the app use?

A) Password-based with credentials in .env.local (standard for local dev)

B) Windows Authentication (trusted connection, no password)

C) Connection string with SSL (for cloud-hosted Postgres)

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Password-based with credentials in .env.local (standard for local dev)

---

## Question 3
How should the "Run Analyzer" engine handle a large batch of new alerts — should it call OpenAI for every single alert, or batch/limit to control costs?

A) Call OpenAI for every new alert (simplest, ~$0.02 per run for ~45 alerts)

B) Call OpenAI per alert but with a configurable max (e.g., first 20 alerts get narratives, rest get template fallback)

C) Generate narratives on-demand when an analyst opens the alert detail (lazy generation)

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Call OpenAI per alert but with a configurable max (e.g., first 20 alerts get narratives, rest get template fallback)

---

## Question 4
For the role-based access (admin vs analyst), what should each role be able to do?

A) Admin: full CRUD on rules + run analyzer + manage cases. Analyst: review alerts, approve/disapprove, tag STR, export CSV. (Clear separation)

B) Both roles can do everything — the role picker is just for demonstration/audit purposes

C) Admin: everything. Analyst: read-only on rules, can only review/approve/tag alerts. (Strict separation)

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Both roles can do everything — the role picker is just for demonstration/audit purposes

---

## Question 5
Should the Cases feature auto-create a case per customer when alerts fire, or should analysts manually create cases and link alerts?

A) Auto-create — when the analyzer fires alerts, automatically group them into a case per customer (simpler for workshop)

B) Manual — analysts create cases and manually link alerts to them (more realistic but more complex UI)

C) Hybrid — auto-create cases but allow analysts to merge/split/reassign cases manually

D) Other (please describe after [Answer]: tag below)

[Answer]: C) Hybrid — auto-create cases but allow analysts to merge/split/reassign cases manually


---

## Question 6
What level of UI polish is expected for the workshop deliverable?

A) Functional but minimal — shadcn defaults, no custom theming, focus on working features

B) Polished — custom color scheme, responsive layout, loading states, error boundaries, empty states

C) Production-feel — dark mode toggle, animations, custom branding (bank-themed), comprehensive UX

D) Other (please describe after [Answer]: tag below)

[Answer]: C) Production-feel — dark mode toggle, animations, custom branding (bank-themed), comprehensive UX


---

## Question 7: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

C) Other (please describe after [Answer]: tag below)

[Answer]: 
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)


---

## Question 8: Resiliency Extensions
Should the resiliency baseline be applied to this project?

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)

C) Other (please describe after [Answer]: tag below)

[Answer]: B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)


---

## Question 9: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

D) Other (please describe after [Answer]: tag below)

[Answer]: C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

---

## Question 10
Should the seed script be idempotent (safe to run multiple times), or is a one-time setup acceptable?

A) Idempotent — script can be re-run safely (drops and recreates, or uses ON CONFLICT)

B) One-time — script assumes empty database, fails if data exists

C) Both — a `--reset` flag for full wipe + reseed, otherwise additive

D) Other (please describe after [Answer]: tag below)

[Answer]: 
A) Idempotent — script can be re-run safely (drops and recreates, or uses ON CONFLICT)


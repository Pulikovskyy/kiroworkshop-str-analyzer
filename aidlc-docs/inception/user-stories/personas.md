# STR Analyzer — User Personas

---

## Persona 1: Ana — Compliance Analyst

| Attribute | Detail |
|-----------|--------|
| **Name** | Ana Reyes |
| **Role** | AML Compliance Analyst |
| **Goal** | Efficiently review system-generated alerts, identify genuinely suspicious transactions, and file accurate STRs within regulatory deadlines |
| **Pain Points** | Too many false positives bury real threats; writing STR narratives from scratch is time-consuming; lack of context forces her to dig through raw data manually |
| **Typical Day** | Logs in, checks alert queue for new OPEN alerts. Reviews each alert's details and AI-generated narrative. Approves genuine threats, disapproves false positives with notes. For approved alerts, tags as STR with suspicion code and edited narrative. Exports filed STRs at end of week for regulatory submission. |
| **Success Metrics** | Alert review turnaround < 24 hours; STR narrative quality rated acceptable by supervisor; zero missed genuine threats |

---

## Persona 2: Marco — AML Operations Admin

| Attribute | Detail |
|-----------|--------|
| **Name** | Marco Santos |
| **Role** | AML Operations Administrator |
| **Goal** | Configure and maintain the detection rules library, execute the analyzer, and ensure the system produces actionable alerts with minimal noise |
| **Pain Points** | Tuning rules to reduce false positives without missing real threats; understanding if new rules overlap with existing ones; tracking which rules triggered the most alerts |
| **Typical Day** | Reviews dashboard metrics (alert counts, STR filing rate, dismissal rate). Adjusts rule thresholds or creates new rules based on emerging typologies. Runs the analyzer after rule changes. Reviews audit log to confirm system health. Manages cases when escalation is needed. |
| **Success Metrics** | False positive rate below 30%; all regulatory scenarios covered by active rules; analyzer runs complete without errors |

---

## Persona 3: Workshop Facilitator (Context Persona)

| Attribute | Detail |
|-----------|--------|
| **Name** | Dev (Workshop Facilitator) |
| **Role** | Kiro IDE Workshop Leader |
| **Goal** | Demonstrate the full AIDLC lifecycle using the STR Analyzer as a vehicle — from spec to working code — in a 2-day session |
| **Pain Points** | Attendees getting stuck on environment setup; features too complex to demonstrate in limited time; need clear checkpoint demos at each half-day |
| **Typical Day** | Guides attendees through 4 spec cycles. Demonstrates seed → run → review → tag → export flow at each checkpoint. Uses the production-feel UI to show what's achievable with AI-assisted development. |
| **Success Metrics** | All attendees complete 4 spec cycles; checkpoint demos run successfully; attendees understand AIDLC value proposition |

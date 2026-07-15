# STR Analyzer — User Stories

Organization: **User Journey-Based** (analyst workflow)
Format: **Given/When/Then** acceptance criteria
Priority: **MoSCoW** (Must / Should / Could / Won't)

---

## Journey 1: System Setup & Data Seeding

### US-01: Database Initialization
**As** Marco (Admin), **I want** to run a single idempotent script that creates all tables and seeds data, **so that** the system is ready to use without manual database setup.

**Priority:** Must

**Acceptance Criteria:**
- Given a fresh PostgreSQL database, When I run the seed script, Then all tables are created and populated with ~500 transactions, 40 customers, 11 rules, and lookup data.
- Given the seed script has already been run, When I run it again, Then no duplicate data is created and the system state is consistent.
- Given the seed completes, When I check the transactions table, Then I find ~350 clean transactions and ~150 rule-triggering transactions across 40 customers.

---

### US-02: Browse Transactions
**As** Ana (Analyst), **I want** to browse all seeded transactions in a filterable table, **so that** I can understand the data before running the analyzer.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Transactions page, When the page loads, Then I see a TanStack Table with all transactions showing txn_id, customer, account, date, type, amount, channel.
- Given the table is loaded, When I filter by customer_id or txn_type or date range, Then only matching rows are displayed.
- Given the table is loaded, When I click a column header, Then rows sort by that column ascending/descending.

---

## Journey 2: Rule Management & Execution

### US-03: View Rule Library
**As** Marco (Admin), **I want** to see all configured detection rules with their conditions, risk level, and active status, **so that** I understand what the system is monitoring for.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Rules page, When the page loads, Then I see all 11 rules listed with name, description, risk level, scenario reference, and active toggle.
- Given a rule is displayed, When I view its detail, Then I can see the JSON rule_condition array in a readable format.

---

### US-04: Create a New Rule
**As** Marco (Admin), **I want** to create a new detection rule using a condition builder UI, **so that** I can add new monitoring scenarios without writing raw JSON.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Rules page, When I click "New Rule", Then a form appears with fields for name, description, risk level, and a condition builder.
- Given the condition builder, When I add rows of field/operator/value, Then each row is validated with Zod and the complete rule_condition JSON is generated.
- Given I submit a valid rule, When I click "Save", Then the rule is created in the database and appears in the rules list.
- Given I submit invalid data, When I click "Save", Then validation errors are shown and the rule is not created.

---

### US-05: Edit/Deactivate a Rule
**As** Marco (Admin), **I want** to edit an existing rule's conditions or toggle it active/inactive, **so that** I can tune detection without deleting rules.

**Priority:** Should

**Acceptance Criteria:**
- Given I am viewing a rule, When I click "Edit", Then the form pre-fills with the rule's current values.
- Given I toggle a rule inactive, When the analyzer runs, Then that rule is skipped.
- Given I edit and save, When I return to the rules list, Then the updated values are reflected.

---

### US-06: Run the Analyzer
**As** Marco (Admin), **I want** to click "Run Analyzer" to execute all active rules against all transactions, **so that** alerts are generated for suspicious patterns.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Rules page, When I click "Run Analyzer", Then the engine evaluates all active rules against all transactions.
- Given the engine finds matches, When new alerts are created, Then each alert has an explain JSON, dedupe_key, and severity.
- Given the engine creates alerts, When fewer than the configured max (20), Then all alerts get OpenAI-generated llm_narrative.
- Given the engine creates more than 20 alerts, When the max is exceeded, Then alerts beyond 20 get template-based fallback narratives.
- Given the run completes, When results are returned, Then a toast shows "X rules evaluated, Y alerts created" and an audit entry is logged.
- Given alerts already exist for a rule+txn combo, When the analyzer re-runs, Then no duplicate alerts are created (idempotent via dedupe_key).

---

## Journey 3: Alert Review & Approval

### US-07: View Open Alerts Queue
**As** Ana (Analyst), **I want** to see all OPEN alerts in a queue with severity indicators, **so that** I can prioritize my review work.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Alerts page, When the page loads, Then I see only alerts with status = OPEN.
- Given the alerts are listed, When I look at each row, Then I see alert_id, rule name, severity badge, customer, amount, and created date.
- Given the alerts queue, When I filter by severity or rule name, Then only matching alerts are displayed.

---

### US-08: Review Alert Detail
**As** Ana (Analyst), **I want** to view the full detail of an alert including the AI-generated narrative, matched values, and transaction context, **so that** I can make an informed approval decision.

**Priority:** Must

**Acceptance Criteria:**
- Given I click an alert in the queue, When the detail page loads, Then I see: the triggering transaction data, the rule that fired, the explain JSON, and the LLM narrative in an "AI Analysis" card.
- Given the detail page, When an LLM narrative exists, Then it is displayed in a visually distinct card labeled "AI Analysis".
- Given the detail page, When no LLM narrative exists (fallback), Then a template-based explanation is shown instead.
- Given the detail page, When I look at window facts, Then I see aggregated data (sums, counts, distinct counts) that justify the alert.

---

### US-09: Approve an Alert
**As** Ana (Analyst), **I want** to approve an alert as genuinely suspicious, **so that** it moves to the Suspicious Transactions tab for STR filing.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the alert detail page, When I click "Approve", Then the alert status changes to APPROVED.
- Given the alert is approved, When I navigate to the Suspicious Transactions tab, Then the alert appears there.
- Given the alert is approved, When I check the audit log, Then an ALERT_APPROVED entry exists with my role and timestamp.

---

### US-10: Disapprove an Alert
**As** Ana (Analyst), **I want** to disapprove an alert as a false positive with notes explaining why, **so that** it's documented and removed from my active queue.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the alert detail page, When I click "Disapprove", Then a dialog prompts me for review notes.
- Given the dialog is open, When I submit without notes, Then validation prevents submission.
- Given I provide notes and submit, When the action completes, Then the alert status changes to DISAPPROVED with my notes and timestamp recorded.
- Given the alert is disapproved, When I return to the Alerts tab, Then it no longer appears in the OPEN queue.

---

### US-11: Dismiss an Alert
**As** Ana (Analyst), **I want** to quickly dismiss an alert with a reason, **so that** low-priority or clearly benign alerts are cleared from my queue.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the alert detail page, When I click "Dismiss", Then a dialog prompts me for a dismissal reason.
- Given I provide a reason and submit, When the action completes, Then the alert status changes to DISMISSED with reason and timestamp.
- Given the alert is dismissed, When I check the audit log, Then an ALERT_DISMISSED entry exists.

---

## Journey 4: Suspicious Transaction Review & STR Filing

### US-12: View Suspicious Transactions
**As** Ana (Analyst), **I want** to see all approved (confirmed suspicious) alerts in a dedicated tab, **so that** I can focus on filing STRs for genuine threats.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Suspicious Transactions page, When the page loads, Then I see only alerts with status = APPROVED.
- Given the list is shown, When I look at each entry, Then I see the alert details, customer info, and a "Tag as STR" action button.

---

### US-13: Tag Alert as STR
**As** Ana (Analyst), **I want** to tag an approved alert as an STR by selecting a suspicion code and editing the AI-generated narrative, **so that** the STR is properly documented for regulatory filing.

**Priority:** Must

**Acceptance Criteria:**
- Given I am viewing an approved alert in the Suspicious Transactions tab, When I click "Tag as STR", Then a dialog opens with a suspicion code dropdown (SC1–SC6, PC1–PC14) and a narrative textarea pre-filled with the LLM narrative.
- Given the dialog is open, When I edit the narrative and select a code, Then I can submit the STR.
- Given I submit the STR, When the action completes, Then: a str_register entry is created with a generated STR-YYYY-NNNNNN reference, the alert status changes to TAGGED_STR, and an audit entry is logged.
- Given the STR is filed, When I navigate to the STR Register tab, Then the new entry appears there.

---

### US-14: View STR Register
**As** Ana (Analyst), **I want** to see all filed STRs in a register with reference numbers, dates, and narratives, **so that** I have a complete record of regulatory filings.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the STR Register page, When the page loads, Then I see all entries with str_ref_no, tagged_at, customer, account, amount, rule name, suspicion code, and narrative preview.
- Given the register is loaded, When I click an entry, Then I see the full narrative and linked transaction details.

---

### US-15: Export STR Register as CSV
**As** Ana (Analyst), **I want** to export the STR register as a CSV file, **so that** I can submit it to the AMLC or share with compliance leadership.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the STR Register page, When I click "Export CSV", Then a CSV file downloads with columns: str_ref_no, tagged_at, customer_id, full_name, account_no, txn_date, amount, rule_name, suspicion_code, narrative.
- Given the export completes, When I open the CSV, Then all filed STRs are included with correct data.

---

## Journey 5: Case Management

### US-16: View Cases
**As** Ana (Analyst), **I want** to see investigation cases grouped by customer, **so that** I can understand the full picture of a customer's suspicious activity.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Cases page, When the page loads, Then I see cases with case_ref, customer name, status, priority, alert count, and assigned_to.
- Given a case exists, When I click it, Then I see all linked alerts and their statuses.

---

### US-17: Auto-Create Cases on Analyzer Run
**As** Marco (Admin), **I want** the system to automatically create or link cases per customer when alerts fire, **so that** related alerts are grouped without manual effort.

**Priority:** Must

**Acceptance Criteria:**
- Given the analyzer creates alerts for a customer, When no open case exists for that customer, Then a new case is auto-created and alerts are linked.
- Given the analyzer creates alerts for a customer, When an open case already exists, Then new alerts are linked to the existing case.

---

### US-18: Manage Cases Manually
**As** Ana (Analyst), **I want** to merge, split, or reassign cases, **so that** I can organize investigations as my understanding evolves.

**Priority:** Should

**Acceptance Criteria:**
- Given I am viewing a case, When I click "Reassign", Then I can change the assigned_to field.
- Given multiple cases for related customers, When I select them and click "Merge", Then alerts are combined into a single case.
- Given a case with many alerts, When I select some alerts and click "Split", Then a new case is created with those alerts moved to it.

---

## Journey 6: Dashboard & Audit

### US-19: View Dashboard
**As** Marco (Admin), **I want** to see summary statistics and a severity chart on the dashboard, **so that** I have an at-a-glance view of the system's health.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on the Dashboard, When the page loads, Then I see stat tiles: total open alerts, approved alerts, STRs filed, dismissal rate.
- Given the dashboard loads, When I look at the severity chart, Then I see alert counts broken down by risk level (LOW, MEDIUM, HIGH, CRITICAL).

---

### US-20: View Audit Log
**As** Marco (Admin), **I want** to browse the audit trail of all system actions, **so that** I can verify who did what and when.

**Priority:** Should

**Acceptance Criteria:**
- Given I am on the Audit Log page, When the page loads, Then I see entries with timestamp, actor, action type, and detail summary.
- Given the log is loaded, When I filter by action type or date range, Then only matching entries are displayed.

---

## Journey 7: UI/UX & Theming

### US-21: Dark Mode Toggle
**As** Ana (Analyst), **I want** to toggle between light and dark themes, **so that** I can work comfortably in different lighting conditions.

**Priority:** Could

**Acceptance Criteria:**
- Given I am on any page, When I click the theme toggle, Then the UI switches between light and dark mode.
- Given I select a theme, When I reload the page, Then my preference is persisted.

---

### US-22: Role Picker
**As** any user, **I want** to switch between admin and analyst roles via a UI picker, **so that** the system logs my actions under the correct role.

**Priority:** Must

**Acceptance Criteria:**
- Given I am on any page, When I click the role picker, Then I can switch between "admin" and "analyst".
- Given I select a role, When I perform an action, Then the audit log records that role as the actor.

---

### US-23: Production-Feel UI Polish
**As** Dev (Facilitator), **I want** the application to have a production-quality look with bank theming, animations, loading states, and error boundaries, **so that** workshop attendees see what's achievable with AI-assisted development.

**Priority:** Could

**Acceptance Criteria:**
- Given any page, When content is loading, Then a skeleton/loading state is shown.
- Given a server action fails, When an error occurs, Then an error boundary catches it and displays a user-friendly message.
- Given the UI is rendered, When I look at the design, Then it has consistent bank-themed colors, typography, and subtle animations.

---

## MoSCoW Summary

| Priority | Count | Stories |
|----------|-------|---------|
| **Must** | 17 | US-01 through US-17, US-19, US-22 |
| **Should** | 3 | US-05, US-18, US-20 |
| **Could** | 2 | US-21, US-23 |
| **Won't** | 0 | — |

---

## Requirements Coverage Matrix

| Requirement | Covered By Stories |
|-------------|-------------------|
| FR-01 (Database) | US-01 |
| FR-02 (Seed Data) | US-01, US-02 |
| FR-03 (Rule Engine) | US-03, US-04, US-05, US-06 |
| FR-04 (OpenAI) | US-06, US-08, US-13 |
| FR-05 (Alert Lifecycle) | US-07, US-08, US-09, US-10, US-11, US-12, US-13 |
| FR-06 (Cases) | US-16, US-17, US-18 |
| FR-07 (STR Register) | US-13, US-14, US-15 |
| FR-08 (Rules CRUD) | US-03, US-04, US-05 |
| FR-09 (Audit) | US-20 |
| FR-10 (Roles) | US-22 |
| NFR-01 (UI/UX) | US-21, US-23 |
| NFR-02 (Performance) | US-06, US-02 |
| NFR-03 (Data Integrity) | US-01, US-04, US-06 |
| NFR-04 (Deployment) | US-01 |
| NFR-05 (Dev Experience) | All stories (TypeScript, shared types) |

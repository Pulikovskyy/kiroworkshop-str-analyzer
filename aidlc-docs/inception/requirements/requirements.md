# STR Analyzer — Requirements Document

## Intent Analysis Summary

| Attribute | Value |
|-----------|-------|
| **Request Type** | New Project (Greenfield) |
| **Scope** | System-wide — full-stack application |
| **Complexity** | Complex — multi-component, rule engine DSL, OpenAI integration, multi-state workflow |
| **Depth** | Standard |
| **Target** | 2-day Kiro IDE workshop deliverable with production-feel quality |

---

## 1. Functional Requirements

### FR-01: Database & Data Model
- **FR-01.1**: PostgreSQL 17 as the data store, accessed via raw `pg` driver (no ORM).
- **FR-01.2**: Schema includes: `customers`, `accounts`, `transactions`, `rules`, `alerts`, `cases`, `case_alerts`, `str_register`, `audit_log`, `lib_suspicion_reason`, `lib_str_trigger`.
- **FR-01.3**: Connection via password-based auth in `.env.local` (`DATABASE_URL`).
- **FR-01.4**: `withClient` / `withTransaction` helper pattern in `lib/db.ts`.

### FR-02: Seed Data
- **FR-02.1**: Idempotent seed script (safe to re-run; drops and recreates or uses ON CONFLICT).
- **FR-02.2**: ~500 synthetic transactions across ~40 customers (27 individuals, 3 corporates).
- **FR-02.3**: ~350 "clean" transactions + ~150 transactions crafted to trigger the 11 rules.
- **FR-02.4**: Sample customer profiles with Filipino names, occupations, risk ratings (including 1 PEP, 2 HIGH-risk).
- **FR-02.5**: Pre-seeded lookup tables (SC1–SC6, PC1–PC14 suspicion codes; A–G STR triggers).
- **FR-02.6**: 11 rules pre-seeded from the STR Details scenario library.

### FR-03: Rule Engine
- **FR-03.1**: Rules stored as JSON condition arrays (`rule_condition JSONB`) in the `rules` table.
- **FR-03.2**: DSL supports: `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `in` operators.
- **FR-03.3**: DSL supports window functions: `window_sum`, `window_count`, `distinct_count`, `window_debit_ratio`.
- **FR-03.4**: DSL supports account-level fields: `account.days_since_last_activity`.
- **FR-03.5**: Engine translates JSON conditions into SQL WHERE clauses with correlated subqueries for window functions.
- **FR-03.6**: Idempotent execution via `dedupe_key` (ON CONFLICT DO NOTHING).
- **FR-03.7**: "Run Analyzer" processes all active rules against all transactions in one execution.

### FR-04: OpenAI LLM Integration
- **FR-04.1**: On alert creation, call OpenAI `gpt-4o-mini` to generate a 2-3 sentence narrative explaining why the transaction is suspicious.
- **FR-04.2**: Configurable max narratives per run (e.g., first 20 alerts get LLM narratives; remaining get template-based fallback).
- **FR-04.3**: Narrative stored in `alerts.llm_narrative` column.
- **FR-04.4**: Fallback: if OpenAI fails, generate a template-based narrative from the `explain` JSON.
- **FR-04.5**: System prompt frames the LLM as a Philippine bank financial crime analyst referencing AMLC regulations.
- **FR-04.6**: Customer profile (occupation, source of funds, risk rating) included in context when available.

### FR-05: Alert Lifecycle & Approval Workflow
- **FR-05.1**: Alert statuses: `OPEN` → `APPROVED` | `DISAPPROVED` | `DISMISSED`.
- **FR-05.2**: `APPROVED` alerts can further transition to `TAGGED_STR`.
- **FR-05.3**: **Approve**: marks alert as genuinely suspicious. Moves to "Suspicious Transactions" tab.
- **FR-05.4**: **Disapprove**: marks as false positive. Requires `review_notes`. Stays in alerts history.
- **FR-05.5**: **Dismiss**: quick dismissal. Requires reason. Stays in alerts history.
- **FR-05.6**: **Tag as STR**: only available for APPROVED alerts. Requires suspicion code + narrative. Creates STR register entry.
- **FR-05.7**: All status transitions record `reviewed_by`, `reviewed_at`, and write to `audit_log`.

### FR-06: Case Management
- **FR-06.1**: Cases group related alerts by customer for investigation.
- **FR-06.2**: Auto-creation: when the analyzer fires alerts, auto-create a case per customer (or link to existing open case).
- **FR-06.3**: Analysts can manually merge, split, or reassign cases.
- **FR-06.4**: Case statuses: `OPEN`, `UNDER_REVIEW`, `ESCALATED`, `CLOSED_STR`, `CLOSED_NO_STR`.
- **FR-06.5**: Case closes when all linked alerts are resolved (all tagged/dismissed/disapproved).

### FR-07: STR Register & Export
- **FR-07.1**: STR Register table with auto-generated reference numbers (`STR-YYYY-NNNNNN`).
- **FR-07.2**: When tagging, LLM narrative is pre-filled into the narrative textarea for analyst review/edit.
- **FR-07.3**: CSV export of the STR register via API route (`/api/export/str`).
- **FR-07.4**: Export columns: `str_ref_no, tagged_at, customer_id, full_name, account_no, txn_date, amount, rule_name, suspicion_code, narrative`.

### FR-08: Rules CRUD
- **FR-08.1**: Create, read, update, delete rules via the Rules page.
- **FR-08.2**: Condition builder UI: rows of field/op/value inputs.
- **FR-08.3**: Zod validation on all rule inputs.
- **FR-08.4**: Activate/deactivate rules without deleting.

### FR-09: Audit Trail
- **FR-09.1**: Append-only `audit_log` table.
- **FR-09.2**: Actions logged: `RULE_CREATED`, `RULE_UPDATED`, `RULE_DELETED`, `RUN_EXECUTED`, `ALERT_APPROVED`, `ALERT_DISAPPROVED`, `ALERT_DISMISSED`, `ALERT_TAGGED_STR`, `CASE_CREATED`, `CASE_UPDATED`.
- **FR-09.3**: Each entry has: `actor`, `action`, `detail` (JSONB), `created_at`.
- **FR-09.4**: Audit log viewer page with time-based filtering.

### FR-10: Role-Based Access
- **FR-10.1**: Two roles: `admin` and `analyst`.
- **FR-10.2**: Role stored in a cookie — role picker in the UI.
- **FR-10.3**: Both roles can perform all actions (roles are for demonstration/audit logging purposes only).
- **FR-10.4**: All audit entries record which role performed the action.

---

## 2. Non-Functional Requirements

### NFR-01: UI/UX Quality (Production-feel)
- **NFR-01.1**: Dark mode toggle.
- **NFR-01.2**: Custom color scheme / bank-themed branding.
- **NFR-01.3**: Animations and transitions (subtle, professional).
- **NFR-01.4**: Responsive layout (works on laptop and large monitor).
- **NFR-01.5**: Loading states, error boundaries, empty states.
- **NFR-01.6**: Comprehensive UX: toasts for actions, confirmation dialogs for destructive operations.

### NFR-02: Performance
- **NFR-02.1**: Rule engine execution completes within 10 seconds for 500 transactions × 11 rules.
- **NFR-02.2**: UI pages load in under 2 seconds (server-side rendering).
- **NFR-02.3**: TanStack Table handles 500 rows with client-side filtering/sorting smoothly.

### NFR-03: Data Integrity
- **NFR-03.1**: Parameterized queries for all database access (SQL injection prevention).
- **NFR-03.2**: Zod validation on every server action input.
- **NFR-03.3**: Database transactions for multi-step operations (e.g., tag-as-STR).
- **NFR-03.4**: Idempotent alert creation via dedupe_key unique constraint.

### NFR-04: Deployment
- **NFR-04.1**: Local development: PostgreSQL 17 (Windows service), Next.js dev server.
- **NFR-04.2**: Cloud deployment: compatible with Vercel (app) + managed Postgres (Neon/Supabase).
- **NFR-04.3**: Environment configuration via `.env.local` (DATABASE_URL, OPENAI_API_KEY, OPENAI_MODEL).

### NFR-05: Developer Experience
- **NFR-05.1**: TypeScript strict mode.
- **NFR-05.2**: Clear project structure following Next.js App Router conventions.
- **NFR-05.3**: Shared types in `types/index.ts`.
- **NFR-05.4**: Reusable data-table component with TanStack Table.

---

## 3. UI Navigation Structure

| Tab | Purpose | Alert statuses shown |
|-----|---------|---------------------|
| Dashboard | Stats tiles + severity chart | Aggregates |
| Transactions | Browse all seed data | N/A |
| Rules | CRUD + Run Analyzer | N/A |
| Alerts | OPEN alerts queue — approve/disapprove/dismiss | `OPEN` |
| Suspicious Transactions | Confirmed suspicious — Tag as STR | `APPROVED` |
| STR Register | Filed STRs + CSV export | `TAGGED_STR` |
| Cases | Investigation cases per customer | All case statuses |
| Audit Log | Action history viewer | N/A |

---

## 4. Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript (strict) |
| Database | PostgreSQL 17 (local service) via `pg` driver |
| UI Library | shadcn/ui + Radix + Tailwind CSS 4 |
| Data Tables | TanStack Table |
| Validation | Zod |
| LLM | OpenAI API (gpt-4o-mini) |
| Auth | Cookie-based role picker (admin/analyst) |

---

## 5. Extension Configuration

| Extension | Enabled | Rationale |
|-----------|---------|-----------|
| Security Baseline | No | Workshop/demo project — rapid iteration prioritized |
| Resiliency Baseline | No | Workshop/demo project — not business-critical |
| Property-Based Testing | No | CRUD-focused with rule engine — standard testing sufficient |

---

## 6. Constraints & Assumptions

- PostgreSQL 17 is already running on the target machine.
- OpenAI API key will be provided by the workshop facilitator.
- All seed data is synthetic — no real PII.
- No real authentication system — cookie-based role picker for demo purposes.
- No pagination beyond TanStack client-side (max 500 rows).
- No rule versioning or maker-checker workflows.
- Timezone: `Asia/Manila` dates only.

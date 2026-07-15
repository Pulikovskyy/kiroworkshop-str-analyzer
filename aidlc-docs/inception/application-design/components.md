# Application Components

## Component Overview

The STR Analyzer is organized into 6 core components following Next.js App Router conventions.

---

## C1: Data Access Layer (`src/app/lib/db.ts`)
**Purpose**: Provides database connectivity and transaction management.
**Responsibilities**:
- Manage PostgreSQL connection pool
- Provide `withClient(fn)` helper for single-query operations
- Provide `withTransaction(fn)` helper for multi-statement atomic operations
- Handle connection errors and pool lifecycle

---

## C2: Rule Engine (`src/app/lib/engine.ts`)
**Purpose**: Translates JSON rule conditions into SQL and executes detection logic.
**Responsibilities**:
- Parse `rule_condition` JSONB arrays
- Translate field refs to SQL column references
- Translate window functions to correlated subqueries
- Build complete WHERE clauses from condition arrays
- Execute rules against transaction data
- Manage dedupe logic (ON CONFLICT DO NOTHING)

---

## C3: OpenAI Integration (`src/app/lib/openai.ts`)
**Purpose**: Generates human-readable alert narratives via OpenAI API.
**Responsibilities**:
- Build context payloads from transaction + rule + customer data
- Call OpenAI Chat Completions API
- Handle rate limits, errors, and fallback to template narratives
- Respect configurable max narratives per run

---

## C4: Server Actions (`src/app/actions/`)
**Purpose**: Business logic layer — all data mutations go through server actions.
**Sub-components**:
- `transactions.ts` — query/filter transactions
- `rules.ts` — CRUD operations with Zod validation
- `run-analyzer.ts` — orchestrates engine + OpenAI + case creation
- `alerts.ts` — approve, disapprove, dismiss
- `str-register.ts` — tag as STR, generate ref number
- `cases.ts` — auto-create, merge, split, reassign
- `audit.ts` — append audit log entries

---

## C5: UI Pages (`src/app/(pages)/`)
**Purpose**: Server-rendered pages with client-side interactivity.
**Sub-components**:
- Dashboard page (stats + chart)
- Transactions page (browse + filter)
- Rules page (CRUD + Run Analyzer button)
- Alerts page (OPEN queue)
- Alert detail page (review + actions)
- Suspicious Transactions page (APPROVED alerts)
- STR Register page (TAGGED_STR + export)
- Cases page (investigation management)
- Audit Log page (history viewer)

---

## C6: Shared UI Components (`src/components/`)
**Purpose**: Reusable React components used across pages.
**Sub-components**:
- `data-table.tsx` — TanStack Table wrapper with filtering/sorting
- `rule-form.tsx` — condition builder (field/op/value rows)
- `approve-dialog.tsx` — confirmation for approve/disapprove
- `tag-str-dialog.tsx` — suspicion code + narrative form
- `llm-narrative.tsx` — AI Analysis card display
- `case-card.tsx` — case summary card
- `severity-badge.tsx` — colored severity indicator
- `ui/` — shadcn primitives (Button, Dialog, Select, etc.)

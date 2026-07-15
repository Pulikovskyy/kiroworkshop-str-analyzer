# Application Design — Consolidated

## Architecture Summary

The STR Analyzer is a **Next.js 16 App Router** application with:
- **6 core components** (Data Access, Rule Engine, OpenAI Integration, Server Actions, UI Pages, Shared Components)
- **4 service orchestrations** (Analyzer, Case Management, Alert Lifecycle, STR Filing)
- **PostgreSQL 17** as the single data store, accessed via raw `pg` driver
- **Server Actions** as the service layer (no separate REST API)

## Key Design Decisions

1. **No ORM** — raw parameterized SQL via `pg` for full control and workshop transparency
2. **Server Actions over API routes** — simpler mental model for Next.js App Router; single API route only for CSV export download
3. **Rule engine in application layer** — JSON→SQL translation happens in TypeScript, not stored procs, for debuggability
4. **OpenAI as fire-and-forget** — narrative generation is best-effort with template fallback; never blocks alert creation
5. **Hybrid case management** — auto-creation keeps the common case simple; manual ops (merge/split) available for realistic scenarios

## Component Inventory

| ID | Component | Location | Responsibility |
|----|-----------|----------|---------------|
| C1 | Data Access | `lib/db.ts` | Pool, withClient, withTransaction |
| C2 | Rule Engine | `lib/engine.ts` | JSON→SQL condition translation + execution |
| C3 | OpenAI | `lib/openai.ts` | LLM narrative generation + fallback |
| C4 | Server Actions | `actions/*.ts` | Business logic (7 action files) |
| C5 | UI Pages | `(pages)/**` | 9 pages with server-side rendering |
| C6 | Shared Components | `components/` | 8 reusable React components |

## Service Orchestrations

| ID | Service | Key Method | Coordination |
|----|---------|-----------|--------------|
| S1 | Analyzer | `runAnalyzer()` | Engine → OpenAI → Cases → Audit |
| S2 | Case Management | `autoCreateOrLinkCase()` | Find/create case → link alert |
| S3 | Alert Lifecycle | `approveAlert()` etc. | Validate state → transition → audit |
| S4 | STR Filing | `tagAsStr()` | Transaction: STR insert → alert update → case update → audit |

## Data Model

9 tables + 2 lookups (see requirements.md §2 for full DDL):
- `customers`, `accounts`, `transactions` — master data
- `rules` — detection configuration
- `alerts` — engine output with state machine
- `cases`, `case_alerts` — investigation grouping
- `str_register` — regulatory filing
- `audit_log` — append-only trail
- `lib_suspicion_reason`, `lib_str_trigger` — lookups

## Cross-Cutting Concerns

| Concern | Approach |
|---------|----------|
| Validation | Zod schemas on all server action inputs |
| Error handling | Try/catch in actions, error boundaries in UI |
| Audit | Every mutation calls `logAction()` |
| Auth | Cookie-based role picker, recorded in audit entries |
| Theming | Tailwind + CSS variables, dark mode via class toggle |

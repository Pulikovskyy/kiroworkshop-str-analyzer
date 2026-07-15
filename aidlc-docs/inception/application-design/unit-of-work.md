# Units of Work — STR Analyzer

## Decomposition Strategy
**Approach**: Workshop-aligned — each unit corresponds to one half-day Kiro spec cycle.
**Architecture**: Single Next.js monolith with logical modules (not microservices).
**Dependencies**: Sequential build order (each unit builds on the previous).

---

## Unit 1: data-and-seed
**Scope**: Project scaffold, database layer, migration, seed data, and transactions browse page.

**Delivers**:
- Next.js project initialization with TypeScript strict, Tailwind 4, shadcn/ui
- `lib/db.ts` — Pool + withClient + withTransaction
- `migrations/0001_init.sql` — complete DDL (all 9 tables + 2 lookups)
- `scripts/seed.ts` — idempotent seed (customers, accounts, transactions, rules, lookups)
- Transactions browse page with TanStack Table (filter, sort)
- Shared `data-table.tsx` component
- TypeScript types (`types/index.ts`)
- Layout with sidebar navigation shell
- Theme infrastructure (Tailwind CSS variables, dark mode class toggle)

**Workshop Checkpoint**: Table of 500 seeded transactions renders with filters.

---

## Unit 2: rule-engine
**Scope**: Rules CRUD, condition builder UI, the analyzer engine, and OpenAI integration.

**Delivers**:
- Rules page (list, create, edit, delete, activate/deactivate)
- `rule-form.tsx` — condition builder component (field/op/value rows)
- Zod validation schemas for rule inputs
- `lib/engine.ts` — JSON→SQL translator (field refs, window functions, operators)
- `actions/run-analyzer.ts` — orchestrator (engine + OpenAI + case auto-creation + audit)
- `lib/openai.ts` — narrative generation with configurable max + template fallback
- `severity-badge.tsx` component
- Dashboard page (stat tiles + severity chart)

**Workshop Checkpoint**: Click "Run Analyzer" → "11 rules evaluated, ~45 alerts created" with LLM narratives; re-run = 0 new alerts.

---

## Unit 3: alert-review
**Scope**: Alert queue, detail page, approve/disapprove/dismiss workflow, suspicious transactions tab, and cases.

**Delivers**:
- Alerts page (OPEN queue with severity/rule filters)
- Alert detail page (explain JSON + LLM narrative card + transaction context)
- `approve-dialog.tsx` — confirmation dialogs for approve/disapprove/dismiss
- `llm-narrative.tsx` — AI Analysis card component
- Suspicious Transactions page (APPROVED alerts with Tag-as-STR action)
- Cases page (list + detail with linked alerts)
- `case-card.tsx` component
- Case auto-creation logic (already in unit 2's run-analyzer, but manual merge/split/reassign added here)
- Audit logging for all alert state transitions

**Workshop Checkpoint**: Approve a structuring alert → appears in Suspicious Transactions tab.

---

## Unit 4: str-register
**Scope**: STR tagging, register page, CSV export, dashboard enhancements, audit log viewer.

**Delivers**:
- `tag-str-dialog.tsx` — suspicion code dropdown + narrative textarea (pre-filled from LLM)
- STR Register page (all TAGGED_STR entries)
- `/api/export/str/route.ts` — CSV download endpoint
- Dashboard enhancements (STRs filed count, dismissal rate)
- Audit Log page (browse all audit entries with filters)
- Role picker component in header
- UI polish: loading states, error boundaries, empty states, animations

**Workshop Checkpoint**: Full loop — seed → run → review → approve → tag → export CSV.

---

## Code Organization (Single Monolith)

```
str-analyzer/
├── src/app/
│   ├── (pages)/          # All 9 route pages
│   ├── actions/          # All 7 server action files
│   ├── api/export/str/   # CSV export route
│   └── lib/              # db.ts, engine.ts, openai.ts
├── src/components/       # All shared UI components
├── src/types/            # TypeScript types
├── migrations/           # SQL migration files
├── scripts/              # Seed script
└── ...config files
```

All 4 units contribute to the same codebase. No separate deployments — the final artifact is one Next.js application.

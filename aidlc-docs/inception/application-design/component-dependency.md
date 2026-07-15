# Component Dependencies

## Dependency Matrix

| Component | Depends On | Depended On By |
|-----------|-----------|----------------|
| C1: Data Access | pg (npm) | C2, C4 (all actions) |
| C2: Rule Engine | C1 | C4 (run-analyzer) |
| C3: OpenAI | openai (npm) | C4 (run-analyzer) |
| C4: Server Actions | C1, C2, C3 | C5 (UI Pages) |
| C5: UI Pages | C4, C6 | — (top-level) |
| C6: Shared Components | shadcn/ui, TanStack Table | C5 |

## Communication Patterns

```
UI Pages (C5)
    │
    ├── calls ──→ Server Actions (C4)
    │                │
    │                ├── uses ──→ Data Access (C1) ──→ PostgreSQL
    │                ├── uses ──→ Rule Engine (C2) ──→ Data Access (C1)
    │                └── uses ──→ OpenAI Integration (C3) ──→ OpenAI API
    │
    └── renders ──→ Shared Components (C6)
```

## Data Flow

### Analyzer Run Flow
```
Rules page (C5) → runAnalyzer action (C4)
    → loadActiveRules via C1
    → runAllRules via C2 (translates JSON→SQL, executes)
    → generateAlertNarrative via C3 (for each new alert)
    → autoCreateOrLinkCase via C4/cases
    → logAction via C4/audit
    → return AnalyzerResult to UI
```

### Alert Approval Flow
```
Alert detail page (C5) → approveAlert action (C4)
    → validate status = OPEN via C1
    → UPDATE alerts via C1
    → logAction via C4/audit
    → revalidatePath for UI refresh
```

### STR Filing Flow
```
Suspicious Transactions page (C5) → tagAsStr action (C4)
    → withTransaction via C1:
        → validate status = APPROVED
        → INSERT str_register
        → UPDATE alert status
        → check/update case status
        → INSERT audit_log
    → revalidatePath for UI refresh
```

## External Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `next` | 16.x | Framework |
| `react` | 19.x | UI |
| `pg` | 8.x | PostgreSQL driver |
| `openai` | 4.x | OpenAI SDK |
| `zod` | 3.x | Validation |
| `@tanstack/react-table` | 8.x | Data tables |
| `tailwindcss` | 4.x | Styling |
| Various shadcn/ui | latest | UI primitives |

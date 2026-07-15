# Unit of Work — Dependency Matrix

## Build Order (Sequential)

```
Unit 1: data-and-seed
    │
    ▼ (provides: db layer, types, seed data, layout, data-table component)
Unit 2: rule-engine
    │
    ▼ (provides: alerts data, engine, OpenAI, cases auto-creation, dashboard)
Unit 3: alert-review
    │
    ▼ (provides: alert lifecycle actions, suspicious tab, case management UI)
Unit 4: str-register
```

## Dependency Matrix

| Unit | Depends On | Provides To |
|------|-----------|-------------|
| 1: data-and-seed | — (foundation) | Units 2, 3, 4 |
| 2: rule-engine | Unit 1 (db, types, layout) | Units 3, 4 |
| 3: alert-review | Units 1, 2 (alerts exist, engine runs) | Unit 4 |
| 4: str-register | Units 1, 2, 3 (approved alerts exist) | — (final) |

## Shared Artifacts Across Units

| Artifact | Created In | Used By |
|----------|-----------|---------|
| `lib/db.ts` | Unit 1 | All units |
| `types/index.ts` | Unit 1 (base types) | All units (extended in each) |
| `data-table.tsx` | Unit 1 | Units 2, 3, 4 (reused for rules, alerts, STR tables) |
| `severity-badge.tsx` | Unit 2 | Units 3, 4 |
| `lib/engine.ts` | Unit 2 | Unit 2 only (called by run-analyzer) |
| `lib/openai.ts` | Unit 2 | Unit 2 only (called by run-analyzer) |
| `actions/audit.ts` | Unit 2 | Units 3, 4 |
| `llm-narrative.tsx` | Unit 3 | Unit 4 (reused in STR detail) |
| Layout + sidebar | Unit 1 (shell) | Extended in each unit (new nav items) |

## Integration Points

| From → To | Integration Type | Contract |
|-----------|-----------------|----------|
| Unit 2 → Unit 1 | Database queries | SQL via withClient |
| Unit 2 → OpenAI | HTTP API call | openai SDK |
| Unit 3 → Unit 2 | Reads alerts table | Alert type + status |
| Unit 4 → Unit 3 | Reads APPROVED alerts | Alert status = APPROVED |
| All → Unit 1 | Database access | Pool + helpers |

## Risk: Breaking Changes

Since all units build on the same codebase sequentially:
- **Low risk**: Each unit extends (never removes) from previous units
- **Type safety**: TypeScript strict mode catches interface mismatches at build time
- **Rollback**: Git branches per unit enable easy rollback

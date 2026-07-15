# Component Methods

## C1: Data Access Layer

| Method | Signature | Purpose |
|--------|-----------|---------|
| `getPool` | `() => Pool` | Returns singleton pg Pool instance |
| `withClient` | `<T>(fn: (client: PoolClient) => Promise<T>) => Promise<T>` | Execute single query with auto-release |
| `withTransaction` | `<T>(fn: (client: PoolClient) => Promise<T>) => Promise<T>` | Execute atomic multi-statement operation |

---

## C2: Rule Engine

| Method | Signature | Purpose |
|--------|-----------|---------|
| `buildWhereClause` | `(conditions: ConditionEntry[], alias: string) => { sql: string, params: unknown[] }` | Translate JSON conditions to parameterized SQL WHERE |
| `buildWindowSubquery` | `(funcExpr: string, anchorAlias: string) => string` | Generate correlated subquery for window functions |
| `parseFieldRef` | `(left: string) => { type: 'field' | 'window' | 'account', ref: string }` | Classify a condition's left operand |
| `runRule` | `(ruleId: number, conditions: ConditionEntry[], client: PoolClient) => Promise<RuleRunResult>` | Execute one rule against all transactions, return new alerts |
| `runAllRules` | `(client: PoolClient) => Promise<AnalyzerResult>` | Execute all active rules, return summary |

---

## C3: OpenAI Integration

| Method | Signature | Purpose |
|--------|-----------|---------|
| `generateAlertNarrative` | `(ctx: NarrativeContext) => Promise<string>` | Generate LLM narrative for a single alert |
| `generateFallbackNarrative` | `(ctx: NarrativeContext) => string` | Template-based fallback when OpenAI unavailable |
| `buildNarrativeContext` | `(txn: Transaction, rule: Rule, matchedValues: Record, windowFacts?: WindowFacts) => NarrativeContext` | Assemble context payload for LLM |

---

## C4: Server Actions

### `transactions.ts`
| Method | Signature | Purpose |
|--------|-----------|---------|
| `getTransactions` | `(filters?: TxnFilters) => Promise<Transaction[]>` | Query transactions with optional filters |
| `getTransactionById` | `(txnId: number) => Promise<Transaction | null>` | Get single transaction |

### `rules.ts`
| Method | Signature | Purpose |
|--------|-----------|---------|
| `getRules` | `() => Promise<Rule[]>` | List all rules |
| `createRule` | `(input: CreateRuleInput) => Promise<Rule>` | Validate + insert new rule |
| `updateRule` | `(ruleId: number, input: UpdateRuleInput) => Promise<Rule>` | Validate + update existing rule |
| `deleteRule` | `(ruleId: number) => Promise<void>` | Delete rule |
| `toggleRuleActive` | `(ruleId: number, active: boolean) => Promise<void>` | Activate/deactivate |

### `run-analyzer.ts`
| Method | Signature | Purpose |
|--------|-----------|---------|
| `runAnalyzer` | `(maxNarratives?: number) => Promise<AnalyzerResult>` | Orchestrate: run engine → generate narratives → create cases → audit |

### `alerts.ts`
| Method | Signature | Purpose |
|--------|-----------|---------|
| `getAlerts` | `(filters?: AlertFilters) => Promise<Alert[]>` | Query alerts by status/severity |
| `getAlertById` | `(alertId: number) => Promise<AlertDetail | null>` | Get alert with joined txn/rule/customer data |
| `approveAlert` | `(alertId: number, actor: string) => Promise<void>` | OPEN → APPROVED |
| `disapproveAlert` | `(alertId: number, actor: string, notes: string) => Promise<void>` | OPEN → DISAPPROVED |
| `dismissAlert` | `(alertId: number, actor: string, reason: string) => Promise<void>` | OPEN → DISMISSED |

### `str-register.ts`
| Method | Signature | Purpose |
|--------|-----------|---------|
| `tagAsStr` | `(alertId: number, input: TagStrInput) => Promise<StrEntry>` | APPROVED → TAGGED_STR + create register entry |
| `getStrRegister` | `() => Promise<StrEntry[]>` | List all STR entries |
| `exportStrCsv` | `() => Promise<string>` | Generate CSV content |

### `cases.ts`
| Method | Signature | Purpose |
|--------|-----------|---------|
| `getCases` | `(filters?: CaseFilters) => Promise<Case[]>` | List cases |
| `getCaseById` | `(caseId: number) => Promise<CaseDetail | null>` | Case with linked alerts |
| `createCase` | `(customerId: string, alertIds: number[]) => Promise<Case>` | Manual case creation |
| `autoCreateOrLinkCase` | `(customerId: string, alertId: number) => Promise<void>` | Auto-create or link to existing |
| `mergeCases` | `(targetCaseId: number, sourceCaseIds: number[]) => Promise<void>` | Merge cases |
| `splitCase` | `(caseId: number, alertIdsToSplit: number[]) => Promise<Case>` | Split alerts to new case |
| `reassignCase` | `(caseId: number, assignedTo: string) => Promise<void>` | Change assignment |

### `audit.ts`
| Method | Signature | Purpose |
|--------|-----------|---------|
| `logAction` | `(actor: string, action: string, detail?: object) => Promise<void>` | Append audit entry |
| `getAuditLog` | `(filters?: AuditFilters) => Promise<AuditEntry[]>` | Query audit entries |

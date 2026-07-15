# Service Design

## Service Architecture

The STR Analyzer uses Next.js Server Actions as the service layer. There is no separate API layer — pages call server actions directly, which orchestrate component interactions.

---

## S1: Analyzer Orchestration Service (`run-analyzer.ts`)

**Responsibilities:**
- Coordinate the full analyzer run: load rules → execute engine → generate narratives → create cases → log audit
- Manage the "max narratives" budget (first N get LLM, rest get template)
- Return structured result for UI toast

**Orchestration Flow:**
```
1. withTransaction(async (client) => {
2.   const rules = await loadActiveRules(client)
3.   const result = await runAllRules(client)  // C2: Rule Engine
4.   for each new alert (up to maxNarratives):
5.     alert.llm_narrative = await generateAlertNarrative(ctx)  // C3: OpenAI
6.   for remaining alerts:
7.     alert.llm_narrative = generateFallbackNarrative(ctx)
8.   for each unique customer in new alerts:
9.     await autoCreateOrLinkCase(customerId, alertId)  // S2: Case Service
10.  await logAction('system', 'RUN_EXECUTED', { rulesEvaluated, alertsCreated })
11.  return { rulesEvaluated, alertsCreated }
12. })
```

---

## S2: Case Management Service (`cases.ts`)

**Responsibilities:**
- Auto-create cases when new alerts fire (group by customer)
- Link new alerts to existing open cases for the same customer
- Support manual operations: merge, split, reassign
- Update case status based on linked alert resolution

**Auto-creation Logic:**
```
1. Find open case for customer (status IN ('OPEN', 'UNDER_REVIEW'))
2. IF found → link alert to existing case
3. IF not found → create new case with auto-generated CASE-YYYY-NNNNNN ref → link alert
```

---

## S3: Alert Lifecycle Service (`alerts.ts`)

**Responsibilities:**
- Enforce state machine transitions (OPEN→APPROVED, OPEN→DISAPPROVED, OPEN→DISMISSED, APPROVED→TAGGED_STR)
- Validate preconditions for each transition
- Record reviewer info and timestamps
- Trigger audit logging for every transition

**State Machine Enforcement:**
```
approve:    REQUIRES status = OPEN     → sets APPROVED
disapprove: REQUIRES status = OPEN     → sets DISAPPROVED (notes required)
dismiss:    REQUIRES status = OPEN     → sets DISMISSED (reason required)
tagAsStr:   REQUIRES status = APPROVED → sets TAGGED_STR (via str-register.ts)
```

---

## S4: STR Filing Service (`str-register.ts`)

**Responsibilities:**
- Generate sequential STR reference numbers (STR-YYYY-NNNNNN)
- Create STR register entries in a single transaction (insert STR + update alert status + update case status + audit)
- Provide CSV export

**Atomic Filing:**
```
withTransaction(async (client) => {
  1. Validate alert status = APPROVED
  2. Generate next STR ref number
  3. INSERT into str_register
  4. UPDATE alerts SET status = 'TAGGED_STR'
  5. Check if all case alerts are resolved → update case status
  6. INSERT audit_log
})
```

"use server";

import { PoolClient } from "pg";
import { ConditionEntry } from "@/types";

interface RuleRow {
  rule_id: number;
  rule_name: string;
  risk_level: string;
  rule_condition: ConditionEntry[];
}

export interface RuleRunResult {
  ruleId: number;
  ruleName: string;
  alertsCreated: number;
}

/**
 * Parse a condition's left operand to determine its type.
 */
function parseFieldRef(left: string): {
  type: "field" | "window" | "account";
  ref: string;
} {
  if (left.startsWith("window_") || left.startsWith("distinct_count")) {
    return { type: "window", ref: left };
  }
  if (left.startsWith("account.")) {
    return { type: "account", ref: left };
  }
  return { type: "field", ref: left };
}

/**
 * Map a field ref to an SQL column expression.
 */
function fieldToSql(ref: string, alias: string): string {
  const map: Record<string, string> = {
    "txn.amount": `${alias}.txn_amount`,
    "txn.txn_type": `${alias}.txn_type`,
    "txn.dr_cr_flg": `${alias}.dr_cr_flg`,
    "txn.channel": `${alias}.channel`,
    "txn.sub_channel": `${alias}.sub_channel`,
    "txn.currency": `${alias}.currency`,
    "txn.is_cash": `${alias}.is_cash`,
    "txn.customer_type": `c.customer_type`,
    "txn.remittance_direction": `${alias}.remittance_direction`,
  };
  return map[ref] || `${alias}.txn_amount`;
}

/**
 * Map an operator to SQL.
 */
function opToSql(op: string): string {
  const map: Record<string, string> = {
    eq: "=", neq: "!=", lt: "<", lte: "<=", gt: ">", gte: ">=",
  };
  return map[op] || "=";
}

/**
 * Build a correlated subquery for window functions.
 */
function buildWindowSubquery(funcExpr: string, alias: string): string {
  // Parse: window_sum(txn.amount, 7d), window_count(txn, 7d), distinct_count(txn.field, 7d), window_debit_ratio(txn.amount, 7d)
  const sumMatch = funcExpr.match(/^window_sum\(txn\.amount,\s*(\d+)d\)$/);
  if (sumMatch) {
    const days = sumMatch[1];
    return `(SELECT COALESCE(SUM(w.txn_amount), 0) FROM transactions w WHERE w.account_no = ${alias}.account_no AND w.txn_date BETWEEN ${alias}.txn_date - INTERVAL '${days} days' AND ${alias}.txn_date)`;
  }

  const countMatch = funcExpr.match(/^window_count\(txn,\s*(\d+)d\)$/);
  if (countMatch) {
    const days = countMatch[1];
    return `(SELECT COUNT(*) FROM transactions w WHERE w.account_no = ${alias}.account_no AND w.txn_date BETWEEN ${alias}.txn_date - INTERVAL '${days} days' AND ${alias}.txn_date)`;
  }

  const distinctMatch = funcExpr.match(/^distinct_count\(txn\.(\w+),\s*(\d+)d\)$/);
  if (distinctMatch) {
    const field = distinctMatch[1];
    const days = distinctMatch[2];
    return `(SELECT COUNT(DISTINCT w.${field}) FROM transactions w WHERE w.account_no = ${alias}.account_no AND w.txn_date BETWEEN ${alias}.txn_date - INTERVAL '${days} days' AND ${alias}.txn_date)`;
  }

  const ratioMatch = funcExpr.match(/^window_debit_ratio\(txn\.amount,\s*(\d+)d\)$/);
  if (ratioMatch) {
    const days = ratioMatch[1];
    return `(SELECT COALESCE(SUM(CASE WHEN w.dr_cr_flg = 'D' THEN w.txn_amount ELSE 0 END) / NULLIF(SUM(CASE WHEN w.dr_cr_flg = 'C' THEN w.txn_amount ELSE 0 END), 0), 0) FROM transactions w WHERE w.account_no = ${alias}.account_no AND w.txn_date BETWEEN ${alias}.txn_date - INTERVAL '${days} days' AND ${alias}.txn_date)`;
  }

  return "0";
}

/**
 * Build complete WHERE clause from rule conditions.
 */
function buildWhereClause(conditions: ConditionEntry[], alias: string): string {
  const parts: string[] = [];

  for (const cond of conditions) {
    const parsed = parseFieldRef(cond.left);
    let leftSql: string;

    if (parsed.type === "field") {
      leftSql = fieldToSql(cond.left, alias);
    } else if (parsed.type === "window") {
      leftSql = buildWindowSubquery(cond.left, alias);
    } else {
      // account.days_since_last_activity
      leftSql = `(${alias}.txn_date - a.last_client_activity_date)`;
    }

    const op = opToSql(cond.op);

    // Handle type coercion for the right side
    let rightSql: string;
    if (cond.right === "true") {
      rightSql = "true";
    } else if (cond.right === "false") {
      rightSql = "false";
    } else if (!isNaN(Number(cond.right))) {
      rightSql = cond.right;
    } else {
      rightSql = `'${cond.right.replace(/'/g, "''")}'`;
    }

    parts.push(`${leftSql} ${op} ${rightSql}`);
  }

  return parts.join(" AND ");
}

/**
 * Run a single rule against all transactions.
 */
export async function runRule(
  rule: RuleRow,
  client: PoolClient
): Promise<RuleRunResult> {
  const alias = "t";
  const whereClause = buildWhereClause(rule.rule_condition, alias);

  const query = `
    INSERT INTO alerts (txn_id, rule_id, severity, status, explain, dedupe_key)
    SELECT
      ${alias}.txn_id,
      ${rule.rule_id},
      '${rule.risk_level}',
      'OPEN',
      jsonb_build_object(
        'rule_name', '${rule.rule_name.replace(/'/g, "''")}',
        'matched_values', '{}'::jsonb,
        'condition', '${JSON.stringify(rule.rule_condition).replace(/'/g, "''")}'::jsonb
      ),
      '${rule.rule_id}_' || ${alias}.txn_id::text
    FROM transactions ${alias}
    JOIN customers c ON c.customer_id = ${alias}.customer_id
    JOIN accounts a ON a.account_no = ${alias}.account_no
    WHERE ${whereClause}
    ON CONFLICT (dedupe_key) DO NOTHING
  `;

  const result = await client.query(query);

  return {
    ruleId: rule.rule_id,
    ruleName: rule.rule_name,
    alertsCreated: result.rowCount || 0,
  };
}

/**
 * Run all active rules.
 */
export async function runAllRules(client: PoolClient): Promise<RuleRunResult[]> {
  const rulesResult = await client.query(
    "SELECT rule_id, rule_name, risk_level, rule_condition FROM rules WHERE is_active = true ORDER BY rule_id"
  );

  const results: RuleRunResult[] = [];
  for (const rule of rulesResult.rows) {
    try {
      const result = await runRule(rule, client);
      results.push(result);
    } catch (err) {
      console.error(`Error running rule ${rule.rule_id} (${rule.rule_name}):`, err);
      results.push({ ruleId: rule.rule_id, ruleName: rule.rule_name, alertsCreated: 0 });
    }
  }

  return results;
}

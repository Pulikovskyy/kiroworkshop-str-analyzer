"use server";

import { withClient } from "@/app/lib/db";
import { Rule, CreateRuleInput } from "@/types";

function serializeRule(row: any): Rule {
  return {
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function getRules(): Promise<Rule[]> {
  return withClient(async (client) => {
    const result = await client.query(
      "SELECT * FROM rules ORDER BY rule_id"
    );
    return result.rows.map(serializeRule);
  });
}

export async function createRule(input: CreateRuleInput): Promise<Rule> {
  return withClient(async (client) => {
    const result = await client.query(
      `INSERT INTO rules (rule_name, description, risk_level, scenario_ref, target_case, rule_condition)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING *`,
      [
        input.rule_name,
        input.description || null,
        input.risk_level,
        input.scenario_ref || null,
        input.target_case || null,
        JSON.stringify(input.rule_condition),
      ]
    );
    return serializeRule(result.rows[0]);
  });
}

export async function toggleRuleActive(ruleId: number, active: boolean): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      "UPDATE rules SET is_active = $2 WHERE rule_id = $1",
      [ruleId, active]
    );
  });
}

export async function deleteRule(ruleId: number): Promise<void> {
  await withClient(async (client) => {
    await client.query("DELETE FROM rules WHERE rule_id = $1", [ruleId]);
  });
}

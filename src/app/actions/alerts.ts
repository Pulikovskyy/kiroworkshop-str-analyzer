"use server";

import { withClient, withTransaction } from "@/app/lib/db";
import { Alert, AlertDetail, AlertFilters } from "@/types";

function serializeRow(row: any) {
  return {
    ...row,
    txn_amount: row.txn_amount ? parseFloat(row.txn_amount) : undefined,
    txn_date: row.txn_date instanceof Date ? row.txn_date.toISOString().split("T")[0] : row.txn_date,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    reviewed_at: row.reviewed_at instanceof Date ? row.reviewed_at.toISOString() : row.reviewed_at,
    tagged_at: row.tagged_at instanceof Date ? row.tagged_at.toISOString() : row.tagged_at,
  };
}

export async function getAlerts(filters?: AlertFilters): Promise<Alert[]> {
  return withClient(async (client) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`a.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters?.severity) {
      conditions.push(`a.severity = $${idx++}`);
      params.push(filters.severity);
    }
    if (filters?.rule_id) {
      conditions.push(`a.rule_id = $${idx++}`);
      params.push(filters.rule_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await client.query(
      `SELECT a.*, r.rule_name, t.txn_amount, t.customer_id, c.full_name
       FROM alerts a
       JOIN rules r ON r.rule_id = a.rule_id
       JOIN transactions t ON t.txn_id = a.txn_id
       JOIN customers c ON c.customer_id = t.customer_id
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );

    return result.rows.map(serializeRow);
  });
}

export async function getAlertById(alertId: number): Promise<AlertDetail | null> {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT a.*,
              t.customer_id, t.account_no, t.txn_date, t.txn_type, t.dr_cr_flg, t.txn_amount, t.currency, t.channel, t.sub_channel, t.is_cash, t.counterparty_id, t.remittance_direction,
              r.rule_name, r.description as rule_description, r.risk_level, r.scenario_ref, r.target_case, r.rule_condition,
              c.full_name, c.customer_type, c.occupation, c.source_of_funds, c.risk_rating
       FROM alerts a
       JOIN transactions t ON t.txn_id = a.txn_id
       JOIN rules r ON r.rule_id = a.rule_id
       JOIN customers c ON c.customer_id = t.customer_id
       WHERE a.alert_id = $1`,
      [alertId]
    );

    if (result.rows.length === 0) return null;
    return serializeRow(result.rows[0]);
  });
}

export async function approveAlert(alertId: number, actor: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE alerts SET status = 'APPROVED', reviewed_by = $2, reviewed_at = now() WHERE alert_id = $1 AND status = 'OPEN'`,
      [alertId, actor]
    );
    await client.query(
      `INSERT INTO audit_log (actor, action, detail) VALUES ($1, 'ALERT_APPROVED', $2)`,
      [actor, JSON.stringify({ alert_id: alertId })]
    );
  });
}

export async function disapproveAlert(alertId: number, actor: string, notes: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE alerts SET status = 'DISAPPROVED', reviewed_by = $2, reviewed_at = now(), review_notes = $3 WHERE alert_id = $1 AND status = 'OPEN'`,
      [alertId, actor, notes]
    );
    await client.query(
      `INSERT INTO audit_log (actor, action, detail) VALUES ($1, 'ALERT_DISAPPROVED', $2)`,
      [actor, JSON.stringify({ alert_id: alertId, notes })]
    );
  });
}

export async function dismissAlert(alertId: number, actor: string, reason: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE alerts SET status = 'DISMISSED', reviewed_by = $2, reviewed_at = now(), review_notes = $3 WHERE alert_id = $1 AND status = 'OPEN'`,
      [alertId, actor, reason]
    );
    await client.query(
      `INSERT INTO audit_log (actor, action, detail) VALUES ($1, 'ALERT_DISMISSED', $2)`,
      [actor, JSON.stringify({ alert_id: alertId, reason })]
    );
  });
}

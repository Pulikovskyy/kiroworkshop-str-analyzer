"use server";

import { withClient } from "@/app/lib/db";
import { AuditEntry, AuditFilters } from "@/types";

export async function logAction(
  actor: string,
  action: string,
  detail?: object
): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      `INSERT INTO audit_log (actor, action, detail) VALUES ($1, $2, $3)`,
      [actor, action, detail ? JSON.stringify(detail) : null]
    );
  });
}

export async function getAuditLog(
  filters?: AuditFilters
): Promise<AuditEntry[]> {
  return withClient(async (client) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filters?.action) {
      conditions.push(`action = $${idx++}`);
      params.push(filters.action);
    }
    if (filters?.date_from) {
      conditions.push(`created_at >= $${idx++}`);
      params.push(filters.date_from);
    }
    if (filters?.date_to) {
      conditions.push(`created_at <= $${idx++}`);
      params.push(filters.date_to);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await client.query(
      `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT 500`,
      params
    );

    return result.rows.map((row) => ({
      ...row,
      created_at: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    }));
  });
}

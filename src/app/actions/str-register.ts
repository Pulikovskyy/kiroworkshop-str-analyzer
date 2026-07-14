"use server";

import { withTransaction, withClient } from "@/app/lib/db";
import { TagStrInput, StrEntry } from "@/types";

export async function tagAsStr(
  alertId: number,
  input: TagStrInput
): Promise<StrEntry> {
  return withTransaction(async (client) => {
    // 1. Validate alert is APPROVED
    const alertCheck = await client.query(
      "SELECT status FROM alerts WHERE alert_id = $1",
      [alertId]
    );
    if (alertCheck.rows.length === 0) throw new Error("Alert not found");
    if (alertCheck.rows[0].status !== "APPROVED") {
      throw new Error("Alert must be APPROVED before tagging as STR");
    }

    // 2. Generate STR ref number
    const year = new Date().getFullYear();
    const countResult = await client.query("SELECT count(*) FROM str_register");
    const nextNum = parseInt(countResult.rows[0].count) + 1;
    const strRefNo = `STR-${year}-${String(nextNum).padStart(6, "0")}`;

    // 3. Find associated case
    const caseResult = await client.query(
      "SELECT case_id FROM case_alerts WHERE alert_id = $1 LIMIT 1",
      [alertId]
    );
    const caseId = caseResult.rows.length > 0 ? caseResult.rows[0].case_id : null;

    // 4. Insert STR register entry
    const insertResult = await client.query(
      `INSERT INTO str_register (str_ref_no, case_id, alert_id, suspicion_code, narrative, tagged_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [strRefNo, caseId, alertId, input.suspicion_code, input.narrative, input.tagged_by]
    );

    // 5. Update alert status
    await client.query(
      "UPDATE alerts SET status = 'TAGGED_STR', reviewed_by = $2, reviewed_at = now() WHERE alert_id = $1",
      [alertId, input.tagged_by]
    );

    // 6. Check if all case alerts are resolved → update case
    if (caseId) {
      const openAlerts = await client.query(
        `SELECT count(*) FROM case_alerts ca
         JOIN alerts a ON a.alert_id = ca.alert_id
         WHERE ca.case_id = $1 AND a.status IN ('OPEN', 'APPROVED')`,
        [caseId]
      );
      if (parseInt(openAlerts.rows[0].count) === 0) {
        await client.query(
          "UPDATE cases SET status = 'CLOSED_STR', closed_at = now() WHERE case_id = $1",
          [caseId]
        );
      }
    }

    // 7. Audit log
    await client.query(
      `INSERT INTO audit_log (actor, action, detail) VALUES ($1, 'ALERT_TAGGED_STR', $2)`,
      [
        input.tagged_by,
        JSON.stringify({ alert_id: alertId, str_ref_no: strRefNo, suspicion_code: input.suspicion_code }),
      ]
    );

    const row = insertResult.rows[0];
    return {
      ...row,
      tagged_at: row.tagged_at instanceof Date ? row.tagged_at.toISOString() : row.tagged_at,
    };
  });
}

export async function getSuspicionReasons() {
  return withClient(async (client) => {
    const result = await client.query(
      "SELECT * FROM lib_suspicion_reason ORDER BY id"
    );
    return result.rows;
  });
}

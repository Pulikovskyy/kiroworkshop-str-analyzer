"use server";

import { withClient } from "@/app/lib/db";

export async function resetAlertsAndCases(): Promise<{ message: string }> {
  return withClient(async (client) => {
    await client.query("DELETE FROM case_alerts");
    await client.query("DELETE FROM str_register");
    await client.query("DELETE FROM alerts");
    await client.query("DELETE FROM cases");
    await client.query("DELETE FROM audit_log");
    return { message: "Cleared all alerts, cases, STR register, and audit log." };
  });
}

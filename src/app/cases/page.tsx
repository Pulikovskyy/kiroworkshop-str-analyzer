import { withClient } from "@/app/lib/db";

export const dynamic = "force-dynamic";

async function getCases() {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT cs.*, c.full_name,
              (SELECT count(*) FROM case_alerts ca WHERE ca.case_id = cs.case_id) as alert_count
       FROM cases cs
       JOIN customers c ON c.customer_id = cs.customer_id
       ORDER BY cs.created_at DESC`
    );
    return result.rows.map((row) => ({
      ...row,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    }));
  });
}

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cases</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {cases.length} investigation case{cases.length !== 1 ? "s" : ""}
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500">No cases yet. Cases are auto-created when the analyzer generates alerts.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c: any) => (
            <div key={c.case_id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold">{c.case_ref}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "OPEN" ? "bg-blue-100 text-blue-800" :
                      c.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-800" :
                      c.status === "ESCALATED" ? "bg-red-100 text-red-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{c.full_name}</div>
                  {c.summary && <div className="mt-2 text-sm">{c.summary}</div>}
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-500">{c.alert_count} alert{c.alert_count != 1 ? "s" : ""}</div>
                  <div className="text-xs text-gray-400 mt-1">{c.priority} priority</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

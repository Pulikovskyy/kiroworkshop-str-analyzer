import { getAlerts } from "@/app/actions/alerts";
import { SeverityBadge } from "@/components/severity-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuspiciousPage() {
  const alerts = await getAlerts({ status: "APPROVED" });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Suspicious Transactions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {alerts.length} approved alert{alerts.length !== 1 ? "s" : ""} confirmed as suspicious — ready for STR tagging
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500">No approved alerts yet. Approve alerts from the Alerts page to see them here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Rule</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Severity</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {alerts.map((alert: any) => (
                <tr key={alert.alert_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs">{alert.alert_id}</td>
                  <td className="px-4 py-3 font-medium">{alert.rule_name}</td>
                  <td className="px-4 py-3">{alert.full_name}</td>
                  <td className="px-4 py-3 font-mono">
                    {alert.txn_amount ? parseFloat(alert.txn_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
                  </td>
                  <td className="px-4 py-3"><SeverityBadge level={alert.severity} /></td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/suspicious/${alert.alert_id}`}
                      className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded font-medium"
                    >
                      Tag as STR
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

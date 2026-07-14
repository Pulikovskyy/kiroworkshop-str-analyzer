"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveAlert, disapproveAlert, dismissAlert } from "@/app/actions/alerts";
import { SeverityBadge } from "@/components/severity-badge";

export function AlertsClient({ alerts }: { alerts: any[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleApprove = (alertId: number) => {
    startTransition(async () => {
      await approveAlert(alertId, "analyst");
      router.refresh();
    });
  };

  const handleDismiss = (alertId: number) => {
    const reason = prompt("Enter dismissal reason:");
    if (!reason) return;
    startTransition(async () => {
      await dismissAlert(alertId, "analyst", reason);
      router.refresh();
    });
  };

  const handleDisapprove = (alertId: number) => {
    const notes = prompt("Why is this a false positive?");
    if (!notes) return;
    startTransition(async () => {
      await disapproveAlert(alertId, "analyst", notes);
      router.refresh();
    });
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-500">No open alerts. Run the analyzer from the Rules page to generate alerts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left font-medium">ID</th>
            <th className="px-4 py-3 text-left font-medium">Rule</th>
            <th className="px-4 py-3 text-left font-medium">Customer</th>
            <th className="px-4 py-3 text-left font-medium">Amount</th>
            <th className="px-4 py-3 text-left font-medium">Severity</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {alerts.map((alert) => (
            <tr key={alert.alert_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-3 font-mono text-xs">{alert.alert_id}</td>
              <td className="px-4 py-3 max-w-xs">
                <div className="font-medium truncate">{alert.rule_name}</div>
              </td>
              <td className="px-4 py-3">
                <div>{alert.full_name}</div>
                <div className="text-xs text-gray-500">{alert.customer_id}</div>
              </td>
              <td className="px-4 py-3 font-mono">
                {alert.txn_amount ? parseFloat(alert.txn_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
              </td>
              <td className="px-4 py-3">
                <SeverityBadge level={alert.severity} />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(alert.alert_id)}
                    disabled={isPending}
                    className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded font-medium disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDisapprove(alert.alert_id)}
                    disabled={isPending}
                    className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded font-medium disabled:opacity-50"
                  >
                    Disapprove
                  </button>
                  <button
                    onClick={() => handleDismiss(alert.alert_id)}
                    disabled={isPending}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

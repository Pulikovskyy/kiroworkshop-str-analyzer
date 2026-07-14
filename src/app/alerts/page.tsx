import { getAlerts } from "@/app/actions/alerts";
import { AlertsClient } from "./alerts-client";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await getAlerts({ status: "OPEN" });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {alerts.length} open alert{alerts.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>
      <AlertsClient alerts={alerts} />
    </div>
  );
}

import { getAlertById } from "@/app/actions/alerts";
import { getSuspicionReasons } from "@/app/actions/str-register";
import { SeverityBadge } from "@/components/severity-badge";
import { TagStrForm } from "./tag-str-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SuspiciousDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const alert = await getAlertById(parseInt(id));
  if (!alert || alert.status !== "APPROVED") notFound();

  const reasons = await getSuspicionReasons();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tag as STR</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Alert #{alert.alert_id} — {alert.rule_name}
        </p>
      </div>

      {/* Alert Summary Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Customer:</span>
            <span className="ml-2 font-medium">{alert.full_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2">{alert.customer_type}</span>
          </div>
          <div>
            <span className="text-gray-500">Account:</span>
            <span className="ml-2 font-mono">{alert.account_no}</span>
          </div>
          <div>
            <span className="text-gray-500">Date:</span>
            <span className="ml-2">{alert.txn_date}</span>
          </div>
          <div>
            <span className="text-gray-500">Amount:</span>
            <span className="ml-2 font-mono font-bold">
              PHP {alert.txn_amount?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Severity:</span>
            <span className="ml-2"><SeverityBadge level={alert.severity} /></span>
          </div>
        </div>
      </div>

      {/* LLM Narrative Card */}
      {alert.llm_narrative && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">AI Analysis</h3>
          </div>
          <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
            {alert.llm_narrative}
          </p>
        </div>
      )}

      {/* Tag Form */}
      <TagStrForm
        alertId={alert.alert_id}
        reasons={reasons}
        defaultNarrative={alert.llm_narrative || ""}
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Rule } from "@/types";
import { toggleRuleActive } from "@/app/actions/rules";
import { runAnalyzer } from "@/app/actions/run-analyzer";
import { SeverityBadge } from "@/components/severity-badge";
import { useRouter } from "next/navigation";

export function RulesClient({ rules }: { rules: Rule[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleRunAnalyzer = () => {
    startTransition(async () => {
      const res = await runAnalyzer();
      setResult(
        `${res.rulesEvaluated} rules evaluated, ${res.alertsCreated} alerts created, ${res.casesCreated} cases created`
      );
      router.refresh();
    });
  };

  const handleToggle = (ruleId: number, currentActive: boolean) => {
    startTransition(async () => {
      await toggleRuleActive(ruleId, !currentActive);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          onClick={handleRunAnalyzer}
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
        >
          {isPending ? "Running..." : "Run Analyzer"}
        </button>
        {result && (
          <span className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-3 py-1.5 rounded-md">
            {result}
          </span>
        )}
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Rule Name</th>
              <th className="px-4 py-3 text-left font-medium">Scenario</th>
              <th className="px-4 py-3 text-left font-medium">Severity</th>
              <th className="px-4 py-3 text-left font-medium">Active</th>
              <th className="px-4 py-3 text-left font-medium">Conditions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rules.map((rule) => (
              <tr key={rule.rule_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs">{rule.rule_id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{rule.rule_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{rule.description}</div>
                </td>
                <td className="px-4 py-3 text-xs">{rule.scenario_ref || "—"}</td>
                <td className="px-4 py-3">
                  <SeverityBadge level={rule.risk_level} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(rule.rule_id, rule.is_active)}
                    disabled={isPending}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      rule.is_active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                        rule.is_active ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-xs font-mono">
                  {rule.rule_condition.length} condition{rule.rule_condition.length !== 1 ? "s" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

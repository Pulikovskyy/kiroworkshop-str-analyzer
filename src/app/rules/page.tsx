import { getRules } from "@/app/actions/rules";
import { RulesClient } from "./rules-client";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Detection Rules</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {rules.length} rules configured ({rules.filter(r => r.is_active).length} active)
        </p>
      </div>
      <RulesClient rules={rules} />
    </div>
  );
}

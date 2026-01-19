"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  color?: "emerald" | "green" | "amber" | "red" | "blue" | "purple";
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  color = "emerald",
}: StatCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const changeClasses = {
    positive: "text-emerald-600 bg-emerald-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-slate-500 bg-slate-50",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${changeClasses[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

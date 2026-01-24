"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  color?: "emerald" | "green" | "amber" | "red" | "blue" | "purple" | "cyan";
  trend?: number[];
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  color = "emerald",
  trend,
}: StatCardProps) {
  const colorClasses = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      icon: "bg-emerald-100 text-emerald-600",
      border: "border-emerald-100",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      icon: "bg-green-100 text-green-600",
      border: "border-green-100",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      icon: "bg-amber-100 text-amber-600",
      border: "border-amber-100",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-rose-50",
      icon: "bg-red-100 text-red-600",
      border: "border-red-100",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      icon: "bg-blue-100 text-blue-600",
      border: "border-blue-100",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-violet-50",
      icon: "bg-purple-100 text-purple-600",
      border: "border-purple-100",
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
      icon: "bg-cyan-100 text-cyan-600",
      border: "border-cyan-100",
    },
  };

  const changeClasses = {
    positive: "text-emerald-600 bg-emerald-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-slate-500 bg-slate-50",
  };

  const colors = colorClasses[color];

  // Mini sparkline for trend
  const renderSparkline = () => {
    if (!trend || trend.length < 2) return null;
    
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    const width = 60;
    const height = 24;
    
    const points = trend.map((v, i) => {
      const x = (i / (trend.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');
    
    const sparkColor = changeType === 'positive' ? '#0ea371' : changeType === 'negative' ? '#ef4444' : '#94a3b8';
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sparkColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={sparkColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#spark-${title})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={sparkColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={(trend.length - 1) / (trend.length - 1) * width}
          cy={height - ((trend[trend.length - 1] - min) / range) * (height - 4) - 2}
          r="3"
          fill="white"
          stroke={sparkColor}
          strokeWidth="2"
        />
      </svg>
    );
  };

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-2">
              {changeType === "positive" && (
                <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {changeType === "negative" && (
                <svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${changeClasses[changeType]}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${colors.icon}`}>
              {icon}
            </div>
          )}
          {trend && renderSparkline()}
        </div>
      </div>
    </div>
  );
}

"use client";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, action }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Simple bar chart component (no external dependencies)
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export function SimpleBarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-900">{item.value.toLocaleString()}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || "#0ea371",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Donut chart component
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function SimpleDonutChart({ data, size = 120 }: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Filter out zero values for rendering, but keep all for legend
  const nonZeroData = data.filter(d => d.value > 0);

  // If no data or all zeros, show empty state
  if (total === 0) {
    return (
      <div className="flex items-center justify-center gap-5">
        <svg width={size} height={size} viewBox="-1 -1 2 2" className="flex-shrink-0">
          <circle cx="0" cy="0" r="1" fill="#e2e8f0" />
          <circle cx="0" cy="0" r="0.65" fill="white" />
        </svg>
        <div className="space-y-1.5">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-500">{item.label}</span>
              <span className="font-semibold text-slate-400">0</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-5">
      <svg width={size} height={size} viewBox="-1 -1 2 2" className="-rotate-90 flex-shrink-0">
        {nonZeroData.map((item, index) => {
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          const percent = item.value / total;
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;

          // Handle case where single item is 100%
          if (percent >= 0.9999) {
            return (
              <circle key={index} cx="0" cy="0" r="1" fill={item.color} />
            );
          }

          return (
            <path
              key={index}
              d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`}
              fill={item.color}
            />
          );
        })}
        <circle cx="0" cy="0" r="0.65" fill="white" />
      </svg>
      <div className="space-y-1.5">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-500">{item.label}</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Line chart with area fill (simplified)
interface AreaChartDataProps {
  data: { label: string; value: number }[];
  color?: "emerald" | "blue" | "purple" | "amber";
  height?: number;
}

const colorMap = {
  emerald: { main: "#0ea371", light: "rgba(14, 163, 113, 0.2)" },
  blue: { main: "#3b82f6", light: "rgba(59, 130, 246, 0.2)" },
  purple: { main: "#8b5cf6", light: "rgba(139, 92, 246, 0.2)" },
  amber: { main: "#f59e0b", light: "rgba(245, 158, 11, 0.2)" },
};

export function AreaChart({ data, color = "emerald", height = 140 }: AreaChartDataProps) {
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.9;
  const range = max - min || 1;
  const padding = { top: 10, bottom: 25, left: 0, right: 0 };
  const chartWidth = 600;
  const chartHeight = height;
  const graphHeight = chartHeight - padding.top - padding.bottom;
  const graphWidth = chartWidth - padding.left - padding.right;
  const colors = colorMap[color];

  const getX = (index: number) => padding.left + (index / (values.length - 1 || 1)) * graphWidth;
  const getY = (value: number) => padding.top + graphHeight - ((value - min) / range) * graphHeight;

  const points = values.map((value, index) => `${getX(index)},${getY(value)}`);
  const areaPoints = `${padding.left},${chartHeight - padding.bottom} ${points.join(" ")} ${chartWidth - padding.right},${chartHeight - padding.bottom}`;
  const linePoints = points.join(" ");

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`areaGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.main} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors.main} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#areaGradient-${color})`} />
        <polyline points={linePoints} fill="none" stroke={colors.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => (
          <circle key={index} cx={getX(index)} cy={getY(value)} r="3" fill="white" stroke={colors.main} strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {data.map((d, index) => (
          <span key={index} className="text-[10px] text-slate-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data, color = "emerald", height = 140 }: AreaChartDataProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: height }}>
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1); // Ensure at least 1
  const colors = colorMap[color];

  return (
    <div className="space-y-2" style={{ minHeight: height }}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-900">{item.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%`, backgroundColor: colors.main }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface OldAreaChartProps {
  data: number[];
  labels: string[];
  height?: number;
}

export function SimpleAreaChart({ data, labels, height = 160 }: OldAreaChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  const max = Math.max(...data, 1); // Ensure at least 1 to avoid division issues
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;
  const padding = { top: 20, bottom: 30, left: 0, right: 0 };
  const chartWidth = 600;
  const chartHeight = height;
  const graphHeight = chartHeight - padding.top - padding.bottom;
  const graphWidth = chartWidth - padding.left - padding.right;

  const getX = (index: number) => padding.left + (index / Math.max(data.length - 1, 1)) * graphWidth;
  const getY = (value: number) => padding.top + graphHeight - ((value - min) / range) * graphHeight;

  const points = data.map((value, index) => `${getX(index)},${getY(value)}`);
  const areaPoints = `${padding.left},${chartHeight - padding.bottom} ${points.join(" ")} ${chartWidth - padding.right},${chartHeight - padding.bottom}`;
  const linePoints = points.join(" ");

  // Check if all values are zero
  const allZero = data.every(v => v === 0);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea371" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ea371" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + (graphHeight / 4) * i}
            x2={chartWidth - padding.right}
            y2={padding.top + (graphHeight / 4) * i}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#areaGradient)" />
        
        {/* Line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={allZero ? "#cbd5e1" : "#0ea371"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((value, index) => (
          <g key={index}>
            <circle cx={getX(index)} cy={getY(value)} r="6" fill={allZero ? "#cbd5e1" : "#0ea371"} opacity="0.15" />
            <circle cx={getX(index)} cy={getY(value)} r="4" fill="white" stroke={allZero ? "#cbd5e1" : "#0ea371"} strokeWidth="2" />
          </g>
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-1 mt-1">
        {labels.map((label, index) => (
          <span key={index} className="text-[10px] text-slate-400">{label}</span>
        ))}
      </div>
    </div>
  );
}

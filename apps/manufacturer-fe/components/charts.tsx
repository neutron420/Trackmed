"use client";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, action, className = "" }: ChartCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
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

// Enhanced Bar Chart
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  horizontal?: boolean;
}

export function SimpleBarChart({ data, maxValue, horizontal = true }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 truncate max-w-[140px]">{item.label}</span>
              <span className="font-semibold text-slate-900">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                  backgroundColor: item.color || "#0ea371",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-around gap-2 h-32">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full flex justify-center">
            <div
              className="w-8 rounded-t-md transition-all duration-700"
              style={{
                height: `${max > 0 ? (item.value / max) * 100 : 0}px`,
                backgroundColor: item.color || "#0ea371",
                minHeight: item.value > 0 ? '8px' : '0px',
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 text-center truncate w-full">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut Chart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showTotal?: boolean;
  showLegend?: boolean;
}

export function SimpleDonutChart({ data, size = 120, showTotal = false, showLegend = true }: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const nonZeroData = data.filter(d => d.value > 0);

  if (total === 0) {
    return (
      <div className={`flex items-center ${showLegend ? 'justify-center gap-5' : 'justify-center'}`}>
        <div className="relative">
          <svg width={size} height={size} viewBox="-1 -1 2 2" className="flex-shrink-0">
            <circle cx="0" cy="0" r="1" fill="#e2e8f0" />
            <circle cx="0" cy="0" r="0.65" fill="white" />
          </svg>
          {showTotal && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-400">0</span>
            </div>
          )}
        </div>
        {showLegend && (
          <div className="space-y-1.5">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-500">{item.label}</span>
                <span className="font-semibold text-slate-400">0</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${showLegend ? 'justify-center gap-5' : 'justify-center'}`}>
      <div className="relative">
        <svg width={size} height={size} viewBox="-1 -1 2 2" className="-rotate-90 flex-shrink-0">
          {nonZeroData.map((item, index) => {
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            const percent = item.value / total;
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;

            if (percent >= 0.9999) {
              return <circle key={index} cx="0" cy="0" r="1" fill={item.color} />;
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
        {showTotal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{total}</span>
            <span className="text-[10px] text-slate-500">Total</span>
          </div>
        )}
      </div>
      {showLegend && (
        <div className="space-y-1.5">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-500">{item.label}</span>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Area Chart with data array
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
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: height }}>
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
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
            <stop offset="0%" stopColor={colors.main} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.main} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#areaGradient-${color})`} />
        <polyline points={linePoints} fill="none" stroke={colors.main} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => (
          <circle key={index} cx={getX(index)} cy={getY(value)} r="4" fill="white" stroke={colors.main} strokeWidth="2" />
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
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: height }}>
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = colorMap[color];

  return (
    <div className="space-y-2" style={{ minHeight: height }}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 truncate">{item.label}</span>
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

// Simple Area Chart with number arrays
interface SimpleAreaChartProps {
  data: number[];
  labels: string[];
  height?: number;
  color?: "emerald" | "blue" | "purple" | "amber";
  showGrid?: boolean;
}

export function SimpleAreaChart({ data, labels, height = 160, color = "emerald", showGrid = true }: SimpleAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;
  const padding = { top: 20, bottom: 30, left: 0, right: 0 };
  const chartWidth = 600;
  const chartHeight = height;
  const graphHeight = chartHeight - padding.top - padding.bottom;
  const graphWidth = chartWidth - padding.left - padding.right;
  const colors = colorMap[color];

  const getX = (index: number) => padding.left + (index / Math.max(data.length - 1, 1)) * graphWidth;
  const getY = (value: number) => padding.top + graphHeight - ((value - min) / range) * graphHeight;

  const points = data.map((value, index) => `${getX(index)},${getY(value)}`);
  const areaPoints = `${padding.left},${chartHeight - padding.bottom} ${points.join(" ")} ${chartWidth - padding.right},${chartHeight - padding.bottom}`;
  const linePoints = points.join(" ");
  const allZero = data.every(v => v === 0);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`simpleAreaGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.main} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.main} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        
        {showGrid && [0, 1, 2, 3, 4].map((i) => (
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

        <polygon points={areaPoints} fill={`url(#simpleAreaGrad-${color})`} />
        
        <polyline
          points={linePoints}
          fill="none"
          stroke={allZero ? "#cbd5e1" : colors.main}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {data.map((value, index) => (
          <g key={index}>
            <circle cx={getX(index)} cy={getY(value)} r="6" fill={allZero ? "#cbd5e1" : colors.main} opacity="0.15" />
            <circle cx={getX(index)} cy={getY(value)} r="4" fill="white" stroke={allZero ? "#cbd5e1" : colors.main} strokeWidth="2" />
          </g>
        ))}
      </svg>
      
      <div className="flex justify-between px-1 mt-1">
        {labels.map((label, index) => (
          <span key={index} className="text-[10px] text-slate-400">{label}</span>
        ))}
      </div>
    </div>
  );
}

// Mini Sparkline
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ data, color = "#0ea371", height = 30, width = 80 }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const getY = (value: number) => height - ((value - min) / range) * (height - 4) - 2;
  const getX = (index: number) => (index / (data.length - 1)) * width;

  const points = data.map((value, index) => `${getX(index)},${getY(value)}`).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={getX(data.length - 1)} cy={getY(data[data.length - 1])} r="3" fill="white" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// Progress/Gauge
interface GaugeProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: number;
}

export function Gauge({ value, max, label, color = "#0ea371", size = 120 }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.7 }}>
        <svg width={size} height={size * 0.7} viewBox="0 0 120 84" className="overflow-visible">
          <path d="M 15 75 A 45 45 0 0 1 105 75" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <path d="M 15 75 A 45 45 0 0 1 105 75" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference * 0.75} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl font-bold text-slate-800">{Math.round(percentage)}%</span>
        </div>
      </div>
      <span className="text-xs text-slate-500 mt-1">{label}</span>
    </div>
  );
}

// Stat Card with Sparkline
interface StatCardWithChartProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  sparkData?: number[];
  icon?: React.ReactNode;
  color?: string;
}

export function StatCardWithChart({ title, value, change, changeType = "neutral", sparkData, icon, color = "#0ea371" }: StatCardWithChartProps) {
  const changeColors = {
    positive: "text-emerald-600 bg-emerald-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-slate-600 bg-slate-50",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${changeColors[changeType]}`}>
              {changeType === "positive" && "↑ "}
              {changeType === "negative" && "↓ "}
              {change}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20` }}>
              <div style={{ color }}>{icon}</div>
            </div>
          )}
          {sparkData && sparkData.length > 1 && <Sparkline data={sparkData} color={color} />}
        </div>
      </div>
    </div>
  );
}

// Multi-Line Chart
interface MultiLineChartProps {
  series: { name: string; data: number[]; color: string }[];
  labels: string[];
  height?: number;
}

export function MultiLineChart({ series, labels, height = 200 }: MultiLineChartProps) {
  if (!series || series.length === 0 || !labels || labels.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  const allValues = series.flatMap(s => s.data);
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues) * 0.9;
  const range = max - min || 1;
  
  const padding = { top: 20, bottom: 40, left: 10, right: 10 };
  const chartWidth = 600;
  const chartHeight = height;
  const graphHeight = chartHeight - padding.top - padding.bottom;
  const graphWidth = chartWidth - padding.left - padding.right;

  const getX = (index: number) => padding.left + (index / Math.max(labels.length - 1, 1)) * graphWidth;
  const getY = (value: number) => padding.top + graphHeight - ((value - min) / range) * graphHeight;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={padding.left} y1={padding.top + (graphHeight / 4) * i} x2={chartWidth - padding.right} y2={padding.top + (graphHeight / 4) * i} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {series.map((s, sIndex) => {
          const points = s.data.map((value, index) => `${getX(index)},${getY(value)}`).join(" ");
          return (
            <g key={sIndex}>
              <polyline points={points} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {s.data.map((value, index) => (
                <circle key={index} cx={getX(index)} cy={getY(value)} r="4" fill="white" stroke={s.color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between px-2">
        {labels.map((label, index) => (
          <span key={index} className="text-[10px] text-slate-400">{label}</span>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-3">
        {series.map((s, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-slate-600">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

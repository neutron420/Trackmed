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

// Simple bar chart component
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export function SimpleBarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-900">{item.value.toLocaleString()}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
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

// Donut chart component
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showTotal?: boolean;
}

export function SimpleDonutChart({ data, size = 140, showTotal = false }: DonutChartProps) {
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
      <div className="flex items-center justify-center gap-6">
        <div className="relative">
          <svg width={size} height={size} viewBox="-1 -1 2 2" className="flex-shrink-0">
            <circle cx="0" cy="0" r="1" fill="#e2e8f0" />
            <circle cx="0" cy="0" r="0.6" fill="white" />
          </svg>
          {showTotal && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-400">0</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-400">0</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-6">
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
          <circle cx="0" cy="0" r="0.6" fill="white" />
        </svg>
        {showTotal && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{total}</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600">{item.label}</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Area chart
interface AreaChartProps {
  data: number[];
  labels: string[];
  height?: number;
  color?: "emerald" | "blue" | "purple" | "amber";
}

const colorMap = {
  emerald: { main: "#0ea371", gradient: "rgba(14, 163, 113, 0.2)" },
  blue: { main: "#3b82f6", gradient: "rgba(59, 130, 246, 0.2)" },
  purple: { main: "#8b5cf6", gradient: "rgba(139, 92, 246, 0.2)" },
  amber: { main: "#f59e0b", gradient: "rgba(245, 158, 11, 0.2)" },
};

export function AreaChart({ data, labels, height = 160, color = "emerald" }: AreaChartProps) {
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
          <linearGradient id={`areaGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.main} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors.main} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        
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

        <polygon points={areaPoints} fill={`url(#areaGrad-${color})`} />
        
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

// Distribution Map placeholder (simplified version without Mapbox)
interface MapDataPoint {
  city: string;
  state: string;
  count: number;
  lat?: number;
  lng?: number;
}

export function DistributionMap({ data }: { data: MapDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl">
        <p className="text-sm text-slate-400">No distribution data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <div>
              <p className="font-medium text-slate-800">{item.city}</p>
              <p className="text-xs text-slate-500">{item.state}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-600">{item.count}</p>
              <div className="mt-1 h-1 w-16 rounded-full bg-slate-200">
                <div 
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length > 8 && (
        <p className="text-center text-xs text-slate-400">+{data.length - 8} more locations</p>
      )}
    </div>
  );
}

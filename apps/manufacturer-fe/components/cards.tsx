"use client";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export function QuickAction({ icon, label, description, onClick, variant = "secondary" }: QuickActionProps) {
  const baseStyles = "flex items-center gap-3 rounded-lg p-3 text-left transition-all";
  const variantStyles = {
    primary: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/50 hover:shadow-emerald-300/50 hover:scale-[1.01]",
    secondary: "bg-white border border-slate-200 text-slate-900 hover:border-emerald-200 hover:bg-emerald-50/30",
  }[variant];

  return (
    <button className={`${baseStyles} ${variantStyles}`} onClick={onClick}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${variant === "primary" ? "bg-white/20" : "bg-emerald-50 text-emerald-600"}`}>
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {description && (
          <p className={`text-xs ${variant === "primary" ? "text-white/80" : "text-slate-500"}`}>
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

// Progress card for targets/goals
interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
}

export function ProgressCard({ title, current, target, unit = "" }: ProgressCardProps) {
  const percent = Math.min((current / target) * 100, 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-600">{title}</p>
        <span className="text-[10px] text-slate-400">{percent.toFixed(0)}%</span>
      </div>
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-base font-bold text-slate-900">
          {current.toLocaleString()}
          {unit}
        </span>
        <span className="text-[10px] text-slate-500">
          of {target.toLocaleString()}
          {unit}
        </span>
      </div>
    </div>
  );
}

// Alert/notification card
interface AlertCardProps {
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function AlertCard({ type, title, message, action }: AlertCardProps) {
  const styles = {
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", title: "text-amber-800" },
    error: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-500", title: "text-red-800" },
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-500", title: "text-blue-800" },
    success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500", title: "text-emerald-800" },
  }[type];

  const icons = {
    warning: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className={`rounded-lg border ${styles.bg} ${styles.border} px-3 py-2.5`}>
      <div className="flex gap-2.5">
        <div className={`${styles.icon} flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4`}>{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${styles.title}`}>{title}</p>
          <p className="text-[11px] text-slate-600 line-clamp-2">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-1.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

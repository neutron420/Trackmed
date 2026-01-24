"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarProps {
  user: {
    name: string | null;
    email: string;
    role: string;
  } | null;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const navSections = [
  {
    title: "Navigation",
    items: [
      { 
        label: "Dashboard", 
        href: "/dashboard", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        )
      },
      { 
        label: "Analytics", 
        href: "/dashboard/analytics", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
          </svg>
        )
      },
    ],
  },
  {
    title: "Users",
    items: [
      { 
        label: "All Users", 
        href: "/dashboard/users", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
      { 
        label: "Manufacturers", 
        href: "/dashboard/manufacturers", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
            <path d="M9 9v.01" />
            <path d="M9 12v.01" />
            <path d="M9 15v.01" />
            <path d="M9 18v.01" />
          </svg>
        )
      },
      { 
        label: "Distributors", 
        href: "/dashboard/distributors", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-5" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        )
      },
      { 
        label: "Pharmacies", 
        href: "/dashboard/pharmacies", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
        )
      },
    ],
  },
  {
    title: "Supply Chain",
    items: [
      { 
        label: "Batches", 
        href: "/dashboard/batches", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
      },
      { 
        label: "Shipments", 
        href: "/dashboard/shipments", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-5" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        )
      },
      { 
        label: "Products", 
        href: "/dashboard/products", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )
      },
    ],
  },
  {
    title: "Verification",
    items: [
      { 
        label: "QR Scans", 
        href: "/dashboard/qr-scans", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        )
      },
      { 
        label: "Fraud Alerts", 
        href: "/dashboard/fraud-alerts", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      },
    ],
  },
  {
    title: "Communication",
    items: [
      { 
        label: "Chat", 
        href: "/dashboard/chat", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      },
    ],
  },
  {
    title: "Reports",
    items: [
      { 
        label: "Reports", 
        href: "/dashboard/reports", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
      },
      { 
        label: "Audit Trail", 
        href: "/dashboard/audit", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="2" />
            <line x1="9" y1="12" x2="9.01" y2="12" />
            <line x1="13" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="9.01" y2="16" />
            <line x1="13" y1="16" x2="15" y2="16" />
          </svg>
        )
      },
    ],
  },
  {
    title: "Settings",
    items: [
      { 
        label: "Settings", 
        href: "/dashboard/settings", 
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        )
      },
    ],
  },
];

export function Sidebar({ user, onLogout, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out"
      style={{ width: isCollapsed ? 72 : 260 }}
    >
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <Image
              src="/trackmed-logo.png"
              alt="TrackMed"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-800">TrackMed</p>
              <p className="text-[10px] font-medium text-emerald-600">Admin Portal</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'none' }}>
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-5">
            {!isCollapsed && (
              <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                const exactActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-emerald-600" />
                    )}
                    <span className={`shrink-0 transition-colors ${active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-100 p-3">
        {!isCollapsed ? (
          <Link
            href="/dashboard/profile"
            className="mb-2 flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-semibold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.name || user?.email}</p>
              <p className="truncate text-[11px] font-medium text-emerald-600">{user?.role}</p>
            </div>
          </Link>
        ) : (
          <Link
            href="/dashboard/profile"
            className="mb-2 flex justify-center rounded-lg p-2 transition-all hover:bg-slate-50"
            title="Profile"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
          </Link>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

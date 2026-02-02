"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";
import { getToken, getUser, clearAuth, isAdmin } from "../../../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface FraudAlert {
  id: string;
  type: string;
  severity: string;
  description: string;
  qrCode?: { code: string };
  batch?: { batchNumber: string };
  location?: string;
  isResolved: boolean;
  createdAt: string;
}

export default function FraudAlertsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);

  const fetchAlerts = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/fraud-alert?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch fraud alerts:", error);
      // Mock data for demo
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/login");
      return;
    }
    setUser(storedUser);
    fetchAlerts().finally(() => setIsLoading(false));
  }, [router, fetchAlerts]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "HIGH": case "CRITICAL": return "danger";
      case "MEDIUM": return "warning";
      case "LOW": return "info";
      default: return "neutral";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />

      <main
        className="min-h-screen transition-all duration-200"
        style={{ marginLeft: isCollapsed ? 72 : 280 }}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Fraud Alerts</h1>
              <p className="text-sm text-slate-500">Detect and investigate suspicious activities</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Alerts</p>
              <p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Critical</p>
              <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.severity === "CRITICAL" || a.severity === "HIGH").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Unresolved</p>
              <p className="text-2xl font-bold text-amber-600">{alerts.filter(a => !a.isResolved).length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Resolved</p>
              <p className="text-2xl font-bold text-emerald-600">{alerts.filter(a => a.isResolved).length}</p>
            </div>
          </div>

          {/* Alert Types Info */}
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-800">Fraud Detection Types</h3>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  <li>• <strong>Multiple Scans:</strong> Same QR code scanned from different locations</li>
                  <li>• <strong>Expired Medicine:</strong> Scans of expired medicine batches</li>
                  <li>• <strong>Recalled Batch:</strong> Scans of recalled medicine batches</li>
                  <li>• <strong>Invalid QR:</strong> Attempts to scan non-existent QR codes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {alerts.length > 0 ? (
              <DataTable
                columns={[
                  {
                    key: "time",
                    label: "Time",
                    render: (item) => (
                      <div>
                        <p className="text-sm font-medium text-slate-700">{formatTimeAgo(item.createdAt)}</p>
                        <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                    ),
                  },
                  {
                    key: "type",
                    label: "Type",
                    render: (item) => (
                      <span className="text-sm font-medium text-slate-900">{item.type?.replace(/_/g, " ")}</span>
                    ),
                  },
                  {
                    key: "severity",
                    label: "Severity",
                    render: (item) => (
                      <StatusBadge status={item.severity} variant={getSeverityVariant(item.severity)} />
                    ),
                  },
                  {
                    key: "description",
                    label: "Description",
                    render: (item) => (
                      <span className="text-sm text-slate-600 truncate max-w-[200px] block">{item.description}</span>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (item) => (
                      <StatusBadge 
                        status={item.isResolved ? "Resolved" : "Open"} 
                        variant={item.isResolved ? "success" : "warning"} 
                      />
                    ),
                  },
                  {
                    key: "actions",
                    label: "",
                    render: () => (
                      <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Investigate →</button>
                    ),
                  },
                ]}
                data={alerts}
              />
            ) : (
              <div className="py-12 text-center">
                <svg className="h-12 w-12 mx-auto text-emerald-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900">No Fraud Alerts</h3>
                <p className="text-sm text-slate-500 mt-1">All clear! No suspicious activities detected.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

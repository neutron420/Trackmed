"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";
import { getToken, getUser, clearAuth, isAuthenticated, isAdmin } from "../../../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string;
  performedBy: string;
  metadata?: any;
  createdAt: string;
}

export default function AuditPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const fetchAuditLogs = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/audit-trail?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      clearAuth();
      router.push("/login");
      return;
    }

    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      fetchAuditLogs().finally(() => setIsLoading(false));
    } else {
      router.push("/login");
    }
  }, [router, fetchAuditLogs]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const getActionVariant = (action: string) => {
    if (action.includes("CREATE") || action.includes("REGISTER")) return "success";
    if (action.includes("DELETE") || action.includes("RECALL")) return "danger";
    if (action.includes("UPDATE") || action.includes("SHIP")) return "warning";
    return "neutral";
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

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !search || 
      (log.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.entityType || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.action || "").toLowerCase().includes(search.toLowerCase());
    const matchesAction = !actionFilter || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

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
              <h1 className="text-xl font-bold text-slate-900">Audit Trail</h1>
              <p className="text-sm text-slate-500">Complete log of all platform activities</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="SHIP">Ship</option>
              <option value="SCAN">Scan</option>
            </select>
            <button
              onClick={() => fetchAuditLogs()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
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
                  key: "action",
                  label: "Action",
                  render: (item) => (
                    <StatusBadge 
                      status={(item.action || "").replace(/_/g, " ")} 
                      variant={getActionVariant(item.action || "")} 
                    />
                  ),
                },
                {
                  key: "entity",
                  label: "Entity",
                  render: (item) => (
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.entityType || "—"}</p>
                      <p className="text-xs text-slate-500 font-mono">{(item.entityId || "").slice(0, 12)}...</p>
                    </div>
                  ),
                },
                {
                  key: "user",
                  label: "User",
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {(item.userName || "S")[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-700">{item.userName || "System"}</span>
                    </div>
                  ),
                },
                {
                  key: "details",
                  label: "Details",
                  render: (item) => {
                    const details = item.metadata;
                    if (!details || Object.keys(details).length === 0) {
                      return <span className="text-xs text-slate-400">—</span>;
                    }
                    const keyInfo: string[] = [];
                    if (details.batchNumber) keyInfo.push(`Batch: ${details.batchNumber}`);
                    if (details.quantity) keyInfo.push(`Qty: ${details.quantity}`);
                    if (keyInfo.length === 0) return <span className="text-xs text-slate-400">—</span>;
                    return (
                      <div className="max-w-[150px]">
                        <p className="truncate text-xs text-slate-600">{keyInfo[0]}</p>
                      </div>
                    );
                  },
                },
              ]}
              data={filteredLogs}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

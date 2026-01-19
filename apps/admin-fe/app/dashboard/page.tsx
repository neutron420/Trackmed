"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../components/sidebar";
import { StatCard } from "../../components/stat-card";
import { DataTable, StatusBadge } from "../../components/data-table";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface DashboardStats {
  users: {
    total: number;
    manufacturers: number;
    distributors: number;
    pharmacies: number;
    admins: number;
  };
  batches: {
    total: number;
    active: number;
    recalled: number;
    expired: number;
  };
  shipments: {
    total: number;
    inTransit: number;
    delivered: number;
    pending: number;
  };
  scans: {
    total: number;
    verified: number;
    failed: number;
  };
  fraudAlerts: number;
}

interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentBatches, setRecentBatches] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const results = await Promise.allSettled([
        fetch(`${API_BASE}/api/admin/stats`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/audit-trail?limit=10`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/batch?limit=5`, { headers }).then(r => r.json()),
      ]);

      // Process stats
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setStats(results[0].value.data);
      } else {
        // Fallback: Calculate stats from other endpoints
        const [usersRes, batchesRes, shipmentsRes, scansRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/user?limit=1`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/api/batch?limit=1`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/api/shipment?limit=1`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/api/qr-code?limit=1`, { headers }).then(r => r.json()),
        ]);

        setStats({
          users: {
            total: usersRes.status === 'fulfilled' ? (usersRes.value.pagination?.total || 0) : 0,
            manufacturers: 0,
            distributors: 0,
            pharmacies: 0,
            admins: 0,
          },
          batches: {
            total: batchesRes.status === 'fulfilled' ? (batchesRes.value.pagination?.total || 0) : 0,
            active: 0,
            recalled: 0,
            expired: 0,
          },
          shipments: {
            total: shipmentsRes.status === 'fulfilled' ? (shipmentsRes.value.pagination?.total || 0) : 0,
            inTransit: 0,
            delivered: 0,
            pending: 0,
          },
          scans: {
            total: scansRes.status === 'fulfilled' ? (scansRes.value.stats?.totalScans || 0) : 0,
            verified: 0,
            failed: 0,
          },
          fraudAlerts: 0,
        });
      }

      // Process activities
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        setRecentActivities(results[1].value.data || []);
      }

      // Process batches
      if (results[2].status === 'fulfilled' && results[2].value.success) {
        setRecentBatches(results[2].value.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
      fetchDashboardData().finally(() => setIsLoading(false));
    } catch {
      router.push("/login");
    }
  }, [router, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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
        <div className="text-center">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
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
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Platform overview and management</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export
              </button>
              <button 
                onClick={() => fetchDashboardData()}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats?.users.total || 0}
              change={`${stats?.users.manufacturers || 0} manufacturers`}
              changeType="neutral"
              color="emerald"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <StatCard
              title="Total Batches"
              value={stats?.batches.total || 0}
              change={`${stats?.batches.active || 0} active`}
              changeType="positive"
              color="emerald"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <StatCard
              title="Total Shipments"
              value={stats?.shipments.total || 0}
              change={`${stats?.shipments.inTransit || 0} in transit`}
              changeType="neutral"
              color="blue"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
            />
            <StatCard
              title="Fraud Alerts"
              value={stats?.fraudAlerts || 0}
              change="Requires attention"
              changeType={stats?.fraudAlerts ? "negative" : "neutral"}
              color="red"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            />
          </div>

          {/* Secondary Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="QR Scans"
              value={stats?.scans.total || 0}
              change={`${stats?.scans.verified || 0} verified`}
              changeType="positive"
              color="green"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
            />
            <StatCard
              title="Distributors"
              value={stats?.users.distributors || 0}
              change="Active partners"
              changeType="neutral"
              color="amber"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
            />
            <StatCard
              title="Pharmacies"
              value={stats?.users.pharmacies || 0}
              change="Registered"
              changeType="neutral"
              color="emerald"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            />
            <StatCard
              title="Delivered"
              value={stats?.shipments.delivered || 0}
              change={`${Math.round((stats?.shipments.delivered || 0) / (stats?.shipments.total || 1) * 100)}% rate`}
              changeType="positive"
              color="blue"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Batches */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Recent Batches</h2>
                <button 
                  onClick={() => router.push("/dashboard/batches")}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all →
                </button>
              </div>
              <DataTable
                columns={[
                  {
                    key: "batchNumber",
                    label: "Batch",
                    render: (item) => (
                      <span className="font-semibold text-emerald-700">{item.batchNumber}</span>
                    ),
                  },
                  {
                    key: "medicine",
                    label: "Medicine",
                    render: (item) => <span className="text-slate-700">{item.medicine?.name || "—"}</span>,
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (item) => (
                      <StatusBadge
                        status={item.status || "ACTIVE"}
                        variant={item.status === "RECALLED" ? "danger" : item.status === "EXPIRED" ? "warning" : "success"}
                      />
                    ),
                  },
                ]}
                data={recentBatches}
                onRowClick={(item) => router.push(`/dashboard/batches/${item.id}`)}
              />
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Recent Activity</h2>
                <button 
                  onClick={() => router.push("/dashboard/audit")}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all →
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                        <span className="text-xs font-semibold text-emerald-700">
                          {(activity.userName || "S")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.action.replace(/_/g, " ")} {activity.entityType}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          by {activity.userName || "System"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => router.push("/dashboard/users")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:bg-slate-100 hover:border-slate-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Manage Users</p>
                  <p className="text-xs text-slate-500">View & manage all users</p>
                </div>
              </button>

              <button
                onClick={() => router.push("/dashboard/batches")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:bg-slate-100 hover:border-slate-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Monitor Batches</p>
                  <p className="text-xs text-slate-500">Track all batches</p>
                </div>
              </button>

              <button
                onClick={() => router.push("/dashboard/fraud-alerts")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:bg-slate-100 hover:border-slate-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Fraud Alerts</p>
                  <p className="text-xs text-slate-500">View suspicious activity</p>
                </div>
              </button>

              <button
                onClick={() => router.push("/dashboard/reports")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:bg-slate-100 hover:border-slate-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Generate Reports</p>
                  <p className="text-xs text-slate-500">Export platform data</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

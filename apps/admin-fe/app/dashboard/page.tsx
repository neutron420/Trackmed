"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../components/sidebar";
import { DataTable, StatusBadge } from "../../components/data-table";
import { 
  ChartCard, 
  SimpleDonutChart, 
  SimpleBarChart, 
  AreaChart, 
  MultiLineChart,
  StatCardWithChart,
  Gauge 
} from "../../components/charts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/** Fetch JSON and return { success, data?, error?, status } - never throws for HTTP errors */
async function fetchJson(url: string, headers: HeadersInit): Promise<{ success: boolean; data?: unknown; error?: string; status?: number }> {
  try {
    const res = await fetch(url, { headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = typeof (body as { error?: string }).error === "string"
        ? (body as { error: string }).error
        : `HTTP ${res.status}`;
      return { success: false, error: msg, status: res.status };
    }
    return body && typeof (body as { success?: boolean }).success === "boolean"
      ? (body as { success: boolean; data?: unknown; error?: string })
      : { success: true, data: body };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { success: false, error: msg };
  }
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface DashboardStats {
  users: { total: number; manufacturers: number; distributors: number; pharmacies: number; admins: number };
  batches: { total: number; active: number; recalled: number; expired: number };
  shipments: { total: number; inTransit: number; delivered: number; pending: number };
  scans: { total: number; verified: number; failed: number };
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
  const [trendData, setTrendData] = useState<{ batches: number[]; shipments: number[]; labels: string[] }>({
    batches: [], shipments: [], labels: []
  });

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Fetch all dashboard data in parallel (stats via fetchJson for clear error handling)
      const results = await Promise.allSettled([
        fetchJson(`${API_BASE}/api/admin/stats`, headers),
        fetch(`${API_BASE}/api/audit-trail?limit=10`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/batch?limit=5`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/batch?limit=200`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/shipment?limit=200`, { headers }).then(r => r.json()),
      ]);

      // Process stats from admin endpoint
      const statsResult = results[0].status === "fulfilled" ? results[0].value : null;
      const statsData = statsResult?.success && statsResult.data && typeof statsResult.data === "object" && "users" in statsResult.data
        ? (statsResult.data as DashboardStats)
        : null;
      if (statsData) {
        setStats(statsData);
      } else {
        const errMsg = statsResult?.error ?? (results[0].status === "rejected" ? String((results[0] as PromiseRejectedResult).reason) : "Invalid or empty response");
        console.error("Failed to fetch admin stats:", errMsg, statsResult?.status ? `(HTTP ${statsResult.status})` : "");
        // Fallback to default stats
        setStats({
          users: { total: 0, manufacturers: 0, distributors: 0, pharmacies: 0, admins: 0 },
          batches: { total: 0, active: 0, recalled: 0, expired: 0 },
          shipments: { total: 0, inTransit: 0, delivered: 0, pending: 0 },
          scans: { total: 0, verified: 0, failed: 0 },
          fraudAlerts: 0,
        });
      }

      // Process activities
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        setRecentActivities(results[1].value.data || []);
      }

      // Process recent batches for table
      if (results[2].status === 'fulfilled' && results[2].value.success) {
        setRecentBatches(results[2].value.data || []);
      }

      // Calculate trend data from batches and shipments
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      const dayLabels = last7Days.map(d => new Date(d).toLocaleDateString('en', { weekday: 'short' }));

      let batchTrend = Array(7).fill(0);
      let shipmentTrend = Array(7).fill(0);

      if (results[3].status === 'fulfilled' && results[3].value.success) {
        (results[3].value.data || []).forEach((b: any) => {
          const date = new Date(b.createdAt).toISOString().split('T')[0];
          const idx = last7Days.indexOf(date);
          if (idx >= 0) batchTrend[idx]++;
        });
      }

      if (results[4].status === 'fulfilled' && results[4].value.success) {
        (results[4].value.data || []).forEach((s: any) => {
          const date = new Date(s.createdAt).toISOString().split('T')[0];
          const idx = last7Days.indexOf(date);
          if (idx >= 0) shipmentTrend[idx]++;
        });
      }

      setTrendData({ batches: batchTrend, shipments: shipmentTrend, labels: dayLabels });

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

  // Prepare chart data
  const userDistribution = [
    { label: "Manufacturers", value: stats?.users.manufacturers || 0, color: "#0ea371" },
    { label: "Distributors", value: stats?.users.distributors || 0, color: "#3b82f6" },
    { label: "Pharmacies", value: stats?.users.pharmacies || 0, color: "#8b5cf6" },
    { label: "Admins", value: stats?.users.admins || 0, color: "#f59e0b" },
  ];

  const batchStatusData = [
    { label: "Active", value: stats?.batches.active || 0, color: "#0ea371" },
    { label: "Recalled", value: stats?.batches.recalled || 0, color: "#ef4444" },
    { label: "Expired", value: stats?.batches.expired || 0, color: "#f59e0b" },
  ];

  const shipmentStatusData = [
    { label: "Delivered", value: stats?.shipments.delivered || 0, color: "#0ea371" },
    { label: "In Transit", value: stats?.shipments.inTransit || 0, color: "#3b82f6" },
    { label: "Pending", value: stats?.shipments.pending || 0, color: "#f59e0b" },
  ];

  const deliveryRate = stats?.shipments.total ? Math.round((stats.shipments.delivered / stats.shipments.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} onLogout={handleLogout} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="min-h-screen transition-all duration-200" style={{ marginLeft: isCollapsed ? 72 : 280 }}>
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">Welcome back, {user?.name || "Admin"}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/dashboard/reports")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Export
              </button>
              <button onClick={() => fetchDashboardData()} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Top Stats Row */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardWithChart
              title="Total Users"
              value={stats?.users.total || 0}
              change={`${stats?.users.manufacturers || 0} manufacturers`}
              changeType="neutral"
              sparkData={[3, 5, 4, 7, 6, 8, stats?.users.total || 10]}
              color="#0ea371"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <StatCardWithChart
              title="Total Batches"
              value={stats?.batches.total || 0}
              change={`${stats?.batches.active || 0} active`}
              changeType="positive"
              sparkData={trendData.batches}
              color="#3b82f6"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <StatCardWithChart
              title="Total Shipments"
              value={stats?.shipments.total || 0}
              change={`${stats?.shipments.inTransit || 0} in transit`}
              changeType="neutral"
              sparkData={trendData.shipments}
              color="#8b5cf6"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
            />
            <StatCardWithChart
              title="Fraud Alerts"
              value={stats?.fraudAlerts || 0}
              change={stats?.fraudAlerts ? "Needs attention" : "All clear"}
              changeType={stats?.fraudAlerts ? "negative" : "positive"}
              color="#ef4444"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            />
          </div>

          {/* Charts Row 1 - Activity Trend (Mantis Style) */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <ChartCard 
              title="Activity Trend" 
              subtitle="Batches & Shipments - Last 7 days" 
              className="lg:col-span-2"
              action={
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700">Month</button>
                  <button className="px-3 py-1 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100">Week</button>
                </div>
              }
            >
              <MultiLineChart
                series={[
                  { name: "Batches", data: trendData.batches, color: "#0ea371" },
                  { name: "Shipments", data: trendData.shipments, color: "#3b82f6" },
                ]}
                labels={trendData.labels}
                height={220}
              />
            </ChartCard>
            <ChartCard title="Delivery Performance" subtitle="Overall delivery rate">
              <div className="flex flex-col items-center justify-center py-4">
                <Gauge value={stats?.shipments.delivered || 0} max={stats?.shipments.total || 100} label="Delivery Rate" color="#0ea371" size={160} />
                <div className="mt-4 grid grid-cols-3 gap-4 w-full text-center">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{stats?.shipments.delivered || 0}</p>
                    <p className="text-xs text-slate-500">Delivered</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{stats?.shipments.inTransit || 0}</p>
                    <p className="text-xs text-slate-500">In Transit</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">{stats?.shipments.pending || 0}</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Charts Row 2 - Donut Charts */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <ChartCard title="User Distribution" subtitle="Platform users by role">
              <SimpleDonutChart data={userDistribution} size={130} showTotal />
            </ChartCard>
            <ChartCard title="Batch Status" subtitle="Current batch distribution">
              <SimpleDonutChart data={batchStatusData} size={130} showTotal />
            </ChartCard>
            <ChartCard title="Shipment Status" subtitle="Current shipment status">
              <SimpleDonutChart data={shipmentStatusData} size={130} showTotal />
            </ChartCard>
          </div>

          {/* Bottom Row - Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Batches */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Recent Batches</h2>
                <button onClick={() => router.push("/dashboard/batches")} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  View all →
                </button>
              </div>
              {recentBatches.length > 0 ? (
                <DataTable
                  columns={[
                    { key: "batchNumber", label: "Batch", render: (item) => <span className="font-semibold text-emerald-700">{item.batchNumber}</span> },
                    { key: "medicine", label: "Medicine", render: (item) => <span className="text-slate-700">{item.medicine?.name || "—"}</span> },
                    { key: "status", label: "Status", render: (item) => <StatusBadge status={item.status || "ACTIVE"} variant={item.status === "RECALLED" ? "danger" : item.status === "EXPIRED" ? "warning" : "success"} /> },
                  ]}
                  data={recentBatches}
                  onRowClick={(item) => router.push(`/dashboard/batches/${item.id}`)}
                />
              ) : (
                <div className="py-12 text-center text-sm text-slate-500">No batches yet</div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Recent Activity</h2>
                <button onClick={() => router.push("/dashboard/audit")} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  View all →
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                        <span className="text-xs font-semibold text-emerald-700">{(activity.userName || "S")[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{activity.action.replace(/_/g, " ")} {activity.entityType}</p>
                        <p className="text-xs text-slate-500 truncate">by {activity.userName || "System"}</p>
                      </div>
                      <span className="text-xs text-slate-400">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-sm text-slate-500">No recent activity</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Manage Users", desc: "View all users", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", href: "/dashboard/users", color: "emerald" },
                { label: "Monitor Batches", desc: "Track batches", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", href: "/dashboard/batches", color: "blue" },
                { label: "Fraud Alerts", desc: "View alerts", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", href: "/dashboard/fraud-alerts", color: "red" },
                { label: "Analytics", desc: "View insights", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", href: "/dashboard/analytics", color: "purple" },
                { label: "Reports", desc: "Generate reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", href: "/dashboard/reports", color: "amber" },
              ].map((action, i) => (
                <button key={i} onClick={() => router.push(action.href)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${action.color}-100`}>
                    <svg className={`h-5 w-5 text-${action.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

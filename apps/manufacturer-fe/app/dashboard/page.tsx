"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../components/sidebar";
import { 
  ChartCard, 
  SimpleBarChart, 
  SimpleDonutChart, 
  SimpleAreaChart, 
  MultiLineChart,
  StatCardWithChart,
  Gauge 
} from "../../components/charts";
import { DataTable, StatusBadge } from "../../components/data-table";
import { ActivityFeed } from "../../components/activity-feed";
import { QuickAction, ProgressCard, AlertCard } from "../../components/cards";
import { DashboardHeader } from "../../components/DashboardHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface DashboardData {
  summary: {
    totalBatches: number;
    totalUnits: number;
    totalScans: number;
    verifiedScans: number;
    counterfeitScans: number;
    verificationRate: string | number;
    totalShipments: number;
    deliveredShipments: number;
    pendingShipments: number;
  };
  batchStats: {
    totalBatches: number;
    validBatches: number;
    recalledBatches: number;
    expiredBatches: number;
    lifecycle: {
      inProduction: number;
      inTransit: number;
      atDistributor: number;
      atPharmacy: number;
      sold: number;
    };
  };
  productionTrend: Array<{ label: string; value: number; date: string }>;
  topProducts: Array<{
    name: string;
    units: number;
    batchCount: number;
    rank: number;
    growth: string;
  }>;
}

interface BatchItem {
  id: string;
  batchNumber: string;
  medicine?: { name: string; strength: string };
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  lifecycleStatus: string;
}

interface Activity {
  id: string;
  type: "batch" | "shipment" | "qr" | "alert" | "user";
  title: string;
  description: string;
  time: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentBatches, setRecentBatches] = useState<BatchItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [qrCount, setQrCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [shipmentData, setShipmentData] = useState({ delivered: 0, pending: 0, inTransit: 0 });
  const [weeklyTrend, setWeeklyTrend] = useState<{ batches: number[]; shipments: number[]; labels: string[] }>({
    batches: [], shipments: [], labels: []
  });

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const results = await Promise.allSettled([
        fetch(`${API_BASE}/api/analytics/dashboard?days=30`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/batch?limit=5`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/audit-trail?limit=5`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/qr-code?limit=1`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/shipment?limit=100`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/batch?limit=100`, { headers }).then(r => r.json()),
      ]);

      // Process analytics data
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setDashboardData(results[0].value.data);
      }

      // Process batches data for table
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        setRecentBatches(results[1].value.data || []);
      }

      // Process audit trail data
      if (results[2].status === 'fulfilled' && results[2].value.success && results[2].value.data) {
        const mappedActivities = results[2].value.data.map((audit: any) => ({
          id: audit.id,
          type: mapAuditToActivityType(audit.entityType, audit.action),
          title: `${audit.action.replace(/_/g, " ")} ${audit.entityType}`,
          description: `${audit.entityType} ${audit.entityId?.slice(0, 8) || ""}...`,
          time: formatTimeAgo(audit.createdAt),
        }));
        setActivities(mappedActivities);
      }

      // Process QR code data
      if (results[3].status === 'fulfilled' && results[3].value.success) {
        const qrData = results[3].value;
        setQrCount(qrData.stats?.totalQRCodes || qrData.pagination?.total || 0);
        setScanCount(qrData.stats?.totalScans || 0);
      }

      // Process shipment data for chart
      if (results[4].status === 'fulfilled' && results[4].value.success) {
        const shipments = results[4].value.data || [];
        setShipmentData({
          delivered: shipments.filter((s: any) => s.status === 'DELIVERED').length,
          pending: shipments.filter((s: any) => s.status === 'PENDING').length,
          inTransit: shipments.filter((s: any) => s.status === 'IN_TRANSIT').length,
        });
      }

      // Calculate weekly trends
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      const dayLabels = last7Days.map(d => new Date(d).toLocaleDateString('en', { weekday: 'short' }));

      let batchTrend = Array(7).fill(0);
      let shipmentTrend = Array(7).fill(0);

      if (results[5].status === 'fulfilled' && results[5].value.success) {
        (results[5].value.data || []).forEach((b: any) => {
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

      setWeeklyTrend({ batches: batchTrend, shipments: shipmentTrend, labels: dayLabels });

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
      setUser(JSON.parse(storedUser));
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

  // Extract data with fallbacks
  const summary = dashboardData?.summary;
  const batchStats = dashboardData?.batchStats;
  const lifecycle = batchStats?.lifecycle;
  const productionTrend = dashboardData?.productionTrend || [];
  const topProducts = dashboardData?.topProducts || [];

  // Build status distribution from real data
  const statusDistribution = lifecycle
    ? [
        { label: "In Production", value: lifecycle.inProduction, color: "#0ea371" },
        { label: "In Transit", value: lifecycle.inTransit, color: "#3b82f6" },
        { label: "At Distributor", value: lifecycle.atDistributor, color: "#8b5cf6" },
        { label: "At Pharmacy", value: lifecycle.atPharmacy, color: "#f59e0b" },
        { label: "Sold", value: lifecycle.sold, color: "#ef4444" },
      ]
    : [];

  // Build shipment status distribution
  const shipmentStatus = [
    { label: "Delivered", value: shipmentData.delivered, color: "#0ea371" },
    { label: "In Transit", value: shipmentData.inTransit, color: "#3b82f6" },
    { label: "Pending", value: shipmentData.pending, color: "#f59e0b" },
  ];

  // Build production chart data from trend
  const monthlyLabels = productionTrend.map((p) => p.label);
  const monthlyData = productionTrend.map((p) => p.value);

  // Build top products chart data
  const productChartData = topProducts.map((p, i) => ({
    label: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    value: p.units,
    color: ["#0ea371", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"][i % 5],
  }));

  // Calculate target progress
  const currentMonthUnits = monthlyData[monthlyData.length - 1] || 0;
  const targetUnits = Math.max(currentMonthUnits * 1.2, 10000);

  // Verification rate
  const verificationRate = summary?.verificationRate ? 
    (typeof summary.verificationRate === 'string' ? parseFloat(summary.verificationRate) : summary.verificationRate) : 0;
  const totalScans = summary?.totalScans || 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} onLogout={handleLogout} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="min-h-screen transition-all duration-200" style={{ marginLeft: isCollapsed ? 72 : 260 }}>
        <DashboardHeader
          title="Dashboard"
          subtitle={`Welcome back, ${user?.name || "Manufacturer"}`}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => fetchDashboardData()} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button onClick={() => router.push("/dashboard/batches/new")} className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Batch
              </button>
            </div>
          }
        />

        <div className="p-5">
          {/* Stats Row with Sparklines */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardWithChart
              title="Total Batches"
              value={summary?.totalBatches?.toLocaleString() || "0"}
              change={batchStats?.validBatches ? `${batchStats.validBatches} active` : "0 active"}
              changeType="positive"
              sparkData={weeklyTrend.batches}
              color="#0ea371"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <StatCardWithChart
              title="Total Units"
              value={summary?.totalUnits?.toLocaleString() || "0"}
              change={`${summary?.verifiedScans || 0} verified`}
              changeType="positive"
              color="#3b82f6"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            />
            <StatCardWithChart
              title="QR Generated"
              value={qrCount.toLocaleString()}
              change={`${scanCount.toLocaleString()} scans`}
              changeType="positive"
              color="#8b5cf6"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
            />
            <StatCardWithChart
              title="Shipments"
              value={summary?.totalShipments?.toString() || "0"}
              change={`${shipmentData.delivered} delivered`}
              changeType={summary?.pendingShipments && summary.pendingShipments > 5 ? "negative" : "positive"}
              sparkData={weeklyTrend.shipments}
              color="#f59e0b"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
            />
          </div>

          {/* Alert + Quick Actions */}
          <div className="mb-5 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              {batchStats?.expiredBatches && batchStats.expiredBatches > 0 ? (
                <AlertCard type="warning" title="Expired Batches Alert" message={`${batchStats.expiredBatches} batch(es) have expired.`} action={{ label: "View", onClick: () => router.push("/dashboard/batches") }} />
              ) : batchStats?.recalledBatches && batchStats.recalledBatches > 0 ? (
                <AlertCard type="error" title="Recalled Batches" message={`${batchStats.recalledBatches} batch(es) recalled.`} action={{ label: "View", onClick: () => router.push("/dashboard/batches") }} />
              ) : (
                <AlertCard type="success" title="All Systems Normal" message="No alerts. All batches operational." action={{ label: "Analytics", onClick: () => router.push("/dashboard/analytics") }} />
              )}
            </div>
            <div className="lg:col-span-2">
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <QuickAction variant="primary" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} label="New Batch" description="Create" onClick={() => router.push("/dashboard/batches/new")} />
                <QuickAction icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>} label="QR Codes" description="Generate" onClick={() => router.push("/dashboard/qr-codes")} />
                <QuickAction icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>} label="Shipments" description="Track" onClick={() => router.push("/dashboard/shipments")} />
                <QuickAction icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Reports" description="View" onClick={() => router.push("/dashboard/reports")} />
              </div>
            </div>
          </div>

          {/* Charts Row 1 - Main Trend Chart */}
          <div className="mb-5 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard title="Weekly Activity" subtitle="Batches & Shipments - Last 7 days">
                <MultiLineChart
                  series={[
                    { name: "Batches", data: weeklyTrend.batches, color: "#0ea371" },
                    { name: "Shipments", data: weeklyTrend.shipments, color: "#3b82f6" },
                  ]}
                  labels={weeklyTrend.labels}
                  height={200}
                />
              </ChartCard>
            </div>
            <ChartCard title="Verification Rate" subtitle="QR scan success rate">
              <div className="flex flex-col items-center justify-center py-2">
                <Gauge value={verificationRate} max={100} label="Verified Scans" color="#0ea371" size={140} />
                <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{summary?.verifiedScans || 0}</p>
                    <p className="text-xs text-slate-500">Verified</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-600">{summary?.counterfeitScans || 0}</p>
                    <p className="text-xs text-slate-500">Failed</p>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Charts Row 2 - Donut Charts */}
          <div className="mb-5 grid gap-4 lg:grid-cols-3">
            <ChartCard title="Batch Lifecycle" subtitle="Distribution by status">
              {statusDistribution.some((s) => s.value > 0) ? (
                <SimpleDonutChart data={statusDistribution} size={110} showTotal />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-slate-400">No batch data yet</div>
              )}
            </ChartCard>
            <ChartCard title="Shipment Status" subtitle="Current distribution">
              <SimpleDonutChart data={shipmentStatus} size={110} showTotal />
            </ChartCard>
            <ChartCard title="Top Products" subtitle="By production volume">
              {productChartData.length > 0 ? (
                <SimpleBarChart data={productChartData.slice(0, 4)} />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-slate-400">Add products to see data</div>
              )}
            </ChartCard>
          </div>

          {/* Bottom Row - Table and Activity */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Recent Batches Table */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Recent Batches</h3>
                    <p className="text-xs text-slate-500">Latest production batches</p>
                  </div>
                  <button onClick={() => router.push("/dashboard/batches")} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View all →</button>
                </div>
                {recentBatches.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: "batchNumber", label: "Batch ID", render: (item) => <span className="font-semibold text-emerald-700">{item.batchNumber || item.id.slice(0, 12)}</span> },
                      { key: "product", label: "Product", render: (item) => <span className="text-slate-800">{item.medicine?.name || "Unknown"} {item.medicine?.strength || ""}</span> },
                      { key: "quantity", label: "Qty", render: (item) => <span className="text-slate-500">{(item.quantity || 0).toLocaleString()}</span> },
                      { key: "status", label: "Status", render: (item) => <StatusBadge status={mapLifecycleToStatus(item.lifecycleStatus || item.status)} /> },
                    ]}
                    data={recentBatches}
                    onRowClick={(item) => router.push(`/dashboard/batches/${item.id}`)}
                  />
                ) : (
                  <div className="py-12 text-center">
                    <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    <p className="mt-2 text-sm text-slate-500">No batches yet</p>
                    <button onClick={() => router.push("/dashboard/batches/new")} className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700">Create your first batch →</button>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Feed + Progress */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Recent Activity</h3>
                {activities.length > 0 ? (
                  <ActivityFeed activities={activities} />
                ) : (
                  <div className="py-6 text-center text-sm text-slate-400">No recent activity</div>
                )}
              </div>

              <ProgressCard title="Monthly Production" current={currentMonthUnits} target={targetUnits} unit=" units" />
              
              <ChartCard title="Production Trend" subtitle="Last 7 periods">
                {monthlyData.length > 0 ? (
                  <SimpleAreaChart data={monthlyData} labels={monthlyLabels} height={120} color="emerald" />
                ) : (
                  <div className="flex h-24 items-center justify-center text-sm text-slate-400">No data yet</div>
                )}
              </ChartCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper functions
function mapAuditToActivityType(entityType: string, action: string): "batch" | "shipment" | "qr" | "alert" | "user" {
  if (entityType === "BATCH") return "batch";
  if (entityType === "SHIPMENT") return "shipment";
  if (entityType === "QR_CODE" || entityType === "QRCODE") return "qr";
  if (entityType === "FRAUD_ALERT" || action.includes("ALERT")) return "alert";
  if (entityType === "USER") return "user";
  return "batch";
}

function mapLifecycleToStatus(status: string): "active" | "shipped" | "delivered" | "pending" | "recalled" {
  switch (status?.toUpperCase()) {
    case "IN_PRODUCTION":
      return "active";
    case "IN_TRANSIT":
      return "shipped";
    case "AT_DISTRIBUTOR":
    case "AT_PHARMACY":
      return "delivered";
    case "SOLD":
      return "delivered";
    case "RECALLED":
      return "recalled";
    case "VALID":
      return "active";
    default:
      return "pending";
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

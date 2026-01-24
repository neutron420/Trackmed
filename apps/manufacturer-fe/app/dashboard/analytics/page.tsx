"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { StatCard } from "../../../components/stat-card";
import { 
  ChartCard, 
  SimpleAreaChart, 
  SimpleBarChart, 
  SimpleDonutChart, 
  MultiLineChart,
  Gauge 
} from "../../../components/charts";
import dynamic from "next/dynamic";

// Mapbox component is client-only
const HeatMap = dynamic(() => import("../../../components/map/heat-map").then(m => m.HeatMap), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface GeoLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  orders: number;
  size: number;
}

interface AnalyticsData {
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
  salesTrend: Array<{ label: string; value: number; date: string }>;
  topProducts: Array<{
    name: string;
    units: number;
    batchCount: number;
    rank: number;
    growth: string;
  }>;
  regionalData: Array<{
    region: string;
    orders: number;
    batches: number;
    revenue: string;
  }>;
  categoryDistribution: Array<{ label: string; value: number }>;
  geographicData: GeoLocation[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    try {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
      const res = await fetch(`${API_BASE}/api/analytics/dashboard?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      fetchAnalytics();
    } catch {
      router.push("/login");
    }
  }, [router, fetchAnalytics]);

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
          <p className="mt-4 text-sm text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary;
  const productionTrend = analytics?.productionTrend || [];
  const salesTrend = analytics?.salesTrend || [];
  const topProducts = analytics?.topProducts || [];
  const regionalData = analytics?.regionalData || [];
  const lifecycle = analytics?.batchStats?.lifecycle;
  const geoData = analytics?.geographicData || [];

  // Prepare chart data
  const lifecycleChartData = lifecycle ? [
    { label: "In Production", value: lifecycle.inProduction, color: "#f59e0b" },
    { label: "In Transit", value: lifecycle.inTransit, color: "#3b82f6" },
    { label: "At Distributor", value: lifecycle.atDistributor, color: "#8b5cf6" },
    { label: "At Pharmacy", value: lifecycle.atPharmacy, color: "#f97316" },
    { label: "Sold", value: lifecycle.sold, color: "#0ea371" },
  ] : [];

  const shipmentStatusData = [
    { label: "Delivered", value: summary?.deliveredShipments || 0, color: "#0ea371" },
    { label: "Pending", value: summary?.pendingShipments || 0, color: "#f59e0b" },
    { label: "In Transit", value: (summary?.totalShipments || 0) - (summary?.deliveredShipments || 0) - (summary?.pendingShipments || 0), color: "#3b82f6" },
  ];

  const topProductsChartData = topProducts.slice(0, 5).map((p, i) => ({
    label: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
    value: p.units,
    color: ["#0ea371", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"][i],
  }));

  // Trend data for multi-line chart
  const prodLabels = productionTrend.map(p => p.label);
  const prodValues = productionTrend.map(p => p.value);
  const shipValues = salesTrend.map(s => s.value);

  // Verification rate
  const verificationRate = summary?.verificationRate ? 
    (typeof summary.verificationRate === 'string' ? parseFloat(summary.verificationRate) : summary.verificationRate) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} onLogout={handleLogout} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="min-h-screen transition-all duration-200" style={{ marginLeft: isCollapsed ? 72 : 260 }}>
        {/* Header - Mantis style */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-slate-900">Analytics</span>
              </nav>
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button onClick={fetchAnalytics}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Row 1: Key Metrics - Mantis style */}
          <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Batches" 
              value={summary?.totalBatches?.toLocaleString() || "0"} 
              change={`${analytics?.batchStats?.validBatches || 0} active`} 
              changeType="positive"
              color="emerald"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} 
            />
            <StatCard 
              title="Units Produced" 
              value={summary?.totalUnits?.toLocaleString() || "0"} 
              change="Total units" 
              changeType="neutral"
              color="blue"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} 
            />
            <StatCard 
              title="Verified Scans" 
              value={summary?.verifiedScans?.toLocaleString() || "0"} 
              change={`${verificationRate.toFixed(1)}% rate`} 
              changeType="positive"
              color="purple"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            />
            <StatCard 
              title="Total Shipments" 
              value={summary?.totalShipments?.toLocaleString() || "0"} 
              change={`${summary?.deliveredShipments || 0} delivered`} 
              changeType="positive"
              color="amber"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>} 
            />
          </div>

          {/* Row 2: Main Charts - Mantis layout (2/3 + 1/3) */}
          <div className="mb-6 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard title="Activity Trends" subtitle="Production & Shipments over time">
                {prodLabels.length > 1 ? (
                  <MultiLineChart
                    series={[
                      { name: "Production", data: prodValues, color: "#0ea371" },
                      { name: "Shipments", data: shipValues, color: "#3b82f6" },
                    ]}
                    labels={prodLabels}
                    height={240}
                  />
                ) : (
                  <div className="flex h-[240px] flex-col items-center justify-center text-slate-400">
                    <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm font-medium">Create batches and shipments to see trends</p>
                  </div>
                )}
              </ChartCard>
            </div>
            <ChartCard title="Verification Rate" subtitle="QR scan success rate">
              <div className="flex flex-col items-center justify-center py-6">
                <Gauge value={verificationRate} max={100} label="Verified Scans" color="#0ea371" size={140} />
                <div className="mt-6 grid grid-cols-2 gap-6 w-full text-center">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xl font-bold text-emerald-600">{summary?.verifiedScans || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Verified</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-xl font-bold text-red-600">{summary?.counterfeitScans || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Failed</p>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Row 3: Donut Charts */}
          <div className="mb-6 grid gap-5 lg:grid-cols-3">
            <ChartCard title="Batch Lifecycle" subtitle="Current status distribution">
              {lifecycleChartData.some(d => d.value > 0) ? (
                <SimpleDonutChart data={lifecycleChartData} size={120} showTotal />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-slate-400">No batch data yet</div>
              )}
            </ChartCard>
            <ChartCard title="Shipment Status" subtitle="Current distribution">
              <SimpleDonutChart data={shipmentStatusData} size={120} showTotal />
            </ChartCard>
            <ChartCard title="Top Products" subtitle="By production volume">
              {topProductsChartData.length > 0 ? (
                <SimpleBarChart data={topProductsChartData} />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-slate-400">Add products to see data</div>
              )}
            </ChartCard>
          </div>

          {/* Row 4: Geographic Map */}
          <div className="mb-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Distribution Network</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Geographic distribution of your supply chain</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {geoData.length} locations
                </span>
              </div>
              <div className="p-4">
                {geoData.length > 0 ? (
                  <>
                    <HeatMap points={geoData} height={380} />
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {geoData.slice(0, 8).map((loc) => (
                        <div key={loc.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-medium text-slate-700">{loc.state}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600">{loc.orders}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
                    <div className="rounded-full bg-white p-4 shadow-sm mb-4">
                      <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">No distribution data yet</p>
                    <p className="text-xs text-slate-400 mt-1">Add distributors and create shipments to see locations</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 5: Regional Performance */}
          <div className="mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Regional Performance</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(regionalData.length > 0 ? regionalData : [
                  { region: "North", orders: 0, batches: 0, revenue: "₹0" },
                  { region: "South", orders: 0, batches: 0, revenue: "₹0" },
                  { region: "East", orders: 0, batches: 0, revenue: "₹0" },
                  { region: "West", orders: 0, batches: 0, revenue: "₹0" },
                ]).map((r) => (
                  <div key={r.region} className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 hover:shadow-sm transition-shadow">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{r.region} Region</h3>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{r.orders}</p>
                        <p className="text-xs text-slate-500">Orders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">{r.revenue}</p>
                        <p className="text-xs text-slate-500">{r.batches} batches</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 6: Product Leaderboard */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Product Leaderboard</h2>
            <div className="space-y-2">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
                        {product.rank}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">{product.units.toLocaleString()} units</span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {product.growth}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-400 py-8">No product data available</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

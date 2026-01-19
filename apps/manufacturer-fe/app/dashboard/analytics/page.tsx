"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { StatCard } from "../../../components/stat-card";
import { AreaChart, BarChart } from "../../../components/charts";
import {
  FiTrendingUp,
  FiTruck,
  FiGrid,
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
  FiPackage,
} from "react-icons/fi";
import dynamic from "next/dynamic";

// Mapbox component is client-only; load dynamically to avoid SSR issues.
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const summary = analytics?.summary;
  const productionTrend = analytics?.productionTrend || [];
  const salesTrend = analytics?.salesTrend || [];
  const categoryData = analytics?.categoryDistribution || [];
  const topProducts = analytics?.topProducts || [];
  const regionalData = analytics?.regionalData || [];
  const lifecycle = analytics?.batchStats?.lifecycle;

  // Use real geographic data from backend (no more hardcoded sample data)
  const geoData = analytics?.geographicData || [];

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
        style={{ marginLeft: isCollapsed ? 72 : 260 }}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
              <p className="text-xs text-slate-500">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                <FiRefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </header>

        <div className="p-5">
          {/* Key Metrics */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Batches"
              value={summary?.totalBatches?.toLocaleString() || "0"}
              change="+12.5%"
              changeType="positive"
              icon={<FiTrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Units Produced"
              value={summary?.totalUnits?.toLocaleString() || "0"}
              change="+8.2%"
              changeType="positive"
              icon={<FiPackage className="h-5 w-5" />}
            />
            <StatCard
              title="Verified Scans"
              value={summary?.verifiedScans?.toLocaleString() || "0"}
              change={`${summary?.verificationRate || 0}%`}
              changeType="positive"
              icon={<FiGrid className="h-5 w-5" />}
            />
            <StatCard
              title="Counterfeits"
              value={summary?.counterfeitScans?.toLocaleString() || "0"}
              change="-5.1%"
              changeType="positive"
              icon={<FiAlertTriangle className="h-5 w-5" />}
            />
          </div>

          {/* Geographic Map - Mapbox Heatmap */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-slate-900">Distribution Network Map</h2>
              </div>
              <span className="text-xs text-slate-500">{geoData.length} locations</span>
            </div>
            {geoData.length > 0 ? (
              <HeatMap points={geoData} height={420} />
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center rounded-lg bg-slate-50">
                <FiMapPin className="mb-3 h-12 w-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No distribution data yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Add distributors and create shipments to see locations on the map
                </p>
              </div>
            )}
          </div>

          {/* Charts Grid */}
          <div className="mb-5 grid gap-5 lg:grid-cols-2">
            {/* Production Trend */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Production Trend</h2>
                <span className="text-xs text-slate-500">Units/Day</span>
              </div>
              {productionTrend.length > 0 ? (
                <AreaChart data={productionTrend} color="emerald" height={140} />
              ) : (
                <div className="flex h-[140px] items-center justify-center text-sm text-slate-400">
                  Create batches to see production trend
                </div>
              )}
            </div>

            {/* Shipment Trend */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Shipment Trend</h2>
                <span className="text-xs text-slate-500">Shipments/Day</span>
              </div>
              {salesTrend.length > 0 ? (
                <AreaChart data={salesTrend} color="blue" height={140} />
              ) : (
                <div className="flex h-[140px] items-center justify-center text-sm text-slate-400">
                  Create shipments to see trend
                </div>
              )}
            </div>
          </div>

          {/* Batch Lifecycle Status */}
          {lifecycle && (
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Batch Lifecycle Status</h2>
              <div className="grid gap-3 sm:grid-cols-5">
                {[
                  { label: "In Production", value: lifecycle.inProduction, color: "bg-yellow-500" },
                  { label: "In Transit", value: lifecycle.inTransit, color: "bg-blue-500" },
                  { label: "At Distributor", value: lifecycle.atDistributor, color: "bg-purple-500" },
                  { label: "At Pharmacy", value: lifecycle.atPharmacy, color: "bg-orange-500" },
                  { label: "Sold", value: lifecycle.sold, color: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className={`mx-auto mb-2 h-2 w-12 rounded-full ${item.color}`} />
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {/* Category Distribution */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Product Categories</h2>
              {categoryData.length > 0 ? (
                <BarChart data={categoryData} color="emerald" height={140} />
              ) : (
                <div className="flex h-[140px] items-center justify-center text-sm text-slate-400">
                  Add products to see categories
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Top Products</h2>
              <div className="space-y-2">
                {topProducts.length > 0 ? (
                  topProducts.map((product) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                          {product.rank}
                        </span>
                        <span className="text-xs font-medium text-slate-800">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600">{product.units.toLocaleString()} units</span>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                          {product.growth}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-500 py-4">No product data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Regional Performance */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Regional Performance</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {regionalData.length > 0 ? (
                regionalData.map((r) => (
                  <div key={r.region} className="rounded-lg bg-slate-50 p-3">
                    <h3 className="text-xs font-semibold text-slate-700">{r.region} Region</h3>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{r.orders}</p>
                        <p className="text-xs text-slate-500">Orders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">{r.revenue}</p>
                        <p className="text-xs text-slate-500">{r.batches} batches</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                ["North", "South", "East", "West"].map((region) => (
                  <div key={region} className="rounded-lg bg-slate-50 p-3">
                    <h3 className="text-xs font-semibold text-slate-700">{region} Region</h3>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">0</p>
                        <p className="text-xs text-slate-500">Orders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">₹0</p>
                        <p className="text-xs text-slate-500">0 batches</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shipment Summary */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <FiTruck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Shipments</p>
                  <p className="text-lg font-bold text-slate-900">{summary?.totalShipments || 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <FiPackage className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Delivered</p>
                  <p className="text-lg font-bold text-slate-900">{summary?.deliveredShipments || 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <FiTruck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="text-lg font-bold text-slate-900">{summary?.pendingShipments || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

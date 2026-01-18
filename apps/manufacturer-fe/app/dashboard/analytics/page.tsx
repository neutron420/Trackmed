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
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);

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

  // Map India bounds and conversion helpers - adjusted for SVG viewBox 400x450
  const mapBounds = {
    minLat: 6.5,   // Southern tip (Kanyakumari ~8°)
    maxLat: 37.5,  // Northern border (Kashmir ~37°)
    minLng: 67.0,  // Western border (Gujarat ~68°)
    maxLng: 98.0,  // Eastern border (Arunachal ~97°)
  };

  const latLngToXY = (lat: number, lng: number) => {
    // Map to SVG viewBox: 400 width, 450 height with padding
    const padding = 50;
    const svgWidth = 400 - padding * 2;
    const svgHeight = 450 - padding * 2;
    
    const x = padding + ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * svgWidth;
    const y = padding + (1 - (lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * svgHeight;
    return { x, y };
  };

  // Get heatmap color based on intensity
  const getHeatColor = (orders: number, maxOrders: number) => {
    const intensity = orders / maxOrders;
    if (intensity > 0.7) return { fill: '#ef4444', opacity: 0.8 }; // Red - hot
    if (intensity > 0.5) return { fill: '#f97316', opacity: 0.7 }; // Orange
    if (intensity > 0.3) return { fill: '#eab308', opacity: 0.6 }; // Yellow
    return { fill: '#22c55e', opacity: 0.5 }; // Green - cool
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

  // Sample geographic data for India map (fallback if no real data)
  const sampleGeoData: GeoLocation[] = [
    { id: '1', name: 'MedPlus Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, orders: 156, size: 35 },
    { id: '2', name: 'Apollo Delhi', city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209, orders: 142, size: 32 },
    { id: '3', name: 'Fortis Bangalore', city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, orders: 128, size: 30 },
    { id: '4', name: 'Max Healthcare Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867, orders: 98, size: 26 },
    { id: '5', name: 'Manipal Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, orders: 112, size: 28 },
    { id: '6', name: 'Columbia Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, orders: 87, size: 24 },
    { id: '7', name: 'Sahyadri Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, orders: 76, size: 22 },
    { id: '8', name: 'Sterling Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, orders: 68, size: 20 },
    { id: '9', name: 'Narayana Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, orders: 54, size: 18 },
    { id: '10', name: 'KGMU Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, orders: 62, size: 19 },
    { id: '11', name: 'Civil Surat', city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, orders: 45, size: 16 },
    { id: '12', name: 'Wockhardt Nagpur', city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, orders: 38, size: 15 },
    { id: '13', name: 'Medanta Indore', city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, orders: 42, size: 15 },
    { id: '14', name: 'AIIMS Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, orders: 35, size: 14 },
    { id: '15', name: 'Care Vizag', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, orders: 48, size: 17 },
    { id: '16', name: 'IGIMS Patna', city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, orders: 32, size: 13 },
    { id: '17', name: 'PSG Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, orders: 58, size: 18 },
    { id: '18', name: 'Aster Kochi', city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, orders: 72, size: 21 },
  ];

  const geoData = (analytics?.geographicData && analytics.geographicData.length > 0) 
    ? analytics.geographicData 
    : sampleGeoData;

  // Calculate max orders for heatmap scaling
  const maxOrders = Math.max(...geoData.map(d => d.orders), 1);

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

          {/* Geographic Map - India Heatmap */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-slate-900">India Order Distribution Heatmap</h2>
              </div>
              <span className="text-xs text-slate-500">{geoData.length} distributor locations</span>
            </div>
            
            <div className="flex gap-4">
              {/* Map Container */}
              <div className="relative flex-1 overflow-hidden rounded-lg bg-gradient-to-b from-sky-50 via-blue-50 to-emerald-50" style={{ height: 400 }}>
                {/* India map with proper outline */}
                <svg viewBox="0 0 400 450" className="absolute inset-0 h-full w-full">
                  <defs>
                    <linearGradient id="indiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#d1fae5" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.7" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8"/>
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2"/>
                    </radialGradient>
                  </defs>
                  
                  {/* More accurate India outline */}
                  <path
                    d="M180,25 L195,20 L220,25 L245,35 L270,30 L295,40 L310,55 L325,45 L340,60 
                       L345,80 L355,95 L350,115 L360,135 L355,160 L365,180 L360,200 L370,225 
                       L365,250 L355,275 L340,300 L320,325 L295,345 L270,365 L245,385 L220,400 
                       L200,415 L180,420 L160,410 L140,395 L120,375 L100,350 L85,320 L75,290 
                       L70,260 L65,230 L70,200 L80,170 L90,140 L105,115 L120,90 L140,65 L160,45 Z"
                    fill="url(#indiaGrad)"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="drop-shadow-md"
                  />
                  
                  {/* Kashmir region */}
                  <path
                    d="M180,25 L195,20 L220,25 L245,35 L230,55 L210,50 L190,45 Z"
                    fill="#d1fae5"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  
                  {/* Grid overlay */}
                  {[100, 175, 250, 325, 400].map((y) => (
                    <line key={`h${y}`} x1="50" y1={y} x2="380" y2={y} stroke="#94a3b8" strokeWidth="0.3" strokeDasharray="5,5" opacity="0.5" />
                  ))}
                  {[100, 175, 250, 325].map((x) => (
                    <line key={`v${x}`} x1={x} y1="20" x2={x} y2="420" stroke="#94a3b8" strokeWidth="0.3" strokeDasharray="5,5" opacity="0.5" />
                  ))}
                  
                  {/* Heatmap circles (SVG) */}
                  {geoData.map((loc) => {
                    const { x, y } = latLngToXY(loc.lat, loc.lng);
                    const heat = getHeatColor(loc.orders, maxOrders);
                    const radius = Math.max(15, Math.min(45, (loc.orders / maxOrders) * 50));
                    return (
                      <g key={`heat-${loc.id}`}>
                        {/* Heatmap glow */}
                        <circle
                          cx={x}
                          cy={y}
                          r={radius + 10}
                          fill={heat.fill}
                          opacity={heat.opacity * 0.3}
                          filter="url(#glow)"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={radius}
                          fill={heat.fill}
                          opacity={heat.opacity * 0.6}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Location markers (interactive) */}
                {geoData.map((loc) => {
                  const { x, y } = latLngToXY(loc.lat, loc.lng);
                  const isSelected = selectedLocation?.id === loc.id;
                  const heat = getHeatColor(loc.orders, maxOrders);
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(isSelected ? null : loc)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                        isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"
                      }`}
                      style={{ left: `${(x / 400) * 100}%`, top: `${(y / 450) * 100}%` }}
                      title={`${loc.city}: ${loc.orders} orders`}
                    >
                      <div
                        className={`flex items-center justify-center rounded-full text-[9px] font-bold text-white shadow-lg border-2 border-white/50 ${
                          isSelected ? "ring-2 ring-white ring-offset-1" : ""
                        }`}
                        style={{
                          width: Math.max(22, Math.min(38, 20 + (loc.orders / maxOrders) * 20)),
                          height: Math.max(22, Math.min(38, 20 + (loc.orders / maxOrders) * 20)),
                          backgroundColor: heat.fill,
                        }}
                      >
                        {loc.orders}
                      </div>
                      {isSelected && (
                        <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white shadow-lg">
                          {loc.city}, {loc.state}
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Heatmap Legend */}
                <div className="absolute bottom-2 left-2 rounded-lg bg-white/95 px-3 py-2 shadow-lg border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-700 mb-1.5">Order Heatmap - India</p>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-[8px] text-slate-500">Low</span>
                    </div>
                    <div className="h-2 w-12 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500" />
                    <div className="flex items-center gap-0.5">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-[8px] text-slate-500">High</span>
                    </div>
                  </div>
                </div>

                {/* Map Title */}
                <div className="absolute top-2 right-2 rounded-lg bg-emerald-600 px-2 py-1 shadow">
                  <p className="text-[10px] font-medium text-white">🇮🇳 India</p>
                </div>
              </div>

              {/* Location Details Panel */}
              <div className="w-64 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <h3 className="mb-2 text-xs font-semibold text-slate-700">
                  {selectedLocation ? "Location Details" : "Top Locations"}
                </h3>
                {selectedLocation ? (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-white p-3">
                      <p className="font-medium text-slate-800">{selectedLocation.name}</p>
                      <p className="text-xs text-slate-500">{selectedLocation.city}, {selectedLocation.state}</p>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-xs text-slate-600">Orders</span>
                        <span className="font-semibold text-emerald-600">{selectedLocation.orders}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="w-full rounded bg-slate-200 py-1.5 text-xs text-slate-600 hover:bg-slate-300"
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {geoData
                      .sort((a, b) => b.orders - a.orders)
                      .slice(0, 8)
                      .map((loc, idx) => (
                        <button
                          key={loc.id}
                          onClick={() => setSelectedLocation(loc)}
                          className="flex w-full items-center justify-between rounded bg-white px-2 py-1.5 text-left hover:bg-emerald-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-700">{loc.city}</span>
                          </div>
                          <span className="text-xs font-medium text-emerald-600">{loc.orders}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="mb-5 grid gap-5 lg:grid-cols-2">
            {/* Production Trend */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Production Trend</h2>
                <span className="text-xs text-slate-500">Units/Day</span>
              </div>
              <AreaChart data={productionTrend} color="emerald" height={140} />
            </div>

            {/* Shipment Trend */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Shipment Trend</h2>
                <span className="text-xs text-slate-500">Shipments/Day</span>
              </div>
              <AreaChart data={salesTrend} color="blue" height={140} />
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
              <BarChart data={categoryData} color="emerald" height={140} />
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

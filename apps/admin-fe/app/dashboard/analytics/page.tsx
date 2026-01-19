"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { StatCard } from "../../../components/stat-card";
import { ChartCard, SimpleBarChart, SimpleDonutChart, AreaChart } from "../../../components/charts";
import dynamic from "next/dynamic";

// Mapbox component - client-only
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
  size?: number;
}

interface Analytics {
  totalBatches: number;
  activeBatches: number;
  recalledBatches: number;
  expiredBatches: number;
  totalShipments: number;
  deliveredShipments: number;
  inTransitShipments: number;
  pendingShipments: number;
  totalScans: number;
  verifiedScans: number;
  totalUnits: number;
  totalManufacturers: number;
  totalDistributors: number;
  totalPharmacies: number;
  topProducts: { name: string; quantity: number }[];
  monthlyTrends: { month: string; batches: number; shipments: number; scans: number }[];
  lifecycleDistribution: { status: string; count: number }[];
  geographicData: GeoLocation[];
  usersByRole: { role: string; count: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  // State coordinates for India (capital/major city of each state)
  const stateCoordinates: Record<string, { lat: number; lng: number; capital: string }> = {
    'Andhra Pradesh': { lat: 15.9129, lng: 79.7400, capital: 'Amaravati' },
    'Arunachal Pradesh': { lat: 27.0844, lng: 93.6053, capital: 'Itanagar' },
    'Assam': { lat: 26.1445, lng: 91.7362, capital: 'Dispur' },
    'Bihar': { lat: 25.6093, lng: 85.1376, capital: 'Patna' },
    'Chhattisgarh': { lat: 21.2514, lng: 81.6296, capital: 'Raipur' },
    'Goa': { lat: 15.4909, lng: 73.8278, capital: 'Panaji' },
    'Gujarat': { lat: 23.2156, lng: 72.6369, capital: 'Gandhinagar' },
    'Haryana': { lat: 29.0588, lng: 76.0856, capital: 'Chandigarh' },
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734, capital: 'Shimla' },
    'Jharkhand': { lat: 23.3441, lng: 85.3096, capital: 'Ranchi' },
    'Karnataka': { lat: 12.9716, lng: 77.5946, capital: 'Bengaluru' },
    'Kerala': { lat: 8.5241, lng: 76.9366, capital: 'Thiruvananthapuram' },
    'Madhya Pradesh': { lat: 23.2599, lng: 77.4126, capital: 'Bhopal' },
    'Maharashtra': { lat: 19.0760, lng: 72.8777, capital: 'Mumbai' },
    'Manipur': { lat: 24.8170, lng: 93.9368, capital: 'Imphal' },
    'Meghalaya': { lat: 25.5788, lng: 91.8933, capital: 'Shillong' },
    'Mizoram': { lat: 23.7271, lng: 92.7176, capital: 'Aizawl' },
    'Nagaland': { lat: 25.6751, lng: 94.1086, capital: 'Kohima' },
    'Odisha': { lat: 20.2961, lng: 85.8245, capital: 'Bhubaneswar' },
    'Punjab': { lat: 30.7333, lng: 76.7794, capital: 'Chandigarh' },
    'Rajasthan': { lat: 26.9124, lng: 75.7873, capital: 'Jaipur' },
    'Sikkim': { lat: 27.3389, lng: 88.6065, capital: 'Gangtok' },
    'Tamil Nadu': { lat: 13.0827, lng: 80.2707, capital: 'Chennai' },
    'Telangana': { lat: 17.3850, lng: 78.4867, capital: 'Hyderabad' },
    'Tripura': { lat: 23.8315, lng: 91.2868, capital: 'Agartala' },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, capital: 'Lucknow' },
    'Uttarakhand': { lat: 30.3165, lng: 78.0322, capital: 'Dehradun' },
    'West Bengal': { lat: 22.5726, lng: 88.3639, capital: 'Kolkata' },
    'Delhi': { lat: 28.6139, lng: 77.2090, capital: 'New Delhi' },
    'Chandigarh': { lat: 30.7333, lng: 76.7794, capital: 'Chandigarh' },
    'Puducherry': { lat: 11.9416, lng: 79.8083, capital: 'Puducherry' },
    'Ladakh': { lat: 34.1526, lng: 77.5771, capital: 'Leh' },
    'Jammu and Kashmir': { lat: 34.0837, lng: 74.7973, capital: 'Srinagar' },
  };

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Fetch multiple endpoints in parallel
      const [batchRes, shipmentRes, manufacturerRes, distributorRes, scanRes, pharmacyRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/batch?limit=500`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/shipment?limit=500`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/manufacturer?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/distributor?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/scan-log?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/pharmacy?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      let analyticsData: Partial<Analytics> = {
        geographicData: [],
        topProducts: [],
        monthlyTrends: [],
        lifecycleDistribution: [],
        usersByRole: [],
        totalPharmacies: 0,
      };

      // State-wise aggregation for map
      const stateAggregation: Record<string, { count: number; batches: number; shipments: number }> = {};

      // Process batch data
      if (batchRes.status === 'fulfilled') {
        const data = await batchRes.value.json();
        if (data.success) {
          const batches = data.data || [];
          analyticsData.totalBatches = data.pagination?.total || batches.length;
          analyticsData.activeBatches = batches.filter((b: any) => b.status === 'ACTIVE' || b.status === 'VALID').length;
          analyticsData.recalledBatches = batches.filter((b: any) => b.status === 'RECALLED').length;
          analyticsData.expiredBatches = batches.filter((b: any) => b.status === 'EXPIRED').length;
          analyticsData.totalUnits = batches.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0);

          // Lifecycle distribution
          const lifecycleCounts: Record<string, number> = {};
          batches.forEach((b: any) => {
            const status = b.lifecycleStatus || 'IN_PRODUCTION';
            lifecycleCounts[status] = (lifecycleCounts[status] || 0) + 1;
          });
          analyticsData.lifecycleDistribution = Object.entries(lifecycleCounts).map(([status, count]) => ({ status, count }));

          // Top products from batches
          const productMap: Record<string, number> = {};
          batches.forEach((b: any) => {
            const name = b.medicine?.name || 'Unknown';
            productMap[name] = (productMap[name] || 0) + (b.quantity || 0);
          });
          analyticsData.topProducts = Object.entries(productMap)
            .filter(([name]) => name !== 'Unknown')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

          // Monthly trends from batches
          const monthlyBatches: Record<string, number> = {};
          batches.forEach((b: any) => {
            const date = new Date(b.createdAt);
            const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyBatches[month] = (monthlyBatches[month] || 0) + 1;
          });
          
          // Get last 6 months
          const sortedMonths = Object.entries(monthlyBatches)
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .slice(-6);
          analyticsData.monthlyTrends = sortedMonths.map(([month, batches]) => ({ month, batches, shipments: 0, scans: 0 }));
        }
      }

      // Process shipment data
      if (shipmentRes.status === 'fulfilled') {
        const data = await shipmentRes.value.json();
        if (data.success) {
          const shipments = data.data || [];
          analyticsData.totalShipments = data.pagination?.total || shipments.length;
          analyticsData.deliveredShipments = shipments.filter((s: any) => s.status === 'DELIVERED').length;
          analyticsData.inTransitShipments = shipments.filter((s: any) => s.status === 'IN_TRANSIT').length;
          analyticsData.pendingShipments = shipments.filter((s: any) => s.status === 'PENDING').length;

          // Update monthly trends with shipments
          const monthlyShipments: Record<string, number> = {};
          shipments.forEach((s: any) => {
            const date = new Date(s.createdAt);
            const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyShipments[month] = (monthlyShipments[month] || 0) + 1;
          });
          analyticsData.monthlyTrends = analyticsData.monthlyTrends?.map(t => ({
            ...t,
            shipments: monthlyShipments[t.month] || 0
          })) || [];
        }
      }

      // Process manufacturer data
      if (manufacturerRes.status === 'fulfilled') {
        const data = await manufacturerRes.value.json();
        if (data.success) {
          const manufacturers = data.data || [];
          analyticsData.totalManufacturers = data.pagination?.total || manufacturers.length;
          
          // Aggregate by state
          manufacturers.forEach((m: any) => {
            const state = m.state || 'Unknown';
            if (state !== 'Unknown' && stateCoordinates[state]) {
              if (!stateAggregation[state]) {
                stateAggregation[state] = { count: 0, batches: 0, shipments: 0 };
              }
              stateAggregation[state].count += 1;
              stateAggregation[state].batches += m._count?.batches || 0;
            }
          });
        }
      }

      // Process distributor data
      if (distributorRes.status === 'fulfilled') {
        const data = await distributorRes.value.json();
        if (data.success) {
          const distributors = data.data || [];
          analyticsData.totalDistributors = data.pagination?.total || distributors.length;
          
          // Aggregate by state
          distributors.forEach((d: any) => {
            const state = d.state || 'Unknown';
            if (state !== 'Unknown' && stateCoordinates[state]) {
              if (!stateAggregation[state]) {
                stateAggregation[state] = { count: 0, batches: 0, shipments: 0 };
              }
              stateAggregation[state].count += 1;
              stateAggregation[state].shipments += d._count?.shipments || 0;
            }
          });
        }
      }

      // Process pharmacy data
      if (pharmacyRes.status === 'fulfilled') {
        const data = await pharmacyRes.value.json();
        if (data.success) {
          const pharmacies = data.data || [];
          analyticsData.totalPharmacies = data.pagination?.total || pharmacies.length;
          
          // Aggregate by state
          pharmacies.forEach((p: any) => {
            const state = p.state || 'Unknown';
            if (state !== 'Unknown' && stateCoordinates[state]) {
              if (!stateAggregation[state]) {
                stateAggregation[state] = { count: 0, batches: 0, shipments: 0 };
              }
              stateAggregation[state].count += 1;
            }
          });
        }
      }

      // Process scan data
      if (scanRes.status === 'fulfilled') {
        const data = await scanRes.value.json();
        if (data.success) {
          analyticsData.totalScans = data.pagination?.total || (data.data?.length || 0);
          analyticsData.verifiedScans = analyticsData.totalScans;
        }
      }

      // Convert state aggregation to geographic data for map
      const geoData: GeoLocation[] = Object.entries(stateAggregation)
        .filter(([state]) => stateCoordinates[state])
        .map(([state, data]) => ({
          id: state,
          name: state,
          city: stateCoordinates[state].capital,
          state: state,
          lat: stateCoordinates[state].lat,
          lng: stateCoordinates[state].lng,
          orders: data.count + data.batches + data.shipments,
          size: Math.max(10, Math.min(40, data.count * 5)),
        }));
      
      analyticsData.geographicData = geoData;
      setAnalytics(analyticsData as Analytics);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
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
      fetchAnalytics().finally(() => setIsLoading(false));
    } catch {
      router.push("/login");
    }
  }, [router, fetchAnalytics]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Prepare chart data
  const lifecycleChartData = [
    { label: "In Production", value: analytics?.lifecycleDistribution?.find(d => d.status === 'IN_PRODUCTION')?.count || 0, color: "#6366f1" },
    { label: "In Transit", value: analytics?.lifecycleDistribution?.find(d => d.status === 'IN_TRANSIT')?.count || analytics?.inTransitShipments || 0, color: "#f59e0b" },
    { label: "At Distributor", value: analytics?.lifecycleDistribution?.find(d => d.status === 'AT_DISTRIBUTOR')?.count || 0, color: "#3b82f6" },
    { label: "At Pharmacy", value: analytics?.lifecycleDistribution?.find(d => d.status === 'AT_PHARMACY')?.count || 0, color: "#8b5cf6" },
    { label: "Sold", value: analytics?.lifecycleDistribution?.find(d => d.status === 'SOLD')?.count || 0, color: "#0ea371" },
  ];

  const shipmentStatusData = [
    { label: "Delivered", value: analytics?.deliveredShipments || 0, color: "#0ea371" },
    { label: "In Transit", value: analytics?.inTransitShipments || 0, color: "#f59e0b" },
    { label: "Pending", value: analytics?.pendingShipments || 0, color: "#6366f1" },
  ];

  const batchStatusData = [
    { label: "Active", value: analytics?.activeBatches || 0, color: "#0ea371" },
    { label: "Recalled", value: analytics?.recalledBatches || 0, color: "#ef4444" },
    { label: "Expired", value: analytics?.expiredBatches || 0, color: "#f59e0b" },
  ];

  const userDistributionData = [
    { label: "Manufacturers", value: analytics?.totalManufacturers || 0, color: "#0ea371" },
    { label: "Distributors", value: analytics?.totalDistributors || 0, color: "#3b82f6" },
    { label: "Pharmacies", value: analytics?.totalPharmacies || 0, color: "#8b5cf6" },
  ];

  // Monthly trend data
  const monthlyData = analytics?.monthlyTrends || [];
  const trendLabels = monthlyData.map(m => m.month || '');
  const batchTrend = monthlyData.map(m => m.batches || 0);
  const shipmentTrend = monthlyData.map(m => m.shipments || 0);

  // Geographic data
  const geoData = analytics?.geographicData || [];

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} onLogout={handleLogout} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="min-h-screen transition-all duration-200" style={{ marginLeft: isCollapsed ? 72 : 280 }}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-sm text-slate-500">Platform-wide metrics and distribution insights</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button onClick={() => fetchAnalytics()}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Main Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Batches" value={analytics?.totalBatches || 0} change={`${analytics?.activeBatches || 0} active`} changeType="positive" color="emerald"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
            <StatCard title="Total Shipments" value={analytics?.totalShipments || 0} change={`${analytics?.deliveredShipments || 0} delivered`} changeType="positive" color="blue"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>} />
            <StatCard title="QR Scans" value={analytics?.totalScans || 0} change={`${analytics?.verifiedScans || 0} verified`} changeType="positive" color="purple"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>} />
            <StatCard title="Total Units" value={(analytics?.totalUnits || 0).toLocaleString()} change="Across all batches" changeType="neutral" color="amber"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
          </div>

          {/* Distribution Map */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-sm font-semibold text-slate-900">Distribution Network Map</h2>
              </div>
              <span className="text-xs text-slate-500">{geoData.length} locations</span>
            </div>
            {geoData.length > 0 ? (
              <>
                <HeatMap points={geoData} height={380} />
                {/* State-wise summary */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {geoData.slice(0, 8).map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-slate-700">{loc.state}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">{loc.orders}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center rounded-xl bg-slate-50">
                <svg className="mb-3 h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-sm font-medium text-slate-600">No distribution data yet</p>
                <p className="mt-1 text-xs text-slate-400">Add manufacturers/distributors/pharmacies to see locations on the map</p>
              </div>
            )}
          </div>

          {/* Charts Row 1 - Donut Charts */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <ChartCard title="Supply Chain Lifecycle" subtitle="Distribution of batches across stages">
              <SimpleDonutChart data={lifecycleChartData} size={140} showTotal />
            </ChartCard>
            <ChartCard title="Shipment Status" subtitle="Current shipment distribution">
              <SimpleDonutChart data={shipmentStatusData} size={140} showTotal />
            </ChartCard>
            <ChartCard title="User Distribution" subtitle="Platform users by role">
              <SimpleDonutChart data={userDistributionData} size={140} showTotal />
            </ChartCard>
          </div>

          {/* Charts Row 2 - Bar Charts */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Batch Status" subtitle="Active vs Recalled vs Expired">
              <SimpleBarChart data={batchStatusData} />
            </ChartCard>
            <ChartCard title="Top Products" subtitle="By total quantity produced">
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                <SimpleBarChart 
                  data={analytics.topProducts.slice(0, 5).map((p, i) => ({
                    label: p.name,
                    value: p.quantity || 0,
                    color: ["#0ea371", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"][i],
                  }))}
                />
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No product data available</p>
              )}
            </ChartCard>
          </div>

          {/* Trends */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Batch Production Trend" subtitle="Monthly batch creation">
              {batchTrend.length > 0 && batchTrend.some(v => v > 0) ? (
                <AreaChart data={batchTrend} labels={trendLabels} color="emerald" height={180} />
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Create batches to see production trend</p>
              )}
            </ChartCard>
            <ChartCard title="Shipment Trend" subtitle="Monthly shipments">
              {shipmentTrend.length > 0 && shipmentTrend.some(v => v > 0) ? (
                <AreaChart data={shipmentTrend} labels={trendLabels} color="blue" height={180} />
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Create shipments to see trend</p>
              )}
            </ChartCard>
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Manufacturers" value={analytics?.totalManufacturers || 0} change="Registered" changeType="neutral" color="emerald"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
            <StatCard title="Distributors" value={analytics?.totalDistributors || 0} change="Active partners" changeType="neutral" color="blue"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} />
            <StatCard title="Recalled Batches" value={analytics?.recalledBatches || 0} change={analytics?.recalledBatches ? "Needs attention" : "None"} changeType={analytics?.recalledBatches ? "negative" : "positive"} color="red"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
          </div>
        </div>
      </main>
    </div>
  );
}

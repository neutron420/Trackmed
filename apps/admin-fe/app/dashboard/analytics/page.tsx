"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { StatCard } from "../../../components/stat-card";
import {
  ChartCard,
  SimpleBarChart,
  SimpleDonutChart,
  MultiLineChart,
} from "../../../components/charts";
import dynamic from "next/dynamic";

// Mapbox component - client-only
const HeatMap = dynamic(
  () => import("../../../components/map/heat-map").then((m) => m.HeatMap),
  { ssr: false },
);

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

interface Batch {
  id: string;
  status: string;
  lifecycleStatus?: string;
  quantity: number;
  expiryDate?: string;
  medicine?: {
    name: string;
  };
  createdAt: string;
}

interface Shipment {
  id: string;
  status: string;
  createdAt: string;
}

interface Manufacturer {
  id: string;
  state?: string;
  _count?: {
    batches: number;
  };
}

interface Distributor {
  id: string;
  state?: string;
  _count?: {
    shipments: number;
  };
}

interface Pharmacy {
  id: string;
  state?: string;
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
  monthlyTrends: {
    month: string;
    batches: number;
    shipments: number;
    scans: number;
  }[];
  lifecycleDistribution: { status: string; count: number }[];
  geographicData: GeoLocation[];
  usersByRole: { role: string; count: number }[];
}

// State coordinates for India (capital/major city of each state)
const stateCoordinates: Record<
  string,
  { lat: number; lng: number; capital: string }
> = {
  "Andhra Pradesh": { lat: 15.9129, lng: 79.74, capital: "Amaravati" },
  "Arunachal Pradesh": { lat: 27.0844, lng: 93.6053, capital: "Itanagar" },
  Assam: { lat: 26.1445, lng: 91.7362, capital: "Dispur" },
  Bihar: { lat: 25.6093, lng: 85.1376, capital: "Patna" },
  Chhattisgarh: { lat: 21.2514, lng: 81.6296, capital: "Raipur" },
  Goa: { lat: 15.4909, lng: 73.8278, capital: "Panaji" },
  Gujarat: { lat: 23.2156, lng: 72.6369, capital: "Gandhinagar" },
  Haryana: { lat: 29.0588, lng: 76.0856, capital: "Chandigarh" },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734, capital: "Shimla" },
  Jharkhand: { lat: 23.3441, lng: 85.3096, capital: "Ranchi" },
  Karnataka: { lat: 12.9716, lng: 77.5946, capital: "Bengaluru" },
  Kerala: { lat: 8.5241, lng: 76.9366, capital: "Thiruvananthapuram" },
  "Madhya Pradesh": { lat: 23.2599, lng: 77.4126, capital: "Bhopal" },
  Maharashtra: { lat: 19.076, lng: 72.8777, capital: "Mumbai" },
  Manipur: { lat: 24.817, lng: 93.9368, capital: "Imphal" },
  Meghalaya: { lat: 25.5788, lng: 91.8933, capital: "Shillong" },
  Mizoram: { lat: 23.7271, lng: 92.7176, capital: "Aizawl" },
  Nagaland: { lat: 25.6751, lng: 94.1086, capital: "Kohima" },
  Odisha: { lat: 20.2961, lng: 85.8245, capital: "Bhubaneswar" },
  Punjab: { lat: 30.7333, lng: 76.7794, capital: "Chandigarh" },
  Rajasthan: { lat: 26.9124, lng: 75.7873, capital: "Jaipur" },
  Sikkim: { lat: 27.3389, lng: 88.6065, capital: "Gangtok" },
  "Tamil Nadu": { lat: 13.0827, lng: 80.2707, capital: "Chennai" },
  Telangana: { lat: 17.385, lng: 78.4867, capital: "Hyderabad" },
  Tripura: { lat: 23.8315, lng: 91.2868, capital: "Agartala" },
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462, capital: "Lucknow" },
  Uttarakhand: { lat: 30.3165, lng: 78.0322, capital: "Dehradun" },
  "West Bengal": { lat: 22.5726, lng: 88.3639, capital: "Kolkata" },
  Delhi: { lat: 28.6139, lng: 77.209, capital: "New Delhi" },
  Chandigarh: { lat: 30.7333, lng: 76.7794, capital: "Chandigarh" },
  Puducherry: { lat: 11.9416, lng: 79.8083, capital: "Puducherry" },
  Ladakh: { lat: 34.1526, lng: 77.5771, capital: "Leh" },
  "Jammu and Kashmir": { lat: 34.0837, lng: 74.7973, capital: "Srinagar" },
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [user] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Fetch analytics dashboard data and other endpoints in parallel
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
      
      const [
        analyticsRes,
        batchRes,
        shipmentRes,
        manufacturerRes,
        distributorRes,
        scanRes,
        pharmacyRes,
        userRes,
      ] = await Promise.allSettled([
        fetch(`${API_BASE}/api/analytics/dashboard?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/batch?limit=500`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/shipment?limit=500`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/manufacturer?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/distributor?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/scan/logs?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/pharmacy?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/user?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Parse all responses first to avoid reading response body multiple times
      const parsedResponses = await Promise.allSettled([
        analyticsRes.status === "fulfilled" ? analyticsRes.value.json().catch(() => null) : Promise.resolve(null),
        batchRes.status === "fulfilled" ? batchRes.value.json().catch(() => null) : Promise.resolve(null),
        shipmentRes.status === "fulfilled" ? shipmentRes.value.json().catch(() => null) : Promise.resolve(null),
        manufacturerRes.status === "fulfilled" ? manufacturerRes.value.json().catch(() => null) : Promise.resolve(null),
        distributorRes.status === "fulfilled" ? distributorRes.value.json().catch(() => null) : Promise.resolve(null),
        scanRes.status === "fulfilled" ? scanRes.value.json().catch(() => null) : Promise.resolve(null),
        pharmacyRes.status === "fulfilled" ? pharmacyRes.value.json().catch(() => null) : Promise.resolve(null),
        userRes.status === "fulfilled" ? userRes.value.json().catch(() => null) : Promise.resolve(null),
      ]);

      const [
        analyticsDataParsed,
        batchDataParsed,
        shipmentDataParsed,
        manufacturerDataParsed,
        distributorDataParsed,
        scanDataParsed,
        pharmacyDataParsed,
        userDataParsed,
      ] = parsedResponses.map((r) => r.status === "fulfilled" ? r.value : null);

      const analyticsData: Partial<Analytics> = {
        geographicData: [],
        topProducts: [],
        monthlyTrends: [],
        lifecycleDistribution: [],
        usersByRole: [],
        totalPharmacies: 0,
        totalBatches: 0,
        activeBatches: 0,
        recalledBatches: 0,
        expiredBatches: 0,
        totalShipments: 0,
        deliveredShipments: 0,
        inTransitShipments: 0,
        pendingShipments: 0,
        totalScans: 0,
        verifiedScans: 0,
        totalUnits: 0,
        totalManufacturers: 0,
        totalDistributors: 0,
      };

      // Process analytics dashboard data (has productionTrend and salesTrend)
      if (analyticsDataParsed) {
        try {
          const data = analyticsDataParsed;
          console.log("Analytics API response:", data);
          if (data.success && data.data) {
            const analyticsDataFromAPI = data.data;
            console.log("Analytics data from API:", analyticsDataFromAPI);
          
          // Use summary data from analytics API
          if (analyticsDataFromAPI.summary) {
            analyticsData.totalBatches = analyticsDataFromAPI.summary.totalBatches || 0;
            analyticsData.totalUnits = analyticsDataFromAPI.summary.totalUnits || 0;
            analyticsData.totalScans = analyticsDataFromAPI.summary.totalScans || 0;
            analyticsData.verifiedScans = analyticsDataFromAPI.summary.verifiedScans || 0;
            analyticsData.totalShipments = analyticsDataFromAPI.summary.totalShipments || 0;
            analyticsData.deliveredShipments = analyticsDataFromAPI.summary.deliveredShipments || 0;
            analyticsData.pendingShipments = analyticsDataFromAPI.summary.pendingShipments || 0;
            analyticsData.inTransitShipments = analyticsDataFromAPI.summary.inTransitShipments || 0;
          }

          // Use batch stats
          if (analyticsDataFromAPI.batchStats) {
            analyticsData.activeBatches = analyticsDataFromAPI.batchStats.activeBatches || 0;
            analyticsData.recalledBatches = analyticsDataFromAPI.batchStats.recalledBatches || 0;
            analyticsData.expiredBatches = analyticsDataFromAPI.batchStats.expiredBatches || 0;
          }

          // Use production trend and sales trend for Activity Overview chart
          if (analyticsDataFromAPI.productionTrend && analyticsDataFromAPI.salesTrend) {
            // Generate labels for the last N days based on dateRange
            const numDays = days;
            const labels: string[] = [];
            const batchTrendData: number[] = [];
            const shipmentTrendData: number[] = [];
            
            // Create a map of date -> count for quick lookup
            const batchTrendMap: Record<string, number> = {};
            const shipmentTrendMap: Record<string, number> = {};
            
            // Process production trend (batches) - format: [{ date, label, value }]
            if (Array.isArray(analyticsDataFromAPI.productionTrend)) {
              analyticsDataFromAPI.productionTrend.forEach((item: any) => {
                const dateStr = item.date;
                if (dateStr) {
                  batchTrendMap[dateStr] = (batchTrendMap[dateStr] || 0) + (item.value || item.count || 0);
                }
              });
            }
            
            // Process sales trend (shipments) - format: [{ date, label, value }]
            if (Array.isArray(analyticsDataFromAPI.salesTrend)) {
              analyticsDataFromAPI.salesTrend.forEach((item: any) => {
                const dateStr = item.date;
                if (dateStr) {
                  shipmentTrendMap[dateStr] = (shipmentTrendMap[dateStr] || 0) + (item.value || item.count || 0);
                }
              });
            }
            
            // Create day-by-day data for the last N days
            for (let i = numDays - 1; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const dateStr = date.toISOString().split('T')[0];
              const label = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
              
              labels.push(label);
              batchTrendData.push(batchTrendMap[dateStr] || 0);
              shipmentTrendData.push(shipmentTrendMap[dateStr] || 0);
            }
            
            // Store trend data for chart
            (analyticsData as any).batchTrendData = batchTrendData;
            (analyticsData as any).shipmentTrendData = shipmentTrendData;
            (analyticsData as any).trendLabels = labels;
          } else {
            // Fallback: generate empty arrays if no trend data
            const numDays = days;
            const labels: string[] = [];
            const batchTrendData: number[] = [];
            const shipmentTrendData: number[] = [];
            
            for (let i = numDays - 1; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              labels.push(date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
              batchTrendData.push(0);
              shipmentTrendData.push(0);
            }
            
            (analyticsData as any).batchTrendData = batchTrendData;
            (analyticsData as any).shipmentTrendData = shipmentTrendData;
            (analyticsData as any).trendLabels = labels;
          }

          // Use top products
          if (analyticsDataFromAPI.topProducts) {
            analyticsData.topProducts = analyticsDataFromAPI.topProducts.map((p: any) => ({
              name: p.name || p.productName || "Unknown",
              quantity: p.quantity || p.totalQuantity || 0,
            }));
          }
          } else {
            console.warn('Analytics API returned success but no data:', data);
          }
        } catch (error) {
          console.error('Error parsing analytics API response:', error);
        }
      } else {
        console.error('Analytics API request failed or returned no data');
      }

      // Process batch data for additional stats
      if (batchDataParsed) {
        try {
          const data = batchDataParsed;
          console.log("Batch API response:", data);
          if (data.success) {
            const batches: Batch[] = data.data || [];
            console.log(`Fetched ${batches.length} batches`);
            
            // Always update from batch data (more reliable)
            analyticsData.totalBatches = data.pagination?.total || batches.length;
            
            // Calculate batch status counts
            analyticsData.activeBatches = batches.filter(
              (b) => b.status === "VALID" || b.status === "ACTIVE"
            ).length;
            analyticsData.recalledBatches = batches.filter(
              (b) => b.status === "RECALLED"
            ).length;
            analyticsData.expiredBatches = batches.filter((b) => {
              if (b.expiryDate) {
                return new Date(b.expiryDate) < new Date();
              }
              return false;
            }).length;
            
            // Lifecycle distribution
            const lifecycleCounts: Record<string, number> = {};
            batches.forEach((b) => {
              const status = b.lifecycleStatus || "IN_PRODUCTION";
              lifecycleCounts[status] = (lifecycleCounts[status] || 0) + 1;
            });
            analyticsData.lifecycleDistribution = Object.entries(
              lifecycleCounts,
            ).map(([status, count]) => ({ status, count }));

            // Calculate total units
            analyticsData.totalUnits = batches.reduce(
              (sum, b) => sum + (b.quantity || 0),
              0,
            );
          }
        } catch (error) {
          console.error('Error processing batch data:', error);
        }
      }

      // Process shipment data for additional stats
      if (shipmentDataParsed) {
        try {
          const data = shipmentDataParsed;
          console.log("Shipment API response:", data);
          if (data.success) {
            const shipments: Shipment[] = data.data || [];
            console.log(`Fetched ${shipments.length} shipments`);
            
            // Always update from shipment data (more reliable)
            analyticsData.totalShipments = data.pagination?.total || shipments.length;
            analyticsData.deliveredShipments = shipments.filter(
              (s) => s.status === "DELIVERED",
            ).length;
            analyticsData.inTransitShipments = shipments.filter(
              (s) => s.status === "IN_TRANSIT" || s.status === "PICKED_UP" || s.status === "OUT_FOR_DELIVERY",
            ).length;
            analyticsData.pendingShipments = shipments.filter(
              (s) => s.status === "PENDING",
            ).length;
          }
        } catch (error) {
          console.error('Error processing shipment data:', error);
        }
      }

      // State-wise aggregation for map
      const stateAggregation: Record<
        string,
        { count: number; batches: number; shipments: number }
      > = {};

      // Process manufacturer data
      if (manufacturerDataParsed) {
        try {
          const data = manufacturerDataParsed;
          console.log("Manufacturer API response:", data);
          if (data.success) {
            const manufacturers: Manufacturer[] = data.data || [];
            console.log(`Fetched ${manufacturers.length} manufacturers`);
            analyticsData.totalManufacturers =
              data.pagination?.total || manufacturers.length;

          // Aggregate by state
          manufacturers.forEach((m) => {
            const state = m.state || "Unknown";
            if (state !== "Unknown" && stateCoordinates[state]) {
              if (!stateAggregation[state]) {
                stateAggregation[state] = {
                  count: 0,
                  batches: 0,
                  shipments: 0,
                };
              }
              stateAggregation[state].count += 1;
              stateAggregation[state].batches += m._count?.batches || 0;
            }
          });
          }
        } catch (error) {
          console.error('Error processing manufacturer data:', error);
        }
      }

      // Process distributor data
      if (distributorDataParsed) {
        try {
          const data = distributorDataParsed;
          console.log("Distributor API response:", data);
          if (data.success) {
            const distributors: Distributor[] = data.data || [];
            console.log(`Fetched ${distributors.length} distributors`);
            analyticsData.totalDistributors =
              data.pagination?.total || distributors.length;

          // Aggregate by state
          distributors.forEach((d) => {
            const state = d.state || "Unknown";
            if (state !== "Unknown" && stateCoordinates[state]) {
              if (!stateAggregation[state]) {
                stateAggregation[state] = {
                  count: 0,
                  batches: 0,
                  shipments: 0,
                };
              }
              stateAggregation[state].count += 1;
              stateAggregation[state].shipments += d._count?.shipments || 0;
            }
          });
          }
        } catch (error) {
          console.error('Error processing distributor data:', error);
        }
      }

      // Process pharmacy data
      if (pharmacyDataParsed) {
        try {
          const data = pharmacyDataParsed;
          console.log("Pharmacy API response:", data);
          if (data.success) {
            const pharmacies: Pharmacy[] = data.data || [];
            console.log(`Fetched ${pharmacies.length} pharmacies`);
            analyticsData.totalPharmacies =
              data.pagination?.total || pharmacies.length;

          // Aggregate by state
          pharmacies.forEach((p) => {
            const state = p.state || "Unknown";
            if (state !== "Unknown" && stateCoordinates[state]) {
              if (!stateAggregation[state]) {
                stateAggregation[state] = {
                  count: 0,
                  batches: 0,
                  shipments: 0,
                };
              }
              stateAggregation[state].count += 1;
            }
          });
          }
        } catch (error) {
          console.error('Error processing pharmacy data:', error);
        }
      }

      // Process scan data
      if (scanDataParsed) {
        try {
          const data = scanDataParsed;
          console.log("Scan API response:", data);
          if (data.success) {
            analyticsData.totalScans = data.pagination?.total || data.data?.length || 0;
            console.log(`Fetched ${analyticsData.totalScans} scans`);
            // Count verified scans from data
            if (Array.isArray(data.data)) {
              analyticsData.verifiedScans = data.data.filter((s: any) => s.blockchainVerified === true).length;
            } else {
              analyticsData.verifiedScans = analyticsData.totalScans;
            }
          }
        } catch (error) {
          console.error('Error processing scan data:', error);
        }
      }

      // Process user data for role distribution
      if (userDataParsed) {
        try {
          const data = userDataParsed;
          if (data.success) {
            const users = data.data || [];
            const roleCounts: Record<string, number> = {};
            users.forEach((u: any) => {
              const role = u.role || "UNKNOWN";
              roleCounts[role] = (roleCounts[role] || 0) + 1;
            });
            analyticsData.usersByRole = Object.entries(roleCounts).map(
              ([role, count]) => ({ role, count }),
            );
          }
        } catch (error) {
          console.error('Error processing user data:', error);
        }
      }

      // Generate day-by-day trends for Activity Overview chart if not from API
      if (!(analyticsData as any).batchTrendData && batchDataParsed && shipmentDataParsed) {
        if (batchDataParsed.success && shipmentDataParsed.success) {
          const batches: Batch[] = batchDataParsed.data || [];
          const shipments: Shipment[] = shipmentDataParsed.data || [];
          
          // Generate day-by-day data for the selected date range
          const numDays = days;
          const labels: string[] = [];
          const batchTrendData: number[] = [];
          const shipmentTrendData: number[] = [];
          
          // Create maps for quick lookup
          const batchDayMap: Record<string, number> = {};
          const shipmentDayMap: Record<string, number> = {};
          
          batches.forEach((b) => {
            const date = new Date(b.createdAt);
            const dateStr = date.toISOString().split('T')[0];
            batchDayMap[dateStr] = (batchDayMap[dateStr] || 0) + 1;
          });
          
          shipments.forEach((s) => {
            const date = new Date(s.createdAt);
            const dateStr = date.toISOString().split('T')[0];
            shipmentDayMap[dateStr] = (shipmentDayMap[dateStr] || 0) + 1;
          });
          
          // Generate data for last N days
          for (let i = numDays - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const label = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
            
            labels.push(label);
            batchTrendData.push(batchDayMap[dateStr] || 0);
            shipmentTrendData.push(shipmentDayMap[dateStr] || 0);
          }
          
          (analyticsData as any).batchTrendData = batchTrendData;
          (analyticsData as any).shipmentTrendData = shipmentTrendData;
          (analyticsData as any).trendLabels = labels;
        }
      }

      // Generate monthly trends for Unique Activity chart
      if (batchDataParsed && shipmentDataParsed) {
        if (batchDataParsed.success && shipmentDataParsed.success) {
          const batches: Batch[] = batchDataParsed.data || [];
          const shipments: Shipment[] = shipmentDataParsed.data || [];
          
          // Generate last 6 months
          const monthlyTrends: Record<string, { batches: number; shipments: number; scans: number }> = {};
          
          // Process batches
          batches.forEach((b) => {
            const date = new Date(b.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyTrends[monthKey]) {
              monthlyTrends[monthKey] = { batches: 0, shipments: 0, scans: 0 };
            }
            monthlyTrends[monthKey].batches += 1;
          });
          
          // Process shipments
          shipments.forEach((s) => {
            const date = new Date(s.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyTrends[monthKey]) {
              monthlyTrends[monthKey] = { batches: 0, shipments: 0, scans: 0 };
            }
            monthlyTrends[monthKey].shipments += 1;
          });
          
          // Convert to array and sort
          const sortedMonths = Object.entries(monthlyTrends)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6)
            .map(([monthKey, data]) => {
              const [year, month] = monthKey.split('-');
              const date = new Date(parseInt(year), parseInt(month) - 1);
              return {
                month: date.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
                batches: data.batches,
                shipments: data.shipments,
                scans: data.scans,
              };
            });
          
          analyticsData.monthlyTrends = sortedMonths;
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
      
      // Ensure we always have trend data (even if empty)
      if (!(analyticsData as any).batchTrendData) {
        const numDays = days;
        const labels: string[] = [];
        const batchTrendData: number[] = [];
        const shipmentTrendData: number[] = [];
        
        for (let i = numDays - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
          batchTrendData.push(0);
          shipmentTrendData.push(0);
        }
        
        (analyticsData as any).batchTrendData = batchTrendData;
        (analyticsData as any).shipmentTrendData = shipmentTrendData;
        (analyticsData as any).trendLabels = labels;
      }
      
      console.log("Analytics data fetched:", analyticsData);
      setAnalytics(analyticsData as Analytics);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Set empty analytics on error
      setAnalytics({
        totalBatches: 0,
        activeBatches: 0,
        recalledBatches: 0,
        expiredBatches: 0,
        totalShipments: 0,
        deliveredShipments: 0,
        inTransitShipments: 0,
        pendingShipments: 0,
        totalScans: 0,
        verifiedScans: 0,
        totalUnits: 0,
        totalManufacturers: 0,
        totalDistributors: 0,
        totalPharmacies: 0,
        topProducts: [],
        monthlyTrends: [],
        lifecycleDistribution: [],
        geographicData: [],
        usersByRole: [],
      } as Analytics);
    }
  }, [dateRange]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    let isMounted = true;

    const loadData = async () => {
      try {
        await fetchAnalytics();
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router, fetchAnalytics, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Prepare chart data
  const lifecycleChartData = [
    {
      label: "In Production",
      value:
        analytics?.lifecycleDistribution?.find(
          (d) => d.status === "IN_PRODUCTION",
        )?.count || 0,
      color: "#6366f1",
    },
    {
      label: "In Transit",
      value:
        analytics?.lifecycleDistribution?.find((d) => d.status === "IN_TRANSIT")
          ?.count ||
        analytics?.inTransitShipments ||
        0,
      color: "#f59e0b",
    },
    {
      label: "At Distributor",
      value:
        analytics?.lifecycleDistribution?.find(
          (d) => d.status === "AT_DISTRIBUTOR",
        )?.count || 0,
      color: "#3b82f6",
    },
    {
      label: "At Pharmacy",
      value:
        analytics?.lifecycleDistribution?.find(
          (d) => d.status === "AT_PHARMACY",
        )?.count || 0,
      color: "#8b5cf6",
    },
    {
      label: "Sold",
      value:
        analytics?.lifecycleDistribution?.find((d) => d.status === "SOLD")
          ?.count || 0,
      color: "#0ea371",
    },
  ];

  const shipmentStatusData = [
    {
      label: "Delivered",
      value: analytics?.deliveredShipments || 0,
      color: "#0ea371",
    },
    {
      label: "In Transit",
      value: analytics?.inTransitShipments || 0,
      color: "#f59e0b",
    },
    {
      label: "Pending",
      value: analytics?.pendingShipments || 0,
      color: "#6366f1",
    },
  ];

  const batchStatusData = [
    { label: "Active", value: analytics?.activeBatches || 0, color: "#0ea371" },
    {
      label: "Recalled",
      value: analytics?.recalledBatches || 0,
      color: "#ef4444",
    },
    {
      label: "Expired",
      value: analytics?.expiredBatches || 0,
      color: "#f59e0b",
    },
  ];

  const userDistributionData = [
    {
      label: "Manufacturers",
      value: analytics?.totalManufacturers || 0,
      color: "#0ea371",
    },
    {
      label: "Distributors",
      value: analytics?.totalDistributors || 0,
      color: "#3b82f6",
    },
    {
      label: "Pharmacies",
      value: analytics?.totalPharmacies || 0,
      color: "#8b5cf6",
    },
  ];

  // Activity Overview trend data (day-by-day from analytics API or calculated)
  const batchTrendData = (analytics as any)?.batchTrendData;
  const shipmentTrendData = (analytics as any)?.shipmentTrendData;
  const trendLabelsFromAPI = (analytics as any)?.trendLabels;
  
  // Use API trend data if available, otherwise calculate from monthly trends
  const trendLabels = trendLabelsFromAPI || (() => {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    const labels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
    }
    return labels;
  })();
  
  const batchTrend: number[] = batchTrendData || (() => {
    // Fallback: generate empty array with zeros
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    return Array(days).fill(0);
  })();
  
  const shipmentTrend: number[] = shipmentTrendData || (() => {
    // Fallback: generate empty array with zeros
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    return Array(days).fill(0);
  })();

  // Monthly trend data for Unique Activity chart
  const monthlyData = analytics?.monthlyTrends || [];

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
        {/* Header - Mantis style */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-slate-900">Analytics</span>
              </nav>
              <h1 className="text-2xl font-bold text-slate-900">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={() => fetchAnalytics()}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Row 1: Stat Cards - Mantis style */}
          <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Batches"
              value={analytics?.totalBatches || 0}
              change={`${analytics?.activeBatches || 0} active`}
              changeType="positive"
              color="emerald"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
            />
            <StatCard
              title="Total Shipments"
              value={analytics?.totalShipments || 0}
              change={`${analytics?.deliveredShipments || 0} delivered`}
              changeType="positive"
              color="blue"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              }
            />
            <StatCard
              title="QR Scans"
              value={analytics?.totalScans || 0}
              change={`${analytics?.verifiedScans || 0} verified`}
              changeType="positive"
              color="purple"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Total Units"
              value={(analytics?.totalUnits || 0).toLocaleString()}
              change="Across all batches"
              changeType="neutral"
              color="amber"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              }
            />
          </div>

          {/* Row 2: Main Charts - Mantis layout (2/3 + 1/3) */}
          <div className="mb-6 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard
                title="Activity Overview"
                subtitle="Batches & Shipments trend over time"
              >
                {batchTrend.length > 0 && trendLabels.length > 0 ? (
                  <MultiLineChart
                    series={[
                      { name: "Batches", data: batchTrend, color: "#0ea371" },
                      {
                        name: "Shipments",
                        data: shipmentTrend,
                        color: "#3b82f6",
                      },
                    ]}
                    labels={trendLabels}
                    height={260}
                  />
                ) : (
                  <div className="flex h-[260px] flex-col items-center justify-center text-slate-400">
                    <svg
                      className="h-12 w-12 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="text-sm font-medium">Loading chart data...</p>
                    <p className="text-xs">Please wait while we fetch analytics</p>
                  </div>
                )}
              </ChartCard>
            </div>
            <ChartCard title="Unique Activity" subtitle="Monthly breakdown">
              <SimpleBarChart
                data={[
                  {
                    label: "Batches",
                    value: monthlyData.reduce((sum, m) => sum + (m.batches || 0), 0) || analytics?.totalBatches || 0,
                    color: "#0ea371",
                  },
                  {
                    label: "Shipments",
                    value: monthlyData.reduce((sum, m) => sum + (m.shipments || 0), 0) || analytics?.totalShipments || 0,
                    color: "#3b82f6",
                  },
                  {
                    label: "Scans",
                    value: analytics?.totalScans || 0,
                    color: "#8b5cf6",
                  },
                  {
                    label: "Users",
                    value:
                      (analytics?.totalManufacturers || 0) +
                      (analytics?.totalDistributors || 0) +
                      (analytics?.totalPharmacies || 0),
                    color: "#f59e0b",
                  },
                ]}
                horizontal={false}
              />
            </ChartCard>
          </div>

          {/* Row 3: Donut Charts */}
          <div className="mb-6 grid gap-5 lg:grid-cols-3">
            <ChartCard
              title="Supply Chain Lifecycle"
              subtitle="Batch status distribution"
            >
              <SimpleDonutChart
                data={lifecycleChartData}
                size={130}
                showTotal
              />
            </ChartCard>
            <ChartCard
              title="Shipment Status"
              subtitle="Current shipment distribution"
            >
              <SimpleDonutChart
                data={shipmentStatusData}
                size={130}
                showTotal
              />
            </ChartCard>
            <ChartCard
              title="User Distribution"
              subtitle="Platform users by role"
            >
              <SimpleDonutChart
                data={userDistributionData}
                size={130}
                showTotal
              />
            </ChartCard>
          </div>

          {/* Row 4: Distribution Map */}
          <div className="mb-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Distribution Network
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Geographic distribution of supply chain activity
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {geoData.length} locations
                </span>
              </div>
              <div className="p-4">
                {geoData.length > 0 ? (
                  <>
                    <HeatMap points={geoData} height={380} />
                    {/* State summary grid */}
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {geoData.slice(0, 8).map((loc) => (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-medium text-slate-700">
                              {loc.state}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600">
                            {loc.orders}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
                    <div className="rounded-full bg-white p-4 shadow-sm mb-4">
                      <svg
                        className="h-10 w-10 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      No distribution data yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Add manufacturers, distributors, or pharmacies to see the
                      network
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 5: Additional Stats & Top Products */}
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Batch Status"
              subtitle="Active vs Recalled vs Expired"
            >
              <SimpleBarChart data={batchStatusData} />
            </ChartCard>
            <ChartCard
              title="Top Products"
              subtitle="By total quantity produced"
            >
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                <SimpleBarChart
                  data={analytics.topProducts.slice(0, 5).map((p, i) => ({
                    label:
                      p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
                    value: p.quantity || 0,
                    color: [
                      "#0ea371",
                      "#3b82f6",
                      "#8b5cf6",
                      "#f59e0b",
                      "#ef4444",
                    ][i],
                  }))}
                />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                  No product data available
                </div>
              )}
            </ChartCard>
          </div>

          {/* Row 6: Secondary Stats */}
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <StatCard
              title="Manufacturers"
              value={analytics?.totalManufacturers || 0}
              change="Registered"
              changeType="neutral"
              color="emerald"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />
            <StatCard
              title="Distributors"
              value={analytics?.totalDistributors || 0}
              change="Active partners"
              changeType="neutral"
              color="blue"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              }
            />
            <StatCard
              title="Recalled Batches"
              value={analytics?.recalledBatches || 0}
              change={analytics?.recalledBatches ? "Needs attention" : "None"}
              changeType={analytics?.recalledBatches ? "negative" : "positive"}
              color="red"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}

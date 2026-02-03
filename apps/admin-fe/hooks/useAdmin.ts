import { useQuery } from "@tanstack/react-query";
import { getToken } from "../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchWithAuth<T>(url: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.success ? data.data : data;
}

export interface DashboardStats {
  users: {
    total: number;
    manufacturers: number;
    distributors: number;
    pharmacies: number;
    admins: number;
  };
  batches: { total: number; active: number; recalled: number; expired: number };
  shipments: {
    total: number;
    inTransit: number;
    delivered: number;
    pending: number;
  };
  scans: { total: number; verified: number; failed: number };
  fraudAlerts: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchWithAuth<DashboardStats>(`${API_BASE}/api/admin/stats`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string;
  createdAt: string;
}

export function useRecentActivities(limit = 10) {
  return useQuery({
    queryKey: ["audit-trail", limit],
    queryFn: () =>
      fetchWithAuth<RecentActivity[]>(
        `${API_BASE}/api/audit-trail?limit=${limit}`,
      ),
    staleTime: 2 * 60 * 1000, 
  });
}

export interface Batch {
  id: string;
  batchNumber: string;
  status: string;
  medicine?: { name: string };
  createdAt: string;
}

export function useBatches(limit = 5) {
  return useQuery({
    queryKey: ["batches", limit],
    queryFn: () =>
      fetchWithAuth<Batch[]>(`${API_BASE}/api/batch?limit=${limit}`),
    staleTime: 3 * 60 * 1000,
  });
}

export function useBatchesForTrend(limit = 200) {
  return useQuery({
    queryKey: ["batches", "trend", limit],
    queryFn: () =>
      fetchWithAuth<Batch[]>(`${API_BASE}/api/batch?limit=${limit}`),
    staleTime: 5 * 60 * 1000, 
  });
}

export interface Shipment {
  id: string;
  status: string;
  createdAt: string;
}

export function useShipmentsForTrend(limit = 200) {
  return useQuery({
    queryKey: ["shipments", "trend", limit],
    queryFn: () =>
      fetchWithAuth<Shipment[]>(`${API_BASE}/api/shipment?limit=${limit}`),
    staleTime: 5 * 60 * 1000, 
  });
}

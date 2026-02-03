import { useQuery } from "@tanstack/react-query";
import { getToken } from "../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

async function fetchWithAuthFull<T>(url: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  totalShipments: number;
  pendingShipments: number;
  totalProducts: number;
  totalDistributors: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["manufacturer", "stats"],
    queryFn: () =>
      fetchWithAuth<DashboardStats>(`${API_BASE}/api/manufacturer/stats`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export function useProducts(limit = 100) {
  return useQuery({
    queryKey: ["products", limit],
    queryFn: () =>
      fetchWithAuth<Product[]>(`${API_BASE}/api/medicine?limit=${limit}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== Batches ====================
export interface Batch {
  id: string;
  batchNumber: string;
  status: string;
  medicine?: { name: string };
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  createdAt: string;
}

export function useBatches(limit = 100) {
  return useQuery({
    queryKey: ["batches", limit],
    queryFn: () =>
      fetchWithAuth<Batch[]>(`${API_BASE}/api/batch?limit=${limit}`),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useRecentBatches(limit = 5) {
  return useQuery({
    queryKey: ["batches", "recent", limit],
    queryFn: () =>
      fetchWithAuth<Batch[]>(`${API_BASE}/api/batch?limit=${limit}`),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ==================== Shipments ====================
export interface Shipment {
  id: string;
  status: string;
  batchId: string;
  distributorId: string;
  createdAt: string;
}

export function useShipments(limit = 100) {
  return useQuery({
    queryKey: ["shipments", limit],
    queryFn: () =>
      fetchWithAuth<Shipment[]>(`${API_BASE}/api/shipment?limit=${limit}`),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useRecentShipments(limit = 5) {
  return useQuery({
    queryKey: ["shipments", "recent", limit],
    queryFn: () =>
      fetchWithAuth<Shipment[]>(`${API_BASE}/api/shipment?limit=${limit}`),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ==================== Distributors ====================
export interface Distributor {
  id: string;
  name: string;
  email: string;
  address?: string;
}

export function useDistributors(limit = 100) {
  return useQuery({
    queryKey: ["distributors", limit],
    queryFn: () =>
      fetchWithAuth<Distributor[]>(
        `${API_BASE}/api/distributor?limit=${limit}`,
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== Audit Trail ====================
export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string;
  createdAt: string;
}

export function useAuditTrail(limit = 10) {
  return useQuery({
    queryKey: ["audit-trail", limit],
    queryFn: () =>
      fetchWithAuth<AuditEntry[]>(`${API_BASE}/api/audit-trail?limit=${limit}`),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ==================== Analytics Dashboard ====================
export interface AnalyticsDashboard {
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

export function useAnalyticsDashboard(days = 30) {
  return useQuery({
    queryKey: ["analytics", "dashboard", days],
    queryFn: () =>
      fetchWithAuth<AnalyticsDashboard>(
        `${API_BASE}/api/analytics/dashboard?days=${days}`,
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== QR Codes ====================
export interface QRCodeResponse {
  success: boolean;
  data: any[];
  stats?: {
    totalQRCodes: number;
    totalScans: number;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useQRCodeStats() {
  return useQuery({
    queryKey: ["qr-codes", "stats"],
    queryFn: () => fetchWithAuthFull<QRCodeResponse>(`${API_BASE}/api/qr-code?limit=1`),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ==================== Extended Batch for Dashboard ====================
export interface BatchWithDetails {
  id: string;
  batchNumber: string;
  medicine?: { name: string; strength?: string };
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  lifecycleStatus?: string;
  createdAt: string;
}

export function useBatchesWithDetails(limit = 5) {
  return useQuery({
    queryKey: ["batches", "details", limit],
    queryFn: () =>
      fetchWithAuth<BatchWithDetails[]>(`${API_BASE}/api/batch?limit=${limit}`),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useBatchesForTrend(limit = 100) {
  return useQuery({
    queryKey: ["batches", "trend", limit],
    queryFn: () =>
      fetchWithAuth<BatchWithDetails[]>(`${API_BASE}/api/batch?limit=${limit}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useShipmentsForTrend(limit = 100) {
  return useQuery({
    queryKey: ["shipments", "trend", limit],
    queryFn: () =>
      fetchWithAuth<Shipment[]>(`${API_BASE}/api/shipment?limit=${limit}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

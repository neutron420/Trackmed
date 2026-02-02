"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";
import { getToken, getUser, clearAuth, isAdmin } from "../../../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  batch?: { id: string; batchNumber: string; medicine?: { name: string; strength?: string } };
  fromManufacturer?: { id: string; name: string };
  toDistributor?: { id: string; name: string };
  toPharmacy?: { id: string; name: string };
  status: string;
  quantity: number;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  trackingUpdates?: { status: string; location?: string; timestamp: string }[];
}

export default function ShipmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchShipments = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/shipment?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setShipments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/login");
      return;
    }
    setUser(storedUser);
    fetchShipments().finally(() => setIsLoading(false));
  }, [router, fetchShipments]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return "success";
      case "IN_TRANSIT": return "warning";
      case "PENDING": return "neutral";
      case "CANCELLED": return "danger";
      default: return "neutral";
    }
  };

  const openModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowModal(true);
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = !search || 
      s.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.batch?.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.batch?.medicine?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
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
              <h1 className="text-xl font-bold text-slate-900">Shipment Tracking</h1>
              <p className="text-sm text-slate-500">Monitor all shipments across the platform</p>
            </div>
            <button onClick={() => fetchShipments()} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input type="text" placeholder="Search shipments, batches, medicines..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Shipments</p>
              <p className="text-2xl font-bold text-slate-900">{shipments.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">In Transit</p>
              <p className="text-2xl font-bold text-amber-600">{shipments.filter(s => s.status === "IN_TRANSIT").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Delivered</p>
              <p className="text-2xl font-bold text-emerald-600">{shipments.filter(s => s.status === "DELIVERED").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-600">{shipments.filter(s => s.status === "PENDING").length}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "shipmentNumber", label: "Shipment",
                  render: (item) => <span className="font-semibold text-emerald-700">{item.shipmentNumber || item.id.slice(0,8)}</span>,
                },
                {
                  key: "batch", label: "Batch / Medicine",
                  render: (item) => (
                    <div>
                      <p className="font-medium text-slate-900">{item.batch?.batchNumber || "—"}</p>
                      <p className="text-xs text-slate-500">{item.batch?.medicine?.name || "—"}</p>
                    </div>
                  ),
                },
                {
                  key: "from", label: "From",
                  render: (item) => <span className="text-sm text-slate-700">{item.fromManufacturer?.name || "—"}</span>,
                },
                {
                  key: "to", label: "To",
                  render: (item) => <span className="text-sm text-slate-700">{item.toDistributor?.name || item.toPharmacy?.name || "—"}</span>,
                },
                {
                  key: "quantity", label: "Qty",
                  render: (item) => <span className="text-sm text-slate-700">{item.quantity?.toLocaleString()}</span>,
                },
                {
                  key: "status", label: "Status",
                  render: (item) => <StatusBadge status={item.status || "PENDING"} variant={getStatusVariant(item.status)} />,
                },
                {
                  key: "actions", label: "Actions",
                  render: (item) => (
                    <button onClick={(e) => { e.stopPropagation(); openModal(item); }} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View</button>
                  ),
                },
              ]}
              data={filteredShipments}
            />
          </div>
        </div>
      </main>

      {/* Shipment Detail Modal */}
      {showModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Shipment {selectedShipment.shipmentNumber || selectedShipment.id.slice(0,8)}</h2>
                <StatusBadge status={selectedShipment.status || "PENDING"} variant={getStatusVariant(selectedShipment.status)} />
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Route */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">From</p>
                <p className="font-bold text-slate-900">{selectedShipment.fromManufacturer?.name || "—"}</p>
                <p className="text-xs text-slate-500">Manufacturer</p>
              </div>
              <div className="flex items-center justify-center">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
              <div className="flex-1 rounded-lg bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">To</p>
                <p className="font-bold text-slate-900">{selectedShipment.toDistributor?.name || selectedShipment.toPharmacy?.name || "—"}</p>
                <p className="text-xs text-slate-500">{selectedShipment.toDistributor ? "Distributor" : "Pharmacy"}</p>
              </div>
            </div>

            {/* Batch Info */}
            <div className="rounded-lg bg-slate-50 p-4 mb-6">
              <p className="text-xs text-slate-500 mb-2">Batch Information</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-700">{selectedShipment.batch?.batchNumber || "—"}</p>
                  <p className="text-sm text-slate-600">{selectedShipment.batch?.medicine?.name || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">{selectedShipment.quantity?.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">units</p>
                </div>
              </div>
            </div>

            {/* Vehicle & Driver */}
            {(selectedShipment.vehicleNumber || selectedShipment.driverName) && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedShipment.vehicleNumber && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Vehicle Number</p>
                    <p className="font-medium text-slate-800">{selectedShipment.vehicleNumber}</p>
                  </div>
                )}
                {selectedShipment.driverName && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Driver</p>
                    <p className="font-medium text-slate-800">{selectedShipment.driverName}</p>
                    {selectedShipment.driverPhone && <p className="text-xs text-slate-500">{selectedShipment.driverPhone}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Timeline</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600">Created</span>
                  <span className="ml-auto text-xs text-slate-400">{new Date(selectedShipment.createdAt).toLocaleString()}</span>
                </div>
                {selectedShipment.shippedAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-600">Shipped</span>
                    <span className="ml-auto text-xs text-slate-400">{new Date(selectedShipment.shippedAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedShipment.deliveredAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="text-sm text-slate-600">Delivered</span>
                    <span className="ml-auto text-xs text-slate-400">{new Date(selectedShipment.deliveredAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button onClick={() => setShowModal(false)} className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

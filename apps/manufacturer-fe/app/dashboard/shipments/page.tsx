"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { StatCard } from "../../../components/stat-card";
import { DataTable, StatusBadge } from "../../../components/data-table";
import { FiTruck, FiTrendingUp, FiCheckCircle, FiClock, FiPlus, FiSearch, FiRefreshCw, FiEye, FiX, FiMapPin } from "react-icons/fi";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  quantity: number;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  createdAt: string;
  batch: {
    batchNumber: string;
    imageUrl?: string;
    medicine: { name: string; strength: string; imageUrl?: string };
    manufacturer: { name: string };
  };
  distributor: { name: string; city: string | null };
  trackingHistory: Array<{
    status: string;
    location: string | null;
    description: string | null;
    timestamp: string;
  }>;
}

interface Stats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  deliveryRate: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ShipmentsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchShipments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter.toUpperCase());

      const response = await fetch(`${API_BASE}/api/shipment?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setShipments(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }
  }, [search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/shipment/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
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
      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      fetchShipments();
      fetchStats();
    }
  }, [isLoading, fetchShipments, fetchStats]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) fetchShipments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, isLoading, fetchShipments]);

  

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/shipment/${shipmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchShipments();
        fetchStats();
        setSelectedShipment(null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelShipment = async (shipmentId: string, reason: string) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/shipment/${shipmentId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchShipments();
        fetchStats();
        setSelectedShipment(null);
      }
    } catch (error) {
      console.error("Error cancelling shipment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "success";
      case "IN_TRANSIT":
      case "PICKED_UP":
      case "OUT_FOR_DELIVERY":
        return "info";
      case "PENDING":
        return "warning";
      case "CANCELLED":
      case "RETURNED":
        return "danger";
      default:
        return "neutral";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Shipments</h1>
              <p className="text-xs text-slate-500">Track and manage deliveries</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchShipments(); fetchStats(); }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FiRefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => router.push("/dashboard/shipments/new")}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                <FiPlus className="h-4 w-4" />
                New Shipment
              </button>
            </div>
          </div>
        </header>

        <div className="p-5">
          {/* Stats */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Shipments"
              value={stats?.total || 0}
              icon={<FiTruck className="h-5 w-5" />}
            />
            <StatCard
              title="In Transit"
              value={stats?.inTransit || 0}
              change="On the way"
              changeType="neutral"
              icon={<FiTrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Delivered"
              value={stats?.delivered || 0}
              change={`${stats?.deliveryRate || 0}% rate`}
              changeType="positive"
              icon={<FiCheckCircle className="h-5 w-5" />}
            />
            <StatCard
              title="Pending"
              value={stats?.pending || 0}
              change="Awaiting pickup"
              changeType="neutral"
              icon={<FiClock className="h-5 w-5" />}
            />
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Shipments Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {shipments.length > 0 ? (
              <DataTable
                columns={[
                  {
                    key: "shipmentNumber",
                    label: "Shipment ID",
                    render: (item) => (
                      <span className="font-semibold text-emerald-700">{item.shipmentNumber}</span>
                    ),
                  },
                  {
                    key: "batch",
                    label: "Batch / Product",
                    render: (item) => (
                      <div>
                        <p className="font-medium text-slate-800">{item.batch.batchNumber}</p>
                        <p className="text-xs text-slate-500">
                          {item.batch.medicine.name} {item.batch.medicine.strength}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "quantity",
                    label: "Qty",
                    render: (item) => (
                      <span className="text-slate-700">{item.quantity.toLocaleString()}</span>
                    ),
                  },
                  {
                    key: "distributor",
                    label: "Distributor",
                    render: (item) => (
                      <div>
                        <p className="text-slate-700">{item.distributor.name}</p>
                        {item.distributor.city && (
                          <p className="text-xs text-slate-500">{item.distributor.city}</p>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (item) => (
                      <StatusBadge
                        status={formatStatus(item.status)}
                        variant={getStatusVariant(item.status)}
                      />
                    ),
                  },
                  {
                    key: "estimatedDelivery",
                    label: "ETA",
                    render: (item) => (
                      <span className="text-xs text-slate-500">
                        {item.estimatedDelivery
                          ? new Date(item.estimatedDelivery).toLocaleDateString()
                          : "-"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    label: "",
                    render: (item) => (
                      <button
                        onClick={() => setSelectedShipment(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                    ),
                  },
                ]}
                data={shipments}
              />
            ) : (
              <div className="py-12 text-center">
                <FiTruck className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">
                  {search || statusFilter !== "all"
                    ? "No shipments match your filters"
                    : "No shipments yet"}
                </p>
                <button
                  onClick={() => router.push("/dashboard/shipments/new")}
                  className="mt-4 text-xs text-emerald-600 hover:underline"
                >
                  Create your first shipment
                </button>
              </div>
            )}
          </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Shipment Details
              </h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Medicine Image */}
              <div className="flex justify-center">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
                  {selectedShipment.batch?.imageUrl || selectedShipment.batch?.medicine?.imageUrl ? (
                    <div className="relative h-32 w-44">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                      </div>
                      <img
                        src={selectedShipment.batch?.imageUrl || selectedShipment.batch?.medicine?.imageUrl}
                        alt={selectedShipment.batch?.medicine?.name || "Medicine"}
                        className="relative z-10 h-32 w-44 object-cover"
                        onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                        style={{ opacity: 0, transition: 'opacity 0.25s ease-in' }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-32 w-44 flex-col items-center justify-center p-3">
                      <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <p className="mt-1 text-[10px] font-medium text-slate-400">
                        {selectedShipment.batch?.medicine?.name || "Medicine"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Shipment Number</p>
                  <p className="font-semibold text-emerald-700">
                    {selectedShipment.shipmentNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <StatusBadge
                    status={formatStatus(selectedShipment.status)}
                    variant={getStatusVariant(selectedShipment.status)}
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Batch</p>
                  <p className="font-medium text-slate-800">
                    {selectedShipment.batch.batchNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Quantity</p>
                  <p className="text-slate-700">
                    {selectedShipment.quantity.toLocaleString()} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Medicine</p>
                  <p className="text-slate-700">
                    {selectedShipment.batch.medicine.name}{" "}
                    {selectedShipment.batch.medicine.strength}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Distributor</p>
                  <p className="text-slate-700">{selectedShipment.distributor.name}</p>
                </div>
                {selectedShipment.carrier && (
                  <div>
                    <p className="text-xs text-slate-500">Carrier</p>
                    <p className="text-slate-700">{selectedShipment.carrier}</p>
                  </div>
                )}
                {selectedShipment.trackingNumber && (
                  <div>
                    <p className="text-xs text-slate-500">Tracking Number</p>
                    <p className="text-slate-700">{selectedShipment.trackingNumber}</p>
                  </div>
                )}
              </div>

              {/* Tracking History */}
              {selectedShipment.trackingHistory.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Tracking History
                  </p>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {selectedShipment.trackingHistory.map((track, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-lg bg-slate-50 p-2"
                      >
                        <FiMapPin className="mt-0.5 h-4 w-4 text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-800">
                            {formatStatus(track.status)}
                          </p>
                          {track.description && (
                            <p className="text-xs text-slate-500">{track.description}</p>
                          )}
                          <p className="text-xs text-slate-400">
                            {new Date(track.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedShipment.status !== "DELIVERED" &&
                selectedShipment.status !== "CANCELLED" && (
                  <div className="flex gap-2 pt-2">
                    {selectedShipment.status === "PENDING" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedShipment.id, "PICKED_UP")
                        }
                        disabled={isUpdating}
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark as Picked Up
                      </button>
                    )}
                    {selectedShipment.status === "PICKED_UP" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedShipment.id, "IN_TRANSIT")
                        }
                        disabled={isUpdating}
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {selectedShipment.status === "IN_TRANSIT" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedShipment.id, "OUT_FOR_DELIVERY")
                        }
                        disabled={isUpdating}
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {selectedShipment.status === "OUT_FOR_DELIVERY" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedShipment.id, "DELIVERED")
                        }
                        disabled={isUpdating}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const reason = prompt("Enter cancellation reason:");
                        if (reason) {
                          handleCancelShipment(selectedShipment.id, reason);
                        }
                      }}
                      disabled={isUpdating}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

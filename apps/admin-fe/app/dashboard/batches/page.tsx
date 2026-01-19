"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  medicine?: { id: string; name: string; strength?: string; composition?: string };
  manufacturer?: { id: string; name: string };
  distributor?: { id: string; name: string };
  quantity: number;
  unitPrice?: number;
  status: string;
  lifecycleStatus: string;
  manufacturingDate: string;
  expiryDate: string;
  createdAt: string;
  blockchainTxHash?: string;
  qrCode?: { code: string };
  _count?: { qrCodes?: number; scanLogs?: number };
}

export default function BatchesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const params = new URLSearchParams({ limit: "200" });
      if (search) params.append("search", search);

      const res = await fetch(`${API_BASE}/api/batch?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBatches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  }, [search]);

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
      fetchBatches().finally(() => setIsLoading(false));
    } catch {
      router.push("/login");
    }
  }, [router, fetchBatches]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleRecall = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("Are you sure you want to recall this batch? This action cannot be undone.")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/api/batch/${id}/recall`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Recalled by admin" }),
      });
      const data = await res.json();
      if (data.success) {
        setBatches(prev => prev.map(b => b.id === id ? { ...b, status: "RECALLED" } : b));
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to recall batch:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": case "VALID": return "success";
      case "RECALLED": return "danger";
      case "EXPIRED": return "warning";
      default: return "neutral";
    }
  };

  const getLifecycleVariant = (status: string) => {
    switch (status) {
      case "IN_PRODUCTION": return "neutral";
      case "IN_TRANSIT": return "warning";
      case "AT_DISTRIBUTOR": return "info";
      case "AT_PHARMACY": return "success";
      case "SOLD": return "success";
      default: return "neutral";
    }
  };

  const openModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const filteredBatches = batches.filter(b => {
    const matchesSearch = !search || 
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.medicine?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.manufacturer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter || b.lifecycleStatus === statusFilter;
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
              <h1 className="text-xl font-bold text-slate-900">Batch Monitoring</h1>
              <p className="text-sm text-slate-500">Monitor all batches across manufacturers</p>
            </div>
            <button onClick={() => fetchBatches()} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input type="text" placeholder="Search batches, medicines, manufacturers..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="VALID">Valid</option>
              <option value="RECALLED">Recalled</option>
              <option value="EXPIRED">Expired</option>
              <option value="IN_PRODUCTION">In Production</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="AT_DISTRIBUTOR">At Distributor</option>
              <option value="AT_PHARMACY">At Pharmacy</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Batches</p>
              <p className="text-2xl font-bold text-slate-900">{batches.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-2xl font-bold text-emerald-600">{batches.filter(b => b.status === "ACTIVE" || b.status === "VALID").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Recalled</p>
              <p className="text-2xl font-bold text-red-600">{batches.filter(b => b.status === "RECALLED").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">In Transit</p>
              <p className="text-2xl font-bold text-amber-600">{batches.filter(b => b.lifecycleStatus === "IN_TRANSIT").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Units</p>
              <p className="text-2xl font-bold text-blue-600">{batches.reduce((sum, b) => sum + (b.quantity || 0), 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "batchNumber", label: "Batch",
                  render: (item) => <span className="font-semibold text-emerald-700">{item.batchNumber}</span>,
                },
                {
                  key: "medicine", label: "Medicine",
                  render: (item) => (
                    <div>
                      <p className="font-medium text-slate-900">{item.medicine?.name || "—"}</p>
                      {item.medicine?.strength && <p className="text-xs text-slate-500">{item.medicine.strength}</p>}
                    </div>
                  ),
                },
                {
                  key: "manufacturer", label: "Manufacturer",
                  render: (item) => <span className="text-sm text-slate-600">{item.manufacturer?.name || "—"}</span>,
                },
                {
                  key: "quantity", label: "Qty",
                  render: (item) => <span className="text-sm text-slate-700">{item.quantity?.toLocaleString()}</span>,
                },
                {
                  key: "status", label: "Status",
                  render: (item) => <StatusBadge status={item.status || "ACTIVE"} variant={getStatusVariant(item.status)} />,
                },
                {
                  key: "lifecycleStatus", label: "Lifecycle",
                  render: (item) => <StatusBadge status={(item.lifecycleStatus || "IN_PRODUCTION").replace(/_/g, " ")} variant={getLifecycleVariant(item.lifecycleStatus)} />,
                },
                {
                  key: "expiryDate", label: "Expiry",
                  render: (item) => {
                    const isExpired = new Date(item.expiryDate) < new Date();
                    return <span className={`text-sm ${isExpired ? "text-red-600 font-medium" : "text-slate-600"}`}>{new Date(item.expiryDate).toLocaleDateString()}</span>;
                  },
                },
                {
                  key: "actions", label: "Actions",
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      {actionLoading === item.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                      ) : (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); openModal(item); }} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View</button>
                          {item.status !== "RECALLED" && (
                            <button onClick={(e) => { e.stopPropagation(); handleRecall(item.id); }}
                              className="rounded-lg px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Recall</button>
                          )}
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
              data={filteredBatches}
            />
          </div>
        </div>
      </main>

      {/* Batch Detail Modal */}
      {showModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Batch {selectedBatch.batchNumber}</h2>
                <div className="flex gap-2 mt-2">
                  <StatusBadge status={selectedBatch.status || "ACTIVE"} variant={getStatusVariant(selectedBatch.status)} />
                  <StatusBadge status={(selectedBatch.lifecycleStatus || "IN_PRODUCTION").replace(/_/g, " ")} variant={getLifecycleVariant(selectedBatch.lifecycleStatus)} />
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Medicine</p>
                <p className="font-bold text-slate-900">{selectedBatch.medicine?.name || "—"}</p>
                {selectedBatch.medicine?.strength && <p className="text-sm text-slate-600">{selectedBatch.medicine.strength}</p>}
                {selectedBatch.medicine?.composition && <p className="text-xs text-slate-500 mt-1">{selectedBatch.medicine.composition}</p>}
              </div>
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Manufacturer</p>
                <p className="font-bold text-slate-900">{selectedBatch.manufacturer?.name || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Quantity</p>
                <p className="font-bold text-slate-800">{selectedBatch.quantity?.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Unit Price</p>
                <p className="font-bold text-slate-800">₹{selectedBatch.unitPrice?.toFixed(2) || "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Total Value</p>
                <p className="font-bold text-slate-800">₹{((selectedBatch.quantity || 0) * (selectedBatch.unitPrice || 0)).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Manufacturing Date</p>
                  <p className="font-medium text-slate-800">{new Date(selectedBatch.manufacturingDate).toLocaleDateString()}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Expiry Date</p>
                  <p className={`font-medium ${new Date(selectedBatch.expiryDate) < new Date() ? "text-red-600" : "text-slate-800"}`}>
                    {new Date(selectedBatch.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedBatch.distributor && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Current Distributor</p>
                  <p className="font-medium text-slate-800">{selectedBatch.distributor.name}</p>
                </div>
              )}
              {selectedBatch.blockchainTxHash && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Blockchain Hash</p>
                  <p className="font-mono text-xs text-slate-600 break-all">{selectedBatch.blockchainTxHash}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">QR Codes</p>
                  <p className="font-bold text-emerald-600">{selectedBatch._count?.qrCodes || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Scan Logs</p>
                  <p className="font-bold text-emerald-600">{selectedBatch._count?.scanLogs || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
              {selectedBatch.status !== "RECALLED" && (
                <button onClick={() => handleRecall(selectedBatch.id)} disabled={actionLoading === selectedBatch.id}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {actionLoading === selectedBatch.id ? "Processing..." : "Recall Batch"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

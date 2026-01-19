"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  medicine: { name: string; strength: string; imageUrl?: string };
  quantity: number;
  remainingQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  lifecycleStatus: string;
  gstNumber?: string;
  warehouseLocation?: string;
  warehouseAddress?: string;
  imageUrl?: string;
}

export default function BatchesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      fetchBatches(token);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchBatches = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/batch?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBatches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.medicine?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status: string): "active" | "pending" | "shipped" | "delivered" | "expired" | "recalled" => {
    const map: Record<string, "active" | "pending" | "shipped" | "delivered" | "expired" | "recalled"> = {
      VALID: "active",
      RECALLED: "recalled",
      EXPIRED: "expired",
      IN_PRODUCTION: "pending",
      IN_WAREHOUSE: "active",
      IN_TRANSIT: "shipped",
      AT_DISTRIBUTOR: "shipped",
      AT_PHARMACY: "delivered",
      SOLD: "delivered",
    };
    return map[status] || "pending";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
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
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Batches</h1>
              <p className="text-xs text-slate-500">Manage your medicine batches</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/batches/new")}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Batch
            </button>
          </div>
        </header>

        <div className="p-5">
          {/* Search & Filters */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by batch number or medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Batches Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "batchNumber",
                  label: "Batch Number",
                  render: (item) => (
                    <span className="font-semibold text-emerald-700">{item.batchNumber}</span>
                  ),
                },
                {
                  key: "medicine",
                  label: "Medicine",
                  render: (item) => (
                    <div>
                      <p className="text-slate-900">{item.medicine?.name || "N/A"}</p>
                      <p className="text-[10px] text-slate-500">{item.medicine?.strength || ""}</p>
                    </div>
                  ),
                },
                {
                  key: "quantity",
                  label: "Qty",
                  render: (item) => (
                    <span className="text-slate-600">{item.quantity?.toLocaleString()}</span>
                  ),
                },
                {
                  key: "manufacturingDate",
                  label: "Mfg Date",
                  render: (item) => (
                    <span className="text-slate-500">
                      {new Date(item.manufacturingDate).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: "expiryDate",
                  label: "Expiry",
                  render: (item) => (
                    <span className="text-slate-500">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: "lifecycleStatus",
                  label: "Status",
                  render: (item) => (
                    <StatusBadge status={getStatusVariant(item.lifecycleStatus || item.status)} />
                  ),
                },
                {
                  key: "actions",
                  label: "",
                  render: (item) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatch(item);
                      }}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      View details
                    </button>
                  ),
                },
              ]}
              data={filteredBatches}
              onRowClick={(item) => setSelectedBatch(item)}
            />
            {filteredBatches.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">No batches found</p>
                <button
                  onClick={() => router.push("/dashboard/batches/new")}
                  className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Create your first batch →
                </button>
              </div>
            )}
          </div>
          {/* Batch Details Modal */}
          {selectedBatch && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Batch {selectedBatch.batchNumber}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {selectedBatch.medicine?.name} {selectedBatch.medicine?.strength}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBatch(null)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 px-5 py-4 text-xs text-slate-700">
                  {/* Medicine Image */}
                  <div className="flex justify-center">
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
                      {selectedBatch.imageUrl || selectedBatch.medicine?.imageUrl ? (
                        <div className="relative h-36 w-48">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                          </div>
                          <img
                            src={selectedBatch.imageUrl || selectedBatch.medicine?.imageUrl}
                            alt={selectedBatch.medicine?.name || "Medicine"}
                            className="relative z-10 h-36 w-48 object-cover"
                            onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                            style={{ opacity: 0, transition: 'opacity 0.25s ease-in' }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-36 w-48 flex-col items-center justify-center p-4">
                          <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <p className="mt-2 text-[11px] font-medium text-slate-400">
                            {selectedBatch.medicine?.name || "Medicine"}
                          </p>
                          <p className="text-[10px] text-slate-300">No image available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500">Quantity</p>
                      <p className="mt-0.5 font-medium">
                        {selectedBatch.quantity?.toLocaleString()} units
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Remaining Qty</p>
                      <p className="mt-0.5 font-medium">
                        {selectedBatch.remainingQuantity?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Manufacturing Date</p>
                      <p className="mt-0.5">
                        {new Date(selectedBatch.manufacturingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Expiry Date</p>
                      <p className="mt-0.5">
                        {new Date(selectedBatch.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">GST Number</p>
                      <p className="mt-0.5">
                        {selectedBatch.gstNumber || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Lifecycle Status</p>
                      <div className="mt-0.5">
                        <StatusBadge status={getStatusVariant(selectedBatch.lifecycleStatus || selectedBatch.status)} />
                      </div>
                    </div>
                  </div>

                  {(selectedBatch.warehouseLocation || selectedBatch.warehouseAddress) && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-600">Warehouse</p>
                      {selectedBatch.warehouseLocation && (
                        <p className="mt-0.5 text-slate-800">{selectedBatch.warehouseLocation}</p>
                      )}
                      {selectedBatch.warehouseAddress && (
                        <p className="mt-0.5 text-[11px] text-slate-600 whitespace-pre-line">
                          {selectedBatch.warehouseAddress}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
                  <button
                    onClick={() => router.push("/dashboard/qr-codes")}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Manage QR codes →
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBatch(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

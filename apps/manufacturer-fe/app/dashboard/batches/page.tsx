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
  medicine: { name: string; strength: string };
  quantity: number;
  remainingQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  lifecycleStatus: string;
}

export default function BatchesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      const res = await fetch("/api/batch?limit=50", {
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
                      onClick={() => router.push(`/dashboard/batches/${item.id}`)}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      View →
                    </button>
                  ),
                },
              ]}
              data={filteredBatches}
              onRowClick={(item) => router.push(`/dashboard/batches/${item.id}`)}
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
        </div>
      </main>
    </div>
  );
}

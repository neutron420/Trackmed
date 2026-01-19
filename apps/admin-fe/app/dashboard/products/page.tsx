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

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: { name: string };
  category?: string;
  isActive?: boolean;
  createdAt: string;
  _count?: {
    batches?: number;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");

  const fetchMedicines = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/medicine?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMedicines(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
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
      fetchMedicines().finally(() => setIsLoading(false));
    } catch {
      router.push("/login");
    }
  }, [router, fetchMedicines]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredMedicines = medicines.filter(m =>
    !search || 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
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
        style={{ marginLeft: isCollapsed ? 72 : 280 }}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Products</h1>
              <p className="text-sm text-slate-500">All registered medicines across the platform</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => fetchMedicines()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Products</p>
              <p className="text-2xl font-bold text-slate-900">{medicines.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-2xl font-bold text-emerald-600">{medicines.filter(m => m.isActive !== false).length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{medicines.filter(m => m.isActive === false).length}</p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "Product",
                  render: (item) => (
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      {item.genericName && <p className="text-xs text-slate-500">{item.genericName}</p>}
                    </div>
                  ),
                },
                {
                  key: "strength",
                  label: "Strength",
                  render: (item) => (
                    <span className="text-sm text-slate-700">{item.strength || "—"}</span>
                  ),
                },
                {
                  key: "form",
                  label: "Form",
                  render: (item) => (
                    <span className="text-sm text-slate-700">{item.dosageForm || "—"}</span>
                  ),
                },
                {
                  key: "manufacturer",
                  label: "Manufacturer",
                  render: (item) => (
                    <span className="text-sm text-slate-600">{item.manufacturer?.name || "—"}</span>
                  ),
                },
                {
                  key: "batches",
                  label: "Batches",
                  render: (item) => (
                    <span className="text-sm text-slate-700">{item._count?.batches || 0}</span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (item) => (
                    <StatusBadge 
                      status={item.isActive !== false ? "Active" : "Inactive"} 
                      variant={item.isActive !== false ? "success" : "danger"} 
                    />
                  ),
                },
              ]}
              data={filteredMedicines}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

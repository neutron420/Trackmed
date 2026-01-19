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

interface Pharmacy {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  createdAt: string;
  _count?: {
    shipmentsReceived?: number;
    sales?: number;
  };
}

export default function PharmaciesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [search, setSearch] = useState("");

  const fetchPharmacies = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/pharmacy?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPharmacies(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch pharmacies:", error);
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
      fetchPharmacies().finally(() => setIsLoading(false));
    } catch {
      router.push("/login");
    }
  }, [router, fetchPharmacies]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredPharmacies = pharmacies.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
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
              <h1 className="text-xl font-bold text-slate-900">Pharmacies</h1>
              <p className="text-sm text-slate-500">Manage registered pharmacies</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search pharmacies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => fetchPharmacies()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Pharmacies</p>
              <p className="text-2xl font-bold text-slate-900">{pharmacies.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-2xl font-bold text-emerald-600">{pharmacies.filter(p => p.isActive !== false).length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{pharmacies.filter(p => p.isActive === false).length}</p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "Pharmacy",
                  render: (item) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold">
                        {item.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        {item.licenseNumber && <p className="text-xs text-slate-500">License: {item.licenseNumber}</p>}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "location",
                  label: "Location",
                  render: (item) => (
                    <div>
                      <p className="text-sm text-slate-700">{item.city || "—"}</p>
                      {item.state && <p className="text-xs text-slate-500">{item.state}</p>}
                    </div>
                  ),
                },
                {
                  key: "received",
                  label: "Received",
                  render: (item) => (
                    <span className="text-sm text-slate-700">{item._count?.shipmentsReceived || 0}</span>
                  ),
                },
                {
                  key: "sales",
                  label: "Sales",
                  render: (item) => (
                    <span className="text-sm text-slate-700">{item._count?.sales || 0}</span>
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
                {
                  key: "actions",
                  label: "",
                  render: () => (
                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View →</button>
                  ),
                },
              ]}
              data={filteredPharmacies}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

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
  isActive?: boolean;
  createdAt?: string;
}

// Sidebar user type (without createdAt)
type SidebarUser = Pick<User, "id" | "email" | "name" | "role">;

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pharmacyCount, setPharmacyCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (roleFilter) params.append("role", roleFilter);
      if (search) params.append("search", search);

      const res = await fetch(`${API_BASE}/api/user?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [search, roleFilter]);

  const fetchPharmacyCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/pharmacy?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPharmacyCount(data.pagination?.total || data.data?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch pharmacy count:", error);
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
    Promise.all([fetchUsers(), fetchPharmacyCount()]).finally(() =>
      setIsLoading(false),
    );
  }, [router, fetchUsers, fetchPharmacyCount]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "info";
      case "MANUFACTURER":
        return "success";
      case "DISTRIBUTOR":
        return "warning";
      case "PHARMACY":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
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
              <h1 className="text-xl font-bold text-slate-900">
                User Management
              </h1>
              <p className="text-sm text-slate-500">
                Manage all platform users
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="PHARMACY">Pharmacy</option>
            </select>
            <button
              onClick={() => {
                fetchUsers();
                fetchPharmacyCount();
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
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

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">
                {users.length + pharmacyCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Manufacturers</p>
              <p className="text-2xl font-bold text-emerald-600">
                {users.filter((u) => u.role === "MANUFACTURER").length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Distributors</p>
              <p className="text-2xl font-bold text-amber-600">
                {users.filter((u) => u.role === "DISTRIBUTOR").length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Pharmacies</p>
              <p className="text-2xl font-bold text-blue-600">
                {pharmacyCount}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "User",
                  render: (item) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                        {(item.name || item.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "role",
                  label: "Role",
                  render: (item) => (
                    <StatusBadge
                      status={item.role}
                      variant={getRoleVariant(item.role)}
                    />
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
                  key: "createdAt",
                  label: "Joined",
                  render: (item) => (
                    <span className="text-sm text-slate-600">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  label: "",
                  render: (item) => (
                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      View →
                    </button>
                  ),
                },
              ]}
              data={filteredUsers}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

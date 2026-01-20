"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { StatCard } from "../../../components/stat-card";
import { FiUsers, FiShield, FiClock, FiPlus, FiSearch, FiEdit2, FiTrash2, FiRefreshCw, FiPhone, FiMail, FiMapPin } from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Distributor {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  gstNumber: string | null;
  isVerified: boolean;
  createdAt: string;
  _count?: { batches: number };
}

export default function DistributorsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [search, setSearch] = useState("");

  const fetchDistributors = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/distributor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDistributors(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
    } finally {
      setIsLoading(false);
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
      fetchDistributors();
    } catch {
      router.push("/login");
    }
  }, [router, fetchDistributors]);

  

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/distributor/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchDistributors();
      } else {
        alert(data.error || "Failed to delete distributor");
      }
    } catch (error) {
      alert("Failed to delete distributor");
    }
  };

  const filteredDistributors = distributors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Distributors</h1>
              <p className="text-xs text-slate-500">Manage your distribution network</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDistributors}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FiRefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push("/dashboard/distributors/new")}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                <FiPlus className="h-4 w-4" />
                Add Distributor
              </button>
            </div>
          </div>
        </header>

        <div className="p-5">
          {/* Stats */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Distributors"
              value={distributors.length}
              icon={<FiUsers className="h-5 w-5" />}
            />
            <StatCard
              title="Verified"
              value={distributors.filter((d) => d.isVerified).length}
              change="Active partners"
              changeType="positive"
              icon={<FiShield className="h-5 w-5" />}
            />
            <StatCard
              title="Pending Verification"
              value={distributors.filter((d) => !d.isVerified).length}
              change="Awaiting approval"
              changeType="neutral"
              icon={<FiClock className="h-5 w-5" />}
            />
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search distributors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Distributors Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDistributors.map((distributor) => (
              <div
                key={distributor.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                        <FiUsers className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{distributor.name}</h3>
                        <p className="text-xs text-slate-500">{distributor.licenseNumber}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        distributor.isVerified
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {distributor.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    {distributor.email && (
                      <div className="flex items-center gap-2">
                        <FiMail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{distributor.email}</span>
                      </div>
                    )}
                    {distributor.phone && (
                      <div className="flex items-center gap-2">
                        <FiPhone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{distributor.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FiMapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">
                        {distributor.city && `${distributor.city}, `}
                        {distributor.state || distributor.country}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">
                      {distributor._count?.batches || 0} batches assigned
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(distributor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => router.push(`/dashboard/distributors/${distributor.id}/edit`)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiEdit2 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(distributor.id, distributor.name)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      <FiTrash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDistributors.length === 0 && (
            <div className="py-12 text-center">
              <FiUsers className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-xs text-slate-500">
                {search ? "No distributors match your search" : "No distributors yet"}
              </p>
              <button
                onClick={() => router.push("/dashboard/distributors/new")}
                className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Add your first distributor →
              </button>
            </div>
          )}
        </div>
      </div>
  );
}

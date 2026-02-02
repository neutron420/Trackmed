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

interface Distributor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt: string;
  _count?: {
    batches?: number;
    shipments?: number;
  };
}

export default function DistributorsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", email: "", phone: "", licenseNumber: "", address: "",
    city: "", state: "", gstNumber: "",
  });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchDistributors = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/distributor?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDistributors(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
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
    fetchDistributors().finally(() => setIsLoading(false));
  }, [router, fetchDistributors]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleVerify = async (id: string, verify: boolean) => {
    const token = getToken();
    if (!token) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/api/distributor/${id}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: verify }),
      });
      const data = await res.json();
      if (data.success) {
        setDistributors(prev => prev.map(d => d.id === id ? { ...d, isVerified: verify } : d));
      }
    } catch (error) {
      console.error("Failed to update verification:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string, activate: boolean) => {
    const token = getToken();
    if (!token) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/api/distributor/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: activate }),
      });
      const data = await res.json();
      if (data.success) {
        setDistributors(prev => prev.map(d => d.id === id ? { ...d, isActive: activate } : d));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateDistributor = async () => {
    const token = getToken();
    if (!token) return;

    if (!createForm.name || !createForm.licenseNumber || !createForm.address) {
      setCreateError("Name, License Number, and Address are required");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch(`${API_BASE}/api/distributor`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setDistributors(prev => [data.data, ...prev]);
        setShowCreateModal(false);
        setCreateForm({ name: "", email: "", phone: "", licenseNumber: "", address: "", city: "", state: "", gstNumber: "" });
      } else {
        setCreateError(data.error || "Failed to create distributor");
      }
    } catch (error) {
      setCreateError("Failed to create distributor");
    } finally {
      setCreating(false);
    }
  };

  const openModal = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setShowModal(true);
  };

  const filteredDistributors = distributors.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber?.toLowerCase().includes(search.toLowerCase())
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
      <Sidebar user={user} onLogout={handleLogout} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="min-h-screen transition-all duration-200" style={{ marginLeft: isCollapsed ? 72 : 280 }}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Distributors</h1>
              <p className="text-sm text-slate-500">Manage distribution partners</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Distributor
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <input type="text" placeholder="Search distributors..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <button onClick={() => fetchDistributors()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Refresh</button>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{distributors.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Verified</p>
              <p className="text-2xl font-bold text-emerald-600">{distributors.filter(d => d.isVerified).length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-2xl font-bold text-blue-600">{distributors.filter(d => d.isActive !== false).length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{distributors.filter(d => d.isActive === false).length}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "name", label: "Distributor",
                  render: (item) => (
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-semibold ${item.isActive === false ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
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
                  key: "contact", label: "Contact",
                  render: (item) => (
                    <div>
                      <p className="text-sm text-slate-700">{item.email || "—"}</p>
                      {item.phone && <p className="text-xs text-slate-500">{item.phone}</p>}
                    </div>
                  ),
                },
                {
                  key: "location", label: "Location",
                  render: (item) => (
                    <span className="text-sm text-slate-700">{item.city || "—"}{item.state ? `, ${item.state}` : ""}</span>
                  ),
                },
                {
                  key: "batches", label: "Batches",
                  render: (item) => <span className="text-sm text-slate-700">{item._count?.batches || 0}</span>,
                },
                {
                  key: "verified", label: "Verified",
                  render: (item) => <StatusBadge status={item.isVerified ? "Verified" : "Pending"} variant={item.isVerified ? "success" : "warning"} />,
                },
                {
                  key: "status", label: "Status",
                  render: (item) => <StatusBadge status={item.isActive !== false ? "Active" : "Inactive"} variant={item.isActive !== false ? "success" : "danger"} />,
                },
                {
                  key: "actions", label: "Actions",
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      {actionLoading === item.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                      ) : (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleVerify(item.id, !item.isVerified); }}
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${item.isVerified ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                            {item.isVerified ? "Unverify" : "Verify"}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleActivate(item.id, item.isActive === false); }}
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${item.isActive !== false ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}>
                            {item.isActive !== false ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openModal(item); }} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View</button>
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
              data={filteredDistributors}
            />
          </div>
        </div>
      </main>

      {/* View Modal */}
      {showModal && selectedDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg ${selectedDistributor.isActive === false ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {selectedDistributor.name[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedDistributor.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <StatusBadge status={selectedDistributor.isVerified ? "Verified" : "Pending"} variant={selectedDistributor.isVerified ? "success" : "warning"} />
                    <StatusBadge status={selectedDistributor.isActive !== false ? "Active" : "Inactive"} variant={selectedDistributor.isActive !== false ? "success" : "danger"} />
                  </div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Email</p><p className="font-medium text-slate-800 text-sm">{selectedDistributor.email || "—"}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Phone</p><p className="font-medium text-slate-800 text-sm">{selectedDistributor.phone || "—"}</p></div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">License Number</p><p className="font-medium text-slate-800">{selectedDistributor.licenseNumber || "—"}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">GST Number</p><p className="font-medium text-slate-800">{selectedDistributor.gstNumber || "—"}</p></div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Address</p>
                <p className="font-medium text-slate-800 text-sm">{selectedDistributor.address || "—"}{selectedDistributor.city && `, ${selectedDistributor.city}`}{selectedDistributor.state && `, ${selectedDistributor.state}`}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">Batches</p><p className="font-bold text-emerald-600">{selectedDistributor._count?.batches || 0}</p></div>
                <div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">Registered</p><p className="font-medium text-slate-800 text-xs">{new Date(selectedDistributor.createdAt).toLocaleDateString()}</p></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { handleVerify(selectedDistributor.id, !selectedDistributor.isVerified); setShowModal(false); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium ${selectedDistributor.isVerified ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                {selectedDistributor.isVerified ? "Unverify" : "Verify"}
              </button>
              <button onClick={() => { handleActivate(selectedDistributor.id, selectedDistributor.isActive === false); setShowModal(false); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium ${selectedDistributor.isActive !== false ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                {selectedDistributor.isActive !== false ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Add New Distributor</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {createError && (<div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3"><p className="text-sm text-red-600">{createError}</p></div>)}

            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="Distribution Corp" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="contact@dist.com" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="+91 9876543210" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">License Number *</label>
                  <input type="text" value={createForm.licenseNumber} onChange={(e) => setCreateForm({ ...createForm, licenseNumber: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="DIST-12345" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                  <input type="text" value={createForm.gstNumber} onChange={(e) => setCreateForm({ ...createForm, gstNumber: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="27AABCU9603R1ZM" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                <input type="text" value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="456 Warehouse District" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input type="text" value={createForm.city} onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="Delhi" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input type="text" value={createForm.state} onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="Delhi" /></div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateDistributor} disabled={creating} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                {creating ? "Creating..." : "Create Distributor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

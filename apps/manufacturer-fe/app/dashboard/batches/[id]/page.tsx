"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "../../../../components/sidebar";
import { StatusBadge } from "../../../../components/data-table";
import { DashboardHeader } from "../../../../components/DashboardHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Medicine {
  name: string;
  strength: string;
  composition?: string;
  dosageForm?: string;
  genericName?: string;
  mrp?: number;
  imageUrl?: string;
}

interface QRCode {
  id: string;
  code: string;
  unitNumber?: number;
  isActive: boolean;
  createdAt: string;
  _count?: { scanLogs: number };
}

interface AuditTrail {
  id: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByRole?: string;
  createdAt: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  batchHash: string;
  status: string;
  lifecycleStatus: string;
  quantity: number;
  remainingQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  gstNumber?: string;
  warehouseLocation?: string;
  warehouseAddress?: string;
  imageUrl?: string;
  blockchainTxHash?: string;
  blockchainPda?: string;
  createdAt: string;
  updatedAt: string;
  medicine: Medicine;
  _count?: { qrCodes: number; scanLogs: number };
}

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "qrcodes" | "history">("details");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      router.push("/login");
      return;
    }

    if (!batchId) return;

    const headers = { Authorization: `Bearer ${token}` };

    // OPTIMIZATION: Fetch all data in parallel for faster loading
    Promise.all([
      fetch(`${API_BASE}/api/batch/by-id/${batchId}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/qr-code?batchId=${batchId}&limit=50`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/audit-trail?entityType=BATCH&entityId=${batchId}&limit=20`, { headers }).then(r => r.json()),
    ])
      .then(([batchData, qrData, auditData]) => {
        if (!batchData.success) {
          setError(batchData.error || "Batch not found");
        } else {
          setBatch(batchData.data);
        }
        if (qrData.success) setQrCodes(qrData.data || []);
        if (auditData.success) setAuditTrail(auditData.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch batch data:", err);
        setError("Failed to load batch data");
      })
      .finally(() => setIsLoading(false));
  }, [router, batchId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getStatusVariant = (status: string): "active" | "pending" | "shipped" | "delivered" | "expired" | "recalled" => {
    const map: Record<string, "active" | "pending" | "shipped" | "delivered" | "expired" | "recalled"> = {
      VALID: "active", RECALLED: "recalled", EXPIRED: "expired", IN_PRODUCTION: "pending",
      IN_WAREHOUSE: "active", IN_TRANSIT: "shipped", AT_DISTRIBUTOR: "shipped", AT_PHARMACY: "delivered", SOLD: "delivered",
    };
    return map[status] || "pending";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Batch Not Found</h2>
          <p className="mt-1 text-sm text-slate-500">{error || "The batch doesn't exist."}</p>
          <button onClick={() => router.push("/dashboard/batches")} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} onLogout={handleLogout} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="min-h-screen transition-all duration-200" style={{ marginLeft: isCollapsed ? 72 : 260 }}>
        <DashboardHeader
          title={`Batch ${batch.batchNumber}`}
          subtitle={`${batch.medicine.name} ${batch.medicine.strength}`}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => router.push("/dashboard/batches")} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button onClick={() => router.push("/dashboard/qr-codes")} className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Generate QR
              </button>
            </div>
          }
        />

        <div className="p-5">
          {/* Status Cards */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Batch Status</p>
              <div className="mt-1"><StatusBadge status={getStatusVariant(batch.status)} /></div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Lifecycle</p>
              <div className="mt-1"><StatusBadge status={getStatusVariant(batch.lifecycleStatus)} /></div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Units</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{batch.remainingQuantity.toLocaleString()}/{batch.quantity.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">QR Codes</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{batch._count?.qrCodes || qrCodes.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1">
            {[{ key: "details", label: "Details" }, { key: "qrcodes", label: `QR Codes (${qrCodes.length})` }, { key: "history", label: "History" }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-5">
                {/* Medicine Info */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">Medicine Information</h3>
                  <div className="flex gap-5">
                    {(batch.imageUrl || batch.medicine.imageUrl) && (
                      <div className="shrink-0">
                        <img src={batch.imageUrl || batch.medicine.imageUrl} alt={batch.medicine.name} className="h-24 w-24 rounded-lg object-cover border border-slate-200" />
                      </div>
                    )}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div><p className="text-xs text-slate-500">Name</p><p className="mt-0.5 text-sm font-medium text-slate-900">{batch.medicine.name}</p></div>
                      <div><p className="text-xs text-slate-500">Strength</p><p className="mt-0.5 text-sm text-slate-700">{batch.medicine.strength}</p></div>
                      {batch.medicine.genericName && <div><p className="text-xs text-slate-500">Generic Name</p><p className="mt-0.5 text-sm text-slate-700">{batch.medicine.genericName}</p></div>}
                      {batch.medicine.dosageForm && <div><p className="text-xs text-slate-500">Dosage Form</p><p className="mt-0.5 text-sm text-slate-700">{batch.medicine.dosageForm}</p></div>}
                      {batch.medicine.composition && <div className="col-span-2"><p className="text-xs text-slate-500">Composition</p><p className="mt-0.5 text-sm text-slate-700">{batch.medicine.composition}</p></div>}
                    </div>
                  </div>
                </div>

                {/* Batch Info */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">Batch Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-500">Batch Number</p><p className="mt-0.5 text-sm font-medium text-emerald-700">{batch.batchNumber}</p></div>
                    <div><p className="text-xs text-slate-500">Quantity</p><p className="mt-0.5 text-sm text-slate-700">{batch.quantity.toLocaleString()} units</p></div>
                    <div><p className="text-xs text-slate-500">Manufacturing Date</p><p className="mt-0.5 text-sm text-slate-700">{formatDate(batch.manufacturingDate)}</p></div>
                    <div><p className="text-xs text-slate-500">Expiry Date</p><p className="mt-0.5 text-sm text-slate-700">{formatDate(batch.expiryDate)}</p></div>
                    {batch.invoiceNumber && <div><p className="text-xs text-slate-500">Invoice Number</p><p className="mt-0.5 text-sm text-slate-700">{batch.invoiceNumber}</p></div>}
                    {batch.invoiceDate && <div><p className="text-xs text-slate-500">Invoice Date</p><p className="mt-0.5 text-sm text-slate-700">{formatDate(batch.invoiceDate)}</p></div>}
                    {batch.gstNumber && <div><p className="text-xs text-slate-500">GST Number</p><p className="mt-0.5 text-sm text-slate-700">{batch.gstNumber}</p></div>}
                  </div>
                </div>

                {/* Warehouse Info */}
                {(batch.warehouseLocation || batch.warehouseAddress) && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">Warehouse Location</h3>
                    {batch.warehouseLocation && <p className="text-sm font-medium text-slate-800">{batch.warehouseLocation}</p>}
                    {batch.warehouseAddress && <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{batch.warehouseAddress}</p>}
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-5">
                {/* Blockchain Info */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Blockchain
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Batch Hash</p>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{batch.batchHash}</code>
                        <button onClick={() => copyToClipboard(batch.batchHash)} className="text-slate-400 hover:text-slate-600" title="Copy">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </div>
                    {batch.blockchainTxHash && (
                      <div>
                        <p className="text-xs text-slate-500">Transaction Hash</p>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{batch.blockchainTxHash}</code>
                          <button onClick={() => copyToClipboard(batch.blockchainTxHash!)} className="text-slate-400 hover:text-slate-600" title="Copy">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {batch.blockchainPda && (
                      <div>
                        <p className="text-xs text-slate-500">PDA Address</p>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{batch.blockchainPda}</code>
                          <button onClick={() => copyToClipboard(batch.blockchainPda!)} className="text-slate-400 hover:text-slate-600" title="Copy">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">Timestamps</h3>
                  <div className="space-y-3">
                    <div><p className="text-xs text-slate-500">Created</p><p className="mt-0.5 text-sm text-slate-700">{formatDateTime(batch.createdAt)}</p></div>
                    <div><p className="text-xs text-slate-500">Last Updated</p><p className="mt-0.5 text-sm text-slate-700">{formatDateTime(batch.updatedAt)}</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Codes Tab */}
          {activeTab === "qrcodes" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              {qrCodes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">QR Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Unit #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Scans</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {qrCodes.map((qr) => (
                        <tr key={qr.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{qr.code.slice(0, 20)}...</code></td>
                          <td className="px-4 py-3 text-sm text-slate-600">{qr.unitNumber || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${qr.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {qr.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">{formatDate(qr.createdAt)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{qr._count?.scanLogs || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-500">No QR codes generated yet</p>
                  <button onClick={() => router.push("/dashboard/qr-codes")} className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700">Generate QR Codes →</button>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              {auditTrail.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {auditTrail.map((audit) => (
                    <div key={audit.id} className="flex items-start gap-4 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{audit.action.replace(/_/g, " ")}</p>
                          {audit.performedByRole && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{audit.performedByRole}</span>}
                        </div>
                        {audit.fieldName && (
                          <p className="mt-1 text-xs text-slate-600">
                            <span className="font-medium">{audit.fieldName}:</span>{" "}
                            {audit.oldValue && <span className="text-red-600 line-through">{audit.oldValue}</span>}
                            {audit.oldValue && audit.newValue && " → "}
                            {audit.newValue && <span className="text-green-600">{audit.newValue}</span>}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">{formatDateTime(audit.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-500">No history available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

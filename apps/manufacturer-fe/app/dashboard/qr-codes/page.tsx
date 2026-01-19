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
  medicine: { name: string };
  quantity: number;
  _count?: { qrCodes: number };
}

export default function QRCodesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [qrQuantity, setQrQuantity] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [selectedQR, setSelectedQR] = useState<any | null>(null);

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
      const res = await fetch(`${apiUrl}/api/batch?limit=100`, {
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

  const generateQRCodes = async () => {
    if (!selectedBatch || qrQuantity <= 0) return;

    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/qr-code/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: selectedBatch,
          quantity: qrQuantity,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedCodes(data.data.qrCodes || []);
        // Refresh batch list to update counts
        fetchBatches(token!);
      } else {
        alert(data.error || "Failed to generate QR codes");
      }
    } catch (error: any) {
      alert(error.message || "Failed to generate QR codes");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCodes = () => {
    // Create a simple text file with QR code data for demo
    const content = generatedCodes.map((qr) => qr.code || qr.id).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-codes-${selectedBatch}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
              <h1 className="text-lg font-semibold text-slate-900">QR Codes</h1>
              <p className="text-xs text-slate-500">Generate and manage QR codes for batches</p>
            </div>
          </div>
        </header>

        <div className="p-5">
          {/* Generate QR Section */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Generate QR Codes</h2>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Select Batch
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select a batch...</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchNumber} - {batch.medicine?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Quantity
                </label>
                <input
                  type="number"
                  value={qrQuantity}
                  onChange={(e) => setQrQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={generateQRCodes}
                  disabled={!selectedBatch || qrQuantity <= 0 || isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated QR Codes */}
          {generatedCodes.length > 0 && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Generated QR Codes ({generatedCodes.length})
                </h2>
                <button
                  onClick={downloadQRCodes}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {generatedCodes.slice(0, 12).map((qr, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedQR(qr)}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white p-2 transition-all hover:border-emerald-300 hover:shadow-md"
                  >
                    {/* Real QR Code using QR Server API */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr.code || qr.id)}`}
                      alt={`QR Code ${index + 1}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                    {/* Code label on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-[10px] font-medium text-white">
                        {(qr.code || qr.id).slice(0, 16)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {generatedCodes.length > 12 && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  +{generatedCodes.length - 12} more codes generated (click to view full size)
                </p>
              )}
            </div>
          )}

          {/* Batches with QR Stats */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Batches Overview</h2>
            </div>
            <DataTable
              columns={[
                {
                  key: "batchNumber",
                  label: "Batch",
                  render: (item) => (
                    <span className="font-semibold text-emerald-700">{item.batchNumber}</span>
                  ),
                },
                {
                  key: "medicine",
                  label: "Medicine",
                  render: (item) => <span className="text-slate-800">{item.medicine?.name}</span>,
                },
                {
                  key: "quantity",
                  label: "Units",
                  render: (item) => (
                    <span className="text-slate-600">{item.quantity?.toLocaleString()}</span>
                  ),
                },
                {
                  key: "qrCodes",
                  label: "QR Codes",
                  render: (item) => (
                    <span className="font-medium text-blue-600">
                      {item._count?.qrCodes || 0}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  label: "",
                  render: (item) => (
                    <button
                      onClick={() => {
                        setSelectedBatch(item.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Generate →
                    </button>
                  ),
                },
              ]}
              data={batches}
            />
          </div>
        </div>
      </main>

      {/* QR Code Detail Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQR(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="mb-4 text-lg font-semibold text-slate-900">QR Code Details</h3>

            {/* Large QR Code Image with Loading */}
            <div className="mb-4 flex items-center justify-center rounded-lg border border-slate-200 bg-white p-4" style={{ minHeight: '280px' }}>
              <div className="relative h-64 w-64">
                {/* Loading spinner behind image */}
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-50">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                </div>
                {/* QR Image - fades in when loaded */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedQR.code || selectedQR.id)}`}
                  alt="QR Code"
                  className="relative z-10 h-64 w-64 rounded bg-white"
                  onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                  style={{ opacity: 0, transition: 'opacity 0.25s ease-in' }}
                />
              </div>
            </div>

            {/* QR Code Info */}
            <div className="mb-4 space-y-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Code</p>
                <p className="break-all font-mono text-sm text-slate-900">{selectedQR.code || selectedQR.id}</p>
              </div>
              {selectedQR.unitNumber && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Unit Number</p>
                  <p className="text-sm text-slate-900">{selectedQR.unitNumber}</p>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Status</p>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  selectedQR.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>
                  {selectedQR.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedQR.code || selectedQR.id);
                  alert("Code copied to clipboard!");
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </button>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selectedQR.code || selectedQR.id)}`}
                download={`qr-${(selectedQR.code || selectedQR.id).slice(0, 12)}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

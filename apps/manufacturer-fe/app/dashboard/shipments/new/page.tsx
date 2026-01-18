"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../../components/sidebar";
import { FiArrowLeft, FiTruck, FiPackage, FiUsers, FiCalendar, FiHash, FiMapPin } from "react-icons/fi";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  remainingQuantity: number;
  medicine: { name: string; strength: string };
  manufacturer: { name: string };
}

interface Distributor {
  id: string;
  name: string;
  address: string;
  city: string | null;
  isVerified: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function NewShipmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);

  const [formData, setFormData] = useState({
    batchId: "",
    distributorId: "",
    quantity: "",
    carrier: "",
    trackingNumber: "",
    estimatedDelivery: "",
    pickupAddress: "",
    notes: "",
  });

  const selectedBatch = batches.find((b) => b.id === formData.batchId);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch batches with remaining quantity
      const batchResponse = await fetch(`${API_BASE}/api/batch-search?lifecycleStatus=IN_PRODUCTION`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (batchResponse.ok) {
        const data = await batchResponse.json();
        setBatches(data.data?.filter((b: Batch) => b.remainingQuantity > 0) || []);
      }

      // Fetch distributors
      const distributorResponse = await fetch(`${API_BASE}/api/distributor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (distributorResponse.ok) {
        const data = await distributorResponse.json();
        setDistributors(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
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
      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      fetchData();
    }
  }, [isLoading, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!formData.batchId || !formData.distributorId || !formData.quantity) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (selectedBatch && parseInt(formData.quantity) > selectedBatch.remainingQuantity) {
        setError(`Quantity exceeds available stock (${selectedBatch.remainingQuantity})`);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: formData.batchId,
          distributorId: formData.distributorId,
          quantity: parseInt(formData.quantity),
          carrier: formData.carrier || undefined,
          trackingNumber: formData.trackingNumber || undefined,
          estimatedDelivery: formData.estimatedDelivery || undefined,
          pickupAddress: formData.pickupAddress || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard/shipments");
      } else {
        setError(data.error || "Failed to create shipment");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex items-center gap-4 px-5 py-3">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Create Shipment</h1>
              <p className="text-xs text-slate-500">Ship batch to distributor</p>
            </div>
          </div>
        </header>

        <div className="p-5">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              {/* Batch Selection */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FiPackage className="h-4 w-4 text-emerald-600" />
                  Select Batch
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Batch *
                    </label>
                    <select
                      value={formData.batchId}
                      onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    >
                      <option value="">Select a batch...</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.batchNumber} - {batch.medicine.name} {batch.medicine.strength} ({batch.remainingQuantity} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBatch && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Selected Batch Details</p>
                      <p className="font-medium text-slate-800">
                        {selectedBatch.medicine.name} {selectedBatch.medicine.strength}
                      </p>
                      <p className="text-xs text-slate-500">
                        Available: {selectedBatch.remainingQuantity.toLocaleString()} units
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Quantity to Ship *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      min="1"
                      max={selectedBatch?.remainingQuantity || undefined}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Distributor Selection */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FiUsers className="h-4 w-4 text-emerald-600" />
                  Select Distributor
                </h3>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Distributor *
                  </label>
                  <select
                    value={formData.distributorId}
                    onChange={(e) => setFormData({ ...formData, distributorId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  >
                    <option value="">Select a distributor...</option>
                    {distributors.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.name} {dist.city ? `- ${dist.city}` : ""} {dist.isVerified ? "✓" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FiTruck className="h-4 w-4 text-emerald-600" />
                  Shipping Details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      <FiTruck className="mr-1 inline h-3 w-3" />
                      Carrier
                    </label>
                    <input
                      type="text"
                      value={formData.carrier}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      placeholder="e.g., BlueDart, FedEx"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      <FiHash className="mr-1 inline h-3 w-3" />
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      placeholder="Enter tracking number"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      <FiCalendar className="mr-1 inline h-3 w-3" />
                      Estimated Delivery
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedDelivery}
                      onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      <FiMapPin className="mr-1 inline h-3 w-3" />
                      Pickup Address
                    </label>
                    <input
                      type="text"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      placeholder="Warehouse address"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes for this shipment..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

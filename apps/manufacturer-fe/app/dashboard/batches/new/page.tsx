"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Sidebar } from "../../../../components/sidebar";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Medicine {
  id: string;
  name: string;
  strength: string;
  genericName: string;
}

export default function NewBatchPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    batchNumber: "",
    medicineId: "",
    quantity: "",
    manufacturingDate: "",
    expiryDate: "",
    invoiceNumber: "",
    invoiceDate: "",
    gstNumber: "",
    warehouseLocation: "",
    warehouseAddress: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      fetchMedicines(token);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchMedicines = async (token: string) => {
    try {
      const res = await fetch("/api/medicine?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMedicines(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, create a preview URL (in production, you'd upload to cloud storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // In production, upload to Cloudinary/S3 and get URL
        // For demo, we'll use a placeholder
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.batchNumber) newErrors.batchNumber = "Batch number is required";
    if (!formData.medicineId) newErrors.medicineId = "Please select a medicine";
    if (!formData.quantity || parseInt(formData.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (!formData.manufacturingDate) newErrors.manufacturingDate = "Manufacturing date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";

    if (formData.manufacturingDate && formData.expiryDate) {
      if (new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)) {
        newErrors.expiryDate = "Expiry date must be after manufacturing date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateBatchHash = (data: typeof formData) => {
    // Simple hash generation for demo - in production use proper hashing
    const str = `${data.batchNumber}-${data.medicineId}-${data.manufacturingDate}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, "0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;

      const batchHash = generateBatchHash(formData);

      const res = await fetch("/api/batch/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchHash,
          batchNumber: formData.batchNumber,
          manufacturingDate: formData.manufacturingDate,
          expiryDate: formData.expiryDate,
          manufacturerId: userData?.manufacturerId || userData?.id,
          medicineId: formData.medicineId,
          quantity: parseInt(formData.quantity),
          invoiceNumber: formData.invoiceNumber || undefined,
          invoiceDate: formData.invoiceDate || undefined,
          gstNumber: formData.gstNumber || undefined,
          warehouseLocation: formData.warehouseLocation || undefined,
          warehouseAddress: formData.warehouseAddress || undefined,
          // Note: For blockchain registration, you'd need the manufacturer wallet private key
          // This is a simplified version - in production, use secure key management
          manufacturerWalletPrivateKey: "demo-key", // Replace with actual key management
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard/batches");
      } else {
        setErrors({ submit: data.error || "Failed to create batch" });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to create batch" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Create New Batch</h1>
                <p className="text-xs text-slate-500">Register a new medicine batch</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            {errors.submit && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.submit}
              </div>
            )}

            {/* Basic Info */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Basic Information</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Batch Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g., BTH-2026-001"
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.batchNumber ? "border-red-300 bg-red-50" : "border-slate-200"
                    } focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                  {errors.batchNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.batchNumber}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Medicine <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.medicineId}
                    onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.medicineId ? "border-red-300 bg-red-50" : "border-slate-200"
                    } focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                  >
                    <option value="">Select medicine...</option>
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} - {med.strength}
                      </option>
                    ))}
                  </select>
                  {errors.medicineId && (
                    <p className="mt-1 text-xs text-red-500">{errors.medicineId}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/products/new")}
                    className="mt-1 text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    + Add new medicine
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 10000"
                    min="1"
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.quantity ? "border-red-300 bg-red-50" : "border-slate-200"
                    } focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="e.g., 27AAAAA0000A1Z5"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Dates</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Manufacturing Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.manufacturingDate ? "border-red-300 bg-red-50" : "border-slate-200"
                    } focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                  {errors.manufacturingDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.manufacturingDate}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.expiryDate ? "border-red-300 bg-red-50" : "border-slate-200"
                    } focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="e.g., INV-2026-001"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Warehouse */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Warehouse Details</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Warehouse Location
                  </label>
                  <input
                    type="text"
                    value={formData.warehouseLocation}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    placeholder="e.g., Warehouse A"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Warehouse Address
                  </label>
                  <textarea
                    value={formData.warehouseAddress}
                    onChange={(e) => setFormData({ ...formData, warehouseAddress: e.target.value })}
                    placeholder="Full warehouse address..."
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Medicine Image */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Medicine Image (Optional)</h2>
              
              <div className="flex items-start gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-1 text-xs text-slate-500">Upload Image</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="text-xs text-slate-500">
                  <p>Upload a photo of the medicine packaging.</p>
                  <p className="mt-1">Supported: JPG, PNG, WebP (max 5MB)</p>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, imageUrl: "" });
                      }}
                      className="mt-2 text-red-500 hover:text-red-600"
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Batch
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

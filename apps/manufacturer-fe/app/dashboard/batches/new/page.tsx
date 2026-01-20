"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import { getAddressFromPincode, formatAddress, getAllAddressOptionsFromPincode } from "../../../../utils/pincode";
import { LocationMap } from "../../../../components/LocationMap";
import { AddressAutocomplete } from "../../../../components/AddressAutocomplete";
import { MedicineSelect } from "../../../../components/MedicineSelect";
import { uploadImageToR2 } from "../../../../utils/imageUpload";

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
  genericName: string | null;
  dosageForm: string;
  composition?: string;
}

export default function NewBatchPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(true);
  const [medicinesError, setMedicinesError] = useState<string | null>(null);
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
    warehousePincode: "",
    imageUrl: "",
    walletPrivateKey: "",
  });
  
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

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
    console.log("🔵 Starting to fetch medicines...");
    try {
      setMedicinesLoading(true);
      setMedicinesError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      console.log("🔵 API URL:", apiUrl);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error("⏱️ Request timeout!");
        controller.abort();
      }, 10000); // 10 second timeout
      
      const res = await fetch(`${apiUrl}/api/medicine?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log("✅ Fetch completed, status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("📦 Response data:", data);
      
      if (data.success) {
        const medicinesList = Array.isArray(data.data) ? data.data : [];
        console.log(`✅ Loaded ${medicinesList.length} medicines`);
        setMedicines(medicinesList);
        setMedicinesError(null); // Clear any previous errors
      } else {
        console.error("❌ API returned success=false:", data.error);
        setMedicinesError(data.error || "Failed to load medicines");
      }
    } catch (error: any) {
      console.error("❌ Error fetching medicines:", error);
      if (error.name === 'AbortError') {
        setMedicinesError("Request timed out. Please check your connection and try again.");
      } else {
        setMedicinesError("Failed to load medicines. Please check your connection.");
      }
    } finally {
      console.log("🏁 Setting loading to false");
      setMedicinesLoading(false);
    }
  };

  

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudflare R2
    setImageUploading(true);
    setImageUploadError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setImageUploadError("Please login to upload images");
      setImageUploading(false);
      return;
    }

    const result = await uploadImageToR2(file, "batches", token);

    if (result.success && result.url) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: result.url!,
      }));
      setImageUploadError(null);
    } else {
      setImageUploadError(result.error || "Failed to upload image");
      setImagePreview(null);
    }

    setImageUploading(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.batchNumber) newErrors.batchNumber = "Batch number is required";
    if (!formData.medicineId) newErrors.medicineId = "Please select a medicine";
    if (!formData.quantity || parseInt(formData.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (!formData.manufacturingDate) newErrors.manufacturingDate = "Manufacturing date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (!formData.walletPrivateKey) newErrors.walletPrivateKey = "Solana wallet private key is required";

    if (formData.manufacturingDate && formData.expiryDate) {
      if (new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)) {
        newErrors.expiryDate = "Expiry date must be after manufacturing date";
      }
    }

    // Validate wallet private key format (basic check)
    if (formData.walletPrivateKey) {
      if (formData.walletPrivateKey === 'demo-key' || formData.walletPrivateKey === 'test-key') {
        newErrors.walletPrivateKey = "Please use a valid Solana wallet private key. Demo keys are not supported.";
      } else if (formData.walletPrivateKey.length < 32) {
        newErrors.walletPrivateKey = "Invalid private key format. Please enter a valid base58-encoded Solana private key.";
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/batch/register`, {
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
          imageUrl: formData.imageUrl || undefined,
          manufacturerWalletPrivateKey: formData.walletPrivateKey,
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
    <>

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
                  {medicinesLoading ? (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                      <span>Loading medicines...</span>
                    </div>
                  ) : medicinesError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <p>{medicinesError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          if (token) fetchMedicines(token);
                        }}
                        className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : medicines.length === 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      <p>No medicines available. Please add a medicine first.</p>
                    </div>
                  ) : (
                    <MedicineSelect
                      medicines={medicines}
                      value={formData.medicineId}
                      onChange={(medicineId) => setFormData({ ...formData, medicineId })}
                      error={errors.medicineId}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/products/new")}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add new medicine
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

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Pin Code <span className="text-emerald-600">(Auto-fill address)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.warehousePincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setFormData({ ...formData, warehousePincode: value });
                        setPincodeError(null);
                      }}
                      onBlur={async () => {
                        if (formData.warehousePincode.length === 6) {
                          setPincodeLoading(true);
                          setPincodeError(null);
                          const result = await getAddressFromPincode(formData.warehousePincode);
                          setPincodeLoading(false);
                          
                          if (result.success && result.data) {
                            const address = formatAddress(result.data, formData.warehouseLocation);
                            setFormData({
                              ...formData,
                              warehouseAddress: address,
                            });
                          } else {
                            setPincodeError(result.error || 'Failed to fetch address');
                          }
                        }
                      }}
                      placeholder="Enter 6-digit pin code"
                      maxLength={6}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {pincodeLoading && (
                      <div className="flex items-center px-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                      </div>
                    )}
                  </div>
                  {pincodeError && (
                    <p className="mt-1 text-xs text-red-500">{pincodeError}</p>
                  )}
                  {formData.warehousePincode.length > 0 && formData.warehousePincode.length < 6 && (
                    <p className="mt-1 text-xs text-slate-500">Enter 6-digit pin code</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Warehouse Address
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.warehouseAddress}
                      onChange={(e) => setFormData({ ...formData, warehouseAddress: e.target.value })}
                      placeholder="Full warehouse address... (or enter pin code above to auto-fill)"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {/* Address Autocomplete Dropdown */}
                    {formData.warehousePincode && formData.warehousePincode.length === 6 && (
                      <AddressAutocomplete
                        pincode={formData.warehousePincode}
                        warehouseLocation={formData.warehouseLocation}
                        onSelect={(address) => {
                          setFormData({ ...formData, warehouseAddress: address });
                        }}
                        className="mt-1"
                      />
                    )}
                  </div>
                  {formData.warehouseAddress && formData.warehousePincode && (
                    <p className="mt-1 text-xs text-emerald-600">
                      ✓ Address auto-filled from pin code {formData.warehousePincode}
                    </p>
                  )}
                </div>

                {/* Map Preview */}
                {formData.warehousePincode && formData.warehousePincode.length === 6 && formData.warehouseAddress && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Location Map
                    </label>
                    <LocationMap
                      address={formData.warehouseAddress}
                      pincode={formData.warehousePincode}
                      height={250}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Map showing approximate location for pin code {formData.warehousePincode}
                    </p>
                  </div>
                )}
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
                  {imageUploading && (
                    <div className="mt-2 flex items-center gap-2 text-emerald-600">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                      <span>Uploading to Cloudflare R2...</span>
                    </div>
                  )}
                  {imageUploadError && (
                    <p className="mt-2 text-red-500">{imageUploadError}</p>
                  )}
                  {imagePreview && formData.imageUrl && !imageUploading && (
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-emerald-600 text-xs">✓ Image uploaded successfully</p>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, imageUrl: "" });
                          setImageUploadError(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-600 underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Blockchain Wallet */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Blockchain Wallet</h2>
              <p className="mb-4 text-xs text-slate-600">
                Enter your Solana wallet private key (base58-encoded) to register this batch on the blockchain.
                This key is required for blockchain transactions and will not be stored.
              </p>
              
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Solana Wallet Private Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.walletPrivateKey}
                  onChange={(e) => setFormData({ ...formData, walletPrivateKey: e.target.value })}
                  placeholder="Enter your base58-encoded Solana private key"
                  className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${
                    errors.walletPrivateKey ? "border-red-300 bg-red-50" : "border-slate-200"
                  } focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                />
                {errors.walletPrivateKey && (
                  <p className="mt-1 text-xs text-red-500">{errors.walletPrivateKey}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  ⚠️ Security: Your private key is never stored. It's only used for this transaction and cleared after submission.
                </p>
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
      </>
  );
}



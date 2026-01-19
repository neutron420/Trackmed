"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface MedicineDetails {
  batch: {
    id: string;
    batchNumber: string;
    manufacturingDate: string;
    expiryDate: string;
    quantity: number;
    status: string;
    lifecycleStatus: string;
    warehouseLocation?: string;
    imageUrl?: string;
    gstNumber?: string;
  };
  medicine: {
    name: string;
    strength: string;
    dosageForm?: string;
    manufacturer?: string;
    description?: string;
    imageUrl?: string;
  };
  manufacturer: {
    name: string;
    licenseNumber?: string;
    address?: string;
  };
  qrCode: {
    code: string;
    isActive: boolean;
    scannedCount: number;
    createdAt: string;
  };
  isVerified: boolean;
  verificationMessage: string;
}

export default function VerifyPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<MedicineDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      verifyQRCode(code);
    }
  }, [code]);

  const verifyQRCode = async (qrCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/qr-code/verify/${encodeURIComponent(qrCode)}`);
      const data = await res.json();
      
      if (data.success) {
        setDetails(data.data);
      } else {
        setError(data.error || "Unable to verify this QR code");
      }
    } catch (err) {
      setError("Failed to connect to verification server");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm text-slate-600">Verifying medicine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-center text-xl font-bold text-red-700">Verification Failed</h1>
          <p className="mb-6 text-center text-sm text-slate-600">{error}</p>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-xs text-red-700">
              <strong>Warning:</strong> This medicine could not be verified. Do not consume unverified medicines. 
              Please contact the manufacturer or report this product.
            </p>
          </div>
          <Link 
            href="/"
            className="mt-6 block w-full rounded-lg bg-slate-800 py-3 text-center text-sm font-medium text-white hover:bg-slate-900"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const isExpired = new Date(details.batch.expiryDate) < new Date();
  const isRecalled = details.batch.status === "RECALLED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 p-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-center gap-2 pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">TrackMed Verify</h1>
        </div>

        {/* Verification Status Card */}
        <div className={`mb-4 rounded-2xl p-6 shadow-lg ${
          isRecalled ? "bg-red-600" : isExpired ? "bg-amber-500" : details.isVerified ? "bg-emerald-600" : "bg-slate-600"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
              isRecalled ? "bg-red-500" : isExpired ? "bg-amber-400" : details.isVerified ? "bg-emerald-500" : "bg-slate-500"
            }`}>
              {isRecalled ? (
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : isExpired ? (
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : details.isVerified ? (
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1 text-white">
              <h2 className="text-lg font-bold">
                {isRecalled ? "RECALLED PRODUCT" : isExpired ? "EXPIRED" : details.isVerified ? "VERIFIED" : "UNVERIFIED"}
              </h2>
              <p className="text-sm opacity-90">
                {isRecalled 
                  ? "Do not use this product!" 
                  : isExpired 
                  ? "This medicine has expired"
                  : details.verificationMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Warning for recalled/expired */}
        {(isRecalled || isExpired) && (
          <div className={`mb-4 rounded-xl p-4 ${isRecalled ? "bg-red-100" : "bg-amber-100"}`}>
            <p className={`text-sm font-medium ${isRecalled ? "text-red-800" : "text-amber-800"}`}>
              {isRecalled 
                ? "⚠️ This product has been recalled by the manufacturer. Please do not consume and return to the pharmacy."
                : "⚠️ This medicine has passed its expiry date. Do not use expired medicines."}
            </p>
          </div>
        )}

        {/* Medicine Details Card */}
        <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Medicine Image */}
          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
            {details.medicine.imageUrl || details.batch.imageUrl ? (
              <img
                src={details.medicine.imageUrl || details.batch.imageUrl}
                alt={details.medicine.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <svg className="h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <p className="mt-2 text-sm text-slate-400">Medicine Image</p>
              </div>
            )}
          </div>

          {/* Medicine Info */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-slate-900">{details.medicine.name}</h3>
            <p className="text-sm text-slate-500">{details.medicine.strength} {details.medicine.dosageForm}</p>
            
            {details.medicine.description && (
              <p className="mt-3 text-sm text-slate-600">{details.medicine.description}</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Batch Number</p>
                <p className="font-semibold text-emerald-700">{details.batch.batchNumber}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Status</p>
                <p className={`font-semibold ${
                  details.batch.lifecycleStatus === "SOLD" ? "text-blue-600" :
                  details.batch.lifecycleStatus === "AT_PHARMACY" ? "text-purple-600" :
                  details.batch.lifecycleStatus === "AT_DISTRIBUTOR" ? "text-indigo-600" :
                  details.batch.lifecycleStatus === "IN_TRANSIT" ? "text-amber-600" :
                  "text-emerald-600"
                }`}>
                  {details.batch.lifecycleStatus?.replace(/_/g, " ") || "In Production"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Manufacturing Date</p>
                <p className="font-medium text-slate-800">
                  {new Date(details.batch.manufacturingDate).toLocaleDateString()}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${isExpired ? "bg-red-50" : "bg-slate-50"}`}>
                <p className="text-xs text-slate-500">Expiry Date</p>
                <p className={`font-medium ${isExpired ? "text-red-600" : "text-slate-800"}`}>
                  {new Date(details.batch.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturer Info */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-lg">
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Manufacturer</h4>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{details.manufacturer.name}</p>
              {details.manufacturer.licenseNumber && (
                <p className="text-xs text-slate-500">License: {details.manufacturer.licenseNumber}</p>
              )}
            </div>
          </div>
          {details.manufacturer.address && (
            <p className="mt-3 text-xs text-slate-500">{details.manufacturer.address}</p>
          )}
        </div>

        {/* Scan Info */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-lg">
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Scan Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">QR Code</span>
              <span className="font-mono text-xs text-slate-700">{details.qrCode.code.slice(0, 20)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scanned</span>
              <span className="text-slate-700">{details.qrCode.scannedCount} times</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Generated On</span>
              <span className="text-slate-700">{new Date(details.qrCode.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <p className="text-xs text-slate-500">
            Verified by TrackMed • Powered by Blockchain
          </p>
          <Link href="/" className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:text-emerald-700">
            Learn more about TrackMed →
          </Link>
        </div>
      </div>
    </div>
  );
}

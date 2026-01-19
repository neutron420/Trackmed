"use client";

import { useState, useEffect, useRef } from "react";
import { getAllAddressOptionsFromPincode, PincodeAddressOption } from "../utils/pincode";

interface AddressAutocompleteProps {
  pincode: string;
  warehouseLocation?: string;
  onSelect: (address: string) => void;
  className?: string;
}

export function AddressAutocomplete({
  pincode,
  warehouseLocation,
  onSelect,
  className = "",
}: AddressAutocompleteProps) {
  const [options, setOptions] = useState<PincodeAddressOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pincode.length === 6) {
      fetchAddressOptions();
    } else {
      setOptions([]);
      setIsOpen(false);
    }
  }, [pincode]);

  const fetchAddressOptions = async () => {
    setLoading(true);
    setError(null);
    const result = await getAllAddressOptionsFromPincode(pincode);
    setLoading(false);

    if (result.success && result.data) {
      setOptions(result.data);
      setIsOpen(result.data.length > 0);
    } else {
      setError(result.error || "Failed to fetch addresses");
      setOptions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (option: PincodeAddressOption) => {
    const address = warehouseLocation
      ? `${warehouseLocation}, ${option.fullAddress}`
      : option.fullAddress;
    onSelect(address);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pincode.length !== 6 || options.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {loading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            Loading addresses...
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-red-200 bg-red-50 p-3 shadow-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isOpen && !loading && !error && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2">
            <p className="mb-2 text-xs font-semibold text-slate-500">
              Select Address ({options.length} options):
            </p>
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full rounded-lg border border-slate-100 p-3 text-left text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-colors mb-2 last:mb-0"
              >
                <p className="font-medium text-slate-900">{option.name}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {option.district}, {option.state}
                </p>
                <p className="text-xs text-slate-500 mt-1">{option.fullAddress}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

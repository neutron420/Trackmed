"use client";

import { useState, useEffect, useRef } from "react";

interface Medicine {
  id: string;
  name: string;
  strength: string;
  genericName: string | null;
  dosageForm: string;
  composition?: string;
}

interface MedicineSelectProps {
  medicines: Medicine[];
  value: string;
  onChange: (medicineId: string) => void;
  error?: string;
  className?: string;
}

export function MedicineSelect({
  medicines,
  value,
  onChange,
  error,
  className = "",
}: MedicineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMedicine = medicines.find((m) => m.id === value);

  const filteredMedicines = medicines.filter((med) => {
    const query = searchQuery.toLowerCase();
    return (
      med.name.toLowerCase().includes(query) ||
      med.strength.toLowerCase().includes(query) ||
      med.genericName?.toLowerCase().includes(query) ||
      med.dosageForm.toLowerCase().includes(query)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (medicineId: string) => {
    onChange(medicineId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={`relative cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
          error
            ? "border-red-300 bg-red-50"
            : "border-slate-200 hover:border-emerald-400"
        } ${isOpen ? "border-emerald-500 ring-1 ring-emerald-500" : ""}`}
      >
        {selectedMedicine ? (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-slate-900">
                {selectedMedicine.name}
              </p>
              <p className="text-xs text-slate-600">
                {selectedMedicine.strength} • {selectedMedicine.dosageForm}
                {selectedMedicine.genericName && ` • ${selectedMedicine.genericName}`}
              </p>
            </div>
            <svg
              className={`h-5 w-5 text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Select medicine...</span>
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {/* Search Input */}
          <div className="sticky top-0 border-b border-slate-200 bg-white p-2">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              {filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Medicine List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredMedicines.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                {searchQuery ? "No medicines found" : "No medicines available"}
              </div>
            ) : (
              filteredMedicines.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelect(med.id)}
                  className={`w-full border-b border-slate-100 p-3 text-left transition-colors hover:bg-emerald-50 ${
                    value === med.id ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{med.name}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        <span className="font-medium">{med.strength}</span>
                        {" • "}
                        <span>{med.dosageForm}</span>
                      </p>
                      {med.genericName && (
                        <p className="mt-1 text-xs text-slate-500">
                          Generic: {med.genericName}
                        </p>
                      )}
                      {med.composition && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                          {med.composition}
                        </p>
                      )}
                    </div>
                    {value === med.id && (
                      <svg
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

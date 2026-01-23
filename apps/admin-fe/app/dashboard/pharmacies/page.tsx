"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Pharmacy {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  createdAt: string;
  _count?: {
    shipmentsReceived?: number;
    sales?: number;
  };
}

export default function PharmaciesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [search, setSearch] = useState("");

  const fetchPharmacies = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/pharmacy?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPharmacies(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch pharmacies:", error);
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
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
      fetchPharmacies().finally(() => setIsLoading(false));
    } catch {
      router.push("/login");
    }
  }, [router, fetchPharmacies]);

  // Initialize map when showMapView changes
  useEffect(() => {
    if (
      showMapView &&
      mapContainerRef.current &&
      !mapRef.current &&
      MAPBOX_TOKEN
    ) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [78.9629, 20.5937], // India center
        zoom: 4,
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    return () => {
      if (!showMapView && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMapView]);

  // Update markers when olaResults change
  useEffect(() => {
    if (!mapRef.current || !showMapView) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    olaResults.forEach((place) => {
      if (place.geometry?.location) {
        const { lng, lat } = place.geometry.location;
        hasValidCoords = true;
        bounds.extend([lng, lat]);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <p class="font-semibold text-sm">${place.name}</p>
            <p class="text-xs text-gray-500 mt-1">${place.formatted_address}</p>
          </div>`,
        );

        const marker = new mapboxgl.Marker({ color: "#10b981" })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      }
    });

    if (hasValidCoords && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [olaResults, showMapView]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Search Ola Maps for pharmacies via backend proxy
  const searchOlaPlaces = async () => {
    if (!olaSearch.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSearching(true);
    try {
      const query = encodeURIComponent(olaSearch);
      const response = await fetch(
        `${API_BASE}/api/places/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        setOlaResults(data.data || []);
      } else {
        console.error("Search failed:", data.error);
        setOlaResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setOlaResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to R2
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch(
        `${API_BASE}/api/upload/image?folder=pharmacies`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await res.json();
      if (data.success) {
        return data.data.url;
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    }
    return null;
  };

  // Add pharmacy
  const handleAddPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const res = await fetch(`${API_BASE}/api/pharmacy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        resetForm();
        fetchPharmacies();
      } else {
        alert(data.error || "Failed to add pharmacy");
      }
    } catch (error) {
      console.error("Failed to add pharmacy:", error);
      alert("Failed to add pharmacy");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit pharmacy
  const handleEditPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPharmacy) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let imageUrl = editingPharmacy.imageUrl;
      if (imageFile) {
        imageUrl = (await uploadImage()) || imageUrl;
      }

      const res = await fetch(
        `${API_BASE}/api/pharmacy/${editingPharmacy.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            phone: formData.phone,
            email: formData.email,
            gstNumber: formData.gstNumber,
            imageUrl,
          }),
        },
      );

      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingPharmacy(null);
        resetForm();
        fetchPharmacies();
      } else {
        alert(data.error || "Failed to update pharmacy");
      }
    } catch (error) {
      console.error("Failed to update pharmacy:", error);
      alert("Failed to update pharmacy");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (pharmacy: Pharmacy) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newStatus = pharmacy.isActive === false ? true : false;

    try {
      const res = await fetch(`${API_BASE}/api/pharmacy/${pharmacy.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state immediately for better UX
        setPharmacies((prev) =>
          prev.map((p) =>
            p.id === pharmacy.id ? { ...p, isActive: newStatus } : p,
          ),
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  // Open edit modal
  const openEditModal = (pharmacy: Pharmacy) => {
    setEditingPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name || "",
      licenseNumber: pharmacy.licenseNumber || "",
      address: pharmacy.address || "",
      city: pharmacy.city || "",
      state: pharmacy.state || "",
      phone: pharmacy.phone || "",
      email: pharmacy.email || "",
      gstNumber: pharmacy.gstNumber || "",
    });
    setImagePreview(pharmacy.imageUrl || null);
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (pharmacy: Pharmacy) => {
    setViewingPharmacy(pharmacy);
    setShowViewModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      licenseNumber: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      gstNumber: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  // Add pharmacy from Ola Maps
  const addFromOlaPlace = (place: OlaPlace) => {
    const addressParts = place.formatted_address.split(", ");
    const city =
      addressParts.length > 2 ? addressParts[addressParts.length - 3] : "";
    const state =
      addressParts.length > 1
        ? addressParts[addressParts.length - 2].replace(/\d+/g, "").trim()
        : "";

    setFormData({
      name: place.name,
      licenseNumber: "",
      address: place.formatted_address,
      city: city,
      state: state,
      phone: place.formatted_phone_number || "",
      email: "",
      gstNumber: "",
    });

    setSelectedPlace(place);
    setShowSearchModal(false);
    setShowAddModal(true);
  };

  const filteredPharmacies = pharmacies.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()),
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
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-slate-900">Pharmacies</span>
              </nav>
              <h1 className="text-2xl font-bold text-slate-900">Pharmacies</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search Ola Maps
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Pharmacy
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search pharmacies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => fetchPharmacies()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Total Pharmacies
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {pharmacies.length}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Active
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {pharmacies.filter((p) => p.isActive !== false).length}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
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
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Inactive
                  </p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {pharmacies.filter((p) => p.isActive === false).length}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "Pharmacy",
                  render: (item) => (
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {item.name[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.name}
                        </p>
                        {item.licenseNumber && (
                          <p className="text-xs text-slate-500">
                            License: {item.licenseNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "location",
                  label: "Location",
                  render: (item) => (
                    <div>
                      <p className="text-sm text-slate-700">
                        {item.city || "—"}
                      </p>
                      {item.state && (
                        <p className="text-xs text-slate-500">{item.state}</p>
                      )}
                    </div>
                  ),
                },
                {
                  key: "contact",
                  label: "Contact",
                  render: (item) => (
                    <div>
                      {item.phone && (
                        <p className="text-sm text-slate-700">{item.phone}</p>
                      )}
                      {item.email && (
                        <p className="text-xs text-slate-500">{item.email}</p>
                      )}
                    </div>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (item) => (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(item);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.isActive !== false
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            item.isActive !== false
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-medium ${
                          item.isActive !== false
                            ? "text-emerald-600"
                            : "text-slate-500"
                        }`}
                      >
                        {item.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "actions",
                  label: "",
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(item)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  ),
                },
              ]}
              data={filteredPharmacies}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

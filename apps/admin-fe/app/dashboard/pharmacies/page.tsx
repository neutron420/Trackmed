"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable } from "../../../components/data-table";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { getToken, getUser, clearAuth, isAdmin } from "../../../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

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
  imageUrl?: string;
  gstNumber?: string;
  _count?: {
    shipmentsReceived?: number;
    sales?: number;
  };
}

interface OlaPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export default function PharmaciesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [search, setSearch] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Selection states
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [viewingPharmacy, setViewingPharmacy] = useState<Pharmacy | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<OlaPlace | null>(null);

  // Form handling
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    gstNumber: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map / Ola Search states
  const [showMapView, setShowMapView] = useState(false);
  const [olaSearch, setOlaSearch] = useState("");
  const [olaResults, setOlaResults] = useState<OlaPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Image error state for view modal - use Map to track errors per pharmacy
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Map refs for Add Pharmacy modal
  const addModalMapContainerRef = useRef<HTMLDivElement>(null);
  const addModalMapRef = useRef<mapboxgl.Map | null>(null);
  const addModalMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Helper to validate image URL
  const isValidImageUrl = (url: string | undefined | null): url is string => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const fetchPharmacies = useCallback(async () => {
    const token = getToken();
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
    fetchPharmacies().finally(() => {
      setUser(storedUser);
      setIsLoading(false);
    });
  }, [router, fetchPharmacies]);

  // Initialize map when showMapView changes
  useEffect(() => {
    if (!showMapView || !showSearchModal) {
      // Clean up map when modal or map view is closed
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    // Wait for modal to be fully rendered before initializing map
    const timer = setTimeout(() => {
      if (mapContainerRef.current && !mapRef.current && MAPBOX_TOKEN) {
        // Check if container has dimensions
        const container = mapContainerRef.current;
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn("Map container has no dimensions yet");
          return;
        }

        try {
          mapboxgl.accessToken = MAPBOX_TOKEN;
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [78.9629, 20.5937], // India center
            zoom: 4,
          });

          mapRef.current.addControl(
            new mapboxgl.NavigationControl(),
            "top-right",
          );

          // Resize map after initialization to ensure it renders properly
          mapRef.current.on("load", () => {
            if (mapRef.current) {
              mapRef.current.resize();
            }
          });
        } catch (error) {
          console.error("Failed to initialize map:", error);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMapView, showSearchModal]);

  // Update markers when olaResults change
  useEffect(() => {
    if (!mapRef.current || !showMapView) return;

    // Wait for map to be fully loaded before adding markers
    const updateMarkers = () => {
      if (!mapRef.current) return;

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

          const popup = new mapboxgl.Popup({
            offset: 10,
            closeButton: false,
            closeOnClick: false,
            maxWidth: "200px",
          }).setHTML(
            `<div class="p-2">
              <p class="font-semibold text-xs">${place.name}</p>
              <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">${place.formatted_address}</p>
            </div>`,
          );

          const marker = new mapboxgl.Marker({
            color: "#10b981",
            anchor: "bottom",
          })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(mapRef.current!);

          markersRef.current.push(marker);
        }
      });

      if (hasValidCoords && mapRef.current) {
        mapRef.current.fitBounds(bounds, {
          padding: { top: 20, bottom: 20, left: 20, right: 20 },
          maxZoom: 12,
        });
      }
    };

    if (mapRef.current.loaded()) {
      updateMarkers();
    } else {
      mapRef.current.on("load", updateMarkers);
    }
  }, [olaResults, showMapView]);

  // Initialize map in Add Pharmacy modal when selectedPlace is set
  useEffect(() => {
    if (!showAddModal || !selectedPlace || !MAPBOX_TOKEN) {
      // Clean up map when modal closes or no place selected
      if (addModalMapRef.current) {
        addModalMapRef.current.remove();
        addModalMapRef.current = null;
      }
      if (addModalMarkerRef.current) {
        addModalMarkerRef.current.remove();
        addModalMarkerRef.current = null;
      }
      return;
    }

    // Wait for modal to be fully rendered
    const timer = setTimeout(() => {
      if (
        addModalMapContainerRef.current &&
        !addModalMapRef.current &&
        selectedPlace.geometry?.location
      ) {
        const container = addModalMapContainerRef.current;
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          return;
        }

        try {
          mapboxgl.accessToken = MAPBOX_TOKEN;
          const { lng, lat } = selectedPlace.geometry.location;

          addModalMapRef.current = new mapboxgl.Map({
            container: addModalMapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [lng, lat],
            zoom: 14,
          });

          addModalMapRef.current.addControl(
            new mapboxgl.NavigationControl(),
            "top-right",
          );

          // Add marker for selected place
          const popup = new mapboxgl.Popup({
            offset: 10,
            closeButton: false,
            maxWidth: "200px",
          }).setHTML(
            `<div class="p-2">
              <p class="font-semibold text-xs">${selectedPlace.name}</p>
              <p class="text-xs text-gray-500 mt-0.5">${selectedPlace.formatted_address}</p>
            </div>`,
          );

          addModalMarkerRef.current = new mapboxgl.Marker({
            color: "#10b981",
            anchor: "bottom",
          })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(addModalMapRef.current);

          // Resize map after initialization
          addModalMapRef.current.on("load", () => {
            if (addModalMapRef.current) {
              addModalMapRef.current.resize();
            }
          });
        } catch (error) {
          console.error("Failed to initialize add modal map:", error);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (addModalMapRef.current) {
        addModalMapRef.current.remove();
        addModalMapRef.current = null;
      }
      if (addModalMarkerRef.current) {
        addModalMarkerRef.current.remove();
        addModalMarkerRef.current = null;
      }
    };
  }, [showAddModal, selectedPlace]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // Search Ola Maps for pharmacies via backend proxy
  const searchOlaPlaces = async () => {
    if (!olaSearch.trim()) return;

    const token = getToken();
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
    if (!imageFile) {
      console.log("No image file to upload");
      return null;
    }

    const token = getToken();
    if (!token) {
      console.error("No token found for image upload");
      return null;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      console.log("Uploading image to:", `${API_BASE}/api/upload/image?folder=pharmacies`);
      const res = await fetch(
        `${API_BASE}/api/upload/image?folder=pharmacies`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await res.json();
      console.log("Upload response:", data);
      if (data.success && data.data?.url) {
        console.log("Image uploaded successfully, URL:", data.data.url);
        return data.data.url;
      } else {
        console.error("Upload failed:", data.error || "Unknown error");
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

    const token = getToken();
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
    const token = getToken();
    if (!token) return;

    try {
      let imageUrl = editingPharmacy.imageUrl;
      if (imageFile) {
        console.log("Uploading new image for pharmacy:", editingPharmacy.id);
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log("Image uploaded successfully:", uploadedUrl);
        } else {
          console.error("Image upload failed, keeping existing imageUrl:", imageUrl);
          alert("Failed to upload image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      console.log("Updating pharmacy with imageUrl:", imageUrl);

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
            imageUrl: imageUrl || null, // Explicitly send null if no image
          }),
        },
      );

      const data = await res.json();
      console.log("Update response:", data);
      
      if (data.success) {
        console.log("Pharmacy updated successfully:", data.data);
        setShowEditModal(false);
        setEditingPharmacy(null);
        resetForm();
        fetchPharmacies();
      } else {
        console.error("Update failed:", data.error);
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
    const token = getToken();
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
    console.log("Opening edit modal for pharmacy:", {
      id: pharmacy.id,
      name: pharmacy.name,
      imageUrl: pharmacy.imageUrl,
    });
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
    setImageFile(null); // Reset image file when opening modal
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (pharmacy: Pharmacy) => {
    setViewingPharmacy(pharmacy);
    // Don't reset errors - let images retry if URL is valid
    console.log("Opening view modal for pharmacy:", {
      id: pharmacy.id,
      name: pharmacy.name,
      imageUrl: pharmacy.imageUrl,
      hasImageUrl: !!pharmacy.imageUrl,
    });
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
    setSelectedPlace(null);
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
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                          unoptimized
                          onError={(e) => {
                            // Hide broken image and show placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".placeholder")
                            ) {
                              const placeholder = document.createElement("div");
                              placeholder.className =
                                "placeholder flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold";
                              placeholder.textContent =
                                item.name[0].toUpperCase();
                              parent.appendChild(placeholder);
                            }
                          }}
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

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Search Ola Maps
                </h2>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search pharmacy..."
                  value={olaSearch}
                  onChange={(e) => setOlaSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchOlaPlaces()}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  onClick={searchOlaPlaces}
                  disabled={isSearching || !olaSearch.trim()}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {olaResults.length > 0 ? (
                <div className="space-y-2">
                  {olaResults.map((place) => (
                    <div
                      key={place.place_id}
                      className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-medium text-sm text-slate-900 truncate">
                          {place.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {place.formatted_address}
                        </p>
                      </div>
                      <button
                        onClick={() => addFromOlaPlace(place)}
                        className="shrink-0 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">
                    Search for pharmacies
                  </p>
                </div>
              )}
            </div>

            {showMapView && (
              <div
                className="h-48 border-t border-slate-100 relative bg-slate-100 overflow-hidden"
                style={{ clipPath: "inset(0)" }}
              >
                <div
                  ref={mapContainerRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ overflow: "hidden" }}
                />
                {!MAPBOX_TOKEN && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                    Mapbox token not configured
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-100 p-3 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowMapView(!showMapView);
                  // Resize map after toggle to ensure proper rendering
                  setTimeout(() => {
                    if (mapRef.current) {
                      mapRef.current.resize();
                    }
                  }, 100);
                }}
                className="text-xs font-medium text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                {showMapView ? "Hide Map" : "Show Map"}
              </button>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Pharmacy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl my-4 max-h-[90vh] flex flex-col overflow-hidden">
            <form onSubmit={handleAddPharmacy} className="flex flex-col h-full">
              <div className="border-b border-slate-100 p-4 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-slate-900">
                  Add New Pharmacy
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedPlace(null);
                  }}
                  className="text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {selectedPlace && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex items-start gap-2 shrink-0">
                    <svg
                      className="h-4 w-4 text-blue-600 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs text-blue-800 font-medium">
                        Auto-filled from Ola Maps
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Review and complete missing information.
                      </p>
                    </div>
                  </div>
                )}

                {selectedPlace && (
                  <div className="h-40 border border-slate-200 rounded-lg relative bg-slate-100 overflow-hidden shrink-0">
                    <div
                      ref={addModalMapContainerRef}
                      className="absolute inset-0 w-full h-full"
                      style={{ overflow: "hidden" }}
                    />
                    {!MAPBOX_TOKEN && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                        Mapbox token not configured
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-full">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Pharmacy Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, gstNumber: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Pharmacy Image
                    </label>
                    <div className="flex items-center gap-3">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={48}
                          height={48}
                          className="rounded-lg object-cover border border-slate-200"
                          unoptimized
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="block flex-1 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-3 flex justify-end gap-2 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedPlace(null);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {isSubmitting ? "Adding..." : "Add Pharmacy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl my-4 max-h-[90vh] flex flex-col overflow-hidden">
            <form
              onSubmit={handleEditPharmacy}
              className="flex flex-col h-full"
            >
              <div className="border-b border-slate-100 p-4 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Pharmacy
                </h2>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-full">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Pharmacy Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, gstNumber: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Pharmacy Image
                    </label>
                    <div className="flex items-center gap-3">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={48}
                          height={48}
                          className="rounded-lg object-cover border border-slate-200"
                          unoptimized
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="block flex-1 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-3 flex justify-end gap-2 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {viewingPharmacy.imageUrl && 
                 isValidImageUrl(viewingPharmacy.imageUrl) && 
                 !imageErrors.has(viewingPharmacy.id) ? (
                  <div 
                    className="relative h-16 w-16 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-slate-100"
                    onClick={() => {
                      if (!imageErrors.has(viewingPharmacy.id)) {
                        setShowImageLightbox(true);
                      }
                    }}
                  >
                    {/* Try Next.js Image first, fallback to regular img if it fails */}
                    <Image
                      src={viewingPharmacy.imageUrl}
                      alt={viewingPharmacy.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error("Image load error for pharmacy:", viewingPharmacy.id, viewingPharmacy.imageUrl);
                        // Try fallback with regular img tag
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          // Hide Next.js Image
                          target.style.display = 'none';
                          // Check if fallback img already exists
                          if (!parent.querySelector('img.fallback-img') && viewingPharmacy.imageUrl) {
                            const fallbackImg = document.createElement('img');
                            fallbackImg.src = viewingPharmacy.imageUrl;
                            fallbackImg.alt = viewingPharmacy.name;
                            fallbackImg.className = 'fallback-img absolute inset-0 w-full h-full object-cover';
                            fallbackImg.onerror = () => {
                              // If fallback also fails, mark as error
                              setImageErrors(prev => new Set(prev).add(viewingPharmacy.id));
                              fallbackImg.style.display = 'none';
                            };
                            parent.appendChild(fallbackImg);
                          }
                        }
                      }}
                      onLoad={() => {
                        // Remove from errors if it loads successfully
                        setImageErrors(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(viewingPharmacy.id);
                          return newSet;
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className={`flex h-16 w-16 items-center justify-center rounded-xl font-bold text-lg ${
                    viewingPharmacy.isActive === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {viewingPharmacy.name[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{viewingPharmacy.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        viewingPharmacy.isActive !== false
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          viewingPharmacy.isActive !== false
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />
                      {viewingPharmacy.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium text-slate-800">
                  {viewingPharmacy.city && viewingPharmacy.state 
                    ? `${viewingPharmacy.city}, ${viewingPharmacy.state}`
                    : viewingPharmacy.city || viewingPharmacy.state || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">License Number</p>
                <p className="font-medium text-slate-800">{viewingPharmacy.licenseNumber || "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-800">{viewingPharmacy.email || "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium text-slate-800">{viewingPharmacy.phone || "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Address</p>
                <p className="font-medium text-slate-800">{viewingPharmacy.address || "—"}</p>
              </div>
              {viewingPharmacy.gstNumber && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">GST Number</p>
                  <p className="font-medium text-slate-800">{viewingPharmacy.gstNumber}</p>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Registered On</p>
                <p className="font-medium text-slate-800">{new Date(viewingPharmacy.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  openEditModal(viewingPharmacy);
                  setShowViewModal(false);
                }}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {showImageLightbox && viewingPharmacy?.imageUrl && !imageErrors.has(viewingPharmacy.id) && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowImageLightbox(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-colors z-10"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div 
              className="relative w-full h-full max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Use regular img tag for lightbox to avoid Next.js Image restrictions */}
              <img
                src={viewingPharmacy.imageUrl}
                alt={viewingPharmacy.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("Lightbox image load error:", viewingPharmacy.imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Show error message
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.image-error')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'image-error flex items-center justify-center h-full text-white';
                    errorDiv.textContent = 'Failed to load image';
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

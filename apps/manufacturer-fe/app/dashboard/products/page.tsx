"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { FiPlus, FiSearch, FiPackage, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { Sidebar } from "@/components/sidebar";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  composition: string;
  dosageForm: string;
  mrp: number;
  imageUrl: string | null;
  _count: { batches: number };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ProductsPage() {
  
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [products, setProducts] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/medicine?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
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
      fetchProducts();
    }
  }, [isLoading, fetchProducts]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/medicine/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Network error. Please try again.");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.composition?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-lg font-semibold text-slate-900">Products</h1>
              <p className="text-xs text-slate-500">Manage your medicine catalog</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FiRefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push("/dashboard/products/new")}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <FiPlus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </header>

        <div className="p-5">
          {/* Search */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-video bg-slate-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FiPackage className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-500">{product.genericName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      {product.strength}
                    </span>
                    <span className="text-xs text-slate-500">{product._count?.batches || 0} batches</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{product.dosageForm}</span>
                    <span className="text-sm font-semibold text-slate-900">₹{product.mrp}</span>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiEdit2 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      <FiTrash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <FiPackage className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No products found</p>
              <button
                onClick={() => router.push("/dashboard/products/new")}
                className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Add your first product →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

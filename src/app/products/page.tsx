"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
  is_featured: number;
  created_at: string;
  updated_at?: string;
}

function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(searchInput);
      updateURL("search", searchInput);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryStr = new URLSearchParams({
          search: searchTerm,
          sort: sort,
          category: category,
        }).toString();

        const res = await fetch(`/api/products?${queryStr}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Ürünler yüklenirken hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    fetchProducts();
    checkAuth();
  }, [searchTerm, sort, category]);

  const updateURL = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Ürünler</h1>
          <p className="text-sm text-gray-500 mt-1">
            {category ? `${category} kategorisinde ` : ""}Toplam {products.length} ürün
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          Ana Sayfaya Dön
        </Link>
      </div>

      {/* Filtreleme ve Arama Çubuğu */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4 items-center justify-end">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              updateURL("category", e.target.value);
            }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white text-gray-900"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="Aksesuar">Aksesuar</option>
            <option value="Giyim">Giyim</option>
            <option value="Teknoloji">Teknoloji</option>
            <option value="Kırtasiye">Kırtasiye</option>
            <option value="Yaşam">Yaşam</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              updateURL("sort", e.target.value);
            }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white text-gray-900"
          >
            <option value="">Sıralama Seçin</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
          </select>
        </div>
      </div>

      {/* Ürün Listesi */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400 text-2xl">
            🔍
          </div>
          <p className="text-gray-500">Aradığınız kriterlere uygun ürün bulunamadı.</p>
          <button
            onClick={() => {
              setSearchInput("");
              setSearchTerm("");
              setCategory("");
              setSort("");
              router.push("/products");
            }}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-100">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              </Link>
              <div className="p-4 flex flex-col grow space-y-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{product.category}</span>
                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="text-sm font-bold text-gray-950 hover:text-indigo-600 transition line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-xs text-gray-500 line-clamp-2 grow">{product.description}</p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-sm font-black text-gray-950">{formatPrice(product.price)} TL</span>
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        addToCart(product);
                        alert("Ürün sepete eklendi!");
                      } else {
                        window.location.href = "/login";
                      }
                    }}
                    disabled={product.stock <= 0}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {product.stock > 0 ? "Sepete Ekle" : "Tükendi"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;

"use client";

import React, { useEffect, useState } from "react";
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

function HomePage() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        if (data.success && Array.isArray(data.products)) {
          // Sadece öne çıkan ürünleri filtrele
          const featured = data.products.filter(
            (p: Product) => p.is_featured === 1,
          );
          setFeaturedProducts(featured);
        }
      } catch (err) {
        console.error("Öne çıkan ürünler yüklenirken hata oluştu:", err);
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

    fetchFeaturedProducts();
    checkAuth();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            En İyi Ürünleri Keşfedin
          </h1>
          <p className="text-indigo-100 text-lg mb-6">
            Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat ile alışveriş
            deneyiminizi geliştiriyoruz.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition shadow-sm"
          >
            Tüm Ürünleri Gör
          </Link>
        </div>
      </div>

      {/* Kategori Navigasyonu */}
      <div>
        <h2 className="text-xl font-bold text-gray-950 mb-4">Kategoriler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            href="/products?category=Aksesuar"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">🧢</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">
              Aksesuar
            </h3>
            <p className="text-sm text-gray-500 mt-1">Şık aksesuarlar</p>
          </Link>
          <Link
            href="/products?category=Giyim"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">👕</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">
              Giyim
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Şık ve rahat kıyafetler
            </p>
          </Link>
          <Link
            href="/products?category=Teknoloji"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">🔌</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">
              Teknoloji
            </h3>
            <p className="text-sm text-gray-500 mt-1">Teknoloji ürünleri</p>
          </Link>
          <Link
            href="/products?category=Kırtasiye"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">📒</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">
              Kırtasiye
            </h3>
            <p className="text-sm text-gray-500 mt-1">Kırtasiye ürünleri</p>
          </Link>
          <Link
            href="/products?category=Yaşam"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">☕</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">
              Yaşam
            </h3>
            <p className="text-sm text-gray-500 mt-1">Yaşam ürünleri</p>
          </Link>
        </div>
      </div>

      {/* Öne Çıkan Ürünler - Yeni Grid Yapısı */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            Öne Çıkan Ürünler
          </h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Tümünü Gör →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Yükleniyor...</div>
        ) : featuredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Henüz ürün yok.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="block aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="flex flex-col grow">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-gray-950 mt-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4 line-clamp-2 grow">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-lg font-black text-gray-950">
                      {formatPrice(product.price)} TL
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:bg-gray-200"
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
    </div>
  );
}

export default HomePage;

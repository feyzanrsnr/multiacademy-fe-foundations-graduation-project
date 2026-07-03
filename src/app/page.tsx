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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        if (data.success && Array.isArray(data.products)) {
          // Sadece öne çıkan ürünleri filtrele
          const featured = data.products.filter((p: Product) => p.is_featured === 1);
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

  // Auto-slide effect
  useEffect(() => {
    if (featuredProducts.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % getTotalSlides());
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  const getTotalSlides = () => {
    return Math.ceil(featuredProducts.length / 4);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + getTotalSlides()) % getTotalSlides());
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % getTotalSlides());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            En İyi Ürünleri Keşfedin
          </h1>
          <p className="text-indigo-100 text-lg mb-6">
            Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat ile alışveriş deneyiminizi geliştiriyoruz.
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
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">Aksesuar</h3>
            <p className="text-sm text-gray-500 mt-1">Şık aksesuarlar</p>
          </Link>
          <Link
            href="/products?category=Giyim"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">👕</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">Giyim</h3>
            <p className="text-sm text-gray-500 mt-1">Şık ve rahat kıyafetler</p>
          </Link>
          <Link
            href="/products?category=Teknoloji"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">🔌</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">Teknoloji</h3>
            <p className="text-sm text-gray-500 mt-1">Teknoloji ürünleri</p>
          </Link>
          <Link
            href="/products?category=Kırtasiye"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">📒</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">Kırtasiye</h3>
            <p className="text-sm text-gray-500 mt-1">Kırtasiye ürünleri</p>
          </Link>
          <Link
            href="/products?category=Yaşam"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition group"
          >
            <div className="text-3xl mb-3">☕</div>
            <h3 className="font-bold text-gray-950 group-hover:text-indigo-600 transition">Yaşam</h3>
            <p className="text-sm text-gray-500 mt-1">Yaşam ürünleri</p>
          </Link>
        </div>
      </div>

      {/* Öne Çıkan Ürünler */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Öne Çıkan Ürünler</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
            Tümünü Gör →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Henüz öne çıkan ürün yok.</p>
        ) : (
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {Array.from({ length: getTotalSlides() }).map((_, slideIndex) => {
                  const slideProducts = featuredProducts.slice(slideIndex * 4, (slideIndex + 1) * 4);
                  if (slideProducts.length === 0) return null;

                  return (
                    <div key={slideIndex} className="min-w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                        {slideProducts.map((product) => (
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            {getTotalSlides() > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Dot Indicators */}
            {getTotalSlides() > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: getTotalSlides() }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition ${
                      index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
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
}

function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State tanımlamaları
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // URL güncelleyici
  const updateURL = (paramsObj: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryStr = new URLSearchParams({
          search: searchTerm,
          sort,
          category,
          min: minPrice,
          max: maxPrice,
        }).toString();

        const res = await fetch(`/api/products?${queryStr}`);
        const data = await res.json();
        setProducts(data.success ? data.products : []);
      } catch (err) {
        console.error("Hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, sort, category, minPrice, maxPrice]);

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex justify-between items-end border-b pb-4">
        <h1 className="text-2xl font-bold">Ürünler ({products.length})</h1>
        <Link href="/" className="text-indigo-600 hover:underline">Ana Sayfa</Link>
      </div>

      {/* Filtreleme ve Sıralama Paneli */}
      <div className="bg-white p-6 border rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          placeholder="Ürün Adı.." 
          className="p-2 border rounded-lg"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded-lg">
          <option value="">Tüm Kategoriler</option>
          <option value="Aksesuar">Aksesuar</option>
          <option value="Giyim">Giyim</option>
          <option value="Teknoloji">Teknoloji</option>
        </select>
        
        <div className="flex gap-2">
          <input placeholder="Min TL" className="w-1/2 p-2 border rounded-lg" onChange={(e) => setMinPrice(e.target.value)} />
          <input placeholder="Max TL" className="w-1/2 p-2 border rounded-lg" onChange={(e) => setMaxPrice(e.target.value)} />
        </div>

        <select onChange={(e) => setSort(e.target.value)} value={sort} className="p-2 border rounded-lg">
          <option value="newest">En Yeni</option>
          <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
          <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
          <option value="popular">En Popüler</option>
        </select>
      </div>

      {/* Liste */}
      {loading ? <div className="text-center">Yükleniyor...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="border rounded-2xl p-4 flex flex-col gap-2">
              <img src={p.image_url} alt={p.name} className="h-40 w-full object-cover rounded-xl" />
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-indigo-600 font-bold">{p.price} TL</p>
              <button 
                onClick={() => addToCart(p)}
                className="mt-auto bg-indigo-600 text-white py-2 rounded-lg"
              >
                Sepete Ekle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
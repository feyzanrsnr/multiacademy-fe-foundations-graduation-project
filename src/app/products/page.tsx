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
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");

  // URL'yi güncelleyen yardımcı fonksiyon
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
        const queryStr = new URLSearchParams({ search: searchTerm, sort, category, min: minPrice, max: maxPrice }).toString();
        const res = await fetch(`/api/products?${queryStr}`);
        const data = await res.json();
        setProducts(data.success ? data.products : []);
      } catch (err) { console.error("Hata:", err); } 
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [searchTerm, sort, category, minPrice, maxPrice]);

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Ürünler ({products.length})</h1>
        <Link href="/" className="text-indigo-600 font-medium hover:text-indigo-800 transition">Ana Sayfa</Link>
      </div>

      {/* Gelişmiş Filtreleme Paneli */}
      <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Arama</label>
          <input 
            placeholder="Ürün adı..." 
            className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            onChange={(e) => {setSearchTerm(e.target.value); updateURL({search: e.target.value})}}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
          <select onChange={(e) => {setCategory(e.target.value); updateURL({category: e.target.value})}} className="w-full px-2 py-1 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
            <option value="">Tüm Kategoriler</option>
            <option value="Aksesuar">Aksesuar</option>
            <option value="Giyim">Giyim</option>
            <option value="Teknoloji">Teknoloji</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fiyat Aralığı</label>
          <div className="flex gap-2">
            <input placeholder="Min" className="w-1/2 px-2.5 py-1 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setMinPrice(e.target.value)} />
            <input placeholder="Max" className="w-1/2 px-2.5 py-1 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sıralama</label>
          <select onChange={(e) => {setSort(e.target.value); updateURL({sort: e.target.value})}} value={sort} className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
            <option value="newest">En Yeni</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="popular">En Popüler</option>
          </select>
        </div>
      </div>

      {/* Ürün Listesi */}
      {loading ? <div className="text-center py-20 text-gray-500">Yükleniyor...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition duration-300">
              <img src={p.image_url} alt={p.name} className="h-48 w-full object-cover rounded-xl" />
              <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4 line-clamp-2 grow">
                    {p.description}
              </p>
              <p className="text-indigo-600 font-black text-lg">{p.price} TL</p>
              <button onClick={() => addToCart(p)} className="mt-aut bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition">
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
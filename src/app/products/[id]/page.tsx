"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category: string;
  category_id?: number;
  is_featured?: number;
  created_at?: string;
}

function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!params.id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Ürün detayı çekilirken hata oluştu:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-xl font-bold text-gray-950">Ürün Bulunamadı</h2>
        <p className="text-sm text-gray-500">Ulaşmaya çalıştığınız ürün mevcut olmayabilir veya kaldırılmış olabilir.</p>
        <Link href="/" className="inline-block text-sm text-indigo-600 font-medium hover:underline">
          Ana Sayfaya Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <button 
        onClick={() => router.back()} 
        className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition flex items-center gap-1"
      >
        ← Geri Dön
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Görsel Katmanı */}
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"}
            alt={product.name}
            className="w-full h-full object-cover shadow-inner"
          />
        </div>

        {/* Detay Bilgileri */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
              {product.category || "Genel"}
            </span>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">{product.name}</h1>
            <p className="text-2xl font-black text-indigo-600">{product.price.toLocaleString("tr-TR")} TL</p>
            
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Ürün Açıklaması</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || "Bu ürün için bir açıklama girilmemiş."}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-500">Stok Durumu:</span>
              <span className={`font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} adet stokta` : "Stokta Yok"}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                {/* Adet Kontrolü */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold transition select-none"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-gray-900 w-12 text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold transition select-none"
                  >
                    +
                  </button>
                </div>

                {/* Sepete Ekle Butonu */}
                <button
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      category: product.category,
                      price: product.price,
                      stock: product.stock,
                      image_url: product.image_url || "",
                      category_id: product.category_id || 0,
                      is_featured: product.is_featured || 0,
                      created_at: product.created_at || new Date().toISOString()
                    }, quantity);
                    alert(`${quantity} adet ${product.name} başarıyla sepete eklendi!`);
                  }}
                  className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-sm target-button active:scale-98"
                >
                  Sepete Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
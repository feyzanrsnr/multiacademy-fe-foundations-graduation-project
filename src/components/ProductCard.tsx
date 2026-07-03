//CartContext hook'unu kullanarak ürünleri ekleye
"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // Veritabanından gelen fiyata göre formatlama yapıyoruz
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(product.price);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition duration-200">
      {/* Ürün Görsel Alanı */}
      <div className="relative bg-gray-100 aspect-square w-full flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
          />
        ) : (
          <span className="text-gray-400 text-sm">Görsel Yok</span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Son {product.stock} Ürün!
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-0 bg-black/40 text-white text-sm font-bold flex items-center justify-center">
            Tükendi
          </span>
        )}
      </div>

      {/* Ürün Bilgileri */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-medium text-indigo-600 tracking-wider uppercase mb-1">
          {product.category || "Genel"}
        </span>
        <h3 className="text-base font-semibold text-gray-950 line-clamp-1 mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 flex-grow mb-4">
          {product.description || "Bu ürün için açıklama bulunmuyor."}
        </p>

        {/* Fiyat ve Buton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
          <span className="text-lg font-bold text-gray-950">
            {formattedPrice}
          </span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
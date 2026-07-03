"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-6">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400 text-2xl">
          🛒
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-950">Sepetin şu an boş</h2>
          <p className="text-sm text-gray-500">
            Görünüşe göre henüz sepetine bir ürün eklemedin. Öne çıkan ürünlerimize göz atarak başlayabilirsin.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition shadow-sm"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Alışveriş Sepeti</h1>
        <button
          onClick={clearCart}
          className="text-sm font-medium text-red-600 hover:text-red-700 transition"
        >
          Sepeti Temizle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sepetteki Ürün Listesi */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400 text-xs">Görsel Yok</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-950 line-clamp-1">{item.product.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.product.category || "Genel"}</p>
                  <p className="text-sm font-bold text-gray-950 mt-1">{formatPrice(item.product.price)}</p>
                </div>
              </div>

              {/* Adet Kontrolü ve Silme Butonu */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) {
                        removeFromCart(item.productId);
                      } else {
                        updateQuantity(item.productId, item.quantity - 1);
                      }
                    }}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition font-medium"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-gray-900 min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition font-medium"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-950 min-w-[70px] text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-400 hover:text-red-600 transition p-1"
                    title="Ürünü Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sipariş Özeti Sağ Panel */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-950 border-b border-gray-50 pb-3">Sipariş Özeti</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Ara Toplam</span>
              <span className="font-medium text-gray-950">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Kargo</span>
              <span className="text-green-600 font-medium">Ücretsiz</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-950">
              <span>Genel Toplam</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl transition shadow-sm block text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sipariş Alınıyor..." : "Alışverişi Tamamla"}
          </button>
          
          <Link
            href="/"
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3 rounded-xl transition block text-center"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}
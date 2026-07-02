"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cart } = useCart();

  // Sepetteki toplam ürün sayısını hesaplayalım
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Marka */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-black tracking-tight text-indigo-600 hover:text-indigo-700 transition">
              Multiacademy
            </Link>
          </div>

          {/* Navigasyon Linkleri */}
          <nav className="flex items-center gap-4">
            {/* Siparişlerim Linki */}
            <Link 
              href="/orders" 
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
            >
              Siparişlerim
            </Link>

            {/* Sepetim Butonu */}
            <Link 
              href="/cart" 
              className="relative inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200/60 transition"
            >
              <span>Sepetim</span>
              <span>🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scaleIn">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Profilim Butonu */}
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition"
            >
              👤 Hesabım
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
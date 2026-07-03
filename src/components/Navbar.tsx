"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { logoutAction } from "@/lib/auth-actions";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Navbar() {
  const { cart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sepetteki toplam ürün sayısını hesaplayalım
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAction();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Marka */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/images/store-logo.jpg" 
                alt="MultiGroup Store" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigasyon Linkleri */}
          <nav className="flex items-center gap-4">
            {/* Siparişlerim Linki - sadece giriş yapmış kullanıcılar için */}
            {user && (
              <Link 
                href="/orders" 
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
              >
                Siparişlerim
              </Link>
            )}

            {/* Sepetim Butonu - sadece giriş yapmış kullanıcılar için */}
            {user && (
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
            )}

            {/* Giriş/Kayıt veya Profil/Çıkış Butonu */}
            {loading ? (
              <div className="w-24 h-10 bg-gray-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/profile" 
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                  👤 Hesabım
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition px-2"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
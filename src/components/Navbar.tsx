"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sepetteki toplam ürün sayısı
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

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

            {/* Giriş/Kayıt veya Profil/Çıkış Butonu */}
            {loading ? (
              <div className="w-24 h-10 bg-gray-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                  👤 Hesabım
                  <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Hesap Bilgilerim
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Siparişlerim
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-600 hover:text-white transition px-4 py-2 rounded-xl hover:bg-indigo-600"
                >
                  Giriş Yap
                </Link>
                |
                <Link 
                  href="/register" 
                  className="text-sm font-medium text-gray-600 hover:text-white transition px-4 py-2 rounded-xl hover:bg-indigo-600"
                >
                  Kayıt Ol
                </Link>
              </div>
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
          </nav>
        </div>
      </div>
    </header>
  );
}
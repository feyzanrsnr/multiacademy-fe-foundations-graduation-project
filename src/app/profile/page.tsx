"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction, changePasswordAction } from "@/lib/auth-actions";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          setError(data.error || "Profil bilgileri yüklenemedi.");
        }
      } catch (err) {
        console.error(err);
        setError("Sunucuya bağlanılamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutAction();
      window.location.href = "/login";
    } catch (err) {
      console.error("Çıkış yapılırken hata oluştu:", err);
      setLoading(false);
    }
  };

  const handlePasswordChange = async (formData: FormData) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    
    const result = await changePasswordAction(formData);
    
    if (result?.error) {
      setPasswordError(result.error);
    } else if (result?.success) {
      setPasswordSuccess("Şifreniz başarıyla değiştirildi.");
      setShowPasswordForm(false);
      // Formu temizle
      (document.getElementById('passwordForm') as HTMLFormElement)?.reset();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 space-y-4 max-w-md mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-sm text-gray-500">Profiliniz yükleniyor...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-4">
        <div className="text-red-500 text-3xl">⚠️</div>
        <h2 className="text-lg font-bold text-gray-950">Profil Yüklenemedi</h2>
        <p className="text-sm text-gray-500">{error || "Kullanıcı verisi eksik."}</p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition shadow-sm"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Profil Bilgilerim</h1>
          <p className="text-sm text-gray-500 mt-1">Hesap bilgilerinizi ve siparişlerinizi buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-center px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors duration-150"
        >
          Oturumu Kapat
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
        <div className="p-6 grid grid-cols-3 gap-4 items-center">
          <span className="text-sm font-medium text-gray-500">Ad Soyad</span>
          <span className="text-sm font-bold text-gray-950 col-span-2">{user.name}</span>
        </div>
        
        <div className="p-6 grid grid-cols-3 gap-4 items-center">
          <span className="text-sm font-medium text-gray-500">E-posta Adresi</span>
          <span className="text-sm font-semibold text-gray-950 col-span-2">{user.email}</span>
        </div>

        <div className="p-6 grid grid-cols-3 gap-4 items-center">
          <span className="text-sm font-medium text-gray-500">Telefon Numarası</span>
          <span className="text-sm font-semibold text-gray-400 col-span-2">Belirtilmemiş</span>
        </div>

        <div className="p-6 grid grid-cols-3 gap-4 items-center">
          <span className="text-sm font-medium text-gray-500">Üyelik Tarihi</span>
          <span className="text-sm text-gray-600 col-span-2">
            {new Date(user.createdAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Şifre Değiştirme Bölümü */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-950">Şifre Değiştir</h2>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
          >
            {showPasswordForm ? "İptal" : "Şifre Değiştir"}
          </button>
        </div>

        {passwordSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-4">
            <p className="text-sm font-medium text-green-800">{passwordSuccess}</p>
          </div>
        )}

        {showPasswordForm && (
          <form id="passwordForm" action={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm font-medium text-red-800">{passwordError}</p>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Mevcut Şifre
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Yeni Şifre
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500">En az 6 karakter olmalıdır</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Yeni Şifre (Tekrar)
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition shadow-sm"
            >
              Şifreyi Değiştir
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/orders"
          className="p-5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-between group transition-all"
        >
          <div>
            <h3 className="text-sm font-bold text-indigo-950">Sipariş Geçmişi</h3>
            <p className="text-xs text-indigo-600/80 mt-1">Verdiğiniz tüm siparişlerin durumunu inceleyin.</p>
          </div>
          <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <Link
          href="/"
          className="p-5 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-xl flex items-center justify-between group transition-all"
        >
          <div>
            <h3 className="text-sm font-bold text-gray-950">Alışverişe Devam Et</h3>
            <p className="text-xs text-gray-500 mt-1">Yeni ürünleri keşfetmek için mağazaya dönün.</p>
          </div>
          <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}

export default ProfilePage;
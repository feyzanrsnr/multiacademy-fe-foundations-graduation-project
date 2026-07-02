"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-6">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 text-4xl animate-bounce">
        ✓
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Siparişiniz Alındı!</h1>
        <p className="text-sm text-gray-500">
          Harika bir seçim yaptınız. Siparişiniz hazırlanmak üzere kuyruğa alındı.
        </p>
      </div>

      {orderNumber && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <span className="text-xs text-gray-400 block uppercase font-medium tracking-wider">Sipariş Numarası</span>
          <span className="text-lg font-mono font-bold text-gray-900">{orderNumber}</span>
        </div>
      )}

      <div className="pt-4 flex flex-col gap-3">
        <Link
          href="/"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl transition shadow-sm block text-center"
        >
          Alışverişe Devam Et
        </Link>
        <Link
          href="/orders"
          className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3 rounded-xl transition block text-center"
        >
          Sipariş Geçmişimi Gör
        </Link>
      </div>
    </div>
  );
}
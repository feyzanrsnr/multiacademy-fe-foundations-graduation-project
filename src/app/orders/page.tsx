"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface Order {
  id: number;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  customerName: string;
  shippingAddress: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();

        if (response.ok && data.success) {
          setOrders(data.orders);
        } else {
          setError(data.error || "Siparişler yüklenirken bir hata oluştu.");
        }
      } catch (err) {
        console.error(err);
        setError("Sunucuya bağlanılamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-24 space-y-4 max-w-md mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-sm text-gray-500">Sipariş geçmişiniz yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-4">
        <div className="text-red-500 text-3xl">⚠️</div>
        <h2 className="text-lg font-bold text-gray-950">Bir Hata Oluştu</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition shadow-sm"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-6">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400 text-2xl">
          📦
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-950">Henüz siparişiniz yok</h2>
          <p className="text-sm text-gray-500">
            Geçmiş siparişleriniz burada listelenir. Alışverişe başlayarak ilk siparişinizi verebilirsiniz.
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Sipariş Geçmişim</h1>
        <p className="text-sm text-gray-500 mt-1">
          Toplam {orders.length} adet siparişiniz bulunuyor.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
          >
            {/* Üst Bilgi Çubuğu */}
            <div className="bg-gray-50 border-b border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-gray-500 font-medium">Sipariş Tarihi</p>
                <p className="text-gray-950 font-semibold mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Toplam Tutar</p>
                <p className="text-gray-950 font-bold mt-0.5">{formatPrice(order.totalPrice)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Alıcı</p>
                <p className="text-gray-950 font-semibold mt-0.5 line-clamp-1">{order.customerName}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-gray-500 font-medium">Sipariş No</p>
                <p className="text-indigo-600 font-mono font-bold mt-0.5">#{order.orderNumber}</p>
              </div>
            </div>

            {/* Sipariş İçeriği (Ürünler) */}
            <div className="divide-y divide-gray-100 px-6 py-2">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">Görsel Yok</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-950 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Adet: <span className="font-medium text-gray-700">{item.quantity}</span> × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-950">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Alt Bilgi Çubuğu Teslimat Adresi ve Durum */}
            <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-gray-500">
                <span className="font-semibold text-gray-700">Teslimat Adresi:</span> {order.shippingAddress}
              </div>
              <div className="flex items-center gap-2 sm:self-end">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-bold text-green-700 uppercase tracking-wider bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                  {order.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
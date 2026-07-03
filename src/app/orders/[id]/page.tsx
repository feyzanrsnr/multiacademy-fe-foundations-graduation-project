"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  paymentMethod: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchOrderDetail = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || "Sipariş detayı yüklenemedi.");
        }
      } catch (err) {
        console.error(err);
        setError("Sunucuya bağlanılamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [params.id]);

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
        <p className="text-sm text-gray-500">Sipariş detayları yükleniyor...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-4">
        <div className="text-red-500 text-3xl">⚠️</div>
        <h2 className="text-lg font-bold text-gray-950">Bir Hata Oluştu</h2>
        <p className="text-sm text-gray-500">{error || "Sipariş bulunamadı."}</p>
        <Link
          href="/orders"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition shadow-sm"
        >
          Siparişlerime Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <Link href="/orders" className="text-sm font-medium text-indigo-600 hover:underline mb-2 inline-block">
            ← Siparişlerime Dön
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Sipariş Detayı</h1>
          <p className="text-sm text-gray-500 mt-1">Sipariş No: #{order.orderNumber}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Üst Bilgi Çubuğu */}
        <div className="bg-gray-50 border-b border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-gray-500 font-medium">Sipariş Tarihi</p>
            <p className="text-gray-950 font-semibold mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Toplam Tutar</p>
            <p className="text-gray-950 font-bold mt-0.5">{formatPrice(order.totalAmount)}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Ödeme Yöntemi</p>
            <p className="text-gray-950 font-semibold mt-0.5 capitalize">{order.paymentMethod}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-gray-500 font-medium">Durum</p>
            <div className="flex items-center gap-2 sm:justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-bold text-green-700 uppercase tracking-wider bg-green-50 px-2.5 py-1 rounded-md border border-green-100 text-xs">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Sipariş İçeriği */}
        <div className="divide-y divide-gray-100 px-6 py-2">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
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
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                  >
                    Ürünü Gör
                  </Link>
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

        {/* Alt Bilgi - Teslimat Bilgileri */}
        <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4">
          <h3 className="text-sm font-bold text-gray-950 mb-3">Teslimat Bilgileri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500 font-medium">Alıcı</p>
              <p className="text-gray-950 font-semibold mt-0.5">{order.shippingName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Telefon</p>
              <p className="text-gray-950 font-semibold mt-0.5">{order.shippingPhone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 font-medium">Teslimat Adresi</p>
              <p className="text-gray-950 font-semibold mt-0.5">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        {/* Toplam Özet */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Genel Toplam</span>
            <span className="text-xl font-bold text-gray-950">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* İşlem Butonları */}
      <div className="flex gap-3">
        <Link
          href="/orders"
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3 rounded-xl transition block text-center"
        >
          Siparişlerime Dön
        </Link>
        <Link
          href="/"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl transition block text-center"
        >
          Alışverişe Devam Et
        </Link>
      </div>
    </div>
  );
}

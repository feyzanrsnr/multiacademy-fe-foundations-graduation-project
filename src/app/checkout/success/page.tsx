"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface OrderDetail {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
  }>;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      // Sipariş detaylarını API'den al
      fetch(`/api/orders`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.orders) {
            const order = data.orders.find((o: OrderDetail) => o.orderNumber === orderNumber);
            setOrderDetail(order || null);
          }
        })
        .catch(err => console.error("Sipariş detayı alınamadı:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 text-4xl animate-bounce">
          ✓
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Siparişiniz Başarıyla Alındı!</h1>
          <p className="text-sm text-gray-500">
            Harika bir seçim yaptınız. Siparişiniz hazırlanmak üzere kuyruğa alındı.
          </p>
        </div>

        {orderNumber && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 inline-block">
            <span className="text-xs text-gray-400 block uppercase font-medium tracking-wider">Sipariş Numarası</span>
            <span className="text-lg font-mono font-bold text-gray-900">{orderNumber}</span>
          </div>
        )}
      </div>

      {/* Sipariş Detayları */}
      {orderDetail && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Üst Bilgi Çubuğu */}
          <div className="bg-gray-50 border-b border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <p className="text-gray-500 font-medium">Sipariş Tarihi</p>
              <p className="text-gray-950 font-semibold mt-0.5">{formatDate(orderDetail.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Toplam Tutar</p>
              <p className="text-gray-950 font-bold mt-0.5">{formatPrice(orderDetail.totalAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Alıcı</p>
              <p className="text-gray-950 font-semibold mt-0.5 line-clamp-1">{orderDetail.shippingName}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-gray-500 font-medium">Sipariş No</p>
              <p className="text-indigo-600 font-mono font-bold mt-0.5">#{orderDetail.orderNumber}</p>
            </div>
          </div>

          {/* Sipariş İçeriği */}
          <div className="divide-y divide-gray-100 px-6 py-2">
            {orderDetail.items.map((item) => (
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

          {/* Alt Bilgi */}
          <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-gray-500">
              <span className="font-semibold text-gray-700">Teslimat Adresi:</span> {orderDetail.shippingAddress}
            </div>
            <div className="flex items-center gap-2 sm:self-end">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-bold text-green-700 uppercase tracking-wider bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                {orderDetail.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 px-6 rounded-xl transition shadow-sm block text-center"
        >
          Alışverişe Devam Et
        </Link>
        <Link
          href="/orders"
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3 px-6 rounded-xl transition block text-center"
        >
          Sipariş Geçmişimi Gör
        </Link>
      </div>
    </div>
  );
}
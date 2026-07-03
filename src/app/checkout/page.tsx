"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const totalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name.trim() ? "" : "Ad soyad zorunludur",
      address: formData.address.trim() ? "" : "Adres zorunludur",
      phone: formData.phone.trim() ? "" : "Telefon numarası zorunludur",
    };

    setErrors(newErrors);
    return !newErrors.name && !newErrors.address && !newErrors.phone;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Teslimat bilgilerini localStorage'a kaydet ve ödeme sayfasına yönlendir
    localStorage.setItem("shippingInfo", JSON.stringify(formData));
    router.push("/checkout/payment");
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
            Ödeme yapmadan önce sepetine ürün eklemelisin.
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Sipariş Özeti</h1>
        <p className="text-sm text-gray-500 mt-1">Lütfen teslimat bilgilerinizi girin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Panel - Teslimat Formu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950 mb-4">Teslimat Bilgileri</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  id=" name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Adınız ve soyadınız"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Teslimat Adresi *
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                    errors.address ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Mahalle, sokak, apartman no..."
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.phone ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="05XX XXX XX XX"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "İşleniyor..." : "Ödeme Adımına Geç"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sağ Panel - Sipariş Özeti */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-4">
            <h2 className="text-lg font-bold text-gray-950 mb-4 border-b border-gray-50 pb-3">
              Sipariş Özeti
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-400 text-xs">Görsel Yok</span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-gray-950 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} adet</p>
                  </div>
                  <span className="font-semibold text-gray-950">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
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

            <Link
              href="/cart"
              className="w-full mt-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition block text-center"
            >
              Sepeti Düzenle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";

export default function PaymentPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<any>(null);

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const totalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  useEffect(() => {
    // Teslimat bilgilerini localStorage'dan al
    const savedShippingInfo = localStorage.getItem("shippingInfo");
    if (savedShippingInfo) {
      setShippingInfo(JSON.parse(savedShippingInfo));
    } else {
      // Eğer teslimat bilgisi yoksa checkout sayfasına yönlendir
      router.push("/checkout");
    }
  }, [router]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: cardData.cardNumber.replace(/\s/g, "").length === 16 ? "" : "Geçerli bir kart numarası girin",
      cardName: cardData.cardName.trim() ? "" : "Kart üzerindeki isim zorunludur",
      expiryDate: cardData.expiryDate.length === 5 ? "" : "Geçerli bir son kullanma tarihi girin (AA/YY)",
      cvv: cardData.cvv.length === 3 ? "" : "Geçerli bir CVV girin",
    };

    setErrors(newErrors);
    return !newErrors.cardNumber && !newErrors.cardName && !newErrors.expiryDate && !newErrors.cvv;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!shippingInfo) {
      alert("Teslimat bilgileri eksik. Lütfen tekrar deneyin.");
      router.push("/checkout");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock ödeme işlemi - 2 saniye bekleme
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Siparişi oluştur
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          shippingInfo,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // LocalStorage'ı temizle
        localStorage.removeItem("shippingInfo");
        clearCart();
        // Sipariş onay sayfasına yönlendir
        router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
      } else {
        alert(data.error || "Sipariş tamamlanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Ödeme hatası:", error);
      alert("Bir şeyler ters gitti.");
    } finally {
      setIsSubmitting(false);
    }
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

  if (!shippingInfo) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-sm text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Ödeme</h1>
        <p className="text-sm text-gray-500 mt-1">Ödeme bilgilerinizi girin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Panel - Ödeme Formu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950 mb-4">Kart Bilgileri</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Numarası *
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                  maxLength={19}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.cardNumber ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
              </div>

              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Üzerindeki İsim *
                </label>
                <input
                  type="text"
                  id="cardName"
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value.toUpperCase() })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.cardName ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="AD SOYAD"
                />
                {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Son Kullanma Tarihi *
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({ ...cardData, expiryDate: formatExpiryDate(e.target.value) })}
                    maxLength={5}
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.expiryDate ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="AA/YY"
                  />
                  {errors.expiryDate && <p className="text-xs text-red-600 mt-1">{errors.expiryDate}</p>}
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV *
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/[^0-9]/g, "") })}
                    maxLength={3}
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.cvv ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="123"
                  />
                  {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Ödeme İşleniyor..." : `${formatPrice(totalPrice)} Öde`}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                🔒 Bu bir demo ödemesidir. Gerçek para çekilmeyecektir.
              </p>
            </form>
          </div>

          {/* Teslimat Bilgileri Özeti */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-950 mb-2">Teslimat Bilgileri</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Alıcı:</span> {shippingInfo.name}</p>
              <p><span className="font-medium">Telefon:</span> {shippingInfo.phone}</p>
              <p><span className="font-medium">Adres:</span> {shippingInfo.address}</p>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className="mt-3 text-xs text-indigo-600 hover:underline"
            >
              Düzenle
            </button>
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
                  <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
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
          </div>
        </div>
      </div>
    </div>
  );
}

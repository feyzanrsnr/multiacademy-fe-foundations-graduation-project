import Link from "next/link";

export default function ProductsNotFound() {
  return (
    <div className="text-center py-24 max-w-md mx-auto space-y-6">
      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400 text-2xl">
        📦
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-950">Ürün Bulunamadı</h2>
        <p className="text-sm text-gray-500">
          Aradığınız ürün mevcut olmayabilir veya kaldırılmış olabilir.
        </p>
      </div>
      <Link
        href="/products"
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition shadow-sm"
      >
        Tüm Ürünleri Gör
      </Link>
    </div>
  );
}

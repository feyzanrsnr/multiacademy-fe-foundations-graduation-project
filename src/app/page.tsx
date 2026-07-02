import db from "@/lib/db";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  try {
    // SQLite veritabanından tüm ürünleri çekiyoruz
    const products = db.prepare("SELECT * FROM products ORDER BY id DESC").all() as Product[];
    return products;
  } catch (error) {
    console.error("Veritabanından ürünler çekilirken hata oluştu:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="space-y-10">
      {/* Üst Karşılama Banner Bölümü */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400/20">
            Hoş Geldiniz
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Aradığın Tüm Ürünler <br /> Tek Bir Sayfada.
          </h1>
          <p className="text-indigo-100 text-base sm:text-lg max-w-md">
            Hızlı,güvenilir ve yüksek performanslı alışveriş deneyimi.
          </p>
        </div>
      </div>

      {/* Ürün Gridi Listeleme Alanı */}
      <div>
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">
            Öne Çıkan Ürünler
          </h2>
          <span className="text-sm text-gray-500">
            Toplam {products.length} ürün listeleniyor
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl mt-6">
            <h3 className="text-sm font-medium text-gray-900">Henüz ürün bulunmuyor</h3>
            <p className="mt-1 text-sm text-gray-500">Lütfen SQLite veritabanına veri eklendiğinden emin olun.</p>
          </div>
        ) : (
          /* Tailwind Grid Sistemi ile responsive kart dizilimi */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
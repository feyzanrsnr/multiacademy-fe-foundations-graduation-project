"use client";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-24 max-w-md mx-auto space-y-6">
      <div className="text-red-500 text-5xl">⚠️</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-950">Ürünler Yüklenemedi</h2>
        <p className="text-sm text-gray-500">
          Bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition shadow-sm"
      >
        Tekrar Dene
      </button>
    </div>
  );
}

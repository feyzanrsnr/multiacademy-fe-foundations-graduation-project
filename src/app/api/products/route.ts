import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryName = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest"; // Varsayılan: En yeni
    const minPrice = searchParams.get("min");
    const maxPrice = searchParams.get("max");

    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock, 
        p.image_url, p.category_id, p.is_featured, p.created_at,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // 1. Arama Filtresi
    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // 2. Kategori Filtresi
    if (categoryName) {
      query += " AND c.name = ?";
      params.push(categoryName);
    }

    // 3. Fiyat Aralığı Filtreleri
    if (minPrice) {
      query += " AND p.price >= ?";
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += " AND p.price <= ?";
      params.push(parseFloat(maxPrice));
    }

    // 4. Gelişmiş Sıralama
    switch (sort) {
      case "price-asc":
        query += " ORDER BY p.price ASC";
        break;
      case "price-desc":
        query += " ORDER BY p.price DESC";
        break;
      case "popular":
        // Öne çıkanlar önce gelir
        query += " ORDER BY p.is_featured DESC, p.id DESC";
        break;
      case "newest":
      default:
        query += " ORDER BY p.created_at DESC";
        break;
    }

    const stmt = db.prepare(query);
    const products = stmt.all(...params);

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Ürünler getirilirken hata oluştu:", error);
    return NextResponse.json({ success: false, error: "Ürünler yüklenemedi." }, { status: 500 });
  }
}
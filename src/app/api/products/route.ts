import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryName = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || ""; 

    // 1. Kural: Orijinal kolon adlarını koruyoruz ve categories tablosunu JOIN ile bağlıyoruz
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.stock, 
        p.image_url, 
        p.category_id, 
        p.is_featured, 
        p.created_at,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // 2. Arama Filtresi
    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // 3. Kategori Filtresi
    if (categoryName) {
      query += " AND c.name = ?";
      params.push(categoryName);
    }

    // 4. Sıralama
    if (sort === "price-asc") {
      query += " ORDER BY p.price ASC";
    } else if (sort === "price-desc") {
      query += " ORDER BY p.price DESC";
    } else {
      query += " ORDER BY p.id DESC";
    }

    const stmt = db.prepare(query);
    const products = stmt.all(...params);

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Ürünler getirilirken hata oluştu:", error);
    return NextResponse.json({ error: "Ürünler yüklenemedi." }, { status: 500 });
  }
}
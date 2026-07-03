import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    const stmt = db.prepare(`
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
      WHERE p.id = ?
    `);
    const product = stmt.get(productId) as any;

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Ürün detayı getirilirken hata oluştu:", error);
    return NextResponse.json({ error: "Ürün bilgisi yüklenemedi." }, { status: 500 });
  }
}
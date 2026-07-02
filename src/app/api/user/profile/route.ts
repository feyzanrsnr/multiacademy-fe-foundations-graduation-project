import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const userId = 1; // Projenin mevcut test kullanıcısı ID'si

    const stmt = db.prepare(`
      SELECT id, name, email, created_at AS createdAt 
      FROM users 
      WHERE id = ?
    `);
    
    const user = stmt.get(userId) as any;

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    console.error("Profil bilgileri çekilirken hata oluştu:", error);
    return NextResponse.json({ error: "Profil bilgileri yüklenemedi." }, { status: 500 });
  }
}
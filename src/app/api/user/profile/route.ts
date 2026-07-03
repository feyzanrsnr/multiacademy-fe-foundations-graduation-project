import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const stmt = db.prepare(`
      SELECT id, name, email, created_at AS createdAt 
      FROM users 
      WHERE id = ?
    `);
    
    const user = stmt.get(sessionId) as User | undefined;

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: unknown) {
    console.error("Profil bilgileri çekilirken hata oluştu:", error);
    return NextResponse.json({ error: "Profil bilgileri yüklenemedi." }, { status: 500 });
  }
}
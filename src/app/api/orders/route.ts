import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";


interface OrderRow {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  itemId: number | null;
  productId: number | null;
  productName: string | null;
  unitPrice: number | null;
  quantity: number | null;
  imageUrl: string | null;
}

interface OrderMapValue {
  id: number;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  customerName: string;
  shippingAddress: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
  }>;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Oturum bulunamadı." }, { status: 401 });
    }

    const stmt = db.prepare(`
      SELECT 
        o.id AS orderId,
        o.order_number AS orderNumber,
        o.total_amount AS totalAmount,
        o.status,
        o.created_at AS createdAt,
        o.shipping_name AS shippingName,
        o.shipping_address AS shippingAddress,
        oi.id AS itemId,
        oi.product_id AS productId,
        p.name AS productName,
        oi.unit_price AS unitPrice,
        oi.quantity AS quantity,
        p.image_url AS imageUrl
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `);

    const rows = stmt.all(sessionId) as OrderRow[];

    const ordersMap: Record<number, OrderMapValue> = {};

    rows.forEach((row) => {
      if (!ordersMap[row.orderId]) {
        ordersMap[row.orderId] = {
          id: row.orderId,
          orderNumber: row.orderNumber,
          totalPrice: row.totalAmount,
          status: row.status === "pending" ? "Hazırlanıyor" : row.status,
          createdAt: row.createdAt,
          customerName: row.shippingName,
          shippingAddress: row.shippingAddress,
          items: [],
        };
      }

      // Eğer siparişe ait ürün detayı varsa listeye ekliyoruz
      if (row.itemId && row.productName && row.unitPrice !== null && row.quantity !== null) {
        ordersMap[row.orderId].items.push({
          id: row.itemId,
          name: row.productName,
          price: row.unitPrice,
          quantity: row.quantity,
          imageUrl: row.imageUrl || null,
        });
      }
    });

    const orders = Object.values(ordersMap);

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: unknown) {
    console.error("Siparişler çekilirken hata oluştu:", error);
    return NextResponse.json(
      { success: false, error: "Sipariş geçmişi yüklenemedi." },
      { status: 500 }
    );
  }
}
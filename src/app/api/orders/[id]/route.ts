import { NextResponse } from "next/server";
import db from "@/lib/db";

interface OrderRow {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  paymentMethod: string;
  itemId: number | null;
  productId: number | null;
  productName: string | null;
  unitPrice: number | null;
  quantity: number | null;
  imageUrl: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    const stmt = db.prepare(`
      SELECT 
        o.id AS orderId,
        o.order_number AS orderNumber,
        o.total_amount AS totalAmount,
        o.status,
        o.created_at AS createdAt,
        o.shipping_name AS shippingName,
        o.shipping_address AS shippingAddress,
        o.shipping_phone AS shippingPhone,
        o.payment_method AS paymentMethod,
        oi.id AS itemId,
        oi.product_id AS productId,
        p.name AS productName,
        oi.unit_price AS unitPrice,
        oi.quantity AS quantity,
        p.image_url AS imageUrl
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
    `);

    const rows = stmt.all(orderId) as OrderRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const order = {
      id: rows[0].orderId,
      orderNumber: rows[0].orderNumber,
      totalAmount: rows[0].totalAmount,
      status: rows[0].status === "pending" ? "Hazırlanıyor" : rows[0].status,
      createdAt: rows[0].createdAt,
      shippingName: rows[0].shippingName,
      shippingAddress: rows[0].shippingAddress,
      shippingPhone: rows[0].shippingPhone,
      paymentMethod: rows[0].paymentMethod,
      items: rows
        .filter((row: OrderRow) => row.itemId && row.productName)
        .map((row: OrderRow) => ({
          id: row.itemId,
          productId: row.productId,
          name: row.productName,
          price: row.unitPrice,
          quantity: row.quantity,
          imageUrl: row.imageUrl || null,
        })),
    };

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: unknown) {
    console.error("Sipariş detayı çekilirken hata oluştu:", error);
    return NextResponse.json(
      { success: false, error: "Sipariş detayı yüklenemedi." },
      { status: 500 }
    );
  }
}

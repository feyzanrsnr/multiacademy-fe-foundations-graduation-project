import { NextResponse } from "next/server";
import db from "@/lib/db";
import { CartItem } from "@/types";

export async function POST(request: Request) {
  try {
    const { cart, shippingInfo } = await request.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Sepetiniz boş." }, { status: 400 });
    }

    
    const userId = 1; 
    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    
    
    const totalAmount = cart.reduce((acc: number, item: CartItem) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    // SQL işlemlerini Transaction içine alıyoruz
    const executeOrderTransaction = db.transaction(() => {
      // 1. Orders tablosuna ekleme
      const orderStmt = db.prepare(`
        INSERT INTO orders (user_id, order_number, total_amount, status, shipping_name, shipping_address, shipping_phone, payment_method, created_at)
        VALUES (?, ?, ?, 'pending', ?, ?, ?, 'Credit Card', datetime('now'))
      `);
      
      const orderResult = orderStmt.run(
        userId,
        orderNumber,
        totalAmount,
        shippingInfo.name,
        shippingInfo.address,
        shippingInfo.phone
      );

      const orderId = orderResult.lastInsertRowid;

      // 2. Order_items tablosuna ürünleri tek tek ekleme ve stok düşürme
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE products SET stock = stock - ? WHERE id = ?
      `);

      for (const item of cart) {
  
        itemStmt.run(orderId, item.productId, item.quantity, item.product.price);
        
        // Stok güncellemesi
        updateStockStmt.run(item.quantity, item.productId);
      }

      return orderNumber;
    });

    const createdOrderNumber = executeOrderTransaction();

    return NextResponse.json({ 
      success: true, 
      orderNumber: createdOrderNumber,
      message: "Siparişiniz başarıyla oluşturuldu." 
    });

  } catch (error: any) {
    console.error("Sipariş işlenirken hata oluştu:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}
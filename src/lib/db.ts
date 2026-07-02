import Database from 'better-sqlite3';
import path from 'path';

// Veritabanı dosyasının projenin kök dizininde local.db adıyla oluşmasını sağlıyoruz
const dbPath = path.resolve(process.cwd(), 'local.db');
const db = new Database(dbPath);

// Performans optimizasyonu için WAL modunu açıyoruz
db.pragma('journal_mode = WAL');

// 1. Tabloları Oluşturma
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category_id INTEGER,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    order_number TEXT UNIQUE NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL,
    shipping_name TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// 2. Seed Data İşlemi (Eğer kategoriler boşsa çalışır)
const categoryCheck = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };

if (categoryCheck.count === 0) {
  // Kategorileri Ekleme
  const insertCategory = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
  
  const cat1 = insertCategory.run('Elektronik', 'elektronik', 'En son teknoloji ürünler, bilgisayarlar ve aksesuarlar.');
  const cat2 = insertCategory.run('Giyim', 'giyim', 'Şık ve rahat her mevsime uygun kıyafetler.');
  const cat3 = insertCategory.run('Kitap', 'kitap', 'Dünya klasiklerinden teknik dökümanlara kadar geniş arşiv.');

  // Ürünleri Ekleme
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, stock, image_url, category_id, is_featured) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Elektronik Ürünler (category_id: 1)
  insertProduct.run('Kablosuz Kulaklık', 'Yüksek ses kaliteli, gürültü engelleyici kulaklık', 1299.99, 15, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', cat1.lastInsertRowid, 1);
  insertProduct.run('Mekanik Klavye', 'RGB aydınlatmalı, Blue switch oyuncu klavyesi', 849.50, 20, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', cat1.lastInsertRowid, 1);
  insertProduct.run('Oyuncu Mouse', '16000 DPI, ergonomik kablosuz optik mouse', 450.00, 30, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', cat1.lastInsertRowid, 0);
  insertProduct.run('Taşınabilir SSD 1TB', 'USB 3.2 uyumlu, ultra hızlı harici depolama', 1899.00, 10, 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=500', cat1.lastInsertRowid, 0);

  // Giyim Ürünleri (category_id: 2)
  insertProduct.run('Pamuklu Oversize Tişört', '%100 pamuk, rahat kesim günlük tişört', 299.99, 50, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', cat2.lastInsertRowid, 1);
  insertProduct.run('Klasik Kot Ceket', 'Dayanıklı kumaş, zamansız tasarım kot ceket', 799.90, 12, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500', cat2.lastInsertRowid, 1);
  insertProduct.run('Spor Ayakkabı', 'Yürüyüş ve koşu için uygun, nefes alan taban', 1499.00, 8, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', cat2.lastInsertRowid, 0);
  insertProduct.run('Keten Gömlek', 'Yaz ayları için ideal, hafif ve şık kesim', 450.00, 25, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', cat2.lastInsertRowid, 0);

  // Kitap Ürünleri (category_id: 3)
  insertProduct.run('Temiz Kod (Clean Code)', 'Robert C. Martin yazarlık klasiği, sürdürülebilir yazılım rehberi', 180.00, 40, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500', cat3.lastInsertRowid, 1);
  insertProduct.run('Pragmatik Programcı', 'Yazılım geliştiriciler için kariyer ve kodlama tavsiyeleri', 220.00, 15, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', cat3.lastInsertRowid, 0);
  insertProduct.run('TypeScript ile İleri Seviye Mimari', 'Derleyici teorisi ve tip güvenliği üzerine pratik rehber', 250.00, 18, 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500', cat3.lastInsertRowid, 1);
  insertProduct.run('Algoritmalar ve Veri Yapıları', 'Bilgisayar mühendisliğinin temellerini anlatan başucu eseri', 310.00, 22, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', cat3.lastInsertRowid, 0);

  console.log('Veritabanı şeması ve örnek veriler başarıyla yüklendi.');
}

export default db;
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
  
  const cat1 = insertCategory.run('Aksesuar', 'aksesuar', 'En son teknoloji ürünler, bilgisayarlar ve aksesuarlar.');
  const cat2 = insertCategory.run('Giyim', 'giyim', 'Şık ve rahat her mevsime uygun kıyafetler.');
  const cat3 = insertCategory.run('Teknoloji', 'teknoloji', 'Dünya klasiklerinden teknik dökümanlara kadar geniş arşiv.');
  const cat4 = insertCategory.run('Kırtasiye', 'kırtasiye', 'Dünya klasiklerinden teknik dökümanlara kadar geniş arşiv.');
  const cat5 = insertCategory.run('Yaşam', 'yaşam', 'Dünya klasiklerinden teknik dökümanlara kadar geniş arşiv.');

  // Ürünleri Ekleme
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, stock, image_url, category_id, is_featured) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Aksesuar Ürünleri (category_id: 1)
  insertProduct.run('Şapka - Siyah', 'Şık ve rahat günlük kullanım için siyah şapka', 299.99, 25, '/images/MultiGroup-şapka-black.jfif', cat1.lastInsertRowid, 0);

  insertProduct.run('Şapka - Lacivert', 'Şık ve rahat günlük kullanım için lacivert şapka', 299.99, 25, '/images/MultiGroup-şapka-laci.jfif', cat1.lastInsertRowid, 0);

  insertProduct.run('Şapka - Kırmızı', 'Şık ve rahat günlük kullanım için kırmızı şapka', 299.99, 25, '/images/MultiGroup-şapka-kırmızı.png', cat1.lastInsertRowid, 0);

  insertProduct.run('Şapka - Bej', 'Şık ve rahat günlük kullanım için bej şapka', 299.99, 25, '/images/MultiGroup-şapka-bej.jfif', cat1.lastInsertRowid, 0);

  insertProduct.run('Bez Çanta - Siyah', 'Dayanıklı kumaş, geniş iç hacimli bez çanta', 449.90, 30, '/images/MultiGroup-bez çanta.png', cat1.lastInsertRowid, 0);

  insertProduct.run('Bez Çanta - Lacivert', 'Dayanıklı kumaş, geniş iç hacimli bez çanta', 449.90, 30, '/images/bez çanta-laci.png', cat1.lastInsertRowid, 0);

  // Giyim Ürünleri (category_id: 2)
  insertProduct.run('Hoodie - Siyah', 'Rahat kesim, kaliteli kumaş siyah hoodie', 599.99, 40, '/images/MultiGroup-hoodie-black.png', cat2.lastInsertRowid, 1);

  insertProduct.run('Hoodie - Beyaz', 'Rahat kesim, kaliteli kumaş beyaz hoodie', 599.99, 40, '/images/hoodie-white.png', cat2.lastInsertRowid, 0);

  insertProduct.run('T-Shirt - Siyah', '%100 pamuk, oversize kesim siyah tişört', 349.99, 50, '/images/MultiGroup-tshirt-black.png', cat2.lastInsertRowid, 0);

  insertProduct.run('T-Shirt - Beyaz', '%100 pamuk, oversize kesim beyaz tişört', 349.99, 50, '/images/MultiGroup-tshirt-whitej.png', cat2.lastInsertRowid, 0);

  insertProduct.run('T-Shirt - Kırmızı', '%100 pamuk, oversize kesim kırmızı tişört', 349.99, 50, '/images/MultiGroup-tshirt-red.png', cat2.lastInsertRowid, 0);

  

  // Teknoloji Ürünleri (category_id: 3)
  insertProduct.run('Powerbank', '20000mAh kapasiteli hızlı şarj powerbank', 699.99, 35, '/images/MultiGroup-powerbank.png', cat3.lastInsertRowid, 0);
  insertProduct.run('Mousepad', 'Büyük boy, anti-kaymaz yüzey mousepad', 199.99, 45, '/images/MultiGroup-mousepad.png', cat3.lastInsertRowid, 0);

  // Kırtasiye Ürünleri (category_id: 4)
  insertProduct.run('Defter - Siyah', 'Kraft kapaklı, 100 yaprak kaliteli defter', 149.99, 60, '/images/MultiGroup-defter.jfif', cat4.lastInsertRowid, 1);

  insertProduct.run('Defter - Beyaz', 'Kraft kapaklı, 100 yaprak kaliteli defter', 149.99, 60, '/images/defter-white.png', cat4.lastInsertRowid, 0);

  insertProduct.run('Masa Takvimi', '2024 masa takvimi, şık tasarım', 89.99, 40, '/images/MultiGroup-masa takvimi.png', cat4.lastInsertRowid, 0);

  // Yaşam Ürünleri (category_id: 5)
  insertProduct.run('Termos - Siyah', '500ml kapasiteli, uzun süre sıcak tutan termos', 399.99, 25, '/images/MultiGroup-termos-black.jfif', cat5.lastInsertRowid, 1);

  insertProduct.run('Termos - Beyaz', '500ml kapasiteli, uzun süre sıcak tutan termos', 399.99, 25, '/images/termos-white.png', cat5.lastInsertRowid, 0);

  insertProduct.run('Küçük Termos - Siyah', '350ml kapasiteli, taşınabilir termos', 299.99, 30, '/images/MultiGroup-termos-küçük.png', cat5.lastInsertRowid, 0);

  insertProduct.run('Küçük Termos - Kırmızı', '350ml kapasiteli, taşınabilir termos', 299.99, 30, '/images/kucuk-termos-red.png', cat5.lastInsertRowid, 0);

  insertProduct.run('Kupa - Siyah', 'Seramik mat siyah kupa', 149.99, 50, '/images/MultiGroup-kupa-black.png', cat5.lastInsertRowid, 1);

  insertProduct.run('Kupa - Beyaz', 'Seramik mat beyaz kupa', 149.99, 50, '/images/MultiGroup-kupa-white.jfif', cat5.lastInsertRowid, 0);

  console.log('Veritabanı şeması ve örnek veriler başarıyla yüklendi.');
}

export default db;
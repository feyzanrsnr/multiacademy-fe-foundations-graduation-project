const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'local.db');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
  
  console.log('Kayıtlı Kullanıcılar:');
  console.log('====================');
  
  if (users.length === 0) {
    console.log('Henüz kayıtlı kullanıcı yok.');
  } else {
    users.forEach((user, index) => {
      console.log(`\nKullanıcı #${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Ad: ${user.name}`);
      console.log(`  E-posta: ${user.email}`);
      console.log(`  Rol: ${user.role}`);
      console.log(`  Kayıt Tarihi: ${user.created_at}`);
    });
  }
  
  console.log(`\nToplam ${users.length} kayıtlı kullanıcı.`);
} catch (error) {
  console.error('Hata:', error.message);
} finally {
  db.close();
}

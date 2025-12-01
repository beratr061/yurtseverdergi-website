const bcrypt = require('bcryptjs');

// Şifre: Admin123!
const password = 'Admin123!';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Hata:', err);
    return;
  }
  
  console.log('\n=== YENİ ADMIN KULLANICISI ===');
  console.log('Email: admin@yurtsever.com');
  console.log('Şifre:', password);
  console.log('\nBcrypt Hash:');
  console.log(hash);
  console.log('\n=== SQL KOMUTU ===\n');
  
  const sql = `INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || gen_random_uuid()::text,
  'Admin',
  'admin@yurtsever.com',
  '${hash}',
  'ADMIN',
  NOW(),
  NOW()
);`;
  
  console.log(sql);
  console.log('\n=== NOT ===');
  console.log('Bu SQL komutunu Supabase Dashboard > SQL Editor\'de çalıştırın.');
  console.log('Giriş yaptıktan sonra mutlaka şifrenizi değiştirin!\n');
});

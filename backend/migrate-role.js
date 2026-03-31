const pool = require('./js/db');

async function migrateDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Дерекқорды жаңарту: role бағанын қосу...');
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
    `);
    console.log('✅ "role" бағаны қосылды (немесе бұрыннан бар)');

    const adminEmail = 'kabdykadirov03@gmail.com';
    const result = await client.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = $1;
    `, [adminEmail]);

    if (result.rowCount > 0) {
      console.log(`✅ ${adminEmail} пайдаланушысы 'admin' болды`);
    } else {
      console.log(`⚠️ ${adminEmail} пайдаланушысы дерекқордан табылмады (тіркелмеген).`);
    }

  } catch (err) {
    console.error('❌ Дерекқор қатесі:', err.message);
  } finally {
    client.release();
  }
}

migrateDatabase().then(() => process.exit(0)).catch(() => process.exit(1));

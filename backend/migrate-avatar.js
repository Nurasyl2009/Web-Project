const pool = require('./js/db');

async function migrateAvatar() {
  const client = await pool.connect();
  try {
    console.log('🔄 "users" кестесіне "avatar_url" бағаны қосылуда...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    console.log('✅ "avatar_url" бағаны сәтті қосылды немесе бұрыннан бар!');
  } catch (err) {
    console.error('❌ Қате:', err.message);
  } finally {
    client.release();
  }
}

migrateAvatar().then(() => process.exit(0)).catch(() => process.exit(1));

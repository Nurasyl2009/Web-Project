const pool = require('./js/db');

async function migrateFavorites() {
  const client = await pool.connect();
  try {
    console.log('🔄 Дерекқорды жаңарту: favorites кестесін қосу...');
    
    // 1. Create table favorites
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, tour_id)
      );
    `);
    
    console.log('✅ "favorites" кестесі дайын');

  } catch (err) {
    console.error('❌ Дерекқор қатесі:', err.message);
  } finally {
    client.release();
  }
}

migrateFavorites().then(() => process.exit(0)).catch(() => process.exit(1));

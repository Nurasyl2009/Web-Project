const pool = require('./js/db');

async function migrateTourRoute() {
  const client = await pool.connect();
  try {
    console.log('🔄 tours кестесіне маршрут бағандарын қосу...');
    await client.query(`
      ALTER TABLE tours
      ADD COLUMN IF NOT EXISTS map_url TEXT,
      ADD COLUMN IF NOT EXISTS route_text TEXT;
    `);
    console.log('✅ tours: map_url және route_text дайын');
  } catch (err) {
    console.error('❌ Қате:', err.message);
  } finally {
    client.release();
  }
}

migrateTourRoute().then(() => process.exit(0)).catch(() => process.exit(1));


const pool = require('./js/db');

async function migrateDate() {
  try {
    await pool.query('ALTER TABLE payment ADD COLUMN IF NOT EXISTS tour_date DATE;');
    console.log('✅ payment кестесіне `tour_date` бағаны сәтті қосылды.');
  } catch (err) {
    console.error('❌ Қате:', err.message);
  } finally {
    process.exit(0);
  }
}

migrateDate();

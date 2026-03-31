
const pool = require('./js/db');

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('📦 Дерекқор кестелері жасалуда...');

    await client.query(`
      -- Users table for authentication
      CREATE TABLE IF NOT EXISTS users (
        id       SERIAL PRIMARY KEY,
        name     VARCHAR(100) NOT NULL,
        email    VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      -- Tours table
      CREATE TABLE IF NOT EXISTS tours (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(200) NOT NULL,
        description TEXT,
        price       INTEGER NOT NULL,
        city        VARCHAR(100),
        image_url   TEXT,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      -- Payments / purchases table
      CREATE TABLE IF NOT EXISTS payment (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        number     VARCHAR(16) NOT NULL,
        city       VARCHAR(100),
        cvv        VARCHAR(3) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      -- Contact messages
      CREATE TABLE IF NOT EXISTS contacts (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) NOT NULL,
        message    TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      -- Reviews
      CREATE TABLE IF NOT EXISTS reviews (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
        city       VARCHAR(100),
        rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
        text       TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const { rowCount } = await client.query('SELECT id FROM tours LIMIT 1');
    if (rowCount === 0) {
      await client.query(`
        INSERT INTO tours (title, description, price, city, image_url) VALUES
        ('Парижге саяхат', 'Махаббат қаласының сиқырын сезініңіз.', 450000, 'Париж', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=500&auto=format&fit=crop'),
        ('Рим демалысы', 'Ежелгі тарих пен дәмді итальян асханасы.', 380000, 'Рим', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=500&auto=format&fit=crop'),
        ('Берлин рухы', 'Заманауи мәдениет пен еркіндік қаласы.', 320000, 'Берлин', 'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=500&auto=format&fit=crop'),
        ('Мадрид саяхаты', 'Испанияның астанасы — мәдениет пен энергия.', 620000, 'Мадрид', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=500&auto=format&fit=crop');
      `);
      console.log('🌍 Демо турлар қосылды');
    }

    console.log('✅ Барлық кестелер дайын!');
  } catch (err) {
    console.error('❌ Дерекқор қатесі:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Tur',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 1234,
  // Егер DB_HOST болса (яғни Render/Production), SSL-ді қосамыз
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false
});

module.exports = pool;

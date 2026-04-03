const { Pool } = require('pg');

const dbConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
  : {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'Tur',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 1234,
    ssl: (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')
      ? { rejectUnauthorized: false }
      : false
  };

const pool = new Pool(dbConfig);

module.exports = pool;

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Tur',
  password: '1234',
  port: 1234,
});

module.exports = pool;
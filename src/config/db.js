const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('error', (err, client) => {
  console.error('⚠️ Error inesperado en el cliente de PostgreSQL (idle client):', err);
});

pool.connect()
  .then(client => {
    console.log('✅ Conexión a PostgreSQL exitosa');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a PostgreSQL', err.stack);
  });

module.exports = pool;

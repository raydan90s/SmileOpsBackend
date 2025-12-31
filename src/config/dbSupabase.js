const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.on('error', (err, client) => {
    console.error('⚠️ Error inesperado en un cliente de PostgreSQL (idle):', err.message);
});

pool.connect()
    .then(client => {
        console.log('✅ Conexión a Supabase (PostgreSQL) exitosa');
        client.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a Supabase:', err.message);
        if (!process.env.DATABASE_URL) {
            console.error('   -> PISTA: La variable DATABASE_URL no está definida en el .env');
        }
    });

module.exports = pool;
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const res = await pool.query('SELECT version()');
  console.log('✅ Conexión exitosa!');
  console.log('Version:', res.rows[0].version.split(',')[0]);
  process.exit(0);
} catch (err) {
  console.error('❌ Error de conexión:', err.message);
  process.exit(1);
}

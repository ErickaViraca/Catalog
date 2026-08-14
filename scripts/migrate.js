#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS "_migrations" (
        "tag" text PRIMARY KEY,
        "applied_at" timestamp DEFAULT now()
      )
    `);

    // Compatibilidad con bases que ya corrieron la versión anterior de este
    // script (que solo aplicaba 0000_famous_angel a mano, sin tracking).
    const { rows: brandsCheck } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'brands'
      ) AS exists
    `);
    if (brandsCheck[0].exists) {
      await client.query(
        'INSERT INTO "_migrations" (tag) VALUES ($1) ON CONFLICT DO NOTHING',
        ['0000_famous_angel']
      );
    }

    const migrationsDir = path.join(__dirname, '../src/db/migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows: appliedRows } = await client.query('SELECT tag FROM "_migrations"');
    const appliedTags = new Set(appliedRows.map((r) => r.tag));

    let ranAny = false;
    for (const file of files) {
      const tag = file.replace(/\.sql$/, '');
      if (appliedTags.has(tag)) {
        console.log(`⏭️  ${tag} ya aplicada, se omite`);
        continue;
      }

      console.log(`📝 Aplicando ${tag}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO "_migrations" (tag) VALUES ($1)', [tag]);
      ranAny = true;
    }

    console.log(
      ranAny
        ? '✅ Migraciones aplicadas exitosamente!'
        : '✅ Todo al día, no había migraciones pendientes.'
    );
    await client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

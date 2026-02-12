const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  const file = process.argv[2] || 'supabase/migrations/20260210101000_add_theme_to_collections.sql'
  const sql = fs.readFileSync(path.resolve(file), 'utf8')

  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '54321', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'postgres',
  })

  try {
    await client.connect()
    console.log('Connected to Postgres, executing:', file)
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('Migration applied successfully')
  } catch (err) {
    console.error('Migration failed:', err.message)
    try {
      await client.query('ROLLBACK')
    } catch (e) {}
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()

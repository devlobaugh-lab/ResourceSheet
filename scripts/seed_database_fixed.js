#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const { Pool } = require('pg')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

// Extract database connection info from Supabase URL
const dbUrl = supabaseUrl.replace('postgrest://', 'postgres://') + '?sslmode=require'
const connectionString = dbUrl.replace(/^postgres:\/\//, 'postgresql://')

async function runSeedFile(filePath) {
  console.log(`Running ${filePath}...`)

  try {
    const sql = fs.readFileSync(filePath, 'utf8')

    // Split by semicolon and filter out empty statements and comments
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    // Use direct PostgreSQL connection
    const pool = new Pool({
      connectionString: connectionString + '&password=' + encodeURIComponent(supabaseServiceKey.split('/')[1]),
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()

    try {
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await client.query(statement)
          } catch (error) {
            console.error(`Error executing statement: ${statement.substring(0, 100)}...`)
            console.error(error.message)
          }
        }
      }
      console.log(`✓ Completed ${filePath}`)
    } finally {
      client.release()
      await pool.end()
    }

  } catch (error) {
    console.error(`✗ Failed ${filePath}:`, error.message)
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  const seedFiles = [
    'db/seeds/00_master_seed.sql',
    'db/seeds/01_seasons.sql',
    'db/seeds/02_car_parts.sql',
    'db/seeds/03_drivers.sql',
    'db/seeds/04_boosts.sql'
  ]

  for (const file of seedFiles) {
    const filePath = path.join(__dirname, '..', file)
    if (fs.existsSync(filePath)) {
      await runSeedFile(filePath)
    } else {
      console.log(`⚠️  File not found: ${file}`)
    }
  }

  console.log('✅ Database seeding completed!')
}

seedDatabase().catch(console.error)

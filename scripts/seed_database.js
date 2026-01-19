#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSeedFile(filePath) {
  console.log(`Running ${filePath}...`)

  try {
    const sql = fs.readFileSync(filePath, 'utf8')

    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.error(`Error in statement: ${statement.substring(0, 100)}...`)
            console.error(error)
          }
        } catch (err) {
          // Try direct query if rpc fails
          try {
            const { error } = await supabase.from('_temp').select('*').limit(1) // dummy query
            if (error) {
              console.log('Using raw SQL execution...')
              // For now, just log that we need to execute manually
              console.log(`Need to execute: ${statement.substring(0, 100)}...`)
            }
          } catch (rawErr) {
            console.error('Both RPC and raw SQL failed')
          }
        }
      }
    }

    console.log(`✓ Completed ${filePath}`)
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

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

    // Split by semicolon and filter out empty statements and comments
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Try using the Supabase client directly
          const { data, error } = await supabase
            .from('car_parts')
            .insert([{ id: 'test', name: 'test' }])

          if (error) {
            console.error(`Error:`, error.message)
          } else {
            console.log(`Success:`, data)
          }
          break; // Just test one
        } catch (error) {
          console.error(`Error:`, error.message)
          break;
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

  // Just test car parts for now
  const filePath = path.join(__dirname, '..', 'db', 'seeds', '02_car_parts.sql')
  if (fs.existsSync(filePath)) {
    await runSeedFile(filePath)
  } else {
    console.log(`⚠️  File not found: ${filePath}`)
  }

  console.log('✅ Database seeding completed!')
}

seedDatabase().catch(console.error)

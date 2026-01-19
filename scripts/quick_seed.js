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

async function seedSeasons() {
  console.log('🌱 Seeding seasons...')

  const { error } = await supabase
    .from('seasons')
    .upsert({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Season 6', is_active: true })

  if (error) {
    console.error('Error seeding seasons:', error)
  } else {
    console.log('✅ Seasons seeded')
  }
}

async function seedCarParts() {
  console.log('🔧 Seeding car parts...')

  // Read the car parts seed file
  const carPartsSql = fs.readFileSync(path.join(__dirname, '../db/seeds/02_car_parts.sql'), 'utf8')

  // Extract INSERT statements and execute them
  const insertMatch = carPartsSql.match(/INSERT INTO catalog_items.*VALUES\s*(\[[\s\S]*?\]);/)
  if (insertMatch) {
    try {
      // This is a simplified approach - in a real scenario you'd parse the SQL properly
      console.log('Found car parts data, would insert here...')
      console.log('⚠️ Car parts seeding skipped - use import feature instead')
    } catch (error) {
      console.error('Error seeding car parts:', error)
    }
  }
}

async function seedDrivers() {
  console.log('🏎️ Seeding drivers...')
  console.log('⚠️ Drivers seeding skipped - use import feature instead')
}

async function seedBoosts() {
  console.log('🚀 Seeding boosts...')
  console.log('⚠️ Boosts seeding skipped - use import feature instead')
}

async function main() {
  console.log('🚀 Quick database seeding...')

  await seedSeasons()
  await seedCarParts()
  await seedDrivers()
  await seedBoosts()

  console.log('✅ Quick seeding completed!')
  console.log('💡 For full data, use the import feature in the Profile page')
}

main().catch(console.error)

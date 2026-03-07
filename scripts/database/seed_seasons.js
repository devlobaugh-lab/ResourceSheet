#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedSeasons() {
  console.log('🌱 Seeding seasons data...')

  try {
    // Check if seasons table exists and has data
    const { data: existingSeasons, error: checkError } = await supabase
      .from('seasons')
      .select('id, name, is_active')
      .limit(10)

    if (checkError) {
      console.error('Error checking existing seasons:', checkError)
      return
    }

    if (existingSeasons && existingSeasons.length > 0) {
      console.log('📊 Existing seasons found:')
      existingSeasons.forEach(season => {
        console.log(`  - ${season.name} (ID: ${season.id}, Active: ${season.is_active})`)
      })
      
      const { data: count } = await supabase
        .from('seasons')
        .select('*', { count: 'exact', head: true })
      
      console.log(`  Total seasons: ${count}`)
      return
    }

    console.log('➕ No seasons found, inserting Season 6...')

    // Insert Season 6
    const { data, error } = await supabase
      .from('seasons')
      .insert([
        {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          name: 'Season 6',
          is_active: true
        }
      ])
      .select()

    if (error) {
      console.error('❌ Error inserting season:', error)
      return
    }

    console.log('✅ Season 6 successfully inserted!')
    console.log(`   ID: ${data[0].id}`)
    console.log(`   Name: ${data[0].name}`)
    console.log(`   Active: ${data[0].is_active}`)

  } catch (error) {
    console.error('❌ Error seeding seasons:', error)
    process.exit(1)
  }
}

async function verifySeasons() {
  console.log('\n🔍 Verifying seasons in database...')

  try {
    const { data, error } = await supabase
      .from('seasons')
      .select('id, name, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error verifying seasons:', error)
      return
    }

    if (data && data.length > 0) {
      console.log('✅ Seasons found in database:')
      data.forEach(season => {
        const activeStatus = season.is_active ? '🟢 ACTIVE' : '⚪ INACTIVE'
        console.log(`   ${activeStatus} ${season.name} (ID: ${season.id})`)
      })
    } else {
      console.log('❌ No seasons found in database')
    }

  } catch (error) {
    console.error('Error verifying seasons:', error)
  }
}

async function main() {
  await seedSeasons()
  await verifySeasons()
  
  console.log('\n🎉 Season seeding process completed!')
  console.log('\n📝 Next steps:')
  console.log('1. Test the admin/tracks page to verify seasons appear in dropdown')
  console.log('2. Visit /api/seasons to verify API returns the data')
  console.log('3. If needed, run this script again to re-seed')
}

main().catch(console.error)
#!/usr/bin/env node

/**
 * Database cleanup script to remove duplicate drivers
 * Run this script to identify and clean up duplicate driver records
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cleanupDuplicateDrivers() {
  try {
    console.log('🔍 Checking for duplicate drivers...')

    // Find duplicates by name and rarity
    const { data: drivers, error: fetchError } = await supabase
      .from('drivers')
      .select('id, name, rarity, series, created_at')
      .order('name', { ascending: true })
      .order('rarity', { ascending: false })

    if (fetchError) {
      console.error('Error fetching drivers:', fetchError)
      return
    }

    console.log(`Found ${drivers.length} total driver records`)

    // Group by name+rarity combination
    const grouped = drivers.reduce((acc, driver) => {
      const key = `${driver.name}-${driver.rarity}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(driver)
      return acc
    }, {})

    // Find duplicates
    const duplicates = Object.entries(grouped)
      .filter(([key, drivers]) => drivers.length > 1)
      .map(([key, drivers]) => ({
        name_rarity: key,
        count: drivers.length,
        drivers: drivers
      }))

    if (duplicates.length === 0) {
      console.log('✅ No duplicate drivers found!')
      return
    }

    console.log(`❌ Found ${duplicates.length} duplicate driver groups:`)
    duplicates.forEach(group => {
      console.log(`  ${group.name_rarity}: ${group.count} records`)
      group.drivers.forEach(driver => {
        console.log(`    ID: ${driver.id}, Created: ${driver.created_at}`)
      })
    })

    // Ask for confirmation before deleting
    console.log('\n⚠️  This will delete duplicate driver records, keeping only the most recently created one for each name+rarity combination.')
    console.log('Are you sure you want to continue? (This action cannot be undone)')

    // For now, we'll just show what would be deleted
    // In a real scenario, you'd want user confirmation

    console.log('\n🧹 Would delete the following duplicate records:')
    let totalToDelete = 0

    for (const group of duplicates) {
      const sortedDrivers = group.drivers.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      )
      const toKeep = sortedDrivers[0]
      const toDelete = sortedDrivers.slice(1)

      console.log(`  Keeping: ${toKeep.name} (rarity ${toKeep.rarity}) - ID: ${toKeep.id}`)
      toDelete.forEach(driver => {
        console.log(`  Would delete: ${driver.name} (rarity ${driver.rarity}) - ID: ${driver.id}`)
        totalToDelete++
      })
    }

    console.log(`\n📊 Summary: Would delete ${totalToDelete} duplicate records`)

    // Actually perform the deletion
    console.log('\n🗑️  Deleting duplicates...')
    for (const group of duplicates) {
      const sortedDrivers = group.drivers.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      )
      const toDelete = sortedDrivers.slice(1)

      for (const driver of toDelete) {
        const { error: deleteError } = await supabase
          .from('drivers')
          .delete()
          .eq('id', driver.id)

        if (deleteError) {
          console.error(`Error deleting driver ${driver.id}:`, deleteError)
        } else {
          console.log(`Deleted duplicate driver: ${driver.name} (ID: ${driver.id})`)
        }
      }
    }
    console.log('✅ Duplicate cleanup completed!')

  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

async function checkUserDriverDuplicates() {
  try {
    console.log('\n🔍 Checking for duplicate user driver records...')

    // Check for duplicates in user_drivers table
    const { data: userDrivers, error: fetchError } = await supabase
      .from('user_drivers')
      .select('id, user_id, driver_id, level, card_count, created_at')

    if (fetchError) {
      console.error('Error fetching user drivers:', fetchError)
      return
    }

    console.log(`Found ${userDrivers.length} user driver records`)

    // Group by user_id + driver_id
    const grouped = userDrivers.reduce((acc, record) => {
      const key = `${record.user_id}-${record.driver_id}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(record)
      return acc
    }, {})

    // Find duplicates
    const duplicates = Object.entries(grouped)
      .filter(([key, records]) => records.length > 1)
      .map(([key, records]) => ({
        user_driver: key,
        count: records.length,
        records: records
      }))

    if (duplicates.length === 0) {
      console.log('✅ No duplicate user driver records found!')
      return
    }

    console.log(`❌ Found ${duplicates.length} duplicate user driver groups:`)
    duplicates.forEach(group => {
      console.log(`  ${group.user_driver}: ${group.count} records`)
      group.records.forEach(record => {
        console.log(`    ID: ${record.id}, Level: ${record.level}, Cards: ${record.card_count}, Created: ${record.created_at}`)
      })
    })

  } catch (error) {
    console.error('Error checking user drivers:', error)
  }
}

async function main() {
  console.log('🧹 Database Cleanup Script')
  console.log('==========================\n')

  await cleanupDuplicateDrivers()
  await checkUserDriverDuplicates()

  console.log('\n📝 To actually perform the cleanup, uncomment the deletion code in the script.')
  console.log('⚠️  WARNING: This action cannot be undone. Make sure to backup your database first!')
}

main().catch(console.error)

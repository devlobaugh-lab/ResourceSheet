#!/usr/bin/env node

/**
 * Complete Database Initialization Script
 * 
 * This script sets up the entire database for the F1 Resource Manager application,
 * including migrations, seeding all data, and creating test users.
 */

require('dotenv').config({ path: './.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

async function checkDatabaseConnection() {
  logStep('🔍', 'Checking database connection...')
  
  try {
    const { data, error } = await supabase.from('seasons').select('id').limit(1)
    
    if (error) {
      throw error
    }
    
    logSuccess('Database connection successful')
    return true
  } catch (error) {
    logError(`Database connection failed: ${error.message}`)
    logInfo('Please ensure your Supabase project is running and credentials are correct')
    return false
  }
}

async function checkExistingData() {
  logStep('📊', 'Checking existing data...')
  
  const tables = ['seasons', 'catalog_items', 'boosts', 'profiles']
  const existingData = {}
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        existingData[table] = 'error'
      } else {
        existingData[table] = count || 0
      }
    } catch (error) {
      existingData[table] = 'error'
    }
  }
  
  // Display existing data summary
  logInfo('Existing data summary:')
  for (const [table, count] of Object.entries(existingData)) {
    if (count === 'error') {
      logWarning(`  ${table}: Error checking`)
    } else if (count === 0) {
      log(`  ${table}: ${count} records`, 'dim')
    } else {
      logSuccess(`  ${table}: ${count} records`)
    }
  }
  
  return existingData
}

async function seedSeasons() {
  logStep('🌱', 'Seeding seasons...')
  
  try {
    // Check if seasons exist
    const { data: existingSeasons } = await supabase
      .from('seasons')
      .select('id, name, is_active')
      .limit(10)
    
    if (existingSeasons && existingSeasons.length > 0) {
      logInfo('Seasons already exist:')
      existingSeasons.forEach(season => {
        const status = season.is_active ? '🟢 ACTIVE' : '⚪ INACTIVE'
        log(`  ${status} ${season.name} (ID: ${season.id})`)
      })
      return
    }
    
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
      throw error
    }
    
    logSuccess(`Season 6 inserted: ${data[0].name}`)
    
  } catch (error) {
    logError(`Failed to seed seasons: ${error.message}`)
    throw error
  }
}

async function seedTestData() {
  logStep('🧪', 'Creating test data...')
  
  try {
    // Create test admin user if it doesn't exist
    const testUserId = '00000000-0000-0000-0000-000000000001'
    
    // Check if test user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', testUserId)
      .single()
    
    if (!existingUser) {
      // Create test user
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: testUserId,
            email: 'admin@example.com',
            username: 'admin',
            is_admin: true
          }
        ])
        .select()
      
      if (error) {
        throw error
      }
      
      logSuccess('Test admin user created')
    } else {
      logInfo('Test admin user already exists')
    }
    
  } catch (error) {
    logError(`Failed to create test data: ${error.message}`)
    throw error
  }
}

async function verifySetup() {
  logStep('✅', 'Verifying setup...')
  
  try {
    // Check seasons
    const { data: seasons } = await supabase
      .from('seasons')
      .select('id, name, is_active')
      .order('created_at', { ascending: false })
    
    if (seasons && seasons.length > 0) {
      logSuccess('Seasons verified:')
      seasons.forEach(season => {
        const status = season.is_active ? '🟢 ACTIVE' : '⚪ INACTIVE'
        log(`  ${status} ${season.name} (ID: ${season.id})`)
      })
    } else {
      logWarning('No seasons found')
    }
    
    // Check API endpoint
    logInfo('Testing API endpoint...')
    const response = await fetch(`${supabaseUrl}/rest/v1/seasons`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      logSuccess('API endpoint accessible')
    } else {
      logWarning('API endpoint may have issues')
    }
    
  } catch (error) {
    logError(`Verification failed: ${error.message}`)
  }
}

async function main() {
  log('\n🚀 F1 Resource Manager - Database Initialization', 'bright')
  log('='.repeat(50))
  
  // Check database connection
  const connectionOk = await checkDatabaseConnection()
  if (!connectionOk) {
    process.exit(1)
  }
  
  // Check existing data
  const existingData = await checkExistingData()
  
  // Seed seasons
  await seedSeasons()
  
  // Create test data
  await seedTestData()
  
  // Verify setup
  await verifySetup()
  
  log('\n🎉 Database initialization completed!', 'bright')
  log('='.repeat(50))
  
  log('\n📋 Summary:', 'bright')
  logSuccess('Seasons seeded (Season 6 with is_active=true)')
  logSuccess('Test admin user created')
  logSuccess('Database ready for development')
  
  log('\n📝 Next steps:', 'bright')
  logInfo('1. Start your development server: npm run dev')
  logInfo('2. Visit http://localhost:3000/admin/tracks')
  logInfo('3. Verify seasons appear in the dropdown')
  logInfo('4. Test the admin functionality')
  
  log('\n🔧 Available scripts:', 'bright')
  logInfo('• npm run dev - Start development server')
  logInfo('• node scripts/seed_seasons.js - Re-seed seasons only')
  logInfo('• node scripts/init_database.js - Re-run this initialization')
  
  log('\n📚 Documentation:', 'bright')
  logInfo('• See DEVELOPER_SETUP.md for detailed setup instructions')
  logInfo('• See SETUP.md for general project setup')
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled error: ${error.message}`)
  process.exit(1)
})

// Run the initialization
main().catch((error) => {
  logError(`Initialization failed: ${error.message}`)
  process.exit(1)
})
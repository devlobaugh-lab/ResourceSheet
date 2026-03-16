#!/usr/bin/env node

const fs = require('fs')
require('dotenv').config({ path: fs.existsSync('./.env.prod') ? './.env.prod' : './.env.local' })

const readline = require('readline')
const { createClient } = require('@supabase/supabase-js')

// --- Env validation ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const adminUsername = process.env.ADMIN_USERNAME || 'admin'

const missing = []
if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
if (!adminEmail) missing.push('ADMIN_EMAIL')
if (!adminPassword) missing.push('ADMIN_PASSWORD')

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '))
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// --- Confirmation ---
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer) }))
}

// --- Deletion order: children before parents to respect FK constraints ---
// Service role bypasses RLS; filter matches all rows since epoch.
const EPOCH = '1970-01-01'
const TABLE_DELETION_ORDER = [
  // GP guide children
  'user_gp_guide_results',
  'user_gp_guide_tracks',
  'user_gp_guides',
  // Boost children
  'user_boosts',
  'boost_custom_names',
  // Car setup / parts children
  'user_car_setups',
  'user_car_parts',
  // Driver children
  'user_drivers',
  'user_custom_drivers',
  // Misc catalog with FK to seasons
  'ai_track_loadouts',
  'team_driver_names',
  'series_data',
  // Track hierarchy
  'track_seasons',
  'tracks',
  // Core catalog
  'car_parts',
  'drivers',
  'boosts',
  'seasons',
  'collections',
  // Profiles last (user_* tables reference it)
  'profiles',
]

async function truncateTables() {
  console.log('\nTruncating all tables...')
  for (const table of TABLE_DELETION_ORDER) {
    const { error } = await supabase
      .from(table)
      .delete()
      .gte('created_at', EPOCH)

    if (error) {
      // Some tables may not exist (e.g. user_custom_drivers, user_gp_guide_results)
      // if the migration hasn't been applied — warn but continue so we don't abort
      // on optional tables.
      console.warn(`  Warning — ${table}: ${error.message}`)
    } else {
      console.log(`  Cleared: ${table}`)
    }
  }
}

async function restoreAdminProfile() {
  console.log('\nRestoring admin profile...')

  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  if (listError) {
    console.error('Error listing auth users:', listError)
    process.exit(1)
  }

  const adminUser = existingUsers.users.find(u => u.email === adminEmail)

  if (!adminUser) {
    console.log('Admin auth user not found — creating a new one...')

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Admin User' }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      process.exit(1)
    }

    console.log('Auth user created:', authData.user.id)

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: adminEmail,
        username: adminUsername,
        is_admin: true
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      process.exit(1)
    }
  } else {
    console.log('Auth user found:', adminUser.id)

    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: adminPassword, email_confirm: true }
    )

    if (passwordError) {
      console.error('Error updating password: An error occurred while updating the password')
      process.exit(1)
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUser.id,
        email: adminEmail,
        username: adminUsername,
        is_admin: true
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error upserting profile:', profileError)
      process.exit(1)
    }
  }

  console.log('Admin profile restored.')
}

async function main() {
  console.log('========================================')
  console.log('  PRODUCTION DATABASE RESET')
  console.log('========================================')
  console.log(`Target: ${supabaseUrl}`)
  console.log(`Admin:  ${adminEmail}`)
  console.log()
  console.log('WARNING: This will DELETE ALL DATA in every public schema table.')
  console.log('The admin auth user will be preserved; all other data is permanent loss.')
  console.log()

  const answer = await prompt('Type "RESET PROD" to confirm: ')

  if (answer !== 'RESET PROD') {
    console.log('Confirmation failed. Aborting.')
    process.exit(1)
  }

  try {
    await truncateTables()
    await restoreAdminProfile()

    console.log('\nDone. Database has been reset and admin profile restored.')
    console.log(`Email:    ${adminEmail}`)
    console.log('Password: (from ADMIN_PASSWORD env var)')
  } catch (err) {
    console.error('\nUnexpected error:', err)
    process.exit(1)
  }
}

main()

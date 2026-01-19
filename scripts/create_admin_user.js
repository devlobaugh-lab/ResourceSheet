#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' })
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

async function createAdminUser() {
  try {
    console.log('Creating admin user: thomas.lobaugh@gmail.com')

    // Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'thomas.lobaugh@gmail.com',
      password: 'password123', // Simple password for testing
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Test Admin User'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Create/update the profile record
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: 'thomas.lobaugh@gmail.com',
        username: 'test_admin',
        is_admin: true
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('Profile created/updated successfully')
    console.log('Admin user setup complete!')
    console.log('Login credentials:')
    console.log('Email: thomas.lobaugh@gmail.com')
    console.log('Password: password123')

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createAdminUser()
